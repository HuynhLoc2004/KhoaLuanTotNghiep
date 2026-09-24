import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { SystemBranding } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import {
  LayoutTemplate,
  Globe,
  Save,
  RefreshCw,
  RotateCcw,
  Upload,
  Image,
  Video,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building2,
  Compass,
  Box,
  Eye,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { HOMEPAGE_SECTIONS } from '../../constants/homepageSections';

interface AdminHomepageCMSPageProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export const AdminHomepageCMSPage: React.FC<AdminHomepageCMSPageProps> = ({
  activeSection,
  onSectionChange
}) => {
  const { showToast } = useToast();
  const { branding, updateBranding, refreshBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [form, setForm] = useState<SystemBranding>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(activeSection || 'panel-menu');

  // Quản lý upload file
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeroBanner, setUploadingHeroBanner] = useState(false);
  const [uploadingIntroImage, setUploadingIntroImage] = useState(false);
  const [uploadingGuideMap, setUploadingGuideMap] = useState(false);
  const [analyzingFloorPlan, setAnalyzingFloorPlan] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<{ nodeCount: number; edgeCount: number; dimensions?: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroBannerInputRef = useRef<HTMLInputElement>(null);
  const introImageInputRef = useRef<HTMLInputElement>(null);
  const guideMapInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (branding) {
      setForm(branding);
    }
  }, [branding]);

  useEffect(() => {
    if (activeSection && activeSection !== activeSectionId) {
      setActiveSectionId(activeSection);
    }
  }, [activeSection]);

  const selectSection = (id: string) => {
    setActiveSectionId(id);
    if (onSectionChange) {
      onSectionChange(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cập nhật giá trị một trường
  const handleChange = (field: keyof SystemBranding, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý upload ảnh Logo
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh logo không được vượt quá 5MB', 'warning');
      return;
    }
    try {
      setUploadingLogo(true);
      const res = await api.uploadBrandingLogo(file);
      handleChange('logoUrl', res.url);
      showToast('Đã tải ảnh logo lên thành công! Nhớ nhấn "Lưu thay đổi" để áp dụng.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải file ảnh logo', 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Xử lý upload ảnh Banner Hero
  const handleUploadHeroBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('Kích thước ảnh banner không được vượt quá 20MB', 'warning');
      return;
    }
    try {
      setUploadingHeroBanner(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('heroBannerUrl', res.url);
      showToast('Đã tải ảnh banner Hero thành công! Nhớ nhấn "Lưu thay đổi" để áp dụng.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải file ảnh banner', 'error');
    } finally {
      setUploadingHeroBanner(false);
      if (heroBannerInputRef.current) heroBannerInputRef.current.value = '';
    }
  };

  // Xử lý upload ảnh kiến trúc Intro
  const handleUploadIntroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('Kích thước ảnh kiến trúc không được vượt quá 15MB', 'warning');
      return;
    }
    try {
      setUploadingIntroImage(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('introImageUrl', res.url);
      showToast('Đã tải ảnh kiến trúc thành công! Nhớ nhấn "Lưu thay đổi" để áp dụng.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải file ảnh kiến trúc', 'error');
    } finally {
      setUploadingIntroImage(false);
      if (introImageInputRef.current) introImageInputRef.current.value = '';
    }
  };

  // Xử lý upload ảnh sơ đồ mặt bằng
  const handleUploadGuideMap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('Kích thước ảnh sơ đồ mặt bằng không được vượt quá 20MB', 'warning');
      return;
    }
    try {
      setUploadingGuideMap(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('guideMapUrl', res.url);
      showToast('Đã tải ảnh sơ đồ mặt bằng thành công! Nhớ nhấn "Lưu thay đổi" để áp dụng.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải ảnh sơ đồ mặt bằng', 'error');
    } finally {
      setUploadingGuideMap(false);
      if (guideMapInputRef.current) guideMapInputRef.current.value = '';
    }
  };

  const handleAnalyzeFloorPlan = async (fileToUpload?: File) => {
    if (!form.guideMapUrl && !fileToUpload) {
      showToast('Vui lòng chọn file ảnh hoặc cung cấp URL sơ đồ mặt bằng để phân tích', 'warning');
      return;
    }
    try {
      setAnalyzingFloorPlan(true);
      const formData = new FormData();
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      } else if (form.guideMapUrl) {
        formData.append('imageUrl', form.guideMapUrl);
      }
      formData.append('title', form.guideMapTitle || 'Sơ Đồ Mặt Bằng & Cẩm Nang Tham Quan');
      formData.append('description', form.guideMapDesc || 'Mạng lưới liên kết không gian và cửa thông phòng');

      const res = await api.analyzeFloorPlan(formData);
      if (res.data?.imageUrl) {
        handleChange('guideMapUrl', res.data.imageUrl);
      }
      setAnalysisSummary(res.summary);
      showToast(`Phân tích thành công! Đã tạo ${res.summary?.nodeCount || 0} phòng và ${res.summary?.edgeCount || 0} liên kết cửa thông phòng.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi máy chủ phân tích sơ đồ', 'error');
    } finally {
      setAnalyzingFloorPlan(false);
    }
  };

  // Lưu toàn bộ hoặc từng phần
  const handleSave = async (sectionName?: string) => {
    if (!form.museumName?.trim()) {
      showToast('Tên đầy đủ của bảo tàng không được để trống', 'warning');
      selectSection('panel-menu');
      return;
    }
    if (!form.shortName?.trim()) {
      showToast('Tên rút gọn của bảo tàng không được để trống', 'warning');
      selectSection('panel-menu');
      return;
    }

    try {
      setIsSaving(true);
      await updateBranding(form);
      const msg = sectionName
        ? `Đã lưu thành công ${sectionName}! Dữ liệu trang chủ đã đồng bộ ngay lập tức.`
        : 'Cập nhật thành công toàn bộ giao diện & nội dung Trang chủ! Hệ thống đã đồng bộ dữ liệu thật 100%.';
      showToast(msg, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu cấu hình trang chủ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Khôi phục dữ liệu mẫu chuẩn của bảo tàng
  const handleResetDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại tất cả nội dung trang chủ về giá trị mặc định của Bảo tàng Lịch sử TP.HCM không?')) {
      setForm({
        museumName: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh',
        shortName: 'Bảo tàng Lịch sử',
        emblemText: 'BT',
        logoUrl: '',
        tagline: 'Hệ thống Tour 360 Không gian Di sản',
        city: 'TP. Hồ Chí Minh',
        address: 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        contactEmail: 'huynhtanlocpp09@gmail.com',
        hotline: '(028) 3829 8146',
        emailSenderName: 'Bảo Tàng Lịch Sử TP.HCM',
        heroTitle: 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
        heroTagline: 'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.',
        heroBannerUrl: '',
        heroVideoUrl: '',
        heroCta1Text: 'Bắt Đầu Tour 360°',
        heroCta2Text: 'Chiêm Ngưỡng Cổ Vật 3D',
        introTag: 'Kiến Trúc & Không Gian',
        introTitle: 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh',
        introDesc: 'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.',
        introBadgeText: 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia',
        introImageUrl: '',
        introCtaText: 'Khám phá gian trưng bày',
        roomsTag: 'Không Gian Thực Tế Ảo',
        roomsTitle: 'Hệ Thống Gian Phòng Tour 360°',
        roomsDesc: 'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.',
        roomsCtaText: 'Khám phá tất cả gian phòng 360°',
        artifactsTag: 'Bảo Vật Di Sản & Mô Hình 3D',
        artifactsTitle: 'Kho Tàng Cổ Vật & Bảo Vật Di Sản',
        artifactsDesc: 'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác và hệ thống thuyết minh âm thanh đa ngôn ngữ.',
        artifactsCtaText: 'Khám phá toàn bộ kho hiện vật',
        guideTag: 'Kế Hoạch & Sơ Đồ',
        guideTitle: 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
        guideDesc: 'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',
        guideCtaText: 'Xem cẩm nang & sơ đồ tham quan',
        guideMapUrl: '',
        guideMapTitle: 'Sơ đồ mặt bằng các gian trưng bày',
        guideMapDesc: 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM',
        footerCopyrightText: ''
      });
      showToast('Đã khôi phục nội dung mẫu. Nhấn "Lưu tất cả" để áp dụng lên trang chủ.', 'info');
    }
  };

  const renderSectionNavFooter = (sectionIndex: number, sectionName: string) => {
    const prevSec = sectionIndex > 0 ? HOMEPAGE_SECTIONS[sectionIndex - 1] : null;
    const nextSec = sectionIndex < HOMEPAGE_SECTIONS.length - 1 ? HOMEPAGE_SECTIONS[sectionIndex + 1] : null;

    return (
      <div
        style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        {prevSec ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => selectSection(prevSec.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} />
            <span>Phần trước: {prevSec.shortLabel}</span>
          </button>
        ) : <div />}

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => handleSave(sectionName)}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontWeight: 600 }}
        >
          <Save size={15} />
          <span>{isSaving ? 'Đang lưu...' : `Lưu thay đổi ${sectionName}`}</span>
        </button>

        {nextSec ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => selectSection(nextSec.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Phần tiếp theo: {nextSec.shortLabel}</span>
            <ArrowRight size={14} />
          </button>
        ) : <div />}
      </div>
    );
  };

  return (
    <div className="admin-content" style={{ paddingBottom: 100 }}>
      {/* 1. THANH TIÊU ĐỀ TRANG QUẢN TRỊ */}
      <div
        className="settings-header"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--primary) 0%, #5a1a0c 100%)',
              border: '1px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF8F0',
              boxShadow: '0 4px 12px rgba(140, 45, 25, 0.3)',
              flexShrink: 0
            }}
          >
            <LayoutTemplate size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
              Quản Lý Giao Diện & Nội Dung Trang Chủ
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 720, lineHeight: 1.5 }}>
              Quản lý độc lập từng phần hiển thị trên Trang chủ di sản. Dữ liệu được lưu trữ trực tiếp vào MongoDB và đồng bộ tức thì cho Khách tham quan.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            <Globe size={15} />
            <span>Xem Trang chủ Khách</span>
            <ExternalLink size={13} style={{ opacity: 0.6 }} />
          </a>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetDefaults}
            title="Đặt lại các nội dung về mẫu chuẩn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            <RotateCcw size={14} />
            <span>Khôi phục mẫu</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontWeight: 600 }}
          >
            <Save size={15} />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG NHANH THEO TỪNG PHẦN (CHỌN TỪNG PHẦN ĐỘC LẬP) */}
      <div
        style={{
          position: 'sticky',
          top: 64,
          zIndex: 15,
          background: 'var(--bg-surface)',
          padding: '10px 14px',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', marginRight: 4 }}>
          Chọn phần:
        </span>
        {HOMEPAGE_SECTIONS.map((sec) => {
          const isActive = activeSectionId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => selectSection(sec.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                background: isActive ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: 10.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {sec.num}
              </span>
              <span>{sec.shortLabel.replace(/^\d+\.\s*/, '')}</span>
            </button>
          );
        })}
      </div>

      {/* 3. KHU VỰC QUẢN LÝ TẬP TRUNG THEO TỪNG PHẦN ĐƯỢC CHỌN (KHÔNG GỘP TRÀN LAN) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* KHUNG 1: MENU & NHẬN DIỆN THƯƠNG HIỆU */}
        {activeSectionId === 'panel-menu' && (
        <section
          id="panel-menu"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  1. Khung Menu & Nhận Diện Thương Hiệu
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý tên bảo tàng, tên rút gọn, logo tải lên và khẩu hiệu trên thanh điều hướng Navbar
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Menu & Nhận diện')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu phần Menu</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tên đầy đủ của Bảo tàng <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.museumName}
                onChange={(e) => handleChange('museumName', e.target.value)}
                placeholder="VD: Bảo tàng Lịch sử Thành phố Hồ Chí Minh"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Hiển thị trên Navbar, Chân trang và tiêu đề chính các trang
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tên rút gọn hiển thị <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                placeholder="VD: Bảo tàng Lịch sử"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Hiển thị trên góc trái thanh Navbar và Sidebar Admin
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Biểu trưng chữ viết tắt (Emblem)
              </label>
              <input
                type="text"
                maxLength={6}
                value={form.emblemText}
                onChange={(e) => handleChange('emblemText', e.target.value.toUpperCase())}
                placeholder="BT"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Hiển thị huy hiệu dạng chữ khi bảo tàng chưa tải ảnh logo lên
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Khẩu hiệu chính của Bảo tàng (Tagline)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="VD: Hệ thống Tour 360 Không gian Di sản"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Quản lý ảnh Logo */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px dashed var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
              Ảnh Logo nhận diện chính thức
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  border: '1px dashed var(--border-color)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent-gold)' }}>
                    {form.emblemText || 'BT'}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleUploadLogo}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Upload size={14} />
                    <span>{uploadingLogo ? 'Đang tải lên...' : 'Tải ảnh logo lên'}</span>
                  </button>

                  {form.logoUrl && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleChange('logoUrl', '')}
                      style={{ color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Trash2 size={14} />
                      <span>Gỡ logo</span>
                    </button>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Hỗ trợ PNG trong suốt, SVG, JPG, WebP (Tối đa 5MB)
                </span>
              </div>
            </div>
            {renderSectionNavFooter(0, 'Phần 1: Menu & Nhận diện')}
          </div>
        </section>
        )}

        {/* KHUNG 2: BANNER HERO TOÀN CẢNH */}
        {activeSectionId === 'panel-hero' && (
        <section
          id="panel-hero"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  2. Khung Banner Hero Toàn Cảnh (Đầu trang)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý tiêu đề chào đón, khẩu hiệu, 2 nút kêu gọi CTA, ảnh nền toàn cảnh và video nền
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Banner Hero')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Banner Hero</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề chính trên Banner Hero
              </label>
              <input
                type="text"
                value={form.heroTitle || ''}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                placeholder="VD: Bảo tàng Lịch sử TP. Hồ Chí Minh"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Phụ đề dẫn dắt Hero (Lead paragraph)
              </label>
              <textarea
                rows={2}
                value={form.heroTagline || ''}
                onChange={(e) => handleChange('heroTagline', e.target.value)}
                placeholder="VD: Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tên nút CTA 1 (Nút chính - Bắt đầu Tour)
              </label>
              <input
                type="text"
                value={form.heroCta1Text || ''}
                onChange={(e) => handleChange('heroCta1Text', e.target.value)}
                placeholder="Bắt Đầu Tour 360°"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tên nút CTA 2 (Nút phụ - Xem cổ vật)
              </label>
              <input
                type="text"
                value={form.heroCta2Text || ''}
                onChange={(e) => handleChange('heroCta2Text', e.target.value)}
                placeholder="Chiêm Ngưỡng Cổ Vật 3D"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Link Video toàn cảnh Hero (Tùy chọn - Video nền tự phát)
              </label>
              <input
                type="text"
                value={form.heroVideoUrl || ''}
                onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
                placeholder="VD: https://assets.example.com/museum-hero.mp4"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Nếu để trống, hệ thống sẽ ưu tiên hiển thị ảnh nền toàn cảnh bên dưới.
              </span>
            </div>
          </div>

          {/* Quản lý ảnh nền Hero */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px dashed var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
              Ảnh nền toàn cảnh Hero
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={form.heroBannerUrl || ''}
                  onChange={(e) => handleChange('heroBannerUrl', e.target.value)}
                  placeholder="https://... hoặc tải ảnh trực tiếp bên phải"
                  style={{ flex: 1, minWidth: 260, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
                <input
                  type="file"
                  ref={heroBannerInputRef}
                  accept="image/*"
                  onChange={handleUploadHeroBanner}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => heroBannerInputRef.current?.click()}
                  disabled={uploadingHeroBanner}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} />
                  <span>{uploadingHeroBanner ? 'Đang tải lên...' : 'Tải ảnh banner lên'}</span>
                </button>
              </div>

              {form.heroBannerUrl && (
                <div style={{ position: 'relative', width: '100%', maxHeight: 220, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={form.heroBannerUrl} alt="Hero Banner Preview" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: 4, fontSize: 11, color: '#FFF' }}>
                    Ảnh xem trước banner
                  </div>
                </div>
              )}
            </div>
            {renderSectionNavFooter(1, 'Phần 2: Banner Hero')}
          </div>
        </section>
        )}

        {/* KHUNG 3: KHỐI GIỚI THIỆU KHÔNG GIAN & LỊCH SỬ */}
        {activeSectionId === 'panel-intro' && (
        <section
          id="panel-intro"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  3. Khung Giới Thiệu Lịch Sử & Kiến Trúc
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ định danh, tiêu đề, bài viết giới thiệu, huy hiệu công trình và ảnh chụp kiến trúc
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Giới thiệu Không gian')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu phần Giới thiệu</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Thẻ định danh khối (Tagline pill)
              </label>
              <input
                type="text"
                value={form.introTag || ''}
                onChange={(e) => handleChange('introTag', e.target.value)}
                placeholder="Kiến Trúc & Không Gian"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề khối giới thiệu
              </label>
              <input
                type="text"
                value={form.introTitle || ''}
                onChange={(e) => handleChange('introTitle', e.target.value)}
                placeholder="Bảo Tàng Lịch Sử TP. Hồ Chí Minh"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Huy hiệu nổi bật trên ảnh kiến trúc
              </label>
              <input
                type="text"
                value={form.introBadgeText || ''}
                onChange={(e) => handleChange('introBadgeText', e.target.value)}
                placeholder="Di tích Kiến trúc Nghệ thuật Cấp Quốc gia"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Nhãn nút khám phá (CTA)
              </label>
              <input
                type="text"
                value={form.introCtaText || ''}
                onChange={(e) => handleChange('introCtaText', e.target.value)}
                placeholder="Khám phá gian trưng bày"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Nội dung bài viết giới thiệu kiến trúc & lịch sử
              </label>
              <textarea
                rows={3}
                value={form.introDesc || ''}
                onChange={(e) => handleChange('introDesc', e.target.value)}
                placeholder="VD: Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Quản lý ảnh kiến trúc Intro */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px dashed var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
              Ảnh chụp kiến trúc bảo tàng
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={form.introImageUrl || ''}
                  onChange={(e) => handleChange('introImageUrl', e.target.value)}
                  placeholder="https://... hoặc bấm tải ảnh bên phải"
                  style={{ flex: 1, minWidth: 260, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
                <input
                  type="file"
                  ref={introImageInputRef}
                  accept="image/*"
                  onChange={handleUploadIntroImage}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => introImageInputRef.current?.click()}
                  disabled={uploadingIntroImage}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} />
                  <span>{uploadingIntroImage ? 'Đang tải lên...' : 'Tải ảnh kiến trúc lên'}</span>
                </button>
              </div>

              {form.introImageUrl && (
                <div style={{ position: 'relative', width: '100%', maxHeight: 200, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={form.introImageUrl} alt="Intro Architecture" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                </div>
              )}
            </div>
            {renderSectionNavFooter(2, 'Phần 3: Giới thiệu Không gian')}
          </div>
        </section>
        )}

        {/* KHUNG 4: KHỐI GIAN PHÒNG TRƯNG BÀY 360° */}
        {activeSectionId === 'panel-rooms' && (
        <section
          id="panel-rooms"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  4. Khung Gian Phòng Trưng Bày 360°
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ khối, tiêu đề khối, đoạn giới thiệu trải nghiệm và nhãn nút chuyển sang trang danh sách phòng
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Gian phòng 360°')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Gian phòng 360°</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Thẻ định danh khối (Tagline pill)
              </label>
              <input
                type="text"
                value={form.roomsTag || ''}
                onChange={(e) => handleChange('roomsTag', e.target.value)}
                placeholder="Không Gian Thực Tế Ảo"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề khối phòng trưng bày
              </label>
              <input
                type="text"
                value={form.roomsTitle || ''}
                onChange={(e) => handleChange('roomsTitle', e.target.value)}
                placeholder="Hệ Thống Gian Phòng Tour 360°"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Nhãn nút hành động CTA
              </label>
              <input
                type="text"
                value={form.roomsCtaText || ''}
                onChange={(e) => handleChange('roomsCtaText', e.target.value)}
                placeholder="Khám phá tất cả gian phòng 360°"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Đoạn mô tả trải nghiệm Tour 360°
              </label>
              <textarea
                rows={3}
                value={form.roomsDesc || ''}
                onChange={(e) => handleChange('roomsDesc', e.target.value)}
                placeholder="VD: Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            {renderSectionNavFooter(3, 'Phần 4: Gian phòng 360°')}
          </div>
        </section>
        )}

        {/* KHUNG 5: KHỐI KHO TÀNG CỔ VẬT DI SẢN 3D */}
        {activeSectionId === 'panel-artifacts' && (
        <section
          id="panel-artifacts"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  5. Khung Kho Tàng Cổ Vật Di Sản 3D
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ khối, tiêu đề khối, đoạn giới thiệu bảo vật 3D và nhãn nút chuyển sang kho hiện vật
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Cổ vật 3D')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Cổ vật 3D</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Thẻ định danh khối (Tagline pill)
              </label>
              <input
                type="text"
                value={form.artifactsTag || ''}
                onChange={(e) => handleChange('artifactsTag', e.target.value)}
                placeholder="Bảo Vật Di Sản & Mô Hình 3D"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề khối cổ vật
              </label>
              <input
                type="text"
                value={form.artifactsTitle || ''}
                onChange={(e) => handleChange('artifactsTitle', e.target.value)}
                placeholder="Kho Tàng Cổ Vật & Bảo Vật Di Sản"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Nhãn nút hành động CTA
              </label>
              <input
                type="text"
                value={form.artifactsCtaText || ''}
                onChange={(e) => handleChange('artifactsCtaText', e.target.value)}
                placeholder="Khám phá toàn bộ kho hiện vật"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Đoạn mô tả kho hiện vật và mô hình 3D
              </label>
              <textarea
                rows={3}
                value={form.artifactsDesc || ''}
                onChange={(e) => handleChange('artifactsDesc', e.target.value)}
                placeholder="VD: Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            {renderSectionNavFooter(4, 'Phần 5: Cổ vật 3D')}
          </div>
        </section>
        )}

        {/* KHUNG 6: KHỐI CẨM NANG & SƠ ĐỒ THAM QUAN */}
        {activeSectionId === 'panel-guide' && (
        <section
          id="panel-guide"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  6. Khung Cẩm Nang & Sơ Đồ Tham Quan Thực Địa
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ khối, tiêu đề khối, tải ảnh bản đồ/sơ đồ mặt bằng bảo tàng và nút điều hướng
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Cẩm nang & Sơ đồ')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Cẩm nang & Sơ đồ</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Thẻ định danh khối (Tagline pill)
              </label>
              <input
                type="text"
                value={form.guideTag || ''}
                onChange={(e) => handleChange('guideTag', e.target.value)}
                placeholder="Kế Hoạch & Sơ Đồ"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề khối cẩm nang
              </label>
              <input
                type="text"
                value={form.guideTitle || ''}
                onChange={(e) => handleChange('guideTitle', e.target.value)}
                placeholder="Cẩm Nang & Sơ Đồ Tham Quan Thực Địa"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Nhãn nút hành động CTA
              </label>
              <input
                type="text"
                value={form.guideCtaText || ''}
                onChange={(e) => handleChange('guideCtaText', e.target.value)}
                placeholder="Xem cẩm nang & sơ đồ tham quan"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Đoạn mô tả cẩm nang tham quan
              </label>
              <textarea
                rows={2}
                value={form.guideDesc || ''}
                onChange={(e) => handleChange('guideDesc', e.target.value)}
                placeholder="VD: Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tiêu đề Sơ đồ mặt bằng bảo tàng
              </label>
              <input
                type="text"
                value={form.guideMapTitle || ''}
                onChange={(e) => handleChange('guideMapTitle', e.target.value)}
                placeholder="Sơ đồ mặt bằng các gian trưng bày"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Mô tả chi tiết Sơ đồ mặt bằng
              </label>
              <input
                type="text"
                value={form.guideMapDesc || ''}
                onChange={(e) => handleChange('guideMapDesc', e.target.value)}
                placeholder="Bản đồ kiến trúc không gian và vị trí các gian phòng..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>
          </div>

          {/* Quản lý file ảnh Sơ đồ mặt bằng */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px dashed var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
              File ảnh Sơ đồ mặt bằng kiến trúc Bảo tàng (Sẽ hiển thị trong Lightbox phóng to ở trang Cẩm nang)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={form.guideMapUrl || ''}
                  onChange={(e) => handleChange('guideMapUrl', e.target.value)}
                  placeholder="https://... hoặc tải sơ đồ kiến trúc bên phải"
                  style={{ flex: 1, minWidth: 260, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
                <input
                  type="file"
                  ref={guideMapInputRef}
                  accept="image/*"
                  onChange={handleUploadGuideMap}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => guideMapInputRef.current?.click()}
                  disabled={uploadingGuideMap}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Upload size={14} />
                  <span>{uploadingGuideMap ? 'Đang tải lên...' : 'Tải sơ đồ mặt bằng lên'}</span>
                </button>
              </div>

              {form.guideMapUrl && (
                <div style={{ position: 'relative', width: '100%', maxHeight: 240, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={form.guideMapUrl} alt="Guide Map Preview" style={{ width: '100%', height: 240, objectFit: 'contain', background: '#111' }} />
                  <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: 4, fontSize: 11, color: '#FFF' }}>
                    Xem trước sơ đồ mặt bằng
                  </div>
                </div>
              )}

              {/* Tính năng Phân tích Sơ đồ Mặt bằng & Kiến tạo Mạng Không gian Topo (Server Sharp Engine) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAnalyzeFloorPlan()}
                  disabled={analyzingFloorPlan || !form.guideMapUrl}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D4AF37', borderColor: '#D4AF37', color: '#000', fontWeight: 600 }}
                >
                  <Compass size={14} />
                  <span>{analyzingFloorPlan ? 'Máy chủ đang phân tích qua Sharp & Topo...' : '⚡ Phân tích Sơ đồ Kiến trúc & Tạo Liên Kết Không Gian'}</span>
                </button>
              </div>

              {analysisSummary && (
                <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, fontSize: 12.5, color: '#10B981' }}>
                  ✓ Đã phân tích thành công: Nhận diện <strong>{analysisSummary.nodeCount}</strong> phân khu và thiết lập <strong>{analysisSummary.edgeCount}</strong> cửa liên kết hướng đi (Trái/Phải/Trước/Sau). Dữ liệu đã lưu vào MongoDB và tự động đồng bộ sang trang Cẩm nang tham quan!
                </div>
              )}
            </div>
            {renderSectionNavFooter(5, 'Phần 6: Cẩm nang & Sơ đồ')}
          </div>
        </section>
        )}

        {/* KHUNG 7: CHÂN TRANG & THÔNG TIN LIÊN HỆ */}
        {activeSectionId === 'panel-footer' && (
        <section
          id="panel-footer"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  7. Khung Chân Trang & Thông Tin Liên Hệ (Footer)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý địa chỉ thực tế, đường dây nóng, email tiếp nhận thông tin và bản quyền hiển thị
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleSave('Chân trang & Liên hệ')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Chân trang</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Địa chỉ thực địa của Bảo tàng
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Đường dây nóng / Hotline
              </label>
              <input
                type="text"
                value={form.hotline}
                onChange={(e) => handleChange('hotline', e.target.value)}
                placeholder="(028) 3829 8146"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Hộp thư điện tử (Email tiếp nhận)
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="huynhtanlocpp09@gmail.com"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tỉnh / Thành phố
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="TP. Hồ Chí Minh"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Tên đơn vị gửi thư (Email Sender Name)
              </label>
              <input
                type="text"
                value={form.emailSenderName}
                onChange={(e) => handleChange('emailSenderName', e.target.value)}
                placeholder="Bảo Tàng Lịch Sử TP.HCM"
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Dòng bản quyền chân trang (Copyright Text)
              </label>
              <input
                type="text"
                value={form.footerCopyrightText || ''}
                onChange={(e) => handleChange('footerCopyrightText', e.target.value)}
                placeholder={`VD: ${form.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}. Tất cả quyền được bảo lưu.`}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Hệ thống tự động thêm biểu tượng © và năm hiện hành {new Date().getFullYear()} vào trước dòng này.
              </span>
            </div>
            {renderSectionNavFooter(6, 'Phần 7: Chân trang & Liên hệ')}
          </div>
        </section>
        )}

      </div>

      {/* 4. THANH HÀNH ĐỘNG CỐ ĐỊNH PHÍA DƯỚI (STICKY BOTTOM ACTION BAR) */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 24,
          zIndex: 40,
          background: 'rgba(26, 22, 19, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--accent-gold)',
          borderRadius: 14,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-main)', fontWeight: 500 }}>
            Dữ liệu MongoDB & Redis Sync
          </span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => handleSave()}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontWeight: 600 }}
        >
          <Save size={15} />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
        </button>
      </div>
    </div>
  );
};
