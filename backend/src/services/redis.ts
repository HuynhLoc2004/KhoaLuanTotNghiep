import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const REDIS_URI = process.env.REDIS_URI || (process.env.REDIS_HOST_PORT 
  ? `redis://:${process.env.REDIS_PASSWORD || ''}@localhost:${process.env.REDIS_HOST_PORT}`
  : 'redis://127.0.0.1:6379');

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(REDIS_URI, {
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => {
      if (times > 5) return null; // ngừng retry nếu không có Redis để không spam log
      return Math.min(times * 1000, 3000);
    },
    lazyConnect: true
  });

  redisClient.connect().then(() => {
    isRedisConnected = true;
    console.log('[Redis] Đã kết nối thành công tới Redis Caching & Queue Service!');
  }).catch((err) => {
    console.warn('[Redis Warning] Không thể kết nối tới Redis:', err.message);
    isRedisConnected = false;
  });

  redisClient.on('error', (err) => {
    if (isRedisConnected) {
      console.warn('[Redis Error]:', err.message);
    }
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
  });
} catch (initErr: any) {
  console.warn('[Redis Init Warning]:', initErr.message);
  redisClient = null;
}

/**
 * Lấy dữ liệu từ cache Redis
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redisClient || !isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

/**
 * Lưu dữ liệu vào cache Redis với thời gian sống (TTL) tính theo giây
 */
export const cacheSet = async (key: string, value: any, ttlSeconds: number = 300): Promise<boolean> => {
  if (!redisClient || !isRedisConnected) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch {
    return false;
  }
};

/**
 * Xóa cache theo key hoặc pattern
 */
export const cacheDel = async (key: string): Promise<boolean> => {
  if (!redisClient || !isRedisConnected) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch {
    return false;
  }
};

/**
 * Đẩy công việc vào hàng đợi (Task Queue)
 */
export const pushJobToQueue = async (queueName: string, jobData: any): Promise<boolean> => {
  if (!redisClient || !isRedisConnected) {
    console.log(`[Queue Fallback] Thực thi tác vụ '${queueName}' trực tiếp do không có Redis.`);
    return false;
  }
  try {
    await redisClient.rpush(`queue:${queueName}`, JSON.stringify({
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      data: jobData,
      createdAt: new Date().toISOString()
    }));
    return true;
  } catch (err: any) {
    console.warn(`[Queue Push Error]:`, err.message);
    return false;
  }
};

export const getRedisStatus = () => ({
  connected: isRedisConnected,
  uri: REDIS_URI.replace(/:[^:@]+@/, ':***@')
});

export { redisClient };
