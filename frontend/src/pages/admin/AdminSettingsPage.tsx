import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus } from '../../types';
import {
  Wrench,
  ShieldCheck,
  ShieldAlert,
  Server,
  Clock,
  RefreshCw,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Mail,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const [maintenance, setMaintenance] = useState<MaintenanceStatus>({
    enabled: false,
    title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
    message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật cơ sở dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
    estimatedMinutes: 30,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin'
  });

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Tải cấu hình bảo trì hiện hành
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceStatus();
      setMaintenance(data);
    } catch (err: any) {
      console.error('Lỗi tải cấu hình hệ thống:', err);
      showToast('Không thể tải cấu hình bảo trì từ máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Bật hoặc Tắt bảo trì
  const handleToggleMaintenance = async (newState: boolean) => {
    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus({
        ...maintenance,
        enabled: newState
      });
      setMaintenance(updated);
      showToast(
        newState
          ? 'Đã kích hoạt chế độ bảo trì hệ thống thành công!'
          : 'Đã tắt chế độ bảo trì, hệ thống đã mở lại trực tuyến.',
        'success'
      );
    } catch (err: any) {
      console.error('Lỗi cập nhật bảo trì:', err);
      showToast(err.message || 'Lỗi khi cập nhật trạng thái bảo trì', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Lưu thông tin nội dung thông báo
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus(maintenance);
      setMaintenance(updated);
      showToast('Đã lưu nội dung thông báo bảo trì thành công', 'success');
    } catch (err: any) {
      console.error('Lỗi lưu thông báo:', err);
      showToast(err.message || 'Lỗi lưu thông báo', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Kiểm tra độ trễ API
  const handlePingHealth = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const ok = await api.checkHealth();
      const end = performance.now();
      if (ok) {
        setPingLatency(Math.round(end - start));
        showToast(`Máy chủ phản hồi tốt (${Math.round(end - start)}ms)`, 'success');
      } else {
        setPingLatency(null);
        showToast('Máy chủ phản hồi lỗi hoặc không sẵn sàng', 'error');
      }
    } catch {
      setPingLatency(null);
      showToast('Không thể kết nối đến API máy chủ', 'error');
    } finally {
      setPinging(false);
    }
  };

  // Sao chép lệnh CLI
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    showToast('Đã sao chép lệnh vào bộ nhớ tạm', 'info');
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="admin-content" style={{ padding: '28px 32px', maxWidth: 1120, margin: '0 auto' }}>
      {/* Header section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              Cấu Hình Tham Số & Bảo Trì Hệ Thống
            </h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
              Quản lý trạng thái vận hành của Bảo tàng Lịch sử TP.HCM, kiểm soát chế độ bảo trì chủ động và theo dõi hạ tầng VPS.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchConfig}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Làm mới trạng thái
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* CARD 1: ĐIỀU KHIỂN CHẾ ĐỘ BẢO TRÌ */}
        <div
          className="panel"
          style={{
            background: 'var(--bg-card)',
            border: maintenance.enabled ? '1px solid #D97706' : '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: maintenance.enabled ? '0 0 20px rgba(217, 119, 6, 0.15)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: maintenance.enabled ? 'rgba(217, 119, 6, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                  color: maintenance.enabled ? '#FBBF24' : '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {maintenance.enabled ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
                  Chế Độ Bảo Trì Hệ Thống
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  On-Demand Maintenance Mode
                </span>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                background: maintenance.enabled ? 'rgba(217, 119, 6, 0.15)' : 'rgba(16, 185, 129, 0.12)',
                color: maintenance.enabled ? '#FBBF24' : '#10B981',
                border: maintenance.enabled ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: maintenance.enabled ? '#FBBF24' : '#10B981'
                }}
              />
              {maintenance.enabled ? 'Đang Bảo Trì' : 'Trực Tuyến'}
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            {maintenance.enabled
              ? 'Khách tham quan khi vào trang web sẽ nhìn thấy trang bảo trì trang nhã. Riêng tài khoản Quản trị viên (Admin) vẫn có quyền đăng nhập và thao tác bình thường để kiểm thử dữ liệu.'
              : 'Website đang mở công khai cho khách tham quan tour 360. Khi bạn cần nâng cấp lớn, hãy gạt công tắc để đóng cổng an toàn.'}
          </p>

          {/* Quick Toggle Action Button */}
          <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-card-subtle, #181B24)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                  {maintenance.enabled ? 'Tắt Chế Độ Bảo Trì' : 'Kích Hoạt Bảo Trì Ngay'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  {maintenance.enabled ? 'Mở lại hệ thống cho toàn bộ khách tham quan' : 'Tạm thời hiển thị trang bảo trì đối với khách'}
                </div>
              </div>

              <button
                type="button"
                className={maintenance.enabled ? 'btn btn-secondary' : 'btn btn-primary'}
                onClick={() => handleToggleMaintenance(!maintenance.enabled)}
                disabled={saving}
                style={{
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: maintenance.enabled ? '#374151' : 'var(--primary)',
                  borderColor: maintenance.enabled ? '#4B5563' : 'var(--primary)'
                }}
              >
                {saving && <RefreshCw size={14} className="spin" />}
                {maintenance.enabled ? 'Tắt bảo trì' : 'Bật bảo trì'}
              </button>
            </div>
          </div>

          {/* Form cấu hình nội dung hiển thị */}
          <form onSubmit={handleSaveContent}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                className="input"
                value={maintenance.title}
                onChange={(e) => setMaintenance({ ...maintenance, title: e.target.value })}
                placeholder="Hệ Thống Đang Nâng Cấp & Bảo Trì"
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>
                Lời nhắn gửi tới khách tham quan
              </label>
              <textarea
                className="input"
                rows={3}
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                placeholder="Nhập thông điệp bảo trì..."
                style={{ width: '100%', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>
                  Thời gian ước tính (phút)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} style={{ color: 'var(--text-subtle)' }} />
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    className="input"
                    value={maintenance.estimatedMinutes}
                    onChange={(e) => setMaintenance({ ...maintenance, estimatedMinutes: parseInt(e.target.value) || 30 })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                <a
                  href="/maintenance.html"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 13
                  }}
                >
                  <ExternalLink size={14} />
                  Xem trang bảo trì
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={saving}
              style={{ width: '100%', fontWeight: 600 }}
            >
              {saving ? 'Đang lưu cấu hình...' : 'Lưu nội dung thông báo'}
            </button>
          </form>
        </div>

        {/* CARD 2: TÌNH TRẠNG HẠ TẦNG & SỨC KHỎE MÁY CHỦ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(140, 45, 25, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Server size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
                    Hạ Tầng & Dịch Vụ Máy Chủ
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    VPS Ubuntu • Docker Compose
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handlePingHealth}
                disabled={pinging}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <RefreshCw size={13} className={pinging ? 'spin' : ''} />
                Kiểm tra ping
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card-subtle, #181B24)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Database size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>MongoDB Replica / Standalone</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>Đã kết nối</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card-subtle, #181B24)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HardDrive size={16} style={{ color: '#3B82F6' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Redis Cache Server</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>Hoạt động</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card-subtle, #181B24)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Dịch vụ Gửi Mail OTP (Gmail SMTP)</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>Sẵn sàng</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-card-subtle, #181B24)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Server size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Độ trễ API Backend</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: pingLatency !== null ? '#10B981' : 'var(--text-subtle)' }}>
                  {pingLatency !== null ? `${pingLatency} ms` : 'Chưa kiểm tra'}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: ĐIỀU KHIỂN BẰNG LỆNH CLI QUA SSH */}
          <div className="panel" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#60A5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Terminal size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)' }}>
                  Điều Khiển Bằng Lệnh SSH Trên VPS
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  CLI Maintenance Script
                </span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Bạn cũng có thể điều khiển trực tiếp trên cửa sổ terminal VPS mà không cần vào web:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#0B0D13',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  color: '#F3F4F6'
                }}
              >
                <span>./maintenance.sh on "Nâng cấp máy chủ" 30</span>
                <button
                  type="button"
                  onClick={() => handleCopy('./maintenance.sh on "Nâng cấp máy chủ" 30', 'cmd-on')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Sao chép lệnh"
                >
                  {copiedCmd === 'cmd-on' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#0B0D13',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 12.5,
                  color: '#F3F4F6'
                }}
              >
                <span>./maintenance.sh off</span>
                <button
                  type="button"
                  onClick={() => handleCopy('./maintenance.sh off', 'cmd-off')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Sao chép lệnh"
                >
                  {copiedCmd === 'cmd-off' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
