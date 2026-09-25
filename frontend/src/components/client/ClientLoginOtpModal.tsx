import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Loader2 } from 'lucide-react';

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
  const { sendOtp, loginWithOtp } = useAuth();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Đóng bằng phím Escape & reset state khi mở/đóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setError(null);
    } else {
      document.body.style.overflow = '';
      const timeout = setTimeout(() => {
        setStep('email');
        setOtp('');
        setError(null);
      }, 250);
      return () => clearTimeout(timeout);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Bước 1: Gửi mã OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Email không đúng định dạng');
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
      setError(err.message || 'Không thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  // Bước 2: Xác thực OTP và đăng nhập
  const handleVerifyOtp = async (e?: React.FormEvent, codeOverride?: string) => {
    if (e) e.preventDefault();
    const cleanOtp = (codeOverride !== undefined ? codeOverride : otp).trim();
    if (cleanOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    if (isVerifying) return;

    try {
      setIsVerifying(true);
      setError(null);
      await loginWithOtp(email.trim(), cleanOtp);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
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
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        {/* Tiêu đề ngắn gọn, chuẩn mực */}
        <div className="client-otp-header">
          <h3 className="client-otp-title">
            {step === 'email' ? 'Đăng nhập' : 'Xác thực OTP'}
          </h3>
          <p className="client-otp-subtitle">
            {step === 'email'
              ? 'Nhập email của bạn để nhận mã xác thực OTP'
              : `Mã 6 chữ số đã được gửi đến ${email}`}
          </p>
        </div>

        {/* Thông báo lỗi gọn gàng */}
        {error && (
          <div className="client-otp-error">
            <span>{error}</span>
          </div>
        )}

        {/* Bước 1: Nhập Email */}
        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="client-otp-form">
            <div className="client-otp-field">
              <label className="client-otp-label" htmlFor="otp-email-input">
                Địa chỉ email
              </label>
              <input
                id="otp-email-input"
                type="email"
                className="client-otp-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                disabled={isSending}
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="client-otp-btn-submit"
              disabled={isSending || !email.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <span>Tiếp tục</span>
              )}
            </button>
          </form>
        ) : (
          /* Bước 2: Nhập OTP */
          <form onSubmit={handleVerifyOtp} className="client-otp-form">
            <div className="client-otp-field">
              <label className="client-otp-label" htmlFor="otp-code-input">
                Mã xác thực (6 số)
              </label>
              <input
                id="otp-code-input"
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="client-otp-input client-otp-code-input"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                  if (val.length === 6) {
                    handleVerifyOtp(undefined, val);
                  }
                }}
                autoFocus
                required
                disabled={isVerifying}
              />
            </div>

            <button
              type="submit"
              className="client-otp-btn-submit"
              disabled={isVerifying || otp.trim().length < 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>

            {/* Dòng gửi lại mã và đổi email tối giản */}
            <div className="client-otp-footer-links">
              {cooldown > 0 ? (
                <span className="client-otp-cooldown">Gửi lại sau {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  className="client-otp-link-btn"
                  disabled={isSending}
                  onClick={() => handleSendOtp()}
                >
                  Gửi lại mã
                </button>
              )}
              <span className="client-otp-divider">•</span>
              <button
                type="button"
                className="client-otp-link-btn"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError(null);
                }}
              >
                Đổi email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
