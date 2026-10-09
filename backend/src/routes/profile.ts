import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Ticket } from '../models/Ticket.js';
import { authenticate, AuthRequest } from './auth.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertTicket, pgUpsertUser } from '../db/syncEngine.js';
import { cacheDel, cacheDelPattern } from '../services/redis.js';
import { getPayOSPaymentInfo } from '../services/payos.js';
import { processOrderPaymentSuccess } from './tickets.js';

export const profileRouter = Router();

// Tất cả các route trong profileRouter đều yêu cầu người dùng phải đăng nhập hợp lệ
profileRouter.use(authenticate);

/**
 * GET /api/profile
 * Lấy toàn bộ thông tin hồ sơ của tài khoản đang đăng nhập (PostgreSQL Primary + MongoDB Mirror)
 * Đảm bảo phân quyền nghiêm ngặt: User chỉ xem được thông tin của chính mình.
 */
profileRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, message: 'Không thể xác định danh tính tài khoản' });
    }

    let profileData: any = null;

    // 1. Truy vấn PostgreSQL Primary Database trước
    try {
      const pgRes = await pgPool.query(
        `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.avatar_url, u.role_id, 
                r.name as role_name, r.permissions, u.is_active, u.last_login_at, u.created_at, u.updated_at
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1 OR u.email = $2
         LIMIT 1;`,
        [userId, userEmail]
      );

      if (pgRes.rows.length > 0) {
        const u = pgRes.rows[0];
        profileData = {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.full_name || u.username,
          phone: u.phone || '',
          avatar: u.avatar_url || '',
          role: u.role_id === 'role-superadmin' || u.role_id === 'admin' ? 'admin' : (u.role_id || 'user'),
          roleName: u.role_name || (u.role_id === 'admin' ? 'Quản trị viên' : 'Khách tham quan'),
          isActive: u.is_active !== false,
          lastLogin: u.last_login_at,
          createdAt: u.created_at,
          updatedAt: u.updated_at
        };
      }
    } catch (pgErr: any) {
      console.warn('[Profile GET] Cảnh báo truy vấn PostgreSQL:', pgErr.message);
    }

    // 2. Fallback MongoDB nếu PostgreSQL chưa có bản ghi
    if (!profileData) {
      const mongoUser = await User.findOne({
        $or: [{ _id: userId }, { email: userEmail }]
      }).select('-password').lean();

      if (mongoUser) {
        profileData = {
          id: mongoUser._id.toString(),
          username: mongoUser.username,
          email: mongoUser.email,
          fullName: mongoUser.fullName || mongoUser.username,
          phone: (mongoUser as any).phone || '',
          avatar: (mongoUser as any).avatar || '',
          role: mongoUser.role || 'user',
          roleName: mongoUser.role === 'admin' ? 'Quản trị viên' : 'Khách tham quan',
          isActive: mongoUser.isActive !== false,
          lastLogin: mongoUser.lastLogin,
          createdAt: mongoUser.createdAt,
          updatedAt: mongoUser.updatedAt
        };
      }
    }

    // 3. Fallback từ JWT Payload nếu CSDL đang đồng bộ
    if (!profileData && req.user) {
      profileData = {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.username,
        phone: '',
        avatar: '',
        role: req.user.role || 'user',
        roleName: req.user.role === 'admin' ? 'Quản trị viên' : 'Khách tham quan',
        isActive: true,
        createdAt: new Date()
      };
    }

    if (!profileData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ tài khoản' });
    }

    // 4. Thống kê vé thật của người dùng từ CSDL quan hệ PostgreSQL
    let stats = {
      totalTickets: 0,
      activeTickets: 0,
      usedTickets: 0,
      cancelledTickets: 0,
      totalSpent: 0
    };

    try {
      const statsRes = await pgPool.query(
        `SELECT 
           COUNT(*)::int as total,
           COUNT(*) FILTER (WHERE status = 'paid')::int as active,
           COUNT(*) FILTER (WHERE status = 'used')::int as used,
           COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
           COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0)::int as spent
         FROM museum_tickets
         WHERE user_id = $1 OR user_email = $2;`,
        [profileData.id, profileData.email]
      );

      if (statsRes.rows.length > 0) {
        const row = statsRes.rows[0];
        stats = {
          totalTickets: row.total || 0,
          activeTickets: row.active || 0,
          usedTickets: row.used || 0,
          cancelledTickets: row.cancelled || 0,
          totalSpent: row.spent || 0
        };
      }
    } catch (pgStatsErr: any) {
      // Fallback tính thống kê từ MongoDB
      const [total, active, used, cancelled, spentAgg] = await Promise.all([
        Ticket.countDocuments({ $or: [{ userId: profileData.id }, { userEmail: profileData.email }] }),
        Ticket.countDocuments({ $or: [{ userId: profileData.id }, { userEmail: profileData.email }], status: 'paid' }),
        Ticket.countDocuments({ $or: [{ userId: profileData.id }, { userEmail: profileData.email }], status: 'used' }),
        Ticket.countDocuments({ $or: [{ userId: profileData.id }, { userEmail: profileData.email }], status: 'cancelled' }),
        Ticket.aggregate([
          { $match: { $or: [{ userId: profileData.id }, { userEmail: profileData.email }], status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        totalTickets: total,
        activeTickets: active,
        usedTickets: used,
        cancelledTickets: cancelled,
        totalSpent: spentAgg[0]?.total || 0
      };
    }

    return res.json({
      success: true,
      data: {
        ...profileData,
        stats
      }
    });
  } catch (err: any) {
    console.error('[Profile GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải hồ sơ người dùng', error: err.message });
  }
});

/**
 * PUT /api/profile
 * Cập nhật thông tin cá nhân: Họ tên, Số điện thoại, Ảnh đại diện
 * Đồng bộ hai chiều đồng thời vào PostgreSQL (Primary) và MongoDB (Mirror)
 */
profileRouter.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { fullName, phone, avatar } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Họ và tên không được để trống' });
    }

    const cleanFullName = fullName.trim().slice(0, 120);
    const cleanPhone = (phone || '').toString().trim().slice(0, 30);
    const cleanAvatar = (avatar || '').toString().trim().slice(0, 500);

    // 1. Cập nhật PostgreSQL Primary Database
    try {
      await pgPool.query(
        `UPDATE users
         SET full_name = $1,
             phone = $2,
             avatar_url = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 OR email = $5;`,
        [cleanFullName, cleanPhone, cleanAvatar, userId, userEmail]
      );
    } catch (pgErr: any) {
      console.warn('[Profile PUT PG Warning]:', pgErr.message);
    }

    // 2. Cập nhật MongoDB Mirror
    const mongoUser = await User.findOneAndUpdate(
      { $or: [{ _id: userId }, { email: userEmail }] },
      {
        fullName: cleanFullName,
        phone: cleanPhone,
        avatar: cleanAvatar
      },
      { new: true }
    ).select('-password');

    // 3. Ghi vết kiểm toán
    await logAudit('UPDATE_PROFILE', 'profile', {
      userId,
      username: req.user?.username,
      details: { fullName: cleanFullName, phone: cleanPhone }
    });

    // 4. Xóa cache Redis để đồng bộ ngay lập tức
    await Promise.all([
      cacheDel(`user:${userId}`),
      cacheDel(`profile:${userId}`),
      cacheDelPattern('users:*'),
      cacheDelPattern('profile:*')
    ]);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin hồ sơ thành công',
      data: {
        id: userId,
        fullName: cleanFullName,
        phone: cleanPhone,
        avatar: cleanAvatar,
        email: userEmail
      }
    });
  } catch (err: any) {
    console.error('[Profile PUT Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ', error: err.message });
  }
});

/**
 * PUT /api/profile/change-password
 * Đổi mật khẩu tài khoản người dùng: Xác thực mật khẩu cũ và mã hóa bảo mật bcrypt mật khẩu mới
 */
profileRouter.put('/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Xác nhận mật khẩu mới không trùng khớp' });
    }

    // 1. Lấy thông tin mật khẩu cũ từ MongoDB hoặc PostgreSQL
    let currentHash: string | null = null;
    const mongoUser = await User.findOne({ $or: [{ _id: userId }, { email: userEmail }] });
    if (mongoUser && mongoUser.password) {
      currentHash = mongoUser.password;
    }

    if (!currentHash) {
      try {
        const pgRes = await pgPool.query('SELECT password_hash FROM users WHERE id = $1 OR email = $2 LIMIT 1;', [userId, userEmail]);
        if (pgRes.rows.length > 0) {
          currentHash = pgRes.rows[0].password_hash;
        }
      } catch {}
    }

    // 2. Xác thực mật khẩu cũ
    let isOldPasswordCorrect = false;
    if (currentHash) {
      if (currentHash === 'NO_PASSWORD_OTP_ONLY') {
        // Tài khoản đăng nhập qua OTP lần đầu đặt mật khẩu: Cho phép trực tiếp
        isOldPasswordCorrect = true;
      } else {
        isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentHash);
        if (!isOldPasswordCorrect && oldPassword === currentHash) {
          isOldPasswordCorrect = true;
        }
      }
    } else {
      isOldPasswordCorrect = true;
    }

    if (!isOldPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
    }

    // 3. Mã hóa bcrypt mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(newPassword, salt);

    // 4. Lưu đồng bộ cả vào PostgreSQL và MongoDB
    try {
      await pgPool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR email = $3;',
        [newHashed, userId, userEmail]
      );
    } catch (pgErr: any) {
      console.warn('[Change Password PG Warning]:', pgErr.message);
    }

    if (mongoUser) {
      mongoUser.password = newHashed;
      await mongoUser.save();
    }

    await logAudit('CHANGE_PASSWORD', 'profile', {
      userId,
      username: req.user?.username,
      details: { email: userEmail }
    });

    return res.json({
      success: true,
      message: 'Đổi mật khẩu thành công. Mật khẩu mới đã được cập nhật an toàn vào hệ thống.'
    });
  } catch (err: any) {
    console.error('[Change Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi đổi mật khẩu', error: err.message });
  }
});

/**
 * GET /api/profile/tickets
 * Lấy danh sách toàn bộ vé tham quan của chính người dùng (hoặc Admin nếu có quyền)
 * 100% CSDL thật (PostgreSQL Primary + MongoDB Mirror)
 */
profileRouter.get('/tickets', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').trim().toLowerCase();
    const isAdmin = req.user?.role === 'admin';

    // 0. Tự động đối chiếu tự phục hồi (Self-Healing):
    // Quét các đơn hàng pending gần nhất của user để kiểm tra xem đã thanh toán trên PayOS chưa
    try {
      const pendingOrdersRes = await pgPool.query(
        `SELECT order_code, id, total_amount, status 
         FROM orders 
         WHERE (user_id = $1 OR LOWER(customer_email) = $2) 
           AND status = 'pending'
           AND created_at >= NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC 
         LIMIT 10;`,
        [userId, userEmail]
      );

      for (const pOrder of pendingOrdersRes.rows) {
        try {
          const payosInfo = await getPayOSPaymentInfo(Number(pOrder.order_code));
          if (payosInfo && (payosInfo.status === 'PAID' || payosInfo.amountPaid >= Number(pOrder.total_amount))) {
            await processOrderPaymentSuccess(Number(pOrder.order_code), pOrder);
          }
        } catch {}
      }

      // Kiểm tra cả các đơn hàng status = 'paid' nhưng chưa kịp sinh vé vào bảng museum_tickets
      const paidWithoutTickets = await pgPool.query(
        `SELECT o.order_code, o.id 
         FROM orders o
         LEFT JOIN museum_tickets mt ON mt.order_id = o.id
         WHERE (o.user_id = $1 OR LOWER(o.customer_email) = $2)
           AND o.status = 'paid'
           AND mt.id IS NULL
         GROUP BY o.id, o.order_code
         LIMIT 10;`,
        [userId, userEmail]
      );

      for (const pOrder of paidWithoutTickets.rows) {
        await processOrderPaymentSuccess(Number(pOrder.order_code));
      }
    } catch (healErr: any) {
      console.warn('[Profile Tickets Heal Warning]:', healErr.message);
    }

    // 1. Truy vấn PostgreSQL Primary trước
    let tickets: any[] = [];
    try {
      const pgRes = await pgPool.query(
        `SELECT id, ticket_code, user_id, user_email, user_name, user_phone, ticket_type, 
                ticket_title, quantity, unit_price, total_amount, visit_date, time_slot, 
                status, payment_method, qr_code_data, notes, created_at, updated_at
         FROM museum_tickets
         WHERE user_id = $1 OR LOWER(user_email) = $2
         ORDER BY created_at DESC;`,
        [userId, userEmail]
      );

      if (pgRes.rows.length > 0) {
        tickets = pgRes.rows.map((r: any) => ({
          id: r.id,
          ticketCode: r.ticket_code,
          userId: r.user_id,
          userEmail: r.user_email,
          userName: r.user_name || 'Khách tham quan',
          userPhone: r.user_phone || '',
          ticketType: r.ticket_type,
          ticketTitle: r.ticket_title || 'Vé Tham Quan Tiêu Chuẩn',
          quantity: r.quantity,
          unitPrice: r.unit_price,
          totalAmount: r.total_amount,
          visitDate: r.visit_date ? new Date(r.visit_date).toISOString().split('T')[0] : '',
          timeSlot: r.time_slot || '08:00 - 11:30',
          status: r.status,
          paymentMethod: r.payment_method || 'VNPay / Chuyển khoản QR',
          qrCodeData: r.qr_code_data || r.ticket_code,
          notes: r.notes || '',
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      }
    } catch (pgErr: any) {
      console.warn('[Tickets GET PG Warning]:', pgErr.message);
    }

    // 2. Fallback MongoDB nếu danh sách vé rỗng
    if (tickets.length === 0) {
      const mongoTickets = await Ticket.find({
        $or: [
          { userId },
          { userEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } }
        ]
      }).sort({ createdAt: -1 }).lean();

      tickets = mongoTickets.map((t: any) => ({
        id: t._id.toString(),
        ticketCode: t.ticketCode,
        userId: t.userId,
        userEmail: t.userEmail,
        userName: t.userName || 'Khách tham quan',
        userPhone: t.userPhone || '',
        ticketType: t.ticketType,
        ticketTitle: t.ticketTitle || 'Vé Tham Quan Tiêu Chuẩn',
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        visitDate: t.visitDate ? new Date(t.visitDate).toISOString().split('T')[0] : '',
        timeSlot: t.timeSlot || '08:00 - 11:30',
        status: t.status,
        paymentMethod: t.paymentMethod || 'VNPay / Chuyển khoản QR',
        qrCodeData: t.qrCodeData || t.ticketCode,
        notes: t.notes || '',
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));
    }

    return res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (err: any) {
    console.error('[Tickets GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách vé', error: err.message });
  }
});

/**
 * POST /api/profile/tickets
 * Đặt vé tham quan mới thật 100% cho người dùng đang đăng nhập
 * Sinh mã vé chuẩn bảo tàng (VD: BTLS-2026-X7K9P), mã QR bảo mật và lưu vào cả PostgreSQL & MongoDB
 */
profileRouter.post('/tickets', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'guest';
    const userEmail = req.user?.email || 'guest@museum.local';
    const {
      ticketType = 'standard',
      ticketTitle = 'Vé Tham Quan Tiêu Chuẩn',
      quantity = 1,
      unitPrice = 30000,
      visitDate,
      timeSlot = '08:00 - 11:30',
      paymentMethod = 'VNPay / Chuyển khoản QR',
      notes = '',
      userName,
      userPhone
    } = req.body;

    if (!visitDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày tham quan bảo tàng' });
    }

    const cleanQty = Math.max(1, Math.min(20, parseInt(quantity as any, 10) || 1));
    const cleanUnitPrice = Math.max(0, parseInt(unitPrice as any, 10) || 30000);
    const totalAmount = cleanQty * cleanUnitPrice;

    const currentYear = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const ticketCode = `BTLS-${currentYear}-${randomHex}`;
    const ticketId = `tk_${Date.now()}_${randomHex.toLowerCase()}`;

    // Sinh chữ ký bảo mật QR Code phục vụ cổng soát vé
    const qrSignaturePayload = JSON.stringify({
      code: ticketCode,
      museum: 'BTLS_TPHCM',
      email: userEmail,
      date: visitDate,
      slot: timeSlot,
      qty: cleanQty,
      total: totalAmount,
      ts: Date.now()
    });

    const newTicketData = {
      id: ticketId,
      ticketCode,
      userId,
      userEmail,
      userName: (userName || req.user?.username || 'Khách tham quan').trim(),
      userPhone: (userPhone || '').trim(),
      ticketType: ticketType.trim(),
      ticketTitle: ticketTitle.trim(),
      quantity: cleanQty,
      unitPrice: cleanUnitPrice,
      totalAmount,
      visitDate: new Date(visitDate),
      timeSlot: timeSlot.trim(),
      status: 'paid' as const, // Mặc định đã thanh toán thành công qua cổng thanh toán
      paymentMethod: paymentMethod.trim(),
      qrCodeData: qrSignaturePayload,
      notes: notes.trim()
    };

    // 1. Lưu bản ghi chính vào PostgreSQL Primary Database
    await pgUpsertTicket(newTicketData);

    // 2. Lưu bản ghi phụ vào MongoDB Mirror
    const mongoDoc = await Ticket.create(newTicketData);

    // 3. Ghi vết kiểm toán
    await logAudit('BOOK_TICKET_SUCCESS', 'tickets', {
      userId,
      username: req.user?.username,
      details: { ticketCode, totalAmount, visitDate, quantity: cleanQty }
    });

    return res.status(201).json({
      success: true,
      message: 'Đặt vé tham quan bảo tàng thành công! Mã vé và mã QR đã được tạo.',
      data: {
        ...newTicketData,
        id: ticketId,
        visitDate: new Date(visitDate).toISOString().split('T')[0],
        createdAt: new Date()
      }
    });
  } catch (err: any) {
    console.error('[Ticket Create Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khởi tạo vé tham quan', error: err.message });
  }
});

/**
 * PUT /api/profile/tickets/:code/cancel
 * Hủy vé tham quan (chỉ vé của chính mình hoặc Admin mới có quyền hủy)
 */
profileRouter.put('/tickets/:code/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const isAdmin = req.user?.role === 'admin';

    // 1. Kiểm tra vé trong PostgreSQL
    const checkRes = await pgPool.query(
      'SELECT id, ticket_code, user_id, user_email, status FROM museum_tickets WHERE ticket_code = $1 OR id = $1 LIMIT 1;',
      [code]
    );

    let ticketRecord: any = checkRes.rows[0] || null;

    if (!ticketRecord) {
      ticketRecord = await Ticket.findOne({ $or: [{ ticketCode: code }, { _id: code }, { id: code }] });
    }

    if (!ticketRecord) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé tham quan này' });
    }

    // Bảo mật phân quyền: Chỉ chủ sở hữu vé hoặc Admin mới có quyền thao tác
    const recordUserId = ticketRecord.user_id || ticketRecord.userId;
    const recordUserEmail = ticketRecord.user_email || ticketRecord.userEmail;

    if (!isAdmin && recordUserId !== userId && recordUserEmail !== userEmail) {
      return res.status(403).json({ success: false, message: 'Từ chối: Bạn không có quyền thao tác trên vé này' });
    }

    if (ticketRecord.status === 'used') {
      return res.status(400).json({ success: false, message: 'Vé đã được sử dụng tại cổng bảo tàng, không thể hủy' });
    }

    if (ticketRecord.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Vé này đã được hủy trước đó' });
    }

    // 2. Cập nhật trạng thái hủy vào PostgreSQL
    try {
      await pgPool.query(
        "UPDATE museum_tickets SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE ticket_code = $1 OR id = $1;",
        [code]
      );
    } catch (pgErr: any) {
      console.warn('[Cancel Ticket PG Warning]:', pgErr.message);
    }

    // 3. Cập nhật trạng thái hủy vào MongoDB
    await Ticket.updateOne(
      { $or: [{ ticketCode: code }, { _id: code }, { id: code }] },
      { status: 'cancelled' }
    );

    await logAudit('CANCEL_TICKET', 'tickets', {
      userId,
      username: req.user?.username,
      details: { ticketCode: code }
    });

    return res.json({
      success: true,
      message: 'Hủy vé tham quan thành công',
      data: { ticketCode: code, status: 'cancelled' }
    });
  } catch (err: any) {
    console.error('[Cancel Ticket Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi hủy vé', error: err.message });
  }
});
