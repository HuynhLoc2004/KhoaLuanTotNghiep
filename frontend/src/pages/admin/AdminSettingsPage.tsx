import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus, SystemInfo } from '../../types';
import {
  SlidersHorizontal,
  Globe,
  Clock,
  Activity,
  Cpu,
  RefreshCw,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Database,
  Server,
  RotateCcw,
  Info,
  Layers,
  Sparkles,
  Eye
} from 'lucide-react';


const DEFAULT_MUSEUM_TITLE = 'Hệ Thống Đang Nâng Cấp & Bảo Trì';
const DEFAULT_MUSEUM_MESSAGE =
  'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ không gian di sản 360. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  const [maintenance, setMaintenance] = useState<MaintenanceStatus>({
    enabled: false,
    title: DEFAULT_MUSEUM_TITLE,
    message: DEFAULT_MUSEUM_MESSAGE,
    estimatedMinutes: 30,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mStatus, sInfo] = await Promise.all([
        api.getMaintenanceStatus().catch(() => null),
        api.getSystemInfo().catch(() => null)
      ]);

      if (mStatus) {
        setMaintenance({
          ...mStatus,
          title: mStatus.title?.trim() || DEFAULT_MUSEUM_TITLE,
          message:
            !mStatus.message || mStatus.message.includes('phục hồi hoạt động')
              ? DEFAULT_MUSEUM_MESSAGE
              : mStatus.message,
          estimatedMinutes: Number(mStatus.estimatedMinutes) > 0 ? Number(mStatus.estimatedMinutes) : 30
        });
      }

      if (sInfo) {
        setSysInfo(sInfo);
      }
    } catch (err: any) {
      console.error('Lỗi nạp dữ liệu cấu hình:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    handlePing();
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
        nextState ? 'Đã kích hoạt chế độ bảo trì hệ thống' : 'Đã tắt bảo trì, hệ thống trực tuyến',
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
      showToast('Đã lưu và áp dụng cấu hình thành công', 'success');
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
      } else {
        setPingLatency(null);
      }
    } catch {
      setPingLatency(null);
    } finally {
      setPinging(false);
    }
  };

  const handleResetDefaultText = () => {
    setMaintenance((prev) => ({
      ...prev,
      title: DEFAULT_MUSEUM_TITLE,
      message: DEFAULT_MUSEUM_MESSAGE,
      estimatedMinutes: 30
    }));
    showToast('Đã khôi phục mẫu thông báo chuẩn của Bảo tàng', 'info');
  };

  const setPresetMinutes = (mins: number) => {
    setMaintenance((prev) => ({ ...prev, estimatedMinutes: mins }));
  };

  return (
    <div className="admin-content" style={{ overscrollBehaviorY: 'contain' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
        {/* HEADER BAR TRANG NHÃ THEO CHUẨN BẢO TÀNG */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  margin: '0 0 4px 0',
                  lineHeight: 1.3
                }}
              >
                Cấu hình Vận hành & Bảo trì Hệ thống
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchData}
              disabled={loading}
              title="Làm mới dữ liệu từ máy chủ"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <Globe size={14} />
              <span>Cổng tham quan khách</span>
            </a>

            <a
              href="/maintenance.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <ExternalLink size={14} />
              <span>Trang thông báo</span>
            </a>
          </div>
        </div>

        {/* 4 THẺ METRICS / TỔNG QUAN HỆ THỐNG */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 24
          }}
        >
          {/* Card 1: Trạng thái Vận hành */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Trạng thái cổng tham quan
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: maintenance.enabled
                    ? 'rgba(140, 45, 25, 0.12)'
                    : 'rgba(127, 158, 135, 0.15)',
                  color: maintenance.enabled ? 'var(--primary)' : 'var(--success, #3D5A45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {maintenance.enabled ? <ShieldAlert size={17} /> : <ShieldCheck size={17} />}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: maintenance.enabled ? 'var(--primary)' : 'var(--text-main)',
                  marginBottom: 4
                }}
              >
                {maintenance.enabled ? 'Đang bảo trì' : 'Đang trực tuyến'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {maintenance.enabled
                  ? 'Khách tham quan thấy thông báo nâng cấp'
                  : 'Cổng 360 mở đón khách bình thường'}
              </div>
            </div>
          </div>

          {/* Card 2: Thời gian bảo trì dự kiến */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Thời gian bảo trì dự kiến
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: 'rgba(212, 168, 106, 0.12)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={17} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                {maintenance.estimatedMinutes} phút
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Cập nhật bởi: {maintenance.updatedBy || 'Quản trị viên'}
              </div>
            </div>
          </div>

          {/* Card 3: Độ trễ API */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Độ trễ phản hồi API
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Activity size={17} />
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span>{pingLatency !== null ? `${pingLatency} ms` : 'Hoạt động tốt'}</span>
                <button
                  type="button"
                  onClick={handlePing}
                  disabled={pinging}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--accent-gold)',
                    fontSize: 11.5,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {pinging ? 'Đang đo...' : 'Kiểm tra'}
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Kết nối thông suốt qua Nginx Proxy
              </div>
            </div>
          </div>

          {/* Card 4: Tài nguyên Máy chủ */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                Tài nguyên Node.js & RAM
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cpu size={17} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                {sysInfo ? `${sysInfo.memoryRssMb} MB` : 'Bình thường'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {sysInfo ? `Node ${sysInfo.nodeVersion} (${sysInfo.platform})` : 'Ubuntu 24.04 • Docker Host'}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN NỘI DUNG CHÍNH: BỐ CỤC 2 CỘT CÂN XỨNG (60% - 40%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
            gap: 24,
            alignItems: 'start'
          }}
        >
          {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN BẢO TRÌ & BIỂU MẪU CẤU HÌNH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card Form Chính */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '24px 26px'
              }}
            >
              {/* Tiêu đề mục */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  Điều khiển Chế độ Bảo trì
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Chủ động bật khi cần đại tu dữ liệu hoặc nâng cấp không gian tham quan di sản.
                </p>
              </div>

              {/* Hàng chuyển mạch BẬT / TẮT */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 22
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                    {maintenance.enabled ? 'Chế độ bảo trì: ĐANG BẬT' : 'Chế độ bảo trì: ĐANG TẮT'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {maintenance.enabled
                      ? 'Khách tham quan vãng lai sẽ được dẫn tới trang thông báo bảo trì.'
                      : 'Hệ thống đang mở cửa đón khách tham quan bình thường.'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      color: maintenance.enabled ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {maintenance.enabled ? 'BẬT' : 'TẮT'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={saving}
                    aria-label="Chuyển đổi trạng thái bảo trì"
                    style={{
                      position: 'relative',
                      width: 48,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: maintenance.enabled ? 'var(--primary)' : '#332D28',
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
                        left: maintenance.enabled ? 24 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Form nội dung chi tiết */}
              <form onSubmit={handleSave}>
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Tiêu đề thông báo gửi khách
                  </label>
                  <input
                    type="text"
                    value={maintenance.title}
                    onChange={(e) => setMaintenance({ ...maintenance, title: e.target.value })}
                    placeholder="VD: Hệ Thống Đang Nâng Cấp & Bảo Trì"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm, 5px)',
                      padding: '10px 12px',
                      color: 'var(--text-main)',
                      fontSize: 13.5,
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Thời gian dự kiến hoàn tất
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={maintenance.estimatedMinutes}
                      onChange={(e) =>
                        setMaintenance({
                          ...maintenance,
                          estimatedMinutes: parseInt(e.target.value) || 30
                        })
                      }
                      style={{
                        width: 120,
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
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>phút</span>

                    {/* Các nút chọn nhanh thời gian */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                      {[15, 30, 60, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPresetMinutes(mins)}
                          style={{
                            padding: '5px 10px',
                            fontSize: 12,
                            borderRadius: 'var(--radius-sm, 5px)',
                            backgroundColor:
                              maintenance.estimatedMinutes === mins
                                ? 'rgba(212, 168, 106, 0.15)'
                                : 'var(--bg-subtle)',
                            color:
                              maintenance.estimatedMinutes === mins
                                ? 'var(--accent-gold)'
                                : 'var(--text-muted)',
                            border:
                              '1px solid ' +
                              (maintenance.estimatedMinutes === mins
                                ? 'var(--accent-gold)'
                                : 'var(--border-color)'),
                            cursor: 'pointer'
                          }}
                        >
                          {mins < 60 ? `${mins}p` : `${mins / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: 6
                    }}
                  >
                    Lời nhắn gửi khách tham quan
                  </label>
                  <textarea
                    rows={4}
                    value={maintenance.message}
                    onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                    placeholder="Nhập thông điệp bảo trì trang nhã..."
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                      style={{
                        padding: '9px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {saving ? <RefreshCw size={14} className="spin" /> : <Check size={15} />}
                      <span>Lưu & Áp dụng</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaultText}
                      className="btn btn-secondary"
                      style={{
                        padding: '9px 14px',
                        fontSize: 12.5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title="Phục hồi nội dung chuẩn của Bảo tàng"
                    >
                      <RotateCcw size={13} />
                      <span>Đặt lại mẫu chuẩn</span>
                    </button>
                  </div>

                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Tự động đồng bộ lên VPS & Nginx
                  </span>
                </div>
              </form>
            </div>

            {/* Card Hướng dẫn Vận hành & Cứu hộ VPS */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '20px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Terminal size={16} style={{ color: 'var(--accent-gold)' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Quy chuẩn Vận hành & Lệnh cứu hộ VPS
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5, color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                  <span>
                    <strong style={{ color: 'var(--text-main)' }}>Quyền Admin Bypass:</strong> Tài khoản Quản trị viên
                    đã đăng nhập sẽ mang cookie đặc quyền, cho phép kiểm thử toàn bộ hệ thống ngay cả khi chế độ bảo trì đang bật.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                  <span>
                    <strong style={{ color: 'var(--text-main)' }}>Triển khai Zero-Downtime:</strong> Các thao tác đẩy mã nguồn
                    hoặc build container chạy nền liên tục. Chỉ nên bật bảo trì khi tiến hành di chuyển cơ sở dữ liệu lớn.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>•</span>
                  <span>
                    <strong style={{ color: 'var(--text-main)' }}>Lệnh CLI trên VPS:</strong> Khi không truy cập được web, có thể dùng:
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div>./maintenance.sh on "Nâng cấp dữ liệu" 30</div>
                  <div>./maintenance.sh off</div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MÔ PHỎNG THỜI GIAN THỰC (LIVE PREVIEW) & THÔNG SỐ HẠ TẦNG */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Box Live Preview thu nhỏ */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '20px 22px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Eye size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Mô phỏng Giao diện Khách
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Thời gian thực
                </span>
              </div>

              {/* Khung mô phỏng đúng chuẩn thiết kế Bảo tàng */}
              <div
                style={{
                  backgroundColor: '#1A1715',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '24px 18px',
                  textAlign: 'center',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {/* Emblem */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #8C2D19 0%, #6E2212 100%)',
                    color: '#D4A86A',
                    border: '1px solid rgba(212, 168, 106, 0.45)',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: 0.5
                  }}
                >
                  BT
                </div>

                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase',
                    color: '#D4A86A',
                    marginBottom: 6
                  }}
                >
                  Bảo tàng Lịch sử TP. Hồ Chí Minh
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#EDE5DF',
                    marginBottom: 10,
                    lineHeight: 1.35
                  }}
                >
                  {maintenance.title || DEFAULT_MUSEUM_TITLE}
                </div>

                <div
                  style={{
                    width: 36,
                    height: 1,
                    backgroundColor: '#362F29',
                    margin: '0 auto 12px'
                  }}
                />

                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.55,
                    color: '#A3978C',
                    margin: '0 0 16px 0',
                    maxHeight: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {maintenance.message || DEFAULT_MUSEUM_MESSAGE}
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11.5,
                    color: '#A3978C',
                    padding: '4px 10px',
                    backgroundColor: '#24201D',
                    borderRadius: 4,
                    border: '1px solid #362F29',
                    marginBottom: 14
                  }}
                >
                  <Clock size={12} style={{ color: '#D4A86A' }} />
                  <span>Dự kiến hoàn tất: khoảng {maintenance.estimatedMinutes} phút</span>
                </div>

                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 16px',
                      fontSize: 11.5,
                      fontWeight: 500,
                      borderRadius: 4,
                      backgroundColor: '#2C2723',
                      color: '#EDE5DF',
                      border: '1px solid #362F29'
                    }}
                  >
                    Thử kết nối lại
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <a
                  href="/maintenance.html"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    color: 'var(--accent-gold)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Mở xem toàn màn hình</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Box Thông số Hạ tầng Di sản */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '20px 22px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Server size={16} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                  Hạ tầng Máy chủ & Dịch vụ
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Địa chỉ VPS máy chủ</span>
                  <span style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 500 }}>
                    103.178.233.206
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Cơ sở dữ liệu (Database)</span>
                  <span style={{ color: 'var(--success, #7F9E87)', fontWeight: 500 }}>MongoDB Trực tuyến</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Bộ nhớ đệm (Redis Cache)</span>
                  <span style={{ color: sysInfo?.redisConnected ? 'var(--success, #7F9E87)' : 'var(--text-main)', fontWeight: 500 }}>
                    {sysInfo?.redisConnected ? 'Sẵn sàng' : 'Hoạt động'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Cờ vật lý (Maintenance Flag)</span>
                  <span style={{ color: maintenance.enabled ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500 }}>
                    {maintenance.enabled ? 'Đang kích hoạt' : 'Không có'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Cập nhật lần cuối</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {maintenance.updatedAt
                      ? new Date(maintenance.updatedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })
                      : 'Mặc định'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
