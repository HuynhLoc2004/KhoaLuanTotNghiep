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
  Zap,
  Check,
  Eye,
  RefreshCw,
  Radio,
  Image as ImageIcon,
  Building,
  X,
  AlertCircle
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';
import { InteractiveFloorPlanMap } from '../../components/client/InteractiveFloorPlanMap';
import { FloorPlanMap } from '../../types';

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

  // Quản lý Kho sơ đồ mặt bằng (Floor Plan Repository)
  const [floorPlansRepo, setFloorPlansRepo] = useState<FloorPlanMap[]>([]);
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>('');
  const [activeFloorPlan, setActiveFloorPlan] = useState<FloorPlanMap | null>(null);
  const [repoLoading, setRepoLoading] = useState<boolean>(false);
  const [repoPage, setRepoPage] = useState<number>(1);
  const [repoLimit, setRepoLimit] = useState<number>(6);
  const [repoTotal, setRepoTotal] = useState<number>(0);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [previewModalMap, setPreviewModalMap] = useState<FloorPlanMap | null>(null);
  const [uploadAsActive, setUploadAsActive] = useState<boolean>(true);
  const [newMapTitle, setNewMapTitle] = useState<string>('');

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
    setForm(prev => ({
      ...prev,
      guideTag: branding.guideTag || prev.guideTag,
      guideTitle: branding.guideTitle || prev.guideTitle,
      guideCtaText: branding.guideCtaText || prev.guideCtaText,
      guideDesc: branding.guideDesc || prev.guideDesc,
      guideMapTitle: branding.guideMapTitle || prev.guideMapTitle,
      guideMapDesc: branding.guideMapDesc || prev.guideMapDesc,
      guideMapUrl: branding.guideMapUrl || prev.guideMapUrl || '',
      guideOpeningDays: branding.guideOpeningDays || prev.guideOpeningDays,
      guideMorningHours: branding.guideMorningHours || prev.guideMorningHours,
      guideAfternoonHours: branding.guideAfternoonHours || prev.guideAfternoonHours,
      guideClosedNote: branding.guideClosedNote || prev.guideClosedNote,
      guideTicketAdult: branding.guideTicketAdult || prev.guideTicketAdult,
      guideTicketStudent: branding.guideTicketStudent || prev.guideTicketStudent,
      guideTicketChild: branding.guideTicketChild || prev.guideTicketChild,
      address: branding.address || prev.address,
      hotline: branding.hotline || prev.hotline,
      guideBusRoutes: branding.guideBusRoutes || prev.guideBusRoutes,
      guideParkingInfo: branding.guideParkingInfo || prev.guideParkingInfo,
      guideGoogleMapsUrl: branding.guideGoogleMapsUrl || prev.guideGoogleMapsUrl,
      guideGoogleMapsEmbed: branding.guideGoogleMapsEmbed || prev.guideGoogleMapsEmbed,
      guideRule1Title: branding.guideRule1Title || prev.guideRule1Title,
      guideRule1Desc: branding.guideRule1Desc || prev.guideRule1Desc,
      guideRule2Title: branding.guideRule2Title || prev.guideRule2Title,
      guideRule2Desc: branding.guideRule2Desc || prev.guideRule2Desc,
      guideRule3Title: branding.guideRule3Title || prev.guideRule3Title,
      guideRule3Desc: branding.guideRule3Desc || prev.guideRule3Desc,
      guideRule4Title: branding.guideRule4Title || prev.guideRule4Title,
      guideRule4Desc: branding.guideRule4Desc || prev.guideRule4Desc
    }));
  }, [branding]);

  // Nạp sơ đồ mặt bằng và danh sách kho khi mở trang
  const loadFloorPlansRepo = async (page = 1, limit = repoLimit) => {
    try {
      setRepoLoading(true);
      const res = await api.getFloorPlansList({ page, limit });
      if (res && res.data) {
        setFloorPlansRepo(res.data);
        setActiveFloorPlanId(res.activeId || '');
        if (res.pagination) {
          setRepoTotal(res.pagination.total || 0);
          setRepoPage(res.pagination.page || 1);
        }
        const activeOne = res.data.find((m) => m.id === res.activeId || m.active);
        if (activeOne) {
          setActiveFloorPlan(activeOne);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải kho sơ đồ mặt bằng:', err);
    } finally {
      setRepoLoading(false);
    }
  };

  useEffect(() => {
    // Lấy bản đồ active hiện tại
    api.getFloorPlan()
      .then((fp) => {
        if (fp && fp.nodes && fp.nodes.length > 0) {
          setActiveFloorPlan(fp);
          setActiveFloorPlanId(fp.id);
          setAnalysisResult({
            data: fp,
            summary: {
              nodeCount: fp.nodes.length,
              edgeCount: fp.edges.length
            }
          });
          if (fp.imageUrl) {
            setForm((prev) => ({
              ...prev,
              guideMapUrl: prev.guideMapUrl || fp.imageUrl || ''
            }));
          }
        }
      })
      .catch(() => {});

    // Nạp kho
    loadFloorPlansRepo(1, repoLimit);
  }, []);

  // Tải lại kho khi người dùng chuyển sang tab floorplan
  useEffect(() => {
    if (guideSubTab === 'floorplan') {
      loadFloorPlansRepo(repoPage, repoLimit);
    }
  }, [guideSubTab]);

  const handleActivateMap = async (mapItem: FloorPlanMap) => {
    try {
      setActivatingId(mapItem.id);
      const res = await api.activateFloorPlan(mapItem.id);
      setActiveFloorPlanId(mapItem.id);
      setActiveFloorPlan(res || mapItem);
      if (mapItem.imageUrl) {
        handleChange('guideMapUrl', mapItem.imageUrl);
      }
      if (mapItem.title) {
        handleChange('guideMapTitle', mapItem.title);
      }
      showToast(`Đã kích hoạt và đồng bộ bản đồ "${mapItem.title || mapItem.id}" lên trang Khách tham quan!`, 'success');
      loadFloorPlansRepo(repoPage, repoLimit);
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi kích hoạt bản đồ', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeleteMap = (mapItem: FloorPlanMap) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xóa Sơ Đồ Mặt Bằng Khỏi Kho',
      message: `Bạn có chắc muốn xóa bản đồ "${mapItem.title || mapItem.id}" khỏi kho lưu trữ? Dữ liệu đồ thị và thuật toán phân tích sẽ bị xóa khỏi CSDL MongoDB.`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteFloorPlan(mapItem.id);
          showToast(`Đã xóa bản đồ "${mapItem.title || mapItem.id}" thành công!`, 'success');
          loadFloorPlansRepo(repoPage, repoLimit);
          const currentFp = await api.getFloorPlan();
          if (currentFp) {
            setActiveFloorPlan(currentFp);
            setActiveFloorPlanId(currentFp.id);
            handleChange('guideMapUrl', currentFp.imageUrl || '');
          }
        } catch (err: any) {
          showToast(err?.message || 'Lỗi khi xóa sơ đồ mặt bằng', 'error');
        }
      }
    });
  };

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
        if (uploadAsActive) {
          handleChange('guideMapUrl', res.url);
          try {
            await updateBranding({ guideMapUrl: res.url });
          } catch {}
        }
        showToast('Đã tải ảnh lên server! Đang kích hoạt phân tích không gian Pure CV...', 'success');
        await handleAnalyzeFloorPlan(res.url);
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
      formData.append('title', newMapTitle.trim() || form.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày');
      formData.append('description', form.guideMapDesc || '');
      formData.append('setActive', uploadAsActive ? 'true' : 'false');

      const res = await api.analyzeFloorPlan(formData);
      setAnalysisResult(res);
      if (uploadAsActive) {
        setActiveFloorPlanId(res.data.id);
        setActiveFloorPlan(res.data);
        if (res.data.imageUrl) {
          handleChange('guideMapUrl', res.data.imageUrl);
        }
      }
      showToast(
        `⚡ Đã phân tích bản đồ thành công qua Pure CV! Nhận diện ${res.summary?.nodeCount || 0} phòng và ${res.summary?.edgeCount || 0} liên kết cửa (${res.data?.analysisAlgorithm || 'Pure-CV'}).`,
        'success'
      );
      loadFloorPlansRepo(1, repoLimit);
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

        {/* PHÂN MỤC 2: SƠ ĐỒ MẶT BẰNG & BẢN ĐỒ KIẾN TRÚC */}
        {guideSubTab === 'floorplan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* 1. KHU VỰC BẢN ĐỒ ĐANG ÁP DỤNG CHO CLIENT (LIVE CLIENT MAP) */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(212, 168, 106, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
                border: '1.5px solid rgba(212, 168, 106, 0.35)',
                borderRadius: 14,
                padding: '18px 22px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Radio size={13} className="animate-pulse" />
                    ĐANG ÁP DỤNG TRÊN CLIENT (LIVE)
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Bản đồ này đang trực tiếp phục vụ khách tham quan trên trang Cẩm nang
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => loadFloorPlansRepo(repoPage, repoLimit)}
                    title="Làm mới trạng thái từ CSDL MongoDB"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  >
                    <RefreshCw size={13} className={repoLoading ? 'animate-spin' : ''} />
                    <span>Làm mới</span>
                  </button>

                  <a
                    href="/?page=guide#floorplan"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  >
                    <Globe size={13} />
                    <span>Xem Trang Khách Thực Tế</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {activeFloorPlan ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 20, alignItems: 'center' }}>
                  <div
                    style={{
                      width: '100%',
                      height: 180,
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: '#0D111A',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {activeFloorPlan.imageUrl ? (
                      <img
                        src={activeFloorPlan.imageUrl}
                        alt="Sơ đồ đang chạy"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
                        <ImageIcon size={32} style={{ opacity: 0.4, margin: '0 auto 6px' }} />
                        Chưa có ảnh sơ đồ
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-gold)', margin: '0 0 4px 0' }}>
                        {activeFloorPlan.title || form.guideMapTitle || 'Sơ đồ mặt bằng các gian trưng bày'}
                      </h3>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {activeFloorPlan.description || form.guideMapDesc || 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Building size={14} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                          {activeFloorPlan.nodes?.length || 0} Gian phòng
                        </span>
                      </div>

                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Compass size={14} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                          {activeFloorPlan.edges?.length || 0} Liên kết cửa
                        </span>
                      </div>

                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Cpu size={14} style={{ color: '#3B82F6' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>
                          Thuật toán: {activeFloorPlan.analysisAlgorithm || 'Pure CV RayCast Engine'}
                        </span>
                      </div>

                      {(activeFloorPlan.imageWidth || activeFloorPlan.width) && (activeFloorPlan.imageHeight || activeFloorPlan.height) && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            📐 {activeFloorPlan.imageWidth || activeFloorPlan.width} × {activeFloorPlan.imageHeight || activeFloorPlan.height} px
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewModalMap(activeFloorPlan)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 4 }}
                      >
                        <Eye size={13} />
                        <span>Xem trước Đồ thị Tô-pô & Mũi tên dẫn đường (Admin View)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Hiện tại chưa có sơ đồ mặt bằng nào được kích hoạt. Vui lòng chọn một bản đồ từ kho lưu trữ bên dưới hoặc tải ảnh mới lên.
                </div>
              )}
            </div>

            {/* 2. KHO LƯU TRỮ SƠ ĐỒ MẶT BẰNG & LỊCH SỬ PHÂN TÍCH (REPOSITORY) */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={18} style={{ color: 'var(--accent-gold)' }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                      Kho Lưu Trữ & Thư Viện Bản Đồ Trong Hệ Thống
                    </h3>
                    <span style={{ background: 'rgba(212, 168, 106, 0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: 12, fontSize: 11.5, fontWeight: 700 }}>
                      {repoTotal} bản đồ
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Quản lý danh sách các sơ đồ mặt bằng đã phân tích trong CSDL MongoDB. Quản trị viên có thể chuyển đổi bản đồ phục vụ khách tham quan ngay lập tức.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadFloorPlansRepo(repoPage, repoLimit)}
                  disabled={repoLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                >
                  <RefreshCw size={13} className={repoLoading ? 'animate-spin' : ''} />
                  <span>{repoLoading ? 'Đang đồng bộ...' : 'Tải lại danh sách'}</span>
                </button>
              </div>

              {/* Lưới các thẻ bản đồ */}
              {repoLoading && floorPlansRepo.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner-border" style={{ width: 24, height: 24, margin: '0 auto 10px', display: 'block' }} />
                  Đang truy vấn kho dữ liệu sơ đồ mặt bằng từ server...
                </div>
              ) : floorPlansRepo.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 10, border: '1px dashed var(--border-color)' }}>
                  <Layers size={36} style={{ opacity: 0.35, margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Chưa có sơ đồ mặt bằng nào trong kho lưu trữ.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>Hãy tải lên bản vẽ sơ đồ đầu tiên ở khu vực bên dưới.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                  {floorPlansRepo.map((item) => {
                    const isLive = item.id === activeFloorPlanId || item.active;
                    const isActivating = activatingId === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: isLive ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                          borderRadius: 12,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: isLive ? '0 0 14px rgba(16, 185, 129, 0.15)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Ảnh thumbnail & Badge */}
                        <div style={{ position: 'relative', width: '100%', height: 140, background: '#0D111A' }}>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                          <div style={{ position: 'absolute', top: 8, left: 8 }}>
                            {isLive ? (
                              <span
                                style={{
                                  background: 'rgba(16, 185, 129, 0.9)',
                                  color: '#fff',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: 12,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                                }}
                              >
                                <Radio size={11} className="animate-pulse" />
                                ĐANG DÙNG TRÊN CLIENT
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: 'rgba(30, 41, 59, 0.85)',
                                  color: '#94A3B8',
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: 12,
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                LƯU TRONG KHO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Thông tin chi tiết */}
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
                          <div>
                            <h4
                              style={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: isLive ? '#10B981' : 'var(--heading-color)',
                                margin: '0 0 3px 0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={item.title}
                            >
                              {item.title || item.id}
                            </h4>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Mã ID: {item.id}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                            <span style={{ background: 'var(--bg-card)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border-color)' }}>
                              🏛️ {item.nodes?.length || 0} phòng
                            </span>
                            <span style={{ background: 'var(--bg-card)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border-color)' }}>
                              🚪 {item.edges?.length || 0} cửa
                            </span>
                            {(item.imageWidth || item.width) && (item.imageHeight || item.height) && (
                              <span style={{ background: 'var(--bg-card)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border-color)' }}>
                                📐 {item.imageWidth || item.width}×{item.imageHeight || item.height}
                              </span>
                            )}
                          </div>

                          {/* Nút hành động */}
                          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border-color)' }}>
                            {isLive ? (
                              <button
                                type="button"
                                disabled
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#10B981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: 6,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5,
                                  cursor: 'default'
                                }}
                              >
                                <Check size={13} />
                                <span>Đang phục vụ client</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivateMap(item)}
                                disabled={isActivating}
                                className="btn btn-primary btn-sm"
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5
                                }}
                              >
                                <Zap size={13} />
                                <span>{isActivating ? 'Đang kích hoạt...' : 'Áp dụng cho Client'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setPreviewModalMap(item)}
                              title="Xem trước cấu trúc tô-pô không gian"
                              style={{ padding: '6px 9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Eye size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleDeleteMap(item)}
                              title="Xóa bản đồ khỏi kho"
                              style={{
                                padding: '6px 9px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#EF4444',
                                borderColor: 'rgba(239, 68, 68, 0.3)'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PHÂN TRANG THEO QUY TẮC CHUNG CỦA HỆ THỐNG */}
              <div style={{ marginTop: 8 }}>
                <Pagination
                  currentPage={repoPage}
                  totalItems={repoTotal}
                  pageSize={repoLimit}
                  pageSizeOptions={[3, 6, 9, 12, 24]}
                  itemLabel="sơ đồ mặt bằng"
                  onPageChange={(page) => {
                    setRepoPage(page);
                    loadFloorPlansRepo(page, repoLimit);
                  }}
                  onPageSizeChange={(newSize) => {
                    setRepoLimit(newSize);
                    setRepoPage(1);
                    loadFloorPlansRepo(1, newSize);
                  }}
                />
              </div>
            </div>

            {/* 3. KHU VỰC TẢI ẢNH MỚI & PHÂN TÍCH PURE COMPUTER VISION */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} style={{ color: '#D97706' }} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                    Tải Lên Bản Đồ Mới & Phân Tích Tô-Pô Tự Động (Pure CV Engine)
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                    Thuật toán Computer Vision cục bộ nhận diện biên tường, gian phòng, tâm điểm và cửa liên kết mà không gửi ảnh ra AI bên thứ ba.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Tên / Tiêu đề bản đồ mới
                  </label>
                  <input
                    type="text"
                    value={newMapTitle}
                    onChange={(e) => setNewMapTitle(e.target.value)}
                    placeholder="VD: Sơ đồ tầng trệt - Các gian khảo cổ học & di tích"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Mô tả sơ lược bản đồ
                  </label>
                  <input
                    type="text"
                    value={form.guideMapDesc || ''}
                    onChange={(e) => handleChange('guideMapDesc', e.target.value)}
                    placeholder="Bản đồ kiến trúc không gian và vị trí các gian phòng..."
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
                  />
                </div>

                {/* Checkbox tùy chọn Kích hoạt ngay cho Client hay Chỉ lưu vào kho */}
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    <input
                      type="checkbox"
                      checked={uploadAsActive}
                      onChange={(e) => setUploadAsActive(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#D97706', cursor: 'pointer' }}
                    />
                    <span>Tự động kích hoạt hiển thị ngay cho Khách tham quan sau khi phân tích xong</span>
                  </label>
                  <span style={{ fontSize: 11.5, color: uploadAsActive ? '#10B981' : 'var(--text-muted)' }}>
                    {uploadAsActive ? '🟢 Sẽ đồng bộ trực tiếp lên Client Portal' : '⚪ Chỉ lưu trữ vào kho bản đồ dự trữ'}
                  </span>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Chọn file ảnh bản đồ (Hỗ trợ PNG, JPG, WEBP, CAD Render)
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={form.guideMapUrl || ''}
                      onChange={(e) => handleChange('guideMapUrl', e.target.value)}
                      placeholder="https://... hoặc bấm nút tải ảnh bên cạnh"
                      style={{ flex: 1, minWidth: 260, padding: '9px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-main)', fontSize: 13 }}
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
                      disabled={uploadingGuideMap || analyzingMap}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Upload size={14} />
                      <span>{uploadingGuideMap ? 'Đang tải file...' : 'Tải file sơ đồ lên'}</span>
                    </button>
                    {form.guideMapUrl && (
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
                    )}
                  </div>
                </div>

                {form.guideMapUrl && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ width: '100%', maxHeight: 260, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <img src={form.guideMapUrl} alt="Preview sơ đồ" style={{ width: '100%', height: 260, objectFit: 'contain', background: '#0D111A' }} />
                      {analyzingMap && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: 10 }}>
                          <div className="spinner-border" style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Đang phân tích cấu trúc điểm ảnh & tô-pô không gian...</span>
                        </div>
                      )}
                    </div>

                    {analysisResult && (
                      <div style={{ padding: '12px 16px', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Cpu size={18} style={{ color: '#D97706' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                              Đã nhận diện thành công: {analysisResult.summary?.nodeCount || 0} Gian phòng & {analysisResult.summary?.edgeCount || 0} Liên kết cửa
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                              Thuật toán: {analysisResult.data?.analysisAlgorithm || 'Pure-CV-RayCast-Otsu-v1'} (100% Cục bộ không qua AI)
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 4 }}>
                          Đã lưu CSDL MongoDB & Kho
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

      {/* MODAL XEM TRƯỚC ĐỒ THỊ TÔ-PÔ BẢN ĐỒ CHI TIẾT */}
      {previewModalMap && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              width: '95vw',
              maxWidth: 1100,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Compass size={20} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                    {previewModalMap.title || 'Xem trước cấu trúc tô-pô'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Mã: {previewModalMap.id} | {previewModalMap.nodes?.length || 0} phòng | {previewModalMap.edges?.length || 0} cửa
                    </span>
                    {(previewModalMap.id === activeFloorPlanId || previewModalMap.active) ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: 4 }}>
                        ĐANG LIVE TRÊN CLIENT
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.08)', padding: '1px 6px', borderRadius: 4 }}>
                        LƯU TRONG KHO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {!(previewModalMap.id === activeFloorPlanId || previewModalMap.active) && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleActivateMap(previewModalMap);
                      setPreviewModalMap(null);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  >
                    <Zap size={13} />
                    <span>Áp dụng bản đồ này cho Client</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewModalMap(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: InteractiveFloorPlanMap */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <InteractiveFloorPlanMap floorPlan={previewModalMap} clientTheme="dark" />
            </div>
          </div>
        </div>
      )}

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
