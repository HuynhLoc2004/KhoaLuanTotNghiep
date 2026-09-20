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
  Landmark,
  Lock
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

                {/* 3. Logo nhận diện thương hiệu */}
                <div style={{
                  marginBottom: 22,
                  padding: '18px 20px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                      Logo nhận diện bảo tàng
                    </label>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Khuyên dùng tệp ảnh PNG trong suốt hoặc SVG để giữ trọn vẹn hoa văn, họa tiết cổ kính.
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />

                  {brandingForm.logoUrl ? (
                    /* Khi đã có logo: Hiển thị logo và các nút thao tác gọn gàng, không màu mè */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: 130,
                          height: 68,
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={brandingForm.logoUrl}
                          alt="Logo bảo tàng"
                          style={{ maxHeight: '100%', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="btn btn-secondary btn-sm"
                          >
                            <span>{uploadingLogo ? 'Đang tải lên...' : 'Đổi ảnh logo'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#EF4444' }}
                          >
                            <span>Gỡ logo</span>
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
                              padding: '6px 10px',
                              fontSize: 12,
                              backgroundColor: 'var(--bg-subtle)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 4,
                              color: 'var(--text-main)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Khi chưa có logo: Khung tải ảnh + ô nhập ký tự viết tắt đại diện */
                    <div>
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 6,
                          border: '1px dashed var(--border-color)',
                          background: 'var(--bg-subtle)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          marginBottom: 12
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          {uploadingLogo ? 'Đang tải tệp ảnh lên máy chủ...' : 'Bấm vào đây để tải ảnh Logo từ máy tính'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          PNG, SVG, JPG (Tối đa 5MB)
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Hoặc ký tự viết tắt tạm thời:
                        </span>
                        <input
                          type="text"
                          className="input-field"
                          maxLength={6}
                          value={brandingForm.emblemText}
                          onChange={(e) => setBrandingForm({ ...brandingForm, emblemText: e.target.value.toUpperCase() })}
                          placeholder="BT, VN, MT"
                          style={{
                            width: 90,
                            padding: '6px 10px',
                            fontSize: 12.5,
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            color: 'var(--accent-gold)'
                          }}
                        />
                      </div>
                    </div>
                  )}
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

            {/* CỘT PHẢI: KHUNG XEM TRƯỚC TRỰC QUAN GỌN GÀNG (LIVE PREVIEW) */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'sticky',
                  top: 20
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                    Xem trước trực quan
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Cập nhật đồng bộ theo dữ liệu bạn vừa nhập
                  </div>
                </div>

                {/* Khung 1: Thanh điều hướng & Breadcrumb Quản trị */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                    Thanh điều hướng & Breadcrumb
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                    {brandingForm.logoUrl ? (
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                        <img
                          src={brandingForm.logoUrl}
                          alt=""
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="museum-emblem">{brandingForm.emblemText || 'BT'}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {brandingForm.shortName || 'Tên Bảo Tàng'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {brandingForm.city ? `${brandingForm.city} • Quản trị` : (brandingForm.tagline || 'Quản trị')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, fontSize: 11 }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{brandingForm.shortName || 'Bảo tàng'}</span>
                      <span> › Tour 360</span>
                    </div>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      Ban Quản trị {brandingForm.shortName || 'Bảo tàng'}
                    </div>
                  </div>
                </div>

                {/* Khung 2: Thẻ Standee QR Thực địa */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                    Thẻ Standee QR Thực địa
                  </div>

                  <div
                    style={{
                      backgroundColor: '#F7F4EE',
                      color: '#1A110B',
                      borderRadius: 8,
                      padding: '14px 12px',
                      textAlign: 'center',
                      border: '1px solid #D4A86A'
                    }}
                  >
                    {brandingForm.logoUrl && (
                      <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center', height: 32, alignItems: 'center' }}>
                        <img
                          src={brandingForm.logoUrl}
                          alt=""
                          style={{ maxHeight: 28, maxWidth: 110, objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.8px', color: '#8C2D19', textTransform: 'uppercase', marginBottom: 3 }}>
                      {brandingForm.museumName?.toUpperCase() || 'TÊN BẢO TÀNG'}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                      Gian P-01: Không Gian Trưng Bày Di Sản
                    </div>
                    <div style={{ width: 68, height: 68, margin: '0 auto 8px', background: '#FFFFFF', padding: 4, borderRadius: 6, border: '1px solid #D4A86A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%', height: '100%', background: '#24201D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 9.5, fontWeight: 600, borderRadius: 4 }}>
                        QR 360°
                      </div>
                    </div>
                    <div style={{ fontSize: 9.5, color: '#6B584C', lineHeight: 1.35 }}>
                      {brandingForm.address || 'Địa chỉ bảo tàng'}
                    </div>
                  </div>
                </div>

                {/* Khung 3: Thư Email Tự Động */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    border: '1px solid var(--border-color)',
                    fontSize: 11
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
                    Thư Email Tự Động (SMTP)
                  </div>
                  <div style={{ marginBottom: 3, color: 'var(--text-muted)' }}>
                    Người gửi: <strong style={{ color: 'var(--text-main)' }}>{brandingForm.emailSenderName || brandingForm.shortName || 'Bảo tàng'} &lt;smtp@museum.vn&gt;</strong>
                  </div>
                  <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                    [{brandingForm.shortName || 'Bảo tàng'} 360°] Ghép hoàn tất không gian di sản
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
          {/* Card 1: Trạng thái Vận hành Cổng Tham Quan */}
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
                Cổng tham quan Tour 360
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
                {maintenance.enabled ? <ShieldAlert size={17} /> : <ShieldCheck size={17} />}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: 4
                }}
              >
                {maintenance.enabled ? 'Tạm dừng đón khách' : 'Mở cửa đón khách'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {maintenance.enabled
                  ? 'Khách thấy thông báo bảo trì nâng cấp'
                  : 'Sẵn sàng phục vụ khách tham quan'}
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
                Thời gian dự kiến
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
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                {maintenance.estimatedMinutes} phút
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Ước tính cho du khách tham quan
              </div>
            </div>
          </div>

          {/* Card 3: Hạ tầng Máy chủ */}
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
                Máy chủ hệ thống
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
                <Server size={17} />
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: 4
                }}
              >
                Vận hành ổn định
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Địa chỉ VPS: 103.178.233.206
              </div>
            </div>
          </div>

          {/* Card 4: Dữ liệu di sản */}
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
                Cơ sở dữ liệu di sản
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
                <Database size={17} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                Đồng bộ trực tuyến
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Toàn bộ dữ liệu gian phòng & hiện vật
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
                {branding.logoUrl ? (
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={branding.logoUrl}
                      alt=""
                      style={{ maxHeight: 42, maxWidth: 100, objectFit: 'contain' }}
                    />
                  </div>
                ) : (
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
                    {branding.emblemText || 'BT'}
                  </div>
                )}

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
                  {branding.museumName?.toUpperCase() || 'BẢO TÀNG'}
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
                  <span style={{ color: 'var(--text-muted)' }}>Địa chỉ máy chủ (VPS)</span>
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
                  <span style={{ color: 'var(--text-muted)' }}>Cơ sở dữ liệu di sản</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Kết nối trực tuyến</span>
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
                  <span style={{ color: 'var(--text-muted)' }}>Bộ nhớ tăng tốc (Cache)</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Hoạt động ổn định</span>
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
                  <span style={{ color: 'var(--text-muted)' }}>Trạng thái cổng 360</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>
                    {maintenance.enabled ? 'Đang tạm dừng bảo trì' : 'Đang mở cửa tham quan'}
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
