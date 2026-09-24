import React from 'react';
import { Clock, MapPin, QrCode, Smartphone, Compass } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientVisitorGuide: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="guide" className="client-section client-section-alt">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('guide.tag', 'Lên Kế Hoạch Tham Quan')}
          </span>
          <h2 className="client-section-title">
            {t('guide.headline', 'Hướng Dẫn Tham Quan Thực Địa')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'guide.sub',
              'Thông tin chi tiết về thời gian mở cửa, địa điểm và công nghệ quét mã QR tương tác tại bảo tàng.'
            )}
          </p>
        </div>

        {/* Bố cục chia đôi: Thông tin thực địa & Trải nghiệm quét mã QR Standee */}
        <div className="client-guide-split">
          {/* Cột trái: Giờ mở cửa & Địa điểm */}
          <div className="client-guide-info-cards">
            {/* Card Giờ mở cửa */}
            <div className="client-guide-info-card">
              <div className="client-guide-info-icon">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="client-guide-info-title">
                  {t('guide.hoursTitle', 'Thời Gian Mở Cửa')}
                </h3>
                <p className="client-guide-info-text">
                  <strong>Thứ Ba đến Chủ Nhật hàng tuần:</strong>
                  <br />
                  Buổi sáng: 08:00 – 11:30 | Buổi chiều: 13:30 – 17:00
                  <br />
                  <span style={{ fontSize: '0.84rem', color: 'var(--c-text-muted)' }}>
                    (Bảo tàng đóng cửa bảo trì và bảo quản hiện vật vào thứ Hai)
                  </span>
                </p>
              </div>
            </div>

            {/* Card Địa điểm */}
            <div className="client-guide-info-card">
              <div className="client-guide-info-icon">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="client-guide-info-title">
                  {t('guide.locationTitle', 'Địa Chỉ & Hotline')}
                </h3>
                <p className="client-guide-info-text">
                  {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
                  <br />
                  <strong>Đường dây nóng:</strong> {branding.hotline || '(028) 3829 8146'}
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải: Thẻ Standee QR tương tác */}
          <div className="client-standee-card">
            <div className="client-standee-qr-icon">
              <QrCode size={34} />
            </div>

            <h3 className="client-standee-title">
              {t('guide.qrTitle', 'Trải Nghiệm Quét Mã QR Tại Bảo Tàng')}
            </h3>

            <p className="client-standee-desc">
              {t(
                'guide.qrDesc',
                'Khi ghé thăm trực tiếp, quý khách chỉ cần dùng camera điện thoại quét mã QR gắn tại bảng chú thích của mỗi bảo vật để mở ngay mô hình 3D xoay 360 độ và nghe giọng đọc thuyết minh bản ngữ.'
              )}
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--c-radius-pill)',
                background: 'var(--c-gold-light)',
                color: 'var(--c-gold)',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <Smartphone size={16} />
              <span>Tương thích mọi thiết bị di động không cần cài app</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
