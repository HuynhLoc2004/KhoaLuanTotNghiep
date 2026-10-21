import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  RefreshCw,
  Search,
  Download,
  Trash2,
  ChevronRight,
  Copy,
  Check,
  X,
  Radio,
  Archive,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { SystemLogItem, SystemLogStats, LogLevel } from '../../types';
import { Pagination } from '../../components/Pagination';

const MODULE_LABELS: Record<string, string> = {
  ROOMS: 'Gian phòng 360°',
  ARTIFACTS: 'Cổ vật di sản 3D',
  STITCHING: 'Ghép ảnh 360°',
  FLOOR_PLAN: 'Sơ đồ mặt bằng',
  TICKETS: 'Vé & Thanh toán',
  AUTH: 'Xác thực & Tài khoản',
  SYSTEM: 'Hệ thống',
  AI_VOICE: 'Trợ lý AI & Giọng nói',
  DATABASE: 'Cơ sở dữ liệu',
  SHOWCASE: 'Trưng bày'
};

export const AdminLogsPage: React.FC = () => {
  // State dữ liệu danh sách log
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<SystemLogStats | null>(null);

  // State bộ lọc
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(6);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hasErrorOnly, setHasErrorOnly] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>('all');

  // Trực tiếp SSE
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Modal chi tiết log
  const [selectedLog, setSelectedLog] = useState<SystemLogItem | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'error' | 'context' | 'payload'>('overview');

  // Modal Dọn dẹp & Lưu trữ / Khôi phục
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);
  const [cleanupModalTab, setCleanupModalTab] = useState<'clean' | 'archives'>('clean');
  const [cleanType, setCleanType] = useState<'BOT_SCANS_ONLY' | 'ROUTINE_INFO' | 'FULL_PRUNE_WITH_TRACE_PRESERVED'>('BOT_SCANS_ONLY');
  const [cleanupDays, setCleanupDays] = useState<number>(3);
  const [backupBeforeDelete, setBackupBeforeDelete] = useState<boolean>(true);
  const [previewData, setPreviewData] = useState<{
    candidateCount: number;
    totalLogsCount: number;
    protectedErrorsCount: number;
    protectedAdminAuditCount: number;
    estimatedFreeMb: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [cleaningUp, setCleaningUp] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // Danh sách gói lưu trữ & khôi phục
  const [archivesList, setArchivesList] = useState<any[]>([]);
  const [loadingArchives, setLoadingArchives] = useState<boolean>(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingArchiveId, setDeletingArchiveId] = useState<string | null>(null);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce tìm kiếm từ khóa (350ms) để không bị giật lag khi gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Tính toán khoảng ngày theo lựa chọn
  const computedDateRange = useMemo(() => {
    if (dateRange === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString() };
    }
    if (dateRange === '7d') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { startDate: start.toISOString() };
    }
    if (dateRange === '30d') {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { startDate: start.toISOString() };
    }
    return {};
  }, [dateRange]);

  // Tải danh sách logs
  const fetchLogs = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const res = await api.getSystemLogs({
          page,
          limit,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          module: selectedModule !== 'all' ? selectedModule : undefined,
          search: searchTerm ? searchTerm : undefined,
          hasError: hasErrorOnly,
          ...computedDateRange
        });

        setLogs(res.data || []);
        setTotalCount(res.pagination.total || 0);
      } catch (err: any) {
        if (!isBackground) {
          showToast(err.message || 'Lỗi tải danh sách nhật ký', 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, selectedLevel, selectedModule, searchTerm, hasErrorOnly, computedDateRange]
  );

  // Tải thống kê
  const fetchStats = useCallback(async () => {
    try {
      const s = await api.getSystemLogStats();
      setStats(s);
    } catch {}
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Lắng nghe sự kiện Realtime SSE khi có log mới
  useEffect(() => {
    if (!isLiveStreaming) return;

    const handleNewLog = (e: any) => {
      const newLog = e.detail;
      if (!newLog || !newLog._id) return;

      if (page === 1) {
        setLogs((prev) => {
          if (prev.some((item) => item._id === newLog._id)) return prev;
          return [newLog, ...prev.slice(0, limit - 1)];
        });
        setTotalCount((c) => c + 1);
      }
      fetchStats();
    };

    window.addEventListener('museum:system_log_created' as any, handleNewLog);
    return () => {
      window.removeEventListener('museum:system_log_created' as any, handleNewLog);
    };
  }, [isLiveStreaming, page, limit, fetchStats]);

  // Sao chép nội dung JSON
  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('Đã sao chép nội dung JSON', 'info');
    } catch {}
  };

  // Xuất file JSON an toàn (Bearer header, không truyền token trên URL query)
  const handleExportJson = async () => {
    setExporting(true);
    try {
      await api.exportSystemLogs({
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        module: selectedModule !== 'all' ? selectedModule : undefined
      });
      showToast('Đã xuất tệp nhật ký an toàn về máy tính', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xuất tệp nhật ký', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Định dạng kích thước tệp
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'BOT_SCANS_ONLY':
        return 'Chỉ bot dò quét 404 & request rác';
      case 'ROUTINE_INFO':
        return 'Nhật ký thường nhật cũ (INFO / SUCCESS)';
      case 'FULL_PRUNE_WITH_TRACE_PRESERVED':
        return 'Toàn diện (Bảo lưu Sự cố & Admin)';
      default:
        return cat;
    }
  };

  // Tải dự báo dọn dẹp trước khi thực hiện
  const fetchCleanupPreview = useCallback(async (type = cleanType, days = cleanupDays) => {
    setLoadingPreview(true);
    try {
      const res = await api.previewCleanupLogs({
        cleanType: type,
        olderThanDays: days,
        preserveErrors: true,
        preserveAdminAudit: true
      });
      if (res.success && res.data) {
        setPreviewData(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải dự báo dọn dẹp:', err);
    } finally {
      setLoadingPreview(false);
    }
  }, [cleanType, cleanupDays]);

  // Tải danh sách các gói nén đã lưu trữ
  const fetchArchivesList = useCallback(async () => {
    setLoadingArchives(true);
    try {
      const res = await api.getLogArchives();
      if (res.success && res.data) {
        setArchivesList(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách gói lưu trữ:', err);
    } finally {
      setLoadingArchives(false);
    }
  }, []);

  const handleOpenCleanupModal = () => {
    setIsCleanupModalOpen(true);
    setCleanupModalTab('clean');
    fetchCleanupPreview(cleanType, cleanupDays);
    fetchArchivesList();
  };

  // Xử lý dọn dẹp & nén đóng gói lưu trữ
  const handleExecuteArchiveAndPrune = async () => {
    if (!previewData || previewData.candidateCount === 0) {
      showToast('Không có bản ghi nào phù hợp điều kiện để dọn dẹp', 'info');
      return;
    }
    setCleaningUp(true);
    try {
      const res = await api.archiveAndPruneLogs({
        cleanType,
        olderThanDays: cleanupDays,
        preserveErrors: true,
        preserveAdminAudit: true,
        backupBeforeDelete
      });
      showToast(res.message || 'Đã dọn dẹp & lưu trữ an toàn!', 'success');
      fetchLogs();
      fetchStats();
      fetchCleanupPreview(cleanType, cleanupDays);
      fetchArchivesList();
      if (backupBeforeDelete) {
        setCleanupModalTab('archives');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi dọn dẹp nhật ký', 'error');
    } finally {
      setCleaningUp(false);
    }
  };

  // Khôi phục dữ liệu từ gói nén vào MongoDB
  const handleRestoreArchive = async (archiveId: string, archiveName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khôi phục dữ liệu từ gói "${archiveName}" trở lại vào MongoDB?`)) {
      return;
    }
    setRestoringId(archiveId);
    try {
      const res = await api.restoreLogArchive(archiveId);
      showToast(res.message || 'Khôi phục nhật ký thành công!', 'success');
      fetchLogs();
      fetchStats();
      fetchArchivesList();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khôi phục gói lưu trữ', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  // Tải tệp nén gzip về máy
  const handleDownloadArchive = async (archiveId: string, fileName: string) => {
    try {
      await api.downloadLogArchive(archiveId, fileName);
      showToast(`Đang tải tệp ${fileName}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải tệp lưu trữ', 'error');
    }
  };

  // Xóa gói lưu trữ khỏi đĩa VPS
  const handleDeleteArchive = async (archiveId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa vĩnh viễn tệp nén này khỏi VPS? Thao tác này không thể hoàn tác.')) {
      return;
    }
    setDeletingArchiveId(archiveId);
    try {
      const res = await api.deleteLogArchive(archiveId);
      showToast(res.message || 'Đã xóa gói lưu trữ', 'success');
      fetchArchivesList();
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa gói lưu trữ', 'error');
    } finally {
      setDeletingArchiveId(null);
    }
  };

  // Định dạng thời gian chuẩn
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Render Mức độ tinh tế theo chuẩn admin (dot + text trung tính)
  const renderLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#EF4444', fontWeight: 600 }}>Lỗi</span>
          </span>
        );
      case 'WARN':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>Cảnh báo</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#22C55E', fontWeight: 600 }}>Thành công</span>
          </span>
        );
      case 'INFO':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Thông tin</span>
          </span>
        );
    }
  };

  return (
    <div className="admin-content admin-logs-page" style={{ padding: '24px 28px' }}>
      {/* Toast thông báo */}
      {toastMessage && (
        <div className={`admin-toast admin-toast-${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. TIÊU ĐỀ TRANG CHUẨN MỰC */}
      <div className="admin-logs-header">
        <div>
          <h1 className="admin-logs-title">
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <span>Nhật ký hệ thống</span>
          </h1>
          <p className="admin-logs-subtitle">
            Theo dõi lịch sử hoạt động, bảo mật và sự cố vận hành của hệ thống
          </p>
        </div>

        <div className="admin-logs-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            title={isLiveStreaming ? 'Tự động nhận log mới qua SSE' : 'Bật nhận log tự động'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isLiveStreaming ? '#22C55E' : 'var(--text-muted)'
              }}
            />
            <span>{isLiveStreaming ? 'Trực tiếp (SSE)' : 'Tạm dừng'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchLogs(true);
              fetchStats();
            }}
            disabled={refreshing}
            title="Làm mới danh sách nhật ký"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportJson}
            disabled={exporting}
            title="Tải tệp JSON nhật ký về máy tính an toàn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={13} />
            <span>{exporting ? 'Đang xuất...' : 'Xuất JSON'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleOpenCleanupModal}
            title="Dọn dẹp & Lưu trữ nhật ký an toàn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Archive size={13} />
            <span>Lưu trữ & Dọn dẹp</span>
          </button>
        </div>
      </div>

      {/* 2. BĂNG CHỈ SỐ KPI TỐI GIẢN (ĐỒNG BỘ CHUẨN MỰC, KHÔNG MÀU MÈ) */}
      <div className="logs-summary-bar">
        <div className="summary-item">
          <span className="summary-label">Tổng bản ghi</span>
          <span className="summary-value">{stats ? stats.total.toLocaleString('vi-VN') : totalCount}</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Sự cố / Lỗi</span>
          <span className="summary-value">
            {stats ? stats.errorCount.toLocaleString('vi-VN') : 0}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Cảnh báo</span>
          <span className="summary-value">
            {stats ? stats.warnCount.toLocaleString('vi-VN') : 0}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Bình thường</span>
          <span className="summary-value">
            {stats ? (stats.infoCount + stats.successCount).toLocaleString('vi-VN') : 0}
          </span>
        </div>
      </div>

      {/* 3. BỘ LỌC ĐA CHIỀU TINH GỌN, KHÔNG BỊ BÍ TÚNG */}
      <div className="logs-filter-bar">
        {/* Ô tìm kiếm từ khóa có debounce */}
        <div className="filter-search-box">
          <Search size={14} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Tìm theo thông điệp, mã lỗi, endpoint, IP, người dùng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="form-control"
          />
          {searchInput && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
                setPage(1);
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Lọc theo Phân hệ */}
        <select
          className="form-control filter-select"
          value={selectedModule}
          onChange={(e) => {
            setSelectedModule(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả phân hệ</option>
          {Object.entries(MODULE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Lọc theo Mức độ */}
        <select
          className="form-control filter-select"
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả mức độ</option>
          <option value="ERROR">Chỉ Lỗi (ERROR)</option>
          <option value="WARN">Cảnh báo (WARN)</option>
          <option value="SUCCESS">Thành công (SUCCESS)</option>
          <option value="INFO">Thông tin (INFO)</option>
        </select>

        {/* Lọc theo Khoảng ngày */}
        <select
          className="form-control filter-select"
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Toàn bộ thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7d">7 ngày gần nhất</option>
          <option value="30d">30 ngày gần nhất</option>
        </select>

        {/* Nút lọc nhanh chỉ lỗi */}
        <button
          type="button"
          className={`btn btn-sm ${hasErrorOnly ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => {
            setHasErrorOnly(!hasErrorOnly);
            setPage(1);
          }}
          title="Lọc nhanh các bản ghi có lỗi hoặc sự cố"
        >
          <span>{hasErrorOnly ? 'Đang lọc: Chỉ lỗi' : 'Chỉ sự cố & lỗi'}</span>
        </button>
      </div>

      {/* 4. BẢNG HIỂN THỊ DANH SÁCH NHẬT KÝ (MƯỢT MÀ, KHÔNG GIẬT KHUNG HÌNH) */}
      <div className="logs-panel">
        {/* Loading overlay nhẹ nhàng khi đổi trang hoặc filter, giữ nguyên layout bảng không bị giật */}
        {loading && (
          <div className="logs-table-loader-bar">
            <div className="loader-indicator" />
          </div>
        )}

        {logs.length === 0 && !loading ? (
          <div className="logs-empty-state">
            <p className="empty-title">Không tìm thấy bản ghi nhật ký phù hợp</p>
            <p className="empty-desc">
              Thử thay đổi từ khóa tìm kiếm, mở rộng khoảng thời gian hoặc chọn tất cả phân hệ.
            </p>
          </div>
        ) : (
          <div className={`table-responsive ${loading ? 'table-loading-active' : ''}`}>
            {/* 1. BẢNG DÀNH CHO MÀN HÌNH DESKTOP / TABLET LỚN (> 768px) */}
            <table className="logs-table logs-desktop-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>MỨC ĐỘ</th>
                  <th style={{ width: 140 }}>PHÂN HỆ</th>
                  <th style={{ width: 145 }}>THỜI GIAN</th>
                  <th>HÀNH ĐỘNG & NỘI DUNG</th>
                  <th style={{ width: 85 }}>HTTP</th>
                  <th style={{ width: 165 }}>TÁC NHÂN & IP</th>
                  <th style={{ width: 80, textAlign: 'center' }}>CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const modLabel = MODULE_LABELS[log.module] || log.module;
                  const isErr = log.level === 'ERROR';
                  const cleanIp = (log.ipAddress || '').replace(/^::ffff:/, '') || '127.0.0.1';

                  return (
                    <tr
                      key={log._id}
                      className={`log-row ${isErr ? 'log-row-error' : ''}`}
                      onClick={() => {
                        setSelectedLog(log);
                        setActiveDetailTab(log.error ? 'error' : 'overview');
                      }}
                    >
                      {/* Cột 1: Mức độ */}
                      <td>{renderLevelBadge(log.level)}</td>

                      {/* Cột 2: Phân hệ */}
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {modLabel}
                      </td>

                      {/* Cột 3: Thời gian */}
                      <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.createdAt)}
                      </td>

                      {/* Cột 4: Thông điệp & Endpoint */}
                      <td>
                        <div style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: 12.5 }}>
                          {log.message}
                        </div>
                        {log.error && (
                          <div style={{ color: '#EF4444', fontSize: 11, marginTop: 2 }}>
                            {log.error.name ? `${log.error.name}: ` : ''}{log.error.message}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Mã HTTP */}
                      <td style={{ fontSize: 12 }}>
                        {log.statusCode ? (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: log.statusCode >= 500 ? '#EF4444' : log.statusCode >= 400 ? '#F59E0B' : '#22C55E'
                            }}
                          >
                            {log.statusCode}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                        {log.durationMs !== undefined && log.durationMs > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4, fontFamily: 'monospace' }}>
                            {log.durationMs}ms
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Tác nhân */}
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-main)' }}>
                          {log.username || 'Khách vãng lai'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {cleanIp}
                        </div>
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setActiveDetailTab(log.error ? 'error' : 'overview');
                          }}
                          title="Xem chi tiết bản ghi"
                          style={{ padding: '3px 7px' }}
                        >
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 2. DANH SÁCH THẺ DÀNH CHO MÀN HÌNH ĐIỆN THOẠI (<= 768px, RÕ RÀNG, DỄ ĐỌC, KHÔNG BỊ CO NGHẸT) */}
            <div className="logs-mobile-list">
              {logs.map((log) => {
                const modLabel = MODULE_LABELS[log.module] || log.module;
                const isErr = log.level === 'ERROR';
                const cleanIp = (log.ipAddress || '').replace(/^::ffff:/, '') || '127.0.0.1';

                return (
                  <div
                    key={log._id}
                    className={`log-mobile-card ${isErr ? 'log-mobile-card-error' : ''}`}
                    onClick={() => {
                      setSelectedLog(log);
                      setActiveDetailTab(log.error ? 'error' : 'overview');
                    }}
                  >
                    <div className="log-mobile-header">
                      <div className="log-mobile-tags">
                        {renderLevelBadge(log.level)}
                        <span className="log-module-tag">{modLabel}</span>
                        {log.statusCode && (
                          <span
                            className={`log-status-pill status-${
                              log.statusCode >= 500 ? '5xx' : log.statusCode >= 400 ? '4xx' : '2xx'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        )}
                        {log.durationMs !== undefined && log.durationMs > 0 && (
                          <span className="log-duration-text">{log.durationMs}ms</span>
                        )}
                      </div>
                      <span className="log-mobile-time">{formatDateTime(log.createdAt)}</span>
                    </div>

                    <div className="log-mobile-body">
                      <div className="log-mobile-message">{log.message}</div>
                      {log.error && (
                        <div className="log-mobile-error">
                          {log.error.name ? `${log.error.name}: ` : ''}{log.error.message}
                        </div>
                      )}
                    </div>

                    <div className="log-mobile-footer">
                      <div className="log-mobile-actor">
                        <span className="log-mobile-username">{log.username || 'Khách vãng lai'}</span>
                        <span className="log-mobile-ip">• {cleanIp}</span>
                      </div>
                      <div className="log-mobile-action">
                        <span>Chi tiết</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. PHÂN TRANG CHUẨN CỦA HỆ THỐNG QUẢN TRỊ ADMIN */}
        {totalCount > 0 && (
          <div className="logs-pagination-footer">
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={limit}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[6, 9, 12, 18, 24]}
              itemLabel="bản ghi"
            />
          </div>
        )}
      </div>

      {/* 5. MODAL PHÂN TÍCH LOG TỪNG PHẦN (LOG INSPECTOR) */}
      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div
            className="log-inspector-modal panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {renderLevelBadge(selectedLog.level)}
                <span className="log-module-tag">
                  {MODULE_LABELS[selectedLog.module] || selectedLog.module}
                </span>
                <span className="inspector-id">ID: {selectedLog._id}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleCopyJson(selectedLog)}
                  title="Sao chép toàn bộ bản ghi JSON"
                >
                  {isCopied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{isCopied ? 'Đã chép' : 'Sao chép JSON'}</span>
                </button>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setSelectedLog(null)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="inspector-nav-tabs">
              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('overview')}
              >
                <span>1. Tổng quan</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'error' ? 'active' : ''} ${
                  selectedLog.error ? 'has-error-tab' : ''
                }`}
                onClick={() => setActiveDetailTab('error')}
              >
                <span>2. Chi tiết lỗi {selectedLog.error ? '(Có lỗi)' : ''}</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'context' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('context')}
              >
                <span>3. Bối cảnh HTTP</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'payload' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('payload')}
              >
                <span>4. Tham số chi tiết</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="inspector-body">
              {/* TAB 1: TỔNG QUAN */}
              {activeDetailTab === 'overview' && (
                <div className="inspector-tab-content">
                  <div className="inspector-message-box">
                    <span className="box-label">Thông điệp chính:</span>
                    <p className="box-text">{selectedLog.message}</p>
                  </div>

                  <div className="inspector-grid-props">
                    <div className="prop-item">
                      <span className="prop-name">Thời gian ghi nhận:</span>
                      <span className="prop-val">{formatDateTime(selectedLog.createdAt)}</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Hành động:</span>
                      <span className="prop-val"><code>{selectedLog.action}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Mã phản hồi HTTP:</span>
                      <span className="prop-val">
                        {selectedLog.statusCode ? (
                          <span className={`log-status-pill status-${String(selectedLog.statusCode)[0]}xx`}>
                            {selectedLog.statusCode}
                          </span>
                        ) : '—'}
                      </span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Thời gian thực thi:</span>
                      <span className="prop-val">{selectedLog.durationMs || 0} ms</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Tài nguyên:</span>
                      <span className="prop-val">{selectedLog.resource || 'Toàn hệ thống'}</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Tác nhân:</span>
                      <span className="prop-val">
                        <strong>{selectedLog.username || 'Hệ thống'}</strong> ({selectedLog.role || 'guest'})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PHÂN TÍCH LỖI */}
              {activeDetailTab === 'error' && (
                <div className="inspector-tab-content">
                  {selectedLog.error ? (
                    <div>
                      <div className="error-callout-panel">
                        <div className="error-callout-title">
                          Chi tiết lỗi: {selectedLog.error.name || 'Exception'}
                        </div>
                        <p className="error-callout-msg">
                          {selectedLog.error.message || 'Không có thông báo lỗi cụ thể'}
                        </p>
                        {selectedLog.error.code && (
                          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            Mã lỗi: <code>{selectedLog.error.code}</code>
                          </div>
                        )}
                      </div>

                      {selectedLog.error.stack && (
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--heading-color)' }}>
                              Vết ngăn xếp thực thi (Call Stack):
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedLog.error?.stack || '');
                                showToast('Đã sao chép Callstack', 'info');
                              }}
                            >
                              <Copy size={12} />
                              <span>Sao chép Callstack</span>
                            </button>
                          </div>
                          <pre className="stack-trace-view">{selectedLog.error.stack}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px 10px', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: 13 }}>Không phát hiện lỗi ngoại lệ trong bản ghi này.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BỐI CẢNH HTTP & MẠNG */}
              {activeDetailTab === 'context' && (
                <div className="inspector-tab-content">
                  <div className="inspector-grid-props">
                    <div className="prop-item">
                      <span className="prop-name">Phương thức HTTP:</span>
                      <span className="prop-val">
                        <span className={`method-badge method-${selectedLog.method || 'GET'}`}>
                          {selectedLog.method || 'GET'}
                        </span>
                      </span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Đường dẫn:</span>
                      <span className="prop-val"><code>{selectedLog.path || '—'}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Địa chỉ IP:</span>
                      <span className="prop-val"><code>{selectedLog.ipAddress || '127.0.0.1'}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">User ID:</span>
                      <span className="prop-val"><code>{selectedLog.userId || 'system'}</code></span>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--heading-color)', display: 'block', marginBottom: 6 }}>
                      Trình duyệt Client (User-Agent):
                    </span>
                    <div className="user-agent-box">
                      {selectedLog.userAgent || 'Không xác định / Máy chủ nội bộ'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: THAM SỐ CHI TIẾT */}
              {activeDetailTab === 'payload' && (
                <div className="inspector-tab-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                      Dữ liệu tham số chi tiết (Details):
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleCopyJson(selectedLog.details || {})}
                    >
                      <Copy size={12} />
                      <span>Sao chép JSON</span>
                    </button>
                  </div>
                  <pre className="json-code-block">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="inspector-footer">
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Bản ghi nhật ký được lưu trữ an toàn trong cơ sở dữ liệu.
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL QUẢN LÝ LƯU TRỮ & DỌN DẸP NHẬT KÝ (NOSQL MONGODB) */}
      {isCleanupModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCleanupModalOpen(false)}>
          <div
            className="log-inspector-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720, width: '94%', maxHeight: '88vh' }}
          >
            {/* Header */}
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Archive size={17} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                  Quản lý Lưu trữ & Dọn dẹp Nhật ký (NoSQL MongoDB)
                </span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsCleanupModalOpen(false)}
                title="Đóng modal"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="inspector-nav-tabs">
              <button
                type="button"
                className={`inspector-tab ${cleanupModalTab === 'clean' ? 'active' : ''}`}
                onClick={() => {
                  setCleanupModalTab('clean');
                  fetchCleanupPreview(cleanType, cleanupDays);
                }}
              >
                <Trash2 size={13} style={{ marginRight: 6, display: 'inline', verticalAlign: '-1px' }} />
                <span>Đề xuất dọn dẹp an toàn</span>
              </button>
              <button
                type="button"
                className={`inspector-tab ${cleanupModalTab === 'archives' ? 'active' : ''}`}
                onClick={() => {
                  setCleanupModalTab('archives');
                  fetchArchivesList();
                }}
              >
                <RotateCcw size={13} style={{ marginRight: 6, display: 'inline', verticalAlign: '-1px' }} />
                <span>Lịch sử Lưu trữ & Khôi phục (Restore)</span>
                {archivesList.length > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: 'rgba(212, 168, 106, 0.2)',
                    color: 'var(--primary)',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10
                  }}>
                    {archivesList.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="inspector-body" style={{ padding: '18px 22px' }}>
              {/* TAB 1: ĐỀ XUẤT DỌN DẸP */}
              {cleanupModalTab === 'clean' && (
                <div>
                  <div style={{
                    background: 'rgba(212, 168, 106, 0.06)',
                    border: '1px solid rgba(212, 168, 106, 0.2)',
                    borderRadius: 7,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    marginBottom: 16
                  }}>
                    <strong style={{ color: 'var(--primary)' }}>Chiến lược dọn dẹp an toàn: </strong>
                    Hệ thống tự động đề xuất phân loại bản ghi để giải phóng bộ nhớ RAM và đĩa cứng cho VPS mà
                    <strong> không mất đi vết tra cứu (audit trace)</strong>. Bạn có thể khôi phục (restore) lại các bản ghi đã xóa bất cứ lúc nào.
                  </div>

                  {/* Chọn nhóm đề xuất */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 6 }}>
                      Chọn đối tượng dọn dẹp đề xuất:
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: cleanType === 'BOT_SCANS_ONLY' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        background: cleanType === 'BOT_SCANS_ONLY' ? 'rgba(212, 168, 106, 0.08)' : 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="cleanType"
                          checked={cleanType === 'BOT_SCANS_ONLY'}
                          onChange={() => {
                            setCleanType('BOT_SCANS_ONLY');
                            fetchCleanupPreview('BOT_SCANS_ONLY', cleanupDays);
                          }}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                              Chỉ dọn bot dò quét 404 & request rác
                            </span>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#22C55E',
                              padding: '1px 6px',
                              borderRadius: 4
                            }}>
                              Khuyên dùng (An toàn 100%)
                            </span>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                            Lọc sạch các request dò quét tự động từ Internet (như <code>/service-account.json</code>, <code>/.env</code>, <code>/pdown</code>,...).
                            Bảo toàn 100% hoạt động của khách tham quan và nhân sự bảo tàng.
                          </div>
                        </div>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: cleanType === 'ROUTINE_INFO' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        background: cleanType === 'ROUTINE_INFO' ? 'rgba(212, 168, 106, 0.08)' : 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="cleanType"
                          checked={cleanType === 'ROUTINE_INFO'}
                          onChange={() => {
                            setCleanType('ROUTINE_INFO');
                            fetchCleanupPreview('ROUTINE_INFO', cleanupDays);
                          }}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                            Dọn nhật ký thông thường cũ (INFO / SUCCESS)
                          </span>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                            Dọn các lượt xem trang và gọi API định kỳ đã cũ. <strong>Bảo lưu tuyệt đối</strong> toàn bộ Sự cố (ERROR) và Hành động Quản trị.
                          </div>
                        </div>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: cleanType === 'FULL_PRUNE_WITH_TRACE_PRESERVED' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        background: cleanType === 'FULL_PRUNE_WITH_TRACE_PRESERVED' ? 'rgba(212, 168, 106, 0.08)' : 'rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="cleanType"
                          checked={cleanType === 'FULL_PRUNE_WITH_TRACE_PRESERVED'}
                          onChange={() => {
                            setCleanType('FULL_PRUNE_WITH_TRACE_PRESERVED');
                            fetchCleanupPreview('FULL_PRUNE_WITH_TRACE_PRESERVED', cleanupDays);
                          }}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                            Dọn dẹp toàn diện (Bảo lưu Sự cố & Hành động Admin)
                          </span>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                            Dọn toàn bộ log cũ ngoại trừ Lỗi hệ thống và Nhật ký nhân sự quản trị.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Khoảng thời gian */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 5 }}>
                      Khoảng thời gian cần dọn dẹp:
                    </label>
                    <select
                      className="form-control"
                      value={cleanupDays}
                      onChange={(e) => {
                        const days = parseInt(e.target.value, 10);
                        setCleanupDays(days);
                        fetchCleanupPreview(cleanType, days);
                      }}
                      style={{ fontSize: 12.5 }}
                    >
                      <option value={3}>Cũ hơn 3 ngày (Khuyên dùng cho bot rác)</option>
                      <option value={7}>Cũ hơn 7 ngày</option>
                      <option value={14}>Cũ hơn 14 ngày</option>
                      <option value={30}>Cũ hơn 30 ngày</option>
                      <option value={60}>Cũ hơn 60 ngày</option>
                      <option value={90}>Cũ hơn 90 ngày</option>
                    </select>
                  </div>

                  {/* Dự báo an toàn (Preview Card) */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 7,
                    padding: '12px 14px',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--heading-color)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} style={{ color: '#22C55E' }} />
                        Dự báo an toàn & Tài nguyên giải phóng:
                      </span>
                      {loadingPreview && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Đang tính toán...</span>
                      )}
                    </div>

                    {previewData && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 5 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Bản ghi sẽ dọn:</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>
                            {previewData.candidateCount.toLocaleString('vi-VN')} bản ghi
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginTop: 1 }}>
                            ~{previewData.estimatedFreeMb} MB giải phóng
                          </span>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 5 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Bảo lưu an toàn (Không xóa):</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#22C55E', display: 'block' }}>
                            {previewData.protectedErrorsCount} Sự cố / Lỗi
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {previewData.protectedAdminAuditCount} Tác vụ Admin
                          </span>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: 5 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Tổng bản ghi trong DB:</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading-color)' }}>
                            {previewData.totalLogsCount.toLocaleString('vi-VN')}
                          </span>
                          <span style={{ fontSize: 10.5, color: '#22C55E', display: 'block', marginTop: 1 }}>
                            Giảm tải RAM working-set
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tùy chọn đóng gói sao lưu */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer', marginBottom: 18 }}>
                    <input
                      type="checkbox"
                      checked={backupBeforeDelete}
                      onChange={(e) => setBackupBeforeDelete(e.target.checked)}
                    />
                    <span>
                      <strong>Tự động đóng gói nén sao lưu (.json.gz)</strong> trước khi xóa để có thể <strong>Khôi phục (Restore)</strong> bất cứ lúc nào
                    </span>
                  </label>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsCleanupModalOpen(false)}
                      disabled={cleaningUp}
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleExecuteArchiveAndPrune}
                      disabled={cleaningUp || !previewData || previewData.candidateCount === 0}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Trash2 size={13} />
                      <span>{cleaningUp ? 'Đang dọn & đóng gói...' : `Dọn dẹp ${previewData ? previewData.candidateCount : 0} bản ghi`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: LỊCH SỬ LƯU TRỮ & KHÔI PHỤC */}
              {cleanupModalTab === 'archives' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      Các gói nhật ký được nén (.json.gz) lưu trữ tại máy chủ. Bạn có thể khôi phục lại bất kỳ gói nào vào MongoDB chỉ với 1 click.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={fetchArchivesList}
                      disabled={loadingArchives}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <RefreshCw size={11} className={loadingArchives ? 'spin' : ''} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  {loadingArchives && (
                    <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)' }}>
                      Đang tải danh sách gói lưu trữ...
                    </div>
                  )}

                  {!loadingArchives && archivesList.length === 0 && (
                    <div style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      background: 'rgba(0, 0, 0, 0.15)',
                      borderRadius: 8,
                      border: '1px dashed var(--border-color)'
                    }}>
                      <Archive size={30} style={{ color: 'var(--text-muted)', marginBottom: 8, opacity: 0.5 }} />
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--heading-color)', marginBottom: 4 }}>
                        Chưa có gói lưu trữ nào
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                        Khi bạn thực hiện dọn dẹp ở tab "Đề xuất dọn dẹp" và chọn sao lưu, các gói nén sẽ xuất hiện tại đây để bạn có thể Khôi phục hoặc Tải về.
                      </div>
                    </div>
                  )}

                  {!loadingArchives && archivesList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
                      {archivesList.map((pkg: any) => (
                        <div
                          key={pkg._id}
                          style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 7,
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 10
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 260 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                                {pkg.fileName}
                              </span>
                              {pkg.restoredAt && (
                                <span style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  background: 'rgba(34, 197, 94, 0.15)',
                                  color: '#22C55E',
                                  padding: '1px 6px',
                                  borderRadius: 4
                                }}>
                                  Đã khôi phục
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
                              <span>Phân loại: <strong>{getCategoryLabel(pkg.category)}</strong></span>
                              <span>Số lượng: <strong style={{ color: 'var(--primary)' }}>{pkg.recordCount?.toLocaleString('vi-VN')} bản ghi</strong></span>
                              <span>Kích thước nén: <strong>{formatBytes(pkg.fileSizeBytes)}</strong></span>
                              <span>Tạo lúc: {formatDateTime(pkg.createdAt)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleRestoreArchive(pkg._id, pkg.fileName)}
                              disabled={restoringId === pkg._id}
                              title="Khôi phục dữ liệu từ gói này trở lại vào MongoDB"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <RotateCcw size={11} className={restoringId === pkg._id ? 'spin' : ''} />
                              <span>{restoringId === pkg._id ? 'Đang nạp...' : 'Khôi phục'}</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleDownloadArchive(pkg._id, pkg.fileName)}
                              title="Tải tệp nén .json.gz về máy tính"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Download size={11} />
                              <span>Tải file</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleDeleteArchive(pkg._id)}
                              disabled={deletingArchiveId === pkg._id}
                              title="Xóa vĩnh viễn tệp nén khỏi VPS"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444' }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsCleanupModalOpen(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminLogsPage;
