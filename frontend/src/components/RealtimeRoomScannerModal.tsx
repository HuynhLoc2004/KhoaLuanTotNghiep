import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  RefreshCw,
  Check,
  ShieldCheck,
  Compass,
  AlertCircle,
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
  id: number;
  targetAngle: number;
  label: string;
  shortLabel: string;
  directionName: string;
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
        console.warn('[Sector Frame Upload Error]:', err);
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
      setTimeout(() => setIsCapturingFlash(false), 140);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(35);
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
          alert('Chưa cấp quyền cảm biến góc quay. Bạn có thể bấm chụp thủ công từng góc.');
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
          ? 'Chưa cấp quyền truy cập máy ảnh. Vui lòng bật quyền Camera trong cài đặt trình duyệt để tiếp tục.'
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

      // Áp dụng zoom phần cứng W3C
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

      // Tìm camera Ultra-Wide
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
          `Bạn đã chụp ${capturedCount} góc. Việc đổi chế độ sang ${newMode} góc sẽ thiết lập lại danh sách góc chụp 360°. Bạn có muốn tiếp tục?`
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

      let headingMoved = Math.abs(currentHeading - lastCapturedHeadingRef.current);
      if (headingMoved > 180) headingMoved = 360 - headingMoved;
      const minStepThreshold = (360 / totalSectors) * 0.45;
      if (lastCapturedHeadingRef.current !== -999 && headingMoved < minStepThreshold) {
        setStabilityProgress(0);
        steadyTimeRef.current = 0;
        return;
      }

      let diff = Math.abs(currentHeading - currentSector.targetAngle);
      if (diff > 180) diff = 360 - diff;
      const maxTolerance = (360 / totalSectors) * 0.32;

      if (diff <= maxTolerance) {
        const deltaHeading = Math.abs(currentHeading - lastHeadingRef.current);
        lastHeadingRef.current = currentHeading;

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

  // Hoàn tất quét & Gửi lệnh ghép ảnh (Self-Healing)
  const handleFinishAndStitch = async () => {
    if (capturedCount < minRequired) {
      alert(
        `Cần tối thiểu ${minRequired}/${totalSectors} góc chụp để ghép không gian phòng 360° chuẩn không bị méo.`
      );
      return;
    }

    try {
      setIsProcessingStitch(true);
      setStitchProgress(10);
      setStitchMessage('Đang kết nối hệ thống và đưa dữ liệu vào hàng đợi...');

      let sid: string = sessionIdRef.current || (await ensureServerSession());

      // Gửi lệnh kích hoạt ghép
      let res = await fetch(`${API_BASE}/stitch/realtime/session/${sid}/finish`, {
        method: 'POST'
      });
      let json = await res.json();

      // CƠ CHẾ SELF-HEALING: Nếu phiên bị mất hoặc server vừa khởi động lại
      if (!res.ok || !json.success) {
        console.warn('[Self-Healing] Đồng bộ lại các góc ảnh từ thiết bị lên máy chủ...');
        setStitchMessage('Đang đồng bộ dữ liệu góc ảnh lên máy chủ...');

        const newSessRes = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét phòng 360 - ${new Date().toLocaleTimeString('vi-VN')}` })
        });
        const newSessJson = await newSessRes.json();
        if (!newSessJson.success || !newSessJson.session) {
          throw new Error(newSessJson.message || 'Không thể tạo phiên quét mới trên máy chủ');
        }

        sid = newSessJson.session.id;
        updateSessionId(sid);

        const capturedSectors = sectors.filter((s) => s.isCaptured && s.blob);
        let uploaded = 0;
        for (const sec of capturedSectors) {
          if (sec.blob) {
            uploaded++;
            setStitchProgress(Math.round(10 + (uploaded / capturedSectors.length) * 20));
            setStitchMessage(`Đang tải góc ${sec.shortLabel} (${uploaded}/${capturedSectors.length})...`);

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

        setStitchMessage('Đang kích hoạt thuật toán ghép toàn cảnh 360°...');
        res = await fetch(`${API_BASE}/stitch/realtime/session/${sid}/finish`, {
          method: 'POST'
        });
        json = await res.json();
        if (!json.success) {
          throw new Error(json.message || 'Lỗi khi gửi yêu cầu ghép ảnh.');
        }
      }

      // Polling trạng thái tiến trình
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
            setStitchMessage(sess.message || 'Thuật toán RootSIFT đang trích xuất điểm đặc trưng & nắn hình trụ...');

            if (sess.status === 'completed' && sess.result) {
              clearInterval(statusPollingRef.current);
              setStitchProgress(100);
              setStitchMessage('Hoàn tất ghép không gian phòng 360°.');

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
        background: '#1A1715',
        display: 'flex',
        flexDirection: 'column',
        color: '#EBE5DF',
        fontFamily: "var(--font-family, 'Be Vietnam Pro', -apple-system, sans-serif)",
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
        .rt-spinner {
          animation: rtSpin 0.9s linear infinite !important;
          transform-origin: center center !important;
        }
      `}</style>

      {/* ZONE 1: ADMIN HEADER BAR (VỮNG CHÃI, CHUẨN DESIGN SYSTEM BẢO TÀNG) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
          background: '#1A1715',
          borderBottom: '1px solid #362F29',
          flexShrink: 0,
          height: 48,
          zIndex: 20
        }}
      >
        {/* Nút Đóng */}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#24201D',
            border: '1px solid #362F29',
            color: '#EBE5DF',
            borderRadius: 6,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Đóng máy ảnh"
        >
          <X size={15} />
        </button>

        {/* Tab chọn 8 góc (0.5x) vs 12 góc (1x) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#24201D',
            borderRadius: 6,
            padding: 2,
            border: '1px solid #362F29'
          }}
        >
          <button
            type="button"
            onClick={() => handleSwitchAngleMode('8')}
            style={{
              border: 'none',
              background: angleMode === '8' ? '#8C2D19' : 'transparent',
              color: angleMode === '8' ? '#F9F6F0' : '#A3978C',
              fontSize: '11px',
              fontWeight: angleMode === '8' ? 600 : 500,
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            8 góc (0.5x)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchAngleMode('12')}
            style={{
              border: 'none',
              background: angleMode === '12' ? '#8C2D19' : 'transparent',
              color: angleMode === '12' ? '#F9F6F0' : '#A3978C',
              fontSize: '11px',
              fontWeight: angleMode === '12' ? 600 : 500,
              padding: '4px 10px',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            12 góc (1x)
          </button>
        </div>

        {/* Badge tiến độ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#24201D',
            border: '1px solid #362F29',
            color: isComplete ? '#7F9E87' : '#D4A86A',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: '11px',
            fontWeight: 600,
            flexShrink: 0
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isComplete ? '#7F9E87' : '#D4A86A'
            }}
          />
          <span>{capturedCount}/{totalSectors} góc</span>
        </div>
      </div>

      {/* ZONE 2: VIEWFINDER KHUNG NGẮM CAMERA */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0D0C0B'
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
              opacity: 0.4,
              pointerEvents: 'none',
              transition: 'opacity 0.12s ease-out'
            }}
          />
        )}

        {/* HUD THANH ĐIỀU HƯỚNG DUY NHẤT Ở TRÊN CÙNG (KHÔNG RƠI RỚT NHIỀU HỘP) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            background: 'rgba(26, 23, 21, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid #362F29',
            borderRadius: 6,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            zIndex: 10
          }}
        >
          {/* La bàn mini & Hướng góc */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <div
              onClick={handleCalibrateHeading}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#24201D',
                border: '1px solid #362F29',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Chạm để căn lại hướng 0°"
            >
              <svg width="28" height="28" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#473E36" strokeWidth="1.5" strokeDasharray="3 3" />
                {sectors.map((sec) => {
                  const rad = ((sec.targetAngle - 90) * Math.PI) / 180;
                  const cx = 40 + 30 * Math.cos(rad);
                  const cy = 40 + 30 * Math.sin(rad);
                  const isTarget = sec.id === (hasGyro ? targetSector.id : selectedSectorId);
                  return (
                    <circle
                      key={sec.id}
                      cx={cx}
                      cy={cy}
                      r={sec.isCaptured ? 3.5 : isTarget ? 3 : 2}
                      fill={sec.isCaptured ? '#7F9E87' : isTarget ? '#D4A86A' : '#473E36'}
                    />
                  );
                })}
                <g transform={`rotate(${compassNeedleAngle}, 40, 40)`}>
                  <polygon points="40,16 37,40 43,40" fill="#D4A86A" />
                  <polygon points="40,64 37,40 43,40" fill="#473E36" />
                  <circle cx="40" cy="40" r="2.5" fill="#EBE5DF" />
                </g>
              </svg>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#D4A86A' }}>
                  Góc {activeSector.shortLabel}
                </span>
                <span style={{ fontSize: '10px', color: activeSector.isCaptured ? '#7F9E87' : '#A3978C' }}>
                  {activeSector.isCaptured ? '· Đã chụp' : `(${activeSector.label})`}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#7E7368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {hasGyro ? (
                  activeSector.isCaptured ? (
                    `Xoay tiếp sang góc ${targetSector.shortLabel}`
                  ) : stabilityProgress > 0 ? (
                    `Giữ yên máy: ${stabilityProgress}%`
                  ) : (
                    `Xoay máy về hướng ${activeSector.shortLabel} và giữ yên`
                  )
                ) : (
                  `Căn máy theo hướng ${activeSector.directionName} rồi bấm chụp`
                )}
              </div>
            </div>
          </div>

          {/* Nút bật cảm biến la bàn trên iOS nếu chưa cấp quyền */}
          {!hasGyro && (
            <button
              type="button"
              onClick={handleRequestGyroPermission}
              style={{
                background: '#8C2D19',
                border: '1px solid #702212',
                color: '#F9F6F0',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              Bật cảm biến
            </button>
          )}
        </div>

        {/* TÂM NGẮM LEICA THANH MẢNH */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderTop: '1px solid #D4A86A', borderLeft: '1px solid #D4A86A' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderTop: '1px solid #D4A86A', borderRight: '1px solid #D4A86A' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 12, height: 12, borderBottom: '1px solid #D4A86A', borderLeft: '1px solid #D4A86A' }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderBottom: '1px solid #D4A86A', borderRight: '1px solid #D4A86A' }} />

          {/* Vòng đếm ổn định */}
          {stabilityProgress > 0 && !activeSector.isCaptured && (
            <svg width="50" height="50" viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#D4A86A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * stabilityProgress) / 100}
                style={{ transition: 'stroke-dashoffset 0.15s ease' }}
              />
            </svg>
          )}

          {/* Chấm tâm */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: activeSector.isCaptured ? '#7F9E87' : '#D4A86A'
            }}
          />
        </div>

        {/* NÚT CHUYỂN ỐNG KÍNH 0.5X vs 1X TINH TẾ */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(36, 32, 29, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #362F29',
            borderRadius: 6,
            padding: 2,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            zIndex: 10
          }}
        >
          <button
            type="button"
            onClick={() => handleSwitchLens('0.5x')}
            style={{
              border: 'none',
              background: lensMode === '0.5x' ? '#8C2D19' : 'transparent',
              color: lensMode === '0.5x' ? '#F9F6F0' : '#A3978C',
              fontWeight: 600,
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            0.5x
          </button>
          <button
            type="button"
            onClick={() => handleSwitchLens('1x')}
            style={{
              border: 'none',
              background: lensMode === '1x' ? '#8C2D19' : 'transparent',
              color: lensMode === '1x' ? '#F9F6F0' : '#A3978C',
              fontWeight: 600,
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            1.0x
          </button>
        </div>

        {/* Thông báo camera 0.5x chuẩn Admin */}
        {showNativeCamPrompt && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              maxWidth: 380,
              margin: '0 auto',
              background: '#24201D',
              border: '1px solid #362F29',
              borderRadius: 8,
              padding: '14px 16px',
              zIndex: 30,
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4A86A' }}>
                Thông tin ống kính 0.5x
              </span>
              <button
                type="button"
                onClick={() => setShowNativeCamPrompt(false)}
                style={{ background: 'none', border: 'none', color: '#A3978C', cursor: 'pointer', padding: 2 }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#EBE5DF', margin: 0, lineHeight: 1.5, marginBottom: 10 }}>
              {isMobileDevice
                ? 'Trình duyệt chưa hỗ trợ chuyển trực tiếp sang camera 0.5x của thiết bị. Bạn có thể mở ứng dụng máy ảnh gốc bên dưới để chọn góc 0.5x.'
                : 'Máy tính hiện tại không có phần cứng camera góc siêu rộng 0.5x. Vui lòng mở hệ thống trên điện thoại di động.'}
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
                  background: '#8C2D19',
                  color: '#F9F6F0',
                  border: '1px solid #702212',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Mở máy ảnh thiết bị
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowNativeCamPrompt(false)}
                style={{
                  width: '100%',
                  background: '#2C2723',
                  color: '#EBE5DF',
                  border: '1px solid #362F29',
                  padding: '7px 12px',
                  borderRadius: 6,
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

        {/* Lỗi Camera / Quyền truy cập */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 20,
              background: '#24201D',
              border: '1px solid #362F29',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 20,
              borderRadius: 8,
              textAlign: 'center',
              zIndex: 30,
              maxWidth: 360,
              margin: 'auto'
            }}
          >
            <AlertCircle size={28} style={{ color: '#D9534F' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#EBE5DF' }}>
                {isInsecureHttp ? 'Yêu cầu kết nối bảo mật HTTPS' : 'Không thể kết nối máy ảnh'}
              </div>
              <div style={{ fontSize: '11px', color: '#A3978C', marginTop: 4, lineHeight: 1.5 }}>
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
                    borderRadius: 6,
                    background: '#8C2D19',
                    border: '1px solid #702212',
                    color: '#F9F6F0',
                    fontSize: '11px',
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
                  borderRadius: 6,
                  background: '#2C2723',
                  border: '1px solid #362F29',
                  color: '#EBE5DF',
                  fontSize: '11px',
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
                  borderRadius: 6,
                  background: 'transparent',
                  border: '1px solid #362F29',
                  color: '#A3978C',
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

        {/* Modal Xử lý Ghép 360 */}
        {isProcessingStitch && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(26, 23, 21, 0.96)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 24,
              zIndex: 40
            }}
          >
            <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="23" fill="none" stroke="#24201D" strokeWidth="3" />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  fill="none"
                  stroke="#D4A86A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * Math.max(0, Math.min(100, stitchProgress))) / 100}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <Loader2 size={22} className="rt-spinner" style={{ color: '#D4A86A' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#EBE5DF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Đang ghép toàn cảnh 360°
              </div>
              <div style={{ fontSize: '11px', color: '#A3978C', maxWidth: 280, marginTop: 4, lineHeight: 1.45 }}>
                {stitchMessage || 'Đang xử lý hòa trộn và cân chỉnh mặt trụ...'}
              </div>
            </div>

            <div style={{ width: 200, height: 4, background: '#24201D', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stitchProgress}%`,
                  height: '100%',
                  background: '#8C2D19',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#D4A86A', fontWeight: 600 }}>{stitchProgress}%</span>
          </div>
        )}
      </div>

      {/* ZONE 3: BẢN ĐIỀU KHIỂN DƯỚI (SOLID CONSOLE, BẢO TÀNG HERITAGE) */}
      <div style={{ background: '#1A1715', borderTop: '1px solid #362F29', flexShrink: 0 }}>
        {/* HÀNG 1: FILMSTRIP DẢI PHIM CÁC GÓC */}
        <div
          style={{
            height: 48,
            padding: '4px 10px',
            borderBottom: '1px solid #24201D',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
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
                  width: 40,
                  height: 38,
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: isActive
                    ? '1.5px solid #D4A86A'
                    : sec.isCaptured
                    ? '1px solid #7F9E87'
                    : '1px solid #362F29',
                  flexShrink: 0,
                  background: sec.isCaptured ? '#0D0C0B' : '#24201D',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.15s ease'
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
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#7F9E87'
                      }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: '10px', color: isActive ? '#D4A86A' : '#7E7368', fontWeight: 600 }}>
                    {sec.shortLabel}
                  </span>
                )}

                {sec.thumbnailUrl && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      fontSize: '7px',
                      fontWeight: 600,
                      color: '#EBE5DF',
                      background: 'rgba(26,23,21,0.85)',
                      textAlign: 'center',
                      lineHeight: '10px'
                    }}
                  >
                    {sec.shortLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* HÀNG 2: THANH NÚT CHỤP VÀ HÀNH ĐỘNG (3 CỘT ĐỐI XỨNG, KHÔNG BAO GIỜ TRÀN) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
            height: 72
          }}
        >
          {/* CỘT TRÁI: Chế độ Tự động / Thủ công & Nút máy ảnh phụ */}
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
                borderRadius: 4,
                border: '1px solid #362F29',
                background: hasGyro && isAutoDetecting ? 'rgba(212, 168, 106, 0.12)' : '#24201D',
                color: hasGyro && isAutoDetecting ? '#D4A86A' : '#A3978C',
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
              <span>{hasGyro ? (isAutoDetecting ? 'Tự động' : 'Thủ công') : 'La bàn'}</span>
            </button>

            <button
              type="button"
              onClick={() => cameraCaptureRef.current?.click()}
              style={{
                width: 30,
                height: 30,
                borderRadius: 4,
                border: '1px solid #362F29',
                background: '#24201D',
                color: '#A3978C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Mở máy ảnh thiết bị"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* CỘT GIỮA: Nút Shutter chuẩn chuyên nghiệp */}
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
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid #D4A86A',
                padding: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isProcessingStitch ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s ease'
              }}
              title={`Chụp góc ${activeSector.shortLabel}`}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: activeSector.isCaptured ? '#7F9E87' : '#8C2D19',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F9F6F0',
                  fontWeight: 700,
                  fontSize: '11px'
                }}
              >
                {activeSector.isCaptured ? <Check size={16} /> : activeSector.shortLabel}
              </div>
            </button>
          </div>

          {/* CỘT PHẢI: Nút Ghép ảnh chuẩn nút Admin Bảo Tàng */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleFinishAndStitch}
              disabled={capturedCount < minRequired || isProcessingStitch}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                background: isReadyToStitch ? '#8C2D19' : '#24201D',
                border: isReadyToStitch ? '1px solid #702212' : '1px solid #362F29',
                color: isReadyToStitch ? '#F9F6F0' : '#7E7368',
                fontSize: '11px',
                fontWeight: 600,
                cursor: isReadyToStitch ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
                maxWidth: 100,
                boxShadow: isReadyToStitch ? '0 2px 8px rgba(140, 45, 25, 0.4)' : 'none'
              }}
            >
              <Check size={12} />
              <span>Ghép ({capturedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inputs tệp ẩn */}
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
