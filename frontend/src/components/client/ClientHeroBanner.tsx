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
import { API_ROOT, resolveMediaUrl } from '../../services/api';

interface ClientHeroBannerProps {
  roomCount: number;
  artifact3DCount: number;
  languageCount: number;
  onExploreTourClick: () => void;
  onExploreArtifactsClick: () => void;
  featuredImageUrl?: string;
  fallbackImageUrl?: string;
  videoUrl?: string;
}

export const ClientHeroBanner: React.FC<ClientHeroBannerProps> = ({
  roomCount,
  artifact3DCount,
  languageCount,
  onExploreTourClick,
  onExploreArtifactsClick,
  featuredImageUrl,
  fallbackImageUrl,
  videoUrl
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [failedUrls, setFailedUrls] = React.useState<Record<string, boolean>>({});

  // Reset khi URL nguồn thay đổi từ CMS hoặc props
  React.useEffect(() => {
    setFailedUrls({});
  }, [featuredImageUrl, branding.heroBannerUrl, fallbackImageUrl]);

  const candidates = React.useMemo(() => {
    const list: string[] = [];
    const banner = (featuredImageUrl || branding.heroBannerUrl || '').trim();
    if (banner) {
      const primary = resolveMediaUrl(banner);
      if (primary) list.push(primary);
    }
    return list;
  }, [featuredImageUrl, branding.heroBannerUrl]);

  const activeImageUrl = candidates.find((url) => !failedUrls[url]) || '';

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => ({ ...prev, [url]: true }));
  };

  const effectiveVideoUrl = (videoUrl || branding.heroVideoUrl || '').trim();
  const hasValidVideo = Boolean(effectiveVideoUrl && effectiveVideoUrl.length > 5);

  // Trợ thủ typography: Không bao giờ để rớt chữ đơn lẻ "Minh" hay xé lẻ tên thành phố
  const formatHeroTitle = (titleText: string) => {
    const targets = ['TP. Hồ Chí Minh', 'Hồ Chí Minh', 'Hô Chi Minh-Ville', 'Ho Chi Minh City'];
    for (const target of targets) {
      if (titleText.includes(target)) {
        const parts = titleText.split(target);
        return (
          <>
            {parts[0]}
            <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>{target}</span>
            {parts.slice(1).join(target)}
          </>
        );
      }
    }
    return titleText;
  };

  const rawHeroTitle = branding.heroTitle?.trim() || branding.museumName?.trim() || 'Bảo tàng Lịch sử TP. Hồ Chí Minh';
  const localizedHeroTitle = t(rawHeroTitle, rawHeroTitle);

  const rawHeroLead =
    branding.heroTagline?.trim() ||
    branding.tagline?.trim() ||
    'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.';
  const localizedHeroLead = t(rawHeroLead, rawHeroLead);

  const rawCta1 = branding.heroCta1Text?.trim() || 'Bắt Đầu Tour 360°';
  const localizedCta1 = t(rawCta1, rawCta1);

  const rawCta2 = branding.heroCta2Text?.trim() || 'Chiêm Ngưỡng Cổ Vật 3D';
  const localizedCta2 = t(rawCta2, rawCta2);

  return (
    <section id="hero" className="client-hero">
      {/* 1. KHỐI MEDIA TOÀN CẢNH TRÀN KHUNG 100VH */}
      <div className="client-hero-media-wrap">
        {hasValidVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="client-hero-media"
            poster={activeImageUrl || undefined}
          >
            <source src={effectiveVideoUrl} type="video/mp4" />
          </video>
        ) : activeImageUrl ? (
          <img
            key={activeImageUrl}
            src={activeImageUrl}
            alt={branding.museumName || 'Bảo tàng Lịch sử'}
            className="client-hero-media"
            loading="eager"
            onError={() => handleImageError(activeImageUrl)}
          />
        ) : (
          <div
            className="client-hero-media client-hero-backdrop-default"
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(ellipse at 50% 32%, rgba(212, 175, 55, 0.22) 0%, rgba(55, 25, 18, 0.55) 45%, #0A0D14 100%)'
            }}
          />
        )}
      </div>

      {/* Lớp phủ chuyển màu quang học bảo vệ độ sắc nét chữ */}
      <div className="client-hero-overlay" />

      {/* 2. NỘI DUNG CHÍNH (TYPOGRAPHY THOÁNG ĐÃNG) */}
      <div className="client-container client-hero-container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="client-hero-content">
          <span className="client-hero-tag">
            {t('hero.tag', 'Bảo Tàng Số • Di Sản Văn Hóa & Không Gian Tương Tác')}
          </span>

          <h1 className="client-hero-headline">
            {formatHeroTitle(localizedHeroTitle)}
          </h1>

          <p className="client-hero-lead">
            {localizedHeroLead}
          </p>

          {/* Các nút hành động CTA */}
          <div className="client-hero-actions">
            <button
              type="button"
              className="client-btn-primary"
              onClick={onExploreTourClick}
            >
              <span>{localizedCta1}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="client-btn-secondary"
              onClick={onExploreArtifactsClick}
            >
              <span>{localizedCta2}</span>
            </button>
          </div>

          {/* Thanh thống kê dữ liệu thật dạng Capsule tinh gọn */}
          <div className="client-hero-stats">
            <div className="client-hero-stat-item">
              <span className="client-hero-stat-value">{roomCount ?? 0}</span>
              <div className="client-hero-stat-label">{t('hero.statRooms', 'Gian Phòng 360°')}</div>
            </div>

            <div className="client-hero-stat-divider" aria-hidden="true" />

            <div className="client-hero-stat-item">
              <span className="client-hero-stat-value">{artifact3DCount ?? 0}</span>
              <div className="client-hero-stat-label">{t('hero.statArtifacts', 'Cổ Vật 3D')}</div>
            </div>

            <div className="client-hero-stat-divider" aria-hidden="true" />

            <div className="client-hero-stat-item">
              <span className="client-hero-stat-value">{languageCount > 0 ? languageCount : 6}</span>
              <div className="client-hero-stat-label">{t('hero.statLangs', 'Ngôn Ngữ Thuyết Minh')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NÚT CHỈ BÁO CUỘN XUỐNG NẨY NẨY (SCROLL DOWN BOUNCING INDICATOR) */}
      <button
        type="button"
        className="client-hero-scroll-btn"
        onClick={() => {
          const nextSection = document.getElementById('intro');
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            });
          }
        }}
        title={t('Cuộn xuống khám phá', 'Cuộn xuống khám phá')}
        aria-label={t('Cuộn xuống khám phá', 'Cuộn xuống khám phá')}
      >
        <span className="client-hero-scroll-label">{t('Cuộn xuống', 'Cuộn xuống')}</span>
        <div className="client-hero-scroll-icon-wrap">
          <ChevronDown size={18} className="client-hero-scroll-arrow" />
        </div>
      </button>
    </section>
  );
};
