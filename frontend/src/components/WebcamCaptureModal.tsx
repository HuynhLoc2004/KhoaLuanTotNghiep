import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Camera, Trash2, AlertTriangle } from 'lucide-react';

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptured: (files: File[]) => void;
  /** Số góc đã nạp trước đó, dùng để đánh số tiếp cho đúng chuỗi xoay. */
  startIndex?: number;
}

interface Shot {
  id: string;
  url: string;
  file: File;
}

/**
 * Chụp ảnh góc bằng webcam máy tính qua WebRTC.
 *
 * Trên điện thoại hệ thống dùng thẳng camera gốc qua thuộc tính `capture`,
 * modal này chỉ dành cho máy tính - nơi `capture` bị trình duyệt bỏ qua và
 * rơi về hộp thoại chọn file gây nhầm lẫn cho người dùng.
 */
export const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptured,
  startIndex = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotsRef = useRef<Shot[]>([]);

  const [shots, setShots] = useState<Shot[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  shotsRef.current = shots;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const start = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy".');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCameraError(null);
        setIsReady(true);
      } catch (err: any) {
        const denied = err?.name === 'NotAllowedError' || err?.name === 'SecurityError';
        setCameraError(
          denied
            ? 'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại.'
            : 'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy".'
        );
      }
    };

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isOpen, stopStream]);

  // Thu hồi các object URL còn sót khi component bị gỡ khỏi cây DOM
  useEffect(() => {
    return () => {
      shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, []);

  if (!isOpen) return null;

  const handleShoot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const index = startIndex + shotsRef.current.length + 1;
        const file = new File([blob], `webcam_${String(index).padStart(4, '0')}.jpg`, {
          type: 'image/jpeg'
        });
        setShots((prev) => [...prev, { id: `${Date.now()}_${index}`, url: URL.createObjectURL(blob), file }]);
      },
      'image/jpeg',
      0.94
    );
  };

  const handleRemove = (id: string) => {
    setShots((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((s) => s.id !== id);
    });
  };

  const handleFinish = () => {
    if (shots.length > 0) onCaptured(shots.map((s) => s.file));
    shots.forEach((s) => URL.revokeObjectURL(s.url));
    setShots([]);
    stopStream();
    onClose();
  };

  const handleCancel = () => {
    shots.forEach((s) => URL.revokeObjectURL(s.url));
    setShots([]);
    stopStream();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, width: '100%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="modal-title">Chụp góc bằng webcam máy tính</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleCancel} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {cameraError ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '12px 14px',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--warning-text)',
                fontSize: '12.5px'
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{cameraError}</div>
            </div>
          ) : (
            <>
              <div className="webcam-stage">
                <video ref={videoRef} playsInline muted />
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '10px 0 0' }}>
                Giữ nguyên vị trí chân, xoay máy khoảng 10 đến 20 độ sau mỗi lần bấm chụp để phủ trọn 360 độ gian phòng.
              </p>
            </>
          )}

          {shots.length > 0 && (
            <div className="webcam-shot-strip">
              {shots.map((shot, idx) => (
                <div key={shot.id} className="webcam-shot">
                  <img src={shot.url} alt={`Góc ${startIndex + idx + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemove(shot.id)}
                    title="Bỏ góc này"
                    aria-label="Bỏ góc này"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: 10, padding: '14px 20px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{ flex: '0 0 auto' }}>
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleShoot}
            disabled={!isReady}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Camera size={15} />
            <span>Chụp góc{shots.length > 0 ? ` (đã chụp ${shots.length})` : ''}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinish}
            disabled={shots.length === 0}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>Dùng {shots.length} ảnh này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
