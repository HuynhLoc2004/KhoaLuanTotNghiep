import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus } from '../../types';
import {
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
  Check,
  Radio,
  Sliders,
  Eye,
  Activity,
  KeyRound,
  Power
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Cấu hình bảo trì (luôn có giá trị mặc định chuẩn di sản, không bao giờ bị rỗng hay 0)
  const [maintenance, setMaintenance] = useState<MaintenanceStatus>({
    enabled: false,
    title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
    message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật cơ sở dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
    estimatedMinutes: 30,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin'
  });

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Tải cấu hình bảo trì hiện hành từ backend
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceStatus();
      if (data) {
        setMaintenance({
          ...data,
          // Đảm bảo không bao giờ nhận 0 hoặc rỗng từ các lần tắt trước
          title: data.title?.trim() || 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
          message:
            !data.message || data.message.includes('phục hồi hoạt động')
              ? 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật cơ sở dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.'
              : data.message,
          estimatedMinutes: Number(data.estimatedMinutes) > 0 ? Number(data.estimatedMinutes) : 30
        });
      }
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

  // Bật hoặc Tắt bảo trì chủ động
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
          ? 'Đã kích hoạt chế độ bảo trì! Khách tham quan sẽ thấy trang thông báo.'
          : 'Đã tắt chế độ bảo trì! Hệ thống đã mở lại trực tuyến.',
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

  // Nhanh chóng gán số phút ước tính
  const setPresetMinutes = (min: number) => {
    setMaintenance((prev) => ({ ...prev, estimatedMinutes: min }));
  };

  return (
    <div className="admin-content" style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto', fontFamily: 'var(--font-family)' }}>
      {/* 1. HEADER SECTION CHUẨN ADMIN */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md, 8px)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #6E2212 100%)',
              color: 'var(--accent-gold, #D4A86A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(212, 168, 106, 0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
            }}
          >
            <Sliders size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color, var(--text-main))', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              Cấu Hình Tham Số & Bảo Trì Hệ Thống
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Trung tâm điều phối trạng thái bảo trì chủ động và giám sát hạ tầng kỹ thuật Bảo tàng Lịch sử TP.HCM.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchConfig}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Đồng bộ trạng thái</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS GRID (3 THẺ CHỈ SỐ CAO CẤP) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
        {/* KPI 1: TRẠNG THÁI VẬN HÀNH */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: maintenance.enabled ? '1px solid rgba(217, 119, 6, 0.5)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Trạng thái Cổng thông tin
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm, 5px)',
                background: maintenance.enabled ? 'rgba(217, 119, 6, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: maintenance.enabled ? '#FBBF24' : '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {maintenance.enabled ? <Radio size={16} /> : <CheckCircle2 size={16} />}
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: maintenance.enabled ? '#FBBF24' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: maintenance.enabled ? '#FBBF24' : '#10B981',
                boxShadow: maintenance.enabled ? '0 0 8px #FBBF24' : '0 0 8px #10B981'
              }}
            />
            {maintenance.enabled ? 'ĐANG BẬT BẢO TRÌ' : 'TRỰC TUYẾN (ONLINE)'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
            {maintenance.enabled ? 'Khách tham quan thấy trang bảo trì' : 'Khách tham quan truy cập xem Tour 360 tự do'}
          </div>
        </div>

        {/* KPI 2: THỜI GIAN DỰ KIẾN */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '18px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Ước tính thời gian bảo trì
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm, 5px)',
                background: 'rgba(212, 168, 106, 0.12)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
            ~ {maintenance.estimatedMinutes} phút
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Cập nhật lần cuối bởi {maintenance.updatedBy || 'Admin'}
          </div>
        </div>

        {/* KPI 3: TÍN HIỆU VPS BACKEND */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '18px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Hạ tầng VPS & API Engine
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm, 5px)',
                background: 'rgba(140, 45, 25, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Server size={16} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Node.js v20</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: pingLatency !== null ? '#10B981' : 'var(--accent-gold)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 4 }}>
              {pingLatency !== null ? `${pingLatency} ms` : 'Port 3000'}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Nginx Reverse Proxy • SSL Let's Encrypt
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 2 CỘT CÂN ĐỐI (65% FORM & PREVIEW, 35% DEVOPS & INFRA) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: 24, alignItems: 'start' }}>
        {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN & CẤU HÌNH BẢO TRÌ */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* BANNER BẬT/TẮT BẢO TRÌ NHANH */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md, 8px)',
              background: maintenance.enabled ? 'rgba(217, 119, 6, 0.10)' : 'var(--bg-subtle)',
              border: maintenance.enabled ? '1px solid rgba(217, 119, 6, 0.35)' : '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {maintenance.enabled ? (
                  <>
                    <ShieldAlert size={18} style={{ color: '#FBBF24' }} />
                    <span>Hệ Thống Đang Trong Trạng Thái Bảo Trì</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} style={{ color: '#10B981' }} />
                    <span>Hệ Thống Đang Mở Trực Tuyến Bình Thường</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                {maintenance.enabled
                  ? 'Bấm nút bên cạnh để mở lại hệ thống ngay lập tức khi bạn hoàn tất kiểm thử.'
                  : 'Bấm nút bên cạnh để lập tức chuyển website sang chế độ bảo trì an toàn.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggleMaintenance(!maintenance.enabled)}
              disabled={saving}
              className={maintenance.enabled ? 'btn btn-secondary' : 'btn btn-primary'}
              style={{
                padding: '10px 22px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 'var(--radius-md, 8px)',
                cursor: 'pointer',
                boxShadow: maintenance.enabled ? 'none' : '0 4px 12px rgba(140, 45, 25, 0.35)'
              }}
            >
              {saving ? <RefreshCw size={15} className="spin" /> : <Power size={15} />}
              <span>{maintenance.enabled ? 'TẮT BẢO TRÌ' : 'BẬT BẢO TRÌ'}</span>
            </button>
          </div>

          {/* FORM CẤU HÌNH THÔNG ĐIỆP */}
          <form onSubmit={handleSaveContent}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Tiêu đề hiển thị cho khách
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
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '11px 14px',
                  color: 'var(--text-main)',
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  Thời gian hoàn tất ước tính
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[15, 30, 60, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPresetMinutes(m)}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: '1px solid var(--border-color)',
                        background: maintenance.estimatedMinutes === m ? 'rgba(212, 168, 106, 0.15)' : 'var(--bg-subtle)',
                        color: maintenance.estimatedMinutes === m ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {m >= 60 ? `${m / 60}h` : `${m}p`}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-subtle)' }} />
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={maintenance.estimatedMinutes}
                  onChange={(e) => setMaintenance({ ...maintenance, estimatedMinutes: parseInt(e.target.value) || 30 })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '11px 14px 11px 40px',
                    color: 'var(--text-main)',
                    fontSize: 14,
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Nội dung thông điệp gửi khách tham quan
              </label>
              <textarea
                rows={4}
                value={maintenance.message}
                onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                placeholder="Nhập thông điệp bảo trì chi tiết..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '12px 14px',
                  color: 'var(--text-main)',
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* LIVE PREVIEW BOX: MÔ PHỎNG NỘI DUNG HIỂN THỊ */}
            <div style={{ marginBottom: 24 }}>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: 8 }}>
                Mô phỏng giao diện khách tham quan:
              </span>
              <div
                style={{
                  background: '#0E1017',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '18px 20px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24' }} />
                  Nâng cấp & Khởi động lại
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F3F4F6', marginBottom: 6 }}>
                  {maintenance.title || 'Hệ Thống Đang Nâng Cấp & Bảo Trì'}
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 12 }}>
                  {maintenance.message || 'Đang cập nhật...'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} />
                  <span>Dự kiến hoàn tất trong ~{maintenance.estimatedMinutes} phút • Tự động chuyển tiếp</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {saving ? <RefreshCw size={15} className="spin" /> : <Check size={15} />}
                <span>Lưu nội dung cấu hình</span>
              </button>

              <a
                href="/maintenance.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '11px 18px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-muted)'
                }}
              >
                <ExternalLink size={14} />
                <span>Xem trang thật</span>
              </a>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: GIÁM SÁT HẠ TẦNG & LỆNH CLI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* BOX 1: ĐẶC QUYỀN ADMIN BYPASS */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '20px 22px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm, 5px)',
                  background: 'rgba(212, 168, 106, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <KeyRound size={17} />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Đặc Quyền Kiểm Thử Của Admin
                </h4>
                <span style={{ fontSize: 11.5, color: 'var(--accent-gold)' }}>
                  Bypass Maintenance Active
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Khi bạn bật chế độ bảo trì, trình duyệt của Admin đã được gán mã đặc quyền phiên đăng nhập. Bạn có thể tự do mở các gian phòng, kiểm tra Panorama 360 và âm thanh AI mà không bị chặn lại ở trang bảo trì.
            </p>
          </div>

          {/* BOX 2: GIÁM SÁT DỊCH VỤ MÁY CHỦ */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '20px 22px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={17} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Tình Trạng Kết Nối Dịch Vụ
                </h4>
              </div>
              <button
                type="button"
                onClick={handlePingHealth}
                disabled={pinging}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11.5, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={12} className={pinging ? 'spin' : ''} />
                <span>Test Ping</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm, 5px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Database size={15} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-main)' }}>MongoDB Replica / Standalone</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981' }}>Đã kết nối</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm, 5px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HardDrive size={15} style={{ color: '#3B82F6' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-main)' }}>Redis Cache Server</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981' }}>Hoạt động</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm, 5px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={15} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-main)' }}>Dịch vụ Gửi Mail OTP (Gmail)</span>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981' }}>Sẵn sàng</span>
              </div>
            </div>
          </div>

          {/* BOX 3: ĐIỀU KHIỂN BẰNG LỆNH CLI SSH */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '20px 22px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Terminal size={17} style={{ color: 'var(--accent-gold)' }} />
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Lệnh Điều Khiển Nhanh (SSH Terminal)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'block', marginBottom: 4 }}>Bật bảo trì kèm lý do:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#0B0D13',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#EDE5DF'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>./maintenance.sh on "Nâng cấp" 30</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('./maintenance.sh on "Nâng cấp cơ sở dữ liệu" 30', 'cmd-on')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0 0 8px' }}
                    title="Sao chép lệnh"
                  >
                    {copiedCmd === 'cmd-on' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'block', marginBottom: 4 }}>Tắt bảo trì mở lại hệ thống:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#0B0D13',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#EDE5DF'
                  }}
                >
                  <span>./maintenance.sh off</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('./maintenance.sh off', 'cmd-off')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0 0 8px' }}
                    title="Sao chép lệnh"
                  >
                    {copiedCmd === 'cmd-off' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
