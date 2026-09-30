import React, { useState, useEffect } from 'react';
import {
  User,
  Ticket,
  Calendar,
  Clock,
  CreditCard,
  QrCode,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useToast } from '../../components/Toast';
import { api } from '../../services/api';
import { UserProfile, UserTicket, BookTicketPayload } from '../../types';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface UserProfilePageProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide' | 'profile') => void;
  onNavigateAdmin: () => void;
  onOpenLoginModal: () => void;
  onOpenQRScanner?: () => void;
  initialTab?: 'profile' | 'tickets' | 'booking';
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

  const [activeTab, setActiveTab] = useState<'profile' | 'tickets' | 'booking'>(initialTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketFilter, setTicketFilter] = useState<'all' | 'paid' | 'used' | 'cancelled'>('all');
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<UserTicket | null>(null);

  // Form Profile State
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  // Form Change Password State
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  // Form Booking Ticket State
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingType, setBookingType] = useState<string>('standard');
  const [bookingTitle, setBookingTitle] = useState<string>('Vé Người Lớn Tiêu Chuẩn');
  const [bookingPrice, setBookingPrice] = useState<number>(30000);
  const [bookingQty, setBookingQty] = useState<number>(1);
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string>('08:00 - 11:30');
  const [bookingPaymentMethod, setBookingPaymentMethod] = useState<string>('VNPay / Chuyển khoản QR');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [bookingVisitorName, setBookingVisitorName] = useState<string>('');
  const [bookingVisitorPhone, setBookingVisitorPhone] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Tải dữ liệu thật 100% từ Backend (PostgreSQL Primary + MongoDB Mirror)
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
        setAvatar(profileRes.avatar || '');
        setBookingVisitorName(profileRes.fullName || '');
        setBookingVisitorPhone(profileRes.phone || '');
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

  // Cập nhật thông tin cá nhân
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
        phone: phone.trim(),
        avatar: avatar.trim()
      });
      showToast(res.message || 'Cập nhật hồ sơ thành công', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật hồ sơ', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Đổi mật khẩu
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

  // Đặt vé tham quan mới (Thao tác CSDL thật 100%)
  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      showToast('Vui lòng chọn ngày tham quan', 'error');
      return;
    }

    try {
      setIsSubmittingBooking(true);
      const payload: BookTicketPayload = {
        ticketType: bookingType,
        ticketTitle: bookingTitle,
        quantity: bookingQty,
        unitPrice: bookingPrice,
        visitDate: bookingDate,
        timeSlot: bookingTimeSlot,
        paymentMethod: bookingPaymentMethod,
        notes: bookingNotes,
        userName: bookingVisitorName || fullName || user?.username,
        userPhone: bookingVisitorPhone || phone
      };

      const res = await api.bookTicket(payload);
      showToast(res.message || 'Đặt vé tham quan thành công!', 'success');
      // Chuyển sang tab Vé để chiêm ngưỡng vé điện tử vừa tạo
      setActiveTab('tickets');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đặt vé tham quan', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Hủy vé
  const handleCancelTicket = async (ticketCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy vé tham quan [${ticketCode}] không?`)) {
      return;
    }
    try {
      const res = await api.cancelTicket(ticketCode);
      showToast(res.message || 'Hủy vé thành công', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy vé này', 'error');
    }
  };

  // Lựa chọn loại vé
  const ticketOptions = [
    {
      type: 'standard',
      title: 'Vé Người Lớn Tiêu Chuẩn',
      price: 30000,
      desc: 'Áp dụng cho khách tham quan từ 16 tuổi trở lên.'
    },
    {
      type: 'student',
      title: 'Vé Sinh Viên / Học Sinh',
      price: 15000,
      desc: 'Ưu đãi 50% khi xuất trình thẻ học sinh, sinh viên tại cổng soát vé.'
    },
    {
      type: 'child',
      title: 'Vé Trẻ Em / Người Cao Tuổi',
      price: 0,
      desc: 'Miễn phí cho trẻ em dưới 6 tuổi, người cao tuổi trên 60 tuổi và người khuyết tật.'
    },
    {
      type: 'tour360_combo',
      title: 'Vé Tour 360 & Audio Thuyết Minh',
      price: 50000,
      desc: 'Bao gồm vé vào cổng + tai nghe thuyết minh thông minh và trải nghiệm không gian số.'
    }
  ];

  const handleSelectTicketType = (opt: typeof ticketOptions[0]) => {
    setBookingType(opt.type);
    setBookingTitle(opt.title);
    setBookingPrice(opt.price);
  };

  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  return (
    <div className="client-portal" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0D14', color: '#EAE6E1' }}>
      {/* Header Điều Hướng */}
      <ClientNavbar
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="profile"
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '100px 16px 60px 16px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
        {/* Nút quay lại trang chủ & Tiêu đề */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              color: 'var(--c-gold, #D4AF37)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '6px 0',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} />
            <span>{t('profile.backHome', 'Quay lại Cổng Bảo Tàng')}</span>
          </button>

          {profile?.role === 'admin' && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--c-gold, #D4AF37)',
                color: 'var(--c-gold, #D4AF37)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <Shield size={14} />
              <span>{t('profile.goToAdmin', 'Vào Bảng Quản Trị')}</span>
            </button>
          )}
        </div>

        {/* Chưa đăng nhập View */}
        {!isAuthenticated ? (
          <div
            style={{
              background: 'var(--c-bg-card, #151A26)',
              border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              maxWidth: 540,
              margin: '40px auto'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: 'var(--c-gold, #D4AF37)'
              }}
            >
              <Lock size={30} />
            </div>
            <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.5rem', marginBottom: 12, color: '#FFF' }}>
              {t('profile.requireLoginTitle', 'Yêu cầu đăng nhập tài khoản')}
            </h2>
            <p style={{ color: 'var(--c-text-muted, #94A3B8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
              {t('profile.requireLoginDesc', 'Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân và quản lý vé tham quan bảo tàng của bạn.')}
            </p>
            <button
              type="button"
              onClick={onOpenLoginModal}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)',
                color: '#0A0D14',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
              }}
            >
              {t('profile.loginBtn', 'Đăng nhập ngay')}
            </button>
          </div>
        ) : (
          <>
            {/* Header User Banner */}
            <div
              style={{
                background: 'var(--c-bg-card, #151A26)',
                border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, minWidth: 260 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '2px solid var(--c-gold, #D4AF37)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--c-gold, #D4AF37)',
                    overflow: 'hidden'
                  }}
                >
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{(profile?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'Lora, serif', fontSize: '1.35rem', margin: 0, fontWeight: 700, color: '#FFF' }}>
                      {profile?.fullName || user?.username || 'Khách tham quan'}
                    </h1>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: profile?.role === 'admin' ? 'rgba(212, 175, 55, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                        color: profile?.role === 'admin' ? '#D4AF37' : '#38BDF8',
                        border: `1px solid ${profile?.role === 'admin' ? 'rgba(212, 175, 55, 0.35)' : 'rgba(56, 189, 248, 0.3)'}`
                      }}
                    >
                      {profile?.role === 'admin' ? 'Quản trị viên' : 'Khách tham quan'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, color: 'var(--c-text-muted, #94A3B8)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={14} /> {profile?.email || user?.email}
                    </span>
                    {profile?.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={14} /> {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Thống kê nhanh */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#D4AF37' }}>{profile?.stats?.totalTickets || tickets.length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t('profile.totalTickets', 'Tổng vé đã đặt')}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981' }}>{profile?.stats?.activeTickets ?? tickets.filter(t => t.status === 'paid').length}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t('profile.activeTickets', 'Vé có hiệu lực')}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF' }}>
                    {((profile?.stats?.totalSpent || 0)).toLocaleString('vi-VN')} đ
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{t('profile.totalSpent', 'Chi tiêu')}</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: 28,
                overflowX: 'auto',
                paddingBottom: 4
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: '10px 10px 0 0',
                  background: activeTab === 'profile' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--c-gold, #D4AF37)' : 'var(--c-text-muted, #94A3B8)',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '2px solid var(--c-gold, #D4AF37)' : '2px solid transparent',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <User size={16} />
                <span>{t('profile.tabProfile', 'Thông tin cá nhân')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: '10px 10px 0 0',
                  background: activeTab === 'tickets' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: activeTab === 'tickets' ? 'var(--c-gold, #D4AF37)' : 'var(--c-text-muted, #94A3B8)',
                  border: 'none',
                  borderBottom: activeTab === 'tickets' ? '2px solid var(--c-gold, #D4AF37)' : '2px solid transparent',
                  fontWeight: activeTab === 'tickets' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Ticket size={16} />
                <span>{t('profile.tabTickets', 'Vé tham quan của tôi')} ({tickets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('booking')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: '10px 10px 0 0',
                  background: activeTab === 'booking' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  color: activeTab === 'booking' ? 'var(--c-gold, #D4AF37)' : 'var(--c-text-muted, #94A3B8)',
                  border: 'none',
                  borderBottom: activeTab === 'booking' ? '2px solid var(--c-gold, #D4AF37)' : '2px solid transparent',
                  fontWeight: activeTab === 'booking' ? 700 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} />
                <span>{t('profile.tabBooking', 'Đặt vé tham quan mới')}</span>
              </button>
            </div>

            {/* TAB 1: THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU */}
            {activeTab === 'profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {/* Cập nhật thông tin hồ sơ */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem', color: '#FFF', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                    <span>{t('profile.editInfoTitle', 'Cập nhật thông tin tài khoản')}</span>
                  </h3>

                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.emailLabel', 'Địa chỉ Email (Cố định)')}
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#64748B',
                          fontSize: '0.9rem',
                          cursor: 'not-allowed',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.fullNameLabel', 'Họ và tên')} <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên của bạn"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.phoneLabel', 'Số điện thoại')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0901234567"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.avatarLabel', 'Đường dẫn ảnh đại diện (URL)')}
                      </label>
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      style={{
                        marginTop: 8,
                        padding: '11px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)',
                        color: '#0A0D14',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: isUpdatingProfile ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {isUpdatingProfile ? <RefreshCw size={16} className="spin-animation" /> : <CheckCircle2 size={16} />}
                      <span>{isUpdatingProfile ? t('profile.saving', 'Đang lưu...') : t('profile.saveChanges', 'Lưu thay đổi')}</span>
                    </button>
                  </form>
                </div>

                {/* Đổi mật khẩu tài khoản */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem', color: '#FFF', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Key size={18} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                    <span>{t('profile.changePasswordTitle', 'Bảo mật & Đổi mật khẩu')}</span>
                  </h3>

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.oldPassLabel', 'Mật khẩu hiện tại')} <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showOldPass ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 38px 10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFF',
                            fontSize: '0.9rem',
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
                          {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.newPassLabel', 'Mật khẩu mới')} <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mật khẩu tối thiểu 6 ký tự"
                          required
                          style={{
                            width: '100%',
                            padding: '10px 38px 10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFF',
                            fontSize: '0.9rem',
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
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        {t('profile.confirmPassLabel', 'Xác nhận mật khẩu mới')} <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPass}
                      style={{
                        marginTop: 8,
                        padding: '11px 20px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: isChangingPass ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      {isChangingPass ? <RefreshCw size={16} className="spin-animation" /> : <Lock size={16} />}
                      <span>{isChangingPass ? t('profile.changingPass', 'Đang cập nhật...') : t('profile.changePassBtn', 'Đổi mật khẩu')}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: VÉ THAM QUAN CỦA TÔI */}
            {activeTab === 'tickets' && (
              <div>
                {/* Bộ lọc trạng thái vé */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { key: 'all', label: 'Tất cả vé' },
                      { key: 'paid', label: 'Có hiệu lực' },
                      { key: 'used', label: 'Đã sử dụng' },
                      { key: 'cancelled', label: 'Đã hủy' }
                    ].map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setTicketFilter(f.key as any)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: ticketFilter === f.key ? '1px solid var(--c-gold, #D4AF37)' : '1px solid rgba(255,255,255,0.08)',
                          background: ticketFilter === f.key ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: ticketFilter === f.key ? 'var(--c-gold, #D4AF37)' : '#94A3B8',
                          fontSize: '0.82rem',
                          fontWeight: ticketFilter === f.key ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('booking')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)',
                      color: '#0A0D14',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={15} />
                    <span>{t('profile.newBookingBtn', 'Đặt thêm vé')}</span>
                  </button>
                </div>

                {/* Danh sách vé tham quan */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                    <RefreshCw size={28} className="spin-animation" style={{ color: 'var(--c-gold, #D4AF37)', margin: '0 auto 12px auto' }} />
                    <div>{t('profile.loadingTickets', 'Đang tải danh sách vé thực tế từ CSDL...')}</div>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div
                    style={{
                      background: 'var(--c-bg-card, #151A26)',
                      border: '1px dashed rgba(255, 255, 255, 0.12)',
                      borderRadius: '16px',
                      padding: '48px 24px',
                      textAlign: 'center'
                    }}
                  >
                    <Ticket size={40} style={{ color: 'rgba(212, 175, 55, 0.4)', margin: '0 auto 14px auto' }} />
                    <h4 style={{ fontFamily: 'Lora, serif', fontSize: '1.2rem', color: '#FFF', margin: '0 0 8px 0' }}>
                      {t('profile.emptyTicketTitle', 'Chưa có vé tham quan nào')}
                    </h4>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: 440, margin: '0 auto 20px auto' }}>
                      {t('profile.emptyTicketDesc', 'Bạn chưa có lượt đặt vé nào phù hợp với bộ lọc. Hãy đặt vé ngay để trải nghiệm bảo tàng.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('booking')}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '8px',
                        background: 'var(--c-gold, #D4AF37)',
                        color: '#0A0D14',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {t('profile.bookNowBtn', 'Đặt vé tham quan ngay')}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                    {filteredTickets.map((tk) => {
                      const isExpired = new Date(tk.visitDate).getTime() < new Date().setHours(0, 0, 0, 0);
                      const isUsed = tk.status === 'used';
                      const isCancelled = tk.status === 'cancelled';
                      const isActive = tk.status === 'paid' && !isExpired;

                      // Trực quan mã QR Code thật
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(tk.qrCodeData || tk.ticketCode)}&bgcolor=FFFFFF&color=0A0D14`;

                      return (
                        <div
                          key={tk.id || tk.ticketCode}
                          style={{
                            background: 'var(--c-bg-card, #151A26)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            position: 'relative'
                          }}
                        >
                          {/* Dải đầu vé di sản */}
                          <div
                            style={{
                              padding: '14px 18px',
                              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#D4AF37', fontWeight: 700, display: 'block' }}>
                                BẢO TÀNG LỊCH SỬ TP.HCM
                              </span>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF', letterSpacing: '0.5px' }}>
                                {tk.ticketCode}
                              </span>
                            </div>

                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: isCancelled
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : isUsed
                                  ? 'rgba(148, 163, 184, 0.15)'
                                  : 'rgba(16, 185, 129, 0.15)',
                                color: isCancelled ? '#EF4444' : isUsed ? '#94A3B8' : '#10B981',
                                border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.3)' : isUsed ? 'rgba(148, 163, 184, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                              }}
                            >
                              {isCancelled ? 'Đã hủy' : isUsed ? 'Đã dùng' : 'Có hiệu lực'}
                            </span>
                          </div>

                          {/* Nội dung chi tiết vé */}
                          <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF', marginBottom: 2 }}>
                                {tk.ticketTitle || 'Vé Tham Quan Tiêu Chuẩn'}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                                Người đăng ký: <strong style={{ color: '#E2E8F0' }}>{tk.userName || tk.userEmail}</strong>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px' }}>
                              <div>
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={12} /> Ngày tham quan
                                </span>
                                <strong style={{ fontSize: '0.85rem', color: '#FFF' }}>{tk.visitDate}</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={12} /> Khung giờ
                                </span>
                                <strong style={{ fontSize: '0.85rem', color: '#FFF' }}>{tk.timeSlot}</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Ticket size={12} /> Số lượng vé
                                </span>
                                <strong style={{ fontSize: '0.85rem', color: '#FFF' }}>{tk.quantity} người</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <CreditCard size={12} /> Tổng thanh toán
                                </span>
                                <strong style={{ fontSize: '0.85rem', color: '#D4AF37' }}>
                                  {(tk.totalAmount || 0).toLocaleString('vi-VN')} đ
                                </strong>
                              </div>
                            </div>

                            {/* Khu vực mã QR Code soát vé */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', marginTop: 4 }}>
                              <img
                                src={qrUrl}
                                alt={`QR Code ${tk.ticketCode}`}
                                style={{ width: 68, height: 68, borderRadius: '6px', background: '#FFF', padding: 4 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF' }}>
                                  Mã QR vào cổng
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>
                                  Xuất trình mã này cho nhân viên bảo tàng tại cổng soát vé.
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketForQR(tk)}
                                  style={{
                                    marginTop: 6,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--c-gold, #D4AF37)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <QrCode size={12} />
                                  <span>Phóng to mã QR</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Thao tác vé */}
                          {isActive && (
                            <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleCancelTicket(tk.ticketCode)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  color: '#EF4444',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                Hủy vé này
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ĐẶT VÉ THAM QUAN MỚI (CSDL THẬT 100%) */}
            {activeTab === 'booking' && (
              <div
                style={{
                  background: 'var(--c-bg-card, #151A26)',
                  border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '16px',
                  padding: '28px',
                  maxWidth: 820,
                  margin: '0 auto'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--c-gold, #D4AF37)'
                    }}
                  >
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.25rem', color: '#FFF', margin: 0 }}>
                      {t('profile.bookingHeader', 'Đặt vé tham quan Bảo tàng Lịch sử TP.HCM')}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
                      Dữ liệu vé điện tử được lưu trữ thật trên hệ thống PostgreSQL & MongoDB.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBookTicket} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Chọn loại vé */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#CBD5E1', marginBottom: 10, fontWeight: 700 }}>
                      1. Chọn loại vé tham quan:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                      {ticketOptions.map((opt) => {
                        const isSelected = bookingType === opt.type;
                        return (
                          <div
                            key={opt.type}
                            onClick={() => handleSelectTicketType(opt)}
                            style={{
                              padding: '14px',
                              borderRadius: '12px',
                              background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                              border: isSelected ? '2px solid var(--c-gold, #D4AF37)' : '1px solid rgba(255, 255, 255, 0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? '#D4AF37' : '#FFF' }}>
                                {opt.title}
                              </span>
                              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#D4AF37' }}>
                                {opt.price === 0 ? 'Miễn phí' : `${opt.price.toLocaleString('vi-VN')} đ`}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4 }}>
                              {opt.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ngày & Khung giờ */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        2. Chọn ngày tham quan: <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        3. Chọn khung giờ tham quan: <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: '#1A2130',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="08:00 - 11:30">Buổi sáng: 08:00 - 11:30</option>
                        <option value="13:30 - 17:00">Buổi chiều: 13:30 - 17:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Số lượng vé */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                      4. Số lượng khách tham quan:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                          type="button"
                          onClick={() => setBookingQty((prev) => Math.max(1, prev - 1))}
                          style={{
                            padding: '8px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            border: 'none',
                            color: '#FFF',
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 18px', fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
                          {bookingQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingQty((prev) => Math.min(10, prev + 1))}
                          style={{
                            padding: '8px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            border: 'none',
                            color: '#FFF',
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                        (Tối đa 10 vé / lượt đặt)
                      </span>
                    </div>
                  </div>

                  {/* Thông tin liên hệ người nhận vé */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        Họ và tên người nhận vé:
                      </label>
                      <input
                        type="text"
                        value={bookingVisitorName}
                        onChange={(e) => setBookingVisitorName(e.target.value)}
                        placeholder="Họ tên người nhận vé"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                        Số điện thoại liên hệ:
                      </label>
                      <input
                        type="tel"
                        value={bookingVisitorPhone}
                        onChange={(e) => setBookingVisitorPhone(e.target.value)}
                        placeholder="Số điện thoại nhận tin xác nhận"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phương thức thanh toán */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: 6, fontWeight: 600 }}>
                      5. Phương thức thanh toán:
                    </label>
                    <select
                      value={bookingPaymentMethod}
                      onChange={(e) => setBookingPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#1A2130',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#FFF',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="VNPay / Chuyển khoản QR">Cổng thanh toán VNPay (QR Code tự động)</option>
                      <option value="Thẻ tín dụng / Thẻ nội địa">Thẻ tín dụng / Thẻ ghi nợ (Visa, Master, ATM)</option>
                      <option value="Ví MoMo">Ví điện tử MoMo</option>
                      <option value="Thanh toán tại quầy vé">Thanh toán tiền mặt trực tiếp tại quầy bảo tàng</option>
                    </select>
                  </div>

                  {/* Bảng tổng kết số tiền */}
                  <div
                    style={{
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#94A3B8', display: 'block' }}>
                        Tạm tính ({bookingQty} x {bookingPrice.toLocaleString('vi-VN')} đ):
                      </span>
                      <strong style={{ fontSize: '1.25rem', color: '#D4AF37' }}>
                        {(bookingQty * bookingPrice).toLocaleString('vi-VN')} VNĐ
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      style={{
                        padding: '12px 28px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)',
                        color: '#0A0D14',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: isSubmittingBooking ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)'
                      }}
                    >
                      {isSubmittingBooking ? <RefreshCw size={16} className="spin-animation" /> : <CheckCircle2 size={16} />}
                      <span>{isSubmittingBooking ? 'Đang xử lý đặt vé...' : 'Xác nhận & Hoàn tất đặt vé'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* Modal Phóng To Mã QR */}
        {selectedTicketForQR && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}
            onClick={() => setSelectedTicketForQR(null)}
          >
            <div
              style={{
                background: '#151A26',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase' }}>
                  Vé Điện Tử Bảo Tàng
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTicketForQR(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', marginBottom: 4 }}>
                {selectedTicketForQR.ticketCode}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 18 }}>
                {selectedTicketForQR.ticketTitle} • {selectedTicketForQR.quantity} người
              </div>

              <div style={{ background: '#FFF', padding: 14, borderRadius: '12px', display: 'inline-block', margin: '0 auto 16px auto' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(selectedTicketForQR.qrCodeData || selectedTicketForQR.ticketCode)}&bgcolor=FFFFFF&color=0A0D14`}
                  alt={`QR ${selectedTicketForQR.ticketCode}`}
                  style={{ width: 220, height: 220, display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.5, background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                Xuất trình mã này tại <strong>Cổng Soát Vé Bảo tàng Lịch sử TP.HCM</strong> vào ngày <strong>{selectedTicketForQR.visitDate}</strong> ({selectedTicketForQR.timeSlot}).
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Chân Trang */}
      <ClientFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
