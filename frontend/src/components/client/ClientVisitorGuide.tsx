import React from 'react';
import {
  Clock,
  MapPin,
  QrCode,
  Phone,
  Mail,
  HelpCircle,
  Bus,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientVisitorGuide: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="guide" className="client-section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="client-container">
        <div className="client-section-header">
          <span className="client-section-badge">
            <Info size={13} />
            <span>{t('guide.badge', 'Thông tin thực tế')}</span>
          </span>
          <h2 className="client-section-title">
            {t('guide.title', 'Hướng dẫn tham quan & Trải nghiệm')}
          </h2>
          <p className="client-section-desc">
            {t(
              'guide.desc',
              'Các thông tin hữu ích giúp quý khách có một chuyến tham quan di sản trọn vẹn, từ trải nghiệm thực địa tại bảo tàng đến công nghệ số trực tuyến.'
            )}
          </p>
        </div>

        <div className="client-guide-grid">
          {/* Card 1: Giờ mở cửa */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <Clock size={22} />
            </div>
            <h3 className="client-guide-title">{t('guide.hoursTitle', 'Giờ mở cửa đón khách')}</h3>
            <div className="client-guide-content">
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Thứ Ba đến Chủ Nhật:</strong>
                <br />
                • Buổi sáng: 08:00 – 11:30
                <br />
                • Buổi chiều: 13:00 – 17:00
              </p>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--accent-gold)' }}>
                <em>* Mở cửa phục vụ tất cả các ngày Lễ, Tết trong năm. Thứ Hai bảo trì định kỳ.</em>
              </p>
            </div>
          </div>

          {/* Card 2: Địa chỉ & Di chuyển */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <MapPin size={22} />
            </div>
            <h3 className="client-guide-title">{t('guide.locationTitle', 'Địa điểm & Tuyến đường')}</h3>
            <div className="client-guide-content">
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>{branding.museumName || 'Bảo tàng Lịch sử'}</strong>
                <br />
                {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bus size={13} style={{ color: 'var(--primary)' }} />
                  <span>Tuyến xe buýt: 05, 06, 14, 19, 52 (Dừng tại Thảo Cầm Viên)</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} style={{ color: 'var(--primary)' }} />
                  <span>Hotline: {branding.hotline || '(028) 3829 8146'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Tiện ích Số & Thẻ Standee QR */}
          <div className="client-guide-card">
            <div className="client-guide-icon-wrap">
              <QrCode size={22} />
            </div>
            <h3 className="client-guide-title">{t('guide.qrTitle', 'Trải nghiệm số hóa với QR')}</h3>
            <div className="client-guide-content">
              <p style={{ margin: '0 0 10px 0' }}>
                Mỗi cổ vật tại các phòng trưng bày đều được gắn thẻ thông minh có mã QR di sản.
              </p>
              <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Dùng camera điện thoại quét mã QR để mở trang chi tiết tức thì.</li>
                <li>Xoay mô hình 3D đa góc nhìn mà không cần chạm hiện vật thật.</li>
                <li>Nghe thuyết minh audio với ngôn ngữ tự chọn mà không cần thuê máy.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
