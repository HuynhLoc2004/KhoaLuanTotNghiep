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
  AlertCircle,
  Sparkles
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

const SECTORS_8: RoomSector[] = [
  { id: 0, targetAngle: 0, label: 'Chính diện', shortLabel: '0°', directionName: 'Trước', isCaptured: false },
  { id: 1, targetAngle: 45, label: 'Trước - Phải', shortLabel: '45°', directionName: 'T-Phải', isCaptured: false },
  { id: 2, targetAngle: 90, label: 'Bên phải', shortLabel: '90°', directionName: 'Phải', isCaptured: false },
  { id: 3, targetAngle: 135, label: 'Sau - Phải', shortLabel: '135°', directionName: 'S-Phải', isCaptured: false },
  { id: 4, targetAngle: 180, label: 'Phía sau', shortLabel: '180°', directionName: 'Sau', isCaptured: false },
  { id: 5, targetAngle: 225, label: 'Sau - Trái', shortLabel: '225°', directionName: 'S-Trái', isCaptured: false },
  { id: 6, targetAngle: 270, label: 'Bên trái', shortLabel: '270°', directionName: 'Trái', isCaptured: false },
  { id: 7, targetAngle: 315, label: 'Trước - Trái', shortLabel: '315°', directionName: 'T-Trái', isCaptured: false }
];

const SECTORS_12: RoomSector[] = [
  { id: 0, targetAngle: 0, label: 'Chính diện (0°)', shortLabel: '0°', directionName: '0°', isCaptured: false },
  { id: 1, targetAngle: 30, label: 'Trước - Phải 1', shortLabel: '30°', directionName: '30°', isCaptured: false },
  { id: 2, targetAngle: 60, label: 'Trước - Phải 2', shortLabel: '60°', directionName: '60°', isCaptured: false },
  { id: 3, targetAngle: 90, label: 'Bên phải (90°)', shortLabel: '90°', directionName: 'Phải', isCaptured: false },
  { id: 4, targetAngle: 120, label: 'Sau - Phải 1', shortLabel: '120°', directionName: '120°', isCaptured: false },
  { id: 5, targetAngle: 150, label: 'Sau - Phải 2', shortLabel: '150°', directionName: '150°', isCaptured: false },
  { id: 6, targetAngle: 180, label: 'Phía sau (180°)', shortLabel: '180°', directionName: 'Sau', isCaptured: false },
  { id: 7, targetAngle: 210, label: 'Sau - Trái 1', shortLabel: '210°', directionName: '210°', isCaptured: false },
  { id: 8, targetAngle: 240, label: 'Sau - Trái 2', shortLabel: '240°', directionName: '240°', isCaptured: false },
  { id: 9, targetAngle: 270, label: 'Bên trái (270°)', shortLabel: '270°', directionName: 'Trái', isCaptured: false },
  { id: 10, targetAngle: 300, label: 'Trước - Trái 1', shortLabel: '300°', directionName: '300°', isCaptured: false },
  { id: 11, targetAngle: 330, label: 'Trước - Trái 2', shortLabel: '330°', directionName: '330°', isCaptured: false }
];

const INITIAL_SECTORS: RoomSector[] = SECTORS_8;

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

  // Quản lý cung góc 360° & Chế độ ống kính
  const [angleMode, setAngleMode] = useState<'8' | '12'>('8');
  const [lensMode, setLensMode] = useState<'0.5x' | '1x'>('0.5x');
  const [showNativeCamPrompt, setShowNativeCamPrompt] = useState<boolean>(false);
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null);

  const [sectors, setSectors] = useState<RoomSector[]>(SECTORS_8);
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
  const totalSectors = sectors.length;
  const capturedCount = sectors.filter((s) => s.isCaptured).length;
  const coveragePercent = Math.round((capturedCount / totalSectors) * 100);
  const missingSectors = sectors.filter((s) => !s.isCaptured);
  const isComplete = capturedCount >= totalSectors;
  const minRequired = totalSectors === 8 ? 6 : 8;
  const isReadyToStitch = capturedCount >= minRequired;

  // Xác định góc mục tiêu:
  // - Nếu có con quay hồi chuyển: góc thực tế theo hướng xoay điện thoại
  // - Nếu không có con quay (PC/Laptop hoặc chưa bật la bàn): góc người dùng đang được hệ thống hướng dẫn
  const stepAngle = 360 / totalSectors;
  const aimingSectorId = hasGyro ? Math.round(currentHeading / stepAngle) % totalSectors : selectedSectorId;
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

          // Cập nhật trạng thái góc chụp & tự động chỉ dẫn góc còn thiếu tiếp theo
          setSectors((prev) => {
            const updated = prev.map((s) =>
              s.id === targetSectorIdx
                ? {
                    ...s,
                    isCaptured: true,
                    thumbnailUrl: localUrl,
                    blob
                  }
                : s
            );

            // Tìm góc còn thiếu tiếp theo để hướng kim la bàn và chỉ dẫn
            const nextMissing = updated.find((s) => !s.isCaptured && s.id !== targetSectorIdx);
            if (nextMissing) {
              setSelectedSectorId(nextMissing.id);
            }

            return updated;
          });

          lastCapturedHeadingRef.current = currentHeading;
          steadyTimeRef.current = 0;
          setStabilityProgress(0);

          // Upload lên server với sectorIndex
          uploadSectorFrame(blob, targetSectorIdx, localUrl, sessionId);
        },
        'image/jpeg',
        0.92
      );
    },
    [isCameraReady, sessionId, currentHeading, uploadSectorFrame]
  );

  // Xử lý sự kiện con quay hồi chuyển trên điện thoại di động
  const handleOrientation = useCallback((e: any) => {
    let rawHeading: number | null = null;

    // iOS Safari Compass Heading (0 = North, clockwise)
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      rawHeading = e.webkitCompassHeading;
    }
    // Android / Standard alpha (0..360)
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
  }, []);

  // Yêu cầu cấp quyền cảm biến hướng cho iOS Safari (cần tương tác chạm của người dùng)
  const handleRequestGyroPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const state = await (DeviceOrientationEvent as any).requestPermission();
        if (state === 'granted') {
          setHasGyro(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
          window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
        } else {
          alert('Bạn chưa cấp quyền cảm biến con quay hồi chuyển trên điện thoại. Hãy dùng chế độ bấm chụp từng góc.');
        }
      } catch (err) {
        console.warn('Gyro permission error:', err);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      setHasGyro(true);
    }
  }, [handleOrientation]);

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

      // Tự động kiểm tra và kích hoạt góc siêu rộng 0.5x nếu phần cứng hỗ trợ
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const caps: any = (videoTrack.getCapabilities && videoTrack.getCapabilities()) || {};
          if (caps.zoom) {
            setZoomRange({ min: caps.zoom.min || 1, max: caps.zoom.max || 1 });
            if (caps.zoom.min !== undefined && caps.zoom.min <= 0.8) {
              await videoTrack.applyConstraints({
                advanced: [{ zoom: caps.zoom.min } as any]
              });
              setLensMode('0.5x');
            }
          }
        } catch (zoomErr) {
          console.warn('[Zoom Init Warning]:', zoomErr);
        }
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

  // Chuyển đổi ống kính: 0.5x Siêu Rộng hoặc 1x Tiêu chuẩn
  const handleSwitchLens = useCallback(
    async (mode: '0.5x' | '1x') => {
      setLensMode(mode);
      if (!streamRef.current) return;
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;

      let zoomSuccess = false;
      try {
        const caps: any = (track.getCapabilities && track.getCapabilities()) || {};
        if (caps.zoom) {
          const targetZoom = mode === '0.5x' ? (caps.zoom.min || 0.5) : 1.0;
          await track.applyConstraints({
            advanced: [{ zoom: targetZoom } as any]
          });
          zoomSuccess = true;
        }
      } catch (err) {
        console.warn('[Switch Lens Zoom Error]:', err);
      }

      // Nếu trình duyệt (đặc biệt Safari trên iOS) không cho zoom WebRTC sang 0.5x
      if (mode === '0.5x' && !zoomSuccess) {
        setShowNativeCamPrompt(true);
      }
    },
    []
  );

  // Chuyển đổi giữa Chế độ 8 góc (cho cam 0.5x) và Chế độ 12 góc (cho cam 1x)
  const handleSwitchAngleMode = useCallback(
    (newMode: '8' | '12') => {
      if (capturedCount > 0) {
        const confirmChange = window.confirm(
          `Bạn đã chụp ${capturedCount} góc. Việc đổi chế độ sang ${newMode} góc sẽ làm mới lại danh sách các góc chụp để chia đều chu vi 360°. Bạn có muốn tiếp tục?`
        );
        if (!confirmChange) return;
      }
      setAngleMode(newMode);
      setSectors(newMode === '8' ? SECTORS_8 : SECTORS_12);
      setSelectedSectorId(0);
      initialHeadingRef.current = null;
      lastHeadingRef.current = 0;
      lastCapturedHeadingRef.current = -999;
      steadyTimeRef.current = 0;
      setStabilityProgress(0);
    },
    [capturedCount]
  );

  // Quản lý Vòng đời & Cảm biến hướng DeviceOrientation
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    initSessionAndCamera();

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation, true);
    }

    return () => {
      stopCamera();
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation, true);
      }
    };
  }, [isOpen, initSessionAndCamera, stopCamera, handleOrientation]);

  // Thuật toán kiểm tra độ ổn định & Tự động chụp (CHỈ KÍCH HOẠT KHI CÓ CON QUAY HỒI CHUYỂN THỰC TẾ)
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
      if (!currentSector || currentSector.isCaptured) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      // Kiểm tra xem camera đã xoay ít nhất một khoảng hợp lý so với vị trí chụp trước đó chưa
      let headingMoved = Math.abs(currentHeading - lastCapturedHeadingRef.current);
      if (headingMoved > 180) headingMoved = 360 - headingMoved;
      const minStepThreshold = (360 / totalSectors) * 0.45;
      if (lastCapturedHeadingRef.current !== -999 && headingMoved < minStepThreshold) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      // Kiểm tra độ lệch với góc mục tiêu của sector
      let diff = Math.abs(currentHeading - currentSector.targetAngle);
      if (diff > 180) diff = 360 - diff;
      const maxTolerance = (360 / totalSectors) * 0.32; // ~14° cho 8 góc, ~9.6° cho 12 góc

      if (diff <= maxTolerance) {
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
      setSelectedSectorId((prev) => (prev + 1) % totalSectors);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    e.target.value = '';
  };

  // Hoàn tất quét & Gửi lệnh ghép ảnh qua RabbitMQ
  const handleFinishAndStitch = async () => {
    if (!sessionId) return;
    if (capturedCount < minRequired) {
      alert(
        `Bạn mới chụp ${capturedCount}/${totalSectors} góc phòng. Để tạo không gian toàn cảnh 360° chuẩn không bị méo uốn lượn, vui lòng quay chụp tối thiểu ${minRequired} góc (khuyến nghị đủ ${totalSectors} góc quanh phòng).`
      );
      return;
    }

    try {
      setIsProcessingStitch(true);
      setStitchProgress(15);
      setStitchMessage(`Đang đóng gói ${capturedCount} góc ảnh chuẩn không gian và gửi thông điệp vào RabbitMQ AMQP...`);

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

  // Hướng kim la bàn hiển thị:
  // - Khi có con quay hồi chuyển: kim xoay theo góc thực tế của điện thoại
  // - Khi ở chế độ thủ công (chưa bật la bàn): kim chỉ tới góc đang được hướng dẫn chụp
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
        @keyframes bounceGlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .realtime-spinner-rotate {
          animation: realtimeSpinKeyframes 0.9s linear infinite !important;
          transform-origin: center center !important;
        }
        .radar-target-pulse {
          animation: pulseGlowTarget 1.5s ease-in-out infinite;
        }
        .bounce-banner {
          animation: bounceGlow 1.8s ease-in-out infinite;
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
                {capturedCount}/{totalSectors} góc ({coveragePercent}%)
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#a89f91', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isComplete
                ? `Đã đủ ${totalSectors} góc 360°! Bạn có thể bấm Ghép ảnh.`
                : hasGyro
                ? `Xoay máy lần lượt ${totalSectors} hướng quanh phòng (Còn thiếu ${totalSectors - capturedCount} góc)`
                : `Lần lượt xoay máy chụp ${totalSectors} góc quanh phòng (Còn thiếu ${totalSectors - capturedCount} góc)`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Nút chuyển đổi chế độ 8 góc (0.5x Siêu rộng) vs 12 góc (1x Chuẩn) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: 2,
              border: '1px solid rgba(212, 168, 106, 0.3)'
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchAngleMode('8')}
              style={{
                border: 'none',
                background: angleMode === '8' ? 'var(--accent-gold, #d4a86a)' : 'transparent',
                color: angleMode === '8' ? '#000' : '#d1d5db',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 12,
                cursor: 'pointer'
              }}
              title="8 góc (Khuyên dùng khi có camera 0.5x)"
            >
              8 góc (0.5x)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAngleMode('12')}
              style={{
                border: 'none',
                background: angleMode === '12' ? 'var(--accent-gold, #d4a86a)' : 'transparent',
                color: angleMode === '12' ? '#000' : '#d1d5db',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 12,
                cursor: 'pointer'
              }}
              title="12 góc (Khuyên dùng khi máy chỉ có camera 1x)"
            >
              12 góc (1x)
            </button>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
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

                  {/* Reset 0° Calibrate Button */}
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
                    {hasGyro ? 'Góc đang ngắm:' : 'Góc mục tiêu:'}
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
                  maxWidth: '55%'
                }}
              >
                {hasGyro ? (
                  activeSector.isCaptured ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: '#4ade80', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#e5e7eb', fontWeight: 500, lineHeight: 1.3 }}>
                        Đã xong {activeSector.shortLabel}! Xoay tiếp tới góc {targetSector.shortLabel}.
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
                        Xoay máy về góc {activeSector.shortLabel} và giữ yên để tự chụp
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <Compass size={14} style={{ color: 'var(--accent-gold, #d4a86a)', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#f3f4f6', fontWeight: 500, lineHeight: 1.3 }}>
                      Xoay máy về hướng {activeSector.shortLabel} ({activeSector.directionName}) rồi bấm nút chụp
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Nút Kích hoạt La Bàn Tự Động cực kỳ nổi bật trên iPhone / Safari nếu chưa bật */}
            {!hasGyro && (
              <div style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'auto', width: '100%' }}>
                <button
                  type="button"
                  onClick={handleRequestGyroPermission}
                  className="bounce-banner"
                  style={{
                    background: 'linear-gradient(135deg, #8c2d19 0%, #b45309 50%, #d4a86a 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: 24,
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(180, 83, 9, 0.55)',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={15} />
                  <span>Chạm vào đây để Bật La Bàn Tự Động Xoay (iOS)</span>
                </button>
              </div>
            )}
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

          {/* Lens FOV Mode Switcher (0.5x Siêu Rộng vs 1x Chuẩn) */}
          <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, pointerEvents: 'auto' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(20, 18, 16, 0.88)',
                backdropFilter: 'blur(8px)',
                padding: '3px 6px',
                borderRadius: 20,
                border: '1px solid rgba(212, 168, 106, 0.45)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              <button
                type="button"
                onClick={() => handleSwitchLens('0.5x')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 14,
                  border: 'none',
                  background: lensMode === '0.5x' ? 'linear-gradient(135deg, #d4a86a 0%, #b45309 100%)' : 'transparent',
                  color: lensMode === '0.5x' ? '#000000' : '#d1d5db',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Góc siêu rộng 0.5x: Ôm trọn cả trần nhà & sàn gạch phòng"
              >
                0.5x Siêu Rộng
              </button>

              <button
                type="button"
                onClick={() => handleSwitchLens('1x')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 14,
                  border: 'none',
                  background: lensMode === '1x' ? 'linear-gradient(135deg, #d4a86a 0%, #b45309 100%)' : 'transparent',
                  color: lensMode === '1x' ? '#000000' : '#d1d5db',
                  fontWeight: 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Góc 1x chuẩn"
              >
                1x Chuẩn
              </button>
            </div>

            {/* Bottom Missing Angles Pill */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                background: 'rgba(20, 18, 16, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: 16,
                border: '1px solid rgba(212, 168, 106, 0.25)',
                color: '#e5ded5',
                textAlign: 'center'
              }}
            >
              {isComplete
                ? `Đã đủ ${totalSectors}/${totalSectors} góc 360°! Bấm "Ghép ảnh 360°" bên dưới để hoàn tất.`
                : `Còn thiếu: ${missingSectors.map((s) => s.shortLabel).join(', ')}`}
            </span>
          </div>
        </div>

        {/* Thông báo hướng dẫn mở Camera Gốc 0.5x trên iPhone / Android khi WebRTC bị giới hạn */}
        {showNativeCamPrompt && (
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(24, 20, 18, 0.97)',
              border: '1px solid var(--accent-gold, #d4a86a)',
              borderRadius: 14,
              padding: '12px 16px',
              maxWidth: '92%',
              width: 380,
              zIndex: 30,
              boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              pointerEvents: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={15} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold, #d4a86a)' }}>
                  Chụp góc Siêu Rộng 0.5x sắc nét
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNativeCamPrompt(false)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#e5e7eb', margin: 0, lineHeight: 1.45 }}>
              Trình duyệt Safari/Chrome bảo mật không cho đổi phần cứng sang 0.5x trực tiếp qua Web. Bạn hãy bấm nút bên dưới để mở <b>Máy ảnh gốc của điện thoại</b> và chạm vào số <b>0.5</b> để chụp bao trọn cả trần lẫn sàn!
            </p>
            <button
              type="button"
              onClick={() => {
                setShowNativeCamPrompt(false);
                cameraCaptureRef.current?.click();
              }}
              style={{
                background: 'linear-gradient(135deg, #8c2d19 0%, #b45309 100%)',
                color: '#ffffff',
                border: '1px solid rgba(212, 168, 106, 0.5)',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Camera size={14} />
              <span>Mở Máy Ảnh Gốc để chọn 0.5x</span>
            </button>
          </div>
        )}

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
        {/* Toggle Tự bắt góc & Nút Cam 0.5x */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <Compass size={13} />
            <span>{hasGyro ? (isAutoDetecting ? 'Tự bắt' : 'Thủ công') : 'Bật La Bàn'}</span>
          </button>

          <button
            type="button"
            onClick={() => cameraCaptureRef.current?.click()}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid rgba(212, 168, 106, 0.45)',
              background: 'rgba(212, 168, 106, 0.12)',
              color: 'var(--accent-gold, #d4a86a)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
            title="Mở ứng dụng Camera gốc của máy để chọn góc 0.5x siêu nét"
          >
            <Camera size={13} />
            <span>Cam 0.5x</span>
          </button>
        </div>

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
            width: 58,
            height: 58,
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
              fontSize: '12px',
              transition: 'background 0.2s',
              boxShadow: '0 0 10px rgba(212, 168, 106, 0.5)'
            }}
          >
            <span>{activeSector.shortLabel}</span>
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
          <span>Ghép ảnh ({capturedCount}/{totalSectors})</span>
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
