import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { api } from '../../services/api';
import { TicketTypeItem, TicketTimeSlotItem } from '../../types';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientTicketBookingPageProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: any) => void;
  onNavigateAdmin: () => void;
  onOpenLoginModal: () => void;
  onOpenQRScanner?: () => void;
}

export const ClientTicketBookingPage: React.FC<ClientTicketBookingPageProps> = ({
  onNavigateHome,
  onNavigatePage,
  onNavigateAdmin,
  onOpenLoginModal,
  onOpenQRScanner
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TicketTimeSlotItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Form State
  const [visitDate, setVisitDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Checkout & PayOS Modal State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePaymentModal, setActivePaymentModal] = useState<any | null>(null);
  const [paymentTimeRemaining, setPaymentTimeRemaining] = useState<number>(900); // 15 phút đếm ngược
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const pollingTimerRef = useRef<any>(null);

  // Tự động điền nếu người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || user.username || '');
      if (!customerEmail) setCustomerEmail(user.email || '');
      if (!customerPhone && (user as any).phone) setCustomerPhone((user as any).phone);
    }
  }, [user]);

  // Tải danh mục loại vé & khung giờ thật từ API Backend
  const loadCatalog = async () => {
    try {
      setIsLoadingCatalog(true);
      const res = await api.getTicketCatalog();
      if (res) {
        setTicketTypes(res.ticketTypes || []);
        setTimeSlots(res.timeSlots || []);
        if (res.timeSlots && res.timeSlots.length > 0 && !selectedSlot) {
          setSelectedSlot(res.timeSlots[0].slotName);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể tải bảng giá vé', 'error');
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Xử lý tăng/giảm số lượng vé
  const handleQuantityChange = (code: string, delta: number) => {
    setTicketQuantities((prev) => {
      const current = prev[code] || 0;
      const next = Math.max(0, Math.min(20, current + delta));
      return { ...prev, [code]: next };
    });
  };

  // Tính tổng số lượng vé và tổng tiền
  const totalTicketsCount = Object.values(ticketQuantities).reduce((acc, q) => acc + q, 0);
  const totalAmount = ticketTypes.reduce((acc, t) => {
    const qty = ticketQuantities[t.code] || 0;
    return acc + t.price * qty;
  }, 0);

  // Validation form
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isPhoneValid = /^[0-9+() -]{9,15}$/.test(customerPhone.trim());
  const isNameValid = customerName.trim().length >= 2;
  const isFormComplete =
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    Boolean(visitDate) &&
    Boolean(selectedSlot) &&
    totalTicketsCount > 0;

  // Xử lý tạo đơn hàng và link thanh toán PayOS
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) {
      showToast('Vui lòng chọn ít nhất 1 vé và điền đầy đủ thông tin hợp lệ', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);

      const items = Object.entries(ticketQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([code, quantity]) => ({
          ticketTypeCode: code,
          quantity
        }));

      const res = await api.checkoutTickets({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        visitDate,
        timeSlot: selectedSlot,
        items,
        notes: notes.trim()
      });

      if (res && res.orderCode) {
        setActivePaymentModal(res);
        setPaymentTimeRemaining(900); // 15 phút
        setPaymentSuccess(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi tạo đơn hàng thanh toán', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lắng nghe đếm ngược 15 phút & Polling kiểm tra trạng thái thanh toán PayOS
  useEffect(() => {
    if (!activePaymentModal || paymentSuccess) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    // Đếm ngược từng giây
    const countdownInterval = setInterval(() => {
      setPaymentTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          showToast('Đơn hàng đã hết hạn thanh toán (15 phút). Vui lòng đặt lại vé.', 'warning');
          setActivePaymentModal(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling trạng thái đơn hàng mỗi 2.5 giây
    pollingTimerRef.current = setInterval(async () => {
      try {
        const orderInfo = await api.getOrderStatus(activePaymentModal.orderCode);
        if (orderInfo && orderInfo.status === 'paid') {
          setPaymentSuccess(true);
          clearInterval(countdownInterval);
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          showToast('Thanh toán thành công! Vé tham quan đã được phát hành.', 'success');
        } else if (orderInfo && orderInfo.status === 'expired') {
          clearInterval(countdownInterval);
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          showToast('Đơn hàng đã hết hạn thanh toán.', 'warning');
          setActivePaymentModal(null);
        }
      } catch {}
    }, 2500);

    return () => {
      clearInterval(countdownInterval);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [activePaymentModal, paymentSuccess]);

  // Format tiền tệ VNĐ
  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Format thời gian đếm ngược (MM:SS)
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const minSelectableDate = new Date().toISOString().split('T')[0];

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
        activeSection="booking"
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
      />

      <main className="client-container" style={{ flex: 1, paddingTop: '108px', paddingBottom: '64px' }}>
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

        {/* Tiêu đề trang đặt vé */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '1.75rem',
              color: '#FFF',
              fontWeight: 600,
              margin: '0 0 6px 0'
            }}
          >
            Đặt Vé Tham Quan Bảo Tàng
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
            Chọn ngày tham quan, số lượng vé và hoàn tất thanh toán trực tuyến bảo mật qua cổng PayOS (VietQR).
          </p>
        </div>

        {isLoadingCatalog ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--c-gold, #D4AF37)' }} />
            <span>Đang tải bảng giá vé và lịch tham quan...</span>
          </div>
        ) : (
          <form onSubmit={handleCheckout}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
                gap: 24,
                alignItems: 'flex-start'
              }}
            >
              {/* CỘT TRÁI: CHỌN LỊCH, CHỌN LOẠI VÉ VÀ NHẬP THÔNG TIN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Lịch tham quan & Khung giờ */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                    <span>1. Lịch tham quan & Khung giờ</span>
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 6 }}>
                        Ngày tham quan <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="date"
                        min={minSelectableDate}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          colorScheme: 'dark',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 6 }}>
                        Khung giờ tham quan <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: '#1c1917',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#f8fafc',
                          fontSize: '0.88rem',
                          colorScheme: 'dark',
                          boxSizing: 'border-box'
                        }}
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot.id} value={slot.slotName} style={{ background: '#1c1917', color: '#f8fafc' }}>
                            {slot.slotName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Chọn các loại vé tham quan */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={18} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                    <span>2. Chọn loại vé tham quan</span>
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {ticketTypes.map((type) => {
                      const qty = ticketQuantities[type.code] || 0;

                      return (
                        <div
                          key={type.id || type.code}
                          style={{
                            background: qty > 0 ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                            border: qty > 0 ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 12,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontWeight: 600, color: '#FFF', fontSize: '0.95rem' }}>
                              {type.name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: 3 }}>
                              {type.description}
                            </div>
                            {type.benefits && type.benefits.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {type.benefits.map((b, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      borderRadius: 4,
                                      background: 'rgba(255, 255, 255, 0.05)',
                                      color: '#CBD5E1'
                                    }}
                                  >
                                    • {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: 'var(--c-gold, #D4AF37)', fontSize: '1rem' }}>
                                {formatVND(type.price)}
                              </div>
                              {type.originalPrice && type.originalPrice > type.price && (
                                <div style={{ fontSize: '0.78rem', color: '#64748B', textDecoration: 'line-through' }}>
                                  {formatVND(type.originalPrice)}
                                </div>
                              )}
                            </div>

                            {/* Bộ tăng giảm số lượng */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(type.code, -1)}
                                disabled={qty === 0}
                                style={{
                                  padding: '6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: qty > 0 ? '#FFF' : '#64748B',
                                  cursor: qty > 0 ? 'pointer' : 'not-allowed',
                                  fontSize: '1rem',
                                  fontWeight: 600
                                }}
                              >
                                −
                              </button>
                              <span style={{ minWidth: 28, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600, color: '#FFF' }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(type.code, 1)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFF',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  fontWeight: 600
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Thông tin người nhận vé */}
                <div
                  style={{
                    background: 'var(--c-bg-card, #151A26)',
                    border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '1rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                    <span>3. Thông tin người nhận vé</span>
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                        Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nhập họ và tên người đại diện nhận vé"
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: isNameValid ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                          Số điện thoại <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ví dụ: 0977950350"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: customerPhone && !isPhoneValid ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFF',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: 5 }}>
                          Địa chỉ Email (Nhận vé & mã QR) <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: customerEmail && !isEmailValid ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#FFF',
                            fontSize: '0.88rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#94A3B8', marginBottom: 5 }}>
                        Ghi chú yêu cầu đặc biệt (Không bắt buộc)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Yêu cầu hỗ trợ xe lăn, hướng dẫn tiếng Anh..."
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG VÀ NÚT THANH TOÁN PAYOS */}
              <div
                style={{
                  background: 'var(--c-bg-card, #151A26)',
                  border: '1px solid var(--c-border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  padding: '24px',
                  position: 'sticky',
                  top: 100
                }}
              >
                <h2 style={{ fontSize: '1.05rem', color: '#FFF', margin: '0 0 16px 0', fontWeight: 600 }}>
                  Tóm tắt đơn hàng
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
                    <span style={{ color: '#94A3B8' }}>Ngày tham quan:</span>
                    <span style={{ color: '#FFF', fontWeight: 500 }}>{visitDate}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 8 }}>
                    <span style={{ color: '#94A3B8' }}>Khung giờ:</span>
                    <span style={{ color: '#FFF', fontWeight: 500 }}>{selectedSlot}</span>
                  </div>

                  {/* Chi tiết từng loại vé đã chọn */}
                  {totalTicketsCount === 0 ? (
                    <div style={{ padding: '14px 0', color: '#94A3B8', textAlign: 'center', fontSize: '0.82rem' }}>
                      Chưa chọn loại vé nào.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 0' }}>
                      {ticketTypes.map((type) => {
                        const qty = ticketQuantities[type.code] || 0;
                        if (qty === 0) return null;
                        return (
                          <div key={type.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#CBD5E1' }}>
                              {type.name} (x{qty})
                            </span>
                            <span style={{ color: '#FFF', fontWeight: 600 }}>
                              {formatVND(type.price * qty)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 14, marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ color: '#CBD5E1', fontSize: '0.95rem', fontWeight: 600 }}>Tổng tiền:</span>
                      <span style={{ color: 'var(--c-gold, #D4AF37)', fontSize: '1.35rem', fontWeight: 700 }}>
                        {formatVND(totalAmount)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4 }}>
                      Tổng cộng: {totalTicketsCount} vé tham quan
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B', marginTop: 6 }}>
                    <ShieldCheck size={14} style={{ color: '#22C55E' }} />
                    <span>Cổng thanh toán tự động PayOS • Quét mã VietQR chuyển khoản</span>
                  </div>

                  {/* Nút thanh toán */}
                  <button
                    type="submit"
                    disabled={!isFormComplete || isSubmitting}
                    style={{
                      width: '100%',
                      marginTop: 16,
                      padding: '12px 18px',
                      borderRadius: '8px',
                      background: isFormComplete ? 'var(--c-gold, #D4AF37)' : 'rgba(255, 255, 255, 0.08)',
                      color: isFormComplete ? '#0A0D14' : '#64748B',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      cursor: isFormComplete && !isSubmitting ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>Đang khởi tạo mã thanh toán...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Thanh toán với PayOS (VietQR)</span>
                      </>
                    )}
                  </button>

                  {!isFormComplete && (
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
                      Vui lòng chọn ít nhất 1 vé và điền đầy đủ thông tin để tiến hành thanh toán.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* MODAL THANH TOÁN VIETQR PAYOS TRỰC TIẾP TRÊN TRANG KÈM POLLING TỰ ĐỘNG */}
        {activePaymentModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px'
            }}
          >
            <div
              style={{
                background: '#151A26',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '14px',
                padding: '24px',
                maxWidth: 440,
                width: '100%',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                textAlign: 'center'
              }}
            >
              {/* Nút đóng modal */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn đóng cửa sổ thanh toán? Đơn hàng vẫn được lưu và chờ thanh toán trong 15 phút.')) {
                    setActivePaymentModal(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={18} />
              </button>

              {paymentSuccess ? (
                /* GIAO DIỆN THANH TOÁN THÀNH CÔNG */
                <div style={{ padding: '20px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#FFF', fontWeight: 600, margin: '0 0 8px 0' }}>
                    Thanh toán thành công!
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 20 }}>
                    Đơn hàng #{activePaymentModal.orderCode} đã hoàn tất. Vé tham quan kèm mã QR đã được gửi về email <strong>{customerEmail}</strong>.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePaymentModal(null);
                        onNavigatePage('profile');
                      }}
                      style={{
                        padding: '11px 20px',
                        borderRadius: '6px',
                        background: 'var(--c-gold, #D4AF37)',
                        color: '#0A0D14',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      Xem vé của tôi ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePaymentModal(null);
                        onNavigateHome();
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94A3B8',
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      Về trang chủ
                    </button>
                  </div>
                </div>
              ) : (
                /* GIAO DIỆN QUÉT MÃ VIETQR PAYOS */
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Đơn hàng #{activePaymentModal.orderCode}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#FFF', fontWeight: 600, margin: '4px 0 16px 0' }}>
                    Quét mã VietQR để thanh toán
                  </h3>

                  {/* Mã QR VietQR PayOS */}
                  <div
                    style={{
                      background: '#FFF',
                      padding: 12,
                      borderRadius: 10,
                      display: 'inline-block',
                      margin: '0 auto 14px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                    }}
                  >
                    <img
                      src={
                        activePaymentModal.qrCode
                          ? activePaymentModal.qrCode
                          : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                              activePaymentModal.checkoutUrl || ''
                            )}`
                      }
                      alt="VietQR PayOS"
                      style={{ width: 190, height: 190, display: 'block', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Thông tin chuyển khoản chi tiết */}
                  <div style={{ background: '#0D111A', borderRadius: 8, padding: '12px 16px', marginBottom: 14, textAlign: 'left', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                      <span style={{ color: '#94A3B8' }}>Số tiền:</span>
                      <span style={{ color: 'var(--c-gold, #D4AF37)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {formatVND(activePaymentModal.totalAmount)}
                      </span>
                    </div>
                    {activePaymentModal.accountNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                        <span style={{ color: '#94A3B8' }}>Số tài khoản:</span>
                        <span style={{ color: '#FFF', fontFamily: 'monospace', fontWeight: 600 }}>
                          {activePaymentModal.accountNumber}
                        </span>
                      </div>
                    )}
                    {activePaymentModal.accountName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                        <span style={{ color: '#94A3B8' }}>Chủ tài khoản:</span>
                        <span style={{ color: '#FFF', fontWeight: 500 }}>{activePaymentModal.accountName}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94A3B8' }}>Nội dung:</span>
                      <span style={{ color: '#FFF', fontFamily: 'monospace', fontWeight: 600 }}>
                        Ve tham quan {activePaymentModal.orderCode}
                      </span>
                    </div>
                  </div>

                  {/* Đồng hồ đếm ngược 15 phút & Trạng thái chờ */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#94A3B8', fontSize: '0.82rem', marginBottom: 14 }}>
                    <Clock size={14} style={{ color: paymentTimeRemaining < 120 ? '#EF4444' : 'var(--c-gold, #D4AF37)' }} />
                    <span>Thời gian giữ vé: </span>
                    <strong style={{ color: paymentTimeRemaining < 120 ? '#EF4444' : '#FFF' }}>
                      {formatCountdown(paymentTimeRemaining)}
                    </strong>
                    <span>(Hệ thống tự động duyệt)</span>
                  </div>

                  {/* Nút mở cổng PayOS ngoài */}
                  {activePaymentModal.checkoutUrl && (
                    <a
                      href={activePaymentModal.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        color: 'var(--c-gold, #D4AF37)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        padding: '6px 12px'
                      }}
                    >
                      <span>Mở trang thanh toán PayOS</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ClientFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
