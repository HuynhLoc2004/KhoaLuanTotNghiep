import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Play, Square, Check, RefreshCw, Compass, AlertCircle, Upload, CheckCircle2, RotateCw } from 'lucide-react';

interface LiveCameraSweepCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onFramesCaptured: (files: File[]) => void;
}

const TOTAL_SECTORS = 16; // 16 góc quét x 22.5° = 360° vòng tròn

export const LiveCameraSweepCapture: React.FC<LiveCameraSweepCaptureProps> = ({
  isOpen,
  onClose,
  onFramesCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState<{ url: string; blob: Blob; angle: number }[]>([]);
  const [capturedSectors, setCapturedSectors] = useState<number[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Cảm biến góc xoay và độ nghiêng
  const [currentHeading, setCurrentHeading] = useState<number>(0); // 0 - 360°
  const [deviceTilt, setDeviceTilt] = useState<number>(0);         // -90 to +90°
  const lastCapturedHeadingRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Khởi động Camera và cảm biến con quay hồi chuyển
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // 1. Góc la bàn xoay ngang (Heading / Alpha)
      let heading = 0;
      if ((e as any).webkitCompassHeading !== undefined) {
        // iOS Safari
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android Chrome
        heading = (360 - e.alpha) % 360;
      }
      heading = Math.round(heading);
      setCurrentHeading(heading);

      // 2. Góc nghiêng trước/sau (Pitch / Beta)
      if (e.beta !== null) {
        const tilt = Math.round(e.beta - 90);
        setDeviceTilt(tilt);
      }

      // 3. Tự động bắt khung hình khi người dùng xoay đủ góc (~22.5° mỗi khung hình)
      if (isScanningRef.current) {
        checkAndTriggerAngleCapture(heading);
      }
    };

    // Xin quyền cảm biến trên iOS 13+ nếu cần
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.warn);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      stopCamera();
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại qua mạng HTTP, bạn hãy bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để hệ thống chụp và nạp trực tiếp!'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Camera sau góc rộng
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
    isScanningRef.current = false;
    setIsScanning(false);
  };

  // Tự động kiểm tra và chụp khung hình dựa theo góc xoay thực tế của cơ thể
  const checkAndTriggerAngleCapture = (heading: number) => {
    const sectorIndex = Math.floor(heading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS;

    if (lastCapturedHeadingRef.current === null) {
      // Khung hình đầu tiên
      snapFrame(heading, sectorIndex);
      return;
    }

    // Tính khoảng cách góc quay so với tấm vừa chụp gần nhất
    const diff = Math.abs(heading - lastCapturedHeadingRef.current);
    const angleDistance = Math.min(diff, 360 - diff);

    // Khi người dùng xoay người được ít nhất 20° - 25°
    if (angleDistance >= 22) {
      snapFrame(heading, sectorIndex);
    }
  };

  // Chụp 1 khung hình từ luồng video trực tiếp
  const snapFrame = (angle: number, sectorIndex: number) => {
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
        setCapturedFrames((prev) => [...prev, { url, blob, angle }]);
        setCapturedSectors((prev) => Array.from(new Set([...prev, sectorIndex])));
        lastCapturedHeadingRef.current = angle;

        // Rung nhẹ điện thoại để phản hồi xúc giác
        if ('vibrate' in navigator) {
          navigator.vibrate(40);
        }
      },
      'image/jpeg',
      0.95
    );
  };

  // Bắt đầu / Tạm dừng chế độ quét không gian
  const toggleScanning = () => {
    if (!isScanning) {
      isScanningRef.current = true;
      setIsScanning(true);
      // Chụp góc hiện tại ngay khi bấm bắt đầu
      const sector = Math.floor(currentHeading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS;
      snapFrame(currentHeading, sector);
    } else {
      isScanningRef.current = false;
      setIsScanning(false);
    }
  };

  // Reset xóa tất cả để quét lại từ đầu
  const handleReset = () => {
    setCapturedFrames([]);
    setCapturedSectors([]);
    lastCapturedHeadingRef.current = null;
  };

  // Hoàn tất và gửi các file ảnh đã quét sang bộ ghép
  const handleFinishAndStitch = () => {
    if (capturedFrames.length < 3) {
      alert('Vui lòng quét chụp ít nhất 4 góc xung quanh không gian trước khi ghép.');
      return;
    }

    // Sắp xếp các ảnh theo thứ tự góc quay tự nhiên
    const sorted = [...capturedFrames].sort((a, b) => a.angle - b.angle);

    const files = sorted.map((frame, index) => {
      const filename = `sweep_${String(index).padStart(4, '0')}_deg${Math.round(frame.angle)}.jpg`;
      return new File([frame.blob], filename, { type: 'image/jpeg' });
    });

    onFramesCaptured(files);
    onClose();
  };

  if (!isOpen) return null;

  const coveragePercent = Math.round((capturedSectors.length / TOTAL_SECTORS) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#090D16',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
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
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              Không Gian 360° Studio (Quét Theo Cảm Biến Góc Xoay)
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Xoay người tự do trong phòng — Hệ thống tự động bắt cảnh khi đổi góc và dừng lại khi bạn thấy vừa ý
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
          <div style={{ textAlign: 'center', padding: 30, color: '#EF4444', maxWidth: 480 }}>
            <AlertCircle size={44} style={{ margin: '0 auto 14px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Thông Báo Truy Cập Camera</div>
            <div style={{ fontSize: 13, color: '#CBD5E1', marginBottom: 24, lineHeight: 1.5 }}>
              {cameraError}
            </div>

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
                <span>Thử lại Camera</span>
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
                objectFit: 'cover'
              }}
            />

            {/* 1. AR Horizon Leveling Guide (Đường cân bằng chân trời) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '12%',
                right: '12%',
                height: '2px',
                background: Math.abs(deviceTilt) <= 4 ? '#10B981' : '#F59E0B',
                boxShadow: `0 0 10px ${Math.abs(deviceTilt) <= 4 ? '#10B981' : '#F59E0B'}`,
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
                  background: 'rgba(0,0,0,0.7)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 11,
                  color: Math.abs(deviceTilt) <= 4 ? '#10B981' : '#F59E0B',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {Math.abs(deviceTilt) <= 4 ? '✓ Góc nhìn thẳng chuẩn' : `Nghiêng: ${deviceTilt > 0 ? '+' : ''}${deviceTilt}° (Hãy giữ thẳng máy)`}
              </div>
            </div>

            {/* 2. Center Crosshair */}
            <div
              style={{
                position: 'absolute',
                width: 50,
                height: 50,
                border: '1.5px dashed rgba(255, 255, 255, 0.4)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }}
            />

            {/* 3. 360° Circular Spatial Radar (Vòng tròn la bàn quét không gian) */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              {/* Vòng các điểm sector 360° */}
              {Array.from({ length: TOTAL_SECTORS }).map((_, i) => {
                const angle = (i * (360 / TOTAL_SECTORS)) - 90;
                const rad = (angle * Math.PI) / 180;
                const r = 38;
                const x = 50 + r * Math.cos(rad);
                const y = 50 + r * Math.sin(rad);
                const isCaptured = capturedSectors.includes(i);

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: x - 4,
                      top: y - 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: isCaptured ? '#10B981' : 'rgba(255, 255, 255, 0.25)',
                      boxShadow: isCaptured ? '0 0 6px #10B981' : 'none',
                      transition: 'background 0.2s ease'
                    }}
                  />
                );
              })}

              {/* Kim la bàn xoay theo góc thực */}
              <div
                style={{
                  position: 'absolute',
                  width: 2,
                  height: 36,
                  background: 'linear-gradient(to top, transparent 50%, #EF4444 50%)',
                  transform: `rotate(${currentHeading}deg)`,
                  transformOrigin: '50% 50%',
                  transition: 'transform 0.1s linear'
                }}
              />

              {/* Tâm la bàn */}
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  zIndex: 2
                }}
              />
            </div>

            {/* 4. Banner hướng dẫn quét thông minh */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'rgba(15, 23, 42, 0.85)',
                padding: '8px 16px',
                borderRadius: 20,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <RotateCw size={14} className={isScanning ? 'spin' : ''} style={{ color: '#3B82F6' }} />
              <span>
                {isScanning
                  ? `Đang quét: Xoay người từ từ — Đã bắt ${capturedFrames.length} khung hình (${coveragePercent}% vòng tròn)`
                  : 'Bấm "Bắt đầu quét" rồi xoay người quanh phòng theo tốc độ của bạn'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls & Filmstrip */}
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
        {/* Thanh tiến độ phủ không gian */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8' }}>
          <div>
            Độ phủ không gian 360°: <strong style={{ color: coveragePercent >= 70 ? '#10B981' : '#F59E0B' }}>{coveragePercent}%</strong> ({capturedFrames.length} khung hình)
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>
            * Xoay đến khi bạn thấy đủ các góc phòng mong muốn rồi bấm "Hoàn tất"
          </div>
        </div>

        {/* Thumbnail Filmstrip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', minHeight: 65, padding: '2px 0' }}>
          {capturedFrames.length === 0 ? (
            <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', margin: 'auto' }}>
              Chưa có khung hình nào. Hãy bấm "Bắt đầu quét không gian" và xoay người từ từ.
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
                <img src={frame.url} alt={`Angle ${Math.round(frame.angle)}°`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    background: 'rgba(0,0,0,0.75)',
                    color: '#FFF',
                    fontSize: 9,
                    padding: '1px 3px',
                    borderRadius: 2
                  }}
                >
                  {Math.round(frame.angle)}°
                </span>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <button
            onClick={handleReset}
            disabled={capturedFrames.length === 0}
            style={{
              background: 'none',
              border: 'none',
              color: capturedFrames.length > 0 ? '#EF4444' : '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: capturedFrames.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            Xóa quét lại từ đầu
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Nút chụp góc thủ công nếu muốn */}
            {isScanning && (
              <button
                onClick={() => {
                  const sector = Math.floor(currentHeading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS;
                  snapFrame(currentHeading, sector);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 18px',
                  borderRadius: 30,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Chụp góc này ({currentHeading}°)
              </button>
            )}

            {/* Bắt đầu / Tạm dừng quét */}
            <button
              onClick={toggleScanning}
              style={{
                background: isScanning ? '#EF4444' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
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
                boxShadow: isScanning ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.4)'
              }}
            >
              {isScanning ? <Square size={16} /> : <Play size={16} />}
              <span>{isScanning ? 'Tạm dừng quét' : 'Bắt đầu quét không gian'}</span>
            </button>

            {/* Hoàn tất & Ghép 360 */}
            <button
              onClick={handleFinishAndStitch}
              disabled={capturedFrames.length < 3}
              style={{
                background: capturedFrames.length >= 3 ? '#10B981' : '#334155',
                color: '#FFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 30,
                fontSize: 13.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: capturedFrames.length >= 3 ? 'pointer' : 'not-allowed',
                boxShadow: capturedFrames.length >= 3 ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <Check size={16} />
              <span>Hoàn tất & Ghép 360° ({capturedFrames.length} góc)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
