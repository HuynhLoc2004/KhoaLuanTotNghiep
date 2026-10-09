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

  // Khởi tạo phòng được chọn: Ưu tiên phòng Admin cấu hình -> hoặc phòng đầu tiên trong danh sách
  const initialRoom = (branding.roomsFeaturedId && rooms.find((r) =>
    r.id === branding.roomsFeaturedId ||
    (r as any)._id === branding.roomsFeaturedId ||
    (r as any).code === branding.roomsFeaturedId
  )) || rooms[0];

  const [activeRoomId, setActiveRoomId] = useState<string>(initialRoom?.id || '');

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || initialRoom || rooms[0];

  // Ưu tiên ảnh:
  // 1. Nếu phòng đang chọn có panoramaUrl -> dùng luôn
  // 2. Nếu là phòng featured và admin có ảnh custom -> dùng custom
  const customShowcase = branding.roomsShowcaseImageUrl?.trim();
  const panoUrl = (activeRoom ? (activeRoom.panoramaUrl || activeRoom.thumbnailUrl) : '') || customShowcase || '';
  const fullFeaturedThumb = panoUrl
    ? (panoUrl.startsWith('http') ? panoUrl : `${API_ROOT}${panoUrl.startsWith('/') ? '' : '/'}${panoUrl}`)
    : '';

  const activeTitle = activeRoom
    ? localize(activeRoom, 'name', activeRoom.name)
    : (customShowcase ? (branding.roomsTitle || 'Không gian trưng bày') : '');
  const activePeriod = activeRoom ? localize(activeRoom, 'period', (activeRoom as any).period || '') : '';

  // Danh sách phòng rút gọn để làm Room Strip (lấy 4 phòng tiêu biểu)
  const stripRooms = rooms.slice(0, 4);

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
                'Khám phá các gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển tương tác trực quan và nghe thuyết minh lịch sử.'
            )}
          </p>
        </div>

        {/* SÂN KHẤU PANORAMA RỘNG + DẢI CHỌN PHÒNG */}
        <div className="client-rooms-panoramic-stage reveal-on-scroll">
          {/* VÙNG XEM 360 ĐIỆN ẢNH */}
          <div className="client-rooms-panoramic-viewport">
            {fullFeaturedThumb ? (
              <>
                <Pannellum360Viewer
                  key={activeRoom?.id || fullFeaturedThumb}
                  panoramaUrl={fullFeaturedThumb}
                  autoStartLittlePlanet={false}
                  autoRotateSpeed={-1.5}
                  hideControls={true}
                  initialHfov={100}
                  initialPitch={activeRoom?.initialView?.pitch || 0}
                  initialYaw={activeRoom?.initialView?.yaw || 0}
                />

                {/* Huy hiệu nhận diện 360° không emoji */}
                <div className="client-rooms-stage-badge">
                  <Compass size={13} style={{ color: '#D4A86A' }} />
                  <span>{t('rooms.360InteractiveBadge', 'Không gian 360° tương tác • Kéo để xoay')}</span>
                </div>

                {/* Thanh điều khiển nổi chân sân khấu */}
                <div className="client-rooms-stage-footer">
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                    <div className="client-rooms-stage-name">
                      {activeTitle || 'Gian phòng di sản'}
                    </div>
                    {activePeriod && (
                      <div className="client-rooms-stage-period">
                        {activePeriod}
                      </div>
                    )}
                  </div>

                  {activeRoom && (
                    <button
                      type="button"
                      className="client-rooms-stage-btn"
                      onClick={() => onSelectRoom(activeRoom)}
                      title="Mở toàn màn hình và tham quan chi tiết gian phòng này"
                    >
                      <span>{t('rooms.enterTourBtn', 'Vào tham quan')}</span>
                      <Maximize2 size={12} />
                    </button>
                  )}
                </div>
              </>
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

          {/* DẢI CHỌN PHÒNG TIÊU BIỂU (ROOM SELECTOR STRIP) */}
          {stripRooms.length > 0 && (
            <div className="client-rooms-strip-container">
              <div className="client-rooms-strip-header">
                <span className="client-rooms-strip-title">
                  {t('rooms.featuredRoomsStrip', 'Gian phòng tiêu biểu')} ({rooms.length})
                </span>
                <button
                  type="button"
                  className="client-rooms-strip-all-btn"
                  onClick={onViewAllRooms}
                >
                  <span>{t('rooms.viewAllRoomsLink', 'Xem toàn bộ gian phòng')}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="client-rooms-strip-grid">
                {stripRooms.map((r) => {
                  const isSelected = r.id === activeRoom?.id;
                  const thumb = r.thumbnailUrl || r.panoramaUrl || '';
                  const thumbUrl = thumb
                    ? (thumb.startsWith('http') ? thumb : `${API_ROOT}${thumb.startsWith('/') ? '' : '/'}${thumb}`)
                    : '';
                  const rName = localize(r, 'name', r.name);
                  const rPeriod = localize(r, 'period', (r as any).period || '');

                  return (
                    <div
                      key={r.id}
                      className={`client-rooms-chip-card ${isSelected ? 'is-active' : ''}`}
                      onClick={() => {
                        setActiveRoomId(r.id);
                      }}
                      role="button"
                      tabIndex={0}
                      title={`Bấm để chuyển sang: ${rName}`}
                    >
                      <div className="client-rooms-chip-thumb">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={rName} loading="lazy" />
                        ) : (
                          <div className="client-rooms-chip-placeholder">
                            <Compass size={18} />
                          </div>
                        )}
                        {isSelected && <span className="client-rooms-chip-active-dot" />}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="client-rooms-stage-name" style={{ fontSize: '0.84rem' }}>
                          {rName}
                        </div>
                        <div className="client-rooms-stage-period" style={{ fontSize: '0.72rem' }}>
                          {rPeriod || t('rooms.digitizedTag', 'Không gian 360°')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
