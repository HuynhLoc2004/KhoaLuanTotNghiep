import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, seedDefaultAdmin, isAllowedAdminEmail } from '../models/User.js';
import { Role } from '../models/Role.js';
import { OtpToken } from '../models/OtpToken.js';
import { sendMail } from '../services/mail.js';
import {
  setOtpInRedis,
  getOtpFromRedis,
  deleteOtpFromRedis,
  checkOtpCooldown,
  setOtpCooldown,
  revokeTokenInRedis,
  isTokenRevokedInRedis
} from '../services/redis.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertUser } from '../db/syncEngine.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'museum_hcmc_secret_heritage_jwt_2026';
const OTP_COOLDOWN_SECONDS = 60; // Chống spam: 60s cooldown giữa các lần gửi
const OTP_EXPIRY_MINUTES = 5; // Hạn sử dụng mã OTP: 5 phút

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Middleware xác thực JSON Web Token & kiểm tra danh sách đen token thu hồi ở Redis
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc phiên làm việc đã kết thúc' });
    }
    const token = authHeader.split(' ')[1];

    // Kiểm tra xem token này đã bị thu hồi (đăng xuất) trong Redis chưa
    const isRevoked = await isTokenRevokedInRedis(token);
    if (isRevoked) {
      return res.status(401).json({ success: false, message: 'Phiên làm việc đã bị thu hồi (đã đăng xuất). Vui lòng đăng nhập lại.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Middleware bảo vệ chỉ cho phép quyền Admin tối cao
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Từ chối truy cập: Bạn không có quyền Quản trị viên (Admin)' });
  }
  next();
};

/**
 * Helper sinh Token JWT
 */
const generateToken = (user: IUser) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==============================================================================
// 1. GỬI MÃ OTP QUA EMAIL THỰC TẾ (CÓ RATE LIMIT CHỐNG SPAM 60S)
// ==============================================================================
authRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ Email hợp lệ' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // KIỂM TRA BẢO MẬT: Chỉ cho phép Email Admin lấy từ biến môi trường (không fix cứng)
    if (!isAllowedAdminEmail(cleanEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Từ chối truy cập: Địa chỉ email này không có quyền Quản trị viên (Admin) của hệ thống!'
      });
    }

    // KIỂM TRA CHỐNG SPAM (60s COOLDOWN TRÊN REDIS)
    const redisCooldown = await checkOtpCooldown(cleanEmail);
    if (redisCooldown && redisCooldown > 0) {
      return res.status(429).json({
        success: false,
        message: `Vui lòng chờ thêm ${redisCooldown} giây nữa trước khi yêu cầu mã OTP mới.`,
        retryAfter: redisCooldown
      });
    }

    // Đảm bảo tài khoản Quản trị viên tồn tại trong CSDL PostgreSQL (Primary) & MongoDB (Mirror)
    let user: any = await User.findOne({ email: cleanEmail });
    if (!user) {
      await seedDefaultAdmin();
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          username: cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'admin',
          email: cleanEmail,
          password: 'NO_PASSWORD_OTP_ONLY',
          fullName: 'Quản trị viên Bảo tàng Lịch sử TP.HCM',
          role: 'admin',
          permissions: ['*'],
          isActive: true
        });
      }
    }

    if (user.role !== 'admin') {
      user.role = 'admin';
      user.permissions = ['*'];
      await user.save();
    }

    // Đồng bộ user sang PostgreSQL
    await pgUpsertUser(user);

    const targetEmail = user.email;

    // Sinh mã OTP 6 chữ số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 1. Lưu mã OTP vào Redis với TTL đúng 5 phút (300 giây)
    await setOtpInRedis(targetEmail, otp, OTP_EXPIRY_MINUTES * 60);

    // 2. Kích hoạt Cooldown 60s trên Redis
    await setOtpCooldown(targetEmail, OTP_COOLDOWN_SECONDS);

    // 3. Đồng bộ lưu bản ghi vào MongoDB OtpToken để lưu vết kiểm toán (Audit Trail)
    await OtpToken.updateMany({ email: targetEmail, isUsed: false }, { isUsed: true });
    await OtpToken.create({
      email: targetEmail,
      otp,
      expiresAt,
      lastSentAt: new Date(),
      attempts: 0,
      isUsed: false
    });

    // Soạn email theo phong cách Di Sản Bảo Tàng sang trọng
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #1A1715; color: #EDE5DF; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212, 168, 106, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <!-- Header Di Sản -->
        <div style="background: linear-gradient(135deg, #24201D 0%, #161311 100%); padding: 26px 24px; text-align: center; border-bottom: 1px solid rgba(212, 168, 106, 0.3);">
          <div style="font-size: 32px; margin-bottom: 8px;">🏛️</div>
          <h1 style="color: #D4A86A; font-size: 19px; margin: 0; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            Bảo Tàng Lịch Sử TP. Hồ Chí Minh
          </h1>
          <p style="color: #A3978E; font-size: 12px; margin: 6px 0 0 0; letter-spacing: 0.2px;">
            Hệ Thống Quản Trị Không Gian Trưng Bày & Tour 360°
          </p>
        </div>

        <!-- Thân Email -->
        <div style="padding: 30px 24px;">
          <p style="font-size: 14px; margin-top: 0; color: #F5EBE1;">
            Xin chào <strong>${user.fullName || user.username}</strong>,
          </p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #D5CBC2;">
            Bạn (hoặc người quản trị hệ thống) vừa yêu cầu mã xác thực OTP để đăng nhập vào <strong>Bảng Điều Khiển Quản Trị Bảo Tàng</strong>.
          </p>

          <!-- Khối hiển thị mã OTP -->
          <div style="background: rgba(212, 168, 106, 0.08); border: 2px dashed #D4A86A; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #D4A86A; font-weight: 600; display: block; margin-bottom: 6px;">
              MÃ XÁC THỰC BẢO MẬT (OTP)
            </span>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #FFFFFF; font-family: 'Courier New', monospace; text-shadow: 0 0 15px rgba(212,168,106,0.4);">
              ${otp}
            </div>
            <span style="font-size: 11.5px; color: #A89C92; display: block; margin-top: 8px;">
              Mã có hiệu lực trong <strong>${OTP_EXPIRY_MINUTES} phút</strong>. Không chia sẻ mã này cho bất kỳ ai!
            </span>
          </div>

          <div style="background-color: rgba(0,0,0,0.25); border-left: 3px solid #D4A86A; padding: 10px 14px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #A3978E; line-height: 1.5;">
              🛡️ <strong>Chính sách Chống Spam:</strong> Hệ thống áp dụng cơ chế tự động giới hạn gửi mã mỗi 60 giây qua Redis để đảm bảo an toàn tuyệt đối.
            </p>
          </div>

          <p style="font-size: 12px; color: #8C8075; margin-bottom: 0;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc thông báo ngay cho ban quản lý kỹ thuật bảo tàng.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #14110F; padding: 14px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
          <p style="margin: 0; font-size: 11px; color: #6E6359;">
            Khóa luận Tốt nghiệp - Ứng dụng Công nghệ 4.0 & AI trong Bảo tồn Di sản Bảo tàng © 2026
          </p>
        </div>
      </div>
    `;

    // Gửi email thật bằng cấu hình SMTP
    const mailResult = await sendMail({
      to: targetEmail,
      subject: `[Bảo Tàng Lịch Sử] Mã xác thực OTP đăng nhập: ${otp}`,
      html
    });

    if (!mailResult.success) {
      return res.status(500).json({
        success: false,
        message: `Lỗi khi gửi email qua máy chủ SMTP: ${mailResult.error || 'Vui lòng thử lại sau'}`
      });
    }

    console.log(`[Auth Service] Đã gửi mã OTP (${otp}) thành công đến ${targetEmail}`);

    return res.json({
      success: true,
      message: `Mã xác thực OTP đã được gửi đến email ${targetEmail}.`,
      email: targetEmail,
      cooldownSeconds: OTP_COOLDOWN_SECONDS
    });
  } catch (err: any) {
    console.error('[Auth Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Lỗi xử lý gửi OTP' });
  }
});

// ==============================================================================
// 2. XÁC THỰC MÃ OTP VÀ ĐĂNG NHẬP ADMIN (POSTGRESQL PRIMARY + REDIS OTP)
// ==============================================================================
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã OTP' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // KIỂM TRA BẢO MẬT: Chỉ cho phép Email Admin lấy từ biến môi trường
    if (!isAllowedAdminEmail(cleanEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Từ chối: Địa chỉ email này không có quyền Quản trị viên (Admin) để truy cập hệ thống.'
      });
    }

    let isOtpValid = false;

    // 1. Kiểm tra OTP trên Redis trước (Hiệu năng cao, TTL tự hủy)
    const redisOtpData = await getOtpFromRedis(cleanEmail);
    if (redisOtpData && redisOtpData.otp === cleanOtp) {
      isOtpValid = true;
      // Xóa ngay mã OTP trên Redis để không thể tái sử dụng
      await deleteOtpFromRedis(cleanEmail);
    } else {
      // 2. Fallback: Kiểm tra qua MongoDB OtpToken nếu Redis vừa khởi động lại
      const tokenRecord = await OtpToken.findOne({
        email: cleanEmail,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (tokenRecord) {
        if (tokenRecord.attempts >= 5) {
          tokenRecord.isUsed = true;
          await tokenRecord.save();
          return res.status(400).json({
            success: false,
            message: 'Mã OTP này đã bị khóa do nhập sai quá 5 lần. Vui lòng bấm gửi lại mã mới.'
          });
        }

        if (tokenRecord.otp === cleanOtp) {
          isOtpValid = true;
          tokenRecord.isUsed = true;
          await tokenRecord.save();
        } else {
          tokenRecord.attempts += 1;
          await tokenRecord.save();
          const remaining = 5 - tokenRecord.attempts;
          return res.status(400).json({
            success: false,
            message: `Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`
          });
        }
      }
    }

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không tồn tại hoặc đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới.'
      });
    }

    // 3. Truy vấn Người dùng từ POSTGRESQL (PRIMARY DATABASE)
    let pgUser: any = null;
    try {
      const pgRes = await pgPool.query(`
        SELECT u.id, u.username, u.email, u.full_name, u.role_id, r.name as role_name, r.permissions
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
        LIMIT 1;
      `, [cleanEmail]);

      if (pgRes.rows.length > 0) {
        pgUser = pgRes.rows[0];
        // Cập nhật thời điểm đăng nhập trong PostgreSQL
        await pgPool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE email = $1', [cleanEmail]);
      }
    } catch (pgErr: any) {
      console.warn('[Auth PostgreSQL Query Warning]:', pgErr.message);
    }

    // Đồng bộ trạng thái với MongoDB User
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      await seedDefaultAdmin();
      user = await User.findOne({ email: cleanEmail });
    }

    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }

    const payloadUser = {
      id: pgUser?.id || user?._id || 'admin',
      username: pgUser?.username || user?.username || 'admin',
      email: cleanEmail,
      fullName: pgUser?.full_name || user?.fullName || 'Quản trị viên Bảo tàng',
      role: 'admin',
      permissions: ['*']
    };

    const token = jwt.sign(payloadUser, JWT_SECRET, { expiresIn: '7d' });

    // Ghi nhật ký kiểm toán vào PostgreSQL
    await logAudit('LOGIN_SUCCESS', 'auth', {
      userId: payloadUser.id,
      username: payloadUser.username,
      details: { email: cleanEmail, ip: req.ip }
    });

    return res.json({
      success: true,
      message: 'Đăng nhập thành công với quyền Quản trị viên Toàn quyền (Xác thực PostgreSQL & Redis)',
      token,
      user: payloadUser
    });
  } catch (err: any) {
    console.error('[Verify OTP Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Lỗi xác thực OTP' });
  }
});

// ==============================================================================
// 3. ĐĂNG XUẤT & THU HỒI TOKEN TRÊN REDIS BLACKLIST
// ==============================================================================
authRouter.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Đưa token vào danh sách thu hồi trên Redis
      await revokeTokenInRedis(token);
    }

    await logAudit('LOGOUT', 'auth', {
      userId: req.user?.id,
      username: req.user?.username,
      details: { email: req.user?.email }
    });

    return res.json({
      success: true,
      message: 'Đăng xuất thành công, phiên làm việc đã được thu hồi an toàn.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Lỗi đăng xuất' });
  }
});

// ==============================================================================
// 3. ĐĂNG NHẬP BẰNG TÀI KHOẢN MẬT KHẨU (ĐÃ VÔ HIỆU HÓA HOÀN TOÀN VÌ BẢO MẬT)
// ==============================================================================
authRouter.post('/login-credentials', async (_req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: 'Phương thức đăng nhập bằng tên tài khoản và mật khẩu đã bị vô hiệu hóa vì lý do bảo mật. Vui lòng sử dụng xác thực qua Email OTP Quản trị viên.'
  });
});

// ==============================================================================
// 4. LẤY THÔNG TIN ADMIN HIỆN TẠI (GET /me)
// ==============================================================================
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản' });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Lỗi xác minh phiên đăng nhập' });
  }
});

// ==============================================================================
// 5. HẠ TẦNG QUẢN LÝ VAI TRÒ & PHÂN QUYỀN RBAC (MỞ RỘNG CHO CLIENT)
// ==============================================================================
authRouter.get('/roles', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const roles = await Role.find().sort({ isSystem: -1, name: 1 });
    return res.json({ success: true, roles });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

authRouter.post('/roles', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ success: false, message: 'Tên định danh và tên hiển thị vai trò là bắt buộc' });
    }

    const cleanName = name.trim().toLowerCase();
    const existing = await Role.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({ success: false, message: `Vai trò "${cleanName}" đã tồn tại` });
    }

    const role = await Role.create({
      name: cleanName,
      displayName: displayName.trim(),
      description: description || '',
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystem: false
    });

    return res.status(201).json({ success: true, message: 'Tạo vai trò mới thành công', role });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

authRouter.put('/roles/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò cần sửa' });
    }

    if (displayName) role.displayName = displayName.trim();
    if (description !== undefined) role.description = description;
    if (Array.isArray(permissions)) {
      // Đối với role admin hệ thống, luôn bảo lưu quyền '*'
      if (role.name === 'admin' && !permissions.includes('*')) {
        role.permissions = ['*'];
      } else {
        role.permissions = permissions;
      }
    }

    await role.save();
    return res.json({ success: true, message: 'Cập nhật vai trò thành công', role });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
