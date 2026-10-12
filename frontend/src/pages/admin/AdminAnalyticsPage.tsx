import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  Search,
  Filter,
  DollarSign,
  Ticket,
  CheckCircle2,
  Compass,
  Box,
  Users,
  Activity,
  Layers,
  Sparkles,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Tag,
  Clock,
  Eye,
  Building2,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api';
import {
  AnalyticsData,
  AnalyticsRecentTicket,
  AnalyticsRoomItem,
  AnalyticsArtifactItem,
  AnalyticsTimelineItem
} from '../../types';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useToast } from '../../components/Toast';
import { Pagination } from '../../components/Pagination';

// Bản dịch xuất Excel đồng bộ theo 5 ngôn ngữ hệ thống
const EXCEL_I18N: Record<string, any> = {
  vi: {
    sheetKpi: '1. Tổng quan & Chỉ số',
    sheetTickets: '2. Doanh thu & Chi tiết vé',
    sheetRooms: '3. Gian phòng Tour 360°',
    sheetArtifacts: '4. Hiện vật di sản & 3D',
    reportTitle: 'BÁO CÁO THỐNG KÊ HOẠT ĐỘNG BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH',
    exportTime: 'Thời điểm xuất báo cáo:',
    periodLabel: 'Kỳ báo cáo:',
    colMetric: 'Chỉ số thống kê',
    colValue: 'Giá trị thực tế',
    colUnit: 'Đơn vị tính',
    colNote: 'Ghi chú nghiệp vụ',
    rev: 'Doanh thu bán vé tham quan',
    ticketsSold: 'Tổng số vé đã phát hành',
    ticketsUsed: 'Số vé đã soát vào cổng',
    activeTickets: 'Số vé chưa sử dụng (hợp lệ)',
    cancelledTickets: 'Số vé đã hủy',
    checkinRate: 'Tỷ lệ khách vào cổng',
    totalRooms: 'Tổng số gian phòng Tour 360°',
    totalHotspots: 'Tổng số điểm tương tác Hotspot',
    totalArtifacts: 'Tổng số hiện vật di sản',
    total3D: 'Hiện vật đã số hóa 3D tương tác',
    rate3D: 'Tỷ lệ số hóa 3D hiện vật',
    totalUsers: 'Tổng số tài khoản người dùng',
    totalLogs: 'Nhật ký vận hành hệ thống',
    vnd: 'VNĐ',
    ticketUnit: 'vé',
    percent: '%',
    roomUnit: 'không gian',
    hotspotUnit: 'tọa độ',
    artifactUnit: 'hiện vật',
    userUnit: 'tài khoản',
    logUnit: 'sự kiện',
    tCode: 'Mã vé',
    tCustomer: 'Khách tham quan',
    tEmail: 'Email',
    tPhone: 'Số điện thoại',
    tType: 'Loại vé',
    tQty: 'Số lượng',
    tPrice: 'Đơn giá (VNĐ)',
    tTotal: 'Tổng tiền (VNĐ)',
    tVisitDate: 'Ngày tham quan',
    tSlot: 'Khung giờ',
    tStatus: 'Trạng thái vé',
    tPayment: 'Phương thức thanh toán',
    tCreated: 'Thời gian đặt vé',
    rCode: 'Mã phòng',
    rName: 'Tên gian trưng bày 360°',
    rPeriod: 'Thời kỳ lịch sử',
    rCategory: 'Chủ đề',
    rHotspots: 'Số điểm Hotspot',
    rQrScans: 'Lượt quét mã QR thực địa',
    rStatus: 'Trạng thái',
    rCreated: 'Thời gian khởi tạo',
    aCode: 'Mã hiện vật',
    aName: 'Tên hiện vật di sản',
    aPeriod: 'Thời kỳ lịch sử',
    aCategory: 'Phân loại',
    aHas3D: 'Mô hình 3D xoay 360°',
    aStatus: 'Trạng thái lưu trữ',
    aCreated: 'Thời gian tạo',
    statusPaid: 'Chưa sử dụng (Hợp lệ)',
    statusUsed: 'Đã vào cổng (Đã soát)',
    statusCancelled: 'Đã hủy',
    active: 'Đang mở đón khách',
    inactive: 'Tạm ẩn',
    yes3D: 'Đã có mô hình 3D',
    no3D: 'Chưa có 3D (Ảnh 2D)'
  },
  en: {
    sheetKpi: '1. Overview & KPIs',
    sheetTickets: '2. Revenue & Ticket Orders',
    sheetRooms: '3. 360 Rooms & Hotspots',
    sheetArtifacts: '4. Heritage Artifacts & 3D',
    reportTitle: 'ANALYTICS REPORT - HO CHI MINH CITY HISTORY MUSEUM',
    exportTime: 'Report Generated At:',
    periodLabel: 'Reporting Period:',
    colMetric: 'Performance Metric',
    colValue: 'Actual Value',
    colUnit: 'Unit',
    colNote: 'Operational Notes',
    rev: 'Total Ticket Revenue',
    ticketsSold: 'Total Tickets Issued',
    ticketsUsed: 'Tickets Checked In',
    activeTickets: 'Unused Valid Tickets',
    cancelledTickets: 'Cancelled Tickets',
    checkinRate: 'Visitor Check-in Rate',
    totalRooms: '360° Virtual Tour Rooms',
    totalHotspots: 'Interactive Hotspots Count',
    totalArtifacts: 'Total Heritage Artifacts',
    total3D: 'Interactive 3D Models',
    rate3D: '3D Digitization Ratio',
    totalUsers: 'Total Registered Users',
    totalLogs: 'System Activity Logs',
    vnd: 'VND',
    ticketUnit: 'tickets',
    percent: '%',
    roomUnit: 'spaces',
    hotspotUnit: 'points',
    artifactUnit: 'items',
    userUnit: 'accounts',
    logUnit: 'events',
    tCode: 'Ticket Code',
    tCustomer: 'Visitor Name',
    tEmail: 'Email',
    tPhone: 'Phone Number',
    tType: 'Ticket Type',
    tQty: 'Quantity',
    tPrice: 'Unit Price (VND)',
    tTotal: 'Total (VND)',
    tVisitDate: 'Visit Date',
    tSlot: 'Time Slot',
    tStatus: 'Status',
    tPayment: 'Payment Method',
    tCreated: 'Booking Time',
    rCode: 'Room Code',
    rName: '360° Exhibition Room Name',
    rPeriod: 'Historical Period',
    rCategory: 'Category',
    rHotspots: 'Hotspots Count',
    rQrScans: 'Field QR Scans',
    rStatus: 'Status',
    rCreated: 'Created Date',
    aCode: 'Artifact Code',
    aName: 'Heritage Artifact Name',
    aPeriod: 'Historical Period',
    aCategory: 'Classification',
    aHas3D: 'Interactive 3D Model',
    aStatus: 'Archive Status',
    aCreated: 'Created Date',
    statusPaid: 'Valid / Unused',
    statusUsed: 'Checked In',
    statusCancelled: 'Cancelled',
    active: 'Active & Open',
    inactive: 'Hidden',
    yes3D: '3D Model Available',
    no3D: '2D Image Only'
  },
  fr: {
    sheetKpi: '1. Aperçu & Indicateurs',
    sheetTickets: '2. Billetterie & Revenus',
    sheetRooms: '3. Salles 360° & Hotspots',
    sheetArtifacts: '4. Objets patrimoniaux & 3D',
    reportTitle: "RAPPORT STATISTIQUE - MUSÉE D'HISTOIRE DE HÔ CHI MINH-VILLE",
    exportTime: "Date d'exportation :",
    periodLabel: 'Période du rapport :',
    colMetric: 'Indicateur de performance',
    colValue: 'Valeur réelle',
    colUnit: 'Unité',
    colNote: 'Notes de service',
    rev: 'Revenus de la billetterie',
    ticketsSold: 'Nombre total de billets émis',
    ticketsUsed: 'Billets validés à l’entrée',
    activeTickets: 'Billets valides non utilisés',
    cancelledTickets: 'Billets annulés',
    checkinRate: 'Taux de présence',
    totalRooms: 'Salles de visite virtuelle 360°',
    totalHotspots: 'Points interactifs (Hotspots)',
    totalArtifacts: 'Nombre total d’objets patrimoniaux',
    total3D: 'Modèles 3D interactifs',
    rate3D: 'Taux de numérisation 3D',
    totalUsers: 'Comptes utilisateurs enregistrés',
    totalLogs: 'Journaux d’activité système',
    vnd: 'VND',
    ticketUnit: 'billets',
    percent: '%',
    roomUnit: 'salles',
    hotspotUnit: 'points',
    artifactUnit: 'objets',
    userUnit: 'comptes',
    logUnit: 'événements',
    tCode: 'Code du billet',
    tCustomer: 'Nom du visiteur',
    tEmail: 'Courriel',
    tPhone: 'Téléphone',
    tType: 'Type de billet',
    tQty: 'Quantité',
    tPrice: 'Prix unitaire (VND)',
    tTotal: 'Montant total (VND)',
    tVisitDate: 'Date de visite',
    tSlot: 'Créneau horaire',
    tStatus: 'Statut du billet',
    tPayment: 'Mode de paiement',
    tCreated: 'Date de réservation',
    rCode: 'Code de la salle',
    rName: 'Nom de la salle 360°',
    rPeriod: 'Période historique',
    rCategory: 'Thème',
    rHotspots: 'Nombre de hotspots',
    rQrScans: 'Scans QR sur site',
    rStatus: 'Statut',
    rCreated: 'Date de création',
    aCode: 'Code de l’objet',
    aName: 'Nom de l’objet du patrimoine',
    aPeriod: 'Période historique',
    aCategory: 'Classification',
    aHas3D: 'Modèle 3D interactif',
    aStatus: 'Statut d’archivage',
    aCreated: 'Date de création',
    statusPaid: 'Valide / Non utilisé',
    statusUsed: 'Validé à l’entrée',
    statusCancelled: 'Annulé',
    active: 'Actif & Ouvert',
    inactive: 'Masqué',
    yes3D: 'Modèle 3D disponible',
    no3D: 'Photo 2D uniquement'
  },
  zh: {
    sheetKpi: '1. 总体指标与概览',
    sheetTickets: '2. 门票收入与明细',
    sheetRooms: '3. 360全景展厅与热点',
    sheetArtifacts: '4. 文物资产与3D数字化',
    reportTitle: '胡志明市历史博物馆 - 运营综合统计分析报告',
    exportTime: '报表导出时间：',
    periodLabel: '统计周期：',
    colMetric: '统计考核指标',
    colValue: '实际数值',
    colUnit: '计量单位',
    colNote: '业务说明',
    rev: '门票总营业额',
    ticketsSold: '累计发售门票总数',
    ticketsUsed: '验票核销入馆门票数',
    activeTickets: '有效未核销门票数',
    cancelledTickets: '已退已取消门票数',
    checkinRate: '实际验票入场率',
    totalRooms: '360°全景展厅总数',
    totalHotspots: '交互导览热点总数',
    totalArtifacts: '历史文物馆藏总数',
    total3D: '已建立3D模型文物数',
    rate3D: '文物3D数字化比例',
    totalUsers: '系统注册用户总数',
    totalLogs: '系统运行审计日志数',
    vnd: '越盾 (VND)',
    ticketUnit: '张',
    percent: '%',
    roomUnit: '个展厅',
    hotspotUnit: '处热点',
    artifactUnit: '件文物',
    userUnit: '个账户',
    logUnit: '条事件',
    tCode: '门票编码',
    tCustomer: '参观游客姓名',
    tEmail: '电子邮箱',
    tPhone: '联系电话',
    tType: '门票种类',
    tQty: '订购数量',
    tPrice: '单价 (VND)',
    tTotal: '总额 (VND)',
    tVisitDate: '参观日期',
    tSlot: '入馆时段',
    tStatus: '门票状态',
    tPayment: '支付方式',
    tCreated: '下单时间',
    rCode: '展厅编码',
    rName: '360°全景展厅名称',
    rPeriod: '历史年代',
    rCategory: '展示分类',
    rHotspots: '交互热点数',
    rQrScans: '现场扫码互动人次',
    rStatus: '展厅状态',
    rCreated: '创建时间',
    aCode: '文物编号',
    aName: '文物资产名称',
    aPeriod: '历史年代',
    aCategory: '分类类别',
    aHas3D: '3D旋转模型',
    aStatus: '馆藏状态',
    aCreated: '登记时间',
    statusPaid: '有效未核销',
    statusUsed: '已核销入馆',
    statusCancelled: '已取消',
    active: '正常对外开放',
    inactive: '暂未开放',
    yes3D: '已建立3D模型',
    no3D: '仅2D平版图像'
  },
  ja: {
    sheetKpi: '1. 総合指標と概要',
    sheetTickets: '2. 売上とチケット明細',
    sheetRooms: '3. 360度展示室とスポット',
    sheetArtifacts: '4. 文化財と3Dデータ',
    reportTitle: 'ホーチミン市歴史博物館 - 運営統計分析レポート',
    exportTime: 'レポート出力日時：',
    periodLabel: '対象期間：',
    colMetric: '評価指標',
    colValue: '実績値',
    colUnit: '単位',
    colNote: '備考',
    rev: 'チケット総売上',
    ticketsSold: '総発行チケット数',
    ticketsUsed: '入場確認済みチケット数',
    activeTickets: '有効未使用チケット数',
    cancelledTickets: 'キャンセル済みチケット数',
    checkinRate: '入場確認率',
    totalRooms: '360°バーチャル展示室数',
    totalHotspots: 'インタラクティブスポット数',
    totalArtifacts: '歴史的文化財総数',
    total3D: '3Dデジタル化モデル数',
    rate3D: '3Dデジタル化率',
    totalUsers: '登録ユーザー数',
    totalLogs: 'システム稼働ログ数',
    vnd: 'VND',
    ticketUnit: '枚',
    percent: '%',
    roomUnit: '展示室',
    hotspotUnit: '箇所',
    artifactUnit: '点',
    userUnit: 'アカウント',
    logUnit: '件',
    tCode: 'チケット番号',
    tCustomer: '来館者名',
    tEmail: 'メールアドレス',
    tPhone: '電話番号',
    tType: 'チケット種別',
    tQty: '枚数',
    tPrice: '単価 (VND)',
    tTotal: '合計金額 (VND)',
    tVisitDate: '見学日',
    tSlot: '入場時間枠',
    tStatus: 'チケット状態',
    tPayment: '決済手段',
    tCreated: '予約日時',
    rCode: '展示室コード',
    rName: '360°展示室名称',
    rPeriod: '歴史的時代',
    rCategory: '展示テーマ',
    rHotspots: 'スポット数',
    rQrScans: '現地QRスキャン数',
    rStatus: 'ステータス',
    rCreated: '作成日時',
    aCode: '文化財番号',
    aName: '文化財名称',
    aPeriod: '歴史的時代',
    aCategory: '分類',
    aHas3D: '3Dインタラクティブモデル',
    aStatus: '保存状態',
    aCreated: '登録日時',
    statusPaid: '有効・未使用',
    statusUsed: '入場確認済',
    statusCancelled: 'キャンセル済',
    active: '公開中',
    inactive: '非公開',
    yes3D: '3Dモデルあり',
    no3D: '2D画像のみ'
  }
};

export const AdminAnalyticsPage: React.FC = () => {
  const { t, currentLang } = useClientTranslation();
  const { showToast } = useToast();

  // Tab con nghiệp vụ
  const [subTab, setSubTab] = useState<'overview' | 'tickets' | 'rooms' | 'artifacts'>('overview');

  // Bộ lọc thời gian chuẩn
  const [timeRange, setTimeRange] = useState<string>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Trạng thái dữ liệu
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<AnalyticsTimelineItem | null>(null);

  // Bộ lọc tìm kiếm & Phân trang trong các Tab
  // 1. Tab Tickets
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [ticketsPage, setTicketsPage] = useState<number>(1);
  const [ticketsLimit, setTicketsLimit] = useState<number>(6);

  // 2. Tab Rooms
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [roomsPage, setRoomsPage] = useState<number>(1);
  const [roomsLimit, setRoomsLimit] = useState<number>(6);

  // 3. Tab Artifacts
  const [artifactSearch, setArtifactSearch] = useState<string>('');
  const [artifactPeriodFilter, setArtifactPeriodFilter] = useState<string>('all');
  const [artifactsPage, setArtifactsPage] = useState<number>(1);
  const [artifactsLimit, setArtifactsLimit] = useState<number>(6);

  // Tải dữ liệu thực tế từ Backend API
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAnalytics({
        timeRange,
        startDate: timeRange === 'custom' ? customStart : undefined,
        endDate: timeRange === 'custom' ? customEnd : undefined
      });

      if (res && res.success && res.data) {
        setAnalytics(res.data);
      } else {
        showToast(res.message || 'Không thể tải dữ liệu thống kê', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi nạp báo cáo thống kê', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleApplyCustomDate = () => {
    if (!customStart) {
      showToast('Vui lòng chọn ngày bắt đầu', 'warning');
      return;
    }
    fetchAnalytics();
  };

  // Định dạng số tiền VNĐ chuẩn
  const formatVND = (amount: number) => {
    if (typeof amount !== 'number') return '0 ₫';
    return `${amount.toLocaleString('vi-VN')} ₫`;
  };

  // Định dạng ngày giờ chuẩn
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // ========================================================
  // XỬ LÝ LỌC & PHÂN TRANG (TICKETS, ROOMS, ARTIFACTS)
  // ========================================================
  const filteredTickets = useMemo(() => {
    if (!analytics?.recentTickets) return [];
    return analytics.recentTickets.filter((item: AnalyticsRecentTicket) => {
      const matchSearch =
        !ticketSearch.trim() ||
        (item.ticketCode && item.ticketCode.toLowerCase().includes(ticketSearch.toLowerCase())) ||
        (item.userName && item.userName.toLowerCase().includes(ticketSearch.toLowerCase())) ||
        (item.userEmail && item.userEmail.toLowerCase().includes(ticketSearch.toLowerCase())) ||
        (item.userPhone && item.userPhone.includes(ticketSearch));

      const matchStatus =
        ticketStatusFilter === 'all' || item.status === ticketStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [analytics?.recentTickets, ticketSearch, ticketStatusFilter]);

  const paginatedTickets = useMemo(() => {
    const start = (ticketsPage - 1) * ticketsLimit;
    return filteredTickets.slice(start, start + ticketsLimit);
  }, [filteredTickets, ticketsPage, ticketsLimit]);

  const filteredRooms = useMemo(() => {
    if (!analytics?.rooms) return [];
    return analytics.rooms.filter((room: AnalyticsRoomItem) => {
      return (
        !roomSearch.trim() ||
        (room.code && room.code.toLowerCase().includes(roomSearch.toLowerCase())) ||
        (room.name && room.name.toLowerCase().includes(roomSearch.toLowerCase())) ||
        (room.period && room.period.toLowerCase().includes(roomSearch.toLowerCase()))
      );
    });
  }, [analytics?.rooms, roomSearch]);

  const paginatedRooms = useMemo(() => {
    const start = (roomsPage - 1) * roomsLimit;
    return filteredRooms.slice(start, start + roomsLimit);
  }, [filteredRooms, roomsPage, roomsLimit]);

  const filteredArtifacts = useMemo(() => {
    if (!analytics?.artifacts) return [];
    return analytics.artifacts.filter((item: AnalyticsArtifactItem) => {
      const matchSearch =
        !artifactSearch.trim() ||
        (item.code && item.code.toLowerCase().includes(artifactSearch.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(artifactSearch.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(artifactSearch.toLowerCase()));

      const matchPeriod =
        artifactPeriodFilter === 'all' || item.period === artifactPeriodFilter;

      return matchSearch && matchPeriod;
    });
  }, [analytics?.artifacts, artifactSearch, artifactPeriodFilter]);

  const paginatedArtifacts = useMemo(() => {
    const start = (artifactsPage - 1) * artifactsLimit;
    return filteredArtifacts.slice(start, start + artifactsLimit);
  }, [filteredArtifacts, artifactsPage, artifactsLimit]);

  // ========================================================
  // XUẤT FILE EXCEL ĐỒNG BỘ ĐA NGÔN NGỮ (SHEETJS)
  // ========================================================
  const handleExportExcel = () => {
    if (!analytics) {
      showToast('Chưa có dữ liệu để xuất file Excel', 'warning');
      return;
    }

    try {
      setIsExporting(true);
      const langKey = EXCEL_I18N[currentLang] ? currentLang : 'vi';
      const dict = EXCEL_I18N[langKey];

      const kpis = analytics.kpis;
      const rate3D =
        kpis.totalArtifacts > 0
          ? ((kpis.total3DArtifacts / kpis.totalArtifacts) * 100).toFixed(1)
          : '0';

      const wb = XLSX.utils.book_new();

      // ======================================================
      // SHEET 1: TỔNG QUAN & KPI HỆ THỐNG
      // ======================================================
      const nowStr = new Date().toLocaleString('vi-VN');
      const timeRangeLabel =
        timeRange === 'today'
          ? t('analytics.timeRange.today', 'Hôm nay')
          : timeRange === 'week'
          ? t('analytics.timeRange.week', '7 ngày qua')
          : timeRange === 'month'
          ? t('analytics.timeRange.month', 'Tháng này')
          : timeRange === 'year'
          ? t('analytics.timeRange.year', 'Năm nay')
          : timeRange === 'custom'
          ? `${formatDate(analytics.startDate)} - ${formatDate(analytics.endDate)}`
          : t('analytics.timeRange.all', 'Tất cả');

      const kpiRows: any[][] = [
        [dict.reportTitle],
        [`${dict.exportTime} ${nowStr}`],
        [`${dict.periodLabel} ${timeRangeLabel}`],
        [],
        [dict.colMetric, dict.colValue, dict.colUnit, dict.colNote],
        [dict.rev, kpis.totalRevenue, dict.vnd, 'Doanh thu thực nhận từ vé tham quan'],
        [dict.ticketsSold, kpis.totalTicketsSold, dict.ticketUnit, 'Số lượng vé đã giao dịch thành công'],
        [dict.ticketsUsed, kpis.totalTicketsUsed, dict.ticketUnit, 'Số vé đã quét mã QR vào cửa'],
        [dict.activeTickets, kpis.activeTickets, dict.ticketUnit, 'Vé còn giá trị chưa vào cổng'],
        [dict.cancelledTickets, kpis.cancelledTickets, dict.ticketUnit, 'Vé đã hủy hoặc hoàn trả'],
        [dict.checkinRate, `${kpis.checkinRate}%`, dict.percent, 'Tỷ lệ khách đến thực tế'],
        [dict.totalRooms, kpis.totalRooms, dict.roomUnit, 'Gian phòng số hóa 360°'],
        [dict.totalHotspots, kpis.totalHotspots, dict.hotspotUnit, 'Điểm ghim hiện vật tương tác'],
        [dict.totalArtifacts, kpis.totalArtifacts, dict.artifactUnit, 'Kho tư liệu hiện vật số hóa'],
        [dict.total3D, kpis.total3DArtifacts, dict.artifactUnit, 'Cổ vật có mô hình 3D tương tác'],
        [dict.rate3D, `${rate3D}%`, dict.percent, 'Tỷ lệ chuyển đổi số 3D'],
        [dict.totalUsers, kpis.totalUsers, dict.userUnit, 'Tài khoản du khách và quản trị'],
        [dict.totalLogs, kpis.totalSystemLogs, dict.logUnit, 'Lượt tương tác và kiểm soát hệ thống']
      ];

      const wsKpi = XLSX.utils.aoa_to_sheet(kpiRows);
      wsKpi['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 16 }, { wch: 42 }];
      XLSX.utils.book_append_sheet(wb, wsKpi, dict.sheetKpi);

      // ======================================================
      // SHEET 2: DOANH THU & GIAO DỊCH VÉ
      // ======================================================
      const ticketHeaders = [
        dict.tCode,
        dict.tCustomer,
        dict.tEmail,
        dict.tPhone,
        dict.tType,
        dict.tQty,
        dict.tPrice,
        dict.tTotal,
        dict.tVisitDate,
        dict.tSlot,
        dict.tStatus,
        dict.tPayment,
        dict.tCreated
      ];

      const ticketRows: any[][] = [
        [dict.reportTitle],
        [`${dict.periodLabel} ${timeRangeLabel}`],
        [],
        ticketHeaders
      ];

      if (analytics.recentTickets && analytics.recentTickets.length > 0) {
        analytics.recentTickets.forEach((tItem) => {
          let statusText = dict.statusPaid;
          if (tItem.status === 'used') statusText = dict.statusUsed;
          else if (tItem.status === 'cancelled') statusText = dict.statusCancelled;

          ticketRows.push([
            tItem.ticketCode || '—',
            tItem.userName || '—',
            tItem.userEmail || '—',
            tItem.userPhone || '—',
            tItem.ticketTitle || tItem.ticketType || 'Vé tham quan',
            tItem.quantity || 1,
            tItem.unitPrice || 0,
            tItem.totalAmount || 0,
            formatDate(tItem.visitDate),
            tItem.timeSlot || 'Cả ngày',
            statusText,
            tItem.paymentMethod || 'Cổng điện tử',
            formatDateTime(tItem.createdAt)
          ]);
        });
      }

      const wsTickets = XLSX.utils.aoa_to_sheet(ticketRows);
      wsTickets['!cols'] = [
        { wch: 18 },
        { wch: 22 },
        { wch: 26 },
        { wch: 16 },
        { wch: 24 },
        { wch: 10 },
        { wch: 16 },
        { wch: 18 },
        { wch: 15 },
        { wch: 16 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsTickets, dict.sheetTickets);

      // ======================================================
      // SHEET 3: GIAN PHÒNG TOUR 360°
      // ======================================================
      const roomHeaders = [
        dict.rCode,
        dict.rName,
        dict.rPeriod,
        dict.rCategory,
        dict.rHotspots,
        dict.rQrScans,
        dict.rStatus,
        dict.rCreated
      ];

      const roomRows: any[][] = [
        [dict.reportTitle],
        [`${dict.periodLabel} ${timeRangeLabel}`],
        [],
        roomHeaders
      ];

      if (analytics.rooms && analytics.rooms.length > 0) {
        analytics.rooms.forEach((r) => {
          roomRows.push([
            r.code || '—',
            r.name || '—',
            r.period || '—',
            r.category || '—',
            r.hotspotsCount || 0,
            r.qrScanCount || 0,
            r.active ? dict.active : dict.inactive,
            formatDateTime(r.createdAt)
          ]);
        });
      }

      const wsRooms = XLSX.utils.aoa_to_sheet(roomRows);
      wsRooms['!cols'] = [
        { wch: 14 },
        { wch: 32 },
        { wch: 30 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsRooms, dict.sheetRooms);

      // ======================================================
      // SHEET 4: HIỆN VẬT DI SẢN & TỶ LỆ 3D
      // ======================================================
      const artifactHeaders = [
        dict.aCode,
        dict.aName,
        dict.aPeriod,
        dict.aCategory,
        dict.aHas3D,
        dict.aStatus,
        dict.aCreated
      ];

      const artifactRows: any[][] = [
        [dict.reportTitle],
        [`${dict.periodLabel} ${timeRangeLabel}`],
        [],
        artifactHeaders
      ];

      if (analytics.artifacts && analytics.artifacts.length > 0) {
        analytics.artifacts.forEach((a) => {
          artifactRows.push([
            a.code || '—',
            a.name || '—',
            a.period || '—',
            a.category || '—',
            a.has3D ? dict.yes3D : dict.no3D,
            a.status || 'active',
            formatDateTime(a.createdAt)
          ]);
        });
      }

      const wsArtifacts = XLSX.utils.aoa_to_sheet(artifactRows);
      wsArtifacts['!cols'] = [
        { wch: 16 },
        { wch: 36 },
        { wch: 30 },
        { wch: 22 },
        { wch: 22 },
        { wch: 16 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsArtifacts, dict.sheetArtifacts);

      // Lưu file với tên theo ngôn ngữ
      const dateSuffix = new Date().toISOString().slice(0, 10);
      const fileName =
        langKey === 'en'
          ? `Museum_Analytics_Report_${dateSuffix}.xlsx`
          : langKey === 'fr'
          ? `Rapport_Statistiques_Musee_${dateSuffix}.xlsx`
          : langKey === 'zh'
          ? `胡志明市历史博物馆_统计分析报表_${dateSuffix}.xlsx`
          : langKey === 'ja'
          ? `歴史博物館_統計分析レポート_${dateSuffix}.xlsx`
          : `BaoCao_ThongKe_BaoTang_${dateSuffix}.xlsx`;

      XLSX.writeFile(wb, fileName);
      showToast(t('analytics.exportSuccess', 'Đã xuất file báo cáo Excel thành công!'), 'success');
    } catch (err: any) {
      showToast(err.message || t('analytics.exportError', 'Lỗi khi xuất file Excel'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = analytics?.kpis || {
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalTicketsUsed: 0,
    activeTickets: 0,
    cancelledTickets: 0,
    checkinRate: 0,
    totalRooms: 0,
    totalHotspots: 0,
    totalArtifacts: 0,
    total3DArtifacts: 0,
    totalUsers: 0,
    totalSystemLogs: 0
  };

  const rate3D =
    kpis.totalArtifacts > 0
      ? Number(((kpis.total3DArtifacts / kpis.totalArtifacts) * 100).toFixed(1))
      : 0;

  // Tính toán các chỉ số cho biểu đồ
  const timelineData = analytics?.timeline || [];
  const maxRevenue = useMemo(() => {
    return Math.max(...timelineData.map((t) => t.revenue), 100000);
  }, [timelineData]);

  const maxTickets = useMemo(() => {
    return Math.max(...timelineData.map((t) => t.tickets), 5);
  }, [timelineData]);

  return (
    <div className="admin-content" style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto' }}>
      {/* 1. HEADER & THAO TÁC TRANG CHUẨN CAO CẤP */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 22
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'inline-block'
              }}
            />
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--heading-color)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}
            >
              {t('analytics.title', 'Báo cáo & Thống kê')}
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            {t(
              'analytics.subtitle',
              'Báo cáo tổng hợp số liệu thực tế vé tham quan, doanh thu, không gian Tour 360° và hiện vật di sản'
            )}
          </p>
        </div>

        {/* Thanh công cụ lọc thời gian & Tác vụ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Bộ chọn mốc thời gian dạng Pill Button tinh gọn */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: 3,
              gap: 2
            }}
          >
            {[
              { id: 'today', label: t('analytics.timeRange.today', 'Hôm nay') },
              { id: 'week', label: t('analytics.timeRange.week', '7 ngày qua') },
              { id: 'month', label: t('analytics.timeRange.month', 'Tháng này') },
              { id: 'year', label: t('analytics.timeRange.year', 'Năm nay') },
              { id: 'all', label: t('analytics.timeRange.all', 'Tất cả') },
              { id: 'custom', label: t('analytics.timeRange.custom', 'Tùy chỉnh') }
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setTimeRange(pill.id)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: timeRange === pill.id ? 'var(--primary)' : 'transparent',
                  color: timeRange === pill.id ? '#FFF8F0' : 'var(--text-muted)',
                  fontSize: 12,
                  fontWeight: timeRange === pill.id ? 600 : 500,
                  padding: '5px 11px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Ô chọn ngày tùy chỉnh khi kích hoạt */}
          {timeRange === 'custom' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '4px 8px'
              }}
            >
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  fontSize: 12,
                  padding: '3px 6px',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  fontSize: 12,
                  padding: '3px 6px',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleApplyCustomDate}
                style={{ padding: '3px 8px', fontSize: 11.5 }}
              >
                {t('analytics.apply', 'Áp dụng')}
              </button>
            </div>
          )}

          {/* Nút Xuất file Excel Đa ngôn ngữ */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(139, 37, 34, 0.25)'
            }}
            title="Xuất tệp Excel đa ngôn ngữ đồng bộ dữ liệu thực tế"
          >
            <Download size={14} />
            <span>
              {isExporting
                ? t('analytics.exporting', 'Đang xuất Excel...')
                : t('analytics.exportExcel', 'Xuất file Excel')}
            </span>
          </button>

          {/* Nút Làm mới */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchAnalytics}
            disabled={isLoading || isExporting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>{t('analytics.refresh', 'Làm mới')}</span>
          </button>
        </div>
      </div>

      {/* 2. CHUYỂN ĐỔI SUB-TAB CHUẨN ADMIN */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 20
        }}
      >
        {[
          { id: 'overview', icon: BarChart3, label: t('analytics.tabOverview', 'Tổng quan & Xu hướng') },
          { id: 'tickets', icon: Ticket, label: t('analytics.tabTickets', 'Doanh thu & Giao dịch vé') },
          { id: 'rooms', icon: Compass, label: t('analytics.tabRooms', 'Gian phòng Tour 360°') },
          { id: 'artifacts', icon: Box, label: t('analytics.tabArtifacts', 'Cổ vật & Bảo vật 3D') }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s ease'
              }}
            >
              <IconComponent size={15} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. LƯỚI CARD KPI CÂN XỨNG & ĐẲNG CẤP (6 THẺ ĐỒNG ĐỀU, KHÔNG BAO GIỜ BỊ RỚT LẺ) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 22
        }}
      >
        {/* KPI 1: Doanh thu bán vé */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpiRevenue', 'Doanh thu bán vé')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(139, 37, 34, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading-color)', letterSpacing: '-0.02em' }}>
            {formatVND(kpis.totalRevenue)}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Thực thu từ giao dịch trực tuyến
          </div>
        </div>

        {/* KPI 2: Vé đã phát hành */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpiTicketsSold', 'Vé đã phát hành')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ticket size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading-color)', letterSpacing: '-0.02em' }}>
            {kpis.totalTicketsSold.toLocaleString()}
          </div>
          <div style={{ fontSize: 11.5, color: '#3B82F6', marginTop: 4 }}>
            {kpis.activeTickets} vé hợp lệ đang kích hoạt
          </div>
        </div>

        {/* KPI 3: Lượt vào cổng & Tỷ lệ check-in */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpiCheckinRate', 'Tỷ lệ vào cổng')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22C55E', letterSpacing: '-0.02em' }}>
            {kpis.checkinRate}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {kpis.totalTicketsUsed} / {kpis.totalTicketsSold} vé đã soát vào cổng
          </div>
        </div>

        {/* KPI 4: Gian phòng Tour 360° */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpiRooms', 'Gian phòng 360°')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06B6D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Compass size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading-color)', letterSpacing: '-0.02em' }}>
            {kpis.totalRooms}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {kpis.totalHotspots} điểm ghim Hotspots tương tác
          </div>
        </div>

        {/* KPI 5: Cổ vật & Số hóa 3D */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpi3DArtifacts', 'Số hóa 3D thực tế')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#EAB308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#EAB308', letterSpacing: '-0.02em' }}>
            {kpis.total3DArtifacts}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>
              / {kpis.totalArtifacts} ({rate3D}%)
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            Mô hình 3D tương tác xoay 360°
          </div>
        </div>

        {/* KPI 6: Tài khoản người dùng */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '16px 18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('analytics.kpiUsers', 'Tài khoản & Nhật ký')}
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--heading-color)', letterSpacing: '-0.02em' }}>
            {kpis.totalUsers}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {kpis.totalSystemLogs} sự kiện giám sát hệ thống
          </div>
        </div>
      </div>

      {/* ========================================================
          TAB 1: TỔNG QUAN & BIỂU ĐỒ DIỄN BIẾN EXECUTIVE
          ======================================================== */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. KHUNG BIỂU ĐỒ DIỄN BIẾN CHUẨN ĐỒ HỌA CAO CẤP */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '20px 24px'
            }}
          >
            {/* Header Biểu đồ */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 20
              }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  {t('analytics.timelineTitle', 'Biểu đồ diễn biến doanh thu & lượt tham quan')}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Theo dõi xu hướng biến động doanh thu vé và lưu lượng khách theo mốc thời gian thực tế
                </p>
              </div>

              {/* Chú thích dữ liệu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Doanh thu (VNĐ)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#22C55E' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Lượt vé bán</span>
                </div>
              </div>
            </div>

            {/* Nội dung biểu đồ chuyên nghiệp với Tooltip & Trục tọa độ */}
            {timelineData.length > 0 ? (
              <div style={{ position: 'relative', width: '100%' }}>
                {/* Tooltip nổi khi hover */}
                {hoveredPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 16,
                      background: 'rgba(20, 23, 31, 0.95)',
                      border: '1px solid var(--primary)',
                      borderRadius: 8,
                      padding: '8px 14px',
                      zIndex: 10,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      pointerEvents: 'none'
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Thời gian: <strong style={{ color: 'var(--text-main)' }}>{hoveredPoint.dateLabel}</strong>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                      Doanh thu: {formatVND(hoveredPoint.revenue)}
                    </div>
                    <div style={{ fontSize: 12, color: '#22C55E', marginTop: 2 }}>
                      Vé bán: {hoveredPoint.tickets} vé • Đã soát: {hoveredPoint.checkins} lượt
                    </div>
                  </div>
                )}

                {/* Biểu đồ dạng Bar/Column với đường lưới chuẩn Grid */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 10 }}>
                  <div
                    style={{
                      minWidth: Math.max(timelineData.length * 48, 640),
                      height: 240,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      position: 'relative'
                    }}
                  >
                    {/* Các đường lưới ngang phụ trợ (Grid lines) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pointerEvents: 'none',
                        opacity: 0.15
                      }}
                    >
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                    </div>

                    {/* Dãy cột dữ liệu thực tế */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 10,
                        height: 200,
                        zIndex: 1,
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: 6
                      }}
                    >
                      {timelineData.map((item, idx) => {
                        const revPercent =
                          item.revenue > 0
                            ? Math.max(Math.round((item.revenue / maxRevenue) * 160), 12)
                            : 4;

                        const isHovered = hoveredPoint?.dateLabel === item.dateLabel;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredPoint(item)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              height: '100%',
                              cursor: 'pointer'
                            }}
                          >
                            {/* Nhãn doanh thu trên đầu cột nếu có giá trị */}
                            {item.revenue > 0 && (
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: 'var(--primary)',
                                  marginBottom: 4,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.revenue >= 1000000
                                  ? `${(item.revenue / 1000000).toFixed(1)}M`
                                  : item.revenue >= 1000
                                  ? `${(item.revenue / 1000).toFixed(0)}k`
                                  : item.revenue}
                              </div>
                            )}

                            {/* Cột thể hiện doanh thu */}
                            <div
                              style={{
                                width: '100%',
                                maxWidth: 28,
                                height: `${revPercent}px`,
                                background:
                                  item.revenue > 0
                                    ? isHovered
                                      ? '#D4AF37'
                                      : 'linear-gradient(180deg, var(--primary) 0%, rgba(139, 37, 34, 0.7) 100%)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.2s ease',
                                transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                                transformOrigin: 'bottom'
                              }}
                            />

                            {/* Nhãn ngày/giờ dưới chân cột */}
                            <div
                              style={{
                                fontSize: 10.5,
                                color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
                                fontWeight: isHovered ? 600 : 400,
                                marginTop: 6,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {item.dateLabel.length > 5 ? item.dateLabel.slice(5) : item.dateLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('analytics.noData', 'Không có dữ liệu trong khoảng thời gian này')}
              </div>
            )}
          </div>

          {/* 2. HAI CARD PHÂN BỔ THỊ PHẦN: LOẠI VÉ & PHƯƠNG THỨC THANH TOÁN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {/* Phân bổ theo loại vé */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '18px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag size={16} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                    {t('analytics.byTypeTitle', 'Phân bổ theo loại vé')}
                  </h3>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {analytics?.ticketsByType?.length || 0} phân loại
                </span>
              </div>

              {analytics?.ticketsByType && analytics.ticketsByType.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {analytics.ticketsByType.map((tItem, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {tItem.title || tItem.typeCode}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {tItem.count} vé
                          </span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                            {formatVND(tItem.revenue)}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--primary)',
                              background: 'rgba(139, 37, 34, 0.12)',
                              padding: '1px 6px',
                              borderRadius: 4
                            }}
                          >
                            {tItem.percentage}%
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 7,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(tItem.percentage, 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary) 0%, #D4AF37 100%)',
                            borderRadius: 4
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có giao dịch theo loại vé')}
                </div>
              )}
            </div>

            {/* Phân bổ theo phương thức thanh toán */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '18px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={16} style={{ color: '#22C55E' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                    {t('analytics.byPaymentTitle', 'Phương thức thanh toán')}
                  </h3>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {analytics?.paymentMethods?.length || 0} cổng kết nối
                </span>
              </div>

              {analytics?.paymentMethods && analytics.paymentMethods.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {analytics.paymentMethods.map((pItem, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {pItem.method}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {pItem.count} đơn
                          </span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                            {formatVND(pItem.revenue)}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: '#22C55E',
                              background: 'rgba(34, 197, 94, 0.12)',
                              padding: '1px 6px',
                              borderRadius: 4
                            }}
                          >
                            {pItem.percentage}%
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 7,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pItem.percentage, 100)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)',
                            borderRadius: 4
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có dữ liệu kênh thanh toán')}
                </div>
              )}
            </div>
          </div>

          {/* 3. NHẬT KÝ GIAO DỊCH VÉ GẦN ĐÂY TRONG KỲ (MINI-TABLE TRỰC QUAN TRÊN TRANG TỔNG QUAN) */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '18px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  Giao dịch vé mới nhất trong kỳ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('tickets')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Xem tất cả giao dịch</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Mã vé</th>
                    <th style={{ padding: '8px 12px' }}>Khách tham quan</th>
                    <th style={{ padding: '8px 12px' }}>Loại vé</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Số tiền</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Trạng thái</th>
                    <th style={{ padding: '8px 12px' }}>Thời gian mua</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, 5).map((tItem) => (
                    <tr key={tItem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                        {tItem.ticketCode}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-main)', fontWeight: 500 }}>
                        {tItem.userName}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        {tItem.ticketTitle || tItem.ticketType}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatVND(tItem.totalAmount)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              tItem.status === 'paid'
                                ? 'rgba(34, 197, 94, 0.12)'
                                : tItem.status === 'used'
                                ? 'rgba(100, 116, 139, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            color:
                              tItem.status === 'paid'
                                ? '#22C55E'
                                : tItem.status === 'used'
                                ? '#64748B'
                                : '#EF4444'
                          }}
                        >
                          {tItem.status === 'paid' ? 'Hợp lệ' : tItem.status === 'used' ? 'Đã vào cổng' : 'Đã hủy'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 11.5 }}>
                        {formatDateTime(tItem.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Chưa có giao dịch vé nào trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: DOANH THU & GIAO DỊCH VÉ CHI TIẾT
          ======================================================== */}
      {subTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Bộ lọc vé */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={ticketSearch}
                  onChange={(e) => {
                    setTicketSearch(e.target.value);
                    setTicketsPage(1);
                  }}
                  placeholder={t('analytics.searchPlaceholder', 'Tìm kiếm mã vé, tên khách, email, điện thoại...')}
                  className="form-control"
                  style={{
                    width: '100%',
                    paddingLeft: 32,
                    fontSize: 12.5,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderRadius: 6,
                    background: 'var(--bg-main, #14171F)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>

              <select
                value={ticketStatusFilter}
                onChange={(e) => {
                  setTicketStatusFilter(e.target.value);
                  setTicketsPage(1);
                }}
                className="form-control"
                style={{
                  fontSize: 12.5,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-main, #14171F)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <option value="all">{t('analytics.allStatus', 'Tất cả trạng thái')}</option>
                <option value="paid">{t('analytics.statusPaid', 'Chưa sử dụng (Hợp lệ)')}</option>
                <option value="used">{t('analytics.statusUsed', 'Đã vào cổng')}</option>
                <option value="cancelled">{t('analytics.statusCancelled', 'Đã hủy')}</option>
              </select>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Hiển thị <strong style={{ color: 'var(--text-main)' }}>{filteredTickets.length}</strong> giao dịch vé trong kỳ
            </div>
          </div>

          {/* Bảng danh sách vé */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 860, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: 11.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    <th style={{ padding: '10px 16px', width: '14%' }}>Mã vé</th>
                    <th style={{ padding: '10px 16px', width: '22%' }}>Khách tham quan</th>
                    <th style={{ padding: '10px 16px', width: '16%' }}>Loại vé</th>
                    <th style={{ padding: '10px 16px', width: '14%' }}>Ngày tham quan</th>
                    <th style={{ padding: '10px 16px', width: '14%', textAlign: 'right' }}>Tổng tiền</th>
                    <th style={{ padding: '10px 16px', width: '10%' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px', width: '10%' }}>Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>{t('analytics.loading', 'Đang nạp dữ liệu thống kê thực tế...')}</span>
                      </td>
                    </tr>
                  ) : paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        {t('analytics.noData', 'Không có giao dịch vé nào phù hợp')}
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((tItem) => {
                      let dotColor = '#64748B';
                      let statusText = 'Chưa sử dụng';
                      if (tItem.status === 'paid') {
                        dotColor = '#22C55E';
                        statusText = 'Hợp lệ';
                      } else if (tItem.status === 'used') {
                        dotColor = '#64748B';
                        statusText = 'Đã vào cổng';
                      } else if (tItem.status === 'cancelled') {
                        dotColor = '#EF4444';
                        statusText = 'Đã hủy';
                      }

                      return (
                        <tr
                          key={tItem.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                            {tItem.ticketCode}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tItem.userName}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                              {tItem.userEmail || tItem.userPhone || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                            {tItem.ticketTitle || tItem.ticketType}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12.5 }}>
                            {formatDate(tItem.visitDate)}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tItem.timeSlot || '08:00 - 17:00'}</div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                            {formatVND(tItem.totalAmount)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: dotColor,
                                  display: 'inline-block'
                                }}
                              />
                              <span style={{ color: 'var(--text-main)' }}>{statusText}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                            {tItem.paymentMethod || 'PayOS'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang chuẩn hệ thống */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              <Pagination
                currentPage={ticketsPage}
                totalItems={filteredTickets.length}
                pageSize={ticketsLimit}
                onPageChange={setTicketsPage}
                onPageSizeChange={(newSize) => {
                  setTicketsLimit(newSize);
                  setTicketsPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: GIAN PHÒNG TOUR 360° & TƯƠNG TÁC
          ======================================================== */}
      {subTab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Thanh tìm kiếm phòng */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => {
                  setRoomSearch(e.target.value);
                  setRoomsPage(1);
                }}
                placeholder={t('rooms.searchPlaceholder', 'Tìm kiếm tên phòng, mã phòng, thời kỳ...')}
                className="form-control"
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  fontSize: 12.5,
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderRadius: 6,
                  background: 'var(--bg-main, #14171F)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Tổng số <strong style={{ color: 'var(--text-main)' }}>{filteredRooms.length}</strong> gian trưng bày 360°
            </div>
          </div>

          {/* Bảng danh sách phòng Tour 360 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 800, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: 11.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    <th style={{ padding: '10px 16px', width: '12%' }}>Mã phòng</th>
                    <th style={{ padding: '10px 16px', width: '32%' }}>Tên gian phòng 360°</th>
                    <th style={{ padding: '10px 16px', width: '24%' }}>Thời kỳ lịch sử</th>
                    <th style={{ padding: '10px 16px', width: '12%', textAlign: 'center' }}>Hotspots</th>
                    <th style={{ padding: '10px 16px', width: '12%', textAlign: 'center' }}>Quét QR</th>
                    <th style={{ padding: '10px 16px', width: '8%', textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        {t('analytics.noData', 'Không tìm thấy gian phòng nào')}
                      </td>
                    </tr>
                  ) : (
                    paginatedRooms.map((room) => (
                      <tr
                        key={room.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                          {room.code || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {room.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          {room.period || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-main)' }}>
                          {room.hotspotsCount}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#22C55E' }}>
                          {room.qrScanCount || 0}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: room.active ? 'rgba(34, 197, 94, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: room.active ? '#22C55E' : '#64748B'
                            }}
                          >
                            {room.active ? 'Mở cửa' : 'Tạm ẩn'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang chuẩn hệ thống */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              <Pagination
                currentPage={roomsPage}
                totalItems={filteredRooms.length}
                pageSize={roomsLimit}
                onPageChange={setRoomsPage}
                onPageSizeChange={(newSize) => {
                  setRoomsLimit(newSize);
                  setRoomsPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: CỔ VẬT & BẢO VẬT 3D
          ======================================================== */}
      {subTab === 'artifacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Thẻ tóm tắt phân loại & thời kỳ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {/* Phân bố theo thời kỳ */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '18px 20px'
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 14px 0' }}>
                {t('analytics.artifactsPeriodTitle', 'Phân bố hiện vật theo thời kỳ lịch sử')}
              </h3>

              {analytics?.artifactsByPeriod && analytics.artifactsByPeriod.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {analytics.artifactsByPeriod.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{p.period}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--heading-color)' }}>{p.count}</strong> hiện vật
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có phân bố thời kỳ')}
                </div>
              )}
            </div>

            {/* Phân loại cổ vật */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '18px 20px'
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 14px 0' }}>
                {t('analytics.artifactsCategoryTitle', 'Phân loại cổ vật theo danh mục')}
              </h3>

              {analytics?.artifactsByCategory && analytics.artifactsByCategory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {analytics.artifactsByCategory.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{c.category}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--heading-color)' }}>{c.count}</strong> hiện vật
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có phân loại danh mục')}
                </div>
              )}
            </div>
          </div>

          {/* Bộ lọc hiện vật */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={artifactSearch}
                onChange={(e) => {
                  setArtifactSearch(e.target.value);
                  setArtifactsPage(1);
                }}
                placeholder={t('analytics.searchPlaceholder', 'Tìm kiếm mã, tên hiện vật, phân loại...')}
                className="form-control"
                style={{
                  width: '100%',
                  paddingLeft: 32,
                  fontSize: 12.5,
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderRadius: 6,
                  background: 'var(--bg-main, #14171F)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Hiển thị <strong style={{ color: 'var(--text-main)' }}>{filteredArtifacts.length}</strong> hiện vật trong kho
            </div>
          </div>

          {/* Bảng danh sách hiện vật di sản */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 840, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: 11.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}
                  >
                    <th style={{ padding: '10px 16px', width: '14%' }}>Mã hiện vật</th>
                    <th style={{ padding: '10px 16px', width: '32%' }}>Tên hiện vật di sản</th>
                    <th style={{ padding: '10px 16px', width: '22%' }}>Thời kỳ lịch sử</th>
                    <th style={{ padding: '10px 16px', width: '18%' }}>Phân loại</th>
                    <th style={{ padding: '10px 16px', width: '14%', textAlign: 'center' }}>Số hóa 3D</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArtifacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        {t('analytics.noData', 'Không tìm thấy hiện vật nào')}
                      </td>
                    </tr>
                  ) : (
                    paginatedArtifacts.map((a) => (
                      <tr
                        key={a.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                          {a.code || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {a.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12.5 }}>
                          {a.period || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                          {a.category || 'Cổ vật di sản'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: a.has3D ? 'rgba(234, 179, 8, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: a.has3D ? '#EAB308' : '#64748B'
                            }}
                          >
                            {a.has3D ? 'Mô hình 3D' : 'Ảnh 2D'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang chuẩn hệ thống */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              <Pagination
                currentPage={artifactsPage}
                totalItems={filteredArtifacts.length}
                pageSize={artifactsLimit}
                onPageChange={setArtifactsPage}
                onPageSizeChange={(newSize) => {
                  setArtifactsLimit(newSize);
                  setArtifactsPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
