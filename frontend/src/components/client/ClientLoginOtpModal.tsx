import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { X, Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClientLoginOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClientLoginOtpModal: React.FC<ClientLoginOtpModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();
  const { sendOtp, loginWithOtp } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Xử lý đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (isOpen) {
      setError(null);
    } else {
      setTimeout(() => {
        setStep('email');
        setOtp('');
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Bước 1: Gửi mã OTP về email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError(t('auth.enterEmail', 'Vui lòng nhập địa chỉ email của bạn'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t('auth.invalidEmail', 'Địa chỉ email không đúng định dạng'));
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      const res = await sendOtp(cleanEmail);
      if (res && res.retryAfter) {
        setCooldown(res.retryAfter);
      } else {
        setCooldown(60);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || t('auth.sendFailed', 'Không thể gửi mã xác thực. Vui lòng thử lại.'));
    } finally {
      setIsSending(false);
    }
  };

  // Bước 2: Xác thực mã OTP và đăng nhập
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setError(t('auth.enterOtp', 'Vui lòng nhập đầy đủ mã OTP 6 chữ số'));
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      await loginWithOtp(email.trim(), cleanOtp);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed', 'Mã xác thực không hợp lệ hoặc đã hết hạn.'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="client-otp-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="client-otp-modal-card">
        {/* Nút đóng */}
        <button
          type="button"
          className="client-otp-modal-close"
          onClick={onClose}
          aria-label={t('common.close', 'Đóng')}
        >
          <X size={18} />
        </button>

        {/* Header thương hiệu */}
        <div className="client-otp-header">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt=""
              style={{ width: 52, height: 52, objectFit: 'contain', margin: '0 auto 14px auto', display: 'block' }}
            />
          ) : (
            <div className="client-otp-emblem">
              {branding.emblemText || 'BT'}
            </div>
          )}
          <h3 className="client-otp-title">
            {step === 'email' ? t('auth.loginTitle', 'Đăng Nhập Khách Tham Quan') : t('auth.verifyTitle', 'Xác Thực Mã OTP')}
          </h3>
          <p className="client-otp-subtitle">
            {step === 'email'
              ? t('auth.loginSub', 'Nhập email để nhận mã xác thực đăng nhập tức thì, bảo mật và không cần mật khẩu')
              : t('auth.verifySub', `Mã gồm 6 chữ số đã được gửi đến hộp thư ${email}`)}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--c-radius-sm)',
              background: 'rgba(180, 40, 30, 0.1)',
              border: '1px solid rgba(180, 40, 30, 0.25)',
              color: 'var(--c-primary)',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form bước 1: Nhập Email */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="client-otp-form">
            <div className="client-otp-field">
              <label className="client-otp-label" htmlFor="otp-email-input">
                {t('auth.emailAddress', 'Địa chỉ Email')}
              </label>
              <div className="client-otp-input-wrap">
                <Mail size={18} className="client-otp-input-icon" />
                <input
                  id="otp-email-input"
                  type="email"
                  className="client-otp-input"
                  placeholder="vidu@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  disabled={isSending}
                />
              </div>
            </div>

            <button
              type="submit"
              className="client-otp-btn-submit"
              disabled={isSending || !email.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>{t('auth.sending', 'Đang gửi mã xác thực...')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.getOtp', 'Nhận Mã Xác Thực')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Form bước 2: Nhập OTP */
          <form onSubmit={handleVerifyOtp} className="client-otp-form">
            <div className="client-otp-field">
              <label className="client-otp-label" htmlFor="otp-code-input">
                {t('auth.otpCode', 'Mã xác nhận 6 số')}
              </label>
              <div className="client-otp-input-wrap">
                <input
                  id="otp-code-input"
                  type="text"
                  maxLength={6}
                  className="client-otp-input client-otp-code-input"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                  }}
                  autoFocus
                  required
                  disabled={isVerifying}
                />
              </div>
            </div>

            <button
              type="submit"
              className="client-otp-btn-submit"
              disabled={isVerifying || otp.trim().length < 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>{t('auth.verifying', 'Đang xác thực đăng nhập...')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>{t('auth.confirmLogin', 'Xác Nhận & Đăng Nhập')}</span>
                </>
              )}
            </button>

            {/* Gửi lại mã */}
            <div className="client-otp-resend">
              <span>{t('auth.notReceived', 'Chưa nhận được mã? ')}</span>
              <button
                type="button"
                className="client-otp-resend-btn"
                disabled={cooldown > 0 || isSending}
                onClick={() => handleSendOtp()}
              >
                {cooldown > 0
                  ? t('auth.resendCountdown', `Gửi lại sau ${cooldown}s`)
                  : t('auth.resendNow', 'Gửi lại mã ngay')}
              </button>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-text-muted)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() => {
                    setStep('email');
                    setError(null);
                  }}
                >
                  {t('auth.changeEmail', 'Thay đổi địa chỉ email')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
