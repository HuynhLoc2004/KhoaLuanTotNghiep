import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Language, DEFAULT_LANGUAGES, seedDefaultLanguages } from '../models/Language.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';

export const languagesRouter = Router();

// Redis cache key
const CACHE_KEY_ACTIVE_LANGUAGES = 'cache:languages:active';
const CACHE_TTL_SECONDS = 3600; // 1 hour

// Bảng từ điển chuẩn thuật ngữ Khảo cổ - Lịch sử Bảo tàng Lịch sử TP.HCM
const HERITAGE_GLOSSARY: Record<string, Record<string, string>> = {
  'Óc Eo': {
    en: 'Oc Eo Culture',
    fr: "Culture d'Oc Eo",
    ja: 'オケオ文化',
    zh: '奥高文化',
    ko: '옥에오 문화',
    de: 'Óc Eo-Kultur'
  },
  'Phù Nam': {
    en: 'Kingdom of Funan',
    fr: 'Royaume du Fou-nan',
    ja: '扶南王国',
    zh: '扶南国',
    ko: '푸난 왕국',
    de: 'Königreich Funan'
  },
  'Champa': {
    en: 'Champa Civilization',
    fr: 'Civilisation du Champa',
    ja: 'チャンパ文明',
    zh: '占婆文明',
    ko: '참파 문명',
    de: 'Champa-Zivilisation'
  },
  'Tiền sử & Sơ sử': {
    en: 'Prehistory and Protohistory',
    fr: 'Préhistoire et Protohistoire',
    ja: '先史時代および原史時代',
    zh: '史前史与原史时代',
    ko: '선사 및 원사 시대',
    de: 'Ur- und Frühgeschichte'
  },
  'Khảo cổ học': {
    en: 'Archaeology',
    fr: 'Archéologie',
    ja: '考古学',
    zh: '考古学',
    ko: '고고학',
    de: 'Archäologie'
  },
  'Triều Nguyễn': {
    en: 'Nguyen Dynasty',
    fr: 'Dynastie des Nguyen',
    ja: '阮朝（グエン朝）',
    zh: '阮朝',
    ko: '응우옌 왕조',
    de: 'Nguyen-Dynastie'
  },
  'Mỹ thuật Cung đình': {
    en: 'Imperial Court Arts',
    fr: 'Arts de la Cour Impériale',
    ja: '宮廷美術',
    zh: '宫廷美术',
    ko: '궁중 미술',
    de: 'Kaiserliche Hofkunst'
  },
  'Vương Hồng Sển': {
    en: 'Scholar Vuong Hong Sen',
    fr: 'Érudit Vuong Hong Sen',
    ja: 'ヴオン・ホン・セン学者',
    zh: '王洪钏学者',
    ko: '브엉 홍 션 학자',
    de: 'Gelehrter Vuong Hong Sen'
  },
  'Bảo tàng Lịch sử TP.HCM': {
    en: 'Museum of History in Ho Chi Minh City',
    fr: "Musée d'Histoire de Hô Chi Minh-Ville",
    ja: 'ホーチミン市歴史博物館',
    zh: '胡志明市历史博物馆',
    ko: '호치민시 역사박물관',
    de: 'Historisches Museum von Ho-Chi-Minh-Stadt'
  },
  'Bảo vật Quốc gia': {
    en: 'National Treasure of Vietnam',
    fr: 'Trésor National du Vietnam',
    ja: 'ベトナム国宝',
    zh: '越南国家宝藏',
    ko: '베트남 국보',
    de: 'Nationaler Schatz Vietnams'
  },
  'Đông Sơn': {
    en: 'Dong Son Culture',
    fr: 'Culture de Dong Son',
    ja: 'ドンソン文化',
    zh: '东山文化',
    ko: '동선 문화',
    de: 'Dong-Son-Kultur'
  },
  'Sa Huỳnh': {
    en: 'Sa Huynh Culture',
    fr: 'Culture de Sa Huynh',
    ja: 'サフィン文化',
    zh: '沙黄文化',
    ko: '사후인 문화',
    de: 'Sa-Huynh-Kultur'
  }
};

/**
 * GET /api/languages
 * Lấy toàn bộ danh sách ngôn ngữ (Quản trị Admin)
 */
languagesRouter.get('/', async (req: Request, res: Response) => {
  try {
    let languages = await Language.find().sort({ order: 1 });
    if (languages.length === 0) {
      await seedDefaultLanguages();
      languages = await Language.find().sort({ order: 1 });
    }
    res.json({ success: true, data: languages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh mục ngôn ngữ: ' + err.message });
  }
});

/**
 * GET /api/languages/active
 * Lấy danh sách ngôn ngữ đang kích hoạt (Client & Admin selector)
 * Có Redis Caching an toàn TTL 1h
 */
languagesRouter.get('/active', async (req: Request, res: Response) => {
  try {
    const cached = await cacheGet<any[]>(CACHE_KEY_ACTIVE_LANGUAGES);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    let activeLangs = await Language.find({ isActive: true }).sort({ order: 1 });
    if (activeLangs.length === 0) {
      await seedDefaultLanguages();
      activeLangs = await Language.find({ isActive: true }).sort({ order: 1 });
    }

    await cacheSet(CACHE_KEY_ACTIVE_LANGUAGES, activeLangs, CACHE_TTL_SECONDS);

    res.json({ success: true, data: activeLangs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tải ngôn ngữ kích hoạt: ' + err.message });
  }
});

const BASE_UI_BUNDLE: Record<string, string> = {
  'nav.museumTitle': 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
  'nav.adminTitle': 'Ban Quản trị Bảo tàng Lịch sử',
  'nav.adminRole': 'Quản trị viên (Admin)',
  'nav.breadcrumbMuseum': 'Bảo tàng Lịch sử',
  'nav.viewTour': 'Xem Tour Khách',
  'nav.rooms': 'Gian trưng bày & Tour 360',
  'nav.pocStitching': 'Tạo ảnh toàn cảnh 360°',
  'nav.artifacts': 'Hiện vật & Cổ vật di sản',
  'nav.languages': 'Quản trị Ngôn ngữ & Voice AI',
  'nav.analytics': 'Báo cáo & Thống kê',
  'nav.settings': 'Cấu hình hệ thống',
  'nav.themeLight': 'Chuyển sang giao diện Sáng',
  'nav.themeDark': 'Chuyển sang giao diện Tối',
  'rooms.title': 'Gian trưng bày & Tour 360',
  'rooms.desc': 'Quản trị không gian toàn cảnh 360°, điểm neo di sản và thiết lập điểm nhìn đầu tiên.',
  'rooms.tabRooms': 'Gian trưng bày',
  'rooms.tabStorage': 'Kho ảnh toàn cảnh 360°',
  'rooms.addRoom': 'Thêm gian phòng mới',
  'rooms.exportStandee': 'Xuất gói Standee QR',
  'rooms.searchPlaceholder': 'Tìm theo tên phòng, mã P-01, P-05...',
  'rooms.allThemes': 'Tất cả chủ đề',
  'rooms.allStatuses': 'Tất cả trạng thái',
  'rooms.statusActive': 'Đang hoạt động',
  'rooms.statusInactive': 'Tạm ẩn',
  'rooms.showing': 'Hiển thị',
  'rooms.of': 'trên tổng số',
  'rooms.roomsCount': 'phòng',
  'rooms.perPage': 'Mỗi trang:',
  'rooms.pageUnit': '/ trang',
  'rooms.prev': 'Trước',
  'rooms.next': 'Sau',
  'rooms.explore360': 'Biên tập 360°',
  'rooms.narration': 'Thuyết minh',
  'rooms.qrCode': 'Mã QR',
  'rooms.edit': 'Sửa',
  'rooms.delete': 'Xóa',
  'rooms.anchorPoints': 'điểm neo',
  'rooms.notConfigured': 'Chưa cấu hình điểm nhìn',
  'rooms.angle360': 'góc 360°',
  'rooms.scans': 'lượt quét',
  'rooms.statSpaces': 'không gian',
  'rooms.statReady': 'Sẵn sàng đón khách tham quan',
  'rooms.statCoordinates': 'tọa độ di sản',
  'rooms.statGuidance': 'Định vị liên hoàn & dẫn tour 360',
  'rooms.statMonographs': 'chuyên khảo',
  'rooms.statAudio': 'Biên tập tài liệu sử & âm thanh bản ngữ',
  'rooms.statVisitorScan': 'Khách tham quan quét mã QR tại gian trưng bày',
  'studio.backToRooms': 'Gian trưng bày & Tour 360',
  'studio.save': 'Lưu cấu hình không gian',
  'studio.setInitialView': 'Đặt góc nhìn ban đầu',
  'studio.addHotspot': 'Thêm điểm neo di sản',
  'studio.hotspotNav': 'Điểm chuyển tiếp phòng',
  'studio.hotspotInfo': 'Điểm thuyết minh hiện vật',
  'studio.editHotspot': 'Sửa điểm neo',
  'studio.deleteHotspot': 'Xóa điểm neo',
  'common.confirm': 'Xác nhận',
  'common.cancel': 'Hủy bỏ',
  'common.save': 'Lưu lại',
  'common.close': 'Đóng',
  'common.loading': 'Đang tải dữ liệu không gian bảo tàng...',
  'common.refresh': 'Làm mới',
  'common.emptyData': 'Chưa có dữ liệu phù hợp',
  'common.thesisFooter': 'Đề tài Tốt nghiệp 2026 • Hệ thống Tour 360 Không gian Di sản'
};

/**
 * GET /api/languages/bundle/:code
 * Tải gói từ điển i18n cho một ngôn ngữ bất kỳ
 * Tự động dịch bằng NMT + áp dụng Heritage Glossary và lưu đệm vào Redis
 */
languagesRouter.get('/bundle/:code', async (req: Request, res: Response) => {
  try {
    const cleanCode = String(req.params.code).toLowerCase().trim();
    if (cleanCode === 'vi') {
      return res.json({ success: true, data: BASE_UI_BUNDLE });
    }

    const cacheKey = `cache:bundle:${cleanCode}`;
    const cached = await cacheGet<Record<string, string>>(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    const translatedBundle: Record<string, string> = {};
    const entries = Object.entries(BASE_UI_BUNDLE);

    // Dịch theo lô nhỏ để tối ưu tốc độ và không gây nghẽn
    for (let i = 0; i < entries.length; i += 6) {
      const batch = entries.slice(i, i + 6);
      await Promise.all(
        batch.map(async ([key, viText]) => {
          let trans = await fetchSingleChunkNMT(viText, cleanCode);
          // Hậu xử lý bằng Heritage Glossary
          for (const [vTerm, tDict] of Object.entries(HERITAGE_GLOSSARY)) {
            if (tDict[cleanCode] && trans.includes(vTerm)) {
              trans = trans.replace(new RegExp(vTerm, 'g'), tDict[cleanCode]);
            }
          }
          translatedBundle[key] = trans || viText;
        })
      );
    }

    // Cache trong 7 ngày
    await cacheSet(cacheKey, translatedBundle, 7 * 24 * 3600);

    res.json({ success: true, data: translatedBundle, cached: false });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo gói từ điển: ' + err.message });
  }
});

/**
 * POST /api/languages
 * Thêm một ngôn ngữ mới vào hệ thống
 */
languagesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, nativeName, flagIcon, isActive, ttsVoiceConfig } = req.body;
    if (!code || !name || !nativeName) {
      return res.status(400).json({ success: false, message: 'Thiếu mã ISO, tên tiếng Anh hoặc tên bản ngữ' });
    }

    const cleanCode = String(code).toLowerCase().trim();
    const exists = await Language.findOne({ code: cleanCode });
    if (exists) {
      return res.status(400).json({ success: false, message: `Mã ngôn ngữ "${cleanCode}" đã tồn tại trong hệ thống` });
    }

    const count = await Language.countDocuments();
    const newLang = await Language.create({
      code: cleanCode,
      name: String(name).trim(),
      nativeName: String(nativeName).trim(),
      flagIcon: flagIcon || '🌐',
      isActive: Boolean(isActive),
      order: count + 1,
      ttsVoiceConfig: ttsVoiceConfig || {
        provider: 'google',
        voiceName: `${cleanCode}-default`,
        gender: 'female',
        speed: 1.0,
        pitch: 0.0
      }
    });

    // Invalidate Redis cache
    await cacheDel(CACHE_KEY_ACTIVE_LANGUAGES);

    res.status(201).json({ success: true, data: newLang, message: `Đã thêm ngôn ngữ "${nativeName}" thành công` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi thêm ngôn ngữ: ' + err.message });
  }
});

/**
 * PUT /api/languages/:code
 * Cập nhật cấu hình hoặc bật/tắt ngôn ngữ
 */
languagesRouter.put('/:code', async (req: Request, res: Response) => {
  try {
    const cleanCode = String(req.params.code).toLowerCase().trim();

    const lang = await Language.findOne({ code: cleanCode });
    if (!lang) {
      return res.status(404).json({ success: false, message: `Không tìm thấy ngôn ngữ "${cleanCode}"` });
    }

    const { isActive, name, nativeName, flagIcon, ttsVoiceConfig, order } = req.body;

    // Ngôn ngữ mặc định (vi) luôn luôn phải Active
    if (lang.isDefault && isActive === false) {
      return res.status(400).json({ success: false, message: 'Không thể tắt ngôn ngữ gốc mặc định (Tiếng Việt)' });
    }

    if (isActive !== undefined) lang.isActive = Boolean(isActive);
    if (name) lang.name = String(name).trim();
    if (nativeName) lang.nativeName = String(nativeName).trim();
    if (flagIcon) lang.flagIcon = flagIcon;
    if (order !== undefined) lang.order = Number(order);
    if (ttsVoiceConfig) {
      lang.ttsVoiceConfig = {
        ...lang.ttsVoiceConfig,
        ...ttsVoiceConfig
      };
    }

    await lang.save();

    // Invalidate cache
    await cacheDel(CACHE_KEY_ACTIVE_LANGUAGES);

    res.json({ success: true, data: lang, message: `Đã cập nhật ngôn ngữ "${lang.nativeName}" thành công` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật ngôn ngữ: ' + err.message });
  }
});

/**
 * DELETE /api/languages/:code
 * Xóa một ngôn ngữ phụ (không cho phép xóa 'vi')
 */
languagesRouter.delete('/:code', async (req: Request, res: Response) => {
  try {
    const cleanCode = String(req.params.code).toLowerCase().trim();

    const lang = await Language.findOne({ code: cleanCode });
    if (!lang) {
      return res.status(404).json({ success: false, message: `Không tìm thấy ngôn ngữ "${cleanCode}"` });
    }

    if (lang.isDefault) {
      return res.status(400).json({ success: false, message: 'Không thể xóa ngôn ngữ gốc mặc định của hệ thống' });
    }

    await Language.deleteOne({ code: cleanCode });

    // Invalidate cache
    await cacheDel(CACHE_KEY_ACTIVE_LANGUAGES);

    res.json({ success: true, message: `Đã xóa ngôn ngữ "${lang.nativeName}" khỏi hệ thống` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa ngôn ngữ: ' + err.message });
  }
});

/**
 * Helper: Dịch một đoạn văn bản ngắn qua Neural Machine Translation (MyMemory)
 */
export async function fetchSingleChunkNMT(chunk: string, targetLang: string): Promise<string> {
  if (!chunk || !chunk.trim()) return '';
  const cleanLang = targetLang.toLowerCase().trim();
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.trim())}&langpair=vi|${encodeURIComponent(cleanLang)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (res.ok) {
      const data: any = await res.json();
      if (data?.responseData?.translatedText) {
        let result: string = data.responseData.translatedText;
        // Decode các thực thể HTML nếu có
        result = result
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        // Bỏ qua nếu là chuỗi cảnh báo quota
        if (!result.toLowerCase().startsWith('mymemory warning') && !result.toLowerCase().includes('quota exceeded')) {
          return result;
        }
      }
    }
  } catch (err: any) {
    console.warn('[NMT chunk translate error]:', err.message);
  }
  return chunk;
}

/**
 * Helper: Dịch toàn diện đoạn văn bản dài, tự động chia tách câu thông minh
 */
export async function translateTextWithNMT(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return '';
  const cleanText = text.trim();
  const tLang = targetLang.toLowerCase().trim();

  // Nếu đoạn văn ngắn dưới 350 ký tự, dịch trực tiếp 1 lần
  if (cleanText.length <= 350) {
    return fetchSingleChunkNMT(cleanText, tLang);
  }

  // Tách theo dấu kết thúc câu (. ? ! \n) để giữ nguyên cấu trúc ngữ pháp
  const sentences = cleanText.split(/(?<=[.\n?!])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const s of sentences) {
    if ((currentChunk + ' ' + s).length > 300 && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = s;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + s : s;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  const results: string[] = [];
  for (const c of chunks) {
    const translated = await fetchSingleChunkNMT(c, tLang);
    results.push(translated);
  }

  return results.join(' ');
}

/**
 * POST /api/languages/translate-draft
 * Dịch tự động bằng AI có áp dụng Heritage Glossary chuyên sâu bảo tàng
 * - Cấp 1: Gemini 2.5 Flash / 1.5 Flash (nếu có cấu hình API Key)
 * - Cấp 2: Neural Machine Translation (NMT) dịch toàn văn 100% ngữ nghĩa tự nhiên
 * - Hậu xử lý: Chuẩn hóa thuật ngữ bảo tàng di sản học bằng Heritage Glossary
 */
languagesRouter.post('/translate-draft', async (req: Request, res: Response) => {
  try {
    const { targetLang, name, period, description, narrationScript } = req.body;
    if (!targetLang) {
      return res.status(400).json({ success: false, message: 'Cần chỉ định mã ngôn ngữ đích (targetLang)' });
    }

    const tLang = targetLang.toLowerCase().trim();

    // Chuẩn bị kịch bản thuyết minh cơ sở nếu chưa có
    const baseNarrationScript = (narrationScript && narrationScript.trim())
      ? narrationScript.trim()
      : `Kính chào quý khách đến với ${name || 'gian trưng bày'} tại Bảo tàng Lịch sử TP.HCM. ${description || ''}`;

    // Hàm thay thế thuật ngữ sử học theo glossary bảo tàng
    const applyGlossary = (text: string, lang: string): string => {
      if (!text) return '';
      let result = text;
      for (const [vietnameseTerm, translations] of Object.entries(HERITAGE_GLOSSARY)) {
        if (translations[lang] && result.includes(vietnameseTerm)) {
          const regex = new RegExp(vietnameseTerm, 'g');
          result = result.replace(regex, translations[lang]);
        }
      }
      return result;
    };

    // KIỂM TRA CẤP 1: Gemini API Key nếu có cấu hình
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const systemInstruction = `You are a Senior Heritage Translator and Museum Curator for the Museum of History in Ho Chi Minh City.
Translate Vietnamese museum information into ${tLang.toUpperCase()}.
CRITICAL RULES:
1. Preserve historical dignity and academic museum phrasing.
2. Respect these exact terms:
${Object.entries(HERITAGE_GLOSSARY).map(([vi, dict]) => `- "${vi}" -> "${dict[tLang] || dict['en']}"`).join('\n')}
3. Output strictly valid JSON with keys: "name", "period", "description", "narrationScript".`;

        const userPayload = JSON.stringify({
          name: name || '',
          period: period || '',
          description: description || '',
          narrationScript: baseNarrationScript
        });
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nTranslate this:\n${userPayload}` }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (geminiRes.ok) {
          const data: any = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              data: {
                name: parsed.name || name,
                period: parsed.period || period,
                description: parsed.description || description,
                narrationScript: parsed.narrationScript || baseNarrationScript
              },
              engine: 'Gemini-2.5-Flash (Heritage Contextual)'
            });
          }
        }
      } catch (aiErr: any) {
        console.warn('[Gemini Translation Fallback to NMT]:', aiErr.message);
      }
    }

    // CẤP 2: Neural Machine Translation (NMT) dịch toàn văn chuyên sâu đa ngôn ngữ
    let [translatedName, translatedPeriod, translatedDesc, translatedScript] = await Promise.all([
      name ? translateTextWithNMT(name, tLang) : Promise.resolve(''),
      period ? translateTextWithNMT(period, tLang) : Promise.resolve(''),
      description ? translateTextWithNMT(description, tLang) : Promise.resolve(''),
      baseNarrationScript ? translateTextWithNMT(baseNarrationScript, tLang) : Promise.resolve('')
    ]);

    // HẬU XỬ LÝ: Áp dụng từ điển Heritage Glossary chuẩn bảo tàng
    translatedName = applyGlossary(translatedName, tLang);
    translatedPeriod = applyGlossary(translatedPeriod, tLang);
    translatedDesc = applyGlossary(translatedDesc, tLang);
    translatedScript = applyGlossary(translatedScript, tLang);

    res.json({
      success: true,
      data: {
        name: translatedName || name,
        period: translatedPeriod || period,
        description: translatedDesc || description,
        narrationScript: translatedScript || baseNarrationScript
      },
      engine: 'Neural Heritage Translation Engine'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dịch thuật: ' + err.message });
  }
});

/**
 * POST /api/languages/generate-tts
 * Pre-rendered Voice AI Engine:
 * Tạo file âm thanh MP3 tĩnh chất lượng cao, lưu vào static storage và trả về URL
 */
languagesRouter.post('/generate-tts', async (req: Request, res: Response) => {
  try {
    const { text, langCode, roomCode } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Kịch bản âm thanh không được để trống' });
    }

    const cleanLang = (langCode || 'vi').toLowerCase().trim();
    const safeRoomCode = (roomCode || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    // Ánh xạ mã ngôn ngữ chuẩn sang mã Google Speech
    let googleLang = 'vi';
    if (cleanLang.startsWith('vi')) googleLang = 'vi';
    else if (cleanLang.startsWith('en')) googleLang = 'en';
    else if (cleanLang.startsWith('ja')) googleLang = 'ja';
    else if (cleanLang.startsWith('th')) googleLang = 'th';
    else if (cleanLang.startsWith('fr')) googleLang = 'fr';
    else if (cleanLang.startsWith('zh')) googleLang = 'zh-CN';
    else if (cleanLang.startsWith('ko')) googleLang = 'ko';
    else if (cleanLang.startsWith('de')) googleLang = 'de';
    else if (cleanLang.startsWith('es')) googleLang = 'es';
    else googleLang = cleanLang.substring(0, 2);

    // Đảm bảo thư mục lưu trữ tĩnh /public/uploads/audio tồn tại
    const audioDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Đặt tên file tĩnh có timestamp & mã ngôn ngữ
    const timestamp = Date.now();
    const filename = `voice_${safeRoomCode}_${cleanLang}_${timestamp}.mp3`;
    const filePath = path.join(audioDir, filename);

    // Tách kịch bản thành các đoạn nhỏ dưới 180 ký tự theo dấu câu để đọc trọn vẹn văn bản
    const splitTextIntoChunks = (str: string, maxLen = 170): string[] => {
      const sentences = str.match(/[^.!?\n]+[.!?\n]+/g) || [str];
      const chunks: string[] = [];
      let currentChunk = '';

      for (const s of sentences) {
        const trimmed = s.trim();
        if (!trimmed) continue;
        if ((currentChunk + ' ' + trimmed).trim().length <= maxLen) {
          currentChunk = (currentChunk + ' ' + trimmed).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          if (trimmed.length > maxLen) {
            // Cắt nhỏ hơn nếu câu quá dài
            const words = trimmed.split(' ');
            let sub = '';
            for (const w of words) {
              if ((sub + ' ' + w).trim().length <= maxLen) {
                sub = (sub + ' ' + w).trim();
              } else {
                if (sub) chunks.push(sub);
                sub = w;
              }
            }
            if (sub) currentChunk = sub;
            else currentChunk = '';
          } else {
            currentChunk = trimmed;
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);
      return chunks.length > 0 ? chunks : [str.substring(0, maxLen)];
    };

    const textChunks = splitTextIntoChunks(text);
    const audioBuffers: Buffer[] = [];

    for (const chunk of textChunks) {
      if (!chunk.trim()) continue;
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      try {
        const fetchAudio = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (fetchAudio.ok) {
          const arrayBuf = await fetchAudio.arrayBuffer();
          if (arrayBuf.byteLength > 100) {
            audioBuffers.push(Buffer.from(arrayBuf));
          }
        }
      } catch (e: any) {
        console.warn(`[Google TTS chunk fetch error (${googleLang})]:`, e.message);
      }
    }

    if (audioBuffers.length > 0) {
      const combinedBuffer = Buffer.concat(audioBuffers);
      fs.writeFileSync(filePath, combinedBuffer);
    } else {
      throw new Error(`Không thể kết nối đến dịch vụ tổng hợp giọng nói cho ngôn ngữ [${cleanLang.toUpperCase()}]`);
    }

    const publicUrl = `/uploads/audio/${filename}`;

    res.json({
      success: true,
      audioUrl: publicUrl,
      filename,
      lang: cleanLang,
      duration: Math.max(5, Math.round(text.length / 15)),
      message: `Đã xuất bản file Voice AI chuẩn tiếng Việt/Đa ngôn ngữ thành công cho [${cleanLang.toUpperCase()}]`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi sinh giọng đọc Voice AI: ' + err.message });
  }
});

/**
 * DELETE /api/languages/audio
 * Xóa file âm thanh Voice AI vật lý trên ổ đĩa máy chủ (dọn dẹp storage)
 */
languagesRouter.delete('/audio', async (req: Request, res: Response) => {
  try {
    const { audioUrl } = req.body;
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.includes('/uploads/audio/')) {
      const filename = path.basename(audioUrl);
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'audio', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, message: 'Đã xóa file âm thanh vật lý trên server' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa file âm thanh: ' + err.message });
  }
});

