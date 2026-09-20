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
  const toast = useMemo(
    () => ({
      success: (msg: string) => showToast(msg, 'success'),
      error: (msg: string) => showToast(msg, 'error'),
      info: (msg: string) => showToast(msg, 'info')
    }),
    [showToast]
  );

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
          // Mặc định chọn ngôn ngữ đích đầu tiên khác tiếng Việt
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
      toast.error(err.message || 'Lỗi tải danh sách từ khóa');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, pageSize, selectedNamespace, search, onlyUntranslated, selectedTargetLang, toast]);

  // Khởi động trang
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
    toast.success('Đã cập nhật dữ liệu từ điển mới nhất');
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

      toast.success(`Đã lưu bản dịch cho "${item.key}"`);
      setInlineEditingId(null);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu bản dịch');
    }
  };

  // Dịch AI 1 từ khóa cụ thể
  const handleSingleTranslate = async (item: TranslationKeyItem) => {
    setSingleTranslatingKeyId(item.id || item._id!);
    try {
      const res = await api.singleTranslateKey(item.id || item._id!, selectedTargetLang);
      toast.success(`Đã dịch AI thành công khóa "${item.key}"`);
      if (inlineEditingId === (item.id || item._id!)) {
        setInlineEditText(res.translatedText);
      }
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi dịch tự động');
    } finally {
      setSingleTranslatingKeyId(null);
    }
  };

  // Kích hoạt dịch đồng loạt 1-Click Batch AI
  const handleExecuteBatchTranslate = async () => {
    setBatchModalOpen(false);
    setBatchTranslating(true);
    toast.info(`Đang kích hoạt dịch AI đồng loạt sang ${activeTargetLangInfo.nativeName}... Vui lòng đợi trong giây lát.`);

    try {
      const res = await api.batchTranslateKeys({
        targetLang: selectedTargetLang,
        namespace: selectedNamespace !== 'all' ? selectedNamespace : undefined,
        overwrite: batchOverwrite
      });

      toast.success(
        `Hoàn tất dịch AI đồng loạt! Đã bổ sung ${res.translatedCount} từ khóa (${res.skippedCount} từ khóa giữ nguyên).`
      );
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi dịch AI đồng loạt');
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
      toast.error('Vui lòng điền đủ Mã từ khóa và Chuỗi gốc tiếng Việt');
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
        toast.success(`Đã thêm từ khóa "${formData.key}" vào từ điển di sản`);
      } else if (selectedKeyForEdit) {
        await api.updateTranslationKey(selectedKeyForEdit.id || selectedKeyForEdit._id!, {
          namespace: formData.namespace,
          defaultText: formData.defaultText.trim(),
          description: formData.description.trim(),
          translations: formData.translations
        });
        toast.success(`Đã cập nhật từ khóa "${selectedKeyForEdit.key}"`);
      }

      setIsModalOpen(false);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu từ khóa');
    }
  };

  // Xóa từ khóa
  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;
    try {
      await api.deleteTranslationKey(keyToDelete.id || keyToDelete._id!);
      toast.success(`Đã xóa từ khóa "${keyToDelete.key}"`);
      setDeleteConfirmOpen(false);
      setKeyToDelete(null);
      await Promise.all([fetchKeys(), fetchStats()]);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi xóa từ khóa');
    }
  };

  return (
    <div className="admin-page-container p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900/70 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Languages size={22} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-stone-100 tracking-tight">
              Quản trị Bản dịch & Từ điển Đa ngôn ngữ
            </h1>
          </div>
          <p className="text-xs md:text-sm text-stone-400 max-w-3xl">
            Chuẩn hóa 100% văn bản giao diện website Client, nút bấm, hướng dẫn 360°, thông báo và Voice AI. Tự động đồng bộ hóa đa ngôn ngữ không góc chết.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-all disabled:opacity-50"
            title="Làm mới dữ liệu từ điển"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            onClick={() => setBatchModalOpen(true)}
            disabled={batchTranslating || selectedTargetLang === 'vi'}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-900/30 transition-all disabled:opacity-50"
            title={`Dịch AI toàn bộ từ khóa sang ${activeTargetLangInfo.nativeName}`}
          >
            <Sparkles size={14} className={batchTranslating ? 'animate-spin' : ''} />
            <span>1-Click Dịch AI ({activeTargetLangInfo.code.toUpperCase()})</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-white text-stone-900 text-xs font-bold shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Thêm từ khóa</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Thẻ Thống kê & Thanh chọn Ngôn ngữ đích */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Tổng số từ khóa */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">{totalKeysCount}</div>
            <div className="text-xs text-stone-400 font-medium">Tổng từ khóa cốt lõi</div>
          </div>
        </div>

        {/* Card 2: Ngôn ngữ đang chọn & Tỉ lệ bao phủ */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 text-xl">
            {activeTargetLangInfo.flagIcon || '🌐'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase truncate">
                {activeTargetLangInfo.nativeName}
              </span>
              <span className="text-xs font-extrabold text-stone-200">
                {currentTargetStat.percentage}%
              </span>
            </div>
            <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-500 ${
                  currentTargetStat.percentage >= 100
                    ? 'bg-emerald-500'
                    : currentTargetStat.percentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${currentTargetStat.percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-400 mt-1 flex justify-between">
              <span>Đã dịch: {currentTargetStat.translatedCount}</span>
              <span>Chưa dịch: {currentTargetStat.untranslatedCount}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Độ hoàn thiện đồng bộ */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-100">
              {stats.filter((s) => s.percentage >= 95).length} / {stats.length}
            </div>
            <div className="text-xs text-stone-400 font-medium">Ngôn ngữ đạt chuẩn 100%</div>
          </div>
        </div>

        {/* Card 4: Cơ chế Fallback an toàn */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-200 uppercase tracking-wide">
              3-Tier Fallback
            </div>
            <div className="text-[11px] text-stone-400 leading-tight mt-0.5">
              Ngôn ngữ đích → Tiếng Anh (en) → Tiếng Việt (vi). Không bao giờ rỗng key.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Thanh Chuyển đổi Ngôn ngữ đích dạng Tabs */}
      <div className="bg-stone-900/80 border border-stone-800/90 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <span className="text-xs font-bold uppercase text-stone-400 px-3 py-1 flex items-center gap-1.5 shrink-0">
          <Globe size={13} />
          Xem bản dịch:
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-stone-800/60 text-stone-300 hover:bg-stone-800 border border-transparent'
              }`}
            >
              <span>{lang.flagIcon || '🌐'}</span>
              <span className="font-semibold">{lang.nativeName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  percent >= 100
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : percent >= 80
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Bộ lọc & Tìm kiếm & Phân trang */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo mã khóa, tiếng Việt, chú thích..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Chọn phân mục (Namespace) */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <Filter size={14} className="text-stone-400 shrink-0 hidden md:block" />
            <select
              value={selectedNamespace}
              onChange={(e) => {
                setSelectedNamespace(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
            >
              {NAMESPACES.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.label}
                </option>
              ))}
            </select>

            {/* Checkbox chỉ hiện từ khóa chưa dịch */}
            {selectedTargetLang !== 'vi' && (
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-800/60 border border-stone-700/80 text-xs text-stone-300 cursor-pointer hover:bg-stone-800 select-none shrink-0">
                <input
                  type="checkbox"
                  checked={onlyUntranslated}
                  onChange={(e) => {
                    setOnlyUntranslated(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-stone-600 text-amber-500 focus:ring-amber-500/30"
                />
                <span>Chỉ hiện khóa chưa dịch ({activeTargetLangInfo.code.toUpperCase()})</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bảng Dữ liệu Từ điển Giao diện */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950/70 border-b border-stone-800 uppercase tracking-wider text-[11px] text-stone-400">
              <tr>
                <th className="px-4 py-3.5 font-bold w-1/4">Mã Khóa (Key) & Phân mục</th>
                <th className="px-4 py-3.5 font-bold w-1/3">Tiếng Việt Gốc (vi)</th>
                <th className="px-4 py-3.5 font-bold w-1/3">
                  Bản dịch: {activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})
                </th>
                <th className="px-4 py-3.5 font-bold text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-amber-400" />
                      <span>Đang nạp dữ liệu từ điển di sản...</span>
                    </div>
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={28} className="text-stone-500" />
                      <p className="font-semibold text-stone-300">Không tìm thấy từ khóa phù hợp</p>
                      <p className="text-xs text-stone-500">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn lọc chưa dịch
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                keys.map((item) => {
                  const currentTrans = item.translations?.[selectedTargetLang] || '';
                  const isAi = Boolean(item.isAiTranslated?.[selectedTargetLang]);
                  const hasTrans = currentTrans.trim().length > 0;
                  const isInlineEditing = inlineEditingId === (item.id || item._id);

                  return (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-stone-800/40 transition-colors group"
                    >
                      {/* Cột 1: Mã Khóa & Phân mục */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-amber-300 text-[11.5px] break-all">
                            {item.key}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] text-stone-400 font-medium border border-stone-700/60">
                              {item.namespace}
                            </span>
                            {item.description && (
                              <span
                                className="text-[11px] text-stone-500 truncate max-w-[200px]"
                                title={item.description}
                              >
                                • {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Tiếng Việt Gốc */}
                      <td className="px-4 py-3 align-top">
                        <div className="text-stone-200 font-medium leading-relaxed break-words">
                          {item.defaultText}
                        </div>
                      </td>

                      {/* Cột 3: Bản dịch ngôn ngữ đang chọn */}
                      <td className="px-4 py-3 align-top">
                        {isInlineEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={inlineEditText}
                              onChange={(e) => setInlineEditText(e.target.value)}
                              placeholder={`Nhập bản dịch ${activeTargetLangInfo.nativeName}...`}
                              className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-amber-500/60 text-stone-100 text-xs focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInline(item);
                                if (e.key === 'Escape') setInlineEditingId(null);
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveInline(item)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-bold"
                              >
                                <Check size={12} />
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={() => setInlineEditingId(null)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
                              >
                                <X size={12} />
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {hasTrans ? (
                              <div className="text-stone-100 font-medium leading-relaxed break-words">
                                {currentTrans}
                              </div>
                            ) : (
                              <div className="text-rose-400/80 italic text-xs flex items-center gap-1">
                                <AlertCircle size={13} />
                                <span>Chưa có bản dịch</span>
                              </div>
                            )}

                            {/* Badges trạng thái */}
                            <div className="flex items-center gap-2">
                              {hasTrans ? (
                                isAi ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                    <Sparkles size={10} />
                                    AI Dịch
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 size={10} />
                                    Đã duyệt
                                  </span>
                                )
                              ) : null}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Thao tác */}
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút dịch AI cho từ khóa này */}
                          {selectedTargetLang !== 'vi' && (
                            <button
                              type="button"
                              onClick={() => handleSingleTranslate(item)}
                              disabled={singleTranslatingKeyId === (item.id || item._id)}
                              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-700 transition-all disabled:opacity-50"
                              title="Dịch tự động bằng AI"
                            >
                              <Wand2
                                size={14}
                                className={
                                  singleTranslatingKeyId === (item.id || item._id)
                                    ? 'animate-spin text-amber-400'
                                    : ''
                                }
                              />
                            </button>
                          )}

                          {/* Nút sửa nhanh inline */}
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEditingId(item.id || item._id!);
                              setInlineEditText(currentTrans);
                            }}
                            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all"
                            title="Chỉnh sửa bản dịch"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Nút mở modal chỉnh sửa chi tiết */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all hidden md:inline-flex"
                            title="Sửa chi tiết đa ngữ"
                          >
                            <Layers size={14} />
                          </button>

                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => {
                              setKeyToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-700 transition-all"
                            title="Xóa từ khóa này"
                          >
                            <Trash2 size={14} />
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
        {totalFilteredItems > 0 && (
          <div className="p-4 border-t border-stone-800/80 bg-stone-950/40">
            <Pagination
              currentPage={page}
              totalItems={totalFilteredItems}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
              itemLabel="từ khóa"
            />
          </div>
        )}
      </div>

      {/* 6. Modal Tạo mới / Sửa chi tiết từ khóa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Languages size={20} />
                </div>
                <h2 className="text-lg font-bold text-stone-100">
                  {modalMode === 'create' ? 'Thêm Từ Khóa Giao Diện Mới' : `Chỉnh Sửa Từ Khóa: ${formData.key}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Mã khóa (Key identifier) *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    disabled={modalMode === 'edit'}
                    placeholder="vd: tour.rotateHint hoặc nav.home"
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    required
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Đặt theo định dạng namespace.action (chỉ chữ thường, dấu chấm)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Phân mục (Namespace) *
                  </label>
                  <select
                    value={formData.namespace}
                    onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {NAMESPACES.filter((n) => n.id !== 'all').map((ns) => (
                      <option key={ns.id} value={ns.id}>
                        {ns.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Chuỗi gốc Tiếng Việt (Default Vietnamese Text) *
                </label>
                <input
                  type="text"
                  value={formData.defaultText}
                  onChange={(e) => setFormData({ ...formData, defaultText: e.target.value })}
                  placeholder="Nhập câu tiếng Việt chuẩn..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Mô tả / Ngữ cảnh sử dụng
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Hướng dẫn ngữ cảnh cho người biên dịch hoặc AI..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Danh sách các ngôn ngữ để điền bản dịch */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Bản dịch theo các ngôn ngữ kích hoạt
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                  {activeLanguages
                    .filter((l) => l.code !== 'vi')
                    .map((lang) => (
                      <div key={lang.code} className="space-y-1">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300">
                          <span>{lang.flagIcon || '🌐'}</span>
                          <span>{lang.nativeName} ({lang.code.toUpperCase()})</span>
                        </label>
                        <input
                          type="text"
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-900/30"
                >
                  <Save size={14} />
                  <span>{modalMode === 'create' ? 'Tạo từ khóa' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal Xác nhận Dịch AI Đồng Loạt (Batch Translate) */}
      {batchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100">
                  Dịch AI Đồng Loạt (1-Click NMT)
                </h3>
                <p className="text-xs text-stone-400">
                  Ngôn ngữ đích: <span className="text-amber-300 font-bold">{activeTargetLangInfo.nativeName} ({activeTargetLangInfo.code.toUpperCase()})</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Hệ thống sẽ tự động sử dụng mô hình dịch máy thông minh để dịch toàn bộ từ khóa giao diện chưa có bản dịch sang tiếng {activeTargetLangInfo.nativeName}.
            </p>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-800/60 border border-stone-700 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={batchOverwrite}
                onChange={(e) => setBatchOverwrite(e.target.checked)}
                className="mt-0.5 rounded border-stone-600 text-amber-500 focus:ring-amber-500/30"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-stone-200">Dịch đè lên cả các từ khóa đã có sẵn bản dịch</span>
                <p className="text-[10px] text-stone-400">
                  (Nếu bỏ chọn, hệ thống chỉ dịch những từ khóa hiện đang để trống)
                </p>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchTranslate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md shadow-amber-900/30"
              >
                <Sparkles size={14} />
                <span>Bắt đầu dịch ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal Xác nhận Xóa từ khóa */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Xóa từ khóa giao diện"
        message={`Bạn có chắc chắn muốn xóa từ khóa "${keyToDelete?.key}" khỏi từ điển hệ thống? Các trang Client đang dùng khóa này sẽ tự động hiển thị chuỗi fallback.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setKeyToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminTranslationsPage;
