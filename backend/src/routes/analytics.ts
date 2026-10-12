import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { pgPool } from '../db/postgres.js';
import { Ticket } from '../models/Ticket.js';
import { Room } from '../models/Room.js';
import { ArtifactModel as Artifact } from '../models/Artifact.js';
import { User } from '../models/User.js';
import { SystemLogModel as SystemLog } from '../models/SystemLog.js';

export const analyticsRouter = Router();

// Toàn bộ API Thống kê bắt buộc quyền Quản trị viên (Admin)
analyticsRouter.use(authenticate, requireAdmin);

interface DateRange {
  start: Date;
  end: Date;
}

function calculateDateRange(timeRange: string, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  let start = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (timeRange === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  } else if (timeRange === 'week') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
  } else if (timeRange === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (timeRange === 'year') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (timeRange === 'custom' && customStart) {
    start = new Date(customStart);
    if (isNaN(start.getTime())) start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (customEnd) {
      end = new Date(customEnd);
      if (isNaN(end.getTime())) end = now;
      else end.setHours(23, 59, 59, 999);
    }
  } else {
    // 'all'
    start = new Date(2020, 0, 1, 0, 0, 0, 0);
  }

  return { start, end };
}

function fillTimelineBuckets(
  timeRange: string,
  start: Date,
  end: Date,
  rawItems: { dateLabel: string; tickets: number; checkins: number; revenue: number }[]
) {
  const map = new Map<string, { tickets: number; checkins: number; revenue: number }>();
  rawItems.forEach((item) => {
    map.set(item.dateLabel, {
      tickets: item.tickets,
      checkins: item.checkins,
      revenue: item.revenue
    });
  });

  const filled: { dateLabel: string; tickets: number; checkins: number; revenue: number }[] = [];

  if (timeRange === 'today') {
    for (let h = 8; h <= 17; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      const val = map.get(label) || { tickets: 0, checkins: 0, revenue: 0 };
      filled.push({ dateLabel: label, ...val });
    }
  } else if (timeRange === 'week' || timeRange === 'month' || timeRange === 'custom') {
    const cur = new Date(start);
    cur.setHours(0, 0, 0, 0);
    const stop = new Date(end);
    stop.setHours(23, 59, 59, 999);

    while (cur <= stop) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      const label = `${yyyy}-${mm}-${dd}`;
      const val = map.get(label) || { tickets: 0, checkins: 0, revenue: 0 };
      filled.push({ dateLabel: label, ...val });
      cur.setDate(cur.getDate() + 1);
    }
  } else if (timeRange === 'year') {
    const yyyy = start.getFullYear();
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, '0');
      const label = `${yyyy}-${mm}`;
      const val = map.get(label) || { tickets: 0, checkins: 0, revenue: 0 };
      filled.push({ dateLabel: label, ...val });
    }
  } else {
    return rawItems;
  }

  return filled;
}

/**
 * GET /api/analytics
 * Thống kê tổng hợp toàn diện bám sát dữ liệu thực tế 100% của hệ thống bảo tàng & Tour 360°
 */
analyticsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const timeRange = (req.query.timeRange as string) || 'month';
    const customStart = req.query.startDate as string;
    const customEnd = req.query.endDate as string;

    const { start, end } = calculateDateRange(timeRange, customStart, customEnd);

    // ========================================================
    // 1. THỐNG KÊ VÉ & DOANH THU THỰC TẾ (POSTGRESQL / MONGODB)
    // ========================================================
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let totalTicketsUsed = 0;
    let activeTickets = 0;
    let cancelledTickets = 0;
    let timeline: any[] = [];
    let ticketsByType: any[] = [];
    let paymentMethods: any[] = [];
    let recentTickets: any[] = [];

    let hasPgData = false;

    try {
      // 1.1 KPI Vé từ PostgreSQL
      const kpiRes = await pgPool.query(
        `SELECT 
           COUNT(*) as total_count,
           COALESCE(SUM(total_amount), 0) as total_rev,
           COUNT(*) FILTER (WHERE status = 'used') as used_count,
           COUNT(*) FILTER (WHERE status = 'paid') as active_count,
           COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count
         FROM museum_tickets
         WHERE created_at >= $1 AND created_at <= $2;`,
        [start, end]
      );

      if (kpiRes.rows.length > 0) {
        const row = kpiRes.rows[0];
        totalTicketsSold = parseInt(row.total_count, 10) || 0;
        totalRevenue = parseInt(row.total_rev, 10) || 0;
        totalTicketsUsed = parseInt(row.used_count, 10) || 0;
        activeTickets = parseInt(row.active_count, 10) || 0;
        cancelledTickets = parseInt(row.cancelled_count, 10) || 0;
        hasPgData = true;
      }

      // 1.2 Biểu đồ chuỗi thời gian (Timeline)
      let timeGroupSql = "TO_CHAR(created_at, 'YYYY-MM-DD')";
      if (timeRange === 'today') {
        timeGroupSql = "TO_CHAR(created_at, 'HH24:00')";
      } else if (timeRange === 'year' || timeRange === 'all') {
        timeGroupSql = "TO_CHAR(created_at, 'YYYY-MM')";
      }

      const timelineRes = await pgPool.query(
        `SELECT 
           ${timeGroupSql} as date_label,
           COUNT(*) as tickets,
           COUNT(*) FILTER (WHERE status = 'used') as checkins,
           COALESCE(SUM(total_amount), 0) as revenue
         FROM museum_tickets
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY date_label
         ORDER BY date_label ASC;`,
        [start, end]
      );

      const rawTimeline = timelineRes.rows.map((r: any) => ({
        dateLabel: r.date_label,
        tickets: parseInt(r.tickets, 10) || 0,
        checkins: parseInt(r.checkins, 10) || 0,
        revenue: parseInt(r.revenue, 10) || 0
      }));

      timeline = fillTimelineBuckets(timeRange, start, end, rawTimeline);

      // 1.3 Phân bổ theo loại vé (Tickets by Type)
      const typeRes = await pgPool.query(
        `SELECT 
           ticket_type,
           COALESCE(ticket_title, ticket_type) as title,
           COUNT(*) as count,
           COALESCE(SUM(total_amount), 0) as revenue
         FROM museum_tickets
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY ticket_type, title
         ORDER BY revenue DESC;`,
        [start, end]
      );

      ticketsByType = typeRes.rows.map((r: any) => {
        const count = parseInt(r.count, 10) || 0;
        const rev = parseInt(r.revenue, 10) || 0;
        return {
          typeCode: r.ticket_type,
          title: r.title,
          count,
          revenue: rev,
          percentage: totalRevenue > 0 ? Number(((rev / totalRevenue) * 100).toFixed(1)) : 0
        };
      });

      // 1.4 Phân bổ theo phương thức thanh toán
      const payRes = await pgPool.query(
        `SELECT 
           COALESCE(payment_method, 'Khác') as method,
           COUNT(*) as count,
           COALESCE(SUM(total_amount), 0) as revenue
         FROM museum_tickets
         WHERE created_at >= $1 AND created_at <= $2
         GROUP BY method
         ORDER BY revenue DESC;`,
        [start, end]
      );

      paymentMethods = payRes.rows.map((r: any) => {
        const count = parseInt(r.count, 10) || 0;
        const rev = parseInt(r.revenue, 10) || 0;
        return {
          method: r.method,
          count,
          revenue: rev,
          percentage: totalRevenue > 0 ? Number(((rev / totalRevenue) * 100).toFixed(1)) : 0
        };
      });

      // 1.5 20 Vé gần nhất
      const recentRes = await pgPool.query(
        `SELECT id, ticket_code, user_name, user_email, user_phone, ticket_type, ticket_title,
                quantity, unit_price, total_amount, visit_date, time_slot, status, payment_method, created_at
         FROM museum_tickets
         WHERE created_at >= $1 AND created_at <= $2
         ORDER BY created_at DESC
         LIMIT 20;`,
        [start, end]
      );

      recentTickets = recentRes.rows.map((r: any) => ({
        id: r.id,
        ticketCode: r.ticket_code,
        userName: r.user_name || 'Khách vãng lai',
        userEmail: r.user_email,
        userPhone: r.user_phone,
        ticketType: r.ticket_type,
        ticketTitle: r.ticket_title,
        quantity: r.quantity,
        unitPrice: r.unit_price,
        totalAmount: r.total_amount,
        visitDate: r.visit_date,
        timeSlot: r.time_slot,
        status: r.status,
        paymentMethod: r.payment_method,
        createdAt: r.created_at
      }));
    } catch (pgErr: any) {
      console.warn('[Analytics API Postgres Fallback to MongoDB]:', pgErr.message);
    }

    // Fallback sang MongoDB nếu PostgreSQL chưa có dữ liệu hoặc lỗi kết nối
    if (!hasPgData) {
      const mongoTickets = await Ticket.find({
        createdAt: { $gte: start, $lte: end }
      }).lean();

      totalTicketsSold = mongoTickets.length;
      totalRevenue = mongoTickets.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      totalTicketsUsed = mongoTickets.filter((t) => t.status === 'used').length;
      activeTickets = mongoTickets.filter((t) => t.status === 'paid').length;
      cancelledTickets = mongoTickets.filter((t) => t.status === 'cancelled').length;

      // Group by date
      const dateMap = new Map<string, { tickets: number; checkins: number; revenue: number }>();
      mongoTickets.forEach((t) => {
        const d = new Date(t.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const cur = dateMap.get(key) || { tickets: 0, checkins: 0, revenue: 0 };
        cur.tickets += 1;
        if (t.status === 'used') cur.checkins += 1;
        cur.revenue += t.totalAmount || 0;
        dateMap.set(key, cur);
      });

      const rawMongoTimeline = Array.from(dateMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dateLabel, val]) => ({
          dateLabel,
          ...val
        }));

      timeline = fillTimelineBuckets(timeRange, start, end, rawMongoTimeline);

      recentTickets = mongoTickets.slice(0, 20).map((t) => ({
        id: t._id,
        ticketCode: t.ticketCode,
        userName: t.userName || 'Khách vãng lai',
        userEmail: t.userEmail,
        userPhone: t.userPhone,
        ticketType: t.ticketType,
        ticketTitle: t.ticketTitle,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        totalAmount: t.totalAmount,
        visitDate: t.visitDate,
        timeSlot: t.timeSlot,
        status: t.status,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt
      }));
    }

    const checkinRate = totalTicketsSold > 0 ? Number(((totalTicketsUsed / totalTicketsSold) * 100).toFixed(1)) : 0;

    // ========================================================
    // 2. THỐNG KÊ TOUR 360 & GIAN PHÒNG THỰC TẾ (ROOMS)
    // ========================================================
    const allRooms = await Room.find().lean();
    const totalRooms = allRooms.length;
    let totalHotspots = 0;
    const roomsList = allRooms.map((r: any) => {
      const hotspotsCount = Array.isArray(r.hotspots) ? r.hotspots.length : 0;
      totalHotspots += hotspotsCount;
      return {
        id: r.id || String(r._id),
        code: r.code || '',
        name: r.name || 'Gian phòng chưa đặt tên',
        period: r.period || 'Tiến trình Lịch sử VN',
        category: r.category || '',
        hotspotsCount,
        qrScanCount: r.qrScanCount || 0,
        active: r.active !== false,
        createdAt: r.createdAt || new Date()
      };
    });

    // ========================================================
    // 3. THỐNG KÊ HIỆN VẬT & BẢO VẬT 3D (ARTIFACTS)
    // ========================================================
    const allArtifacts = await Artifact.find().lean();
    const totalArtifacts = allArtifacts.length;
    const total3DArtifacts = allArtifacts.filter(
      (a: any) => a.model3dUrl && typeof a.model3dUrl === 'string' && a.model3dUrl.trim().length > 0
    ).length;

    // Gom nhóm hiện vật theo thời kỳ lịch sử
    const periodMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();

    allArtifacts.forEach((a: any) => {
      const p = a.period || 'Khác';
      periodMap.set(p, (periodMap.get(p) || 0) + 1);

      const c = a.category || 'Cổ vật di sản';
      categoryMap.set(c, (categoryMap.get(c) || 0) + 1);
    });

    const artifactsByPeriod = Array.from(periodMap.entries()).map(([period, count]) => ({
      period,
      count
    }));

    const artifactsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));

    const artifactsList = allArtifacts.map((a: any) => ({
      id: a.id || String(a._id),
      code: a.code || '',
      name: a.name || 'Hiện vật di sản',
      period: a.period || 'Khác',
      category: a.category || 'Cổ vật di sản',
      has3D: !!(a.model3dUrl && typeof a.model3dUrl === 'string' && a.model3dUrl.trim().length > 0),
      status: a.status || 'active',
      createdAt: a.createdAt || new Date()
    }));

    // ========================================================
    // 4. THỐNG KÊ NGƯỜI DÙNG & HOẠT ĐỘNG HỆ THỐNG
    // ========================================================
    const totalUsers = await User.countDocuments();
    let totalSystemLogs = 0;
    try {
      totalSystemLogs = await SystemLog.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
    } catch {}

    return res.json({
      success: true,
      data: {
        timeRange,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        kpis: {
          totalRevenue,
          totalTicketsSold,
          totalTicketsUsed,
          activeTickets,
          cancelledTickets,
          checkinRate,
          totalRooms,
          totalHotspots,
          totalArtifacts,
          total3DArtifacts,
          totalUsers,
          totalSystemLogs
        },
        timeline,
        ticketsByType,
        paymentMethods,
        rooms: roomsList,
        artifacts: artifactsList,
        artifactsByPeriod,
        artifactsByCategory,
        recentTickets
      }
    });
  } catch (err: any) {
    console.error('[Analytics API Error]:', err);
    return res.status(500).json({
      success: false,
      message: `Lỗi tính toán báo cáo thống kê: ${err.message}`
    });
  }
});
