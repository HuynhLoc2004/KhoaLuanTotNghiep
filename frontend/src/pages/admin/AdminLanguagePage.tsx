import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Check,
  X,
  Volume2,
  Play,
  RotateCw,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sliders,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { LanguageItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminLanguagePage: React.FC = () => {
  const { showToast } = useToast();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);

  // Form thêm ngôn ngữ mới
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNativeName, setNewNativeName] = useState('');
  const [newFlag, setNewFlag] = useState('🌐');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newVoiceName, setNewVoiceName] = useState('standard');
  const [newGender, setNewGender] = useState<'female' | 'male'>('female');
  const [submitting, setSubmitting] = useState(false);

  // Confirm Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Tải danh sách ngôn ngữ
  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const data = await api.getLanguages();
      setLanguages(data);
    } catch (err: any) {
      showToast('Lỗi tải danh mục ngôn ngữ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Bật/Tắt trạng thái Active của ngôn ngữ
  const handleToggleActive = async (lang: LanguageItem) => {
    if (lang.isDefault) {
      showToast('Không thể vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việt)', 'warning');
      return;
    }

    try {
      const updated = await api.updateLanguage(lang.code, {
        isActive: !lang.isActive
      });
      setLanguages((prev) => prev.map((l) => (l.code === lang.code ? { ...l, isActive: updated.isActive } : l)));
      showToast(
        updated.isActive
          ? `Đã kích hoạt ngôn ngữ [${lang.nativeName}] cho khách tham quan Client`
          : `Đã tạm dừng hiển thị [${lang.nativeName}] trên Client`,
        'success'
      );
    } catch (err: any) {
      showToast('Lỗi cập nhật trạng thái ngôn ngữ: ' + err.message, 'error');
    }
  };

  // Nghe thử giọng đọc TTS của ngôn ngữ
  const handleTestVoice = async (lang: LanguageItem) => {
    try {
      setTestingCode(lang.code);
      const testTexts: Record<string, string> = {
        vi: 'Kính chào quý khách đến với Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Nơi lưu giữ ngàn năm văn hiến di sản phương Nam.',
        en: 'Welcome to the Museum of History in Ho Chi Minh City. Preserving thousands of years of Southern Vietnamese heritage.',
        fr: "Bienvenue au Musée d'Histoire de Hô Chi Minh-Ville. Gardien de millénaires de patrimoine du Sud Vietnamien.",
        ja: 'ホーチミン市歴史博物館へようこそ。千年の歴史と南部ベトナムの文化遺産を保存しています。',
        zh: '欢迎来到胡志明市历史博物馆，这里珍藏着越南南方数千年的珍贵文化遗产。',
        ko: '호치민시 역사박물관에 오신 것을 환영합니다. 남부 베트남의 유구한 역사와 문화유산을 간직하고 있습니다.',
        de: 'Willkommen im Historischen Museum von Ho-Chi-Minh-Stadt, dem Hüter des jahrtausendealten südvietnamesischen Kulturerbes.'
      };

      const speechText = testTexts[lang.code] || `Welcome to the Museum of History in ${lang.nativeName}`;

      // Tắt bất kỳ âm thanh phát trước đó để tránh trùng tiếng
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Gọi backend sinh và nạp file MP3 phòng thu chuẩn từ Google TTS
      const res = await api.generateTtsAudio({
        text: speechText,
        langCode: lang.code,
        roomCode: 'sample'
      });

      const audioUrl = res.audioUrl.startsWith('http')
        ? res.audioUrl
        : `${window.location.origin}${res.audioUrl}`;

      setPreviewAudio(audioUrl);
      showToast(`Đang phát giọng đọc AI [${lang.nativeName}]`, 'info');
    } catch (err: any) {
      // Fallback: nếu lỗi mạng mới phát qua giọng đọc trình duyệt
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const fallbackUtterance = new SpeechSynthesisUtterance(`Welcome to Museum of History in ${lang.nativeName}`);
        fallbackUtterance.lang = lang.code;
        window.speechSynthesis.speak(fallbackUtterance);
      }
      showToast('Lỗi thử giọng đọc AI: ' + err.message, 'error');
    } finally {
      setTestingCode(null);
    }
  };

  // Xóa ngôn ngữ
  const handleDeleteLanguage = (lang: LanguageItem) => {
    if (lang.isDefault) {
      showToast('Không thể xóa ngôn ngữ mặc định của hệ thống', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: `Xóa ngôn ngữ [${lang.nativeName}]`,
      message: `Bạn có chắc chắn muốn xóa ngôn ngữ "${lang.nativeName}" (${lang.code.toUpperCase()}) khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan.`,
      onConfirm: async () => {
        try {
          await api.deleteLanguage(lang.code);
          setLanguages((prev) => prev.filter((l) => l.code !== lang.code));
          showToast(`Đã xóa ngôn ngữ "${lang.nativeName}" thành công`, 'success');
        } catch (err: any) {
          showToast(err.message || 'Lỗi khi xóa ngôn ngữ', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Thêm ngôn ngữ mới
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim() || !newNativeName.trim()) {
      showToast('Vui lòng điền đủ Mã ISO, Tên tiếng Anh và Tên bản ngữ', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const newLang = await api.createLanguage({
        code: newCode.trim().toLowerCase(),
        name: newName.trim(),
        nativeName: newNativeName.trim(),
        flagIcon: newFlag.trim() || '🌐',
        isActive: newIsActive,
        ttsVoiceConfig: {
          provider: 'google',
          voiceName: newVoiceName,
          gender: newGender,
          speed: 1.0,
          pitch: 0.0
        }
      });

      setLanguages((prev) => [...prev, newLang]);
      setShowAddModal(false);
      // Reset form
      setNewCode('');
      setNewName('');
      setNewNativeName('');
      setNewFlag('🌐');
      showToast(`Đã thêm ngôn ngữ "${newLang.nativeName}" thành công`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi thêm ngôn ngữ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = languages.filter((l) => l.isActive).length;

  return (
    <div className="admin-content" style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Languages size={22} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
              Quản trị Danh mục Ngôn ngữ & Voice AI (Language Registry)
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Hệ thống Đa ngôn ngữ Động: Khách tham quan Client chỉ có quyền chọn các ngôn ngữ được Admin kích hoạt tại đây.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={15} />
          <span>Thêm ngôn ngữ mới</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Tổng ngôn ngữ hỗ trợ
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--heading-color)' }}>
            {languages.length}
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Đã nạp sẵn trong hệ thống
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Đang hiển thị trên Client
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--success)' }}>
            {activeCount} / {languages.length}
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Ngôn ngữ du khách có thể chọn
          </span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Voice AI Engine
          </span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)' }}>
            Pre-rendered
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Không lag, chuẩn phát âm sử học
          </span>
        </div>
      </div>

      {/* AUDIO PLAYER PREVIEW NẾU ĐANG NGHE THỬ */}
      {previewAudio && (
        <div
          style={{
            marginBottom: 20,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Volume2 size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-color)' }}>
                Đang phát mẫu âm thanh thuyết minh AI
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Kiểm tra ngữ điệu và độ chuẩn xác của giọng đọc
              </div>
            </div>
          </div>
          <audio controls autoPlay key={previewAudio} src={previewAudio} style={{ height: 36, minWidth: 260 }}>
            Trình duyệt không hỗ trợ audio.
          </audio>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPreviewAudio(null)}
            style={{ padding: '4px 8px' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* DANH SÁCH NGÔN NGỮ */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table className="rooms-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Cờ</th>
              <th>Ngôn ngữ bản xứ</th>
              <th>Mã ISO</th>
              <th>Cấu hình Giọng đọc AI</th>
              <th>Trực tuyến (Client)</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.code}>
                <td style={{ textAlign: 'center', fontSize: '24px' }}>
                  {lang.flagIcon || '🌐'}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--heading-color)' }}>
                      {lang.nativeName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({lang.name})</span>
                    {lang.isDefault && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '2px 7px',
                          borderRadius: 4
                        }}
                      >
                        Gốc mặc định
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12.5px', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 4 }}>
                    {lang.code.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={13} style={{ color: 'var(--accent-gold)' }} />
                    <span>{lang.ttsVoiceConfig?.voiceName || 'Google Standard'} ({lang.ttsVoiceConfig?.gender === 'male' ? 'Nam' : 'Nữ'})</span>
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(lang)}
                    disabled={lang.isDefault}
                    style={{
                      border: 'none',
                      background: lang.isActive ? 'var(--success-bg)' : 'var(--bg-subtle)',
                      color: lang.isActive ? 'var(--success)' : 'var(--text-muted)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: lang.isActive ? 'var(--success-border)' : 'var(--border-color)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: lang.isDefault ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: lang.isActive ? 'var(--success)' : 'var(--text-muted)'
                      }}
                    />
                    <span>{lang.isActive ? 'Đang bật (Client thấy)' : 'Đang tắt'}</span>
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleTestVoice(lang)}
                      disabled={testingCode === lang.code}
                      title="Nghe thử chất lượng giọng đọc AI"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px' }}
                    >
                      {testingCode === lang.code ? (
                        <RotateCw size={13} className="spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      <span>Thử giọng</span>
                    </button>

                    {!lang.isDefault && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteLanguage(lang)}
                        title="Xóa ngôn ngữ khỏi hệ thống"
                        style={{ padding: '5px 8px', color: 'var(--error)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM NGÔN NGỮ MỚI */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)} style={{ zIndex: 1200 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Thêm Ngôn ngữ Quốc tế Mới</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mã ISO (2 ký tự)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="es, it, ru..."
                      maxLength={5}
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon Cờ (Emoji)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🇪🇸, 🇮🇹, 🇷🇺..."
                      value={newFlag}
                      onChange={(e) => setNewFlag(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tên bản ngữ (Hiển thị cho du khách)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Español, Italiano, Русский..."
                    value={newNativeName}
                    onChange={(e) => setNewNativeName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tên tiếng Anh</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Spanish, Italian, Russian..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Giọng đọc Voice AI mặc định</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="neural2-female"
                      value={newVoiceName}
                      onChange={(e) => setNewVoiceName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giới tính</label>
                    <select
                      className="form-control"
                      value={newGender}
                      onChange={(e) => setNewGender(e.target.value as any)}
                    >
                      <option value="female">Nữ</option>
                      <option value="male">Nam</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="chkIsActive"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <label htmlFor="chkIsActive" style={{ fontSize: '13px', cursor: 'pointer' }}>
                    Kích hoạt ngay trên Client (Khách tham quan có thể chọn ngay)
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {submitting ? <RotateCw size={14} className="spin" /> : <Check size={14} />}
                  <span>Thêm ngôn ngữ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        confirmText="Xác nhận xóa"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
