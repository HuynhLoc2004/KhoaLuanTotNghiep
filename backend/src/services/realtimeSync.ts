import { Response, Request } from 'express';
import { redisClient } from './redis.js';

export type RealtimeEventType =
  | 'branding_updated'
  | 'rooms_updated'
  | 'artifacts_updated'
  | 'maintenance_updated'
  | 'floor_plan_updated'
  | 'ping';

export interface RealtimeEventPayload {
  type: RealtimeEventType;
  data: any;
  timestamp: string;
}

// Tập hợp các kết nối SSE đang mở của client (Trình duyệt khách & admin)
const sseClients = new Set<Response>();

// Kênh Redis Pub/Sub đa instance (Dành cho Production Docker / Cluster)
const REDIS_REALTIME_CHANNEL = 'museum:realtime_events';

let isSubscriberInitialized = false;

/**
 * Khởi tạo kênh lắng nghe Redis Pub/Sub để đồng bộ giữa các worker/container khác nhau
 */
export const initRealtimeRedisSubscriber = () => {
  if (isSubscriberInitialized || !redisClient) return;

  try {
    const subscriber = redisClient.duplicate();
    subscriber
      .connect()
      .then(() => {
        subscriber.subscribe(REDIS_REALTIME_CHANNEL, (err) => {
          if (err) {
            console.warn('[RealtimeSync] Không thể subscribe kênh Redis:', err.message);
          } else {
            console.log('[RealtimeSync] Đã kết nối kênh Redis Pub/Sub đồng bộ thời gian thực cho mọi client!');
            isSubscriberInitialized = true;
          }
        });

        subscriber.on('message', (channel, message) => {
          if (channel === REDIS_REALTIME_CHANNEL) {
            try {
              const payload: RealtimeEventPayload = JSON.parse(message);
              // Phát sóng sự kiện tới toàn bộ client SSE đang kết nối vào node này
              dispatchToLocalClients(payload);
            } catch {
              // Bỏ qua lỗi parse
            }
          }
        });
      })
      .catch((subErr) => {
        console.warn('[RealtimeSync] Không thể kết nối Redis subscriber:', subErr.message);
      });
  } catch (err: any) {
    console.warn('[RealtimeSync] Lỗi khởi tạo Redis subscriber:', err.message);
  }
};

/**
 * Gửi event tới toàn bộ client SSE của process hiện tại
 */
const dispatchToLocalClients = (payload: RealtimeEventPayload) => {
  const formatted = `event: ${payload.type}\ndata: ${JSON.stringify(payload.data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(formatted);
    } catch {
      sseClients.delete(client);
    }
  }
};

/**
 * Phát sóng sự kiện thay đổi dữ liệu thời gian thực (Real-time Broadcast)
 * - Vừa phát cho local clients (<1ms)
 * - Vừa phát qua Redis Pub/Sub để các node/worker/container khác cùng nhận
 */
export const broadcastRealtimeEvent = (type: RealtimeEventType, data: any) => {
  const payload: RealtimeEventPayload = {
    type,
    data,
    timestamp: new Date().toISOString()
  };

  // 1. Phát tức thì cho tất cả client kết nối tới instance hiện tại
  dispatchToLocalClients(payload);

  // 2. Phát qua Redis Pub/Sub cho các instance khác trên cụm server
  if (redisClient && redisClient.status === 'ready') {
    try {
      redisClient.publish(REDIS_REALTIME_CHANNEL, JSON.stringify(payload)).catch(() => {});
    } catch {
      // Ignored
    }
  }
};

/**
 * Xử lý kết nối SSE từ Client (Khách tham quan & Admin)
 * Giữ kết nối liên tục, tự động gửi dữ liệu khi admin thay đổi mà KHÔNG CẦN F5/reload
 */
export const handleRealtimeStream = (req: Request, res: Response) => {
  // Cấu hình headers chuẩn SSE (Server-Sent Events)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Quan trọng: Yêu cầu Nginx reverse proxy stream ngay lập tức, không buffer
    'Access-Control-Allow-Origin': '*'
  });

  // Gửi gói tin handshake khởi tạo kết nối
  res.write(
    `event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`
  );

  sseClients.add(res);

  // Heartbeat ping mỗi 25s để giữ kết nối không bị timeout bởi proxy / router / firewall
  const heartbeatTimer = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeatTimer);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeatTimer);
    sseClients.delete(res);
  });
};
