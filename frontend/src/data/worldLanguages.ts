export interface WorldLanguageItem {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  flag: string;
}

export const WORLD_LANGUAGES_CATALOG: WorldLanguageItem[] = [
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
  { code: "ar", name: "Arabic", nativeName: "العربية", speechCode: "ar-SA", flag: "🇸🇦" },
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
  { code: "he", name: "Hebrew", nativeName: "עברית", speechCode: "he-IL", flag: "🇮🇱" },
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
  { code: "fa", name: "Persian", nativeName: "فارسی", speechCode: "fa-IR", flag: "🇮🇷" },
  { code: "ur", name: "Urdu", nativeName: "اردو", speechCode: "ur-PK", flag: "🇵🇰" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speechCode: "bn-BD", flag: "🇧🇩" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechCode: "ta-IN", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechCode: "te-IN", flag: "🇮🇳" },
  { code: "ca", name: "Catalan", nativeName: "Català", speechCode: "ca-ES", flag: "🇪🇸" }
];
