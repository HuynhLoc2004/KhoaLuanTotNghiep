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
  AlertCircle,
  Plus
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api, API_ROOT } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';
import { InteractiveFloorPlanMap } from '../../components/client/InteractiveFloorPlanMap';
import { FloorPlanMap } from '../../types';
import { AdminFloorPlanMappingPage } from './AdminFloorPlanMappingPage';

export const AdminGuideCMSPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  // 6 phân mục quản lý cho Trang Cẩm nang & Sơ đồ
  const [guideSubTab, setGuideSubTab] = useState<'info' | 'floorplan' | 'mapping' | 'hours' | 'transit' | 'rules'>('info');
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadModalImageUrl, setUploadModalImageUrl] = useState<string>('');

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
      showToast(`Đã đặt sơ đồ "${mapItem.title || 'Mặt bằng'}" làm sơ đồ hiển thị chính thức!`, 'success');
      loadFloorPlansRepo(repoPage, repoLimit);
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi kích hoạt bản đồ', 'error');
    } finally {
      setActivatingId(null);
    }
  };

  // Helper xử lý đường dẫn hình ảnh sơ đồ từ backend an toàn 100%
  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_ROOT}${cleanPath}`;
  };

  const handleDeleteMap = (mapItem: FloorPlanMap) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Xóa sơ đồ mặt bằng',
      message: `Bạn có chắc chắn muốn xóa sơ đồ "${mapItem.title || 'Mặt bằng'}"? Thao tác này sẽ xóa sơ đồ khỏi hệ thống và không thể hoàn tác.`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteFloorPlan(mapItem.id);
          showToast(`Đã xóa sơ đồ "${mapItem.title || 'Mặt bằng'}" thành công!`, 'success');
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
          await loadFloorPlansRepo(repoPage, repoLimit);
          const currentFp = await api.getFloorPlan();
          if (currentFp) {
            setActiveFloorPlan(currentFp);
            setActiveFloorPlanId(currentFp.id);
            handleChange('guideMapUrl', currentFp.imageUrl || '');
          } else {
            // Không còn sơ đồ nào trong hệ thống!
            setActiveFloorPlan(null);
            setActiveFloorPlanId('');
            handleChange('guideMapUrl', '');
          }
        } catch (err: any) {
          showToast(err?.message || 'Lỗi khi xóa sơ đồ mặt bằng', 'error');
        } finally {
          setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
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
        setUploadModalImageUrl(res.url);
        // Tự động gợi ý tên sơ đồ thông minh nếu người dùng chưa nhập
        if (!newMapTitle) {
          const rawName = file.name.replace(/\.[^/.]+$/, '').trim();
          const cleanName = rawName.length > 3 ? rawName : 'Sơ đồ tham quan Bảo tàng Lịch sử TP.HCM';
          setNewMapTitle(cleanName);
        }
        if (uploadAsActive) {
          handleChange('guideMapUrl', res.url);
          try {
            await updateBranding({ guideMapUrl: res.url });
          } catch {}
        }
        showToast('Đã tải ảnh lên xem trước. Quý khách vui lòng kiểm tra tiêu đề và nhấn "Xác nhận tải lên & Phân tích sơ đồ".', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi tải ảnh sơ đồ mặt bằng lên hệ thống', 'error');
    } finally {
      setUploadingGuideMap(false);
      if (guideMapInputRef.current) {
        guideMapInputRef.current.value = '';
      }
    }
  };

  const handleAnalyzeFloorPlan = async (targetUrl?: string) => {
    const urlToAnalyze = targetUrl || uploadModalImageUrl || form.guideMapUrl;
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
        `Đã nhận diện sơ đồ thành công: ${res.summary?.nodeCount || 0} gian phòng và ${res.summary?.edgeCount || 0} cửa thông phòng.`,
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

  // Danh sách các phân mục của Trang Cẩm nang & Sơ đồ
  const GUIDE_SUBTABS = [
    { id: 'info', num: 1, label: '1. Giới thiệu chung', desc: 'Tiêu đề trang, thẻ định danh và đoạn mô tả giới thiệu', icon: Info },
    { id: 'floorplan', num: 2, label: '2. Sơ đồ mặt bằng', desc: 'Tiêu đề, mô tả và file ảnh sơ đồ kiến trúc tham quan', icon: Compass },
    { id: 'mapping', num: 3, label: '3. Gán Không Gian 360°', desc: 'Gắn các gian phòng 360° thực tế và giọng đọc thuyết minh vào sơ đồ', icon: MapPin },
    { id: 'hours', num: 4, label: '4. Giờ mở cửa & Giá vé', desc: 'Khung giờ đón khách, lưu ý đóng cửa và biểu phí vé niêm yết', icon: Clock },
    { id: 'transit', num: 5, label: '5. Vị trí & Google Maps', desc: 'Địa chỉ, hotline, xe buýt, bãi xe và bản đồ tương tác', icon: Globe },
    { id: 'rules', num: 6, label: '6. Tiện ích & Quy định', desc: '4 quy định tham quan văn minh và tiện ích phục vụ khách', icon: ShieldCheck }
  ] as const;

  return (
    <div className="admin-content" style={{ paddingBottom: 60 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              flexShrink: 0
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 3px 0' }}>
              Quản Lý Trang Cẩm Nang & Sơ Đồ
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, maxWidth: 740, lineHeight: 1.4 }}>
              Cấu hình nội dung trang cẩm nang: Sơ đồ mặt bằng, giờ mở cửa, bảng giá vé, vị trí chỉ đường và quy định tham quan.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <a
            href="/?page=guide"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Globe size={14} />
            <span>Xem trang khách</span>
            <ExternalLink size={12} style={{ opacity: 0.6 }} />
          </a>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetDefaults}
            title="Đặt lại các nội dung về mẫu chuẩn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} />
            <span>Khôi phục mẫu</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={14} />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* 2. THANH SUB-TABS PHẲNG, TỐI GIẢN CHUẨN DASHBOARD ADMIN */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '6px 8px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto'
        }}
      >
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
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                border: '1px solid',
                borderColor: isActive ? 'var(--border-color)' : 'transparent',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                color: isActive ? 'var(--heading-color)' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <TabIcon size={13} style={{ opacity: isActive ? 1 : 0.7 }} />
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
              {guideSubTab === 'mapping' && '3. Gán Gian Phòng 360° & Thuyết Minh Vào Sơ Đồ'}
              {guideSubTab === 'hours' && '4. Thời Gian Hoạt Động & Biểu Phí Vé Niêm Yết'}
              {guideSubTab === 'transit' && '5. Vị Trí, Chỉ Dẫn Di Chuyển & Google Maps'}
              {guideSubTab === 'rules' && '6. Tiện Ích Phục Vụ & Nội Quy Tham Quan Văn Minh'}
            </h2>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {guideSubTab === 'info' && 'Cấu hình tiêu đề chính, thẻ định danh, đoạn văn giới thiệu và nút điều hướng của trang cẩm nang.'}
              {guideSubTab === 'floorplan' && 'Tải lên hình ảnh sơ đồ mặt bằng kiến trúc bảo tàng, định vị các cánh trưng bày phục vụ khách thực địa.'}
              {guideSubTab === 'mapping' && 'Liên kết từng vị trí phòng trên sơ đồ với gian phòng 360° thực tế và file thuyết minh giọng nói.'}
              {guideSubTab === 'hours' && 'Cập nhật khung giờ đón khách ca sáng/chiều, các ngày mở cửa trong tuần và bảng giá vé các đối tượng.'}
              {guideSubTab === 'transit' && 'Địa chỉ thực tế, số điện thoại đường dây nóng, tuyến xe buýt, bãi xe và mã nhúng bản đồ trực tiếp.'}
              {guideSubTab === 'rules' && 'Thiết lập 4 quy tắc văn minh và tiện ích trải nghiệm (mã QR hiện vật, thuyết minh audio guide, bảo quản).'}
            </span>
          </div>

          {guideSubTab !== 'mapping' && (
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
          )}
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
          </div>
        )}

        {/* PHÂN MỤC 2: SƠ ĐỒ MẶT BẰNG & BẢN ĐỒ KIẾN TRÚC */}
        {guideSubTab === 'floorplan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Header phân mục 2 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                  Hệ thống sơ đồ mặt bằng kiến trúc
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Quản lý danh sách sơ đồ mặt bằng và các gian phòng trưng bày
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => loadFloorPlansRepo(repoPage, repoLimit)}
                  disabled={repoLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <RefreshCw size={13} className={repoLoading ? 'animate-spin' : ''} />
                  <span>Làm mới</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setUploadModalImageUrl('');
                    setNewMapTitle('');
                    setIsUploadModalOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Plus size={14} />
                  <span>Tải lên sơ đồ mới</span>
                </button>
              </div>
            </div>

            {/* 1. Bản đồ đang áp dụng trên Client (Live) */}
            {activeFloorPlan ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 110,
                      height: 72,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-subtle)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {activeFloorPlan.imageUrl ? (
                      <img
                        src={resolveImageUrl(activeFloorPlan.imageUrl)}
                        alt={activeFloorPlan.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon size={20} style={{ opacity: 0.35, color: 'var(--text-muted)' }} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#16A34A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                        Đang áp dụng trên Client
                      </span>
                    </div>

                    <h4 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
                      {activeFloorPlan.title || 'Sơ đồ mặt bằng các gian trưng bày'}
                    </h4>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>{activeFloorPlan.nodes?.length || 0} gian phòng</span>
                      <span>•</span>
                      <span>{activeFloorPlan.edges?.length || 0} liên kết cửa</span>
                      <span>•</span>
                      <span>Tự động nhận diện</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewModalMap(activeFloorPlan)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <Eye size={13} />
                    <span>Xem cấu trúc không gian</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setGuideSubTab('mapping')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    <MapPin size={13} />
                    <span>Gán Không Gian 360° & Voice</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 8, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
                Chưa có sơ đồ nào được áp dụng cho khách tham quan.
              </div>
            )}

            {/* 2. Thư viện sơ đồ mặt bằng */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                    Thư viện sơ đồ mặt bằng
                  </span>
                  <span style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '1px 7px', borderRadius: 10, fontSize: 11.5, fontWeight: 600 }}>
                    {repoTotal}
                  </span>
                </div>
              </div>

              {/* Lưới các thẻ bản đồ */}
              {repoLoading && floorPlansRepo.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div className="spinner-border" style={{ width: 22, height: 22, margin: '0 auto 8px', display: 'block' }} />
                  Đang tải danh sách sơ đồ...
                </div>
              ) : floorPlansRepo.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 8, border: '1px dashed var(--border-color)' }}>
                  <Layers size={28} style={{ opacity: 0.3, margin: '0 auto 6px', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: 13 }}>Chưa có sơ đồ nào trong thư viện.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {floorPlansRepo.map((item) => {
                    const isLive = item.id === activeFloorPlanId || item.active;
                    const isActivating = activatingId === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 8,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{ position: 'relative', width: '100%', height: 130, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.imageUrl ? (
                            <img
                              src={resolveImageUrl(item.imageUrl)}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                              <ImageIcon size={28} style={{ opacity: 0.35 }} />
                            </div>
                          )}
                          <div style={{ position: 'absolute', top: 6, left: 6 }}>
                            {isLive ? (
                              <span
                                style={{
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  color: '#4ADE80',
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  border: '1px solid rgba(74, 222, 128, 0.3)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                                Đang dùng
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  color: 'var(--text-muted)',
                                  fontSize: 10.5,
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  border: '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                Chưa áp dụng
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Chi tiết */}
                        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', flex: 1, gap: 6 }}>
                          <div>
                            <h4
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--heading-color)',
                                margin: '0 0 2px 0',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={item.title}
                            >
                              {item.title || item.id}
                            </h4>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              ID: {item.id}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                            <span>{item.nodes?.length || 0} phòng</span>
                            <span>•</span>
                            <span>{item.edges?.length || 0} cửa</span>
                            {(item.imageWidth || item.width) && (item.imageHeight || item.height) && (
                              <>
                                <span>•</span>
                                <span>{item.imageWidth || item.width}×{item.imageHeight || item.height}px</span>
                              </>
                            )}
                          </div>

                          {/* Nút hành động */}
                          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border-color)' }}>
                            {isLive ? (
                              <button
                                type="button"
                                disabled
                                className="btn btn-secondary btn-sm"
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  fontSize: 11.5,
                                  opacity: 0.65,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4
                                }}
                              >
                                <Check size={12} />
                                <span>Đang dùng</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivateMap(item)}
                                disabled={isActivating}
                                className="btn btn-primary btn-sm"
                                style={{
                                  flex: 1,
                                  padding: '5px 8px',
                                  fontSize: 11.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 4
                                }}
                              >
                                <Zap size={12} />
                                <span>{isActivating ? 'Đang bật...' : 'Áp dụng'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setPreviewModalMap(item)}
                              title="Xem trước cấu trúc tô-pô"
                              style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Eye size={12} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleDeleteMap(item)}
                              title="Xóa bản đồ"
                              style={{ padding: '5px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Phân trang */}
              <div style={{ marginTop: 4 }}>
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
          </div>
        )}

        {/* PHÂN MỤC 3: GÁN KHÔNG GIAN 360° & VOICE VÀO SƠ ĐỒ MẶT BẰNG */}
        {guideSubTab === 'mapping' && (
          <AdminFloorPlanMappingPage onBackToGuide={() => setGuideSubTab('floorplan')} />
        )}

        {/* PHÂN MỤC 4: GIỜ MỞ CỬA & BIỂU PHÍ VÉ */}
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
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
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
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
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
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
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
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
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
          </div>
        )}
      </section>

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
                <Compass size={18} style={{ color: 'var(--text-main)' }} />
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
                    {previewModalMap.title || 'Xem trước cấu trúc tô-pô'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Mã: {previewModalMap.id} | {previewModalMap.nodes?.length || 0} phòng | {previewModalMap.edges?.length || 0} cửa
                    </span>
                    {(previewModalMap.id === activeFloorPlanId || previewModalMap.active) ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
                        ● Đang áp dụng trên Client
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '1px 6px', borderRadius: 4 }}>
                        Lưu kho
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

      {/* MODAL TẢI LÊN & PHÂN TÍCH SƠ ĐỒ MỚI (PURE CV ENGINE) */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
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
              borderRadius: 10,
              width: '100%',
              maxWidth: 540,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-main)'
                  }}
                >
                  <Compass size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
                    Tải lên & phân tích sơ đồ mới
                  </h3>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Hệ thống tự động nhận diện các gian phòng & cửa thông phòng
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (!uploadingGuideMap && !analyzingMap) {
                    setIsUploadModalOpen(false);
                  }
                }}
                disabled={uploadingGuideMap || analyzingMap}
                style={{ padding: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Input file ẩn */}
              <input
                ref={guideMapInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadGuideMap}
              />

              {/* Tên / Tiêu đề sơ đồ */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                  Tiêu đề bản đồ
                </label>
                <input
                  type="text"
                  value={newMapTitle}
                  onChange={(e) => setNewMapTitle(e.target.value)}
                  placeholder="VD: Sơ đồ tầng trệt - Các gian khảo cổ học & cổ vật"
                  disabled={uploadingGuideMap || analyzingMap}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    color: 'var(--text-main)',
                    fontSize: 12.5
                  }}
                />
              </div>

              {/* Tùy chọn đặt làm Active ngay */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: (uploadingGuideMap || analyzingMap) ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                  color: 'var(--text-main)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={uploadAsActive}
                  onChange={(e) => setUploadAsActive(e.target.checked)}
                  disabled={uploadingGuideMap || analyzingMap}
                  style={{ width: 15, height: 15, cursor: 'pointer' }}
                />
                <span>Áp dụng ngay cho Khách tham quan sau khi phân tích xong</span>
              </label>

              {/* Vùng chọn file ảnh & Preview */}
              {uploadingGuideMap || analyzingMap ? (
                <div
                  style={{
                    padding: '30px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px dashed var(--border-color)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <div
                    className="spinner-border text-primary"
                    style={{ width: 28, height: 28, borderWidth: 2 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                      {uploadingGuideMap
                        ? 'Đang tải file ảnh lên hệ thống...'
                        : 'Đang tự động nhận diện không gian...'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
                      {uploadingGuideMap
                        ? 'Vui lòng chờ trong giây lát'
                        : 'Đang xử lý vị trí các gian phòng và cửa thông phòng'}
                    </div>
                  </div>
                </div>
              ) : uploadModalImageUrl ? (
                <div
                  style={{
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-subtle)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 10,
                    gap: 8
                  }}
                >
                  <div style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={uploadModalImageUrl}
                      alt="Bản đồ đã chọn"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => guideMapInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
                  >
                    <Upload size={12} />
                    <span>Chọn file khác</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => guideMapInputRef.current?.click()}
                  style={{
                    border: '1px dashed var(--border-color)',
                    background: 'var(--bg-subtle)',
                    borderRadius: 8,
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Upload size={16} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                    Bấm để chọn file ảnh bản đồ
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Hỗ trợ PNG, JPG, WEBP (Tối đa 20MB)
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
                background: 'var(--bg-surface)'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsUploadModalOpen(false)}
                disabled={uploadingGuideMap || analyzingMap}
              >
                Hủy bỏ
              </button>

              {uploadModalImageUrl ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    await handleAnalyzeFloorPlan(uploadModalImageUrl);
                    setIsUploadModalOpen(false);
                  }}
                  disabled={uploadingGuideMap || analyzingMap}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: '7px 16px' }}
                >
                  <Cpu size={14} />
                  <span>{analyzingMap ? 'Đang phân tích không gian...' : 'Xác nhận tải lên & Phân tích sơ đồ'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => guideMapInputRef.current?.click()}
                  disabled={uploadingGuideMap || analyzingMap}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Upload size={13} />
                  <span>Chọn file sơ đồ</span>
                </button>
              )}
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
