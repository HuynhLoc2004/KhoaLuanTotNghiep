import React from 'react';
import { Compass, Maximize2 } from 'lucide-react';
import { MuseumRoom } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Pannellum360Viewer } from '../../viewer360/Pannellum360Viewer';

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

  const featuredRoom = (branding.roomsFeaturedId && rooms.find((r) =>
    r.id === branding.roomsFeaturedId ||
    (r as any)._id === branding.roomsFeaturedId ||
    (r as any).code === branding.roomsFeaturedId
  )) || rooms[0];

  const customShowcase = branding.roomsShowcaseImageUrl?.trim();
  const panoUrl = customShowcase || (featuredRoom ? (featuredRoom.panoramaUrl || featuredRoom.thumbnailUrl) : '');
  const fullFeaturedThumb = panoUrl
    ? (panoUrl.startsWith('http') ? panoUrl : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`)
    : '';

  const featuredTitle = featuredRoom
    ? localize(featuredRoom, 'name', featuredRoom.name)
    : (customShowcase ? (branding.roomsTitle || 'Không gian trưng bày') : '');
  const featuredPeriod = featuredRoom ? localize(featuredRoom, 'period', (featuredRoom as any).period || '') : '';

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

        {/* KHUNG SÂN KHẤU PANORAMA 360° RỘNG LỚN (FULL CONTAINER WIDTH) */}
        <div className="client-rooms-panoramic-stage reveal-on-scroll">
          <div className="client-rooms-panoramic-viewport">
            {fullFeaturedThumb ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Pannellum360Viewer
                  key={featuredRoom?.id || fullFeaturedThumb}
                  panoramaUrl={fullFeaturedThumb}
                  autoStartLittlePlanet={false}
                  autoRotateSpeed={-1.5}
                  hideControls={true}
                  initialHfov={100}
                  initialPitch={featuredRoom?.initialView?.pitch || 0}
                  initialYaw={featuredRoom?.initialView?.yaw || 0}
                />

                {/* Huy hiệu nhận diện 360° */}
                <div className="client-rooms-stage-badge">
                  <span>{t('rooms.360InteractiveBadge', 'Toàn cảnh 360° • Kéo để xoay không gian')}</span>
                </div>

                {/* Thanh điều khiển nổi chân sân khấu */}
                <div className="client-rooms-stage-footer">
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
                    <div className="client-rooms-stage-name">
                      {featuredTitle || 'Gian phòng di sản tiêu biểu'}
                    </div>
                    {featuredPeriod && (
                      <div className="client-rooms-stage-period">
                        {featuredPeriod}
                      </div>
                    )}
                  </div>

                  {featuredRoom && (
                    <button
                      type="button"
                      className="client-rooms-stage-btn"
                      onClick={() => onSelectRoom(featuredRoom)}
                      title="Mở toàn màn hình và tham quan chi tiết gian phòng này"
                    >
                      <span>{t('rooms.enterTourBtn', 'Vào tham quan toàn màn hình')}</span>
                      <Maximize2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="client-media-placeholder">
                <div className="client-media-placeholder-icon">
                  <Compass size={32} strokeWidth={1.5} />
                </div>
                <span className="client-media-placeholder-title">
                  {t('rooms.noPanoTitle', 'Chưa bổ sung gian phòng 360°')}
                </span>
                <span className="client-media-placeholder-desc">
                  {t('rooms.noPanoDesc', 'Dữ liệu gian phòng số hóa sẽ hiển thị ngay khi được Quản trị viên khởi tạo trong hệ thống.')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* THANH THỐNG KÊ & NÚT HÀNH ĐỘNG CÂN ĐỐI */}
        <div className="client-rooms-stage-bottom-bar reveal-on-scroll">
          <div className="client-zigzag-meta-line" style={{ margin: 0 }}>
            <span className="client-zigzag-meta-item">
              {rooms.length > 0 ? (
                <>
                  <strong>{rooms.length}</strong> {t('rooms.totalRooms', 'Gian phòng số hóa')}
                </>
              ) : (
                <span>{t('rooms.updating', 'Đang cập nhật không gian')}</span>
              )}
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

          <button
            type="button"
            className="client-intro-btn"
            onClick={onViewAllRooms}
          >
            {t(branding.roomsCtaText || 'rooms.btnViewAll', branding.roomsCtaText || `Khám phá toàn bộ gian phòng 360° (${rooms.length})`)}
          </button>
        </div>
      </div>
    </section>
  );
};
