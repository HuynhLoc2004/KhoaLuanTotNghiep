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
 * POST /api/ai/chat
 * Endpoint chính cho du khách tương tác với Trợ lý AI (Có kiểm soát chống spam)
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, topic = 'general', history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Câu hỏi vượt quá giới hạn 1000 ký tự. Vui lòng rút gọn nội dung.' });
    }

    // Lấy IP của người gửi để chống spam
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

    const result = await executeAIChat(message.trim(), topic, history, clientIp);

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

    const result = await submitVisitorInquiryToAdmin({
      visitorName: visitorName ? String(visitorName).trim() : 'Khách tham quan',
      visitorContact: visitorContact ? String(visitorContact).trim() : '',
      message: message.trim(),
      topic
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
 * Cập nhật cấu hình Trợ lý AI & Model động (Chỉ dành cho Quản trị viên)
 */
aiRouter.put('/settings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const current = await getAISettings();
    const {
      isActive,
      provider,
      modelName,
      apiKey,
      temperature,
      systemPrompt,
      maxTokens,
      antiSpamCooldownSec,
      maxRequestsPerMinute
    } = req.body;

    const updateData: any = {};

    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (provider && ['gemini', 'openai', 'custom'].includes(provider)) updateData.provider = provider;
    if (modelName && typeof modelName === 'string') updateData.modelName = modelName.trim();

    // Chỉ cập nhật apiKey nếu người dùng gõ chuỗi mới (không phải chuỗi mask)
    if (typeof apiKey === 'string' && apiKey.trim() && !apiKey.includes('****')) {
      updateData.apiKey = apiKey.trim();
    } else if (apiKey === '') {
      // Cho phép xóa key để dùng env fallback
      updateData.apiKey = '';
    }

    if (typeof temperature === 'number' && temperature >= 0 && temperature <= 1) {
      updateData.temperature = temperature;
    }
    if (typeof systemPrompt === 'string') {
      updateData.systemPrompt = systemPrompt.trim();
    }
    if (typeof maxTokens === 'number' && maxTokens > 0) {
      updateData.maxTokens = maxTokens;
    }
    if (typeof antiSpamCooldownSec === 'number' && antiSpamCooldownSec >= 1) {
      updateData.antiSpamCooldownSec = antiSpamCooldownSec;
    }
    if (typeof maxRequestsPerMinute === 'number' && maxRequestsPerMinute >= 1) {
      updateData.maxRequestsPerMinute = maxRequestsPerMinute;
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
    const { provider = 'gemini', modelName, apiKey } = req.body;

    const current = await getAISettings();
    const effectiveKey = (apiKey && !apiKey.includes('****')) ? apiKey.trim() : (current.apiKey || process.env.GEMINI_API_KEY || '');
    const effectiveModel = modelName ? modelName.trim() : (current.modelName || 'gemini-2.5-flash');

    const result = await testAIModelConnection(provider, effectiveModel, effectiveKey);
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
