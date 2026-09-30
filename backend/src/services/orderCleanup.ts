import { pgPool } from '../db/postgres';
import { Order } from '../models/Order';
import { cancelPayOSPaymentLink } from './payos';

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Quét và dọn dẹp các đơn hàng quá hạn thanh toán (Pending > 15 phút)
 * Chống spam đơn ảo giữ chỗ, bảo vệ tài nguyên hệ thống và tự động hủy link thanh toán PayOS
 */
export const runOrderCleanup = async () => {
  try {
    const now = new Date();

    // 1. Quét đơn hàng trong PostgreSQL Primary
    const pgRes = await pgPool.query(
      `SELECT id, order_code, customer_email, created_at, expires_at 
       FROM orders 
       WHERE status = 'pending' AND expires_at <= $1
       LIMIT 50;`,
      [now]
    );

    if (pgRes.rows.length > 0) {
      const expiredIds = pgRes.rows.map((r: any) => r.id);
      
      // Cập nhật trạng thái thành 'expired'
      await pgPool.query(
        `UPDATE orders 
         SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ANY($1::varchar[]);`,
        [expiredIds]
      );

      // Cập nhật MongoDB Mirror
      await Order.updateMany(
        { orderCode: { $in: pgRes.rows.map((r: any) => Number(r.order_code)) }, status: 'pending' },
        { $set: { status: 'expired' } }
      ).catch(() => {});

      // Hủy liên kết thanh toán trên cổng PayOS song song
      for (const row of pgRes.rows) {
        cancelPayOSPaymentLink(Number(row.order_code), 'Đơn hàng quá hạn thanh toán 15 phút').catch(() => {});
      }

      console.log(`[Order Cleanup] Đã tự động dọn dẹp ${pgRes.rows.length} đơn hàng quá hạn thanh toán.`);
    }

    // 2. Quét dự phòng thêm trong MongoDB Mirror nếu có
    const mongoExpired = await Order.find({
      status: 'pending',
      expiresAt: { $lte: now }
    }).limit(50).lean();

    if (mongoExpired.length > 0) {
      const mongoCodes = mongoExpired.map((o) => o.orderCode);
      await Order.updateMany(
        { orderCode: { $in: mongoCodes } },
        { $set: { status: 'expired' } }
      ).catch(() => {});
    }
  } catch (err: any) {
    // Không làm sập tiến trình nền nếu CSDL bận
    console.warn('[Order Cleanup Warning]:', err.message);
  }
};

/**
 * Khởi động tiến trình dọn dẹp định kỳ (Mỗi 60 giây chạy 1 lần)
 */
export const startOrderCleanupJob = (intervalMs: number = 60000) => {
  if (cleanupInterval) return;
  console.log(`[Order Cleanup Service] Đã kích hoạt cơ chế dọn dẹp đơn hàng rác/quá hạn (chu kỳ ${intervalMs / 1000}s).`);
  // Chạy ngay 1 lần khi server start
  runOrderCleanup().catch(() => {});
  cleanupInterval = setInterval(runOrderCleanup, intervalMs);
};

export const stopOrderCleanupJob = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};
