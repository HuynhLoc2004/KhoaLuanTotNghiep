import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Globe,
  Radio,
  ChevronRight,
  Copy,
  Check,
  X,
  Code,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { SystemLogItem, SystemLogStats, LogLevel, LogModule } from '../../types';
import { Pagination } from '../../components/Pagination';

const MODULE_LABELS: Record<string, { label: string; color: string }> = {
  ROOMS: { label: 'Gian phòng 360°', color: '#3B82F6' },
  ARTIFACTS: { label: 'Cổ vật di sản 3D', color: '#8B5CF6' },
  STITCHING: { label: 'Ghép ảnh 360°', color: '#EC4899' },
  FLOOR_PLAN: { label: 'Sơ đồ mặt bằng', color: '#10B981' },
  TICKETS: { label: 'Vé & PayOS', color: '#F59E0B' },
  AUTH: { label: 'Xác thực & Tài khoản', color: '#6366F1' },
  SYSTEM: { label: 'Cấu hình hệ thống', color: '#64748B' },
  AI_VOICE: { label: 'Trợ lý AI & Giọng nói', color: '#06B6D4' },
  DATABASE: { label: 'Cơ sở dữ liệu', color: '#14B8A6' },
  SHOWCASE: { label: 'Trưng bày Trang chủ', color: '#E11D48' }
};

export const AdminLogsPage: React.FC = () => {
  // State dữ liệu danh sách log
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<SystemLogStats | null>(null);

  // State bộ lọc
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hasErrorOnly, setHasErrorOnly] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>('all'); // all, today, 7d, 30d

  // Realtime live streaming state
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Modal xem chi tiết phân tích log
  const [selectedLog, setSelectedLog] = useState<SystemLogItem | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'error' | 'context' | 'payload'>('overview');

  // Modal dọn dẹp log
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState<boolean>(false);
  const [cleanupDays, setCleanupDays] = useState<number>(30);
  const [keepErrorsOnly, setKeepErrorsOnly] = useState<boolean>(true);
  const [cleaningUp, setCleaningUp] = useState<boolean>(false);

  // Thông báo toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  // Tải danh sách logs từ API NoSQL MongoDB
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
          search: searchTerm.trim() ? searchTerm.trim() : undefined,
          hasError: hasErrorOnly,
          ...computedDateRange
        });

        setLogs(res.data || []);
        setTotalPages(res.pagination.totalPages || 1);
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

      // Nếu đang ở trang 1, tự động bổ sung vào đầu danh sách
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
      showToast('Đã sao chép cấu trúc JSON vào bộ nhớ tạm', 'info');
    } catch {}
  };

  // Xử lý dọn dẹp log
  const handleExecuteCleanup = async () => {
    setCleaningUp(true);
    try {
      const res = await api.cleanupSystemLogs({
        olderThanDays: cleanupDays,
        keepErrorsOnly
      });
      showToast(res.message || 'Dọn dẹp nhật ký thành công!', 'success');
      setIsCleanupModalOpen(false);
      fetchLogs();
      fetchStats();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi dọn dẹp nhật ký', 'error');
    } finally {
      setCleaningUp(false);
    }
  };

  // Định dạng thời gian chuẩn Việt Nam
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
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

  // Badge màu sắc cho từng cấp độ log
  const renderLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="log-badge log-badge-error">
            <AlertCircle size={13} />
            <span>LỖI (ERROR)</span>
          </span>
        );
      case 'WARN':
        return (
          <span className="log-badge log-badge-warn">
            <AlertTriangle size={13} />
            <span>CẢNH BÁO (WARN)</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="log-badge log-badge-success">
            <CheckCircle2 size={13} />
            <span>THÀNH CÔNG</span>
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="log-badge log-badge-info">
            <Info size={13} />
            <span>THÔNG TIN</span>
          </span>
        );
    }
  };

  return (
    <div className="admin-logs-page">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className={`admin-toast admin-toast-${toastMessage.type}`}>
          {toastMessage.type === 'success' && <CheckCircle2 size={16} />}
          {toastMessage.type === 'error' && <AlertCircle size={16} />}
          {toastMessage.type === 'info' && <Info size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. HEADER & TIÊU ĐỀ TRANG */}
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb">HỆ THỐNG & BÁO CÁO / GIÁM SÁT KỸ THUẬT</div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={26} style={{ color: 'var(--primary)' }} />
            <span>Nhật Ký & Giám Sát Hệ Thống (NoSQL Logs)</span>
          </h1>
          <p className="admin-page-subtitle">
            Lưu trữ tập trung và phân tích có cấu trúc mọi hoạt động, thay đổi dữ liệu thật và sự cố kỹ thuật trên MongoDB.
          </p>
        </div>

        <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Nút bật/tắt cập nhật thời gian thực */}
          <button
            type="button"
            className={`btn btn-sm ${isLiveStreaming ? 'btn-live-active' : 'btn-secondary'}`}
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            title={isLiveStreaming ? 'Đang tự động nhận log mới qua SSE' : 'Bật nhận log tự động'}
          >
            <Radio size={14} className={isLiveStreaming ? 'pulse-live' : ''} />
            <span>{isLiveStreaming ? 'Trực tiếp (Live SSE)' : 'Đã tạm dừng'}</span>
          </button>

          {/* Nút tải lại */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchLogs(true);
              fetchStats();
            }}
            disabled={refreshing}
            title="Làm mới dữ liệu từ CSDL NoSQL"
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>

          {/* Nút xuất dữ liệu JSON */}
          <a
            href={`${API_ROOT}/api/system/logs/export/json?level=${selectedLevel}&module=${selectedModule}&token=${localStorage.getItem('museum_admin_token') || ''}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            title="Tải tệp JSON nhật ký về máy tính"
          >
            <Download size={14} />
            <span>Xuất JSON</span>
          </a>

          {/* Nút dọn dẹp log */}
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setIsCleanupModalOpen(true)}
            title="Dọn dẹp các bản ghi nhật ký cũ để giải phóng dung lượng"
          >
            <Trash2 size={14} />
            <span>Dọn dẹp</span>
          </button>
        </div>
      </div>

      {/* 2. CÁC THẺ THỐNG KÊ TỔNG QUAN (KPI CARDS) */}
      <div className="logs-stats-grid">
        <div className="log-kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <Layers size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Tổng lượt ghi nhật ký</span>
            <div className="kpi-value">{stats ? stats.total.toLocaleString('vi-VN') : totalCount}</div>
            <span className="kpi-desc">Dữ liệu thật lưu trong NoSQL</span>
          </div>
        </div>

        <div className="log-kpi-card log-kpi-error">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <AlertCircle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Lỗi hệ thống (Errors)</span>
            <div className="kpi-value" style={{ color: '#EF4444' }}>
              {stats ? stats.errorCount.toLocaleString('vi-VN') : 0}
            </div>
            <span className="kpi-desc">
              Tỷ lệ lỗi: <strong>{stats ? stats.errorRate : 0}%</strong>
            </span>
          </div>
        </div>

        <div className="log-kpi-card log-kpi-warn">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Cảnh báo (Warnings)</span>
            <div className="kpi-value" style={{ color: '#F59E0B' }}>
              {stats ? stats.warnCount.toLocaleString('vi-VN') : 0}
            </div>
            <span className="kpi-desc">Yêu cầu xem xét & giám sát</span>
          </div>
        </div>

        <div className="log-kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Hoạt động bình thường</span>
            <div className="kpi-value" style={{ color: '#10B981' }}>
              {stats ? (stats.infoCount + stats.successCount).toLocaleString('vi-VN') : 0}
            </div>
            <span className="kpi-desc">Thao tác tạo, sửa, truy vấn OK</span>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC ĐA CHIỀU & TÌM KIẾM THÔNG MINH */}
      <div className="logs-filter-panel panel">
        <div className="filter-row">
          {/* Ô tìm kiếm từ khóa */}
          <div className="filter-item search-box" style={{ flex: 1.5 }}>
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo thông điệp, mã lỗi, endpoint, IP, người dùng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="form-control"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lọc theo Phân hệ (Module) */}
          <div className="filter-item">
            <select
              className="form-control"
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả phân hệ (Module)</option>
              {Object.entries(MODULE_LABELS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Cấp độ (Level) */}
          <div className="filter-item">
            <select
              className="form-control"
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả mức độ (Level)</option>
              <option value="ERROR">Chỉ Lỗi (ERROR)</option>
              <option value="WARN">Cảnh báo (WARN)</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="INFO">Thông tin (INFO)</option>
            </select>
          </div>

          {/* Lọc theo Khoảng ngày */}
          <div className="filter-item">
            <select
              className="form-control"
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
          </div>

          {/* Checkbox lọc nhanh chỉ lỗi */}
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={hasErrorOnly}
              onChange={(e) => {
                setHasErrorOnly(e.target.checked);
                setPage(1);
              }}
            />
            <span style={{ color: hasErrorOnly ? '#EF4444' : 'inherit', fontWeight: hasErrorOnly ? 600 : 400 }}>
              Chỉ sự cố / Lỗi
            </span>
          </label>
        </div>
      </div>

      {/* 4. BẢNG HIỂN THỊ DANH SÁCH NHẬT KÝ CÓ CẤU TRÚC RÕ RÀNG */}
      <div className="panel logs-table-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <p>Đang tải dữ liệu nhật ký NoSQL từ máy chủ...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={44} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, color: 'var(--heading-color)', marginBottom: 6 }}>
              Không tìm thấy bản ghi nhật ký phù hợp
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto' }}>
              Hãy thử thay đổi từ khóa tìm kiếm, mở rộng khoảng thời gian hoặc chọn tất cả phân hệ để xem các hoạt động khác.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="logs-table">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>MỨC ĐỘ</th>
                  <th style={{ width: 170 }}>PHÂN HỆ</th>
                  <th style={{ width: 160 }}>THỜI GIAN</th>
                  <th>HÀNH ĐỘNG & THÔNG ĐIỆP</th>
                  <th style={{ width: 130 }}>TRẠNG THÁI</th>
                  <th style={{ width: 180 }}>TÁC NHÂN & IP</th>
                  <th style={{ width: 100, textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const modInfo = MODULE_LABELS[log.module] || { label: log.module, color: '#64748B' };
                  const isErr = log.level === 'ERROR';

                  return (
                    <tr
                      key={log._id}
                      className={`log-row ${isErr ? 'log-row-error' : ''}`}
                      onClick={() => {
                        setSelectedLog(log);
                        setActiveDetailTab('overview');
                      }}
                    >
                      {/* Cột 1: Mức độ */}
                      <td>{renderLevelBadge(log.level)}</td>

                      {/* Cột 2: Phân hệ */}
                      <td>
                        <span
                          className="log-module-tag"
                          style={{
                            borderColor: `${modInfo.color}40`,
                            backgroundColor: `${modInfo.color}15`,
                            color: modInfo.color
                          }}
                        >
                          {modInfo.label}
                        </span>
                      </td>

                      {/* Cột 3: Thời gian */}
                      <td>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-main)' }}>
                          {formatDateTime(log.createdAt)}
                        </div>
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

                      {/* Cột 5: Trạng thái HTTP & Thời gian xử lý */}
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
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--heading-color)' }}>
                          {log.username || 'Hệ thống'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {log.ipAddress || '127.0.0.1'}
                        </div>
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
                          title="Xem phân tích chi tiết bản ghi"
                        >
                          <span>Chi tiết</span>
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

        {/* Phân trang chuẩn */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Hiển thị <strong>{logs.length}</strong> / <strong>{totalCount}</strong> bản ghi nhật ký
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

      {/* 5. MODAL / DRAWER PHÂN TÍCH LOG TỪNG PHẦN (LOG INSPECTOR) */}
      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div
            className="log-inspector-modal panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 880, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}
          >
            {/* Modal Header */}
            <div className="inspector-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {renderLevelBadge(selectedLog.level)}
                <span
                  className="log-module-tag"
                  style={{
                    color: (MODULE_LABELS[selectedLog.module] || {}).color || '#64748B'
                  }}
                >
                  {(MODULE_LABELS[selectedLog.module] || {}).label || selectedLog.module}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading-color)' }}>
                  ID: {selectedLog._id}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => handleCopyJson(selectedLog)}
                  title="Sao chép toàn bộ bản ghi JSON"
                >
                  {isCopied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                </button>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setSelectedLog(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (Phân tích từng phần) */}
            <div className="inspector-nav-tabs">
              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('overview')}
              >
                <Info size={14} />
                <span>1. Tổng quan & Tác nhân</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'error' ? 'active' : ''} ${selectedLog.error ? 'has-error-tab' : ''}`}
                onClick={() => setActiveDetailTab('error')}
              >
                <AlertCircle size={14} />
                <span>2. Phân tích lỗi {selectedLog.error ? '(Có lỗi)' : ''}</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'context' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('context')}
              >
                <Globe size={14} />
                <span>3. Bối cảnh HTTP & Mạng</span>
              </button>

              <button
                type="button"
                className={`inspector-tab ${activeDetailTab === 'payload' ? 'active' : ''}`}
                onClick={() => setActiveDetailTab('payload')}
              >
                <Code size={14} />
                <span>4. Dữ liệu Payload & Biến động</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="inspector-body" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {/* TAB 1: TỔNG QUAN */}
              {activeDetailTab === 'overview' && (
                <div className="inspector-tab-content">
                  <div className="inspector-message-box">
                    <span className="box-label">Thông điệp chính (Message):</span>
                    <p className="box-text">{selectedLog.message}</p>
                  </div>

                  <div className="inspector-grid-props">
                    <div className="prop-item">
                      <span className="prop-name">Thời điểm ghi nhận:</span>
                      <span className="prop-val">{formatDateTime(selectedLog.createdAt)}</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Hành động hệ thống (Action):</span>
                      <span className="prop-val"><code>{selectedLog.action}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Mã phản hồi HTTP:</span>
                      <span className="prop-val">
                        {selectedLog.statusCode ? (
                          <span className={`log-status-pill status-${String(selectedLog.statusCode)[0]}xx`}>
                            {selectedLog.statusCode}
                          </span>
                        ) : 'N/A'}
                      </span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Thời gian thực thi:</span>
                      <span className="prop-val">{selectedLog.durationMs || 0} ms</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Tài nguyên tác động:</span>
                      <span className="prop-val">{selectedLog.resource || 'Toàn hệ thống'}</span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Người thực hiện:</span>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444', fontWeight: 600 }}>
                          <AlertCircle size={18} />
                          <span>Chi tiết lỗi kỹ thuật: {selectedLog.error.name || 'Exception'}</span>
                        </div>
                        <p style={{ marginTop: 8, fontSize: 14, color: '#F87171', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          {selectedLog.error.message || 'Không có thông báo lỗi cụ thể'}
                        </p>
                        {selectedLog.error.code && (
                          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            Mã lỗi (Error Code): <code>{selectedLog.error.code}</code>
                          </div>
                        )}
                      </div>

                      {selectedLog.error.stack && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                              Vết ngăn xếp thực thi (Call Stack Trace):
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
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={40} style={{ color: '#10B981', marginBottom: 12 }} />
                      <h4 style={{ color: 'var(--heading-color)', marginBottom: 4 }}>Không có lỗi phát sinh</h4>
                      <p style={{ fontSize: 13 }}>
                        Bản ghi này thực thi thành công mỹ mãn mà không gặp bất kỳ lỗi ngoại lệ (Exception) nào.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BỐI CẢNH HTTP & MẠNG */}
              {activeDetailTab === 'context' && (
                <div className="inspector-tab-content">
                  <div className="inspector-grid-props">
                    <div className="prop-item">
                      <span className="prop-name">Phương thức HTTP (Method):</span>
                      <span className="prop-val">
                        <span className={`method-badge method-${selectedLog.method || 'GET'}`}>
                          {selectedLog.method || 'GET'}
                        </span>
                      </span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Đường dẫn API (Path):</span>
                      <span className="prop-val"><code>{selectedLog.path || '—'}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Địa chỉ IP Client:</span>
                      <span className="prop-val"><code>{selectedLog.ipAddress || '127.0.0.1'}</code></span>
                    </div>

                    <div className="prop-item">
                      <span className="prop-name">Mã người dùng (User ID):</span>
                      <span className="prop-val"><code>{selectedLog.userId || 'system'}</code></span>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)', display: 'block', marginBottom: 6 }}>
                      Thông tin trình duyệt Client (User-Agent):
                    </span>
                    <div className="user-agent-box">
                      {selectedLog.userAgent || 'Không xác định / Gọi từ Server nội bộ'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DỮ LIỆU PAYLOAD & CHI TIẾT */}
              {activeDetailTab === 'payload' && (
                <div className="inspector-tab-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                      Dữ liệu tham số chi tiết (Details / Changed Payload):
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => handleCopyJson(selectedLog.details || {})}
                    >
                      <Copy size={12} />
                      <span>Sao chép Details JSON</span>
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Bản ghi được lưu trữ phân tán và bảo toàn trên NoSQL MongoDB cluster.
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                Đóng phân tích
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DỌN DẸP NHẬT KÝ (CLEANUP MODAL) */}
      {isCleanupModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCleanupModalOpen(false)}>
          <div
            className="modal-card panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, width: '90%' }}
          >
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Trash2 size={20} style={{ color: '#EF4444' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  Dọn dẹp nhật ký hệ thống
                </h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsCleanupModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Thao tác này sẽ xóa các bản ghi nhật ký cũ hơn khoảng thời gian chỉ định để giảm dung lượng lưu trữ trên CSDL NoSQL MongoDB.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Xóa các bản ghi cũ hơn:
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

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
              <input
                type="checkbox"
                checked={keepErrorsOnly}
                onChange={(e) => setKeepErrorsOnly(e.target.checked)}
              />
              <span>Giữ lại toàn bộ các bản ghi lỗi (ERROR) để đối soát sau này</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCleanupModalOpen(false)}
                disabled={cleaningUp}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleExecuteCleanup}
                disabled={cleaningUp}
              >
                {cleaningUp ? 'Đang dọn dẹp...' : 'Xác nhận xóa log cũ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
