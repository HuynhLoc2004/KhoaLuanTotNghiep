import React from 'react';
import {
  Compass,
  ArrowRight,
  Eye,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react';
import { MuseumRoom } from '../../types';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedRoomsProps {
  rooms: MuseumRoom[];
  onSelectRoom: (room: MuseumRoom) => void;
}

export const ClientFeaturedRooms: React.FC<ClientFeaturedRoomsProps> = ({
  rooms,
  onSelectRoom
}) => {
  const { t, localize } = useClientTranslation();

  return (
    <section id="rooms" className="client-section">
      <div className="client-container">
        <div className="client-section-header">
          <span className="client-section-badge">
            <Compass size={13} />
            <span>{t('rooms.badge', 'Tham quan thực tế ảo')}</span>
          </span>
          <h2 className="client-section-title">
            {t('rooms.title', 'Các gian phòng trưng bày 360°')}
          </h2>
          <p className="client-section-desc">
            {t(
              'rooms.desc',
              'Bước vào hành trình trải nghiệm không gian triển lãm toàn cảnh. Quý khách có thể tự do xoay góc nhìn, tương tác với các hiện vật và di chuyển linh hoạt giữa các phòng.'
            )}
          </p>
        </div>

        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Compass size={36} style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: 12 }} />
            <p>{t('rooms.empty', 'Đang cập nhật danh sách các gian phòng 360°...')}</p>
          </div>
        ) : (
          <div className="client-rooms-grid">
            {rooms.map((room) => {
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
                    <img src={fullThumbUrl} alt={title} className="client-room-thumb" loading="lazy" />
                    <div className="client-room-badge-360">
                      <Compass size={12} />
                      <span>Tour 360°</span>
                    </div>
                    {room.code && (
                      <div className="client-room-badge-code">
                        {room.code}
                      </div>
                    )}
                  </div>

                  <div className="client-room-body">
                    <h3 className="client-room-title">{title}</h3>
                    <p className="client-room-desc">
                      {description || t('rooms.defaultDesc', 'Khám phá không gian văn hóa đặc sắc với các cổ vật tiêu biểu.')}
                    </p>

                    <div className="client-room-footer">
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={13} style={{ color: 'var(--accent-gold)' }} />
                        <span>{hotspotCount} {t('rooms.hotspotsCount', 'điểm tương tác')}</span>
                      </span>

                      <button
                        type="button"
                        className="client-room-btn-tour"
                        aria-label={`Tham quan gian phòng ${title}`}
                      >
                        <span>{t('rooms.btnEnter', 'Vào tham quan')}</span>
                        <ArrowRight size={14} />
                      </button>
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
