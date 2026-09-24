import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientIntroSection: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG THẰNG 1: NẰM BÊN CÙNG BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card align-right reveal-on-scroll">
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

          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('intro.tag', 'Lịch Sử & Kiến Trúc')}
            </span>

            <h2 className="client-zigzag-title">
              {t('intro.headline', 'Gần Một Thế Kỷ Lưu Giữ Hồn Thiêng Văn Hóa')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'intro.desc',
                'Khánh thành năm 1929 tại Thảo Cầm Viên, Bảo tàng Lịch sử TP. Hồ Chí Minh là công trình kiến trúc Đông Dương tráng lệ, nơi bảo tồn hơn 40.000 cổ vật quý giá tái hiện dòng chảy ngàn năm văn hiến phương Nam.'
              )}
            </p>

            {/* 3 Chỉ số then chốt nhã nhặn */}
            <div className="client-zigzag-stats">
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">1929</span>
                <span className="client-zigzag-stat-lbl">Khánh thành</span>
              </div>
              <div className="client-zigzag-stat-divider" />
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">40.000+</span>
                <span className="client-zigzag-stat-lbl">Hiện vật di sản</span>
              </div>
              <div className="client-zigzag-stat-divider" />
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">18</span>
                <span className="client-zigzag-stat-lbl">Phòng trưng bày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
