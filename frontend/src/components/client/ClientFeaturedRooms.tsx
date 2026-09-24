import React, { useState } from 'react';
import { MuseumRoom } from '../../types';
import { Compass, ArrowRight, Eye, Layers } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedRoomsProps {
  rooms: MuseumRoom[];
  onSelectRoom: (room: MuseumRoom) => void;
  onViewAllRooms?: () => void;
}

export const ClientFeaturedRooms: React.FC<ClientFeaturedRoomsProps> = ({
  rooms,
  onSelectRoom,
  onViewAllRooms
}) => {
  const { t, localize } = useClientTranslation();

  // Quản lý gian phòng đang được chọn hiển thị lớn ở khung bên trái
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');

  const featuredRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  if (!featuredRoom) {
    return (
      <section id="rooms" className="client-section">
        <div className="client-container" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
          <Compass size={44} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 14 }} />
          <p>{t('rooms.empty', 'Đang cập nhật danh sách các gian phòng trưng bày...')}</p>
        </div>
      </section>
    );
  }

  const panoUrl = featuredRoom.panoramaUrl || featuredRoom.thumbnailUrl;
  const fullFeaturedThumb = panoUrl
    ? panoUrl.startsWith('http')
      ? panoUrl
      : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`
    : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';

  const featuredTitle = localize(featuredRoom, 'name', featuredRoom.name);
  const featuredDesc = localize(featuredRoom, 'description', featuredRoom.description || '');
  const featuredHotspotCount = featuredRoom.hotspots ? featuredRoom.hotspots.length : 0;

  return (
    <section id="rooms" className="client-section">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('rooms.tag', 'Không Gian Thực Tế Ảo')}
          </span>
          <h2 className="client-section-title">
            {t('rooms.headline', 'Khám Phá Các Gian Phòng 360°')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'rooms.sub',
              'Chọn gian phòng bạn muốn chiêm ngưỡng để trải nghiệm không gian toàn cảnh độ phân giải cao và các điểm neo thuyết minh tương tác.'
            )}
          </p>
        </div>

        {/* BỐ CỤC TRIỂN LÃM TƯƠNG TÁC (MASTER-DETAIL SHOWCASE) */}
        <div className="client-rooms-showcase">
          {/* KHUNG PHÒNG TIÊU BIỂU LỚN BÊN TRÁI */}
          <div className="client-room-featured-view">
            <div className="client-room-featured-img-wrap">
              <img
                src={fullFeaturedThumb}
                alt={featuredTitle}
                className="client-room-featured-img"
              />
              <div className="client-room-featured-overlay">
                <div className="client-room-featured-tag">
                  <Compass size={14} />
                  <span>{featuredRoom.code ? `[${featuredRoom.code}] ` : ''}Gian Phòng Trưng Bày</span>
                </div>

                <h3 className="client-room-featured-title">{featuredTitle}</h3>

                <p className="client-room-featured-desc">
                  {featuredDesc || t('rooms.defaultDesc', 'Khám phá không gian trưng bày hiện vật lịch sử văn hóa.')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button
                    type="button"
                    className="client-room-enter-btn"
                    onClick={() => onSelectRoom(featuredRoom)}
                  >
                    <Eye size={16} />
                    <span>{t('rooms.enterTour', 'Vào Tham Quan Phòng Này')}</span>
                    <ArrowRight size={15} />
                  </button>
                  <span style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                    {featuredHotspotCount} {t('rooms.hotspotsCount', 'điểm tương tác')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DANH SÁCH CHỌN PHÒNG BÊN PHẢI */}
          <div className="client-rooms-picker-list">
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--c-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Danh sách gian phòng ({rooms.length})
            </div>

            {rooms.slice(0, 5).map((room) => {
              const rPano = room.panoramaUrl || room.thumbnailUrl;
              const rThumb = rPano
                ? rPano.startsWith('http')
                  ? rPano
                  : `${API_ROOT}${rPano.startsWith('/') ? '' : '/'}${rPano}`
                : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=200&q=80';

              const rTitle = localize(room, 'name', room.name);
              const isSelected = room.id === featuredRoom.id;

              return (
                <div
                  key={room.id}
                  className={`client-room-picker-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedRoomId(room.id)}
                  role="button"
                  tabIndex={0}
                >
                  <img src={rThumb} alt={rTitle} className="client-room-picker-thumb" />
                  <div className="client-room-picker-info">
                    {room.code && <span className="client-room-picker-code">{room.code}</span>}
                    <span className="client-room-picker-name">{rTitle}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                      {room.hotspots?.length || 0} điểm chú thích
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
