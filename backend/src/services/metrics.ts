import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Khởi tạo Prometheus Registry
export const register = new client.Registry();

// Bổ sung các nhãn mặc định toàn cục
register.setDefaultLabels({
  app: 'museum-backend',
  environment: process.env.NODE_ENV || 'production'
});

// Tự động thu thập các chỉ số Node.js Runtime & OS (CPU, RAM, Event Loop, Garbage Collection)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_'
});

// ==============================================================================
// 1. CÁC CHỈ SỐ ĐO LƯỜNG HIỆU NĂNG MẠNG & API HTTP (APM)
// ==============================================================================

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Thời gian phản hồi của yêu cầu HTTP tính bằng giây (Duration)',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10] // Phân vị độ trễ (10ms đến 10s)
});
register.registerMetric(httpRequestDurationMicroseconds);

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Tổng số lượng yêu cầu HTTP đã tiếp nhận',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestsTotal);

// ==============================================================================
// 2. CÁC CHỈ SỐ ĐO LƯỜNG NGHIỆP VỤ BẢO TÀNG & THAM QUAN TOUR 360
// ==============================================================================

export const museumActiveVisitorsGauge = new client.Gauge({
  name: 'museum_active_visitors',
  help: 'Số lượng khách tham quan đang trực tuyến theo thời gian thực (SSE & Web)'
});
register.registerMetric(museumActiveVisitorsGauge);

export const museumArtifactViewsTotal = new client.Counter({
  name: 'museum_artifact_views_total',
  help: 'Tổng số lượt xem chi tiết & tương tác 3D xoay hiện vật',
  labelNames: ['artifact_code', 'lang']
});
register.registerMetric(museumArtifactViewsTotal);

export const museumAudioPlaysTotal = new client.Counter({
  name: 'museum_audio_plays_total',
  help: 'Tổng số lượt nghe thuyết minh Voice AI theo từng ngôn ngữ',
  labelNames: ['artifact_code', 'lang']
});
register.registerMetric(museumAudioPlaysTotal);

export const museumTicketsIssuedTotal = new client.Counter({
  name: 'museum_tickets_issued_total',
  help: 'Tổng số vé tham quan bảo tàng được tạo/đặt mua',
  labelNames: ['status', 'payment_method']
});
register.registerMetric(museumTicketsIssuedTotal);

export const museumRevenueVndTotal = new client.Counter({
  name: 'museum_revenue_vnd_total',
  help: 'Tổng doanh thu tiền vé tham quan thu được (VNĐ)'
});
register.registerMetric(museumRevenueVndTotal);

export const museumDbStatusGauge = new client.Gauge({
  name: 'museum_db_connected_status',
  help: 'Trạng thái kết nối CSDL (1: Đang trực tuyến, 0: Mất kết nối)',
  labelNames: ['service']
});
register.registerMetric(museumDbStatusGauge);

// ==============================================================================
// 3. MIDDLEWARE GHI NHẬN CHỈ SỐ CHO EXPRESS
// ==============================================================================

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Bỏ qua việc ghi log metrics cho chính endpoint /metrics hoặc /health để tránh tự gây nhiễu
  if (req.path === '/metrics' || req.path === '/api/health' || req.path === '/favicon.ico') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Chuẩn hóa đường dẫn route để tránh phân mảnh metrics do params (ví dụ: /api/artifacts/:id)
    const route = req.baseUrl || req.route?.path || req.path || 'unknown';
    const statusCode = String(res.statusCode);
    const method = req.method;

    httpRequestDurationMicroseconds
      .labels(method, route, statusCode)
      .observe(durationInSeconds);

    httpRequestsTotal
      .labels(method, route, statusCode)
      .inc();
  });

  next();
}

/**
 * Trả về nội dung metrics chuẩn Prometheus
 */
export async function getPrometheusMetrics(): Promise<string> {
  return await register.metrics();
}
