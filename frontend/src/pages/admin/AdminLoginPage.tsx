import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import {
  Mail,
  ArrowRight,
  RefreshCw,
  Loader2,
  Lock,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

interface AdminLoginPageProps {
  onBackToHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBackToHome }) => {
  const { sendOtp, loginWithOtp } = useAuth();
  const { showToast } = useToast();
  const { branding } = useSystemBranding();

  // State cho Đăng nhập Xác thực OTP Email Bảo Mật
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Ref cho 6 ô input OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Đếm ngược Cooldown 60s
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Gửi mã xác thực OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      showToast('Vui lòng nhập địa chỉ Email quản trị viên', 'warning');
      return;
    }

    if (cooldown > 0) {
      showToast(`Vui lòng chờ thêm ${cooldown} giây trước khi yêu cầu mã mới`, 'warning');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendOtp(email.trim());

      if (res.success) {
        setOtpSent(true);
        setCooldown(res.cooldownSeconds || 60);
        showToast(res.message || 'Mã xác thực đã được gửi đến email quản trị viên', 'success');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else if (res.retryAfter) {
        setCooldown(res.retryAfter);
        showToast(res.message, 'warning');
      } else {
        showToast(res.message || 'Không thể gửi mã xác thực', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Nhập từng chữ số OTP
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace xóa lùi
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Hỗ trợ Paste 6 số
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await loginWithOtp(email.trim(), otpCode);
      showToast('Đăng nhập quản trị thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Mã xác thực không chính xác hoặc đã hết hạn', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Header danh tính bảo tàng */}
        <div className="login-card-header">
          {branding.logoUrl ? (
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <img
                src={branding.logoUrl}
                alt={branding.shortName}
                style={{
                  maxHeight: 70,
                  maxWidth: 200,
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <div
              className="login-museum-icon-box"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #5a1a0c 100%)',
                border: '1px solid var(--accent-gold)'
              }}
            >
              <span
                style={{
                  fontFamily: 'serif',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#FFF8F0',
                  letterSpacing: '0.05em'
                }}
              >
                {branding.emblemText || 'BT'}
              </span>
            </div>
          )}
          <h1 className="login-museum-title">{branding.museumName?.toUpperCase() || 'BẢO TÀNG'}</h1>
          <p className="login-sub-title">Cổng Đăng Nhập Quản Trị Hệ Thống</p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: 'var(--accent-gold)',
              fontSize: 11.5,
              fontWeight: 600
            }}
          >
            <ShieldCheck size={13} />
            <span>Xác thực Không Mật Khẩu (Passwordless OTP)</span>
          </div>
        </div>

        {/* Thân biểu mẫu */}
        <div className="login-card-body">
          {!otpSent ? (
            /* Bước 1: Nhập email quản trị viên */
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="login-email" className="login-label">
                  Email quản trị viên được cấp quyền
                </label>
                <div className="login-input-group">
                  <Mail size={15} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@... (Email quản trị viên)"
                    required
                    autoFocus
                  />
                </div>
                <span className="login-input-hint" style={{ lineHeight: 1.5 }}>
                  Chỉ các email quản trị viên được cấu hình trong hệ thống mới nhận được mã OTP xác thực bảo mật 6 chữ số.
                </span>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSendingOtp || cooldown > 0}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Đang gửi mã...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw size={14} />
                    <span>Gửi lại sau ({cooldown}s)</span>
                  </>
                ) : (
                  <>
                    <span>Gửi mã xác thực OTP</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Bước 2: Nhập OTP 6 số */
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="otp-info-box">
                <div className="otp-info-text">
                  Mã xác thực đã gửi đến: <strong>{email}</strong>
                </div>
                <button
                  type="button"
                  className="otp-change-email-btn"
                  onClick={() => setOtpSent(false)}
                >
                  Thay đổi
                </button>
              </div>

              <div className="form-group">
                <label className="login-label" style={{ textAlign: 'center', display: 'block' }}>
                  Nhập mã xác thực 6 chữ số
                </label>
                <div className="otp-inputs-wrapper" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className={`otp-digit-input ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isVerifyingOtp || otpDigits.join('').length < 6}
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Đang xác nhận...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Xác nhận và Đăng nhập Quản trị</span>
                  </>
                )}
              </button>

              <div className="otp-resend-row">
                <button
                  type="button"
                  className="btn-link-resend"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp || cooldown > 0}
                >
                  <RefreshCw size={12} className={isSendingOtp ? 'spin' : ''} />
                  <span>
                    {cooldown > 0
                      ? `Gửi lại mã sau (${cooldown}s)`
                      : 'Không nhận được mã? Gửi lại mã'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer tối giản, chuẩn mực */}
        <div className="login-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <ArrowLeft size={13} />
              <span>Quay về Cổng thông tin Khách tham quan</span>
            </button>
          )}
          <span>{branding.museumName} &copy; 2026</span>
        </div>
      </div>
    </div>
  );
};
