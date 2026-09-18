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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 className="modal-title">Thêm Gian Phòng Trưng Bày Mới</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 13
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
                placeholder="Mô tả nội dung, hiện vật tiêu biểu trong gian phòng này..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Ảnh Toàn Cảnh 360° (Equirectangular 2:1)</span>
                <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>Tự động ghép OpenCV Python</span>
              </label>

              {/* Các tùy chọn tạo ảnh 360 được bố trí khoa học, tối ưu di động */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* 1. Nút mở Camera Studio AR */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={uploading || stitchingCamera}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                    color: '#FFF',
                    border: 'none',
                    padding: '11px 16px',
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <Camera size={18} />
                  <span>📷 Quét Không Gian 360° (Studio Camera AR)</span>
                </button>

                {/* 2. Hai nút phụ: Chụp nhanh từ Camera điện thoại & Chọn file thư viện */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                  {/* Chụp trực tiếp bằng Camera sau của máy (Hỗ trợ 100% điện thoại trên mọi mạng) */}
                  <label
                    className="btn btn-secondary"
                    style={{
                      cursor: uploading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      background: '#F8FAFC'
                    }}
                  >
                    <Camera size={15} style={{ color: '#10B981' }} />
                    <span>📱 Chụp bằng Camera sau</span>
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

                  {/* Chọn từ Thư viện / Tệp */}
                  <label
                    className="btn btn-secondary"
                    style={{
                      cursor: uploading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600
                    }}
                  >
                    {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
                    <span>📁 Chọn từ Thư viện</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploading || stitchingCamera}
                    />
                  </label>
                </div>

                {/* Ô nhập / dán URL ảnh nếu có */}
                <input
                  type="text"
                  className="form-control"
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  placeholder="Hoặc dán URL ảnh 360° (Cloudinary, Cloudflare R2...)"
                  style={{ width: '100%', fontSize: 12, marginTop: 2 }}
                  required
                />
              </div>

              {stitchingCamera && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    marginTop: 6
                  }}
                >
                  <Loader2 size={18} className="spin" />
                  <span>Đang dùng OpenCV & Python tự động ghép chùm ảnh không gian 360°...</span>
                </div>
              )}

              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                * Hỗ trợ quét tự động qua AR Studio hoặc chụp liên tiếp chùm ảnh bằng camera điện thoại.
              </span>
            </div>

            {/* Image Preview */}
            {panoramaUrl && (
              <div
                style={{
                  height: 100,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
                }}
              >
                <img
                  src={panoramaUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 6,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 11
                  }}
                >
                  Xem trước ảnh toàn cảnh
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading || stitchingCamera}>
              {loading ? 'Đang lưu...' : 'Tạo gian phòng'}
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
