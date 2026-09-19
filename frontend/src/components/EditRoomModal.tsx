import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { MuseumRoom } from '../types';
import { api } from '../services/api';

interface EditRoomModalProps {
  room: MuseumRoom;
  onClose: () => void;
  onUpdated: (updatedRoom: MuseumRoom) => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({ room, onClose, onUpdated }) => {
  const [code, setCode] = useState(room.code);
  const [name, setName] = useState(room.name);
  const [period, setPeriod] = useState(room.period || 'Tiến trình Lịch sử VN');
  const [description, setDescription] = useState(room.description || '');
  const [panoramaUrl, setPanoramaUrl] = useState(room.panoramaUrl);
  const [qrScanCount, setQrScanCount] = useState(room.qrScanCount || 0);
  const [active, setActive] = useState(room.active !== false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const updated = await api.updateRoom(room.id, {
        code: code.trim(),
        name: name.trim(),
        period: period.trim() || 'Tiến trình Lịch sử VN',
        category: period.trim() || 'Tiến trình Lịch sử VN',
        description: description.trim(),
        panoramaUrl: panoramaUrl.trim(),
        thumbnailUrl: panoramaUrl.trim(),
        qrScanCount: Number(qrScanCount) || 0,
        active
      });
      onUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Lỗi cập nhật gian phòng');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 className="modal-title">Chỉnh sửa gian phòng: {room.name}</h2>
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
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {error && (
              <div
                style={{
                  background: 'var(--error-bg)',
                  color: 'var(--error)',
                  border: '1px solid var(--error-border)',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5,
                  marginBottom: 12
                }}
              >
                {error}
              </div>
            )}

            {/* Chọn nhanh mẫu phòng Bảo tàng Lịch sử TP.HCM */}
            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM)</span>
              </div>
              <select
                className="form-control"
                style={{ fontSize: '12.5px', background: 'var(--bg-surface)' }}
                defaultValue=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'P-01') {
                    setCode('P-01');
                    setName('Khảo cổ học Tiền - Sơ sử Việt Nam');
                    setPeriod('Tiến trình Lịch sử VN');
                    setDescription('Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai.');
                  } else if (val === 'P-05') {
                    setCode('P-05');
                    setName('Triều đại Nhà Nguyễn & Mỹ thuật Cung đình');
                    setPeriod('Tiến trình Lịch sử VN');
                    setDescription('Không gian lưu giữ di sản văn hóa, trang phục hoàng gia, ấn tín cửu đỉnh và nghệ thuật pháp lam dưới triều đại nhà Nguyễn (1802 - 1945).');
                  } else if (val === 'P-09') {
                    setCode('P-09');
                    setName('Di sản Văn hóa Vương quốc Phù Nam - Óc Eo');
                    setPeriod('Văn hóa Nam Bộ & Cổ vật');
                    setDescription('Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ.');
                  } else if (val === 'P-12') {
                    setCode('P-12');
                    setName('Điêu khắc Phật giáo & Ấn Độ giáo Champa');
                    setPeriod('Văn hóa Nam Bộ & Cổ vật');
                    setDescription('Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm.');
                  } else if (val === 'P-16') {
                    setCode('P-16');
                    setName('Bộ sưu tập Cổ vật Vương Hồng Sển');
                    setPeriod('Sưu tập Đặc biệt');
                    setDescription('Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ.');
                  }
                }}
              >
                <option value="">-- Bấm để chọn chuyển sang phòng di sản chuẩn --</option>
                <option value="P-01">P-01: Khảo cổ học Tiền - Sơ sử Việt Nam</option>
                <option value="P-05">P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình</option>
                <option value="P-09">P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo</option>
                <option value="P-12">P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa</option>
                <option value="P-16">P-16: Bộ sưu tập Cổ vật Vương Hồng Sển</option>
              </select>
            </div>

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
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Chuyên đề trưng bày</label>
                <select
                  className="form-control"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="Tiến trình Lịch sử VN">Tiến trình Lịch sử VN</option>
                  <option value="Văn hóa Nam Bộ & Cổ vật">Văn hóa Nam Bộ & Cổ vật</option>
                  <option value="Sưu tập Đặc biệt">Sưu tập Đặc biệt</option>
                  <option value="Thời kỳ Thành lập & Kiến trúc Đông Dương">Thời kỳ Thành lập & Kiến trúc Đông Dương</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lượt quét QR thực</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={qrScanCount}
                  onChange={(e) => setQrScanCount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả tóm tắt</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đường dẫn ảnh Panorama 360 (Equirectangular 2:1)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="url"
                  className="form-control"
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  placeholder="https://... hoặc tải file bên phải"
                  required
                />
                <label className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Upload size={14} />
                  <span>{uploading ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {panoramaUrl && (
              <div style={{ marginTop: 10, position: 'relative', height: 130, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img
                  src={panoramaUrl}
                  alt="Xem trước ảnh 360"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '2px 8px', borderRadius: 4, fontSize: '11px' }}>
                  Ảnh 360 hiện tại
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <span>Hủy</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {loading ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
              <span>Lưu thay đổi vào Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
