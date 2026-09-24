import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientVisitorGuideProps {
  onViewAllGuide?: () => void;
}

export const ClientVisitorGuide: React.FC<ClientVisitorGuideProps> = ({ onViewAllGuide }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const museumPhoto =
    branding.heroBannerUrl ||
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';

  return (
    <section id="guide" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 4: NẰM BÊN TRÁI, CỘT NỘI DUNG BÊN TRÁI - ẢNH KIẾN TRÚC BÊN PHẢI */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA: HÌNH ẢNH KHUÔN VIÊN & KIẾN TRÚC BẢO TÀNG */}
          <div
            className="client-zigzag-card-media clickable"
            onClick={onViewAllGuide}
            role="button"
            tabIndex={0}
            title={t('guide.clickToEnter', 'Bấm để xem cẩm nang tham quan chi tiết')}
          >
            <img
              src={museumPhoto}
              alt={branding.museumName || 'Bảo tàng Lịch sử TP.HCM'}
              className="client-zigzag-card-img"
              loading="lazy"
            />
            <div className="client-zigzag-badge-float">
              <span>{t('guide.openToday', 'Đón khách tham quan')}</span>
            </div>

            <div className="client-zigzag-media-caption">
              <span style={{ fontWeight: 600 }}>
                {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM'}
              </span>
            </div>
          </div>

          {/* CỘT NỘI DUNG: HƯỚNG DẪN THỰC ĐỊA TRANG NHÃ */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('guide.tag', 'Kế Hoạch Tham Quan')}
            </span>

            <h2 className="client-zigzag-title">
              {t('guide.headline', 'Hướng Dẫn Khách Tham Quan Thực Địa')}
            </h2>

            <p className="client-zigzag-desc" style={{ marginBottom: 18 }}>
              {t(
                'guide.sub',
                'Thông tin giờ mở cửa đón khách, chính sách biểu phí niêm yết và trải nghiệm tương tác số hóa trực tiếp tại không gian bảo tàng.'
              )}
            </p>

            <div className="client-zigzag-guide-cards">
              {/* Giờ mở cửa */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Thời gian mở cửa đón khách</span>
                  <span className="client-zigzag-guide-badge">Thứ Ba – Chủ Nhật</span>
                </div>
                <div className="client-zigzag-guide-time">
                  <span>08:00 – 11:30</span>
                  <span className="client-zigzag-guide-dot">•</span>
                  <span>13:30 – 17:00</span>
                </div>
                <div className="client-zigzag-guide-sub">
                  * Nghỉ Thứ Hai hàng tuần để bảo dưỡng cổ vật
                </div>
              </div>

              {/* Biểu phí vé */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Biểu phí vé niêm yết</span>
                </div>
                <div className="client-zigzag-guide-tickets">
                  <div className="client-zigzag-ticket-row">
                    <span>Khách người lớn</span>
                    <strong>30.000 VNĐ</strong>
                  </div>
                  <div className="client-zigzag-ticket-row">
                    <span>Học sinh, sinh viên, người cao tuổi</span>
                    <strong className="highlight">Miễn phí / Ưu đãi</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* NÚT HÀNH ĐỘNG SANG TRỌNG */}
            {onViewAllGuide && (
              <div className="client-zigzag-actions" style={{ marginTop: 22 }}>
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onViewAllGuide}
                >
                  {t('guide.btnViewAll', 'Xem cẩm nang tham quan đầy đủ')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

