import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { Language, DEFAULT_LANGUAGES, seedDefaultLanguages } from '../models/Language.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';
import { pgPool, logAudit } from '../db/postgres.js';
import { pgUpsertLanguage } from '../db/syncEngine.js';

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
  },
  'Xem Trang chủ Khách': {
    en: 'View Visitor Homepage',
    fr: "Voir la page d'accueil des visiteurs",
    ja: '来館者向けホームページを見る',
    zh: '查看游客端首页'
  },
  'Xem trang khách': {
    en: 'View Visitor Page',
    fr: 'Voir le portail visiteur',
    ja: '来館者ページを見る',
    zh: '查看游客端页面'
  },
  'Trang khách': {
    en: 'Visitor Portal',
    fr: 'Portail des visiteurs',
    ja: '来館者ページ',
    zh: '游客端'
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
  'nav.homepageCms': 'Trang chủ & Giao diện',
  'nav.showcasePage': 'Trưng bày Trang chủ',
  'nav.guidePage': 'Cẩm nang & Sơ đồ',
  'nav.languages': 'Quản trị Ngôn ngữ & Voice AI',
  'nav.users': 'Người dùng & Khách',
  'nav.tickets': 'Quản lý Vé Tham Quan',
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
  'common.thesisFooter': 'Đề tài Tốt nghiệp 2026 • Hệ thống Tour 360 Không gian Di sản',

  // Artifact & 3D Viewer Details
  'artifact.backToRooms': 'Không gian trưng bày',
  'artifact.loading': 'Đang tải không gian di sản 3D...',
  'artifact.notFound': 'Không tìm thấy cổ vật',
  'artifact.notFoundDesc': 'Hiện vật không tồn tại hoặc đã được chuyển vào kho lưu trữ bảo quản.',
  'artifact.retry': 'Thử tải lại',
  'artifact.backToTour': 'Quay lại tham quan gian phòng',
  'artifact.model3dCreating': 'Hiện vật đang được số hóa tạo lập mô hình 3D',
  'artifact.narrationGuide': 'Giới thiệu hiện vật',
  'artifact.playingAudio': 'Đang phát giọng đọc Voice AI',
  'artifact.pauseAudio': 'Tạm dừng nghe',
  'artifact.playAudio': 'Nghe giới thiệu hiện vật',
  'artifact.language': 'Ngôn ngữ',
  'artifact.specsTitle': 'Thông số di sản & Hồ sơ khoa học',
  'artifact.identifier': 'Mã định danh',
  'artifact.chronology': 'Niên đại lịch sử',
  'artifact.originDiscovery': 'Nguồn gốc phát hiện',
  'artifact.measurements': 'Kích thước đo đạc',
  'artifact.meshResolution': 'Độ phân giải lưới 3D',
  'artifact.vertices': 'đỉnh (Vertices)',
  'artifact.geometricStructure': 'Cấu trúc hình học',
  'artifact.manifoldHousing': 'Vỏ kín đa diện Manifold',
  'artifact.significanceTitle': 'Giá trị lịch sử & Ý nghĩa văn hóa',
  'artifact.archivedImages': 'Hình ảnh lưu trữ tư liệu',
  'artifact.emptyStory': 'Đang cập nhật câu chuyện lịch sử cho cổ vật này...',
  'artifact.copyLinkSuccess': 'Đã sao chép liên kết hiện vật vào bộ nhớ tạm',
  'artifact.shareQr': 'Chia sẻ hoặc quét mã QR',

  // 3D Turntable Viewer Controls
  'turntable.3dSpace': 'Không gian 3D 360°',
  'turntable.parallax': '2.5D Parallax',
  'turntable.rotate360': 'Xoay 360°',
  'turntable.faces': 'mặt lưới',
  'turntable.autoRotate': 'Tự xoay 360°',
  'turntable.pauseRotate': 'Tạm dừng xoay',
  'turntable.resumeRotate': 'Tiếp tục tự xoay 360°',
  'turntable.changeLighting': 'Đổi ánh sáng',
  'turntable.warmLighting': 'Ánh sáng bảo tàng ấm',
  'turntable.daylight': 'Ánh sáng ban ngày',
  'turntable.wireframeOn': 'Xem cấu trúc lưới đa giác 3D',
  'turntable.wireframeOff': 'Tắt lưới đa giác',
  'turntable.fullscreen': 'Toàn màn hình',
  'turntable.exitFullscreen': 'Thoát toàn màn hình',
  'turntable.touchHint360': 'Chạm & xoay tự do 360° • Cuộn / chụm để phóng to',
  'turntable.touchHintParallax': 'Rê chuột hoặc chạm để nghiêng ngắm nổi khối 3D Parallax • Bấm nút trên thanh công cụ để mở khóa xoay 360°',

  // Artifacts Page
  'artifacts.pageTitle': 'Cổ vật 3D',
  'artifacts.pageHeading': 'Cổ vật & Hiện vật di sản',
  'artifacts.pageLead': 'Khám phá các hiện vật lịch sử và cổ vật được số hóa 3D.',
  'artifacts.searchPlaceholder': 'Tìm kiếm cổ vật, chất liệu, niên đại...',
  'artifacts.only3D': 'Có mô hình 3D xoay',
  'artifacts.notFound': 'Không tìm thấy cổ vật phù hợp với điều kiện tìm kiếm.',
  'artifacts.view3D': 'Xem mô hình 3D',

  // Intro Section
  'intro.tag': 'Lịch Sử & Kiến Trúc Bảo Tàng',
  'intro.headline': 'Gần Một Thế Kỷ Gìn Giữ & Tôn Vinh Di Sản Dân Tộc',
  'intro.desc1': 'Tọa lạc giữa khuôn viên Thảo Cầm Viên xanh mát từ năm 1929, Bảo tàng Lịch sử TP. Hồ Chí Minh là công trình kiến trúc Đông Dương tráng lệ.',

  // Guide & Footer
  'guide.pageTitle': 'Cẩm nang tham quan',
  'guide.pageHeading': 'Cẩm Nang & Sơ Đồ Tham Quan',
  'footer.explore': 'Khám Phá Di Sản',
  'footer.guide': 'Kế Hoạch Tham Quan',
  'footer.contact': 'Liên Hệ Trực Tiếp',
  'footer.scrollToTop': 'Về đầu trang'
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

    // Dịch toàn bộ gói từ điển bằng translateMultipleTexts kết hợp AI và Redis Cache
    const viTexts = entries.map(([, viText]) => viText);
    const translatedMap = await translateMultipleTexts(viTexts, cleanCode);
    for (const [key, viText] of entries) {
      translatedBundle[key] = translatedMap[viText] || viText;
    }

    // Cache trong 7 ngày
    await cacheSet(cacheKey, translatedBundle, 7 * 24 * 3600);

    res.json({ success: true, data: translatedBundle, cached: false });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi tạo gói từ điển: ' + err.message });
  }
});

// Helper làm sạch triệt để kết quả dịch, chặn mọi trường hợp dính mã ngôn ngữ nguồn 'vi' và lệch nghĩa du lịch
export function cleanUpNMTOutput(trans: string, original: string, targetLang: string): string {
  if (!trans) return '';
  let cleaned = trans.trim();
  // Khắc phục triệt để lỗi Google dict-chrome-ex ghép mã ngôn ngữ nguồn 'vi' vào cuối chuỗi (vd: "Introduirevi" -> "Introduire")
  if (cleaned.endsWith('vi') && cleaned.length > 4 && !original.toLowerCase().endsWith('vi')) {
    cleaned = cleaned.slice(0, -2).trim();
  }

  if (targetLang.toLowerCase() === 'fr') {
    cleaned = cleaned.replace(/maison d'h[oô]tes/gi, 'portail visiteur');
    cleaned = cleaned.replace(/page invit[ée]/gi, 'portail visiteur');
    cleaned = cleaned.replace(/vitrine de la maison/gi, "vitrine de la page d'accueil");
    cleaned = cleaned.replace(/manuels et diagrammes/gi, 'guide & plan du musée');
    cleaned = cleaned.replace(/bloc manuel/gi, 'guide de visite');
    cleaned = cleaned.replace(/Partie suivante\s*:\s*Partie suivante\s*:/gi, 'Section suivante :');
    cleaned = cleaned.replace(/Partie pr[ée]c[ée]dente\s*:\s*Partie pr[ée]c[ée]dente\s*:/gi, 'Section précédente :');
  }

  return cleaned;
}

/**
 * Helper dịch nhóm các cụm từ bằng AI (Gemini 2.5 Flash / Google NMT Grouped) kết hợp Redis Cache
 */
async function translateMultipleTexts(texts: string[], targetLang: string): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (texts.length === 0) return result;

  const cleanLang = targetLang.toLowerCase().trim();

  // 1. Nếu có GEMINI_API_KEY, dịch toàn bộ lô trong 1 lần gọi duy nhất với chất lượng curator bảo tàng
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemInstruction = `You are a Senior Heritage Translator and Museum Curator for the Museum of History in Ho Chi Minh City.
Translate the provided array of museum UI terms and labels from Vietnamese into ${cleanLang.toUpperCase()}.
CRITICAL RULES:
1. Output strictly valid JSON object where keys are the exact original Vietnamese phrases and values are the translated texts.
2. Maintain academic museum phrasing and cultural dignity.`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nTexts to translate (JSON array):\n${JSON.stringify(texts)}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (geminiRes.ok) {
        const data: any = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          for (const key of texts) {
            if (parsed[key] && typeof parsed[key] === 'string' && parsed[key].trim()) {
              result[key] = cleanUpNMTOutput(parsed[key].trim(), key, cleanLang);
            }
          }
        }
      }
    } catch {
      // Fallback sang Google Translate theo micro-batch an toàn
    }
  }

  // 2. Với các cụm từ chưa được dịch, dùng Google Translate theo micro-batch 5 cụm từ để tránh nghẽn HTTP 429
  const remaining = texts.filter((t) => !result[t]);
  if (remaining.length > 0) {
    for (let i = 0; i < remaining.length; i += 5) {
      const chunk = remaining.slice(i, i + 5);
      await Promise.all(
        chunk.map(async (text) => {
          try {
            const tr = await fetchSingleChunkNMT(text, cleanLang);
            if (tr && tr !== text) {
              result[text] = cleanUpNMTOutput(tr, text, cleanLang);
            }
          } catch {
            // Ignore
          }
        })
      );
      if (i + 5 < remaining.length) {
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
    }
  }

  // 3. Áp dụng Heritage Glossary cho toàn bộ kết quả
  for (const text of texts) {
    let trans = result[text] || text;
    for (const [vTerm, tDict] of Object.entries(HERITAGE_GLOSSARY)) {
      if (tDict[cleanLang] && trans.includes(vTerm)) {
        trans = trans.replace(new RegExp(vTerm, 'g'), tDict[cleanLang]);
      }
    }
    result[text] = cleanUpNMTOutput(trans, text, cleanLang);
  }

  return result;
}

/**
 * POST /api/languages/translate-batch
 * Dịch một mảng các cụm từ UI/văn bản sang ngôn ngữ đích (targetLang)
 * Có Redis cache v2 và áp dụng chuẩn thuật ngữ Heritage Glossary bảo tàng
 */
languagesRouter.post('/translate-batch', async (req: Request, res: Response) => {
  try {
    const { targetLang, texts } = req.body;
    if (!targetLang || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ success: false, message: 'Thiếu targetLang hoặc mảng texts' });
    }

    const cleanLang = String(targetLang).toLowerCase().trim();
    if (cleanLang === 'vi') {
      const identity: Record<string, string> = {};
      for (const t of texts) {
        identity[t] = t;
      }
      return res.json({ success: true, data: identity });
    }

    const uniqueTexts = Array.from(new Set(texts.map((t) => String(t).trim()))).filter(Boolean);
    const results: Record<string, string> = {};
    const uncachedTexts: string[] = [];

    // 1. Kiểm tra cache Redis v2 (làm sạch toàn bộ cache lỗi dính vi cũ)
    for (const text of uniqueTexts) {
      const textHash = Buffer.from(text).toString('base64').slice(0, 48);
      const cacheKey = `cache:nmt:v2:${cleanLang}:${textHash}`;
      const cached = await cacheGet<string>(cacheKey);
      if (cached) {
        results[text] = cleanUpNMTOutput(cached, text, cleanLang);
      } else {
        uncachedTexts.push(text);
      }
    }

    // 2. Dịch siêu tốc các cụm từ chưa có trong cache bằng translateMultipleTexts
    if (uncachedTexts.length > 0) {
      const translatedMap = await translateMultipleTexts(uncachedTexts, cleanLang);
      for (const [text, trans] of Object.entries(translatedMap)) {
        const cleanTrans = cleanUpNMTOutput(trans, text, cleanLang);
        results[text] = cleanTrans;
        const textHash = Buffer.from(text).toString('base64').slice(0, 48);
        const cacheKey = `cache:nmt:v2:${cleanLang}:${textHash}`;
        await cacheSet(cacheKey, cleanTrans, 14 * 24 * 3600);
      }
    }

    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi dịch hàng loạt: ' + err.message });
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

    // Đồng bộ lập tức sang PostgreSQL Primary
    await pgUpsertLanguage(newLang.toObject());
    await logAudit('CREATE_LANGUAGE', 'languages', { details: { code: cleanCode, name } });

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

    // Đồng bộ sang PostgreSQL Primary
    await pgUpsertLanguage(lang.toObject());
    await logAudit('UPDATE_LANGUAGE', 'languages', { details: { code: cleanCode } });

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

    // Xóa trong PostgreSQL Primary
    try {
      await pgPool.query('DELETE FROM languages WHERE code = $1', [cleanCode]);
      await logAudit('DELETE_LANGUAGE', 'languages', { details: { code: cleanCode } });
    } catch {}

    // Invalidate cache
    await cacheDel(CACHE_KEY_ACTIVE_LANGUAGES);

    res.json({ success: true, message: `Đã xóa ngôn ngữ "${lang.nativeName}" khỏi hệ thống` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Lỗi xóa ngôn ngữ: ' + err.message });
  }
});

/**
 * Helper: Dịch một đoạn văn bản ngắn qua Neural Machine Translation
 * 1. Google Translate dict-chrome-ex (phản hồi 200 tức thì, hỗ trợ 100+ ngôn ngữ, không bị rate-limit)
 * 2. MyMemory Translated API
 * 3. Google GTX fallback
 */
export async function fetchSingleChunkNMT(chunk: string, targetLang: string): Promise<string> {
  if (!chunk || !chunk.trim()) return '';
  const cleanLang = targetLang.toLowerCase().trim();

  // 1. Thử Google Translate dict-chrome-ex (siêu tốc, ổn định, hỗ trợ hơn 100+ ngôn ngữ, không bị lỗi 429 gtx)
  try {
    const chromeExUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(cleanLang)}&q=${encodeURIComponent(chunk.trim())}`;
    const chromeExRes = await fetch(chromeExUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://translate.google.com/'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (chromeExRes.ok) {
      const data: any = await chromeExRes.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === 'string' && data[0].trim()) {
          return cleanUpNMTOutput(data[0].trim(), chunk, cleanLang);
        }
        if (Array.isArray(data[0])) {
          // data[0] có cấu trúc [translatedText, sourceLang] ví dụ ["Introduire", "vi"]
          const first = data[0][0];
          if (typeof first === 'string' && first.trim()) {
            return cleanUpNMTOutput(first.trim(), chunk, cleanLang);
          }
        }
      }
    }
  } catch (exErr: any) {
    // Chuyển tiếp fallback
  }

  // 2. Thử MyMemory API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.trim())}&langpair=vi|${encodeURIComponent(cleanLang)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data: any = await res.json();
      if (data?.responseData?.translatedText) {
        let result: string = data.responseData.translatedText;
        result = result
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        if (!result.toLowerCase().startsWith('mymemory warning') && !result.toLowerCase().includes('quota exceeded') && result.trim() !== chunk.trim()) {
          return result;
        }
      }
    }
  } catch (err: any) {
    // Chuyển tiếp fallback
  }

  // 3. Fallback Google Translate GTX
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(cleanLang)}&dt=t&q=${encodeURIComponent(chunk.trim())}`;
    const gtxRes = await fetch(gtxUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });
    if (gtxRes.ok) {
      const gtxData: any = await gtxRes.json();
      if (Array.isArray(gtxData) && Array.isArray(gtxData[0])) {
        const trans = gtxData[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (trans && trans.trim()) {
          return trans;
        }
      }
    }
  } catch (gtxErr: any) {
    console.warn('[Google GTX fallback error]:', gtxErr.message);
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
    else if (cleanLang.startsWith('ru')) googleLang = 'ru';
    else if (cleanLang.startsWith('it')) googleLang = 'it';
    else if (cleanLang.startsWith('id')) googleLang = 'id';
    else if (cleanLang.startsWith('ms')) googleLang = 'ms';
    else if (cleanLang.startsWith('pt')) googleLang = 'pt';
    else if (cleanLang.startsWith('ar')) googleLang = 'ar';
    else if (cleanLang.startsWith('hi')) googleLang = 'hi';
    else if (cleanLang.startsWith('nl')) googleLang = 'nl';
    else if (cleanLang.startsWith('pl')) googleLang = 'pl';
    else if (cleanLang.startsWith('sv')) googleLang = 'sv';
    else if (cleanLang.startsWith('tr')) googleLang = 'tr';
    else if (cleanLang.startsWith('el')) googleLang = 'el';
    else if (cleanLang.startsWith('km')) googleLang = 'km';
    else if (cleanLang.startsWith('lo')) googleLang = 'lo';
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

    // Tách kịch bản thành các đoạn nhỏ dưới 140 ký tự theo dấu câu để Google TTS đọc mượt mà không bị ngắt
    const splitTextIntoChunks = (str: string, maxLen = 140): string[] => {
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

    const textChunks = splitTextIntoChunks(text, 140);
    const audioBuffers: Buffer[] = [];

    // Hàm gọi TTS với cơ chế tự động chuyển đổi endpoint dự phòng và timeout an toàn
    const fetchTtsChunk = async (chunkText: string): Promise<Buffer | null> => {
      const endpoints = [
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(chunkText)}`,
        `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=gtx&q=${encodeURIComponent(chunkText)}`,
        `https://translate.google.com.vn/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(chunkText)}`
      ];

      for (const ttsUrl of endpoints) {
        try {
          const fetchAudio = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Referer': 'https://translate.google.com/'
            },
            signal: AbortSignal.timeout(7000)
          });
          if (fetchAudio.ok) {
            const arrayBuf = await fetchAudio.arrayBuffer();
            if (arrayBuf.byteLength > 100) {
              return Buffer.from(arrayBuf);
            }
          }
        } catch (e: any) {
          console.warn(`[Google TTS endpoint fallback (${googleLang})]:`, e.message);
        }
      }
      return null;
    };

    for (const chunk of textChunks) {
      if (!chunk.trim()) continue;
      const buf = await fetchTtsChunk(chunk.trim());
      if (buf) {
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length > 0) {
      const combinedBuffer = Buffer.concat(audioBuffers);
      fs.writeFileSync(filePath, combinedBuffer);
    } else {
      throw new Error(`Không thể kết nối đến dịch vụ tổng hợp giọng nói cho ngôn ngữ [${cleanLang.toUpperCase()}]. Vui lòng thử lại sau giây lát.`);
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

