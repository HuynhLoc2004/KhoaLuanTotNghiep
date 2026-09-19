import React, { useState } from 'react';
import { X, Navigation, Info, MapPin, Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import { MuseumRoom, Hotspot } from '../types';

interface HotspotModalProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  coords: { pitch: number; yaw: number };
  onClose: () => void;
  onSave: (hotspotData: Omit<Hotspot, 'id'>) => void;
}

const QUICK_CHIPS = [
  'Ra ngoài sân',
  'Lối ra sân vườn',
  'Gian Chính Điện',
  'Lối vào phòng khách',
  'Bước sang phòng tiếp theo'
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
    otherRooms[0] ? `Bước sang ${otherRooms[0].name}` : 'Ra ngoài sân'
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        backdropFilter: 'blur(8px)',
        background: 'rgba(15, 23, 42, 0.75)',
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
          maxWidth: '540px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'modalEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes modalEntrance {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .chip-btn {
            background: #F8FAFC;
            color: #475569;
            border: 1px solid #E2E8F0;
            border-radius: 9999px;
            padding: 5px 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          .chip-btn:hover {
            background: #EFF6FF;
            color: #2563EB;
            border-color: #BFDBFE;
            transform: translateY(-1px);
          }
          .chip-btn.active {
            background: #EFF6FF;
            color: #1D4ED8;
            border-color: #3B82F6;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
          }
          .type-tab-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 14px;
            border-radius: 12px;
            border: 1.5px solid transparent;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            transition: all 0.2s ease;
          }
        `}</style>

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            background: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB'
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                Thiết Lập Điểm Chuyển Cảnh
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', marginTop: 2 }}>
                Gắn mũi tên 3D tại cửa để bước sang không gian khác
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: 'none',
              background: '#F1F5F9',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Tọa độ góc nhìn */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '8px 14px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#475569' }}>
                <Compass size={14} style={{ color: '#2563EB' }} />
                <span>Tọa độ đã chọn trên ảnh 360:</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  Pitch: {coords.pitch}°
                </span>
                <span
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  Yaw: {coords.yaw}°
                </span>
              </div>
            </div>

            {/* Bộ chọn loại điểm */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Loại Điểm Tương Tác
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  background: '#F1F5F9',
                  padding: 4,
                  borderRadius: 14
                }}
              >
                <button
                  type="button"
                  className="type-tab-btn"
                  onClick={() => setType('navigation')}
                  style={{
                    background: type === 'navigation' ? '#FFFFFF' : 'transparent',
                    color: type === 'navigation' ? '#2563EB' : '#64748B',
                    boxShadow: type === 'navigation' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    borderColor: type === 'navigation' ? '#DBEAFE' : 'transparent'
                  }}
                >
                  <Navigation size={15} />
                  <span>Mũi Tên Đi Bộ 3D</span>
                </button>

                <button
                  type="button"
                  className="type-tab-btn"
                  onClick={() => setType('info')}
                  style={{
                    background: type === 'info' ? '#FFFFFF' : 'transparent',
                    color: type === 'info' ? '#D97706' : '#64748B',
                    boxShadow: type === 'info' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    borderColor: type === 'info' ? '#FDE68A' : 'transparent'
                  }}
                >
                  <Info size={15} />
                  <span>Thông Tin Hiện Vật</span>
                </button>
              </div>
            </div>

            {/* Trường chọn phòng đích */}
            {type === 'navigation' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Gian Phòng Đích (Nơi du khách bước tới)
                </label>
                {otherRooms.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-control"
                      value={targetRoomId}
                      onChange={(e) => handleTargetRoomChange(e.target.value)}
                      required
                      style={{
                        padding: '10px 14px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: '#0F172A',
                        borderRadius: '10px',
                        borderColor: '#CBD5E1'
                      }}
                    >
                      {otherRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.code}] — {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--warning)',
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      padding: '10px 14px',
                      borderRadius: 6,
                      lineHeight: 1.4
                    }}
                  >
                    Hiện chưa có phòng nào khác trong hệ thống. Bạn có thể thêm phòng mới ở mục "Gian trưng bày & Tour 360", sau đó tạo liên kết chuyển phòng đến đây.
                  </div>
                )}
              </div>
            )}

            {/* Gợi ý tên nhanh */}
            {type === 'navigation' && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
                  <span>Gợi ý tên nhanh:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK_CHIPS.map((chip) => {
                    const isActive = title === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        className={`chip-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setTitle(chip)}
                      >
                        <span>{chip}</span>
                        {isActive && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ô nhập tên hiển thị */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Chữ Hiển Thị Trên Mũi Tên
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Ra ngoài sân, Lối vào gian tiền sử..."
                required
                style={{
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  borderColor: '#CBD5E1'
                }}
              />
            </div>

            {/* KHUNG XEM TRƯỚC DIỆN MẠO (CLEAN & GORGEOUS - NO OVERLAP) */}
            {type === 'navigation' && (
              <div
                style={{
                  background: 'linear-gradient(145deg, #0B1120, #0F172A)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '16px',
                  border: '1px solid #1E293B',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    textAlign: 'center',
                    marginBottom: '14px'
                  }}
                >
                  Xem trước diện mạo mũi tên tại cửa:
                </div>

                {/* Container riêng cho mockup */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '8px 0'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1.5px solid #3B82F6',
                      borderRadius: '30px',
                      padding: '6px 16px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxShadow: '0 0 16px rgba(59, 130, 246, 0.5)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {title || 'Chuyển gian phòng'}
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #2563EB 0%, #1E3A8A 100%)',
                      border: '2.5px solid #FFFFFF',
                      boxShadow: '0 0 20px rgba(37, 99, 235, 0.85), 0 0 35px rgba(59, 130, 246, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: 22,
                        height: 22,
                        fill: 'none',
                        stroke: '#FFFFFF',
                        strokeWidth: 3.2,
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
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Ghi Chú Hoặc Mô Tả Ngắn (Tùy chọn)
              </label>
              <textarea
                className="form-control"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Cửa gỗ cổ dẫn ra khuôn viên sân trước..."
                style={{
                  borderRadius: '10px',
                  borderColor: '#CBD5E1',
                  padding: '9px 12px',
                  fontSize: '12.5px',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 24px',
              background: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                borderRadius: '10px',
                padding: '9px 18px',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                borderRadius: '10px',
                padding: '9px 22px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              <span>Lưu & Đặt Mũi Tên</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
