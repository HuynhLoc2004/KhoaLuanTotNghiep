import React from 'react';
import { MuseumRoom } from '../../types';
import { Compass, ArrowRight } from 'lucide-react';
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

  const displayRooms = rooms.slice(0, 3);

  return (
    <section id="rooms" className="client-section">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('rooms.tag', 'Tham Quan Toàn Cảnh')}
          </span>
          <h2 className="client-section-title">
            {t('rooms.headline', 'Không Gian Trưng Bày 360°')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'rooms.sub',
              'Bước vào từng gian phòng lịch sử qua lăng kính thực tế ảo toàn cảnh, khám phá câu chuyện di sản bất tận.'
            )}
          </p>
        </div>

        {/* Danh sách thẻ phòng */}
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Compass size={40} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 12 }} />
            <p>{t('rooms.empty', 'Đang cập nhật danh sách các gian phòng trưng bày...')}</p>
          </div>
        ) : (
          <div className="client-rooms-grid">
            {displayRooms.map((room) => {
              const panoUrl = room.panoramaUrl || room.thumbnailUrl;
              const fullThumbUrl = panoUrl
                ? panoUrl.startsWith('http')
                  ? panoUrl
                  : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`
                : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';

              const title = localize(room, 'name', room.name);
              const description = localize(room, 'description', room.description || '');
              const hotspotCount = room.hotspots ? room.hotspots.length : 0;

              return (
                <div
                  key={room.id}
                  className="client-room-card"
                  onClick={() => onSelectRoom(room)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectRoom(room);
                  }}
                >
                  <div className="client-room-thumb-wrap">
                    <img
                      src={fullThumbUrl}
                      alt={title}
                      className="client-room-thumb"
                      loading="lazy"
                    />
                  </div>

                  <div className="client-room-body">
                    <h3 className="client-room-title">{title}</h3>
                    <p className="client-room-desc">
                      {description || t('rooms.defaultDesc', 'Khám phá không gian trưng bày hiện vật lịch sử văn hóa.')}
                    </p>

                    <div className="client-room-footer">
                      <span>{hotspotCount} {t('rooms.hotspotsCount', 'điểm tương tác')}</span>
                      <span className="client-room-cta">
                        <span>{t('rooms.enterTour', 'Vào tham quan')}</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
