import React, { useState } from 'react';
import { MuseumRoom } from '../../types';
import { ArrowRight } from 'lucide-react';
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

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const featuredRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  if (!featuredRoom) return null;

  const panoUrl = featuredRoom.panoramaUrl || featuredRoom.thumbnailUrl;
  const fullFeaturedThumb = panoUrl
    ? panoUrl.startsWith('http')
      ? panoUrl
      : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`
    : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';

  const featuredTitle = localize(featuredRoom, 'name', featuredRoom.name);
  const featuredPeriod = localize(featuredRoom, 'period', (featuredRoom as any).period || '');
  const hotspotCount = featuredRoom.hotspots ? featuredRoom.hotspots.length : 0;

  return (
    <section id="rooms" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG THẰNG 2: NẰM BÊN CÙNG BÊN TRÁI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-left reveal-on-scroll">
          {/* Khung media phòng 360 */}
          <div
            className="client-zigzag-card-media clickable"
            onClick={() => onSelectRoom(featuredRoom)}
            role="button"
            tabIndex={0}
            title="Bấm để vào xem Tour 360°"
          >
            <img
              src={fullFeaturedThumb}
              alt={featuredTitle}
              className="client-zigzag-card-img"
            />
            <div className="client-zigzag-badge-float">
              <span>Không gian 360° Sẵn sàng</span>
            </div>

            <div className="client-zigzag-media-caption">
              <span style={{ fontWeight: 700 }}>{featuredTitle}</span>
              {featuredPeriod && <span> • {featuredPeriod}</span>}
            </div>
          </div>

          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('rooms.tag', 'Không Gian Tour 360°')}
            </span>

            <h2 className="client-zigzag-title">
              {featuredTitle || t('rooms.headline', 'Gian Phòng Trưng Bày 360°')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'rooms.sub',
                'Tham quan từng gian trưng bày qua ảnh toàn cảnh 360° sắc nét, tương tác với các điểm thuyết minh cổ vật lịch sử.'
              )}
            </p>

            {/* Danh sách chọn phòng nhanh (Đồng bộ API Admin) */}
            <div className="client-zigzag-picker-chips">
              {rooms.slice(0, 4).map((room) => {
                const isSelected = room.id === featuredRoom.id;
                const title = localize(room, 'name', room.name);
                return (
                  <button
                    key={room.id}
                    type="button"
                    className={`client-zigzag-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>

            {/* Nút hành động */}
            <div className="client-zigzag-actions" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={() => onSelectRoom(featuredRoom)}
              >
                <span>Vào Khám Phá Gian Phòng</span>
                <ArrowRight size={15} />
              </button>

              {onViewAllRooms && rooms.length > 4 && (
                <button
                  type="button"
                  className="client-zigzag-btn-link"
                  onClick={onViewAllRooms}
                >
                  Tất cả {rooms.length} phòng →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
