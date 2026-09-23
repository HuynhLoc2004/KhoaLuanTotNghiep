import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import {
  Landmark,
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Loader2,
  Lock,
  User
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { sendOtp, loginWithOtp, loginWithCredentials } = useAuth();
  const { showToast } = useToast();
  const { branding } = useSystemBranding();

  const [authMode, setAuthMode] = useState<'otp' | 'credentials'>('credentials');

  // State cho Đăng nhập OTP
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // State cho Đăng nhập Tài khoản / Mật khẩu
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
        showToast(res.message || 'Mã xác thực đã được gửi đến email của bạn', 'success');
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

  // Đăng nhập bằng Tài khoản Mật khẩu
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu', 'warning');
      return;
    }

    try {
      setIsLoggingIn(true);
      await loginWithCredentials(username.trim(), password);
      showToast('Đăng nhập quản trị thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác', 'error');
    } finally {
      setIsLoggingIn(false);
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
        </div>

        {/* Tab chuyển đổi phương thức */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${authMode === 'otp' ? 'active' : ''}`}
            onClick={() => setAuthMode('otp')}
          >
            <Mail size={14} />
            <span>Xác thực OTP Email</span>
          </button>
          <button
            type="button"
            className={`login-tab-btn ${authMode === 'credentials' ? 'active' : ''}`}
            onClick={() => setAuthMode('credentials')}
          >
            <KeyRound size={14} />
            <span>Tài khoản / Mật khẩu</span>
          </button>
        </div>

        {/* Thân biểu mẫu */}
        <div className="login-card-body">
          {authMode === 'otp' ? (
            !otpSent ? (
              /* Bước 1: Nhập email */
              <form onSubmit={handleSendOtp} className="login-form">
                <div className="form-group">
                  <label htmlFor="login-email" className="login-label">
                    Email quản trị viên
                  </label>
                  <div className="login-input-group">
                    <Mail size={15} className="input-icon" />
                    <input
                      id="login-email"
                      type="email"
                      className="login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@baotanglichsu.vn"
                      required
                      autoFocus
                    />
                  </div>
                  <span className="login-input-hint">
                    Hệ thống sẽ gửi mã bảo mật 6 chữ số đến email để xác minh danh tính.
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
                      <span>Gửi mã xác thực</span>
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
                      <span>Xác nhận và Đăng nhập</span>
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
            )
          ) : (
            /* Đăng nhập bằng tên đăng nhập / mật khẩu */
            <form onSubmit={handleCredentialsLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="login-username" className="login-label">
                  Tên đăng nhập hoặc Email
                </label>
                <div className="login-input-group">
                  <User size={15} className="input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    className="login-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password" className="login-label">
                  Mật khẩu
                </label>
                <div className="login-input-group">
                  <Lock size={15} className="input-icon" />
                  <input
                    id="login-password"
                    type="password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 14, fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Quản trị viên mặc định: <strong style={{ color: 'var(--accent-gold)' }}>admin</strong> / <strong style={{ color: 'var(--accent-gold)' }}>admin</strong></span>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer tối giản, chuẩn mực */}
        <div className="login-card-footer">
          <span>{branding.museumName} &copy; 2026</span>
        </div>
      </div>
    </div>
  );
};
