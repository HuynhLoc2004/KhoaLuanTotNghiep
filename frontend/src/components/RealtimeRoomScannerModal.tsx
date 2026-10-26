import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  RefreshCw,
  Check,
  Upload,
  ShieldCheck,
  Compass,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2
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
  id: number;            // 0..7 hoặc 0..11
  targetAngle: number;   // 0, 45, 90, ...
  label: string;         // 'Chính diện', 'Trước - Phải', ...
  shortLabel: string;    // '0°', '45°', ...
  directionName: string; // 'Trước', 'T-Phải', ...
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
  { id: 0, targetAngle: 0, label: 'Chính diện', shortLabel: '0°', directionName: '0°', isCaptured: false },
  { id: 1, targetAngle: 30, label: 'Trước - Phải 1', shortLabel: '30°', directionName: '30°', isCaptured: false },
  { id: 2, targetAngle: 60, label: 'Trước - Phải 2', shortLabel: '60°', directionName: '60°', isCaptured: false },
  { id: 3, targetAngle: 90, label: 'Bên phải', shortLabel: '90°', directionName: '90°', isCaptured: false },
  { id: 4, targetAngle: 120, label: 'Sau - Phải 1', shortLabel: '120°', directionName: '120°', isCaptured: false },
  { id: 5, targetAngle: 150, label: 'Sau - Phải 2', shortLabel: '150°', directionName: '150°', isCaptured: false },
  { id: 6, targetAngle: 180, label: 'Phía sau', shortLabel: '180°', directionName: '180°', isCaptured: false },
  { id: 7, targetAngle: 210, label: 'Sau - Trái 1', shortLabel: '210°', directionName: '210°', isCaptured: false },
  { id: 8, targetAngle: 240, label: 'Sau - Trái 2', shortLabel: '240°', directionName: '240°', isCaptured: false },
  { id: 9, targetAngle: 270, label: 'Bên trái', shortLabel: '270°', directionName: '270°', isCaptured: false },
  { id: 10, targetAngle: 300, label: 'Trước - Trái 1', shortLabel: '300°', directionName: '300°', isCaptured: false },
  { id: 11, targetAngle: 330, label: 'Trước - Trái 2', shortLabel: '330°', directionName: '330°', isCaptured: false }
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

  // Quản lý session ID an toàn (tránh stale closure)
  const sessionIdRef = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const updateSessionId = (id: string | null) => {
    sessionIdRef.current = id;
    setSessionId(id);
  };

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInsecureHttp, setIsInsecureHttp] = useState(false);

  // Nhận diện thiết bị di động
  const isMobileDevice = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Quản lý cung góc 360° & Chế độ ống kính
  const [angleMode, setAngleMode] = useState<'8' | '12'>('8');
  const [lensMode, setLensMode] = useState<'0.5x' | '1x'>('0.5x');
  const [showNativeCamPrompt, setShowNativeCamPrompt] = useState<boolean>(false);

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

  // Tính toán số góc đã chụp và góc còn thiếu
  const totalSectors = sectors.length;
  const capturedCount = sectors.filter((s) => s.isCaptured).length;
  const isComplete = capturedCount >= totalSectors;
  const minRequired = totalSectors === 8 ? 6 : 8;
  const isReadyToStitch = capturedCount >= minRequired;

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

  // Đảm bảo có phiên quét hợp lệ trên máy chủ
  const ensureServerSession = useCallback(async (): Promise<string> => {
    if (sessionIdRef.current) return sessionIdRef.current;
    const res = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Quét phòng 360 - ${new Date().toLocaleTimeString('vi-VN')}` })
    });
    const json = await res.json();
    if (json.success && json.session) {
      updateSessionId(json.session.id);
      return json.session.id;
    }
    throw new Error(json.message || 'Không thể tạo phiên quét realtime');
  }, []);

  // Upload frame lên Server theo sectorIndex
  const uploadSectorFrame = useCallback(
    async (blob: Blob, sectorIdx: number, localPreviewUrl: string, targetSessionId?: string) => {
      try {
        let sid = targetSessionId || sessionIdRef.current;
        if (!sid) {
          sid = await ensureServerSession();
        }

        const formData = new FormData();
        formData.append('sessionId', sid);
        formData.append('sectorIndex', String(sectorIdx));
        formData.append('frame', blob, `frame_sector_${sectorIdx}.jpg`);

        const res = await fetch(`${API_BASE}/stitch/realtime/frame`, {
          method: 'POST',
          body: formData
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          console.warn('[Sector Frame Upload Warn]:', json.message);
        }
      } catch (err) {
        console.warn('[Sector Frame Upload Network Error]:', err);
      }
    },
    [ensureServerSession]
  );

  // Chụp một khung hình chính xác cho góc chỉ định
  const captureSector = useCallback(
    (targetSectorIdx: number) => {
      if (!videoRef.current || !isCameraReady) return;
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
      setTimeout(() => setIsCapturingFlash(false), 160);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(40);
        }
      } catch (_) {}

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const localUrl = URL.createObjectURL(blob);

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

            // Tìm góc còn thiếu tiếp theo
            const nextMissing = updated.find((s) => !s.isCaptured && s.id !== targetSectorIdx);
            if (nextMissing) {
              setSelectedSectorId(nextMissing.id);
            }

            return updated;
          });

          lastCapturedHeadingRef.current = currentHeading;
          steadyTimeRef.current = 0;
          setStabilityProgress(0);

          // Upload lên server
          uploadSectorFrame(blob, targetSectorIdx, localUrl);
        },
        'image/jpeg',
        0.92
      );
    },
    [isCameraReady, currentHeading, uploadSectorFrame]
  );

  // Xử lý sự kiện con quay hồi chuyển trên điện thoại
  const handleOrientation = useCallback((e: any) => {
    let rawHeading: number | null = null;
    if (e.webkitCompassHeading !== undefined && e.webkitCompassHeading !== null) {
      rawHeading = e.webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined && !isNaN(e.alpha)) {
      rawHeading = (360 - e.alpha) % 360;
    }

    if (rawHeading !== null && !isNaN(rawHeading)) {
      setHasGyro(true);
      if (initialHeadingRef.current === null) {
        initialHeadingRef.current = rawHeading;
      }
      const rel = (rawHeading - initialHeadingRef.current + 360) % 360;
      setCurrentHeading(rel);
    }
  }, []);

  // Yêu cầu cấp quyền cảm biến hướng cho iOS Safari
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
          alert('Cần cấp quyền cảm biến để máy tự nhận diện góc quay. Bạn vẫn có thể bấm nút chụp thủ công từng góc.');
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
      setSectors(angleMode === '8' ? SECTORS_8 : SECTORS_12);
      setSelectedSectorId(0);
      setIsProcessingStitch(false);
      setStitchProgress(0);
      initialHeadingRef.current = null;
      lastHeadingRef.current = 0;
      lastCapturedHeadingRef.current = -999;
      steadyTimeRef.current = 0;

      // 1. Tạo phiên mới trên server
      await ensureServerSession();

      // 2. Kiểm tra hỗ trợ Camera
      const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const hasGetUserMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

      if (!hasGetUserMedia) {
        if (!isSecure && window.location.protocol === 'http:') {
          setIsInsecureHttp(true);
          throw new Error('Trình duyệt yêu cầu kết nối HTTPS để mở camera trực tiếp.');
        }
        throw new Error('Không tìm thấy thiết bị máy ảnh khả dụng.');
      }

      // 3. Khởi tạo camera với fallback
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

      // Kiểm tra zoom nếu có
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const caps: any = (videoTrack.getCapabilities && videoTrack.getCapabilities()) || {};
          if (caps.zoom && caps.zoom.min !== undefined && caps.zoom.min <= 0.8) {
            await videoTrack.applyConstraints({
              advanced: [{ zoom: caps.zoom.min } as any]
            });
            setLensMode('0.5x');
          }
        } catch (zoomErr) {
          console.warn('[Zoom Init]:', zoomErr);
        }
      }

      setIsCameraReady(true);
    } catch (err: any) {
      console.error('[Camera Init Error]:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'SecurityError';
      setCameraError(
        isDenied
          ? 'Bạn chưa cho phép truy cập Camera. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.'
          : (err.message || 'Không thể khởi động camera.')
      );
    }
  }, [angleMode, ensureServerSession]);

  // Chuyển đổi ống kính: 0.5x Siêu Rộng hoặc 1x Tiêu chuẩn
  const handleSwitchLens = useCallback(
    async (mode: '0.5x' | '1x') => {
      setLensMode(mode);
      if (!streamRef.current) return;
      const track = streamRef.current.getVideoTracks()[0];
      if (!track) return;

      let zoomSuccess = false;

      // Cách 1: Áp dụng zoom phần cứng W3C
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

      // Cách 2: Tìm camera Ultra-Wide
      if (mode === '0.5x' && !zoomSuccess && typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          const ultraDevice = videoInputs.find(
            (d) =>
              d.label.toLowerCase().includes('ultra') ||
              d.label.toLowerCase().includes('0.5') ||
              d.label.toLowerCase().includes('wide-angle')
          );
          if (ultraDevice && ultraDevice.deviceId && ultraDevice.deviceId !== track.getSettings()?.deviceId) {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: ultraDevice.deviceId } }
            });
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = newStream;
            if (videoRef.current) {
              videoRef.current.srcObject = newStream;
              await videoRef.current.play().catch(() => undefined);
            }
            zoomSuccess = true;
          }
        } catch (enumErr) {
          console.warn('[Enumerate Device Switch Warning]:', enumErr);
        }
      }

      if (mode === '0.5x' && !zoomSuccess) {
        setShowNativeCamPrompt(true);
      }
    },
    []
  );

  // Chuyển đổi giữa Chế độ 8 góc (cho cam 0.5x) và Chế độ 12 góc (cho cam 1x)
  const handleSwitchAngleMode = useCallback(
    (newMode: '8' | '12') => {
      if (newMode === angleMode) return;
      if (capturedCount > 0) {
        const ok = window.confirm(
          `Bạn đã chụp ${capturedCount} góc. Đổi sang ${newMode} góc sẽ thiết lập lại danh sách góc để chia đều 360°. Bạn có muốn tiếp tục?`
        );
        if (!ok) return;
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
    [angleMode, capturedCount]
  );

  // Vòng đời Modal & Sự kiện cảm biến
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

  // Kiểm tra độ ổn định & Tự động chụp
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

      // Đã xoay góc đáng kể so với góc vừa chụp
      let headingMoved = Math.abs(currentHeading - lastCapturedHeadingRef.current);
      if (headingMoved > 180) headingMoved = 360 - headingMoved;
      const minStepThreshold = (360 / totalSectors) * 0.45;
      if (lastCapturedHeadingRef.current !== -999 && headingMoved < minStepThreshold) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      // Độ lệch với góc đích
      let diff = Math.abs(currentHeading - currentSector.targetAngle);
      if (diff > 180) diff = 360 - diff;
      const maxTolerance = (360 / totalSectors) * 0.32;

      if (diff <= maxTolerance) {
        const deltaHeading = Math.abs(currentHeading - lastHeadingRef.current);
        lastHeadingRef.current = currentHeading;

        // Nếu giữ vững máy
        if (deltaHeading < 2.2) {
          steadyTimeRef.current += 150;
          const progress = Math.min(100, Math.round((steadyTimeRef.current / 800) * 100));
          setStabilityProgress(progress);

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
  }, [isCameraReady, isProcessingStitch, hasGyro, isAutoDetecting, currentHeading, aimingSectorId, sectors, totalSectors, captureSector]);

  // Đặt lại hướng ban đầu (0 độ)
  const handleCalibrateHeading = () => {
    initialHeadingRef.current = null;
    try {
      if ('vibrate' in navigator) navigator.vibrate(25);
    } catch (_) {}
  };

  // Chuyển sang HTTPS
  const handleSwitchToHttps = () => {
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('http:')) {
      window.location.href = currentUrl.replace(/^http:/i, 'https:');
    } else {
      initSessionAndCamera();
    }
  };

  // Chụp từ camera native / chọn ảnh từ thư viện
  const handleSimulateStreamFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let sid = sessionIdRef.current;
    if (!sid) {
      try {
        sid = await ensureServerSession();
      } catch (err) {
        console.warn('Session init error:', err);
      }
    }
    if (!sid) return;

    setCameraError(null);
    setIsInsecureHttp(false);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localUrl = URL.createObjectURL(file);

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

      await uploadSectorFrame(file, targetSecIdx, localUrl, sid);
      setSelectedSectorId((prev) => (prev + 1) % totalSectors);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    e.target.value = '';
  };

  // Hoàn tất quét & Gửi lệnh ghép ảnh (SELF-HEALING TỰ ĐỘNG KHẮC PHỤC MẤT PHIÊN)
  const handleFinishAndStitch = async () => {
    if (capturedCount < minRequired) {
      alert(
        `Bạn đã chụp ${capturedCount}/${totalSectors} góc. Cần tối thiểu ${minRequired} góc (khuyến nghị đủ ${totalSectors} góc) để ghép không gian phòng 360° chuẩn không bị méo.`
      );
      return;
    }

    try {
      setIsProcessingStitch(true);
      setStitchProgress(10);
      setStitchMessage('Đang kết nối và gửi yêu cầu vào hàng đợi xử lý...');

      let sid: string = sessionIdRef.current || (await ensureServerSession());

      // Gửi lệnh kích hoạt ghép
      let res = await fetch(`${API_BASE}/stitch/realtime/session/${sid}/finish`, {
        method: 'POST'
      });
      let json = await res.json();

      // CƠ CHẾ SELF-HEALING: Nếu phiên bị mất hoặc server vừa khởi động lại
      if (!res.ok || !json.success) {
        console.warn('[Self-Healing] Phiên quét không tồn tại trên server, đang tự động đồng bộ lại từ thiết bị...');
        setStitchMessage('Đang đồng bộ lại các góc ảnh từ thiết bị lên máy chủ...');

        // 1. Tạo phiên mới trên server
        const newSessRes = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét phòng 360 khôi phục - ${new Date().toLocaleTimeString('vi-VN')}` })
        });
        const newSessJson = await newSessRes.json();
        if (!newSessJson.success || !newSessJson.session) {
          throw new Error(newSessJson.message || 'Không thể tạo phiên quét mới trên máy chủ');
        }

        sid = newSessJson.session.id;
        updateSessionId(sid);

        // 2. Re-upload toàn bộ ảnh đã chụp lưu trong bộ nhớ
        const capturedSectors = sectors.filter((s) => s.isCaptured && s.blob);
        let uploaded = 0;
        for (const sec of capturedSectors) {
          if (sec.blob) {
            uploaded++;
            setStitchProgress(Math.round(10 + (uploaded / capturedSectors.length) * 20));
            setStitchMessage(`Đang tải ảnh góc ${sec.shortLabel} (${uploaded}/${capturedSectors.length})...`);

            const fd = new FormData();
            fd.append('sessionId', sid);
            fd.append('sectorIndex', String(sec.id));
            fd.append('frame', sec.blob, `frame_sector_${sec.id}.jpg`);

            await fetch(`${API_BASE}/stitch/realtime/frame`, {
              method: 'POST',
              body: fd
            });
          }
        }

        // 3. Kích hoạt finish lại với phiên mới
        setStitchMessage('Đang kích hoạt thuật toán ghép 360 qua RabbitMQ...');
        res = await fetch(`${API_BASE}/stitch/realtime/session/${sid}/finish`, {
          method: 'POST'
        });
        json = await res.json();
        if (!json.success) {
          throw new Error(json.message || 'Lỗi khi gửi yêu cầu ghép ảnh.');
        }
      }

      // Bắt đầu Polling trạng thái tiến trình
      let attempts = 0;
      if (statusPollingRef.current) clearInterval(statusPollingRef.current);
      statusPollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(`${API_BASE}/stitch/realtime/session/${sid}/status`);
          const pollJson = await pollRes.json();
          if (pollJson.success && pollJson.session) {
            const sess = pollJson.session;
            setStitchProgress(sess.progress || Math.min(95, 20 + attempts * 4));
            setStitchMessage(sess.message || 'Thuật toán OpenCV đang trích xuất điểm đặc trưng & hòa trộn...');

            if (sess.status === 'completed' && sess.result) {
              clearInterval(statusPollingRef.current);
              setStitchProgress(100);
              setStitchMessage('Hoàn tất ghép không gian phòng 360°!');

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
          console.warn('[Status Poll Error]:', pollErr);
        }

        if (attempts > 90) {
          clearInterval(statusPollingRef.current);
          setIsProcessingStitch(false);
          alert('Tác vụ ghép mất nhiều thời gian hơn dự kiến. Không gian phòng vẫn đang tiếp tục xử lý trong nền.');
          onClose();
        }
      }, 2000);
    } catch (err: any) {
      setIsProcessingStitch(false);
      alert(err.message || 'Lỗi khi kích hoạt tiến trình ghép ảnh');
    }
  };

  if (!isOpen) return null;

  const compassNeedleAngle = hasGyro ? currentHeading : activeSector.targetAngle;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        color: '#f3f4f6',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        width: '100vw',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <style>{`
        @keyframes rtSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseTargetRing {
          0% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.2); opacity: 0.35; }
          100% { transform: scale(1); opacity: 0.85; }
        }
        .rt-spinner {
          animation: rtSpin 0.9s linear infinite !important;
          transform-origin: center center !important;
        }
        .rt-pulse-ring {
          animation: pulseTargetRing 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* TOP BAR: THIẾT KẾ TINH GỌN, CHUẨN NATIVE CAMERA, KHÔNG BAO GIỜ BỊ RỚT DÒNG */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          height: 48,
          zIndex: 20
        }}
      >
        {/* Nút Đóng X */}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            color: '#f3f4f6',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Đóng camera"
        >
          <X size={16} />
        </button>

        {/* Chuyển đổi chế độ 8 góc vs 12 góc */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            padding: 2,
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <button
            type="button"
            onClick={() => handleSwitchAngleMode('8')}
            style={{
              border: 'none',
              background: angleMode === '8' ? '#ffffff' : 'transparent',
              color: angleMode === '8' ? '#000000' : '#d1d5db',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            8 góc (0.5x)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchAngleMode('12')}
            style={{
              border: 'none',
              background: angleMode === '12' ? '#ffffff' : 'transparent',
              color: angleMode === '12' ? '#000000' : '#d1d5db',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            12 góc (1x)
          </button>
        </div>

        {/* Badge đếm góc đã chụp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: isComplete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: isComplete ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: isComplete ? '#4ade80' : '#f3f4f6',
            padding: '3px 8px',
            borderRadius: 14,
            fontSize: '12px',
            fontWeight: 700,
            flexShrink: 0
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isComplete ? '#4ade80' : '#f59e0b'
            }}
          />
          <span>{capturedCount}/{totalSectors}</span>
        </div>
      </div>

      {/* VIEWFINDER CAMERA TOÀN MÀN HÌNH */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000'
        }}
      >
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

        {/* Flash khi chụp */}
        {isCapturingFlash && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#ffffff',
              opacity: 0.7,
              pointerEvents: 'none',
              transition: 'opacity 0.16s ease-out'
            }}
          />
        )}

        {/* HUD LỚP PHỦ TỐI GIẢN */}
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
          {/* Top Row: Mini Radar La Bàn & Chỉ dẫn ngắn */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {/* Radar la bàn tròn 44px tinh gọn */}
            <div
              onClick={handleCalibrateHeading}
              style={{
                pointerEvents: 'auto',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Chạm để đặt lại hướng 0°"
            >
              <svg width="40" height="40" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="2 2" />
                {sectors.map((sec) => {
                  const rad = ((sec.targetAngle - 90) * Math.PI) / 180;
                  const cx = 40 + 30 * Math.cos(rad);
                  const cy = 40 + 30 * Math.sin(rad);
                  const isTarget = sec.id === (hasGyro ? targetSector.id : selectedSectorId);
                  return (
                    <g key={sec.id}>
                      {isTarget && (
                        <circle cx={cx} cy={cy} r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="rt-pulse-ring" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={sec.isCaptured ? 4 : 3}
                        fill={sec.isCaptured ? '#22c55e' : isTarget ? '#f59e0b' : 'rgba(255,255,255,0.3)'}
                      />
                    </g>
                  );
                })}
                {/* Kim chỉ hướng */}
                <g transform={`rotate(${compassNeedleAngle}, 40, 40)`}>
                  <polygon points="40,16 36,40 44,40" fill="#f59e0b" />
                  <polygon points="40,64 36,40 44,40" fill="rgba(255,255,255,0.4)" />
                  <circle cx="40" cy="40" r="2.5" fill="#ffffff" />
                </g>
              </svg>
            </div>

            {/* Chỉ dẫn ngắn 1 dòng thanh lịch */}
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: '11px',
                fontWeight: 600,
                color: '#f3f4f6',
                maxWidth: '65%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {hasGyro ? (
                activeSector.isCaptured ? (
                  `✓ Xong ${activeSector.shortLabel}. Xoay tới ${targetSector.shortLabel}`
                ) : stabilityProgress > 0 ? (
                  `Giữ yên máy... ${stabilityProgress}%`
                ) : (
                  `Xoay về ${activeSector.shortLabel} và giữ yên`
                )
              ) : (
                `Chụp hướng ${activeSector.shortLabel} (${activeSector.directionName})`
              )}
            </div>
          </div>

          {/* Nút chạm bật La Bàn (Chỉ hiện khi chưa cấp quyền iOS) */}
          {!hasGyro && (
            <div style={{ alignSelf: 'center', pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={handleRequestGyroPermission}
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={13} />
                <span>Chạm để bật tự xoay la bàn (iOS)</span>
              </button>
            </div>
          )}

          {/* Vùng ngắm trung tâm (Reticle thanh mảnh phong cách Leica) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* 4 góc khung ngắm */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTop: '1.5px solid rgba(255,255,255,0.7)', borderLeft: '1.5px solid rgba(255,255,255,0.7)' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTop: '1.5px solid rgba(255,255,255,0.7)', borderRight: '1.5px solid rgba(255,255,255,0.7)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottom: '1.5px solid rgba(255,255,255,0.7)', borderLeft: '1.5px solid rgba(255,255,255,0.7)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottom: '1.5px solid rgba(255,255,255,0.7)', borderRight: '1.5px solid rgba(255,255,255,0.7)' }} />

            {/* Vòng tròn đếm độ ổn định khi giữ máy */}
            {stabilityProgress > 0 && !activeSector.isCaptured && (
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle
                  cx="30"
                  cy="30"
                  r="24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={150.8}
                  strokeDashoffset={150.8 - (150.8 * stabilityProgress) / 100}
                  style={{ transition: 'stroke-dashoffset 0.15s ease' }}
                />
              </svg>
            )}

            {/* Điểm tâm ngắm */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: activeSector.isCaptured ? '#22c55e' : '#f59e0b'
              }}
            />
          </div>

          {/* Phím chuyển ống kính 0.5x vs 1x kiểu Apple Camera */}
          <div style={{ alignSelf: 'center', pointerEvents: 'auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '3px 6px',
                borderRadius: 24,
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <button
                type="button"
                onClick={() => handleSwitchLens('0.5x')}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: lensMode === '0.5x' ? '#ffffff' : 'transparent',
                  color: lensMode === '0.5x' ? '#000000' : '#ffffff',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                .5
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLens('1x')}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: lensMode === '1x' ? '#ffffff' : 'transparent',
                  color: lensMode === '1x' ? '#000000' : '#ffffff',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                1x
              </button>
            </div>
          </div>
        </div>

        {/* Modal hướng dẫn khi Safari/trình duyệt không cho đổi sang 0.5x */}
        {showNativeCamPrompt && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 16,
              right: 16,
              maxWidth: 380,
              margin: '0 auto',
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 14,
              padding: '14px 16px',
              zIndex: 30,
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={15} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>
                  Ống kính góc siêu rộng (0.5x)
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
            <p style={{ fontSize: '11px', color: '#d1d5db', margin: 0, lineHeight: 1.45, marginBottom: 10 }}>
              {isMobileDevice
                ? 'Trình duyệt Web không có quyền chuyển thẳng sang phần cứng ống kính 0.5x của iPhone/Android. Bạn có thể mở Máy ảnh gốc bên dưới để bấm vào số 0.5 chụp trọn cả trần nhà và sàn!'
                : 'Webcam máy tính chỉ có một ống kính góc cố định, không có phần cứng camera 0.5x. Hãy dùng điện thoại mở web để quét phòng với camera 0.5x nhé!'}
            </p>
            {isMobileDevice ? (
              <button
                type="button"
                onClick={() => {
                  setShowNativeCamPrompt(false);
                  cameraCaptureRef.current?.click();
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 12px',
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
                <span>Mở máy ảnh gốc chọn 0.5x</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowNativeCamPrompt(false)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f3f4f6',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đã hiểu
              </button>
            )}
          </div>
        )}

        {/* Lỗi Camera / Chưa cấp quyền */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 20,
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: 20,
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              textAlign: 'center',
              zIndex: 30,
              maxWidth: 380,
              margin: 'auto'
            }}
          >
            <AlertCircle size={32} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f4f6' }}>
                {isInsecureHttp ? 'Yêu cầu kết nối HTTPS' : 'Không thể mở máy ảnh'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: 4, lineHeight: 1.45 }}>
                {cameraError}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 6 }}>
              {isInsecureHttp && (
                <button
                  type="button"
                  onClick={handleSwitchToHttps}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#1d4ed8',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>Chuyển sang HTTPS</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => cameraCaptureRef.current?.click()}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Camera size={14} />
                <span>Mở máy ảnh chụp góc {activeSector.shortLabel}</span>
              </button>

              <button
                type="button"
                onClick={initSessionAndCamera}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={12} />
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Xử lý Ghép 360 với tiến trình */}
        {isProcessingStitch && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 10, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              zIndex: 40
            }}
          >
            <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3.5" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * Math.max(0, Math.min(100, stitchProgress))) / 100}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <Loader2 size={24} className="rt-spinner" style={{ color: '#f59e0b' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f4f6' }}>
                Đang ghép không gian phòng 360°...
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', maxWidth: 280, marginTop: 4, lineHeight: 1.4 }}>
                {stitchMessage || 'Đang phân tích và hòa trộn các góc ảnh...'}
              </div>
            </div>

            <div style={{ width: 220, height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stitchProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b 0%, #22c55e 100%)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{stitchProgress}%</span>
          </div>
        )}
      </div>

      {/* DẢI FILMSTRIP CÁC GÓC CHỤP */}
      <div
        style={{
          height: 52,
          padding: '4px 10px',
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
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
                width: 44,
                height: 42,
                borderRadius: 6,
                overflow: 'hidden',
                border: isActive
                  ? '2px solid #f59e0b'
                  : sec.isCaptured
                  ? '1px solid rgba(34, 197, 94, 0.6)'
                  : '1px dashed rgba(255, 255, 255, 0.18)',
                flexShrink: 0,
                background: sec.isCaptured ? '#000000' : 'rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title={`Góc ${sec.shortLabel}`}
            >
              {sec.thumbnailUrl ? (
                <>
                  <img src={sec.thumbnailUrl} alt={sec.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      top: 1,
                      right: 1,
                      background: '#15803d',
                      borderRadius: '50%',
                      width: 12,
                      height: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={8} style={{ color: '#fff' }} />
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '10px', color: isActive ? '#f59e0b' : '#9ca3af', fontWeight: 700 }}>
                  {sec.shortLabel}
                </span>
              )}

              {sec.thumbnailUrl && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 1,
                    left: 2,
                    fontSize: '8px',
                    fontWeight: 700,
                    color: '#4ade80',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '0 2px',
                    borderRadius: 2
                  }}
                >
                  {sec.shortLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* THANH ĐIỀU KHIỂN CHỤP NATIVE: 3 CỘT ĐỐI XỨNG, KHÔNG BAO GIỜ TRÀN MÀN HÌNH */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
          background: '#000000',
          flexShrink: 0,
          height: 78
        }}
      >
        {/* CỘT TRÁI: Nút Tự bắt & Camera Upload */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-start' }}>
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
              padding: '6px 10px',
              borderRadius: 8,
              border: hasGyro && isAutoDetecting ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
              background: hasGyro && isAutoDetecting ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: hasGyro && isAutoDetecting ? '#f59e0b' : '#9ca3af',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap'
            }}
          >
            <Compass size={13} />
            <span>{hasGyro ? (isAutoDetecting ? 'Tự bắt' : 'Thủ công') : 'La bàn'}</span>
          </button>

          <button
            type="button"
            onClick={() => cameraCaptureRef.current?.click()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Mở ứng dụng máy ảnh gốc"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* CỘT GIỮA: Nút Shutter Apple Camera kinh điển */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (isCameraReady) {
                captureSector(activeSector.id);
              } else {
                cameraCaptureRef.current?.click();
              }
            }}
            disabled={isProcessingStitch}
            style={{
              width: 62,
              height: 62,
              borderRadius: '50%',
              background: 'transparent',
              border: '3px solid rgba(255, 255, 255, 0.9)',
              padding: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isProcessingStitch ? 'not-allowed' : 'pointer',
              transition: 'transform 0.12s ease'
            }}
            title={`Chụp góc ${activeSector.shortLabel}`}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: activeSector.isCaptured ? '#22c55e' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 800,
                fontSize: '11px'
              }}
            >
              {activeSector.isCaptured ? <Check size={16} style={{ color: '#fff' }} /> : activeSector.shortLabel}
            </div>
          </button>
        </div>

        {/* CỘT PHẢI: Nút Ghép ảnh (Không bao giờ tràn màn hình di động) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleFinishAndStitch}
            disabled={capturedCount < minRequired || isProcessingStitch}
            style={{
              padding: '7px 12px',
              borderRadius: 20,
              background: isReadyToStitch ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255, 255, 255, 0.08)',
              border: isReadyToStitch ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isReadyToStitch ? '#000000' : '#6b7280',
              fontSize: '11px',
              fontWeight: 700,
              cursor: isReadyToStitch ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              maxWidth: 96,
              boxShadow: isReadyToStitch ? '0 2px 10px rgba(245, 158, 11, 0.4)' : 'none'
            }}
          >
            <Check size={12} />
            <span>Ghép ({capturedCount})</span>
          </button>
        </div>
      </div>

      {/* Hidden file inputs for camera fallback & upload */}
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
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
