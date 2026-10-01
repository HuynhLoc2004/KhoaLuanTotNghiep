import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { X, Camera, Zap, ZapOff, RefreshCw, Upload, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Artifact, MuseumRoom } from '../../types';
import { useToast } from '../Toast';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifacts?: Artifact[];
  rooms?: MuseumRoom[];
  onSelectArtifactDetail?: (artifactId: string) => void;
  onSelectRoomForTour?: (room: MuseumRoom) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  artifacts = [],
  rooms = [],
  onSelectArtifactDetail,
  onSelectRoomForTour
}) => {
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLiveCameraSupported, setIsLiveCameraSupported] = useState<boolean>(true);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanSuccessResult, setScanSuccessResult] = useState<string | null>(null);
  const [matchedItemName, setMatchedItemName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Phát âm thanh tiếng "Beep" thông báo quét thành công qua Web Audio API (không phụ thuộc file ngoài)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Nốt A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);

      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {}
  };

  // Khởi động Camera khi mở Modal
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setErrorMsg(null);
    setScanSuccessResult(null);
    setMatchedItemName(null);
    setIsProcessingImage(false);
    setIsScanning(true);
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMsg(null);

    // Kiểm tra xem trình duyệt có hỗ trợ WebRTC live video (Google Chrome chặn WebRTC trên HTTP không bảo mật)
    const hasGetUserMedia = typeof navigator !== 'undefined' && !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).getUserMedia
    );

    if (!hasGetUserMedia) {
      console.log('[QRScanner] Trình duyệt không cấp quyền live video (yêu cầu HTTPS trên Chrome). Kích hoạt chế độ Camera trình duyệt.');
      setIsLiveCameraSupported(false);
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

      let mediaStream: MediaStream;
      if (navigator.mediaDevices?.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        const legacyGetUserMedia =
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).getUserMedia;
        mediaStream = await new Promise((resolve, reject) => {
          legacyGetUserMedia.call(navigator, constraints, resolve, reject);
        });
      }

      setStream(mediaStream);
      setIsLiveCameraSupported(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Kiểm tra hỗ trợ đèn pin (Torch)
      const track = mediaStream.getVideoTracks()[0];
      const capabilities: any = track?.getCapabilities ? track.getCapabilities() : {};
      setHasTorch(!!(capabilities && capabilities.torch));
    } catch (err: any) {
      console.warn('[QRScanner] Live camera không khởi động được:', err);
      setIsLiveCameraSupported(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Chưa được cấp quyền truy cập Camera trực tiếp. Bạn hãy dùng tính năng "Mở Camera Trình Duyệt" bên dưới.');
      } else {
        setErrorMsg('Trình duyệt yêu cầu HTTPS để phát video trực tiếp. Bạn hãy dùng camera trình duyệt bên dưới để chụp quét mã.');
      }
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
    if (!stream) return;
    const track: any = stream.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.warn('Không bật được đèn pin:', e);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Vòng lặp quét từng frame qua Canvas & jsQR khi có Live Video
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
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

    if (isOpen && stream) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, stream, isScanning]);

  // Giải mã QR từ ảnh do Camera chụp hoặc tệp tải lên (Hỗ trợ đa độ phân giải tối ưu cho jsQR)
  const decodeQRFromImage = (img: HTMLImageElement): string | null => {
    const targetSizes = [1000, 600, 1400];

    for (const maxDim of targetSizes) {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width === 0 || height === 0) continue;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;

      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (code && code.data) {
        return code.data;
      }
    }

    // Thử nguyên bản nếu ảnh nhỏ
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (code && code.data) {
        return code.data;
      }
    }

    return null;
  };

  // Xử lý khi ảnh từ Camera hoặc thư viện được nạp vào
  const handleProcessFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset giá trị input để có thể chụp lại liên tục
    e.target.value = '';

    setIsProcessingImage(true);
    setErrorMsg(null);

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        try {
          const decodedData = decodeQRFromImage(img);
          setIsProcessingImage(false);

          if (decodedData) {
            handleQRCodeDetected(decodedData);
          } else {
            setErrorMsg('Không tìm thấy mã QR trong ảnh vừa chụp. Vui lòng căn góc chụp thẳng và rõ nét hơn.');
          }
        } catch (scanErr) {
          console.warn('[QRScanner] Lỗi phân tích ảnh QR:', scanErr);
          setIsProcessingImage(false);
          setErrorMsg('Lỗi khi đọc ảnh. Vui lòng thử lại.');
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setErrorMsg('Không thể mở ảnh vừa chụp. Vui lòng thử lại.');
      };
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      setErrorMsg('Không đọc được tệp ảnh từ thiết bị.');
    };
    reader.readAsDataURL(file);
  };

  // Xử lý dữ liệu khi quét trúng mã QR (Hỗ trợ URL, mã Code và ID)
  const handleQRCodeDetected = (rawData: string) => {
    setIsScanning(false);
    playBeep();
    setScanSuccessResult(rawData);

    const trimmed = (rawData || '').trim();
    console.log('[QRScanner] Đã quét thành công mã QR:', trimmed);

    let parsedArtifactQuery: string | null = null;
    let parsedRoomQuery: string | null = null;

    try {
      if (trimmed.includes('artifact=') || trimmed.includes('/artifact/')) {
        if (trimmed.includes('artifact=')) {
          const urlObj = new URL(trimmed, window.location.origin);
          parsedArtifactQuery = urlObj.searchParams.get('artifact');
        } else if (trimmed.includes('/artifact/')) {
          const parts = trimmed.split('/artifact/')[1];
          if (parts) parsedArtifactQuery = parts.split(/[?#&/]/)[0];
        }
      }
      if (trimmed.includes('room=') || trimmed.includes('/tour/') || trimmed.includes('/rooms/')) {
        if (trimmed.includes('room=')) {
          const urlObj = new URL(trimmed, window.location.origin);
          parsedRoomQuery = urlObj.searchParams.get('room');
        } else if (trimmed.includes('/tour/')) {
          const parts = trimmed.split('/tour/')[1];
          if (parts) parsedRoomQuery = parts.split(/[?#&/]/)[0];
        } else if (trimmed.includes('/rooms/')) {
          const parts = trimmed.split('/rooms/')[1];
          if (parts) parsedRoomQuery = parts.split(/[?#&/]/)[0];
        }
      }
    } catch {}

    // Làm sạch và loại bỏ các giá trị rác 'undefined' / 'null'
    if (parsedArtifactQuery && (parsedArtifactQuery === 'undefined' || parsedArtifactQuery === 'null' || !parsedArtifactQuery.trim())) {
      parsedArtifactQuery = null;
    }
    if (parsedRoomQuery && (parsedRoomQuery === 'undefined' || parsedRoomQuery === 'null' || !parsedRoomQuery.trim())) {
      parsedRoomQuery = null;
    }

    let detectedRoom: MuseumRoom | null = null;
    let detectedArtifact: Artifact | null = null;

    // 1. Nếu có query room trong URL -> Tìm phòng chính xác
    if (parsedRoomQuery) {
      const q = parsedRoomQuery.toLowerCase();
      detectedRoom = rooms.find(
        (r) =>
          (r.code && r.code.toLowerCase() === q) ||
          (r.id && r.id.toLowerCase() === q) ||
          ((r as any)._id && (r as any)._id.toString().toLowerCase() === q)
      ) || null;
    }

    // 2. Nếu có query artifact trong URL -> Tìm hiện vật chính xác
    if (parsedArtifactQuery) {
      const q = parsedArtifactQuery.toLowerCase();
      detectedArtifact = artifacts.find(
        (a) =>
          (a.code && a.code.toLowerCase() === q) ||
          (a.id && a.id.toLowerCase() === q) ||
          ((a as any)._id && (a as any)._id.toString().toLowerCase() === q)
      ) || null;
    }

    // 3. Nếu không có query trong URL hoặc chưa match, thử đối sánh trực tiếp với text/mã
    if (!detectedRoom && !detectedArtifact) {
      const cleanRaw = trimmed.toLowerCase();
      // Ưu tiên đối sánh Gian phòng (Code: GP-01, ID...)
      detectedRoom = rooms.find(
        (r) =>
          (r.code && r.code.toLowerCase() === cleanRaw) ||
          (r.id && r.id.toLowerCase() === cleanRaw) ||
          ((r as any)._id && (r as any)._id.toString().toLowerCase() === cleanRaw)
      ) || null;

      // Tiếp theo đối sánh Hiện vật (Code: HV-001, ID...)
      if (!detectedRoom) {
        detectedArtifact = artifacts.find(
          (a) =>
            (a.code && a.code.toLowerCase() === cleanRaw) ||
            (a.id && a.id.toLowerCase() === cleanRaw) ||
            ((a as any)._id && (a as any)._id.toString().toLowerCase() === cleanRaw)
        ) || null;
      }
    }

    // Tìm tên để hiển thị thông báo thân thiện
    if (detectedRoom) {
      setMatchedItemName(`Gian phòng 360°: ${detectedRoom.name}`);
    } else if (detectedArtifact) {
      setMatchedItemName(`Hiện vật 3D: ${detectedArtifact.name}`);
    } else if (parsedArtifactQuery) {
      setMatchedItemName(`Hiện vật: ${parsedArtifactQuery}`);
    }

    // Điều hướng an toàn tuyệt đối
    setTimeout(() => {
      if (detectedRoom && onSelectRoomForTour) {
        onClose();
        onSelectRoomForTour(detectedRoom);
      } else if (detectedArtifact && onSelectArtifactDetail) {
        onClose();
        const artTarget = detectedArtifact.code || detectedArtifact.id;
        onSelectArtifactDetail(artTarget);
      } else if (parsedArtifactQuery && onSelectArtifactDetail) {
        onClose();
        onSelectArtifactDetail(parsedArtifactQuery);
      } else {
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          window.location.href = trimmed;
        } else {
          showToast(`Nội dung mã QR: ${trimmed}`, 'info');
          onClose();
        }
      }
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="qr-scanner-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="qr-scanner-card"
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#0B0F19',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Inputs: Camera chụp trực tiếp và Chọn ảnh từ thư viện */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          style={{ display: 'none' }}
          onChange={handleProcessFile}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleProcessFile}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37'
              }}
            >
              <Camera size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>
                Quét Mã QR Hiện Vật
              </h3>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Camera trực tiếp trên trình duyệt</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport Khung ngắm Camera */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#000',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Live Video stream khi được trình duyệt hỗ trợ */}
          {stream && isLiveCameraSupported ? (
            <>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Khung ngắm Hologram / Laser Target */}
              <div
                style={{
                  position: 'absolute',
                  width: '68%',
                  height: '68%',
                  borderRadius: 16,
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                  pointerEvents: 'none',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', borderTopLeftRadius: 12 }} />
                <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', borderTopRightRadius: 12 }} />
                <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', borderBottomLeftRadius: 12 }} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', borderBottomRightRadius: 12 }} />

                {isScanning && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(90deg, transparent 0%, #10B981 50%, transparent 100%)',
                      boxShadow: '0 0 14px #10B981',
                      animation: 'qrLaserScan 2s infinite ease-in-out'
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            /* Giao diện Camera Trình duyệt Phổ quát (Hỗ trợ 100% mọi trình duyệt kể cả Chrome trên HTTP) */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 20px',
                textAlign: 'center',
                background: 'radial-gradient(circle at center, #151C2C 0%, #080B12 100%)',
                position: 'relative'
              }}
            >
              {/* Vòng tròn Icon Camera nổi bật */}
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '2px solid rgba(212, 175, 55, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  boxShadow: '0 0 25px rgba(212, 175, 55, 0.2)'
                }}
              >
                <Camera size={38} color="#D4AF37" />
              </div>

              <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                Quét Mã QR Bằng Camera
              </div>

              <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 320, lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Hỗ trợ tất cả trình duyệt (Google Chrome, Safari, Cốc Cốc, Edge...) trực tiếp trên thiết bị của bạn.
              </p>

              {/* Nút hành động chính: Mở máy ảnh chụp mã QR */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessingImage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 22px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)',
                  color: '#0B0F19',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isProcessingImage ? 'wait' : 'pointer',
                  boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Camera size={17} />
                <span>Mở Camera Chụp & Quét Mã</span>
              </button>

              {/* Thông báo lỗi hoặc hướng dẫn nếu có */}
              {errorMsg && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#FCA5A5',
                    fontSize: 11.5,
                    maxWidth: 320,
                    lineHeight: 1.4
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* Overlay khi đang xử lý ảnh chụp */}
          {isProcessingImage && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(11, 15, 25, 0.92)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                gap: 12,
                zIndex: 10
              }}
            >
              <Loader2 size={36} color="#D4AF37" className="animate-spin" />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#D4AF37' }}>
                Đang đọc dữ liệu mã QR...
              </div>
            </div>
          )}

          {/* Overlay khi quét thành công */}
          {scanSuccessResult && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(6, 78, 59, 0.88)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                gap: 8,
                padding: 20,
                textAlign: 'center',
                zIndex: 20,
                animation: 'fadeIn 0.2s ease'
              }}
            >
              <CheckCircle2 size={46} color="#34D399" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#34D399' }}>
                Đã nhận diện mã QR thành công!
              </span>
              {matchedItemName && (
                <span style={{ fontSize: 12.5, color: '#E2E8F0', fontWeight: 600, maxWidth: 300 }}>
                  {matchedItemName}
                </span>
              )}
              <span style={{ fontSize: 11.5, color: '#A7F3D0', marginTop: 4 }}>
                Đang mở thông tin chi tiết...
              </span>
            </div>
          )}
        </div>

        {/* Thanh công cụ: Mở Camera, Tải ảnh, Đèn pin, Lật camera */}
        <div
          style={{
            padding: '12px 18px',
            background: '#070A12',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {/* Nút Mở máy ảnh chụp trực tiếp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#D4AF37',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Mở camera của thiết bị để chụp mã QR"
            >
              <Camera size={14} />
              <span>Chụp ảnh QR</span>
            </button>

            {/* Nút Tải ảnh có sẵn từ máy */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                fontSize: 12,
                cursor: 'pointer'
              }}
              title="Tải ảnh QR từ thư viện thiết bị"
            >
              <Upload size={14} />
              <span>Tải ảnh</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Đèn pin nếu thiết bị hỗ trợ live stream */}
            {hasTorch && stream && (
              <button
                type="button"
                onClick={toggleTorch}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: isTorchOn ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: isTorchOn ? '#D4AF37' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={isTorchOn ? 'Tắt đèn pin' : 'Bật đèn pin trợ sáng'}
              >
                {isTorchOn ? <ZapOff size={16} /> : <Zap size={16} />}
              </button>
            )}

            {/* Nút lật camera trước / sau */}
            {stream && (
              <button
                type="button"
                onClick={toggleFacingMode}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Đổi camera trước/sau"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Hướng dẫn ngắn chân modal */}
        <div
          style={{
            padding: '10px 20px 14px 20px',
            fontSize: 11.5,
            color: '#94A3B8',
            textAlign: 'center',
            background: '#070A12',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)'
          }}
        >
          Hướng camera vào mã QR dán trên chân đế hiện vật hoặc standee phòng để mở ngay mô hình 3D & Tour 360°.
        </div>
      </div>

      <style>{`
        @keyframes qrLaserScan {
          0% { top: 4%; }
          50% { top: 96%; }
          100% { top: 4%; }
        }
      `}</style>
    </div>
  );
};
