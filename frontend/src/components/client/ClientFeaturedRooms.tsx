import React, { useState } from 'react';
import { MuseumRoom } from '../../types';
import { Compass, ArrowRight, Layers } from 'lucide-react';
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
        <div className="client-zigzag-card horizontal-split align-left reveal-on-scroll">
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
              <span style={{ fontWeight: 700 }}>{featuredTitle}</span>
              {featuredPeriod && <span> • {featuredPeriod}</span>}
            </div>
          </div>

          {/* CỘT NỘI DUNG: ĐẠI DIỆN CHO TOÀN BỘ PHÂN HỆ GIAN PHÒNG 360 */}
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

            {/* CHIPS THỐNG KÊ THẬT CỦA PHÂN HỆ PHÒNG */}
            <div className="client-zigzag-meta-chips">
              <div className="client-zigzag-meta-chip">
                <Compass size={14} className="client-zigzag-chip-icon" />
                <span><strong>{rooms.length}</strong> {t('rooms.totalRooms', 'Gian phòng số hóa')}</span>
              </div>
              <div className="client-zigzag-meta-chip">
                <Layers size={14} className="client-zigzag-chip-icon" />
                <span>{t('rooms.interactiveHotspots', 'Thuyết minh đa điểm')}</span>
              </div>
            </div>

            {/* NÚT ĐIỀU HƯỚNG SANG PAGE GIAN PHÒNG */}
            <div className="client-zigzag-actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllRooms}
              >
                <span>{t('rooms.btnViewAll', 'Khám phá tất cả gian phòng 360°')}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
