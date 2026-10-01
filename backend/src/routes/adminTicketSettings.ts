import { Router, Response } from 'express';
import crypto from 'crypto';
import { pgPool } from '../db/postgres';
import { TicketType } from '../models/TicketType';
import { TicketTimeSlot } from '../models/TicketTimeSlot';
import { Order } from '../models/Order';
import { cacheDel } from '../services/redis';
import { authenticate, requireAdmin, AuthRequest } from './auth';

export const adminTicketSettingsRouter = Router();

// Toàn bộ API yêu cầu quyền Quản trị viên
adminTicketSettingsRouter.use(authenticate, requireAdmin);

const TICKETS_CATALOG_CACHE_KEY = 'cache:tickets:catalog';

/* ==============================================================================
   1. QUẢN LÝ LOẠI VÉ VÀ BẢNG GIÁ THẬT (TICKET TYPES)
   ============================================================================== */

/**
 * GET /api/admin/ticket-settings/types
 * Lấy toàn bộ danh sách loại vé (kể cả đang bật hoặc tắt)
 */
adminTicketSettingsRouter.get('/types', async (_req: AuthRequest, res: Response) => {
  try {
    const pgRes = await pgPool.query(
      `SELECT id, code, name, price, original_price, description, benefits, is_active, display_order, created_at, updated_at
       FROM ticket_types
       ORDER BY display_order ASC, created_at ASC;`
    );

    const types = pgRes.rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      price: r.price,
      originalPrice: r.original_price || r.price,
      description: r.description || '',
      benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : (r.benefits || []),
      isActive: r.is_active,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    return res.json({ success: true, data: types });
  } catch (err: any) {
    console.error('[Admin Ticket Types GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh mục loại vé', error: err.message });
  }
});

/**
 * POST /api/admin/ticket-settings/types
 * Thêm mới loại vé tham quan
 */
adminTicketSettingsRouter.post('/types', async (req: AuthRequest, res: Response) => {
  try {
    const {
      code,
      name,
      price,
      originalPrice = 0,
      description = '',
      benefits = [],
      isActive = true,
      displayOrder = 0
    } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Mã loại vé và tên loại vé không được để trống' });
    }

    const cleanPrice = Math.max(0, parseInt(price, 10) || 0);
    const cleanOrigPrice = Math.max(0, parseInt(originalPrice, 10) || cleanPrice);
    const typeId = `tt_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const cleanCode = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Kiểm tra trùng mã
    const checkRes = await pgPool.query('SELECT id FROM ticket_types WHERE code = $1;', [cleanCode]);
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ success: false, message: `Mã loại vé "${cleanCode}" đã tồn tại trên hệ thống` });
    }

    const cleanBenefits = Array.isArray(benefits) ? benefits : [];

    // Lưu vào PostgreSQL
    await pgPool.query(
      `INSERT INTO ticket_types (
        id, code, name, price, original_price, description, benefits, is_active, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        typeId,
        cleanCode,
        name.trim(),
        cleanPrice,
        cleanOrigPrice,
        description.trim(),
        JSON.stringify(cleanBenefits),
        Boolean(isActive),
        parseInt(displayOrder, 10) || 0
      ]
    );

    // Lưu MongoDB Mirror
    await TicketType.create({
      code: cleanCode,
      name: name.trim(),
      price: cleanPrice,
      originalPrice: cleanOrigPrice,
      description: description.trim(),
      benefits: cleanBenefits,
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0
    }).catch(() => {});

    // Xóa cache Redis để Client nhận cập nhật tức thời
    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.status(201).json({
      success: true,
      message: `Đã thêm loại vé "${name}" thành công`,
      data: { id: typeId, code: cleanCode, name, price: cleanPrice }
    });
  } catch (err: any) {
    console.error('[Admin Ticket Types POST Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi thêm loại vé', error: err.message });
  }
});

/**
 * PUT /api/admin/ticket-settings/types/:id
 * Cập nhật loại vé (đơn giá, tên, mô tả, bật/tắt bán)
 */
adminTicketSettingsRouter.put('/types/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      originalPrice,
      description,
      benefits,
      isActive,
      displayOrder
    } = req.body;

    const currentRes = await pgPool.query('SELECT * FROM ticket_types WHERE id = $1;', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé cần cập nhật' });
    }

    const current = currentRes.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newPrice = price !== undefined ? Math.max(0, parseInt(price, 10) || 0) : current.price;
    const newOrigPrice = originalPrice !== undefined ? Math.max(0, parseInt(originalPrice, 10) || 0) : current.original_price;
    const newDesc = description !== undefined ? description.trim() : current.description;
    const newBenefits = Array.isArray(benefits) ? benefits : (typeof current.benefits === 'string' ? JSON.parse(current.benefits) : current.benefits);
    const newIsActive = isActive !== undefined ? Boolean(isActive) : current.is_active;
    const newDisplayOrder = displayOrder !== undefined ? parseInt(displayOrder, 10) || 0 : current.display_order;

    await pgPool.query(
      `UPDATE ticket_types 
       SET name = $1, price = $2, original_price = $3, description = $4, benefits = $5,
           is_active = $6, display_order = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8;`,
      [newName, newPrice, newOrigPrice, newDesc, JSON.stringify(newBenefits), newIsActive, newDisplayOrder, id]
    );

    await TicketType.updateOne(
      { code: current.code },
      {
        $set: {
          name: newName,
          price: newPrice,
          originalPrice: newOrigPrice,
          description: newDesc,
          benefits: newBenefits,
          isActive: newIsActive,
          displayOrder: newDisplayOrder
        }
      }
    ).catch(() => {});

    // Xóa cache Redis
    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.json({
      success: true,
      message: `Đã cập nhật loại vé "${newName}" thành công`,
      data: { id, name: newName, price: newPrice, isActive: newIsActive }
    });
  } catch (err: any) {
    console.error('[Admin Ticket Types PUT Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật loại vé', error: err.message });
  }
});

/**
 * DELETE /api/admin/ticket-settings/types/:id
 * Xóa loại vé
 */
adminTicketSettingsRouter.delete('/types/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const findRes = await pgPool.query('SELECT code, name FROM ticket_types WHERE id = $1;', [id]);
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại vé' });
    }

    const { code, name } = findRes.rows[0];

    // Kiểm tra xem đã có vé nào được phát hành thuộc loại này chưa
    const usedRes = await pgPool.query('SELECT COUNT(*)::int as count FROM museum_tickets WHERE ticket_type = $1;', [code]);
    if (usedRes.rows[0]?.count > 0) {
      // Nếu đã có vé bán ra thì không xóa cứng, chuyển sang tắt kích hoạt
      await pgPool.query('UPDATE ticket_types SET is_active = false WHERE id = $1;', [id]);
      await TicketType.updateOne({ code }, { $set: { isActive: false } }).catch(() => {});
      await cacheDel(TICKETS_CATALOG_CACHE_KEY);
      return res.json({
        success: true,
        message: `Loại vé "${name}" đã có vé phát hành nên được chuyển sang trạng thái "Ngừng kinh doanh" thay vì xóa hẳn.`
      });
    }

    await pgPool.query('DELETE FROM ticket_types WHERE id = $1;', [id]);
    await TicketType.deleteOne({ code }).catch(() => {});
    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.json({ success: true, message: `Đã xóa loại vé "${name}" thành công` });
  } catch (err: any) {
    console.error('[Admin Ticket Types DELETE Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa loại vé', error: err.message });
  }
});

/* ==============================================================================
   2. QUẢN LÝ KHUNG GIỜ THAM QUAN (TIME SLOTS)
   ============================================================================== */

/**
 * GET /api/admin/ticket-settings/slots
 */
adminTicketSettingsRouter.get('/slots', async (_req: AuthRequest, res: Response) => {
  try {
    const pgRes = await pgPool.query(
      `SELECT id, slot_name, open_time, close_time, max_capacity, is_active, display_order, created_at, updated_at
       FROM ticket_time_slots
       ORDER BY display_order ASC, created_at ASC;`
    );

    const slots = pgRes.rows.map((r: any) => ({
      id: r.id,
      slotName: r.slot_name,
      openTime: r.open_time || '08:00',
      closeTime: r.close_time || '17:00',
      maxCapacity: r.max_capacity,
      isActive: r.is_active,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    return res.json({ success: true, data: slots });
  } catch (err: any) {
    console.error('[Admin Time Slots GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách khung giờ', error: err.message });
  }
});

/**
 * POST /api/admin/ticket-settings/slots
 */
adminTicketSettingsRouter.post('/slots', async (req: AuthRequest, res: Response) => {
  try {
    const {
      slotName,
      openTime = '08:00',
      closeTime = '17:00',
      maxCapacity = 300,
      isActive = true,
      displayOrder = 0
    } = req.body;

    const finalSlotName = (slotName && slotName.trim()) 
      ? slotName.trim() 
      : `Khung giờ mở cửa: ${openTime} - ${closeTime}`;

    const slotId = `slot_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const cleanCapacity = Math.max(1, parseInt(maxCapacity, 10) || 300);

    await pgPool.query(
      `INSERT INTO ticket_time_slots (id, slot_name, open_time, close_time, max_capacity, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        slotId,
        finalSlotName,
        String(openTime || '08:00').trim(),
        String(closeTime || '17:00').trim(),
        cleanCapacity,
        Boolean(isActive),
        parseInt(displayOrder, 10) || 0
      ]
    );

    await TicketTimeSlot.create({
      slotName: finalSlotName,
      openTime: String(openTime || '08:00').trim(),
      closeTime: String(closeTime || '17:00').trim(),
      maxCapacity: cleanCapacity,
      isActive: Boolean(isActive),
      displayOrder: parseInt(displayOrder, 10) || 0
    }).catch(() => {});

    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.status(201).json({
      success: true,
      message: `Đã thêm khung giờ "${finalSlotName}" (${openTime} - ${closeTime})`,
      data: {
        id: slotId,
        slotName: finalSlotName,
        openTime,
        closeTime,
        maxCapacity: cleanCapacity
      }
    });
  } catch (err: any) {
    console.error('[Admin Time Slots POST Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi thêm khung giờ', error: err.message });
  }
});

/**
 * PUT /api/admin/ticket-settings/slots/:id
 */
adminTicketSettingsRouter.put('/slots/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { slotName, openTime, closeTime, maxCapacity, isActive, displayOrder } = req.body;

    const findRes = await pgPool.query('SELECT * FROM ticket_time_slots WHERE id = $1;', [id]);
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ' });
    }

    const current = findRes.rows[0];
    const newOpen = openTime !== undefined ? String(openTime).trim() : (current.open_time || '08:00');
    const newClose = closeTime !== undefined ? String(closeTime).trim() : (current.close_time || '17:00');
    const newName = slotName !== undefined && slotName.trim()
      ? slotName.trim()
      : (current.slot_name || `Khung giờ mở cửa: ${newOpen} - ${newClose}`);
    const newCapacity = maxCapacity !== undefined ? Math.max(1, parseInt(maxCapacity, 10) || 300) : current.max_capacity;
    const newActive = isActive !== undefined ? Boolean(isActive) : current.is_active;
    const newOrder = displayOrder !== undefined ? parseInt(displayOrder, 10) || 0 : current.display_order;

    await pgPool.query(
      `UPDATE ticket_time_slots 
       SET slot_name = $1, open_time = $2, close_time = $3, max_capacity = $4, is_active = $5, display_order = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7;`,
      [newName, newOpen, newClose, newCapacity, newActive, newOrder, id]
    );

    await TicketTimeSlot.updateOne(
      { slotName: current.slot_name },
      {
        $set: {
          slotName: newName,
          openTime: newOpen,
          closeTime: newClose,
          maxCapacity: newCapacity,
          isActive: newActive,
          displayOrder: newOrder
        }
      }
    ).catch(() => {});

    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.json({ success: true, message: `Đã cập nhật khung giờ "${newName}" (${newOpen} - ${newClose})` });
  } catch (err: any) {
    console.error('[Admin Time Slots PUT Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật khung giờ', error: err.message });
  }
});

/**
 * DELETE /api/admin/ticket-settings/slots/:id
 */
adminTicketSettingsRouter.delete('/slots/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const findRes = await pgPool.query('SELECT slot_name FROM ticket_time_slots WHERE id = $1;', [id]);
    if (findRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khung giờ' });
    }

    const { slot_name } = findRes.rows[0];
    await pgPool.query('DELETE FROM ticket_time_slots WHERE id = $1;', [id]);
    await TicketTimeSlot.deleteOne({ slotName: slot_name }).catch(() => {});
    await cacheDel(TICKETS_CATALOG_CACHE_KEY);

    return res.json({ success: true, message: `Đã xóa khung giờ "${slot_name}"` });
  } catch (err: any) {
    console.error('[Admin Time Slots DELETE Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi xóa khung giờ', error: err.message });
  }
});

/* ==============================================================================
   3. QUẢN LÝ LỊCH SỬ ĐƠN HÀNG & DOANH THU PAYOS (ORDERS)
   ============================================================================== */

/**
 * GET /api/admin/ticket-settings/orders
 * Danh sách toàn bộ đơn hàng bán vé có phân trang, lọc trạng thái và tìm kiếm
 */
adminTicketSettingsRouter.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const {
      status = 'all',
      search = '',
      page = 1,
      limit = 10
    } = req.query as any;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (status && status !== 'all') {
      conditions.push(`o.status = $${idx++}`);
      values.push(status);
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(o.customer_name) LIKE $${idx} OR
        LOWER(o.customer_email) LIKE $${idx} OR
        o.customer_phone LIKE $${idx} OR
        CAST(o.order_code AS TEXT) LIKE $${idx}
      )`);
      values.push(q);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Đếm tổng số bản ghi
    const countRes = await pgPool.query(
      `SELECT COUNT(*)::int as total FROM orders o ${whereClause};`,
      values
    );
    const total = countRes.rows[0]?.total || 0;

    // Lấy dữ liệu danh sách đơn hàng kèm chi tiết items
    const ordersRes = await pgPool.query(
      `SELECT o.*,
              COALESCE(json_agg(oi.*) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++};`,
      [...values, limitNum, offset]
    );

    // Tính thống kê đơn hàng
    const statsRes = await pgPool.query(
      `SELECT 
         COUNT(*)::int as total_orders,
         COUNT(*) FILTER (WHERE status = 'paid')::int as paid_orders,
         COUNT(*) FILTER (WHERE status = 'pending')::int as pending_orders,
         COUNT(*) FILTER (WHERE status = 'expired' OR status = 'cancelled')::int as expired_orders,
         COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0)::int as total_revenue
       FROM orders;`
    );
    const statsRow = statsRes.rows[0] || {};

    const orders = ordersRes.rows.map((r: any) => ({
      id: r.id,
      orderCode: Number(r.order_code),
      userId: r.user_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      totalAmount: r.total_amount,
      status: r.status,
      paymentMethod: r.payment_method,
      checkoutUrl: r.checkout_url,
      qrCodeData: r.qr_code_data,
      paidAt: r.paid_at,
      expiresAt: r.expires_at,
      createdAt: r.created_at,
      items: r.items || []
    }));

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      stats: {
        totalOrders: statsRow.total_orders || 0,
        paidOrders: statsRow.paid_orders || 0,
        pendingOrders: statsRow.pending_orders || 0,
        expiredOrders: statsRow.expired_orders || 0,
        totalRevenue: statsRow.total_revenue || 0
      }
    });
  } catch (err: any) {
    console.error('[Admin Orders GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách đơn hàng', error: err.message });
  }
});
