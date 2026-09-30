import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  QrCode,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  X,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Layers,
  ShoppingBag,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import {
  AdminTicketItem,
  AdminTicketStats,
  TicketTypeItem,
  TicketTimeSlotItem,
  AdminOrderItem,
  AdminOrdersResponse
} from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';

export const AdminTicketsPage: React.FC = () => {
  const { showToast } = useToast();

  // Tab con hiện tại: 'tickets' (Soát vé & danh sách vé) | 'pricing' (Cấu hình giá vé & khung giờ) | 'orders' (Lịch sử đơn hàng PayOS)
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
    limit: 10,
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

  // Thuật toán lọc nhanh tức thời (Debounced 250ms)
  useEffect(() => {
    if (subTab !== 'tickets') return;
    const timer = setTimeout(() => {
      fetchTickets(1, pagination.limit);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, dateFilter, subTab]);

  // Xử lý soát vé trực tiếp
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

  // Xử lý hủy vé
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
  // TAB 2: CẤU HÌNH GIÁ VÉ & KHUNG GIỜ (CRUD)
  // ==========================================
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TicketTimeSlotItem[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // Modal Sửa / Thêm loại vé
  const [editingType, setEditingType] = useState<Partial<TicketTypeItem> | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [deleteTypeTarget, setDeleteTypeTarget] = useState<TicketTypeItem | null>(null);

  // Modal Sửa / Thêm khung giờ
  const [editingSlot, setEditingSlot] = useState<Partial<TicketTimeSlotItem> | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<TicketTimeSlotItem | null>(null);

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
      showToast(err.message || 'Không thể tải cấu hình giá vé & khung giờ', 'error');
    } finally {
      setIsLoadingPricing(false);
    }
  };

  useEffect(() => {
    if (subTab === 'pricing') {
      fetchPricingData();
    }
  }, [subTab]);

  const handleSaveTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType || !editingType.code || !editingType.name) {
      showToast('Vui lòng nhập mã và tên loại vé', 'warning');
      return;
    }
    try {
      if (editingType.id) {
        await api.updateAdminTicketType(editingType.id, {
          name: editingType.name,
          price: Number(editingType.price) || 0,
          description: editingType.description || '',
          isActive: editingType.isActive !== false,
          displayOrder: Number(editingType.displayOrder) || 0
        });
        showToast('Cập nhật loại vé thành công!', 'success');
      } else {
        await api.createAdminTicketType({
          code: editingType.code.trim().toLowerCase(),
          name: editingType.name.trim(),
          price: Number(editingType.price) || 0,
          description: editingType.description || '',
          isActive: editingType.isActive !== false,
          displayOrder: Number(editingType.displayOrder) || 0
        });
        showToast('Thêm loại vé mới thành công!', 'success');
      }
      setIsTypeModalOpen(false);
      setEditingType(null);
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

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !editingSlot.slotName || !editingSlot.startTime || !editingSlot.endTime) {
      showToast('Vui lòng điền đủ thông tin khung giờ', 'warning');
      return;
    }
    try {
      if (editingSlot.id) {
        await api.updateAdminTicketSlot(editingSlot.id, {
          slotName: editingSlot.slotName,
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
          maxCapacity: Number(editingSlot.maxCapacity) || 500,
          isActive: editingSlot.isActive !== false
        });
        showToast('Cập nhật khung giờ thành công!', 'success');
      } else {
        await api.createAdminTicketSlot({
          slotName: editingSlot.slotName,
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
          maxCapacity: Number(editingSlot.maxCapacity) || 500,
          isActive: editingSlot.isActive !== false
        });
        showToast('Thêm khung giờ mới thành công!', 'success');
      }
      setIsSlotModalOpen(false);
      setEditingSlot(null);
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
  // TAB 3: LỊCH SỬ ĐƠN HÀNG (PAYOS)
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
    limit: 10,
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
      showToast(err.message || 'Không thể tải lịch sử đơn hàng PayOS', 'error');
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

  // Định dạng số tiền VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Định dạng ngày
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

  // Badge trạng thái đơn hàng PayOS
  const renderOrderStatusBadge = (status: string) => {
    let dotColor = '#EAB308';
    let text = 'Chờ thanh toán';
    if (status === 'paid') {
      dotColor = '#22C55E';
      text = 'Đã thanh toán';
    } else if (status === 'expired') {
      dotColor = '#94A3B8';
      text = 'Hết hạn (Đã dọn)';
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
    <div className="admin-content" style={{ padding: '24px 28px' }}>
      {/* 1. TIÊU ĐỀ TRANG QUẢN TRỊ & NÚT LÀM MỚI */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--heading-color)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Ticket size={20} style={{ color: 'var(--primary)' }} />
            <span>Quản trị Vé & Đơn hàng PayOS</span>
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            Quản lý soát vé vào cổng, đồng bộ bảng giá vé, khung giờ và theo dõi lịch sử thanh toán PayOS
          </p>
        </div>

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

      {/* 2. CHUYỂN ĐỔI TAB CON TỐI GIẢN (SUB-TABS) */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 18,
          paddingBottom: 0
        }}
      >
        <button
          type="button"
          onClick={() => setSubTab('tickets')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: subTab === 'tickets' ? 600 : 500,
            color: subTab === 'tickets' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: subTab === 'tickets' ? '2px solid var(--primary)' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: -1,
            transition: 'all 0.15s ease'
          }}
        >
          <QrCode size={14} />
          <span>Soát vé & Danh sách vé</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('pricing')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: subTab === 'pricing' ? 600 : 500,
            color: subTab === 'pricing' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: subTab === 'pricing' ? '2px solid var(--primary)' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: -1,
            transition: 'all 0.15s ease'
          }}
        >
          <DollarSign size={14} />
          <span>Cấu hình Giá vé & Khung giờ</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('orders')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: subTab === 'orders' ? 600 : 500,
            color: subTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
            borderBottom: subTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: -1,
            transition: 'all 0.15s ease'
          }}
        >
          <ShoppingBag size={14} />
          <span>Lịch sử Đơn hàng (PayOS)</span>
        </button>
      </div>

      {/* ========================================================
          NỘI DUNG TAB 1: SOÁT VÉ & DANH SÁCH VÉ
          ======================================================== */}
      {subTab === 'tickets' && (
        <>
          {/* THANH CHỈ SỐ KPI TỐI GIẢN */}
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
                Tổng số vé
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {stats.totalTickets}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chưa sử dụng
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {stats.activeTickets}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã vào cổng
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {stats.usedTickets}
              </div>
            </div>

            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Doanh thu bán vé
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {formatVND(stats.totalRevenue)}
              </div>
            </div>
          </div>

          {/* BỘ LỌC TỐC ĐỘ CAO */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
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
                  className="form-control form-control-sm"
                  placeholder="Tìm theo mã vé, tên khách, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={13} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-control form-control-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: 125 }}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="paid">Chưa sử dụng</option>
                  <option value="used">Đã vào cổng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <select
                className="form-control form-control-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ minWidth: 125 }}
              >
                <option value="all">Tất cả loại vé</option>
                <option value="standard">Tiêu chuẩn</option>
                <option value="student">Học sinh - Sinh viên</option>
                <option value="senior">Người cao tuổi</option>
                <option value="vip">Tham quan VIP</option>
              </select>

              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
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
                  style={{ fontSize: 12 }}
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* BẢNG DANH SÁCH VÉ */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 16
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <th style={{ padding: '10px 16px' }}>Mã vé</th>
                    <th style={{ padding: '10px 16px' }}>Khách tham quan</th>
                    <th style={{ padding: '10px 16px' }}>Loại vé</th>
                    <th style={{ padding: '10px 16px' }}>Lịch tham quan</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Giá vé</th>
                    <th style={{ padding: '10px 16px' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>Đang tải danh sách vé tham quan...</span>
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
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
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

            {/* Phân trang chuẩn */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Hiển thị {tickets.length} / {pagination.total} vé tham quan
              </div>
              <Pagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => fetchTickets(p, pagination.limit)}
              />
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          NỘI DUNG TAB 2: CẤU HÌNH GIÁ VÉ & KHUNG GIỜ (CRUD)
          ======================================================== */}
      {subTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PHẦN 1: BẢNG GIÁ CÁC LOẠI VÉ */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  Bảng giá các loại vé tham quan
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Giá vé được đồng bộ hóa tức thì lên giao diện khách đặt vé và cổng thanh toán PayOS (được lưu cache Redis 5 phút)
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
                  setIsTypeModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} />
                <span>Thêm loại vé mới</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Mã loại</th>
                    <th style={{ padding: '8px 12px' }}>Tên loại vé</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá niêm yết</th>
                    <th style={{ padding: '8px 12px' }}>Mô tả quy định</th>
                    <th style={{ padding: '8px 12px' }}>Trạng thái</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Thứ tự</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPricing ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Đang tải danh mục vé...
                      </td>
                    </tr>
                  ) : ticketTypes.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Chưa có loại vé nào được cấu hình trong cơ sở dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    ticketTypes.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                          {t.code}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatVND(t.price)}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12, maxWidth: 280 }}>
                          {t.description || '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
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
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          {t.displayOrder}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingType(t);
                                setIsTypeModalOpen(true);
                              }}
                              title="Sửa loại vé"
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
          </div>

          {/* PHẦN 2: CẤU HÌNH KHUNG GIỜ THAM QUAN */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  Khung giờ đón tiếp & Giới hạn khách tham quan
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Quy định các ca tham quan trong ngày và sức chứa tối đa để điều phối lượng khách hợp lý
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingSlot({
                    slotName: '',
                    startTime: '08:00',
                    endTime: '11:30',
                    maxCapacity: 500,
                    isActive: true
                  });
                  setIsSlotModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} />
                <span>Thêm khung giờ mới</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Tên khung giờ</th>
                    <th style={{ padding: '8px 12px' }}>Giờ bắt đầu</th>
                    <th style={{ padding: '8px 12px' }}>Giờ kết thúc</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Sức chứa tối đa</th>
                    <th style={{ padding: '8px 12px' }}>Trạng thái</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingPricing ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Đang tải khung giờ...
                      </td>
                    </tr>
                  ) : timeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                        Chưa có khung giờ tham quan nào được thiết lập.
                      </td>
                    </tr>
                  ) : (
                    timeSlots.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {s.slotName}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                          {s.startTime}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                          {s.endTime}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                          {s.maxCapacity} người
                        </td>
                        <td style={{ padding: '10px 12px' }}>
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
                              {s.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setEditingSlot(s);
                                setIsSlotModalOpen(true);
                              }}
                              title="Sửa khung giờ"
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
          </div>
        </div>
      )}

      {/* ========================================================
          NỘI DUNG TAB 3: LỊCH SỬ ĐƠN HÀNG (PAYOS)
          ======================================================== */}
      {subTab === 'orders' && (
        <>
          {/* KPI ĐƠN HÀNG */}
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
                Tổng đơn đặt vé
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.totalOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã thanh toán (PayOS)
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.paidOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chờ thanh toán (15p)
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.pendingOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Đã hủy / Quá hạn
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {orderStats.expiredOrders}
              </div>
            </div>

            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Doanh thu PayOS thực nhận
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
                {formatVND(orderStats.totalRevenue)}
              </div>
            </div>
          </div>

          {/* BỘ LỌC ĐƠN HÀNG */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
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
                  className="form-control form-control-sm"
                  placeholder="Tìm mã đơn hàng PayOS, email người mua, tên, SĐT..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                className="form-control form-control-sm"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ minWidth: 150 }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán (Thành công)</option>
                <option value="pending">Chờ thanh toán (Đang mở)</option>
                <option value="expired">Hết hạn (Đã dọn dẹp)</option>
                <option value="cancelled">Đã hủy bỏ</option>
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

          {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 16
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 16px' }}>Mã đơn (PayOS)</th>
                    <th style={{ padding: '10px 16px' }}>Khách hàng</th>
                    <th style={{ padding: '10px 16px' }}>Chi tiết vé đặt</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right' }}>Tổng thanh toán</th>
                    <th style={{ padding: '10px 16px' }}>Trạng thái</th>
                    <th style={{ padding: '10px 16px' }}>Thời gian tạo / Hết hạn</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingOrders ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <span>Đang tải lịch sử đơn hàng PayOS...</span>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                        Không có đơn hàng nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
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
                        <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatVND(o.totalAmount)}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {renderOrderStatusBadge(o.status)}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 12 }}>
                          <div style={{ color: 'var(--text-main)' }}>Tạo: {formatDateTime(o.createdAt)}</div>
                          {o.status === 'pending' && (
                            <div style={{ color: '#EAB308', fontSize: 11.5 }}>
                              Hết hạn: {formatDateTime(o.expiresAt)}
                            </div>
                          )}
                          {o.paidAt && (
                            <div style={{ color: '#22C55E', fontSize: 11.5 }}>
                              Thanh toán: {formatDateTime(o.paidAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang đơn hàng */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Hiển thị {orders.length} / {ordersPagination.total} đơn hàng
              </div>
              <Pagination
                currentPage={ordersPagination.page}
                totalItems={ordersPagination.total}
                pageSize={ordersPagination.limit}
                onPageChange={(p) => fetchOrders(p, ordersPagination.limit)}
              />
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          MODALS
          ======================================================== */}

      {/* MODAL CHI TIẾT VÉ & SOÁT VÉ QR (TAB 1) */}
      {detailTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setDetailTicket(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              width: '100%',
              maxWidth: 480,
              padding: '20px 24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Ticket size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  Chi tiết vé tham quan #{detailTicket.ticketCode}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDetailTicket(null)}
                style={{ padding: '4px 6px' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Khối hiển thị mã QR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0 16px', borderBottom: '1px solid var(--border-color)', marginBottom: 14 }}>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: 12,
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'inline-flex'
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(detailTicket.qrCodeData || detailTicket.ticketCode)}`}
                  alt="QR Code"
                  style={{ width: 140, height: 140, display: 'block' }}
                />
              </div>
              <div style={{ marginTop: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                {detailTicket.ticketCode}
              </div>
              <div style={{ marginTop: 4 }}>
                {renderStatusBadge(detailTicket.status)}
              </div>
            </div>

            {/* Bảng kê thông tin chi tiết */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách tham quan:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{detailTicket.userName || 'Khách vãng lai'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email liên hệ:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.userEmail || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.userPhone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Loại vé:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getTicketTypeLabel(detailTicket.ticketType)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày tham quan:</span>
                <span style={{ color: 'var(--text-main)' }}>{formatDate(detailTicket.visitDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Khung giờ vào cổng:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.timeSlot || 'Cả ngày'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13.5 }}>
                  {formatVND(detailTicket.totalAmount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.paymentMethod || 'Chuyển khoản VietQR (PayOS)'}</span>
              </div>
            </div>

            {/* Các nút hành động trong Modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              {detailTicket.status === 'paid' && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setCheckinTarget(detailTicket);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckCircle size={13} />
                  <span>Soát vé vào cổng</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDetailTicket(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA LOẠI VÉ (TAB 2) */}
      {isTypeModalOpen && editingType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setIsTypeModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              width: '100%',
              maxWidth: 480,
              padding: '20px 24px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                {editingType.id ? 'Chỉnh sửa loại vé' : 'Thêm loại vé tham quan mới'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsTypeModalOpen(false)}
                style={{ padding: '4px 6px' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveTicketType}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Mã loại vé (Duy nhất, ví dụ: standard, student, vip) *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingType.code || ''}
                    disabled={Boolean(editingType.id)}
                    onChange={(e) => setEditingType({ ...editingType, code: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Tên hiển thị loại vé *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingType.name || ''}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Giá vé niêm yết (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-control form-control-sm"
                    value={editingType.price || 0}
                    onChange={(e) => setEditingType({ ...editingType, price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Mô tả đối tượng áp dụng
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={editingType.description || ''}
                    onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-sm"
                      value={editingType.displayOrder || 1}
                      onChange={(e) => setEditingType({ ...editingType, displayOrder: Number(e.target.value) })}
                      style={{ width: 90 }}
                    />
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingType.isActive !== false}
                        onChange={(e) => setEditingType({ ...editingType, isActive: e.target.checked })}
                      />
                      <span>Đang mở bán</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsTypeModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA KHUNG GIỜ (TAB 2) */}
      {isSlotModalOpen && editingSlot && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setIsSlotModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              width: '100%',
              maxWidth: 460,
              padding: '20px 24px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                {editingSlot.id ? 'Chỉnh sửa khung giờ' : 'Thêm khung giờ tham quan mới'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsSlotModalOpen(false)}
                style={{ padding: '4px 6px' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Tên khung giờ (ví dụ: Buổi sáng, Buổi chiều) *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={editingSlot.slotName || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, slotName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={editingSlot.startTime || '08:00'}
                      onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Giờ kết thúc *
                    </label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={editingSlot.endTime || '11:30'}
                      onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Sức chứa tối đa (người) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm"
                    value={editingSlot.maxCapacity || 500}
                    onChange={(e) => setEditingSlot({ ...editingSlot, maxCapacity: Number(e.target.value) })}
                    required
                  />
                </div>

                <div style={{ marginTop: 6 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingSlot.isActive !== false}
                      onChange={(e) => setEditingSlot({ ...editingSlot, isActive: e.target.checked })}
                    />
                    <span>Khung giờ đang áp dụng</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsSlotModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Lưu khung giờ
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
        message={`Bạn có chắc muốn xóa loại vé "${deleteTypeTarget?.name}" (${deleteTypeTarget?.code})? Khách tham quan sẽ không thể đặt loại vé này nữa.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDeleteType}
        onCancel={() => setDeleteTypeTarget(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deleteSlotTarget)}
        title="Xác nhận xóa khung giờ"
        message={`Bạn có chắc muốn xóa khung giờ "${deleteSlotTarget?.slotName}" (${deleteSlotTarget?.startTime} - ${deleteSlotTarget?.endTime})?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDeleteSlot}
        onCancel={() => setDeleteSlotTarget(null)}
      />
    </div>
  );
};
