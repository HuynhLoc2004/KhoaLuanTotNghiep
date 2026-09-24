import React from 'react';
import {
  Compass,
  Box,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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
}

export const ClientHeroBanner: React.FC<ClientHeroBannerProps> = ({
  roomCount,
  artifact3DCount,
  languageCount,
  onExploreTourClick,
  onExploreArtifactsClick,
  featuredImageUrl
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="hero" className="client-hero">
      <div className="client-container">
        <div className="client-hero-grid">
          {/* Cột Trái: Thông điệp Di sản & Kêu gọi hành động */}
          <div className="client-hero-content">
            <div className="client-hero-eyebrow">
              <ShieldCheck size={14} />
              <span>{t('hero.badge', 'Di sản Văn hóa • Bảo tàng Số Tương tác')}</span>
            </div>

            <h1 className="client-hero-title">
              {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}
              <span className="client-hero-title-highlight" style={{ display: 'block', marginTop: 6 }}>
                {branding.tagline || 'Không Gian Di Sản 360°'}
              </span>
            </h1>

            <p className="client-hero-subtitle">
              {t(
                'hero.subtitle',
                'Khám phá chiều dài nghìn năm lịch sử dân tộc qua công nghệ thực tế ảo Tour 360° toàn cảnh, tương tác đa chiều với cổ vật 3D và lắng nghe thuyết minh giọng đọc bản ngữ sống động.'
              )}
            </p>

            <div className="client-hero-cta-group">
              <button
                type="button"
                className="client-btn-hero-primary"
                onClick={onExploreTourClick}
              >
                <Compass size={18} />
                <span>{t('hero.btnTour', 'Bắt đầu tham quan Tour 360°')}</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="client-btn-hero-secondary"
                onClick={onExploreArtifactsClick}
              >
                <Box size={18} style={{ color: 'var(--accent-gold)' }} />
                <span>{t('hero.btnArtifacts', 'Chiêm ngưỡng cổ vật 3D')}</span>
              </button>
            </div>

            {/* Thống kê dữ liệu thật */}
            <div className="client-hero-stats">
              <div className="client-stat-item">
                <span className="client-stat-number">{roomCount || 8}+</span>
                <span className="client-stat-label">{t('hero.statRooms', 'Gian phòng 360°')}</span>
              </div>
              <div className="client-stat-item">
                <span className="client-stat-number">{artifact3DCount || 20}+</span>
                <span className="client-stat-label">{t('hero.statArtifacts', 'Cổ vật số hóa 3D')}</span>
              </div>
              <div className="client-stat-item">
                <span className="client-stat-number">{languageCount || 5}</span>
                <span className="client-stat-label">{t('hero.statLanguages', 'Ngôn ngữ thuyết minh')}</span>
              </div>
            </div>
          </div>

          {/* Cột Phải: Hình ảnh đại diện di sản trang trọng */}
          <div className="client-hero-visual">
            <img
              src={
                featuredImageUrl ||
                branding.logoUrl ||
                'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80'
              }
              alt="Bảo tàng Lịch sử"
            />
            <div className="client-hero-overlay-tag">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(180, 125, 40, 0.25)',
                    color: 'var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{branding.shortName || 'Di sản Bảo tàng'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                    Trải nghiệm trực tuyến 24/7
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '3px 8px',
                  borderRadius: 12
                }}
              >
                VR 360 • 3D
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
