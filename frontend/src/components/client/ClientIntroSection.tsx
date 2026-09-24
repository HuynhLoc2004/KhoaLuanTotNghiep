import React from 'react';
import {
  Landmark,
  Compass,
  Box,
  Volume2,
  Award,
  BookOpen,
  History,
  Sparkles
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientIntroSection: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="intro" className="client-section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="client-container">
        <div className="client-section-header">
          <span className="client-section-badge">
            <History size={13} />
            <span>{t('intro.badge', 'Lịch sử & Sứ mệnh')}</span>
          </span>
          <h2 className="client-section-title">
            {t('intro.title', 'Nơi hội tụ và lưu giữ tinh hoa di sản')}
          </h2>
          <p className="client-section-desc">
            {t(
              'intro.desc',
              'Bảo tàng Lịch sử là gạch nối thiêng liêng giữa quá khứ huy hoàng và hiện tại, nơi gìn giữ hàng vạn cổ vật quý giá phản ánh toàn diện tiến trình lịch sử văn hóa dân tộc.'
            )}
          </p>
        </div>

        <div className="client-intro-grid">
          {/* Card giới thiệu chi tiết */}
          <div className="client-intro-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: 'rgba(140, 45, 25, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Landmark size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                  {branding.museumName || 'Bảo tàng Lịch sử Thành phố'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  {branding.city || 'Thành phố Hồ Chí Minh'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.7, margin: '0 0 14px 0' }}>
              {t(
                'intro.paragraph1',
                'Tọa lạc tại trung tâm đô thị lịch sử, bảo tàng sở hữu công trình kiến trúc Đông Dương độc đáo, kết hợp hài hòa giữa đường nét mỹ thuật cổ truyền Á Đông và kỹ thuật xây dựng hiện đại.'
              )}
            </p>

            <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              {t(
                'intro.paragraph2',
                'Hệ thống số hóa 360° và mô hình cổ vật 3D giúp quý khách ở bất cứ nơi đâu trên thế giới đều có thể tham quan, tìm hiểu và trân trọng những di sản vô giá của tổ tiên một cách chân thực nhất.'
              )}
            </p>
          </div>

          {/* 4 Trụ cột trải nghiệm di sản */}
          <div className="client-intro-features">
            <div className="client-feature-box">
              <div className="client-feature-icon">
                <Compass size={20} />
              </div>
              <div className="client-feature-title">{t('intro.feat1Title', 'Không gian 360°')}</div>
              <p className="client-feature-desc">
                {t('intro.feat1Desc', 'Tham quan toàn cảnh từng gian phòng trưng bày với chất lượng hình ảnh sắc nét.')}
              </p>
            </div>

            <div className="client-feature-box">
              <div className="client-feature-icon">
                <Box size={20} />
              </div>
              <div className="client-feature-title">{t('intro.feat2Title', 'Cổ vật 3D tương tác')}</div>
              <p className="client-feature-desc">
                {t('intro.feat2Desc', 'Xoay lật 360°, phóng to từng đường nét hoa văn và cấu trúc khối đa giác.')}
              </p>
            </div>

            <div className="client-feature-box">
              <div className="client-feature-icon">
                <Volume2 size={20} />
              </div>
              <div className="client-feature-title">{t('intro.feat3Title', 'Thuyết minh bản ngữ')}</div>
              <p className="client-feature-desc">
                {t('intro.feat3Desc', 'Lắng nghe giọng đọc hướng dẫn tự động đa ngôn ngữ chuẩn mực truyền cảm.')}
              </p>
            </div>

            <div className="client-feature-box">
              <div className="client-feature-icon">
                <BookOpen size={20} />
              </div>
              <div className="client-feature-title">{t('intro.feat4Title', 'Khảo cứu chuyên sâu')}</div>
              <p className="client-feature-desc">
                {t('intro.feat4Desc', 'Tư liệu lịch sử, niên đại và ý nghĩa biểu tượng được biên soạn chuẩn xác.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
