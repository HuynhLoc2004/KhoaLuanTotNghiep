import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Camera } from 'lucide-react';
import { MuseumRoom } from '../types';
import { api, API_BASE } from '../services/api';
import { LiveCameraSweepCapture } from './LiveCameraSweepCapture';

interface NewRoomModalProps {
  onClose: () => void;
  onCreated: (room: MuseumRoom) => void;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({ onClose, onCreated }) => {
  const [code, setCode] = useState(`P-${100 + Math.floor(Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState('');
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
    const file = e.target.files?.[0];
    if (!file) return;

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
        initialView: { pitch: 0, yaw: 0, fov: 90 }
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
              <label className="form-label">Ảnh Panorama 360° (Tỷ lệ chiếu cầu 2:1)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  placeholder="URL ảnh hoặc tải file từ máy tính"
                  style={{ flex: 1 }}
                  required
                />
                <label
                  className="btn btn-secondary"
                  style={{ cursor: uploading ? 'wait' : 'pointer', flexShrink: 0 }}
                >
                  {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                  <span>{uploading ? 'Đang tải...' : 'Chọn file ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading || stitchingCamera}
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={uploading || stitchingCamera}
                  style={{
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 600
                  }}
                >
                  <Camera size={16} />
                  <span>Quay Camera 360°</span>
                </button>
              </div>

              {stitchingCamera && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563EB', fontSize: 12.5, marginTop: 8 }}>
                  <Loader2 size={16} className="spin" />
                  <span>Đang tự động ghép 360° từ chùm ảnh Camera điện thoại (OpenCV Stitcher)...</span>
                </div>
              )}

              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                * Hỗ trợ quay trực tiếp bằng Camera điện thoại hoặc chọn file ảnh Panorama 360°.
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

      <LiveCameraSweepCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onFramesCaptured={handleCameraFramesCaptured}
      />
    </div>
  );
};
