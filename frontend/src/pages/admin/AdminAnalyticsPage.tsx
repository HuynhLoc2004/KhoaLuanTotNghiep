import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Download,
  Search
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

  // Tab con nghiệp vụ (Tối giản chuẩn Admin, không icon lòe loẹt)
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

      // SHEET 1: TỔNG QUAN & KPI HỆ THỐNG
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

      // SHEET 2: DOANH THU & GIAO DỊCH VÉ
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

      // SHEET 3: GIAN PHÒNG TOUR 360°
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

      // SHEET 4: HIỆN VẬT DI SẢN & TỶ LỆ 3D
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

  const timelineData = analytics?.timeline || [];
  const maxRevenue = useMemo(() => {
    return Math.max(...timelineData.map((t) => t.revenue), 100000);
  }, [timelineData]);

  // Trạng thái vé: dot màu chuẩn hệ thống
  const renderStatusDot = (status: string) => {
    let dotColor = '#64748B';
    let text = 'Chưa sử dụng';
    if (status === 'paid') {
      dotColor = '#22C55E';
      text = 'Chưa sử dụng';
    } else if (status === 'used') {
      dotColor = '#64748B';
      text = 'Đã vào cổng';
    } else if (status === 'cancelled') {
      dotColor = '#EF4444';
      text = 'Đã hủy';
    }

    return (
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
        <span style={{ color: 'var(--text-main)' }}>{text}</span>
      </div>
    );
  };

  return (
    <div className="admin-content" style={{ padding: '20px 24px', maxWidth: 1440, margin: '0 auto' }}>
      {/* 1. HEADER & THAO TÁC TRANG CHUẨN ADMIN (KHÔNG CHẤM ĐỎ, NÚT CHUẨN ADMIN) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--heading-color)',
              margin: 0
            }}
          >
            {t('analytics.title', 'Báo cáo & Thống kê')}
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            {t(
              'analytics.subtitle',
              'Báo cáo tổng hợp số liệu thực tế vé tham quan, doanh thu, không gian Tour 360° và hiện vật di sản'
            )}
          </p>
        </div>

        {/* Bộ lọc thời gian chuẩn Dropdown & Nút bấm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
            style={{
              fontSize: 12.5,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            <option value="today">{t('analytics.timeRange.today', 'Hôm nay')}</option>
            <option value="week">{t('analytics.timeRange.week', '7 ngày qua')}</option>
            <option value="month">{t('analytics.timeRange.month', 'Tháng này')}</option>
            <option value="year">{t('analytics.timeRange.year', 'Năm nay')}</option>
            <option value="all">{t('analytics.timeRange.all', 'Tất cả thời gian')}</option>
            <option value="custom">{t('analytics.timeRange.custom', 'Tùy chỉnh khoảng ngày')}</option>
          </select>

          {/* Ô chọn ngày tùy chỉnh khi chọn custom */}
          {timeRange === 'custom' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="form-control"
                style={{
                  fontSize: 12,
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>-</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="form-control"
                style={{
                  fontSize: 12,
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)'
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleApplyCustomDate}
                style={{ padding: '5px 10px', fontSize: 12 }}
              >
                {t('analytics.apply', 'Áp dụng')}
              </button>
            </div>
          )}

          {/* Nút Xuất Excel: chuẩn btn-primary hệ thống */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Xuất file Excel đồng bộ ngôn ngữ hiện tại của Quản trị viên"
          >
            <Download size={14} />
            <span>
              {isExporting
                ? t('analytics.exporting', 'Đang xuất Excel...')
                : t('analytics.exportExcel', 'Xuất file Excel')}
            </span>
          </button>

          {/* Nút Làm mới: chuẩn btn-secondary hệ thống */}
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

      {/* 2. CHUYỂN ĐỔI TAB CON TỐI GIẢN (KHÔNG ICON, ĐÚNG CHUẨN ADMIN) */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 18
        }}
      >
        {[
          { id: 'overview', label: t('analytics.tabOverview', 'Tổng quan & Xu hướng') },
          { id: 'tickets', label: t('analytics.tabTickets', 'Doanh thu & Giao dịch vé') },
          { id: 'rooms', label: t('analytics.tabRooms', 'Gian phòng Tour 360°') },
          { id: 'artifacts', label: t('analytics.tabArtifacts', 'Cổ vật & Bảo vật 3D') }
        ].map((tab) => {
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--text-main)' : '2px solid transparent',
                background: 'transparent',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. DÃY THẺ KPI TỐI GIẢN (CHIA 2 HÀNG 3 CỘT CÂN ĐỐI 100%, KHÔNG ICON MÀU MÈ) */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          marginBottom: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)'
        }}
      >
        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpiRevenue', 'Doanh thu bán vé')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {formatVND(kpis.totalRevenue)}
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpiTicketsSold', 'Vé đã phát hành')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {kpis.totalTicketsSold.toLocaleString()}
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpiCheckinRate', 'Tỷ lệ vào cổng')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {kpis.checkinRate}%
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              ({kpis.totalTicketsUsed} / {kpis.totalTicketsSold} vé)
            </span>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpiRooms', 'Gian phòng 360°')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {kpis.totalRooms}
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              ({kpis.totalHotspots} hotspots)
            </span>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpi3DArtifacts', 'Số hóa 3D thực tế')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {kpis.total3DArtifacts}
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              / {kpis.totalArtifacts} ({rate3D}%)
            </span>
          </div>
        </div>

        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('analytics.kpiUsers', 'Tài khoản người dùng')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {kpis.totalUsers}
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
              ({kpis.totalSystemLogs} nhật ký)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          TAB 1: TỔNG QUAN & BIỂU ĐỒ DIỄN BIẾN
          ======================================================== */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 1. KHUNG BIỂU ĐỒ CHUỖI THỜI GIAN ĐỀU ĐẶN */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16
              }}
            >
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
                  {t('analytics.timelineTitle', 'Biểu đồ diễn biến doanh thu & lượt tham quan')}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Diễn biến doanh thu thực tế và lưu lượng vé phát hành theo mốc thời gian
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                  <span style={{ color: 'var(--text-main)' }}>Doanh thu (VNĐ)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#64748B' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Lượt vé bán</span>
                </div>
              </div>
            </div>

            {timelineData.length > 0 ? (
              <div style={{ position: 'relative', width: '100%' }}>
                {hoveredPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 12,
                      background: 'rgba(20, 23, 31, 0.95)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      padding: '6px 12px',
                      zIndex: 10,
                      pointerEvents: 'none',
                      fontSize: 12
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)' }}>
                      Ngày: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{hoveredPoint.dateLabel}</span>
                    </div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: 2 }}>
                      Doanh thu: {formatVND(hoveredPoint.revenue)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                      Vé bán: {hoveredPoint.tickets} • Soát vào: {hoveredPoint.checkins}
                    </div>
                  </div>
                )}

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 6 }}>
                  <div
                    style={{
                      minWidth: Math.max(timelineData.length * 42, 600),
                      height: 220,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 28,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pointerEvents: 'none',
                        opacity: 0.12
                      }}
                    >
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                      <div style={{ borderTop: '1px dashed #fff', width: '100%' }} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 8,
                        height: 180,
                        zIndex: 1,
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: 4
                      }}
                    >
                      {timelineData.map((item, idx) => {
                        const revPercent =
                          item.revenue > 0
                            ? Math.max(Math.round((item.revenue / maxRevenue) * 140), 10)
                            : 3;
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
                            {item.revenue > 0 && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: 'var(--text-muted)',
                                  marginBottom: 3,
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(0)}k` : item.revenue}
                              </div>
                            )}

                            <div
                              style={{
                                width: '100%',
                                maxWidth: 20,
                                height: `${revPercent}px`,
                                background: item.revenue > 0 ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '2px 2px 0 0',
                                opacity: isHovered ? 1 : 0.85,
                                transition: 'all 0.15s ease'
                              }}
                            />

                            <div
                              style={{
                                fontSize: 10.5,
                                color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
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
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('analytics.noData', 'Không có dữ liệu trong khoảng thời gian này')}
              </div>
            )}
          </div>

          {/* 2. HAI KHUNG PHÂN BỔ: LOẠI VÉ & KÊNH THANH TOÁN (TỐI GIẢN CHUẨN ADMIN) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {/* Phân bổ theo loại vé */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '16px 20px',
                minHeight: 180
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
                  {t('analytics.byTypeTitle', 'Phân bổ theo loại vé')}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {analytics?.ticketsByType?.length || 0} phân loại
                </span>
              </div>

              {analytics?.ticketsByType && analytics.ticketsByType.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {analytics.ticketsByType.map((tItem, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-main)' }}>{tItem.title || tItem.typeCode}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {tItem.count} vé • {formatVND(tItem.revenue)} ({tItem.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 5,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(tItem.percentage, 100)}%`,
                            height: '100%',
                            background: 'var(--primary)',
                            borderRadius: 3
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có giao dịch theo loại vé')}
                </div>
              )}
            </div>

            {/* Phân bổ theo phương thức thanh toán */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                padding: '16px 20px',
                minHeight: 180
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
                  {t('analytics.byPaymentTitle', 'Phương thức thanh toán')}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {analytics?.paymentMethods?.length || 0} cổng kết nối
                </span>
              </div>

              {analytics?.paymentMethods && analytics.paymentMethods.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {analytics.paymentMethods.map((pItem, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-main)' }}>{pItem.method}</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {pItem.count} đơn • {formatVND(pItem.revenue)} ({pItem.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 5,
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: 3,
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(pItem.percentage, 100)}%`,
                            height: '100%',
                            background: '#22C55E',
                            borderRadius: 3
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                  {t('analytics.noData', 'Chưa có dữ liệu kênh thanh toán')}
                </div>
              )}
            </div>
          </div>

          {/* 3. BẢNG GIAO DỊCH VÉ GẦN ĐÂY CÓ CHIỀU CAO CỐ ĐỊNH */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--heading-color)' }}>
                Giao dịch vé mới nhất trong kỳ
              </div>
              <button
                type="button"
                onClick={() => setSubTab('tickets')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Xem tất cả giao dịch
              </button>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>
                    <th style={{ padding: '9px 16px', width: '16%' }}>Mã vé</th>
                    <th style={{ padding: '9px 16px', width: '28%' }}>Khách tham quan</th>
                    <th style={{ padding: '9px 16px', width: '20%' }}>Loại vé</th>
                    <th style={{ padding: '9px 16px', width: '14%', textAlign: 'right' }}>Tổng tiền</th>
                    <th style={{ padding: '9px 16px', width: '12%' }}>Trạng thái</th>
                    <th style={{ padding: '9px 16px', width: '10%' }}>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, 4).map((tItem) => (
                    <tr key={tItem.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                        {tItem.ticketCode}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-main)' }}>
                        {tItem.userName}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                        {tItem.ticketTitle || tItem.ticketType}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatVND(tItem.totalAmount)}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {renderStatusDot(tItem.status)}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {formatDate(tItem.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        Chưa có giao dịch vé nào trong kỳ này
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
          TAB 2: DOANH THU & GIAO DỊCH VÉ CHI TIẾT (CỐ ĐỊNH CHIỀU CAO)
          ======================================================== */}
      {subTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Bộ lọc vé */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
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
                  placeholder={t('analytics.searchPlaceholder', 'Tìm kiếm mã vé, tên khách hàng...')}
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
                <option value="paid">{t('analytics.statusPaid', 'Chưa sử dụng')}</option>
                <option value="used">{t('analytics.statusUsed', 'Đã vào cổng')}</option>
                <option value="cancelled">{t('analytics.statusCancelled', 'Đã hủy')}</option>
              </select>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Hiển thị <strong style={{ color: 'var(--text-main)' }}>{filteredTickets.length}</strong> giao dịch vé trong kỳ
            </div>
          </div>

          {/* Bảng danh sách vé với chiều cao cố định minHeight 440px không bị co giật */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              minHeight: 440,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', flex: 1 }}>
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
                    <th style={{ padding: '10px 16px', width: '15%' }}>Mã vé</th>
                    <th style={{ padding: '10px 16px', width: '25%' }}>Khách tham quan</th>
                    <th style={{ padding: '10px 16px', width: '16%' }}>Loại vé</th>
                    <th style={{ padding: '10px 16px', width: '15%' }}>Ngày tham quan</th>
                    <th style={{ padding: '10px 16px', width: '12%', textAlign: 'right' }}>Tổng tiền</th>
                    <th style={{ padding: '10px 16px', width: '10%' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px', width: '7%' }}>Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>{t('analytics.loading', 'Đang nạp dữ liệu thống kê thực tế...')}</span>
                      </td>
                    </tr>
                  ) : paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        {t('analytics.noData', 'Không có giao dịch vé nào')}
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((tItem) => (
                      <tr
                        key={tItem.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                          {tItem.ticketCode}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{tItem.userName}</div>
                          {tItem.userEmail && (
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                              {tItem.userEmail}
                            </div>
                          )}
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
                          {renderStatusDot(tItem.status)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                          {tItem.paymentMethod || 'PayOS'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang cố định dưới chân khung bảng */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
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
          TAB 3: GIAN PHÒNG TOUR 360° (CỐ ĐỊNH CHIỀU CAO)
          ======================================================== */}
      {subTab === 'rooms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
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
                placeholder={t('rooms.searchPlaceholder', 'Tìm kiếm tên phòng, mã phòng...')}
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

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              minHeight: 440,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', flex: 1 }}>
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
                    <th style={{ padding: '10px 16px', width: '14%' }}>Mã phòng</th>
                    <th style={{ padding: '10px 16px', width: '32%' }}>Tên gian phòng 360°</th>
                    <th style={{ padding: '10px 16px', width: '24%' }}>Thời kỳ lịch sử</th>
                    <th style={{ padding: '10px 16px', width: '12%', textAlign: 'center' }}>Hotspots</th>
                    <th style={{ padding: '10px 16px', width: '10%', textAlign: 'center' }}>Quét QR</th>
                    <th style={{ padding: '10px 16px', width: '8%', textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
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
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                          {room.code || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-main)' }}>
                          {room.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          {room.period || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-main)' }}>
                          {room.hotspotsCount}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-main)' }}>
                          {room.qrScanCount || 0}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: room.active ? '#22C55E' : '#64748B',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ color: 'var(--text-main)' }}>
                              {room.active ? 'Mở cửa' : 'Tạm ẩn'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
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
          TAB 4: CỔ VẬT & BẢO VẬT 3D (CỐ ĐỊNH CHIỀU CAO & BẢNG CHUẨN MỰC)
          ======================================================== */}
      {subTab === 'artifacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hai bảng tóm tắt thời kỳ & phân loại: định dạng BẢNG chuẩn, cùng chiều cao */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {/* Phân bố theo thời kỳ lịch sử */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                overflow: 'hidden',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: 13, color: 'var(--heading-color)' }}>
                {t('analytics.artifactsPeriodTitle', 'Phân bố hiện vật theo thời kỳ lịch sử')}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 16px' }}>Thời kỳ lịch sử</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right' }}>Số hiện vật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.artifactsByPeriod && analytics.artifactsByPeriod.length > 0 ? (
                      analytics.artifactsByPeriod.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '9px 16px', color: 'var(--text-main)' }}>{p.period}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{p.count}</strong> hiện vật
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Chưa có dữ liệu thời kỳ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phân loại cổ vật theo danh mục */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                overflow: 'hidden',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: 13, color: 'var(--heading-color)' }}>
                {t('analytics.artifactsCategoryTitle', 'Phân loại cổ vật theo danh mục')}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 16px' }}>Danh mục phân loại</th>
                      <th style={{ padding: '8px 16px', textAlign: 'right' }}>Số hiện vật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.artifactsByCategory && analytics.artifactsByCategory.length > 0 ? (
                      analytics.artifactsByCategory.map((c, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '9px 16px', color: 'var(--text-main)' }}>{c.category}</td>
                          <td style={{ padding: '9px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{c.count}</strong> hiện vật
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Chưa có dữ liệu danh mục
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm hiện vật */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
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
                placeholder={t('analytics.searchPlaceholder', 'Tìm kiếm mã hiện vật, tên hiện vật...')}
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

          {/* Bảng danh sách hiện vật có chiều cao cố định minHeight 440px */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              minHeight: 440,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', flex: 1 }}>
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
                    <th style={{ padding: '10px 16px', width: '15%' }}>Mã hiện vật</th>
                    <th style={{ padding: '10px 16px', width: '35%' }}>Tên hiện vật di sản</th>
                    <th style={{ padding: '10px 16px', width: '22%' }}>Thời kỳ lịch sử</th>
                    <th style={{ padding: '10px 16px', width: '16%' }}>Phân loại</th>
                    <th style={{ padding: '10px 16px', width: '12%', textAlign: 'center' }}>Mô hình 3D</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArtifacts.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
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
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-main)' }}>
                          {a.code || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontWeight: 500 }}>
                          {a.name}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12.5 }}>
                          {a.period || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          {a.category || 'Cổ vật di sản'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: a.has3D ? '#22C55E' : '#64748B',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ color: 'var(--text-main)' }}>
                              {a.has3D ? 'Có mô hình 3D' : 'Ảnh 2D'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
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
