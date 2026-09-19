import React, { useState } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { MuseumRoom } from '../types';
import { api } from '../services/api';

interface NewRoomModalProps {
  onClose: () => void;
  onCreated: (room: MuseumRoom) => void;
  initialPanoramaUrl?: string;
  panoramas?: Array<{ filename: string; url: string; date?: string; title?: string }>;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({
  onClose,
  onCreated,
  initialPanoramaUrl,
  panoramas = []
}) => {
  const [code, setCode] = useState(`P-${100 + Math.floor(Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState(initialPanoramaUrl || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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
        code: code.trim(),
        name: name.trim(),
        period: period.trim() || 'Hiện vật Lịch sử',
        category: period.trim() || 'Hiện vật Lịch sử',
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
    <div className="modal-backdrop" style={{ zIndex: 1200 }}>
      <div className="modal-card" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '17px', margin: 0 }}>
            Thêm gian phòng trưng bày mới
          </h2>
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
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <label className="form-label">Mã phòng *</label>
                <input
                  type="text"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="P-101, P-201..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tên gian trưng bày *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Gian Văn hóa Óc Eo..."
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
                placeholder="Ví dụ: Thế kỷ I đến thế kỷ VII sau Công nguyên..."
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
                <span>Ảnh toàn cảnh 360° (Equirectangular 2:1) *</span>
                {panoramaUrl && (
                  <span style={{ fontSize: 11.5, color: 'var(--accent-gold)', fontWeight: 600 }}>
                    Đã nạp ảnh
                  </span>
                )}
              </label>

              {/* Tùy chọn 1: Chọn từ kho ảnh 360° đã ghép nối sẵn */}
              {panoramas && panoramas.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <select
                    className="form-control"
                    style={{ fontSize: '12.5px', background: 'var(--bg-subtle)' }}
                    value={panoramas.some((p) => p.url === panoramaUrl) ? panoramaUrl : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setPanoramaUrl(e.target.value);
                        setError(null);
                      }
                    }}
                  >
                    <option value="">-- Chọn ảnh toàn cảnh có sẵn trong Kho 360° ({panoramas.length} ảnh) --</option>
                    {panoramas.map((p, idx) => (
                      <option key={p.filename || idx} value={p.url}>
                        {p.filename} {p.date ? `(${p.date})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tùy chọn 2 & 3: Tải tệp lên hoặc Dán đường dẫn trực tiếp */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <input
                  type="text"
                  className="form-control"
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  placeholder="Dán đường dẫn ảnh 360° (Cloudinary, Cloudflare R2, URL trực tiếp)..."
                  style={{ fontSize: 12.5, flex: 1 }}
                  required
                />

                <label
                  className="btn btn-secondary btn-sm"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Upload size={14} />
                  <span>{uploading ? 'Đang tải...' : 'Tải tệp ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>

              {uploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-muted)', marginTop: 6 }}>
                  <Loader2 size={13} className="spin" />
                  <span>Đang tải ảnh lên máy chủ...</span>
                </div>
              )}

              {/* Preview ảnh nhỏ nếu đã có link */}
              {panoramaUrl && (
                <div style={{ position: 'relative', height: 110, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#0F172A', marginTop: 8 }}>
                  <img
                    src={panoramaUrl}
                    alt="Preview 360"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(15, 23, 42, 0.8)', color: '#FFFFFF', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                    Xem trước ảnh cầu 360°
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

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
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
    </div>
  );
};
