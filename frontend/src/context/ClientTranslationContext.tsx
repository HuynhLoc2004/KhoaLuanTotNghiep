import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/api';
import { LanguageItem } from '../types';

interface ClientTranslationContextType {
  currentLang: string;
  activeLanguages: LanguageItem[];
  isLoading: boolean;
  changeLanguage: (langCode: string) => Promise<void>;
  activeLanguageInfo: LanguageItem | undefined;
}

const ClientTranslationContext = createContext<ClientTranslationContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'museum_client_lang';

// Chuyển mã ngôn ngữ nội bộ sang mã chuẩn của Google Translate
const mapToGoogleLang = (code: string): string => {
  const clean = code.toLowerCase().trim();
  if (clean === 'zh' || clean === 'cn') return 'zh-CN';
  if (clean === 'tw') return 'zh-TW';
  return clean;
};

// Áp dụng dịch thuật tự động toàn bộ trang web
const applyAutoTranslation = (targetCode: string) => {
  const clean = targetCode.toLowerCase().trim();
  const googleCode = mapToGoogleLang(clean);

  try {
    localStorage.setItem(STORAGE_LANG_KEY, clean);
    document.documentElement.lang = clean;
  } catch {
    // Ignored
  }

  if (clean === 'vi') {
    // Quay trở về tiếng Việt gốc: xóa sạch cookie googtrans trên mọi domain scope
    const host = window.location.hostname;
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${host}; path=/;`;
    
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (combo) {
      combo.value = 'vi';
      combo.dispatchEvent(new Event('change'));
    }
    // Reload để phục hồi DOM tiếng Việt nguyên bản hoàn hảo
    setTimeout(() => {
      window.location.reload();
    }, 150);
    return;
  }

  // Thiết lập cookie dịch toàn diện cho Google Translate Element
  const cookieVal = `/vi/${googleCode}`;
  const host = window.location.hostname;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; domain=${host}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/;`;

  const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (combo) {
    combo.value = googleCode;
    combo.dispatchEvent(new Event('change'));
  } else {
    // Nếu widget đang khởi tạo, reload trang nhẹ để Google Translate áp dụng cookie tự động
    setTimeout(() => {
      window.location.reload();
    }, 150);
  }
};

export const ClientTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'vi';
    } catch {
      return 'vi';
    }
  });

  const [activeLanguages, setActiveLanguages] = useState<LanguageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Tự động kiểm tra và duy trì ngôn ngữ đã chọn khi tải trang
  useEffect(() => {
    if (currentLang && currentLang !== 'vi') {
      const timer = setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo && combo.value !== mapToGoogleLang(currentLang)) {
          combo.value = mapToGoogleLang(currentLang);
          combo.dispatchEvent(new Event('change'));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLang]);

  // Hàm chuyển đổi ngôn ngữ hiển thị
  const changeLanguage = async (langCode: string) => {
    const clean = langCode.toLowerCase().trim();
    setCurrentLang(clean);
    setIsLoading(true);
    try {
      applyAutoTranslation(clean);
    } finally {
      setIsLoading(false);
    }
  };

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
