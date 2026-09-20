import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/api';
import { LanguageItem } from '../types';
import { BUILTIN_DICTIONARIES, DICTIONARY_VI, LocaleDictionary } from '../locales/dictionaries';

export interface ClientTranslationContextType {
  currentLang: string;
  activeLanguages: LanguageItem[];
  isLoading: boolean;
  changeLanguage: (langCode: string) => Promise<void>;
  activeLanguageInfo: LanguageItem | undefined;
  t: (key: string, fallback?: string) => string;
  localize: (item: any, field: string, fallback?: string) => string;
}

const ClientTranslationContext = createContext<ClientTranslationContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'museum_client_lang';
const BUNDLE_STORAGE_PREFIX = 'museum_i18n_bundle_';

export const ClientTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Đọc đồng bộ ngay từ frame đầu tiên để không bao giờ bị FOUT giật chữ
  const [currentLang, setCurrentLang] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'vi';
    } catch {
      return 'vi';
    }
  });

  const [activeLanguages, setActiveLanguages] = useState<LanguageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Bộ từ điển lưu trữ trong RAM, hợp nhất các gói có sẵn và các gói tải về
  const [dictionaries, setDictionaries] = useState<Record<string, LocaleDictionary>>(() => {
    const initial: Record<string, LocaleDictionary> = { ...BUILTIN_DICTIONARIES };
    try {
      // Đọc các gói từ điển động đã cache trong localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BUNDLE_STORAGE_PREFIX)) {
          const lang = key.replace(BUNDLE_STORAGE_PREFIX, '');
          const raw = localStorage.getItem(key);
          if (raw) {
            initial[lang] = { ...(initial[lang] || {}), ...JSON.parse(raw) };
          }
        }
      }
    } catch {
      // Ignored
    }
    return initial;
  });

  // Tẩy sạch các cookie của Google Translate trước đây nếu còn lưu
  useEffect(() => {
    try {
      const host = window.location.hostname;
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
    } catch {
      // Ignored
    }
  }, []);

  // Tải danh sách các ngôn ngữ do Admin cấu hình kích hoạt
  const fetchActiveLanguages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/languages/active`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setActiveLanguages(json.data);
        }
      }
    } catch (err) {
      console.warn('[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt:', err);
    }
  }, []);

  useEffect(() => {
    fetchActiveLanguages();
  }, [fetchActiveLanguages]);

  // Nạp gói từ điển nếu là ngôn ngữ mới chưa có sẵn trong builtin
  const ensureLanguageBundle = useCallback(async (langCode: string) => {
    const clean = langCode.toLowerCase().trim();
    if (dictionaries[clean] && Object.keys(dictionaries[clean]).length > 10) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/languages/bundle/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDictionaries((prev) => {
            const updated = { ...prev, [clean]: { ...(prev[clean] || {}), ...json.data } };
            try {
              localStorage.setItem(`${BUNDLE_STORAGE_PREFIX}${clean}`, JSON.stringify(json.data));
            } catch {
              // Ignored
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('[ClientTranslation] Không thể nạp gói từ điển động cho:', clean, err);
    } finally {
      setIsLoading(false);
    }
  }, [dictionaries]);

  // Hàm chuyển đổi ngôn ngữ hiển thị
  const changeLanguage = async (langCode: string) => {
    const clean = langCode.toLowerCase().trim();
    setCurrentLang(clean);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, clean);
      document.documentElement.lang = clean;
    } catch {
      // Ignored
    }
    if (!BUILTIN_DICTIONARIES[clean]) {
      await ensureLanguageBundle(clean);
    }
  };

  // Tra cứu chuỗi dịch thuật siêu tốc O(1)
  const t = useCallback((key: string, fallback?: string): string => {
    if (currentLang === 'vi') {
      return DICTIONARY_VI[key] || fallback || key;
    }
    const currentDict = dictionaries[currentLang] || BUILTIN_DICTIONARIES[currentLang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback sang tiếng Anh nếu có
    if (BUILTIN_DICTIONARIES.en && BUILTIN_DICTIONARIES.en[key]) {
      return BUILTIN_DICTIONARIES.en[key];
    }
    // Fallback sang tiếng Việt gốc hoặc chuỗi mặc định
    return DICTIONARY_VI[key] || fallback || key;
  }, [currentLang, dictionaries]);

  // Bản địa hóa nội dung động từ Database (Phòng, Hiện vật, Điểm neo)
  const localize = useCallback((item: any, field: string, fallback?: string): string => {
    if (!item) return fallback || '';
    if (currentLang === 'vi') {
      return item[field] || fallback || '';
    }
    // Ưu tiên đọc bản dịch đã lưu trong Document của phòng/hiện vật
    const translatedVal = item.translations?.[currentLang]?.[field];
    if (translatedVal && typeof translatedVal === 'string' && translatedVal.trim()) {
      return translatedVal;
    }
    // Fallback sang tiếng Anh nếu có
    const enVal = item.translations?.en?.[field];
    if (enVal && typeof enVal === 'string' && enVal.trim()) {
      return enVal;
    }
    return item[field] || fallback || '';
  }, [currentLang]);

  const activeLanguageInfo = activeLanguages.find((l) => l.code.toLowerCase() === currentLang.toLowerCase()) || {
    code: currentLang,
    name: currentLang.toUpperCase(),
    nativeName: currentLang === 'vi' ? 'Tiếng Việt' : currentLang === 'en' ? 'English' : currentLang === 'fr' ? 'Français' : currentLang.toUpperCase(),
    flagIcon: currentLang === 'vi' ? '🇻🇳' : currentLang === 'en' ? '🇬🇧' : currentLang === 'fr' ? '🇫🇷' : currentLang === 'zh' ? '🇨🇳' : currentLang === 'ja' ? '🇯🇵' : '🌐',
    isDefault: currentLang === 'vi',
    isActive: true,
    order: 1
  };

  return (
    <ClientTranslationContext.Provider
      value={{
        currentLang,
        activeLanguages,
        isLoading,
        changeLanguage,
        activeLanguageInfo,
        t,
        localize
      }}
    >
      {children}
    </ClientTranslationContext.Provider>
  );
};

export const useClientTranslation = () => {
  const context = useContext(ClientTranslationContext);
  if (!context) {
    throw new Error('useClientTranslation must be used within a ClientTranslationProvider');
  }
  return context;
};
