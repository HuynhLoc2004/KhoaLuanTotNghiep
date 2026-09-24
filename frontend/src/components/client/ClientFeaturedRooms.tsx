import React, { useState } from 'react';
import { MuseumRoom } from '../../types';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedRoomsProps {
  rooms: MuseumRoom[];
  onSelectRoom: (room: MuseumRoom) => void;
  onViewAllRooms: () => void;
}

export const ClientFeaturedRooms: React.FC<ClientFeaturedRoomsProps> = ({
  rooms,
  onSelectRoom,
  onViewAllRooms
}) => {
  const { t, localize } = useClientTranslation();

  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const featuredRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const panoUrl = featuredRoom ? (featuredRoom.panoramaUrl || featuredRoom.thumbnailUrl) : '';
  const fullFeaturedThumb = panoUrl
    ? panoUrl.startsWith('http')
      ? panoUrl
      : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`
    : 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';

  const featuredTitle = featuredRoom ? localize(featuredRoom, 'name', featuredRoom.name) : 'Gian phòng di sản';
  const featuredPeriod = featuredRoom ? localize(featuredRoom, 'period', (featuredRoom as any).period || '') : '';

  return (
    <section id="rooms" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 2: NẰM BÊN TRÁI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA: ẢNH TOÀN CẢNH GIAN PHÒNG */}
          <div
            className="client-zigzag-card-media clickable"
            onClick={onViewAllRooms}
            role="button"
            tabIndex={0}
            title={t('rooms.clickToEnter', 'Bấm để xem tất cả gian phòng 360°')}
          >
            <img
              src={fullFeaturedThumb}
              alt={featuredTitle}
              className="client-zigzag-card-img"
              loading="lazy"
            />
            <div className="client-zigzag-badge-float">
              <span>{rooms.length} Không gian 360° Sẵn sàng</span>
            </div>

            <div className="client-zigzag-media-caption">
              <span style={{ fontWeight: 600 }}>{featuredTitle}</span>
              {featuredPeriod && <span> • {featuredPeriod}</span>}
            </div>
          </div>

          {/* CỘT NỘI DUNG: ĐẠI DIỆN CHO PHÂN HỆ GIAN PHÒNG 360 */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('rooms.tag', 'Không Gian Thực Tế Ảo')}
            </span>

            <h2 className="client-zigzag-title">
              {t('rooms.headline', 'Hệ Thống Gian Phòng Tour 360°')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'rooms.sub',
                'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.'
              )}
            </p>

            {/* DÒNG THÔNG SỐ TINH TẾ */}
            <div className="client-zigzag-meta-line">
              <span className="client-zigzag-meta-item">
                <strong>{rooms.length}</strong> {t('rooms.totalRooms', 'Gian phòng số hóa')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('rooms.interactiveHotspots', 'Thuyết minh đa điểm')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('rooms.seamlessNav', 'Chuyển phòng mượt mà')}
              </span>
            </div>

            {/* NÚT HÀNH ĐỘNG */}
            <div className="client-zigzag-actions">
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllRooms}
              >
                {t('rooms.btnViewAll', 'Khám phá tất cả gian phòng 360°')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
