import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  RefreshCw,
  Upload,
  QrCode,
  Zap,
  ZapOff,
  ArrowRight,
  Keyboard,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileImage
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
  const [isCheckingInManual, setIsCheckingInManual] = useState<boolean>(false);
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

  // Âm thanh cảnh báo lỗi
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

  // Bật/tắt camera khi mở modal hoặc chuyển tab
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
    } else {
      stopCamera();
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
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      // Kiểm tra hỗ trợ đèn Flash (Torch)
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
        setHasTorch(Boolean((capabilities as any).torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[Camera Access Error]:', err);
      setIsLiveCameraSupported(false);
      setCameraError('Không thể mở Camera (chưa cấp quyền hoặc đang bận). Vui lòng dùng tab Nhập mã hoặc Tải ảnh.');
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
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.warn('Cannot toggle torch:', err);
      }
    }
  };

  // Vòng lặp giải mã Video stream bằng jsQR
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (
        isOpen &&
        scanMode === 'camera' &&
        isScanning &&
        !result &&
        !isVerifying &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (code && code.data && code.data.trim()) {
              handleQRCodeDetected(code.data.trim());
              return;
            }
          }
        }
      }

      if (isOpen && scanMode === 'camera' && isScanning && !result) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (isOpen && scanMode === 'camera' && isScanning && !result) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, scanMode, isScanning, result, isVerifying]);

  // Xử lý gửi mã QR lên API để đối chiếu kiểm tra
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

  // Xử lý file ảnh upload
  const processUploadedFile = (file: File) => {
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
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
    if (scanMode === 'manual' && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  };

  // Soát vé thủ công nếu người dùng bỏ tích 'Tự động duyệt vào cổng'
  const handleManualCheckin = async () => {
    if (!result?.ticket?.ticketCode || isCheckingInManual) return;
    setIsCheckingInManual(true);
    try {
      const res = await api.adminCheckinTicket(result.ticket.ticketCode);
      playSuccessSound();
      setResult({
        ...result,
        valid: true,
        reason: 'CHECKED_IN_SUCCESS',
        message: res.message || `Đã soát vé thành công cho mã vé ${result.ticket.ticketCode}. Khách được phép vào cổng!`,
        ticket: {
          ...result.ticket,
          status: 'used',
          checkedInAt: new Date().toISOString()
        }
      });
      if (onTicketCheckedIn) {
        onTicketCheckedIn();
      }
    } catch (err: any) {
      playErrorSound();
      alert(err.message || 'Lỗi khi soát vé vào cổng');
    } finally {
      setIsCheckingInManual(false);
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
                background: 'rgba(212, 168, 106, 0.12)',
                color: '#D4A86A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <QrCode size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0, color: '#F3F4F6' }}>
                Soát vé tham quan qua mã QR
              </h3>
              <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
                Hệ thống kiểm tra tính hợp lệ & chống gian lận
              </p>
            </div>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Đóng">
            <X size={15} />
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
                handleScanNext();
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

        {/* Body Modal (Cố định chiều cao và bố cục, triệt tiêu co rút) */}
        <div className="scanner-modal-body">
          {/* 1. MÀN HÌNH KẾT QUẢ SOÁT VÉ */}
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                {/* Banner trạng thái chuẩn màu Admin */}
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
                        ? 'rgba(16, 185, 129, 0.3)'
                        : result.reason === 'ALREADY_USED'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(245, 158, 11, 0.3)'
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
                      <CheckCircle2 size={19} />
                    ) : result.reason === 'ALREADY_USED' ? (
                      <XCircle size={19} />
                    ) : (
                      <AlertCircle size={19} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: result.valid
                          ? '#10B981'
                          : result.reason === 'ALREADY_USED'
                          ? '#EF4444'
                          : '#F59E0B',
                        marginBottom: 3
                      }}
                    >
                      {result.valid
                        ? result.reason === 'CHECKED_IN_SUCCESS'
                          ? 'Vé hợp lệ — Đã xác nhận vào cổng'
                          : 'Vé hợp lệ — Sẵn sàng vào cổng'
                        : result.reason === 'ALREADY_USED'
                        ? 'Vé đã qua sử dụng'
                        : result.reason === 'EXPIRED'
                        ? 'Vé đã quá hạn sử dụng'
                        : result.reason === 'FUTURE_DATE'
                        ? 'Vé chưa đến ngày tham quan'
                        : result.reason === 'CANCELLED'
                        ? 'Vé đã bị hủy bỏ'
                        : result.reason === 'UNPAID'
                        ? 'Vé chưa thanh toán'
                        : result.reason === 'VIETQR' || result.reason === 'ZALO' || result.reason === 'SOCIAL' || result.reason === 'EXTERNAL_URL'
                        ? 'Mã QR không thuộc hệ thống vé'
                        : result.reason === 'NOT_FOUND'
                        ? 'Mã vé không tồn tại'
                        : 'Mã QR không hợp lệ'}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#D1D5DB', lineHeight: 1.5 }}>
                      {result.message}
                    </div>
                  </div>
                </div>

                {/* Bảng thông tin chi tiết vé */}
                {result.ticket && (
                  <div className="scanner-ticket-card">
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
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
                          <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{result.ticket.userPhone}</span>
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
                        <span className="scanner-field-label">Trạng thái vé</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: result.ticket.status === 'used' ? '#EF4444' : '#10B981'
                          }}
                        >
                          {result.ticket.status === 'used' ? 'Đã qua sử dụng' : 'Hợp lệ'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {result.valid && result.ticket?.status !== 'used' && (
                  <button
                    type="button"
                    onClick={handleManualCheckin}
                    disabled={isCheckingInManual}
                    style={{
                      flex: 1,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 6,
                      background: '#10B981',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{isCheckingInManual ? 'Đang soát vé...' : 'Xác nhận vào cổng'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleScanNext}
                  style={{
                    flex: 1,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  <span>Quét vé tiếp theo</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            /* 2. KHU VỰC CÁC TAB QUÉT */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              {/* Tab 1: Camera */}
              {scanMode === 'camera' && (
                <div className="scanner-camera-wrap">
                  <div style={{ position: 'relative', width: '100%', height: 280, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
                    <video
                      ref={videoRef}
                      style={{
                        width: '100%',
                        height: '100%',
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
                        width: 170,
                        height: 170,
                        border: '2px solid rgba(212, 168, 106, 0.8)',
                        borderRadius: 10,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                        pointerEvents: 'none',
                        overflow: 'hidden'
                      }}
                    >
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
                    <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 6, zIndex: 5 }}>
                      {hasTorch && (
                        <button
                          type="button"
                          className="btn btn-xs btn-secondary"
                          onClick={toggleTorch}
                          title={isTorchOn ? 'Tắt đèn Flash' : 'Bật đèn Flash'}
                          style={{ background: 'rgba(0, 0, 0, 0.65)', color: isTorchOn ? '#D4A86A' : '#FFF' }}
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

                  {!isVerifying && (
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9CA3AF' }}>
                      Hướng camera vào mã QR trên vé của khách tham quan để quét tự động.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Nhập mã thủ công */}
              {scanMode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="scanner-manual-wrap">
                  <div className="scanner-icon-circle">
                    <Keyboard size={22} style={{ color: '#D4A86A' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F3F4F6', marginBottom: 4 }}>
                    Nhập mã vé hoặc quét mã vạch
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16, textAlign: 'center', maxWidth: 380 }}>
                    Hỗ trợ nhập mã vé (VD: BTLS-2026-688D37) hoặc dùng đầu đọc súng quét barcode cắm cổng USB.
                  </div>

                  {cameraError && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#F59E0B',
                        fontSize: 11.5,
                        marginBottom: 12,
                        maxWidth: 420,
                        textAlign: 'center'
                      }}
                    >
                      {cameraError}
                    </div>
                  )}

                  <div style={{ width: '100%', maxWidth: 420, display: 'flex', gap: 8 }}>
                    <input
                      ref={manualInputRef}
                      type="text"
                      placeholder="VD: BTLS-2026-688D37..."
                      className="form-control"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      autoFocus
                      style={{ fontSize: 13.5, fontFamily: 'monospace', flex: 1 }}
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
                </form>
              )}

              {/* Tab 3: Tải ảnh QR lên */}
              {scanMode === 'upload' && (
                <div
                  className="scanner-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files && files[0]) {
                      processUploadedFile(files[0]);
                    }
                  }}
                >
                  <div className="scanner-icon-circle">
                    <Upload size={22} style={{ color: '#D4A86A' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F3F4F6', marginBottom: 4 }}>
                    Tải ảnh mã QR vé tham quan
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 360, textAlign: 'center', lineHeight: 1.5, marginBottom: 14 }}>
                    Nhấp vào đây hoặc kéo thả ảnh chụp mã QR (JPG, PNG, WebP) để hệ thống nhận diện và đối chiếu.
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FileImage size={13} />
                    <span>Chọn ảnh từ thiết bị</span>
                  </button>
                </div>
              )}

              {/* Đang gửi dữ liệu kiểm tra */}
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '12px 0', color: '#D4A86A' }}>
                  <RefreshCw size={17} className="spin" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 12, fontWeight: 500 }}>Đang kiểm tra vé và đối chiếu cơ sở dữ liệu...</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="scanner-modal-footer">
          <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>
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

        .scanner-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 16px;
        }

        /* Khung modal cố định kích thước 580x570px trên mọi tab */
        .scanner-modal-panel {
          width: 580px;
          max-width: 100%;
          height: 570px;
          max-height: calc(100vh - 32px);
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          background: #131722;
          border: 1px solid rgba(212, 168, 106, 0.25);
        }

        .scanner-modal-header {
          height: 60px;
          flex-shrink: 0;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0F1219;
        }

        /* Nút Close X chuẩn Admin Bảo Tàng */
        .btn-close-modal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #9CA3AF;
          cursor: pointer;
          transition: all 0.18s ease;
          outline: none;
          padding: 0;
        }
        .btn-close-modal:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.35);
          color: #EF4444;
        }

        .scanner-control-bar {
          height: 48px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
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
          padding: 5px 12px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #9CA3AF;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .scanner-pill-btn:hover {
          color: #F3F4F6;
          background: rgba(255, 255, 255, 0.04);
        }

        .scanner-pill-btn.active {
          background: #D4A86A;
          color: #0F1219;
          font-weight: 600;
        }

        .scanner-auto-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #9CA3AF;
          cursor: pointer;
          white-space: nowrap;
          user-select: none;
          padding: 4px 6px;
          border-radius: 4px;
        }

        .scanner-auto-toggle input {
          accent-color: #D4A86A;
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        /* Thân Modal cố định kích thước, không co rút khi chuyển tab */
        .scanner-modal-body {
          flex: 1;
          min-height: 0;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #11141D;
        }

        .scanner-modal-footer {
          height: 50px;
          flex-shrink: 0;
          padding: 0 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0F1219;
        }

        /* Các khối giao diện cho từng tab để chiếm trọn chiều cao */
        .scanner-camera-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .scanner-manual-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .scanner-upload-dropzone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(212, 168, 106, 0.35);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          padding: 24px 20px;
          transition: all 0.2s ease;
        }
        .scanner-upload-dropzone:hover {
          border-color: rgba(212, 168, 106, 0.65);
          background: rgba(212, 168, 106, 0.04);
        }

        .scanner-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(212, 168, 106, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
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
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 12px;
        }

        .scanner-ticket-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 16px;
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
          color: #9CA3AF;
          font-weight: 500;
        }

        .scanner-field-value {
          font-size: 13px;
          color: #F3F4F6;
        }

        .scanner-code-badge {
          font-family: monospace;
          font-size: 13px;
          font-weight: 600;
          color: #D4A86A;
          background: rgba(212, 168, 106, 0.1);
          border: 1px solid rgba(212, 168, 106, 0.25);
          padding: 2px 7px;
          border-radius: 4px;
          display: inline-block;
          align-self: flex-start;
        }

        @media (max-width: 540px) {
          .scanner-modal-backdrop {
            padding: 8px;
          }
          .scanner-modal-panel {
            width: 100%;
            height: 94vh;
            max-height: 600px;
            border-radius: 10px;
          }
          .scanner-modal-header {
            height: 54px;
            padding: 0 14px;
          }
          .scanner-control-bar {
            height: auto;
            padding: 10px 14px;
            flex-direction: column;
            align-items: stretch;
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
            font-size: 11.5px;
            gap: 4px;
          }
          .scanner-modal-body {
            padding: 14px;
          }
          .scanner-modal-footer {
            height: 46px;
            padding: 0 14px;
          }
          .scanner-ticket-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
