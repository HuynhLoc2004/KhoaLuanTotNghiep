import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Calendar,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { UserItem, UserBookingItem, UserListResponse } from '../../types';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Pagination } from '../../components/Pagination';

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
    limit: 6,
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

  const fetchUsers = async (page = pagination.page, limit = pagination.limit, overrideSearch?: string) => {
    try {
      setIsLoading(true);
      const querySearch = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const res: UserListResponse = await api.getUsers({
        search: querySearch.trim(),
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

  // Tự động tải lại danh sách khi thay đổi vai trò hoặc trạng thái
  useEffect(() => {
    fetchUsers(1, pagination.limit);
  }, [roleFilter, statusFilter]);

  // Tìm kiếm: Validate bắt buộc nhập từ khóa
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập từ khóa tìm kiếm (tên, email hoặc số điện thoại)', 'warning');
      return;
    }
    fetchUsers(1, pagination.limit, trimmed);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchUsers(1, pagination.limit, '');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    fetchUsers(1, pagination.limit, '');
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

  // Validate form client-side chuẩn nghiệp vụ
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedPhone = formData.phone.trim();

    // 1. Họ và tên
    if (!trimmedName) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
    } else if (trimmedName.length > 70) {
      errors.fullName = 'Họ và tên không được vượt quá 70 ký tự';
    } else if (!/^[\p{L}\s'.-]+$/u.test(trimmedName)) {
      errors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng hợp lệ';
    }

    // 2. Email
    if (!trimmedEmail) {
      errors.email = 'Địa chỉ email không được để trống';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Định dạng email không hợp lệ (VD: user@example.com)';
      }
    }

    // 3. Mật khẩu
    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'Mật khẩu khởi tạo không được để trống';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
      } else if (formData.password.includes(' ')) {
        errors.password = 'Mật khẩu không được chứa khoảng trắng';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
      } else if (formData.password.includes(' ')) {
        errors.password = 'Mật khẩu không được chứa khoảng trắng';
      }
    }

    // 4. Số điện thoại (Tùy chọn nhưng nếu nhập phải chuẩn Việt Nam hoặc quốc tế)
    if (trimmedPhone) {
      const phoneClean = trimmedPhone.replace(/[\s.-]/g, '');
      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(phoneClean)) {
        errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)';
      }
    }

    // 5. Tên đăng nhập (Tùy chọn khi tạo mới, không thể sửa khi edit)
    if (trimmedUsername) {
      const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        errors.username = 'Tên đăng nhập từ 3 - 30 ký tự (chữ, số, _, -, .)';
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

  // Định dạng ngày tháng chuẩn Việt Nam
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
    if (!dateStr) return '— Chưa đăng nhập';
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
    <div className="admin-content admin-users-page">
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

      {/* 2. THANH CHỈ SỐ KPI TỐI GIẢN */}
      <div className="users-stats-grid">
        <div className="users-stat-card">
          <div className="users-stat-label">Tổng người dùng</div>
          <div className="users-stat-value">{stats.totalUsers || pagination.total}</div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">Khách tham quan</div>
          <div className="users-stat-value">{stats.clientCount}</div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">Quản trị & Nhân viên</div>
          <div className="users-stat-value">{stats.adminCount + stats.staffCount}</div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">Đang hoạt động</div>
          <div className="users-stat-value">{stats.activeCount}</div>
        </div>
      </div>

      {/* 3. BỘ LỌC & TÌM KIẾM GỌN GÀNG */}
      <div className="users-toolbar-card">
        <form onSubmit={handleSearchSubmit} className="users-search-form">
          <div className="users-search-wrapper">
            <Search size={14} className="users-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="users-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="users-search-clear"
                onClick={handleClearSearch}
                title="Xóa từ khóa"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-sm users-search-btn">
            Tìm kiếm
          </button>
        </form>

        <div className="users-filter-group">
          <div className="users-select-wrapper">
            <Filter size={13} className="users-filter-icon" />
            <select
              className="admin-select users-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="client">Khách tham quan</option>
            </select>
          </div>

          <div className="users-select-wrapper">
            <select
              className="admin-select users-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Tạm khóa</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm users-reset-btn"
              onClick={handleClearFilters}
              title="Đặt lại toàn bộ điều kiện lọc"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH NGƯỜI DÙNG & THẺ MOBILE */}
      <div className="users-table-card">
        {/* DESKTOP TABLE */}
        <div className="users-table-scroll">
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
                <th style={{ padding: '10px 16px' }}>Ngày tạo</th>
                <th style={{ padding: '10px 16px' }}>Đăng nhập cuối</th>
                <th style={{ padding: '10px 16px' }}>Trạng thái</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
                    <span>Đang nạp danh sách tài khoản...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <span>Không có người dùng nào phù hợp với bộ lọc.</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();

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

                      {/* Cột 5: Ngày tạo tài khoản */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontSize: 12.5 }}>
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Cột 6: Đăng nhập cuối */}
                      <td style={{ padding: '12px 16px', color: u.lastLogin ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 12 }}>
                        {formatDateTime(u.lastLogin)}
                      </td>

                      {/* Cột 7: Trạng thái */}
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

                      {/* Cột 8: Thao tác */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenDetail(u)}
                            title="Xem chi tiết hồ sơ tài khoản"
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
                              style={{ padding: '4px 8px', color: 'var(--error)' }}
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

        {/* MOBILE CARDS LIST */}
        <div className="users-mobile-list">
          {isLoading ? (
            <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: 'var(--primary)' }} />
              <span>Đang nạp danh sách tài khoản...</span>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              <span>Không có người dùng nào phù hợp với bộ lọc.</span>
            </div>
          ) : (
            users.map((u) => {
              const initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();
              return (
                <div key={u.id} className="users-mobile-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div className="users-avatar-circle">{initial}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--heading-color)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.fullName || u.username}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          @{u.username}
                        </div>
                      </div>
                    </div>
                    <span className={`users-role-pill role-${u.role || 'client'}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </div>

                  <div className="users-mobile-card-meta">
                    <div style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6, wordBreak: 'break-all' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>SĐT:</span>
                        <span>{u.phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: u.isActive ? '#22C55E' : '#64748B',
                            display: 'inline-block'
                          }}
                        />
                        <span style={{ color: u.isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {u.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Tạo: {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="users-mobile-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenDetail(u)}
                      title="Xem chi tiết"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Eye size={13} />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(u)}
                      title="Sửa"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit3 size={13} />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setToggleStatusTarget(u)}
                      title={u.isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt tài khoản'}
                      style={{ padding: '6px 10px' }}
                    >
                      {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>
                    {u.username !== 'admin' && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDeleteTarget(u)}
                        title="Xóa tài khoản"
                        style={{ padding: '6px 10px', color: 'var(--error)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. PHÂN TRANG CHUẨN CỦA HỆ THỐNG QUẢN TRỊ */}
        {pagination.total > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handleLimitChange}
            pageSizeOptions={[6, 9, 12, 18, 24]}
            itemLabel="người dùng"
          />
        )}
      </div>

      {/* 6. MODAL XEM CHI TIẾT HỒ SƠ & LỊCH SỬ ĐẶT VÉ (CHUẨN HÓA DI SẢN) */}
      {detailUser && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1200 }}
          onClick={() => setDetailUser(null)}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: 600,
              width: 'min(600px, 94vw)',
              maxHeight: 'min(90vh, 720px)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Hồ sơ: {detailUser.fullName || detailUser.username}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  @{detailUser.username} • {getRoleLabel(detailUser.role)}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDetailUser(null)}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                overflowY: 'auto'
              }}
            >
              {/* Bảng thông tin cá nhân */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  fontSize: 13
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
                  <span style={{ color: detailUser.isActive ? '#22C55E' : 'var(--text-muted)', fontWeight: 600 }}>
                    {detailUser.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ngày tạo tài khoản: </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    {formatDateTime(detailUser.createdAt)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Lần đăng nhập cuối: </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    {formatDateTime(detailUser.lastLogin)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Ghi chú quản trị: </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                    {detailUser.notes || 'Không có'}
                  </span>
                </div>
              </div>

              {/* Dữ liệu tổng hợp vé tham quan */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading-color)' }}>
                    Thông tin vé & Đặt chỗ tham quan
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Tổng chi tiêu:{' '}
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      {formatVND(detailUser.bookingStats?.totalSpent || 0)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                      {detailUser.bookingStats?.totalBookings && detailUser.bookingStats.totalBookings > 0
                        ? `Đã đăng ký ${detailUser.bookingStats.totalBookings} vé tham quan bảo tàng`
                        : 'Chưa có vé tham quan nào trong hệ thống'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Vé tham quan được lưu trữ và quản lý tập trung tại trang Dashboard Vé riêng biệt
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailUser(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL THÊM MỚI / CHỈNH SỬA (CHUẨN FORM QUẢN TRỊ ADMIN HERITAGE & RESPONSIVE) */}
      {isFormModalOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1200 }}
          onClick={() => !isSaving && setIsFormModalOpen(false)}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: 540,
              width: 'min(540px, 94vw)',
              maxHeight: 'min(90vh, 720px)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  {editingUser ? 'Chỉnh sửa tài khoản người dùng' : 'Thêm mới tài khoản người dùng'}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {editingUser
                    ? 'Cập nhật quyền hạn, thông tin liên lạc và trạng thái hoạt động'
                    : 'Thiết lập thông tin đăng nhập, phân quyền vai trò và trạng thái tài khoản'}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFormModalOpen(false)}
                disabled={isSaving}
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              noValidate
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <div
                className="modal-body"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  overflowY: 'auto',
                  flex: '1 1 auto',
                  minHeight: 0
                }}
              >
                {/* Họ và tên */}
                <div className="form-group">
                  <label className="form-label">
                    Họ và tên <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    style={formErrors.fullName ? { borderColor: 'var(--error)' } : undefined}
                  />
                  {formErrors.fullName && (
                    <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                      {formErrors.fullName}
                    </span>
                  )}
                </div>

                {/* Email & Tên đăng nhập */}
                <div className="modal-form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      Địa chỉ Email <span style={{ color: 'var(--error)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="user@example.com"
                      disabled={Boolean(editingUser)}
                      style={formErrors.email ? { borderColor: 'var(--error)' } : undefined}
                    />
                    {formErrors.email && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên đăng nhập</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: undefined }));
                      }}
                      placeholder="Để trống tự tạo từ email"
                      disabled={Boolean(editingUser)}
                      style={formErrors.username ? { borderColor: 'var(--error)' } : undefined}
                    />
                    {formErrors.username && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mật khẩu & Số điện thoại */}
                <div className="modal-form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      {editingUser ? 'Mật khẩu mới (Bỏ qua nếu giữ nguyên)' : (
                        <>Mật khẩu khởi tạo <span style={{ color: 'var(--error)' }}>*</span></>
                      )}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder={editingUser ? '••••••••' : 'Tối thiểu 6 ký tự'}
                      style={formErrors.password ? { borderColor: 'var(--error)' } : undefined}
                    />
                    {formErrors.password && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.password}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="0912 345 678"
                      style={formErrors.phone ? { borderColor: 'var(--error)' } : undefined}
                    />
                    {formErrors.phone && (
                      <span style={{ color: 'var(--error)', fontSize: '11.5px', marginTop: 4, display: 'block' }}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vai trò & Trạng thái */}
                <div className="modal-form-row-2col">
                  <div className="form-group">
                    <label className="form-label">Vai trò</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="client">Khách tham quan</option>
                      <option value="staff">Nhân viên bảo tàng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-control"
                      value={formData.isActive ? 'active' : 'locked'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Đang hoạt động</option>
                      <option value="locked">Tạm khóa tài khoản</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú nội bộ */}
                <div className="form-group">
                  <label className="form-label">Ghi chú nội bộ</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về người dùng..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSaving && <RefreshCw size={14} className="spin" />}
                  <span>{isSaving ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}</span>
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
