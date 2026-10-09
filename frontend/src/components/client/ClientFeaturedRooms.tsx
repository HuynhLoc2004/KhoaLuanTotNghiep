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
    <section id="rooms" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 2: NỘI DUNG BÊN TRÁI - MEDIA 360° BÊN PHẢI */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA 360° */}
          <div
            className={`client-zigzag-card-media has-360-viewer ${!fullFeaturedThumb ? 'has-placeholder' : ''}`}
            style={{ minHeight: '460px', height: '100%', cursor: 'grab' }}
          >
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
                <div className="client-zigzag-badge-float">
                  <span>{t('rooms.360InteractiveBadge', 'Toàn cảnh 360° • Kéo để xoay')}</span>
                </div>

                {/* Thanh điều khiển nổi chân thẻ: Tên phòng & Nút bấm vào Tour */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    right: 14,
                    zIndex: 25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: 'rgba(10, 14, 22, 0.94)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(212, 168, 106, 0.3)',
                    borderRadius: 14,
                    padding: '10px 16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 6 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {featuredTitle || 'Gian phòng di sản tiêu biểu'}
                    </div>
                    {featuredPeriod && (
                      <div style={{ fontSize: '11px', color: '#D4A86A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                        {featuredPeriod}
                      </div>
                    )}
                  </div>

                  {featuredRoom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoom(featuredRoom);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'linear-gradient(135deg, #D4A86A 0%, #B48A3C 100%)',
                        color: '#0F1218',
                        border: 'none',
                        borderRadius: 24,
                        padding: '7px 16px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 3px 12px rgba(212, 168, 106, 0.35)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      title="Mở toàn màn hình và tham quan chi tiết gian phòng này"
                    >
                      <span>{t('rooms.enterTourBtn', 'Vào tham quan')}</span>
                      <Maximize2 size={12} />
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

          {/* CỘT NỘI DUNG: SANG TRỌNG, ĐỒNG BỘ, ĐẦY ĐỦ THÔNG TIN */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t(branding.roomsTag || 'rooms.tag', branding.roomsTag || 'Không Gian Thực Tế Ảo')}
            </span>

            <h2 className="client-zigzag-title">
              {t(branding.roomsTitle || 'rooms.headline', branding.roomsTitle || 'Hệ Thống Gian Phòng Tour 360°')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                branding.roomsDesc || 'rooms.sub',
                branding.roomsDesc ||
                  'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.'
              )}
            </p>

            {/* DÒNG THÔNG SỐ ĐỒNG BỘ THẬT */}
            <div className="client-zigzag-meta-line">
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

            {/* NÚT HÀNH ĐỘNG DUY NHẤT */}
            <div className="client-zigzag-actions">
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllRooms}
              >
                {t(branding.roomsCtaText || 'rooms.btnViewAll', branding.roomsCtaText || 'Khám phá tất cả gian phòng 360°')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
