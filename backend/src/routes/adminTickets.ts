import { Router, Response } from 'express';
import { Ticket } from '../models/Ticket.js';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertTicket, pgDeleteTicket } from '../db/syncEngine.js';
import { esSearchTickets, esIndexTicket, esDeleteTicket } from '../services/elasticsearch.js';

export const adminTicketsRouter = Router();

// Tất cả các route bên dưới bắt buộc quyền Quản trị viên (Admin)
adminTicketsRouter.use(authenticate, requireAdmin);

function normalizeDateStr(input: string): { isoDate: string; dmyDate: string } | null {
  if (!input) return null;
  const s = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    return { isoDate: s, dmyDate: `${d}/${m}/${y}` };
  }
  const parts = s.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const iso = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return { isoDate: iso, dmyDate: `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}` };
    }
    if (parts[2].length === 4) {
      const iso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      return { isoDate: iso, dmyDate: `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}` };
    }
  }
  return null;
}

/**
 * GET /api/admin/tickets
 * Quản trị toàn bộ vé tham quan của bảo tàng với tốc độ truy vấn tối ưu
 * Tự động tối ưu bằng Elasticsearch khi khả dụng, fallback PostgreSQL & MongoDB
 */
adminTicketsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = '',
      status = 'all',
      ticketType = 'all',
      visitDate = '',
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let tickets: any[] = [];
    let total = 0;
    let stats = {
      totalTickets: 0,
      activeTickets: 0,
      usedTickets: 0,
      cancelledTickets: 0,
      totalRevenue: 0
    };

    // 0. Thử truy vấn qua cụm Elasticsearch trước tiên (Tốc độ mili-giây)
    const esRes = await esSearchTickets({
      search: search as string,
      status: status as string,
      ticketType: ticketType as string,
      visitDate: visitDate as string,
      from: offset,
      size: limitNum
    });

    if (esRes && esRes.hits && esRes.hits.length > 0) {
      tickets = esRes.hits;
      total = esRes.total;
    }

    try {
      const whereClauses: string[] = [];
      const queryParams: any[] = [];

      if (search && typeof search === 'string' && search.trim()) {
        const term = `%${search.trim().toLowerCase()}%`;
        queryParams.push(term);
        const idx = queryParams.length;
        whereClauses.push(`(
          LOWER(ticket_code) LIKE $${idx} OR
          LOWER(user_name) LIKE $${idx} OR
          LOWER(user_email) LIKE $${idx} OR
          LOWER(user_phone) LIKE $${idx}
        )`);
      }

      if (status && status !== 'all') {
        queryParams.push(status);
        whereClauses.push(`status = $${queryParams.length}`);
      }

      if (ticketType && ticketType !== 'all') {
        queryParams.push(ticketType);
        whereClauses.push(`ticket_type = $${queryParams.length}`);
      }

      if (visitDate && typeof visitDate === 'string' && visitDate.trim()) {
        const dateInfo = normalizeDateStr(visitDate.trim());
        if (dateInfo) {
          queryParams.push(dateInfo.isoDate);
          const idx = queryParams.length;
          whereClauses.push(`(
            DATE(visit_date) = $${idx}::date OR
            TO_CHAR(visit_date, 'YYYY-MM-DD') = $${idx}
          )`);
        } else {
          queryParams.push(`%${visitDate.trim()}%`);
          const idx = queryParams.length;
          whereClauses.push(`(
            TO_CHAR(visit_date, 'YYYY-MM-DD') LIKE $${idx} OR
            TO_CHAR(visit_date, 'DD/MM/YYYY') LIKE $${idx}
          )`);
        }
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Đếm tổng số bản ghi phù hợp
      const countRes = await pgPool.query(`SELECT COUNT(*) FROM museum_tickets ${whereSql};`, queryParams);
      total = parseInt(countRes.rows[0].count, 10) || 0;

      // Lấy danh sách vé có phân trang
      const listParams = [...queryParams, limitNum, offset];
      const listSql = `
        SELECT id, ticket_code, user_id, user_email, user_name, user_phone,
               ticket_type, ticket_title, quantity, unit_price, total_amount,
               visit_date, time_slot, status, payment_method, qr_code_data, notes,
               created_at, updated_at
        FROM museum_tickets
        ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
      `;

      const listRes = await pgPool.query(listSql, listParams);
      tickets = listRes.rows.map((r: any) => ({
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

      // Lấy thống kê tổng hợp toàn diện (Dashboard Stats)
      const statsRes = await pgPool.query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'paid' AND visit_date >= CURRENT_DATE)::int as active,
          COUNT(*) FILTER (WHERE status = 'used')::int as used,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int as cancelled,
          COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0)::int as revenue
        FROM museum_tickets;
      `);

      if (statsRes.rows.length > 0) {
        const s = statsRes.rows[0];
        stats = {
          totalTickets: s.total || 0,
          activeTickets: s.active || 0,
          usedTickets: s.used || 0,
          cancelledTickets: s.cancelled || 0,
          totalRevenue: s.revenue || 0
        };
      }
    } catch (pgErr: any) {
      console.warn('[Admin Tickets PG Warning]:', pgErr.message);
    }

    // 2. Fallback MongoDB nếu PostgreSQL chưa có dữ liệu
    if (tickets.length === 0 && total === 0) {
      const mongoQuery: any = {};
      if (search && typeof search === 'string' && search.trim()) {
        const term = search.trim();
        mongoQuery.$or = [
          { ticketCode: { $regex: term, $options: 'i' } },
          { userName: { $regex: term, $options: 'i' } },
          { userEmail: { $regex: term, $options: 'i' } },
          { userPhone: { $regex: term, $options: 'i' } }
        ];
      }
      if (status && status !== 'all') mongoQuery.status = status;
      if (ticketType && ticketType !== 'all') mongoQuery.ticketType = ticketType;
      if (visitDate && typeof visitDate === 'string' && visitDate.trim()) {
        const dateInfo = normalizeDateStr(visitDate.trim());
        if (dateInfo) {
          const start = new Date(`${dateInfo.isoDate}T00:00:00.000Z`);
          const end = new Date(`${dateInfo.isoDate}T23:59:59.999Z`);
          const localStart = new Date(new Date(`${dateInfo.isoDate}T00:00:00`).setHours(0, 0, 0, 0));
          const localEnd = new Date(new Date(`${dateInfo.isoDate}T23:59:59`).setHours(23, 59, 59, 999));
          mongoQuery.$or = [
            { visitDate: { $gte: start, $lte: end } },
            { visitDate: { $gte: localStart, $lte: localEnd } }
          ];
        }
      }

      const [mongoTickets, mongoTotal] = await Promise.all([
        Ticket.find(mongoQuery)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limitNum)
          .lean(),
        Ticket.countDocuments(mongoQuery)
      ]);

      total = mongoTotal;
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
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      stats
    });
  } catch (err: any) {
    console.error('[Admin Tickets Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách vé quản trị', error: err.message });
  }
});

/**
 * PUT /api/admin/tickets/:code/checkin
 * Soát vé vào cổng bảo tàng: Đổi trạng thái sang 'used'
 */
adminTicketsRouter.put('/:code/checkin', async (req: AuthRequest, res: Response) => {
  try {
    const code = String(req.params.code);

    // 1. Kiểm tra vé trong PostgreSQL
    const checkRes = await pgPool.query('SELECT * FROM museum_tickets WHERE ticket_code = $1 OR id = $1 LIMIT 1;', [code]);
    let ticket: any = checkRes.rows[0];

    if (!ticket) {
      ticket = await Ticket.findOne({ $or: [{ ticketCode: code }, { _id: code }, { id: code }] });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vé tham quan này' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ success: false, message: 'Vé này đã được soát vé vào cổng trước đó!' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Vé này đã bị hủy, không thể sử dụng!' });
    }

    // 2. Cập nhật vào PostgreSQL
    await pgPool.query(
      "UPDATE museum_tickets SET status = 'used', updated_at = CURRENT_TIMESTAMP WHERE ticket_code = $1 OR id = $1;",
      [code]
    );

    // 3. Cập nhật vào MongoDB
    await Ticket.updateOne(
      { $or: [{ ticketCode: code }, { _id: code }, { id: code }] },
      { status: 'used' }
    );

    // 4. Đồng bộ Elasticsearch
    await esIndexTicket({
      ticketCode: ticket.ticket_code || ticket.ticketCode || code,
      userName: ticket.user_name || ticket.userName || '',
      userEmail: ticket.user_email || ticket.userEmail || '',
      userPhone: ticket.user_phone || ticket.userPhone || '',
      ticketType: ticket.ticket_type || ticket.ticketType || 'standard',
      visitDate: ticket.visit_date ? new Date(ticket.visit_date).toISOString().split('T')[0] : '',
      status: 'used'
    });

    await logAudit('CHECKIN_TICKET', 'tickets', {
      userId: req.user?.id,
      username: req.user?.username,
      details: { ticketCode: code, action: 'checkin' }
    });

    return res.json({
      success: true,
      message: `Đã soát vé thành công cho mã vé ${code}. Khách được phép vào cổng!`,
      data: { ticketCode: code, status: 'used' }
    });
  } catch (err: any) {
    console.error('[Admin Checkin Ticket Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi soát vé', error: err.message });
  }
});

/**
 * PUT /api/admin/tickets/:code/cancel
 * Hủy vé tham quan bởi Quản trị viên
 */
adminTicketsRouter.put('/:code/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const code = String(req.params.code);

    await pgPool.query(
      "UPDATE museum_tickets SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE ticket_code = $1 OR id = $1;",
      [code]
    );

    await Ticket.updateOne(
      { $or: [{ ticketCode: code }, { _id: code }, { id: code }] },
      { status: 'cancelled' }
    );

    // Đồng bộ trạng thái Elasticsearch
    const checkRes = await pgPool.query('SELECT * FROM museum_tickets WHERE ticket_code = $1 OR id = $1 LIMIT 1;', [code]);
    if (checkRes.rows[0]) {
      const r = checkRes.rows[0];
      await esIndexTicket({
        ticketCode: r.ticket_code,
        userName: r.user_name || '',
        userEmail: r.user_email || '',
        userPhone: r.user_phone || '',
        ticketType: r.ticket_type || 'standard',
        visitDate: r.visit_date ? new Date(r.visit_date).toISOString().split('T')[0] : '',
        status: 'cancelled'
      });
    }

    await logAudit('ADMIN_CANCEL_TICKET', 'tickets', {
      userId: req.user?.id,
      username: req.user?.username,
      details: { ticketCode: code }
    });

    return res.json({
      success: true,
      message: `Đã hủy vé ${code} thành công.`,
      data: { ticketCode: code, status: 'cancelled' }
    });
  } catch (err: any) {
    console.error('[Admin Cancel Ticket Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi hủy vé', error: err.message });
  }
});

/**
 * DELETE /api/admin/tickets/:code
 * Xóa vĩnh viễn vé khỏi CSDL (Dành riêng cho Admin dọn dẹp)
 */
adminTicketsRouter.delete('/:code', async (req: AuthRequest, res: Response) => {
  try {
    const code = String(req.params.code);

    await pgDeleteTicket(code);
    await Ticket.deleteOne({ $or: [{ ticketCode: code }, { _id: code }, { id: code }] });
    await esDeleteTicket(code);

    await logAudit('DELETE_TICKET', 'tickets', {
      userId: req.user?.id,
      username: req.user?.username,
      details: { ticketCode: code }
    });

    return res.json({
      success: true,
      message: `Đã xóa vĩnh viễn vé ${code} khỏi cơ sở dữ liệu.`
    });
  } catch (err: any) {
    console.error('[Admin Delete Ticket Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa vé', error: err.message });
  }
});
