import React, { useState } from 'react';
import { X, Navigation, Info, MapPin } from 'lucide-react';
import { MuseumRoom, Hotspot } from '../types';

interface HotspotModalProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  coords: { pitch: number; yaw: number };
  onClose: () => void;
  onSave: (hotspotData: Omit<Hotspot, 'id'>) => void;
}

export const HotspotModal: React.FC<HotspotModalProps> = ({
  currentRoom,
  allRooms,
  coords,
  onClose,
  onSave
}) => {
  const otherRooms = allRooms.filter((r) => r.id !== currentRoom.id);
  const [type, setType] = useState<'navigation' | 'info'>('navigation');
  const [targetRoomId, setTargetRoomId] = useState(otherRooms[0]?.id || '');
  const [title, setTitle] = useState(
    otherRooms[0] ? `Bước sang ${otherRooms[0].name}` : 'Điểm chuyển phòng'
  );
  const [description, setDescription] = useState('');

  const handleTargetRoomChange = (roomId: string) => {
    setTargetRoomId(roomId);
    const selected = allRooms.find((r) => r.id === roomId);
    if (selected) {
      setTitle(`Bước sang ${selected.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      type,
      title: title.trim(),
      description: description.trim(),
      targetRoomId: type === 'navigation' ? targetRoomId : undefined,
      pitch: coords.pitch,
      yaw: coords.yaw
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="modal-title">Ghim Điểm Liên Kết 360°</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'var(--bg-subtle)',
                padding: '10px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>
                Tọa độ góc: <strong>Pitch: {coords.pitch}°</strong>
              </span>
              <span>
                <strong>Yaw: {coords.yaw}°</strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Loại điểm liên kết</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  className={`btn ${type === 'navigation' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('navigation')}
                  style={{ justifyContent: 'center', gap: 6 }}
                >
                  <Navigation size={15} />
                  <span>🚪 Chuyển Phòng (Mũi Tên Đi Bộ 3D)</span>
                </button>
                <button
                  type="button"
                  className={`btn ${type === 'info' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('info')}
                  style={{ justifyContent: 'center', gap: 6 }}
                >
                  <Info size={15} />
                  <span>Thông tin hiện vật</span>
                </button>
              </div>
            </div>

            {type === 'navigation' && (
              <>
                <div className="form-group">
                  <label className="form-label">Chọn gian phòng đích khi du khách bước qua cửa</label>
                  {otherRooms.length > 0 ? (
                    <select
                      className="form-control"
                      value={targetRoomId}
                      onChange={(e) => handleTargetRoomChange(e.target.value)}
                      required
                    >
                      {otherRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.code} - {r.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ fontSize: '12.5px', color: '#B45309', background: '#FEF3C7', padding: '10px 12px', borderRadius: 6 }}>
                      ⚠️ Hiện chưa có gian phòng nào khác trong hệ thống. Bạn có thể sang menu <strong>"Gian trưng bày & Tour 360"</strong> hoặc <strong>"Kho Không Gian 360°"</strong> để tạo thêm phòng (vd: "Ngoài sân"), sau đó liên kết đến đây nhé!
                    </div>
                  )}
                </div>

                {/* Gợi ý chữ nhanh */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gợi ý tên cửa chuyển cảnh nhanh:</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['Ra ngoài sân', 'Lối ra sân vườn', 'Lối vào phòng khách', 'Bước sang phòng tiếp theo'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setTitle(chip)}
                        style={{
                          background: title === chip ? '#EFF6FF' : '#F1F5F9',
                          color: title === chip ? '#1D4ED8' : '#475569',
                          border: title === chip ? '1.5px solid #3B82F6' : '1px solid #CBD5E1',
                          borderRadius: 16,
                          padding: '3px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🚪 {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Chữ hiển thị trên mũi tên (Nhãn text)</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Ra ngoài sân, Bước sang sân vườn..."
                required
              />
            </div>

            {/* Xem trước Mũi Tên Đi Bộ 3D */}
            {type === 'navigation' && (
              <div
                style={{
                  background: '#0F172A',
                  borderRadius: 10,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '12px 0 16px',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Xem trước biểu tượng sẽ xuất hiện tại cửa:
                </div>
                <div className="walking-arrow-hotspot" style={{ pointerEvents: 'none' }}>
                  <div className="walking-arrow-label">
                    <span>🚪 {title || 'Ra ngoài sân'}</span>
                  </div>
                  <div className="walking-arrow-disc">
                    <svg className="walking-arrow-svg" viewBox="0 0 24 24">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Ghi chú hoặc mô tả ngắn (Tùy chọn)</label>
              <textarea
                className="form-control"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Cửa chính dẫn ra khoảng sân trước nhà..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 700, padding: '9px 18px' }}>
              ✓ Lưu & Đặt Mũi Tên Tại Cửa
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
