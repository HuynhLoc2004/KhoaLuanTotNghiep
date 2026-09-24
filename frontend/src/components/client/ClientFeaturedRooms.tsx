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

  // Quản lý gian phòng đang được chọn xem trước
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');

  const featuredRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  if (!featuredRoom) {
    return null;
  }

  const panoUrl = featuredRoom.panoramaUrl || featuredRoom.thumbnailUrl;
  const fullFeaturedThumb = panoUrl
    ? panoUrl.startsWith('http')
      ? panoUrl
      : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`
    : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';

  const featuredTitle = localize(featuredRoom, 'name', featuredRoom.name);
  const featuredDesc = localize(featuredRoom, 'description', featuredRoom.description || '');
  const featuredPeriod = localize(featuredRoom, 'period', (featuredRoom as any).period || '');
  const hotspotCount = featuredRoom.hotspots ? featuredRoom.hotspots.length : 0;

  return (
    <section id="rooms" className="client-section client-zigzag-section reveal-on-scroll">
      <div className="client-container">
        {/* ZIG-ZAG: CỘT TRÁI (CHỮ & CHỌN PHÒNG), CỘT PHẢI (KHUNG XEM ẢNH/360) */}
        <div className="client-zigzag-grid reverse">
          {/* CỘT NỘI DUNG (BÊN TRÁI KHI REVERSE) */}
          <div className="client-zigzag-content">
            <span className="client-zigzag-tag">
              {t('rooms.tag', 'Không Gian Số Hóa')}
            </span>

            <h2 className="client-zigzag-title">
              {t('rooms.headline', 'Tham Quan Gian Phòng Tour 360°')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'rooms.sub',
                'Trải nghiệm không gian bảo tàng qua công nghệ toàn cảnh 360° độ nét cao, tương tác trực tiếp với các điểm thuyết minh cổ vật.'
              )}
            </p>

            {/* Danh sách chọn gian phòng nhanh (Đồng bộ trực tiếp từ API của Admin) */}
            <div className="client-zigzag-room-selector">
              <span className="client-zigzag-selector-label">
                Chọn gian trưng bày ({rooms.length})
              </span>

              <div className="client-zigzag-room-list">
                {rooms.slice(0, 5).map((room) => {
                  const isSelected = room.id === featuredRoom.id;
                  const title = localize(room, 'name', room.name);
                  const period = localize(room, 'period', (room as any).period || '');

                  return (
                    <div
                      key={room.id}
                      className={`client-zigzag-room-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedRoomId(room.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="client-zigzag-room-info">
                        <div className="client-zigzag-room-name">{title}</div>
                        {period && <div className="client-zigzag-room-period">{period}</div>}
                      </div>
                      {isSelected && <span className="client-zigzag-dot" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nút vào xem Tour 360 */}
            <div className="client-zigzag-actions">
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={() => onSelectRoom(featuredRoom)}
              >
                <span>Vào Khám Phá Tour 360°</span>
                <ArrowRight size={15} />
              </button>

              {onViewAllRooms && rooms.length > 5 && (
                <button
                  type="button"
                  className="client-zigzag-btn-link"
                  onClick={onViewAllRooms}
                >
                  Xem toàn bộ {rooms.length} phòng →
                </button>
              )}
            </div>
          </div>

          {/* CỘT MEDIA KHUNG XEM 360 TO LỚN (BÊN PHẢI KHI REVERSE) */}
          <div className="client-zigzag-media">
            <div
              className="client-zigzag-stage"
              onClick={() => onSelectRoom(featuredRoom)}
              role="button"
              tabIndex={0}
              title="Bấm để vào xem Tour 360°"
            >
              <img
                src={fullFeaturedThumb}
                alt={featuredTitle}
                className="client-zigzag-stage-img"
              />

              <div className="client-zigzag-stage-overlay">
                <div className="client-zigzag-stage-badge">
                  <span>360° Toàn cảnh</span>
                </div>

                <div className="client-zigzag-stage-bottom">
                  <h3 className="client-zigzag-stage-title">{featuredTitle}</h3>
                  <div className="client-zigzag-stage-meta">
                    {featuredPeriod && <span>{featuredPeriod}</span>}
                    {featuredPeriod && hotspotCount > 0 && <span>•</span>}
                    {hotspotCount > 0 && <span>{hotspotCount} điểm thuyết minh</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
