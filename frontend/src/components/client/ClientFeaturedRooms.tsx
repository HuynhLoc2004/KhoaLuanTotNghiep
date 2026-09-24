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
  const featuredPeriod = localize(featuredRoom, 'period', (featuredRoom as any).period || 'Di tích & Cổ vật Lịch sử');
  const featuredHotspotCount = featuredRoom.hotspots ? featuredRoom.hotspots.length : 0;

  return (
    <section id="rooms" className="client-section client-rooms-section">
      <div className="client-container">
        {/* Tiêu đề Khối Trưng Bày */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('rooms.tag', 'Không Gian Trưng Bày Thực Tế Ảo')}
          </span>
          <h2 className="client-section-title">
            {t('rooms.headline', 'Hành Trình Khám Phá Qua Các Thời Kỳ Lịch Sử')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'rooms.sub',
              'Mỗi gian trưng bày là một chương sử sống động. Chiêm ngưỡng không gian toàn cảnh 360° sắc nét và tương tác trực quan với từng điểm neo cổ vật.'
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

              {/* Huy hiệu trạng thái 360 sẵn sàng góc trên */}
              <div className="client-room-status-badge">
                <span className="client-room-pulse-dot" />
                <span>Không gian 360° Sẵn sàng</span>
              </div>

              <div className="client-room-featured-overlay">
                <div className="client-room-featured-top-row">
                  <div className="client-room-featured-tag">
                    <Compass size={14} />
                    <span>{featuredRoom.code ? `[${featuredRoom.code}] ` : ''}Gian Trưng Bày Di Sản</span>
                  </div>
                  {featuredPeriod && (
                    <span className="client-room-period-tag">{featuredPeriod}</span>
                  )}
                </div>

                <h3 className="client-room-featured-title">{featuredTitle}</h3>

                <p className="client-room-featured-desc">
                  {featuredDesc || t('rooms.defaultDesc', 'Khám phá các tầng văn hóa và hiện vật khảo cổ đặc sắc qua lăng kính công nghệ số hóa toàn cảnh 360° độ phân giải cao.')}
                </p>

                <div className="client-room-featured-actions">
                  <button
                    type="button"
                    className="client-room-enter-btn"
                    onClick={() => onSelectRoom(featuredRoom)}
                  >
                    <Eye size={17} />
                    <span>{t('rooms.enterTour', 'Bắt Đầu Tham Quan Gian Phòng')}</span>
                    <ArrowRight size={16} />
                  </button>
                  <div className="client-room-hotspot-indicator">
                    <Layers size={15} />
                    <span>
                      {featuredHotspotCount} {t('rooms.hotspotsCount', 'điểm neo thuyết minh')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DANH SÁCH CHỌN PHÒNG BÊN PHẢI (RAIL SELECTOR) */}
          <div className="client-rooms-picker-list">
            <div className="client-rooms-picker-header">
              <span className="client-rooms-picker-title">
                {t('rooms.pickerTitle', 'Danh Mục Gian Phòng')}
              </span>
              <span className="client-rooms-picker-count">
                {rooms.length} {t('rooms.unit', 'không gian')}
              </span>
            </div>

            <div className="client-rooms-items-scroll">
              {rooms.slice(0, 6).map((room) => {
                const rPano = room.panoramaUrl || room.thumbnailUrl;
                const rThumb = rPano
                  ? rPano.startsWith('http')
                    ? rPano
                    : `${API_ROOT}${rPano.startsWith('/') ? '' : '/'}${rPano}`
                  : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=260&q=80';

                const rTitle = localize(room, 'name', room.name);
                const rPeriod = localize(room, 'period', (room as any).period || '');
                const isSelected = room.id === featuredRoom.id;
                const hsCount = room.hotspots?.length || 0;

                return (
                  <div
                    key={room.id}
                    className={`client-room-picker-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedRoomId(room.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="client-room-picker-thumb-wrap">
                      <img src={rThumb} alt={rTitle} className="client-room-picker-thumb" />
                      {isSelected && (
                        <div className="client-room-picker-active-dot" title="Đang xem" />
                      )}
                    </div>
                    <div className="client-room-picker-info">
                      <div className="client-room-picker-meta-row">
                        {room.code && <span className="client-room-picker-code">{room.code}</span>}
                        {rPeriod && <span className="client-room-picker-period">{rPeriod}</span>}
                      </div>
                      <span className="client-room-picker-name">{rTitle}</span>
                      <span className="client-room-picker-spots">
                        <Layers size={12} />
                        <span>{hsCount} điểm neo cổ vật</span>
                      </span>
                    </div>
                    <div className="client-room-picker-arrow">
                      <ArrowRight size={15} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút Xem Tất Cả Gian Phòng */}
            {onViewAllRooms && (
              <button
                type="button"
                className="client-rooms-view-all-btn"
                onClick={onViewAllRooms}
              >
                <span>{t('rooms.viewAll', `Xem Tất Cả ${rooms.length} Gian Phòng Trưng Bày`)}</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
