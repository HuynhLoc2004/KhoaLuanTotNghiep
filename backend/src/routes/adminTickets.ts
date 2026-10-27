import { Router, Response } from 'express';
import { Ticket } from '../models/Ticket.js';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertTicket, pgDeleteTicket } from '../db/syncEngine.js';
import { esSearchTickets, esIndexTicket, esDeleteTicket } from '../services/elasticsearch.js';
import { getPayOSPaymentInfo } from '../services/payos.js';
import { processOrderPaymentSuccess } from './tickets.js';

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

    // Tự động đối chiếu tự phục hồi (Self-Healing):
    // Quét các đơn hàng pending gần nhất trực tiếp qua cổng PayOS để kích hoạt vé nếu đã thanh toán
    try {
      const recentPendingOrders = await pgPool.query(
        `SELECT order_code, id, total_amount 
         FROM orders 
         WHERE status = 'pending' 
           AND created_at >= NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC 
         LIMIT 10;`
      );

      for (const pOrder of recentPendingOrders.rows) {
        try {
          const pInfo = await getPayOSPaymentInfo(Number(pOrder.order_code));
          if (pInfo && (pInfo.status === 'PAID' || pInfo.amountPaid >= Number(pOrder.total_amount))) {
            await processOrderPaymentSuccess(Number(pOrder.order_code), pOrder);
          }
        } catch {}
      }

      // Kích hoạt vé cho các đơn hàng status = 'paid' nhưng chưa kịp lưu vào museum_tickets
      const paidWithoutTickets = await pgPool.query(
        `SELECT o.order_code, o.id 
         FROM orders o
         LEFT JOIN museum_tickets mt ON mt.order_id = o.id
         WHERE o.status = 'paid' AND mt.id IS NULL
         GROUP BY o.id, o.order_code
         LIMIT 10;`
      );

      for (const pOrder of paidWithoutTickets.rows) {
        await processOrderPaymentSuccess(Number(pOrder.order_code));
      }
    } catch (healErr: any) {
      console.warn('[Admin Tickets Heal Warning]:', healErr.message);
    }

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
          COUNT(*) FILTER (WHERE (status = 'paid' OR status = 'active') AND status != 'used' AND status != 'cancelled')::int as active,
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

    // Fallback thống kê từ MongoDB nếu stats từ PostgreSQL rỗng
    if (stats.totalTickets === 0) {
      try {
        const [mTotal, mActive, mUsed, mCancelled, mRevenueAgg] = await Promise.all([
          Ticket.countDocuments({}),
          Ticket.countDocuments({ status: 'paid' }),
          Ticket.countDocuments({ status: 'used' }),
          Ticket.countDocuments({ status: 'cancelled' }),
          Ticket.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ])
        ]);
        stats = {
          totalTickets: mTotal,
          activeTickets: mActive,
          usedTickets: mUsed,
          cancelledTickets: mCancelled,
          totalRevenue: mRevenueAgg[0]?.total || 0
        };
      } catch {}
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
 * Giao thức phân tích & thẩm định tính hợp lệ của chuỗi mã QR
 */
interface QRParseResult {
  isValidTicketFormat: boolean;
  ticketCode: string;
  alienType?: 'VIETQR' | 'ZALO' | 'SOCIAL' | 'EXTERNAL_URL' | 'WIFI' | 'VCARD' | 'UNKNOWN_FORMAT' | 'INVALID_SYSTEM_BILL';
  alienMessage?: string;
}

/**
 * Trích xuất và kiểm duyệt mã QR chuyên sâu:
 * - CHỈ chấp nhận mã QR vé thuộc hệ thống Bảo tàng Lịch sử (chuẩn BTLS-YYYY-XXXXXX, tk_..., JSON vé BTLS)
 * - TỪ CHỐI & PHÁT HIỆN RÕ RÀNG mã QR thanh toán ngân hàng (VietQR), Zalo, Mạng xã hội, Wifi, Web ngoài...
 */
function parseTicketCodeFromQR(raw: string): QRParseResult {
  if (!raw || typeof raw !== 'string') {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'UNKNOWN_FORMAT',
      alienMessage: 'Dữ liệu quét mã QR rỗng hoặc không đọc được.'
    };
  }
  const trimmed = raw.trim();

  // 1. Nhận diện QR Ngân hàng / VietQR / Chuyển khoản (Chuẩn EMVCo bắt đầu bằng 000201)
  if (trimmed.startsWith('000201') || /vietqr\.net|napas|vnpay|zalopay\.vn|momo\.vn|payos/i.test(trimmed)) {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'VIETQR',
      alienMessage: 'Mã QR thanh toán ngân hàng (VietQR / Ví điện tử). Cổng soát vé chỉ chấp nhận mã QR in trên vé tham quan do Bảo tàng phát hành.'
    };
  }

  // 2. Nhận diện QR liên kết Zalo
  if (/zalo\.me|zaloapp\.com/i.test(trimmed)) {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'ZALO',
      alienMessage: 'Mã QR liên kết Zalo cá nhân / nhóm. Cổng soát vé chỉ chấp nhận mã QR in trên vé tham quan của Bảo tàng.'
    };
  }

  // 3. Nhận diện liên kết mạng xã hội khác
  if (/facebook\.com|fb\.me|m\.me|tiktok\.com|instagram\.com|t\.me/i.test(trimmed)) {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'SOCIAL',
      alienMessage: 'Mã QR liên kết mạng xã hội. Vui lòng quét mã QR trên vé tham quan do Bảo tàng phát hành.'
    };
  }

  // 4. Nhận diện Wifi hoặc danh bạ vCard
  if (/^WIFI:/i.test(trimmed)) {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'WIFI',
      alienMessage: 'Mã QR cấu hình Wi-Fi. Vui lòng quét mã QR trên vé tham quan.'
    };
  }
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    return {
      isValidTicketFormat: false,
      ticketCode: '',
      alienType: 'VCARD',
      alienMessage: 'Mã QR danh bạ liên hệ (vCard). Vui lòng quét mã QR trên vé tham quan.'
    };
  }

  // 5. Nếu là chuỗi JSON vé do hệ thống Bảo tàng sinh ra
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const code = parsed.code || parsed.ticket || parsed.ticketCode || parsed.id;
      if (code && typeof code === 'string') {
        const cleanCode = code.trim().toUpperCase();
        if (/^BTLS-\d{4}-[A-Z0-9]+$/i.test(cleanCode) || /^TK_\d+_[A-Z0-9]+$/i.test(cleanCode) || parsed.museum === 'BTLS_TPHCM') {
          return { isValidTicketFormat: true, ticketCode: cleanCode };
        }
      }
      // Hỗ trợ đơn hàng / hóa đơn hệ thống bảo tàng
      const order = parsed.order || parsed.orderCode || parsed.order_code;
      if (order && (parsed.museum === 'BTLS_TPHCM' || parsed.system === 'BTLS' || /^\d{6,12}$/.test(String(order)))) {
        return { isValidTicketFormat: true, ticketCode: String(order).trim() };
      }
      return {
        isValidTicketFormat: false,
        ticketCode: '',
        alienType: 'INVALID_SYSTEM_BILL',
        alienMessage: 'Mã QR không thuộc hệ thống vé hoặc hóa đơn chính thức của Bảo tàng Lịch sử TP.HCM.'
      };
    } catch {}
  }

  // 6. Nếu là URL trang web
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const tParam = url.searchParams.get('ticket') || url.searchParams.get('ticketCode') || url.searchParams.get('code');
      if (tParam && (/BTLS-\d{4}-[A-Z0-9]+/i.test(tParam) || /TK_\d+_[A-Z0-9]+/i.test(tParam))) {
        return { isValidTicketFormat: true, ticketCode: tParam.trim().toUpperCase() };
      }
      // Hóa đơn thanh toán hoặc xác nhận vé từ hệ thống
      const oParam = url.searchParams.get('orderCode') || url.searchParams.get('order');
      if (oParam && (url.hostname.includes('museum') || url.hostname.includes('duckdns') || url.hostname.includes('localhost') || /^\d{6,12}$/.test(oParam))) {
        return { isValidTicketFormat: true, ticketCode: oParam.trim() };
      }
      const matchInPath = url.pathname.match(/BTLS-\d{4}-[A-Z0-9]+/i) || url.pathname.match(/TK_\d+_[A-Z0-9]+/i);
      if (matchInPath) {
        return { isValidTicketFormat: true, ticketCode: matchInPath[0].toUpperCase() };
      }
      return {
        isValidTicketFormat: false,
        ticketCode: '',
        alienType: 'INVALID_SYSTEM_BILL',
        alienMessage: `Liên kết website ngoài (${url.hostname}). Cổng soát vé chỉ chấp nhận mã vé hoặc hóa đơn chính thức của Bảo tàng Lịch sử TP.HCM.`
      };
    } catch {}
  }

  // 7. Mã vé thuần chuẩn bảo tàng (VD: BTLS-2026-688D37 hoặc tk_...)
  const btlsMatch = trimmed.match(/^BTLS-\d{4}-[A-Z0-9]+$/i);
  if (btlsMatch) {
    return { isValidTicketFormat: true, ticketCode: btlsMatch[0].toUpperCase() };
  }
  const tkMatch = trimmed.match(/^TK_\d+_[A-Z0-9]+$/i);
  if (tkMatch) {
    return { isValidTicketFormat: true, ticketCode: tkMatch[0].toUpperCase() };
  }
  // Hóa đơn số đơn hàng: BTLS-ORDER-123456 hoặc Đơn hàng #123456 hoặc số orderCode 6-12 số
  const orderMatch = trimmed.match(/^(?:BTLS-ORDER-|ORDER#?|HD-)?(\d{6,12})$/i) || trimmed.match(/Đơn hàng #?(\d{6,12})/i);
  if (orderMatch && orderMatch[1]) {
    return { isValidTicketFormat: true, ticketCode: orderMatch[1] };
  }

  // 8. Các trường hợp chuỗi ký tự bất kỳ không thuộc cấu trúc vé
  return {
    isValidTicketFormat: false,
    ticketCode: '',
    alienType: 'INVALID_SYSTEM_BILL',
    alienMessage: 'Mã QR không hợp lệ. Cổng soát vé chỉ chấp nhận mã vé hoặc hóa đơn chính thức của Bảo tàng Lịch sử TP.HCM.'
  };
}

/**
 * POST /api/admin/tickets/verify-qr
 * Quét mã QR soát vé & Kiểm tra gian lận toàn diện:
 * - Giải mã chuỗi QR (chỉ chấp nhận vé hệ thống, chặn VietQR, Zalo...)
 * - Kiểm tra trạng thái thanh toán
 * - Kiểm tra tình trạng sử dụng (vé đã vào cổng thì chuyển sang used, không được quét lại)
 * - Kiểm tra hạn sử dụng & ngày tham quan
 * - Tự động cập nhật vé sang 'used' (nếu autoCheckin = true)
 */
adminTicketsRouter.post('/verify-qr', async (req: AuthRequest, res: Response) => {
  try {
    const { qrData, autoCheckin = true } = req.body;
    if (!qrData || typeof qrData !== 'string') {
      return res.status(200).json({
        success: false,
        valid: false,
        reason: 'INVALID_INPUT',
        message: 'Dữ liệu quét mã QR rỗng hoặc không hợp lệ.'
      });
    }

    const parseResult = parseTicketCodeFromQR(qrData);
    if (!parseResult.isValidTicketFormat || !parseResult.ticketCode) {
      return res.status(200).json({
        success: false,
        valid: false,
        reason: parseResult.alienType || 'INVALID_SYSTEM_BILL',
        message: parseResult.alienMessage || 'Mã QR không hợp lệ. Cổng soát vé chỉ chấp nhận vé hoặc hóa đơn của Bảo tàng Lịch sử TP.HCM.'
      });
    }

    const ticketCode = parseResult.ticketCode;

    // 1. Tìm vé trong PostgreSQL
    let ticket: any = null;
    let pgRes = await pgPool.query(
      `SELECT * FROM museum_tickets WHERE UPPER(ticket_code) = UPPER($1) OR id = $1 LIMIT 1;`,
      [ticketCode]
    );

    if (pgRes.rows.length > 0) {
      ticket = pgRes.rows[0];
    } else {
      // Tìm theo mã hóa đơn / đơn hàng
      pgRes = await pgPool.query(
        `SELECT * FROM museum_tickets WHERE order_id = $1 OR notes LIKE $2 OR notes LIKE $3 ORDER BY created_at DESC LIMIT 1;`,
        [ticketCode, `%#${ticketCode}%`, `%${ticketCode}%`]
      );
      if (pgRes.rows.length > 0) {
        ticket = pgRes.rows[0];
      }
    }

    if (!ticket) {
      // Fallback sang MongoDB
      let mongoDoc = await Ticket.findOne({
        $or: [
          { ticketCode: { $regex: new RegExp(`^${ticketCode}$`, 'i') } },
          { _id: ticketCode },
          { id: ticketCode }
        ]
      }).lean();

      if (!mongoDoc) {
        mongoDoc = await Ticket.findOne({
          $or: [
            { orderId: ticketCode },
            { notes: { $regex: new RegExp(`#?${ticketCode}`, 'i') } }
          ]
        }).sort({ createdAt: -1 }).lean();
      }

      if (mongoDoc) {
        ticket = {
          id: mongoDoc._id.toString(),
          ticket_code: mongoDoc.ticketCode,
          user_name: mongoDoc.userName,
          user_email: mongoDoc.userEmail,
          user_phone: mongoDoc.userPhone,
          ticket_type: mongoDoc.ticketType,
          ticket_title: mongoDoc.ticketTitle,
          quantity: mongoDoc.quantity,
          unit_price: mongoDoc.unitPrice,
          total_amount: mongoDoc.totalAmount,
          visit_date: mongoDoc.visitDate,
          time_slot: mongoDoc.timeSlot,
          status: mongoDoc.status,
          payment_method: mongoDoc.paymentMethod,
          created_at: mongoDoc.createdAt,
          updated_at: mongoDoc.updatedAt
        };
      }
    }

    // 2. Không tìm thấy vé trong hệ thống
    if (!ticket) {
      return res.status(200).json({
        success: false,
        valid: false,
        reason: 'NOT_FOUND',
        message: `Mã vé hoặc hóa đơn [${ticketCode}] không tồn tại trên hệ thống Bảo tàng. Vui lòng kiểm tra lại vé!`,
        ticketCode
      });
    }

    const ticketInfo = {
      id: ticket.id,
      ticketCode: ticket.ticket_code || ticketCode,
      userName: ticket.user_name || 'Khách tham quan',
      userEmail: ticket.user_email || '',
      userPhone: ticket.user_phone || '',
      ticketType: ticket.ticket_type,
      ticketTitle: ticket.ticket_title || 'Vé Tham Quan Tiêu Chuẩn',
      quantity: ticket.quantity || 1,
      totalAmount: ticket.total_amount || 0,
      visitDate: ticket.visit_date ? new Date(ticket.visit_date).toISOString().split('T')[0] : '',
      timeSlot: ticket.time_slot || '08:00 - 11:30',
      status: ticket.status,
      checkedInAt: ticket.status === 'used' ? ticket.updated_at : null
    };

    // 3. Kiểm tra vé đã qua sử dụng (ALREADY_USED) - Ưu tiên hàng đầu chống tái sử dụng
    if (ticket.status === 'used') {
      const usedTime = ticket.updated_at
        ? new Date(ticket.updated_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        : 'trước đó';
      return res.status(200).json({
        success: true,
        valid: false,
        reason: 'ALREADY_USED',
        message: `Vé [${ticketInfo.ticketCode}] đã qua sử dụng vào lúc ${usedTime}. Không thể quét lại!`,
        ticket: ticketInfo
      });
    }

    // 4. Kiểm tra vé đã bị hủy (CANCELLED)
    if (ticket.status === 'cancelled') {
      return res.status(200).json({
        success: true,
        valid: false,
        reason: 'CANCELLED',
        message: `Vé [${ticketInfo.ticketCode}] đã bị hủy bỏ trên hệ thống, không được phép vào cổng!`,
        ticket: ticketInfo
      });
    }

    // 5. Kiểm tra trạng thái thanh toán (UNPAID)
    if (ticket.status !== 'paid' && ticket.status !== 'active') {
      return res.status(200).json({
        success: true,
        valid: false,
        reason: 'UNPAID',
        message: `Vé [${ticketInfo.ticketCode}] chưa được xác nhận thanh toán (trạng thái: ${ticket.status})!`,
        ticket: ticketInfo
      });
    }

    // 6. Kiểm tra hạn sử dụng & ngày tham quan (EXPIRED / FUTURE_DATE)
    const now = new Date();
    // Chuẩn ngày Việt Nam UTC+7 YYYY-MM-DD
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
    const visitDateStr = ticketInfo.visitDate;

    if (visitDateStr && visitDateStr < todayStr) {
      return res.status(200).json({
        success: true,
        valid: false,
        reason: 'EXPIRED',
        message: `Vé đã quá hạn sử dụng (ngày tham quan: ${visitDateStr}, hôm nay: ${todayStr})!`,
        ticket: ticketInfo
      });
    }

    if (visitDateStr && visitDateStr > todayStr) {
      return res.status(200).json({
        success: true,
        valid: false,
        reason: 'FUTURE_DATE',
        message: `Vé chưa đến ngày tham quan (ngày đặt: ${visitDateStr}, hôm nay: ${todayStr})!`,
        ticket: ticketInfo
      });
    }

    // 7. VÉ HỢP LỆ! Thực hiện soát vé và chuyển trạng thái sang 'used'
    if (autoCheckin) {
      const targetId = ticket.id;
      const targetCode = ticket.ticket_code || ticketCode;
      const targetMongoId = ticket.mongo_id;

      await pgPool.query(
        `UPDATE museum_tickets 
         SET status = 'used', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 OR UPPER(ticket_code) = UPPER($2);`,
        [targetId, targetCode]
      );

      try {
        await Ticket.updateOne(
          {
            $or: [
              { ticketCode: targetCode },
              { ticketCode: { $regex: new RegExp(`^${targetCode}$`, 'i') } },
              ...(targetId ? [{ _id: targetId }, { id: targetId }] : []),
              ...(targetMongoId ? [{ _id: targetMongoId }] : [])
            ]
          },
          { $set: { status: 'used', updatedAt: new Date() } }
        );
      } catch {}

      // Đồng bộ Elasticsearch nếu có
      try {
        await esIndexTicket({
          ticketCode: targetCode,
          userName: ticketInfo.userName,
          userEmail: ticketInfo.userEmail,
          userPhone: ticketInfo.userPhone,
          ticketType: ticketInfo.ticketType || 'standard',
          visitDate: ticketInfo.visitDate,
          status: 'used'
        });
      } catch {}

      ticketInfo.status = 'used';
      ticketInfo.checkedInAt = new Date().toISOString();

      try {
        await logAudit('CHECKIN_TICKET_QR', 'tickets', {
          userId: req.user?.id,
          username: req.user?.username,
          details: { ticketCode: targetCode, method: 'QR_SCANNER' }
        });
      } catch {}

      return res.json({
        success: true,
        valid: true,
        reason: 'CHECKED_IN_SUCCESS',
        message: `Vé hợp lệ. Đã soát vé vào cổng cho [${ticketInfo.userName}].`,
        ticket: ticketInfo
      });
    }

    return res.json({
      success: true,
      valid: true,
      reason: 'VALID',
      message: `Vé hợp lệ và sẵn sàng vào cổng cho [${ticketInfo.userName}].`,
      ticket: ticketInfo
    });
  } catch (err: any) {
    console.error('[Admin Verify QR Error]:', err);
    return res.status(500).json({
      success: false,
      valid: false,
      reason: 'SERVER_ERROR',
      message: 'Lỗi máy chủ khi kiểm tra mã QR: ' + err.message
    });
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
    const targetId = ticket.id;
    const targetCode = ticket.ticket_code || code;
    await pgPool.query(
      "UPDATE museum_tickets SET status = 'used', updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR UPPER(ticket_code) = UPPER($2);",
      [targetId, targetCode]
    );

    // 3. Cập nhật vào MongoDB
    await Ticket.updateOne(
      { $or: [{ ticketCode: targetCode }, { _id: targetId }, { id: targetId }] },
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
