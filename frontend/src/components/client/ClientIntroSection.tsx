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
    <section id="intro" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG 1: NẰM BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* CỘT ẢNH: KIẾN TRÚC BẢO TÀNG TINH TẾ */}
          <div className="client-zigzag-card-media">
            {branding.introImageUrl ? (
              <img
                src={branding.introImageUrl}
                alt={branding.introTitle || branding.museumName || 'Kiến trúc Bảo tàng Lịch sử'}
                className="client-zigzag-card-img"
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
            <div className="client-zigzag-badge-float">
              <span>{t(branding.introBadgeText || 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia', branding.introBadgeText || 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia')}</span>
            </div>
          </div>

          {/* CỘT NỘI DUNG: TRANG NHÃ, KHÔNG TÈM LEM MÀU, KHÔNG ICON DƯ THỪA */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t(branding.introTag || 'intro.tag', branding.introTag || 'Kiến Trúc & Không Gian')}
            </span>

            <h2 className="client-zigzag-title">
              {t(branding.introTitle || branding.museumName || 'intro.title', branding.introTitle || branding.museumName || 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                branding.introDesc || branding.tagline || 'intro.desc',
                branding.introDesc ||
                  branding.tagline ||
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
