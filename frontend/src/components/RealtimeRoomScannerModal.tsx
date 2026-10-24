import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Camera,
  Play,
  RotateCw,
  Radio,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  Check,
  Upload,
  ShieldAlert,
  ExternalLink,
  Copy
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

interface CapturedFrame {
  index: number;
  url: string;
  isUploading: boolean;
  isUploaded: boolean;
  cloudinaryUrl?: string;
  timestamp: number;
}

export const RealtimeRoomScannerModal: React.FC<RealtimeRoomScannerModalProps> = ({
  isOpen,
  onClose,
  onCompleted
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevImageDataRef = useRef<Uint8ClampedArray | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  const isAutoDetectingRef = useRef<boolean>(true);
  const detectionTimerRef = useRef<any>(null);
  const statusPollingRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInsecureHttp, setIsInsecureHttp] = useState(false);
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [frames, setFrames] = useState<CapturedFrame[]>([]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);
  const [motionDelta, setMotionDelta] = useState<number>(0);
  const [isProcessingStitch, setIsProcessingStitch] = useState(false);
  const [stitchProgress, setStitchProgress] = useState(0);
  const [stitchMessage, setStitchMessage] = useState<string>('');
  const [amqpStatus, setAmqpStatus] = useState<'connected' | 'transmitting' | 'idle'>('connected');

  isAutoDetectingRef.current = isAutoDetecting;

  // Dừng camera an toàn
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (detectionTimerRef.current) {
      clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  // Khởi động phiên quét mới và kết nối Camera (Đa nền tảng: iOS, Android, PC)
  const initSessionAndCamera = useCallback(async () => {
    try {
      setCameraError(null);
      setIsInsecureHttp(false);
      setFrames([]);
      setIsProcessingStitch(false);
      setStitchProgress(0);

      // 1. Khởi tạo phiên quét mới trên Server & RabbitMQ
      let currSessionId = sessionId;
      if (!currSessionId) {
        const res = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét phòng trực tiếp AMQP - ${new Date().toLocaleTimeString('vi-VN')}` })
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
          throw new Error('Chrome/Safari yêu cầu HTTPS để bật Camera trực tiếp. Trên điện thoại bạn có thể bấm "Chọn ảnh từ máy" bên dưới để test ngay.');
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
          console.warn('[Camera Try Constraint Note]:', attemptErr?.name, attemptErr?.message);
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
          ? 'Bạn chưa cấp quyền truy cập Camera. Vui lòng bấm vào biểu tượng ổ khóa/cài đặt cạnh thanh địa chỉ và bật Máy ảnh thành Cho phép.'
          : (err.message || 'Không thể khởi động camera.')
      );
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    initSessionAndCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, initSessionAndCamera, stopCamera]);

  // Upload frame lên Server (Lưu Cloudinary + Đẩy RabbitMQ)
  const uploadFrame = useCallback(async (blob: Blob, frameIdx: number, localPreviewUrl: string, currSessionId: string) => {
    try {
      setAmqpStatus('transmitting');
      const formData = new FormData();
      formData.append('sessionId', currSessionId);
      formData.append('frame', blob, `frame_${frameIdx}.jpg`);

      const res = await fetch(`${API_BASE}/stitch/realtime/frame`, {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.success && json.frame) {
        setFrames((prev) =>
          prev.map((f) =>
            f.index === frameIdx
              ? {
                  ...f,
                  isUploading: false,
                  isUploaded: true,
                  cloudinaryUrl: json.frame.cloudinaryUrl
                }
              : f
          )
        );
      }
    } catch (err) {
      console.warn('[Frame Upload Warning]:', err);
    } finally {
      setAmqpStatus('connected');
    }
  }, []);

  // Chụp một khung hình từ video stream
  const captureCurrentFrame = useCallback((currSessionId: string) => {
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

    // Hiệu ứng nháy máy ảnh & haptic rung
    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 200);
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch (_) {}

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const localUrl = URL.createObjectURL(blob);
        const nextIndex = frames.length + 1;

        const newFrame: CapturedFrame = {
          index: nextIndex,
          url: localUrl,
          isUploading: true,
          isUploaded: false,
          timestamp: Date.now()
        };

        setFrames((prev) => [...prev, newFrame]);
        lastCaptureTimeRef.current = Date.now();

        // Gửi frame lên server
        uploadFrame(blob, nextIndex, localUrl, currSessionId);
      },
      'image/jpeg',
      0.92
    );
  }, [isCameraReady, frames.length, uploadFrame]);

  // Thuật toán phát hiện góc mới tự động (Visual Difference Detector)
  useEffect(() => {
    if (!isCameraReady || !sessionId || isProcessingStitch) return;

    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas');
      sampleCanvasRef.current.width = 64;
      sampleCanvasRef.current.height = 36;
    }

    const sampleCanvas = sampleCanvasRef.current;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleCtx) return;

    // Chụp ngay frame đầu tiên khi camera vừa sẵn sàng
    if (frames.length === 0 && Date.now() - lastCaptureTimeRef.current > 1500) {
      captureCurrentFrame(sessionId);
    }

    detectionTimerRef.current = setInterval(() => {
      if (!isAutoDetectingRef.current || !videoRef.current || !isCameraReady) return;
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      sampleCtx.drawImage(video, 0, 0, 64, 36);
      const currentData = sampleCtx.getImageData(0, 0, 64, 36).data;

      if (!prevImageDataRef.current) {
        prevImageDataRef.current = new Uint8ClampedArray(currentData);
        return;
      }

      // Tính toán độ lệch thị giác (Mean Absolute Difference)
      let diffSum = 0;
      const len = currentData.length;
      for (let i = 0; i < len; i += 4) {
        const dR = Math.abs(currentData[i] - prevImageDataRef.current[i]);
        const dG = Math.abs(currentData[i + 1] - prevImageDataRef.current[i + 1]);
        const dB = Math.abs(currentData[i + 2] - prevImageDataRef.current[i + 2]);
        diffSum += (dR + dG + dB) / 3;
      }

      const avgDiff = diffSum / (len / 4);
      const deltaPercent = Math.min(100, Math.round((avgDiff / 255) * 100));
      setMotionDelta(deltaPercent);

      const now = Date.now();
      const timeSinceLast = now - lastCaptureTimeRef.current;

      // Ngưỡng phát hiện góc mới: Delta > 18% và cách lần chụp trước tối thiểu 1.1s
      if (deltaPercent >= 18 && timeSinceLast >= 1100) {
        prevImageDataRef.current = new Uint8ClampedArray(currentData);
        captureCurrentFrame(sessionId);
      }
    }, 280);

    return () => {
      if (detectionTimerRef.current) {
        clearInterval(detectionTimerRef.current);
        detectionTimerRef.current = null;
      }
    };
  }, [isCameraReady, sessionId, isProcessingStitch, frames.length, captureCurrentFrame]);

  // Mô phỏng Stream liên tục từ chùm ảnh có sẵn (Dành cho máy tính / Môi trường HTTP)
  const handleSimulateStreamFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !sessionId) return;
    setCameraError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const localUrl = URL.createObjectURL(file);
      const nextIndex = frames.length + i + 1;

      const newFrame: CapturedFrame = {
        index: nextIndex,
        url: localUrl,
        isUploading: true,
        isUploaded: false,
        timestamp: Date.now()
      };

      setFrames((prev) => [...prev, newFrame]);
      await uploadFrame(file, nextIndex, localUrl, sessionId);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  };

  // Hoàn tất quét & Gửi lệnh ghép ảnh qua RabbitMQ
  const handleFinishAndStitch = async () => {
    if (!sessionId) return;
    if (frames.length === 0) {
      alert('Vui lòng quay lia máy để thu thập ít nhất 1 góc ảnh trước khi ghép.');
      return;
    }

    try {
      setIsProcessingStitch(true);
      setStitchProgress(15);
      setStitchMessage('Đang đóng gói các góc ảnh và gửi thông điệp vào RabbitMQ AMQP...');

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
            setStitchMessage(sess.message || 'Đang xử lý thuật toán phân tích điểm chung...');

            if (sess.status === 'completed' && sess.result) {
              clearInterval(statusPollingRef.current);
              setStitchProgress(100);
              setStitchMessage('Hoàn tất ghép không gian 360°!');

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
      {/* Top Bar Header Responsive */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(20, 20, 20, 0.95)',
          flexShrink: 0,
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'rgba(212, 168, 106, 0.2)',
              border: '1px solid var(--accent-gold, #d4a86a)',
              flexShrink: 0
            }}
          >
            <Radio size={16} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Quét phòng Realtime
              </span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                ● AMQP 5672
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Lưu Cloudinary • Tự động nhận diện góc lia
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            color: '#e5e7eb',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          title="Đóng camera"
        >
          <X size={18} />
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

        {/* HUD Scanner Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: '1px dashed rgba(212, 168, 106, 0.35)',
            borderRadius: 12,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 10
          }}
        >
          {/* Top Info Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: amqpStatus === 'transmitting' ? '#f59e0b' : '#10b981',
                  boxShadow: '0 0 6px currentColor'
                }}
              />
              <span>{amqpStatus === 'transmitting' ? 'Đang gửi...' : 'RabbitMQ: Live'}</span>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: 16,
                border: '1px solid rgba(212, 168, 106, 0.5)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent-gold, #d4a86a)',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Layers size={13} />
              <span>Đã bắt: {frames.length} góc</span>
            </div>
          </div>

          {/* Center Crosshair / Rotation Guide */}
          <div
            style={{
              alignSelf: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              opacity: 0.9
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                border: `2px solid ${motionDelta >= 18 ? 'var(--accent-gold, #d4a86a)' : 'rgba(255, 255, 255, 0.35)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s ease',
                boxShadow: motionDelta >= 18 ? '0 0 14px rgba(212, 168, 106, 0.6)' : 'none'
              }}
            >
              <RotateCw size={26} style={{ color: motionDelta >= 18 ? 'var(--accent-gold, #d4a86a)' : '#fff' }} />
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '3px 8px',
                borderRadius: 10,
                color: '#e5e7eb',
                textAlign: 'center',
                maxWidth: 240
              }}
            >
              {isAutoDetecting ? 'Xoay camera từ từ để bắt góc' : 'Chế độ chụp thủ công'}
            </span>
          </div>

          {/* Bottom Scanner status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', background: 'rgba(0,0,0,0.65)', padding: '3px 6px', borderRadius: 4 }}>
              Độ lệch: {motionDelta}% {motionDelta >= 18 ? '● Bắt góc' : '○ Đều tay'}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af', background: 'rgba(0,0,0,0.65)', padding: '3px 6px', borderRadius: 4 }}>
              Cloudinary: Online
            </span>
          </div>
        </div>

        {/* Camera Error Alert & Mobile Guidance Card */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 12,
              background: 'rgba(18, 18, 18, 0.96)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: '20px 16px',
              borderRadius: 14,
              border: '1px solid rgba(239, 68, 68, 0.35)',
              textAlign: 'center',
              zIndex: 10,
              maxWidth: 480,
              margin: 'auto',
              maxHeight: '90%',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={24} style={{ color: '#ef4444' }} />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fca5a5' }}>
                {isInsecureHttp ? 'Trình duyệt yêu cầu HTTPS để bật Camera' : 'Không thể khởi động Camera'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#d1d5db', marginTop: 4, lineHeight: 1.45 }}>
                {isInsecureHttp
                  ? 'Theo chính sách bảo mật của Chrome & iOS Safari, WebRTC Camera chỉ hoạt động trên HTTPS hoặc Localhost.'
                  : cameraError}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 2 }}>
              {/* Nút Thử lại */}
              <button
                type="button"
                onClick={initSessionAndCamera}
                style={{
                  padding: '9px 14px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={14} />
                <span>Thử khởi động lại Camera</span>
              </button>

              {/* Nút Chọn chùm ảnh từ Album điện thoại / Máy tính */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'rgba(212, 168, 106, 0.18)',
                  border: '1px solid var(--accent-gold, #d4a86a)',
                  color: 'var(--accent-gold, #d4a86a)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Upload size={14} />
                <span>Chọn ảnh từ Album để stream vào RabbitMQ</span>
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 6,
                  color: '#9ca3af',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                Đóng lại
              </button>
            </div>

            {/* Input file ẩn cho chế độ chọn ảnh từ album */}
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
              background: 'rgba(10, 10, 10, 0.94)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: 20,
              zIndex: 20
            }}
          >
            <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-gold, #d4a86a)' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-gold, #d4a86a)', textAlign: 'center' }}>
              Worker đang tự động tìm điểm chung & ghép 360°...
            </div>
            <div style={{ fontSize: '11.5px', color: '#9ca3af', maxWidth: 360, textAlign: 'center', lineHeight: 1.4 }}>
              {stitchMessage}
            </div>

            {/* Progress Bar */}
            <div style={{ width: '85%', maxWidth: 280, height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stitchProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-gold, #d4a86a) 0%, #10b981 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
              Tiến độ: {stitchProgress}% • Hàng đợi RabbitMQ AMQP
            </span>
          </div>
        )}
      </div>

      {/* Filmstrip Bottom Thumbnails */}
      {frames.length > 0 && (
        <div
          style={{
            padding: '6px 12px',
            background: 'rgba(15, 15, 15, 0.96)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            flexShrink: 0
          }}
        >
          <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
            Chuỗi góc ({frames.length}):
          </span>
          {frames.map((f) => (
            <div
              key={f.index}
              style={{
                position: 'relative',
                width: 44,
                height: 44,
                borderRadius: 5,
                overflow: 'hidden',
                border: '1px solid rgba(212, 168, 106, 0.4)',
                flexShrink: 0,
                background: '#000'
              }}
            >
              <img
                src={f.url}
                alt={`Góc ${f.index}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                  fontSize: '8.5px',
                  fontWeight: 700,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '1px 3px',
                  borderRadius: 2
                }}
              >
                #{f.index}
              </span>
              {f.isUploaded && (
                <div
                  style={{
                    position: 'absolute',
                    top: 1,
                    left: 1,
                    background: '#10b981',
                    borderRadius: '50%',
                    width: 10,
                    height: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Đã lưu Cloudinary & RabbitMQ"
                >
                  <Check size={7} style={{ color: '#fff' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Control Actions Bottom Bar Responsive for Mobile */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
          background: 'rgba(20, 20, 20, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          gap: 10,
          flexShrink: 0
        }}
      >
        {/* Nút Bật/Tắt Tự động bắt góc */}
        <button
          type="button"
          onClick={() => setIsAutoDetecting((prev) => !prev)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: isAutoDetecting ? '1px solid var(--accent-gold, #d4a86a)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isAutoDetecting ? 'rgba(212, 168, 106, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: isAutoDetecting ? 'var(--accent-gold, #d4a86a)' : '#9ca3af',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap'
          }}
        >
          <Sparkles size={13} />
          <span>{isAutoDetecting ? 'Tự bắt: BẬT' : 'Tự bắt: TẮT'}</span>
        </button>

        {/* Nút chụp thủ công */}
        <button
          type="button"
          onClick={() => sessionId && captureCurrentFrame(sessionId)}
          disabled={!isCameraReady || isProcessingStitch}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent-gold, #d4a86a)',
            border: '3px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1410',
            cursor: isCameraReady ? 'pointer' : 'not-allowed',
            boxShadow: '0 0 14px rgba(212, 168, 106, 0.45)',
            transition: 'transform 0.1s ease',
            flexShrink: 0
          }}
          title="Bấm để bắt góc này thủ công"
        >
          <Camera size={22} />
        </button>

        {/* Nút Hoàn tất quét & Ghép 360 */}
        <button
          type="button"
          onClick={handleFinishAndStitch}
          disabled={frames.length === 0 || isProcessingStitch}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: frames.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: frames.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: frames.length > 0 ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <CheckCircle2 size={14} />
          <span>Ghép ({frames.length})</span>
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
