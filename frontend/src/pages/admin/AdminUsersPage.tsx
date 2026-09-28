import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Ticket
} from 'lucide-react';
import { api } from '../../services/api';
import { UserItem, UserBookingItem, UserListResponse } from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    staffCount: 0,
    clientCount: 0,
    activeCount: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal Chi tiết
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Modal Thêm / Chỉnh sửa
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    role: 'client',
    isActive: true,
    notes: ''
  });

  // Modal Xác nhận xóa
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const res: UserListResponse = await api.getUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: pagination.limit
      });
      setUsers(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(pagination.page);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = async (user: UserItem) => {
    try {
      setIsLoadingDetail(true);
      setDetailUser(user);
      const fullDetail = await api.getUserDetail(user.id);
      setDetailUser(fullDetail);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đọc chi tiết người dùng', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Mở modal Thêm mới
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      role: 'client',
      isActive: true,
      notes: ''
    });
    setIsFormModalOpen(true);
  };

  // Mở modal Chỉnh sửa
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      phone: user.phone || '',
      role: user.role || 'client',
      isActive: user.isActive !== false,
      notes: user.notes || ''
    });
    setIsFormModalOpen(true);
  };

  // Lưu Thêm / Sửa
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email?.trim()) {
      showToast('Vui lòng nhập địa chỉ Email', 'warning');
      return;
    }

    if (!editingUser && !formData.password?.trim()) {
      showToast('Vui lòng đặt mật khẩu khởi tạo cho tài khoản mới', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive,
          notes: formData.notes,
          ...(formData.password?.trim() ? { password: formData.password.trim() } : {})
        });
        showToast(`Đã cập nhật thông tin người dùng "${formData.fullName || formData.email}" thành công`, 'success');
      } else {
        await api.createUser({
          fullName: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.isActive,
          notes: formData.notes
        });
        showToast(`Đã tạo tài khoản "${formData.fullName || formData.email}" thành công`, 'success');
      }
      setIsFormModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thông tin người dùng', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Đổi nhanh trạng thái Hoạt động / Khóa
  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await api.toggleUserStatus(user.id);
      showToast(res.isActive ? `Đã kích hoạt tài khoản ${user.fullName || user.email}` : `Đã tạm khóa tài khoản ${user.fullName || user.email}`, 'info');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: res.isActive } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Không thể đổi trạng thái tài khoản', 'error');
    }
  };

  // Xóa tài khoản
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteUser(deleteTarget.id);
      showToast(`Đã xóa tài khoản "${deleteTarget.fullName || deleteTarget.email}" thành công`, 'success');
      setDeleteTarget(null);
      fetchUsers(pagination.page);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa tài khoản', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper format tiền tệ VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Helper render role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: 'rgba(140, 45, 25, 0.25)', color: '#FCA5A5', border: '1px solid rgba(140, 45, 25, 0.4)' }}>
            <ShieldCheck size={12} />
            <span>Quản trị viên</span>
          </span>
        );
      case 'staff':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: 'rgba(30, 58, 138, 0.25)', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <Shield size={12} />
            <span>Nhân viên</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: 'rgba(212, 168, 106, 0.16)', color: '#FDE68A', border: '1px solid rgba(212, 168, 106, 0.3)' }}>
            <Users size={12} />
            <span>Khách tham quan</span>
          </span>
        );
    }
  };

  return (
    <div className="admin-content" style={{ padding: '24px 28px' }}>
      {/* 1. TIÊU ĐỀ TRANG & NÚT THAO TÁC CHÍNH */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={22} style={{ color: 'var(--primary)' }} />
            <span>Quản lý Người dùng & Khách tham quan</span>
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            Quản lý tài khoản, phân quyền quản trị và theo dõi lịch sử đặt lịch tham quan & thanh toán
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Tải lại danh sách"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <UserPlus size={15} />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* 2. 4 THẺ THỐNG KÊ NHANH (KPI CARDS - TÔNG TRẦM OBSIDIAN DARK) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(212, 168, 106, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng người dùng</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{stats.totalUsers || users.length}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(212, 168, 106, 0.15)', color: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Khách tham quan</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{stats.clientCount}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(140, 45, 25, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quản trị & Nhân viên</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{stats.adminCount + stats.staffCount}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(22, 101, 52, 0.2)', color: '#86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đang hoạt động</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{stats.activeCount}</div>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC & TÌM KIẾM */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên, email, tên đăng nhập, số điện thoại..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                color: 'var(--text-main)',
                fontSize: 12.5
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên bảo tàng</option>
              <option value="client">Khách tham quan</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                color: 'var(--text-main)',
                fontSize: 12.5
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Tạm khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH NGƯỜI DÙNG */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 16px' }}>Người dùng</th>
                <th style={{ padding: '12px 16px' }}>Liên hệ & SĐT</th>
                <th style={{ padding: '12px 16px' }}>Vai trò</th>
                <th style={{ padding: '12px 16px' }}>Đặt lịch & Chi tiêu</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px' }}>Ngày tạo</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
                    <span>Đang nạp danh sách tài khoản người dùng...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Users size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    <span>Không tìm thấy người dùng nào phù hợp với bộ lọc.</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();
                  const bookingsCount = u.bookingStats?.totalBookings || 0;
                  const spent = u.bookingStats?.totalSpent || 0;

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease'
                      }}
                      className="admin-table-row"
                    >
                      {/* Cột 1: Người dùng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: u.role === 'admin' ? 'rgba(140, 45, 25, 0.4)' : 'rgba(212, 168, 106, 0.2)',
                              color: u.role === 'admin' ? '#FCA5A5' : '#D4A86A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.fullName || u.username}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email & SĐT */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: 12.5 }}>{u.email}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 2 }}>
                          {u.phone ? u.phone : 'Chưa cập nhật SĐT'}
                        </div>
                      </td>

                      {/* Cột 3: Vai trò */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderRoleBadge(u.role)}
                      </td>

                      {/* Cột 4: Đặt lịch & Chi tiêu */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Ticket size={13} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{bookingsCount} lượt vé</span>
                        </div>
                        {spent > 0 && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                            {formatVND(spent)}
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td style={{ padding: '14px 16px' }}>
                        {u.isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, fontSize: 11.5, background: 'rgba(22, 101, 52, 0.25)', color: '#86EFAC' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, fontSize: 11.5, background: 'rgba(100, 116, 139, 0.25)', color: '#CBD5E1' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8' }} />
                            <span>Tạm khóa</span>
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Ngày tạo */}
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetail(u)}
                            title="Xem chi tiết hồ sơ & lịch sử đặt vé"
                            style={{ padding: '5px 8px' }}
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(u)}
                            title="Chỉnh sửa thông tin"
                            style={{ padding: '5px 8px' }}
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleStatus(u)}
                            title={u.isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}
                            style={{ padding: '5px 8px', color: u.isActive ? 'var(--text-muted)' : '#4ADE80' }}
                          >
                            {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>

                          {u.username !== 'admin' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDeleteTarget(u)}
                              title="Xóa tài khoản"
                              style={{ padding: '5px 8px', color: '#EF4444' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)' }}>
            <div>
              Hiển thị trang {pagination.page} / {pagination.totalPages} ({pagination.total} người dùng)
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Trang trước
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Trang tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL XEM CHI TIẾT NGƯỜI DÙNG & LỊCH SỬ ĐẶT LỊCH / VÉ */}
      {detailUser && (
        <div className="modal-backdrop" onClick={() => setDetailUser(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 680, width: '92%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(212, 168, 106, 0.2)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>
                  {(detailUser.fullName || detailUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--heading-color)' }}>
                    {detailUser.fullName || detailUser.username}
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    @{detailUser.username} • {renderRoleBadge(detailUser.role)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Thông tin cá nhân */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={12} />
                  <span>Email</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                  {detailUser.email}
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={12} />
                  <span>Số điện thoại</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                  {detailUser.phone || 'Chưa cung cấp'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} />
                  <span>Đăng nhập gần nhất</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                  {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CreditCard size={12} />
                  <span>Tổng chi tiêu vé</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-gold)', marginTop: 4 }}>
                  {formatVND(detailUser.bookingStats?.totalSpent || 0)}
                </div>
              </div>
            </div>

            {/* Lịch sử Đặt lịch & Thanh toán */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} style={{ color: 'var(--accent-gold)' }} />
                  <span>Lịch sử Đặt lịch & Thanh toán vé tham quan</span>
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Sẵn sàng tích hợp cổng thanh toán trực tuyến
                </span>
              </div>

              {detailUser.bookings && detailUser.bookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {detailUser.bookings.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 10
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-gold)' }}>#{b.id}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>{b.ticketType}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                          Ngày tham quan: <strong>{b.visitDate}</strong> ({b.timeSlot}) • {b.quantity} vé
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatVND(b.totalAmount)}
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 11, background: 'rgba(22, 101, 52, 0.25)', color: '#86EFAC', marginTop: 4 }}>
                          <CheckCircle2 size={11} />
                          <span>Đã thanh toán</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: 'center', background: 'var(--bg-main)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 12.5 }}>
                  Chưa có lịch sử đặt vé nào ghi nhận cho tài khoản này.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDetailUser(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL THÊM MỚI / CHỈNH SỬA NGƯỜI DÙNG */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSaving && setIsFormModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 560, width: '92%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--heading-color)' }}>
                {editingUser ? 'Chỉnh sửa tài khoản người dùng' : 'Thêm mới tài khoản người dùng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSaving}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Địa chỉ Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      disabled={Boolean(editingUser)}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, opacity: editingUser ? 0.6 : 1 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Để trống tự lấy từ email"
                      disabled={Boolean(editingUser)}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, opacity: editingUser ? 0.6 : 1 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      {editingUser ? 'Mật khẩu mới (Bỏ qua nếu không đổi)' : 'Mật khẩu khởi tạo *'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'Nhập mật khẩu'}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0912 345 678"
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Vai trò tài khoản
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13 }}
                    >
                      <option value="client">Khách tham quan (Client)</option>
                      <option value="staff">Nhân viên bảo tàng (Staff)</option>
                      <option value="admin">Quản trị viên tối cao (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Trạng thái tài khoản
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'locked'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13 }}
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="locked">Tạm khóa tài khoản</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                    Ghi chú nội bộ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú về người dùng, chức vụ, hoặc lưu ý đặc biệt..."
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 6, color: 'var(--text-main)', fontSize: 13, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL XÁC NHẬN XÓA */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xóa tài khoản người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.fullName || deleteTarget?.email}"? Toàn bộ dữ liệu hồ sơ sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmText={isDeleting ? 'Đang xóa...' : 'Xóa tài khoản'}
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
