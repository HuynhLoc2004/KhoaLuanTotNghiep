import React from 'react';
import { Landmark, Compass, Award, Sparkles, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientIntroSection: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-section client-section-alt client-intro-section">
      <div className="client-container">
        <div className="client-intro-grid">
          {/* CỘT TRÁI: KHUNG ẢNH KIẾN TRÚC DI SẢN KÈM HUY HIỆU */}
          <div className="client-intro-visual">
            <div className="client-intro-img-frame">
              {/* Huy hiệu di tích nổi ở góc trên */}
              <div className="client-intro-monument-badge">
                <ShieldCheck size={15} />
                <span>Di tích Kiến trúc Nghệ thuật Cấp Quốc gia</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=85"
                alt={branding.museumName || 'Kiến trúc Bảo tàng Lịch sử TP. Hồ Chí Minh'}
                className="client-intro-img"
                loading="lazy"
              />

              {/* Thẻ nổi góc dưới: Năm thành lập & Lịch sử */}
              <div className="client-intro-history-card">
                <div className="client-intro-history-emblem">
                  <Landmark size={24} />
                </div>
                <div className="client-intro-history-text">
                  <div className="client-intro-history-year">Khánh thành 1929</div>
                  <div className="client-intro-history-sub">
                    Gần một thế kỷ lưu giữ hồn thiêng văn hóa phương Nam
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: LỜI TỰA BẢO TÀNG & 3 TRỤ CỘT DI SẢN */}
          <div className="client-intro-text-col">
            <div className="client-intro-header-block">
              <span className="client-section-tag">
                {t('intro.tag', 'Lịch Sử & Kiến Trúc Bảo Tàng')}
              </span>
              <h2 className="client-intro-title">
                {t('intro.headline', 'Gần Một Thế Kỷ Gìn Giữ & Tôn Vinh Di Sản Dân Tộc')}
              </h2>
              <p className="client-intro-paragraph">
                {t(
                  'intro.desc1',
                  'Tọa lạc giữa khuôn viên Thảo Cầm Viên xanh mát từ năm 1929, Bảo tàng Lịch sử TP. Hồ Chí Minh là công trình kiến trúc Đông Dương tráng lệ, kết hợp hài hòa mỹ thuật cung đình truyền thống và kỹ nghệ xây dựng phương Tây.'
                )}
              </p>
              <p className="client-intro-paragraph secondary">
                {t(
                  'intro.desc2',
                  'Nơi đây hiện lưu giữ và phát huy giá trị của hơn 40.000 cổ vật quý giá, minh chứng cho các nền văn minh cổ xưa từ thời tiền sử đến triều Nguyễn, nay được tái hiện sinh động qua công nghệ số hóa 360° tương tác.'
                )}
              </p>
            </div>

            {/* 3 Trụ Cột Di Sản Chuẩn Mực */}
            <div className="client-intro-features">
              {/* Điểm nhấn 1: Kiến trúc Đông Dương */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Landmark size={22} />
                </div>
                <div className="client-feature-content">
                  <h4 className="client-feature-title">
                    {t('intro.feat1Title', 'Kiến Trúc Đông Dương Cổ Điển')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feat1Desc', 'Công trình di sản gần 100 năm tuổi với tháp bát giác tráng lệ và các vòm cửa hoa văn Á Đông độc đáo.')}
                  </p>
                </div>
              </div>

              {/* Điểm nhấn 2: Kho tàng cổ vật */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Award size={22} />
                </div>
                <div className="client-feature-content">
                  <h4 className="client-feature-title">
                    {t('intro.feat2Title', 'Kho Tàng Cổ Vật & Bảo Vật Quốc Gia')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feat2Desc', 'Lưu giữ nhiều bảo vật quốc gia độc bản, văn hóa Champa, Óc Eo và di sản mỹ thuật cung đình triều Nguyễn.')}
                  </p>
                </div>
              </div>

              {/* Điểm nhấn 3: Không gian Tour 360 */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Compass size={22} />
                </div>
                <div className="client-feature-content">
                  <h4 className="client-feature-title">
                    {t('intro.feat3Title', 'Không Gian Tour 360° Thực Tế Ảo')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feat3Desc', 'Khám phá toàn diện từng gian phòng triển lãm với ảnh toàn cảnh độ nét cao và điểm neo hiện vật tương tác.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Băng Thống Kê Nhanh Cuối Khối Giới Thiệu */}
            <div className="client-intro-meta-strip">
              <div className="client-intro-meta-item">
                <span className="client-intro-meta-num">40.000+</span>
                <span className="client-intro-meta-label">Hiện vật & Tư liệu</span>
              </div>
              <div className="client-intro-meta-divider" />
              <div className="client-intro-meta-item">
                <span className="client-intro-meta-num">14</span>
                <span className="client-intro-meta-label">Gian trưng bày</span>
              </div>
              <div className="client-intro-meta-divider" />
              <div className="client-intro-meta-item">
                <span className="client-intro-meta-num">1929</span>
                <span className="client-intro-meta-label">Năm thành lập</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
