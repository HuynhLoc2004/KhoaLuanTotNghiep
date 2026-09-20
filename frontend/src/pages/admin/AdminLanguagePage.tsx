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
  VolumeX
} from 'lucide-react';
import { LanguageItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';

export interface LanguagePreset {
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
  voiceName: string;
  gender: 'female' | 'male';
  label: string;
}

export const GLOBAL_LANGUAGE_PRESETS: LanguagePreset[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flagIcon: '🇪🇸', voiceName: 'es-ES-Neural2-A', gender: 'female', label: 'Tây Ban Nha' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flagIcon: '🇷🇺', voiceName: 'ru-RU-Wavenet-C', gender: 'female', label: 'Nga' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flagIcon: '🇮🇹', voiceName: 'it-IT-Neural2-A', gender: 'female', label: 'Ý' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flagIcon: '🇹🇭', voiceName: 'th-TH-Standard-A', gender: 'female', label: 'Thái Lan' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flagIcon: '🇩🇪', voiceName: 'de-DE-Neural2-F', gender: 'female', label: 'Đức' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flagIcon: '🇰🇷', voiceName: 'ko-KR-Neural2-A', gender: 'female', label: 'Hàn Quốc' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flagIcon: '🇮🇩', voiceName: 'id-ID-Standard-A', gender: 'female', label: 'Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flagIcon: '🇲🇾', voiceName: 'ms-MY-Standard-A', gender: 'female', label: 'Malaysia' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagIcon: '🇵🇹', voiceName: 'pt-PT-Wavenet-A', gender: 'female', label: 'Bồ Đào Nha' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagIcon: '🇦🇪', voiceName: 'ar-XA-Wavenet-A', gender: 'female', label: 'Ả Rập' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagIcon: '🇮🇳', voiceName: 'hi-IN-Neural2-A', gender: 'female', label: 'Ấn Độ (Hindi)' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flagIcon: '🇳🇱', voiceName: 'nl-NL-Standard-A', gender: 'female', label: 'Hà Lan' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flagIcon: '🇵🇱', voiceName: 'pl-PL-Wavenet-A', gender: 'female', label: 'Ba Lan' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flagIcon: '🇸🇪', voiceName: 'sv-SE-Wavenet-A', gender: 'female', label: 'Thụy Điển' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagIcon: '🇹🇷', voiceName: 'tr-TR-Standard-A', gender: 'female', label: 'Thổ Nhĩ Kỳ' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flagIcon: '🇬🇷', voiceName: 'el-GR-Standard-A', gender: 'female', label: 'Hy Lạp' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flagIcon: '🇰🇭', voiceName: 'km-KH-Standard-A', gender: 'female', label: 'Campuchia (Khmer)' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flagIcon: '🇱🇦', voiceName: 'lo-LA-Standard-A', gender: 'female', label: 'Lào' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flagIcon: '🇯🇵', voiceName: 'ja-JP-Neural2-B', gender: 'female', label: 'Nhật Bản' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flagIcon: '🇨🇳', voiceName: 'cmn-CN-Wavenet-A', gender: 'female', label: 'Trung Quốc' },
  { code: 'fr', name: 'French', nativeName: 'Français', flagIcon: '🇫🇷', voiceName: 'fr-FR-Neural2-A', gender: 'female', label: 'Pháp' },
  { code: 'en', name: 'English', nativeName: 'English', flagIcon: '🇬🇧', voiceName: 'en-US-Neural2-F', gender: 'female', label: 'Anh (UK/US)' },
];

export const AdminLanguagePage: React.FC = () => {
  const { showToast } = useToast();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<{ url: string; langName: string; flag: string } | null>(null);

  // Search & Filter & Pagination state (Chuẩn 5 - 10 - 20 - 30 - 50)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Form thêm ngôn ngữ mới & Validation
  const [selectedPresetCode, setSelectedPresetCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNativeName, setNewNativeName] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newVoiceName, setNewVoiceName] = useState('neural2-standard');
  const [newGender, setNewGender] = useState<'female' | 'male'>('female');
  const [formErrors, setFormErrors] = useState<{
    code?: string;
    nativeName?: string;
    name?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Áp dụng cấu hình tự động khi chọn ngôn ngữ từ thư viện
  const handleApplyPreset = (code: string) => {
    setSelectedPresetCode(code);
    if (!code) return;
    const preset = GLOBAL_LANGUAGE_PRESETS.find((p) => p.code === code);
    if (!preset) return;

    setNewCode(preset.code);
    setNewFlag(preset.flagIcon);
    setNewNativeName(preset.nativeName);
    setNewName(preset.name);
    setNewVoiceName(preset.voiceName);
    setNewGender(preset.gender);
    setFormErrors({});
  };

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

  // Tải danh sách ngôn ngữ ban đầu
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

  // Làm mới danh mục ngôn ngữ (có hiệu ứng xoay icon loading tối thiểu 500ms)
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const [data] = await Promise.all([
        api.getLanguages(),
        new Promise((resolve) => setTimeout(resolve, 500))
      ]);
      setLanguages(data);
      showToast('Đã làm mới dữ liệu danh mục ngôn ngữ thành công', 'success');
    } catch (err: any) {
      showToast('Lỗi làm mới danh mục ngôn ngữ: ' + err.message, 'error');
    } finally {
      setIsRefreshing(false);
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

  // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
  const validateForm = () => {
    const errors: { code?: string; nativeName?: string; name?: string } = {};
    const trimmedCode = newCode.trim().toLowerCase();
    const trimmedNative = newNativeName.trim();
    const trimmedName = newName.trim();

    // Kiểm tra Mã ISO
    if (!trimmedCode) {
      errors.code = 'Vui lòng nhập mã ISO (ví dụ: en, fr, ja, ko)';
    } else if (!/^[a-z]{2,5}$/.test(trimmedCode)) {
      errors.code = 'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja)';
    } else if (languages.some((l) => l.code.toLowerCase() === trimmedCode)) {
      errors.code = `Mã ngôn ngữ "${trimmedCode}" đã tồn tại trong hệ thống`;
    }

    // Kiểm tra Tên bản xứ
    if (!trimmedNative) {
      errors.nativeName = 'Vui lòng nhập tên ngôn ngữ bản xứ';
    } else if (trimmedNative.length < 2) {
      errors.nativeName = 'Tên bản xứ phải có ít nhất 2 ký tự';
    }

    // Kiểm tra Tên tiếng Anh
    if (!trimmedName) {
      errors.name = 'Vui lòng nhập tên tiếng Anh';
    } else if (trimmedName.length < 2) {
      errors.name = 'Tên tiếng Anh phải có ít nhất 2 ký tự';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Thêm ngôn ngữ mới
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệ', 'warning');
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
          voiceName: newVoiceName.trim() || 'neural2-standard',
          gender: newGender,
          speed: 1.0,
          pitch: 0.0
        }
      });

      setLanguages((prev) => [...prev, newLang]);
      setShowAddModal(false);
      showToast(`Đã thêm ngôn ngữ "${newLang.nativeName}" thành công`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi thêm ngôn ngữ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedPresetCode('');
    setNewCode('');
    setNewName('');
    setNewNativeName('');
    setNewFlag('');
    setNewVoiceName('neural2-standard');
    setNewGender('female');
    setNewIsActive(true);
    setFormErrors({});
    setShowAddModal(true);
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
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLanguages.slice(startIndex, startIndex + pageSize);
  }, [filteredLanguages, currentPage, pageSize]);

  // Chiều cao tối thiểu cố định cho bảng để khi chuyển giữa các trang không bị giật hay co rút chiều cao
  const tableMinHeight = useMemo(() => {
    const rowsToReserve = Math.min(pageSize, Math.max(filteredLanguages.length, 1));
    return `${rowsToReserve * 74 + 46}px`;
  }, [pageSize, filteredLanguages.length]);

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
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              title="Làm mới dữ liệu từ máy chủ"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenAddModal}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Thêm ngôn ngữ mới</span>
            </button>
          </div>
        </div>

        {/* BĂNG TỔNG QUAN ĐA NGỮ DI SẢN: Thiết kế độc bản, trang trọng, loại bỏ các thẻ AI rời rạc */}
        <div className="heritage-stats-banner">
          {/* Mục 1: Danh mục Ngôn ngữ Quốc tế */}
          <div className="heritage-stat-col" style={{ flex: 1.2 }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Languages size={15} />
              </span>
              <span className="heritage-stat-title">Ngôn ngữ Phục vụ Khách Quốc tế</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{languages.length}</span>
                <span className="heritage-stat-unit">quốc gia & vùng lãnh thổ</span>
              </div>
              <div className="heritage-stat-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {languages.slice(0, 7).map((l) => (
                  <span key={l.code} title={`${l.nativeName} (${l.name})`} style={{ fontSize: 14 }}>
                    {l.flagIcon}
                  </span>
                ))}
                {languages.length > 7 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{languages.length - 7}</span>
                )}
              </div>
            </div>
          </div>

          {/* Mục 2: Tỷ lệ hiển thị trên Client */}
          <div className="heritage-stat-col" style={{ flex: 1 }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Eye size={15} />
              </span>
              <span className="heritage-stat-title">Đang Mở Cổng Tham quan</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{activeCount}</span>
                <span className="heritage-stat-denom">/{languages.length}</span>
                <span className="heritage-stat-unit">ngôn ngữ ({activePercent}%)</span>
              </div>
              <div className="heritage-stat-sub">
                <span>Khách tham quan tự do chuyển đổi trên tour 360</span>
              </div>
            </div>
          </div>

          {/* Mục 3: Chuẩn thuyết minh di sản */}
          <div className="heritage-stat-col" style={{ flex: 1.1, borderRight: 'none' }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Volume2 size={15} />
              </span>
              <span className="heritage-stat-title">Chuẩn Thuyết minh Di sản</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent-gold)' }}>
                  Ngữ điệu Bản xứ Chuẩn Sử học
                </span>
              </div>
              <div className="heritage-stat-sub">
                <span>Được thẩm định chuyên sâu cho Bảo tàng Lịch sử TP.HCM</span>
              </div>
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
              <div className="lang-table-scroll" style={{ minHeight: tableMinHeight }}>
                <table className="lang-table">
                  <thead>
                    <tr>
                      <th style={{ width: 85, textAlign: 'center' }}>Cờ & ISO</th>
                      <th style={{ minWidth: 160 }}>Ngôn ngữ bản xứ</th>
                      <th style={{ minWidth: 260 }}>Cấu hình Giọng đọc AI</th>
                      <th style={{ width: 170, textAlign: 'center' }}>Trực tuyến (Client)</th>
                      <th style={{ width: 190, textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody key={currentPage} className="lang-page-transition">
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
                        <td style={{ textAlign: 'center' }}>
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
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleTestVoice(lang)}
                              disabled={testingCode === lang.code}
                              title="Nghe thử âm thanh thuyết minh AI"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 14px',
                                whiteSpace: 'nowrap',
                                flexShrink: 0
                              }}
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
                                style={{
                                  width: 32,
                                  height: 32,
                                  padding: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--error)',
                                  flexShrink: 0
                                }}
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
              <div key={currentPage} className="lang-mobile-list lang-page-transition">
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

              {/* PHÂN TRANG CHUẨN CỦA HỆ THỐNG: 5 - 10 - 20 - 30 - 50 */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredLanguages.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20, 30, 50]}
                itemLabel="ngôn ngữ"
              />
            </>
          )}
        </div>

        {/* MODAL THÊM NGÔN NGỮ */}
        {showAddModal && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="modal-card" style={{ maxWidth: 520 }}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Thêm ngôn ngữ mới</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowAddModal(false)}
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} noValidate>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Danh mục mẫu chọn nhanh */}
                  <div className="form-group">
                    <label className="form-label">Chọn ngôn ngữ mẫu (Tùy chọn)</label>
                    <select
                      className="form-control"
                      value={selectedPresetCode}
                      onChange={(e) => handleApplyPreset(e.target.value)}
                    >
                      <option value="">-- Chọn mẫu để tự động điền (hoặc tự nhập thông tin bên dưới) --</option>
                      {GLOBAL_LANGUAGE_PRESETS.map((p) => {
                        const exists = languages.some((l) => l.code === p.code);
                        return (
                          <option key={p.code} value={p.code} disabled={exists}>
                            {p.flagIcon} {p.label} ({p.nativeName} - {p.name}) {exists ? '— [Đã có]' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Mã ISO & Cờ */}
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">
                        Mã ISO <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="vi, en, ja..."
                        maxLength={5}
                        value={newCode}
                        style={formErrors.code ? { borderColor: 'var(--error)' } : undefined}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
                          setNewCode(val);
                          if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }));
                        }}
                      />
                      {formErrors.code && (
                        <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                          {formErrors.code}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Biểu tượng cờ (Emoji)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: 🇬🇧, 🇫🇷, 🇯🇵..."
                        value={newFlag}
                        onChange={(e) => setNewFlag(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tên bản xứ */}
                  <div className="form-group">
                    <label className="form-label">
                      Tên bản xứ <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Tiếng Việt, English, 日本語..."
                      value={newNativeName}
                      style={formErrors.nativeName ? { borderColor: 'var(--error)' } : undefined}
                      onChange={(e) => {
                        setNewNativeName(e.target.value);
                        if (formErrors.nativeName) setFormErrors((prev) => ({ ...prev, nativeName: undefined }));
                      }}
                    />
                    {formErrors.nativeName && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.nativeName}
                      </span>
                    )}
                  </div>

                  {/* Tên tiếng Anh */}
                  <div className="form-group">
                    <label className="form-label">
                      Tên quốc tế (Tiếng Anh) <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Vietnamese, English, Japanese..."
                      value={newName}
                      style={formErrors.name ? { borderColor: 'var(--error)' } : undefined}
                      onChange={(e) => {
                        setNewName(e.target.value);
                        if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                    />
                    {formErrors.name && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Giọng đọc TTS & Giới tính */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Mã giọng đọc (TTS Voice)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="vi-VN-Standard-A, en-US-Neural2-F..."
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

                  {/* Checkbox kích hoạt */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <input
                      type="checkbox"
                      id="chkIsActive"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                    />
                    <label htmlFor="chkIsActive" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-main)', userSelect: 'none' }}>
                      Kích hoạt hiển thị cho khách tham quan (Client)
                    </label>
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {submitting && <RotateCw size={14} className="spin" />}
                    <span>Lưu ngôn ngữ</span>
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
