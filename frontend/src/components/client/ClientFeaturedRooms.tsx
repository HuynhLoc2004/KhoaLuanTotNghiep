import React, { useState } from 'react';
import { Compass, Maximize2, RotateCw } from 'lucide-react';
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

  // Ưu tiên: phòng được Admin chỉ định trong branding -> hoặc phòng đầu tiên có trong CSDL thực tế
  const featuredRoom = (branding.roomsFeaturedId && rooms.find((r) => r.id === branding.roomsFeaturedId)) || rooms[0];

  // Ưu tiên ảnh:
  // 1. Ảnh tùy chỉnh do Admin cấu hình trong CMS (branding.roomsShowcaseImageUrl)
  // 2. Ảnh toàn cảnh 360 / Thumbnail của gian phòng thực tế trong CSDL
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
        {/* ZIG-ZAG 2: NẰM BÊN TRÁI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA: KHÔNG GIAN 360° TƯƠNG TÁC THỰC TẾ (THAY THẾ ẢNH TĨNH CŨ) */}
          <div
            className={`client-zigzag-card-media has-360-viewer ${!fullFeaturedThumb ? 'has-placeholder' : ''}`}
            style={{ minHeight: '380px', height: 'clamp(340px, 35vw, 420px)', cursor: 'grab' }}
          >
            {fullFeaturedThumb ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Trình chiếu 360° Panorama sống động với WebGL */}
                <Pannellum360Viewer
                  key={featuredRoom?.id || fullFeaturedThumb}
                  panoramaUrl={fullFeaturedThumb}
                  autoStartLittlePlanet={false}
                  autoRotateSpeed={-1.8}
                  hideControls={true}
                  initialHfov={100}
                  initialPitch={featuredRoom?.initialView?.pitch || 0}
                  initialYaw={featuredRoom?.initialView?.yaw || 0}
                />

                {/* Huy hiệu nổi: Nhận diện không gian 360° thực tế */}
                <div
                  className="client-zigzag-badge-float"
                  style={{
                    top: 14,
                    left: 14,
                    zIndex: 20,
                    pointerEvents: 'none',
                    background: 'rgba(12, 16, 24, 0.88)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(212, 168, 106, 0.35)',
                    color: '#FDE68A',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: '11.5px',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Compass size={13} style={{ color: '#D4A86A', animation: 'spin 12s linear infinite' }} />
                  <span>{t('rooms.360InteractiveBadge', 'Không gian 360° thực tế • Kéo để xoay')}</span>
                </div>

                {/* Thanh điều khiển nổi chân thẻ: Tên phòng & Nút bấm vào Tour trực tiếp */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    right: 12,
                    zIndex: 25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    background: 'rgba(10, 14, 22, 0.92)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(212, 168, 106, 0.3)',
                    borderRadius: 14,
                    padding: '8px 14px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 6 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {featuredTitle || 'Gian phòng di sản'}
                    </div>
                    {featuredPeriod && (
                      <div style={{ fontSize: '11px', color: '#D4A86A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
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
                        padding: '6px 14px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 3px 12px rgba(212, 168, 106, 0.35)',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 5px 16px rgba(212, 168, 106, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 3px 12px rgba(212, 168, 106, 0.35)';
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

          {/* CỘT NỘI DUNG: ĐẠI DIỆN CHO PHÂN HỆ GIAN PHÒNG 360 */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {branding.roomsTag || t('rooms.tag', 'Không Gian Thực Tế Ảo')}
            </span>

            <h2 className="client-zigzag-title">
              {branding.roomsTitle || t('rooms.headline', 'Hệ Thống Gian Phòng Tour 360°')}
            </h2>

            <p className="client-zigzag-desc">
              {branding.roomsDesc ||
                t(
                  'rooms.sub',
                  'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.'
                )}
            </p>

            {/* DÒNG THÔNG SỐ TINH TẾ */}
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

            {/* NÚT HÀNH ĐỘNG */}
            <div className="client-zigzag-actions">
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllRooms}
              >
                {branding.roomsCtaText || t('rooms.btnViewAll', 'Khám phá tất cả gian phòng 360°')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
