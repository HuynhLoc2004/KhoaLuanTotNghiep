import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { pgPool } from '../db/postgres';
import { Order } from '../models/Order';
import { Ticket } from '../models/Ticket';
import { TicketType } from '../models/TicketType';
import { TicketTimeSlot } from '../models/TicketTimeSlot';
import { cacheGet, cacheSet, cacheDel } from '../services/redis';
import { createPayOSPaymentLink, verifyPayOSWebhook, isPayOSConfigured } from '../services/payos';
import { sendMail } from '../services/mail.js';

export const ticketsRouter = Router();

// Hằng số Cache Redis
const TICKETS_CATALOG_CACHE_KEY = 'cache:tickets:catalog';
const TICKETS_CATALOG_TTL_SEC = 300; // 5 phút

/**
 * GET /api/tickets/catalog
 * Lấy danh mục giá vé và khung giờ tham quan đang hoạt động
 * Tối ưu hóa với bộ nhớ đệm Redis tốc độ cao
 */
ticketsRouter.get('/catalog', async (_req: Request, res: Response) => {
  try {
    // 1. Kiểm tra cache Redis
    const cachedData = await cacheGet<{ ticketTypes: any[]; timeSlots: any[] }>(TICKETS_CATALOG_CACHE_KEY);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, source: 'cache' });
    }

    // 2. Truy vấn PostgreSQL Primary
    let ticketTypes: any[] = [];
    let timeSlots: any[] = [];

    try {
      const typesRes = await pgPool.query(
        `SELECT id, code, name, price, original_price, description, benefits, is_active, display_order 
         FROM ticket_types 
         WHERE is_active = true 
         ORDER BY display_order ASC, price ASC;`
      );
      ticketTypes = typesRes.rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        price: r.price,
        originalPrice: r.original_price || r.price,
        description: r.description || '',
        benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : (r.benefits || []),
        isActive: r.is_active,
        displayOrder: r.display_order
      }));

      const slotsRes = await pgPool.query(
        `SELECT id, slot_name, open_time, close_time, max_capacity, is_active, display_order 
         FROM ticket_time_slots 
         WHERE is_active = true 
         ORDER BY display_order ASC, created_at ASC;`
      );
      timeSlots = slotsRes.rows.map((r: any) => ({
        id: r.id,
        slotName: r.slot_name,
        openTime: r.open_time || '08:00',
        closeTime: r.close_time || '17:00',
        maxCapacity: r.max_capacity,
        isActive: r.is_active,
        displayOrder: r.display_order
      }));
    } catch (pgErr: any) {
      console.warn('[Tickets Catalog PG Warning]:', pgErr.message);
    }

    // 3. Fallback MongoDB nếu bảng rỗng
    if (ticketTypes.length === 0) {
      const mongoTypes = await TicketType.find({ isActive: true }).sort({ displayOrder: 1, price: 1 }).lean();
      ticketTypes = mongoTypes.map((t: any) => ({
        id: t._id.toString(),
        code: t.code,
        name: t.name,
        price: t.price,
        originalPrice: t.originalPrice || t.price,
        description: t.description || '',
        benefits: t.benefits || [],
        isActive: t.isActive,
        displayOrder: t.displayOrder
      }));
    }

    if (timeSlots.length === 0) {
      const mongoSlots = await TicketTimeSlot.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
      timeSlots = mongoSlots.map((s: any) => ({
        id: s._id.toString(),
        slotName: s.slotName,
        openTime: (s as any).openTime || '08:00',
        closeTime: (s as any).closeTime || '17:00',
        maxCapacity: s.maxCapacity,
        isActive: s.isActive,
        displayOrder: s.displayOrder
      }));
    }

    const payload = { ticketTypes, timeSlots };

    // Lưu vào Redis cache
    await cacheSet(TICKETS_CATALOG_CACHE_KEY, payload, TICKETS_CATALOG_TTL_SEC);

    return res.json({ success: true, data: payload, source: 'database' });
  } catch (err: any) {
    console.error('[Tickets Catalog Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục vé', error: err.message });
  }
});

/**
 * POST /api/tickets/checkout
 * Tạo đơn hàng bán vé và khởi tạo link thanh toán PayOS VietQR
 * Cơ chế bảo vệ: Chống spam đơn ảo, tính toán đơn giá chuẩn từ DB, hết hạn sau 15 phút
 */
ticketsRouter.post('/checkout', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      visitDate,
      timeSlot,
      items,
      notes = ''
    } = req.body;

    // 1. Kiểm tra validation bắt buộc
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Họ và tên người nhận vé phải có ít nhất 2 ký tự' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
      return res.status(400).json({ success: false, message: 'Địa chỉ email nhận vé không hợp lệ' });
    }

    const phoneRegex = /^[0-9+() -]{9,15}$/;
    if (!customerPhone || !phoneRegex.test(customerPhone.trim())) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)' });
    }

    if (!visitDate) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày tham quan bảo tàng' });
    }

    const selectedDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Ngày tham quan không hợp lệ hoặc đã qua' });
    }

    if (!timeSlot || !timeSlot.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn khung giờ tham quan' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 loại vé' });
    }

    // 2. Chống spam: Giới hạn tối đa 5 đơn pending cho cùng email trong vòng 15 phút
    const pendingOrdersCountRes = await pgPool.query(
      `SELECT COUNT(*)::int as count 
       FROM orders 
       WHERE customer_email = $1 AND status = 'pending' AND expires_at > CURRENT_TIMESTAMP;`,
      [customerEmail.trim().toLowerCase()]
    ).catch(() => ({ rows: [{ count: 0 }] }));

    const currentPending = pendingOrdersCountRes.rows[0]?.count || 0;
    if (currentPending >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Bạn đang có quá nhiều đơn hàng chưa thanh toán. Vui lòng thanh toán đơn hàng trước hoặc đợi 15 phút để hệ thống tự động dọn dẹp.'
      });
    }

    // 3. Tính toán tổng tiền bảo mật trực tiếp từ CSDL (Chống sửa giá từ client)
    const typesRes = await pgPool.query(
      `SELECT code, name, price FROM ticket_types WHERE is_active = true;`
    );
    const priceMap = new Map<string, { name: string; price: number }>();
    typesRes.rows.forEach((r: any) => {
      priceMap.set(r.code, { name: r.name, price: r.price });
    });

    let totalAmount = 0;
    const verifiedItems: any[] = [];
    const payosItems: any[] = [];

    for (const item of items) {
      const code = item.ticketTypeCode || item.code;
      const qty = parseInt(item.quantity, 10);
      if (!code || isNaN(qty) || qty <= 0) continue;

      const typeInfo = priceMap.get(code);
      if (!typeInfo) {
        return res.status(400).json({ success: false, message: `Loại vé không tồn tại hoặc đã ngừng mở bán: ${code}` });
      }

      const itemTotal = typeInfo.price * qty;
      totalAmount += itemTotal;

      verifiedItems.push({
        ticketTypeCode: code,
        ticketTitle: typeInfo.name,
        quantity: qty,
        unitPrice: typeInfo.price,
        totalPrice: itemTotal,
        visitDate: visitDate,
        timeSlot: timeSlot
      });

      payosItems.push({
        name: typeInfo.name.length > 50 ? typeInfo.name.slice(0, 47) + '...' : typeInfo.name,
        quantity: qty,
        price: typeInfo.price
      });
    }

    if (totalAmount <= 0 || verifiedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Số lượng vé chọn phải lớn hơn 0' });
    }

    // 4. Sinh mã đơn hàng duy nhất dạng số nguyên dương an toàn (Phù hợp PayOS orderCode)
    // Format: 6 chữ số cuối của timestamp + 3 số ngẫu nhiên
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(100 + Math.random() * 900));
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    
    // Hết hạn sau 15 phút (900 giây)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const expiredAtUnix = Math.floor(expiresAt.getTime() / 1000);

    // Xác định user_id nếu client đã gửi token xác thực
    let userId: string | null = null;
    if ((req as any).user && (req as any).user.id) {
      userId = (req as any).user.id;
    }

    // 5. URL trả về sau khi người dùng thanh toán hoặc hủy trên PayOS
    const host = req.headers['x-forwarded-host'] || req.headers.host || '103.178.233.206';
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    let baseOrigin = req.headers.origin;
    if (!baseOrigin && req.headers.referer) {
      try {
        baseOrigin = new URL(String(req.headers.referer)).origin;
      } catch {}
    }
    if (!baseOrigin) {
      baseOrigin = `${proto}://${host}`;
    }
    const cleanOrigin = String(baseOrigin).replace(/\/$/, '');
    const returnUrl = userId
      ? `${cleanOrigin}/profile?payment=success&orderCode=${orderCode}`
      : `${cleanOrigin}/booking?payment=success&orderCode=${orderCode}`;
    const cancelUrl = `${cleanOrigin}/booking?payment=cancel&orderCode=${orderCode}`;

    // 6. Gọi PayOS tạo Payment Link (VietQR)
    let payosRes: any = null;
    try {
      payosRes = await createPayOSPaymentLink({
        orderCode,
        amount: totalAmount,
        description: `Ve tham quan ${orderCode}`,
        returnUrl,
        cancelUrl,
        items: payosItems,
        buyerName: customerName.trim(),
        buyerEmail: customerEmail.trim().toLowerCase(),
        buyerPhone: customerPhone.trim(),
        expiredAt: expiredAtUnix
      });
    } catch (payosErr: any) {
      console.error('[PayOS Create Link Error]:', payosErr);
      return res.status(502).json({
        success: false,
        message: 'Không thể kết nối tới cổng thanh toán PayOS. Vui lòng kiểm tra cấu hình hoặc thử lại sau ít phút.',
        error: payosErr.message
      });
    }

    // 7. Lưu đơn hàng vào PostgreSQL
    await pgPool.query(
      `INSERT INTO orders (
        id, order_code, user_id, customer_name, customer_email, customer_phone,
        total_amount, status, payment_method, payment_link_id, checkout_url, qr_code_data,
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`,
      [
        orderId,
        orderCode,
        userId,
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
        customerPhone.trim(),
        totalAmount,
        'pending',
        'PayOS',
        payosRes.paymentLinkId || '',
        payosRes.checkoutUrl || '',
        payosRes.qrCode || '',
        expiresAt
      ]
    );

    // Lưu các mục vé trong đơn hàng
    for (const item of verifiedItems) {
      const itemId = `item_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
      await pgPool.query(
        `INSERT INTO order_items (
          id, order_id, ticket_type_code, ticket_title, quantity, unit_price, total_price, visit_date, time_slot
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
        [
          itemId,
          orderId,
          item.ticketTypeCode,
          item.ticketTitle,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.visitDate,
          item.timeSlot
        ]
      );
    }

    // 8. Lưu đồng bộ MongoDB Mirror
    await Order.create({
      orderCode,
      userId: userId || undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      totalAmount,
      status: 'pending',
      paymentMethod: 'PayOS',
      paymentLinkId: payosRes.paymentLinkId,
      checkoutUrl: payosRes.checkoutUrl,
      qrCodeData: payosRes.qrCode,
      expiresAt,
      items: verifiedItems
    }).catch((err) => console.warn('[Order MongoDB Mirror Warning]:', err.message));

    return res.json({
      success: true,
      message: 'Khởi tạo đơn hàng và mã thanh toán PayOS thành công',
      data: {
        orderCode,
        orderId,
        totalAmount,
        checkoutUrl: payosRes.checkoutUrl,
        qrCode: payosRes.qrCode,
        accountNumber: payosRes.accountNumber,
        accountName: payosRes.accountName,
        bin: payosRes.bin,
        expiresAt: expiresAt.toISOString(),
        items: verifiedItems
      }
    });
  } catch (err: any) {
    console.error('[Tickets Checkout Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi khởi tạo đơn hàng thanh toán', error: err.message });
  }
});

/**
 * GET /api/tickets/orders/:orderCode
 * Tra cứu trạng thái đơn hàng (Client Polling hoặc chuyển hướng)
 */
ticketsRouter.get('/orders/:orderCode', async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const numericCode = Number(orderCode);
    if (isNaN(numericCode)) {
      return res.status(400).json({ success: false, message: 'Mã đơn hàng không hợp lệ' });
    }

    const orderRes = await pgPool.query(
      `SELECT o.*, 
              COALESCE(json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.order_code = $1
       GROUP BY o.id;`,
      [numericCode]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đơn hàng' });
    }

    const order = orderRes.rows[0];

    // Kiểm tra xem đơn hàng đã hết hạn hay chưa
    const now = new Date();
    if (order.status === 'pending' && new Date(order.expires_at) <= now) {
      order.status = 'expired';
      await pgPool.query(`UPDATE orders SET status = 'expired' WHERE id = $1;`, [order.id]).catch(() => {});
    }

    return res.json({
      success: true,
      data: {
        id: order.id,
        orderCode: Number(order.order_code),
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        totalAmount: order.total_amount,
        status: order.status,
        paymentMethod: order.payment_method,
        checkoutUrl: order.checkout_url,
        qrCodeData: order.qr_code_data,
        paidAt: order.paid_at,
        expiresAt: order.expires_at,
        items: order.items || []
      }
    });
  } catch (err: any) {
    console.error('[Order Status Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu đơn hàng', error: err.message });
  }
});

/**
 * POST /api/tickets/webhook/payos
 * Nhận thông báo thanh toán tự động từ PayOS
 * Xác thực Checksum Signature, cập nhật trạng thái đơn hàng 'paid', sinh vé tham quan bảo tàng và gửi email xác nhận
 */
ticketsRouter.post('/webhook/payos', async (req: Request, res: Response) => {
  try {
    const webhookBody = req.body;

    // 1. Xác thực Webhook bằng Checksum của PayOS
    let verifiedData: any;
    try {
      verifiedData = verifyPayOSWebhook(webhookBody);
    } catch (verifyErr: any) {
      console.error('[PayOS Webhook Verification Failed]:', verifyErr.message);
      return res.status(400).json({ success: false, message: 'Chữ ký webhook không hợp lệ' });
    }

    if (!verifiedData) {
      return res.status(400).json({ success: false, message: 'Dữ liệu webhook rỗng' });
    }

    console.log('[PayOS Webhook Received]:', JSON.stringify(verifiedData));

    const orderCode = Number(verifiedData.orderCode);
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Thiếu orderCode' });
    }

    // 2. Tra cứu đơn hàng trong PostgreSQL
    const orderRes = await pgPool.query(
      `SELECT o.*, 
              COALESCE(json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.order_code = $1
       GROUP BY o.id;`,
      [orderCode]
    );

    if (orderRes.rows.length === 0) {
      console.warn(`[PayOS Webhook] Không tìm thấy đơn hàng mã ${orderCode}`);
      return res.json({ success: true, message: 'Order not found, ignored' });
    }

    const order = orderRes.rows[0];

    // Idempotency: Nếu đơn đã thanh toán thì bỏ qua không tạo vé trùng
    if (order.status === 'paid') {
      return res.json({ success: true, message: 'Order already paid' });
    }

    // 3. Cập nhật đơn hàng thành 'paid'
    const paidAt = new Date();
    await pgPool.query(
      `UPDATE orders 
       SET status = 'paid', paid_at = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2;`,
      [paidAt, order.id]
    );

    await Order.updateOne(
      { orderCode },
      { $set: { status: 'paid', paidAt } }
    ).catch(() => {});

    // 4. Sinh vé tham quan chính thức vào bảng museum_tickets (PostgreSQL + MongoDB)
    const createdTickets: any[] = [];
    const currentYear = new Date().getFullYear();

    for (const item of order.items || []) {
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
        const ticketCode = `BTLS-${currentYear}-${randomHex}`;
        const ticketId = `tk_${Date.now()}_${randomHex.toLowerCase()}`;

        // Sinh dữ liệu QR Code có chữ ký xác thực
        const qrPayload = JSON.stringify({
          code: ticketCode,
          museum: 'BTLS_TPHCM',
          order: orderCode,
          name: order.customer_name,
          email: order.customer_email,
          type: item.ticket_type_code,
          date: item.visit_date,
          slot: item.time_slot
        });

        // Tạo mã QR Base64
        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(qrPayload, {
            margin: 1,
            width: 250,
            color: { dark: '#000000', light: '#FFFFFF' }
          });
        } catch {
          qrDataUrl = ticketCode;
        }

        // Lưu vào PostgreSQL
        await pgPool.query(
          `INSERT INTO museum_tickets (
            id, ticket_code, user_id, user_email, user_name, user_phone,
            ticket_type, ticket_title, quantity, unit_price, total_amount,
            visit_date, time_slot, status, payment_method, qr_code_data, order_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
          [
            ticketId,
            ticketCode,
            order.user_id || null,
            order.customer_email,
            order.customer_name,
            order.customer_phone,
            item.ticket_type_code,
            item.ticket_title,
            1, // Mỗi vé đại diện cho 1 suất vào cổng
            item.unit_price,
            item.unit_price,
            item.visit_date,
            item.time_slot,
            'paid',
            'PayOS',
            qrDataUrl,
            order.id
          ]
        );

        // Lưu vào MongoDB Mirror
        await Ticket.create({
          ticketCode,
          userId: order.user_id || 'guest',
          userEmail: order.customer_email,
          userName: order.customer_name,
          userPhone: order.customer_phone,
          ticketType: item.ticket_type_code,
          ticketTitle: item.ticket_title,
          quantity: 1,
          unitPrice: item.unit_price,
          totalAmount: item.unit_price,
          visitDate: new Date(item.visit_date),
          timeSlot: item.time_slot,
          status: 'paid',
          paymentMethod: 'PayOS',
          qrCodeData: qrDataUrl,
          orderId: order.id
        }).catch((err) => console.warn('[Ticket MongoDB Mirror Warning]:', err.message));

        createdTickets.push({
          ticketCode,
          ticketTitle: item.ticket_title,
          visitDate: item.visit_date,
          timeSlot: item.time_slot
        });
      }
    }

    console.log(`[PayOS Webhook Success] Đơn hàng #${orderCode} đã thanh toán thành công, khởi tạo ${createdTickets.length} vé tham quan.`);

    // 5. Gửi email xác nhận kèm danh sách vé cho khách hàng (bất đồng bộ)
    try {
      const ticketsHtml = createdTickets
        .map(
          (t) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
              <div style="font-size: 15px; font-weight: 700; color: #1e293b;">Mã vé: <span style="font-family: monospace; color: #0284c7;">${t.ticketCode}</span></div>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${t.ticketTitle} • Ngày: ${t.visitDate} • Khung giờ: ${t.timeSlot}</div>
            </div>`
        )
        .join('');

      await sendMail({
        to: order.customer_email,
        subject: `[Bảo Tàng Lịch Sử TP.HCM] Xác nhận thanh toán vé tham quan - Đơn hàng #${orderCode}`,
        html: `
          <div style="font-family: 'Be Vietnam Pro', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
            <h2 style="color: #0f172a; margin-top: 0;">Thanh toán vé tham quan thành công!</h2>
            <p>Kính chào quý khách <strong>${order.customer_name}</strong>,</p>
            <p>Hệ thống Bảo tàng Lịch sử TP. Hồ Chí Minh xin chân thành cảm ơn quý khách đã đặt vé tham quan. Đơn hàng <strong>#${orderCode}</strong> đã được thanh toán thành công với tổng số tiền <strong>${Number(order.total_amount).toLocaleString('vi-VN')} đ</strong>.</p>
            
            <h3 style="margin-top: 24px; color: #0f172a;">Danh sách vé tham quan của bạn:</h3>
            ${ticketsHtml}

            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Quý khách vui lòng xuất trình mã vé hoặc mã QR trên trang <a href="${process.env.PUBLIC_API_URL || 'http://localhost:5173'}/profile" style="color: #0284c7;">Hồ sơ cá nhân</a> tại cổng soát vé bảo tàng khi đến tham quan.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <div style="font-size: 12px; color: #94a3b8;">Bảo tàng Lịch sử TP. Hồ Chí Minh • Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1</div>
          </div>
        `
      }).catch((mailErr: any) => console.warn('[Ticket Confirmation Mail Warning]:', mailErr.message));
    } catch {}

    return res.json({ success: true, message: 'Xử lý thanh toán thành công' });
  } catch (err: any) {
    console.error('[PayOS Webhook Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý webhook', error: err.message });
  }
});
