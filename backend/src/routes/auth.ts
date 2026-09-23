import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, seedDefaultAdmin } from '../models/User.js';
import { Role } from '../models/Role.js';
import { OtpToken } from '../models/OtpToken.js';
import { sendMail } from '../services/mail.js';

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
 * Middleware xác thực JSON Web Token
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc phiên làm việc đã kết thúc' });
    }
    const token = authHeader.split(' ')[1];
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

    // Tìm kiếm xem email này có thuộc tài khoản Admin nào không
    // Hoặc nếu nhập 'admin', tự động chuyển về email admin đã cấu hình
    let user: any = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanEmail }]
    });

    // Nếu không tìm thấy, nhưng email là 'admin' hoặc email SMTP cấu hình -> tự động phục hồi admin
    const envAdminEmail = (process.env.SMTP_USER || 'huynhtanlocpp09@gmail.com').trim().toLowerCase();
    if (!user && (cleanEmail === 'admin' || cleanEmail === envAdminEmail || cleanEmail.includes('admin'))) {
      user = await seedDefaultAdmin();
      if (!user) {
        user = await User.findOne({ role: 'admin' });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Email hoặc tài khoản "${cleanEmail}" không tồn tại trong hệ thống quản trị.`
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Từ chối: Địa chỉ email này không có quyền Quản trị viên (Admin).'
      });
    }

    const targetEmail = user.email;

    // KIỂM TRA CHỐNG SPAM (60s COOLDOWN TRÊN SERVER)
    const latestOtp = await OtpToken.findOne({ email: targetEmail, isUsed: false }).sort({ createdAt: -1 });

    if (latestOtp) {
      const timeElapsedMs = Date.now() - new Date(latestOtp.lastSentAt).getTime();
      const secondsElapsed = Math.floor(timeElapsedMs / 1000);

      if (secondsElapsed < OTP_COOLDOWN_SECONDS) {
        const waitTime = OTP_COOLDOWN_SECONDS - secondsElapsed;
        return res.status(429).json({
          success: false,
          message: `Vui lòng chờ thêm ${waitTime} giây nữa trước khi yêu cầu mã OTP mới.`,
          retryAfter: waitTime
        });
      }
    }

    // Sinh mã OTP 6 chữ số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Hủy các OTP cũ chưa sử dụng của email này
    await OtpToken.updateMany({ email: targetEmail, isUsed: false }, { isUsed: true });

    // Lưu mã OTP mới vào cơ sở dữ liệu
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
              🛡️ <strong>Chính sách Chống Spam:</strong> Hệ thống áp dụng cơ chế tự động giới hạn gửi mã mỗi 60 giây để đảm bảo an toàn tuyệt đối cho máy chủ.
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
// 2. XÁC THỰC MÃ OTP VÀ ĐĂNG NHẬP ADMIN
// ==============================================================================
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mã OTP' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Tìm mã OTP đang hiệu lực
    const tokenRecord = await OtpToken.findOne({
      email: cleanEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Mã OTP không tồn tại hoặc đã hết hạn (quá 5 phút). Vui lòng yêu cầu mã mới.'
      });
    }

    // Kiểm tra số lần nhập sai (tối đa 5 lần)
    if (tokenRecord.attempts >= 5) {
      tokenRecord.isUsed = true;
      await tokenRecord.save();
      return res.status(400).json({
        success: false,
        message: 'Mã OTP này đã bị khóa do nhập sai quá 5 lần. Vui lòng bấm gửi lại mã mới.'
      });
    }

    // So khớp mã OTP
    if (tokenRecord.otp !== cleanOtp) {
      tokenRecord.attempts += 1;
      await tokenRecord.save();
      const remaining = 5 - tokenRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`
      });
    }

    // Mã chính xác -> Đánh dấu đã sử dụng
    tokenRecord.isUsed = true;
    await tokenRecord.save();

    // Tìm tài khoản Admin
    const user = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanEmail }]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng trong hệ thống.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Từ chối: Bạn không có quyền Quản trị viên (Admin) để truy cập hệ thống.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công với quyền Quản trị viên Toàn quyền',
      token,
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
    console.error('[Verify OTP Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Lỗi xác thực OTP' });
  }
});

// ==============================================================================
// 3. ĐĂNG NHẬP BẰNG TÀI KHOẢN MẬT KHẨU (admin / admin)
// ==============================================================================
authRouter.post('/login-credentials', async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();

    // Tìm tài khoản
    let user: any = await User.findOne({
      $or: [{ username: cleanInput }, { email: cleanInput }]
    });

    // Tự động phục hồi Quản trị viên tối cao nếu chưa tồn tại
    const envAdminEmail = (process.env.SMTP_USER || 'huynhtanlocpp09@gmail.com').trim().toLowerCase();
    if (!user && (cleanInput === 'admin' || cleanInput === envAdminEmail || cleanInput.includes('admin'))) {
      user = await seedDefaultAdmin();
      if (!user) {
        user = await User.findOne({ role: 'admin' });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Từ chối: Chỉ tài khoản có quyền Quản trị viên (Admin) mới có thể vào trang này'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
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
    console.error('[Login Credentials Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Lỗi đăng nhập tài khoản' });
  }
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
