import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  RefreshCw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Zap,
  ZapOff,
  User,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Keyboard
} from 'lucide-react';
import { api } from '../../services/api';

interface AdminTicketScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCheckedIn?: () => void;
}

interface VerificationResult {
  valid: boolean;
  reason: string;
  message: string;
  ticket?: any;
  ticketCode?: string;
}

export const AdminTicketScannerModal: React.FC<AdminTicketScannerModalProps> = ({
  isOpen,
  onClose,
  onTicketCheckedIn
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLiveCameraSupported, setIsLiveCameraSupported] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);

  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'upload'>('camera');
  const [manualCode, setManualCode] = useState<string>('');
  const [autoCheckin, setAutoCheckin] = useState<boolean>(true);

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Âm thanh báo thành công qua Web Audio API (không phụ thuộc file ngoài)
  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch {}
  };

  // Âm thanh cảnh báo gian lận / lỗi
  const playErrorSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);

      if (navigator.vibrate) {
        navigator.vibrate([150, 70, 150]);
      }
    } catch {}
  };

  // Bật/tắt camera khi mở modal
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setResult(null);
    setCameraError(null);
    setIsScanning(true);
    setIsVerifying(false);
    setManualCode('');

    if (scanMode === 'camera') {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, scanMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    const hasGetUserMedia = typeof navigator !== 'undefined' && !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).getUserMedia
    );

    if (!hasGetUserMedia) {
      setIsLiveCameraSupported(false);
      setCameraError('Trình duyệt yêu cầu HTTPS để bật Camera trực tiếp. Vui lòng nhập mã vé hoặc tải ảnh QR.');
      setScanMode('manual');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Kiểm tra hỗ trợ đèn Flash
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('[QR Scanner Camera Error]:', err.message);
      setCameraError('Không thể mở Camera (Có thể chưa cấp quyền hoặc camera đang bị ứng dụng khác chiếm giữ).');
      setIsLiveCameraSupported(false);
      setScanMode('manual');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!stream || !hasTorch) return;
    const track = stream.getVideoTracks()[0];
    try {
      const nextTorch = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setIsTorchOn(nextTorch);
    } catch {}
  };

  // Quét vòng lặp frame từ video camera bằng jsQR
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (
        !isScanning ||
        isVerifying ||
        result ||
        !videoRef.current ||
        !canvasRef.current ||
        videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA
      ) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });

        if (code && code.data) {
          handleQRCodeDetected(code.data);
          return;
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    if (isOpen && isScanning && !result && scanMode === 'camera') {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isScanning, isVerifying, result, scanMode]);

  // Xử lý khi bắt được dữ liệu QR
  const handleQRCodeDetected = async (rawData: string) => {
    if (isVerifying || !rawData.trim()) return;
    setIsScanning(false);
    setIsVerifying(true);

    try {
      const res = await api.adminVerifyTicketQR(rawData, autoCheckin);
      setResult(res);

      if (res.valid) {
        playSuccessSound();
        if (onTicketCheckedIn) {
          onTicketCheckedIn();
        }
      } else {
        playErrorSound();
      }
    } catch (err: any) {
      playErrorSound();
      setResult({
        valid: false,
        reason: 'NETWORK_ERROR',
        message: err.message || 'Lỗi mạng khi kết nối tới máy chủ kiểm tra vé.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Quét qua file ảnh upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQRCodeDetected(code.data);
          } else {
            playErrorSound();
            setResult({
              valid: false,
              reason: 'UNREADABLE_QR_IMAGE',
              message: 'Không tìm thấy hoặc không thể giải mã mã QR từ ảnh tải lên. Vui lòng chọn ảnh rõ nét hơn.'
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quét qua nhập mã tay hoặc đầu đọc súng quét barcode USB
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleQRCodeDetected(manualCode.trim());
  };

  // Chuẩn bị quét vé tiếp theo
  const handleScanNext = () => {
    setResult(null);
    setIsScanning(true);
    setIsVerifying(false);
    setManualCode('');
    if (manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop scanner-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="scanner-modal-panel panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="scanner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(212, 175, 55, 0.12)',
                color: 'var(--accent-gold, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <QrCode size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0, color: 'var(--heading-color)' }}>
                Soát vé tham quan qua mã QR
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                Hệ thống kiểm tra tính hợp lệ & chống gian lận
              </p>
            </div>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </button>
        </div>

        {/* Tab chuyển đổi chế độ quét & Toggle tự động */}
        <div className="scanner-control-bar">
          <div className="scanner-pill-group">
            <button
              type="button"
              className={`scanner-pill-btn ${scanMode === 'camera' ? 'active' : ''}`}
              onClick={() => {
                setScanMode('camera');
                handleScanNext();
              }}
            >
              <Camera size={13} />
              <span>Camera</span>
            </button>

            <button
              type="button"
              className={`scanner-pill-btn ${scanMode === 'manual' ? 'active' : ''}`}
              onClick={() => {
                setScanMode('manual');
                handleScanNext();
              }}
            >
              <Keyboard size={13} />
              <span>Nhập mã</span>
            </button>

            <button
              type="button"
              className={`scanner-pill-btn ${scanMode === 'upload' ? 'active' : ''}`}
              onClick={() => {
                setScanMode('upload');
                fileInputRef.current?.click();
              }}
            >
              <Upload size={13} />
              <span>Tải ảnh</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          {/* Toggle tự động vào cổng */}
          <label className="scanner-auto-toggle">
            <input
              type="checkbox"
              checked={autoCheckin}
              onChange={(e) => setAutoCheckin(e.target.checked)}
            />
            <span>Tự động duyệt vào cổng</span>
          </label>
        </div>

        {/* Body Modal */}
        <div className="scanner-modal-body">
          {/* 1. MÀN HÌNH KẾT QUẢ SOÁT VÉ */}
          {result ? (
            <div>
              {/* Banner trạng thái tinh tế, không chói mắt */}
              <div
                className="scanner-status-banner"
                style={{
                  background: result.valid
                    ? 'rgba(16, 185, 129, 0.08)'
                    : result.reason === 'ALREADY_USED'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${
                    result.valid
                      ? 'rgba(16, 185, 129, 0.25)'
                      : result.reason === 'ALREADY_USED'
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(245, 158, 11, 0.25)'
                  }`
                }}
              >
                <div
                  className="scanner-status-icon-wrap"
                  style={{
                    background: result.valid
                      ? 'rgba(16, 185, 129, 0.15)'
                      : result.reason === 'ALREADY_USED'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    color: result.valid
                      ? '#10B981'
                      : result.reason === 'ALREADY_USED'
                      ? '#EF4444'
                      : '#F59E0B'
                  }}
                >
                  {result.valid ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <ShieldAlert size={20} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: result.valid
                        ? '#10B981'
                        : result.reason === 'ALREADY_USED'
                        ? '#EF4444'
                        : '#F59E0B',
                      marginBottom: 2
                    }}
                  >
                    {result.valid
                      ? 'Vé hợp lệ — Đã soát vé vào cổng'
                      : result.reason === 'ALREADY_USED'
                      ? 'Vé đã được sử dụng trước đó'
                      : result.reason === 'EXPIRED'
                      ? 'Vé đã quá hạn sử dụng'
                      : result.reason === 'FUTURE_DATE'
                      ? 'Vé chưa đến ngày tham quan'
                      : result.reason === 'CANCELLED'
                      ? 'Vé đã bị hủy'
                      : result.reason === 'UNPAID'
                      ? 'Vé chưa thanh toán'
                      : 'Vé không hợp lệ hoặc không tồn tại'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {result.message?.replace(/^(VÉ ĐÃ QUÁ HẠN|VÉ HỢP LỆ|CẢNH BÁO|LỖI):\s*/i, '')}
                  </div>
                </div>
              </div>

              {/* Bảng thông tin chi tiết vé */}
              {result.ticket && (
                <div className="scanner-ticket-card">
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                    Thông tin vé tham quan
                  </div>

                  <div className="scanner-ticket-grid">
                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Mã vé</span>
                      <span className="scanner-code-badge">
                        {result.ticket.ticketCode}
                      </span>
                    </div>

                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Khách tham quan</span>
                      <span className="scanner-field-value" style={{ fontWeight: 600 }}>
                        {result.ticket.userName || 'Khách vãng lai'}
                      </span>
                      {result.ticket.userPhone && (
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{result.ticket.userPhone}</span>
                      )}
                    </div>

                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Loại vé</span>
                      <span className="scanner-field-value">{result.ticket.ticketTitle}</span>
                    </div>

                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Ngày tham quan</span>
                      <span className="scanner-field-value" style={{ fontWeight: 500 }}>
                        {result.ticket.visitDate || 'Trong ngày'}
                      </span>
                    </div>

                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Khung giờ</span>
                      <span className="scanner-field-value">{result.ticket.timeSlot}</span>
                    </div>

                    <div className="scanner-grid-field">
                      <span className="scanner-field-label">Số lượng & Thanh toán</span>
                      <span className="scanner-field-value" style={{ fontWeight: 600 }}>
                        {(result.ticket.totalAmount || 0).toLocaleString('vi-VN')} đ • {result.ticket.quantity || 1} người
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Nút tiếp tục quét vé kế tiếp */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleScanNext}
                style={{
                  width: '100%',
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  borderRadius: 8
                }}
              >
                <span>Quét vé tiếp theo</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            /* 2. KHU VỰC QUÉT LIVE HOẶC NHẬP MÃ */
            <div>
              {scanMode === 'camera' && (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: 270,
                      maxHeight: '45vh',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {/* Khung ngắm quét mã QR với hiệu ứng Laser */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 180,
                      height: 180,
                      border: '2px solid rgba(212, 175, 55, 0.7)',
                      borderRadius: 12,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                      pointerEvents: 'none',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Tia laser quét */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 2,
                        background: '#EF4444',
                        boxShadow: '0 0 6px #EF4444',
                        animation: 'scannerLaser 2s infinite ease-in-out'
                      }}
                    />
                  </div>

                  {/* Nút điều khiển camera phụ */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      display: 'flex',
                      gap: 6,
                      zIndex: 5
                    }}
                  >
                    {hasTorch && (
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={toggleTorch}
                        title={isTorchOn ? 'Tắt đèn Flash' : 'Bật đèn Flash'}
                        style={{ background: 'rgba(0, 0, 0, 0.65)', color: isTorchOn ? 'var(--accent-gold)' : '#FFF' }}
                      >
                        {isTorchOn ? <Zap size={13} /> : <ZapOff size={13} />}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                      title="Đổi camera trước/sau"
                      style={{ background: 'rgba(0, 0, 0, 0.65)' }}
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Chế độ nhập mã vé thủ công */}
              {scanMode === 'manual' && (
                <form onSubmit={handleManualSubmit} style={{ padding: '8px 0' }}>
                  {cameraError && (
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#F59E0B',
                        fontSize: 12,
                        marginBottom: 12
                      }}
                    >
                      {cameraError}
                    </div>
                  )}

                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 500, marginBottom: 8, color: 'var(--text-main)' }}>
                    Nhập mã vé hoặc quét bằng máy đọc mã vạch (Barcode Scanner):
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input
                      ref={manualInputRef}
                      type="text"
                      placeholder="VD: BTLS-2026-688D37 hoặc dán nội dung QR..."
                      className="form-control"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      autoFocus
                      style={{ fontSize: 13.5, fontFamily: 'monospace', flex: 1, minWidth: 200 }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!manualCode.trim() || isVerifying}
                      style={{ whiteSpace: 'nowrap', padding: '0 16px', height: 38 }}
                    >
                      {isVerifying ? 'Đang kiểm tra...' : 'Kiểm tra vé'}
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    💡 Hỗ trợ súng quét mã vạch USB/Bluetooth quét tự động.
                  </div>
                </form>
              )}

              {/* Đang gửi dữ liệu kiểm tra */}
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--primary)' }}>
                  <RefreshCw size={18} className="spin" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Đang kiểm tra vé và đối chiếu cơ sở dữ liệu...</div>
                </div>
              )}

              {scanMode === 'camera' && !isVerifying && (
                <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Hướng camera vào mã QR trên vé của khách tham quan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.12)'
          }}
        >
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Cổng soát vé Bảo tàng Lịch sử TP. Hồ Chí Minh
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scannerLaser {
          0% { top: 4px; opacity: 0.8; }
          50% { top: calc(100% - 6px); opacity: 1; }
          100% { top: 4px; opacity: 0.8; }
        }

        .scanner-modal-panel {
          max-width: 580px;
          width: 95%;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          background: var(--bg-surface, #1e1e1e);
          border: 1px solid var(--border-color);
        }

        .scanner-modal-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
        }

        .scanner-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 18px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(0, 0, 0, 0.12);
          gap: 10px;
        }

        .scanner-pill-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .scanner-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .scanner-pill-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.04);
        }

        .scanner-pill-btn.active {
          background: var(--accent-gold, #D4AF37);
          color: #121212;
          font-weight: 600;
        }

        .scanner-auto-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-muted);
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          padding: 4px 6px;
          border-radius: 4px;
        }

        .scanner-auto-toggle input {
          accent-color: var(--accent-gold, #D4AF37);
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        .scanner-modal-body {
          padding: 18px;
          overflow-y: auto;
          flex: 1;
        }

        .scanner-status-banner {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 14px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .scanner-status-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .scanner-ticket-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .scanner-ticket-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 16px;
        }

        .scanner-grid-field {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scanner-field-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .scanner-field-value {
          font-size: 13px;
          color: var(--text-main);
        }

        .scanner-code-badge {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent-gold, #D4AF37);
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 2px 7px;
          border-radius: 4px;
          display: inline-block;
          align-self: flex-start;
        }

        @media (max-width: 540px) {
          .scanner-modal-panel {
            width: 96%;
            max-height: 94vh;
            border-radius: 10px;
          }
          .scanner-modal-header {
            padding: 12px 14px;
          }
          .scanner-control-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 8px 12px;
            gap: 8px;
          }
          .scanner-pill-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
          }
          .scanner-pill-btn {
            justify-content: center;
            padding: 6px 4px;
            font-size: 11px;
            gap: 4px;
          }
          .scanner-auto-toggle {
            justify-content: flex-end;
            font-size: 11.5px;
            padding: 0;
          }
          .scanner-modal-body {
            padding: 14px 12px;
          }
          .scanner-ticket-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};
