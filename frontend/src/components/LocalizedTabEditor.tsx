import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Volume2,
  Play,
  RotateCw,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { LanguageItem, RoomTranslation } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

interface LocalizedTabEditorProps {
  primaryValues: {
    name: string;
    period: string;
    description: string;
    narrationScript?: string;
    audioUrl?: string;
  };
  translations: Record<string, RoomTranslation>;
  onChange: (updatedTranslations: Record<string, RoomTranslation>) => void;
  roomCode?: string;
}

export const LocalizedTabEditor: React.FC<LocalizedTabEditorProps> = ({
  primaryValues,
  translations,
  onChange,
  roomCode
}) => {
  const { showToast } = useToast();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('vi');
  const [isLoadingLangs, setIsLoadingLangs] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [showConfirmDeleteLang, setShowConfirmDeleteLang] = useState(false);

  // Tải danh mục ngôn ngữ từ Database:
  // Tải toàn bộ ngôn ngữ (kể cả active và inactive), đồng thời đảm bảo:
  // 1. Mọi ngôn ngữ đang active được hiển thị
  // 2. Bất kỳ ngôn ngữ nào mà phòng này HIỆN ĐANG CÓ DỮ LIỆU (kể cả đã bị Admin tắt như 'ja')
  //    cũng ĐƯỢC HIỂN THỊ để Admin có thể kiểm tra và bấm "Gỡ bỏ khỏi phòng"
  useEffect(() => {
    let isMounted = true;
    async function loadLanguagesForEditor() {
      try {
        setIsLoadingLangs(true);
        const data = await api.getLanguages();
        if (isMounted && Array.isArray(data)) {
          const existingCodes = new Set(Object.keys(translations || {}));
          existingCodes.add('vi');

          // Lấy tất cả ngôn ngữ active HOẶC các ngôn ngữ đang có dữ liệu trong phòng này
          const visibleLangs = data.filter(
            (lang: any) => lang.isActive || existingCodes.has(lang.code)
          );

          if (!visibleLangs.some((l: any) => l.code === 'vi')) {
            visibleLangs.unshift({
              code: 'vi',
              name: 'Vietnamese',
              nativeName: 'Tiếng Việt',
              flagIcon: 'VI',
              isDefault: true,
              isActive: true,
              order: 1
            });
          }

          visibleLangs.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
          setLanguages(visibleLangs);
        }
      } catch (err: any) {
        console.warn('Lỗi tải danh mục ngôn ngữ:', err.message);
      } finally {
        if (isMounted) setIsLoadingLangs(false);
      }
    }
    loadLanguagesForEditor();
    return () => {
      isMounted = false;
    };
  }, [translations]);

  // Lấy dữ liệu của tab hiện hành (hoặc tạo mới nếu chưa có)
  const currentTranslation: RoomTranslation = translations[activeTab] || {
    name: '',
    period: '',
    description: '',
    narrationScript: '',
    audioUrl: ''
  };

  // Cập nhật giá trị trường cụ thể cho tab hiện tại
  const updateField = (field: keyof RoomTranslation, value: string) => {
    const updated = {
      ...translations,
      [activeTab]: {
        ...currentTranslation,
        [field]: value
      }
    };
    onChange(updated);
  };

  // Kích hoạt Dịch tự động bằng AI có áp dụng Heritage Glossary
  const handleAiTranslate = async () => {
    if (!primaryValues.name && !primaryValues.description) {
      showToast('Cần có dữ liệu Tiếng Việt gốc trước khi dịch', 'warning');
      return;
    }

    try {
      setIsTranslating(true);
      const result = await api.translateDraft({
        targetLang: activeTab,
        name: primaryValues.name,
        period: primaryValues.period,
        description: primaryValues.description,
        narrationScript: primaryValues.narrationScript || currentTranslation.narrationScript
      });

      const updated = {
        ...translations,
        [activeTab]: {
          ...currentTranslation,
          name: result.name || currentTranslation.name,
          period: result.period || currentTranslation.period,
          description: result.description || currentTranslation.description,
          narrationScript: result.narrationScript || currentTranslation.narrationScript
        }
      };
      onChange(updated);
      showToast(`Đã điền bản dịch chuyên sâu cho [${activeTab.toUpperCase()}]`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi dịch AI: ' + err.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Sinh file Voice AI tĩnh (Pre-rendered TTS)
  const handleGenerateTts = async () => {
    const scriptToSpeak = activeTab === 'vi'
      ? (primaryValues.narrationScript || currentTranslation.narrationScript)
      : currentTranslation.narrationScript;

    if (!scriptToSpeak || !scriptToSpeak.trim()) {
      showToast('Vui lòng nhập kịch bản thuyết minh trước khi sinh Voice AI', 'warning');
      return;
    }

    try {
      setIsGeneratingTts(true);
      const res = await api.generateTtsAudio({
        text: scriptToSpeak,
        langCode: activeTab,
        roomCode: roomCode || 'room'
      });

      updateField('audioUrl', res.audioUrl);
      setPreviewAudioUrl(res.audioUrl);
      showToast(`Đã xuất file Voice AI [${activeTab.toUpperCase()}] thành công!`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi tạo Voice AI: ' + err.message, 'error');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Gỡ bỏ file âm thanh Voice AI của tab ngôn ngữ hiện tại
  const handleRemoveVoiceAi = async () => {
    const audioUrl = currentTranslation.audioUrl;
    if (audioUrl) {
      await api.deleteAudioFile(audioUrl);
    }
    updateField('audioUrl', '');
    setPreviewAudioUrl(null);
    showToast(`Đã gỡ bỏ file Voice AI của [${activeTab.toUpperCase()}]. Bấm 'Lưu thay đổi vào Database' để hoàn tất.`, 'info');
  };

  // Gỡ bỏ hoàn toàn một ngôn ngữ (bản dịch và file âm thanh) khỏi gian phòng
  const handleConfirmDeleteLanguage = async () => {
    if (activeTab === 'vi') return;

    const langName = languages.find(l => l.code === activeTab)?.nativeName || activeTab.toUpperCase();

    // Dọn dẹp file âm thanh vật lý trên server nếu có
    if (currentTranslation.audioUrl) {
      await api.deleteAudioFile(currentTranslation.audioUrl);
    }

    const nextTranslations = { ...translations };
    delete nextTranslations[activeTab];

    onChange(nextTranslations);
    setActiveTab('vi');
    setPreviewAudioUrl(translations.vi?.audioUrl || null);
    setShowConfirmDeleteLang(false);
    showToast(`Đã gỡ bỏ ngôn ngữ ${langName} khỏi gian phòng này`, 'success');
  };

  const hasLanguageData = Boolean(
    translations[activeTab]?.name?.trim() ||
    translations[activeTab]?.narrationScript?.trim() ||
    translations[activeTab]?.audioUrl?.trim()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tab Navigation Header (Tải động theo các ngôn ngữ Active) */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: '1px solid var(--border-color)',
          overflowX: 'auto',
          paddingBottom: 2
        }}
      >
        {languages.map((lang) => {
          const isSelected = activeTab === lang.code;
          const hasContent = lang.code === 'vi' ? true : Boolean(translations[lang.code]?.name || translations[lang.code]?.audioUrl);

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setActiveTab(lang.code);
                setPreviewAudioUrl(translations[lang.code]?.audioUrl || null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                border: 'none',
                background: isSelected ? 'var(--bg-surface)' : 'transparent',
                borderBottom: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Globe size={13} style={{ opacity: isSelected ? 1 : 0.6 }} />
              <span>{lang.nativeName}</span>
              {lang.code === 'vi' && (
                <span
                  style={{
                    fontSize: '10px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    fontWeight: 700
                  }}
                >
                  Gốc
                </span>
              )}
              {!lang.isActive && lang.code !== 'vi' && (
                <span
                  style={{
                    fontSize: '9.5px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: 'var(--error)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '1px 5px',
                    borderRadius: 3,
                    fontWeight: 600
                  }}
                  title="Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ"
                >
                  Đã tắt
                </span>
              )}
              {lang.code !== 'vi' && hasContent && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* NỘI DUNG THEO TAB NGÔN NGỮ */}
      {activeTab === 'vi' ? (
        /* Tab Tiếng Việt (Dữ liệu gốc chuẩn) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12.5px',
              color: 'var(--text-muted)'
            }}
          >
            <HelpCircle size={15} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
            <span>
              Tab Tiếng Việt là dữ liệu gốc của hệ thống. Thông tin cơ bản (Tên, Mã, Chuyên đề) được chỉnh sửa ở form phía trên.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              Kịch bản thuyết minh Voice AI (Tiếng Việt)
            </label>
            <textarea
              rows={3}
              className="form-control"
              value={translations.vi?.narrationScript || primaryValues.narrationScript || ''}
              onChange={(e) => updateField('narrationScript', e.target.value)}
              placeholder="Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°..."
              style={{ fontSize: '13px', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleGenerateTts}
              disabled={isGeneratingTts}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isGeneratingTts ? <RotateCw size={13} className="spin" /> : <Volume2 size={13} />}
              <span>Sinh file Voice AI Tiếng Việt</span>
            </button>

            {translations.vi?.audioUrl && (
              <>
                <span style={{ fontSize: '11.5px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} />
                  <span>Đã có file Voice AI</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRemoveVoiceAi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--error)',
                    borderColor: 'var(--border-color)',
                    fontSize: '11.5px'
                  }}
                  title="Gỡ bỏ file Voice AI Tiếng Việt khỏi phòng này"
                >
                  <Trash2 size={12} />
                  <span>Gỡ bỏ Voice AI</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Các tab Ngoại ngữ (en, fr, ja, zh, de...) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Action Bar hỗ trợ Dịch tự động bằng AI và Gỡ bỏ ngôn ngữ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Ngôn ngữ [<strong>{activeTab.toUpperCase()}</strong>] - {languages.find(l => l.code === activeTab)?.nativeName}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAiTranslate}
                disabled={isTranslating}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', padding: '5px 12px' }}
              >
                {isTranslating ? (
                  <RotateCw size={13} className="spin" />
                ) : (
                  <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                )}
                <span>Dịch tự động bằng AI</span>
              </button>

              {hasLanguageData && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowConfirmDeleteLang(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--error)',
                    borderColor: 'var(--border-color)',
                    fontSize: '12px',
                    padding: '5px 10px'
                  }}
                  title={`Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ [${activeTab.toUpperCase()}] khỏi gian phòng này`}
                >
                  <Trash2 size={13} />
                  <span>Gỡ bỏ ngôn ngữ này khỏi phòng</span>
                </button>
              )}
            </div>
          </div>

          {/* Cảnh báo nếu ngôn ngữ này đã bị tắt trong hệ thống */}
          {!languages.find(l => l.code === activeTab)?.isActive && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--error)',
                lineHeight: 1.5
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>
                Ngôn ngữ <strong>[{activeTab.toUpperCase()}]</strong> này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút <strong>"Gỡ bỏ ngôn ngữ này khỏi phòng"</strong> ở trên để dọn dẹp sạch dữ liệu cũ.
              </span>
            </div>
          )}

          {/* Form trường dữ liệu bản dịch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                Tên gian phòng ({activeTab.toUpperCase()})
              </label>
              <input
                type="text"
                className="form-control"
                value={currentTranslation.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={`Nhập tên phòng bằng ${activeTab}...`}
                style={{ fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                Chuyên đề trưng bày ({activeTab.toUpperCase()})
              </label>
              <input
                type="text"
                className="form-control"
                value={currentTranslation.period || ''}
                onChange={(e) => updateField('period', e.target.value)}
                placeholder="Ví dụ: Chronicle of Vietnamese History..."
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
              Mô tả tóm tắt ({activeTab.toUpperCase()})
            </label>
            <textarea
              rows={2}
              className="form-control"
              value={currentTranslation.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Tóm tắt giới thiệu không gian bằng ngoại ngữ..."
              style={{ fontSize: '13px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
              Kịch bản thuyết minh Voice AI ({activeTab.toUpperCase()})
            </label>
            <textarea
              rows={3}
              className="form-control"
              value={currentTranslation.narrationScript || ''}
              onChange={(e) => updateField('narrationScript', e.target.value)}
              placeholder={`Kịch bản đọc phát âm chuẩn cho du khách quốc tế (${activeTab})...`}
              style={{ fontSize: '13px', lineHeight: 1.6 }}
            />
          </div>

          {/* Cụm sinh Voice AI và Trình nghe thử */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleGenerateTts}
              disabled={isGeneratingTts || !currentTranslation.narrationScript}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isGeneratingTts ? <RotateCw size={13} className="spin" /> : <Volume2 size={13} />}
              <span>Sinh file Voice AI ({activeTab.toUpperCase()})</span>
            </button>

            {currentTranslation.audioUrl && (
              <>
                <span style={{ fontSize: '11.5px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} />
                  <span>Đã có file Voice AI</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRemoveVoiceAi}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    color: 'var(--error)',
                    borderColor: 'var(--border-color)',
                    fontSize: '11.5px'
                  }}
                  title={`Gỡ bỏ file âm thanh thuyết minh của [${activeTab.toUpperCase()}] khỏi phòng này`}
                >
                  <Trash2 size={12} />
                  <span>Gỡ bỏ Voice AI</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trình nghe thử âm thanh nếu có audioUrl */}
      {(previewAudioUrl || currentTranslation.audioUrl) && (
        <div
          style={{
            marginTop: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={14} />
              <span>Nghe thử Voice AI tiền kết xuất [{activeTab.toUpperCase()}]:</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveVoiceAi}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--error)',
                cursor: 'pointer',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 4px'
              }}
              title="Xóa file âm thanh này"
            >
              <Trash2 size={12} />
              <span>Gỡ bỏ file Voice AI</span>
            </button>
          </div>
          <audio
            controls
            key={previewAudioUrl || currentTranslation.audioUrl}
            style={{ width: '100%', height: 36 }}
          >
            <source src={previewAudioUrl || currentTranslation.audioUrl} type="audio/mpeg" />
            Trình duyệt không hỗ trợ thẻ audio.
          </audio>
        </div>
      )}

      {/* Modal xác nhận gỡ bỏ ngôn ngữ khỏi gian phòng */}
      <ConfirmModal
        isOpen={showConfirmDeleteLang}
        title={`Gỡ bỏ ngôn ngữ [${activeTab.toUpperCase()}] khỏi phòng`}
        message={`Bạn có chắc chắn muốn gỡ bỏ hoàn toàn bản dịch và file thuyết minh Voice AI của ngôn ngữ ${languages.find(l => l.code === activeTab)?.nativeName || activeTab.toUpperCase()} khỏi gian phòng này?`}
        confirmText="Xác nhận gỡ bỏ"
        cancelText="Giữ lại"
        type="danger"
        onConfirm={handleConfirmDeleteLanguage}
        onCancel={() => setShowConfirmDeleteLang(false)}
      />
    </div>
  );
};
