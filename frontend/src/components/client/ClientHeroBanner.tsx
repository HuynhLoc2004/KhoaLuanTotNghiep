import React from 'react';
import {
  Compass,
  Box,
  Globe,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientHeroBannerProps {
  roomCount: number;
  artifact3DCount: number;
  languageCount: number;
  onExploreTourClick: () => void;
  onExploreArtifactsClick: () => void;
  featuredImageUrl?: string;
  videoUrl?: string;
}

export const ClientHeroBanner: React.FC<ClientHeroBannerProps> = ({
  roomCount,
  artifact3DCount,
  languageCount,
  onExploreTourClick,
  onExploreArtifactsClick,
  featuredImageUrl,
  videoUrl
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [mediaSrc, setMediaSrc] = React.useState<string>(
    featuredImageUrl ||
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=2000&q=85'
  );

  React.useEffect(() => {
    if (featuredImageUrl) {
      setMediaSrc(featuredImageUrl);
    }
  }, [featuredImageUrl]);

  const handleImageError = () => {
    // Nếu link ảnh lỗi hoặc bị chặn, dùng ảnh dự phòng kiến trúc bảo tàng đáng tin cậy
    setMediaSrc('https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2000&q=85');
  };

  return (
    <section id="hero" className="client-hero">
      {/* 1. KHỐI MEDIA TOÀN CẢNH TRÀN KHUNG 100VH */}
      <div className="client-hero-media-wrap">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="client-hero-media"
            poster={mediaSrc}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={mediaSrc}
            alt={branding.museumName || 'Bảo tàng Lịch sử'}
            className="client-hero-media"
            loading="eager"
            onError={handleImageError}
          />
        )}
      </div>

      {/* Lớp phủ chuyển màu quang học bảo vệ độ sắc nét chữ */}
      <div className="client-hero-overlay" />

      {/* 2. NỘI DUNG CHÍNH (TYPOGRAPHY THOÁNG ĐÃNG) */}
      <div className="client-container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="client-hero-content">
          <span className="client-hero-tag">
            {t('hero.tag', 'Bảo Tàng Số • Di Sản Văn Hóa & Không Gian Tương Tác')}
          </span>

          <h1 className="client-hero-headline">
            {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}
          </h1>

          <p className="client-hero-lead">
            {branding.tagline ||
              t(
                'hero.subtitle',
                'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.'
              )}
          </p>

          {/* Các nút hành động CTA */}
          <div className="client-hero-actions">
            <button
              type="button"
              className="client-btn-primary"
              onClick={onExploreTourClick}
            >
              <Compass size={18} />
              <span>{t('hero.btnTour', 'Bắt Đầu Tour 360°')}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="client-btn-secondary"
              onClick={onExploreArtifactsClick}
            >
              <Box size={18} />
              <span>{t('hero.btnArtifacts', 'Chiêm Ngưỡng Cổ Vật 3D')}</span>
            </button>
          </div>

          {/* Thanh thống kê dữ liệu thật dạng Capsule tinh hoa di sản */}
          <div className="client-hero-stats">
            <div className="client-hero-stat-item">
              <div className="client-hero-stat-header">
                <Compass size={16} className="client-hero-stat-icon" />
                <span className="client-hero-stat-value">{roomCount > 0 ? roomCount : 3}</span>
              </div>
              <div className="client-hero-stat-label">{t('hero.statRooms', 'Gian Phòng 360°')}</div>
            </div>

            <div className="client-hero-stat-divider" aria-hidden="true" />

            <div className="client-hero-stat-item">
              <div className="client-hero-stat-header">
                <Box size={16} className="client-hero-stat-icon" />
                <span className="client-hero-stat-value">{artifact3DCount > 0 ? artifact3DCount : 1}</span>
              </div>
              <div className="client-hero-stat-label">{t('hero.statArtifacts', 'Cổ Vật 3D')}</div>
            </div>

            <div className="client-hero-stat-divider" aria-hidden="true" />

            <div className="client-hero-stat-item">
              <div className="client-hero-stat-header">
                <Globe size={16} className="client-hero-stat-icon" />
                <span className="client-hero-stat-value">{languageCount > 0 ? languageCount : 6}</span>
              </div>
              <div className="client-hero-stat-label">{t('hero.statLangs', 'Ngôn Ngữ Thuyết Minh')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
