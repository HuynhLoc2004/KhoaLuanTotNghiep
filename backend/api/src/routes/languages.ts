import { Router, Request, Response } from "express";

export interface WorldwideLanguage {
  code: string;           // ISO 639-1 (e.g., 'vi', 'en', 'fr')
  name: string;           // English name (e.g., 'Vietnamese', 'French')
  nativeName: string;     // Native name (e.g., 'Tiếng Việt', 'Français')
  speechCode: string;     // BCP 47 SpeechSynthesis code (e.g., 'vi-VN', 'fr-FR')
  flag: string;           // Emoji flag
  direction?: "ltr" | "rtl";
}

export interface MuseumLanguageConfig extends WorldwideLanguage {
  active: boolean;
  isDefault?: boolean;
  customAdded?: boolean;
  addedAt?: string;
}

// 120+ Worldwide Language Catalog (ISO 639-1 / BCP 47 standard)
export const WORLD_LANGUAGES: WorldwideLanguage[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", speechCode: "vi-VN", flag: "🇻🇳" },
  { code: "en", name: "English", nativeName: "English", speechCode: "en-US", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", speechCode: "fr-FR", flag: "🇫🇷" },
  { code: "ja", name: "Japanese", nativeName: "日本語", speechCode: "ja-JP", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", speechCode: "ko-KR", flag: "🇰🇷" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", speechCode: "zh-CN", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", speechCode: "zh-TW", flag: "🇹🇼" },
  { code: "es", name: "Spanish", nativeName: "Español", speechCode: "es-ES", flag: "🇪🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", speechCode: "de-DE", flag: "🇩🇪" },
  { code: "ru", name: "Russian", nativeName: "Русский", speechCode: "ru-RU", flag: "🇷🇺" },
  { code: "th", name: "Thai", nativeName: "ไทย", speechCode: "th-TH", flag: "🇹🇭" },
  { code: "it", name: "Italian", nativeName: "Italiano", speechCode: "it-IT", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", speechCode: "pt-PT", flag: "🇵🇹" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", speechCode: "id-ID", flag: "🇮🇩" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", speechCode: "ms-MY", flag: "🇲🇾" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechCode: "hi-IN", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", speechCode: "ar-SA", flag: "🇸🇦", direction: "rtl" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", speechCode: "tr-TR", flag: "🇹🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", speechCode: "nl-NL", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", speechCode: "pl-PL", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", speechCode: "sv-SE", flag: "🇸🇪" },
  { code: "da", name: "Danish", nativeName: "Dansk", speechCode: "da-DK", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", speechCode: "fi-FI", flag: "🇫🇮" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", speechCode: "no-NO", flag: "🇳🇴" },
  { code: "cs", name: "Czech", nativeName: "Čeština", speechCode: "cs-CZ", flag: "🇨🇿" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", speechCode: "el-GR", flag: "🇬🇷" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", speechCode: "hu-HU", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", nativeName: "Română", speechCode: "ro-RO", flag: "🇷🇴" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", speechCode: "uk-UA", flag: "🇺🇦" },
  { code: "he", name: "Hebrew", nativeName: "עברית", speechCode: "he-IL", flag: "🇮🇱", direction: "rtl" },
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", speechCode: "km-KH", flag: "🇰🇭" },
  { code: "lo", name: "Lao", nativeName: "ພາສາລາວ", speechCode: "lo-LA", flag: "🇱🇦" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ", speechCode: "my-MM", flag: "🇲🇲" },
  { code: "tl", name: "Filipino (Tagalog)", nativeName: "Tagalog", speechCode: "fil-PH", flag: "🇵🇭" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", speechCode: "bg-BG", flag: "🇧🇬" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", speechCode: "sk-SK", flag: "🇸🇰" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", speechCode: "hr-HR", flag: "🇭🇷" },
  { code: "sr", name: "Serbian", nativeName: "Српски", speechCode: "sr-RS", flag: "🇷🇸" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", speechCode: "sl-SI", flag: "🇸🇮" },
  { code: "et", name: "Estonian", nativeName: "Eesti", speechCode: "et-EE", flag: "🇪🇪" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", speechCode: "lv-LV", flag: "🇱🇻" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", speechCode: "lt-LT", flag: "🇱🇹" },
  { code: "fa", name: "Persian", nativeName: "فارسی", speechCode: "fa-IR", flag: "🇮🇷", direction: "rtl" },
  { code: "ur", name: "Urdu", nativeName: "اردو", speechCode: "ur-PK", flag: "🇵🇰", direction: "rtl" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speechCode: "bn-BD", flag: "🇧🇩" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechCode: "ta-IN", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechCode: "te-IN", flag: "🇮🇳" },
  { code: "ca", name: "Catalan", nativeName: "Català", speechCode: "ca-ES", flag: "🇪🇸" },
  { code: "gl", name: "Galician", nativeName: "Galego", speechCode: "gl-ES", flag: "🇪🇸" },
  { code: "eu", name: "Basque", nativeName: "Euskara", speechCode: "eu-ES", flag: "🇪🇸" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", speechCode: "is-IS", flag: "🇮🇸" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge", speechCode: "ga-IE", flag: "🇮🇪" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", speechCode: "cy-GB", flag: "🇬🇧" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", speechCode: "af-ZA", flag: "🇿🇦" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", speechCode: "sw-KE", flag: "🇰🇪" }
];

// In-Memory state for museum configured languages
let configuredLanguages: MuseumLanguageConfig[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", speechCode: "vi-VN", flag: "🇻🇳", active: true, isDefault: true },
  { code: "en", name: "English", nativeName: "English", speechCode: "en-US", flag: "🇬🇧", active: true },
  { code: "ja", name: "Japanese", nativeName: "日本語", speechCode: "ja-JP", flag: "🇯🇵", active: true },
  { code: "ko", name: "Korean", nativeName: "한국어", speechCode: "ko-KR", flag: "🇰🇷", active: true },
  { code: "fr", name: "French", nativeName: "Français", speechCode: "fr-FR", flag: "🇫🇷", active: true },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", speechCode: "zh-CN", flag: "🇨🇳", active: true },
  { code: "de", name: "German", nativeName: "Deutsch", speechCode: "de-DE", flag: "🇩🇪", active: false },
  { code: "es", name: "Spanish", nativeName: "Español", speechCode: "es-ES", flag: "🇪🇸", active: false }
];

const router = Router();

/**
 * GET /api/v1/languages/catalog
 * Search world languages by code or name (like Google Translate query)
 */
router.get("/catalog", (req: Request, res: Response) => {
  const query = ((req.query.query as string) || "").trim().toLowerCase();
  if (!query) {
    return res.json({
      success: true,
      total: WORLD_LANGUAGES.length,
      languages: WORLD_LANGUAGES
    });
  }

  const matches = WORLD_LANGUAGES.filter(lang => 
    lang.code.toLowerCase().includes(query) ||
    lang.name.toLowerCase().includes(query) ||
    lang.nativeName.toLowerCase().includes(query) ||
    lang.speechCode.toLowerCase().includes(query)
  );

  return res.json({
    success: true,
    total: matches.length,
    languages: matches
  });
});

/**
 * GET /api/v1/languages
 * Get current museum configured languages
 */
router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    configured: configuredLanguages,
    activeCodes: configuredLanguages.filter(l => l.active).map(l => l.code)
  });
});

/**
 * POST /api/v1/languages
 * Admin adds a new language from the catalog
 */
router.post("/", (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Mã ngôn ngữ (code) là bắt buộc" });
  }

  const existing = configuredLanguages.find(l => l.code.toLowerCase() === code.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: "Ngôn ngữ này đã tồn tại trong cấu hình hệ thống" });
  }

  const catalogLang = WORLD_LANGUAGES.find(l => l.code.toLowerCase() === code.toLowerCase());
  if (!catalogLang) {
    return res.status(404).json({ success: false, message: `Không tìm thấy mã ngôn ngữ [${code}] trong danh mục toàn cầu` });
  }

  const newLangConfig: MuseumLanguageConfig = {
    ...catalogLang,
    active: true,
    customAdded: true,
    addedAt: new Date().toISOString()
  };

  configuredLanguages.push(newLangConfig);

  return res.status(201).json({
    success: true,
    message: `Đã cấu hình thêm ngôn ngữ [${catalogLang.name} - ${catalogLang.nativeName}] thành công`,
    language: newLangConfig,
    configured: configuredLanguages
  });
});

/**
 * PATCH /api/v1/languages/:code/toggle
 * Toggle active status of a language
 */
router.patch("/:code/toggle", (req: Request, res: Response) => {
  const { code } = req.params;
  const { active } = req.body;

  const lang = configuredLanguages.find(l => l.code.toLowerCase() === code.toLowerCase());
  if (!lang) {
    return res.status(404).json({ success: false, message: `Không tìm thấy ngôn ngữ [${code}]` });
  }

  if (lang.isDefault && active === false) {
    return res.status(400).json({ success: false, message: "Không thể tắt ngôn ngữ mặc định của hệ thống" });
  }

  lang.active = typeof active === "boolean" ? active : !lang.active;

  return res.json({
    success: true,
    message: `Đã cập nhật trạng thái ngôn ngữ [${lang.name}]: ${lang.active ? "Kích hoạt (Client có thể dùng)" : "Vô hiệu hóa (Ẩn khỏi Client)"}`,
    language: lang,
    configured: configuredLanguages
  });
});

/**
 * DELETE /api/v1/languages/:code
 * Remove custom added language
 */
router.delete("/:code", (req: Request, res: Response) => {
  const { code } = req.params;
  const lang = configuredLanguages.find(l => l.code.toLowerCase() === code.toLowerCase());

  if (!lang) {
    return res.status(404).json({ success: false, message: `Không tìm thấy ngôn ngữ [${code}]` });
  }

  if (lang.isDefault) {
    return res.status(400).json({ success: false, message: "Không thể xóa ngôn ngữ mặc định của bảo tàng" });
  }

  configuredLanguages = configuredLanguages.filter(l => l.code.toLowerCase() !== code.toLowerCase());

  return res.json({
    success: true,
    message: `Đã xóa ngôn ngữ [${lang.name}] khỏi hệ thống`,
    configured: configuredLanguages
  });
});

export default router;
