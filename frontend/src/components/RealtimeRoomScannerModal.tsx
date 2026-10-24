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
  Copy,
  ExternalLink,
  ShieldCheck
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
  const cameraCaptureRef = useRef<HTMLInputElement>(null);

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
          body: JSON.stringify({ name: `Quét không gian phòng - ${new Date().toLocaleTimeString('vi-VN')}` })
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

  // Chuyển hướng nhanh sang HTTPS khi người dùng truy cập qua HTTP
  const handleSwitchToHttps = () => {
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('http:')) {
      window.location.href = currentUrl.replace(/^http:/i, 'https:');
    } else {
      initSessionAndCamera();
    }
  };

  // Mô phỏng Stream liên tục từ chùm ảnh có sẵn hoặc ảnh chụp camera native (Dành cho di động / HTTP)
  const handleSimulateStreamFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Đảm bảo có sessionId trước khi tải lên
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
      const nextIndex = frames.length + i + 1;

      const newFrame: CapturedFrame = {
        index: nextIndex,
        url: localUrl,
        isUploading: true,
        isUploaded: false,
        timestamp: Date.now()
      };

      setFrames((prev) => [...prev, newFrame]);
      await uploadFrame(file, nextIndex, localUrl, currSessionId);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    // Reset value để cho phép chụp liên tiếp nhiều lần
    e.target.value = '';
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
      {/* Explicit Keyframes for modal spinner rotation */}
      <style>{`
        @keyframes realtimeSpinKeyframes {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .realtime-spinner-rotate {
          animation: realtimeSpinKeyframes 0.9s linear infinite !important;
          transform-origin: center center !important;
          display: inline-block !important;
        }
      `}</style>

      {/* Top Bar Header Responsive */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'max(12px, env(safe-area-inset-top, 12px))',
          borderBottom: '1px solid rgba(212, 168, 106, 0.2)',
          background: 'rgba(20, 18, 16, 0.98)',
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
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5f0eb', letterSpacing: '0.2px' }}>
              Quét không gian phòng
            </div>
            <div style={{ fontSize: '11px', color: '#a89f91', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Di chuyển máy ảnh xoay chậm quanh phòng để ghi lại các góc
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
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.2s'
          }}
          title="Đóng máy ảnh"
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

        {/* Viewfinder Overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 16,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Top Bar inside Viewfinder: Subtle Frame Counter & Active Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                background: 'rgba(20, 18, 16, 0.78)',
                backdropFilter: 'blur(8px)',
                padding: '5px 12px',
                borderRadius: 20,
                border: '1px solid rgba(212, 168, 106, 0.35)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-gold, #d4a86a)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Layers size={13} />
              <span>Đã chụp: {frames.length} góc</span>
            </div>

            {/* Subtle status dot when uploading/capturing */}
            {amqpStatus === 'transmitting' && (
              <div
                style={{
                  background: 'rgba(20, 18, 16, 0.78)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 10px',
                  borderRadius: 20,
                  border: '1px solid rgba(212, 168, 106, 0.35)',
                  fontSize: '11px',
                  color: '#d4a86a',
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
                    background: 'var(--accent-gold, #d4a86a)'
                  }}
                />
                <span>Đang xử lý góc...</span>
              </div>
            )}
          </div>

          {/* 4 Professional Viewfinder Corner Brackets */}
          <div style={{ position: 'absolute', inset: 8, pointerEvents: 'none' }}>
            {/* Top-Left */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, borderTop: '2px solid rgba(212, 168, 106, 0.7)', borderLeft: '2px solid rgba(212, 168, 106, 0.7)', borderTopLeftRadius: 3 }} />
            {/* Top-Right */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderTop: '2px solid rgba(212, 168, 106, 0.7)', borderRight: '2px solid rgba(212, 168, 106, 0.7)', borderTopRightRadius: 3 }} />
            {/* Bottom-Left */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 22, height: 22, borderBottom: '2px solid rgba(212, 168, 106, 0.7)', borderLeft: '2px solid rgba(212, 168, 106, 0.7)', borderBottomLeftRadius: 3 }} />
            {/* Bottom-Right */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderBottom: '2px solid rgba(212, 168, 106, 0.7)', borderRight: '2px solid rgba(212, 168, 106, 0.7)', borderBottomRightRadius: 3 }} />
          </div>

          {/* Subtle Bottom Instruction Pill */}
          <div style={{ alignSelf: 'center', display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                background: 'rgba(20, 18, 16, 0.82)',
                backdropFilter: 'blur(6px)',
                padding: '4px 12px',
                borderRadius: 16,
                border: '1px solid rgba(212, 168, 106, 0.25)',
                color: '#e5ded5',
                textAlign: 'center'
              }}
            >
              {isAutoDetecting
                ? motionDelta >= 18
                  ? 'Đang nhận diện góc mới...'
                  : 'Xoay máy ảnh chậm rãi quanh phòng'
                : 'Chế độ chụp từng góc thủ công'}
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
                  ? 'Trình duyệt Safari/Chrome trên di động chỉ cho phép bật camera trực tiếp liên tục khi truy cập qua HTTPS. Bạn có thể bấm chuyển sang HTTPS để dùng chế độ tự động, hoặc chụp ảnh trực tiếp bằng máy ảnh bên dưới.'
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
                <span>Mở máy ảnh chụp trực tiếp</span>
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

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#8b8478',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Đóng lại
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
            {/* Circular Progress Gauge & Spinning Loader */}
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
              {/* Circular Progress Track & Indicator linked to stitchProgress */}
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
                {/* Background Track */}
                <circle
                  cx="34"
                  cy="34"
                  r="28"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="3.5"
                />
                {/* Active Progress Arc */}
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

              {/* Center Continuous Spinning Loader */}
              <Loader2
                size={30}
                className="realtime-spinner-rotate spin"
                style={{
                  color: 'var(--accent-gold, #d4a86a)',
                  animation: 'realtimeSpinKeyframes 0.9s linear infinite'
                }}
              />
            </div>

            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f5f0eb', textAlign: 'center' }}>
              Đang ghép không gian toàn cảnh 360°...
            </div>
            <div style={{ fontSize: '12px', color: '#a89f91', maxWidth: 360, textAlign: 'center', lineHeight: 1.5 }}>
              {stitchMessage || 'Hệ thống đang trích xuất đặc trưng điểm ảnh và liên kết không gian...'}
            </div>

            {/* Horizontal Progress Bar */}
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

      {/* Filmstrip Bottom Thumbnails */}
      {frames.length > 0 && (
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(18, 16, 14, 0.98)',
            borderTop: '1px solid rgba(212, 168, 106, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            flexShrink: 0
          }}
        >
          <span style={{ fontSize: '11px', color: '#a89f91', whiteSpace: 'nowrap', fontWeight: 500 }}>
            Chuỗi góc ({frames.length}):
          </span>
          {frames.map((f) => (
            <div
              key={f.index}
              style={{
                position: 'relative',
                width: 46,
                height: 46,
                borderRadius: 6,
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
                  bottom: 2,
                  right: 2,
                  fontSize: '9px',
                  fontWeight: 600,
                  background: 'rgba(18, 15, 13, 0.85)',
                  color: '#f5f0eb',
                  padding: '1px 4px',
                  borderRadius: 3
                }}
              >
                #{f.index}
              </span>
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
          padding: '12px 18px',
          paddingBottom: 'max(14px, env(safe-area-inset-bottom, 14px))',
          background: 'rgba(20, 18, 16, 0.98)',
          borderTop: '1px solid rgba(212, 168, 106, 0.2)',
          gap: 12,
          flexShrink: 0
        }}
      >
        {/* Nút Bật/Tắt Tự động bắt góc */}
        <button
          type="button"
          onClick={() => setIsAutoDetecting((prev) => !prev)}
          style={{
            padding: '9px 12px',
            borderRadius: 8,
            border: isAutoDetecting ? '1px solid var(--accent-gold, #d4a86a)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isAutoDetecting ? 'rgba(212, 168, 106, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: isAutoDetecting ? 'var(--accent-gold, #d4a86a)' : '#8b8478',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap'
          }}
        >
          <Camera size={14} />
          <span>{isAutoDetecting ? 'Tự bắt góc: Bật' : 'Tự bắt góc: Tắt'}</span>
        </button>

        {/* Pro Camera Shutter Button */}
        <button
          type="button"
          onClick={() => {
            if (isCameraReady && sessionId) {
              captureCurrentFrame(sessionId);
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
            border: '3px solid rgba(255, 255, 255, 0.8)',
            padding: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isProcessingStitch ? 'not-allowed' : 'pointer',
            transition: 'transform 0.15s ease',
            flexShrink: 0
          }}
          title={isCameraReady ? 'Chụp góc hiện tại' : 'Mở máy ảnh chụp góc mới'}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--accent-gold, #d4a86a)',
              transition: 'background 0.2s'
            }}
          />
        </button>

        {/* Nút Hoàn tất quét & Ghép 360 */}
        <button
          type="button"
          onClick={handleFinishAndStitch}
          disabled={frames.length === 0 || isProcessingStitch}
          style={{
            padding: '9px 14px',
            borderRadius: 8,
            background: frames.length > 0 ? 'linear-gradient(135deg, #8c2d19 0%, #6e2010 100%)' : 'rgba(255, 255, 255, 0.08)',
            border: frames.length > 0 ? '1px solid rgba(212, 168, 106, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: frames.length > 0 ? '#ffffff' : '#8b8478',
            fontSize: '12px',
            fontWeight: 600,
            cursor: frames.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: frames.length > 0 ? '0 4px 12px rgba(140, 45, 25, 0.35)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <Check size={14} />
          <span>Ghép ảnh ({frames.length})</span>
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
