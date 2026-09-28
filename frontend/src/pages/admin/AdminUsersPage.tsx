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
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { api } from '../../services/api';
import { UserItem, UserBookingItem, UserListResponse } from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

interface FormErrors {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  phone?: string;
}

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
    limit: 10,
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

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Modal Xác nhận xóa
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Modal Xác nhận khóa / mở khóa
  const [toggleStatusTarget, setToggleStatusTarget] = useState<UserItem | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);

  const fetchUsers = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setIsLoading(true);
      const res: UserListResponse = await api.getUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page,
        limit
      });
      setUsers(res.data || []);
      setPagination(res.pagination || { page, limit, total: 0, totalPages: 1 });
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách tài khoản', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pagination.limit);
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, pagination.limit);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(pagination.page, pagination.limit);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) return;
    fetchUsers(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }));
    fetchUsers(1, newLimit);
  };

  // Mở modal xem chi tiết
  const handleOpenDetail = async (user: UserItem) => {
    try {
      setDetailUser(user);
      const fullDetail = await api.getUserDetail(user.id);
      setDetailUser(fullDetail);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải chi tiết người dùng', 'error');
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
    setFormErrors({});
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
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.email.trim()) {
      errors.email = 'Địa chỉ email không được để trống';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Định dạng email không hợp lệ (VD: user@example.com)';
      }
    }

    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'Mật khẩu khởi tạo không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
      }
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9+() -]{9,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = 'Số điện thoại không hợp lệ (từ 9 đến 15 chữ số)';
      }
    }

    if (formData.username && formData.username.trim()) {
      const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
      if (!usernameRegex.test(formData.username.trim())) {
        errors.username = 'Tên đăng nhập từ 3 - 30 ký tự, không chứa dấu cách hoặc ký tự đặc biệt';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Lưu Thêm / Sửa
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại các trường thông tin chưa hợp lệ', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          notes: formData.notes.trim(),
          ...(formData.password.trim() ? { password: formData.password.trim() } : {})
        });
        showToast('Cập nhật tài khoản người dùng thành công', 'success');
      } else {
        await api.createUser({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || undefined,
          password: formData.password.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          isActive: formData.isActive,
          notes: formData.notes.trim()
        });
        showToast('Tạo tài khoản người dùng thành công', 'success');
      }
      setIsFormModalOpen(false);
      fetchUsers(pagination.page, pagination.limit);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu tài khoản', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Thực hiện đổi trạng thái Hoạt động / Khóa
  const handleConfirmToggleStatus = async () => {
    if (!toggleStatusTarget) return;
    try {
      setIsTogglingStatus(true);
      const res = await api.toggleUserStatus(toggleStatusTarget.id);
      showToast(
        res.isActive
          ? `Đã kích hoạt tài khoản "${toggleStatusTarget.fullName || toggleStatusTarget.email}"`
          : `Đã tạm khóa tài khoản "${toggleStatusTarget.fullName || toggleStatusTarget.email}"`,
        'success'
      );
      setToggleStatusTarget(null);
      setUsers((prev) =>
        prev.map((u) => (u.id === toggleStatusTarget.id ? { ...u, isActive: res.isActive } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Không thể thay đổi trạng thái tài khoản', 'error');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Xóa tài khoản
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteUser(deleteTarget.id);
      showToast('Đã xóa tài khoản thành công', 'success');
      setDeleteTarget(null);
      fetchUsers(pagination.page, pagination.limit);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa tài khoản', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format tiền tệ VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Render Role dạng nhãn chữ trung tính
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'staff':
        return 'Nhân viên';
      default:
        return 'Khách tham quan';
    }
  };

  // Tính toán số hiển thị phân trang
  const fromIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const toIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="admin-content" style={{ padding: '24px 28px' }}>
      {/* 1. THANH TIÊU ĐỀ TRANG */}
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
            <Users size={20} style={{ color: 'var(--primary)' }} />
            <span>Quản lý Người dùng & Khách tham quan</span>
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>
            Danh sách tài khoản, phân quyền quản trị và dữ liệu khách tham quan
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <UserPlus size={14} />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* 2. THANH CHỈ SỐ KPI TỐI GIẢN (KHÔNG DÙNG ICON/CARDLET MÀU MÈ) */}
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
            Tổng người dùng
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {stats.totalUsers || pagination.total}
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Khách tham quan
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {stats.clientCount}
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderRight: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quản trị & Nhân viên
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {stats.adminCount + stats.staffCount}
          </div>
        </div>

        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Đang hoạt động
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {stats.activeCount}
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC & TÌM KIẾM GỌN GÀNG */}
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
              placeholder="Tìm theo tên, email, số điện thoại..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                color: 'var(--text-main)',
                fontSize: 12.5
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="client">Khách tham quan</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px',
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
                <th style={{ padding: '10px 16px' }}>Họ và tên</th>
                <th style={{ padding: '10px 16px' }}>Email / Tên đăng nhập</th>
                <th style={{ padding: '10px 16px' }}>Số điện thoại</th>
                <th style={{ padding: '10px 16px' }}>Vai trò</th>
                <th style={{ padding: '10px 16px' }}>Đặt lịch & Chi tiêu</th>
                <th style={{ padding: '10px 16px' }}>Trạng thái</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
                    <span>Đang nạp danh sách tài khoản...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <span>Không có người dùng nào phù hợp với bộ lọc.</span>
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
                      {/* Cột 1: Họ tên */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              background: 'var(--bg-main)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: 12,
                              flexShrink: 0
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {u.fullName || u.username}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                        <div>{u.email}</div>
                      </td>

                      {/* Cột 3: Số điện thoại */}
                      <td style={{ padding: '12px 16px', color: u.phone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {u.phone || '—'}
                      </td>

                      {/* Cột 4: Vai trò */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 11.5,
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)'
                          }}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>

                      {/* Cột 5: Đặt lịch & Chi tiêu */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: 12.5 }}>
                          {bookingsCount > 0 ? `${bookingsCount} lượt đặt` : 'Chưa đặt'}
                        </div>
                        {spent > 0 && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                            {formatVND(spent)}
                          </div>
                        )}
                      </td>

                      {/* Cột 6: Trạng thái */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: u.isActive ? '#22C55E' : '#64748B',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ color: u.isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            {u.isActive ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </div>
                      </td>

                      {/* Cột 7: Thao tác */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetail(u)}
                            title="Xem chi tiết hồ sơ & lịch sử đặt vé"
                            style={{ padding: '4px 8px' }}
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(u)}
                            title="Chỉnh sửa thông tin"
                            style={{ padding: '4px 8px' }}
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setToggleStatusTarget(u)}
                            title={u.isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}
                            style={{ padding: '4px 8px' }}
                          >
                            {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>

                          {u.username !== 'admin' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDeleteTarget(u)}
                              title="Xóa tài khoản"
                              style={{ padding: '4px 8px', color: '#EF4444' }}
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

        {/* 5. PHÂN TRANG CHUẨN ĐẦY ĐỦ */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12.5,
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>
              Hiển thị {fromIndex} - {toIndex} trên tổng {pagination.total} người dùng
            </span>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>Dòng mỗi trang:</span>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                style={{
                  padding: '3px 8px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 4,
                  color: 'var(--text-main)',
                  fontSize: 12
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(1)}
              disabled={pagination.page <= 1}
              style={{ padding: '4px 6px' }}
              title="Trang đầu"
            >
              <ChevronsLeft size={13} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{ padding: '4px 8px' }}
              title="Trang trước"
            >
              <ChevronLeft size={13} />
            </button>

            {/* Các nút số trang */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                    <button
                      type="button"
                      className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handlePageChange(p)}
                      style={{ minWidth: 28, padding: '4px 6px', fontSize: 12 }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              style={{ padding: '4px 8px' }}
              title="Trang tiếp"
            >
              <ChevronRight size={13} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page >= pagination.totalPages}
              style={{ padding: '4px 6px' }}
              title="Trang cuối"
            >
              <ChevronsRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. MODAL XEM CHI TIẾT HỒ SƠ & LỊCH SỬ ĐẶT VÉ (GỌN GÀNG, TỐI GIẢN) */}
      {detailUser && (
        <div className="modal-backdrop" onClick={() => setDetailUser(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
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
                  Hồ sơ: {detailUser.fullName || detailUser.username}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  @{detailUser.username} • {getRoleLabel(detailUser.role)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailUser(null)}
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

            {/* Bảng thông tin cá nhân dạng 2 cột đơn giản */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 12,
                marginBottom: 20,
                fontSize: 12.5
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{detailUser.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Số điện thoại: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{detailUser.phone || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Trạng thái: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {detailUser.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Lần đăng nhập cuối: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                  {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleString('vi-VN') : 'Chưa có thông tin'}
                </span>
              </div>
            </div>

            {/* Lịch sử Đặt lịch & Thanh toán */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  Lịch sử Đặt lịch & Thanh toán vé
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tổng chi tiêu:{' '}
                  <strong style={{ color: 'var(--text-main)' }}>
                    {formatVND(detailUser.bookingStats?.totalSpent || 0)}
                  </strong>
                </div>
              </div>

              {detailUser.bookings && detailUser.bookings.length > 0 ? (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 10px' }}>Mã đặt chỗ</th>
                        <th style={{ padding: '8px 10px' }}>Ngày tham quan</th>
                        <th style={{ padding: '8px 10px' }}>Loại vé</th>
                        <th style={{ padding: '8px 10px' }}>Số tiền</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailUser.bookings.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-main)' }}>
                            #{b.id}
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
                            {b.visitDate} ({b.timeSlot})
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-main)' }}>
                            {b.ticketType} (x{b.quantity})
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-main)', fontWeight: 600 }}>
                            {formatVND(b.totalAmount)}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#22C55E' }}>
                            Đã thanh toán
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 14, textAlign: 'center', background: 'var(--bg-main)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                  Chưa ghi nhận lượt đặt lịch tham quan nào.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
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

      {/* 7. MODAL THÊM MỚI / CHỈNH SỬA (CÓ VALIDATION ĐẦY ĐỦ & RESPONSIVE) */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSaving && setIsFormModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 540,
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--heading-color)' }}>
                {editingUser ? 'Chỉnh sửa tài khoản người dùng' : 'Thêm mới tài khoản người dùng'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSaving}
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

            <form onSubmit={handleSubmitForm} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Họ và tên */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: undefined });
                    }}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-main)',
                      border: `1px solid ${formErrors.fullName ? '#EF4444' : 'var(--border-color)'}`,
                      borderRadius: 6,
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                  {formErrors.fullName && (
                    <span style={{ fontSize: 11.5, color: '#F87171', display: 'block', marginTop: 3 }}>
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email & Tên đăng nhập (Responsive Grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      Địa chỉ Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                      }}
                      placeholder="user@example.com"
                      disabled={Boolean(editingUser)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: `1px solid ${formErrors.email ? '#EF4444' : 'var(--border-color)'}`,
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13,
                        opacity: editingUser ? 0.6 : 1
                      }}
                    />
                    {formErrors.email && (
                      <span style={{ fontSize: 11.5, color: '#F87171', display: 'block', marginTop: 3 }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        if (formErrors.username) setFormErrors({ ...formErrors, username: undefined });
                      }}
                      placeholder="Để trống tự tạo từ email"
                      disabled={Boolean(editingUser)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: `1px solid ${formErrors.username ? '#EF4444' : 'var(--border-color)'}`,
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13,
                        opacity: editingUser ? 0.6 : 1
                      }}
                    />
                    {formErrors.username && (
                      <span style={{ fontSize: 11.5, color: '#F87171', display: 'block', marginTop: 3 }}>
                        {formErrors.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mật khẩu & Số điện thoại */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      {editingUser ? 'Mật khẩu mới (Bỏ qua nếu giữ nguyên)' : 'Mật khẩu khởi tạo *'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                      }}
                      placeholder={editingUser ? '••••••••' : 'Tối thiểu 6 ký tự'}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: `1px solid ${formErrors.password ? '#EF4444' : 'var(--border-color)'}`,
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    />
                    {formErrors.password && (
                      <span style={{ fontSize: 11.5, color: '#F87171', display: 'block', marginTop: 3 }}>
                        {formErrors.password}
                      </span>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      placeholder="0912 345 678"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: `1px solid ${formErrors.phone ? '#EF4444' : 'var(--border-color)'}`,
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    />
                    {formErrors.phone && (
                      <span style={{ fontSize: 11.5, color: '#F87171', display: 'block', marginTop: 3 }}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vai trò & Trạng thái */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      Vai trò
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    >
                      <option value="client">Khách tham quan</option>
                      <option value="staff">Nhân viên bảo tàng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                      Trạng thái
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'locked'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 13
                      }}
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="locked">Tạm khóa tài khoản</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                    Ghi chú nội bộ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về người dùng..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      color: 'var(--text-main)',
                      fontSize: 13,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 20,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-color)'
                }}
              >
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

      {/* 8. MODAL XÁC NHẬN KHÓA / KÍCH HOẠT TÀI KHOẢN */}
      <ConfirmModal
        isOpen={Boolean(toggleStatusTarget)}
        title={toggleStatusTarget?.isActive ? 'Xác nhận tạm khóa tài khoản' : 'Xác nhận kích hoạt tài khoản'}
        message={
          toggleStatusTarget?.isActive
            ? `Bạn có chắc chắn muốn tạm khóa tài khoản "${toggleStatusTarget.fullName || toggleStatusTarget.email}"? Tài khoản này sẽ không thể đăng nhập cho đến khi được mở khóa.`
            : `Kích hoạt lại tài khoản "${toggleStatusTarget?.fullName || toggleStatusTarget?.email}" để cho phép người dùng đăng nhập hệ thống?`
        }
        confirmText={isTogglingStatus ? 'Đang xử lý...' : toggleStatusTarget?.isActive ? 'Khóa tài khoản' : 'Kích hoạt'}
        cancelText="Hủy bỏ"
        type={toggleStatusTarget?.isActive ? 'warning' : 'info'}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleStatusTarget(null)}
      />

      {/* 9. MODAL XÁC NHẬN XÓA TÀI KHOẢN */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xóa tài khoản người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.fullName || deleteTarget?.email}"? Toàn bộ dữ liệu hồ sơ sẽ bị xóa khỏi hệ thống.`}
        confirmText={isDeleting ? 'Đang xóa...' : 'Xóa tài khoản'}
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
