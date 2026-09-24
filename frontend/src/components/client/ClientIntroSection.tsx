import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Compass, Box, Sparkles, ArrowRight } from 'lucide-react';

interface ClientIntroSectionProps {
  roomCount?: number;
  artifactCount?: number;
  topicCount?: number;
  onExploreRooms?: () => void;
}

export const ClientIntroSection: React.FC<ClientIntroSectionProps> = ({
  roomCount = 0,
  artifactCount = 0,
  topicCount = 0,
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
              src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=85"
              alt={branding.museumName || 'Kiến trúc Bảo tàng Lịch sử'}
              className="client-zigzag-card-img"
              loading="lazy"
            />
            <div className="client-zigzag-badge-float">
              <span>Di tích Kiến trúc Nghệ thuật Cấp Quốc gia</span>
            </div>
          </div>

          {/* CỘT NỘI DUNG: NGẮN GỌN, CHÂN THỰC, KHÔNG SÁO RỖNG, SỐ LIỆU ĐỒNG BỘ THẬT */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('intro.tag', 'Kiến Trúc & Không Gian')}
            </span>

            <h2 className="client-zigzag-title">
              {branding.museumName || t('intro.title', 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh')}
            </h2>

            <p className="client-zigzag-desc">
              {branding.tagline ||
                t(
                  'intro.desc',
                  'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.'
                )}
            </p>

            {/* DỮ LIỆU ĐỒNG BỘ THẬT TỪ DATABASE - TUYỆT ĐỐI KHÔNG DÙNG SỐ ẢO */}
            <div className="client-zigzag-meta-chips">
              <div className="client-zigzag-meta-chip">
                <Compass size={14} className="client-zigzag-chip-icon" />
                <span>
                  <strong>{roomCount}</strong> {t('intro.statRooms', 'Gian phòng 360°')}
                </span>
              </div>
              <div className="client-zigzag-meta-chip">
                <Box size={14} className="client-zigzag-chip-icon" />
                <span>
                  <strong>{artifactCount}</strong> {t('intro.statArtifacts', 'Hiện vật số hóa')}
                </span>
              </div>
              {topicCount > 0 && (
                <div className="client-zigzag-meta-chip">
                  <Sparkles size={14} className="client-zigzag-chip-icon" />
                  <span>
                    <strong>{topicCount}</strong> {t('intro.statTopics', 'Chuyên đề')}
                  </span>
                </div>
              )}
            </div>

            {/* NÚT ĐIỀU HƯỚNG NHẸ NHÀNG */}
            {onExploreRooms && (
              <div className="client-zigzag-actions" style={{ marginTop: 22 }}>
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onExploreRooms}
                >
                  <span>{t('intro.btnExplore', 'Khám phá gian trưng bày')}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
