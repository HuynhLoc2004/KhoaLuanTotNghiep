import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Check
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

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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

  // Khởi động phiên quét mới và kết nối Camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;

    const initSessionAndCamera = async () => {
      try {
        setCameraError(null);
        setFrames([]);
        setIsProcessingStitch(false);
        setStitchProgress(0);

        // 1. Khởi tạo phiên quét mới trên Server & RabbitMQ
        const res = await fetch(`${API_BASE}/stitch/realtime/session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Quét phòng trực tiếp AMQP - ${new Date().toLocaleTimeString('vi-VN')}` })
        });
        const json = await res.json();
        if (json.success && json.session) {
          if (isMounted) setSessionId(json.session.id);
        } else {
          throw new Error(json.message || 'Không thể tạo phiên quét realtime');
        }

        // 2. Khởi tạo Camera gốc chất lượng cao
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ WebRTC Camera.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
          },
          audio: false
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }

        setIsCameraReady(true);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[Realtime Camera Init Error]:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Bạn chưa cấp quyền truy cập Camera. Vui lòng cho phép quyền máy ảnh trong cài đặt trình duyệt để tiếp tục.'
            : (err.message || 'Không thể khởi động camera.')
        );
      }
    };

    initSessionAndCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, stopCamera]);

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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 5, 0.96)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        color: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Bar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(20, 20, 20, 0.85)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(212, 168, 106, 0.2)',
              border: '1px solid var(--accent-gold, #d4a86a)'
            }}
          >
            <Radio size={18} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Quét phòng Realtime Stream (AMQP Queue)</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                ● Live 5672
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: 2 }}>
              Camera tự động nhận diện góc lia mới • Lưu trữ Cloudinary • Không giới hạn góc ảnh
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#e5e7eb',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
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
            inset: 20,
            border: '1px dashed rgba(212, 168, 106, 0.4)',
            borderRadius: 16,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 16
          }}
        >
          {/* Top Info Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: amqpStatus === 'transmitting' ? '#f59e0b' : '#10b981',
                  boxShadow: '0 0 8px currentColor'
                }}
              />
              <span>
                {amqpStatus === 'transmitting' ? 'Đang đẩy ảnh lên Cloudinary & AMQP...' : 'RabbitMQ AMQP: Trực tuyến'}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(212, 168, 106, 0.5)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--accent-gold, #d4a86a)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Layers size={14} />
              <span>Đã bắt: {frames.length} góc ảnh</span>
            </div>
          </div>

          {/* Center Crosshair / Rotation Guide */}
          <div
            style={{
              alignSelf: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              opacity: 0.85
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                border: `2px solid ${motionDelta >= 18 ? 'var(--accent-gold, #d4a86a)' : 'rgba(255, 255, 255, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s ease',
                boxShadow: motionDelta >= 18 ? '0 0 16px rgba(212, 168, 106, 0.5)' : 'none'
              }}
            >
              <RotateCw size={32} style={{ color: motionDelta >= 18 ? 'var(--accent-gold, #d4a86a)' : '#fff' }} />
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '4px 10px',
                borderRadius: 12,
                color: '#e5e7eb'
              }}
            >
              {isAutoDetecting ? 'Xoay camera từ từ quanh phòng để bắt các góc' : 'Chế độ chụp thủ công'}
            </span>
          </div>

          {/* Bottom Scanner status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6 }}>
              Độ lệch góc: {motionDelta}% {motionDelta >= 18 ? '● Đang bắt góc mới' : '○ Giữ đều tay'}
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 6 }}>
              Cloudinary CDN: Sẵn sàng
            </span>
          </div>
        </div>

        {/* Camera Error Alert */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 20,
              background: 'rgba(15, 15, 15, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: 24,
              borderRadius: 12,
              textAlign: 'center'
            }}
          >
            <AlertTriangle size={36} style={{ color: '#ef4444' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fca5a5', maxWidth: 420 }}>
              {cameraError}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 8,
                padding: '8px 18px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Đóng lại
            </button>
          </div>
        )}

        {/* Processing Modal Overlay when Stitching */}
        {isProcessingStitch && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 10, 10, 0.92)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              padding: 24,
              zIndex: 10
            }}
          >
            <Loader2 size={46} className="spinner" style={{ color: 'var(--accent-gold, #d4a86a)' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-gold, #d4a86a)' }}>
              Worker đang tự động tìm điểm chung & ghép không gian 360°...
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', maxWidth: 460, textAlign: 'center' }}>
              {stitchMessage}
            </div>

            {/* Progress Bar */}
            <div style={{ width: 320, height: 8, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${stitchProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-gold, #d4a86a) 0%, #10b981 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Tiến độ: {stitchProgress}% • Hàng đợi RabbitMQ AMQP
            </span>
          </div>
        )}
      </div>

      {/* Filmstrip Bottom Thumbnails */}
      {frames.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(15, 15, 15, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto'
          }}
        >
          <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
            Chuỗi góc ({frames.length}):
          </span>
          {frames.map((f) => (
            <div
              key={f.index}
              style={{
                position: 'relative',
                width: 52,
                height: 52,
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
                  fontWeight: 700,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '1px 3px',
                  borderRadius: 3
                }}
              >
                #{f.index}
              </span>
              {f.isUploaded && (
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    background: '#10b981',
                    borderRadius: '50%',
                    width: 12,
                    height: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Đã lưu Cloudinary & RabbitMQ"
                >
                  <Check size={8} style={{ color: '#fff' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Control Actions Bottom Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'rgba(20, 20, 20, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          gap: 12
        }}
      >
        <button
          type="button"
          onClick={() => setIsAutoDetecting((prev) => !prev)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: isAutoDetecting ? '1px solid var(--accent-gold, #d4a86a)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: isAutoDetecting ? 'rgba(212, 168, 106, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: isAutoDetecting ? 'var(--accent-gold, #d4a86a)' : '#9ca3af',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Sparkles size={14} />
          <span>{isAutoDetecting ? 'Tự động bắt góc: BẬT' : 'Tự động bắt góc: TẮT'}</span>
        </button>

        {/* Nút chụp thủ công */}
        <button
          type="button"
          onClick={() => sessionId && captureCurrentFrame(sessionId)}
          disabled={!isCameraReady || isProcessingStitch}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'var(--accent-gold, #d4a86a)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1410',
            cursor: isCameraReady ? 'pointer' : 'not-allowed',
            boxShadow: '0 0 16px rgba(212, 168, 106, 0.4)',
            transition: 'transform 0.1s ease'
          }}
          title="Bấm để bắt góc này thủ công"
        >
          <Camera size={24} />
        </button>

        {/* Nút Hoàn tất quét & Ghép 360 */}
        <button
          type="button"
          onClick={handleFinishAndStitch}
          disabled={frames.length === 0 || isProcessingStitch}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: frames.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: frames.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: frames.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <CheckCircle2 size={16} />
          <span>Hoàn tất & Ghép 360 ({frames.length})</span>
        </button>
      </div>
    </div>
  );
};
