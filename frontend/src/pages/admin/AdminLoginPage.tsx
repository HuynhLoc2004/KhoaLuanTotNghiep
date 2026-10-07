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
      showToast('Vui lòng nhập địa chỉ email công vụ', 'warning');
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
        showToast(res.message || 'Mã xác thực đã được gửi đến hộp thư của bạn', 'success');
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else if (res.retryAfter) {
        setCooldown(res.retryAfter);
        showToast(res.message, 'warning');
      } else {
        showToast(res.message || 'Không thể gửi mã xác thực', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể gửi mã xác thực, vui lòng thử lại', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const otpCode = (codeOverride !== undefined ? codeOverride : otpDigits.join('')).trim();
    if (otpCode.length < 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }
    if (isVerifyingOtp) return;

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

  // Nhập từng chữ số OTP - Tự động đăng nhập khi điền đủ 6 số
  const handleDigitChange = (index: number, value: string) => {
    const cleanNumbers = value.replace(/\D/g, '');

    // Nếu người dùng paste hoặc nhập chuỗi nhiều số vào một ô
    if (cleanNumbers.length > 1) {
      const pasteData = cleanNumbers.slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < pasteData.length; i++) {
        if (index + i < 6) {
          newDigits[index + i] = pasteData[i];
        }
      }
      setOtpDigits(newDigits);
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        inputRefs.current[5]?.focus();
        handleVerifyOtp(undefined, fullCode);
      } else {
        const nextIdx = Math.min(index + pasteData.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const char = cleanNumbers.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char) {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else {
        // Đã nhập đến ô thứ 6 -> Tự động kích hoạt đăng nhập
        const fullCode = newDigits.join('');
        if (fullCode.length === 6) {
          handleVerifyOtp(undefined, fullCode);
        }
      }
    }
  };

  // Backspace xóa lùi
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Hỗ trợ Paste 6 số - Điền đủ và tự động kích hoạt đăng nhập ngay lập tức
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setOtpDigits(newDigits);

    if (pasteData.length === 6) {
      inputRefs.current[5]?.focus();
      handleVerifyOtp(undefined, pasteData);
    } else {
      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Header danh tính bảo tàng */}
        <div className="login-card-header">
          {branding.logoUrl ? (
            <div className="login-logo-container">
              <img
                src={branding.logoUrl}
                alt={branding.shortName || branding.museumName}
                className="login-museum-logo-img"
              />
            </div>
          ) : (
            <div className="login-museum-icon-box">
              <span className="login-museum-icon-text">
                {branding.emblemText || 'BT'}
              </span>
            </div>
          )}
          <h1 className="login-museum-title">{branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}</h1>
          <p className="login-sub-title">Cổng Quản Trị Hệ Thống</p>
          <div className="login-badge">
            <ShieldCheck size={13} />
            <span>Khu vực Cán bộ Quản lý</span>
          </div>
        </div>

        {/* Thân biểu mẫu */}
        <div className="login-card-body">
          {!otpSent ? (
            /* Bước 1: Nhập email công vụ */
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="login-email" className="login-label">
                  Email công vụ
                </label>
                <div className="login-input-group">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="login-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="quanly@baotanglichsu.vn"
                    required
                    autoFocus
                  />
                </div>
                <span className="login-input-hint">
                  Mã xác thực an toàn (OTP) sẽ được gửi đến hộp thư của bạn để đăng nhập.
                </span>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isSendingOtp || cooldown > 0}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Đang gửi mã...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw size={15} />
                    <span>Gửi lại sau {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <span>Tiếp tục</span>
                    <ArrowRight size={16} />
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
                  Đổi email
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
                    <Loader2 size={16} className="spin" />
                    <span>Đang xác nhận...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Đăng nhập</span>
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
                  <RefreshCw size={13} className={isSendingOtp ? 'spin' : ''} />
                  <span>
                    {cooldown > 0
                      ? `Gửi lại mã sau (${cooldown}s)`
                      : 'Chưa nhận được mã? Gửi lại'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer trang nhã */}
        <div className="login-card-footer">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="login-back-btn"
            >
              <ArrowLeft size={13} />
              <span>Quay lại trang tham quan</span>
            </button>
          )}
          <span className="login-copyright">
            {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'} &copy; 2026
          </span>
        </div>
      </div>
    </div>
  );
};
