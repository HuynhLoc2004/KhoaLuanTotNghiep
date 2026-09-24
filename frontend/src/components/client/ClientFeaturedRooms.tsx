import React, { useState } from 'react';
import { Compass } from 'lucide-react';
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
          {/* CỘT MEDIA: ẢNH TOÀN CẢNH GIAN PHÒNG THỰC TẾ */}
          <div
            className="client-zigzag-card-media clickable"
            onClick={onViewAllRooms}
            role="button"
            tabIndex={0}
            title={t('rooms.clickToEnter', 'Bấm để xem tất cả gian phòng 360°')}
          >
            {fullFeaturedThumb ? (
              <img
                src={fullFeaturedThumb}
                alt={featuredTitle || 'Gian phòng 360°'}
                className="client-zigzag-card-img"
                loading="lazy"
              />
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
            <div className="client-zigzag-badge-float">
              <span>{rooms.length > 0 ? `${rooms.length} Không gian 360°` : 'Đang cập nhật'}</span>
            </div>

            {featuredTitle && fullFeaturedThumb && (
              <div className="client-zigzag-media-caption">
                <span style={{ fontWeight: 600 }}>{featuredTitle}</span>
                {featuredPeriod && <span> • {featuredPeriod}</span>}
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
