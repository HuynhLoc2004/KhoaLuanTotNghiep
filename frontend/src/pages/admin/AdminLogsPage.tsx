import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  RefreshCw,
  Search,
  Download,
  ChevronRight,
  Copy,
  Check,
  X,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { SystemLogItem, SystemLogStats, LogLevel } from '../../types';
import { Pagination } from '../../components/Pagination';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useToast } from '../../components/Toast';

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
  const { currentLang } = useClientTranslation();
  const { showToast } = useToast();

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
  const [exporting, setExporting] = useState<boolean>(false);

  // Modal dọn dẹp nhật ký (Clear Logs)
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [clearScope, setClearScope] = useState<'warn_only' | 'all' | 'non_error'>('warn_only');
  const [clearing, setClearing] = useState<boolean>(false);

  // Chống đóng nhầm modal khi vuốt chuột hoặc scroll trượt ra ngoài
  const inspectorBackdropRef = React.useRef(false);

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
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
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
    [page, limit, selectedLevel, selectedModule, searchTerm, hasErrorOnly, computedDateRange, showToast]
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

  // Lắng nghe sự kiện Realtime SSE siêu tốc khi có log mới
  useEffect(() => {
    if (!isLiveStreaming) return;

    const handleNewLog = (e: any) => {
      const newLog = e.detail;
      if (!newLog || !newLog._id) return;

      // Kiểm tra bộ lọc người dùng đang chọn
      if (selectedLevel !== 'all' && newLog.level !== selectedLevel) return;
      if (selectedModule !== 'all' && newLog.module !== selectedModule) return;
      if (hasErrorOnly && newLog.level !== 'ERROR') return;

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

    // Kênh EventSource trực tiếp dự phòng đảm bảo log hiển thị <1ms
    let directSse: EventSource | null = null;
    try {
      const streamUrl = `/api/system/realtime-stream`;
      directSse = new EventSource(streamUrl);
      directSse.addEventListener('system_log_created', (e: any) => {
        try {
          const detail = JSON.parse(e.data);
          handleNewLog({ detail });
        } catch {}
      });
    } catch {}

    // Polling dự phòng mỗi 10s đảm bảo số liệu luôn chính xác 100%
    const pollInterval = setInterval(() => {
      fetchLogs(true);
      fetchStats();
    }, 10000);

    return () => {
      window.removeEventListener('museum:system_log_created' as any, handleNewLog);
      if (directSse) {
        directSse.close();
      }
      clearInterval(pollInterval);
    };
  }, [isLiveStreaming, page, limit, selectedLevel, selectedModule, hasErrorOnly, fetchStats, fetchLogs]);

  // Sao chép nội dung JSON
  const handleCopyJson = (data: any) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('Đã sao chép nội dung JSON', 'info');
    } catch {}
  };

  // Xuất file JSON an toàn đồng bộ với ngôn ngữ hệ thống đang chọn
  const handleExportJson = async () => {
    setExporting(true);
    try {
      await api.exportSystemLogs({
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        module: selectedModule !== 'all' ? selectedModule : undefined,
        lang: currentLang
      });
      showToast(
        currentLang === 'vi'
          ? 'Đã xuất tệp nhật ký an toàn theo ngôn ngữ Tiếng Việt'
          : `Đã xuất tệp nhật ký an toàn theo ngôn ngữ (${currentLang.toUpperCase()})`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xuất tệp nhật ký', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Dọn dẹp nhật ký hệ thống
  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const res = await api.clearSystemLogs(clearScope);
      showToast(res.message || 'Đã dọn dẹp nhật ký thành công', 'success');
      setIsClearModalOpen(false);
      fetchLogs(true);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi dọn dẹp nhật ký', 'error');
    } finally {
      setClearing(false);
    }
  };

  // Xóa đơn lẻ 1 bản ghi nhật ký
  const handleDeleteSingleLog = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bản ghi nhật ký này?')) return;
    try {
      await api.deleteSystemLog(id);
      showToast('Đã xóa bản ghi nhật ký thành công', 'success');
      setSelectedLog(null);
      fetchLogs(true);
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa bản ghi nhật ký', 'error');
    }
  };

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedModule('all');
    setSelectedLevel('all');
    setDateRange('all');
    setHasErrorOnly(false);
    setPage(1);
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

  // Hiển thị thông tin tác nhân chuẩn trang quản trị (gọn gàng, trung tính, không icon rườm rà)
  const renderActorInfo = (log: SystemLogItem) => {
    const cleanIp = (log.ipAddress || '').replace(/^::ffff:/, '') || '127.0.0.1';
    const rawUser = log.username ? log.username.trim() : '';
    const isRealUser = rawUser && !['Khách vãng lai', 'Khách', 'Guest', 'Anonymous'].includes(rawUser);

    return (
      <div>
        <div style={{ fontSize: 12.5, fontWeight: isRealUser ? 600 : 400, color: isRealUser ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {isRealUser ? rawUser : 'Khách vãng lai'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', fontFamily: 'monospace', marginTop: 2 }}>
          {cleanIp}
        </div>
      </div>
    );
  };

  // Hiển thị hành động & nội dung chuẩn mực, không rườm rà
  const renderActionContent = (log: SystemLogItem) => {
    return (
      <div>
        <div style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: 12.5, fontFamily: 'monospace' }}>
          {log.message}
        </div>
        {log.error && (
          <div style={{ color: '#EF4444', fontSize: 11, marginTop: 2 }}>
            {log.error.name ? `${log.error.name}: ` : ''}{log.error.message}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-content admin-logs-page" style={{ padding: '24px 28px' }}>
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
            onClick={() => setIsClearModalOpen(true)}
            title="Dọn dẹp các bản ghi nhật ký rác hoặc cảnh báo bot"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f87171' }}
          >
            <Trash2 size={13} />
            <span>Dọn dẹp</span>
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
          style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <span>{hasErrorOnly ? 'Đang lọc: Chỉ lỗi' : 'Chỉ sự cố & lỗi'}</span>
        </button>

        {/* Nút Đặt lại tiêu chí lọc */}
        {(searchInput || selectedModule !== 'all' || selectedLevel !== 'all' || dateRange !== 'all' || hasErrorOnly) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            title="Đặt lại toàn bộ tiêu chí lọc về mặc định"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <RotateCcw size={13} />
            <span>Đặt lại</span>
          </button>
        )}
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
                  <th style={{ width: 110 }}>MỨC ĐỘ</th>
                  <th style={{ width: 140 }}>PHÂN HỆ</th>
                  <th style={{ width: 155 }}>THỜI GIAN</th>
                  <th>NỘI DUNG HOẠT ĐỘNG</th>
                  <th style={{ width: 195 }}>NGƯỜI THỰC HIỆN & IP</th>
                  <th style={{ width: 80, textAlign: 'center' }}>CHI TIẾT</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const modLabel = MODULE_LABELS[log.module] || log.module;
                  const isErr = log.level === 'ERROR';

                  return (
                    <tr
                      key={log._id}
                      className={`log-row ${isErr ? 'log-row-error' : ''}`}
                      onClick={() => setSelectedLog(log)}
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

                      {/* Cột 4: Thông điệp hoạt động */}
                      <td>
                        {renderActionContent(log)}
                      </td>

                      {/* Cột 5: Tác nhân */}
                      <td>
                        {renderActorInfo(log)}
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
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

                return (
                  <div
                    key={log._id}
                    className={`log-mobile-card ${isErr ? 'log-mobile-card-error' : ''}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="log-mobile-header">
                      <div className="log-mobile-tags">
                        {renderLevelBadge(log.level)}
                        <span className="log-module-tag">{modLabel}</span>
                      </div>
                      <span className="log-mobile-time">{formatDateTime(log.createdAt)}</span>
                    </div>

                    <div className="log-mobile-body">
                      {renderActionContent(log)}
                    </div>

                    <div className="log-mobile-footer">
                      <div className="log-mobile-actor">
                        {renderActorInfo(log)}
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

        {/* 5. PHÂN TRANG CHUẨN CỦA HỆ THỐNG QUẢN TRỊ ADMIN (ĐỒNG BỘ 100% CÁC TRANG ADMIN) */}
        {totalCount > 0 && (
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
        )}
      </div>

      {/* 5. MODAL PHÂN TÍCH LOG TỪNG PHẦN (LOG INSPECTOR) */}
      {selectedLog && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            inspectorBackdropRef.current = e.target === e.currentTarget;
          }}
          onMouseUp={(e) => {
            if (inspectorBackdropRef.current && e.target === e.currentTarget) {
              setSelectedLog(null);
            }
            inspectorBackdropRef.current = false;
          }}
          onTouchStart={(e) => {
            inspectorBackdropRef.current = e.target === e.currentTarget;
          }}
          onTouchEnd={(e) => {
            if (inspectorBackdropRef.current && e.target === e.currentTarget) {
              setSelectedLog(null);
            }
            inspectorBackdropRef.current = false;
          }}
        >
          <div
            className="log-inspector-modal panel"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                {renderLevelBadge(selectedLog.level)}
                <span className="log-module-tag">
                  {MODULE_LABELS[selectedLog.module] || selectedLog.module}
                </span>
                <span className="inspector-id" title={selectedLog._id}>ID: {selectedLog._id}</span>
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

            {/* Modal Body */}
            <div className="inspector-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              <div className="inspector-message-box" style={{ marginBottom: 18, background: 'rgba(0,0,0,0.12)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '14px 16px' }}>
                <span className="box-label" style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 600 }}>Nội dung hoạt động:</span>
                <p className="box-text" style={{ fontSize: 13.5, lineHeight: 1.5, margin: '6px 0 0 0', color: 'var(--heading-color)', fontWeight: 500 }}>
                  {selectedLog.message}
                </p>
              </div>

              <div className="inspector-grid-props" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Thời gian ghi nhận:</span>
                  <span className="prop-val" style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{formatDateTime(selectedLog.createdAt)}</span>
                </div>

                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Người thực hiện:</span>
                  <span className="prop-val" style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                    {selectedLog.username || 'Hệ thống'} {selectedLog.role ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({selectedLog.role})</span> : ''}
                  </span>
                </div>

                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Phân hệ chức năng:</span>
                  <span className="prop-val" style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>{MODULE_LABELS[selectedLog.module] || selectedLog.module}</span>
                </div>

                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Hành động:</span>
                  <span className="prop-val"><code style={{ fontSize: 12, background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>{selectedLog.action}</code></span>
                </div>

                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Tài nguyên bị tác động:</span>
                  <span className="prop-val" style={{ fontSize: 13, color: 'var(--text-main)' }}>{selectedLog.resource || 'Toàn hệ thống'}</span>
                </div>

                <div className="prop-item" style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '10px 14px' }}>
                  <span className="prop-name" style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Địa chỉ IP:</span>
                  <span className="prop-val"><code style={{ fontSize: 12 }}>{(selectedLog.ipAddress || '127.0.0.1').replace(/^::ffff:/, '')}</code></span>
                </div>
              </div>

              {/* Chi tiết lỗi nếu có */}
              {selectedLog.error && (
                <div style={{ marginTop: 18 }}>
                  <div className="error-callout-panel" style={{ padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8 }}>
                    <div className="error-callout-title" style={{ color: '#EF4444', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      Chi tiết lỗi ngoại lệ: {selectedLog.error.name || 'Exception'}
                    </div>
                    <p className="error-callout-msg" style={{ margin: 0, fontSize: 12.5, color: 'var(--text-main)' }}>
                      {selectedLog.error.message || 'Không có mô tả lỗi cụ thể'}
                    </p>
                    {selectedLog.error.stack && (
                      <pre style={{ marginTop: 10, padding: 10, borderRadius: 6, background: '#111217', color: '#F87171', fontSize: 11, overflowX: 'auto', maxHeight: 150 }}>
                        {selectedLog.error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.08)', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleDeleteSingleLog(selectedLog._id)}
                title="Xóa vĩnh viễn bản ghi nhật ký này"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <Trash2 size={13} />
                <span>Xóa bản ghi này</span>
              </button>

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

      {/* MODAL DỌN DẸP NHẬT KÝ HỆ THỐNG */}
      {isClearModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsClearModalOpen(false)}
          style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="modal-card"
            style={{ width: '100%', maxWidth: 480, background: 'var(--bg-card, #1e1e24)', borderRadius: 10, border: '1px solid var(--border-color)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Trash2 size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>Dọn dẹp nhật ký hệ thống</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsClearModalOpen(false)}
                disabled={clearing}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Chọn phạm vi nhật ký bạn muốn làm sạch. Hành động này không thể hoàn tác sau khi đã thực hiện.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${clearScope === 'warn_only' ? 'var(--primary, #d97706)' : 'var(--border-color)'}`,
                    backgroundColor: clearScope === 'warn_only' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    value="warn_only"
                    checked={clearScope === 'warn_only'}
                    onChange={() => setClearScope('warn_only')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>
                      Chỉ xóa các cảnh báo & lượt quét bot (WARN)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Khuyên dùng: Dọn sạch các cảnh báo do bot internet quét link rác mà vẫn giữ nguyên lịch sử hoạt động khác.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${clearScope === 'non_error' ? 'var(--primary, #d97706)' : 'var(--border-color)'}`,
                    backgroundColor: clearScope === 'non_error' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    value="non_error"
                    checked={clearScope === 'non_error'}
                    onChange={() => setClearScope('non_error')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>
                      Xóa tất cả (Giữ lại nhật ký sự cố ERROR)
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Làm sạch các bản ghi thông tin và cảnh báo, nhưng vẫn lưu lại các lỗi để phục vụ rà soát kỹ thuật.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${clearScope === 'all' ? '#ef4444' : 'var(--border-color)'}`,
                    backgroundColor: clearScope === 'all' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="clearScope"
                    value="all"
                    checked={clearScope === 'all'}
                    onChange={() => setClearScope('all')}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#ef4444' }}>
                      Xóa sạch toàn bộ nhật ký hệ thống
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Xóa toàn bộ bản ghi nhật ký trong cơ sở dữ liệu và đặt các chỉ số thống kê về 0.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: 'rgba(0,0,0,0.08)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsClearModalOpen(false)}
                disabled={clearing}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleClearLogs}
                disabled={clearing}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
              >
                <Trash2 size={13} />
                <span>{clearing ? 'Đang dọn dẹp...' : 'Xác nhận dọn dẹp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminLogsPage;