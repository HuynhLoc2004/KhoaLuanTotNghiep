import React from 'react';
import { MapPin } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientVisitorGuideProps {
  onViewAllGuide?: () => void;
}

export const ClientVisitorGuide: React.FC<ClientVisitorGuideProps> = ({ onViewAllGuide }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const museumPhoto = branding.guideMapUrl || branding.introImageUrl || '';

  return (
    <section id="guide" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 4: NẰM BÊN TRÁI, ĐẢO CỘT NỘI DUNG TRÁI - ẢNH KIẾN TRÚC PHẢI */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA: ẢNH KIẾN TRÚC BẢO TÀNG */}
          <div
            className="client-zigzag-card-media clickable"
            onClick={onViewAllGuide}
            role="button"
            tabIndex={0}
            title={t('guide.clickToEnter', 'Bấm để xem cẩm nang & sơ đồ tham quan')}
          >
            {museumPhoto ? (
              <img
                src={museumPhoto}
                alt={branding.museumName || 'Bảo tàng Lịch sử TP.HCM'}
                className="client-zigzag-card-img"
                loading="lazy"
              />
            ) : (
              <div className="client-media-placeholder">
                <div className="client-media-placeholder-icon">
                  <MapPin size={32} strokeWidth={1.5} />
                </div>
                <span className="client-media-placeholder-title">
                  {t('guide.noMapTitle', 'Chưa bổ sung sơ đồ tham quan')}
                </span>
                <span className="client-media-placeholder-desc">
                  {t('guide.noMapDesc', 'Sơ đồ mặt bằng và cẩm nang sẽ hiển thị sau khi quản trị viên cập nhật tại mục 7 Quản lý Trang chủ.')}
                </span>
              </div>
            )}
            <div className="client-zigzag-badge-float">
              <span>{t('guide.openToday', 'Đón khách tham quan')}</span>
            </div>

            {museumPhoto && (
              <div className="client-zigzag-media-caption">
                <span style={{ fontWeight: 600 }}>
                  {t(branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM', branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM')}
                </span>
              </div>
            )}
          </div>

          {/* CỘT NỘI DUNG: TỐI GIẢN, TINH TẾ, TUYỆT ĐỐI KHÔNG DÙNG HỘP DỮ LIỆU ẢO */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t(branding.guideTag || 'guide.tag', branding.guideTag || 'Kế Hoạch & Sơ Đồ')}
            </span>

            <h2 className="client-zigzag-title">
              {t(branding.guideTitle || 'guide.headline', branding.guideTitle || 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                branding.guideDesc || 'guide.sub',
                branding.guideDesc ||
                  'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.'
              )}
            </p>

            {/* DÒNG THÔNG SỐ ĐỒNG BỘ TINH TẾ */}
            <div className="client-zigzag-meta-line">
              <span className="client-zigzag-meta-item">
                {t(branding.city || 'TP. Hồ Chí Minh', branding.city || 'TP. Hồ Chí Minh')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('guide.digitizedMap', 'Sơ đồ mặt bằng số hóa')}
              </span>
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('guide.audioGuide', 'Thuyết minh Audio Guide')}
              </span>
            </div>

            {/* DUY NHẤT 1 NÚT ĐIỀU HƯỚNG SANG TRANG CẨM NANG */}
            {onViewAllGuide && (
              <div className="client-zigzag-actions">
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onViewAllGuide}
                >
                  {branding.guideCtaText || t('guide.btnViewAll', 'Xem cẩm nang & sơ đồ tham quan')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


