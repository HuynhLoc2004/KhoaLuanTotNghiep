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
                  style={{ justifyContent: 'center' }}
                >
                  <Navigation size={15} />
                  <span>Chuyển phòng</span>
                </button>
                <button
                  type="button"
                  className={`btn ${type === 'info' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setType('info')}
                  style={{ justifyContent: 'center' }}
                >
                  <Info size={15} />
                  <span>Thông tin hiện vật</span>
                </button>
              </div>
            </div>

            {type === 'navigation' && (
              <div className="form-group">
                <label className="form-label">Chọn gian phòng đích khi du khách bước qua</label>
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
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tiêu đề nhãn hiển thị</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Bước sang Gian Văn Hóa Óc Eo"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú hoặc mô tả ngắn (Tùy chọn)</label>
              <textarea
                className="form-control"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Lối đi qua hành lang hướng Đông"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu điểm ghim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
