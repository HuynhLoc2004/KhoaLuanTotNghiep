import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { SystemBranding, HeaderMenuItem, HeaderSubMenuItem, MuseumRoom } from '../../types';
import { useSystemBranding, DEFAULT_HEADER_MENU } from '../../context/SystemBrandingContext';
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
  ArrowRight,
  Menu as MenuIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  ListPlus,
  CornerDownRight
} from 'lucide-react';
import { HOMEPAGE_SECTIONS } from '../../constants/homepageSections';
import { ConfirmModal } from '../../components/ConfirmModal';

interface AdminHomepageCMSPageProps {
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminHomepageCMSPage: React.FC<AdminHomepageCMSPageProps> = ({
  activeSection,
  onSectionChange,
  onNavigateTab
}) => {
  const { showToast } = useToast();
  const { branding, updateBranding, refreshBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [form, setForm] = useState<SystemBranding>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(activeSection || 'panel-brand');

  // Hộp thoại xác nhận thay thế window.confirm / alert
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Quản lý upload file
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeroBanner, setUploadingHeroBanner] = useState(false);
  const [uploadingIntroImage, setUploadingIntroImage] = useState(false);
  // Quản lý gian phòng 360 thực tế từ cơ sở dữ liệu
  const [availableRooms, setAvailableRooms] = useState<MuseumRoom[]>([]);
  const [uploadingRoomsShowcase, setUploadingRoomsShowcase] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroBannerInputRef = useRef<HTMLInputElement>(null);
  const introImageInputRef = useRef<HTMLInputElement>(null);
  const roomsShowcaseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getRooms()
      .then((data) => setAvailableRooms(data || []))
      .catch((err) => console.warn('[AdminHomepageCMS] Lỗi tải danh sách phòng:', err));
  }, []);

  useEffect(() => {
    if (branding) {
      setForm(branding);
    }
  }, [branding]);

  useEffect(() => {
    if (activeSection) {
      const mapped = activeSection === 'panel-menu' ? 'panel-brand' : activeSection;
      if (mapped !== activeSectionId) {
        setActiveSectionId(mapped);
      }
    }
  }, [activeSection]);

  // Quản lý Header Menu Items (Đa cấp)
  const menuItems: HeaderMenuItem[] = form.headerMenuItems || DEFAULT_HEADER_MENU;

  const updateMenuItems = (newItems: HeaderMenuItem[]) => {
    setForm((prev) => ({
      ...prev,
      headerMenuItems: newItems
    }));
  };

  const handleAddMenuItem = () => {
    const newItem: HeaderMenuItem = {
      id: `menu-${Date.now()}`,
      label: 'Mục Menu Mới',
      linkType: 'page',
      target: 'rooms',
      active: true,
      order: menuItems.length + 1,
      children: []
    };
    updateMenuItems([...menuItems, newItem]);
  };

  const handleUpdateMenuItem = (index: number, patch: Partial<HeaderMenuItem>) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], ...patch };
    updateMenuItems(updated);
  };

  const handleDeleteMenuItem = (index: number) => {
    const item = menuItems[index];
    if (item && item.children && item.children.length > 0) {
      setConfirmModalConfig({
        isOpen: true,
        title: 'Xóa mục Menu',
        message: `Mục "${item.label}" đang có ${item.children.length} menu con. Bạn có chắc chắn muốn xóa không?`,
        confirmText: 'Xóa mục',
        cancelText: 'Hủy',
        type: 'danger',
        onConfirm: () => {
          const updated = menuItems.filter((_, i) => i !== index);
          updateMenuItems(updated);
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }
    const updated = menuItems.filter((_, i) => i !== index);
    updateMenuItems(updated);
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuItems.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateMenuItems(updated.map((item, i) => ({ ...item, order: i + 1 })));
  };

  // Quản lý Menu Con Dropdown (Cấp 2)
  const handleAddSubItem = (parentIndex: number) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    const newSub: HeaderSubMenuItem = {
      id: `sub-${Date.now()}`,
      label: 'Menu con mới',
      linkType: 'page',
      target: 'rooms',
      active: true
    };
    parent.children = [...(parent.children || []), newSub];
    updateMenuItems(updated);
  };

  const handleUpdateSubItem = (parentIndex: number, subIndex: number, patch: Partial<HeaderSubMenuItem>) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent.children) return;
    const subChildren = [...parent.children];
    subChildren[subIndex] = { ...subChildren[subIndex], ...patch };
    parent.children = subChildren;
    updateMenuItems(updated);
  };

  const handleDeleteSubItem = (parentIndex: number, subIndex: number) => {
    const updated = [...menuItems];
    const parent = updated[parentIndex];
    if (!parent.children) return;
    parent.children = parent.children.filter((_, i) => i !== subIndex);
    updateMenuItems(updated);
  };

  const handleResetDefaultMenu = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Khôi phục Menu điều hướng',
      message: 'Đặt lại danh sách thanh điều hướng về cấu hình 4 mục mặc định ban đầu?',
      confirmText: 'Khôi phục Menu',
      cancelText: 'Hủy',
      type: 'warning',
      onConfirm: () => {
        updateMenuItems(DEFAULT_HEADER_MENU);
        showToast('Đã khôi phục Menu Header mặc định', 'success');
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

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

  // Lưu toàn bộ hoặc từng phần
  const handleSave = async (sectionName?: string) => {
    if (!form.museumName?.trim()) {
      showToast('Tên đầy đủ của bảo tàng không được để trống', 'warning');
      selectSection('panel-brand');
      return;
    }
    if (!form.shortName?.trim()) {
      showToast('Tên rút gọn của bảo tàng không được để trống', 'warning');
      selectSection('panel-brand');
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
    setConfirmModalConfig({
      isOpen: true,
      title: 'Khôi phục nội dung mẫu chuẩn',
      message: 'Toàn bộ nội dung Trang chủ sẽ được đặt lại về giá trị mẫu chuẩn của Bảo tàng Lịch sử TP.HCM. Bạn có chắc chắn muốn thực hiện?',
      confirmText: 'Khôi phục nội dung mẫu',
      cancelText: 'Hủy bỏ',
      type: 'danger',
      onConfirm: () => {
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
          roomsFeaturedId: '',
          roomsShowcaseImageUrl: '',
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
          guideOpeningDays: 'Thứ Ba – Chủ Nhật',
          guideMorningHours: '08:00 – 11:30',
          guideAfternoonHours: '13:30 – 17:00',
          guideClosedNote: 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật.',
          guideTicketAdult: '30.000 ₫',
          guideTicketStudent: '15.000 ₫',
          guideTicketChild: 'Miễn phí',
          guideBusRoutes: 'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.',
          guideParkingInfo: 'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.',
          guideGoogleMapsUrl: 'https://maps.app.goo.gl/3f9m4xVjM8k3E4wz9',
          guideGoogleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2974959146194!2d106.70295171120286!3d10.788506858925585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4ae1b9338f%3A0x6b09337ec5c8d626!2zQuG6o28gdMOgbmcgTOG7i2NoIHPhu60gVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn',
          guideRule1Title: 'Quét mã QR tại tủ hiện vật',
          guideRule1Desc: 'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
          guideRule2Title: 'Thuyết minh Audio Guide song ngữ',
          guideRule2Desc: 'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
          guideRule3Title: 'Bảo quản di sản & Hiện vật',
          guideRule3Desc: 'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
          guideRule4Title: 'Trang phục & Văn minh tham quan',
          guideRule4Desc: 'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.',
          footerCopyrightText: ''
        });
        showToast('Đã khôi phục nội dung mẫu. Nhấn "Lưu tất cả" để áp dụng lên trang chủ.', 'info');
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    });
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
          background: 'var(--bg-surface)',
          padding: '8px 14px',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto'
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
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                border: '1px solid',
                borderColor: isActive ? 'rgba(212, 168, 106, 0.45)' : 'transparent',
                background: isActive ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
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
                  background: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#1A1512' : 'var(--text-muted)',
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

        {/* KHUNG 1: NHẬN DIỆN THƯƠNG HIỆU & LOGO */}
        {(activeSectionId === 'panel-brand' || activeSectionId === 'panel-menu') && (
        <section
          id="panel-brand"
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
                  1. Nhận Diện Thương Hiệu & Logo
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý tên bảo tàng, tên rút gọn, logo chính thức, huy hiệu viết tắt và khẩu hiệu
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSave('Nhận diện & Logo')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu phần 1: Nhận diện</span>
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
            {renderSectionNavFooter(0, 'Phần 1: Nhận diện & Logo')}
          </div>
        </section>
        )}

        {/* KHUNG 2: QUẢN LÝ MENU HEADER (ĐA CẤP & DROPDOWN) */}
        {activeSectionId === 'panel-header-menu' && (
        <section
          id="panel-header-menu"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 14, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MenuIcon size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  2. Menu Header (Thanh Điều Hướng Đa Cấp)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý danh sách các mục menu hiển thị trên Header, hỗ trợ mở rộng menu con (Dropdown đa cấp), tùy biến liên kết và bật/tắt
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetDefaultMenu}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Khôi phục danh sách Menu mặc định"
              >
                <RotateCcw size={13} />
                <span>Khôi phục menu chuẩn</span>
              </button>

              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={handleAddMenuItem}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} />
                <span>Thêm mục Menu mới</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleSave('Menu Header')}
                disabled={isSaving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={14} />
                <span>Lưu phần 2: Menu Header</span>
              </button>
            </div>
          </div>

          {/* Thông tin & tóm tắt */}
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(212, 168, 106, 0.06)',
              border: '1px solid rgba(212, 168, 106, 0.2)',
              marginBottom: 14,
              fontSize: 12.5,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={15} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              <span>
                Thứ tự và cấu trúc cây phân cấp dưới đây sẽ hiển thị trực tiếp trên thanh Header của khách tham quan.
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 600 }}>
              {menuItems.length} mục chính ({menuItems.reduce((acc, it) => acc + (it.children?.length || 0), 0)} menu con)
            </div>
          </div>

          {/* Bảng Tree Table tinh gọn */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', width: '32%' }}>
                      Tên hiển thị trên Menu
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', width: '22%' }}>
                      Kiểu liên kết
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', width: '26%' }}>
                      Đích đến (Trang / Phần # / URL)
                    </th>
                    <th style={{ padding: '10px 10px', fontWeight: 600, color: 'var(--text-muted)', width: '8%', textAlign: 'center' }}>
                      Hiển thị
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', width: '12%', textAlign: 'right' }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Chưa có mục Menu nào. Bấm nút <strong>"Thêm mục Menu mới"</strong> hoặc <strong>"Khôi phục menu chuẩn"</strong> ở góc trên.
                      </td>
                    </tr>
                  ) : (
                    menuItems.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        {/* Hàng mục Menu cha (Cấp 1) */}
                        <tr
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: item.active !== false ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* Cột 1: Tên mục cha */}
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  background: 'rgba(212, 168, 106, 0.15)',
                                  color: 'var(--accent-gold)',
                                  flexShrink: 0
                                }}
                              >
                                #{idx + 1}
                              </span>
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => handleUpdateMenuItem(idx, { label: e.target.value })}
                                placeholder="Tên mục menu..."
                                style={{
                                  flex: 1,
                                  minWidth: 120,
                                  padding: '6px 10px',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 6,
                                  color: 'var(--text-main)',
                                  fontSize: 12.5,
                                  fontWeight: 600
                                }}
                              />
                              {item.children && item.children.length > 0 && (
                                <span
                                  title={`${item.children.length} menu con xổ xuống`}
                                  style={{
                                    fontSize: 11,
                                    padding: '2px 7px',
                                    borderRadius: 12,
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    color: '#60A5FA',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                  }}
                                >
                                  ▾ {item.children.length} con
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Cột 2: Kiểu liên kết */}
                          <td style={{ padding: '8px 12px' }}>
                            <select
                              value={item.linkType}
                              onChange={(e) => handleUpdateMenuItem(idx, { linkType: e.target.value as any })}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 6,
                                color: 'var(--text-main)',
                                fontSize: 12
                              }}
                            >
                              <option value="page">Chuyển trang (Page)</option>
                              <option value="anchor">Cuộn tới phần (Anchor #)</option>
                              <option value="custom">URL tùy ý (Link ngoài)</option>
                              <option value="dropdown_only">Chỉ làm nhóm mở Dropdown</option>
                            </select>
                          </td>

                          {/* Cột 3: Đích đến */}
                          <td style={{ padding: '8px 12px' }}>
                            {item.linkType === 'dropdown_only' ? (
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                (Nhóm menu - mở dropdown con khi rê chuột)
                              </span>
                            ) : item.linkType === 'page' ? (
                              <select
                                value={item.target}
                                onChange={(e) => handleUpdateMenuItem(idx, { target: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 6,
                                  color: 'var(--text-main)',
                                  fontSize: 12
                                }}
                              >
                                <option value="home">Trang chủ di sản</option>
                                <option value="rooms">Gian phòng 360°</option>
                                <option value="artifacts">Kho cổ vật 3D</option>
                                <option value="guide">Cẩm nang & Sơ đồ tham quan</option>
                              </select>
                            ) : item.linkType === 'anchor' ? (
                              <select
                                value={item.target.replace(/^#/, '')}
                                onChange={(e) => handleUpdateMenuItem(idx, { target: e.target.value })}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 6,
                                  color: 'var(--text-main)',
                                  fontSize: 12
                                }}
                              >
                                <option value="intro">#intro (Khối giới thiệu)</option>
                                <option value="rooms">#rooms (Khối gian phòng 360°)</option>
                                <option value="artifacts">#artifacts (Khối cổ vật 3D)</option>
                                <option value="guide">#guide (Khối sơ đồ & cẩm nang)</option>
                              </select>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="text"
                                  value={item.target}
                                  onChange={(e) => handleUpdateMenuItem(idx, { target: e.target.value })}
                                  placeholder="https://..."
                                  style={{
                                    flex: 1,
                                    minWidth: 100,
                                    padding: '6px 8px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 6,
                                    color: 'var(--text-main)',
                                    fontSize: 12
                                  }}
                                />
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Mở tab mới"
                                >
                                  <input
                                    type="checkbox"
                                    checked={item.isNewTab || false}
                                    onChange={(e) => handleUpdateMenuItem(idx, { isNewTab: e.target.checked })}
                                  />
                                  <span>Tab mới</span>
                                </label>
                              </div>
                            )}
                          </td>

                          {/* Cột 4: Hiển thị */}
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11.5 }}>
                              <input
                                type="checkbox"
                                checked={item.active !== false}
                                onChange={(e) => handleUpdateMenuItem(idx, { active: e.target.checked })}
                              />
                              <span style={{ color: item.active !== false ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {item.active !== false ? 'Bật' : 'Ẩn'}
                              </span>
                            </label>
                          </td>

                          {/* Cột 5: Thao tác */}
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <button
                                type="button"
                                className="btn-icon-action accent"
                                onClick={() => handleAddSubItem(idx)}
                                title="Thêm mục con cấp 2 cho mục này"
                              >
                                <Plus size={11} />
                                <span>Con</span>
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action"
                                disabled={idx === 0}
                                onClick={() => handleMoveMenuItem(idx, 'up')}
                                title="Chuyển lên trước"
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action"
                                disabled={idx === menuItems.length - 1}
                                onClick={() => handleMoveMenuItem(idx, 'down')}
                                title="Chuyển xuống sau"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action danger"
                                onClick={() => handleDeleteMenuItem(idx)}
                                title="Xóa mục menu này"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Các hàng Menu con cấp 2 (nếu có) */}
                        {item.children && item.children.map((sub, sIdx) => (
                          <tr
                            key={sub.id}
                            style={{
                              borderBottom: '1px dashed var(--border-color)',
                              background: 'rgba(212, 168, 106, 0.02)',
                              fontSize: 12
                            }}
                          >
                            {/* Cột 1: Tên mục con với thụt lề cây */}
                            <td style={{ padding: '6px 12px 6px 32px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CornerDownRight size={13} style={{ color: 'var(--accent-gold)', opacity: 0.8, flexShrink: 0 }} />
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    color: 'var(--text-muted)',
                                    flexShrink: 0
                                  }}
                                >
                                  {idx + 1}.{sIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={sub.label}
                                  onChange={(e) => handleUpdateSubItem(idx, sIdx, { label: e.target.value })}
                                  placeholder="Tên menu con..."
                                  style={{
                                    flex: 1,
                                    minWidth: 100,
                                    padding: '5px 8px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 4,
                                    color: 'var(--text-main)',
                                    fontSize: 12
                                  }}
                                />
                              </div>
                            </td>

                            {/* Cột 2: Kiểu liên kết con */}
                            <td style={{ padding: '6px 12px' }}>
                              <select
                                value={sub.linkType}
                                onChange={(e) => handleUpdateSubItem(idx, sIdx, { linkType: e.target.value as any })}
                                style={{
                                  width: '100%',
                                  padding: '5px 8px',
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 4,
                                  color: 'var(--text-main)',
                                  fontSize: 11.5
                                }}
                              >
                                <option value="page">Chuyển trang</option>
                                <option value="anchor">Cuộn tới #</option>
                                <option value="custom">URL ngoài</option>
                              </select>
                            </td>

                            {/* Cột 3: Đích đến con */}
                            <td style={{ padding: '6px 12px' }}>
                              {sub.linkType === 'page' ? (
                                <select
                                  value={sub.target}
                                  onChange={(e) => handleUpdateSubItem(idx, sIdx, { target: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 4,
                                    color: 'var(--text-main)',
                                    fontSize: 11.5
                                  }}
                                >
                                  <option value="home">Trang chủ</option>
                                  <option value="rooms">Gian phòng 360°</option>
                                  <option value="artifacts">Kho cổ vật 3D</option>
                                  <option value="guide">Cẩm nang & Sơ đồ</option>
                                </select>
                              ) : sub.linkType === 'anchor' ? (
                                <select
                                  value={sub.target.replace(/^#/, '')}
                                  onChange={(e) => handleUpdateSubItem(idx, sIdx, { target: e.target.value })}
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 4,
                                    color: 'var(--text-main)',
                                    fontSize: 11.5
                                  }}
                                >
                                  <option value="intro">#intro (Giới thiệu)</option>
                                  <option value="rooms">#rooms (Gian phòng 360°)</option>
                                  <option value="artifacts">#artifacts (Cổ vật 3D)</option>
                                  <option value="guide">#guide (Cẩm nang)</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={sub.target}
                                  onChange={(e) => handleUpdateSubItem(idx, sIdx, { target: e.target.value })}
                                  placeholder="https://..."
                                  style={{
                                    width: '100%',
                                    padding: '5px 8px',
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 4,
                                    color: 'var(--text-main)',
                                    fontSize: 11.5
                                  }}
                                />
                              )}
                            </td>

                            {/* Cột 4: Hiển thị con */}
                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 3, cursor: 'pointer', fontSize: 11 }}>
                                <input
                                  type="checkbox"
                                  checked={sub.active !== false}
                                  onChange={(e) => handleUpdateSubItem(idx, sIdx, { active: e.target.checked })}
                                />
                                <span style={{ color: sub.active !== false ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                  {sub.active !== false ? 'Bật' : 'Ẩn'}
                                </span>
                              </label>
                            </td>

                            {/* Cột 5: Thao tác con */}
                            <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn-icon-action danger"
                                style={{ padding: '3px 6px' }}
                                onClick={() => handleDeleteSubItem(idx, sIdx)}
                                title="Xóa menu con này"
                              >
                                <Trash2 size={11} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Thanh công cụ chân bảng */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <button
                type="button"
                className="btn btn-accent btn-sm"
                onClick={handleAddMenuItem}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <Plus size={13} />
                <span>Thêm mục Menu mới (Cấp 1)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetDefaultMenu}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <RotateCcw size={12} />
                  <span>Khôi phục menu chuẩn</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSave('Menu Header')}
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <Save size={13} />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Menu Header'}</span>
                </button>
              </div>
            </div>
          </div>

          {renderSectionNavFooter(1, 'Phần 2: Menu Header')}
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
                  3. Khung Banner Hero Toàn Cảnh (Đầu trang)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý tiêu đề chào đón, khẩu hiệu, 2 nút kêu gọi CTA, ảnh nền toàn cảnh và video nền
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
                Tên nút bấm chính (Nút 1 - Bắt đầu Tour 360°)
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
                Tên nút bấm phụ (Nút 2 - Chiêm ngưỡng Cổ vật 3D)
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
            {renderSectionNavFooter(2, 'Phần 3: Banner Hero')}
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
                  4. Khung Giới Thiệu Lịch Sử & Kiến Trúc
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ định danh, tiêu đề, bài viết giới thiệu, huy hiệu công trình và ảnh chụp kiến trúc
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
                Dòng chữ phụ phía trên (Tag)
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
                Huy hiệu danh hiệu (Hiển thị góc ảnh)
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
                Chữ trên nút bấm chuyển trang
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
            {renderSectionNavFooter(3, 'Phần 4: Giới thiệu Không gian')}
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
                  5. Khung Gian Phòng Trưng Bày 360°
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ khối, tiêu đề khối, đoạn giới thiệu trải nghiệm và nhãn nút chuyển sang trang danh sách phòng
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
                Dòng chữ phụ phía trên (Tag nhỏ)
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
                Tiêu đề chính của khối
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
                Chữ trên nút bấm chuyển trang
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
                Đoạn văn giới thiệu ngắn
              </label>
              <textarea
                rows={3}
                value={form.roomsDesc || ''}
                onChange={(e) => handleChange('roomsDesc', e.target.value)}
                placeholder="VD: Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '16px', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={16} />
                <span>Cài đặt gian phòng đại diện & hình ảnh hiển thị</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Chọn gian phòng đại diện hiển thị ở Trang Chủ:
                  </label>
                  <select
                    value={form.roomsFeaturedId || ''}
                    onChange={(e) => handleChange('roomsFeaturedId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="">-- Mặc định (Tự động lấy gian phòng đầu tiên) --</option>
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code ? `[${r.code}] ` : ''}{r.name} {r.period ? `— ${r.period}` : ''}
                      </option>
                    ))}
                  </select>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {availableRooms.length > 0
                      ? `Hiện có ${availableRooms.length} gian phòng sẵn sàng hiển thị.`
                      : 'Hệ thống hiện chưa có gian phòng nào. Quản trị viên vui lòng thêm phòng tại mục "Trang Gian phòng 360°".'}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Ảnh bìa đại diện riêng (Không bắt buộc):
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.roomsShowcaseImageUrl || ''}
                      onChange={(e) => handleChange('roomsShowcaseImageUrl', e.target.value)}
                      placeholder="Dán link ảnh hoặc bấm nút Tải ảnh bên cạnh"
                      style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 12.5 }}
                    />
                    <button
                      type="button"
                      onClick={() => roomsShowcaseInputRef.current?.click()}
                      disabled={uploadingRoomsShowcase}
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        color: 'var(--gold)',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: uploadingRoomsShowcase ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Upload size={13} />
                      <span>{uploadingRoomsShowcase ? 'Đang tải...' : 'Tải ảnh'}</span>
                    </button>
                    <input
                      type="file"
                      ref={roomsShowcaseInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingRoomsShowcase(true);
                          const res = await api.uploadBrandingImage(file);
                          if (res && res.url) {
                            handleChange('roomsShowcaseImageUrl', res.url);
                            showToast('Đã tải ảnh đại diện gian phòng lên thành công!', 'success');
                          }
                        } catch (err: any) {
                          showToast(err.message || 'Lỗi tải ảnh lên', 'error');
                        } finally {
                          setUploadingRoomsShowcase(false);
                          if (roomsShowcaseInputRef.current) roomsShowcaseInputRef.current.value = '';
                        }
                      }}
                    />
                  </div>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Nếu không chọn ảnh riêng, hệ thống sẽ tự động dùng ảnh 360° thực tế của gian phòng được chọn.
                  </span>
                </div>
              </div>

              {form.roomsShowcaseImageUrl && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={form.roomsShowcaseImageUrl}
                    alt="Rooms Showcase Preview"
                    style={{ height: 60, width: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('roomsShowcaseImageUrl', '')}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      borderRadius: 6,
                      fontSize: 11.5,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Xóa ảnh riêng (Quay lại dùng ảnh phòng)</span>
                  </button>
                </div>
              )}
            </div>
            {renderSectionNavFooter(4, 'Phần 5: Gian phòng 360°')}
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
                  6. Khung Kho Tàng Cổ Vật Di Sản 3D
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ khối, tiêu đề khối, đoạn giới thiệu bảo vật 3D và nhãn nút chuyển sang kho hiện vật
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
                Dòng chữ phụ phía trên (Tag nhỏ)
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
                Tiêu đề chính của khối
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
                Chữ trên nút bấm chuyển trang
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
                Đoạn văn giới thiệu ngắn
              </label>
              <textarea
                rows={3}
                value={form.artifactsDesc || ''}
                onChange={(e) => handleChange('artifactsDesc', e.target.value)}
                placeholder="VD: Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            {renderSectionNavFooter(5, 'Phần 6: Cổ vật 3D')}
          </div>
        </section>
        )}

        {/* KHUNG 7: KHỐI CẨM NANG & SƠ ĐỒ THAM QUAN (HIỂN THỊ TRANG CHỦ) */}
        {activeSectionId === 'panel-guide-preview' && (
        <section
          id="panel-guide-preview"
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
                  7. Khối Cẩm Nang & Sơ Đồ Tham Quan (Hiển thị Trang Chủ)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý thẻ định danh, tiêu đề, mô tả và nút điều hướng của khối cẩm nang trên Trang chủ
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSave('Khối Cẩm nang tham quan')}
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              <span>Lưu Khối Cẩm nang</span>
            </button>
          </div>

          {/* Banner thông báo điều hướng chuyên nghiệp */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 10,
              background: 'rgba(212, 168, 106, 0.08)',
              border: '1px solid rgba(212, 168, 106, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
                Toàn bộ nội dung chuyên sâu của trang tham quan thực địa (gồm <strong>Sơ đồ mặt bằng kiến trúc</strong>, <strong>Giờ mở cửa</strong>, <strong>Bảng giá vé</strong>, <strong>Google Maps chỉ đường</strong> và <strong>Quy định tham quan</strong>) được quản lý độc lập tại phân hệ riêng biệt.
              </span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab('guide')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontWeight: 600 }}
              >
                <span>Chuyển sang Trang Cẩm nang & Sơ đồ</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                Dòng chữ phụ phía trên (Tag nhỏ)
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
                Tiêu đề chính của khối
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
                Chữ trên nút bấm chuyển trang
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
                Đoạn văn giới thiệu ngắn
              </label>
              <textarea
                rows={3}
                value={form.guideDesc || ''}
                onChange={(e) => handleChange('guideDesc', e.target.value)}
                placeholder="Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế..."
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
              />
            </div>
            {renderSectionNavFooter(6, 'Phần 7: Khối Cẩm nang')}
          </div>
        </section>
        )}

        {/* KHUNG 8: CHÂN TRANG & THÔNG TIN LIÊN HỆ */}
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
                  8. Khung Chân Trang & Thông Tin Liên Hệ (Footer)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý địa chỉ thực tế, đường dây nóng, email tiếp nhận thông tin và bản quyền hiển thị
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
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
            {renderSectionNavFooter(7, 'Phần 8: Chân trang & Liên hệ')}
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
            Hệ thống đã kết nối & Tự động đồng bộ
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

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        cancelText={confirmModalConfig.cancelText}
        type={confirmModalConfig.type}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
