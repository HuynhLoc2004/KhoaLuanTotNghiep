import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ArrowUpRight } from 'lucide-react';

export const ClientVisitorGuide: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="guide" className="client-section client-section-alt client-zigzag-section reveal-on-scroll">
      <div className="client-container">
        {/* ZIG-ZAG: THỜI GIAN & VÉ BÊN TRÁI, TRẢI NGHIỆM QR & BẢN ĐỒ BÊN PHẢI */}
        <div className="client-zigzag-grid">
          {/* CỘT TRÁI: THỜI GIAN MỞ CỬA, BIỂU PHÍ VÉ, ĐỊA CHỈ */}
          <div className="client-zigzag-content">
            <span className="client-zigzag-tag">
              {t('guide.tag', 'Kế Hoạch Tham Quan')}
            </span>

            <h2 className="client-zigzag-title">
              {t('guide.headline', 'Hướng Dẫn Khách Tham Quan Thực Địa')}
            </h2>

            <div className="client-zigzag-guide-cards">
              {/* Thẻ Giờ mở cửa */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Thời gian mở cửa</span>
                  <span className="client-zigzag-guide-badge">Thứ Ba – Chủ Nhật</span>
                </div>
                <div className="client-zigzag-guide-time">
                  <span>Sáng: 08:00 – 11:30</span>
                  <span className="client-zigzag-guide-dot">•</span>
                  <span>Chiều: 13:30 – 17:00</span>
                </div>
                <div className="client-zigzag-guide-sub">
                  * Đóng cửa vào Thứ Hai hàng tuần để bảo dưỡng cổ vật
                </div>
              </div>

              {/* Thẻ Vé tham quan */}
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

              {/* Địa chỉ & Hotline */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Địa chỉ & Liên hệ</span>
                </div>
                <div className="client-zigzag-guide-address">
                  {branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}
                </div>
                <div className="client-zigzag-guide-hotline">
                  Đường dây nóng: <strong>{branding.hotline || '(028) 3829 8146'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: QUÉT MÃ QR TẠI ĐIỂM & CHỈ ĐƯỜNG */}
          <div className="client-zigzag-media">
            <div className="client-zigzag-qr-box">
              <span className="client-zigzag-tag" style={{ marginBottom: 8 }}>
                Công Nghệ Số Hóa 4.0
              </span>

              <h3 className="client-zigzag-qr-title">
                Trải Nghiệm Quét Mã QR Tại Bảo Tàng
              </h3>

              <p className="client-zigzag-qr-desc">
                Khi đến bảo tàng, chỉ cần mở camera điện thoại quét mã QR tại chân mỗi cổ vật để xem mô hình 3D và nghe thuyết minh bản ngữ tự động.
              </p>

              {/* 3 Bước tinh giản */}
              <div className="client-zigzag-qr-steps">
                <div className="client-zigzag-qr-step">
                  <span className="client-zigzag-qr-num">1</span>
                  <span>Hướng camera quét mã QR cạnh hiện vật</span>
                </div>
                <div className="client-zigzag-qr-step">
                  <span className="client-zigzag-qr-num">2</span>
                  <span>Chiêm ngưỡng mô hình 3D xoay 360° trực tiếp</span>
                </div>
                <div className="client-zigzag-qr-step">
                  <span className="client-zigzag-qr-num">3</span>
                  <span>Nghe giọng đọc thuyết minh theo ngôn ngữ của bạn</span>
                </div>
              </div>

              {/* Nút mở Google Maps */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding.address || 'Bảo tàng Lịch sử TP. Hồ Chí Minh, 2 Nguyễn Bỉnh Khiêm, Quận 1')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="client-zigzag-btn-primary"
                style={{ textDecoration: 'none', marginTop: 14 }}
              >
                <span>Mở chỉ đường trên Google Maps</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
