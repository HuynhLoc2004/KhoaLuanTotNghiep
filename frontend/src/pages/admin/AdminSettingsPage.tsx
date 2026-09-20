import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus } from '../../types';
import { RefreshCw, ExternalLink, Check, Server } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const [maintenance, setMaintenance] = useState<MaintenanceStatus>({
    enabled: false,
    title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
    message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
    estimatedMinutes: 30,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin'
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceStatus();
      if (data) {
        setMaintenance({
          ...data,
          title: data.title?.trim() || 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
          message:
            !data.message || data.message.includes('phục hồi hoạt động')
              ? 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.'
              : data.message,
          estimatedMinutes: Number(data.estimatedMinutes) > 0 ? Number(data.estimatedMinutes) : 30
        });
      }
    } catch (err: any) {
      console.error('Lỗi tải cấu hình:', err);
      showToast('Không thể tải cấu hình bảo trì', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggle = async () => {
    const nextState = !maintenance.enabled;
    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus({
        ...maintenance,
        enabled: nextState
      });
      setMaintenance(updated);
      showToast(
        nextState ? 'Đã bật chế độ bảo trì' : 'Đã tắt bảo trì, hệ thống trực tuyến',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật bảo trì', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus(maintenance);
      setMaintenance(updated);
      showToast('Đã lưu cấu hình thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const ok = await api.checkHealth();
      const end = performance.now();
      if (ok) {
        setPingLatency(Math.round(end - start));
        showToast(`Máy chủ ổn định (${Math.round(end - start)}ms)`, 'success');
      } else {
        setPingLatency(null);
        showToast('Máy chủ phản hồi lỗi', 'error');
      }
    } catch {
      setPingLatency(null);
      showToast('Mất kết nối máy chủ', 'error');
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="admin-content" style={{ padding: '24px 32px' }}>
      <div style={{ maxWidth: 640 }}>
        {/* Header đơn giản, đúng quy tắc */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Cấu hình hệ thống
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Quản lý chế độ bảo trì và thông báo gửi đến khách tham quan
          </p>
        </div>

        {/* Khối cấu hình chính duy nhất */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '20px 24px'
          }}
        >
          {/* Hàng 1: Nút gạt Bật/Tắt bảo trì */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 18,
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                Chế độ bảo trì
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                {maintenance.enabled
                  ? 'Đang bật: Khách tham quan sẽ thấy trang thông báo'
                  : 'Đang tắt: Khách truy cập bình thường'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: maintenance.enabled ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {maintenance.enabled ? 'BẬT' : 'TẮT'}
              </span>
              <button
                type="button"
                onClick={handleToggle}
                disabled={saving}
                aria-label="Bật tắt bảo trì"
                style={{
                  position: 'relative',
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: maintenance.enabled ? 'var(--primary)' : 'var(--bg-subtle)',
                  border: '1px solid ' + (maintenance.enabled ? 'var(--primary)' : 'var(--border-color)'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: maintenance.enabled ? 22 : 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Hàng 2: Form nội dung */}
          <form onSubmit={handleSave} style={{ paddingTop: 18 }}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  marginBottom: 6
                }}
              >
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                value={maintenance.title}
                onChange={(e) => setMaintenance({ ...maintenance, title: e.target.value })}
                placeholder="Hệ Thống Đang Nâng Cấp & Bảo Trì"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm, 5px)',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: 13.5,
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  marginBottom: 6
                }}
              >
                Thời gian ước tính (phút)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={maintenance.estimatedMinutes}
                onChange={(e) =>
                  setMaintenance({ ...maintenance, estimatedMinutes: parseInt(e.target.value) || 30 })
                }
                style={{
                  width: 140,
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm, 5px)',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: 13.5,
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  marginBottom: 6
                }}
              >
                Lời nhắn gửi khách tham quan
              </label>
              <textarea
                rows={3}
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                placeholder="Nhập thông điệp bảo trì..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm, 5px)',
                  padding: '10px 12px',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {saving ? <RefreshCw size={13} className="spin" /> : <Check size={14} />}
                <span>Lưu cấu hình</span>
              </button>

              <a
                href="/maintenance.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '8px 14px',
                  fontSize: 12.5,
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: 'var(--text-muted)'
                }}
              >
                <ExternalLink size={13} />
                <span>Xem trang bảo trì</span>
              </a>
            </div>
          </form>
        </div>

        {/* Thanh trạng thái máy chủ nhỏ gọn phía dưới */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            fontSize: 12,
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#10B981'
              }}
            />
            <span>Máy chủ API: Trực tuyến</span>
            {pingLatency !== null && (
              <span style={{ color: 'var(--text-muted)', opacity: 0.8 }}>({pingLatency}ms)</span>
            )}
          </div>

          <button
            type="button"
            onClick={handlePing}
            disabled={pinging}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11.5,
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {pinging ? 'Đang kiểm tra...' : 'Kiểm tra độ trễ'}
          </button>
        </div>
      </div>
    </div>
  );
};
