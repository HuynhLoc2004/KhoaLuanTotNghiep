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
const DYNAMIC_I18N_STORAGE_PREFIX = 'museum_dynamic_i18n_';
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;

// Kiểm tra tính hợp lệ của bản dịch, loại bỏ các trường hợp dịch giả hoặc bị lặp lại tiếng Việt
function isValidTranslation(trans: string | undefined | null, original: string, targetLang: string): string | null {
  if (!trans) return null;
  const tTrim = trans.trim();
  const oTrim = original.trim();
  if (!tTrim) return null;
  // Nếu ngôn ngữ đích không phải tiếng Việt mà bản dịch giống hệt văn bản gốc, coi như chưa dịch
  if (targetLang !== 'vi' && tTrim.toLowerCase() === oTrim.toLowerCase()) {
    return null;
  }
  return trans;
}

// Bộ trợ giúp tra cứu cụm từ đa năng mở rộng (xử lý dấu câu, hai chấm, ngoặc đơn, đạn tròn, dấu gạch)
export function lookupUniversalPhrase(raw: string, targetLang: string): string | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (!clean) return null;

  const tLang = targetLang.toLowerCase() as 'en' | 'fr' | 'zh' | 'ja';

  // 1. Khớp chính xác 100% trong từ điển cụm từ
  if (UNIVERSAL_PHRASE_MAP[clean]) {
    const item = UNIVERSAL_PHRASE_MAP[clean];
    const trans = (item as any)[targetLang] || item[tLang] || item.en || null;
    const valid = isValidTranslation(trans, clean, targetLang);
    if (valid) return valid;
  }

  // 2. Xử lý dấu hai chấm ở cuối: "Mã phòng:" -> "Room Code:"
  if (clean.endsWith(':')) {
    const core = clean.slice(0, -1).trim();
    if (UNIVERSAL_PHRASE_MAP[core]) {
      const item = UNIVERSAL_PHRASE_MAP[core];
      const trans = (item as any)[targetLang] || item[tLang] || item.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${valid}:`;
    }
  }

  // 3. Xử lý dấu ba chấm: "Đang tải..." -> "Loading..."
  if (clean.endsWith('...') || clean.endsWith('…')) {
    const core = clean.replace(/\.{3}$|…$/, '').trim();
    if (UNIVERSAL_PHRASE_MAP[core]) {
      const item = UNIVERSAL_PHRASE_MAP[core];
      const trans = (item as any)[targetLang] || item[tLang] || item.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${valid}...`;
    }
  }

  // 4. Xử lý trong dấu ngoặc đơn: "(Tối đa 5MB)" -> "(Max 5MB)"
  if (clean.startsWith('(') && clean.endsWith(')')) {
    const core = clean.slice(1, -1).trim();
    if (UNIVERSAL_PHRASE_MAP[core]) {
      const item = UNIVERSAL_PHRASE_MAP[core];
      const trans = (item as any)[targetLang] || item[tLang] || item.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `(${valid})`;
    }
  }

  // 5. Xử lý ký tự đầu dòng (bullet, số thứ tự, gạch ngang, mũi tên)
  const bulletMatch = clean.match(/^([•\-\*›»\d+\.]\s+)(.*)$/);
  if (bulletMatch) {
    const prefix = bulletMatch[1];
    const core = bulletMatch[2].trim();
    if (UNIVERSAL_PHRASE_MAP[core]) {
      const item = UNIVERSAL_PHRASE_MAP[core];
      const trans = (item as any)[targetLang] || item[tLang] || item.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${prefix}${valid}`;
    }
  }

  return null;
}

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

  // Bộ nhớ đệm bản dịch máy thời gian thực (NMT Cache) trong RAM & LocalStorage
  const [autoTranslations, setAutoTranslations] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(DYNAMIC_I18N_STORAGE_PREFIX + currentLang);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Đồng bộ lại autoTranslations mỗi khi chuyển đổi ngôn ngữ
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DYNAMIC_I18N_STORAGE_PREFIX + currentLang);
      setAutoTranslations(raw ? JSON.parse(raw) : {});
    } catch {
      setAutoTranslations({});
    }
  }, [currentLang]);

  // Hàng đợi dịch bất đồng bộ gom nhóm (batch queue)
  const pendingQueueRef = React.useRef<Set<string>>(new Set());
  const debounceTimerRef = React.useRef<any>(null);

  const processQueue = useCallback(async () => {
    if (pendingQueueRef.current.size === 0 || currentLang === 'vi') return;
    const batch = Array.from(pendingQueueRef.current).slice(0, 40);
    batch.forEach((txt) => pendingQueueRef.current.delete(txt));

    try {
      // 1. Gọi backend POST /api/languages/translate-batch
      const res = await fetch(`${API_BASE}/languages/translate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang: currentLang, texts: batch })
      });

      let newDict: Record<string, string> = {};
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          newDict = json.data;
        }
      } else {
        // 2. Client fallback sang Google GTX trực tiếp nếu kết nối backend gián đoạn
        await Promise.all(
          batch.map(async (txt) => {
            try {
              const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${encodeURIComponent(currentLang)}&dt=t&q=${encodeURIComponent(txt)}`;
              const r = await fetch(url);
              if (r.ok) {
                const data = await r.json();
                if (Array.isArray(data) && Array.isArray(data[0])) {
                  const tr = data[0].map((item: any) => item[0]).filter(Boolean).join('');
                  if (tr && tr.trim() && tr.trim() !== txt.trim()) {
                    newDict[txt] = tr.trim();
                  }
                }
              }
            } catch {
              // Ignored
            }
          })
        );
      }

      if (Object.keys(newDict).length > 0) {
        setAutoTranslations((prev) => {
          const merged = { ...prev, ...newDict };
          try {
            localStorage.setItem(DYNAMIC_I18N_STORAGE_PREFIX + currentLang, JSON.stringify(merged));
          } catch {
            // Ignored
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('[AutoTranslateQueue] Error processing translation batch:', err);
    }
  }, [currentLang]);

  const enqueueForTranslation = useCallback((text: string) => {
    if (!text || currentLang === 'vi') return;
    const clean = text.trim();
    if (clean.length < 2 || clean.length > 500) return;
    if (!VIETNAMESE_REGEX.test(clean)) return;
    if (autoTranslations[clean]) return;
    if (pendingQueueRef.current.has(clean)) return;

    pendingQueueRef.current.add(clean);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      processQueue();
    }, 100);
  }, [currentLang, autoTranslations, processQueue]);

  // Cơ chế quét và dịch tự động toàn diện các Text Node trong DOM (Hybrid i18n DOM Engine)
  // Bảo đảm 100% không bao giờ sót bất kỳ chữ tiếng Việt nào trên mọi trang, popup, modal
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

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
        document.querySelectorAll('input[data-i18n-orig-ph], textarea[data-i18n-orig-ph]').forEach((el) => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          const orig = input.getAttribute('data-i18n-orig-ph');
          if (orig) {
            input.placeholder = orig;
            input.removeAttribute('data-i18n-orig-ph');
          }
        });
        document.querySelectorAll('[data-i18n-orig-title]').forEach((el) => {
          const orig = el.getAttribute('data-i18n-orig-title');
          if (orig) {
            el.setAttribute('title', orig);
            el.removeAttribute('data-i18n-orig-title');
          }
        });
        document.querySelectorAll('[data-i18n-orig-aria]').forEach((el) => {
          const orig = el.getAttribute('data-i18n-orig-aria');
          if (orig) {
            el.setAttribute('aria-label', orig);
            el.removeAttribute('data-i18n-orig-aria');
          }
        });
        return;
      }

      const targetLang = currentLang.toLowerCase() as 'en' | 'fr' | 'zh' | 'ja';

      // 1. Quét dịch placeholder của các ô nhập liệu input / textarea
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        const currentPh = input.placeholder;
        if (!currentPh) return;
        const origPh = input.getAttribute('data-i18n-orig-ph') || (input as any).__i18nOrigPh || currentPh;
        if (!input.hasAttribute('data-i18n-orig-ph')) {
          input.setAttribute('data-i18n-orig-ph', origPh);
          (input as any).__i18nOrigPh = origPh;
        }
        const trans = autoTranslations[origPh] || lookupUniversalPhrase(origPh, targetLang);
        if (trans && input.placeholder !== trans) {
          input.placeholder = trans;
        } else if (!trans && VIETNAMESE_REGEX.test(origPh)) {
          enqueueForTranslation(origPh);
        }
      });

      // 2. Quét dịch thuộc tính title (tooltip)
      document.querySelectorAll('[title]').forEach((el) => {
        const title = el.getAttribute('title');
        if (!title || !title.trim()) return;
        const origTitle = el.getAttribute('data-i18n-orig-title') || (el as any).__i18nOrigTitle || title;
        if (!el.hasAttribute('data-i18n-orig-title')) {
          el.setAttribute('data-i18n-orig-title', origTitle);
          (el as any).__i18nOrigTitle = origTitle;
        }
        const trans = autoTranslations[origTitle] || lookupUniversalPhrase(origTitle, targetLang);
        if (trans && el.getAttribute('title') !== trans) {
          el.setAttribute('title', trans);
        } else if (!trans && VIETNAMESE_REGEX.test(origTitle)) {
          enqueueForTranslation(origTitle);
        }
      });

      // 3. Quét dịch thuộc tính aria-label
      document.querySelectorAll('[aria-label]').forEach((el) => {
        const aria = el.getAttribute('aria-label');
        if (!aria || !aria.trim()) return;
        const origAria = el.getAttribute('data-i18n-orig-aria') || (el as any).__i18nOrigAria || aria;
        if (!el.hasAttribute('data-i18n-orig-aria')) {
          el.setAttribute('data-i18n-orig-aria', origAria);
          (el as any).__i18nOrigAria = origAria;
        }
        const trans = autoTranslations[origAria] || lookupUniversalPhrase(origAria, targetLang);
        if (trans && el.getAttribute('aria-label') !== trans) {
          el.setAttribute('aria-label', trans);
        } else if (!trans && VIETNAMESE_REGEX.test(origAria)) {
          enqueueForTranslation(origAria);
        }
      });

      // 4. Quét toàn bộ Text Node trong cây DOM
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

        // Khớp cụm từ trong autoTranslations hoặc UNIVERSAL_PHRASE_MAP
        const isSingleChild = node.parentElement?.childNodes.length === 1;
        const origText = (node as any).__i18nOrig || (isSingleChild ? node.parentElement?.getAttribute('data-i18n-orig') : null) || trimmed;
        const trans = autoTranslations[origText] || lookupUniversalPhrase(origText, targetLang);
        if (trans && trans !== trimmed) {
          (node as any).__i18nOrig = origText;
          if (node.parentElement && isSingleChild && !node.parentElement.hasAttribute('data-i18n-orig')) {
            node.parentElement.setAttribute('data-i18n-orig', origText);
          }
          node.textContent = text.replace(trimmed, trans);
          return;
        } else if (!trans && VIETNAMESE_REGEX.test(origText) && origText.length >= 2) {
          enqueueForTranslation(origText);
        }

        // Thay thế các biến động số lượng và nhãn linh hoạt
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
        replaced = replaced.replace(/(\d+)\s+quốc gia & vùng lãnh thổ/g, (_, n) => {
          const word = targetLang === 'en' ? 'countries & territories' : targetLang === 'fr' ? 'pays & territoires' : targetLang === 'zh' ? '个国家与地区' : '国・地域の言語';
          return `${n} ${word}`;
        });
        replaced = replaced.replace(/(\d+)\s*\/\s*(\d+)\s+ngôn ngữ/g, (_, a, b) => {
          const word = targetLang === 'en' ? 'languages' : targetLang === 'fr' ? 'langues' : targetLang === 'zh' ? '种语言' : '言語';
          return `${a} / ${b} ${word}`;
        });
        replaced = replaced.replace(/Tìm thấy\s+(\d+)\s*\/\s*(\d+)\s+ngôn ngữ/g, (_, a, b) => {
          const prefix = targetLang === 'en' ? 'Found' : targetLang === 'fr' ? 'Trouvé' : targetLang === 'zh' ? '已找到' : '検索結果';
          const word = targetLang === 'en' ? 'languages' : targetLang === 'fr' ? 'langues' : targetLang === 'zh' ? '种语言' : '言語';
          return `${prefix} ${a} / ${b} ${word}`;
        });
        replaced = replaced.replace(/Tốc độ:\s*([\d.]+)x\s*\|\s*Nhà cung cấp:\s*(.*)/g, (_, spd, prov) => {
          const spdWord = targetLang === 'en' ? 'Speed:' : targetLang === 'fr' ? 'Vitesse :' : targetLang === 'zh' ? '语速：' : '速度：';
          const provWord = targetLang === 'en' ? 'Provider:' : targetLang === 'fr' ? 'Fournisseur :' : targetLang === 'zh' ? '服务商：' : 'プロバイダー：';
          return `${spdWord} ${spd}x | ${provWord} ${prov}`;
        });
        replaced = replaced.replace(/Tên quốc tế:\s*(.*)/g, (_, name) => {
          const prefix = targetLang === 'en' ? 'International name: ' : targetLang === 'fr' ? 'Nom international : ' : targetLang === 'zh' ? '国际通用名：' : '国際表記：';
          return `${prefix}${name}`;
        });
        replaced = replaced.replace(/Đang phát mẫu giọng đọc AI:\s*(.*)/g, (_, name) => {
          const prefix = targetLang === 'en' ? 'Playing AI Voice sample: ' : targetLang === 'fr' ? 'Lecture de l’échantillon vocal IA : ' : targetLang === 'zh' ? '正在播放AI语音示例：' : 'AI音声サンプルを再生中：';
          return `${prefix}${name}`;
        });
        replaced = replaced.replace(/Tất cả trạng thái\s*\((\d+)\)/g, (_, n) => {
          const label = targetLang === 'en' ? 'All statuses' : targetLang === 'fr' ? 'Tous les statuts' : targetLang === 'zh' ? '所有状态' : 'すべてのステータス';
          return `${label} (${n})`;
        });
        replaced = replaced.replace(/Đang hiển thị trên Client\s*\((\d+)\)/g, (_, n) => {
          const label = targetLang === 'en' ? 'Visible on Client' : targetLang === 'fr' ? 'Visible pour les visiteurs' : targetLang === 'zh' ? '客户端显示中' : 'クライアント表示中';
          return `${label} (${n})`;
        });
        replaced = replaced.replace(/Đang tạm tắt\s*\((\d+)\)/g, (_, n) => {
          const label = targetLang === 'en' ? 'Temporarily hidden' : targetLang === 'fr' ? 'Désactivé temporairement' : targetLang === 'zh' ? '已暂停显示' : '一時停止中';
          return `${label} (${n})`;
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

    // Chạy quét ngay lập tức
    translateTextNodes();

    if (currentLang === 'vi') return;

    // Debounced scan để xử lý mọi mutation của React mà không gián đoạn hiệu năng
    let scanTimeout: any = null;
    const scheduleScan = () => {
      if (scanTimeout) clearTimeout(scanTimeout);
      scanTimeout = setTimeout(() => {
        translateTextNodes(document.body);
      }, 40);
    };

    const observer = new MutationObserver(() => {
      scheduleScan();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.addEventListener('popstate', scheduleScan);
    window.addEventListener('hashchange', scheduleScan);

    // Chuỗi kiểm tra an toàn sau khi đổi tab hoặc nạp trang (6 lần trong 3s)
    let safetyCounter = 0;
    const safetyInterval = setInterval(() => {
      translateTextNodes(document.body);
      safetyCounter++;
      if (safetyCounter >= 6) {
        clearInterval(safetyInterval);
      }
    }, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scheduleScan);
      window.removeEventListener('hashchange', scheduleScan);
      clearInterval(safetyInterval);
      if (scanTimeout) clearTimeout(scanTimeout);
    };
  }, [currentLang, autoTranslations, enqueueForTranslation]);

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

  // Tra cứu chuỗi dịch thuật siêu tốc O(1) kết hợp từ điển hệ thống, Universal Phrase Map và NMT Cache
  const t = useCallback((key: string, fallback?: string): string => {
    if (currentLang === 'vi') {
      return DICTIONARY_VI[key] || fallback || key;
    }

    // 1. Kiểm tra cache NMT động trong RAM/localStorage
    if (autoTranslations[key]) {
      return autoTranslations[key];
    }
    if (fallback && autoTranslations[fallback]) {
      return autoTranslations[fallback];
    }

    // 2. Kiểm tra từ điển tĩnh đã nạp
    const currentDict = dictionaries[currentLang] || BUILTIN_DICTIONARIES[currentLang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }

    // 3. Tra cứu UNIVERSAL_PHRASE_MAP theo key
    const transByKey = lookupUniversalPhrase(key, currentLang);
    if (transByKey) return transByKey;

    // 4. Tra cứu UNIVERSAL_PHRASE_MAP theo fallback text
    if (fallback) {
      const transByFallback = lookupUniversalPhrase(fallback, currentLang);
      if (transByFallback) return transByFallback;
    }

    // 5. Nếu chưa có, tự động đưa vào hàng đợi dịch máy siêu tốc
    if (fallback && VIETNAMESE_REGEX.test(fallback)) {
      enqueueForTranslation(fallback);
    } else if (VIETNAMESE_REGEX.test(key)) {
      enqueueForTranslation(key);
    }

    // 6. Fallback sang tiếng Anh trong dictionary tĩnh nếu có
    if (BUILTIN_DICTIONARIES.en && BUILTIN_DICTIONARIES.en[key]) {
      return BUILTIN_DICTIONARIES.en[key];
    }
    // Fallback sang tiếng Việt gốc hoặc chuỗi mặc định
    return DICTIONARY_VI[key] || fallback || key;
  }, [currentLang, dictionaries, autoTranslations, enqueueForTranslation]);

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

    // 4. Tra cứu cụm từ trong autoTranslations hoặc UNIVERSAL_PHRASE_MAP theo nội dung gốc của trường
    const originalText = item[field];
    if (typeof originalText === 'string') {
      if (autoTranslations[originalText]) {
        return autoTranslations[originalText];
      }
      const mapTrans = lookupUniversalPhrase(originalText, currentLang);
      if (mapTrans) return mapTrans;
      if (VIETNAMESE_REGEX.test(originalText)) {
        enqueueForTranslation(originalText);
      }
    }

    return item[field] || fallback || '';
  }, [currentLang, autoTranslations, enqueueForTranslation]);

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
