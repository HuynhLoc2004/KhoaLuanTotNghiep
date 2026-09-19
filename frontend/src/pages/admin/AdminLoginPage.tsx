import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import {
  Mail,
  KeyRound,
  Shield,
  ArrowRight,
  RefreshCw,
  Loader2,
  Lock,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { sendOtp, loginWithOtp, loginWithCredentials } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'otp' | 'credentials'>('otp');

  // State cho Đăng nhập OTP
  const [email, setEmail] = useState('huynhtanlocpp09@gmail.com');
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

  // Xử lý gửi mã OTP (Bước 1)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      showToast('Vui lòng nhập địa chỉ Email nhận mã OTP', 'warning');
      return;
    }

    if (cooldown > 0) {
      showToast(`Vui lòng chờ thêm ${cooldown} giây nữa để chống spam`, 'warning');
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await sendOtp(email.trim());

      if (res.success) {
        setOtpSent(true);
        setCooldown(res.cooldownSeconds || 60);
        showToast(res.message || 'Mã OTP đã được gửi đến email của bạn', 'success');
        // Reset OTP inputs và focus vào ô đầu tiên
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
      } else if (res.retryAfter) {
        setCooldown(res.retryAfter);
        showToast(res.message, 'warning');
      } else {
        showToast(res.message || 'Không thể gửi mã OTP', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi mã OTP', 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Xử lý nhập từng chữ số trong 6 ô OTP
  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Tự động nhảy sang ô tiếp theo
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý phím Backspace xóa lùi
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Hỗ trợ dán (paste) mã OTP 6 chữ số
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

  // Xử lý xác thực OTP (Bước 2)
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP', 'warning');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await loginWithOtp(email.trim(), otpCode);
      showToast('Đăng nhập Quản trị viên thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Xác thực OTP thất bại', 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Xử lý đăng nhập bằng Tài khoản Mật khẩu
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu', 'warning');
      return;
    }

    try {
      setIsLoggingIn(true);
      await loginWithCredentials(username.trim(), password);
      showToast('Đăng nhập Quản trị viên thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Đăng nhập không thành công', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Vòng sáng hào quang di sản nền */}
      <div className="login-heritage-glow" />

      <div className="admin-login-card">
        {/* Header Di Sản */}
        <div className="login-card-header">
          <div className="login-heritage-emblem">🏛️</div>
          <h1 className="login-museum-title">BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH</h1>
          <p className="login-sub-title">Hệ thống Quản trị Không gian Trưng bày & Tour 360°</p>
          <div className="login-role-badge">
            <Shield size={12} style={{ color: 'var(--accent-gold)' }} />
            <span>Khu Vực Quản Trị Viên (Admin)</span>
          </div>
        </div>

        {/* Tab Chuyển đổi phương thức đăng nhập */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${authMode === 'otp' ? 'active' : ''}`}
            onClick={() => setAuthMode('otp')}
          >
            <Mail size={14} />
            <span>Mã OTP qua Email</span>
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

        {/* THÂN PHẦN ĐĂNG NHẬP */}
        <div className="login-card-body">
          {authMode === 'otp' ? (
            !otpSent ? (
              /* BƯỚC 1: NHẬP EMAIL ĐỂ GỬI MÃ OTP */
              <form onSubmit={handleSendOtp} className="login-form">
                <div className="form-group">
                  <label htmlFor="login-email" className="login-label">
                    Địa chỉ Email Quản trị viên:
                  </label>
                  <div className="login-input-group">
                    <Mail size={16} className="input-icon" />
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
                  <div className="login-input-hint">
                    Mã bảo mật 6 chữ số sẽ được gửi trực tiếp đến hộp thư này qua SMTP.
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isSendingOtp || cooldown > 0}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw size={15} />
                      <span>Vui lòng chờ ({cooldown}s)</span>
                    </>
                  ) : (
                    <>
                      <span>Gửi mã xác thực OTP</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Gợi ý email mặc định */}
                <div className="login-preset-box">
                  <span className="preset-title">💡 Gợi ý Quản trị viên:</span>
                  <button
                    type="button"
                    className="preset-tag"
                    onClick={() => setEmail('huynhtanlocpp09@gmail.com')}
                  >
                    huynhtanlocpp09@gmail.com
                  </button>
                </div>
              </form>
            ) : (
              /* BƯỚC 2: NHẬP MÃ OTP 6 CHỮ SỐ */
              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="otp-banner">
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#EDE5DF' }}>
                      Đã gửi mã đến: <strong>{email}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Vui lòng kiểm tra hộp thư đến (Inbox) hoặc Spam
                    </div>
                  </div>
                  <button
                    type="button"
                    className="otp-back-email-btn"
                    onClick={() => setOtpSent(false)}
                    title="Đổi địa chỉ email khác"
                  >
                    Đổi
                  </button>
                </div>

                <div className="form-group">
                  <label className="login-label" style={{ textAlign: 'center', display: 'block' }}>
                    Nhập mã xác thực 6 chữ số:
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
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Xác nhận & Đăng nhập Quản trị</span>
                    </>
                  )}
                </button>

                {/* Hàng nút gửi lại mã với Cooldown 60s */}
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
                        ? `Gửi lại mã OTP sau (${cooldown}s)`
                        : 'Không nhận được mã? Gửi lại OTP'}
                    </span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* ĐĂNG NHẬP TÀI KHOẢN MẬT KHẨU (admin / admin) */
            <form onSubmit={handleCredentialsLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="login-username" className="login-label">
                  Tên đăng nhập hoặc Email:
                </label>
                <div className="login-input-group">
                  <User size={16} className="input-icon" />
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
                  Mật khẩu:
                </label>
                <div className="login-input-group">
                  <Lock size={16} className="input-icon" />
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

              <div className="login-credential-tip">
                <span>🔑 Tài khoản mặc định: <strong>admin</strong> | Mật khẩu: <strong>admin</strong></span>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập Quản trị viên</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Thẻ Đăng nhập */}
        <div className="login-card-footer">
          <div className="security-notice">
            <Shield size={13} style={{ color: 'var(--accent-gold)' }} />
            <span>Bảo vệ chống spam 60s & Phân quyền RBAC toàn quyền Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
