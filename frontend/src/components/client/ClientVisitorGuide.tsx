import React from 'react';
import { Clock, MapPin, QrCode, Smartphone } from 'lucide-react';
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

        {/* BỐ CỤC CHIA ĐÔI THÔNG TIN THỰC ĐỊA & QR STANDEE */}
        <div className="client-visit-grid">
          {/* CỘT TRÁI: GIỜ MỞ CỬA & ĐỊA ĐIỂM */}
          <div className="client-visit-info-stack">
            {/* Card Giờ mở cửa */}
            <div className="client-visit-card">
              <div className="client-visit-card-icon">
                <Clock size={26} />
              </div>
              <div>
                <h3 className="client-visit-card-title">
                  {t('guide.hoursTitle', 'Thời Gian Mở Cửa')}
                </h3>
                <p className="client-visit-card-text">
                  <strong>Thứ Ba đến Chủ Nhật:</strong>
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
            <div className="client-visit-card">
              <div className="client-visit-card-icon">
                <MapPin size={26} />
              </div>
              <div>
                <h3 className="client-visit-card-title">
                  {t('guide.locationTitle', 'Địa Chỉ & Hotline')}
                </h3>
                <p className="client-visit-card-text">
                  {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
                  <br />
                  <strong>Đường dây nóng:</strong> {branding.hotline || '(028) 3829 8146'}
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TRẢI NGHIỆM QR STANDEE */}
          <div className="client-standee-showcase">
            <div className="client-standee-qr-icon-wrap">
              <QrCode size={36} />
            </div>

            <h3 className="client-standee-title">
              {t('guide.qrTitle', 'Trải Nghiệm Quét Mã QR Tại Điểm')}
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
                padding: '9px 20px',
                borderRadius: 'var(--c-radius-pill)',
                background: 'var(--c-gold-light)',
                color: 'var(--c-gold)',
                fontSize: '0.86rem',
                fontWeight: 600
              }}
            >
              <Smartphone size={16} />
              <span>Tương thích mọi thiết bị di động không cần cài ứng dụng</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
