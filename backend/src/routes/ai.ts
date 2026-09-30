import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from './auth.js';
import { getAISettings, saveAISettings, AIVisitorInquiryModel } from '../models/AISettings.js';
import {
  executeAIChat,
  testAIModelConnection,
  submitVisitorInquiryToAdmin
} from '../services/aiService.js';

export const aiRouter = Router();

// Tiện ích mask API key để bảo vệ bí mật khi gửi về client
function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

/**
 * GET /api/ai/topics
 * Trả về danh sách các lựa chọn chủ đề nhanh (Check Radio) cho khách tham quan
 */
aiRouter.get('/topics', (req: Request, res: Response) => {
  res.json({
    topics: [
      {
        id: 'artifacts',
        label: 'Hiện vật & Cổ vật',
        description: 'Tra cứu thông tin, niên đại và chiêm ngưỡng mô hình 3D cổ vật',
        icon: 'Crown'
      },
      {
        id: 'rooms',
        label: 'Không gian 360°',
        description: 'Tham quan các phòng trưng bày qua góc nhìn thực tế ảo',
        icon: 'Compass'
      },
      {
        id: 'tickets_info',
        label: 'Vé & Tham quan',
        description: 'Giá vé, khung giờ mở cửa, tuyến xe buýt và gửi xe',
        icon: 'Ticket'
      },
      {
        id: 'general',
        label: 'Hỏi đáp tự do',
        description: 'Hỏi đáp kiến thức lịch sử, văn hóa và bảo tàng',
        icon: 'Sparkles'
      },
      {
        id: 'contact_admin',
        label: 'Liên hệ Ban Quản lý',
        description: 'Kết nối trực tiếp hoặc gửi yêu cầu tới Ban Quản lý Bảo tàng',
        icon: 'Headphones'
      }
    ]
  });
});

/**
 * Helper kiểm tra và làm sạch chuỗi chống Prompt Injection, XSS và SQL Injection
 */
function sanitizeInput(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Xóa thẻ HTML/Script tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/onload=|onerror=|onclick=/gi, '')
    .trim();
}

const DANGEROUS_SQL_PATTERNS = [
  /(\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE)\b\s+)/i,
  /(--|\/\*|\*\/|;|\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i
];

function containsDangerousInjection(str: string): boolean {
  if (!str) return false;
  // Kiểm tra pattern SQL injection nguy hiểm
  for (const pattern of DANGEROUS_SQL_PATTERNS) {
    if (pattern.test(str)) return true;
  }
  return false;
}

/**
 * Tự động nhận diện provider từ tên model
 */
function inferProviderFromModelName(name: string): 'gemini' | 'openai' | 'custom' {
  const lower = (name || '').toLowerCase().trim();
  if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3') || lower.startsWith('chatgpt')) {
    return 'openai';
  }
  return 'gemini';
}

/**
 * POST /api/ai/chat
 * Endpoint chính cho du khách tương tác với Trợ lý AI (Có kiểm soát chống spam & lọc Injection)
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, topic = 'general', history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Câu hỏi vượt quá giới hạn 500 ký tự. Vui lòng rút gọn nội dung.' });
    }

    // Làm sạch câu hỏi, loại bỏ script và mã độc hại
    const cleanMessage = sanitizeInput(message);
    if (!cleanMessage) {
      return res.status(400).json({ error: 'Nội dung câu hỏi chứa ký tự không hợp lệ.' });
    }

    // Lấy IP của người gửi để chống spam
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

    // Làm sạch topic
    const safeTopic = ['general', 'artifacts', 'rooms', 'tickets_info', 'contact_admin'].includes(topic) ? topic : 'general';

    // Làm sạch history (chống payload injection qua mảng lịch sử)
    const safeHistory: Array<{ role: 'model' | 'user'; text: string }> = Array.isArray(history)
      ? history.slice(-6).map((h: any) => ({
          role: (h?.role === 'model' ? 'model' : 'user') as 'model' | 'user',
          text: sanitizeInput(String(h?.text || '')).slice(0, 500)
        }))
      : [];

    const result = await executeAIChat(cleanMessage, safeTopic, safeHistory, clientIp);

    res.json(result);
  } catch (err: any) {
    console.warn('[AI Chat Route Error]:', err.message);
    const isRateLimit = err.message && (err.message.includes('nhanh') || err.message.includes('giới hạn') || err.message.includes('suy nghĩ'));
    res.status(isRateLimit ? 429 : 500).json({
      error: err.message || 'Không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.'
    });
  }
});

/**
 * POST /api/ai/contact-admin
 * Du khách gửi tin nhắn hoặc yêu cầu trực tiếp đến Ban Quản Lý (khi chọn radio Liên hệ Ban Quản lý)
 */
aiRouter.post('/contact-admin', async (req: Request, res: Response) => {
  try {
    const { visitorName, visitorContact, message, topic = 'contact_admin' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập nội dung cần liên hệ Ban Quản lý.' });
    }

    const cleanMsg = sanitizeInput(message);
    if (!cleanMsg) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không hợp lệ.' });
    }

    const cleanName = sanitizeInput(String(visitorName || '')).slice(0, 80) || 'Khách tham quan';
    const cleanContact = sanitizeInput(String(visitorContact || '')).slice(0, 100);

    const result = await submitVisitorInquiryToAdmin({
      visitorName: cleanName,
      visitorContact: cleanContact,
      message: cleanMsg,
      topic: sanitizeInput(String(topic || 'contact_admin'))
    });

    res.json(result);
  } catch (err: any) {
    console.warn('[AI Contact Admin Error]:', err.message);
    res.status(500).json({ error: 'Không thể gửi yêu cầu đến Ban Quản lý lúc này. Vui lòng liên hệ qua hotline.' });
  }
});

/**
 * GET /api/ai/settings
 * Lấy cấu hình Trợ lý AI (Chỉ dành cho Quản trị viên)
 */
aiRouter.get('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getAISettings();
    const safeSettings = {
      id: settings.id,
      isActive: settings.isActive,
      provider: settings.provider,
      modelName: settings.modelName,
      apiKeyMasked: maskKey(settings.apiKey),
      hasApiKey: Boolean(settings.apiKey && settings.apiKey.length > 5),
      temperature: settings.temperature,
      systemPrompt: settings.systemPrompt,
      maxTokens: settings.maxTokens,
      antiSpamCooldownSec: settings.antiSpamCooldownSec,
      maxRequestsPerMinute: settings.maxRequestsPerMinute,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy
    };
    res.json(safeSettings);
  } catch (err: any) {
    res.status(500).json({ error: 'Không thể tải cấu hình AI: ' + err.message });
  }
});

/**
 * PUT /api/ai/settings
 * Cập nhật cấu hình Trợ lý AI & Model động (Chỉ dành cho Quản trị viên, có kiểm tra Injection chặt chẽ)
 */
aiRouter.put('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const current = await getAISettings();
    const {
      isActive,
      modelName,
      apiKey,
      temperature,
      systemPrompt,
      maxTokens,
      antiSpamCooldownSec,
      maxRequestsPerMinute
    } = req.body;

    const updateData: any = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    // Validation Tên Model (Chống Injection)
    if (modelName !== undefined) {
      if (typeof modelName !== 'string' || !modelName.trim()) {
        return res.status(400).json({ error: 'Tên mô hình AI không được để trống.' });
      }
      const trimmedModel = modelName.trim();
      // Chỉ chấp nhận ký tự an toàn chuẩn identifier: a-z, A-Z, 0-9, ., -, _, /, :
      const MODEL_REGEX = /^[a-zA-Z0-9._\-\/:]{2,80}$/;
      if (!MODEL_REGEX.test(trimmedModel) || containsDangerousInjection(trimmedModel)) {
        return res.status(400).json({
          error: 'Tên mô hình AI không hợp lệ. Chỉ cho phép chữ cái, chữ số, dấu chấm (.), gạch ngang (-) và gạch dưới (_) từ 2 đến 80 ký tự.'
        });
      }
      updateData.modelName = trimmedModel;
      updateData.provider = inferProviderFromModelName(trimmedModel);
    }

    // Validation API Key (Chống Injection & Token bất hợp lệ)
    if (apiKey !== undefined) {
      if (typeof apiKey === 'string') {
        const trimmedKey = apiKey.trim();
        if (trimmedKey && !trimmedKey.includes('****')) {
          // Khóa API không được chứa khoảng trắng, ký tự điều khiển hay script
          const API_KEY_REGEX = /^[A-Za-z0-9_\-\.\:\+]{6,256}$/;
          if (!API_KEY_REGEX.test(trimmedKey) || containsDangerousInjection(trimmedKey)) {
            return res.status(400).json({
              error: 'Khóa API Key không hợp lệ. Vui lòng kiểm tra lại định dạng khóa của nhà cung cấp.'
            });
          }
          updateData.apiKey = trimmedKey;
        } else if (trimmedKey === '') {
          // Cho phép xóa key để dùng env fallback của server
          updateData.apiKey = '';
        }
      }
    }

    // Validation Temperature
    if (temperature !== undefined) {
      const numTemp = Number(temperature);
      if (isNaN(numTemp) || numTemp < 0 || numTemp > 1) {
        return res.status(400).json({ error: 'Nhiệt độ sáng tạo (Temperature) phải là số từ 0.0 đến 1.0.' });
      }
      updateData.temperature = numTemp;
    }

    // Validation System Prompt
    if (systemPrompt !== undefined) {
      if (typeof systemPrompt === 'string') {
        const cleanPrompt = sanitizeInput(systemPrompt);
        if (cleanPrompt.length > 3000) {
          return res.status(400).json({ error: 'Lời nhắc hệ thống không được vượt quá 3000 ký tự.' });
        }
        updateData.systemPrompt = cleanPrompt;
      }
    }

    // Validation Giới hạn tokens & Anti-Spam
    if (maxTokens !== undefined) {
      const numTokens = Number(maxTokens);
      if (isNaN(numTokens) || numTokens < 100 || numTokens > 4096) {
        return res.status(400).json({ error: 'Giới hạn Token đầu ra phải từ 100 đến 4096.' });
      }
      updateData.maxTokens = numTokens;
    }

    if (antiSpamCooldownSec !== undefined) {
      const numCooldown = Number(antiSpamCooldownSec);
      if (isNaN(numCooldown) || numCooldown < 1 || numCooldown > 60) {
        return res.status(400).json({ error: 'Thời gian giãn cách câu hỏi phải từ 1 đến 60 giây.' });
      }
      updateData.antiSpamCooldownSec = numCooldown;
    }

    if (maxRequestsPerMinute !== undefined) {
      const numRpm = Number(maxRequestsPerMinute);
      if (isNaN(numRpm) || numRpm < 5 || numRpm > 120) {
        return res.status(400).json({ error: 'Giới hạn số câu hỏi mỗi phút phải từ 5 đến 120.' });
      }
      updateData.maxRequestsPerMinute = numRpm;
    }

    const updated = await saveAISettings(updateData, req.user?.username || 'Admin');

    res.json({
      success: true,
      message: 'Đã cập nhật cấu hình Trợ lý AI và Model thành công.',
      settings: {
        id: updated.id,
        isActive: updated.isActive,
        provider: updated.provider,
        modelName: updated.modelName,
        apiKeyMasked: maskKey(updated.apiKey),
        hasApiKey: Boolean(updated.apiKey && updated.apiKey.length > 5),
        temperature: updated.temperature,
        systemPrompt: updated.systemPrompt,
        maxTokens: updated.maxTokens,
        antiSpamCooldownSec: updated.antiSpamCooldownSec,
        maxRequestsPerMinute: updated.maxRequestsPerMinute,
        updatedAt: updated.updatedAt,
        updatedBy: updated.updatedBy
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cập nhật cấu hình AI: ' + err.message });
  }
});

/**
 * POST /api/ai/test-connection
 * Kiểm tra kết nối tới Model AI được cấu hình (Chỉ dành cho Quản trị viên)
 */
aiRouter.post('/test-connection', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { modelName, apiKey } = req.body;

    const current = await getAISettings();
    const effectiveKey = (apiKey && !apiKey.includes('****')) ? apiKey.trim() : (current.apiKey || process.env.GEMINI_API_KEY || '');
    const effectiveModel = modelName ? modelName.trim() : (current.modelName || 'gemini-2.5-flash');
    const effectiveProvider = inferProviderFromModelName(effectiveModel);

    const result = await testAIModelConnection(effectiveProvider, effectiveModel, effectiveKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      latencyMs: 0,
      message: 'Lỗi khi kiểm tra kết nối: ' + err.message
    });
  }
});

/**
 * GET /api/ai/inquiries
 * Xem danh sách tin nhắn/yêu cầu của khách tham quan (Admin)
 */
aiRouter.get('/inquiries', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const items = await AIVisitorInquiryModel.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ inquiries: items });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi nạp danh sách tin nhắn: ' + err.message });
  }
});
