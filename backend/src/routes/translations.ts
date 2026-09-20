import { Router, Request, Response } from 'express';
import { Translation, ITranslation } from '../models/Translation.js';
import { Language, DEFAULT_LANGUAGES } from '../models/Language.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';
import { translateTextWithNMT } from './languages.js';

export const translationsRouter = Router();

const CACHE_BUNDLE_PREFIX = 'cache:translations:bundle:';
const CACHE_TTL_SECONDS = 3600; // 1 hour

/**
 * Invalidate bundle cache for a specific language or all languages
 */
async function invalidateBundleCache(langCode?: string) {
  try {
    if (langCode) {
      await cacheDel(`${CACHE_BUNDLE_PREFIX}${langCode.toLowerCase().trim()}`);
    } else {
      // Invalidate all standard languages
      const langs = ['vi', 'en', 'fr', 'ja', 'zh', 'ko', 'de'];
      for (const l of langs) {
        await cacheDel(`${CACHE_BUNDLE_PREFIX}${l}`);
      }
    }
  } catch (err: any) {
    console.warn('[Cache Invalidation Warning]:', err.message);
  }
}

/**
 * GET /api/translations/bundle/:langCode
 * Trả về từ điển phẳng { [key]: translatedValue } cho Client sử dụng nhanh (O(1) lookup)
 * Tự động phân tầng Fallback: Ngôn ngữ đích -> Tiếng Anh (en) -> Tiếng Việt mặc định (vi/defaultText)
 * Được tối ưu hóa bằng Redis Caching.
 */
translationsRouter.get('/bundle/:langCode', async (req: Request, res: Response) => {
  try {
    const rawLang = req.params.langCode || 'vi';
    const langCode = String(rawLang).toLowerCase().trim();
    const cacheKey = `${CACHE_BUNDLE_PREFIX}${langCode}`;

    // Kiểm tra Redis cache trước
    const cachedBundle = await cacheGet<Record<string, string>>(cacheKey);
    if (cachedBundle) {
      return res.json({
        success: true,
        langCode,
        data: cachedBundle,
        cached: true
      });
    }

    // Lấy toàn bộ từ khóa trong CSDL
    const allKeys = await Translation.find().lean();
    const bundle: Record<string, string> = {};

    for (const item of allKeys) {
      const transMap = item.translations as Record<string, string> | Map<string, string>;
      let targetText = '';

      if (transMap instanceof Map) {
        targetText = transMap.get(langCode) || '';
      } else if (transMap && typeof transMap === 'object') {
        targetText = (transMap as any)[langCode] || '';
      }

      // 3-Tier Fallback Cascade
      if (!targetText || !targetText.trim()) {
        if (langCode !== 'en') {
          // Fallback cấp 2: Tiếng Anh
          if (transMap instanceof Map) {
            targetText = transMap.get('en') || '';
          } else if (transMap && typeof transMap === 'object') {
            targetText = (transMap as any)['en'] || '';
          }
        }
        // Fallback cấp 3: Tiếng Việt mặc định
        if (!targetText || !targetText.trim()) {
          targetText = item.defaultText || item.key;
        }
      }

      bundle[item.key] = targetText;
    }

    // Lưu vào Redis cache
    await cacheSet(cacheKey, bundle, CACHE_TTL_SECONDS);

    res.json({
      success: true,
      langCode,
      data: bundle,
      cached: false
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tải gói từ điển giao diện: ' + err.message
    });
  }
});

/**
 * GET /api/translations/stats
 * Thống kê mức độ phủ sóng bản dịch theo từng ngôn ngữ trong hệ thống
 */
translationsRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalKeys = await Translation.countDocuments();
    let activeLanguages = await Language.find({ isActive: true }).lean();
    if (!activeLanguages || activeLanguages.length === 0) {
      activeLanguages = DEFAULT_LANGUAGES.map((l) => ({ ...l, _id: l.code })) as any;
    }

    const allTranslations = await Translation.find({}, 'translations').lean();

    const stats = activeLanguages.map((lang) => {
      const code = lang.code.toLowerCase();
      let translatedCount = 0;

      for (const t of allTranslations) {
        const transMap = t.translations as Record<string, string> | Map<string, string>;
        let val = '';
        if (transMap instanceof Map) {
          val = transMap.get(code) || '';
        } else if (transMap && typeof transMap === 'object') {
          val = (transMap as any)[code] || '';
        }
        if (val && val.trim().length > 0) {
          translatedCount++;
        }
      }

      const percentage = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

      return {
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        flagIcon: lang.flagIcon,
        totalKeys,
        translatedCount,
        untranslatedCount: totalKeys - translatedCount,
        percentage
      };
    });

    res.json({
      success: true,
      totalKeys,
      stats
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp thống kê độ phủ bản dịch: ' + err.message
    });
  }
});

/**
 * GET /api/translations/keys
 * Lấy danh sách từ khóa giao diện phục vụ giao diện Quản trị Admin
 * Hỗ trợ phân trang, lọc namespace, tìm kiếm, lọc chưa dịch theo ngôn ngữ
 */
translationsRouter.get('/keys', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 12);
    const namespace = req.query.namespace as string;
    const search = req.query.search as string;
    const missingFor = req.query.missingFor as string;

    const query: any = {};

    if (namespace && namespace !== 'all') {
      query.namespace = namespace;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { key: { $regex: cleanSearch, $options: 'i' } },
        { defaultText: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    if (missingFor && missingFor.trim() && missingFor.trim() !== 'vi') {
      const mLang = missingFor.trim().toLowerCase();
      // Lọc các bản ghi mà trường translations.<mLang> rỗng hoặc chưa tồn tại
      query.$or = [
        ...(query.$or || []),
        { [`translations.${mLang}`]: { $exists: false } },
        { [`translations.${mLang}`]: '' },
        { [`translations.${mLang}`]: null }
      ];
    }

    const total = await Translation.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const items = await Translation.find(query)
      .sort({ namespace: 1, key: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Chuyển Map thành plain object nếu cần để JSON trả về trơn tru
    const formatted = items.map((doc) => {
      const obj = doc.toObject();
      return {
        ...obj,
        id: obj._id,
        translations: obj.translations || {},
        isAiTranslated: obj.isAiTranslated || {}
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi tải danh sách từ khóa: ' + err.message
    });
  }
});

/**
 * POST /api/translations/keys
 * Thêm một từ khóa giao diện mới thủ công
 */
translationsRouter.post('/keys', async (req: Request, res: Response) => {
  try {
    const { key, namespace, defaultText, description, translations } = req.body;
    if (!key || !namespace || !defaultText) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đủ mã từ khóa (key), phân mục (namespace) và chuỗi gốc tiếng Việt'
      });
    }

    const cleanKey = String(key).trim();
    const exists = await Translation.findOne({ key: cleanKey });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Khóa giao diện "${cleanKey}" đã tồn tại trong từ điển`
      });
    }

    const transMap = new Map<string, string>();
    const aiMap = new Map<string, boolean>();

    transMap.set('vi', defaultText.trim());
    aiMap.set('vi', false);

    if (translations && typeof translations === 'object') {
      for (const [k, v] of Object.entries(translations)) {
        if (typeof v === 'string' && v.trim()) {
          transMap.set(k.toLowerCase().trim(), v.trim());
          aiMap.set(k.toLowerCase().trim(), false);
        }
      }
    }

    const created = await Translation.create({
      key: cleanKey,
      namespace,
      defaultText: defaultText.trim(),
      description: description ? description.trim() : '',
      translations: transMap,
      isAiTranslated: aiMap
    });

    await invalidateBundleCache();

    res.status(201).json({
      success: true,
      data: created,
      message: `Đã thêm khóa "${cleanKey}" thành công`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi thêm từ khóa mới: ' + err.message
    });
  }
});

/**
 * PUT /api/translations/keys/:id
 * Chỉnh sửa nội dung bản dịch của một từ khóa
 */
translationsRouter.put('/keys/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Translation.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ khóa chỉ định'
      });
    }

    const { defaultText, description, namespace, translations } = req.body;

    if (defaultText !== undefined) doc.defaultText = String(defaultText).trim();
    if (description !== undefined) doc.description = String(description).trim();
    if (namespace !== undefined) doc.namespace = namespace;

    if (translations && typeof translations === 'object') {
      for (const [lang, val] of Object.entries(translations)) {
        const cleanLang = lang.toLowerCase().trim();
        if (val !== undefined && val !== null) {
          doc.translations.set(cleanLang, String(val).trim());
          // Khi quản trị viên trực tiếp chỉnh sửa bằng tay, đánh dấu không phải AI dịch
          doc.isAiTranslated.set(cleanLang, false);
        }
      }
    }

    await doc.save();
    await invalidateBundleCache();

    res.json({
      success: true,
      data: doc,
      message: `Đã cập nhật bản dịch cho khóa "${doc.key}" thành công`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lưu bản dịch: ' + err.message
    });
  }
});

/**
 * DELETE /api/translations/keys/:id
 * Xóa một từ khóa khỏi từ điển hệ thống
 */
translationsRouter.delete('/keys/:id', async (req: Request, res: Response) => {
  try {
    const doc = await Translation.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ khóa'
      });
    }

    await Translation.findByIdAndDelete(req.params.id);
    await invalidateBundleCache();

    res.json({
      success: true,
      message: `Đã xóa từ khóa "${doc.key}" khỏi từ điển`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi xóa từ khóa: ' + err.message
    });
  }
});

/**
 * POST /api/translations/single-translate
 * Dịch tự động 1 từ khóa cụ thể bằng AI / NMT
 */
translationsRouter.post('/single-translate', async (req: Request, res: Response) => {
  try {
    const { keyId, targetLang } = req.body;
    if (!keyId || !targetLang) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp mã ID từ khóa (keyId) và ngôn ngữ đích (targetLang)'
      });
    }

    const doc = await Translation.findById(keyId);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ khóa'
      });
    }

    const tLang = String(targetLang).toLowerCase().trim();
    if (tLang === 'vi') {
      return res.status(400).json({
        success: false,
        message: 'Không thể dịch tiếng Việt sang tiếng Việt'
      });
    }

    const sourceText = doc.defaultText || doc.key;
    const translatedText = await translateTextWithNMT(sourceText, tLang);

    if (translatedText && translatedText.trim()) {
      doc.translations.set(tLang, translatedText.trim());
      doc.isAiTranslated.set(tLang, true);
      await doc.save();
      await invalidateBundleCache(tLang);

      return res.json({
        success: true,
        data: {
          key: doc.key,
          targetLang: tLang,
          translatedText: translatedText.trim()
        },
        message: `Đã dịch tự động từ khóa "${doc.key}" sang ${tLang}`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Công cụ dịch không trả về kết quả hợp lệ'
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi dịch từ khóa: ' + err.message
    });
  }
});

/**
 * POST /api/translations/batch-translate
 * Dịch đồng loạt 100% các từ khóa chưa dịch của một ngôn ngữ bằng AI
 * Giúp đưa độ phủ bản dịch lên 100% chỉ với 1 cú click!
 */
translationsRouter.post('/batch-translate', async (req: Request, res: Response) => {
  try {
    const { targetLang, namespace, overwrite } = req.body;
    if (!targetLang) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ngôn ngữ đích cần dịch đồng loạt'
      });
    }

    const tLang = String(targetLang).toLowerCase().trim();
    if (tLang === 'vi') {
      return res.status(400).json({
        success: false,
        message: 'Tiếng Việt là ngôn ngữ gốc, không cần dịch đồng loạt'
      });
    }

    const query: any = {};
    if (namespace && namespace !== 'all') {
      query.namespace = namespace;
    }

    const allKeys = await Translation.find(query);
    let translatedCount = 0;
    let skippedCount = 0;

    for (const doc of allKeys) {
      const existingVal = doc.translations.get(tLang);
      if (!overwrite && existingVal && existingVal.trim().length > 0) {
        skippedCount++;
        continue;
      }

      const sourceText = doc.defaultText || doc.key;
      const translated = await translateTextWithNMT(sourceText, tLang);

      if (translated && translated.trim()) {
        doc.translations.set(tLang, translated.trim());
        doc.isAiTranslated.set(tLang, true);
        await doc.save();
        translatedCount++;
      }

      // Giãn cách nhẹ 150ms để bảo vệ rate limit API dịch
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    await invalidateBundleCache(tLang);

    res.json({
      success: true,
      data: {
        targetLang: tLang,
        totalKeys: allKeys.length,
        translatedCount,
        skippedCount
      },
      message: `Đã dịch hoàn tất ${translatedCount} từ khóa sang ngôn ngữ ${tLang.toUpperCase()}`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi dịch đồng loạt: ' + err.message
    });
  }
});
