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
  Radio
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
  const limit = 20;
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

  // Modal dọn dẹp log
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);
  const [cleanupDays, setCleanupDays] = useState<number>(30);
  const [keepErrorsOnly, setKeepErrorsOnly] = useState<boolean>(true);
  const [cleaningUp, setCleaningUp] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

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

  // Xử lý dọn dẹp log
  const handleExecuteCleanup = async () => {
    setCleaningUp(true);
    try {
      const res = await api.cleanupSystemLogs({
        olderThanDays: cleanupDays,
        keepErrorsOnly
      });
      showToast(res.message || 'Dọn dẹp nhật ký thành công', 'success');
      setIsCleanupModalOpen(false);
      fetchLogs();
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi dọn dẹp nhật ký', 'error');
    } finally {
      setCleaningUp(false);
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

  // Badge nhãn chữ chuẩn, không chèn icon rườm rà
  const renderLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return <span className="log-badge-text log-badge-error">LỖI</span>;
      case 'WARN':
        return <span className="log-badge-text log-badge-warn">CẢNH BÁO</span>;
      case 'SUCCESS':
        return <span className="log-badge-text log-badge-success">THÀNH CÔNG</span>;
      case 'INFO':
      default:
        return <span className="log-badge-text log-badge-info">THÔNG TIN</span>;
    }
  };

  return (
    <div className="admin-logs-page">
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
            className={`btn btn-sm ${isLiveStreaming ? 'btn-live-active' : 'btn-secondary'}`}
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            title={isLiveStreaming ? 'Tự động nhận log mới qua SSE' : 'Bật nhận log tự động'}
          >
            <Radio size={13} className={isLiveStreaming ? 'pulse-live' : ''} />
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
          >
            <Download size={13} />
            <span>{exporting ? 'Đang xuất...' : 'Xuất JSON'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setIsCleanupModalOpen(true)}
            title="Dọn dẹp nhật ký cũ giải phóng bộ nhớ"
          >
            <Trash2 size={13} />
            <span>Dọn dẹp</span>
          </button>
        </div>
      </div>

      {/* 2. BĂNG CHỈ SỐ KPI TỐI GIẢN (KHÔNG DÙNG ICON/CARD LÒE LOẸT) */}
      <div className="logs-summary-bar">
        <div className="summary-item">
          <span className="summary-label">Tổng bản ghi</span>
          <span className="summary-value">{stats ? stats.total.toLocaleString('vi-VN') : totalCount}</span>
          <span className="summary-hint">Toàn bộ hoạt động</span>
        </div>

        <div className="summary-item summary-item-error">
          <span className="summary-label">Sự cố / Lỗi</span>
          <span className="summary-value text-danger">
            {stats ? stats.errorCount.toLocaleString('vi-VN') : 0}
          </span>
          <span className="summary-hint">Tỷ lệ lỗi: {stats ? stats.errorRate : 0}%</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Cảnh báo</span>
          <span className="summary-value text-warn">
            {stats ? stats.warnCount.toLocaleString('vi-VN') : 0}
          </span>
          <span className="summary-hint">Cần theo dõi</span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Bình thường</span>
          <span className="summary-value text-success">
            {stats ? (stats.infoCount + stats.successCount).toLocaleString('vi-VN') : 0}
          </span>
          <span className="summary-hint">Hoạt động ổn định</span>
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
            <table className="logs-table">
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
                      <td>
                        <span className="log-module-tag">{modLabel}</span>
                      </td>

                      {/* Cột 3: Thời gian */}
                      <td>
                        <span className="log-time-text">{formatDateTime(log.createdAt)}</span>
                      </td>

                      {/* Cột 4: Thông điệp & Endpoint */}
                      <td>
                        <div className="log-action-text">{log.message}</div>
                        <div className="log-sub-info">
                          {log.method && <span className={`method-badge method-${log.method}`}>{log.method}</span>}
                          {log.path && <span className="log-path-code">{log.path}</span>}
                          {log.error && (
                            <span className="log-error-pill" title={log.error.message}>
                              Lỗi: {log.error.name || 'Error'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 5: Mã HTTP */}
                      <td>
                        {log.statusCode ? (
                          <span
                            className={`log-status-pill ${
                              log.statusCode >= 500
                                ? 'status-5xx'
                                : log.statusCode >= 400
                                ? 'status-4xx'
                                : 'status-2xx'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        )}
                        {log.durationMs !== undefined && log.durationMs > 0 && (
                          <span className="log-duration-text">{log.durationMs}ms</span>
                        )}
                      </td>

                      {/* Cột 6: Tác nhân */}
                      <td>
                        <div className="log-actor-name">{log.username || 'Hệ thống'}</div>
                        <div className="log-actor-ip">{log.ipAddress || '127.0.0.1'}</div>
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-inspect-log"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setActiveDetailTab(log.error ? 'error' : 'overview');
                          }}
                          title="Xem chi tiết bản ghi"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        <div className="logs-pagination-footer">
          <div className="logs-count-info">
            Hiển thị <strong>{logs.length}</strong> / <strong>{totalCount}</strong> bản ghi
          </div>
          <Pagination
            currentPage={page}
            totalItems={totalCount}
            pageSize={limit}
            onPageChange={(p) => setPage(p)}
            itemLabel="bản ghi"
          />
        </div>
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

      {/* 6. MODAL DỌN DẸP NHẬT KÝ */}
      {isCleanupModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCleanupModalOpen(false)}>
          <div
            className="modal-card panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440, width: '90%' }}
          >
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--heading-color)' }}>
                Dọn dẹp nhật ký hệ thống
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsCleanupModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Xóa các bản ghi nhật ký cũ hơn khoảng thời gian chỉ định để giải phóng dung lượng lưu trữ cơ sở dữ liệu.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, marginBottom: 5 }}>
                Khoảng thời gian dọn dẹp:
              </label>
              <select
                className="form-control"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value, 10))}
              >
                <option value={7}>Cũ hơn 7 ngày</option>
                <option value={14}>Cũ hơn 14 ngày</option>
                <option value={30}>Cũ hơn 30 ngày (Khuyên dùng)</option>
                <option value={60}>Cũ hơn 60 ngày</option>
                <option value={90}>Cũ hơn 90 ngày</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer', marginBottom: 18 }}>
              <input
                type="checkbox"
                checked={keepErrorsOnly}
                onChange={(e) => setKeepErrorsOnly(e.target.checked)}
              />
              <span>Giữ lại tất cả các bản ghi có lỗi (ERROR)</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCleanupModalOpen(false)}
                disabled={cleaningUp}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleExecuteCleanup}
                disabled={cleaningUp}
              >
                {cleaningUp ? 'Đang dọn...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminLogsPage;
