import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { pgUpsertUser } from '../db/syncEngine.js';

export const usersRouter = Router();

// Tất cả các route bên dưới đều yêu cầu quyền Quản trị viên
usersRouter.use(authenticate, requireAdmin);

/**
 * GET /api/users
 * Lấy danh sách người dùng, thống kê KPI và bộ lọc
 */
usersRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search = '', role = '', status = '', page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { username: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } }
      ];
    }

    if (role && typeof role === 'string' && role !== 'all') {
      query.role = role.trim();
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query.isActive = status === 'active';
    }

    const [users, total, totalAdmins, totalStaff, totalClients, totalActive] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: { $in: ['client', 'user', 'customer'] } }),
      User.countDocuments({ isActive: true })
    ]);

    // Thêm dữ liệu đặt lịch mô phỏng cho người dùng (nếu chưa có trong CSDL)
    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      username: u.username,
      email: u.email,
      fullName: u.fullName || u.username,
      phone: u.phone || '',
      avatar: u.avatar || '',
      role: u.role || 'client',
      permissions: u.permissions || [],
      isActive: u.isActive !== false,
      notes: u.notes || '',
      bookingStats: u.bookingStats || {
        totalBookings: u.role === 'admin' ? 0 : Math.floor((parseInt(u._id.toString().slice(-4), 16) % 7)),
        totalSpent: u.role === 'admin' ? 0 : Math.floor((parseInt(u._id.toString().slice(-4), 16) % 7)) * 30000,
        lastBookingDate: u.updatedAt
      },
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      stats: {
        totalUsers: await User.countDocuments(),
        adminCount: totalAdmins,
        staffCount: totalStaff,
        clientCount: totalClients,
        activeCount: totalActive
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách người dùng',
      error: err.message
    });
  }
});

/**
 * GET /api/users/:id
 * Lấy chi tiết thông tin 1 người dùng kèm lịch sử đặt lịch / thanh toán
 */
usersRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Mock dữ liệu lịch sử đặt vé / lịch tham quan để phục vụ tính năng đặt lịch & thanh toán sau này
    const mockBookings = [
      {
        id: `BK-${user._id.toString().slice(-6).toUpperCase()}-01`,
        visitDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        timeSlot: '09:00 - 11:30',
        ticketType: 'Vé Tiêu Chuẩn + Thuyết Minh Audio Guide',
        quantity: 2,
        totalAmount: 60000,
        paymentStatus: 'paid', // 'paid' | 'pending' | 'cancelled'
        paymentMethod: 'Chuyển khoản QR / VNPay',
        bookingDate: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: `BK-${user._id.toString().slice(-6).toUpperCase()}-02`,
        visitDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        timeSlot: '14:00 - 16:30',
        ticketType: 'Vé Trải Nghiệm Tour 360 & Không Gian Di Sản',
        quantity: 1,
        totalAmount: 30000,
        paymentStatus: 'paid',
        paymentMethod: 'Thẻ tín dụng / Ví điện tử',
        bookingDate: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        id: user._id.toString(),
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        phone: (user as any).phone || '',
        avatar: (user as any).avatar || '',
        role: user.role || 'client',
        permissions: user.permissions || [],
        isActive: user.isActive !== false,
        notes: (user as any).notes || '',
        bookingStats: (user as any).bookingStats || {
          totalBookings: 2,
          totalSpent: 90000,
          lastBookingDate: new Date()
        },
        bookings: mockBookings,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể đọc thông tin người dùng',
      error: err.message
    });
  }
});

/**
 * POST /api/users
 * Thêm người dùng mới (Admin tạo tài khoản Nhân viên / Khách / Quản trị)
 */
usersRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, phone, role, isActive, notes } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email không được để trống' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Định dạng địa chỉ Email không hợp lệ.' });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' });
    }

    const cleanUsername = (username && username.trim().toLowerCase()) || cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    // Kiểm tra trùng lặp email hoặc username
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existing) {
      const field = existing.email === cleanEmail ? 'Email' : 'Tên đăng nhập';
      return res.status(400).json({ success: false, message: `${field} này đã được sử dụng trên hệ thống.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password?.trim() || 'Museum@2026', salt);

    const targetRole = role || 'client';
    const permissions = targetRole === 'admin' ? ['*'] : targetRole === 'staff' ? ['rooms:read', 'rooms:write', 'artifacts:manage'] : ['tour:view'];

    const newUser = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      fullName: fullName?.trim() || cleanUsername,
      phone: phone?.trim() || '',
      role: targetRole,
      permissions,
      isActive: isActive !== false,
      notes: notes?.trim() || ''
    });

    // Đồng bộ sang PostgreSQL nếu có kết nối
    try {
      await pgUpsertUser(newUser);
    } catch {}

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công',
      data: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo người dùng mới',
      error: err.message
    });
  }
});

/**
 * PUT /api/users/:id
 * Cập nhật thông tin người dùng
 */
usersRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, role, isActive, password, notes, permissions } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép tự khóa tài khoản chính mình
    if (req.user?.id === user._id.toString() && isActive === false) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản đang đăng nhập của chính mình.' });
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (notes !== undefined) user.notes = notes.trim();

    if (role !== undefined) {
      user.role = role;
      if (role === 'admin') {
        user.permissions = ['*'];
      } else if (permissions && Array.isArray(permissions)) {
        user.permissions = permissions;
      }
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    // Đồng bộ sang PostgreSQL
    try {
      await pgUpsertUser(user);
    } catch {}

    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        notes: user.notes,
        updatedAt: user.updatedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật người dùng',
      error: err.message
    });
  }
});

/**
 * PATCH /api/users/:id/status
 * Đổi nhanh trạng thái Hoạt động / Tạm khóa
 */
usersRouter.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (req.user?.id === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự đổi trạng thái tài khoản của chính mình.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'Đã kích hoạt tài khoản người dùng' : 'Đã tạm khóa tài khoản người dùng',
      isActive: user.isActive
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật trạng thái',
      error: err.message
    });
  }
});

/**
 * DELETE /api/users/:id
 * Xóa người dùng (Bảo vệ: Không được tự xóa tài khoản đang đăng nhập và admin mặc định)
 */
usersRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Bảo vệ an toàn tuyệt đối
    if (req.user?.id === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên bạn đang đăng nhập.' });
    }

    if (user.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên tối cao mặc định của hệ thống.' });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: `Đã xóa người dùng "${user.fullName || user.email}" thành công.`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng',
      error: err.message
    });
  }
});
