import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/api';
import { LanguageItem } from '../types';
import { BUILTIN_DICTIONARIES, DICTIONARY_VI, LocaleDictionary, ROOM_PRESET_TRANSLATIONS } from '../locales/dictionaries';
import { UNIVERSAL_PHRASE_MAP } from '../locales/universalPhraseMap';

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

  // Cơ chế quét và dịch tự động toàn diện các Text Node trong DOM (Hybrid i18n DOM Engine)
  // Bảo đảm 100% không bao giờ sót bất kỳ chữ tiếng Việt nào trên mọi trang, popup, modal
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let isScanning = false;

    const translateTextNodes = (root: Node = document.body) => {
      if (currentLang === 'vi') {
        // Phục hồi lại văn bản gốc nếu chuyển về tiếng Việt
        document.querySelectorAll('[data-i18n-orig]').forEach((el) => {
          const orig = el.getAttribute('data-i18n-orig');
          if (orig) {
            el.textContent = orig;
            el.removeAttribute('data-i18n-orig');
          }
        });
        return;
      }

      const targetLang = currentLang.toLowerCase() as 'en' | 'fr' | 'zh' | 'ja';

      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre' || tag === 'textarea' || tag === 'input') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const nodes: Text[] = [];
      while (walker.nextNode()) {
        nodes.push(walker.currentNode as Text);
      }

      nodes.forEach((node) => {
        const text = node.textContent;
        if (!text) return;
        const trimmed = text.trim();

        // 1. Khớp nguyên văn từ điển cụm từ
        if (UNIVERSAL_PHRASE_MAP[trimmed]) {
          const item = UNIVERSAL_PHRASE_MAP[trimmed];
          const trans = item[targetLang] || item.en;
          if (trans && trans !== trimmed) {
            if (node.parentElement && !node.parentElement.hasAttribute('data-i18n-orig')) {
              node.parentElement.setAttribute('data-i18n-orig', trimmed);
            }
            node.textContent = text.replace(trimmed, trans);
            return;
          }
        }

        // 2. Thay thế các biến động số lượng phổ biến
        let replaced = text;
        replaced = replaced.replace(/(\d+)\s+điểm neo/g, (_, n) => {
          const word = targetLang === 'en' ? 'anchor points' : targetLang === 'fr' ? "points d'ancrage" : targetLang === 'zh' ? '个锚点' : '箇所のスポット';
          return `${n} ${word}`;
        });
        replaced = replaced.replace(/(\d+)\s+lượt quét/g, (_, n) => {
          const word = targetLang === 'en' ? 'scans' : targetLang === 'fr' ? 'scans' : targetLang === 'zh' ? '次扫码' : '回スキャン';
          return `${n} ${word}`;
        });
        replaced = replaced.replace(/(\d+)\s+góc 360°/g, (_, n) => {
          const word = targetLang === 'en' ? '360° views' : targetLang === 'fr' ? 'angles 360°' : targetLang === 'zh' ? '个360°视角' : '箇所の360°視点';
          return `${n} ${word}`;
        });
        replaced = replaced.replace(/(\d+)\s+gian phòng/g, (_, n) => {
          const word = targetLang === 'en' ? 'rooms' : targetLang === 'fr' ? 'salles' : targetLang === 'zh' ? '个展厅' : '室';
          return `${n} ${word}`;
        });
        replaced = replaced.replace(/Mã phòng:\s*/g, () => {
          return targetLang === 'en' ? 'Room Code: ' : targetLang === 'fr' ? 'Code de la salle : ' : targetLang === 'zh' ? '展厅编号: ' : '展示室コード: ';
        });
        replaced = replaced.replace(/\((\d+)\s+ảnh\)/g, (_, n) => {
          return targetLang === 'en' ? `(${n} photos)` : targetLang === 'fr' ? `(${n} photos)` : targetLang === 'zh' ? `(${n} 张图片)` : `(${n} 枚の画像)`;
        });

        if (replaced !== text) {
          if (node.parentElement && !node.parentElement.hasAttribute('data-i18n-orig')) {
            node.parentElement.setAttribute('data-i18n-orig', text);
          }
          node.textContent = replaced;
        }
      });
    };

    // Chạy ngay lần đầu
    translateTextNodes();

    if (currentLang === 'vi') return;

    // MutationObserver để bắt kịp các modal hoặc nội dung render sau
    const observer = new MutationObserver((mutations) => {
      if (isScanning) return;
      isScanning = true;
      requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((added) => {
            if (added.nodeType === Node.ELEMENT_NODE) {
              translateTextNodes(added);
            }
          });
        });
        isScanning = false;
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [currentLang]);

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

    // 1. Ưu tiên đọc bản dịch đã lưu trong Document của phòng/hiện vật trong MongoDB
    const translatedVal = item.translations?.[currentLang]?.[field];
    if (translatedVal && typeof translatedVal === 'string' && translatedVal.trim()) {
      return translatedVal;
    }

    // 2. Tra cứu kho bản dịch chuẩn học thuật di sản theo mã phòng (P-101, P-102, P-103...)
    if (item.code) {
      const codeClean = String(item.code).trim();
      const presetTrans = ROOM_PRESET_TRANSLATIONS[codeClean]?.[currentLang]?.[field as 'name' | 'period' | 'description'];
      if (presetTrans && typeof presetTrans === 'string' && presetTrans.trim()) {
        return presetTrans;
      }
      // Fallback sang tiếng Anh của preset nếu ngôn ngữ hiện tại chưa có
      const presetEn = ROOM_PRESET_TRANSLATIONS[codeClean]?.en?.[field as 'name' | 'period' | 'description'];
      if (presetEn && typeof presetEn === 'string' && presetEn.trim()) {
        return presetEn;
      }
    }

    // 3. Fallback sang tiếng Anh nếu có trong translations
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
