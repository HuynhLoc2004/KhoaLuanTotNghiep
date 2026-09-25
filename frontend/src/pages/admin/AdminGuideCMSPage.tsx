import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Save,
  RotateCcw,
  Globe,
  ExternalLink,
  Upload,
  Compass,
  CheckCircle2,
  Clock,
  Ticket,
  MapPin,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api, API_ROOT } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminGuideCMSPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [guideSubTab, setGuideSubTab] = useState<'info' | 'hours' | 'transit' | 'rules'>('info');
  const [isSaving, setIsSaving] = useState(false);

  // Modal Xác nhận đồng bộ
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

  // Upload sơ đồ & phân tích topo
  const guideMapInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGuideMap, setUploadingGuideMap] = useState(false);
  const [analyzingFloorPlan, setAnalyzingFloorPlan] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<{ nodeCount: number; edgeCount: number } | null>(null);

  const [form, setForm] = useState({
    // Thẻ và tiêu đề cẩm nang
    guideTag: branding.guideTag || 'Kế Hoạch & Sơ Đồ',
    guideTitle: branding.guideTitle || 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
    guideCtaText: branding.guideCtaText || 'Xem cẩm nang & sơ đồ tham quan',
    guideDesc:
      branding.guideDesc ||
      'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',

    // Sơ đồ mặt bằng
    guideMapTitle: branding.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày',
    guideMapDesc:
      branding.guideMapDesc ||
      'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày giúp quý khách định hướng lộ trình thuận tiện nhất.',
    guideMapUrl: branding.guideMapUrl || '',

    // Giờ mở cửa & Vé
    guideOpeningDays: branding.guideOpeningDays || 'Thứ Ba – Chủ Nhật',
    guideMorningHours: branding.guideMorningHours || '08:00 – 11:30',
    guideAfternoonHours: branding.guideAfternoonHours || '13:30 – 17:00',
    guideClosedNote: branding.guideClosedNote || 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật và vệ sinh chuyên sâu',
    guideTicketAdult: branding.guideTicketAdult || '30.000 ₫',
    guideTicketStudent: branding.guideTicketStudent || '15.000 ₫',
    guideTicketChild: branding.guideTicketChild || 'Miễn phí cho trẻ em dưới 6 tuổi, người cao tuổi & người khuyết tật',

    // Di chuyển & Bản đồ Google Maps
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

    // Tiện ích & Quy định tham quan (4 mục)
    guideRule1Title: branding.guideRule1Title || 'Gửi đồ & Tủ khóa cá nhân',
    guideRule1Desc:
      branding.guideRule1Desc ||
      'Quý khách vui lòng gửi hành lý cồng kềnh, balo lớn tại quầy giữ đồ trước khi vào tham quan các gian trưng bày.',
    guideRule2Title: branding.guideRule2Title || 'Thuyết minh tự động (Audio Guide)',
    guideRule2Desc:
      branding.guideRule2Desc ||
      'Hỗ trợ quét mã QR tại các tủ hiện vật để nghe thuyết minh song ngữ và khám phá mô hình cổ vật 3D tương tác.',
    guideRule3Title: branding.guideRule3Title || 'Bảo quản di sản & Quy định chụp ảnh',
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

      guideRule1Title: branding.guideRule1Title || 'Gửi đồ & Tủ khóa cá nhân',
      guideRule1Desc:
        branding.guideRule1Desc ||
        'Quý khách vui lòng gửi hành lý cồng kềnh, balo lớn tại quầy giữ đồ trước khi vào tham quan các gian trưng bày.',
      guideRule2Title: branding.guideRule2Title || 'Thuyết minh tự động (Audio Guide)',
      guideRule2Desc:
        branding.guideRule2Desc ||
        'Hỗ trợ quét mã QR tại các tủ hiện vật để nghe thuyết minh song ngữ và khám phá mô hình cổ vật 3D tương tác.',
      guideRule3Title: branding.guideRule3Title || 'Bảo quản di sản & Quy định chụp ảnh',
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
        showToast('Đã tải ảnh sơ đồ mặt bằng thành công! Nhớ nhấn "Lưu thay đổi" để áp dụng.', 'success');
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

  const handleAnalyzeFloorPlan = async (fileToUpload?: File) => {
    if (!form.guideMapUrl && !fileToUpload) {
      showToast('Vui lòng chọn file ảnh hoặc cung cấp URL sơ đồ mặt bằng để phân tích', 'info');
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
      showToast(err?.message || 'Lỗi khi máy chủ phân tích sơ đồ', 'error');
    } finally {
      setAnalyzingFloorPlan(false);
    }
  };

  const handleResetDefaults = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Khôi phục nội dung Cẩm nang mẫu?',
      message: 'Hành động này sẽ điền lại toàn bộ thông tin chuẩn về giờ mở cửa, giá vé, bản đồ và quy định tham quan của Bảo tàng Lịch sử TP.HCM.',
      confirmText: 'Khôi phục mẫu',
      cancelText: 'Hủy',
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
          guideClosedNote: 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật và vệ sinh chuyên sâu',
          guideTicketAdult: '30.000 ₫',
          guideTicketStudent: '15.000 ₫',
          guideTicketChild: 'Miễn phí cho trẻ em dưới 6 tuổi, người cao tuổi & người khuyết tật',
          guideBusRoutes:
            'Tuyến xe buýt số 05, 06, 14, 19, 52 dừng tại trạm Thảo Cầm Viên (ngay cổng đường Nguyễn Bỉnh Khiêm).',
          guideParkingInfo:
            'Bãi đỗ xe máy và ô tô thuận tiện ngay trong khuôn viên sân bảo tàng, có nhân viên an ninh hướng dẫn.',
          guideRule1Title: 'Gửi đồ & Tủ khóa cá nhân',
          guideRule1Desc:
            'Quý khách vui lòng gửi hành lý cồng kềnh, balo lớn tại quầy giữ đồ trước khi vào tham quan các gian trưng bày.',
          guideRule2Title: 'Thuyết minh tự động (Audio Guide)',
          guideRule2Desc:
            'Hỗ trợ quét mã QR tại các tủ hiện vật để nghe thuyết minh song ngữ và khám phá mô hình cổ vật 3D tương tác.',
          guideRule3Title: 'Bảo quản di sản & Quy định chụp ảnh',
          guideRule3Desc:
            'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
          guideRule4Title: 'Trang phục & Văn minh tham quan',
          guideRule4Desc:
            'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.'
        }));
        showToast('Đã khôi phục nội dung mẫu. Nhấn "Lưu thay đổi" để áp dụng.', 'info');
        setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    });
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
              Quản lý độc lập sơ đồ mặt bằng kiến trúc bảo tàng, mạng liên kết không gian, giờ mở cửa, bảng giá vé, Google Maps chỉ đường và các tiện ích quy định tham quan.
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

      {/* 2. THANH PHÂN NHÓM CHUYÊN ĐỀ (SUB-TABS) */}
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

        <button
          type="button"
          onClick={() => setGuideSubTab('info')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: guideSubTab === 'info' ? 600 : 500,
            border: '1px solid',
            borderColor: guideSubTab === 'info' ? 'rgba(212, 168, 106, 0.45)' : 'transparent',
            background: guideSubTab === 'info' ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            color: guideSubTab === 'info' ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <Info size={14} />
          <span>1. Thông tin & Sơ đồ mặt bằng</span>
        </button>

        <button
          type="button"
          onClick={() => setGuideSubTab('hours')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: guideSubTab === 'hours' ? 600 : 500,
            border: '1px solid',
            borderColor: guideSubTab === 'hours' ? 'rgba(212, 168, 106, 0.45)' : 'transparent',
            background: guideSubTab === 'hours' ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            color: guideSubTab === 'hours' ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={14} />
          <span>2. Giờ mở cửa & Giá vé</span>
        </button>

        <button
          type="button"
          onClick={() => setGuideSubTab('transit')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: guideSubTab === 'transit' ? 600 : 500,
            border: '1px solid',
            borderColor: guideSubTab === 'transit' ? 'rgba(212, 168, 106, 0.45)' : 'transparent',
            background: guideSubTab === 'transit' ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            color: guideSubTab === 'transit' ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <MapPin size={14} />
          <span>3. Vị trí & Google Maps</span>
        </button>

        <button
          type="button"
          onClick={() => setGuideSubTab('rules')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: guideSubTab === 'rules' ? 600 : 500,
            border: '1px solid',
            borderColor: guideSubTab === 'rules' ? 'rgba(212, 168, 106, 0.45)' : 'transparent',
            background: guideSubTab === 'rules' ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.03)',
            color: guideSubTab === 'rules' ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}
        >
          <ShieldCheck size={14} />
          <span>4. Tiện ích & Quy định</span>
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
              {guideSubTab === 'info' && '1. Tiêu Đề & Sơ Đồ Mặt Bằng Tham Quan'}
              {guideSubTab === 'hours' && '2. Thời Gian Đón Khách & Biểu Phí Vé Tham Quan'}
              {guideSubTab === 'transit' && '3. Chỉ Dẫn Di Chuyển & Tích Hợp Bản Đồ Google Maps'}
              {guideSubTab === 'rules' && '4. Tiện Ích Phục Vụ & Nội Quy Tham Quan Văn Minh'}
            </h2>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {guideSubTab === 'info' && 'Cấu hình tiêu đề trang, mô tả hướng dẫn, ảnh sơ đồ kiến trúc và phân tích mạng topo liên kết cửa.'}
              {guideSubTab === 'hours' && 'Cập nhật khung giờ đón khách các ngày trong tuần, ngày nghỉ định kỳ và bảng giá vé các đối tượng.'}
              {guideSubTab === 'transit' && 'Địa chỉ bảo tàng, tuyến xe buýt, thông tin bãi đỗ xe và mã nhúng bản đồ Google Maps tương tác.'}
              {guideSubTab === 'rules' && 'Thiết lập 4 khối quy định, tiện ích gửi đồ, thuyết minh tự động và bảo quản di sản.'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSave(
              guideSubTab === 'info' ? 'Sơ đồ mặt bằng' :
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

        {/* PHÂN MỤC 1: TIÊU ĐỀ & SƠ ĐỒ MẶT BẰNG */}
        {guideSubTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Tiêu đề & Giới thiệu chung trang Cẩm nang
              </div>
            </div>

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
                  Đoạn mô tả cẩm nang tham quan
                </label>
                <textarea
                  rows={2}
                  value={form.guideDesc || ''}
                  onChange={(e) => handleChange('guideDesc', e.target.value)}
                  placeholder="Khám phá sơ đồ không gian kiến trúc bảo tàng..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10, marginTop: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Sơ đồ mặt bằng kiến trúc bảo tàng
              </div>
            </div>

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
                  Đường dẫn hoặc tải file ảnh sơ đồ
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={form.guideMapUrl || ''}
                    onChange={(e) => handleChange('guideMapUrl', e.target.value)}
                    placeholder="https://... hoặc bấm tải ảnh bên phải"
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
                    <span>{uploadingGuideMap ? 'Đang tải...' : 'Tải sơ đồ lên'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAnalyzeFloorPlan()}
                    disabled={analyzingFloorPlan || !form.guideMapUrl}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Compass size={14} />
                    <span>{analyzingFloorPlan ? 'Đang phân tích...' : 'Phân tích sơ đồ & Liên kết không gian'}</span>
                  </button>
                </div>
              </div>

              {form.guideMapUrl && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ width: '100%', maxHeight: 240, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={form.guideMapUrl} alt="Preview sơ đồ" style={{ width: '100%', height: 240, objectFit: 'contain', background: '#111' }} />
                  </div>
                </div>
              )}

              {analysisSummary && (
                <div style={{ gridColumn: '1 / -1', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8, fontSize: 12.5, color: '#10B981' }}>
                  ✓ Đã phân tích thành công: Nhận diện <strong>{analysisSummary.nodeCount}</strong> phân khu và thiết lập <strong>{analysisSummary.edgeCount}</strong> cửa liên kết hướng đi.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PHÂN MỤC 2: GIỜ MỞ CỬA & BIỂU PHÍ VÉ */}
        {guideSubTab === 'hours' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Thời gian hoạt động
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
                  placeholder="Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10, marginTop: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Biểu phí tham quan niêm yết
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Giá vé: Người lớn
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
          </div>
        )}

        {/* PHÂN MỤC 3: CHỈ DẪN DI CHUYỂN & GOOGLE MAPS */}
        {guideSubTab === 'transit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Địa chỉ & Chỉ dẫn phương tiện di chuyển
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Địa chỉ bảo tàng
                </label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Hotline liên hệ & Hướng dẫn viên
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
                  Chỉ dẫn bãi đỗ xe
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
                  Đường dẫn Google Maps (Chỉ đường khi khách bấm nút)
                </label>
                <input
                  type="text"
                  value={form.guideGoogleMapsUrl || ''}
                  onChange={(e) => handleChange('guideGoogleMapsUrl', e.target.value)}
                  placeholder="VD: https://maps.app.goo.gl/... hoặc https://www.google.com/maps?cid=..."
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Khách tham quan bấm nút "Mở chỉ đường Google Maps" sẽ chuyển hướng tới đúng địa điểm này.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                  Mã nhúng Bản đồ Google Maps (Dán mã iframe hoặc liên kết nhúng)
                </label>
                <textarea
                  rows={3}
                  value={form.guideGoogleMapsEmbed || ''}
                  onChange={(e) => handleChange('guideGoogleMapsEmbed', e.target.value)}
                  placeholder='Dán toàn bộ thẻ <iframe src="https://www.google.com/maps/embed?..." ...></iframe> hoặc link https://www.google.com/maps/embed?...'
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 12.5, fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Hệ thống tự động nhận diện cả thẻ &lt;iframe&gt; lẫn URL embed để hiển thị bản đồ trực tiếp trên trang.
                </span>
              </div>

              {form.guideGoogleMapsEmbed && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Xem trước bản đồ Google Maps nhúng:
                  </label>
                  <div style={{ width: '100%', height: 240, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
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
          </div>
        )}

        {/* PHÂN MỤC 4: TIỆN ÍCH & QUY ĐỊNH THAM QUAN */}
        {guideSubTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Tiện ích & Quy định tham quan (4 mục hiển thị trên trang cẩm nang)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Mục 1</div>
                <input
                  type="text"
                  value={form.guideRule1Title || ''}
                  onChange={(e) => handleChange('guideRule1Title', e.target.value)}
                  placeholder="Tiêu đề mục 1 (vd: Gửi đồ & Tủ khóa cá nhân)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={2}
                  value={form.guideRule1Desc || ''}
                  onChange={(e) => handleChange('guideRule1Desc', e.target.value)}
                  placeholder="Nội dung mô tả mục 1..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Mục 2</div>
                <input
                  type="text"
                  value={form.guideRule2Title || ''}
                  onChange={(e) => handleChange('guideRule2Title', e.target.value)}
                  placeholder="Tiêu đề mục 2 (vd: Thuyết minh Audio Guide)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={2}
                  value={form.guideRule2Desc || ''}
                  onChange={(e) => handleChange('guideRule2Desc', e.target.value)}
                  placeholder="Nội dung mô tả mục 2..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Mục 3</div>
                <input
                  type="text"
                  value={form.guideRule3Title || ''}
                  onChange={(e) => handleChange('guideRule3Title', e.target.value)}
                  placeholder="Tiêu đề mục 3 (vd: Bảo quản di sản & Hiện vật)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={2}
                  value={form.guideRule3Desc || ''}
                  onChange={(e) => handleChange('guideRule3Desc', e.target.value)}
                  placeholder="Nội dung mô tả mục 3..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Mục 4</div>
                <input
                  type="text"
                  value={form.guideRule4Title || ''}
                  onChange={(e) => handleChange('guideRule4Title', e.target.value)}
                  placeholder="Tiêu đề mục 4 (vd: Trang phục & Văn minh tham quan)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}
                />
                <textarea
                  rows={2}
                  value={form.guideRule4Desc || ''}
                  onChange={(e) => handleChange('guideRule4Desc', e.target.value)}
                  placeholder="Nội dung mô tả mục 4..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 12.5 }}
                />
              </div>
            </div>
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
            Dữ liệu CSDL MongoDB & Đồng bộ Khách
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
