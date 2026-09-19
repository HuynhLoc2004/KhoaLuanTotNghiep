import React, { useState } from 'react';
import { X, Navigation, Info, MapPin, Compass, Check, ArrowRight } from 'lucide-react';
import { MuseumRoom, Hotspot } from '../types';

interface HotspotModalProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  coords: { pitch: number; yaw: number };
  onClose: () => void;
  onSave: (hotspotData: Omit<Hotspot, 'id'>) => void;
}

const QUICK_CHIPS = [
  'Lối sang gian tiếp theo',
  'Cửa chính vào gian phòng',
  'Ra khuôn viên sân trước',
  'Lối sang gian tiền sử',
  'Lối tham quan tiếp theo'
];

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
    otherRooms[0] ? `Lối sang ${otherRooms[0].name}` : 'Lối sang gian tiếp theo'
  );
  const [description, setDescription] = useState('');

  const handleTargetRoomChange = (roomId: string) => {
    setTargetRoomId(roomId);
    const selected = allRooms.find((r) => r.id === roomId);
    if (selected) {
      setTitle(`Lối sang ${selected.name}`);
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(8px)',
        background: 'rgba(26, 23, 21, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-color)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          animation: 'modalEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes modalEntrance {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .chip-btn-heritage {
            background: var(--bg-subtle);
            color: var(--text-muted);
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 5px 12px;
            font-size: 11.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          .chip-btn-heritage:hover {
            border-color: var(--accent-gold);
            color: var(--accent-gold);
            background: rgba(212, 168, 106, 0.08);
          }
          .chip-btn-heritage.active {
            background: rgba(212, 168, 106, 0.14);
            color: var(--accent-gold);
            border-color: var(--accent-gold);
            font-weight: 600;
          }
          .type-tab-btn-heritage {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 9px 12px;
            border-radius: var(--radius-sm);
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 12.5px;
            font-weight: 600;
            transition: all 0.15s ease;
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card-header)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #6E2212 100%)',
                border: '1px solid rgba(212, 168, 106, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--heading-color)' }}>
                Thiết Lập Điểm Chuyển Phòng
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', marginTop: 2 }}>
                Gắn điểm điều hướng 3D trên ảnh để du khách bước sang không gian khác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 20px', maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Bộ chọn loại điểm */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Loại điểm tương tác
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  background: 'var(--bg-subtle)',
                  padding: 4,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <button
                  type="button"
                  className="type-tab-btn-heritage"
                  onClick={() => setType('navigation')}
                  style={{
                    background: type === 'navigation' ? 'var(--bg-surface)' : 'transparent',
                    color: type === 'navigation' ? 'var(--accent-gold)' : 'var(--text-muted)',
                    borderColor: type === 'navigation' ? 'var(--accent-gold)' : 'transparent',
                    boxShadow: type === 'navigation' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <Navigation size={14} />
                  <span>Điểm Chuyển Phòng (Mũi tên 3D)</span>
                </button>

                <button
                  type="button"
                  className="type-tab-btn-heritage"
                  onClick={() => setType('info')}
                  style={{
                    background: type === 'info' ? 'var(--bg-surface)' : 'transparent',
                    color: type === 'info' ? 'var(--accent-gold)' : 'var(--text-muted)',
                    borderColor: type === 'info' ? 'var(--accent-gold)' : 'transparent',
                    boxShadow: type === 'info' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <Info size={14} />
                  <span>Thông Tin Hiện Vật</span>
                </button>
              </div>
            </div>

            {/* Trường chọn phòng đích */}
            {type === 'navigation' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Gian phòng đích (Nơi du khách bước tới)
                </label>
                {otherRooms.length > 0 ? (
                  <select
                    className="form-control"
                    value={targetRoomId}
                    onChange={(e) => handleTargetRoomChange(e.target.value)}
                    required
                    style={{
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-main)'
                    }}
                  >
                    {otherRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.code}] — {r.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      lineHeight: 1.4
                    }}
                  >
                    Hiện chưa có phòng nào khác trong hệ thống. Bạn có thể thêm phòng mới ở mục &quot;Gian trưng bày &amp; Tour 360&quot;.
                  </div>
                )}
              </div>
            )}

            {/* Gợi ý tên nhanh */}
            {type === 'navigation' && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Gợi ý tên nhanh:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK_CHIPS.map((chip) => {
                    const isActive = title === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={`chip-btn-heritage ${isActive ? 'active' : ''}`}
                        onClick={() => setTitle(chip)}
                      >
                        <span>{chip}</span>
                        {isActive && <Check size={11} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ô nhập tên hiển thị */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Tên hiển thị trên điểm tương tác
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Lối sang gian Tiền Sử, Ra ngoài sân..."
                required
                style={{
                  padding: '9px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Khung xem trước diện mạo */}
            {type === 'navigation' && (
              <div
                style={{
                  background: 'var(--bg-page)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  marginBottom: '14px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    textAlign: 'center',
                    marginBottom: '10px'
                  }}
                >
                  Xem trước diện mạo điểm ghim:
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '4px 0'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(36, 32, 29, 0.95)',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '20px',
                      padding: '4px 14px',
                      color: '#EDE5DF',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {title || 'Chuyển gian phòng'}
                  </div>

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, #702212 100%)',
                      border: '2px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: 20,
                        height: 20,
                        fill: 'none',
                        stroke: '#FFFFFF',
                        strokeWidth: 3,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                      }}
                    >
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Ghi chú mô tả */}
            <div style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Ghi chú hoặc mô tả thêm (Tùy chọn)
              </label>
              <textarea
                className="form-control"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi chú về vị trí hoặc nội dung điểm ghim..."
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--bg-card-header)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{
                padding: '7px 18px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Lưu điểm liên kết</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
