import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { MaintenanceStatus, SystemInfo, SystemBranding } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useMaintenance } from '../../context/MaintenanceContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
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
  Lock,
  Loader2,
  CheckCircle2,
  Bot,
  HardDrive,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AdminAIAssistantSettingsTab } from '../../components/admin/AdminAIAssistantSettingsTab';

const DEFAULT_MUSEUM_TITLE = 'Hệ Thống Đang Nâng Cấp & Bảo Trì';
const DEFAULT_MUSEUM_MESSAGE =
  'Hệ thống đang cập nhật dữ liệu hiện vật và bảo trì định kỳ không gian di sản 360. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.';

const formatUptime = (seconds?: number): string => {
  if (!seconds) return 'Vừa khởi động';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
};

const formatTime = (isoString?: string): string => {
  if (!isoString) return '--:--';
  try {
    return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();
  const { setLocalMaintenance } = useMaintenance();
  const { t } = useClientTranslation();

  const [settingsTab, setSettingsTab] = useState<'branding' | 'maintenance' | 'ai_assistant'>('branding');
  const [brandingForm, setBrandingForm] = useState<SystemBranding>(branding);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const lastToggleToastTime = useRef<number>(0);
  const [pinging, setPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [showSsdCleanupGuide, setShowSsdCleanupGuide] = useState<boolean>(false);
  const [copiedSsdCommand, setCopiedSsdCommand] = useState<boolean>(false);
  const [cleaningVpsDisk, setCleaningVpsDisk] = useState<boolean>(false);

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

  const handleCleanVpsDiskFromDashboard = async () => {
    if (!window.confirm('Hệ thống sẽ tiến hành dọn dẹp BuildKit Cache, các Docker image cũ không dùng, các container đã dừng và log rác MongoDB trên VPS. Bạn có muốn thực hiện ngay?')) {
      return;
    }
    setCleaningVpsDisk(true);
    try {
      const res = await api.cleanupVpsDisk();
      showToast(res.message || 'Dọn dẹp ổ cứng VPS thành công!', 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi dọn dẹp ổ cứng VPS', 'error');
    } finally {
      setCleaningVpsDisk(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const start = performance.now();
      const [mStatus, sInfo] = await Promise.all([
        api.getMaintenanceStatus().catch(() => null),
        api.getSystemInfo().catch(() => null),
        handlePing()
      ]);
      const latency = Math.round(performance.now() - start);

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
      showToast(`Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ: ${latency}ms)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi làm mới dữ liệu từ máy chủ', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    handlePing();
  }, []);

  const handleToggle = async () => {
    if (toggling || saving) return;
    const nextState = !maintenance.enabled;
    const nowIso = new Date().toISOString();
    const estMin = Number(maintenance.estimatedMinutes) || 30;
    const expEndIso = new Date(Date.now() + estMin * 60000).toISOString();

    try {
      setToggling(true);
      const updated = await api.updateMaintenanceStatus({
        ...maintenance,
        enabled: nextState,
        startTime: nowIso,
        expectedEndTime: expEndIso,
        remainingMinutes: nextState ? estMin : 0
      });
      setMaintenance(updated);
      setLocalMaintenance(updated);
      lastToggleToastTime.current = Date.now();
      showToast(
        nextState
          ? `Đã kích hoạt chế độ bảo trì (Dự kiến trong ${estMin} phút, đến ${formatTime(expEndIso)})`
          : 'Đã tắt bảo trì, hệ thống đang mở cửa đón khách tham quan',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật bảo trì', 'error');
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || toggling) return;

    const nowIso = new Date().toISOString();
    const estMin = Number(maintenance.estimatedMinutes) || 30;
    const expEndIso = new Date(Date.now() + estMin * 60000).toISOString();

    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus({
        ...maintenance,
        startTime: nowIso,
        expectedEndTime: expEndIso,
        remainingMinutes: maintenance.enabled ? estMin : 0
      });
      setMaintenance(updated);
      setLocalMaintenance(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      // Nếu vừa gạt toggle trong vòng 2.5s thì không bắn thêm toast thứ 2 để tránh 2 thông báo chồng nhau
      if (Date.now() - lastToggleToastTime.current > 2500) {
        showToast('Đã lưu và áp dụng cấu hình bảo trì thành công', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickExtend = async (addedMinutes: number) => {
    if (saving || toggling) return;
    const currentEst = Number(maintenance.estimatedMinutes) || 30;
    const newEst = currentEst + addedMinutes;
    const nowIso = new Date().toISOString();
    const expEndIso = new Date(Date.now() + newEst * 60000).toISOString();

    try {
      setSaving(true);
      const updated = await api.updateMaintenanceStatus({
        ...maintenance,
        enabled: true,
        estimatedMinutes: newEst,
        startTime: nowIso,
        expectedEndTime: expEndIso,
        remainingMinutes: newEst
      });
      setMaintenance(updated);
      setLocalMaintenance(updated);
      showToast(`Đã gia hạn thêm ${addedMinutes} phút bảo trì (Dự kiến đến ${formatTime(expEndIso)})`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi gia hạn bảo trì', 'error');
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
    <div className="admin-content settings-page-content">
      <div className="settings-container">
        {/* HEADER BAR TRANG NHÃ THEO CHUẨN BẢO TÀNG */}
        <div className="settings-header">
          <div className="settings-header-title-box">
            <div className="settings-header-icon">
              <SlidersHorizontal size={22} />
            </div>
            <div className="settings-header-text">
              <h1 className="settings-header-title">
                {t('settings.title', 'Cấu hình Hệ thống & Đa Bảo Tàng')}
              </h1>
              <p className="settings-header-desc">
                {settingsTab === 'branding'
                  ? t('settings.descBranding', 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống.')
                  : settingsTab === 'maintenance'
                    ? t('settings.descMaintenance', 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ.')
                    : 'Quản lý mô hình AI động, khóa API, lời nhắc và kiểm soát tốc độ cho Trợ lý Di sản Ảo.'}
              </p>
            </div>
          </div>

          <div className="settings-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              title={t('common.refresh', 'Làm mới')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <RefreshCw size={14} className={refreshing || loading ? 'spin' : ''} />
              <span>{refreshing ? t('common.refreshing', 'Đang làm mới...') : t('common.refresh', 'Làm mới')}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <Globe size={14} />
              <span>{t('settings.portal', 'Cổng tham quan')}</span>
            </a>

            <a
              href="/maintenance.html"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
            >
              <ExternalLink size={14} />
              <span>{t('settings.noticePage', 'Trang thông báo')}</span>
            </a>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG TAB: NHẬN DIỆN THƯƠNG HIỆU & BẢO TRÌ HỆ THỐNG */}
        <div className="settings-tab-nav">
          <button
            type="button"
            onClick={() => setSettingsTab('branding')}
            className={`btn settings-tab-btn ${settingsTab === 'branding' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Building2 size={16} />
            <span className="tab-label-desktop">{t('settings.tabBranding', 'Nhận Diện & Đa Bảo Tàng (Multi-Museum)')}</span>
            <span className="tab-label-short">{t('settings.tabBrandingShort', 'Nhận Diện Bảo Tàng')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('maintenance')}
            className={`btn settings-tab-btn ${settingsTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <SlidersHorizontal size={16} />
            <span className="tab-label-desktop">{t('settings.tabMaintenance', 'Vận Hành & Bảo Trì Hệ Thống')}</span>
            <span className="tab-label-short">{t('settings.tabMaintenanceShort', 'Vận Hành & Bảo Trì')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('ai_assistant')}
            className={`btn settings-tab-btn ${settingsTab === 'ai_assistant' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Bot size={16} />
            <span className="tab-label-desktop">Trợ Lý AI & Quản Lý Model</span>
            <span className="tab-label-short">Trợ Lý AI</span>
          </button>
        </div>

        {settingsTab === 'branding' ? (
          /* TAB 1: CẤU HÌNH NHẬN DIỆN THƯƠNG HIỆU & ĐA BẢO TÀNG */
          <div className="settings-main-grid">
            {/* CỘT TRÁI: FORM CẤU HÌNH NHẬN DIỆN BẢO TÀNG */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <form
                onSubmit={handleSaveBranding}
                className="settings-card"
              >
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                    {t('settings.cardBrandingTitle', 'Cấu Hình Nhận Diện Đa Bảo Tàng')}
                  </h2>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                    {t('settings.cardBrandingDesc', 'Hệ thống tự do chuyển đổi danh tính của bất kỳ bảo tàng nào. Khi lưu, toàn bộ Header, Sidebar, Login, Email và Standee sẽ lập tức đồng bộ theo dữ liệu thật.')}
                  </p>
                </div>

                {/* 1. Tên đầy đủ của bảo tàng */}
                <div className="settings-form-field">
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    {t('settings.museumName', 'Tên đầy đủ của bảo tàng')} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={brandingForm.museumName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, museumName: e.target.value })}
                    placeholder={t('settings.museumNamePlaceholder', 'Ví dụ: Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật, ...')}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      fontSize: 13.5,
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    {t('settings.museumNameDesc', 'Hiển thị trang trọng trên Cổng Đăng Nhập, Thẻ Standee QR, Trang Thông Báo và Tiêu đề Tour 360.')}
                  </span>
                </div>

                {/* 2 Hàng song song: Tên rút gọn & Khẩu hiệu Tagline */}
                <div className="settings-form-row-2col">
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      {t('settings.shortName', 'Tên rút gọn / Tên ngắn')} <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.shortName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, shortName: e.target.value })}
                      placeholder={t('settings.shortNamePlaceholder', 'Ví dụ: Bảo tàng Lịch sử, Bảo tàng Mỹ thuật')}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {t('settings.shortNameDesc', 'Hiển thị trên Sidebar, Header Breadcrumb, Nắp đáy sàn 360 (Nadir).')}
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      {t('settings.tagline', 'Khẩu hiệu / Giới thiệu nhận diện (Tagline)')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.tagline || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      placeholder={t('settings.taglinePlaceholder', 'Ví dụ: Hệ thống Tour 360 Không gian Di sản')}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        fontSize: 13.5,
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        color: 'var(--text-main)'
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {t('settings.taglineDesc', 'Hiển thị phụ đề dưới tên bảo tàng trên Sidebar.')}
                    </span>
                  </div>
                </div>

                {/* 3. Logo nhận diện thương hiệu */}
                <div className="settings-logo-section">
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                      {t('settings.logo', 'Logo nhận diện bảo tàng')}
                    </label>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {t('settings.logoDesc', 'Khuyên dùng tệp ảnh PNG trong suốt hoặc SVG để giữ trọn vẹn hoa văn, họa tiết cổ kính.')}
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
                    <div className="settings-logo-preview-row">
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

                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="btn btn-secondary btn-sm"
                          >
                            <span>{uploadingLogo ? t('settings.uploadingLogo', 'Đang tải lên...') : t('settings.changeLogo', 'Đổi ảnh logo')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#EF4444' }}
                          >
                            <span>{t('settings.removeLogo', 'Gỡ logo')}</span>
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
                          {uploadingLogo ? t('settings.uploadingLogoServer', 'Đang tải tệp ảnh lên máy chủ...') : t('settings.clickUploadLogo', 'Bấm vào đây để tải ảnh Logo từ máy tính')}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {t('settings.logoLimit', 'PNG, SVG, JPG (Tối đa 5MB)')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {t('settings.orEmblem', 'Hoặc ký tự viết tắt tạm thời:')}
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
                <div className="settings-form-row-city-addr">
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      {t('settings.city', 'Tỉnh / Thành phố')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.city || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, city: e.target.value })}
                      placeholder={t('settings.cityPlaceholder', 'TP. Hồ Chí Minh, Hà Nội, Huế, ...')}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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
                      {t('settings.headquartersAddress', 'Địa chỉ trụ sở bảo tàng')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.address || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, address: e.target.value })}
                      placeholder={t('settings.addressPlaceholder', 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh')}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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
                <div className="settings-form-row-3col">
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                      {t('settings.hotline', 'Hotline liên hệ')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.hotline || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, hotline: e.target.value })}
                      placeholder="(028) 3829 8146"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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
                      {t('settings.contactEmail', 'Email liên hệ')}
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={brandingForm.contactEmail || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                      placeholder="contact@museum.vn"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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
                      {t('settings.emailSenderFrom', 'Tên người gửi Email (From)')}
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={brandingForm.emailSenderName || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, emailSenderName: e.target.value })}
                      placeholder="Bảo Tàng Lịch Sử TP.HCM"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
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

                {/* Nút hành động Lưu */}
                <div className="settings-form-actions">

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
                        <span>{t('settings.savingBrandingBtn', 'Đang lưu và đồng bộ...')}</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{t('settings.saveBrandingBtn', 'Lưu Cấu Hình Nhận Diện Bảo Tàng')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* CỘT PHẢI: KHUNG XEM TRƯỚC TRỰC QUAN GỌN GÀNG (LIVE PREVIEW) */}
            <div className="settings-preview-col">
              <div className="settings-preview-card">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                    {t('settings.livePreview', 'Xem trước trực quan')}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {t('settings.livePreviewSub', 'Cập nhật đồng bộ theo dữ liệu bạn vừa nhập')}
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
                    {t('settings.previewNav', 'Thanh điều hướng & Breadcrumb')}
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
                        {brandingForm.shortName || t('settings.previewDefaultName', 'Tên Bảo Tàng')}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {brandingForm.city ? `${brandingForm.city} • ${t('settings.previewAdminLabel', 'Quản trị')}` : (brandingForm.tagline || t('settings.previewAdminLabel', 'Quản trị'))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, fontSize: 11 }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{brandingForm.shortName || t('settings.previewMuseumFallback', 'Bảo tàng')}</span>
                      <span> › Tour 360</span>
                    </div>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                      {t('settings.previewAdminBoard', 'Ban Quản trị')} {brandingForm.shortName || t('settings.previewMuseumFallback', 'Bảo tàng')}
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
                    {t('settings.previewStandee', 'Thẻ Standee QR Thực địa')}
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
                      {brandingForm.museumName?.toUpperCase() || t('settings.previewMuseumUpper', 'TÊN BẢO TÀNG')}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                      {t('settings.previewSampleRoom', 'Gian P-01: Không Gian Trưng Bày Di Sản')}
                    </div>
                    <div style={{ width: 68, height: 68, margin: '0 auto 8px', background: '#FFFFFF', padding: 4, borderRadius: 6, border: '1px solid #D4A86A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%', height: '100%', background: '#24201D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 9.5, fontWeight: 600, borderRadius: 4 }}>
                        {t('settings.previewQR', 'QR 360°')}
                      </div>
                    </div>
                    <div style={{ fontSize: 9.5, color: '#6B584C', lineHeight: 1.35 }}>
                      {brandingForm.address || t('settings.previewAddressFallback', 'Địa chỉ bảo tàng')}
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
                    {t('settings.previewEmail', 'Thư Email Tự Động (SMTP)')}
                  </div>
                  <div style={{ marginBottom: 3, color: 'var(--text-muted)' }}>
                    {t('settings.previewSender', 'Người gửi:')} <strong style={{ color: 'var(--text-main)' }}>{brandingForm.emailSenderName || brandingForm.shortName || t('settings.previewMuseumFallback', 'Bảo tàng')} &lt;smtp@museum.vn&gt;</strong>
                  </div>
                  <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
                    [{brandingForm.shortName || t('settings.previewMuseumFallback', 'Bảo tàng')} 360°] {t('settings.previewEmailSubject', 'Ghép hoàn tất không gian di sản')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : settingsTab === 'maintenance' ? (
          /* TAB 2: VẬN HÀNH & BẢO TRÌ HỆ THỐNG */
          <>
        {/* 4 THẺ METRICS / TỔNG QUAN HỆ THỐNG */}
        <div className="settings-metrics-grid">
          {/* Card 1: Trạng thái Vận hành Cổng Tham Quan */}
          <div className="settings-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('settings.metricPortal', 'Cổng tham quan Tour 360')}
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: maintenance.enabled ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                  color: maintenance.enabled ? '#EF4444' : '#22C55E',
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
                {maintenance.enabled ? t('settings.metricPortalClosed', 'Tạm dừng đón khách') : t('settings.metricPortalOpen', 'Mở cửa đón khách')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {maintenance.enabled
                  ? t('settings.metricPortalClosedDesc', 'Khách thấy thông báo bảo trì nâng cấp')
                  : t('settings.metricPortalOpenDesc', 'Sẵn sàng phục vụ khách tham quan')}
              </div>
            </div>
          </div>

          {/* Card 2: Thời gian bảo trì thực tế */}
          <div className="settings-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {maintenance.enabled ? t('settings.metricTimeRemaining', 'Thời gian bảo trì còn lại') : t('settings.metricTimeBackup', 'Thời gian bảo trì dự phòng')}
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
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {maintenance.enabled ? (
                  (maintenance.remainingMinutes !== undefined && maintenance.remainingMinutes <= 0) ? (
                    <span style={{ color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={16} /> Đã quá hạn (0p)
                    </span>
                  ) : (
                    <span>{`${maintenance.remainingMinutes ?? maintenance.estimatedMinutes} ${t('settings.minsRemaining', 'phút còn lại')}`}</span>
                  )
                ) : (
                  `${maintenance.estimatedMinutes} ${t('settings.minsBackup', 'phút (Dự phòng)')}`
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {maintenance.enabled
                  ? `${t('settings.startAt', 'Bắt đầu:')} ${formatTime(maintenance.startTime || maintenance.updatedAt)} • ${t('settings.expectedAt', 'Dự kiến:')} ${formatTime(maintenance.expectedEndTime)}`
                  : t('settings.systemOnline', 'Hệ thống đang mở cửa trực tuyến')}
              </div>
              {maintenance.enabled && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia hạn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(15)}
                    disabled={saving || toggling}
                    title="Gia hạn thêm 15 phút từ bây giờ"
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: 'var(--accent-gold)',
                      fontSize: 11,
                      cursor: saving || toggling ? 'wait' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    +15p
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(30)}
                    disabled={saving || toggling}
                    title="Gia hạn thêm 30 phút từ bây giờ"
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: 'var(--accent-gold)',
                      fontSize: 11,
                      cursor: saving || toggling ? 'wait' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    +30p
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(60)}
                    disabled={saving || toggling}
                    title="Gia hạn thêm 1 giờ từ bây giờ"
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      color: 'var(--accent-gold)',
                      fontSize: 11,
                      cursor: saving || toggling ? 'wait' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    +1 giờ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Hạ tầng Máy chủ (VPS) */}
          <div className="settings-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('settings.metricServer', 'Máy chủ hệ thống (VPS)')}
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(34, 197, 94, 0.12)',
                  color: sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade ? '#EF4444' : '#22C55E',
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
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: 4
                }}
              >
                {sysInfo?.hostMetrics
                  ? `RAM: ${sysInfo.hostMetrics.usedMemGb}/${sysInfo.hostMetrics.totalMemGb} GB (${sysInfo.hostMetrics.memUsagePercent}%)`
                  : sysInfo ? `RAM: ${sysInfo.memoryRssMb} MB` : t('settings.operatingStable', 'Vận hành ổn định')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {sysInfo?.hostMetrics
                  ? `CPU: ${sysInfo.hostMetrics.cpuCores} vCPU (${sysInfo.hostMetrics.cpuUsagePercent}%) • Ổ SSD: ${sysInfo.hostMetrics.diskUsedGb}/${sysInfo.hostMetrics.diskTotalGb} GB`
                  : sysInfo?.uptimeSeconds
                    ? `Uptime: ${formatUptime(sysInfo.uptimeSeconds)} • Ping ${pingLatency !== null ? `${pingLatency}ms` : '<10ms'}`
                    : `${t('settings.vpsAddressLabel', 'Tên miền / IP:')} ${sysInfo?.publicIp || 'museumhcm.duckdns.org'}`}
              </div>
            </div>
          </div>

          {/* Card 4: Dữ liệu di sản */}
          <div className="settings-metric-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>
                {t('settings.metricDatabase', 'Cơ sở dữ liệu di sản (MongoDB)')}
              </span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
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
                {sysInfo?.database?.connected ? t('settings.dbSynced', 'Đồng bộ trực tuyến') : t('settings.dbChecking', 'Đang kiểm tra...')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {sysInfo?.database
                  ? `${sysInfo.database.roomsCount} ${t('settings.roomsWord', 'gian phòng')} • ${sysInfo.database.panoramasCount} ${t('settings.panosWord', 'ảnh 360°')} (Ping ${sysInfo.database.pingMs}ms)`
                  : t('settings.dbAllData', 'Toàn bộ dữ liệu gian phòng & hiện vật')}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN NỘI DUNG CHÍNH: BỐ CỤC 2 CỘT CÂN XỨNG (60% - 40%) */}
        <div className="settings-main-grid">
          {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN BẢO TRÌ & BIỂU MẪU CẤU HÌNH */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Card Form Chính */}
            <div className="settings-card">
              {/* Tiêu đề mục */}
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                  {t('settings.controlTitle', 'Điều khiển Chế độ Bảo trì')}
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  {t('settings.controlDesc', 'Chủ động bật khi cần đại tu dữ liệu hoặc nâng cấp không gian tham quan di sản.')}
                </p>
              </div>

              {/* Hàng chuyển mạch BẬT / TẮT */}
              <div className="settings-maintenance-toggle-row">
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{maintenance.enabled ? t('settings.modeOn', 'Chế độ bảo trì: ĐANG BẬT') : t('settings.modeOff', 'Chế độ bảo trì: ĐANG TẮT')}</span>
                    {toggling && (
                      <span style={{ fontSize: 12, color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                        <Loader2 size={13} className="spin" /> Đang cập nhật máy chủ...
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {maintenance.enabled
                      ? t('settings.modeOnDesc', 'Khách tham quan vãng lai sẽ được dẫn tới trang thông báo bảo trì.')
                      : t('settings.modeOffDesc', 'Hệ thống đang mở cửa đón khách tham quan bình thường.')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      color: toggling ? 'var(--accent-gold)' : maintenance.enabled ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {toggling ? 'ĐANG LƯU...' : maintenance.enabled ? t('settings.badgeOn', 'BẬT') : t('settings.badgeOff', 'TẮT')}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggle}
                    disabled={saving || toggling}
                    aria-label="Chuyển đổi trạng thái bảo trì"
                    title={maintenance.enabled ? 'Bấm để tắt bảo trì' : 'Bấm để bật bảo trì'}
                    style={{
                      position: 'relative',
                      width: 52,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: maintenance.enabled ? 'var(--primary)' : '#332D28',
                      border: '1px solid ' + (maintenance.enabled ? 'var(--primary)' : 'var(--border-color)'),
                      cursor: saving || toggling ? 'wait' : 'pointer',
                      transition: 'all 0.2s ease',
                      padding: 0,
                      opacity: toggling ? 0.8 : 1
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: maintenance.enabled ? 27 : 3,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {toggling && <Loader2 size={12} className="spin" style={{ color: 'var(--primary)' }} />}
                    </span>
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
                    {t('settings.labelNoticeTitle', 'Tiêu đề thông báo gửi khách')}
                  </label>
                  <input
                    type="text"
                    value={maintenance.title}
                    onChange={(e) => setMaintenance({ ...maintenance, title: e.target.value })}
                    placeholder={t('settings.noticePlaceholder', 'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì')}
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
                    {t('settings.labelEstTime', 'Thời gian dự kiến hoàn tất')}
                  </label>
                  <div className="settings-presets-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                          width: 110,
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
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('settings.unitMins', 'phút')}</span>
                    </div>

                    {/* Các nút chọn nhanh thời gian */}
                    <div className="settings-presets-buttons">
                      {[15, 30, 60, 120].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setPresetMinutes(mins)}
                          style={{
                            padding: '6px 12px',
                            fontSize: 12,
                            borderRadius: 'var(--radius-sm, 5px)',
                            backgroundColor:
                              maintenance.estimatedMinutes === mins
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'var(--bg-subtle)',
                            color:
                              maintenance.estimatedMinutes === mins
                                ? 'var(--text-main)'
                                : 'var(--text-muted)',
                            border:
                              '1px solid ' +
                              (maintenance.estimatedMinutes === mins
                                ? 'rgba(255, 255, 255, 0.28)'
                                : 'var(--border-color)'),
                            cursor: 'pointer'
                          }}
                        >
                          {mins < 60 ? `${mins}p` : `${mins / 60}h`}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--accent-gold)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={13} />
                      <span>
                        Dự kiến hoàn tất nếu áp dụng bây giờ: khoảng{' '}
                        <strong>
                          {new Date(Date.now() + (Number(maintenance.estimatedMinutes) || 30) * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </span>
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
                    {t('settings.labelMessage', 'Lời nhắn gửi khách tham quan')}
                  </label>
                  <textarea
                    rows={4}
                    value={maintenance.message}
                    onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
                    placeholder={t('settings.messagePlaceholder', 'Nhập thông điệp bảo trì trang nhã...')}
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

                <div className="settings-form-actions">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="submit"
                      className={`btn ${saveSuccess ? 'btn-success' : 'btn-primary'}`}
                      disabled={saving || toggling}
                      style={{
                        padding: '9px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: saveSuccess ? '#16A34A' : undefined,
                        borderColor: saveSuccess ? '#16A34A' : undefined,
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="spin" />
                          <span>Đang lưu & áp dụng...</span>
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Đã áp dụng thành công!</span>
                        </>
                      ) : (
                        <>
                          <Check size={15} />
                          <span>{t('settings.btnSaveApply', 'Lưu & Áp dụng')}</span>
                        </>
                      )}
                    </button>

                  </div>

                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {t('settings.syncVPS', 'Tự động đồng bộ lên VPS & Nginx')}
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* CỘT PHẢI: MÔ PHỎNG THỜI GIAN THỰC (LIVE PREVIEW) & THÔNG SỐ HẠ TẦNG */}
          <div className="settings-preview-col">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Box Live Preview thu nhỏ */}
              <div className="settings-card" style={{ padding: '20px 22px' }}>
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
                      {t('settings.previewGuest', 'Mô phỏng Giao diện Khách')}
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
                    {t('settings.realtime', 'Thời gian thực')}
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
                    {branding.museumName?.toUpperCase() || t('settings.previewMuseumUpper', 'BẢO TÀNG')}
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
                    <span>
                      {maintenance.enabled
                        ? `${t('settings.expectedCompleteRemaining', 'Dự kiến hoàn tất: còn khoảng')} ${maintenance.remainingMinutes ?? maintenance.estimatedMinutes} ${t('settings.unitMins', 'phút')}`
                        : `${t('settings.expectedComplete', 'Dự kiến hoàn tất: khoảng')} ${maintenance.estimatedMinutes} ${t('settings.unitMins', 'phút')}`}
                    </span>
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
                      {t('settings.retryConnect', 'Thử kết nối lại')}
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
                    <span>{t('settings.viewFullscreen', 'Mở xem toàn màn hình')}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Kết thúc Cột Phải (Live Preview) */}
            </div>
          </div>
        </div>

        {/* PHẦN HẠ TẦNG & TÀI NGUYÊN HỆ THỐNG: BỐ CỤC 2 CỘT CÂN ĐỐI (50% - 50%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, marginTop: 20 }}>
          {/* Box 1: Tài nguyên Máy chủ VPS */}
          <div className="settings-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={15} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                  Tài nguyên Máy chủ (VPS)
                </span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(34, 197, 94, 0.1)',
                  color: sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade ? '#EF4444' : '#22C55E',
                  fontWeight: 500
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    backgroundColor: sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade ? '#EF4444' : '#22C55E'
                  }}
                />
                {sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade ? 'Cần lưu ý' : 'Bình thường'}
              </span>
            </div>

            {/* 3 Thanh đo tài nguyên */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* RAM */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Layers size={12} />
                    <span>Bộ nhớ RAM</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {sysInfo?.hostMetrics
                      ? `${sysInfo.hostMetrics.usedMemGb} / ${sysInfo.hostMetrics.totalMemGb} GB (${sysInfo.hostMetrics.memUsagePercent}%)`
                      : sysInfo ? `${sysInfo.memoryRssMb} MB` : '—'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 5, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(5, sysInfo?.hostMetrics?.memUsagePercent || 25))}%`,
                      backgroundColor: (sysInfo?.hostMetrics?.memUsagePercent || 0) > 85
                        ? '#EF4444'
                        : (sysInfo?.hostMetrics?.memUsagePercent || 0) > 70
                          ? '#F59E0B'
                          : 'var(--accent-gold, #D4A86A)',
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  <span>Trống: {sysInfo?.hostMetrics?.freeMemGb ? `${sysInfo.hostMetrics.freeMemGb} GB` : '—'}</span>
                  <span>Node.js: {sysInfo?.memoryRssMb || 0} MB</span>
                </div>
              </div>

              {/* CPU */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Cpu size={12} />
                    <span>Bộ vi xử lý vCPU</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {sysInfo?.hostMetrics
                      ? `${sysInfo.hostMetrics.cpuCores} Cores (${sysInfo.hostMetrics.cpuUsagePercent}% tải)`
                      : '—'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 5, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(5, sysInfo?.hostMetrics?.cpuUsagePercent || 15))}%`,
                      backgroundColor: (sysInfo?.hostMetrics?.cpuUsagePercent || 0) > 85
                        ? '#EF4444'
                        : (sysInfo?.hostMetrics?.cpuUsagePercent || 0) > 70
                          ? '#F59E0B'
                          : 'var(--accent-gold, #D4A86A)',
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sysInfo?.hostMetrics?.cpuModel || 'vCPU Standard'}
                </div>
              </div>

              {/* DISK */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <HardDrive size={12} />
                    <span>Ổ cứng SSD</span>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {sysInfo?.hostMetrics
                      ? `${sysInfo.hostMetrics.diskUsedGb} / ${sysInfo.hostMetrics.diskTotalGb} GB (${sysInfo.hostMetrics.diskUsagePercent}%)`
                      : '—'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 5, backgroundColor: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(5, sysInfo?.hostMetrics?.diskUsagePercent || 30))}%`,
                      backgroundColor: (sysInfo?.hostMetrics?.diskUsagePercent || 0) > 85
                        ? '#EF4444'
                        : (sysInfo?.hostMetrics?.diskUsagePercent || 0) > 70
                          ? '#F59E0B'
                          : 'var(--accent-gold, #D4A86A)',
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  <span>Trống: {sysInfo?.hostMetrics?.diskFreeGb ? `${sysInfo.hostMetrics.diskFreeGb} GB` : '—'}</span>
                  <span>Phân vùng: Root (/)</span>
                </div>
              </div>
            </div>

            {/* Khuyến nghị ngắn gọn (chỉ hiển thị khi có đề xuất) */}
            {sysInfo?.hostMetrics?.smartAdvisory?.needsUpgrade && sysInfo.hostMetrics.smartAdvisory.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '10px 12px',
                  marginTop: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        Khuyến nghị: Mở rộng {rec.componentName}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, marginLeft: 6 }}>
                        ({rec.currentValue} → Đề xuất: {rec.recommendedValue})
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {rec.component === 'DISK' && (
                      <button
                        type="button"
                        onClick={handleCleanVpsDiskFromDashboard}
                        disabled={cleaningVpsDisk}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#EF4444',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 4,
                          cursor: cleaningVpsDisk ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {cleaningVpsDisk ? <Loader2 size={11} className="spin" /> : <Trash2 size={11} />}
                        <span>{cleaningVpsDisk ? 'Đang dọn...' : 'Dọn SSD từ Dashboard'}</span>
                      </button>
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 3,
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#EF4444',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {rec.neededAmount}
                    </span>
                  </div>
                </div>

                {/* Hướng dẫn dọn dẹp SSD an toàn */}
                {rec.component === 'DISK' && (
                  <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px dashed rgba(239, 68, 68, 0.2)' }}>
                    <button
                      type="button"
                      onClick={() => setShowSsdCleanupGuide(!showSsdCleanupGuide)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-gold, #D4A86A)',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{showSsdCleanupGuide ? 'Thu gọn đề xuất dọn dẹp' : '💡 Đề xuất các mục cần xóa để giải phóng SSD (Không tốn tiền nâng cấp)'}</span>
                      {showSsdCleanupGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {showSsdCleanupGuide && (
                      <div style={{
                        marginTop: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        padding: '12px 14px'
                      }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 8 }}>
                          Các mục chiếm dung lượng lớn có thể xóa an toàn trên VPS:
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, color: 'var(--text-main)', lineHeight: 1.45 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>•</span>
                            <div>
                              <strong>1. Docker Build Cache & Images cũ (Ước tính: ~12 - 20 GB):</strong><br />
                              <span style={{ color: 'var(--text-muted)' }}>Mỗi lần build lại tạo ra các layer cache thừa. Xóa mục này hoàn toàn an toàn, không ảnh hưởng container đang chạy.</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>•</span>
                            <div>
                              <strong>2. Nhật ký hệ điều hành Systemd Journal (Ước tính: ~2 - 4 GB):</strong><br />
                              <span style={{ color: 'var(--text-muted)' }}>Log hệ điều hành Ubuntu tích tụ lâu ngày, có thể thu gọn về 100MB.</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>•</span>
                            <div>
                              <strong>3. Bộ nhớ đệm gói cài đặt APT (Ước tính: ~1 - 2 GB):</strong><br />
                              <span style={{ color: 'var(--text-muted)' }}>Các file cài đặt .deb tạm của hệ điều hành.</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>•</span>
                            <div>
                              <strong>4. Nhật ký bot dò quét MongoDB (Ước tính: ~0.5 - 2 GB):</strong><br />
                              <span style={{ color: 'var(--text-muted)' }}>Vào menu <em>Nhật ký & Giám sát</em> → bấm <em>Lưu trữ & Dọn dẹp</em> để nén đóng gói và dọn dẹp các truy vấn rác.</span>
                            </div>
                          </div>
                        </div>

                        {/* Thao tác dọn dẹp 1-chạm & Nút bấm Dashboard */}
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            <div>
                              <span style={{ fontSize: 11.5, color: 'var(--heading-color)', fontWeight: 600, display: 'block' }}>
                                Thao tác dọn dẹp trực tiếp từ Dashboard:
                              </span>
                              <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                                Hệ thống tự động kích hoạt dọn BuildKit Cache, Docker image rác và log rác MongoDB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCleanVpsDiskFromDashboard}
                              disabled={cleaningVpsDisk}
                              style={{
                                background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                                border: 'none',
                                borderRadius: 5,
                                color: '#FFF',
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '6px 14px',
                                cursor: cleaningVpsDisk ? 'wait' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
                              }}
                            >
                              {cleaningVpsDisk ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}
                              <span>{cleaningVpsDisk ? 'Đang dọn dẹp VPS...' : '🚀 Dọn dẹp ổ cứng VPS ngay từ Dashboard'}</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                              Hoặc chạy lệnh thủ công trên terminal VPS:
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('docker system prune -f && docker builder prune -a -f && journalctl --vacuum-size=100M && apt clean && apt autoremove -y');
                                setCopiedSsdCommand(true);
                                setTimeout(() => setCopiedSsdCommand(false), 2500);
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 4,
                                color: copiedSsdCommand ? '#22C55E' : 'var(--text-main)',
                                fontSize: 10.5,
                                padding: '2px 8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              {copiedSsdCommand ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedSsdCommand ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
                            </button>
                          </div>
                          <code style={{
                            display: 'block',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            padding: '6px 8px',
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontFamily: 'monospace',
                            color: '#FBBF24',
                            wordBreak: 'break-all'
                          }}>
                            docker system prune -f && docker builder prune -a -f && journalctl --vacuum-size=100M && apt clean && apt autoremove -y
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Box 2: Thông số Hạ tầng Dịch vụ */}
          <div className="settings-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={15} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                  {t('settings.serverInfra', 'Dịch vụ & Kết nối Hạ tầng')}
                </span>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#22C55E',
                  fontWeight: 500
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                Trực tuyến
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 12 }}>
              {/* Tên miền & Máy chủ */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>{t('settings.vpsAddress', 'Tên miền & Máy chủ')}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 600, fontSize: 11.5 }}>
                    {sysInfo?.publicIp && sysInfo.publicIp !== '103.178.233.206' ? `${sysInfo.publicIp} (103.178.233.206)` : 'museumhcm.duckdns.org (103.178.233.206)'}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    Uptime: {formatUptime(sysInfo?.uptimeSeconds)}
                  </span>
                </div>
              </div>

              {/* MongoDB */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>{t('settings.heritageDb', 'CSDL Di sản (MongoDB)')}</span>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: sysInfo?.database?.connected ? 'var(--text-main)' : '#EF4444'
                    }}
                  >
                    {sysInfo?.database?.connected ? `MongoDB (${sysInfo.database.name})` : t('settings.dbDisconnected', 'Mất kết nối')}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    {sysInfo?.database
                      ? `${sysInfo.database.roomsCount} phòng • ${sysInfo.database.panoramasCount} ảnh 360° (${sysInfo.database.pingMs}ms)`
                      : 'Đang kết nối'}
                  </span>
                </div>
              </div>

              {/* PostgreSQL */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>CSDL Quan hệ (PostgreSQL)</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    PostgreSQL 16 (Online)
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    Kiểm toán, Phân quyền & Users
                  </span>
                </div>
              </div>

              {/* Redis Cache */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>Bộ nhớ đệm (Redis)</span>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: sysInfo?.redis?.connected ? 'var(--text-main)' : 'var(--text-muted)'
                    }}
                  >
                    {sysInfo?.redis?.connected ? t('settings.redisOnline', 'Redis Cache trực tuyến') : t('settings.redisFallback', 'Bộ nhớ cục bộ (Fallback)')}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    {sysInfo?.redis?.connected
                      ? `${sysInfo.redis.keysCount} keys • Ping: ${sysInfo.redis.pingMs}ms`
                      : t('settings.noRedis', 'Không có Redis')}
                  </span>
                </div>
              </div>

              {/* RabbitMQ */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>Message Broker (RabbitMQ)</span>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: sysInfo?.rabbitmq?.connected ? 'var(--text-main)' : 'var(--text-muted)'
                    }}
                  >
                    {sysInfo?.rabbitmq?.connected ? 'RabbitMQ AMQP (Trực tuyến)' : 'Fallback Redis'}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    {sysInfo?.rabbitmq?.connected ? 'Cổng: 5672 • UI: 15672' : 'Tác vụ nền'}
                  </span>
                </div>
              </div>

              {/* Hàng đợi xử lý */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>{t('settings.queueProcessing', 'Hàng đợi xử lý')}</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    {sysInfo?.queue?.status === 'processing' ? t('settings.queueActive', 'Đang xử lý') : t('settings.queueReady', 'Sẵn sàng tiếp nhận')}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                    {sysInfo?.queue ? `${sysInfo.queue.pendingJobs} tác vụ trong hàng đợi ghép 360°` : 'Stitching Queue'}
                  </span>
                </div>
              </div>

              {/* Trạng thái cổng 360 */}
              <div className="settings-telemetry-row">
                <span style={{ color: 'var(--text-muted)' }}>{t('settings.portalStatus', 'Trạng thái cổng 360')}</span>
                <span
                  style={{
                    color: maintenance.enabled ? '#F59E0B' : '#22C55E',
                    fontWeight: 600
                  }}
                >
                  {maintenance.enabled ? t('settings.portalPaused', 'Đang tạm dừng bảo trì') : t('settings.portalOpen', 'Đang mở cửa tham quan')}
                </span>
              </div>

              {/* Cập nhật lần cuối */}
              <div className="settings-telemetry-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('settings.lastUpdate', 'Cập nhật lần cuối')}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>
                  {new Date().toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })} (Trực tiếp)
                </span>
              </div>
            </div>
          </div>
        </div>
        </>
        ) : (
          /* TAB 3: TRỢ LÝ AI & QUẢN TRỊ MODEL ĐỘNG */
          <AdminAIAssistantSettingsTab />
        )}
      </div>
    </div>
  );
};
