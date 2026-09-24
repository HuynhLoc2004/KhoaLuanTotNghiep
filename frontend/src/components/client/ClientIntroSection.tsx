import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientIntroSection: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-section client-section-alt client-zigzag-section reveal-on-scroll">
      <div className="client-container">
        <div className="client-zigzag-grid">
          {/* CỘT TRÁI: ẢNH DI SẢN KIẾN TRÚC TO RỘNG */}
          <div className="client-zigzag-media">
            <div className="client-zigzag-img-frame">
              <img
                src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=85"
                alt={branding.museumName || 'Kiến trúc Bảo tàng Lịch sử'}
                className="client-zigzag-img"
                loading="lazy"
              />
              <div className="client-zigzag-media-caption">
                <span>Di tích Kiến trúc Nghệ thuật Cấp Quốc gia</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỜI TỰA & 3 CHỈ SỐ THEN CHỐT (TỐI GIẢN, KHÔNG TEXT DÀI DÒNG) */}
          <div className="client-zigzag-content">
            <span className="client-zigzag-tag">
              {t('intro.tag', 'Lịch Sử & Kiến Trúc')}
            </span>

            <h2 className="client-zigzag-title">
              {t('intro.headline', 'Gần Một Thế Kỷ Lưu Giữ Hồn Thiêng Văn Hóa')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'intro.desc',
                'Khánh thành năm 1929 tại Thảo Cầm Viên, Bảo tàng Lịch sử TP. Hồ Chí Minh là công trình kiến trúc Đông Dương tráng lệ, nơi bảo tồn và lan tỏa các giá trị văn hóa lịch sử đặc sắc của dân tộc.'
              )}
            </p>

            {/* 3 Chỉ số then chốt nhã nhặn */}
            <div className="client-zigzag-stats">
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">1929</span>
                <span className="client-zigzag-stat-lbl">Năm khánh thành</span>
              </div>
              <div className="client-zigzag-stat-divider" />
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">40.000+</span>
                <span className="client-zigzag-stat-lbl">Hiện vật & Cổ vật</span>
              </div>
              <div className="client-zigzag-stat-divider" />
              <div className="client-zigzag-stat-item">
                <span className="client-zigzag-stat-val">18</span>
                <span className="client-zigzag-stat-lbl">Phòng chuyên đề</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
