import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, API_BASE } from '../services/api';
import { LanguageItem } from '../types';

interface ClientTranslationContextType {
  currentLang: string;
  activeLanguages: LanguageItem[];
  isLoading: boolean;
  changeLanguage: (langCode: string) => Promise<void>;
  t: (key: string, defaultFallback?: string) => string;
  activeLanguageInfo: LanguageItem | undefined;
}

const ClientTranslationContext = createContext<ClientTranslationContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'museum_client_lang';
const CACHE_BUNDLE_PREFIX = 'museum_bundle_';

export const ClientTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'vi';
    } catch {
      return 'vi';
    }
  });

  const [activeLanguages, setActiveLanguages] = useState<LanguageItem[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    try {
      const initialLang = localStorage.getItem(STORAGE_LANG_KEY) || 'vi';
      const cached = localStorage.getItem(`${CACHE_BUNDLE_PREFIX}${initialLang}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignored
    }
    return {};
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load danh mục ngôn ngữ kích hoạt
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

  // Tải gói từ điển tương ứng với ngôn ngữ
  const fetchBundle = useCallback(async (langCode: string) => {
    setIsLoading(true);
    try {
      const bundle = await api.getTranslationBundle(langCode);
      setTranslations(bundle);
      try {
        localStorage.setItem(`${CACHE_BUNDLE_PREFIX}${langCode}`, JSON.stringify(bundle));
      } catch {
        // Ignored
      }
    } catch (err) {
      console.warn(`[ClientTranslation] Lỗi nạp gói từ điển cho ${langCode}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveLanguages();
    fetchBundle(currentLang);
  }, [fetchActiveLanguages, fetchBundle, currentLang]);

  // Chuyển đổi ngôn ngữ
  const changeLanguage = async (langCode: string) => {
    const clean = langCode.toLowerCase().trim();
    if (clean === currentLang) return;

    setCurrentLang(clean);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, clean);
      document.documentElement.lang = clean;
    } catch {
      // Ignored
    }

    // Nạp gói bundle tương ứng
    await fetchBundle(clean);
  };

  // Hàm dịch nhanh O(1)
  const t = useCallback(
    (key: string, defaultFallback?: string): string => {
      if (translations && translations[key]) {
        return translations[key];
      }
      return defaultFallback !== undefined ? defaultFallback : key;
    },
    [translations]
  );

  const activeLanguageInfo = activeLanguages.find((l) => l.code.toLowerCase() === currentLang.toLowerCase()) || {
    code: currentLang,
    name: currentLang.toUpperCase(),
    nativeName: currentLang.toUpperCase(),
    flagIcon: '🌐',
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
        t,
        activeLanguageInfo
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
