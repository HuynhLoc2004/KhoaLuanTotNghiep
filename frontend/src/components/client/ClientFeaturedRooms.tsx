import React from 'react';
import { Compass, ArrowRight, Eye } from 'lucide-react';
import { MuseumRoom } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
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
  const { branding } = useSystemBranding();
  const { t, localize } = useClientTranslation();

  // Danh sách tối đa 4 gian phòng để trưng bày dạng Teaser
  const showcaseRooms = React.useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    if (branding.roomsFeaturedId) {
      const featured = rooms.find(
        (r) =>
          r.id === branding.roomsFeaturedId ||
          (r as any)._id === branding.roomsFeaturedId ||
          (r as any).code === branding.roomsFeaturedId
      );
      if (featured) {
        const others = rooms.filter((r) => r.id !== featured.id);
        return [featured, ...others].slice(0, 4);
      }
    }
    return rooms.slice(0, 4);
  }, [rooms, branding.roomsFeaturedId]);

  const featuredSingle = showcaseRooms[0];
  const isSingleRoom = showcaseRooms.length === 1;

  const getRoomThumb = (room?: MuseumRoom) => {
    if (!room) return '';
    const raw = room.thumbnailUrl || room.panoramaUrl || '';
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  return (
    <section id="rooms" className="client-section">
      <div className="client-container">
        {/* TIÊU ĐỀ PHÂN KHU TRUNG TÂM */}
        <div className="client-section-header-centered reveal-on-scroll">
          <span className="client-section-eyebrow">
            {t(branding.roomsTag || 'rooms.tag', branding.roomsTag || 'Không Gian Thực Tế Ảo')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.roomsTitle || 'rooms.headline', branding.roomsTitle || 'Hệ Thống Gian Phòng Tour 360°')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.roomsDesc || 'rooms.sub',
              branding.roomsDesc ||
                'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.'
            )}
          </p>
        </div>

        {/* NẾU CHỈ CÓ 1 PHÒNG: HIỂN THỊ PANORAMIC FEATURED HERO CARD CÂN ĐỐI */}
        {isSingleRoom && featuredSingle ? (
          <div
            className="client-room-featured-teaser reveal-on-scroll"
            onClick={() => onSelectRoom(featuredSingle)}
            role="button"
            tabIndex={0}
            title={t('rooms.clickToEnter', 'Bấm để bắt đầu chuyến tham quan 360°')}
          >
            <div className="client-room-teaser-media">
              {getRoomThumb(featuredSingle) ? (
                <img
                  src={getRoomThumb(featuredSingle)}
                  alt={localize(featuredSingle, 'name', featuredSingle.name)}
                  className="client-room-teaser-img"
                  loading="lazy"
                />
              ) : (
                <div className="client-media-placeholder">
                  <Compass size={36} strokeWidth={1.5} />
                </div>
              )}
              <div className="client-room-teaser-badge">
                <span className="client-guide-pulse-dot" />
                <span>{t('rooms.badge360', 'Toàn cảnh 360° • Sẵn sàng tham quan')}</span>
              </div>
            </div>

            <div className="client-room-teaser-content">
              <span className="client-section-eyebrow" style={{ marginBottom: 6 }}>
                {localize(featuredSingle, 'period', (featuredSingle as any).period || 'Gian trưng bày lịch sử')}
              </span>
              <h3 className="client-room-teaser-title">
                {localize(featuredSingle, 'name', featuredSingle.name)}
              </h3>
              <p className="client-room-teaser-desc">
                {localize(
                  featuredSingle,
                  'description',
                  featuredSingle.description ||
                    'Gian trưng bày tiêu biểu được số hóa toàn cảnh 360°, cho phép quan sát chi tiết cổ vật và kiến trúc từ mọi góc nhìn.'
                )}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button
                  type="button"
                  className="client-intro-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRoom(featuredSingle);
                  }}
                >
                  <span>{t('rooms.enterTourBtn', 'Bắt đầu chuyến tham quan 360°')}</span>
                  <ArrowRight size={14} style={{ marginLeft: 6, display: 'inline' }} />
                </button>
              </div>
            </div>
          </div>
        ) : showcaseRooms.length > 1 ? (
          /* NẾU CÓ NHIỀU PHÒNG: HIỂN THỊ LƯỚI GALLERY CARD TRANG TRỌNG */
          <div className="client-rooms-gallery-grid reveal-on-scroll">
            {showcaseRooms.map((room) => {
              const thumbUrl = getRoomThumb(room);
              const roomName = localize(room, 'name', room.name);
              const roomPeriod = localize(room, 'period', (room as any).period || 'Gian trưng bày');

              return (
                <div
                  key={room.id}
                  className="client-room-gallery-card"
                  onClick={() => onSelectRoom(room)}
                  role="button"
                  tabIndex={0}
                  title={`Bắt đầu tham quan: ${roomName}`}
                >
                  <div className="client-room-gallery-media">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={roomName} loading="lazy" />
                    ) : (
                      <div className="client-media-placeholder">
                        <Compass size={28} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="client-room-gallery-badge">
                      <span>360° Tour</span>
                    </div>
                  </div>

                  <div className="client-room-gallery-body">
                    <span className="client-room-gallery-period">{roomPeriod}</span>
                    <h3 className="client-room-gallery-title">{roomName}</h3>
                    <div className="client-room-gallery-action">
                      <span>{t('rooms.enterRoomLink', 'Vào tham quan 360°')}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="client-media-placeholder" style={{ minHeight: 240, margin: '20px 0' }}>
            <Compass size={36} strokeWidth={1.5} />
            <span className="client-media-placeholder-title">
              {t('rooms.noPanoTitle', 'Đang cập nhật các gian phòng 360°')}
            </span>
          </div>
        )}

        {/* NÚT XEM TẤT CẢ GIAN PHÒNG */}
        {rooms.length > 0 && (
          <div className="client-section-center-action reveal-on-scroll" style={{ marginTop: 28 }}>
            <button
              type="button"
              className="client-intro-btn"
              onClick={onViewAllRooms}
            >
              {t(
                branding.roomsCtaText || 'rooms.btnViewAll',
                branding.roomsCtaText || `Khám phá toàn bộ gian phòng 360° (${rooms.length})`
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
