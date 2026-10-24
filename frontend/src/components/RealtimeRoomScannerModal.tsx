import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Layers,
  Loader2,
  RefreshCw,
  Check,
  Upload,
  ShieldCheck,
  Compass,
  RotateCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { API_BASE } from '../services/api';

interface RealtimeRoomScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (result: {
    panoramaUrl: string;
    thumbnailUrl: string;
    totalFrames: number;
    views?: any[];
  }) => void;
}

export interface RoomSector {
  id: number;            // 0..7
  targetAngle: number;   // 0, 45, 90, 135, 180, 225, 270, 315
  label: string;         // 'Chính diện', 'Trước - Phải', 'Bên phải', 'Sau - Phải', 'Phía sau', 'Sau - Trái', 'Bên trái', 'Trước - Trái'
  shortLabel: string;    // '0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°'
  directionName: string; // 'Trước', 'T-Phải', 'Phải', 'S-Phải', 'Sau', 'S-Trái', 'Trái', 'T-Trái'
  isCaptured: boolean;
  thumbnailUrl?: string;
  blob?: Blob;
}

const INITIAL_SECTORS: RoomSector[] = [
  { id: 0, targetAngle: 0, label: 'Chính diện', shortLabel: '0°', directionName: 'Trước', isCaptured: false },
  { id: 1, targetAngle: 45, label: 'Trước - Phải', shortLabel: '45°', directionName: 'T-Phải', isCaptured: false },
  { id: 2, targetAngle: 90, label: 'Bên phải', shortLabel: '90°', directionName: 'Phải', isCaptured: false },
  { id: 3, targetAngle: 135, label: 'Sau - Phải', shortLabel: '135°', directionName: 'S-Phải', isCaptured: false },
  { id: 4, targetAngle: 180, label: 'Phía sau', shortLabel: '180°', directionName: 'Sau', isCaptured: false },
  { id: 5, targetAngle: 225, label: 'Sau - Trái', shortLabel: '225°', directionName: 'S-Trái', isCaptured: false },
  { id: 6, targetAngle: 270, label: 'Bên trái', shortLabel: '270°', directionName: 'Trái', isCaptured: false },
  { id: 7, targetAngle: 315, label: 'Trước - Trái', shortLabel: '315°', directionName: 'T-Trái', isCaptured: false }
];

export const RealtimeRoomScannerModal: React.FC<RealtimeRoomScannerModalProps> = ({
  isOpen,
  onClose,
  onCompleted
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusPollingRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureRef = useRef<HTMLInputElement>(null);

  // Tham chiếu con quay hồi chuyển & căn góc thực tế
  const initialHeadingRef = useRef<number | null>(null);
  const lastHeadingRef = useRef<number>(0);
  const lastCapturedHeadingRef = useRef<number>(-999);
  const steadyTimeRef = useRef<number>(0);
  const stabilityCheckIntervalRef = useRef<any>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInsecureHttp, setIsInsecureHttp] = useState(false);

  // Quản lý 8 cung góc 360°
  const [sectors, setSectors] = useState<RoomSector[]>(INITIAL_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<number>(0);
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [hasGyro, setHasGyro] = useState<boolean>(false);
  const [stabilityProgress, setStabilityProgress] = useState<number>(0);
  const [isAutoDetecting, setIsAutoDetecting] = useState<boolean>(true);
  const [isCapturingFlash, setIsCapturingFlash] = useState<boolean>(false);

  // Tiến trình ghép RabbitMQ / AMQP
  const [isProcessingStitch, setIsProcessingStitch] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [stitchMessage, setStitchMessage] = useState<string>('');
  const [amqpStatus, setAmqpStatus] = useState<'connected' | 'transmitting' | 'idle'>('connected');

  // Tính toán số góc đã chụp và góc còn thiếu
  const capturedCount = sectors.filter((s) => s.isCaptured).length;
  const coveragePercent = Math.round((capturedCount / 8) * 100);
  const missingSectors = sectors.filter((s) => !s.isCaptured);
  const isComplete = capturedCount >= 8;
  const isReadyToStitch = capturedCount >= 6;

  // Xác định góc đang ngắm:
  // - Nếu có con quay hồi chuyển: góc thực tế theo hướng xoay điện thoại
  // - Nếu không có con quay (PC/Laptop): góc người dùng chọn để chụp
  const aimingSectorId = hasGyro ? Math.round(currentHeading / 45) % 8 : selectedSectorId;
  const activeSector = sectors[aimingSectorId] || sectors[0];
  const targetSector = sectors.find((s) => !s.isCaptured) || sectors[0];

  // Dừng camera và giải phóng cảm biến
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (stabilityCheckIntervalRef.current) {
      clearInterval(stabilityCheckIntervalRef.current);
      stabilityCheckIntervalRef.current = null;
    }
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  // Upload frame lên Server theo sectorIndex
  const uploadSectorFrame = useCallback(
    async (blob: Blob, sectorIdx: number, localPreviewUrl: string, currSessionId: string) => {
      try {
        setAmqpStatus('transmitting');
        const formData = new FormData();
        formData.append('sessionId', currSessionId);
        formData.append('sectorIndex', String(sectorIdx));
        formData.append('frame', blob, `frame_sector_${sectorIdx}.jpg`);

        const res = await fetch(`${API_BASE}/stitch/realtime/frame`, {
          method: 'POST',
          body: formData
        });

        const json = await res.json();
        if (json.success && json.frame) {
          // Upload thành công
        }
      } catch (err) {
        console.warn('[Sector Frame Upload Warning]:', err);
      } finally {
        setAmqpStatus('connected');
      }
    },
    []
  );

  // Chụp một khung hình chính xác cho một góc nhất định (sectorIdx: 0..7)
  const captureSector = useCallback(
    (targetSectorIdx: number) => {
      if (!videoRef.current || !isCameraReady || !sessionId) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      if (!fullCanvasRef.current) {
        fullCanvasRef.current = document.createElement('canvas');
      }
      const canvas = fullCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Hiệu ứng nháy máy ảnh & rung phản hồi (haptic)
      setIsCapturingFlash(true);
      setTimeout(() => setIsCapturingFlash(false), 220);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } catch (_) {}

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const localUrl = URL.createObjectURL(blob);

          // Cập nhật trạng thái góc chụp
          setSectors((prev) =>
            prev.map((s) =>
              s.id === targetSectorIdx
                ? {
                    ...s,
                    isCaptured: true,
                    thumbnailUrl: localUrl,
                    blob
                  }
                : s
            )
          );

          lastCapturedHeadingRef.current = currentHeading;
          steadyTimeRef.current = 0;
          setStabilityProgress(0);

          // Nếu thiết bị không có con quay (PC/Laptop), chuyển góc chọn sang góc còn thiếu tiếp theo
          if (!hasGyro) {
            setSectors((latest) => {
              const nextMissing = latest.find((s) => !s.isCaptured && s.id !== targetSectorIdx);
              if (nextMissing) {
                setSelectedSectorId(nextMissing.id);
              }
              return latest;
            });
          }

          // Upload lên server với sectorIndex
          uploadSectorFrame(blob, targetSectorIdx, localUrl, sessionId);
        },
        'image/jpeg',
        0.92
      );
    },
    [isCameraReady, sessionId, hasGyro, currentHeading, uploadSectorFrame]
  );

  // Khởi động phiên quét mới và kết nối Camera
  const initSessionAndCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsInsecureHttp(false);
      setSectors(INITIAL_SECTORS);
      setSelectedSectorId(0);
      setIsProcessingStitch(false);
      setStitchProgress(0);
      initialHeadingRef.current = null;
      lastHeadingRef.current = 0;
      lastCapturedHeadingRef.current = -999;
      steadyTimeRef.current = 0;

      // 1. Khởi tạo phiên quét mới trên Server & RabbitMQ
      let currSessionId = sessionId;
      if (!currSessionId) {
        const res = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét không gian phòng 360 - ${new Date().toLocaleTimeString('vi-VN')}` })
        });
        const json = await res.json();
        if (json.success && json.session) {
          currSessionId = json.session.id;
          setSessionId(json.session.id);
        } else {
          throw new Error(json.message || 'Không thể tạo phiên quét realtime');
        }
      }

      // 2. Kiểm tra hỗ trợ Camera
      const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const hasGetUserMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

      if (!hasGetUserMedia) {
        if (!isSecure && window.location.protocol === 'http:') {
          setIsInsecureHttp(true);
          throw new Error('Chrome/Safari yêu cầu HTTPS để bật Camera trực tiếp.');
        }
        throw new Error('Thiết bị hoặc trình duyệt không tìm thấy phần cứng máy ảnh khả dụng.');
      }

      // 3. Khởi tạo luồng Camera với cơ chế fallback tương thích 100% iOS Safari & Android
      const attempts: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        { video: { facingMode: 'environment' }, audio: false },
        { video: { facingMode: 'user' }, audio: false },
        { video: true, audio: false }
      ];

      let stream: MediaStream | null = null;
      let lastErr: any = null;

      for (const constraint of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          if (stream) break;
        } catch (attemptErr: any) {
          lastErr = attemptErr;
        }
      }

      if (!stream) {
        throw lastErr || new Error('Không thể khởi tạo luồng camera.');
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play().catch(() => undefined);
      }

      setIsCameraReady(true);
    } catch (err: any) {
      console.error('[Realtime Camera Init Error]:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'SecurityError';
      setCameraError(
        isDenied
          ? 'Bạn chưa cấp quyền truy cập Camera. Vui lòng bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ và bật Máy ảnh thành Cho phép.'
          : (err.message || 'Không thể khởi động camera.')
      );
    }
  }, [sessionId]);

  // Quản lý Vòng đời & Cảm biến hướng DeviceOrientation
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    initSessionAndCamera();

    // Xử lý sự kiện con quay hồi chuyển trên điện thoại di động
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let rawHeading: number | null = null;

      // iOS Safari Compass Heading
      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        rawHeading = (e as any).webkitCompassHeading;
      }
      // Android / Standard Alpha (Z-axis rotation)
      else if (e.alpha !== null && e.alpha !== undefined && !isNaN(e.alpha)) {
        rawHeading = (360 - e.alpha) % 360;
      }

      if (rawHeading !== null && !isNaN(rawHeading)) {
        setHasGyro(true);

        // Chuẩn hóa góc ban đầu người dùng đứng đối diện làm mốc 0 độ
        if (initialHeadingRef.current === null) {
          initialHeadingRef.current = rawHeading;
        }

        const rel = (rawHeading - initialHeadingRef.current + 360) % 360;
        setCurrentHeading(rel);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      stopCamera();
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [isOpen, initSessionAndCamera, stopCamera]);

  // Yêu cầu cấp quyền cảm biến hướng cho iOS Safari (cần tương tác người dùng)
  const handleRequestGyroPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const state = await (DeviceOrientationEvent as any).requestPermission();
        if (state === 'granted') {
          setHasGyro(true);
        } else {
          alert('Bạn chưa cấp quyền cảm biến con quay hồi chuyển. Bạn có thể sử dụng chế độ bấm chụp từng góc thủ công.');
        }
      } catch (err) {
        console.warn('Gyro permission error:', err);
      }
    } else {
      alert('Trình duyệt hoặc thiết bị này không hỗ trợ con quay hồi chuyển phần cứng. Hãy sử dụng chế độ bấm chụp từng góc.');
    }
  };

  // Thuật toán kiểm tra độ ổn định & Tự động chụp (CHỈ KÍCH HOẠT KHI CÓ CON QUAY HỒI CHUYỂN THỰC TẾ)
  // Tuyệt đối KHÔNG tự động chụp khi không có cảm biến con quay (trên PC/Laptop) để tránh chụp lặp
  useEffect(() => {
    if (!isCameraReady || isProcessingStitch || !hasGyro) {
      setStabilityProgress(0);
      return;
    }

    if (stabilityCheckIntervalRef.current) {
      clearInterval(stabilityCheckIntervalRef.current);
    }

    stabilityCheckIntervalRef.current = setInterval(() => {
      if (!isAutoDetecting) {
        setStabilityProgress(0);
        return;
      }

      const currentSector = sectors[aimingSectorId];
      // Nếu góc này đã chụp rồi, không bao giờ chụp lại
      if (!currentSector || currentSector.isCaptured) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      // Kiểm tra xem camera đã xoay ít nhất 22 độ so với vị trí chụp trước đó chưa (ngăn chụp lặp một chỗ)
      let headingMoved = Math.abs(currentHeading - lastCapturedHeadingRef.current);
      if (headingMoved > 180) headingMoved = 360 - headingMoved;
      if (lastCapturedHeadingRef.current !== -999 && headingMoved < 22) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      // Kiểm tra độ lệch với góc mục tiêu của sector (±14 độ)
      let diff = Math.abs(currentHeading - currentSector.targetAngle);
      if (diff > 180) diff = 360 - diff;

      if (diff <= 14) {
        const deltaHeading = Math.abs(currentHeading - lastHeadingRef.current);
        lastHeadingRef.current = currentHeading;

        // Nếu tay người dùng giữ êm (độ rung lắc < 2.2 độ)
        if (deltaHeading < 2.2) {
          steadyTimeRef.current += 150;
          const progress = Math.min(100, Math.round((steadyTimeRef.current / 800) * 100));
          setStabilityProgress(progress);

          // Giữ yên liên tục đủ 800ms -> BẬP! Chụp đúng 1 ảnh cho góc này
          if (steadyTimeRef.current >= 800) {
            steadyTimeRef.current = 0;
            setStabilityProgress(0);
            captureSector(currentSector.id);
          }
        } else {
          steadyTimeRef.current = Math.max(0, steadyTimeRef.current - 120);
          setStabilityProgress(Math.min(100, Math.round((steadyTimeRef.current / 800) * 100)));
        }
      } else {
        steadyTimeRef.current = 0;
        setStabilityProgress(0);
      }
    }, 150);

    return () => {
      if (stabilityCheckIntervalRef.current) {
        clearInterval(stabilityCheckIntervalRef.current);
        stabilityCheckIntervalRef.current = null;
      }
    };
  }, [isCameraReady, isProcessingStitch, hasGyro, isAutoDetecting, currentHeading, aimingSectorId, sectors, captureSector]);

  // Đặt lại hướng ban đầu (Hiệu chỉnh lại 0 độ về hướng hiện tại)
  const handleCalibrateHeading = () => {
    if (typeof window !== 'undefined') {
      initialHeadingRef.current = null;
      try {
        if ('vibrate' in navigator) navigator.vibrate(25);
      } catch (_) {}
    }
  };

  // Chuyển hướng nhanh sang HTTPS khi người dùng truy cập qua HTTP
  const handleSwitchToHttps = () => {
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('http:')) {
      window.location.href = currentUrl.replace(/^http:/i, 'https:');
    } else {
      initSessionAndCamera();
    }
  };

  // Hỗ trợ chụp trực tiếp từ máy ảnh native (Dành cho di động / HTTP)
  const handleSimulateStreamFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let currSessionId = sessionId;
    if (!currSessionId) {
      try {
        const res = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét không gian phòng - ${new Date().toLocaleTimeString('vi-VN')}` })
        });
        const json = await res.json();
        if (json.success && json.session) {
          currSessionId = json.session.id;
          setSessionId(json.session.id);
        }
      } catch (sessErr) {
        console.warn('Session create error:', sessErr);
      }
    }
    if (!currSessionId) return;

    setCameraError(null);
    setIsInsecureHttp(false);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localUrl = URL.createObjectURL(file);

      // Điền vào góc đang chọn hoặc góc còn thiếu tiếp theo
      let targetSecIdx = selectedSectorId;
      const targetSec = sectors[targetSecIdx];
      if (targetSec.isCaptured) {
        const nextMissing = sectors.find((s) => !s.isCaptured);
        if (nextMissing) targetSecIdx = nextMissing.id;
      }

      setSectors((prev) =>
        prev.map((s) =>
          s.id === targetSecIdx
            ? {
                ...s,
                isCaptured: true,
                thumbnailUrl: localUrl,
                blob: file
              }
            : s
        )
      );

      await uploadSectorFrame(file, targetSecIdx, localUrl, currSessionId);

      // Nhảy sang góc tiếp theo
      setSelectedSectorId((prev) => (prev + 1) % 8);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    e.target.value = '';
  };

  // Hoàn tất quét & Gửi lệnh ghép ảnh qua RabbitMQ
  const handleFinishAndStitch = async () => {
    if (!sessionId) return;
    if (capturedCount < 6) {
      alert(
        `Bạn mới chụp ${capturedCount}/8 góc phòng. Để tạo không gian toàn cảnh 360° chuẩn không bị méo uốn lượn, vui lòng quay chụp tối thiểu 6 góc (khuyến nghị đủ 8 góc quanh phòng).`
      );
      return;
    }

    try {
      setIsProcessingStitch(true);
      setStitchProgress(15);
      setStitchMessage('Đang đóng gói 8 góc ảnh chuẩn không gian và gửi thông điệp vào RabbitMQ AMQP...');

      const res = await fetch(`${API_BASE}/stitch/realtime/session/${sessionId}/finish`, {
        method: 'POST'
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || 'Lỗi gửi yêu cầu ghép ảnh');
      }

      // Bắt đầu Polling kiểm tra trạng thái Worker
      let attempts = 0;
      statusPollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(`${API_BASE}/stitch/realtime/session/${sessionId}/status`);
          const pollJson = await pollRes.json();
          if (pollJson.success && pollJson.session) {
            const sess = pollJson.session;
            setStitchProgress(sess.progress || Math.min(95, attempts * 5));
            setStitchMessage(sess.message || 'Thuật toán OpenCV đang phân tích điểm đặc trưng RootSIFT...');

            if (sess.status === 'completed' && sess.result) {
              clearInterval(statusPollingRef.current);
              setStitchProgress(100);
              setStitchMessage('Hoàn tất ghép không gian 360° chuẩn bảo tàng!');

              setTimeout(() => {
                onCompleted({
                  panoramaUrl: sess.result.panoramaUrl,
                  thumbnailUrl: sess.result.thumbnailUrl,
                  totalFrames: sess.result.totalFrames,
                  views: sess.result.views
                });
                onClose();
              }, 600);
            } else if (sess.status === 'failed') {
              clearInterval(statusPollingRef.current);
              setIsProcessingStitch(false);
              alert(sess.error || 'Ghép không gian phòng thất bại.');
            }
          }
        } catch (pollErr) {
          console.warn('[Status Poll Warning]:', pollErr);
        }

        if (attempts > 80) {
          clearInterval(statusPollingRef.current);
          setIsProcessingStitch(false);
          alert('Tác vụ ghép mất nhiều thời gian hơn dự kiến. Không gian phòng vẫn đang tiếp tục xử lý trong nền.');
          onClose();
        }
      }, 2000);
    } catch (err: any) {
      setIsProcessingStitch(false);
      alert(err.message || 'Lỗi khi kích hoạt tiến trình ghép 360');
    }
  };

  if (!isOpen) return null;

  // Hướng kim la bàn hiển thị
  const compassNeedleAngle = hasGyro ? currentHeading : activeSector.targetAngle;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        color: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes realtimeSpinKeyframes {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlowTarget {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        .realtime-spinner-rotate {
          animation: realtimeSpinKeyframes 0.9s linear infinite !important;
          transform-origin: center center !important;
        }
        .radar-target-pulse {
          animation: pulseGlowTarget 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Top Bar Header Responsive */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
          borderBottom: '1px solid rgba(212, 168, 106, 0.25)',
          background: 'rgba(18, 16, 14, 0.98)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(212, 168, 106, 0.15)',
              border: '1px solid var(--accent-gold, #d4a86a)',
              flexShrink: 0
            }}
          >
            <Camera size={16} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f5f0eb', letterSpacing: '0.2px' }}>
                Quét không gian phòng 360°
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: isReadyToStitch ? 'rgba(34, 197, 94, 0.2)' : 'rgba(212, 168, 106, 0.2)',
                  color: isReadyToStitch ? '#4ade80' : 'var(--accent-gold, #d4a86a)',
                  border: isReadyToStitch ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(212, 168, 106, 0.35)'
                }}
              >
                {capturedCount}/8 góc ({coveragePercent}%)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#a89f91', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isComplete
                ? 'Đã đủ 8 góc 360°! Bạn có thể bấm Ghép ảnh.'
                : hasGyro
                ? `Xoay máy lần lượt 8 hướng quanh phòng (Còn thiếu ${8 - capturedCount} góc)`
                : `Chế độ bấm chụp từng góc (Chọn góc và bấm nút chụp bên dưới)`}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#d1d5db',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s'
          }}
          title="Đóng máy ảnh"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        {/* Live Camera Stream */}
        <video
          ref={videoRef}
          playsInline
          webkit-playsinline="true"
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Shutter Flash Animation */}
        {isCapturingFlash && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              opacity: 0.65,
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease-out'
            }}
          />
        )}

        {/* VIEWINDER HUD & 360 RADAR COMPASS OVERLAY */}
        <div
          style={{
            position: 'absolute',
            inset: 12,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Top Row: 360° Compass Radar & Direction Guidance */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            {/* 360° Circular Radar Compass Widget */}
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(16, 14, 12, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 16,
                border: '1px solid rgba(212, 168, 106, 0.35)',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
              }}
            >
              {/* Circular SVG Radar */}
              <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                <svg width="72" height="72" viewBox="0 0 100 100">
                  {/* Outer circle track */}
                  <circle cx="50" cy="50" r="42" fill="rgba(0,0,0,0.4)" stroke="rgba(212, 168, 106, 0.3)" strokeWidth="2" strokeDasharray="3 3" />
                  
                  {/* Subtle crosshairs */}
                  <line x1="50" y1="12" x2="50" y2="88" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                  <line x1="12" y1="50" x2="88" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                  {/* 8 Sector Nodes around 360° circle */}
                  {sectors.map((sec) => {
                    const rad = ((sec.targetAngle - 90) * Math.PI) / 180;
                    const cx = 50 + 38 * Math.cos(rad);
                    const cy = 50 + 38 * Math.sin(rad);
                    const isTarget = sec.id === (hasGyro ? targetSector.id : selectedSectorId);

                    return (
                      <g key={sec.id}>
                        {isTarget && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r="8"
                            fill="none"
                            stroke="var(--accent-gold, #d4a86a)"
                            strokeWidth="2"
                            className="radar-target-pulse"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={sec.isCaptured ? 6 : 4.5}
                          fill={sec.isCaptured ? '#22c55e' : isTarget ? 'var(--accent-gold, #d4a86a)' : 'rgba(255,255,255,0.25)'}
                          stroke={sec.isCaptured ? '#15803d' : isTarget ? '#ffffff' : 'rgba(212, 168, 106, 0.4)'}
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}

                  {/* Compass pointer needle indicating orientation */}
                  <g transform={`rotate(${compassNeedleAngle}, 50, 50)`}>
                    <polygon points="50,18 45,50 55,50" fill="var(--accent-gold, #d4a86a)" />
                    <polygon points="50,82 45,50 55,50" fill="rgba(255,255,255,0.3)" />
                    <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
                  </g>
                </svg>

                {/* Reset 0° Calibrate Button (Chỉ khi có gyro) */}
                {hasGyro && (
                  <button
                    type="button"
                    onClick={handleCalibrateHeading}
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(20, 18, 16, 0.9)',
                      border: '1px solid rgba(212, 168, 106, 0.5)',
                      color: 'var(--accent-gold, #d4a86a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    title="Đặt lại hướng chính diện 0°"
                  >
                    <RotateCw size={10} />
                  </button>
                )}
              </div>

              {/* Radar Status Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                  {hasGyro ? 'Góc đang ngắm:' : 'Góc đang chọn:'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: activeSector.isCaptured ? '#4ade80' : 'var(--accent-gold, #d4a86a)' }}>
                  {activeSector.shortLabel} ({activeSector.label})
                </span>
                <span style={{ fontSize: '10px', color: activeSector.isCaptured ? '#22c55e' : '#e5ded5' }}>
                  {activeSector.isCaptured ? '✓ Đã chụp' : 'Chưa chụp'}
                </span>
              </div>
            </div>

            {/* Dynamic Guidance Pill */}
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(16, 14, 12, 0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: 20,
                border: '1px solid rgba(212, 168, 106, 0.35)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                maxWidth: '60%'
              }}
            >
              {hasGyro ? (
                activeSector.isCaptured ? (
                  <>
                    <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#e5e7eb', fontWeight: 500, lineHeight: 1.3 }}>
                      Góc {activeSector.shortLabel} đã có! Xoay tiếp tới góc {targetSector.shortLabel}.
                    </span>
                  </>
                ) : stabilityProgress > 0 ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid var(--accent-gold, #d4a86a)',
                        borderTopColor: 'transparent',
                        flexShrink: 0
                      }}
                      className="realtime-spinner-rotate"
                    />
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold, #d4a86a)', fontWeight: 600 }}>
                      Giữ yên máy {stabilityProgress}%...
                    </span>
                  </>
                ) : (
                  <>
                    <Compass size={14} style={{ color: 'var(--accent-gold, #d4a86a)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#f3f4f6', fontWeight: 500, lineHeight: 1.3 }}>
                      Xoay máy hướng về góc {activeSector.shortLabel} và giữ yên để tự chụp
                    </span>
                  </>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleRequestGyroPermission}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#f3f4f6'
                  }}
                >
                  <Camera size={14} style={{ color: 'var(--accent-gold, #d4a86a)', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: 500, lineHeight: 1.3, textAlign: 'left' }}>
                    Chế độ thủ công: Bấm nút chụp bên dưới để lưu góc {activeSector.shortLabel}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Center Target Crosshair & Stability Ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 160,
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Viewfinder 4 Corner Brackets */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, borderTop: '2px solid rgba(212, 168, 106, 0.8)', borderLeft: '2px solid rgba(212, 168, 106, 0.8)', borderTopLeftRadius: 4 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderTop: '2px solid rgba(212, 168, 106, 0.8)', borderRight: '2px solid rgba(212, 168, 106, 0.8)', borderTopRightRadius: 4 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, borderBottom: '2px solid rgba(212, 168, 106, 0.8)', borderLeft: '2px solid rgba(212, 168, 106, 0.8)', borderBottomLeftRadius: 4 }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderBottom: '2px solid rgba(212, 168, 106, 0.8)', borderRight: '2px solid rgba(212, 168, 106, 0.8)', borderBottomRightRadius: 4 }} />

            {/* Circular Stability Progress Indicator */}
            {stabilityProgress > 0 && !activeSector.isCaptured && (
              <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="42" cy="42" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                <circle
                  cx="42"
                  cy="42"
                  r="34"
                  fill="none"
                  stroke="var(--accent-gold, #d4a86a)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (213.6 * stabilityProgress) / 100}
                  style={{ transition: 'stroke-dashoffset 0.15s ease' }}
                />
              </svg>
            )}

            {/* Center Reticle Dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: activeSector.isCaptured ? '#22c55e' : 'var(--accent-gold, #d4a86a)',
                boxShadow: activeSector.isCaptured
                  ? '0 0 12px rgba(34, 197, 94, 0.8)'
                  : '0 0 12px rgba(212, 168, 106, 0.8)'
              }}
            />
          </div>

          {/* Bottom Missing Angles Pill */}
          <div style={{ alignSelf: 'center', display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                background: 'rgba(20, 18, 16, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '5px 14px',
                borderRadius: 16,
                border: '1px solid rgba(212, 168, 106, 0.25)',
                color: '#e5ded5',
                textAlign: 'center'
              }}
            >
              {isComplete
                ? 'Đã đủ 8/8 góc 360°! Bấm "Ghép ảnh 360°" bên dưới để hoàn tất.'
                : `Còn thiếu: ${missingSectors.map((s) => s.shortLabel).join(', ')}`}
            </span>
          </div>
        </div>

        {/* Camera Error Alert & Fallback Card */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 16,
              background: 'rgba(24, 20, 18, 0.97)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '24px 20px',
              borderRadius: 12,
              border: '1px solid rgba(212, 168, 106, 0.3)',
              textAlign: 'center',
              zIndex: 10,
              maxWidth: 440,
              margin: 'auto',
              maxHeight: '90%',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(212, 168, 106, 0.12)',
                border: '1px solid var(--accent-gold, #d4a86a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Camera size={24} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#f5f0eb' }}>
                {isInsecureHttp ? 'Yêu cầu kết nối an toàn (HTTPS)' : 'Không thể kết nối máy ảnh'}
              </div>
              <div style={{ fontSize: '12px', color: '#a89f91', marginTop: 6, lineHeight: 1.5 }}>
                {isInsecureHttp
                  ? 'Trình duyệt Safari/Chrome trên di động chỉ cho phép bật camera trực tiếp liên tục khi truy cập qua HTTPS. Bạn có thể bấm chuyển sang HTTPS để dùng chế độ tự động, hoặc chụp từng góc bằng máy ảnh bên dưới.'
                  : cameraError}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 4 }}>
              {isInsecureHttp && (
                <button
                  type="button"
                  onClick={handleSwitchToHttps}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f233a 100%)',
                    border: '1px solid rgba(147, 197, 253, 0.4)',
                    color: '#93c5fd',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Chuyển sang kết nối an toàn (HTTPS)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => cameraCaptureRef.current?.click()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #8c2d19 0%, #6e2010 100%)',
                  border: '1px solid rgba(212, 168, 106, 0.4)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Camera size={16} />
                <span>Mở máy ảnh chụp góc {activeSector.shortLabel}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: 'rgba(212, 168, 106, 0.12)',
                  border: '1px solid var(--accent-gold, #d4a86a)',
                  color: 'var(--accent-gold, #d4a86a)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Upload size={15} />
                <span>Tải ảnh từ thư viện thiết bị</span>
              </button>

              <button
                type="button"
                onClick={initSessionAndCamera}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={13} />
                <span>Thử kết nối lại máy ảnh</span>
              </button>
            </div>

            <input
              ref={cameraCaptureRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleSimulateStreamFiles}
            />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSimulateStreamFiles}
            />
          </div>
        )}

        {/* Processing Modal Overlay when Stitching */}
        {isProcessingStitch && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(18, 15, 13, 0.96)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              zIndex: 20
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 68,
                height: 68,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                width="68"
                height="68"
                viewBox="0 0 68 68"
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'rotate(-90deg)'
                }}
              >
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  fill="none"
                  stroke="var(--accent-gold, #d4a86a)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93 - (175.93 * Math.max(0, Math.min(100, stitchProgress))) / 100}
                  style={{
                    transition: 'stroke-dashoffset 0.4s ease'
                  }}
                />
              </svg>

              <Loader2
                size={30}
                className="realtime-spinner-rotate spin"
                style={{
                  color: 'var(--accent-gold, #d4a86a)'
                }}
              />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f5f0eb', textAlign: 'center' }}>
              Đang ghép không gian toàn cảnh 360°...
            </div>
            <div style={{ fontSize: '12px', color: '#a89f91', maxWidth: 360, textAlign: 'center', lineHeight: 1.5 }}>
              {stitchMessage || 'Thuật toán RootSIFT đang nắn thẳng đứng kiến trúc và ghép nối mặt trụ...'}
            </div>

            <div style={{ width: '85%', maxWidth: 280, height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stitchProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #d4a86a 0%, #8c2d19 100%)',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px rgba(212, 168, 106, 0.35)'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#8b8478', fontWeight: 500 }}>
              Tiến độ: {stitchProgress}%
            </span>
          </div>
        )}
      </div>

      {/* 8-SECTOR INTERACTIVE FILMSTRIP GRID */}
      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(18, 16, 14, 0.98)',
          borderTop: '1px solid rgba(212, 168, 106, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          flexShrink: 0,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {sectors.map((sec) => {
          const isActive = sec.id === (hasGyro ? aimingSectorId : selectedSectorId);
          return (
            <div
              key={sec.id}
              onClick={() => setSelectedSectorId(sec.id)}
              style={{
                position: 'relative',
                width: 60,
                height: 58,
                borderRadius: 8,
                overflow: 'hidden',
                border: isActive
                  ? '2px solid var(--accent-gold, #d4a86a)'
                  : sec.isCaptured
                  ? '1px solid rgba(34, 197, 94, 0.6)'
                  : '1px dashed rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
                background: sec.isCaptured ? '#000' : 'rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 8px rgba(212, 168, 106, 0.4)' : 'none'
              }}
              title={`Góc ${sec.shortLabel} (${sec.label})`}
            >
              {sec.thumbnailUrl ? (
                <>
                  <img
                    src={sec.thumbnailUrl}
                    alt={sec.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: '#15803d',
                      borderRadius: '50%',
                      width: 14,
                      height: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={9} style={{ color: '#fff' }} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Camera size={14} style={{ color: isActive ? 'var(--accent-gold, #d4a86a)' : '#6b7280' }} />
                  <span style={{ fontSize: '9px', color: isActive ? 'var(--accent-gold, #d4a86a)' : '#9ca3af', fontWeight: 600 }}>
                    {sec.directionName}
                  </span>
                </div>
              )}

              {/* Bottom Angle Label */}
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 2,
                  fontSize: '9px',
                  fontWeight: 700,
                  background: 'rgba(18, 15, 13, 0.85)',
                  color: sec.isCaptured ? '#4ade80' : '#f5f0eb',
                  padding: '1px 3px',
                  borderRadius: 3
                }}
              >
                {sec.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Control Actions Bottom Bar Responsive for Mobile */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
          background: 'rgba(20, 18, 16, 0.98)',
          borderTop: '1px solid rgba(212, 168, 106, 0.2)',
          gap: 10,
          flexShrink: 0
        }}
      >
        {/* Toggle Tự bắt góc (Chỉ áp dụng khi có cảm biến xoay) */}
        <button
          type="button"
          onClick={() => {
            if (!hasGyro) {
              handleRequestGyroPermission();
            } else {
              setIsAutoDetecting((prev) => !prev);
            }
          }}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: hasGyro && isAutoDetecting ? '1px solid var(--accent-gold, #d4a86a)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: hasGyro && isAutoDetecting ? 'rgba(212, 168, 106, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: hasGyro && isAutoDetecting ? 'var(--accent-gold, #d4a86a)' : '#8b8478',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap'
          }}
        >
          {hasGyro ? <Compass size={13} /> : <Camera size={13} />}
          <span>{hasGyro ? (isAutoDetecting ? 'Tự bắt: Bật' : 'Tự bắt: Tắt') : 'Bật La Bàn'}</span>
        </button>

        {/* Nút chụp góc đang chọn (Shutter Button) */}
        <button
          type="button"
          onClick={() => {
            if (isCameraReady && sessionId) {
              captureSector(activeSector.id);
            } else {
              cameraCaptureRef.current?.click();
            }
          }}
          disabled={isProcessingStitch}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'transparent',
            border: '3px solid rgba(255, 255, 255, 0.85)',
            padding: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isProcessingStitch ? 'not-allowed' : 'pointer',
            transition: 'transform 0.15s ease',
            flexShrink: 0
          }}
          title={`Chụp góc ${activeSector.shortLabel} (${activeSector.label})`}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: activeSector.isCaptured ? '#22c55e' : 'var(--accent-gold, #d4a86a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 700,
              fontSize: '11px',
              transition: 'background 0.2s'
            }}
          >
            {activeSector.shortLabel}
          </div>
        </button>

        {/* Nút Ghép ảnh 360 */}
        <button
          type="button"
          onClick={handleFinishAndStitch}
          disabled={capturedCount === 0 || isProcessingStitch}
          style={{
            padding: '9px 14px',
            borderRadius: 8,
            background: isReadyToStitch
              ? 'linear-gradient(135deg, #8c2d19 0%, #6e2010 100%)'
              : 'rgba(255, 255, 255, 0.08)',
            border: isReadyToStitch
              ? '1px solid rgba(212, 168, 106, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            color: isReadyToStitch ? '#ffffff' : '#8b8478',
            fontSize: '12px',
            fontWeight: 600,
            cursor: capturedCount > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: isReadyToStitch ? '0 4px 14px rgba(140, 45, 25, 0.4)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <Check size={14} />
          <span>Ghép ảnh ({capturedCount}/8)</span>
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
