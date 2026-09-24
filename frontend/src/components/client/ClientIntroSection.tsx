import React from 'react';
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
    <section id="intro" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG 1: NẰM BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* CỘT ẢNH: KIẾN TRÚC BẢO TÀNG TINH TẾ */}
          <div className="client-zigzag-card-media">
            <img
              src={branding.introImageUrl || "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=85"}
              alt={branding.introTitle || branding.museumName || 'Kiến trúc Bảo tàng Lịch sử'}
              className="client-zigzag-card-img"
              loading="lazy"
            />
            <div className="client-zigzag-badge-float">
              <span>{branding.introBadgeText || 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia'}</span>
            </div>
          </div>

          {/* CỘT NỘI DUNG: TRANG NHÃ, KHÔNG TÈM LEM MÀU, KHÔNG ICON DƯ THỪA */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {branding.introTag || t('intro.tag', 'Kiến Trúc & Không Gian')}
            </span>

            <h2 className="client-zigzag-title">
              {branding.introTitle || branding.museumName || t('intro.title', 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh')}
            </h2>

            <p className="client-zigzag-desc">
              {branding.introDesc ||
                branding.tagline ||
                t(
                  'intro.desc',
                  'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.'
                )}
            </p>

            {/* DÒNG THÔNG SỐ ĐỒNG BỘ THẬT: TỐI GIẢN, LỊCH THIỆP, KHÔNG ICON LÒE LOẸT */}
            <div className="client-zigzag-meta-line">
              <span className="client-zigzag-meta-item">
                <strong>{roomCount}</strong> {t('intro.statRooms', 'Gian phòng 360°')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                <strong>{artifactCount}</strong> {t('intro.statArtifacts', 'Hiện vật số hóa')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('intro.interactiveTag', 'Không gian tương tác')}
              </span>
            </div>

            {/* NÚT HÀNH ĐỘNG SANG TRỌNG CHUẨN MỰC */}
            {onExploreRooms && (
              <div className="client-zigzag-actions">
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onExploreRooms}
                >
                  {branding.introCtaText || t('intro.btnExplore', 'Khám phá gian trưng bày')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
