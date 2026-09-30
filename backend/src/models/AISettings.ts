import mongoose, { Schema, Document } from 'mongoose';
import { cacheGet, cacheSet } from '../services/redis.js';
import { pgPool } from '../db/postgres.js';

export interface IAISettingsData {
  id: string;
  isActive: boolean;
  provider: 'gemini' | 'openai' | 'custom';
  modelName: string;
  apiKey?: string;
  temperature: number;
  systemPrompt: string;
  maxTokens: number;
  antiSpamCooldownSec: number;
  maxRequestsPerMinute: number;
  updatedAt: Date;
  updatedBy: string;
}

export interface IAISettings extends IAISettingsData, Document {}

const AISettingsSchema = new Schema<IAISettings>(
  {
    id: { type: String, default: 'default_ai_settings', unique: true },
    isActive: { type: Boolean, default: true },
    provider: { type: String, enum: ['gemini', 'openai', 'custom'], default: 'gemini' },
    modelName: { type: String, default: 'gemini-2.5-flash' },
    apiKey: { type: String, default: '' },
    temperature: { type: Number, default: 0.4, min: 0, max: 1 },
    systemPrompt: {
      type: String,
      default:
        'Bạn là Trợ lý Di sản Ảo của Bảo tàng Lịch sử TP. Hồ Chí Minh. Nhiệm vụ của bạn là giải đáp thông tin, hướng dẫn du khách tham quan các gian phòng 360°, giới thiệu chi tiết các cổ vật, hiện vật lịch sử và cung cấp thông tin vé, giờ mở cửa một cách lịch sự, trang trọng và chính xác tuyệt đối dựa trên cơ sở dữ liệu của bảo tàng.'
    },
    maxTokens: { type: Number, default: 1024 },
    antiSpamCooldownSec: { type: Number, default: 3 },
    maxRequestsPerMinute: { type: Number, default: 15 },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'Admin' }
  },
  { collection: 'ai_settings', timestamps: false }
);

export const AISettingsModel = mongoose.model<IAISettings>('AISettings', AISettingsSchema);

export interface IAIVisitorInquiry extends Document {
  visitorName: string;
  visitorContact: string;
  message: string;
  topic: string;
  status: 'pending' | 'responded' | 'archived';
  createdAt: Date;
}

const AIVisitorInquirySchema = new Schema<IAIVisitorInquiry>(
  {
    visitorName: { type: String, default: 'Khách tham quan' },
    visitorContact: { type: String, default: '' },
    message: { type: String, required: true },
    topic: { type: String, default: 'general' },
    status: { type: String, enum: ['pending', 'responded', 'archived'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  },
  { collection: 'ai_visitor_inquiries' }
);

export const AIVisitorInquiryModel = mongoose.model<IAIVisitorInquiry>('AIVisitorInquiry', AIVisitorInquirySchema);

const CACHE_KEY = 'cache:ai_settings';

export async function getAISettings(): Promise<IAISettingsData> {
  // 1. Thử lấy từ Redis
  try {
    const cached = await cacheGet<IAISettingsData>(CACHE_KEY);
    if (cached) {
      return cached;
    }
  } catch {}

  // 2. Thử lấy từ MongoDB
  try {
    let settings = await AISettingsModel.findOne({ id: 'default_ai_settings' }).lean();
    if (!settings) {
      const created = await AISettingsModel.create({
        id: 'default_ai_settings',
        isActive: true,
        provider: 'gemini',
        modelName: process.env.AI_MODEL || 'gemini-2.5-flash',
        apiKey: process.env.GEMINI_API_KEY || '',
        temperature: 0.4,
        maxTokens: 1024,
        antiSpamCooldownSec: 3,
        maxRequestsPerMinute: 15
      });
      settings = created.toObject();
    }

    try {
      await cacheSet(CACHE_KEY, settings, 3600);
    } catch {}

    return settings as unknown as IAISettingsData;
  } catch (err) {
    console.warn('[AISettings DB Fallback]:', err);
    return {
      id: 'default_ai_settings',
      isActive: true,
      provider: 'gemini',
      modelName: process.env.AI_MODEL || 'gemini-2.5-flash',
      apiKey: process.env.GEMINI_API_KEY || '',
      temperature: 0.4,
      systemPrompt: 'Bạn là Trợ lý Di sản Ảo của Bảo tàng Lịch sử TP. Hồ Chí Minh.',
      maxTokens: 1024,
      antiSpamCooldownSec: 3,
      maxRequestsPerMinute: 15,
      updatedAt: new Date(),
      updatedBy: 'System'
    };
  }
}

export async function saveAISettings(data: Partial<IAISettingsData>, updatedBy = 'Admin'): Promise<IAISettingsData> {
  const payload = {
    ...data,
    updatedAt: new Date(),
    updatedBy
  };

  const updatedDoc = await AISettingsModel.findOneAndUpdate(
    { id: 'default_ai_settings' },
    { $set: payload },
    { upsert: true, new: true }
  ).lean();

  const updated = (updatedDoc || payload) as IAISettingsData;

  try {
    await pgPool.query(
      `
      INSERT INTO ai_settings (id, is_active, provider, model_name, api_key, temperature, system_prompt, max_tokens, anti_spam_cooldown_sec, max_requests_per_minute, updated_at, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        provider = EXCLUDED.provider,
        model_name = EXCLUDED.model_name,
        api_key = EXCLUDED.api_key,
        temperature = EXCLUDED.temperature,
        system_prompt = EXCLUDED.system_prompt,
        max_tokens = EXCLUDED.max_tokens,
        anti_spam_cooldown_sec = EXCLUDED.anti_spam_cooldown_sec,
        max_requests_per_minute = EXCLUDED.max_requests_per_minute,
        updated_at = EXCLUDED.updated_at,
        updated_by = EXCLUDED.updated_by
    `,
      [
        'default_ai_settings',
        updated.isActive ?? true,
        updated.provider || 'gemini',
        updated.modelName || 'gemini-2.5-flash',
        updated.apiKey || '',
        updated.temperature ?? 0.4,
        updated.systemPrompt || '',
        updated.maxTokens || 1024,
        updated.antiSpamCooldownSec || 3,
        updated.maxRequestsPerMinute || 15,
        updated.updatedAt || new Date(),
        updated.updatedBy || 'Admin'
      ]
    );
  } catch (pgErr) {
    console.warn('[PostgreSQL AI Settings Sync Warning]:', pgErr);
  }

  try {
    await cacheSet(CACHE_KEY, updated, 3600);
  } catch {}

  return updated;
}
