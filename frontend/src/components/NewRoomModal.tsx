import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Camera } from 'lucide-react';
import { MuseumRoom } from '../types';
import { api, API_BASE } from '../services/api';
import { LiveCameraSweepCapture } from './LiveCameraSweepCapture';
import { ErrorBoundary } from './ErrorBoundary';

interface NewRoomModalProps {
  onClose: () => void;
  onCreated: (room: MuseumRoom) => void;
  initialPanoramaUrl?: string;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ onClose, onCreated, initialPanoramaUrl }) => {
  const [code, setCode] = useState(`P-${100 + Math.floor(Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState(initialPanoramaUrl || '');
  const [uploading, setUploading] = useState(false);
  const [stitchingCamera, setStitchingCamera] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCameraFramesCaptured = async (files: File[]) => {
    try {
      setStitchingCamera(true);
      setError(null);
      const formData = new FormData();
      files.forEach((file, index) => {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const orderedName = `${String(index).padStart(4, '0')}_${cleanName}`;
        formData.append('images', file, orderedName);
      });

      const res = await fetch(`${API_BASE}/stitch`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Lỗi khi ghép chùm ảnh từ Camera');
      const panoUrl = data.data?.panoramaUrl || data.panoramaUrl;
      setPanoramaUrl(panoUrl);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi ghép chùm ảnh từ Camera');
    } finally {
      setStitchingCamera(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Nếu người dùng chọn chùm ảnh nhiều góc từ camera/thư viện -> Tự động ghép nối bằng OpenCV Python
    if (files.length > 1) {
      handleCameraFramesCaptured(files);
      return;
    }

    const file = files[0];
    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadPanorama(file);
      setPanoramaUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !panoramaUrl.trim()) {
      setError('Vui lòng nhập tên gian phòng và cung cấp ảnh Panorama 360');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await api.createRoom({
        code,
        name: name.trim(),
        period: period.trim() || 'Hiện vật Lịch sử',
        description: description.trim(),
        panoramaUrl: panoramaUrl.trim(),
        thumbnailUrl: panoramaUrl.trim(),
        initialView: { pitch: 0, yaw: 0, fov: 100 }
      });
      onCreated(created);
    } catch (err: any) {
      setError(err.message || 'Lỗi thêm gian phòng mới');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm gian phòng trưng bày mới</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'var(--error-bg)',
                  color: 'var(--error)',
                  border: '1px solid var(--error-border)',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Mã phòng</label>
                <input
                  type="text"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ví dụ: P-201"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên gian trưng bày</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Gian Điêu Khắc Champa Cổ"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thời kỳ lịch sử / Triều đại</label>
              <input
                type="text"
                className="form-control"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ví dụ: Thế kỷ VII - XIII sau Công nguyên"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giới thiệu tổng quan</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Ảnh toàn cảnh 360° (Equirectangular 2:1)</span>
                {panoramaUrl && (
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
                    Đã nạp ảnh
                  </span>
                )}
              </label>

              {/* 3 nút nạp ảnh đồng bộ, cùng kiểu dáng, dịu mắt */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    justifyContent: 'center',
                    padding: '8px 10px',
                    fontSize: '12px'
                  }}
                >
                  <Upload size={14} />
                  <span>Tải tệp lên</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading || stitchingCamera}
                  />
                </label>

                <label
                  className="btn btn-secondary btn-sm"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    justifyContent: 'center',
                    padding: '8px 10px',
                    fontSize: '12px'
                  }}
                >
                  <Camera size={14} />
                  <span>Chụp ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading || stitchingCamera}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={uploading || stitchingCamera}
                  style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '12px' }}
                >
                  <Camera size={14} />
                  <span>Quét AR</span>
                </button>
              </div>

              {/* Ô nhập link ảnh trực tiếp */}
              <input
                type="text"
                className="form-control"
                value={panoramaUrl}
                onChange={(e) => setPanoramaUrl(e.target.value)}
                placeholder="Hoặc dán link ảnh 360° (Cloudinary, Cloudflare R2, URL trực tiếp...)"
                style={{ fontSize: 12.5 }}
                required
              />

              {uploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-muted)' }}>
                  <Loader2 size={13} className="spin" />
                  <span>Đang tải ảnh lên máy chủ...</span>
                </div>
              )}

              {stitchingCamera && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-main)' }}>
                  <Loader2 size={14} className="spin" style={{ color: 'var(--primary)' }} />
                  <span>Đang ghép chùm ảnh bằng thuật toán OpenCV...</span>
                </div>
              )}

              {/* Preview ảnh nhỏ xinh nếu đã có link */}
              {panoramaUrl && (
                <div style={{ position: 'relative', height: 110, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#0F172A', marginTop: 2 }}>
                  <img
                    src={panoramaUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(15, 23, 42, 0.75)', color: '#FFFFFF', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                    Xem trước không gian 360°
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanoramaUrl('')}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.85)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Xóa ảnh này"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading || stitchingCamera}>
              {loading ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Tạo gian phòng'
              )}
            </button>
          </div>
        </form>
      </div>

      <ErrorBoundary fallbackTitle="Không thể mở Studio Camera">
        <LiveCameraSweepCapture
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onFramesCaptured={handleCameraFramesCaptured}
        />
      </ErrorBoundary>
    </div>
  );
};
