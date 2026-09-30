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
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminTicketItem, AdminTicketStats } from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';

export const AdminTicketsPage: React.FC = () => {
  const { showToast } = useToast();

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

  // Bộ lọc
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

  // Thuật toán lọc nhanh tức thời (Debounced 250ms) - Tự động truy vấn ngay khi người dùng gõ hoặc chọn bộ lọc
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets(1, pagination.limit);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets(1, pagination.limit);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTickets(pagination.page, pagination.limit);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) return;
    fetchTickets(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }));
    fetchTickets(1, newLimit);
  };

  // Xử lý soát vé vào cổng
  const handleConfirmCheckin = async () => {
    if (!checkinTarget) return;
    try {
      setIsProcessingAction(true);
      const res = await api.adminCheckinTicket(checkinTarget.ticketCode);
      showToast(res.message || `Đã soát vé thành công: ${checkinTarget.ticketCode}`, 'success');
      setCheckinTarget(null);
      if (detailTicket && detailTicket.ticketCode === checkinTarget.ticketCode) {
        setDetailTicket({ ...detailTicket, status: 'used' });
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

  // Định dạng số tiền VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Định dạng ngày tham quan
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

  // Trả về nhãn trạng thái tối giản chuẩn mực hệ thống (chấm tròn + chữ, không nền màu mè)
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

  return (
    <div className="admin-content" style={{ padding: '24px 28px' }}>
      {/* 1. TIÊU ĐỀ TRANG QUẢN TRỊ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20
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
            <span>Quản lý Vé Tham Quan</span>
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            Danh sách vé tham quan, thông tin người đặt và trạng thái vào cổng
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 2. THANH CHỈ SỐ KPI TỐI GIẢN (ĐỒNG BỘ CHUẨN MỰC BẢNG QUẢN TRỊ) */}
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

      {/* 3. THANH TÌM KIẾM & BỘ LỌC TỐC ĐỘ CAO */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã vé, tên khách, email, số điện thoại..."
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
          <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
            Tìm kiếm
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Lọc Trạng thái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                background: '#1c1917',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                color: '#f8fafc',
                fontSize: 12.5,
                colorScheme: 'dark'
              }}
            >
              <option value="all" style={{ background: '#1c1917', color: '#f8fafc' }}>Tất cả trạng thái</option>
              <option value="paid" style={{ background: '#1c1917', color: '#f8fafc' }}>Hợp lệ (Chờ vào)</option>
              <option value="used" style={{ background: '#1c1917', color: '#f8fafc' }}>Đã soát vé</option>
              <option value="cancelled" style={{ background: '#1c1917', color: '#f8fafc' }}>Đã hủy</option>
            </select>
          </div>

          {/* Lọc Loại vé */}
          <select
            className="admin-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              background: '#1c1917',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              color: '#f8fafc',
              fontSize: 12.5,
              colorScheme: 'dark'
            }}
          >
            <option value="all" style={{ background: '#1c1917', color: '#f8fafc' }}>Tất cả loại vé</option>
            <option value="standard" style={{ background: '#1c1917', color: '#f8fafc' }}>Tiêu chuẩn</option>
            <option value="student" style={{ background: '#1c1917', color: '#f8fafc' }}>Học sinh – Sinh viên</option>
            <option value="senior" style={{ background: '#1c1917', color: '#f8fafc' }}>Người cao tuổi</option>
            <option value="vip" style={{ background: '#1c1917', color: '#f8fafc' }}>Tham quan VIP</option>
          </select>

          {/* Lọc Ngày tham quan */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              className="admin-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Lọc theo ngày tham quan"
              style={{
                padding: '6px 10px',
                background: '#1c1917',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                color: '#f8fafc',
                fontSize: 12.5,
                colorScheme: 'dark'
              }}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                title="Bỏ lọc theo ngày"
                style={{
                  position: 'absolute',
                  right: 28,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Nút Xóa nhanh toàn bộ bộ lọc */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              title="Đặt lại toàn bộ điều kiện lọc"
              style={{ fontSize: 12, padding: '5px 10px' }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. BẢNG DỮ LIỆU VÉ THAM QUAN */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
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
                <th style={{ padding: '10px 16px' }}>Mã vé</th>
                <th style={{ padding: '10px 16px' }}>Khách tham quan</th>
                <th style={{ padding: '10px 16px' }}>Loại vé & Số lượng</th>
                <th style={{ padding: '10px 16px' }}>Lịch tham quan</th>
                <th style={{ padding: '10px 16px' }}>Tổng tiền</th>
                <th style={{ padding: '10px 16px' }}>Trạng thái</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
                    <span>Đang nạp danh sách vé tham quan...</span>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <span>Không tìm thấy vé nào phù hợp với điều kiện lọc.</span>
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
                    className="admin-table-row"
                  >
                    {/* Cột 1: Mã vé */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: 12.5, fontFamily: 'monospace' }}>
                      {t.ticketCode}
                    </td>

                    {/* Cột 2: Khách tham quan */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.userName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{t.userEmail}</div>
                      {t.userPhone && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{t.userPhone}</div>
                      )}
                    </td>

                    {/* Cột 3: Loại vé & Số lượng */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--text-main)' }}>{getTicketTypeLabel(t.ticketType)}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Số lượng: <strong>{t.quantity} vé</strong>
                      </div>
                    </td>

                    {/* Cột 4: Lịch tham quan */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--text-main)', fontSize: 12.5 }}>{formatDate(t.visitDate)}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.timeSlot || '08:00 - 11:30'}
                      </div>
                    </td>

                    {/* Cột 5: Tổng tiền */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatVND(t.totalAmount)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.paymentMethod || 'Chuyển khoản QR'}
                      </div>
                    </td>

                    {/* Cột 6: Trạng thái */}
                    <td style={{ padding: '12px 16px' }}>
                      {renderStatusBadge(t.status)}
                    </td>

                    {/* Cột 7: Thao tác */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {/* Nút Soát vé nhanh */}
                        {t.status === 'paid' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setCheckinTarget(t)}
                            title="Soát vé vào cổng"
                            style={{ padding: '4px 8px' }}
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}

                        {/* Nút Xem chi tiết & QR */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDetailTicket(t)}
                          title="Xem chi tiết & mã QR vé"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Nút Hủy vé */}
                        {t.status !== 'cancelled' && t.status !== 'used' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setCancelTarget(t)}
                            title="Hủy vé tham quan"
                            style={{ padding: '4px 8px' }}
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

        {/* 5. PHÂN TRANG CHUẨN CỦA HỆ THỐNG QUẢN TRỊ */}
        {pagination.total > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handleLimitChange}
            pageSizeOptions={[10, 20, 50]}
            itemLabel="vé"
          />
        )}
      </div>

      {/* 6. MODAL XEM CHI TIẾT VÉ & MÃ QR VÀO CỔNG */}
      {detailTicket && (
        <div className="modal-backdrop" onClick={() => setDetailTicket(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 500,
              width: '92%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '20px 24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: 12,
                marginBottom: 16
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--heading-color)' }}>
                  Chi tiết vé: {detailTicket.ticketCode}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {detailTicket.ticketTitle || 'Vé Tham Quan Bảo Tàng'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailTicket(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Mã QR Soát vé trung tâm */}
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                marginBottom: 16
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  margin: '0 auto 10px',
                  background: '#FFFFFF',
                  borderRadius: 6,
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    detailTicket.qrCodeData || detailTicket.ticketCode
                  )}`}
                  alt="QR Code Vé"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--heading-color)' }}>
                {detailTicket.ticketCode}
              </div>
              <div style={{ marginTop: 6 }}>
                {renderStatusBadge(detailTicket.status)}
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách tham quan:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{detailTicket.userName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.userEmail}</span>
              </div>
              {detailTicket.userPhone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số điện thoại:</span>
                  <span style={{ color: 'var(--text-main)' }}>{detailTicket.userPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Loại vé:</span>
                <span style={{ color: 'var(--text-main)' }}>{getTicketTypeLabel(detailTicket.ticketType)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Số lượng khách:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{detailTicket.quantity} người</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày & Khung giờ:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  {formatDate(detailTicket.visitDate)} ({detailTicket.timeSlot || '08:00 - 11:30'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13.5 }}>
                  {formatVND(detailTicket.totalAmount)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Phương thức:</span>
                <span style={{ color: 'var(--text-main)' }}>{detailTicket.paymentMethod || 'Chuyển khoản QR'}</span>
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

      {/* 7. MODAL XÁC NHẬN SOÁT VÉ */}
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

      {/* 8. MODAL XÁC NHẬN HỦY VÉ */}
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
    </div>
  );
};
