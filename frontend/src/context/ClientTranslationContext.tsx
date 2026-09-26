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
const DYNAMIC_I18N_STORAGE_PREFIX = 'museum_dynamic_i18n_v2_';
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;

// Loại bỏ triệt để hậu tố mã nguồn 'vi' do Google dict-chrome-ex ghép nhầm
export function cleanTranslationResult(str: string, orig: string, targetLang: string): string {
  if (!str) return str;
  let s = str.trim();
  if (s.endsWith('vi') && s.length > 4 && !orig.toLowerCase().endsWith('vi')) {
    s = s.slice(0, -2).trim();
  }
  return s;
}

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

// Hàm chuẩn hóa chuỗi tra cứu (loại bỏ khác biệt giữa các loại dấu gạch ngang, khoảng trắng và chữ hoa/thường)
function normalizePhraseKey(key: string): string {
  if (!key) return '';
  return key
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

// Bảng tra cứu chuẩn hóa toàn diện (Normalized Universal Phrase Map O(1))
const NORMALIZED_PHRASE_MAP: Record<string, any> = (() => {
  const map: Record<string, any> = {};
  for (const [key, val] of Object.entries(UNIVERSAL_PHRASE_MAP)) {
    map[normalizePhraseKey(key)] = val;
  }
  return map;
})();

function getPhraseItem(key: string): any {
  if (!key) return null;
  if (UNIVERSAL_PHRASE_MAP[key]) return UNIVERSAL_PHRASE_MAP[key];
  const norm = normalizePhraseKey(key);
  if (NORMALIZED_PHRASE_MAP[norm]) return NORMALIZED_PHRASE_MAP[norm];
  return null;
}

// Bộ trợ giúp tra cứu cụm từ đa năng mở rộng (xử lý dấu câu, hai chấm, ngoặc đơn, đạn tròn, dấu gạch)
export function lookupUniversalPhrase(raw: string, targetLang: string): string | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (!clean) return null;

  const tLang = targetLang.toLowerCase() as 'en' | 'fr' | 'zh' | 'ja';

  // 1. Khớp chính xác hoặc không phân biệt chữ hoa/thường 100% trong từ điển cụm từ
  const itemExact = getPhraseItem(clean);
  if (itemExact) {
    const trans = (itemExact as any)[targetLang] || itemExact[tLang] || itemExact.en || null;
    const valid = isValidTranslation(trans, clean, targetLang);
    if (valid) return valid;
  }

  // 1b. Xử lý dấu chấm ở cuối: "Thứ Hai: Đóng cửa..." -> loại bỏ dấu chấm để tra cứu
  if (clean.endsWith('.')) {
    const withoutDot = clean.slice(0, -1).trim();
    const itemNoDot = getPhraseItem(withoutDot);
    if (itemNoDot) {
      const trans = (itemNoDot as any)[targetLang] || itemNoDot[tLang] || itemNoDot.en;
      const valid = isValidTranslation(trans, withoutDot, targetLang);
      if (valid) return `${valid}.`;
    }
  }

  // 2. Xử lý dấu hai chấm ở cuối: "Mã phòng:" -> "Room Code:"
  if (clean.endsWith(':')) {
    const core = clean.slice(0, -1).trim();
    const itemColon = getPhraseItem(core);
    if (itemColon) {
      const trans = (itemColon as any)[targetLang] || itemColon[tLang] || itemColon.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${valid}:`;
    }
  }

  // 3. Xử lý dấu ba chấm: "Đang tải..." -> "Loading..."
  if (clean.endsWith('...') || clean.endsWith('…')) {
    const core = clean.replace(/\.{3}$|…$/, '').trim();
    const itemEllipsis = getPhraseItem(core);
    if (itemEllipsis) {
      const trans = (itemEllipsis as any)[targetLang] || itemEllipsis[tLang] || itemEllipsis.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${valid}...`;
    }
  }

  // 4. Xử lý trong dấu ngoặc đơn: "(Tối đa 5MB)" -> "(Max 5MB)"
  if (clean.startsWith('(') && clean.endsWith(')')) {
    const core = clean.slice(1, -1).trim();
    const itemParen = getPhraseItem(core);
    if (itemParen) {
      const trans = (itemParen as any)[targetLang] || itemParen[tLang] || itemParen.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `(${valid})`;
    }
  }

  // 5. Xử lý ký tự đầu dòng (bullet, số thứ tự, gạch ngang, mũi tên)
  const bulletMatch = clean.match(/^([•\-\*›»\d+\.]\s+)(.*)$/);
  if (bulletMatch) {
    const prefix = bulletMatch[1];
    const core = bulletMatch[2].trim();
    const itemBullet = getPhraseItem(core);
    if (itemBullet) {
      const trans = (itemBullet as any)[targetLang] || itemBullet[tLang] || itemBullet.en;
      const valid = isValidTranslation(trans, core, targetLang);
      if (valid) return `${prefix}${valid}`;
    }
  }

  return null;
}

// Bảng tra cứu ngược siêu tốc O(1) từ mọi ngoại ngữ (Anh, Pháp, Trung, Nhật, v.v.) về tiếng Việt gốc
export const REVERSE_LOOKUP_CACHE: Record<string, string> = (() => {
  const cache: Record<string, string> = {};
  for (const [viKey, item] of Object.entries(UNIVERSAL_PHRASE_MAP)) {
    if (item.en) cache[item.en.toLowerCase().trim()] = viKey;
    if (item.fr) cache[item.fr.toLowerCase().trim()] = viKey;
    if (item.zh) cache[item.zh.toLowerCase().trim()] = viKey;
    if (item.ja) cache[item.ja.toLowerCase().trim()] = viKey;
  }
  for (const lang of ['en', 'fr', 'zh', 'ja'] as const) {
    const dict = BUILTIN_DICTIONARIES[lang];
    if (dict) {
      for (const [key, val] of Object.entries(dict)) {
        const viVal = DICTIONARY_VI[key];
        if (viVal && val && typeof val === 'string') {
          cache[val.toLowerCase().trim()] = viVal;
        }
      }
    }
  }
  return cache;
})();

// Bản đồ tra cứu ngược động (học liên tục từ mọi kết quả dịch NMT/Gemini/Google của mọi ngôn ngữ)
export const DYNAMIC_REVERSE_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DYNAMIC_I18N_STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            for (const [vi, tr] of Object.entries(parsed)) {
              if (typeof tr === 'string' && tr.trim()) {
                map[tr.toLowerCase().trim()] = vi;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignored
  }
  return map;
})();

// Bộ từ điển ánh xạ cụm từ linh hoạt đa ngôn ngữ (chống bị ép tiếng Nhật cho các ngôn ngữ khác)
function getDynamicCountPhrase(patternKey: string, lang: string, paramA: string | number, paramB?: string | number): string {
  const cleanLang = lang.toLowerCase().trim();
  const PHRASE_DICTIONARY: Record<string, Record<string, (a: any, b?: any) => string>> = {
    anchorPoints: {
      en: (n) => `${n} anchor points`,
      fr: (n) => `${n} points d'ancrage`,
      zh: (n) => `${n} 个锚点`,
      ja: (n) => `${n} 箇所のスポット`,
      ko: (n) => `${n}개 앵커 포인트`,
      es: (n) => `${n} puntos de anclaje`,
      de: (n) => `${n} Ankerpunkte`,
      ru: (n) => `${n} точек привязки`,
      th: (n) => `${n} จุดเชื่อมโยง`,
      it: (n) => `${n} punti di ancoraggio`
    },
    scans: {
      en: (n) => `${n} scans`,
      fr: (n) => `${n} scans`,
      zh: (n) => `${n} 次扫码`,
      ja: (n) => `${n} 回スキャン`,
      ko: (n) => `${n}회 스캔`,
      es: (n) => `${n} escaneos`,
      de: (n) => `${n} Scans`,
      ru: (n) => `${n} сканирований`,
      th: (n) => `${n} ครั้งการสแกน`,
      it: (n) => `${n} scansioni`
    },
    views360: {
      en: (n) => `${n} 360° views`,
      fr: (n) => `${n} angles 360°`,
      zh: (n) => `${n} 个360°视角`,
      ja: (n) => `${n} 箇所の360°視点`,
      ko: (n) => `${n}개 360° 뷰`,
      es: (n) => `${n} vistas 360°`,
      de: (n) => `${n} 360°-Ansichten`,
      ru: (n) => `${n} панорам 360°`,
      th: (n) => `${n} มุมมอง 360°`,
      it: (n) => `${n} viste 360°`
    },
    rooms: {
      en: (n) => `${n} rooms`,
      fr: (n) => `${n} salles`,
      zh: (n) => `${n} 个展厅`,
      ja: (n) => `${n} 室`,
      ko: (n) => `${n}개 전시실`,
      es: (n) => `${n} salas`,
      de: (n) => `${n} Räume`,
      ru: (n) => `${n} залов`,
      th: (n) => `${n} ห้องจัดแสดง`,
      it: (n) => `${n} sale`
    },
    countries: {
      en: (n) => `${n} countries & territories`,
      fr: (n) => `${n} pays & territoires`,
      zh: (n) => `${n} 个国家与地区`,
      ja: (n) => `${n} 国・地域の言語`,
      ko: (n) => `${n}개 국가 및 영토`,
      es: (n) => `${n} países y territorios`,
      de: (n) => `${n} Länder & Regionen`,
      ru: (n) => `${n} стран и территорий`,
      th: (n) => `${n} ประเทศและดินแดน`,
      it: (n) => `${n} paesi e territori`
    },
    languagesRatio: {
      en: (a, b) => `${a} / ${b} languages`,
      fr: (a, b) => `${a} / ${b} langues`,
      zh: (a, b) => `${a} / ${b} 种语言`,
      ja: (a, b) => `${a} / ${b} 言語`,
      ko: (a, b) => `${a} / ${b} 개 언어`,
      es: (a, b) => `${a} / ${b} idiomas`,
      de: (a, b) => `${a} / ${b} Sprachen`,
      ru: (a, b) => `${a} / ${b} языков`,
      th: (a, b) => `${a} / ${b} ภาษา`,
      it: (a, b) => `${a} / ${b} lingue`
    },
    foundLanguages: {
      en: (a, b) => `Found ${a} / ${b} languages`,
      fr: (a, b) => `Trouvé ${a} / ${b} langues`,
      zh: (a, b) => `已找到 ${a} / ${b} 种语言`,
      ja: (a, b) => `検索結果 ${a} / ${b} 言語`,
      ko: (a, b) => `${a} / ${b}개 언어 검색됨`,
      es: (a, b) => `Encontrados ${a} / ${b} idiomas`,
      de: (a, b) => `${a} / ${b} Sprachen gefunden`,
      ru: (a, b) => `Найдено ${a} / ${b} языков`,
      th: (a, b) => `พบ ${a} / ${b} ภาษา`,
      it: (a, b) => `Trovate ${a} / ${b} lingue`
    },
    speedProvider: {
      en: (spd, prov) => `Speed: ${spd}x | Provider: ${prov}`,
      fr: (spd, prov) => `Vitesse : ${spd}x | Fournisseur : ${prov}`,
      zh: (spd, prov) => `语速：${spd}x | 服务商：${prov}`,
      ja: (spd, prov) => `速度：${spd}x | プロバイダー：${prov}`,
      ko: (spd, prov) => `속도: ${spd}x | 제공자: ${prov}`,
      es: (spd, prov) => `Velocidad: ${spd}x | Proveedor: ${prov}`,
      de: (spd, prov) => `Geschwindigkeit: ${spd}x | Anbieter: ${prov}`,
      ru: (spd, prov) => `Скорость: ${spd}x | Провайдер: ${prov}`,
      th: (spd, prov) => `ความเร็ว: ${spd}x | ผู้ให้บริการ: ${prov}`,
      it: (spd, prov) => `Velocità: ${spd}x | Provider: ${prov}`
    },
    intlName: {
      en: (name) => `International name: ${name}`,
      fr: (name) => `Nom international : ${name}`,
      zh: (name) => `国际通用名：${name}`,
      ja: (name) => `国際表記：${name}`,
      ko: (name) => `국제 명칭: ${name}`,
      es: (name) => `Nombre internacional: ${name}`,
      de: (name) => `Internationaler Name: ${name}`,
      ru: (name) => `Международное название: ${name}`,
      th: (name) => `ชื่อสากล: ${name}`,
      it: (name) => `Nome internazionale: ${name}`
    },
    playingVoiceSample: {
      en: (name) => `Playing AI Voice sample: ${name}`,
      fr: (name) => `Lecture de l’échantillon vocal IA : ${name}`,
      zh: (name) => `正在播放AI语音示例：${name}`,
      ja: (name) => `AI音声サンプルを再生中：${name}`,
      ko: (name) => `AI 음성 샘플 재생 중: ${name}`,
      es: (name) => `Reproduciendo muestra de voz IA: ${name}`,
      de: (name) => `KI-Sprachprobe wird abgespielt: ${name}`,
      ru: (name) => `Воспроизведение образца голоса ИИ: ${name}`,
      th: (name) => `กำลังเล่นตัวอย่างเสียง AI: ${name}`,
      it: (name) => `Riproduzione campione vocale AI: ${name}`
    },
    allStatuses: {
      en: (n) => `All statuses (${n})`,
      fr: (n) => `Tous les statuts (${n})`,
      zh: (n) => `所有状态 (${n})`,
      ja: (n) => `すべてのステータス (${n})`,
      ko: (n) => `모든 상태 (${n})`,
      es: (n) => `Todos los estados (${n})`,
      de: (n) => `Alle Status (${n})`,
      ru: (n) => `Все статусы (${n})`,
      th: (n) => `ทุกสถานะ (${n})`,
      it: (n) => `Tutti gli stati (${n})`
    },
    visibleOnClient: {
      en: (n) => `Visible on Client (${n})`,
      fr: (n) => `Visible pour les visiteurs (${n})`,
      zh: (n) => `客户端显示中 (${n})`,
      ja: (n) => `クライアント表示中 (${n})`,
      ko: (n) => `클라이언트에 표시 중 (${n})`,
      es: (n) => `Visible en el cliente (${n})`,
      de: (n) => `Auf Client sichtbar (${n})`,
      ru: (n) => `Отображается на клиенте (${n})`,
      th: (n) => `แสดงบนฝั่งผู้ใช้ (${n})`,
      it: (n) => `Visibile sul Client (${n})`
    },
    temporarilyHidden: {
      en: (n) => `Temporarily hidden (${n})`,
      fr: (n) => `Désactivé temporairement (${n})`,
      zh: (n) => `已暂停显示 (${n})`,
      ja: (n) => `一時停止中 (${n})`,
      ko: (n) => `일시 숨김 (${n})`,
      es: (n) => `Oculto temporalmente (${n})`,
      de: (n) => `Vorübergehend ausgeblendet (${n})`,
      ru: (n) => `Временно скрыто (${n})`,
      th: (n) => `ซ่อนชั่วคราว (${n})`,
      it: (n) => `Temporaneamente nascosto (${n})`
    },
    roomCode: {
      en: () => 'Room Code: ',
      fr: () => 'Code de la salle : ',
      zh: () => '展厅编号: ',
      ja: () => '展示室コード: ',
      ko: () => '전시실 코드: ',
      es: () => 'Código de sala: ',
      de: () => 'Raumcode: ',
      ru: () => 'Код зала: ',
      th: () => 'รหัสห้อง: ',
      it: () => 'Codice sala: '
    },
    photosCount: {
      en: (n) => `(${n} photos)`,
      fr: (n) => `(${n} photos)`,
      zh: (n) => `(${n} 张图片)`,
      ja: (n) => `(${n} 枚の画像)`,
      ko: (n) => `(${n}장 사진)`,
      es: (n) => `(${n} fotos)`,
      de: (n) => `(${n} Fotos)`,
      ru: (n) => `(${n} фото)`,
      th: (n) => `(${n} รูป)`,
      it: (n) => `(${n} foto)`
    }
  };

  const pattern = PHRASE_DICTIONARY[patternKey];
  if (!pattern) return String(paramA);
  const fn = pattern[cleanLang] || pattern.en;
  return fn(paramA, paramB);
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

  // Cờ ngăn vòng lặp MutationObserver tự kích hoạt khi thay đổi DOM
  const isTranslatingRef = React.useRef<boolean>(false);
  const translateTextNodesRef = React.useRef<((root?: Node) => void) | null>(null);

  // Hàng đợi dịch bất đồng bộ gom nhóm (batch queue)
  const pendingQueueRef = React.useRef<Set<string>>(new Set());
  const debounceTimerRef = React.useRef<any>(null);

  const processQueue = useCallback(async () => {
    if (pendingQueueRef.current.size === 0 || currentLang === 'vi') return;
    const batch = Array.from(pendingQueueRef.current).slice(0, 80);
    batch.forEach((txt) => pendingQueueRef.current.delete(txt));

    try {
      // 1. Gọi backend POST /api/languages/translate-batch (Gemini 2.5 Flash / Grouped NMT + Redis)
      const res = await fetch(`${API_BASE}/languages/translate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang: currentLang, texts: batch })
      });

      let newDict: Record<string, string> = {};
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          for (const [k, v] of Object.entries(json.data)) {
            newDict[k] = cleanTranslationResult(String(v), k, currentLang);
          }
        }
      } else {
        // 2. Client fallback sang Google dict-chrome-ex trực tiếp nếu backend bận
        await Promise.all(
          batch.map(async (txt) => {
            try {
              const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(currentLang)}&q=${encodeURIComponent(txt)}`;
              const r = await fetch(url);
              if (r.ok) {
                const data = await r.json();
                let tr = '';
                if (Array.isArray(data) && data.length > 0) {
                  if (typeof data[0] === 'string') {
                    tr = data[0].trim();
                  } else if (Array.isArray(data[0])) {
                    // data[0] có dạng [translatedText, sourceLang]
                    const first = data[0][0];
                    if (typeof first === 'string') tr = first.trim();
                  }
                }
                tr = cleanTranslationResult(tr, txt, currentLang);
                if (tr && tr !== txt.trim()) {
                  newDict[txt] = tr;
                }
              }
            } catch {
              // Ignored
            }
          })
        );
      }

      if (Object.keys(newDict).length > 0) {
        for (const [vi, tr] of Object.entries(newDict)) {
          if (tr && typeof tr === 'string') {
            DYNAMIC_REVERSE_MAP[tr.toLowerCase().trim()] = vi;
          }
        }
        setAutoTranslations((prev) => {
          const merged = { ...prev, ...newDict };
          try {
            localStorage.setItem(DYNAMIC_I18N_STORAGE_PREFIX + currentLang, JSON.stringify(merged));
          } catch {
            // Ignored
          }
          return merged;
        });

        // Áp dụng dịch ngay lập tức vào DOM trong frame kế tiếp
        requestAnimationFrame(() => {
          translateTextNodesRef.current?.(document.body);
        });
      }

      // Nếu còn cụm từ trong hàng đợi, tiếp tục xử lý mẻ tiếp theo
      if (pendingQueueRef.current.size > 0) {
        setTimeout(processQueue, 30);
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
    }, 35);
  }, [currentLang, autoTranslations, processQueue]);

  // Cơ chế quét và dịch tự động toàn diện các Text Node trong DOM (Hybrid i18n DOM Engine)
  // Bảo đảm 100% không bao giờ sót bất kỳ chữ tiếng Việt nào trên mọi trang, popup, modal
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const translateTextNodes = (root: Node = document.body) => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;

      try {
        if (currentLang === 'vi') {
          // Phục hồi lại văn bản gốc nếu chuyển về tiếng Việt
          document.querySelectorAll('input[data-i18n-orig-ph], textarea[data-i18n-orig-ph]').forEach((el) => {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            const orig = input.getAttribute('data-i18n-orig-ph');
            if (orig) {
              input.placeholder = orig;
              input.removeAttribute('data-i18n-orig-ph');
              delete (input as any).__i18nOrigPh;
              delete (input as any).__i18nCurLang;
            }
          });
          document.querySelectorAll('[data-i18n-orig-title]').forEach((el) => {
            const orig = el.getAttribute('data-i18n-orig-title');
            if (orig) {
              el.setAttribute('title', orig);
              el.removeAttribute('data-i18n-orig-title');
              delete (el as any).__i18nOrigTitle;
              delete (el as any).__i18nCurLang;
            }
          });
          document.querySelectorAll('[data-i18n-orig-aria]').forEach((el) => {
            const orig = el.getAttribute('data-i18n-orig-aria');
            if (orig) {
              el.setAttribute('aria-label', orig);
              el.removeAttribute('data-i18n-orig-aria');
              delete (el as any).__i18nOrigAria;
              delete (el as any).__i18nCurLang;
            }
          });
          // Không return sớm ở đây để tiếp tục quét phục hồi toàn bộ Text Nodes bên dưới
        }

        const targetLang = currentLang.toLowerCase() as 'en' | 'fr' | 'zh' | 'ja';

        if (currentLang !== 'vi') {
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
            if ((input as any).__i18nCurLang === currentLang && input.placeholder !== origPh) {
              return;
            }
            const trans = autoTranslations[origPh] || lookupUniversalPhrase(origPh, targetLang);
            if (trans && input.placeholder !== trans) {
              input.placeholder = trans;
              (input as any).__i18nCurLang = currentLang;
            }
            if (!trans && VIETNAMESE_REGEX.test(origPh)) {
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
            if ((el as any).__i18nCurLang === currentLang && el.getAttribute('title') !== origTitle) {
              return;
            }
            const trans = autoTranslations[origTitle] || lookupUniversalPhrase(origTitle, targetLang);
            if (trans && el.getAttribute('title') !== trans) {
              el.setAttribute('title', trans);
              (el as any).__i18nCurLang = currentLang;
            }
            if (!trans && VIETNAMESE_REGEX.test(origTitle)) {
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
            if ((el as any).__i18nCurLang === currentLang && el.getAttribute('aria-label') !== origAria) {
              return;
            }
            const trans = autoTranslations[origAria] || lookupUniversalPhrase(origAria, targetLang);
            if (trans && el.getAttribute('aria-label') !== trans) {
              el.setAttribute('aria-label', trans);
              (el as any).__i18nCurLang = currentLang;
            }
            if (!trans && VIETNAMESE_REGEX.test(origAria)) {
              enqueueForTranslation(origAria);
            }
          });
        }

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
          if (!trimmed) return;

          // Xác định văn bản tiếng Việt gốc ban đầu
          let origText = (node as any).__i18nOrigVI || node.parentElement?.getAttribute('data-i18n-orig-vi');
          if (!origText) {
            if (VIETNAMESE_REGEX.test(trimmed)) {
              origText = trimmed;
              (node as any).__i18nOrigVI = trimmed;
              node.parentElement?.setAttribute('data-i18n-orig-vi', trimmed);
            } else {
              // Node đang hiển thị ngoại ngữ -> tra ngược về tiếng Việt gốc qua cache
              const viFromReverse =
                DYNAMIC_REVERSE_MAP[trimmed.toLowerCase()] ||
                DYNAMIC_REVERSE_MAP[trimmed.replace(/vi$/i, '').trim().toLowerCase()] ||
                REVERSE_LOOKUP_CACHE[trimmed.toLowerCase()] ||
                REVERSE_LOOKUP_CACHE[trimmed.replace(/vi$/i, '').trim().toLowerCase()];
              if (viFromReverse) {
                origText = viFromReverse;
                (node as any).__i18nOrigVI = viFromReverse;
                node.parentElement?.setAttribute('data-i18n-orig-vi', viFromReverse);
              } else {
                origText = trimmed;
              }
            }
          }

          // NẾU ĐANG CHỌN TIẾNG VIỆT: Phục hồi lại văn bản tiếng Việt gốc 100%
          if (currentLang === 'vi') {
            const viCandidate =
              origText ||
              (node as any).__i18nOrigVI ||
              node.parentElement?.getAttribute('data-i18n-orig-vi') ||
              DYNAMIC_REVERSE_MAP[trimmed.toLowerCase()] ||
              REVERSE_LOOKUP_CACHE[trimmed.toLowerCase()];
            if (viCandidate && trimmed !== viCandidate) {
              node.textContent = text.replace(trimmed, viCandidate);
            }
            delete (node as any).__i18nOrigVI;
            delete (node as any).__i18nCurLang;
            delete (node as any).__i18nApplied;
            node.parentElement?.removeAttribute('data-i18n-orig-vi');
            return;
          }

          // Nếu node đã được dịch sang ngôn ngữ này rồi thì bỏ qua
          if ((node as any).__i18nCurLang === currentLang && (node as any).__i18nApplied === trimmed) {
            return;
          }

          // 1. Khớp cụm từ trong UNIVERSAL_PHRASE_MAP trước tiên (0ms, chuẩn học thuật)
          let trans = lookupUniversalPhrase(origText, targetLang);
          if (!trans) {
            trans = autoTranslations[origText] ? cleanTranslationResult(autoTranslations[origText], origText, currentLang) : null;
          }

          if (trans && trans !== trimmed) {
            trans = cleanTranslationResult(trans, origText, currentLang);
            (node as any).__i18nCurLang = currentLang;
            (node as any).__i18nApplied = trans;
            (node as any).__i18nOrigVI = origText;
            node.parentElement?.setAttribute('data-i18n-orig-vi', origText);
            DYNAMIC_REVERSE_MAP[trans.toLowerCase().trim()] = origText;
            node.textContent = text.replace(trimmed, trans);
            return;
          } else if (!trans && VIETNAMESE_REGEX.test(origText) && origText.length >= 2) {
            (node as any).__i18nOrigVI = origText;
            node.parentElement?.setAttribute('data-i18n-orig-vi', origText);
            enqueueForTranslation(origText);
          }

          // Thay thế các biến động số lượng và nhãn linh hoạt
          let replaced = text;
          replaced = replaced.replace(/(\d+)\s+điểm neo/g, (_, n) => getDynamicCountPhrase('anchorPoints', currentLang, n));
          replaced = replaced.replace(/(\d+)\s+lượt quét/g, (_, n) => getDynamicCountPhrase('scans', currentLang, n));
          replaced = replaced.replace(/(\d+)\s+góc 360°/g, (_, n) => getDynamicCountPhrase('views360', currentLang, n));
          replaced = replaced.replace(/(\d+)\s+gian phòng/g, (_, n) => getDynamicCountPhrase('rooms', currentLang, n));
          replaced = replaced.replace(/(\d+)\s+quốc gia & vùng lãnh thổ/g, (_, n) => getDynamicCountPhrase('countries', currentLang, n));
          replaced = replaced.replace(/(\d+)\s*\/\s*(\d+)\s+ngôn ngữ/g, (_, a, b) => getDynamicCountPhrase('languagesRatio', currentLang, a, b));
          replaced = replaced.replace(/Tìm thấy\s+(\d+)\s*\/\s*(\d+)\s+ngôn ngữ/g, (_, a, b) => getDynamicCountPhrase('foundLanguages', currentLang, a, b));
          replaced = replaced.replace(/Tốc độ:\s*([\d.]+)x\s*\|\s*Nhà cung cấp:\s*(.*)/g, (_, spd, prov) => getDynamicCountPhrase('speedProvider', currentLang, spd, prov));
          replaced = replaced.replace(/Tên quốc tế:\s*(.*)/g, (_, name) => getDynamicCountPhrase('intlName', currentLang, name));
          replaced = replaced.replace(/Đang phát mẫu giọng đọc AI:\s*(.*)/g, (_, name) => getDynamicCountPhrase('playingVoiceSample', currentLang, name));
          replaced = replaced.replace(/Tất cả trạng thái\s*\((\d+)\)/g, (_, n) => getDynamicCountPhrase('allStatuses', currentLang, n));
          replaced = replaced.replace(/Đang hiển thị trên Client\s*\((\d+)\)/g, (_, n) => getDynamicCountPhrase('visibleOnClient', currentLang, n));
          replaced = replaced.replace(/Đang tạm tắt\s*\((\d+)\)/g, (_, n) => getDynamicCountPhrase('temporarilyHidden', currentLang, n));
          replaced = replaced.replace(/Mã phòng:\s*/g, () => getDynamicCountPhrase('roomCode', currentLang, ''));
          replaced = replaced.replace(/\((\d+)\s+ảnh\)/g, (_, n) => getDynamicCountPhrase('photosCount', currentLang, n));

          if (replaced !== text) {
            (node as any).__i18nOrigVI = text;
            (node as any).__i18nCurLang = currentLang;
            node.textContent = replaced;
          }
        });
      } finally {
        isTranslatingRef.current = false;
      }
    };

    translateTextNodesRef.current = translateTextNodes;

    // Chạy quét ngay lập tức
    translateTextNodes();

    // Debounced scan để xử lý mọi mutation của React mà không gián đoạn hiệu năng
    let scanTimeout: any = null;
    const scheduleScan = () => {
      if (scanTimeout) clearTimeout(scanTimeout);
      scanTimeout = setTimeout(() => {
        translateTextNodes(document.body);
      }, 35);
    };

    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;
      const hasAddedNodes = mutations.some((m) => m.type === 'childList' && m.addedNodes.length > 0);
      if (hasAddedNodes) {
        scheduleScan();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('popstate', scheduleScan);
    window.addEventListener('hashchange', scheduleScan);

    // Chuỗi kiểm tra an toàn sau khi đổi tab hoặc nạp trang (3 lần trong 1.5s)
    let safetyCounter = 0;
    const safetyInterval = setInterval(() => {
      translateTextNodes(document.body);
      safetyCounter++;
      if (safetyCounter >= 3) {
        clearInterval(safetyInterval);
      }
    }, 450);

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

  // Hàm chuyển đổi ngôn ngữ hiển thị siêu tốc tức thì
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

    if (clean === 'vi') {
      setAutoTranslations({});
      // Quét phục hồi tiếng Việt 100% ngay lập tức
      translateTextNodesRef.current?.(document.body);
      requestAnimationFrame(() => {
        translateTextNodesRef.current?.(document.body);
      });
      setTimeout(() => {
        translateTextNodesRef.current?.(document.body);
      }, 50);
      window.dispatchEvent(new CustomEvent('museum:language_changed', { detail: 'vi' }));
      return;
    }

    // Nạp đồng bộ ngay bộ nhớ đệm NMT của ngôn ngữ đích từ localStorage
    try {
      const raw = localStorage.getItem(DYNAMIC_I18N_STORAGE_PREFIX + clean);
      setAutoTranslations(raw ? JSON.parse(raw) : {});
    } catch {
      setAutoTranslations({});
    }

    // Kích hoạt 3 đợt quét dịch siêu tốc để bắt trọn mọi frame React re-render
    requestAnimationFrame(() => {
      translateTextNodesRef.current?.(document.body);
    });
    setTimeout(() => {
      translateTextNodesRef.current?.(document.body);
    }, 40);
    setTimeout(() => {
      translateTextNodesRef.current?.(document.body);
    }, 150);

    window.dispatchEvent(new CustomEvent('museum:language_changed', { detail: clean }));

    if (!BUILTIN_DICTIONARIES[clean]) {
      await ensureLanguageBundle(clean);
      requestAnimationFrame(() => {
        translateTextNodesRef.current?.(document.body);
      });
    }
  };

  // Tra cứu chuỗi dịch thuật siêu tốc O(1) kết hợp từ điển hệ thống, Universal Phrase Map và NMT Cache
  const t = useCallback((key: string, fallback?: string): string => {
    if (currentLang === 'vi') {
      return DICTIONARY_VI[key] || fallback || key;
    }

    // 1. ƯU TIÊN 1: Tra cứu từ điển tĩnh đã nạp (BUILTIN_DICTIONARIES)
    const currentDict = dictionaries[currentLang] || BUILTIN_DICTIONARIES[currentLang];
    if (currentDict && currentDict[key]) {
      return cleanTranslationResult(currentDict[key], key, currentLang);
    }

    // 2. ƯU TIÊN 2: Tra cứu UNIVERSAL_PHRASE_MAP theo key
    const transByKey = lookupUniversalPhrase(key, currentLang);
    if (transByKey) {
      return cleanTranslationResult(transByKey, key, currentLang);
    }

    // 3. ƯU TIÊN 3: Tra cứu UNIVERSAL_PHRASE_MAP theo fallback text
    if (fallback) {
      const transByFallback = lookupUniversalPhrase(fallback, currentLang);
      if (transByFallback) {
        return cleanTranslationResult(transByFallback, fallback, currentLang);
      }
    }

    // 4. ƯU TIÊN 4: Kiểm tra cache NMT động trong RAM/localStorage (đã làm sạch)
    if (autoTranslations[key]) {
      return cleanTranslationResult(autoTranslations[key], key, currentLang);
    }
    if (fallback && autoTranslations[fallback]) {
      return cleanTranslationResult(autoTranslations[fallback], fallback, currentLang);
    }

    // 5. Nếu chưa có, tự động đưa vào hàng đợi dịch máy siêu tốc
    if (fallback && VIETNAMESE_REGEX.test(fallback)) {
      enqueueForTranslation(fallback);
    } else if (VIETNAMESE_REGEX.test(key)) {
      enqueueForTranslation(key);
    }

    // 6. Fallback sang tiếng Anh trong dictionary tĩnh nếu có
    if (BUILTIN_DICTIONARIES.en && BUILTIN_DICTIONARIES.en[key]) {
      return cleanTranslationResult(BUILTIN_DICTIONARIES.en[key], key, currentLang);
    }
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
      if (mapTrans) {
        if (!['vi', 'en', 'fr', 'zh', 'ja'].includes(currentLang) && !autoTranslations[originalText] && VIETNAMESE_REGEX.test(originalText)) {
          enqueueForTranslation(originalText);
        }
        return mapTrans;
      }
      if (VIETNAMESE_REGEX.test(originalText)) {
        enqueueForTranslation(originalText);
      }
    }

    return item[field] || fallback || '';
  }, [currentLang, autoTranslations, enqueueForTranslation]);

  const NATIVE_LANG_META: Record<string, { nativeName: string; flagIcon: string; name: string }> = {
    vi: { nativeName: 'Tiếng Việt', flagIcon: '🇻🇳', name: 'Tiếng Việt' },
    en: { nativeName: 'English', flagIcon: '🇬🇧', name: 'English' },
    fr: { nativeName: 'Français', flagIcon: '🇫🇷', name: 'French' },
    zh: { nativeName: '中文 (简体)', flagIcon: '🇨🇳', name: 'Chinese' },
    ja: { nativeName: '日本語', flagIcon: '🇯🇵', name: 'Japanese' },
    ko: { nativeName: '한국어', flagIcon: '🇰🇷', name: 'Korean' },
    es: { nativeName: 'Español', flagIcon: '🇪🇸', name: 'Spanish' },
    de: { nativeName: 'Deutsch', flagIcon: '🇩🇪', name: 'German' },
    ru: { nativeName: 'Русский', flagIcon: '🇷🇺', name: 'Russian' },
    th: { nativeName: 'ไทย', flagIcon: '🇹🇭', name: 'Thai' },
    it: { nativeName: 'Italiano', flagIcon: '🇮🇹', name: 'Italian' }
  };

  const metaFallback = NATIVE_LANG_META[currentLang] || {
    nativeName: currentLang.toUpperCase(),
    flagIcon: '🌐',
    name: currentLang.toUpperCase()
  };

  const activeLanguageInfo = activeLanguages.find((l) => l.code.toLowerCase() === currentLang.toLowerCase()) || {
    code: currentLang,
    name: metaFallback.name,
    nativeName: metaFallback.nativeName,
    flagIcon: metaFallback.flagIcon,
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
