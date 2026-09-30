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

  // Dữ liệu đặt vé
  const [visitDate, setVisitDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  // Thông tin liên hệ
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Checkout & PayOS Modal State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePaymentModal, setActivePaymentModal] = useState<any | null>(null);
  const [paymentTimeRemaining, setPaymentTimeRemaining] = useState<number>(900); // 15 phút
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
      if (res && res.ticketTypes) {
        setTicketTypes(res.ticketTypes);
      }
      if (res && res.timeSlots) {
        setTimeSlots(res.timeSlots);
        if (res.timeSlots.length > 0 && !selectedSlot) {
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

  const handleQuantityChange = (code: string, delta: number) => {
    setTicketQuantities((prev) => {
      const current = prev[code] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [code]: next };
    });
  };

  // Tính tổng số vé & tổng tiền
  const totalTicketsCount = Object.values(ticketQuantities).reduce((acc, q) => acc + q, 0);
  const totalAmount = ticketTypes.reduce((acc, type) => {
    const qty = ticketQuantities[type.code] || 0;
    return acc + (type.price || 0) * qty;
  }, 0);

  // Kiểm tra tính hợp lệ của biểu mẫu
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim());
  const isPhoneValid = /^[0-9]{9,12}$/.test(customerPhone.trim().replace(/\s+/g, ''));
  const isNameValid = customerName.trim().length >= 2;
  const isFormComplete =
    totalTicketsCount > 0 &&
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    Boolean(visitDate) &&
    Boolean(selectedSlot);

  // Xử lý tạo đơn hàng PayOS
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete) {
      if (totalTicketsCount === 0) {
        showToast('Vui lòng chọn ít nhất 1 vé tham quan', 'warning');
      } else if (!isNameValid) {
        showToast('Vui lòng nhập họ và tên hợp lệ', 'warning');
      } else if (!isPhoneValid) {
        showToast('Vui lòng nhập số điện thoại hợp lệ (9 - 12 chữ số)', 'warning');
      } else if (!isEmailValid) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ để nhận vé', 'warning');
      }
      return;
    }

    const items = Object.entries(ticketQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketTypeCode, quantity]) => ({
        ticketTypeCode,
        quantity
      }));

    try {
      setIsSubmitting(true);
      const res = await api.checkoutTickets({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        visitDate,
        timeSlot: selectedSlot,
        items
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

  const formatVND = (num: number = 0) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

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
        color: '#E2E8F0',
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

      <main style={{ flex: 1, paddingTop: '96px', paddingBottom: '56px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
          {/* Nút quay lại */}
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.84rem',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              <ArrowLeft size={14} />
              <span>Quay lại trang chủ</span>
            </button>
          </div>

          {/* Tiêu đề ngắn gọn, hành chính chuẩn mực */}
          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontSize: '1.4rem',
                color: '#F8FAFC',
                fontWeight: 600,
                margin: '0 0 4px 0'
              }}
            >
              Đặt vé tham quan
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.84rem', margin: 0 }}>
              Hệ thống bán vé điện tử chính thức của Bảo tàng Lịch sử TP. Hồ Chí Minh.
            </p>
          </div>

          {isLoadingCatalog ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
              <RefreshCw size={20} className="spin" style={{ margin: '0 auto 10px', display: 'block', color: 'var(--c-gold, #D4AF37)' }} />
              <span style={{ fontSize: '0.86rem' }}>Đang tải bảng giá vé và khung giờ...</span>
            </div>
          ) : (
            <form onSubmit={handleCheckout}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
                  gap: 20,
                  alignItems: 'flex-start'
                }}
              >
                {/* CỘT TRÁI: CHỌN LỊCH, VÉ VÀ THÔNG TIN KHÁCH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 1. LỊCH THAM QUAN & KHUNG GIỜ (GỌN GÀNG TRONG 1 KHỐI) */}
                  <div
                    style={{
                      background: '#131824',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={15} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                      <span>Thời gian tham quan</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', color: '#94A3B8', marginBottom: 5 }}>
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
                            padding: '8px 10px',
                            borderRadius: '5px',
                            background: '#0D111A',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#F8FAFC',
                            fontSize: '0.84rem',
                            colorScheme: 'dark',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', color: '#94A3B8', marginBottom: 5 }}>
                          Khung giờ đón tiếp <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <select
                          value={selectedSlot}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            background: '#0D111A',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#F8FAFC',
                            fontSize: '0.84rem',
                            colorScheme: 'dark',
                            boxSizing: 'border-box'
                          }}
                        >
                          {timeSlots.map((slot) => (
                            <option key={slot.id} value={slot.slotName} style={{ background: '#0D111A', color: '#F8FAFC' }}>
                              {slot.slotName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 2. CHỌN LOẠI VÉ (DẠNG DANH SÁCH BẢNG GỌN GÀNG, KHÔNG BULLETS) */}
                  <div
                    style={{
                      background: '#131824',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={15} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                      <span>Chọn loại vé</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {ticketTypes.map((type) => {
                        const qty = ticketQuantities[type.code] || 0;

                        return (
                          <div
                            key={type.id || type.code}
                            style={{
                              background: qty > 0 ? 'rgba(212, 175, 55, 0.04)' : '#0D111A',
                              border: qty > 0 ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '6px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.88rem' }}>
                                {type.name}
                              </div>
                              {type.description && (
                                <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: 2 }}>
                                  {type.description}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem', minWidth: 85, textAlign: 'right' }}>
                                {formatVND(type.price)}
                              </div>

                              {/* Bộ tăng giảm số lượng gọn gàng */}
                              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(type.code, -1)}
                                  disabled={qty === 0}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    background: 'transparent',
                                    border: 'none',
                                    color: qty > 0 ? '#F8FAFC' : '#475569',
                                    cursor: qty > 0 ? 'pointer' : 'not-allowed',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ width: 28, textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: '#F8FAFC' }}>
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(type.code, 1)}
                                  style={{
                                    width: 28,
                                    height: 28,
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#F8FAFC',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 0
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

                  {/* 3. THÔNG TIN KHÁCH NHẬN VÉ (3 TRƯỜNG THỰC TẾ) */}
                  <div
                    style={{
                      background: '#131824',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F8FAFC', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={15} style={{ color: 'var(--c-gold, #D4AF37)' }} />
                      <span>Thông tin người nhận vé</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.76rem', color: '#94A3B8', marginBottom: 4 }}>
                          Họ và tên người đại diện <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          required
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            background: '#0D111A',
                            border: isNameValid || !customerName ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#F8FAFC',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', color: '#94A3B8', marginBottom: 4 }}>
                          Số điện thoại <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ví dụ: 0912345678"
                          required
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            background: '#0D111A',
                            border: customerPhone && !isPhoneValid ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#F8FAFC',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', color: '#94A3B8', marginBottom: 4 }}>
                          Email nhận mã vé QR <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '5px',
                            background: '#0D111A',
                            border: customerEmail && !isEmailValid ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#F8FAFC',
                            fontSize: '0.84rem',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY) */}
                <div
                  style={{
                    background: '#131824',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '18px 20px',
                    position: 'sticky',
                    top: 90
                  }}
                >
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#F8FAFC', marginBottom: 12 }}>
                    Tóm tắt đơn hàng
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                      <span style={{ color: '#94A3B8' }}>Ngày tham quan:</span>
                      <span style={{ color: '#F8FAFC', fontWeight: 500 }}>{visitDate}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 6 }}>
                      <span style={{ color: '#94A3B8' }}>Khung giờ:</span>
                      <span style={{ color: '#F8FAFC', fontWeight: 500 }}>{selectedSlot}</span>
                    </div>

                    {/* Chi tiết từng loại vé đã chọn */}
                    {totalTicketsCount === 0 ? (
                      <div style={{ padding: '12px 0', color: '#64748B', textAlign: 'center', fontSize: '0.78rem' }}>
                        Chưa chọn loại vé nào.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
                        {ticketTypes.map((type) => {
                          const qty = ticketQuantities[type.code] || 0;
                          if (qty === 0) return null;
                          return (
                            <div key={type.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <span style={{ color: '#CBD5E1' }}>
                                {type.name} (x{qty})
                              </span>
                              <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                                {formatVND(type.price * qty)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10, marginTop: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ color: '#CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}>Tổng tiền:</span>
                        <span style={{ color: 'var(--c-gold, #D4AF37)', fontSize: '1.25rem', fontWeight: 700 }}>
                          {formatVND(totalAmount)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: 2 }}>
                        Tổng số lượng: {totalTicketsCount} vé
                      </div>
                    </div>

                    {/* Nút thanh toán */}
                    <button
                      type="submit"
                      disabled={!isFormComplete || isSubmitting}
                      style={{
                        width: '100%',
                        marginTop: 12,
                        padding: '10px 14px',
                        borderRadius: '6px',
                        background: isFormComplete ? 'var(--c-gold, #D4AF37)' : 'rgba(255, 255, 255, 0.06)',
                        color: isFormComplete ? '#0A0D14' : '#64748B',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: isFormComplete && !isSubmitting ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          <span>Đang tạo mã thanh toán...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={14} />
                          <span>Thanh toán VietQR (PayOS)</span>
                        </>
                      )}
                    </button>

                    {!isFormComplete && (
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>
                        Vui lòng chọn vé và điền thông tin để thanh toán.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* MODAL THANH TOÁN VIETQR PAYOS */}
          {activePaymentModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
            >
              <div
                style={{
                  background: '#131824',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '20px 24px',
                  maxWidth: 420,
                  width: '100%',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {/* Nút đóng modal */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Đóng cửa sổ thanh toán? Đơn hàng vẫn được lưu và chờ thanh toán trong 15 phút.')) {
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
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>

                {paymentSuccess ? (
                  /* Màn hình thành công */
                  <div style={{ padding: '16px 0' }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid #22C55E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}
                    >
                      <CheckCircle size={32} style={{ color: '#22C55E' }} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', fontWeight: 600, margin: '0 0 6px 0' }}>
                      Thanh toán thành công!
                    </h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.84rem', margin: '0 0 16px 0' }}>
                      Vé tham quan và mã QR đã được gửi về email <b>{customerEmail}</b>.
                    </p>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentModal(null);
                          onNavigatePage('profile');
                        }}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '6px',
                          background: 'var(--c-gold, #D4AF37)',
                          color: '#0A0D14',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.86rem',
                          cursor: 'pointer'
                        }}
                      >
                        Xem vé của tôi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePaymentModal(null);
                          onNavigateHome();
                        }}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#F8FAFC',
                          border: 'none',
                          fontSize: '0.86rem',
                          cursor: 'pointer'
                        }}
                      >
                        Về trang chủ
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Màn hình quét mã QR */
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#F8FAFC', fontWeight: 600, margin: '0 0 4px 0' }}>
                      Quét mã VietQR để thanh toán
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 12 }}>
                      Mã đơn hàng: <b style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>#{activePaymentModal.orderCode}</b>
                    </div>

                    {/* Mã QR */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        padding: 10,
                        borderRadius: 8,
                        display: 'inline-block',
                        margin: '0 auto 12px'
                      }}
                    >
                      <img
                        src={activePaymentModal.qrCode}
                        alt="PayOS VietQR"
                        style={{ width: 180, height: 180, display: 'block' }}
                      />
                    </div>

                    {/* Thông tin chuyển khoản */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.8rem', background: '#0D111A', padding: '10px 14px', borderRadius: 6, textAlign: 'left', marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Số tiền:</span>
                        <span style={{ fontWeight: 700, color: 'var(--c-gold, #D4AF37)', fontSize: '0.9rem' }}>
                          {formatVND(activePaymentModal.totalAmount)}
                        </span>
                      </div>
                      {activePaymentModal.accountNumber && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>Số tài khoản:</span>
                          <span style={{ color: '#F8FAFC', fontFamily: 'monospace' }}>{activePaymentModal.accountNumber}</span>
                        </div>
                      )}
                      {activePaymentModal.accountName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94A3B8' }}>Người thụ hưởng:</span>
                          <span style={{ color: '#F8FAFC' }}>{activePaymentModal.accountName}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94A3B8' }}>Nội dung CK:</span>
                        <span style={{ color: 'var(--c-gold, #D4AF37)', fontWeight: 600, fontFamily: 'monospace' }}>
                          DATVE {activePaymentModal.orderCode}
                        </span>
                      </div>
                    </div>

                    {/* Thời gian đếm ngược */}
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 12 }}>
                      Thời gian thanh toán còn lại: <b style={{ color: '#EAB308', fontFamily: 'monospace' }}>{formatCountdown(paymentTimeRemaining)}</b>
                    </div>

                    {/* Trạng thái lắng nghe */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.76rem', color: '#94A3B8' }}>
                      <RefreshCw size={13} className="spin" style={{ color: 'var(--c-gold, #D4AF37)' }} />
                      <span>Hệ thống tự động kích hoạt vé ngay khi nhận được tiền</span>
                    </div>

                    {/* Nút mở cổng PayOS trực tiếp nếu cần */}
                    {activePaymentModal.checkoutUrl && (
                      <div style={{ marginTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 10 }}>
                        <a
                          href={activePaymentModal.checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--c-gold, #D4AF37)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <span>Mở trang thanh toán PayOS</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <ClientFooter
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
};
