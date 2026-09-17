import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Play, Square, Check, RefreshCw, Compass, AlertCircle, Upload } from 'lucide-react';

interface LiveCameraSweepCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onFramesCaptured: (files: File[]) => void;
}

export const LiveCameraSweepCapture: React.FC<LiveCameraSweepCaptureProps> = ({
  isOpen,
  onClose,
  onFramesCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<{ url: string; blob: Blob }[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100%
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceTilt, setDeviceTilt] = useState<number>(0);

  const timerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  // Khởi động Camera điện thoại (ưu tiên camera sau)
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    // Lắng nghe cảm biến nghiêng của điện thoại
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) {
        // Góc nghiêng trước/sau (pitch)
        setDeviceTilt(Math.round(e.beta - 90));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      stopCamera();
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Trình duyệt (Chrome/Safari) yêu cầu kết nối bảo mật HTTPS hoặc Localhost để cấp quyền quét video Camera trực tiếp. Khi truy cập qua IP HTTP, bạn hãy bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để hệ thống chụp và nạp ảnh trực tiếp!'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Camera sau
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('[Camera Access Error]:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trên trình duyệt.'
          : `Không thể mở Camera: ${err.message || 'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng.'}`
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    clearInterval(timerRef.current);
    clearInterval(progressIntervalRef.current);
    setIsCapturing(false);
  };

  // Chụp 1 khung hình từ luồng video trực tiếp
  const captureCurrentFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCapturedFrames((prev) => [...prev, { url, blob }]);

        // Hiệu ứng rung nhẹ trên điện thoại nếu có
        if ('vibrate' in navigator) {
          navigator.vibrate(35);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Bắt đầu quy trình quay quét 360° tự động
  const handleStartSweep = () => {
    setCapturedFrames([]);
    setCurrentProgress(0);
    setCountdown(3);

    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countTimer);
        setCountdown(null);
        startActualSweep();
      }
    }, 1000);
  };

  const startActualSweep = () => {
    setIsCapturing(true);
    // Chụp ngay khung hình đầu tiên
    captureCurrentFrame();

    const TOTAL_DURATION_MS = 14000; // 14 giây cho 1 vòng quay
    const FRAME_INTERVAL_MS = 950;   // Cứ 0.95 giây tự động chụp 1 tấm (khoảng 14-15 tấm)
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / TOTAL_DURATION_MS) * 100));
      setCurrentProgress(pct);

      if (elapsed >= TOTAL_DURATION_MS) {
        handleStopSweep();
      }
    }, 100);

    timerRef.current = setInterval(() => {
      captureCurrentFrame();
    }, FRAME_INTERVAL_MS);
  };

  const handleStopSweep = () => {
    clearInterval(timerRef.current);
    clearInterval(progressIntervalRef.current);
    setIsCapturing(false);
  };

  // Hoàn tất và gửi các file ảnh đã chụp sang bộ ghép
  const handleFinishAndStitch = () => {
    if (capturedFrames.length < 3) {
      alert('Vui lòng quay để chụp tối thiểu ít nhất 4 khung hình trước khi ghép.');
      return;
    }

    const files = capturedFrames.map((frame, index) => {
      const filename = `sweep_${String(index).padStart(4, '0')}.jpg`;
      return new File([frame.blob], filename, { type: 'image/jpeg' });
    });

    onFramesCaptured(files);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090D16',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Camera size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              Live 360 Camera Studio (Tự Động Quay Quét)
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Xoay người 1 vòng tròn 360° theo nhịp đếm – Hệ thống tự động bắt khung hình chuẩn
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#FFF',
            padding: 8,
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Camera Viewport Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {cameraError ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#EF4444', maxWidth: 450 }}>
            <AlertCircle size={44} style={{ margin: '0 auto 14px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Lỗi truy cập Camera</div>
            <div style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 20 }}>{cameraError}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <label
                className="btn btn-primary"
                style={{
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 30,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
                }}
              >
                <Camera size={18} />
                <span>Chụp / Chọn ảnh từ Camera điện thoại</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      onFramesCaptured(files);
                      onClose();
                    }
                  }}
                />
              </label>

              <button
                onClick={startCamera}
                className="btn btn-secondary"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 30
                }}
              >
                <RefreshCw size={16} />
                <span>Thử lại Camera Web</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: 'scaleX(1)'
              }}
            />

            {/* AR Horizon Leveling Guide (Đường cân bằng chân trời) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: '2px',
                background: Math.abs(deviceTilt) < 5 ? '#10B981' : '#F59E0B',
                boxShadow: `0 0 10px ${Math.abs(deviceTilt) < 5 ? '#10B981' : '#F59E0B'}`,
                pointerEvents: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.65)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 11,
                  color: Math.abs(deviceTilt) < 5 ? '#10B981' : '#F59E0B',
                  fontWeight: 600
                }}
              >
                {Math.abs(deviceTilt) < 5 ? '✓ Cân bằng chuẩn' : `Nghiêng: ${deviceTilt}°`}
              </div>
            </div>

            {/* Center Crosshair Target */}
            <div
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                border: '1.5px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div
                style={{
                  position: 'absolute',
                  fontSize: '84px',
                  fontWeight: 900,
                  color: '#F59E0B',
                  textShadow: '0 0 30px rgba(245, 158, 11, 0.8)',
                  animation: 'pulse 0.5s infinite'
                }}
              >
                {countdown}
              </div>
            )}

            {/* Top Rotation Guidance Banner */}
            {isCapturing && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  background: 'rgba(37, 99, 235, 0.9)',
                  padding: '8px 20px',
                  borderRadius: 30,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Compass size={16} className="spin" />
                <span>Từ từ xoay người 1 vòng tròn 360° theo chiều kim đồng hồ...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls & Thumbnail Strip */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        {/* Progress Bar during Capture */}
        {isCapturing && (
          <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: 6, borderRadius: 3 }}>
            <div
              style={{
                width: `${currentProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6, #10B981)',
                borderRadius: 3,
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        )}

        {/* Thumbnail Film Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', minHeight: 65, padding: '2px 0' }}>
          {capturedFrames.length === 0 ? (
            <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', margin: 'auto' }}>
              Chưa có khung hình nào. Nhấn "Bắt đầu quay quét" để hệ thống tự động ghi nhận chùm ảnh.
            </div>
          ) : (
            capturedFrames.map((frame, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: 60,
                  height: 60,
                  borderRadius: 6,
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1.5px solid #10B981'
                }}
              >
                <img src={frame.url} alt={`Frame ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFF',
                    fontSize: 9,
                    padding: '1px 3px',
                    borderRadius: 2
                  }}
                >
                  #{i + 1}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ color: '#94A3B8', fontSize: 12 }}>
            Đã thu nhận: <strong style={{ color: '#F8FAFC' }}>{capturedFrames.length}</strong> khung hình
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isCapturing ? (
              <button
                onClick={handleStartSweep}
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: 30,
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
                }}
              >
                <Play size={16} />
                <span>Bắt đầu quay quét 360° (14s)</span>
              </button>
            ) : (
              <button
                onClick={handleStopSweep}
                style={{
                  background: '#EF4444',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 30,
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Square size={16} />
                <span>Dừng quay</span>
              </button>
            )}

            <button
              onClick={handleFinishAndStitch}
              disabled={capturedFrames.length < 3 || isCapturing}
              style={{
                background: capturedFrames.length >= 3 && !isCapturing ? '#10B981' : '#334155',
                color: '#FFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 30,
                fontSize: 13.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: capturedFrames.length >= 3 && !isCapturing ? 'pointer' : 'not-allowed',
                boxShadow: capturedFrames.length >= 3 ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <Check size={16} />
              <span>Chuyển sang Ghép 360° ({capturedFrames.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
