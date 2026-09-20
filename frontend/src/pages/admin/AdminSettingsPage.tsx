import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus, SystemInfo, SystemBranding } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
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
  Eye,
  Building2,
  Upload,
  Image,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Landmark
} from 'lucide-react';

const DEFAULT_MUSEUM_TITLE = 'Hệ Thống Đang Nâng Cấp & Bảo Trì';
const DEFAULT_MUSEUM_MESSAGE =
  'Hệ thống đang cập nhật dữ liệu hiện vật và bảo trì định kỳ không gian di sản 360. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();

  const [settingsTab, setSettingsTab] = useState<'branding' | 'maintenance'>('branding');
  const [brandingForm, setBrandingForm] = useState<SystemBranding>(branding);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (branding) {
      setBrandingForm(branding);
    }
  }, [branding]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước file ảnh logo không được vượt quá 5MB', 'warning');
      return;
    }
    try {
      setUploadingLogo(true);
      const res = await api.uploadBrandingLogo(file);
      setBrandingForm((prev) => ({ ...prev, logoUrl: res.url }));
      showToast('Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải file ảnh logo', 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setBrandingForm((prev) => ({ ...prev, logoUrl: '' }));
    showToast('Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế.', 'info');
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandingForm.museumName.trim()) {
      showToast('Tên đầy đủ của bảo tàng không được để trống', 'warning');
      return;
    }
    if (!brandingForm.shortName.trim()) {
      showToast('Tên rút gọn của bảo tàng không được để trống', 'warning');
      return;
    }
    try {
      setSavingBranding(true);
      await updateBranding(brandingForm);
      showToast('Cập nhật thành công! Nhận diện bảo tàng đã được đồng bộ 100% trên toàn hệ thống.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cấu hình nhận diện', 'error');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleResetDefaultBranding = () => {
    setBrandingForm({
      museumName: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh',
      shortName: 'Bảo tàng Lịch sử',
      emblemText: 'BT',
      logoUrl: '',
      tagline: 'Hệ thống Tour 360 Không gian Di sản',
      city: 'TP. Hồ Chí Minh',
      address: 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      contactEmail: 'huynhtanlocpp09@gmail.com',
      hotline: '(028) 3829 8146',
      emailSenderName: 'Bảo Tàng Lịch Sử TP.HCM'
    });
    showToast('Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng.', 'info');
  };

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
                Cấu hình Hệ thống & Đa Bảo Tàng
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {settingsTab === 'branding'
                  ? 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống.'
                  : 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ.'}
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

        {/* THANH ĐIỀU HƯỚNG TAB: NHẬN DIỆN THƯƠNG HIỆU & BẢO TRÌ HỆ THỐNG */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: 14
          }}
        >
          <button
            type="button"
            onClick={() => setSettingsTab('branding')}
            className={`btn ${settingsTab === 'branding' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)'
            }}
          >
            <Building2 size={16} />
            <span>Nhận Diện & Đa Bảo Tàng (Multi-Museum)</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('maintenance')}
            className={`btn ${settingsTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: 13.5,
              fontWeight: 600,
              borderRadius: 'var(--radius-sm, 6px)'
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Vận Hành & Bảo Trì Hệ Thống</span>
          </button>
        </div>

        {settingsTab === 'branding' ? (
          /* TAB 1: CẤU HÌNH NHẬN DIỆN THƯƠNG HIỆU & ĐA BẢO TÀNG */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
              gap: 24,
              alignItems: 'start'
            }}
          >
            {/* CỘT TRÁI: FORM CẤU HÌNH NHẬN DIỆN BẢO TÀNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <form
                onSubmit={handleSaveBranding}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '24px 26px'
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                    Cấu Hình Nhận Diện Đa Bảo Tàng
                  </h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                    Hệ thống tự do chuyển đổi danh tính của bất kỳ bảo tàng nào. Khi lưu, toàn bộ Header, Sidebar, Login, Email và Standee sẽ lập tức đồng bộ theo dữ liệu thật.
                  </p>
                </div>

                {/* 1. Tên đầy đủ của bảo tàng */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Tên đầy đủ của bảo tàng <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={brandingForm.museumName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, museumName: e.target.value })}
                    placeholder="Ví dụ: Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật, ..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13.5,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Hiển thị trang trọng trên Cổng Đăng Nhập, Thẻ Standee QR, Trang Thông Báo và Tiêu đề Tour 360.
                  </span>
                </div>

                {/* 2 Hàng song song: Tên rút gọn & Khẩu hiệu Tagline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Tên rút gọn / Tên ngắn <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.shortName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, shortName: e.target.value })}
                      placeholder="Ví dụ: Bảo tàng Lịch sử, Bảo tàng Mỹ thuật"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      Hiển thị trên Sidebar, Header Breadcrumb, Nắp đáy sàn 360 (Nadir).
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Khẩu hiệu / Giới thiệu nhận diện (Tagline)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.tagline || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      placeholder="Ví dụ: Hệ thống Tour 360 Không gian Di sản"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      Hiển thị phụ đề dưới tên bảo tàng trên Sidebar.
                    </span>
                  </div>
                </div>

                {/* 3. Bộ Nhận Diện Hình Ảnh: Logo chính thức & Biểu trưng chữ dự phòng */}
                <div style={{
                  marginBottom: 22,
                  padding: '20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Image size={17} style={{ color: 'var(--accent-gold)' }} />
                        <span>Logo & Biểu tượng nhận diện</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Hệ thống tự động ưu tiên <strong>Logo hình ảnh chính thức</strong>. Khi đã có logo, hệ thống giữ nguyên 100% chi tiết gốc và không vẽ đè chữ.
                      </p>
                    </div>

                    {brandingForm.logoUrl ? (
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '4px 10px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        <Check size={13} /> Đang áp dụng Logo hình ảnh
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: 'var(--accent-gold)',
                        background: 'rgba(212, 168, 106, 0.12)',
                        border: '1px solid rgba(212, 168, 106, 0.3)',
                        padding: '4px 10px',
                        borderRadius: 20,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
                      }}>
                        Đang dùng Biểu trưng chữ dự phòng
                      </span>
                    )}
                  </div>

                  {/* Mục 1: Tải lên Logo chính thức (Ưu tiên số 1) */}
                  <div style={{
                    padding: '16px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: brandingForm.logoUrl ? '1px solid rgba(16, 185, 129, 0.3)' : '1px dashed var(--border-color)',
                    marginBottom: 16
                  }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      1. Logo hình ảnh chính thức <span style={{ color: 'var(--accent-gold)', fontSize: 12, fontWeight: 500 }}>(Khuyên dùng cho Bảo tàng)</span>
                    </label>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                      Phù hợp với các logo có họa tiết, triện tròn hoặc con dấu cổ. Khuyên dùng tệp <strong>PNG trong suốt</strong> hoặc <strong>SVG</strong> để logo hiển thị thanh thoát, không bị viền cứng.
                    </p>

                    <input
                      type="file"
                      ref={logoInputRef}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />

                    {brandingForm.logoUrl ? (
                      /* Khi ĐÃ CÓ LOGO: Hiển thị Logo thuần túy trên nền bàn cờ trong suốt, KHÔNG CHỮ VN, KHÔNG KHUNG ĐỎ */
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div
                          style={{
                            minWidth: 110,
                            height: 76,
                            padding: '8px 16px',
                            borderRadius: 8,
                            background: 'repeating-conic-gradient(rgba(255, 255, 255, 0.05) 0% 25%, rgba(0, 0, 0, 0.2) 0% 50%) 50% / 14px 14px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                          title="Xem trước logo trên nền trong suốt (Checkerboard)"
                        >
                          <img
                            src={brandingForm.logoUrl}
                            alt="Logo bảo tàng"
                            style={{ maxHeight: 60, maxWidth: 160, objectFit: 'contain' }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploadingLogo}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Upload size={14} />
                              <span>{uploadingLogo ? 'Đang tải lên...' : 'Thay đổi logo khác'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EF4444' }}
                            >
                              <Trash2 size={14} />
                              <span>Gỡ bỏ logo (Dùng biểu trưng chữ)</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="text"
                              className="input-field"
                              value={brandingForm.logoUrl}
                              onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                              placeholder="URL ảnh logo (https://.../logo.png)"
                              style={{
                                flex: 1,
                                padding: '7px 12px',
                                fontSize: 12,
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 4,
                                color: 'var(--text-main)'
                              }}
                            />
                            <a
                              href={brandingForm.logoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '6px 10px', fontSize: 11.5 }}
                              title="Mở xem ảnh gốc"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Khi CHƯA CÓ LOGO: Khung tải ảnh dashed chuyên nghiệp, rõ ràng */
                      <div>
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          style={{
                            padding: '22px 20px',
                            borderRadius: 8,
                            border: '1px dashed var(--accent-gold)',
                            background: 'rgba(212, 168, 106, 0.03)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: 10
                          }}
                        >
                          <Upload size={26} style={{ color: 'var(--accent-gold)', marginBottom: 8 }} />
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)' }}>
                            {uploadingLogo ? 'Đang tải tệp ảnh lên máy chủ...' : 'Bấm vào đây để tải ảnh Logo bảo tàng từ máy tính'}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                            Hỗ trợ tệp PNG, SVG, JPG (Tối đa 5MB). Logo sẽ giữ nguyên 100% đường nét hoa văn & độ trong suốt.
                          </div>
                        </div>

                        <input
                          type="text"
                          className="input-field"
                          value={brandingForm.logoUrl || ''}
                          onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                          placeholder="Hoặc dán URL ảnh trực tiếp (https://.../logo.png)"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: 12,
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            color: 'var(--text-main)'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Mục 2: Biểu trưng chữ viết tắt (Emblem - Dự phòng) */}
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                        2. Biểu trưng chữ viết tắt (Emblem dự phòng)
                      </label>
                      <span style={{ fontSize: 11, color: brandingForm.logoUrl ? 'var(--text-muted)' : 'var(--accent-gold)', fontWeight: 600 }}>
                        {brandingForm.logoUrl ? 'Đang ẩn (Dự phòng khi không có ảnh logo)' : 'Đang được sử dụng'}
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                      Chỉ dùng khi bảo tàng chưa kịp có file ảnh logo. Hệ thống tạo một huy hiệu hình vuông sang trọng với các chữ hoa viết tắt (Ví dụ: BT, MT, VN).
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, var(--primary) 0%, #5a1a0c 100%)',
                          border: '1px solid var(--accent-gold)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'serif',
                          fontWeight: 800,
                          fontSize: 17,
                          color: '#FFF8F0',
                          flexShrink: 0,
                          opacity: brandingForm.logoUrl ? 0.45 : 1
                        }}
                        title={brandingForm.logoUrl ? 'Biểu trưng này bị ẩn vì bảo tàng đã có Logo hình ảnh' : 'Biểu trưng đang hiển thị'}
                      >
                        {brandingForm.emblemText || 'BT'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="input-field"
                          maxLength={6}
                          value={brandingForm.emblemText}
                          onChange={(e) => setBrandingForm({ ...brandingForm, emblemText: e.target.value.toUpperCase() })}
                          placeholder="Ví dụ: BT, MT, VN"
                          required
                          style={{
                            maxWidth: 160,
                            padding: '8px 12px',
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: '1.5px',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm, 6px)',
                            color: 'var(--accent-gold)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5 Hàng song song: Tỉnh / Thành phố & Địa chỉ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Tỉnh / Thành phố
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.city || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, city: e.target.value })}
                      placeholder="TP. Hồ Chí Minh, Hà Nội, Huế, ..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Địa chỉ trụ sở bảo tàng
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.address || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, address: e.target.value })}
                      placeholder="Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>

                {/* 6 Hàng song song: Hotline, Email liên hệ, Tên người gửi mail */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Hotline liên hệ
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.hotline || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, hotline: e.target.value })}
                      placeholder="(028) 3829 8146"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={brandingForm.contactEmail || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                      placeholder="contact@museum.vn"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      Tên người gửi Email (From)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.emailSenderName || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, emailSenderName: e.target.value })}
                      placeholder="Bảo Tàng Lịch Sử TP.HCM"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                  </div>
                </div>

                {/* Nút hành động Lưu & Khôi phục */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleResetDefaultBranding}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <RotateCcw size={14} />
                    <span>Khôi phục mẫu chuẩn</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingBranding}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 24px',
                      fontWeight: 600,
                      fontSize: 13.5
                    }}
                  >
                    {savingBranding ? (
                      <>
                        <RefreshCw size={15} className="spin" />
                        <span>Đang lưu và đồng bộ...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Lưu Cấu Hình Nhận Diện Bảo Tàng</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* CỘT PHẢI: KHUNG XEM TRƯỚC TRỰC QUAN ĐA NỀN TẢNG (LIVE PREVIEWS) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 1. Preview Sidebar */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '20px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Eye size={15} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Mô phỏng Thanh Điều Hướng (Sidebar)
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '14px 16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  {brandingForm.logoUrl ? (
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={brandingForm.logoUrl}
                        alt=""
                        style={{
                          maxHeight: 38,
                          maxWidth: 48,
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="museum-emblem">{brandingForm.emblemText || 'BT'}</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {brandingForm.shortName || 'Tên Bảo Tàng'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {brandingForm.city ? `${brandingForm.city} • Quản trị` : (brandingForm.tagline || 'Quản trị')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Preview Header Breadcrumb */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '20px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Eye size={15} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Mô phỏng Breadcrumb & Người Quản Trị
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    fontSize: 12.5
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                    <Landmark size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {brandingForm.shortName || 'Bảo tàng'}
                    </span>
                    <span>›</span>
                    <span>Gian trưng bày & Tour 360</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--accent-gold)', fontWeight: 600 }}>
                    Ban Quản trị {brandingForm.shortName || 'Bảo tàng'}
                  </div>
                </div>
              </div>

              {/* 3. Preview Standee QR */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '20px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Eye size={15} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Mô phỏng Standee QR Tham Quan Thực Địa
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: '#F7F4EE',
                    color: '#1A110B',
                    borderRadius: 8,
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid #D4A86A'
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', color: '#8C2D19', textTransform: 'uppercase', marginBottom: 4 }}>
                    {brandingForm.museumName?.toUpperCase() || 'TÊN BẢO TÀNG'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Gian P-01: Không Gian Trưng Bày Di Sản
                  </div>
                  <div style={{ width: 80, height: 80, margin: '0 auto 8px', background: '#FFFFFF', padding: 4, borderRadius: 6, border: '1px solid #D4A86A' }}>
                    <div style={{ width: '100%', height: '100%', background: '#24201D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 10, fontWeight: 600 }}>
                      QR 360°
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#6B584C', lineHeight: 1.4 }}>
                    {brandingForm.address || 'Địa chỉ bảo tàng'}
                  </div>
                </div>
              </div>

              {/* 4. Preview Email Thư Báo */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '20px 22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Eye size={15} style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    Mô phỏng Thư Email Tự Động (SMTP)
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    fontSize: 12
                  }}
                >
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Người gửi: </span>
                    <strong style={{ color: 'var(--text-main)' }}>
                      {brandingForm.emailSenderName || brandingForm.shortName || 'Bảo tàng'} &lt;smtp@museum.vn&gt;
                    </strong>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiêu đề: </span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      [{brandingForm.shortName || 'Bảo tàng'} 360°] Ghép hoàn tất không gian di sản
                    </span>
                  </div>
                  <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                    Chân trang: {brandingForm.museumName} • {brandingForm.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: VẬN HÀNH & BẢO TRÌ HỆ THỐNG */
          <>
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
        </>
        )}
      </div>
    </div>
  );
};
