import React from 'react';
import { Compass, Box, Volume2, Landmark } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientIntroSection: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-section client-section-alt">
      <div className="client-container">
        <div className="client-intro-grid">
          {/* CỘT TRÁI: HÌNH ẢNH KIẾN TRÚC DI SẢN */}
          <div className="client-intro-visual">
            <div className="client-intro-img-frame">
              <img
                src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1200&q=80"
                alt={branding.museumName || 'Kiến trúc bảo tàng'}
                className="client-intro-img"
                loading="lazy"
              />
            </div>
          </div>

          {/* CỘT PHẢI: LỜI TỰA GIÁM TUYỂN & 3 TRỤ CỘT TRẢI NGHIỆM */}
          <div className="client-intro-text-col">
            <div>
              <span className="client-section-tag">
                {t('intro.tag', 'Lịch Sử & Sứ Mệnh')}
              </span>
              <h2 className="client-section-title" style={{ textAlign: 'left', marginBottom: 16 }}>
                {t('intro.headline', 'Nơi Hội Tụ & Lưu Giữ Tinh Hoa Di Sản Dân Tộc')}
              </h2>
              <p className="client-intro-paragraph">
                {t(
                  'intro.desc1',
                  'Bảo tàng là gạch nối thiêng liêng giữa quá khứ huy hoàng và hiện tại, nơi gìn giữ hàng vạn cổ vật quý giá phản ánh toàn diện tiến trình lịch sử văn hóa phương Nam và dân tộc Việt Nam.'
                )}
              </p>
            </div>

            <div className="client-intro-features">
              {/* Điểm nhấn 1: Tour 360 */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Compass size={22} />
                </div>
                <div>
                  <h4 className="client-feature-title">
                    {t('intro.feature1Title', 'Không Gian Tour 360° Độc Bản')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feature1Desc', 'Tham quan toàn cảnh từng gian phòng trưng bày với chất lượng hình ảnh sắc nét, điểm neo tương tác sống động.')}
                  </p>
                </div>
              </div>

              {/* Điểm nhấn 2: Cổ vật 3D */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Box size={22} />
                </div>
                <div>
                  <h4 className="client-feature-title">
                    {t('intro.feature2Title', 'Tái Tạo Hiện Vật 3D Đa Chiều')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feature2Desc', 'Chiêm ngưỡng chi tiết hoa văn, xoay 360 độ và tiếp cận hiện vật quý ở cự ly chân thực nhất.')}
                  </p>
                </div>
              </div>

              {/* Điểm nhấn 3: Thuyết minh đa ngữ */}
              <div className="client-feature-item">
                <div className="client-feature-icon">
                  <Volume2 size={22} />
                </div>
                <div>
                  <h4 className="client-feature-title">
                    {t('intro.feature3Title', 'Thuyết Minh Đa Ngữ Thông Minh')}
                  </h4>
                  <p className="client-feature-desc">
                    {t('intro.feature3Desc', 'Lắng nghe giọng đọc tự động đa ngôn ngữ truyền cảm, đưa câu chuyện lịch sử chạm đến trái tim du khách toàn cầu.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
