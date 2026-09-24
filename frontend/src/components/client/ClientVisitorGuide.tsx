import React from 'react';
import { Clock, MapPin, QrCode } from 'lucide-react';
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
          <span className="client-section-badge">
            {t('guide.badge', 'Chỉ Dẫn Tham Quan')}
          </span>
          <h2 className="client-section-title">
            {t('guide.headline', 'Hướng Dẫn Tham Quan Thực Địa')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'guide.sub',
              'Thông tin hữu ích giúp quý khách có một chuyến tham quan trọn vẹn tại bảo tàng.'
            )}
          </p>
        </div>

        {/* Lưới 3 cột chỉ dẫn thực tế */}
        <div className="client-guide-grid">
          {/* Card 1: Giờ mở cửa */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <Clock size={28} />
            </div>
            <h3 className="client-guide-card-title">
              {t('guide.hoursTitle', 'Giờ Mở Cửa & Vé')}
            </h3>
            <p className="client-guide-card-text">
              <strong>Thứ Ba - Chủ Nhật:</strong>
              <br />
              Sáng: 08:00 – 11:30 | Chiều: 13:30 – 17:00
              <br />
              <span style={{ fontSize: '0.84rem', color: 'var(--c-text-muted)', display: 'block', marginTop: 6 }}>
                (Bảo tàng đóng cửa bảo quản vào thứ Hai hàng tuần)
              </span>
            </p>
          </div>

          {/* Card 2: Địa điểm */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <MapPin size={28} />
            </div>
            <h3 className="client-guide-card-title">
              {t('guide.locationTitle', 'Địa Điểm & Chỉ Đường')}
            </h3>
            <p className="client-guide-card-text">
              {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
              <br />
              <span style={{ fontSize: '0.84rem', color: 'var(--c-text-muted)', display: 'block', marginTop: 6 }}>
                Hotline hỗ trợ: {branding.hotline || '(028) 3829 8146'}
              </span>
            </p>
          </div>

          {/* Card 3: Quét QR Standee */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <QrCode size={28} />
            </div>
            <h3 className="client-guide-card-title">
              {t('guide.qrTitle', 'Trải Nghiệm Số Tại Điểm')}
            </h3>
            <p className="client-guide-card-text">
              {t(
                'guide.qrText',
                'Quét mã QR tại bảng chú thích từng hiện vật để tương tác xoay 3D và nghe thuyết minh đa ngôn ngữ trực tiếp trên điện thoại của bạn.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
