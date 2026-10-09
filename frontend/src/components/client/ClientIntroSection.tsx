import React from 'react';
import { Landmark } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientIntroSectionProps {
  roomCount?: number;
  artifactCount?: number;
  topicCount?: number;
  onExploreRooms?: () => void;
}

export const ClientIntroSection: React.FC<ClientIntroSectionProps> = ({
  roomCount = 0,
  artifactCount = 0,
  onExploreRooms
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-section client-section-alt">
      <div className="client-container">
        <div className="client-intro-feature-card reveal-on-scroll">
          {/* CỘT ẢNH: KIẾN TRÚC BẢO TÀNG TINH TẾ */}
          <div className={`client-intro-media ${!branding.introImageUrl ? 'has-placeholder' : ''}`}>
            {branding.introImageUrl ? (
              <img
                src={branding.introImageUrl}
                alt={branding.introTitle || branding.museumName || 'Kiến trúc Bảo tàng Lịch sử'}
                className="client-intro-img"
                loading="lazy"
              />
            ) : (
              <div className="client-media-placeholder">
                <div className="client-media-placeholder-icon">
                  <Landmark size={32} strokeWidth={1.5} />
                </div>
                <span className="client-media-placeholder-title">
                  {t('intro.noImageTitle', 'Chưa bổ sung hình ảnh không gian')}
                </span>
                <span className="client-media-placeholder-desc">
                  {t('intro.noImageDesc', 'Hình ảnh kiến trúc & khuôn viên sẽ hiển thị khi quản trị viên cập nhật tại mục 4 Quản lý Trang chủ.')}
                </span>
              </div>
            )}
            <div className="client-intro-badge">
              <span>{t(branding.introBadgeText || 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia', branding.introBadgeText || 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia')}</span>
            </div>
          </div>

          {/* CỘT NỘI DUNG: TRANG NHÃ, NGẮN GỌN, CHUẨN MỰC BẢO TÀNG */}
          <div className="client-intro-body">
            <span className="client-section-eyebrow">
              {t(branding.introTag || 'intro.tag', branding.introTag || 'Kiến Trúc & Không Gian')}
            </span>

            <h2 className="client-intro-title">
              {t(branding.introTitle || branding.museumName || 'intro.title', branding.introTitle || branding.museumName || 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh')}
            </h2>

            <p className="client-intro-desc">
              {t(
                branding.introDesc || branding.tagline || 'intro.desc',
                branding.introDesc ||
                  branding.tagline ||
                  'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.'
              )}
            </p>

            {/* BẢNG ĐỒNG THÔNG SỐ BẢO TÀNG LỊCH SỬ CHUẨN MỰC */}
            <div className="client-intro-plaque-grid">
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">1929</span>
                <span className="client-intro-plaque-label">{t('intro.statYear', 'Khởi lập công trình')}</span>
              </div>
              <div className="client-intro-plaque-sep" />
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">
                  {artifactCount > 0 ? `${artifactCount}+` : '30.000+'}
                </span>
                <span className="client-intro-plaque-label">{t('intro.statArtifacts', 'Hiện vật di sản')}</span>
              </div>
              <div className="client-intro-plaque-sep" />
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">
                  {roomCount > 0 ? roomCount : '12+'}
                </span>
                <span className="client-intro-plaque-label">{t('intro.statRooms', 'Gian phòng số hóa')}</span>
              </div>
            </div>

            {/* NÚT HÀNH ĐỘNG SANG TRỌNG */}
            {onExploreRooms && (
              <div>
                <button
                  type="button"
                  className="client-intro-btn"
                  onClick={onExploreRooms}
                >
                  {t(branding.introCtaText || 'intro.btnExplore', branding.introCtaText || 'Khám phá gian trưng bày')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
