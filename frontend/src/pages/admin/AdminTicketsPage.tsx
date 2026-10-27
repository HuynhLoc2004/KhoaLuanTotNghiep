import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  X,
  Plus,
  Edit2,
  Trash2,
  Clock,
  QrCode,
  Tag
} from 'lucide-react';
import { api, API_BASE } from '../../services/api';
import {
  AdminTicketItem,
  AdminTicketStats,
  TicketTypeItem,
  TicketTimeSlotItem,
  AdminOrderItem
} from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';
import { AdminTicketScannerModal } from '../../components/admin/AdminTicketScannerModal';

export const AdminTicketsPage: React.FC = () => {
  const { showToast } = useToast();

  // Tab con: 'tickets' | 'pricing' | 'orders'
  const [subTab, setSubTab] = useState<'tickets' | 'pricing' | 'orders'>('tickets');

  // ==========================================
  // TAB 1: DANH SÁCH & SOÁT VÉ
  // ==========================================
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [stats, setStats] = useState<AdminTicketStats>({
    totalTickets: 0,
    activeTickets: 0,
    usedTickets: 0,
    cancelledTickets: 0,
    totalRevenue: 0
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1
  });

  // Bộ lọc vé
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal Chi tiết vé & Soát vé QR
  const [detailTicket, setDetailTicket] = useState<AdminTicketItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Modal Xác nhận (Soát vé / Hủy vé)
  const [checkinTarget, setCheckinTarget] = useState<AdminTicketItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminTicketItem | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Tải danh sách vé từ API Quản trị
  const fetchTickets = async (page: number = 1, limit: number = pagination.limit) => {
    try {
      setIsLoading(true);
      const res = await api.getAdminTickets({
        search: searchTerm.trim(),
        status: statusFilter,
        ticketType: typeFilter,
        visitDate: dateFilter,
        page,
        limit
      });

      if (res && res.success) {
        setTickets(res.data || []);
        if (res.pagination) {
          setPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages
          });
        }
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách vé quản trị', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (subTab !== 'tickets') return;
    const timer = setTimeout(() => {
      fetchTickets(1, pagination.limit);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, dateFilter, subTab]);

  // Soát vé
  const handleConfirmCheckin = async () => {
    if (!checkinTarget) return;
    try {
      setIsProcessingAction(true);
      const res = await api.adminCheckinTicket(checkinTarget.ticketCode);
      showToast(res.message || `Đã soát vé ${checkinTarget.ticketCode} thành công!`, 'success');
      setCheckinTarget(null);
      if (detailTicket && detailTicket.ticketCode === checkinTarget.ticketCode) {
        setDetailTicket({ ...detailTicket, status: 'used', usedAt: new Date().toISOString() });
      }
      fetchTickets(pagination.page, pagination.limit);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi soát vé vào cổng', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Hủy vé
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      setIsProcessingAction(true);
      const res = await api.adminCancelTicket(cancelTarget.ticketCode);
      showToast(res.message || `Đã hủy vé ${cancelTarget.ticketCode}`, 'success');
      setCancelTarget(null);
      if (detailTicket && detailTicket.ticketCode === cancelTarget.ticketCode) {
        setDetailTicket({ ...detailTicket, status: 'cancelled' });
      }
      fetchTickets(pagination.page, pagination.limit);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi hủy vé', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // ==========================================
  // TAB 2: CẤU HÌNH GIÁ VÉ & KHUNG GIỜ
  // ==========================================
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TicketTimeSlotItem[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // Modal Sửa / Thêm loại vé & Lỗi Validation
  const [editingType, setEditingType] = useState<Partial<TicketTypeItem> | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeErrors, setTypeErrors] = useState<{ code?: string; name?: string; price?: string }>({});
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<TicketTypeItem | null>(null);

  // Modal Sửa / Thêm khung giờ & Lỗi Validation
  const [editingSlot, setEditingSlot] = useState<Partial<TicketTimeSlotItem> | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotErrors, setSlotErrors] = useState<{ slotName?: string; maxCapacity?: string; timeRange?: string }>({});
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<TicketTimeSlotItem | null>(null);

  // Phân trang Tab 2: Bảng giá loại vé & Khung giờ
  const [typePage, setTypePage] = useState(1);
  const [typePageSize, setTypePageSize] = useState(6);
  const [slotPage, setSlotPage] = useState(1);
  const [slotPageSize, setSlotPageSize] = useState(6);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(ticketTypes.length / typePageSize));
    if (typePage > maxPage) {
      setTypePage(maxPage);
    }
  }, [ticketTypes.length, typePageSize]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(timeSlots.length / slotPageSize));
    if (slotPage > maxPage) {
      setSlotPage(maxPage);
    }
  }, [timeSlots.length, slotPageSize]);

  const fetchPricingData = async () => {
    try {
      setIsLoadingPricing(true);
      const [typesRes, slotsRes] = await Promise.all([
        api.getAdminTicketTypes(),
        api.getAdminTicketSlots()
      ]);
      setTicketTypes(typesRes || []);
      setTimeSlots(slotsRes || []);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải cấu hình giá vé và khung giờ', 'error');
    } finally {
      setIsLoadingPricing(false);
    }
  };

  useEffect(() => {
    if (subTab === 'pricing') {
      fetchPricingData();
    }
  }, [subTab]);

  // Xử lý lưu loại vé (Có Validation chặt chẽ)
  const handleSaveTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { code?: string; name?: string; price?: string } = {};

    if (!editingType?.code?.trim()) {
      errors.code = 'Vui lòng nhập mã loại vé';
    } else if (!/^[a-z0-9_-]+$/.test(editingType.code.trim().toLowerCase())) {
      errors.code = 'Mã vé chỉ gồm chữ thường không dấu, số và gạch dưới (ví dụ: standard)';
    }

    if (!editingType?.name?.trim()) {
      errors.name = 'Vui lòng nhập tên loại vé';
    } else if (editingType.name.trim().length < 2) {
      errors.name = 'Tên loại vé phải từ 2 ký tự trở lên';
    }

    if (editingType?.price === undefined || editingType?.price === null || isNaN(Number(editingType.price))) {
      errors.price = 'Vui lòng nhập giá vé hợp lệ';
    } else if (Number(editingType.price) < 0) {
      errors.price = 'Giá vé không thể là số âm';
    }

    if (Object.keys(errors).length > 0) {
      setTypeErrors(errors);
      return;
    }

    try {
      if (editingType?.id) {
        await api.updateAdminTicketType(editingType.id, {
          name: editingType.name!.trim(),
          price: Number(editingType.price) || 0,
          description: editingType.description?.trim() || '',
          isActive: editingType.isActive !== false,
          displayOrder: Number(editingType.displayOrder) || 1
        });
        showToast('Cập nhật loại vé thành công', 'success');
      } else {
        await api.createAdminTicketType({
          code: editingType!.code!.trim().toLowerCase(),
          name: editingType!.name!.trim(),
          price: Number(editingType!.price) || 0,
          description: editingType?.description?.trim() || '',
          isActive: editingType?.isActive !== false,
          displayOrder: Number(editingType?.displayOrder) || (ticketTypes.length + 1)
        });
        showToast('Thêm loại vé mới thành công', 'success');
      }
      setIsTypeModalOpen(false);
      setEditingType(null);
      setTypeErrors({});
      fetchPricingData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu loại vé', 'error');
    }
  };

  const handleConfirmDeleteType = async () => {
    if (!deleteTypeTarget) return;
    try {
      await api.deleteAdminTicketType(deleteTypeTarget.id);
      showToast(`Đã xóa loại vé ${deleteTypeTarget.name}`, 'success');
      setDeleteTypeTarget(null);
      fetchPricingData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa loại vé', 'error');
    }
  };

  // Xử lý lưu khung giờ & giờ mở/đóng cửa (Có Validation)
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { slotName?: string; maxCapacity?: string; timeRange?: string } = {};

    const openTime = editingSlot?.openTime?.trim() || '08:00';
    const closeTime = editingSlot?.closeTime?.trim() || '17:00';
    let slotName = editingSlot?.slotName?.trim() || '';

    if (!slotName) {
      slotName = `Khung giờ mở cửa: ${openTime} - ${closeTime}`;
    }

    if (openTime && closeTime && openTime >= closeTime) {
      errors.timeRange = 'Giờ mở cửa phải trước giờ đóng cửa';
    }

    if (!editingSlot?.maxCapacity || isNaN(Number(editingSlot.maxCapacity)) || Number(editingSlot.maxCapacity) <= 0) {
      errors.maxCapacity = 'Sức chứa tối đa phải lớn hơn 0';
    }

    if (Object.keys(errors).length > 0) {
      setSlotErrors(errors);
      return;
    }

    try {
      if (editingSlot?.id) {
        await api.updateAdminTicketSlot(editingSlot.id, {
          slotName,
          openTime,
          closeTime,
          maxCapacity: Number(editingSlot.maxCapacity) || 300,
          isActive: editingSlot.isActive !== false,
          displayOrder: Number(editingSlot.displayOrder) || 1
        });
        showToast(`Cập nhật khung giờ "${slotName}" thành công`, 'success');
      } else {
        await api.createAdminTicketSlot({
          slotName,
          openTime,
          closeTime,
          maxCapacity: Number(editingSlot?.maxCapacity) || 300,
          isActive: editingSlot?.isActive !== false,
          displayOrder: Number(editingSlot?.displayOrder) || (timeSlots.length + 1)
        });
        showToast(`Thêm khung giờ mới "${slotName}" thành công`, 'success');
      }
      setIsSlotModalOpen(false);
      setEditingSlot(null);
      setSlotErrors({});
      fetchPricingData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu khung giờ', 'error');
    }
  };

  const handleConfirmDeleteSlot = async () => {
    if (!deleteSlotTarget) return;
    try {
      await api.deleteAdminTicketSlot(deleteSlotTarget.id);
      showToast(`Đã xóa khung giờ ${deleteSlotTarget.slotName}`, 'success');
      setDeleteSlotTarget(null);
      fetchPricingData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa khung giờ', 'error');
    }
  };

  // ==========================================
  // TAB 3: LỊCH SỬ ĐƠN HÀNG
  // ==========================================
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    expiredOrders: 0,
    totalRevenue: 0
  });
  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1
  });
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const fetchOrders = async (page: number = 1, limit: number = ordersPagination.limit) => {
    try {
      setIsLoadingOrders(true);
      const res = await api.getAdminOrders({
        search: orderSearch.trim(),
        status: orderStatusFilter,
        page,
        limit
      });
      if (res) {
        setOrders(res.data || []);
        if (res.pagination) {
          setOrdersPagination({
            page: res.pagination.page,
            limit: res.pagination.limit,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages
          });
        }
        if (res.stats) {
          setOrderStats(res.stats);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải lịch sử đặt vé', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (subTab !== 'orders') return;
    const timer = setTimeout(() => {
      fetchOrders(1, ordersPagination.limit);
    }, 250);
    return () => clearTimeout(timer);
  }, [orderSearch, orderStatusFilter, subTab]);

  // Format tiền tệ VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Format ngày
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

  // Badge trạng thái vé
  const renderStatusBadge = (status: string) => {
    let dotColor = '#64748B';
    let text = 'Chờ xử lý';
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

  // Badge trạng thái đơn hàng
  const renderOrderStatusBadge = (status: string) => {
    let dotColor = '#EAB308';
    let text = 'Chờ thanh toán';
    if (status === 'paid') {
      dotColor = '#22C55E';
      text = 'Đã thanh toán';
    } else if (status === 'expired') {
      dotColor = '#64748B';
      text = 'Hết hạn';
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

  const getTicketTypeLabel = (type: string) => {
    switch (type) {
      case 'student':
        return 'Học sinh - Sinh viên';
      case 'senior':
        return 'Người cao tuổi';
      case 'vip':
        return 'Tham quan VIP';
      default:
        return 'Tiêu chuẩn';
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (subTab === 'tickets') {
      fetchTickets(pagination.page, pagination.limit);
    } else if (subTab === 'pricing') {
      fetchPricingData();
    } else {
      fetchOrders(ordersPagination.page, ordersPagination.limit);
    }
  };

  return (
    <div className="admin-content admin-tickets-page">
      {/* 1. TIÊU ĐỀ TRANG QUẢN TRỊ */}
      <div className="tickets-header-row">
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--heading-color)',
              margin: 0
            }}
          >
            Quản lý vé tham quan
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            Soát vé tham quan, quản lý giá vé, thời gian mở cửa và theo dõi giao dịch đặt vé trực tuyến
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsScannerOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Mở camera hoặc súng quét mã vạch để kiểm tra và soát vé"
          >
            <QrCode size={14} />
            <span>Quét mã QR soát vé</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing || isLoadingPricing || isLoadingOrders}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. CHUYỂN ĐỔI TAB CON TỐI GIẢN */}
      <div className="tickets-tabs-nav">
        <button
          type="button"
          onClick={() => setSubTab('tickets')}
          className={`tickets-tab-btn ${subTab === 'tickets' ? 'active' : ''}`}
        >
          Soát vé & Danh sách vé
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pricing')}
          className={`tickets-tab-btn ${subTab === 'pricing' ? 'active' : ''}`}
        >
          Bảng giá & Khung giờ
        </button>

        <button
          type="button"
          onClick={() => setSubTab('orders')}
          className={`tickets-tab-btn ${subTab === 'orders' ? 'active' : ''}`}
        >
          Lịch sử đặt vé
        </button>
      </div>

      {/* ========================================================
          NỘI DUNG TAB 1: SOÁT VÉ & DANH SÁCH VÉ
          ======================================================== */}
      {subTab === 'tickets' && (
        <>
          {/* LƯỚI THỐNG KÊ KPI */}
          <div className="tickets-stats-grid">
            <div className="tickets-stat-item">
              <span className="tickets-stat-label">Tổng số vé</span>
              <span className="tickets-stat-value">{stats.totalTickets}</span>
            </div>

            <div className="tickets-stat-item">
              <span className="tickets-stat-label">Chưa sử dụng</span>
              <span className="tickets-stat-value">{stats.activeTickets}</span>
            </div>

            <div className="tickets-stat-item">
              <span className="tickets-stat-label">Đã vào cổng</span>
              <span className="tickets-stat-value">{stats.usedTickets}</span>
            </div>

            <div className="tickets-stat-item">
              <span className="tickets-stat-label">Doanh thu bán vé</span>
              <span className="tickets-stat-value">{formatVND(stats.totalRevenue)}</span>
            </div>
          </div>

          {/* BỘ LỌC TÌM KIẾM */}
          <div className="tickets-toolbar-card">
            <div className="tickets-search-form">
              <div className="tickets-search-wrapper">
                <Search size={14} className="tickets-search-icon" />
                <input
                  type="text"
                  className="tickets-search-input"
                  placeholder="Tìm theo mã vé, tên khách, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="tickets-search-clear"
                    onClick={() => setSearchTerm('')}
                    title="Xóa tìm kiếm"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="tickets-filter-group">
              <div className="tickets-select-box">
                <Filter size={13} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="tickets-filter-select"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="paid">Chưa sử dụng</option>
                  <option value="used">Đã vào cổng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="tickets-filter-select"
              >
                <option value="all">Tất cả loại vé</option>
                <option value="standard">Tiêu chuẩn</option>
                <option value="student">Học sinh - Sinh viên</option>
                <option value="senior">Người cao tuổi</option>
                <option value="vip">Tham quan VIP</option>
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="tickets-date-input"
                title="Lọc theo ngày tham quan"
              />

              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setDateFilter('');
                  }}
                  style={{ fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap' }}
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* BẢNG VÀ CARDS DANH SÁCH VÉ (RESPONSIVE CHUẨN) */}
          <div className="tickets-table-card">
            {/* Desktop Table View */}
            <div className="tickets-table-scroll">
              <table style={{ minWidth: 780, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <th style={{ padding: '10px 16px', width: '13%' }}>Mã vé</th>
                    <th style={{ padding: '10px 16px', width: '22%' }}>Khách tham quan</th>
                    <th style={{ padding: '10px 16px', width: '15%' }}>Loại vé</th>
                    <th style={{ padding: '10px 16px', width: '18%' }}>Lịch tham quan</th>
                    <th style={{ padding: '10px 16px', width: '14%', textAlign: 'right' }}>Giá vé</th>
                    <th style={{ padding: '10px 16px', width: '10%' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px', width: '8%', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>Đang tải danh sách vé...</span>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        Không tìm thấy vé tham quan nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr
                        key={t.id || t.ticketCode}
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                        className="admin-table-row"
                      >
                        <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                          {t.ticketCode}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.userName || 'Khách vãng lai'}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{t.userEmail || t.userPhone || '—'}</div>
                        </td>
                        <td style={{ padding: '11px 16px', color: 'var(--text-main)' }}>
                          {getTicketTypeLabel(t.ticketType)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ color: 'var(--text-main)', fontSize: 12.5 }}>{formatDate(t.visitDate)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.timeSlot || 'Cả ngày'}</div>
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                          {formatVND(t.totalAmount)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {renderStatusBadge(t.status)}
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDetailTicket(t)}
                              title="Xem chi tiết & Quét QR"
                              style={{ padding: '4px 8px' }}
                            >
                              <Eye size={13} />
                            </button>
                            {t.status === 'paid' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setCheckinTarget(t)}
                                title="Soát vé vào cổng"
                                style={{ padding: '4px 8px' }}
                              >
                                <CheckCircle size={13} />
                              </button>
                            )}
                            {t.status === 'paid' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setCancelTarget(t)}
                                title="Hủy vé"
                                style={{ padding: '4px 8px', color: '#EF4444' }}
                              >
                                <XCircle size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Hiện khi màn hình <= 768px) */}
            <div className="tickets-mobile-list" style={{ padding: '10px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <span>Đang tải danh sách vé...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  Không tìm thấy vé tham quan nào phù hợp.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id || t.ticketCode} className="tickets-mobile-card">
                    <div className="tickets-mobile-card-header">
                      <span className="tickets-mobile-code-badge">
                        #{t.ticketCode}
                      </span>
                      <div>{renderStatusBadge(t.status)}</div>
                    </div>

                    <div className="tickets-mobile-card-meta">
                      <div className="tickets-mobile-meta-row">
                        <span className="tickets-mobile-meta-label">Khách:</span>
                        <span className="tickets-mobile-meta-val" style={{ fontWeight: 600 }}>
                          {t.userName || 'Khách vãng lai'}
                        </span>
                      </div>
                      <div className="tickets-mobile-meta-row">
                        <span className="tickets-mobile-meta-label">Liên hệ:</span>
                        <span className="tickets-mobile-meta-val" style={{ fontSize: 11.5 }}>
                          {t.userEmail || t.userPhone || '—'}
                        </span>
                      </div>
                      <div className="tickets-mobile-meta-row">
                        <span className="tickets-mobile-meta-label">Loại vé:</span>
                        <span className="tickets-mobile-meta-val">
                          {getTicketTypeLabel(t.ticketType)}
                        </span>
                      </div>
                      <div className="tickets-mobile-meta-row">
                        <span className="tickets-mobile-meta-label">Lịch xem:</span>
                        <span className="tickets-mobile-meta-val">
                          {formatDate(t.visitDate)} ({t.timeSlot || 'Cả ngày'})
                        </span>
                      </div>
                      <div className="tickets-mobile-meta-row" style={{ paddingTop: 4, borderTop: '1px dashed var(--border-color)' }}>
                        <span className="tickets-mobile-meta-label">Giá vé:</span>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: 13 }}>
                          {formatVND(t.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="tickets-mobile-card-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm tickets-mobile-btn"
                        onClick={() => setDetailTicket(t)}
                      >
                        <Eye size={13} />
                        <span>Xem chi tiết</span>
                      </button>

                      {t.status === 'paid' && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm tickets-mobile-btn"
                          onClick={() => setCheckinTarget(t)}
                        >
                          <CheckCircle size={13} />
                          <span>Soát vé</span>
                        </button>
                      )}

                      {t.status === 'paid' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm tickets-mobile-btn"
                          onClick={() => setCancelTarget(t)}
                          style={{ color: '#EF4444' }}
                        >
                          <XCircle size={13} />
                          <span>Hủy</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Phân trang chuẩn hệ thống [6, 9, 12, 18, 24] */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => fetchTickets(p, pagination.limit)}
                onPageSizeChange={(newSize) => {
                  setPagination((prev) => ({ ...prev, limit: newSize }));
                  fetchTickets(1, newSize);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
                itemLabel="vé"
              />
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          NỘI DUNG TAB 2: CẤU HÌNH GIÁ VÉ & KHUNG GIỜ
          ======================================================== */}
      {subTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* PHẦN 1: BẢNG GIÁ CÁC LOẠI VÉ */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  Bảng giá các loại vé
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  Danh mục giá vé tham quan niêm yết tại bảo tàng
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingType({
                    code: '',
                    name: '',
                    price: 30000,
                    description: '',
                    isActive: true,
                    displayOrder: ticketTypes.length + 1
                  });
                  setTypeErrors({});
                  setIsTypeModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={13} />
                <span>Thêm loại vé</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 700, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '9px 14px', width: '14%' }}>Mã loại</th>
                    <th style={{ padding: '9px 14px', width: '24%' }}>Tên loại vé</th>
                    <th style={{ padding: '9px 14px', width: '16%', textAlign: 'right' }}>Giá niêm yết</th>
                    <th style={{ padding: '9px 14px', width: '26%' }}>Quy định áp dụng</th>
                    <th style={{ padding: '9px 14px', width: '10%' }}>Trạng thái</th>
                    <th style={{ padding: '9px 14px', width: '10%', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPricing ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Đang tải danh mục vé...
                      </td>
                    </tr>
                  ) : ticketTypes.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Chưa có loại vé nào.
                      </td>
                    </tr>
                  ) : (
                    ticketTypes
                      .slice((typePage - 1) * typePageSize, typePage * typePageSize)
                      .map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--text-main)', fontSize: 12.5 }}>
                          {t.code}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                          {formatVND(t.price)}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 12 }}>
                          {t.description || '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: t.isActive ? '#22C55E' : '#64748B',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ color: 'var(--text-main)' }}>
                              {t.isActive ? 'Mở bán' : 'Tạm dừng'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingType(t);
                                setTypeErrors({});
                                setIsTypeModalOpen(true);
                              }}
                              title="Chỉnh sửa"
                              style={{ padding: '4px 8px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDeleteTypeTarget(t)}
                              title="Xóa loại vé"
                              style={{ padding: '4px 8px', color: '#EF4444' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang loại vé chuẩn dashboard [6, 9, 12, 18, 24] */}
            {ticketTypes.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 12 }}>
                <Pagination
                  currentPage={typePage}
                  totalItems={ticketTypes.length}
                  pageSize={typePageSize}
                  onPageChange={setTypePage}
                  onPageSizeChange={(newSize) => {
                    setTypePageSize(newSize);
                    setTypePage(1);
                  }}
                  pageSizeOptions={[6, 9, 12, 18, 24]}
                  itemLabel="loại vé"
                />
              </div>
            )}
          </div>

          {/* PHẦN 2: CẤU HÌNH THỜI GIAN MỞ CỬA & KHUNG GIỜ THAM QUAN */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: 'var(--heading-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} />
                  <span>Thời gian mở cửa & Khung giờ đón khách</span>
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                  Quản trị viên thiết lập giờ mở cửa, đóng cửa và các khung giờ tham quan (Khách có thể đặt vé tham quan mọi giờ trong khoảng mở cửa)
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingSlot({
                    slotName: 'Mở cửa cả ngày (08:00 - 17:00)',
                    openTime: '08:00',
                    closeTime: '17:00',
                    maxCapacity: 500,
                    isActive: true,
                    displayOrder: timeSlots.length + 1
                  });
                  setSlotErrors({});
                  setIsSlotModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={13} />
                <span>Thêm khung giờ</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 650, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '9px 14px', width: '38%' }}>Tên khung giờ đón tiếp</th>
                    <th style={{ padding: '9px 14px', width: '22%' }}>Giờ mở – Đóng cửa</th>
                    <th style={{ padding: '9px 14px', width: '16%', textAlign: 'right' }}>Sức chứa tối đa</th>
                    <th style={{ padding: '9px 14px', width: '12%' }}>Trạng thái</th>
                    <th style={{ padding: '9px 14px', width: '12%', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPricing ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Đang tải khung giờ...
                      </td>
                    </tr>
                  ) : timeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Chưa có khung giờ nào được thiết lập.
                      </td>
                    </tr>
                  ) : (
                    timeSlots
                      .slice((slotPage - 1) * slotPageSize, slotPage * slotPageSize)
                      .map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                          <div>{s.slotName}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>
                            Khách mua vé được vào cửa mọi giờ trong khoảng này
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: '#38BDF8',
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            <Clock size={12} />
                            {s.openTime || '08:00'} – {s.closeTime || '17:00'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                          {s.maxCapacity || 300} người
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: s.isActive ? '#22C55E' : '#64748B',
                                display: 'inline-block'
                              }}
                            />
                            <span style={{ color: 'var(--text-main)' }}>
                              {s.isActive ? 'Đang mở cửa' : 'Tạm dừng'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingSlot(s);
                                setSlotErrors({});
                                setIsSlotModalOpen(true);
                              }}
                              title="Chỉnh sửa giờ mở / đóng cửa"
                              style={{ padding: '4px 8px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDeleteSlotTarget(s)}
                              title="Xóa khung giờ"
                              style={{ padding: '4px 8px', color: '#EF4444' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang khung giờ chuẩn dashboard [6, 9, 12, 18, 24] */}
            {timeSlots.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 12 }}>
                <Pagination
                  currentPage={slotPage}
                  totalItems={timeSlots.length}
                  pageSize={slotPageSize}
                  onPageChange={setSlotPage}
                  onPageSizeChange={(newSize) => {
                    setSlotPageSize(newSize);
                    setSlotPage(1);
                  }}
                  pageSizeOptions={[6, 9, 12, 18, 24]}
                  itemLabel="khung giờ"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          NỘI DUNG TAB 3: LỊCH SỬ ĐẶT VÉ
          ======================================================== */}
      {subTab === 'orders' && (
        <>
          {/* KPI LỊCH SỬ ĐẶT VÉ */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              marginBottom: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
            }}
          >
            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tổng lượt đặt vé
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.totalOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã thanh toán
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.paidOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chờ thanh toán
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.pendingOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã hết hạn / Hủy
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.expiredOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tổng tiền vé thu được
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {formatVND(orderStats.totalRevenue)}
              </div>
            </div>
          </div>

          {/* BỘ LỌC GIAO DỊCH */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Tìm theo mã giao dịch, email, người đặt vé, SĐT..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  background: '#1c1917',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12.5,
                  colorScheme: 'dark',
                  minWidth: 140
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="expired">Hết hạn</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              {(orderSearch || orderStatusFilter !== 'all') && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setOrderSearch('');
                    setOrderStatusFilter('all');
                  }}
                  style={{ fontSize: 12 }}
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* BẢNG GIAO DỊCH ĐẶT VÉ */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 16
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: 780, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px', width: '14%' }}>Mã giao dịch</th>
                    <th style={{ padding: '10px 16px', width: '22%' }}>Người đặt vé</th>
                    <th style={{ padding: '10px 16px', width: '26%' }}>Loại vé & Số lượng</th>
                    <th style={{ padding: '10px 16px', width: '14%', textAlign: 'right' }}>Tiền vé</th>
                    <th style={{ padding: '10px 16px', width: '12%' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px', width: '12%' }}>Thời gian đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingOrders ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>Đang tải giao dịch đặt vé...</span>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        Không có giao dịch đặt vé nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                          #{o.orderCode}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.customerName}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {o.items && o.items.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {o.items.map((it, idx) => (
                                <div key={idx} style={{ fontSize: 12, color: 'var(--text-main)' }}>
                                  • {it.ticketTitle || it.ticketTypeCode}: <b>{it.quantity}</b> vé ({formatVND(it.totalPrice)})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                          {formatVND(o.totalAmount)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {renderOrderStatusBadge(o.status)}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 12 }}>
                          <div style={{ color: 'var(--text-main)' }}>{formatDateTime(o.createdAt)}</div>
                          {o.paidAt && (
                            <div style={{ color: '#22C55E', fontSize: 11 }}>
                              Đã thanh toán: {formatDateTime(o.paidAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang chuẩn hệ thống [6, 9, 12, 18, 24] */}
            <div style={{ borderTop: '1px solid var(--border-color)' }}>
              <Pagination
                currentPage={ordersPagination.page}
                totalItems={ordersPagination.total}
                pageSize={ordersPagination.limit}
                onPageChange={(p) => fetchOrders(p, ordersPagination.limit)}
                onPageSizeChange={(newSize) => {
                  setOrdersPagination((prev) => ({ ...prev, limit: newSize }));
                  fetchOrders(1, newSize);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
                itemLabel="giao dịch"
              />
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODALS
          ======================================================== */}

      {/* MODAL CHI TIẾT VÉ (CHUẨN ADMIN HERITAGE & RESPONSIVE) */}
      {detailTicket && (
        <div
          className="admin-ticket-dialog-overlay"
          onClick={() => setDetailTicket(null)}
        >
          <div
            className="admin-ticket-dialog-card"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-ticket-dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="admin-ticket-dialog-icon">
                  <QrCode size={20} color="#D4AF37" />
                </div>
                <div>
                  <h3 className="admin-ticket-dialog-title">
                    Chi tiết vé tham quan
                  </h3>
                  <p className="admin-ticket-dialog-subtitle" style={{ fontFamily: 'monospace' }}>
                    #{detailTicket.ticketCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-ticket-dialog-close"
                onClick={() => setDetailTicket(null)}
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mã QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px', background: '#12100e', borderRadius: 12, border: '1px solid rgba(212, 168, 106, 0.2)', marginBottom: 16 }}>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: 10,
                  borderRadius: 10,
                  display: 'inline-flex',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                }}
              >
                <img
                  src={
                    detailTicket.qrCodeData && detailTicket.qrCodeData.startsWith('data:image/')
                      ? detailTicket.qrCodeData
                      : detailTicket.qrCodeData && (detailTicket.qrCodeData.startsWith('http://') || detailTicket.qrCodeData.startsWith('https://'))
                      ? detailTicket.qrCodeData
                      : `${API_BASE}/tickets/qr/${encodeURIComponent(detailTicket.ticketCode)}`
                  }
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('qrserver.com')) {
                      target.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(detailTicket.ticketCode)}`;
                    }
                  }}
                  alt="QR Code"
                  style={{ width: 140, height: 140, display: 'block', objectFit: 'contain' }}
                />
              </div>
              <div style={{ marginTop: 10, fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#F8FAFC', letterSpacing: '0.5px' }}>
                {detailTicket.ticketCode}
              </div>
              <div style={{ marginTop: 6 }}>
                {renderStatusBadge(detailTicket.status)}
              </div>
            </div>

            {/* Bảng chi tiết */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Khách tham quan:</span>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{detailTicket.userName || 'Khách vãng lai'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Email:</span>
                <span style={{ color: '#E2E8F0' }}>{detailTicket.userEmail || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Số điện thoại:</span>
                <span style={{ color: '#E2E8F0' }}>{detailTicket.userPhone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Loại vé:</span>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{getTicketTypeLabel(detailTicket.ticketType)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Ngày tham quan:</span>
                <span style={{ color: '#E2E8F0' }}>{formatDate(detailTicket.visitDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Khung giờ:</span>
                <span style={{ color: '#E2E8F0' }}>{detailTicket.timeSlot || 'Cả ngày'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 2 }}>
                <span style={{ color: '#94A3B8' }}>Tổng tiền:</span>
                <span style={{ fontWeight: 700, color: '#D4AF37', fontSize: '0.95rem' }}>
                  {formatVND(detailTicket.totalAmount)}
                </span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="admin-ticket-dialog-footer">
              <button
                type="button"
                className="admin-ticket-btn-cancel"
                onClick={() => setDetailTicket(null)}
              >
                Đóng
              </button>
              {detailTicket.status === 'paid' && (
                <button
                  type="button"
                  className="admin-ticket-btn-submit"
                  onClick={() => {
                    setCheckinTarget(detailTicket);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckCircle size={15} />
                  <span>Soát vé vào cổng</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA LOẠI VÉ (CHUẨN ADMIN HERITAGE & RESPONSIVE TOÀN DIỆN) */}
      {isTypeModalOpen && editingType && (
        <div
          className="admin-ticket-dialog-overlay"
          onClick={() => setIsTypeModalOpen(false)}
        >
          <div
            className="admin-ticket-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Dialog */}
            <div className="admin-ticket-dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="admin-ticket-dialog-icon">
                  <Tag size={20} color="#D4AF37" />
                </div>
                <div>
                  <h3 className="admin-ticket-dialog-title">
                    {editingType.id ? 'Chỉnh sửa loại vé tham quan' : 'Thêm loại vé tham quan mới'}
                  </h3>
                  <p className="admin-ticket-dialog-subtitle">
                    {editingType.id ? 'Cập nhật tên, mức giá và điều kiện bán của loại vé' : 'Tạo mới loại vé phục vụ bán vé và quản lý lượt khách'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-ticket-dialog-close"
                onClick={() => setIsTypeModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTicketType} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Hàng 1: Mã loại vé & Thứ tự hiển thị (2 cột trên desktop) */}
                <div className="admin-ticket-grid-2col">
                  <div>
                    <label className="admin-ticket-label">
                      <span>Mã loại vé <strong style={{ color: '#EF4444' }}>*</strong></span>
                      {Boolean(editingType.id) && (
                        <span className="admin-ticket-pill-muted">Mã hệ thống</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={editingType.code || ''}
                      disabled={Boolean(editingType.id)}
                      placeholder="vd: standard, student, vip..."
                      onChange={(e) => {
                        setEditingType({ ...editingType, code: e.target.value.toLowerCase().trim() });
                        if (typeErrors.code) setTypeErrors({ ...typeErrors, code: undefined });
                      }}
                      className={`admin-ticket-input ${typeErrors.code ? 'is-error' : ''}`}
                      style={{
                        opacity: editingType.id ? 0.7 : 1,
                        cursor: editingType.id ? 'not-allowed' : 'text',
                        fontFamily: 'monospace'
                      }}
                    />
                    {typeErrors.code ? (
                      <span className="admin-ticket-error-text">
                        {typeErrors.code}
                      </span>
                    ) : (
                      <span className="admin-ticket-hint-text">
                        Chữ thường không dấu, dùng để định danh vé (vd: standard)
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="admin-ticket-label">
                      <span>Thứ tự hiển thị</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingType.displayOrder || 1}
                      onChange={(e) => setEditingType({ ...editingType, displayOrder: Number(e.target.value) })}
                      className="admin-ticket-input"
                    />
                    <span className="admin-ticket-hint-text">
                      Ưu tiên sắp xếp trên bảng giá vé
                    </span>
                  </div>
                </div>

                {/* Hàng 2: Tên loại vé */}
                <div>
                  <label className="admin-ticket-label">
                    <span>Tên loại vé <strong style={{ color: '#EF4444' }}>*</strong></span>
                  </label>
                  <input
                    type="text"
                    value={editingType.name || ''}
                    placeholder="Ví dụ: Vé Người Lớn (Tiêu Chuẩn)"
                    onChange={(e) => {
                      setEditingType({ ...editingType, name: e.target.value });
                      if (typeErrors.name) setTypeErrors({ ...typeErrors, name: undefined });
                    }}
                    className={`admin-ticket-input ${typeErrors.name ? 'is-error' : ''}`}
                  />
                  {typeErrors.name ? (
                    <span className="admin-ticket-error-text">
                      {typeErrors.name}
                    </span>
                  ) : (
                    <span className="admin-ticket-hint-text">
                      Tên loại vé hiển thị trực tiếp cho khách mua vé và trên cuống vé
                    </span>
                  )}
                </div>

                {/* Hàng 3: Giá vé (có preview tiền tệ sống động) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="admin-ticket-label" style={{ marginBottom: 0 }}>
                      <span>Giá vé (VNĐ) <strong style={{ color: '#EF4444' }}>*</strong></span>
                    </label>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#D4AF37', background: 'rgba(212, 175, 55, 0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                      = {(Number(editingType.price) || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={editingType.price !== undefined ? editingType.price : 30000}
                    onChange={(e) => {
                      setEditingType({ ...editingType, price: Number(e.target.value) });
                      if (typeErrors.price) setTypeErrors({ ...typeErrors, price: undefined });
                    }}
                    className={`admin-ticket-input ${typeErrors.price ? 'is-error' : ''}`}
                  />
                  {typeErrors.price && (
                    <span className="admin-ticket-error-text">
                      {typeErrors.price}
                    </span>
                  )}
                </div>

                {/* Hàng 4: Quy định đối tượng áp dụng */}
                <div>
                  <label className="admin-ticket-label">
                    <span>Quy định đối tượng áp dụng</span>
                  </label>
                  <input
                    type="text"
                    value={editingType.description || ''}
                    placeholder="Khách tham quan công dân Việt Nam và quốc tế từ 16 đến 59 tuổi"
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                    className="admin-ticket-input"
                  />
                  <span className="admin-ticket-hint-text">
                    Ghi chú hiển thị trên giao diện đặt vé để khách chọn đúng đối tượng
                  </span>
                </div>

                {/* Hàng 5: Toggle Switch Đang mở bán */}
                <div
                  className="admin-ticket-switch-card"
                  onClick={() => setEditingType({ ...editingType, isActive: editingType.isActive === false })}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                      Trạng thái mở bán trực tuyến
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                      {editingType.isActive !== false ? 'Cho phép khách tham quan đặt mua loại vé này' : 'Tạm dừng mở bán (không xuất hiện trên trang đặt vé)'}
                    </div>
                  </div>
                  <div
                    className={`admin-ticket-toggle ${editingType.isActive !== false ? 'active' : ''}`}
                  >
                    <span className="admin-ticket-toggle-knob" />
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="admin-ticket-dialog-footer">
                <button
                  type="button"
                  className="admin-ticket-btn-cancel"
                  onClick={() => setIsTypeModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-ticket-btn-submit">
                  {editingType.id ? 'Lưu loại vé' : 'Tạo loại vé mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA KHUNG GIỜ (CHUẨN ADMIN HERITAGE & RESPONSIVE) */}
      {isSlotModalOpen && editingSlot && (
        <div
          className="admin-ticket-dialog-overlay"
          onClick={() => setIsSlotModalOpen(false)}
        >
          <div
            className="admin-ticket-dialog-card"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-ticket-dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="admin-ticket-dialog-icon">
                  <Clock size={20} color="#D4AF37" />
                </div>
                <div>
                  <h3 className="admin-ticket-dialog-title">
                    {editingSlot.id ? 'Chỉnh sửa Giờ Mở Cửa & Khung Giờ' : 'Thêm Giờ Mở Cửa & Khung Giờ Mới'}
                  </h3>
                  <p className="admin-ticket-dialog-subtitle">
                    Thiết lập khoảng thời gian mở cửa, giới hạn số lượng và lịch đón khách
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-ticket-dialog-close"
                onClick={() => setIsSlotModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Thiết lập Giờ mở cửa & Giờ đóng cửa */}
                <div>
                  <label className="admin-ticket-label">
                    <span>Khoảng thời gian mở cửa đón khách <strong style={{ color: '#EF4444' }}>*</strong></span>
                  </label>
                  <div className="admin-ticket-grid-2col">
                    <div>
                      <span className="admin-ticket-hint-text" style={{ marginBottom: 4 }}>
                        Giờ mở cửa (Bắt đầu)
                      </span>
                      <input
                        type="time"
                        value={editingSlot.openTime || '08:00'}
                        onChange={(e) => {
                          const openTime = e.target.value;
                          setEditingSlot({ ...editingSlot, openTime });
                          if (slotErrors.timeRange) setSlotErrors({ ...slotErrors, timeRange: undefined });
                        }}
                        className={`admin-ticket-input ${slotErrors.timeRange ? 'is-error' : ''}`}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <div>
                      <span className="admin-ticket-hint-text" style={{ marginBottom: 4 }}>
                        Giờ đóng cửa (Kết thúc)
                      </span>
                      <input
                        type="time"
                        value={editingSlot.closeTime || '17:00'}
                        onChange={(e) => {
                          const closeTime = e.target.value;
                          setEditingSlot({ ...editingSlot, closeTime });
                          if (slotErrors.timeRange) setSlotErrors({ ...slotErrors, timeRange: undefined });
                        }}
                        className={`admin-ticket-input ${slotErrors.timeRange ? 'is-error' : ''}`}
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                  </div>
                  {slotErrors.timeRange && (
                    <span className="admin-ticket-error-text">
                      {slotErrors.timeRange}
                    </span>
                  )}
                  {/* Preset Buttons */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="admin-ticket-preset-btn"
                      onClick={() => {
                        setEditingSlot({
                          ...editingSlot,
                          openTime: '08:00',
                          closeTime: '17:00',
                          slotName: 'Mở cửa cả ngày (08:00 - 17:00)'
                        });
                        setSlotErrors({});
                      }}
                    >
                      Cả ngày (08:00 – 17:00)
                    </button>
                    <button
                      type="button"
                      className="admin-ticket-preset-btn"
                      onClick={() => {
                        setEditingSlot({
                          ...editingSlot,
                          openTime: '08:00',
                          closeTime: '11:30',
                          slotName: 'Ca sáng (08:00 – 11:30)'
                        });
                        setSlotErrors({});
                      }}
                    >
                      Ca sáng (08:00 – 11:30)
                    </button>
                    <button
                      type="button"
                      className="admin-ticket-preset-btn"
                      onClick={() => {
                        setEditingSlot({
                          ...editingSlot,
                          openTime: '13:30',
                          closeTime: '17:00',
                          slotName: 'Ca chiều (13:30 – 17:00)'
                        });
                        setSlotErrors({});
                      }}
                    >
                      Ca chiều (13:30 – 17:00)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="admin-ticket-label">
                    <span>Tên / Mô tả khung giờ đón tiếp</span>
                  </label>
                  <input
                    type="text"
                    value={editingSlot.slotName || ''}
                    placeholder={`Ví dụ: Mở cửa đón khách cả ngày (${editingSlot.openTime || '08:00'} - ${editingSlot.closeTime || '17:00'})`}
                    onChange={(e) => {
                      setEditingSlot({ ...editingSlot, slotName: e.target.value });
                      if (slotErrors.slotName) setSlotErrors({ ...slotErrors, slotName: undefined });
                    }}
                    className={`admin-ticket-input ${slotErrors.slotName ? 'is-error' : ''}`}
                  />
                  <span className="admin-ticket-hint-text">
                    Để trống sẽ tự động đặt tên theo giờ mở - đóng cửa ({editingSlot.openTime || '08:00'} - {editingSlot.closeTime || '17:00'}).
                  </span>
                </div>

                <div>
                  <label className="admin-ticket-label">
                    <span>Sức chứa tối đa trong ngày/ca (người) <strong style={{ color: '#EF4444' }}>*</strong></span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingSlot.maxCapacity || 500}
                    onChange={(e) => {
                      setEditingSlot({ ...editingSlot, maxCapacity: Number(e.target.value) });
                      if (slotErrors.maxCapacity) setSlotErrors({ ...slotErrors, maxCapacity: undefined });
                    }}
                    className={`admin-ticket-input ${slotErrors.maxCapacity ? 'is-error' : ''}`}
                  />
                  {slotErrors.maxCapacity && (
                    <span className="admin-ticket-error-text">
                      {slotErrors.maxCapacity}
                    </span>
                  )}
                </div>

                {/* Switch Trạng thái mở cửa đón khách */}
                <div
                  className="admin-ticket-switch-card"
                  onClick={() => setEditingSlot({ ...editingSlot, isActive: editingSlot.isActive === false })}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                      Đang mở cửa đón khách
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                      {editingSlot.isActive !== false ? 'Bật để khách có thể chọn khung giờ này khi mua vé' : 'Tạm dừng nhận khách vào khung giờ này'}
                    </div>
                  </div>
                  <div
                    className={`admin-ticket-toggle ${editingSlot.isActive !== false ? 'active' : ''}`}
                  >
                    <span className="admin-ticket-toggle-knob" />
                  </div>
                </div>
              </div>

              <div className="admin-ticket-dialog-footer">
                <button
                  type="button"
                  className="admin-ticket-btn-cancel"
                  onClick={() => setIsSlotModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-ticket-btn-submit">
                  {editingSlot.id ? 'Lưu thiết lập' : 'Tạo khung giờ mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALS XÁC NHẬN */}
      <ConfirmModal
        isOpen={Boolean(checkinTarget)}
        title="Xác nhận soát vé vào cổng"
        message={`Bạn có chắc chắn muốn xác nhận soát vé ${checkinTarget?.ticketCode} cho khách "${checkinTarget?.userName}" vào cổng tham quan?`}
        confirmText={isProcessingAction ? 'Đang xử lý...' : 'Xác nhận soát vé'}
        cancelText="Hủy bỏ"
        type="info"
        onConfirm={handleConfirmCheckin}
        onCancel={() => !isProcessingAction && setCheckinTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(cancelTarget)}
        title="Xác nhận hủy vé tham quan"
        message={`Bạn có chắc chắn muốn hủy vé ${cancelTarget?.ticketCode} của khách "${cancelTarget?.userName}"? Sau khi hủy, vé sẽ không còn hiệu lực vào cổng.`}
        confirmText={isProcessingAction ? 'Đang hủy vé...' : 'Đồng ý hủy'}
        cancelText="Quay lại"
        type="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => !isProcessingAction && setCancelTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTypeTarget)}
        title="Xác nhận xóa loại vé"
        message={`Bạn có chắc muốn xóa loại vé "${deleteTypeTarget?.name}" (${deleteTypeTarget?.code})?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDeleteType}
        onCancel={() => setDeleteTypeTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteSlotTarget)}
        title="Xác nhận xóa khung giờ"
        message={`Bạn có chắc muốn xóa khung giờ "${deleteSlotTarget?.slotName}"?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDeleteSlot}
        onCancel={() => setDeleteSlotTarget(null)}
      />

      {/* MODAL QUÉT MÃ QR SOÁT VÉ */}
      <AdminTicketScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onTicketCheckedIn={() => {
          fetchTickets(pagination.page, pagination.limit);
        }}
      />

      <style>{`
        /* Dialog Overlay & Card */
        .admin-ticket-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(4, 7, 13, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .admin-ticket-dialog-card {
          margin: auto;
          background: #181512;
          border: 1px solid rgba(212, 168, 106, 0.25);
          border-radius: 14px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 168, 106, 0.15);
          padding: 24px 28px;
          width: 100%;
          max-width: 520px;
          box-sizing: border-box;
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          animation: adminModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes adminModalPop {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .admin-ticket-dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(212, 168, 106, 0.15);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .admin-ticket-dialog-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(212, 168, 106, 0.12);
          border: 1px solid rgba(212, 168, 106, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-ticket-dialog-title {
          font-size: 1.08rem;
          font-weight: 700;
          margin: 0;
          color: #F8FAFC;
          letter-spacing: -0.2px;
        }

        .admin-ticket-dialog-subtitle {
          font-size: 0.78rem;
          color: #94A3B8;
          margin: 3px 0 0 0;
          line-height: 1.4;
        }

        .admin-ticket-dialog-close {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94A3B8;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .admin-ticket-dialog-close:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #FFF;
          transform: scale(1.05);
        }

        .admin-ticket-grid-2col {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 14px;
        }

        .admin-ticket-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 600;
          color: #CBD5E1;
          margin-bottom: 6px;
        }

        .admin-ticket-pill-muted {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94A3B8;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .admin-ticket-input {
          width: 100%;
          padding: 10px 14px;
          background: #0D111A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #F8FAFC;
          font-size: 0.88rem;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .admin-ticket-input:focus {
          border-color: #D4AF37;
          outline: none;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
          background: #101522;
        }

        .admin-ticket-input.is-error {
          border-color: #EF4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }

        .admin-ticket-error-text {
          font-size: 0.75rem;
          color: #F87171;
          display: block;
          margin-top: 4px;
          font-weight: 500;
        }

        .admin-ticket-hint-text {
          font-size: 0.74rem;
          color: #64748B;
          display: block;
          margin-top: 4px;
          line-height: 1.35;
        }

        .admin-ticket-preset-btn {
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #CBD5E1;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-ticket-preset-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.35);
          color: #D4AF37;
        }

        .admin-ticket-switch-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .admin-ticket-switch-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .admin-ticket-toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: #334155;
          position: relative;
          transition: background-color 0.25s ease;
          flex-shrink: 0;
        }

        .admin-ticket-toggle.active {
          background: #D4AF37;
        }

        .admin-ticket-toggle-knob {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFFFFF;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .admin-ticket-toggle.active .admin-ticket-toggle-knob {
          transform: translateX(20px);
        }

        .admin-ticket-dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 16px;
        }

        .admin-ticket-btn-cancel {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #CBD5E1;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 0.86rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-ticket-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
        }

        .admin-ticket-btn-submit {
          background: linear-gradient(135deg, #D4AF37 0%, #C59F2D 100%);
          border: none;
          color: #0A0D14;
          border-radius: 8px;
          padding: 9px 22px;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
          transition: all 0.2s ease;
        }

        .admin-ticket-btn-submit:hover {
          background: linear-gradient(135deg, #E0BE4D 0%, #D4AF37 100%);
          box-shadow: 0 6px 18px rgba(212, 175, 55, 0.4);
          transform: translateY(-1px);
        }

        @media (max-width: 540px) {
          .admin-ticket-dialog-card {
            padding: 18px 16px;
            border-radius: 14px;
            max-height: calc(100dvh - 20px);
          }
          .admin-ticket-grid-2col {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .admin-ticket-dialog-footer {
            flex-direction: column-reverse;
            gap: 8px;
          }
          .admin-ticket-btn-cancel,
          .admin-ticket-btn-submit {
            width: 100%;
            text-align: center;
            padding: 11px 16px;
          }
        }
      `}</style>
    </div>
  );
};
