import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://museum_admin:change-me-rabbitmq@localhost:5672';

let connection: any = null;
let channel: any = null;
let isConnected = false;
let isConnecting = false;

export const QUEUES = {
  STITCHING: 'stitching_queue',
  ARTIFACT_3D: 'artifact_3d_queue',
  NOTIFICATIONS: 'notifications_queue'
} as const;

/**
 * Khởi tạo kết nối tới RabbitMQ Message Broker
 */
export async function connectRabbitMQ(): Promise<boolean> {
  if (isConnected && channel) return true;
  if (isConnecting) return false;

  isConnecting = true;
  try {
    console.log(`[RabbitMQ] Đang kết nối tới Message Broker tại: ${RABBITMQ_URI.replace(/:[^:@]*@/, ':****@')}...`);
    const conn = await amqp.connect(RABBITMQ_URI);
    const ch = await conn.createChannel();
    connection = conn;
    channel = ch;
    isConnected = true;
    isConnecting = false;

    console.log('[RabbitMQ] Đã kết nối thành công tới RabbitMQ Message Broker!');

    // Tự động khai báo các hàng đợi bền vững (Durable Queues)
    for (const q of Object.values(QUEUES)) {
      await ch.assertQueue(q, { durable: true });
    }

    conn.on('error', (err: any) => {
      console.warn('[RabbitMQ Connection Error]:', err?.message || err);
      isConnected = false;
      channel = null;
    });

    conn.on('close', () => {
      console.warn('[RabbitMQ Connection Closed]. Đang chờ thử kết nối lại...');
      isConnected = false;
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });

    return true;
  } catch (err: any) {
    console.warn('[RabbitMQ] Không thể kết nối RabbitMQ (sẽ tự động thử lại sau):', err.message);
    isConnected = false;
    isConnecting = false;
    setTimeout(connectRabbitMQ, 8000);
    return false;
  }
}

/**
 * Đẩy một tác vụ vào hàng đợi RabbitMQ
 */
export async function sendToRabbitMQ(queueName: string, data: any): Promise<boolean> {
  try {
    if (!channel || !isConnected) {
      await connectRabbitMQ();
    }
    if (!channel) return false;

    await channel.assertQueue(queueName, { durable: true });
    const buffer = Buffer.from(JSON.stringify(data));
    return channel.sendToQueue(queueName, buffer, {
      persistent: true,
      timestamp: Date.now()
    });
  } catch (err: any) {
    console.warn(`[RabbitMQ Push Error on ${queueName}]:`, err.message);
    return false;
  }
}

/**
 * Lắng nghe và tiêu thụ thông điệp từ hàng đợi RabbitMQ
 */
export async function consumeRabbitMQ(
  queueName: string,
  onMessage: (data: any) => Promise<boolean | void>
): Promise<void> {
  try {
    if (!channel || !isConnected) {
      await connectRabbitMQ();
    }
    if (!channel) return;

    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1); // Xử lý tuần tự từng tác vụ nặng một

    await channel.consume(queueName, async (msg: any) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        await onMessage(payload);
        channel?.ack(msg);
      } catch (err: any) {
        console.error(`[RabbitMQ Consumer Error on ${queueName}]:`, err.message);
        // Nếu lỗi không thể phục hồi, từ chối không requeue để tránh lặp vô tận
        channel?.nack(msg, false, false);
      }
    });

    console.log(`[RabbitMQ Consumer] Đã kích hoạt lắng nghe hàng đợi: ${queueName}`);
  } catch (err: any) {
    console.warn(`[RabbitMQ Consume Register Error on ${queueName}]:`, err.message);
  }
}

/**
 * Lấy trạng thái hiện tại của RabbitMQ
 */
export function getRabbitMQStatus(): { connected: boolean; uri: string } {
  return {
    connected: isConnected,
    uri: RABBITMQ_URI.replace(/:[^:@]*@/, ':****@')
  };
}
