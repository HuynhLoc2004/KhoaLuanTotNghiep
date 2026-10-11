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
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 620,
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(212, 168, 106, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                Soát vé tham quan qua mã QR
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: 0 }}>
                Hệ thống kiểm tra tính hợp lệ, hạn sử dụng & phòng chống gian lận
              </p>
            </div>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab chuyển đổi chế độ quét */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={`btn btn-xs ${scanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setScanMode('camera');
                handleScanNext();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Camera size={13} />
              <span>Camera trực tiếp</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${scanMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setScanMode('manual');
                handleScanNext();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Keyboard size={13} />
              <span>Nhập mã / Súng quét</span>
            </button>

            <button
              type="button"
              className={`btn btn-xs ${scanMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setScanMode('upload');
                fileInputRef.current?.click();
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Upload size={13} />
              <span>Tải ảnh QR</span>
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
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, cursor: 'pointer', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={autoCheckin}
              onChange={(e) => setAutoCheckin(e.target.checked)}
            />
            <span>Tự động duyệt vào cổng</span>
          </label>
        </div>

        {/* Body Modal */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* 1. MÀN HÌNH KẾT QUẢ SOÁT VÉ (NẾU ĐÃ QUÉT) */}
          {result ? (
            <div>
              {/* Banner trạng thái to rõ ràng */}
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  background: result.valid
                    ? 'rgba(16, 185, 129, 0.12)'
                    : result.reason === 'ALREADY_USED'
                    ? 'rgba(239, 68, 68, 0.16)'
                    : 'rgba(245, 158, 11, 0.12)',
                  border: `1px solid ${
                    result.valid
                      ? 'rgba(16, 185, 129, 0.4)'
                      : result.reason === 'ALREADY_USED'
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(245, 158, 11, 0.4)'
                  }`
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {result.valid ? (
                    <ShieldCheck size={36} color="#10B981" />
                  ) : (
                    <ShieldAlert
                      size={36}
                      color={result.reason === 'ALREADY_USED' ? '#EF4444' : '#F59E0B'}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: result.valid
                        ? '#10B981'
                        : result.reason === 'ALREADY_USED'
                        ? '#EF4444'
                        : '#F59E0B',
                      marginBottom: 4
                    }}
                  >
                    {result.valid
                      ? 'VÉ HỢP LỆ — ĐÃ SOÁT VÉ VÀO CỔNG'
                      : result.reason === 'ALREADY_USED'
                      ? 'CẢNH BÁO GIAN LẬN: VÉ ĐÃ ĐƯỢC DÙNG TRƯỚC ĐÓ'
                      : result.reason === 'EXPIRED'
                      ? 'VÉ ĐÃ QUÁ HẠN SỬ DỤNG'
                      : result.reason === 'FUTURE_DATE'
                      ? 'VÉ CHƯA ĐẾN NGÀY THAM QUAN'
                      : result.reason === 'CANCELLED'
                      ? 'VÉ ĐÃ BỊ HỦY'
                      : result.reason === 'UNPAID'
                      ? 'VÉ CHƯA THANH TOÁN'
                      : 'VÉ KHÔNG HỢP LỆ / KHÔNG TỒN TẠI'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {result.message}
                  </div>
                </div>
              </div>

              {/* Bảng thông tin chi tiết vé nếu tìm thấy */}
              {result.ticket && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.15)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 18
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 12 }}>
                    THÔNG TIN CHI TIẾT VÉ THAM QUAN
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>MÃ VÉ:</span>
                      <strong style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--primary)' }}>
                        {result.ticket.ticketCode}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>HỌ TÊN KHÁCH:</span>
                      <strong style={{ color: 'var(--heading-color)' }}>
                        {result.ticket.userName || 'Khách vãng lai'}
                      </strong>
                      {result.ticket.userPhone && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{result.ticket.userPhone}</div>
                      )}
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>LOẠI VÉ:</span>
                      <span style={{ color: 'var(--heading-color)' }}>{result.ticket.ticketTitle}</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>NGÀY THAM QUAN:</span>
                      <strong style={{ color: 'var(--heading-color)' }}>
                        {result.ticket.visitDate || 'Trong ngày'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>KHUNG GIỜ:</span>
                      <span style={{ color: 'var(--heading-color)' }}>{result.ticket.timeSlot}</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'block' }}>SỐ TIỀN / SỐ LƯỢNG:</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {(result.ticket.totalAmount || 0).toLocaleString('vi-VN')} đ ({result.ticket.quantity || 1} người)
                      </strong>
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
                  padding: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                <span>Quét vé tiếp theo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* 2. KHU VỰC QUÉT LIVE HOẶC NHẬP MÃ */
            <div>
              {scanMode === 'camera' && (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: 290,
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
                      width: 190,
                      height: 190,
                      border: '2px solid rgba(212, 168, 106, 0.8)',
                      borderRadius: 14,
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
                        boxShadow: '0 0 8px #EF4444',
                        animation: 'scannerLaser 2s infinite ease-in-out'
                      }}
                    />
                  </div>

                  {/* Nút điều khiển camera phụ */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      display: 'flex',
                      gap: 8,
                      zIndex: 5
                    }}
                  >
                    {hasTorch && (
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={toggleTorch}
                        title={isTorchOn ? 'Tắt đèn Flash' : 'Bật đèn Flash'}
                        style={{ background: 'rgba(0, 0, 0, 0.6)', color: isTorchOn ? '#F59E0B' : '#FFF' }}
                      >
                        {isTorchOn ? <Zap size={14} /> : <ZapOff size={14} />}
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                      title="Đổi camera trước/sau"
                      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Chế độ nhập mã vé thủ công / hỗ trợ súng đọc mã vạch USB */}
              {scanMode === 'manual' && (
                <form onSubmit={handleManualSubmit} style={{ padding: '16px 0' }}>
                  {cameraError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 6,
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#F59E0B',
                        fontSize: 12,
                        marginBottom: 14
                      }}
                    >
                      {cameraError}
                    </div>
                  )}

                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--heading-color)' }}>
                    Nhập mã vé hoặc quét bằng máy đọc mã vạch (Barcode Scanner):
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input
                      ref={manualInputRef}
                      type="text"
                      placeholder="VD: BTLS-2026-688D37 hoặc dán nội dung QR..."
                      className="form-control"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      autoFocus
                      style={{ fontSize: 14, fontFamily: 'monospace' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!manualCode.trim() || isVerifying}
                      style={{ whiteSpace: 'nowrap', padding: '0 18px' }}
                    >
                      {isVerifying ? 'Đang kiểm tra...' : 'Kiểm tra vé'}
                    </button>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    💡 Mẹo: Có thể dùng súng quét mã vạch USB/Bluetooth quét trực tiếp vào ô trên (thiết bị tự động bấm Enter).
                  </div>
                </form>
              )}

              {/* Đang gửi dữ liệu kiểm tra */}
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--primary)' }}>
                  <RefreshCw size={20} className="spin" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Đang kiểm tra vé và đối chiếu cơ sở dữ liệu...</div>
                </div>
              )}

              {scanMode === 'camera' && !isVerifying && (
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  Hướng camera vào mã QR trên vé giấy hoặc màn hình điện thoại của khách tham quan.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
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

      {/* Hiệu ứng Laser Scan Keyframes */}
      <style>{`
        @keyframes scannerLaser {
          0% { top: 4px; opacity: 0.8; }
          50% { top: calc(100% - 6px); opacity: 1; }
          100% { top: 4px; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
