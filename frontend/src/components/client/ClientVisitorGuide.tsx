import React from 'react';
import { Clock, MapPin, QrCode, Smartphone, Ticket, Compass, Navigation, Headphones, CheckCircle2 } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientVisitorGuide: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="guide" className="client-section client-section-alt client-guide-section">
      <div className="client-container">
        {/* Tiêu đề Khối Hướng Dẫn Tham Quan */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('guide.tag', 'Lên Kế Hoạch Tham Quan Thực Địa')}
          </span>
          <h2 className="client-section-title">
            {t('guide.headline', 'Cẩm Nang Tham Quan & Trải Nghiệm Tương Tác')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'guide.sub',
              'Thông tin chi tiết về lịch mở cửa, biểu phí niêm yết, chỉ dẫn đường đi và công nghệ quét mã QR số hóa tại không gian bảo tàng.'
            )}
          </p>
        </div>

        {/* BỐ CỤC CHIA ĐÔI: CỘT THÔNG TIN THỰC ĐỊA & CỘT CÔNG NGHỆ QR STANDEE */}
        <div className="client-visit-grid">
          {/* CỘT TRÁI: THỜI GIAN, GIÁ VÉ & ĐỊA ĐIỂM */}
          <div className="client-visit-info-stack">
            {/* Card 1: Giờ mở cửa */}
            <div className="client-visit-card">
              <div className="client-visit-card-icon">
                <Clock size={24} />
              </div>
              <div className="client-visit-card-body">
                <div className="client-visit-card-header">
                  <h3 className="client-visit-card-title">
                    {t('guide.hoursTitle', 'Thời Gian Mở Cửa & Đón Khách')}
                  </h3>
                  <span className="client-visit-status-pill open">Thứ Ba — Chủ Nhật</span>
                </div>
                <div className="client-visit-time-slots">
                  <div className="client-visit-slot">
                    <span className="client-visit-slot-label">Buổi sáng:</span>
                    <span className="client-visit-slot-time">08:00 – 11:30</span>
                  </div>
                  <div className="client-visit-slot-divider" />
                  <div className="client-visit-slot">
                    <span className="client-visit-slot-label">Buổi chiều:</span>
                    <span className="client-visit-slot-time">13:30 – 17:00</span>
                  </div>
                </div>
                <p className="client-visit-card-note">
                  * Bảo tàng đóng cửa vào các ngày Thứ Hai hàng tuần để phục vụ công tác vệ sinh, bảo quản và tu bổ cổ vật định kỳ.
                </p>
              </div>
            </div>

            {/* Card 2: Biểu phí vé & Ưu đãi */}
            <div className="client-visit-card">
              <div className="client-visit-card-icon">
                <Ticket size={24} />
              </div>
              <div className="client-visit-card-body">
                <div className="client-visit-card-header">
                  <h3 className="client-visit-card-title">
                    {t('guide.ticketTitle', 'Biểu Phí Vé Tham Quan Niêm Yết')}
                  </h3>
                  <span className="client-visit-status-pill">Quy chuẩn Nhà Nước</span>
                </div>
                <div className="client-visit-ticket-grid">
                  <div className="client-visit-ticket-item">
                    <span className="client-visit-ticket-type">Khách người lớn</span>
                    <span className="client-visit-ticket-price">30.000 VNĐ</span>
                  </div>
                  <div className="client-visit-ticket-item">
                    <span className="client-visit-ticket-type">Học sinh, sinh viên, người cao tuổi</span>
                    <span className="client-visit-ticket-price highlight">Miễn phí / Ưu đãi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Địa điểm & Hotline */}
            <div className="client-visit-card">
              <div className="client-visit-card-icon">
                <MapPin size={24} />
              </div>
              <div className="client-visit-card-body">
                <div className="client-visit-card-header">
                  <h3 className="client-visit-card-title">
                    {t('guide.locationTitle', 'Địa Chỉ & Thông Tin Liên Hệ')}
                  </h3>
                </div>
                <p className="client-visit-address-line">
                  {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
                </p>
                <div className="client-visit-contact-row">
                  <span><strong>Đường dây nóng:</strong> {branding.hotline || '(028) 3829 8146'}</span>
                  <span>•</span>
                  <span><strong>Email:</strong> {branding.contactEmail || 'btls.tphcm@gmail.com'}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding.address || 'Bảo tàng Lịch sử TP. Hồ Chí Minh, 2 Nguyễn Bỉnh Khiêm, Quận 1')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-visit-map-link"
                >
                  <Navigation size={14} />
                  <span>Mở chỉ đường trên Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TRẢI NGHIỆM QR STANDEE SỐ HÓA */}
          <div className="client-standee-showcase">
            <div className="client-standee-top-badge">
              <Compass size={14} />
              <span>Công Nghệ Du Lịch Số Hóa 4.0</span>
            </div>

            <div className="client-standee-qr-icon-wrap">
              <QrCode size={40} />
            </div>

            <h3 className="client-standee-title">
              {t('guide.qrTitle', 'Trải Nghiệm Quét Mã QR Standee Tại Điểm')}
            </h3>

            <p className="client-standee-desc">
              {t(
                'guide.qrDesc',
                'Khi ghé thăm trực tiếp bảo tàng, quý khách chỉ cần dùng camera điện thoại thông thường để quét mã QR gắn tại bảng chú thích của mỗi bảo vật để mở ngay mô hình 3D và lắng nghe thuyết minh bản ngữ.'
              )}
            </p>

            {/* 3 Bước trải nghiệm trực quan */}
            <div className="client-standee-steps">
              <div className="client-standee-step">
                <div className="client-standee-step-num">1</div>
                <div className="client-standee-step-text">
                  <strong>Hướng camera</strong> quét mã QR gắn cạnh hiện vật
                </div>
              </div>
              <div className="client-standee-step">
                <div className="client-standee-step-num">2</div>
                <div className="client-standee-step-text">
                  <strong>Xoay 3D đa chiều</strong> chiêm ngưỡng chi tiết không cần cài app
                </div>
              </div>
              <div className="client-standee-step">
                <div className="client-standee-step-num">3</div>
                <div className="client-standee-step-text">
                  <strong>Lắng nghe thuyết minh</strong> tự động theo ngôn ngữ của bạn
                </div>
              </div>
            </div>

            <div className="client-standee-feature-pill">
              <Smartphone size={16} />
              <span>Tương thích 100% mọi dòng máy iOS & Android • Tải trang 0ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
