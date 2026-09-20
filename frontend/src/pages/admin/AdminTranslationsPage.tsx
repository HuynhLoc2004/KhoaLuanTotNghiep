import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Languages,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  Save,
  X,
  Globe,
  BookOpen,
  Layers,
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { TranslationKeyItem, TranslationStatItem, LanguageItem } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '../../components/Pagination';

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
    showToast('Đã làm mới danh mục từ khóa', 'info');
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
      showToast(`Đã dịch xong khóa "${item.key}"`, 'success');
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

  // Kích hoạt dịch đồng loạt
  const handleExecuteBatchTranslate = async () => {
    setBatchModalOpen(false);
    setBatchTranslating(true);
    showToast(`Đang dịch tự động sang ${activeTargetLangInfo.nativeName}...`, 'info');

    try {
      const res = await api.batchTranslateKeys({
        targetLang: selectedTargetLang,
        namespace: selectedNamespace !== 'all' ? selectedNamespace : undefined,
        overwrite: batchOverwrite
      });

      showToast(
        `Hoàn tất: Đã bổ sung ${res.translatedCount} từ khóa (${res.skippedCount} từ khóa giữ nguyên).`,
        'success'
      );
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      showToast(err.message || 'Lỗi dịch tự động', 'error');
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
        showToast(`Đã thêm từ khóa "${formData.key}"`, 'success');
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

  return (
    <div className="admin-content" style={{ overscrollBehaviorY: 'contain' }}>
      <div className="lang-management-page">
        {/* 1. TIÊU ĐỀ TRANG & HÀNH ĐỘNG */}
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
                Chuẩn hóa và đồng bộ hóa các chuỗi văn bản giao diện website và thuyết minh di sản.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRefreshAll}
              disabled={isRefreshing || loading}
              title="Làm mới dữ liệu"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

            {selectedTargetLang !== 'vi' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setBatchModalOpen(true)}
                disabled={batchTranslating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title={`Dịch tự động các từ khóa sang ${activeTargetLangInfo.nativeName}`}
              >
                <Sparkles size={14} className={batchTranslating ? 'spin' : ''} />
                <span>Dịch tự động {activeTargetLangInfo.nativeName}</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreateModal}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Thêm từ khóa</span>
            </button>
          </div>
        </div>

        {/* 2. BĂNG THỐNG KÊ DI SẢN CHUẨN MỰC */}
        <div className="heritage-stats-banner">
          {/* Cột 1: Tổng số từ khóa */}
          <div className="heritage-stat-col">
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <BookOpen size={15} />
              </span>
              <span className="heritage-stat-title">Từ khóa Giao diện</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{totalKeysCount}</span>
                <span className="heritage-stat-unit">thuật ngữ</span>
              </div>
              <div className="heritage-stat-sub">
                <span>Đồng bộ hóa các thành phần website</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Tiến độ ngôn ngữ đang chọn */}
          <div className="heritage-stat-col">
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Globe size={15} />
              </span>
              <span className="heritage-stat-title">Tiến độ: {activeTargetLangInfo.nativeName}</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{currentTargetStat.translatedCount}</span>
                <span className="heritage-stat-denom">/{totalKeysCount}</span>
                <span className="heritage-stat-unit">đã dịch ({currentTargetStat.percentage}%)</span>
              </div>
              <div className="heritage-stat-sub">
                <span>
                  {currentTargetStat.untranslatedCount > 0
                    ? `Còn ${currentTargetStat.untranslatedCount} từ chưa dịch`
                    : 'Đã hoàn tất đầy đủ'}
                </span>
              </div>
            </div>
          </div>

          {/* Cột 3: Số ngôn ngữ kích hoạt */}
          <div className="heritage-stat-col">
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <ShieldCheck size={15} />
              </span>
              <span className="heritage-stat-title">Ngôn ngữ Hoạt động</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span className="heritage-stat-number">{activeLanguages.length}</span>
                <span className="heritage-stat-unit">ngôn ngữ</span>
              </div>
              <div className="heritage-stat-sub">
                <span>Sẵn sàng phục vụ khách tham quan</span>
              </div>
            </div>
          </div>

          {/* Cột 4: Cơ chế Fallback an toàn */}
          <div className="heritage-stat-col" style={{ borderRight: 'none' }}>
            <div className="heritage-stat-header">
              <span className="heritage-stat-icon-wrapper">
                <Layers size={15} />
              </span>
              <span className="heritage-stat-title">Phân tầng Fallback</span>
            </div>
            <div className="heritage-stat-body">
              <div className="heritage-stat-metric">
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary)' }}>
                  {selectedTargetLang.toUpperCase()} → EN → VI
                </span>
              </div>
              <div className="heritage-stat-sub">
                <span>Không bao giờ bị lỗi hiển thị</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KHỐI NỘI DUNG CHÍNH (PANEL) */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          {/* THANH CHUYỂN TAB NGÔN NGỮ ĐÍCH TRANG TRỌNG */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '10px 16px',
              background: 'var(--bg-subtle)',
              gap: 8,
              overflowX: 'auto'
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginRight: 4,
                flexShrink: 0
              }}
            >
              Ngôn ngữ:
            </span>
            {activeLanguages.map((lang) => {
              const isSelected = lang.code.toLowerCase() === selectedTargetLang.toLowerCase();
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
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + (isSelected ? 'var(--border-color)' : 'transparent'),
                    fontWeight: isSelected ? 600 : 400,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-surface)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '13px' }}>{lang.flagIcon || '🌐'}</span>
                  <span>{lang.nativeName}</span>
                </button>
              );
            })}
          </div>

          {/* THANH TÌM KIẾM & BỘ LỌC */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
              {/* Ô tìm kiếm */}
              <div className="lang-search-wrapper" style={{ minWidth: 260, maxWidth: 360 }}>
                <Search size={14} className="lang-search-icon" />
                <input
                  type="text"
                  placeholder="Tìm từ khóa hoặc tiếng Việt..."
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
                    <X size={13} />
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
                    gap: 6,
                    fontSize: '12.5px',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
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
                    style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                  />
                  <span>Chỉ hiện từ chưa dịch ({activeTargetLangInfo.nativeName})</span>
                </label>
              )}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tìm thấy <strong>{totalFilteredItems}</strong> từ khóa phù hợp
            </div>
          </div>

          {/* BẢNG DỮ LIỆU TỪ ĐIỂN */}
          <div className="lang-table-scroll">
            <table className="lang-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Mã Khóa & Phân mục</th>
                  <th style={{ width: '32%' }}>Tiếng Việt Gốc (vi)</th>
                  <th style={{ width: '28%' }}>Bản dịch: {activeTargetLangInfo.nativeName}</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', color: 'var(--primary)' }} />
                      <div style={{ fontSize: '13px' }}>Đang nạp dữ liệu từ điển...</div>
                    </td>
                  </tr>
                ) : keys.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '13px' }}>
                        Không có từ khóa nào
                      </div>
                      <div style={{ fontSize: '12px', marginTop: 4 }}>
                        Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm
                      </div>
                    </td>
                  </tr>
                ) : (
                  keys.map((item) => {
                    const currentTrans = item.translations?.[selectedTargetLang] || '';
                    const hasTrans = currentTrans.trim().length > 0;
                    const isInlineEditing = inlineEditingId === (item.id || item._id);

                    return (
                      <tr key={item.id || item._id}>
                        {/* Cột 1: Mã từ khóa & phân mục (Dùng typography chuẩn của hệ thống, không dùng monospace thô) */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.4 }}>
                            {item.key}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-subtle)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)'
                              }}
                            >
                              {item.namespace}
                            </span>
                            {item.description && (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }} title={item.description}>
                                • {item.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 2: Tiếng Việt gốc */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px', color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.5 }}>
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
                                  style={{ padding: '3px 8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <Check size={12} />
                                  <span>Lưu</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setInlineEditingId(null)}
                                  style={{ padding: '3px 8px', fontSize: '11.5px' }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {hasTrans ? (
                                <div style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.5 }}>
                                  {currentTrans}
                                </div>
                              ) : (
                                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12.5px' }}>
                                  Chưa có bản dịch
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Cột 4: Thao tác (gọn gàng, thanh lịch) */}
                        <td style={{ verticalAlign: 'top', padding: '12px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                            {selectedTargetLang !== 'vi' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleSingleTranslate(item)}
                                disabled={singleTranslatingKeyId === (item.id || item._id)}
                                title="Dịch tự động từ khóa này"
                                style={{ padding: '5px 8px' }}
                              >
                                <Wand2
                                  size={13}
                                  className={singleTranslatingKeyId === (item.id || item._id) ? 'spin' : ''}
                                  style={{ color: 'var(--primary)' }}
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
                              title="Sửa bản dịch"
                              style={{ padding: '5px 8px' }}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEditModal(item)}
                              title="Chỉnh sửa chi tiết"
                              style={{ padding: '5px 8px' }}
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
                              style={{ padding: '5px 8px' }}
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
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)' }}>
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
        </div>

        {/* MODAL TẠO MỚI / SỬA CHI TIẾT */}
        {isModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="modal-card" style={{ maxWidth: 580 }}>
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
                        Mã khóa <span style={{ color: 'var(--primary)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        disabled={modalMode === 'edit'}
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        placeholder="vd: tour.rotateHint"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Phân mục <span style={{ color: 'var(--primary)' }}>*</span>
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
                      Chuỗi gốc Tiếng Việt (vi) <span style={{ color: 'var(--primary)' }}>*</span>
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
                      placeholder="Hướng dẫn ngữ cảnh cho biên dịch viên..."
                    />
                  </div>

                  {/* Danh sách các ngôn ngữ */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: 10 }}>
                      Bản dịch theo các ngôn ngữ kích hoạt
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                      {activeLanguages
                        .filter((l) => l.code !== 'vi')
                        .map((lang) => (
                          <div key={lang.code} className="form-group" style={{ margin: 0 }}>
                            <label className="form-label" style={{ fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{lang.flagIcon || '🌐'}</span>
                              <span>{lang.nativeName}</span>
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
                              style={{ fontSize: '12px' }}
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

        {/* MODAL XÁC NHẬN DỊCH AI ĐỒNG LOẠT */}
        {batchModalOpen && (
          <div className="modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="modal-card" style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">Dịch tự động đồng loạt</h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Ngôn ngữ đích: <strong style={{ color: 'var(--primary)' }}>{activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                  Hệ thống sẽ tự động dịch các từ khóa giao diện sang tiếng {activeTargetLangInfo.nativeName}.
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <input
                    type="checkbox"
                    id="chkBatchOverwrite"
                    checked={batchOverwrite}
                    onChange={(e) => setBatchOverwrite(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="chkBatchOverwrite" style={{ fontSize: '12px', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600 }}>Dịch đè lên cả các từ khóa đã có bản dịch</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                      (Mặc định bỏ chọn để chỉ dịch những từ khóa còn trống)
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
                  <span>Bắt đầu dịch</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN XÓA */}
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
