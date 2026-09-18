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
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Cảm biến góc xoay và độ nghiêng
  const [currentHeading, setCurrentHeading] = useState<number>(0); // 0 - 360°
  const [deviceTilt, setDeviceTilt] = useState<number>(0);         // -90 to +90°
  const [guidanceMessage, setGuidanceMessage] = useState<{ text: string; type: 'info' | 'warning' | 'success'; arrow?: 'left' | 'right' | 'check' }>({
    text: 'Bấm "Bắt đầu quét không gian" rồi hướng thẳng camera về phía trước',
    type: 'info'
  });

  const lastCapturedHeadingRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const capturedSectorsRef = useRef<number[]>([]);
  const isSnappingRef = useRef<boolean>(false);
  const lastSnapTimeRef = useRef<number>(0);
  const audioCtxRef = useRef<any>(null);

  // Giữ ref đồng bộ để event handler dùng giá trị mới nhất
  useEffect(() => {
    capturedSectorsRef.current = capturedSectors;
  }, [capturedSectors]);

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
      let tilt = 0;
      if (e.beta !== null) {
        tilt = Math.round(e.beta - 90);
        setDeviceTilt(tilt);
      }

      // 3. Phân tích hướng dẫn AR thông minh và phát hiện điểm thiếu
      if (isScanningRef.current) {
        analyzeGuidanceAndCapture(heading, tilt);
      }
    };

    // Xin quyền cảm biến trên iOS 13+ nếu có
    try {
      const DevOrient = typeof window !== 'undefined' ? (window as any).DeviceOrientationEvent : null;
      if (DevOrient && typeof DevOrient.requestPermission === 'function') {
        DevOrient.requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted' && typeof window !== 'undefined') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch((err: any) => {
            console.warn('Sensor permission warning:', err);
            if (typeof window !== 'undefined') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          });
      } else if (typeof window !== 'undefined') {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } catch (sensorErr) {
      console.warn('Device orientation init error:', sensorErr);
    }

    return () => {
      stopCamera();
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
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
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play interrupted:', playErr);
        }
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

  // Web Audio Synth Shutter Sound (Tái sử dụng 1 AudioContext duy nhất, chống tràn tài nguyên)
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  const lastHeadingTimeRef = useRef<{ heading: number; time: number } | null>(null);

  // Hệ thống AI Hướng dẫn AR: Định vị góc sót, chỉ hướng lia cam & tự bắt ảnh khi đúng chỗ
  const analyzeGuidanceAndCapture = (heading: number, tilt: number) => {
    const currentSector = Math.floor(heading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS;
    const sectors = capturedSectorsRef.current;
    const isCurrentSectorCaptured = sectors.includes(currentSector);

    // 1. Kiểm tra vận tốc xoay để CHỐNG NHÒE CHUYỂN ĐỘNG (Motion Blur Prevention)
    const now = Date.now();
    let isMovingTooFast = false;
    if (lastHeadingTimeRef.current) {
      const dt = (now - lastHeadingTimeRef.current.time) / 1000;
      if (dt > 0.05 && dt < 0.5) {
        let diff = Math.abs(heading - lastHeadingTimeRef.current.heading);
        if (diff > 180) diff = 360 - diff;
        const speed = diff / dt; // độ / giây
        if (speed > 45) {
          isMovingTooFast = true;
        }
      }
    }
    lastHeadingTimeRef.current = { heading, time: now };

    if (isMovingTooFast) {
      setGuidanceMessage({
        text: '⚡ Đang lia máy hơi nhanh! Hãy xoay chậm lại để ảnh không bị nhòe điểm',
        type: 'warning'
      });
      return; // Không chụp lúc đang lia quá nhanh để bảo toàn độ sắc nét tuyệt đối!
    }

    // 2. Không giới hạn góc nghiêng cứng nhắc, cho phép người dùng tự do ngắm quét không gian (-65° đến +65°)
    // Chỉ tạm dừng nếu máy bị chúc thẳng đứng xuống đất hoặc ngửa thẳng lên trời (trên 75°)
    const isExtremeTilt = Math.abs(tilt) > 75;

    // 3. Khóa chống chụp liên hồi & thời gian nghỉ (Tối thiểu 700ms giữa 2 bức ảnh)
    const canSnapNow =
      !isSnappingRef.current &&
      now - lastSnapTimeRef.current >= 700;

    // Khoảng cách góc so với bức ảnh vừa chụp gần nhất (Tối thiểu 14° mới chụp bức tiếp theo)
    let angleFromLast = 360;
    if (lastCapturedHeadingRef.current !== null) {
      let diff = Math.abs(heading - lastCapturedHeadingRef.current);
      if (diff > 180) diff = 360 - diff;
      angleFromLast = diff;
    }

    // Tự động chụp nếu đi vào một góc chưa từng chụp hoặc xoay đủ bước góc
    if (!isCurrentSectorCaptured && !isExtremeTilt && canSnapNow && angleFromLast >= 14) {
      snapFrame(heading, currentSector);
      setGuidanceMessage({
        text: `✓ Đã bắt nét điểm ảnh góc ${heading}°! Tiếp tục xoay từ từ...`,
        type: 'success',
        arrow: 'check'
      });
      return;
    }

    // Nếu góc hiện tại đã có, kiểm tra xem có góc nào bị bỏ sót không
    const missingSectors: number[] = [];
    for (let i = 0; i < TOTAL_SECTORS; i++) {
      if (!sectors.includes(i)) missingSectors.push(i);
    }

    if (missingSectors.length === 0) {
      setGuidanceMessage({
        text: '🎉 Đã bao phủ trọn vẹn 360° không gian! Bạn có thể bấm "Ghép 360°" ngay.',
        type: 'success',
        arrow: 'check'
      });
      return;
    }

    // Tìm góc thiếu gần nhất so với hướng nhìn hiện tại
    let closestMissingSector = missingSectors[0];
    let minDistance = 360;
    let turnDirection: 'left' | 'right' = 'right';

    missingSectors.forEach((sec) => {
      const secHeading = sec * (360 / TOTAL_SECTORS) + (360 / TOTAL_SECTORS / 2);
      let diff = (secHeading - heading + 360) % 360;
      let dist = diff;
      let dir: 'left' | 'right' = 'right';
      if (diff > 180) {
        dist = 360 - diff;
        dir = 'left';
      }
      if (dist < minDistance) {
        minDistance = dist;
        closestMissingSector = sec;
        turnDirection = dir;
      }
    });

    const targetHeading = Math.round(closestMissingSector * (360 / TOTAL_SECTORS) + (360 / TOTAL_SECTORS / 2));

    if (isExtremeTilt) {
      setGuidanceMessage({
        text: `⚠️ Máy đang bị ngửa/chúc quá mức (${tilt > 0 ? '+' : ''}${tilt}°)! Hãy hướng vào không gian phòng`,
        type: 'warning'
      });
    } else if (minDistance > 20) {
      setGuidanceMessage({
        text: turnDirection === 'right'
          ? `👉 Xoay sang PHẢI về góc ~${targetHeading}° để bù điểm ảnh còn thiếu`
          : `👈 Xoay sang TRÁI về góc ~${targetHeading}° để bù điểm ảnh còn thiếu`,
        type: 'info',
        arrow: turnDirection
      });
    } else {
      setGuidanceMessage({
        text: `Đang ở góc ~${targetHeading}° — Giữ êm máy để tự động chớp khung hình...`,
        type: 'info'
      });
    }
  };

  // Chụp 1 khung hình từ luồng video trực tiếp với KHÓA ĐỒNG BỘ CHỐNG SPAM
  const snapFrame = (angle: number, sectorIndex: number, force = false) => {
    if (!videoRef.current || (isSnappingRef.current && !force)) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    // 1. KHÓA ĐỒNG BỘ TỨC THÌ (ngăn chặn sự kiện 60Hz gọi lặp lại trong khi chưa kịp nén xong)
    isSnappingRef.current = true;
    lastSnapTimeRef.current = Date.now();
    lastCapturedHeadingRef.current = angle;

    // 2. ĐÁNH DẤU SECTOR ĐÃ CHỤP NGAY LẬP TỨC
    const updatedSectors = Array.from(new Set([...capturedSectorsRef.current, sectorIndex]));
    capturedSectorsRef.current = updatedSectors;
    setCapturedSectors(updatedSectors);

    const canvas = canvasRef.current || document.createElement('canvas');

    // 3. Tối ưu kích thước khung ảnh (max 1280px) để giảm tải CPU, nén cực nhanh < 5ms
    let targetWidth = video.videoWidth || 1280;
    let targetHeight = video.videoHeight || 720;
    if (targetWidth > 1280) {
      targetHeight = Math.round((targetHeight * 1280) / targetWidth);
      targetWidth = 1280;
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isSnappingRef.current = false;
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        // Mở khóa sau khi nén xong
        isSnappingRef.current = false;
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        setCapturedFrames((prev) => [...prev, { url, blob, angle }]);

        // Phản hồi âm thanh chớp màn trập máy ảnh & rung xúc giác nhẹ
        playShutterSound();
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(35);
          } catch {}
        }
      },
      'image/jpeg',
      0.82
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
    capturedFrames.forEach((f) => {
      try {
        URL.revokeObjectURL(f.url);
      } catch {}
    });
    setCapturedFrames([]);
    setCapturedSectors([]);
    capturedSectorsRef.current = [];
    lastCapturedHeadingRef.current = null;
    isSnappingRef.current = false;
    lastSnapTimeRef.current = 0;
    setGuidanceMessage({
      text: 'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ',
      type: 'info'
    });
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
          padding: isMobile ? '8px 12px' : '12px 18px',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
          <div
            style={{
              width: isMobile ? 28 : 32,
              height: isMobile ? 28 : 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Compass size={isMobile ? 16 : 18} />
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 700 }}>
              {isMobile ? 'Quét Không Gian 360°' : 'Không Gian 360° Studio (Cảm Biến Góc Xoay)'}
            </div>
            {!isMobile && (
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                Xoay người tự do trong phòng — Hệ thống tự động bắt cảnh khi đổi góc và dừng lại khi bạn thấy vừa ý
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#FFF',
            padding: isMobile ? 6 : 8,
            borderRadius: '50%',
            cursor: 'pointer'
          }}
          aria-label="Đóng studio"
        >
          <X size={isMobile ? 18 : 20} />
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
                background: Math.abs(deviceTilt) <= 15 ? '#10B981' : (deviceTilt < 0 ? '#38BDF8' : '#C084FC'),
                boxShadow: `0 0 10px ${Math.abs(deviceTilt) <= 15 ? '#10B981' : (deviceTilt < 0 ? '#38BDF8' : '#C084FC')}`,
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
                  color: Math.abs(deviceTilt) <= 15 ? '#10B981' : (deviceTilt < 0 ? '#BAE6FD' : '#E9D5FF'),
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {Math.abs(deviceTilt) <= 15
                  ? '✓ Trục nhìn ngang chuẩn'
                  : deviceTilt < 0
                  ? `Góc thấp: ${deviceTilt}° (Quét hiện vật & sàn)`
                  : `Góc cao: +${deviceTilt}° (Quét trần & không gian)`}
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
                top: isMobile ? 10 : 20,
                right: isMobile ? 10 : 20,
                width: isMobile ? 70 : 100,
                height: isMobile ? 70 : 100,
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 15
              }}
            >
              {/* Vòng các điểm sector 360° */}
              {Array.from({ length: TOTAL_SECTORS }).map((_, i) => {
                const angle = (i * (360 / TOTAL_SECTORS)) - 90;
                const rad = (angle * Math.PI) / 180;
                const center = isMobile ? 35 : 50;
                const r = isMobile ? 26 : 38;
                const dotSize = isMobile ? 6 : 8;
                const x = center + r * Math.cos(rad);
                const y = center + r * Math.sin(rad);
                const isCaptured = capturedSectors.includes(i);
                const isCurrent = Math.floor(currentHeading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS === i;

                let dotBg = 'rgba(255, 255, 255, 0.25)';
                let dotShadow = 'none';
                if (isCaptured) {
                  dotBg = '#10B981';
                  dotShadow = '0 0 6px #10B981';
                } else if (isCurrent) {
                  dotBg = '#3B82F6';
                  dotShadow = '0 0 8px #3B82F6';
                }

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: x - dotSize / 2,
                      top: y - dotSize / 2,
                      width: dotSize,
                      height: dotSize,
                      borderRadius: '50%',
                      background: dotBg,
                      boxShadow: dotShadow,
                      transition: 'all 0.2s ease'
                    }}
                  />
                );
              })}

              {/* Kim la bàn xoay theo góc thực */}
              <div
                style={{
                  position: 'absolute',
                  width: 2,
                  height: isMobile ? 24 : 36,
                  background: 'linear-gradient(to top, transparent 50%, #EF4444 50%)',
                  transform: `rotate(${currentHeading}deg)`,
                  transformOrigin: '50% 50%',
                  transition: 'transform 0.1s linear'
                }}
              />

              {/* Tâm la bàn */}
              <div
                style={{
                  width: isMobile ? 6 : 10,
                  height: isMobile ? 6 : 10,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  zIndex: 2
                }}
              />
            </div>

            {/* 4. AR Smart Guidance Overlay (Chỉ dẫn di chuyển camera thông minh) */}
            <div
              style={{
                position: 'absolute',
                top: isMobile ? 90 : 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? 'calc(100% - 24px)' : 'auto',
                maxWidth: '85%',
                background: guidanceMessage.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.95)'
                  : guidanceMessage.type === 'success'
                  ? 'rgba(16, 185, 129, 0.95)'
                  : 'rgba(15, 23, 42, 0.92)',
                color: '#FFFFFF',
                padding: isMobile ? '7px 14px' : '10px 20px',
                borderRadius: 30,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textAlign: 'center',
                zIndex: 12,
                backdropFilter: 'blur(10px)'
              }}
            >
              {guidanceMessage.type === 'warning' ? (
                <AlertCircle size={isMobile ? 15 : 18} style={{ flexShrink: 0 }} />
              ) : guidanceMessage.type === 'success' ? (
                <CheckCircle2 size={isMobile ? 15 : 18} style={{ flexShrink: 0 }} />
              ) : (
                <Compass size={isMobile ? 15 : 18} style={{ flexShrink: 0 }} />
              )}
              <span>{guidanceMessage.text}</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls & Filmstrip */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          padding: isMobile ? '10px 14px' : '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 8 : 12
        }}
      >
        {/* Thanh tiến độ phủ không gian */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: isMobile ? 11 : 12, color: '#94A3B8' }}>
          <div>
            Độ phủ 360°: <strong style={{ color: coveragePercent >= 70 ? '#10B981' : '#F59E0B' }}>{coveragePercent}%</strong> ({capturedFrames.length} góc)
          </div>
          <div style={{ fontSize: 10.5, color: '#64748B' }}>
            {coveragePercent >= 70 ? '✓ Đủ góc nhìn' : 'Xoay quanh phòng để quét đủ góc'}
          </div>
        </div>

        {/* Thumbnail Filmstrip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', minHeight: isMobile ? 50 : 65, padding: '2px 0' }}>
          {capturedFrames.length === 0 ? (
            <div style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic', margin: 'auto' }}>
              Chưa có ảnh. Bấm "Bắt đầu quét" và xoay người từ từ.
            </div>
          ) : (
            capturedFrames.map((frame, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: isMobile ? 48 : 60,
                  height: isMobile ? 48 : 60,
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
                    fontSize: 8.5,
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

        {/* Action Buttons: Responsive Layout */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
            {/* Hàng nút hành động chính */}
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={toggleScanning}
                style={{
                  flex: 1,
                  background: isScanning ? '#EF4444' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {isScanning ? <Square size={14} /> : <Play size={14} />}
                <span>{isScanning ? 'Tạm dừng' : 'Bắt đầu quét'}</span>
              </button>

              {capturedFrames.length >= 3 && (
                <button
                  onClick={handleFinishAndStitch}
                  style={{
                    flex: 1,
                    background: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Check size={14} />
                  <span>Ghép 360° ({capturedFrames.length})</span>
                </button>
              )}
            </div>

            {/* Hàng nút phụ */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <button
                onClick={handleReset}
                disabled={capturedFrames.length === 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: capturedFrames.length > 0 ? '#EF4444' : '#475569',
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '4px 8px'
                }}
              >
                Xóa quét lại
              </button>

              {isScanning && (
                <button
                  onClick={() => {
                    const sector = Math.floor(currentHeading / (360 / TOTAL_SECTORS)) % TOTAL_SECTORS;
                    snapFrame(currentHeading, sector, true);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFF',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  📸 + Chụp góc {currentHeading}°
                </button>
              )}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
