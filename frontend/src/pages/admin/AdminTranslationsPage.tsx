import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Languages,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  Save,
  X,
  Filter,
  Globe,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { TranslationKeyItem, TranslationStatItem, LanguageItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '../../components/Pagination';
import { useSystemBranding } from '../../context/SystemBrandingContext';

const NAMESPACES = [
  { id: 'all', label: 'Tất cả phân mục' },
  { id: 'common', label: 'Thao tác chung (Buttons)' },
  { id: 'navigation', label: 'Điều hướng & Menu' },
  { id: 'tour360', label: 'Trải nghiệm Tour 360°' },
  { id: 'artifacts', label: 'Hiện vật & Di sản' },
  { id: 'voiceAssistant', label: 'Trợ lý Voice AI' },
  { id: 'modals', label: 'Hộp thoại & Cửa sổ' },
  { id: 'alerts', label: 'Thông báo & Trạng thái' }
];

export const AdminTranslationsPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding } = useSystemBranding();

  // State dữ liệu
  const [keys, setKeys] = useState<TranslationKeyItem[]>([]);
  const [stats, setStats] = useState<TranslationStatItem[]>([]);
  const [totalKeysCount, setTotalKeysCount] = useState<number>(0);
  const [activeLanguages, setActiveLanguages] = useState<LanguageItem[]>([]);
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>('en');

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [batchTranslating, setBatchTranslating] = useState<boolean>(false);
  const [singleTranslatingKeyId, setSingleTranslatingKeyId] = useState<string | null>(null);

  // Bộ lọc & Phân trang (theo chuẩn hệ thống [6, 9, 12, 18, 24])
  const [search, setSearch] = useState<string>('');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [onlyUntranslated, setOnlyUntranslated] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFilteredItems, setTotalFilteredItems] = useState<number>(0);

  // Chỉnh sửa inline nhanh
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditText, setInlineEditText] = useState<string>('');

  // Modal tạo mới / sửa chi tiết
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedKeyForEdit, setSelectedKeyForEdit] = useState<TranslationKeyItem | null>(null);
  const [formData, setFormData] = useState<{
    key: string;
    namespace: string;
    defaultText: string;
    description: string;
    translations: Record<string, string>;
  }>({
    key: '',
    namespace: 'common',
    defaultText: '',
    description: '',
    translations: {}
  });

  // Modal xác nhận xóa
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [keyToDelete, setKeyToDelete] = useState<TranslationKeyItem | null>(null);

  // Modal xác nhận dịch đồng loạt
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [batchOverwrite, setBatchOverwrite] = useState<boolean>(false);

  // 1. Tải danh sách ngôn ngữ kích hoạt
  const fetchActiveLanguages = useCallback(async () => {
    try {
      const res = await fetch('/api/languages/active');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setActiveLanguages(json.data);
          const nonVi = json.data.find((l: LanguageItem) => l.code !== 'vi');
          if (nonVi && !selectedTargetLang) {
            setSelectedTargetLang(nonVi.code);
          }
        }
      }
    } catch (err: any) {
      console.warn('[AdminTranslations] Lỗi tải ngôn ngữ:', err);
    }
  }, [selectedTargetLang]);

  // 2. Tải thống kê độ phủ bản dịch
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getTranslationStats();
      if (res.success) {
        setStats(res.stats || []);
        setTotalKeysCount(res.totalKeys || 0);
      }
    } catch (err: any) {
      console.warn('[AdminTranslations] Lỗi tải thống kê:', err);
    }
  }, []);

  // 3. Tải danh sách từ khóa giao diện theo phân trang & bộ lọc
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTranslationKeys({
        page,
        limit: pageSize,
        namespace: selectedNamespace,
        search: search.trim(),
        missingFor: onlyUntranslated ? selectedTargetLang : undefined
      });

      setKeys(res.data || []);
      setTotalPages(res.pagination.totalPages || 1);
      setTotalFilteredItems(res.pagination.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải danh sách từ khóa', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, pageSize, selectedNamespace, search, onlyUntranslated, selectedTargetLang, showToast]);

  useEffect(() => {
    fetchActiveLanguages();
    fetchStats();
  }, [fetchActiveLanguages, fetchStats]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Làm mới toàn bộ dữ liệu
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchActiveLanguages(), fetchKeys()]);
    showToast('Đã cập nhật dữ liệu từ điển mới nhất', 'success');
  };

  // Thông tin ngôn ngữ đích đang chọn
  const activeTargetLangInfo = useMemo(() => {
    return (
      activeLanguages.find((l) => l.code.toLowerCase() === selectedTargetLang.toLowerCase()) || {
        code: selectedTargetLang,
        name: selectedTargetLang.toUpperCase(),
        nativeName: selectedTargetLang.toUpperCase(),
        flagIcon: '🌐',
        isDefault: false,
        isActive: true,
        order: 1
      }
    );
  }, [activeLanguages, selectedTargetLang]);

  // Thống kê của ngôn ngữ đích đang chọn
  const currentTargetStat = useMemo(() => {
    return stats.find((s) => s.code.toLowerCase() === selectedTargetLang.toLowerCase()) || {
      code: selectedTargetLang,
      name: activeTargetLangInfo.name,
      nativeName: activeTargetLangInfo.nativeName,
      flagIcon: activeTargetLangInfo.flagIcon,
      totalKeys: totalKeysCount,
      translatedCount: 0,
      untranslatedCount: totalKeysCount,
      percentage: 0
    };
  }, [stats, selectedTargetLang, activeTargetLangInfo, totalKeysCount]);

  // Lưu chỉnh sửa nhanh trực tiếp trên bảng
  const handleSaveInline = async (item: TranslationKeyItem) => {
    try {
      const updatedTranslations = {
        ...(item.translations || {}),
        [selectedTargetLang]: inlineEditText.trim()
      };

      await api.updateTranslationKey(item.id || item._id!, {
        translations: updatedTranslations
      });

      showToast(`Đã lưu bản dịch cho "${item.key}"`, 'success');
      setInlineEditingId(null);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu bản dịch', 'error');
    }
  };

  // Dịch AI 1 từ khóa cụ thể
  const handleSingleTranslate = async (item: TranslationKeyItem) => {
    setSingleTranslatingKeyId(item.id || item._id!);
    try {
      const res = await api.singleTranslateKey(item.id || item._id!, selectedTargetLang);
      showToast(`Đã dịch AI thành công khóa "${item.key}"`, 'success');
      if (inlineEditingId === (item.id || item._id!)) {
        setInlineEditText(res.translatedText);
      }
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi dịch tự động', 'error');
    } finally {
      setSingleTranslatingKeyId(null);
    }
  };

  // Kích hoạt dịch đồng loạt 1-Click Batch AI
  const handleExecuteBatchTranslate = async () => {
    setBatchModalOpen(false);
    setBatchTranslating(true);
    showToast(`Đang dịch AI đồng loạt sang ${activeTargetLangInfo.nativeName}...`, 'info');

    try {
      const res = await api.batchTranslateKeys({
        targetLang: selectedTargetLang,
        namespace: selectedNamespace !== 'all' ? selectedNamespace : undefined,
        overwrite: batchOverwrite
      });

      showToast(
        `Hoàn tất dịch AI đồng loạt! Đã cập nhật ${res.translatedCount} từ khóa (${res.skippedCount} từ khóa giữ nguyên).`,
        'success'
      );
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi dịch AI đồng loạt', 'error');
    } finally {
      setBatchTranslating(false);
    }
  };

  // Mở modal tạo từ khóa mới
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedKeyForEdit(null);
    setFormData({
      key: '',
      namespace: selectedNamespace !== 'all' ? selectedNamespace : 'common',
      defaultText: '',
      description: '',
      translations: {}
    });
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa chi tiết
  const handleOpenEditModal = (item: TranslationKeyItem) => {
    setModalMode('edit');
    setSelectedKeyForEdit(item);
    setFormData({
      key: item.key,
      namespace: item.namespace,
      defaultText: item.defaultText,
      description: item.description || '',
      translations: { ...(item.translations || {}) }
    });
    setIsModalOpen(true);
  };

  // Submit modal tạo / sửa
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim() || !formData.defaultText.trim()) {
      showToast('Vui lòng điền đủ Mã từ khóa và Chuỗi gốc tiếng Việt', 'warning');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.createTranslationKey({
          key: formData.key.trim(),
          namespace: formData.namespace,
          defaultText: formData.defaultText.trim(),
          description: formData.description.trim(),
          translations: formData.translations
        });
        showToast(`Đã thêm từ khóa "${formData.key}" vào từ điển`, 'success');
      } else if (selectedKeyForEdit) {
        await api.updateTranslationKey(selectedKeyForEdit.id || selectedKeyForEdit._id!, {
          namespace: formData.namespace,
          defaultText: formData.defaultText.trim(),
          description: formData.description.trim(),
          translations: formData.translations
        });
        showToast(`Đã cập nhật từ khóa "${selectedKeyForEdit.key}"`, 'success');
      }

      setIsModalOpen(false);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu từ khóa', 'error');
    }
  };

  // Xóa từ khóa
  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;
    try {
      await api.deleteTranslationKey(keyToDelete.id || keyToDelete._id!);
      showToast(`Đã xóa từ khóa "${keyToDelete.key}"`, 'success');
      setDeleteConfirmOpen(false);
      setKeyToDelete(null);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa từ khóa', 'error');
    }
  };

  // Chiều cao bảng cố định chống co rút khi chuyển trang
  const tableMinHeight = useMemo(() => {
    const rowsToReserve = Math.min(pageSize, Math.max(keys.length, 1));
    return `${rowsToReserve * 72 + 46}px`;
  }, [pageSize, keys.length]);

  return (
    <div className="admin-content" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="lang-management-page">
        {/* 1. HEADER ROW */}
        <div className="lang-header-row">
          <div className="lang-header-title-group">
            <div className="lang-header-icon-badge">
              <Languages size={22} />
            </div>
            <div>
              <h1 className="lang-header-title">
                Quản trị Bản dịch & Từ điển Đa ngôn ngữ
              </h1>
              <p className="lang-header-desc">
                Đồng bộ hóa 100% nội dung giao diện website Client, nút bấm, hướng dẫn 360°, thông báo và Voice AI.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing || loading}
              title="Làm mới dữ liệu từ máy chủ"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setBatchModalOpen(true)}
              disabled={batchTranslating || selectedTargetLang === 'vi'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title={`Dịch AI toàn bộ từ khóa sang ${activeTargetLangInfo.nativeName}`}
            >
              <Sparkles size={14} className={batchTranslating ? 'spin' : ''} />
              <span>1-Click Dịch AI ({activeTargetLangInfo.code.toUpperCase()})</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-gold)' }}
            >
              <Plus size={15} />
              <span>Thêm từ khóa</span>
            </button>
          </div>
        </div>

        {/* 2. HERITAGE STATS BANNER */}
        <div className="heritage-stats-banner">
          {/* Cột 1: Tổng số từ khóa */}
          <div className="heritage-stat-col" style={{ flex: 1 }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <BookOpen size={15} />
              </span>
              <span className="heritage-stat-title">Từ khóa Cốt lõi Hệ thống</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{totalKeysCount}</span>
                <span className="heritage-stat-unit">từ khóa giao diện</span>
              </div>
              <div className="heritage-stat-sub">
                Đồng bộ hóa các thành phần trên toàn bộ website
              </div>
            </div>
          </div>

          {/* Cột 2: Tiến độ ngôn ngữ đang chọn */}
          <div className="heritage-stat-col" style={{ flex: 1.2 }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper" style={{ fontSize: 15 }}>
                {activeTargetLangInfo.flagIcon || '🌐'}
              </span>
              <span className="heritage-stat-title">
                Độ phủ: {activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})
              </span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{currentTargetStat.percentage}%</span>
                <span className="heritage-stat-unit">
                  ({currentTargetStat.translatedCount}/{totalKeysCount} từ đã dịch)
                </span>
              </div>
              <div className="lang-progress-bar" style={{ marginTop: 6 }}>
                <div
                  className="lang-progress-fill"
                  style={{
                    width: `${currentTargetStat.percentage}%`,
                    background:
                      currentTargetStat.percentage >= 100
                        ? '#10B981'
                        : currentTargetStat.percentage >= 80
                        ? 'var(--accent-gold)'
                        : '#EF4444'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cột 3: Số ngôn ngữ hoàn thiện */}
          <div className="heritage-stat-col" style={{ flex: 1 }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <ShieldCheck size={15} />
              </span>
              <span className="heritage-stat-title">Chuẩn Quốc tế 100%</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">
                  {stats.filter((s) => s.percentage >= 95).length}/{stats.length}
                </span>
                <span className="heritage-stat-unit">ngôn ngữ hoàn tất</span>
              </div>
              <div className="heritage-stat-sub">
                Sẵn sàng đón tiếp khách tham quan đa quốc gia
              </div>
            </div>
          </div>

          {/* Cột 4: Cơ chế Fallback an toàn */}
          <div className="heritage-stat-col" style={{ flex: 1.1, borderRight: 'none' }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Layers size={15} />
              </span>
              <span className="heritage-stat-title">Cơ chế 3-Tier Fallback</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-gold)' }}>
                  {selectedTargetLang.toUpperCase()} → EN → VI
                </span>
              </div>
              <div className="heritage-stat-sub">
                An toàn tuyệt đối, không bao giờ để rỗng nhãn
              </div>
            </div>
          </div>
        </div>

        {/* 3. THANH CHUYỂN ĐỔI NGÔN NGỮ ĐÍCH DẠNG TABS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            padding: '10px 14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0
            }}
          >
            <Globe size={13} />
            Xem ngôn ngữ:
          </span>
          {activeLanguages.map((lang) => {
            const isSelected = lang.code.toLowerCase() === selectedTargetLang.toLowerCase();
            const langStat = stats.find((s) => s.code.toLowerCase() === lang.code.toLowerCase());
            const percent = langStat?.percentage ?? 0;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedTargetLang(lang.code.toLowerCase());
                  setInlineEditingId(null);
                  setPage(1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  background: isSelected ? 'rgba(212, 168, 106, 0.15)' : 'var(--bg-subtle)',
                  color: isSelected ? 'var(--accent-gold)' : 'var(--text-main)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.18s ease'
                }}
              >
                <span style={{ fontSize: 15 }}>{lang.flagIcon || '🌐'}</span>
                <span>{lang.nativeName}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 999,
                    background: percent >= 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(212, 168, 106, 0.2)',
                    color: percent >= 100 ? '#10B981' : 'var(--accent-gold)'
                  }}
                >
                  {percent}%
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. TOOLBAR: TÌM KIẾM & BỘ LỌC */}
        <div className="lang-toolbar-card">
          <div className="lang-toolbar-controls">
            {/* Ô tìm kiếm */}
            <div className="lang-search-wrapper">
              <Search size={15} className="lang-search-icon" />
              <input
                type="text"
                placeholder="Tìm theo mã khóa, tiếng Việt hoặc chú thích..."
                className="lang-search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  className="lang-search-clear"
                  onClick={() => setSearch('')}
                  title="Xóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Chọn phân mục */}
            <select
              className="lang-filter-select"
              value={selectedNamespace}
              onChange={(e) => {
                setSelectedNamespace(e.target.value);
                setPage(1);
              }}
            >
              {NAMESPACES.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.label}
                </option>
              ))}
            </select>

            {/* Lọc từ khóa chưa dịch */}
            {selectedTargetLang !== 'vi' && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '12.5px',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyUntranslated}
                  onChange={(e) => {
                    setOnlyUntranslated(e.target.checked);
                    setPage(1);
                  }}
                  style={{ accentColor: 'var(--accent-gold)', width: 14, height: 14 }}
                />
                <span>Chỉ hiện từ khóa chưa dịch ({activeTargetLangInfo.code.toUpperCase()})</span>
              </label>
            )}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Tìm thấy <strong>{totalFilteredItems}</strong> từ khóa phù hợp
          </div>
        </div>

        {/* 5. BẢNG DỮ LIỆU TỪ ĐIỂN */}
        <div className="lang-table-card">
          <div className="lang-table-scroll" style={{ minHeight: tableMinHeight }}>
            <table className="lang-table">
              <thead>
                <tr>
                  <th style={{ width: '26%' }}>Mã Khóa (Key) & Phân mục</th>
                  <th style={{ width: '32%' }}>Tiếng Việt Gốc (vi)</th>
                  <th style={{ width: '32%' }}>
                    Bản dịch: {activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})
                  </th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="lang-page-transition">
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px', color: 'var(--accent-gold)' }} />
                      <div>Đang nạp từ điển di sản...</div>
                    </td>
                  </tr>
                ) : keys.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Không tìm thấy từ khóa phù hợp</div>
                      <div style={{ fontSize: '12px' }}>Thử điều chỉnh từ khóa tìm kiếm hoặc phân mục</div>
                    </td>
                  </tr>
                ) : (
                  keys.map((item) => {
                    const currentTrans = item.translations?.[selectedTargetLang] || '';
                    const isAi = Boolean(item.isAiTranslated?.[selectedTargetLang]);
                    const hasTrans = currentTrans.trim().length > 0;
                    const isInlineEditing = inlineEditingId === (item.id || item._id);

                    return (
                      <tr key={item.id || item._id}>
                        {/* Cột 1: Mã khóa */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-gold)', fontSize: '12px', wordBreak: 'break-all' }}>
                            {item.key}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '10.5px',
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-subtle)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              {item.namespace}
                            </span>
                            {item.description && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }} title={item.description}>
                                • {item.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 2: Tiếng Việt gốc */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {item.defaultText}
                        </td>

                        {/* Cột 3: Bản dịch ngôn ngữ đang chọn */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px' }}>
                          {isInlineEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input
                                type="text"
                                className="form-control"
                                value={inlineEditText}
                                onChange={(e) => setInlineEditText(e.target.value)}
                                placeholder={`Nhập bản dịch ${activeTargetLangInfo.nativeName}...`}
                                autoFocus
                                style={{ fontSize: '12.5px', padding: '6px 10px' }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInline(item);
                                  if (e.key === 'Escape') setInlineEditingId(null);
                                }}
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSaveInline(item)}
                                  style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <Check size={12} />
                                  <span>Lưu</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setInlineEditingId(null)}
                                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {hasTrans ? (
                                <div style={{ color: 'var(--text-main)', lineHeight: 1.5, fontWeight: 500 }}>
                                  {currentTrans}
                                </div>
                              ) : (
                                <div style={{ color: 'var(--error)', fontStyle: 'italic', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <AlertCircle size={13} />
                                  <span>Chưa có bản dịch</span>
                                </div>
                              )}

                              {hasTrans && (
                                <div style={{ marginTop: 4 }}>
                                  {isAi ? (
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        color: '#60A5FA',
                                        border: '1px solid rgba(59, 130, 246, 0.3)'
                                      }}
                                    >
                                      <Sparkles size={10} />
                                      AI Dịch
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: '10px',
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10B981',
                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                      }}
                                    >
                                      <CheckCircle2 size={10} />
                                      Đã duyệt
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Cột 4: Thao tác */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            {selectedTargetLang !== 'vi' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleSingleTranslate(item)}
                                disabled={singleTranslatingKeyId === (item.id || item._id)}
                                title="Dịch tự động từ khóa này"
                                style={{ padding: '6px 8px' }}
                              >
                                <Wand2
                                  size={13}
                                  className={singleTranslatingKeyId === (item.id || item._id) ? 'spin' : ''}
                                  style={{ color: 'var(--accent-gold)' }}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setInlineEditingId(item.id || item._id!);
                                setInlineEditText(currentTrans);
                              }}
                              title="Chỉnh sửa nhanh"
                              style={{ padding: '6px 8px' }}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEditModal(item)}
                              title="Chỉnh sửa đa ngữ"
                              style={{ padding: '6px 8px' }}
                            >
                              <Layers size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setKeyToDelete(item);
                                setDeleteConfirmOpen(true);
                              }}
                              title="Xóa từ khóa"
                              style={{ color: 'var(--error)', padding: '6px 8px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang chuẩn hệ thống [6, 9, 12, 18, 24] */}
          <Pagination
            currentPage={page}
            totalItems={totalFilteredItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            itemLabel="từ khóa"
          />
        </div>

        {/* 6. MODAL TẠO MỚI / SỬA CHI TIẾT */}
        {isModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="modal-card" style={{ maxWidth: 640 }}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">
                    {modalMode === 'create' ? 'Thêm từ khóa giao diện mới' : `Chỉnh sửa từ khóa: ${formData.key}`}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Thiết lập định danh và văn bản đa ngôn ngữ phục vụ website
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveModal}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">
                        Mã khóa (Key identifier) <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        disabled={modalMode === 'edit'}
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="vd: tour.rotateHint"
                        required
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Phân mục (Namespace) <span style={{ color: 'var(--error)' }}>*</span>
                      </label>
                      <select
                        className="form-control"
                        value={formData.namespace}
                        onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                      >
                        {NAMESPACES.filter((n) => n.id !== 'all').map((ns) => (
                          <option key={ns.id} value={ns.id}>
                            {ns.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Chuỗi gốc Tiếng Việt (vi) <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.defaultText}
                      onChange={(e) => setFormData({ ...formData, defaultText: e.target.value })}
                      placeholder="Nhập chuỗi tiếng Việt chuẩn..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mô tả / Ngữ cảnh sử dụng</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Hướng dẫn ngữ cảnh cho biên dịch viên hoặc AI..."
                    />
                  </div>

                  {/* Danh sách các ngôn ngữ */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 10, textTransform: 'uppercase' }}>
                      Bản dịch theo các ngôn ngữ kích hoạt
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                      {activeLanguages
                        .filter((l) => l.code !== 'vi')
                        .map((lang) => (
                          <div key={lang.code} className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{lang.flagIcon || '🌐'}</span>
                              <span>{lang.nativeName} ({lang.code.toUpperCase()})</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.translations[lang.code] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  translations: {
                                    ...formData.translations,
                                    [lang.code]: e.target.value
                                  }
                                })
                              }
                              placeholder={`Bản dịch ${lang.name}...`}
                              style={{ fontSize: '12.5px' }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={14} />
                    <span>{modalMode === 'create' ? 'Tạo từ khóa' : 'Lưu thay đổi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. MODAL XÁC NHẬN DỊCH AI ĐỒNG LOẠT */}
        {batchModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="modal-card" style={{ maxWidth: 480 }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="lang-header-icon-badge" style={{ width: 36, height: 36 }}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="modal-title">Dịch AI Đồng Loạt (1-Click)</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Đích đến: <strong style={{ color: 'var(--accent-gold)' }}>{activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                  Mô hình Neural Translation sẽ tự động dịch các từ khóa giao diện sang tiếng {activeTargetLangInfo.nativeName}.
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <input
                    type="checkbox"
                    id="chkBatchOverwrite"
                    checked={batchOverwrite}
                    onChange={(e) => setBatchOverwrite(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--accent-gold)' }}
                  />
                  <label htmlFor="chkBatchOverwrite" style={{ fontSize: '12.5px', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600 }}>Dịch đè lên cả các từ khóa đã có bản dịch</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                      (Mặc định bỏ chọn để chỉ dịch các từ khóa còn trống)
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBatchModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExecuteBatchTranslate}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Sparkles size={14} />
                  <span>Bắt đầu dịch ngay</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. MODAL XÁC NHẬN XÓA */}
        <ConfirmModal
          isOpen={deleteConfirmOpen}
          title="Xóa từ khóa giao diện"
          message={`Bạn có chắc chắn muốn xóa từ khóa "${keyToDelete?.key}" khỏi từ điển hệ thống?`}
          type="danger"
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy bỏ"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setKeyToDelete(null);
          }}
        />
      </div>
    </div>
  );
};

export default AdminTranslationsPage;
