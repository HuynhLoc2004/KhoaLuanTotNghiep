import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { X, Camera, Zap, ZapOff, RefreshCw, Upload, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Artifact, MuseumRoom } from '../../types';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanSuccessResult, setScanSuccessResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // Phát âm thanh tiếng "Beep" thông báo quét thành công qua Web Audio API (không cần tải file ngoài)
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

  // Khởi động Camera trình duyệt
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    setErrorMsg(null);
    setScanSuccessResult(null);
    setIsScanning(true);
    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
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
        videoRef.current.setAttribute('playsinline', 'true'); // Cần thiết trên iOS Safari
        await videoRef.current.play();
      }

      // Kiểm tra hỗ trợ đèn Flash/Torch
      const track = mediaStream.getVideoTracks()[0];
      const capabilities: any = track?.getCapabilities ? track.getCapabilities() : {};
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('[QRScanner] Lỗi mở camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng bật quyền Camera trong cài đặt để quét mã.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('Không tìm thấy thiết bị Camera trên máy này.');
      } else {
        setErrorMsg('Không thể khởi động Camera. Bạn có thể chọn tải ảnh mã QR bên dưới.');
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

  // Vòng lặp quét từng frame qua Canvas & jsQR
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

  // Xử lý dữ liệu khi quét trúng mã QR
  const handleQRCodeDetected = (rawData: string) => {
    setIsScanning(false);
    playBeep();
    setScanSuccessResult(rawData);

    console.log('[QRScanner] Đã quét thành công mã QR:', rawData);

    // 1. Phân tích nội dung mã QR:
    // Trường hợp 1: Chứa đường dẫn hiện vật (VD: /artifact/65f... hoặc ?artifact=65f...)
    let targetArtifactId: string | null = null;
    let targetRoomId: string | null = null;

    try {
      if (rawData.includes('artifact=') || rawData.includes('/artifact/')) {
        if (rawData.includes('artifact=')) {
          const urlObj = new URL(rawData, window.location.origin);
          targetArtifactId = urlObj.searchParams.get('artifact');
        } else if (rawData.includes('/artifact/')) {
          const parts = rawData.split('/artifact/')[1];
          if (parts) targetArtifactId = parts.split(/[?#&/]/)[0];
        }
      } else if (rawData.includes('room=') || rawData.includes('/tour/') || rawData.includes('/rooms/')) {
        if (rawData.includes('room=')) {
          const urlObj = new URL(rawData, window.location.origin);
          targetRoomId = urlObj.searchParams.get('room');
        } else if (rawData.includes('/tour/')) {
          const parts = rawData.split('/tour/')[1];
          if (parts) targetRoomId = parts.split(/[?#&/]/)[0];
        }
      }
    } catch {}

    // Nếu không khớp URL, kiểm tra trực tiếp với ID hoặc Mã Code trong CSDL
    if (!targetArtifactId) {
      const matchedArt = artifacts.find(
        (a) => a.id === rawData || a.code === rawData || rawData.includes(a.id) || (a.code && rawData.includes(a.code))
      );
      if (matchedArt) {
        targetArtifactId = matchedArt.id;
      }
    }

    if (!targetRoomId) {
      const matchedRoom = rooms.find(
        (r) => r.id === rawData || r.code === rawData || rawData.includes(r.id) || (r.code && rawData.includes(r.code))
      );
      if (matchedRoom) {
        targetRoomId = matchedRoom.id;
      }
    }

    // Thực hiện điều hướng sau 400ms để người dùng thấy hiệu ứng thành công
    setTimeout(() => {
      if (targetArtifactId && onSelectArtifactDetail) {
        onClose();
        onSelectArtifactDetail(targetArtifactId);
      } else if (targetRoomId && onSelectRoomForTour) {
        const foundRoom = rooms.find((r) => r.id === targetRoomId || r.code === targetRoomId);
        if (foundRoom) {
          onClose();
          onSelectRoomForTour(foundRoom);
        } else {
          onClose();
        }
      } else {
        // Nếu là URL bên ngoài hoặc chuỗi khác, mở nếu là link hoặc hiển thị thông báo
        if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
          window.location.href = rawData;
        } else {
          alert(`Nội dung mã QR: ${rawData}`);
          onClose();
        }
      }
    }, 500);
  };

  // Quét ảnh QR từ thư viện tệp nếu camera bị chặn
  const handleUploadQRImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQRCodeDetected(code.data);
        } else {
          setErrorMsg('Không tìm thấy mã QR hợp lệ trong bức ảnh này. Vui lòng thử lại với ảnh rõ nét hơn.');
        }
      };
    };
    reader.readAsDataURL(file);
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
          {/* Video stream thực tế */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Canvas ẩn để trích xuất frame */}
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
            {/* 4 Góc ngắm kim loại */}
            <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', borderTopLeftRadius: 12 }} />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', borderTopRightRadius: 12 }} />
            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid #D4AF37', borderLeft: '4px solid #D4AF37', borderBottomLeftRadius: 12 }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid #D4AF37', borderRight: '4px solid #D4AF37', borderBottomRightRadius: 12 }} />

            {/* Tia Laser Quét chuyển động lên xuống */}
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

            {/* Thông báo quét thành công */}
            {scanSuccessResult && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(16, 185, 129, 0.25)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  gap: 8,
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <CheckCircle2 size={42} color="#10B981" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                  Đã nhận diện mã QR!
                </span>
                <span style={{ fontSize: 11, color: '#E2E8F0' }}>Đang mở chi tiết...</span>
              </div>
            )}
          </div>

          {/* Lỗi nếu camera bị chặn */}
          {errorMsg && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(11, 15, 25, 0.95)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 12
              }}
            >
              <AlertCircle size={36} color="#EF4444" />
              <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>{errorMsg}</div>
              <button
                type="button"
                onClick={startCamera}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFF',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Thử lại Camera
              </button>
            </div>
          )}
        </div>

        {/* Thanh công cụ phụ: Đèn pin, Đổi camera, Tải ảnh */}
        <div
          style={{
            padding: '14px 20px',
            background: '#070A12',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          {/* Tải ảnh từ thư viện */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUploadQRImage}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                fontSize: 12,
                cursor: 'pointer'
              }}
              title="Tải ảnh QR từ điện thoại"
            >
              <Upload size={14} />
              <span>Tải ảnh QR</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Đèn pin nếu thiết bị hỗ trợ */}
            {hasTorch && (
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
