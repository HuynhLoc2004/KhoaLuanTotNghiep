import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully to Redis Cache/Store");
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

export async function setJobStatus(jobId: string, status: string, progress: number, details?: Record<string, any>) {
  const key = `job:${jobId}`;
  await redis.hset(key, {
    status,
    progress: progress.toString(),
    updatedAt: new Date().toISOString(),
    details: details ? JSON.stringify(details) : "",
  });
}

export async function getJobStatus(jobId: string) {
  const key = `job:${jobId}`;
  const data = await redis.hgetall(key);
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  return {
    jobId,
    status: data.status,
    progress: parseInt(data.progress || "0", 10),
    updatedAt: data.updatedAt,
    details: data.details ? JSON.parse(data.details) : null,
  };
}
