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
  FileImage,
  ImageIcon
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

  // Trạng thái tải ảnh (preview + decode progress)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDecodingImage, setIsDecodingImage] = useState<boolean>(false);

  // Âm thanh báo thành công qua Web Audio API
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
    setUploadedPreview(null);
    setUploadedFileName(null);
    setIsDecodingImage(false);

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
      setCameraError('Trình duyệt yêu cầu HTTPS để bật Camera trực tiếp. Vui lòng dùng tab Nhập mã hoặc Tải ảnh.');
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
      setIsDecodingImage(false);
    }
  };

  // Hàm quét mã QR trên ảnh với đa tầng giải thuật (BarcodeDetector + Multi-scale jsQR + 4 hướng xoay)
  const decodeQRFromImageElement = async (img: HTMLImageElement, file?: File): Promise<string | null> => {
    // 1. Thử BarcodeDetector native (cực nhanh, chính xác cao trên Chrome/Edge/Android/iOS)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        if (file && typeof createImageBitmap !== 'undefined') {
          try {
            const bmp = await createImageBitmap(file);
            const barcodes = await detector.detect(bmp);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              return barcodes[0].rawValue.trim();
            }
          } catch {}
        }
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue.trim();
        }
      } catch (err) {
        console.warn('[BarcodeDetector fallback to jsQR]:', err);
      }
    }

    // 2. Thử jsQR với nhiều kích thước scale và 4 góc xoay (0, 90, 180, 270)
    const scales = [
      { maxDim: 1200 }, // Kích thước tối ưu cho ảnh camera độ phân giải cao
      { maxDim: 700 },  // Kích thước thu nhỏ cho ảnh chụp tổng thể hóa đơn
      { maxDim: 0 }     // Kích thước gốc của ảnh
    ];

    const baseCanvas = document.createElement('canvas');
    const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true });
    if (!baseCtx) return null;

    for (const s of scales) {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;

      if (s.maxDim > 0 && (w > s.maxDim || h > s.maxDim)) {
        if (w > h) {
          h = Math.round((h * s.maxDim) / w);
          w = s.maxDim;
        } else {
          w = Math.round((w * s.maxDim) / h);
          h = s.maxDim;
        }
      }

      baseCanvas.width = w;
      baseCanvas.height = h;
      baseCtx.clearRect(0, 0, w, h);
      baseCtx.drawImage(img, 0, 0, w, h);

      for (const angle of [0, 90, 180, 270]) {
        let testCanvas = baseCanvas;
        if (angle !== 0) {
          testCanvas = document.createElement('canvas');
          if (angle === 90 || angle === 270) {
            testCanvas.width = baseCanvas.height;
            testCanvas.height = baseCanvas.width;
          } else {
            testCanvas.width = baseCanvas.width;
            testCanvas.height = baseCanvas.height;
          }
          const tctx = testCanvas.getContext('2d');
          if (tctx) {
            tctx.translate(testCanvas.width / 2, testCanvas.height / 2);
            tctx.rotate((angle * Math.PI) / 180);
            tctx.drawImage(baseCanvas, -baseCanvas.width / 2, -baseCanvas.height / 2);
          }
        }

        const tctx = testCanvas.getContext('2d', { willReadFrequently: true });
        if (tctx) {
          try {
            const imageData = tctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth'
            });

            if (code && code.data && code.data.trim()) {
              return code.data.trim();
            }
          } catch (e) {
            console.warn('[jsQR decode pass failed]:', e);
          }
        }
      }
    }

    return null;
  };

  // Xử lý file ảnh upload
  const processUploadedFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      playErrorSound();
      setResult({
        valid: false,
        reason: 'INVALID_FILE_TYPE',
        message: 'Tệp tải lên không phải hình ảnh hợp lệ. Vui lòng chọn tệp định dạng JPG, PNG hoặc WebP.'
      });
      return;
    }

    setIsDecodingImage(true);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPreview(dataUrl);

      const img = new Image();
      img.onload = async () => {
        try {
          const qrText = await decodeQRFromImageElement(img, file);
          if (qrText) {
            handleQRCodeDetected(qrText);
          } else {
            setIsDecodingImage(false);
            playErrorSound();
            setResult({
              valid: false,
              reason: 'UNREADABLE_QR_IMAGE',
              message: 'Không tìm thấy hoặc không thể giải mã mã QR từ ảnh tải lên. Vui lòng chọn ảnh chụp rõ nét hơn, đủ ánh sáng và chứa mã QR hoặc hóa đơn của Bảo tàng.'
            });
          }
        } catch (err: any) {
          setIsDecodingImage(false);
          playErrorSound();
          setResult({
            valid: false,
            reason: 'DECODE_ERROR',
            message: err.message || 'Lỗi khi phân tích hình ảnh.'
          });
        }
      };
      img.onerror = () => {
        setIsDecodingImage(false);
        playErrorSound();
        setResult({
          valid: false,
          reason: 'IMAGE_LOAD_FAILED',
          message: 'Không thể tải hình ảnh. Vui lòng thử lại với một bức ảnh khác.'
        });
      };
      img.src = dataUrl;
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
    setUploadedPreview(null);
    setUploadedFileName(null);
    setIsDecodingImage(false);
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
        {/* Header Modal - Chuẩn Heritage Dark Bronze */}
        <div className="scanner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="scanner-header-icon-wrap">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="scanner-header-title">
                Soát vé tham quan qua mã QR
              </h3>
              <p className="scanner-header-subtitle">
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

        {/* Body Modal */}
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
                      ? 'rgba(16, 185, 129, 0.1)'
                      : result.reason === 'ALREADY_USED'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${
                      result.valid
                        ? 'rgba(16, 185, 129, 0.35)'
                        : result.reason === 'ALREADY_USED'
                        ? 'rgba(239, 68, 68, 0.35)'
                        : 'rgba(245, 158, 11, 0.35)'
                    }`
                  }}
                >
                  <div
                    className="scanner-status-icon-wrap"
                    style={{
                      background: result.valid
                        ? 'rgba(16, 185, 129, 0.18)'
                        : result.reason === 'ALREADY_USED'
                        ? 'rgba(239, 68, 68, 0.18)'
                        : 'rgba(245, 158, 11, 0.18)',
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
                        : result.reason === 'INVALID_SYSTEM_BILL' || result.reason === 'VIETQR' || result.reason === 'ZALO' || result.reason === 'SOCIAL' || result.reason === 'EXTERNAL_URL'
                        ? 'Mã QR không hợp lệ'
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
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-gold, #D4A86A)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
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
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>{isCheckingInManual ? 'Đang soát vé...' : 'Xác nhận vào cổng'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleScanNext}
                  style={{
                    flex: 1,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600
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
              {/* Tab 1: Camera Viewfinder Chuẩn Heritage Bảo Tàng */}
              {scanMode === 'camera' && (
                <div className="scanner-camera-wrap">
                  <div className="scanner-viewport-box">
                    <video
                      ref={videoRef}
                      className="scanner-video-el"
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {/* Khung ngắm chuẩn Museum Heritage (4 góc vàng tinh tế, không hiệu ứng AI chói lóa) */}
                    <div className="scanner-viewfinder-frame">
                      {/* 4 góc vàng cổ điển */}
                      <span className="scanner-corner corner-tl" />
                      <span className="scanner-corner corner-tr" />
                      <span className="scanner-corner corner-bl" />
                      <span className="scanner-corner corner-br" />

                      {/* Dấu định tâm chữ thập máy ảnh (Viewfinder Focus Reticle) */}
                      <div className="scanner-center-crosshair">
                        <span className="crosshair-h" />
                        <span className="crosshair-v" />
                      </div>
                    </div>

                    {/* Nút điều khiển camera phụ */}
                    <div className="scanner-cam-controls">
                      {hasTorch && (
                        <button
                          type="button"
                          className="btn-cam-ctrl"
                          onClick={toggleTorch}
                          title={isTorchOn ? 'Tắt đèn Flash' : 'Bật đèn Flash'}
                          style={{ color: isTorchOn ? 'var(--accent-gold, #D4A86A)' : '#FFF' }}
                        >
                          {isTorchOn ? <Zap size={14} /> : <ZapOff size={14} />}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-cam-ctrl"
                        onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                        title="Đổi camera trước/sau"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {!isVerifying && (
                    <div className="scanner-hint-text">
                      Đặt mã QR trên vé hoặc hóa đơn của Bảo tàng vào giữa khung ngắm để kiểm tra tự động.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Nhập mã thủ công */}
              {scanMode === 'manual' && (
                <form onSubmit={handleManualSubmit} className="scanner-manual-wrap">
                  <div className="scanner-icon-circle">
                    <Keyboard size={22} style={{ color: 'var(--accent-gold, #D4A86A)' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F3F4F6', marginBottom: 4 }}>
                    Nhập mã vé hoặc mã hóa đơn
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16, textAlign: 'center', maxWidth: 380, lineHeight: 1.5 }}>
                    Hỗ trợ nhập mã vé (VD: <strong style={{ color: 'var(--accent-gold, #D4A86A)' }}>BTLS-2026-688D37</strong>) hoặc mã hóa đơn, hoặc dùng đầu đọc súng quét barcode cắm cổng USB.
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
                      placeholder="VD: BTLS-2026-688D37 hoặc mã hóa đơn..."
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

              {/* Tab 3: Tải ảnh QR lên (Hỗ trợ đa tầng & Preview ảnh) */}
              {scanMode === 'upload' && (
                <div className="scanner-upload-container">
                  {uploadedPreview ? (
                    <div className="scanner-preview-card">
                      <div className="scanner-preview-img-wrap">
                        <img src={uploadedPreview} alt="Ảnh mã QR tải lên" className="scanner-preview-img" />
                        {isDecodingImage && (
                          <div className="scanner-preview-overlay">
                            <RefreshCw size={24} className="spin" style={{ color: 'var(--accent-gold, #D4A86A)' }} />
                            <span style={{ fontSize: 12, color: '#F3F4F6', marginTop: 8 }}>Đang phân tích mã QR...</span>
                          </div>
                        )}
                      </div>

                      <div className="scanner-preview-info">
                        <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                          {uploadedFileName || 'Ảnh đã chọn'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Upload size={11} />
                          <span>Chọn ảnh khác</span>
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        <Upload size={22} style={{ color: 'var(--accent-gold, #D4A86A)' }} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F3F4F6', marginBottom: 4 }}>
                        Tải ảnh vé hoặc hóa đơn tham quan
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', maxWidth: 360, textAlign: 'center', lineHeight: 1.5, marginBottom: 14 }}>
                        Kéo thả ảnh chụp mã QR vé hoặc hóa đơn (JPG, PNG, WebP) vào đây hoặc nhấp để chọn tệp. Hệ thống sẽ nhận diện và đối chiếu tự động.
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
                </div>
              )}

              {/* Đang gửi dữ liệu kiểm tra */}
              {isVerifying && (
                <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--accent-gold, #D4A86A)' }}>
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
        .scanner-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 16px;
        }

        /* Khung modal chuẩn kích thước Heritage Admin */
        .scanner-modal-panel {
          width: 580px;
          max-width: 100%;
          height: 580px;
          max-height: calc(100vh - 32px);
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 168, 106, 0.2);
          background: #181512;
          border: 1px solid rgba(212, 168, 106, 0.25);
        }

        .scanner-modal-header {
          height: 60px;
          flex-shrink: 0;
          padding: 0 20px;
          border-bottom: 1px solid rgba(212, 168, 106, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #12100e;
        }

        .scanner-header-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(212, 168, 106, 0.12);
          border: 1px solid rgba(212, 168, 106, 0.25);
          color: var(--accent-gold, #D4A86A);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .scanner-header-title {
          font-size: 14.5px;
          font-weight: 600;
          margin: 0;
          color: #F8FAFC;
          letter-spacing: -0.01em;
        }

        .scanner-header-subtitle {
          font-size: 11.5px;
          color: #9CA3AF;
          margin: 0;
          margin-top: 1px;
        }

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
          height: 50px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid rgba(212, 168, 106, 0.1);
          background: rgba(0, 0, 0, 0.25);
          gap: 10px;
        }

        .scanner-pill-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 168, 106, 0.15);
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .scanner-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
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
          background: rgba(255, 255, 255, 0.05);
        }

        .scanner-pill-btn.active {
          background: var(--accent-gold, #D4A86A);
          color: #12100e;
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
          accent-color: var(--accent-gold, #D4A86A);
          cursor: pointer;
          width: 14px;
          height: 14px;
        }

        .scanner-modal-body {
          flex: 1;
          min-height: 0;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          background: #15120f;
        }

        .scanner-modal-footer {
          height: 50px;
          flex-shrink: 0;
          padding: 0 20px;
          border-top: 1px solid rgba(212, 168, 106, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #12100e;
        }

        /* Camera Viewport */
        .scanner-camera-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .scanner-viewport-box {
          position: relative;
          width: 100%;
          height: 290px;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(212, 168, 106, 0.2);
        }

        .scanner-video-el {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Viewfinder Frame với 4 góc vàng cổ điển */
        .scanner-viewfinder-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          box-shadow: 0 0 0 9999px rgba(10, 8, 6, 0.65);
          pointer-events: none;
          overflow: hidden;
        }

        .scanner-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: var(--accent-gold, #D4A86A);
          border-style: solid;
        }

        .corner-tl {
          top: 0;
          left: 0;
          border-width: 3px 0 0 3px;
          border-top-left-radius: 4px;
        }

        .corner-tr {
          top: 0;
          right: 0;
          border-width: 3px 3px 0 0;
          border-top-right-radius: 4px;
        }

        .corner-bl {
          bottom: 0;
          left: 0;
          border-width: 0 0 3px 3px;
          border-bottom-left-radius: 4px;
        }

        .corner-br {
          bottom: 0;
          right: 0;
          border-width: 0 3px 3px 0;
          border-bottom-right-radius: 4px;
        }

        /* Dấu định tâm chữ thập ống kính máy ảnh (DSLR Viewfinder Focus Reticle) */
        .scanner-center-crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          pointer-events: none;
          opacity: 0.75;
        }

        .crosshair-h {
          position: absolute;
          top: 11px;
          left: 0;
          width: 24px;
          height: 2px;
          background: var(--accent-gold, #D4A86A);
        }

        .crosshair-v {
          position: absolute;
          left: 11px;
          top: 0;
          width: 2px;
          height: 24px;
          background: var(--accent-gold, #D4A86A);
        }

        .scanner-cam-controls {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          z-index: 5;
        }

        .btn-cam-ctrl {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(18, 16, 14, 0.8);
          color: #FFF;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-cam-ctrl:hover {
          background: rgba(212, 168, 106, 0.2);
          border-color: rgba(212, 168, 106, 0.4);
        }

        .scanner-hint-text {
          text-align: center;
          margin-top: 14px;
          font-size: 12px;
          color: #9CA3AF;
          line-height: 1.5;
        }

        /* Tab 2: Nhập mã */
        .scanner-manual-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Tab 3: Tải ảnh */
        .scanner-upload-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .scanner-upload-dropzone {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(212, 168, 106, 0.35);
          border-radius: 10px;
          background: rgba(212, 168, 106, 0.02);
          cursor: pointer;
          padding: 24px 20px;
          transition: all 0.2s ease;
        }
        .scanner-upload-dropzone:hover {
          border-color: rgba(212, 168, 106, 0.65);
          background: rgba(212, 168, 106, 0.05);
        }

        .scanner-preview-card {
          width: 100%;
          max-width: 380px;
          border: 1px solid rgba(212, 168, 106, 0.25);
          border-radius: 10px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .scanner-preview-img-wrap {
          position: relative;
          width: 100%;
          height: 220px;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanner-preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .scanner-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .scanner-preview-info {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }

        .scanner-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(212, 168, 106, 0.12);
          border: 1px solid rgba(212, 168, 106, 0.2);
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
          border: 1px solid rgba(212, 168, 106, 0.15);
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
          color: var(--accent-gold, #D4A86A);
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
            max-height: 620px;
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
          .scanner-viewport-box {
            height: 240px;
          }
          .scanner-viewfinder-frame {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
};
