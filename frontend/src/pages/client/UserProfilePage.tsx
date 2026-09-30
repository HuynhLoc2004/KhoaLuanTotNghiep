import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useToast } from '../../components/Toast';
import { api } from '../../services/api';
import { UserProfile, UserTicket } from '../../types';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface UserProfilePageProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: any) => void;
  onNavigateAdmin: () => void;
  onOpenLoginModal: () => void;
  onOpenQRScanner?: () => void;
  initialTab?: 'profile' | 'tickets';
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  onNavigateHome,
  onNavigatePage,
  onNavigateAdmin,
  onOpenLoginModal,
  onOpenQRScanner,
  initialTab = 'profile'
}) => {
  const { user, logout } = useAuth();
  const isAuthenticated = Boolean(user);
  const { t } = useClientTranslation();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'tickets'>(initialTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);

  // Form Profile State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  // Form Change Password State
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  // Tải dữ liệu thật từ Backend (PostgreSQL Primary + MongoDB Mirror)
  const loadData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [profileRes, ticketsRes] = await Promise.all([
        api.getUserProfile().catch(() => null),
        api.getMyTickets().catch(() => [])
      ]);

      if (profileRes) {
        setProfile(profileRes);
        setFullName(profileRes.fullName || '');
        setPhone(profileRes.phone || '');
      }

      setTickets(ticketsRes || []);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải thông tin hồ sơ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Cập nhật thông tin cơ bản
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Họ và tên không được để trống', 'error');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      const res = await api.updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim()
      });
      showToast(res.message || 'Cập nhật thành công', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Đổi mật khẩu tài khoản
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không trùng khớp', 'error');
      return;
    }
    try {
      setIsChangingPass(true);
      const res = await api.changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });
      showToast(res.message || 'Đổi mật khẩu thành công', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Lỗi đổi mật khẩu', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Hủy vé
  const handleCancelTicket = async (ticketCode: string) => {
    if (!window.confirm(`Xác nhận hủy vé [${ticketCode}]?`)) {
      return;
    }
    try {
      const res = await api.cancelTicket(ticketCode);
      showToast(res.message || 'Hủy vé thành công', 'success');
      if (selectedTicket?.ticketCode === ticketCode) {
        setSelectedTicket(null);
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy vé', 'error');
    }
  };

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTicket(null);
    };
    if (selectedTicket) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedTicket]);

  // Phân loại trạng thái vé theo ngày và trạng thái CSDL
  const todayTimestamp = new Date().setHours(0, 0, 0, 0);

  const getTicketStatusInfo = (t: UserTicket) => {
    const ticketDate = new Date(t.visitDate).setHours(0, 0, 0, 0);
    const isPast = ticketDate < todayTimestamp;

    if (t.status === 'cancelled') {
      return { label: 'Đã hủy', isDimmed: true, state: 'cancelled' };
    }
    if (t.status === 'used') {
      return { label: 'Đã sử dụng', isDimmed: true, state: 'used' };
    }
    if (isPast) {
      return { label: 'Hết hạn', isDimmed: true, state: 'expired' };
    }
    return { label: 'Còn hiệu lực', isDimmed: false, state: 'active' };
  };

  const activeTicketsCount = tickets.filter((t) => {
    const info = getTicketStatusInfo(t);
    return info.state === 'active';
  }).length;

  const expiredTicketsCount = tickets.length - activeTicketsCount;

  const filteredTickets = tickets.filter((t) => {
    const info = getTicketStatusInfo(t);
    if (ticketFilter === 'active') return info.state === 'active';
    if (ticketFilter === 'expired') return info.isDimmed;
    return true;
  });

  return (
    <div
      className="client-portal"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0A0D14',
        color: '#EDE5DF',
        fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <ClientNavbar
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="profile"
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
      />

      <main style={{ flex: 1, padding: '96px 16px 60px 16px', maxWidth: 960, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Nút quay lại */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--c-gold, #D4AF37)',
              fontSize: '0.88rem',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ</span>
          </button>
        </div>

        {!isAuthenticated ? (
          <div
            style={{
              background: 'var(--c-bg-card, #151A26)',
              border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: 480,
              margin: '40px auto'
            }}
          >
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.4rem', marginBottom: 12, color: '#FFF', fontWeight: 600 }}>
              Yêu cầu đăng nhập
            </h2>
            <p style={{ color: 'var(--c-text-muted, #94A3B8)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Vui lòng đăng nhập để xem thông tin hồ sơ và quản lý vé tham quan của bạn.
            </p>
            <button
              type="button"
              onClick={onOpenLoginModal}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'var(--c-gold, #D4AF37)',
                color: '#0A0D14',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Đăng nhập
            </button>
          </div>
        ) : (
          <>
            {/* Header thông tin người dùng tối giản */}
            <div
              style={{
                background: 'var(--c-bg-card, #151A26)',
                border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div>
                <h1 style={{ fontFamily: 'Lora, serif', fontSize: '1.3rem', margin: '0 0 4px 0', color: '#FFF', fontWeight: 600 }}>
                  {profile?.fullName || user?.username || 'Hồ sơ người dùng'}
                </h1>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  {profile?.email || user?.email}
                </div>
              </div>

              {/* Thống kê vé gọn gàng */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Vé hiệu lực
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>
                    {activeTicketsCount}
                  </div>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tổng vé
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>
                    {tickets.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh Tab điều hướng chỉ có 2 mục */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 24
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '2px solid var(--c-gold, #D4AF37)' : '2px solid transparent',
                  color: activeTab === 'profile' ? '#FFF' : '#94A3B8',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'profile' ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                Thông tin tài khoản
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'tickets' ? '2px solid var(--c-gold, #D4AF37)' : '2px solid transparent',
                  color: activeTab === 'tickets' ? '#FFF' : '#94A3B8',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === 'tickets' ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                Vé của tôi ({tickets.length})
              </button>
            </div>

            {/* TAB 1: THÔNG TIN TÀI KHOẢN & ĐỔI MẬT KHẨU */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Cập nhật thông tin */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600 }}>
                    Thông tin cá nhân
                  </h2>

                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: 5 }}>
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#64748B',
                          fontSize: '0.88rem',
                          cursor: 'not-allowed',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      style={{
                        marginTop: 6,
                        padding: '10px 18px',
                        borderRadius: '6px',
                        background: 'var(--c-gold, #D4AF37)',
                        color: '#0A0D14',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: isUpdatingProfile ? 'wait' : 'pointer'
                      }}
                    >
                      {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                    </button>
                  </form>
                </div>

                {/* Đổi mật khẩu */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600 }}>
                    Đổi mật khẩu
                  </h2>

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Mật khẩu hiện tại
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showOldPass ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Mật khẩu hiện tại"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 36px 9px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFF',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass(!showOldPass)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer'
                          }}
                        >
                          {showOldPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Mật khẩu mới (tối thiểu 6 ký tự)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mật khẩu mới"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 36px 9px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFF',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          style={{
                            position: 'absolute',
                            right: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer'
                          }}
                        >
                          {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPass}
                      style={{
                        marginTop: 6,
                        padding: '10px 18px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: isChangingPass ? 'wait' : 'pointer'
                      }}
                    >
                      {isChangingPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: VÉ CỦA TÔI */}
            {activeTab === 'tickets' && (
              <div>
                {/* Bộ lọc đơn giản */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: `Tất cả (${tickets.length})` },
                    { key: 'active', label: `Còn hiệu lực (${activeTicketsCount})` },
                    { key: 'expired', label: `Hết hạn / Đã dùng (${expiredTicketsCount})` }
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setTicketFilter(f.key as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: ticketFilter === f.key ? '1px solid var(--c-gold, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: ticketFilter === f.key ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        color: ticketFilter === f.key ? 'var(--c-gold, #D4AF37)' : '#94A3B8',
                        fontSize: '0.82rem',
                        fontWeight: ticketFilter === f.key ? 600 : 400,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                    Đang tải danh sách vé...
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div
                    style={{
                      background: 'var(--c-bg-card, #151A26)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '40px 24px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: 4 }}>
                      Không có vé nào trong mục này.
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Các vé tham quan bạn đã mua sẽ hiển thị tại đây kèm mã QR để quét vào cổng.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
                    {filteredTickets.map((tk) => {
                      const statusInfo = getTicketStatusInfo(tk);

                      return (
                        <div
                          key={tk.id || tk.ticketCode}
                          onClick={() => setSelectedTicket(tk)}
                          style={{
                            background: 'var(--c-bg-card, #151A26)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            opacity: statusInfo.isDimmed ? 0.55 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFF' }}>
                              {tk.ticketCode}
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: statusInfo.isDimmed ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(212, 175, 55, 0.4)',
                                color: statusInfo.isDimmed ? '#94A3B8' : 'var(--c-gold, #D4AF37)',
                                background: 'rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#EDE5DF' }}>
                              {tk.ticketTitle || 'Vé Tham Quan Tiêu Chuẩn'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 4 }}>
                              Ngày: {tk.visitDate} ({tk.timeSlot})
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.82rem' }}>
                            <span style={{ color: '#94A3B8' }}>{tk.quantity} vé</span>
                            <span style={{ fontWeight: 600, color: '#FFF' }}>
                              {(tk.totalAmount || 0).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal Trượt Xuống Xem Chi Tiết Vé (Clean, Chuẩn Quy Tắc, Responsive) */}
        {selectedTicket && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '40px 16px',
              overflowY: 'auto',
              boxSizing: 'border-box'
            }}
            onClick={() => setSelectedTicket(null)}
          >
            <div
              style={{
                background: '#151A26',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '24px',
                maxWidth: 420,
                width: '100%',
                position: 'relative',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                animation: 'modalSlideDown 0.25s ease-out',
                boxSizing: 'border-box'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Nút đóng modal cố định ở góc trên bên phải */}
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                aria-label="Đóng chi tiết vé"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                <X size={18} />
              </button>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Chi tiết vé tham quan
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#FFF', margin: '4px 0 0 0', fontWeight: 600 }}>
                  {selectedTicket.ticketCode}
                </h3>
              </div>

              {/* Thông tin vé dạng danh sách tối giản */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Họ tên khách:</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedTicket.userName || profile?.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Loại vé:</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedTicket.ticketTitle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Ngày tham quan:</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedTicket.visitDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Khung giờ:</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedTicket.timeSlot}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Số lượng:</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedTicket.quantity} người</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ color: '#94A3B8' }}>Tổng tiền:</span>
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{(selectedTicket.totalAmount || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6 }}>
                  <span style={{ color: '#94A3B8' }}>Trạng thái:</span>
                  <span style={{ color: getTicketStatusInfo(selectedTicket).isDimmed ? '#94A3B8' : 'var(--c-gold, #D4AF37)', fontWeight: 600 }}>
                    {getTicketStatusInfo(selectedTicket).label}
                  </span>
                </div>
              </div>

              {/* Mã QR soát vé */}
              <div style={{ textAlign: 'center', background: '#0D111A', padding: '16px', borderRadius: '10px', marginBottom: 18 }}>
                <div style={{ background: '#FFF', padding: '10px', borderRadius: '8px', display: 'inline-block' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedTicket.qrCodeData || selectedTicket.ticketCode)}&bgcolor=FFFFFF&color=0A0D14`}
                    alt={`Mã QR ${selectedTicket.ticketCode}`}
                    style={{ width: 170, height: 170, display: 'block' }}
                  />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 10 }}>
                  Quét mã này tại cổng soát vé bảo tàng
                </div>
              </div>

              {/* Nút hủy vé nếu vé còn hiệu lực */}
              {!getTicketStatusInfo(selectedTicket).isDimmed && (
                <button
                  type="button"
                  onClick={() => handleCancelTicket(selectedTicket.ticketCode)}
                  style={{
                    width: '100%',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#EF4444',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Hủy vé tham quan này
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <ClientFooter onNavigatePage={onNavigatePage} />

      <style>{`
        @keyframes modalSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
