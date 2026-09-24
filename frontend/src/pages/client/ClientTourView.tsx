import React, { useState } from 'react';
import { MuseumRoom, Hotspot } from '../../types';
import { ThreePanoramaViewer } from '../../viewer360/ThreePanoramaViewer';
import { ArrowLeft, Compass, Layers, Volume2, Info, X } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTourViewProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  onBackToHome: () => void;
  onNavigateRoom: (room: MuseumRoom) => void;
}

export const ClientTourView: React.FC<ClientTourViewProps> = ({
  currentRoom,
  allRooms,
  onBackToHome,
  onNavigateRoom
}) => {
  const { t, localize } = useClientTranslation();
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
      const target = allRooms.find((r) => r.id === hotspot.targetRoomId || r.code === hotspot.targetRoomId);
      if (target) {
        onNavigateRoom(target);
        return;
      }
    }
    setSelectedHotspot(hotspot);
  };

  const title = localize(currentRoom, 'name', currentRoom.name);
  const period = localize(currentRoom, 'period', currentRoom.period || currentRoom.category || 'Gian phòng di sản');

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Top Floating Control Bar */}
      <header
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        {/* Nút Quay về Trang Chủ */}
        <button
          type="button"
          onClick={onBackToHome}
          style={{
            pointerEvents: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 24,
            background: 'rgba(18, 21, 28, 0.85)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={16} />
          <span>{t('tour.backHome', 'Trang chủ')}</span>
        </button>

        {/* Thông tin phòng hiện tại */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(18, 21, 28, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '8px 20px',
            borderRadius: 24,
            textAlign: 'center',
            color: '#fff',
            maxWidth: '50vw'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-gold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentRoom.code ? `${currentRoom.code} • ` : ''}{period}
          </div>
        </div>

        {/* Bộ chọn chuyển phòng nhanh */}
        <div style={{ pointerEvents: 'auto' }}>
          <select
            value={currentRoom.id}
            onChange={(e) => {
              const r = allRooms.find((room) => room.id === e.target.value);
              if (r) onNavigateRoom(r);
            }}
            style={{
              padding: '9px 14px',
              borderRadius: 20,
              background: 'rgba(18, 21, 28, 0.85)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '12.5px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {allRooms.map((r) => (
              <option key={r.id} value={r.id} style={{ background: '#1a1f2c', color: '#fff' }}>
                {r.code ? `[${r.code}] ` : ''}{r.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Trình chiếu Three.js Panorama 360 */}
      <ThreePanoramaViewer
        room={currentRoom}
        allRooms={allRooms}
        onHotspotClick={handleHotspotClick}
      />

      {/* Modal Popup Chi tiết Hotspot khi khách click vào điểm chú thích */}
      {selectedHotspot && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            maxWidth: 480,
            width: 'calc(100% - 32px)',
            background: 'rgba(18, 21, 28, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--accent-gold)',
            borderRadius: 16,
            padding: '20px 24px',
            color: '#fff',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={18} style={{ color: 'var(--accent-gold)' }} />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                {selectedHotspot.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHotspot(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
            {selectedHotspot.description || t('tour.hotspotDefaultDesc', 'Điểm chú thích thông tin tư liệu khảo cứu của hiện vật trong gian trưng bày.')}
          </p>
        </div>
      )}
    </div>
  );
};
