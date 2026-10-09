import React, { useState } from 'react';
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

  // Khởi tạo phòng được chọn: Ưu tiên phòng Admin cấu hình -> hoặc phòng đầu tiên trong danh sách
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

  const activeTitle = featuredRoom
    ? localize(featuredRoom, 'name', featuredRoom.name)
    : (customShowcase ? (branding.roomsTitle || 'Không gian trưng bày') : '');
  const activePeriod = featuredRoom ? localize(featuredRoom, 'period', (featuredRoom as any).period || '') : '';

  // 3 gian phòng tiêu biểu để hiển thị thẻ bên dưới
  const showcaseRooms = rooms.slice(0, 3);

  return (
    <section id="rooms" className="client-section">
      <div className="client-container">
        {/* TIÊU ĐỀ PHÂN KHU TRUNG TÂM */}
        <div className="client-section-header-centered reveal-on-scroll">
          <span className="client-section-eyebrow">
            {t(branding.roomsTag || 'rooms.tag', branding.roomsTag || 'Không Gian Triển Lãm')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.roomsTitle || 'rooms.headline', branding.roomsTitle || 'Hệ Thống Gian Phòng Tour 360°')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.roomsDesc || 'rooms.sub',
              branding.roomsDesc ||
                'Khám phá các gian trưng bày lịch sử qua ảnh toàn cảnh 360° sắc nét, tương tác đa chiều và lắng nghe thuyết minh di sản.'
            )}
          </p>
        </div>

        {/* SÂN KHẤU PANORAMA 360° TRUNG TÂM */}
        <div className="client-rooms-panoramic-stage reveal-on-scroll">
          <div className="client-rooms-panoramic-viewport">
            {fullFeaturedThumb ? (
              <>
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

                {/* Huy hiệu nhận diện 360° tinh tế không emoji */}
                <div className="client-rooms-stage-badge">
                  <Compass size={13} style={{ color: '#D4A86A' }} />
                  <span>{t('rooms.360InteractiveBadge', 'Toàn cảnh 360° • Kéo để xoay')}</span>
                </div>

                {/* Thanh điều khiển chân sân khấu */}
                <div className="client-rooms-stage-footer">
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                    <div className="client-rooms-stage-name">
                      {activeTitle || 'Gian phòng di sản tiêu biểu'}
                    </div>
                    {activePeriod && (
                      <div className="client-rooms-stage-period">
                        {activePeriod}
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
              </>
            ) : (
              <div className="client-media-placeholder">
                <span className="client-media-placeholder-title">
                  {t('rooms.noPanoTitle', 'Đang cập nhật gian phòng 360°')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3 THẺ GIAN PHÒNG TIÊU BIỂU PHÍA DƯỚI */}
        {showcaseRooms.length > 0 && (
          <div className="client-rooms-cards-grid reveal-on-scroll">
            {showcaseRooms.map((r) => {
              const thumb = r.thumbnailUrl || r.panoramaUrl || '';
              const thumbUrl = thumb
                ? (thumb.startsWith('http') ? thumb : `${API_ROOT}${thumb.startsWith('/') ? '' : '/'}${thumb}`)
                : '';
              const rName = localize(r, 'name', r.name);
              const rPeriod = localize(r, 'period', (r as any).period || 'Gian phòng trưng bày');

              return (
                <div
                  key={r.id}
                  className="client-room-card"
                  onClick={() => onSelectRoom(r)}
                  role="button"
                  tabIndex={0}
                  title={`Tham quan: ${rName}`}
                >
                  <div className="client-room-card-media">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={rName} loading="lazy" />
                    ) : (
                      <div style={{ color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        Gian phòng 360°
                      </div>
                    )}
                  </div>
                  <div className="client-room-card-info">
                    <h3 className="client-room-card-title">{rName}</h3>
                    <span className="client-room-card-period">{rPeriod}</span>
                    <span className="client-room-card-link">
                      {t('rooms.enterCardLink', 'Tham quan gian phòng →')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NÚT XEM TẤT CẢ GIAN PHÒNG */}
        <div className="client-section-center-action reveal-on-scroll">
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
