import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Plus,
  Check,
  X,
  Volume2,
  Play,
  RotateCw,
  Trash2,
  Languages,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  Cpu,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { LanguageItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';

const PAGE_SIZE = 5;

export const AdminLanguagePage: React.FC = () => {
  const { showToast } = useToast();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<{ url: string; langName: string; flag: string } | null>(null);

  // Search & Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form thêm ngôn ngữ mới
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNativeName, setNewNativeName] = useState('');
  const [newFlag, setNewFlag] = useState('🌐');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newVoiceName, setNewVoiceName] = useState('neural2-standard');
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

  // Reset trang khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

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

      setPreviewAudio({
        url: audioUrl,
        langName: lang.nativeName,
        flag: lang.flagIcon || '🌐'
      });
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

  // Lọc danh sách theo từ khóa và trạng thái
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && l.isActive) ||
        (statusFilter === 'inactive' && !l.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [languages, searchQuery, statusFilter]);

  // Phân trang dữ liệu
  const paginatedLanguages = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLanguages.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLanguages, currentPage]);

  const activeCount = languages.filter((l) => l.isActive).length;
  const activePercent = languages.length > 0 ? Math.round((activeCount / languages.length) * 100) : 0;

  return (
    <div className="admin-content" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="lang-management-page">
        {/* HEADER SECTION */}
        <div className="lang-header-row">
          <div className="lang-header-title-group">
            <div className="lang-header-icon-badge">
              <Languages size={22} />
            </div>
            <div>
              <h1 className="lang-header-title">
                Quản trị Danh mục Ngôn ngữ & Voice AI
              </h1>
              <p className="lang-header-desc">
                Hệ thống Đa ngôn ngữ Động: Khách tham quan Client chỉ có quyền chọn các ngôn ngữ được Admin kích hoạt tại đây.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchLanguages}
              disabled={loading}
              title="Làm mới dữ liệu từ máy chủ"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

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
        </div>

        {/* KPI METRIC CARDS */}
        <div className="lang-kpi-grid">
          {/* CARD 1: TỔNG NGÔN NGỮ */}
          <div className="lang-kpi-card">
            <div className="lang-kpi-top">
              <span className="lang-kpi-label">Tổng ngôn ngữ hệ thống</span>
              <div className="lang-kpi-icon-pill" style={{ background: 'rgba(212, 168, 106, 0.12)', color: 'var(--accent-gold)' }}>
                <Languages size={17} />
              </div>
            </div>
            <div className="lang-kpi-val">
              <span>{languages.length}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>quốc gia</span>
            </div>
            <span className="lang-kpi-sub">
              Sẵn sàng bản dịch thuyết minh & âm thanh AI
            </span>
          </div>

          {/* CARD 2: ĐANG HIỂN THỊ TRÊN CLIENT */}
          <div className="lang-kpi-card">
            <div className="lang-kpi-top">
              <span className="lang-kpi-label">Đang hiển thị trên Client</span>
              <div className="lang-kpi-icon-pill" style={{ background: 'rgba(140, 45, 25, 0.12)', color: 'var(--primary)' }}>
                <Eye size={17} />
              </div>
            </div>
            <div className="lang-kpi-val">
              <span>{activeCount}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>/ {languages.length}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', marginLeft: 'auto' }}>
                {activePercent}%
              </span>
            </div>
            <div className="lang-progress-bar">
              <div className="lang-progress-fill" style={{ width: `${activePercent}%` }} />
            </div>
            <span className="lang-kpi-sub">
              Khách tham quan có thể lựa chọn tự do
            </span>
          </div>

          {/* CARD 3: VOICE AI ENGINE */}
          <div className="lang-kpi-card">
            <div className="lang-kpi-top">
              <span className="lang-kpi-label">Voice AI Engine</span>
              <div className="lang-kpi-icon-pill" style={{ background: 'rgba(212, 168, 106, 0.12)', color: 'var(--accent-gold)' }}>
                <Volume2 size={17} />
              </div>
            </div>
            <div className="lang-kpi-val" style={{ fontSize: '20px' }}>
              <span>Pre-rendered Studio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(212, 168, 106, 0.12)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(212, 168, 106, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}
              >
                Độ trễ 0ms
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Chuẩn ngữ điệu sử học
              </span>
            </div>
          </div>
        </div>

        {/* AUDIO PLAYER BANNER NẾU ĐANG NGHE THỬ */}
        {previewAudio && (
          <div className="lang-audio-banner">
            <div className="lang-audio-banner-left">
              <div className="lang-audio-equalizer">
                <span className="lang-eq-bar" />
                <span className="lang-eq-bar" />
                <span className="lang-eq-bar" />
                <span className="lang-eq-bar" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{previewAudio.flag}</span>
                  <span>Đang phát mẫu giọng đọc AI: {previewAudio.langName}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Kiểm tra ngữ điệu, nhịp độ và sự lưu loát của bản ghi âm
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end', minWidth: 280 }}>
              <audio
                controls
                autoPlay
                key={previewAudio.url}
                src={previewAudio.url}
                style={{ height: 36, maxWidth: 360, width: '100%' }}
              >
                Trình duyệt không hỗ trợ audio.
              </audio>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewAudio(null)}
                title="Đóng phát âm"
                style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <X size={14} />
                <span style={{ fontSize: '12px' }}>Tắt</span>
              </button>
            </div>
          </div>
        )}

        {/* TOOLBAR: TÌM KIẾM & BỘ LỌC */}
        <div className="lang-toolbar-card">
          <div className="lang-toolbar-controls">
            {/* Ô TÌM KIẾM */}
            <div className="lang-search-wrapper">
              <Search size={15} className="lang-search-icon" />
              <input
                type="text"
                placeholder="Tìm theo tên tiếng Việt, bản xứ hoặc mã ISO (vi, en, fr...)"
                className="lang-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="lang-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* BỘ LỌC TRẠNG THÁI */}
            <select
              className="lang-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả trạng thái ({languages.length})</option>
              <option value="active">Đang hiển thị trên Client ({activeCount})</option>
              <option value="inactive">Đang tạm tắt ({languages.length - activeCount})</option>
            </select>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Tìm thấy <strong>{filteredLanguages.length}</strong> / <strong>{languages.length}</strong> ngôn ngữ
          </div>
        </div>

        {/* BẢNG DỮ LIỆU & PHÂN TRANG */}
        <div className="lang-table-card">
          {filteredLanguages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <Languages size={36} style={{ color: 'var(--border-dark)', margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--heading-color)', marginBottom: 6 }}>
                Không tìm thấy ngôn ngữ phù hợp
              </div>
              <p style={{ fontSize: '13px', maxWidth: 420, margin: '0 auto 16px' }}>
                Không có ngôn ngữ nào khớp với từ khóa tìm kiếm & bộ lọc hiện tại. Vui lòng thử lại.
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP / TABLET VIEW: BẢNG CUỘN NGANG TỰ NHIÊN */}
              <div className="lang-table-scroll">
                <table className="lang-table">
                  <thead>
                    <tr>
                      <th style={{ width: 100, textAlign: 'center' }}>Cờ & ISO</th>
                      <th>Ngôn ngữ bản xứ</th>
                      <th>Cấu hình Giọng đọc AI</th>
                      <th style={{ width: 180 }}>Trực tuyến (Client)</th>
                      <th style={{ width: 160, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLanguages.map((lang) => (
                      <tr key={lang.code}>
                        {/* CỜ & MÃ ISO */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '24px', lineHeight: 1 }}>{lang.flagIcon || '🌐'}</span>
                            <span className="lang-iso-pill">{lang.code.toUpperCase()}</span>
                          </div>
                        </td>

                        {/* TÊN BẢN XỨ & TIẾNG ANH */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--heading-color)' }}>
                                {lang.nativeName}
                              </span>
                              {lang.isDefault && (
                                <span
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary-border)',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    letterSpacing: '0.2px'
                                  }}
                                >
                                  Gốc mặc định
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                              Tên quốc tế: {lang.name}
                            </span>
                          </div>
                        </td>

                        {/* CẤU HÌNH GIỌNG ĐỌC AI */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div className="lang-voice-chip">
                              <Volume2 size={13} style={{ color: 'var(--accent-gold)' }} />
                              <span style={{ fontWeight: 600 }}>{lang.ttsVoiceConfig?.voiceName || 'Google Neural2'}</span>
                              <span style={{ color: 'var(--border-dark)' }}>•</span>
                              <span>{lang.ttsVoiceConfig?.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              Tốc độ: {lang.ttsVoiceConfig?.speed || 1.0}x | Nhà cung cấp: Google Cloud TTS
                            </span>
                          </div>
                        </td>

                        {/* TRẠNG THÁI HIỂN THỊ */}
                        <td>
                          <button
                            type="button"
                            className={`lang-status-badge ${lang.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(lang)}
                            disabled={lang.isDefault}
                            title={lang.isDefault ? 'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định' : 'Bấm để bật / tắt hiển thị trên trang khách tham quan'}
                          >
                            <span className="lang-status-dot" />
                            <span>{lang.isActive ? 'Đang hiển thị' : 'Đang tạm tắt'}</span>
                          </button>
                        </td>

                        {/* THAO TÁC */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleTestVoice(lang)}
                              disabled={testingCode === lang.code}
                              title="Nghe thử âm thanh thuyết minh AI"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}
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
                                style={{ padding: '6px 10px', color: 'var(--error)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW: DẠNG DANH SÁCH THẺ GỌN GÀNG CHO MÀN HÌNH NHỎ */}
              <div className="lang-mobile-list">
                {paginatedLanguages.map((lang) => (
                  <div key={lang.code} className="lang-mobile-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '28px', lineHeight: 1 }}>{lang.flagIcon || '🌐'}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--heading-color)' }}>
                              {lang.nativeName}
                            </span>
                            <span className="lang-iso-pill">{lang.code.toUpperCase()}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lang.name}</span>
                        </div>
                      </div>

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
                          Mặc định
                        </span>
                      )}
                    </div>

                    <div style={{ background: 'var(--bg-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Volume2 size={13} style={{ color: 'var(--accent-gold)' }} />
                        <span>Giọng: <strong>{lang.ttsVoiceConfig?.voiceName || 'Google Neural2'}</strong> ({lang.ttsVoiceConfig?.gender === 'male' ? 'Nam' : 'Nữ'})</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 6, borderTop: '1px dashed var(--border-color)' }}>
                      <button
                        type="button"
                        className={`lang-status-badge ${lang.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(lang)}
                        disabled={lang.isDefault}
                      >
                        <span className="lang-status-dot" />
                        <span>{lang.isActive ? 'Đang hiển thị' : 'Đang tạm tắt'}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleTestVoice(lang)}
                          disabled={testingCode === lang.code}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
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
                            style={{ color: 'var(--error)', padding: '6px 8px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PHÂN TRANG CHUẨN CỦA HỆ THỐNG */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredLanguages.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>

        {/* MODAL THÊM NGÔN NGỮ MỚI */}
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)} style={{ zIndex: 1200 }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212, 168, 106, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Languages size={17} />
                  </div>
                  <div>
                    <h2 className="modal-title" style={{ fontSize: '17px', margin: 0 }}>Thêm Ngôn ngữ Mới</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cấu hình quốc gia & giọng đọc AI thuyết minh</span>
                  </div>
                </div>
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
                      <label className="form-label">Mã ISO (2 ký tự) *</label>
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
                    <label className="form-label">Tên bản ngữ (Hiển thị cho du khách) *</label>
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
                    <label className="form-label">Tên tiếng Anh *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Spanish, Italian, Russian..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Giọng đọc Voice AI mặc định</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="neural2-female, standard..."
                        value={newVoiceName}
                        onChange={(e) => setNewVoiceName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Giới tính giọng</label>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <input
                      type="checkbox"
                      id="chkIsActive"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent-gold)' }}
                    />
                    <label htmlFor="chkIsActive" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-main)' }}>
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
    </div>
  );
};
