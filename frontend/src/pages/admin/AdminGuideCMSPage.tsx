import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Save,
  RotateCcw,
  Globe,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  Ticket,
  MapPin,
  ShieldCheck,
  Info,
  ArrowLeft,
  ArrowRight,
  Compass,
  Trash2,
  Cpu,
  Zap
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminGuideCMSPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  // 5 phân mục con chuẩn mực quản lý độc lập cho Trang Cẩm nang & Sơ đồ
  const [guideSubTab, setGuideSubTab] = useState<'info' | 'floorplan' | 'hours' | 'transit' | 'rules'>('info');
  const [isSaving, setIsSaving] = useState(false);

  // Modal Xác nhận
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

  // Tải file ảnh sơ đồ mặt bằng
  const guideMapInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGuideMap, setUploadingGuideMap] = useState(false);
  const [analyzingMap, setAnalyzingMap] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [form, setForm] = useState({
    // Phân mục 1: Giới thiệu chung & Tiêu đề
    guideTag: branding.guideTag || 'Kế Hoạch & Sơ Đồ',
    guideTitle: branding.guideTitle || 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
    guideCtaText: branding.guideCtaText || 'Xem cẩm nang & sơ đồ tham quan',
    guideDesc:
      branding.guideDesc ||
      'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',

    // Phân mục 2: Sơ đồ mặt bằng kiến trúc
    guideMapTitle: branding.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày',
    guideMapDesc:
      branding.guideMapDesc ||
      'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày giúp quý khách định hướng lộ trình thuận tiện nhất.',
    guideMapUrl: branding.guideMapUrl || '',

    // Phân mục 3: Giờ mở cửa & Bảng giá vé
    guideOpeningDays: branding.guideOpeningDays || 'Thứ Ba – Chủ Nhật',
    guideMorningHours: branding.guideMorningHours || '08:00 – 11:30',
    guideAfternoonHours: branding.guideAfternoonHours || '13:30 – 17:00',
    guideClosedNote: branding.guideClosedNote || 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật và vệ sinh chuyên sâu',
    guideTicketAdult: branding.guideTicketAdult || '30.000 ₫',
    guideTicketStudent: branding.guideTicketStudent || '15.000 ₫',
    guideTicketChild: branding.guideTicketChild || 'Miễn phí cho trẻ em dưới 6 tuổi, người cao tuổi & người khuyết tật',

    // Phân mục 4: Vị trí, Di chuyển & Google Maps
    address: branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    hotline: branding.hotline || '(028) 3829 8146',
    guideBusRoutes:
      branding.guideBusRoutes ||
      'Tuyến xe buýt số 05, 06, 14, 19, 52 dừng tại trạm Thảo Cầm Viên (ngay cổng đường Nguyễn Bỉnh Khiêm).',
    guideParkingInfo:
      branding.guideParkingInfo ||
      'Bãi đỗ xe máy và ô tô thuận tiện ngay trong khuôn viên sân bảo tàng, có nhân viên an ninh hướng dẫn.',
    guideGoogleMapsUrl: branding.guideGoogleMapsUrl || '',
    guideGoogleMapsEmbed: branding.guideGoogleMapsEmbed || '',

    // Phân mục 5: Tiện ích & Quy định tham quan (4 mục chuẩn)
    guideRule1Title: branding.guideRule1Title || 'Quét mã QR tại tủ hiện vật',
    guideRule1Desc:
      branding.guideRule1Desc ||
      'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
    guideRule2Title: branding.guideRule2Title || 'Thuyết minh Audio Guide song ngữ',
    guideRule2Desc:
      branding.guideRule2Desc ||
      'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
    guideRule3Title: branding.guideRule3Title || 'Bảo quản di sản & Hiện vật',
    guideRule3Desc:
      branding.guideRule3Desc ||
      'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
    guideRule4Title: branding.guideRule4Title || 'Trang phục & Văn minh tham quan',
    guideRule4Desc:
      branding.guideRule4Desc ||
      'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.'
  });

  useEffect(() => {
    setForm({
      guideTag: branding.guideTag || 'Kế Hoạch & Sơ Đồ',
      guideTitle: branding.guideTitle || 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
      guideCtaText: branding.guideCtaText || 'Xem cẩm nang & sơ đồ tham quan',
      guideDesc:
        branding.guideDesc ||
        'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',

      guideMapTitle: branding.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày',
      guideMapDesc:
        branding.guideMapDesc ||
        'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày giúp quý khách định hướng lộ trình thuận tiện nhất.',
      guideMapUrl: branding.guideMapUrl || '',

      guideOpeningDays: branding.guideOpeningDays || 'Thứ Ba – Chủ Nhật',
      guideMorningHours: branding.guideMorningHours || '08:00 – 11:30',
      guideAfternoonHours: branding.guideAfternoonHours || '13:30 – 17:00',
      guideClosedNote:
        branding.guideClosedNote || 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật và vệ sinh chuyên sâu',
      guideTicketAdult: branding.guideTicketAdult || '30.000 ₫',
      guideTicketStudent: branding.guideTicketStudent || '15.000 ₫',
      guideTicketChild: branding.guideTicketChild || 'Miễn phí cho trẻ em dưới 6 tuổi, người cao tuổi & người khuyết tật',

      address: branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      hotline: branding.hotline || '(028) 3829 8146',
      guideBusRoutes:
        branding.guideBusRoutes ||
        'Tuyến xe buýt số 05, 06, 14, 19, 52 dừng tại trạm Thảo Cầm Viên (ngay cổng đường Nguyễn Bỉnh Khiêm).',
      guideParkingInfo:
        branding.guideParkingInfo ||
        'Bãi đỗ xe máy và ô tô thuận tiện ngay trong khuôn viên sân bảo tàng, có nhân viên an ninh hướng dẫn.',
      guideGoogleMapsUrl: branding.guideGoogleMapsUrl || '',
      guideGoogleMapsEmbed: branding.guideGoogleMapsEmbed || '',

      guideRule1Title: branding.guideRule1Title || 'Quét mã QR tại tủ hiện vật',
      guideRule1Desc:
        branding.guideRule1Desc ||
        'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
      guideRule2Title: branding.guideRule2Title || 'Thuyết minh Audio Guide song ngữ',
      guideRule2Desc:
        branding.guideRule2Desc ||
        'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
      guideRule3Title: branding.guideRule3Title || 'Bảo quản di sản & Hiện vật',
      guideRule3Desc:
        branding.guideRule3Desc ||
        'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
      guideRule4Title: branding.guideRule4Title || 'Trang phục & Văn minh tham quan',
      guideRule4Desc:
        branding.guideRule4Desc ||
        'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.'
    });
  }, [branding]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (sectionName?: string) => {
    try {
      setIsSaving(true);
      await updateBranding(form);
      const title = sectionName ? `Đã lưu thành công: ${sectionName}` : 'Đã lưu toàn bộ nội dung Trang Cẩm nang & Sơ đồ';
      showToast(title, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Có lỗi xảy ra khi lưu dữ liệu', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadGuideMap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP, SVG)', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      showToast('Kích thước ảnh sơ đồ mặt bằng không được vượt quá 20MB', 'info');
      return;
    }

    try {
      setUploadingGuideMap(true);
      const res = await api.uploadBrandingImage(file);
      if (res && res.url) {
        handleChange('guideMapUrl', res.url);
        showToast('Đã tải ảnh sơ đồ thành công! Đang kích hoạt phân tích Pure CV...', 'success');
        handleAnalyzeFloorPlan(res.url);
      }
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải ảnh sơ đồ mặt bằng lên server', 'error');
    } finally {
      setUploadingGuideMap(false);
      if (guideMapInputRef.current) {
        guideMapInputRef.current.value = '';
      }
    }
  };

  const handleAnalyzeFloorPlan = async (targetUrl?: string) => {
    const urlToAnalyze = targetUrl || form.guideMapUrl;
    if (!urlToAnalyze) {
      showToast('Vui lòng tải ảnh sơ đồ lên trước khi phân tích', 'info');
      return;
    }

    try {
      setAnalyzingMap(true);
      const formData = new FormData();
      formData.append('imageUrl', urlToAnalyze);
      formData.append('title', form.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày');
      formData.append('description', form.guideMapDesc || '');

      const res = await api.analyzeFloorPlan(formData);
      setAnalysisResult(res);
      showToast(
        `⚡ Đã phân tích bản đồ thành công qua Pure CV! Nhận diện ${res.summary?.nodeCount || 0} phòng và ${res.summary?.edgeCount || 0} liên kết cửa (${res.data?.analysisAlgorithm || 'Pure-CV'}).`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi phân tích sơ đồ', 'error');
    } finally {
      setAnalyzingMap(false);
    }
  };

  const handleResetDefaults = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Khôi phục nội dung Cẩm nang mẫu chuẩn?',
      message: 'Hành động này sẽ điền lại toàn bộ thông tin chuẩn về giờ mở cửa, giá vé, bản đồ và quy định tham quan của Bảo tàng Lịch sử TP.HCM.',
      confirmText: 'Khôi phục mẫu',
      cancelText: 'Hủy bỏ',
      type: 'warning',
      onConfirm: () => {
        setForm((prev) => ({
          ...prev,
          guideTag: 'Kế Hoạch & Sơ Đồ',
          guideTitle: 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
          guideCtaText: 'Xem cẩm nang & sơ đồ tham quan',
          guideDesc:
            'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',
          guideMapTitle: 'Sơ đồ mặt bằng các gian trưng bày',
          guideMapDesc:
            'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày giúp quý khách định hướng lộ trình thuận tiện nhất.',
          guideOpeningDays: 'Thứ Ba – Chủ Nhật',
          guideMorningHours: '08:00 – 11:30',
          guideAfternoonHours: '13:30 – 17:00',
          guideClosedNote: 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật.',
          guideTicketAdult: '30.000 ₫',
          guideTicketStudent: '15.000 ₫',
          guideTicketChild: 'Miễn phí',
          guideBusRoutes:
            'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.',
          guideParkingInfo:
            'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.',
          guideRule1Title: 'Quét mã QR tại tủ hiện vật',
          guideRule1Desc:
            'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
          guideRule2Title: 'Thuyết minh Audio Guide song ngữ',
          guideRule2Desc:
            'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
          guideRule3Title: 'Bảo quản di sản & Hiện vật',
          guideRule3Desc:
            'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
          guideRule4Title: 'Trang phục & Văn minh tham quan',
          guideRule4Desc:
            'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.'
        }));
        showToast('Đã khôi phục nội dung mẫu. Nhấn "Lưu tất cả thay đổi" để áp dụng.', 'info');
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Danh sách 5 phân mục chuẩn mực của Trang Cẩm nang
  const GUIDE_SUBTABS = [
    { id: 'info', num: 1, label: '1. Giới thiệu chung', desc: 'Tiêu đề trang, thẻ định danh và đoạn mô tả giới thiệu', icon: Info },
    { id: 'floorplan', num: 2, label: '2. Sơ đồ mặt bằng', desc: 'Tiêu đề, mô tả và file ảnh sơ đồ kiến trúc tham quan', icon: Compass },
    { id: 'hours', num: 3, label: '3. Giờ mở cửa & Giá vé', desc: 'Khung giờ đón khách, lưu ý đóng cửa và biểu phí vé niêm yết', icon: Clock },
    { id: 'transit', num: 4, label: '4. Vị trí & Google Maps', desc: 'Địa chỉ, hotline, xe buýt, bãi xe và bản đồ tương tác', icon: MapPin },
    { id: 'rules', num: 5, label: '5. Tiện ích & Quy định', desc: '4 quy định tham quan văn minh và tiện ích phục vụ khách', icon: ShieldCheck }
  ] as const;

  // Thanh điều hướng chân phân mục (Phần trước / Lưu / Phần tiếp theo)
  const renderSubTabFooter = (currentIndex: number, sectionName: string) => {
    const prevTab = currentIndex > 0 ? GUIDE_SUBTABS[currentIndex - 1] : null;
    const nextTab = currentIndex < GUIDE_SUBTABS.length - 1 ? GUIDE_SUBTABS[currentIndex + 1] : null;

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
        {prevTab ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setGuideSubTab(prevTab.id as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} />
            <span>Phần trước: {prevTab.label}</span>
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

        {nextTab ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setGuideSubTab(nextTab.id as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Phần tiếp theo: {nextTab.label}</span>
            <ArrowRight size={14} />
          </button>
        ) : <div />}
      </div>
    );
  };

  return (
    <div className="admin-content" style={{ paddingBottom: 100 }}>
      {/* 1. THANH TIÊU ĐỀ TRANG QUẢN TRỊ TRANG CẨM NANG & SƠ ĐỒ */}
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
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
              Quản Lý Giao Diện & Nội Dung Trang Cẩm Nang & Sơ Đồ
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 740, lineHeight: 1.5 }}>
              Quản lý độc lập toàn bộ nội dung trang Cẩm nang tham quan thực địa: Sơ đồ mặt bằng kiến trúc, thời gian mở cửa, bảng giá vé niêm yết, vị trí chỉ đường Google Maps và các quy định tiện ích.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/?page=guide"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            <Globe size={15} />
            <span>Xem Trang Cẩm Nang Khách</span>
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

      {/* 2. THANH PHÂN NHÓM CHUYÊN ĐỀ (SUB-TABS) - GỌN GÀNG, CHUẨN MỰC */}
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
          Chọn phân mục:
        </span>

        {GUIDE_SUBTABS.map((tab) => {
          const isActive = guideSubTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGuideSubTab(tab.id as any)}
              title={tab.desc}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
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
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. NỘI DUNG TỪNG PHÂN MỤC */}
      <section
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 24,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header phân mục hiện tại */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
              {guideSubTab === 'info' && '1. Giới Thiệu Chung & Tiêu Đề Trang Cẩm Nang'}
              {guideSubTab === 'floorplan' && '2. Sơ Đồ Mặt Bằng & Bản Đồ Kiến Trúc'}
              {guideSubTab === 'hours' && '3. Thời Gian Hoạt Động & Biểu Phí Vé Niêm Yết'}
              {guideSubTab === 'transit' && '4. Vị Trí, Chỉ Dẫn Di Chuyển & Google Maps'}
              {guideSubTab === 'rules' && '5. Tiện Ích Phục Vụ & Nội Quy Tham Quan Văn Minh'}
            </h2>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {guideSubTab === 'info' && 'Cấu hình tiêu đề chính, thẻ định danh, đoạn văn giới thiệu và nút điều hướng của trang cẩm nang.'}
              {guideSubTab === 'floorplan' && 'Tải lên hình ảnh sơ đồ mặt bằng kiến trúc bảo tàng, định vị các cánh trưng bày phục vụ khách thực địa.'}
              {guideSubTab === 'hours' && 'Cập nhật khung giờ đón khách ca sáng/chiều, các ngày mở cửa trong tuần và bảng giá vé các đối tượng.'}
              {guideSubTab === 'transit' && 'Địa chỉ thực tế, số điện thoại đường dây nóng, tuyến xe buýt, bãi xe và mã nhúng bản đồ trực tiếp.'}
              {guideSubTab === 'rules' && 'Thiết lập 4 quy tắc văn minh và tiện ích trải nghiệm (mã QR hiện vật, thuyết minh audio guide, bảo quản).'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSave(
              guideSubTab === 'info' ? 'Giới thiệu chung' :
              guideSubTab === 'floorplan' ? 'Sơ đồ mặt bằng' :
              guideSubTab === 'hours' ? 'Giờ mở cửa & Giá vé' :
              guideSubTab === 'transit' ? 'Vị trí & Google Maps' : 'Tiện ích & Quy định'
            )}
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={14} />
            <span>Lưu phân mục này</span>
          </button>
        </div>

        {/* PHÂN MỤC 1: GIỚI THIỆU CHUNG & TIÊU ĐỀ TRANG CẨM NANG */}
        {guideSubTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Thẻ định danh (Tagline pill)
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
                  Tiêu đề chính trang Cẩm nang
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
                  Đoạn mô tả giới thiệu cẩm nang tham quan
                </label>
                <textarea
                  rows={3}
                  value={form.guideDesc || ''}
                  onChange={(e) => handleChange('guideDesc', e.target.value)}
                  placeholder="Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
                />
              </div>
            </div>
            {renderSubTabFooter(0, 'Phần 1: Giới thiệu chung')}
          </div>
        )}

        {/* PHÂN MỤC 2: SƠ ĐỒ MẶT BẰNG KIẾN TRÚC */}
        {guideSubTab === 'floorplan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Tiêu đề sơ đồ mặt bằng
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
                  Mô tả sơ đồ mặt bằng
                </label>
                <input
                  type="text"
                  value={form.guideMapDesc || ''}
                  onChange={(e) => handleChange('guideMapDesc', e.target.value)}
                  placeholder="Bản đồ kiến trúc không gian và vị trí các gian phòng..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Đường dẫn hoặc tải file ảnh sơ đồ mặt bằng
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={form.guideMapUrl || ''}
                    onChange={(e) => handleChange('guideMapUrl', e.target.value)}
                    placeholder="https://... hoặc bấm nút tải ảnh bên cạnh"
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
                    <span>{uploadingGuideMap ? 'Đang tải...' : 'Tải ảnh sơ đồ lên'}</span>
                  </button>
                  {form.guideMapUrl && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleChange('guideMapUrl', '')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <Trash2 size={14} />
                      <span>Xóa ảnh</span>
                    </button>
                  )}
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Hỗ trợ các định dạng hình ảnh PNG, JPG, WEBP chất lượng cao. Ảnh sẽ hiển thị tại phần Sơ đồ mặt bằng trang Cẩm nang và hỗ trợ người xem phóng to xem chi tiết.
                </span>
              </div>

              {form.guideMapUrl && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Xem trước ảnh sơ đồ mặt bằng & phân tích không gian:
                    </label>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAnalyzeFloorPlan()}
                      disabled={analyzingMap}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#D97706', borderColor: '#D97706' }}
                    >
                      <Zap size={14} />
                      <span>{analyzingMap ? 'Đang phân tích Pure CV...' : 'Phân tích bản đồ (Pure CV Engine)'}</span>
                    </button>
                  </div>
                  <div style={{ width: '100%', maxHeight: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <img src={form.guideMapUrl} alt="Preview sơ đồ" style={{ width: '100%', height: 280, objectFit: 'contain', background: '#0D111A' }} />
                    {analyzingMap && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 8 }}>
                        <div className="spinner-border" style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: 12, fontWeight: 500 }}>Đang phân tích cấu trúc điểm ảnh & tô-pô không gian...</span>
                      </div>
                    )}
                  </div>
                  {analysisResult && (
                    <div style={{ padding: '10px 14px', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Cpu size={18} style={{ color: '#D97706' }} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                            Đã nhận diện thành công: {analysisResult.summary?.nodeCount || 0} Gian phòng & {analysisResult.summary?.edgeCount || 0} Liên kết cửa
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Thuật toán: {analysisResult.data?.analysisAlgorithm || 'Pure-CV-RayCast-Otsu-v1'} (100% Cục bộ không qua AI)
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                        Đã đồng bộ CSDL MongoDB
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {renderSubTabFooter(1, 'Phần 2: Sơ đồ mặt bằng')}
          </div>
        )}

        {/* PHÂN MỤC 3: GIỜ MỞ CỬA & BIỂU PHÍ VÉ */}
        {guideSubTab === 'hours' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Thời gian hoạt động đón khách
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Ngày đón khách trong tuần
                </label>
                <input
                  type="text"
                  value={form.guideOpeningDays || ''}
                  onChange={(e) => handleChange('guideOpeningDays', e.target.value)}
                  placeholder="Thứ Ba – Chủ Nhật"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Khung giờ ca sáng
                </label>
                <input
                  type="text"
                  value={form.guideMorningHours || ''}
                  onChange={(e) => handleChange('guideMorningHours', e.target.value)}
                  placeholder="08:00 – 11:30"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Khung giờ ca chiều
                </label>
                <input
                  type="text"
                  value={form.guideAfternoonHours || ''}
                  onChange={(e) => handleChange('guideAfternoonHours', e.target.value)}
                  placeholder="13:30 – 17:00"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Lưu ý ngày nghỉ định kỳ & Giờ ngưng nhận vé
                </label>
                <input
                  type="text"
                  value={form.guideClosedNote || ''}
                  onChange={(e) => handleChange('guideClosedNote', e.target.value)}
                  placeholder="Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10, marginTop: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Biểu phí vé tham quan niêm yết
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Giá vé: Người lớn (Khách VN & Quốc tế)
                </label>
                <input
                  type="text"
                  value={form.guideTicketAdult || ''}
                  onChange={(e) => handleChange('guideTicketAdult', e.target.value)}
                  placeholder="30.000 ₫"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Giá vé: Học sinh, Sinh viên
                </label>
                <input
                  type="text"
                  value={form.guideTicketStudent || ''}
                  onChange={(e) => handleChange('guideTicketStudent', e.target.value)}
                  placeholder="15.000 ₫"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Giá vé: Trẻ em & Đối tượng chính sách
                </label>
                <input
                  type="text"
                  value={form.guideTicketChild || ''}
                  onChange={(e) => handleChange('guideTicketChild', e.target.value)}
                  placeholder="Miễn phí"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>
            </div>
            {renderSubTabFooter(2, 'Phần 3: Giờ mở cửa & Giá vé')}
          </div>
        )}

        {/* PHÂN MỤC 4: VỊ TRÍ, DI CHUYỂN & GOOGLE MAPS */}
        {guideSubTab === 'transit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Địa chỉ thực địa & Chỉ dẫn phương tiện di chuyển
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Địa chỉ thực địa bảo tàng
                </label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Đường dây nóng / Hotline hỗ trợ
                </label>
                <input
                  type="text"
                  value={form.hotline || ''}
                  onChange={(e) => handleChange('hotline', e.target.value)}
                  placeholder="(028) 3829 8146"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Chỉ dẫn tuyến xe buýt
                </label>
                <input
                  type="text"
                  value={form.guideBusRoutes || ''}
                  onChange={(e) => handleChange('guideBusRoutes', e.target.value)}
                  placeholder="Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Chỉ dẫn bãi đỗ xe máy & ô tô
                </label>
                <input
                  type="text"
                  value={form.guideParkingInfo || ''}
                  onChange={(e) => handleChange('guideParkingInfo', e.target.value)}
                  placeholder="Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10, marginTop: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Tích hợp bản đồ Google Maps
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Đường dẫn Google Maps (Chỉ đường khi khách bấm nút trên trang)
                </label>
                <input
                  type="text"
                  value={form.guideGoogleMapsUrl || ''}
                  onChange={(e) => handleChange('guideGoogleMapsUrl', e.target.value)}
                  placeholder="VD: https://maps.app.goo.gl/... hoặc https://www.google.com/maps?cid=..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Khách tham quan bấm nút "Mở chỉ đường trên ứng dụng Google Maps" sẽ chuyển hướng tới đúng vị trí bảo tàng.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Mã nhúng Bản đồ Google Maps (Dán mã iframe hoặc liên kết embed)
                </label>
                <textarea
                  rows={3}
                  value={form.guideGoogleMapsEmbed || ''}
                  onChange={(e) => handleChange('guideGoogleMapsEmbed', e.target.value)}
                  placeholder='Dán mã <iframe src="https://www.google.com/maps/embed?..." ...></iframe> hoặc link https://www.google.com/maps/embed?...'
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 12.5, fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Hệ thống tự động trích xuất URL từ mã thẻ &lt;iframe&gt; để hiển thị bản đồ trực tiếp trên trang Cẩm nang.
                </span>
              </div>

              {form.guideGoogleMapsEmbed && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Xem trước khung bản đồ Google Maps:
                  </label>
                  <div style={{ width: '100%', height: 260, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <iframe
                      src={form.guideGoogleMapsEmbed.includes('src=') ? (form.guideGoogleMapsEmbed.match(/src=["']([^"']+)["']/i)?.[1] || '') : form.guideGoogleMapsEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Maps Preview"
                    />
                  </div>
                </div>
              )}
            </div>
            {renderSubTabFooter(3, 'Phần 4: Vị trí & Google Maps')}
          </div>
        )}

        {/* PHÂN MỤC 5: TIỆN ÍCH & QUY ĐỊNH THAM QUAN */}
        {guideSubTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                4 quy định tham quan văn minh & tiện ích phục vụ khách
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {/* Mục 1 */}
              <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: 4 }}>
                    Quy tắc 01
                  </span>
                </div>
                <input
                  type="text"
                  value={form.guideRule1Title || ''}
                  onChange={(e) => handleChange('guideRule1Title', e.target.value)}
                  placeholder="Tiêu đề quy tắc 01"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={3}
                  value={form.guideRule1Desc || ''}
                  onChange={(e) => handleChange('guideRule1Desc', e.target.value)}
                  placeholder="Nội dung chi tiết quy tắc 01..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              {/* Mục 2 */}
              <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: 4 }}>
                    Quy tắc 02
                  </span>
                </div>
                <input
                  type="text"
                  value={form.guideRule2Title || ''}
                  onChange={(e) => handleChange('guideRule2Title', e.target.value)}
                  placeholder="Tiêu đề quy tắc 02"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={3}
                  value={form.guideRule2Desc || ''}
                  onChange={(e) => handleChange('guideRule2Desc', e.target.value)}
                  placeholder="Nội dung chi tiết quy tắc 02..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              {/* Mục 3 */}
              <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: 4 }}>
                    Quy tắc 03
                  </span>
                </div>
                <input
                  type="text"
                  value={form.guideRule3Title || ''}
                  onChange={(e) => handleChange('guideRule3Title', e.target.value)}
                  placeholder="Tiêu đề quy tắc 03"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={3}
                  value={form.guideRule3Desc || ''}
                  onChange={(e) => handleChange('guideRule3Desc', e.target.value)}
                  placeholder="Nội dung chi tiết quy tắc 03..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              {/* Mục 4 */}
              <div style={{ background: 'var(--bg-card)', padding: 18, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: 4 }}>
                    Quy tắc 04
                  </span>
                </div>
                <input
                  type="text"
                  value={form.guideRule4Title || ''}
                  onChange={(e) => handleChange('guideRule4Title', e.target.value)}
                  placeholder="Tiêu đề quy tắc 04"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={3}
                  value={form.guideRule4Desc || ''}
                  onChange={(e) => handleChange('guideRule4Desc', e.target.value)}
                  placeholder="Nội dung chi tiết quy tắc 04..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>
            </div>
            {renderSubTabFooter(4, 'Phần 5: Tiện ích & Quy định')}
          </div>
        )}
      </section>

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
            Dữ liệu CSDL MongoDB & Đồng bộ tức thì
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
