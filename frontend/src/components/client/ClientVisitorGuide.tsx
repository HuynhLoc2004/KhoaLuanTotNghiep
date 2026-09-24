import React from 'react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ArrowUpRight } from 'lucide-react';

interface ClientVisitorGuideProps {
  onViewAllGuide?: () => void;
}

export const ClientVisitorGuide: React.FC<ClientVisitorGuideProps> = ({ onViewAllGuide }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  return (
    <section id="guide" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG 4: NẰM BÊN TRÁI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card align-left reveal-on-scroll">
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('guide.tag', 'Kế Hoạch Tham Quan')}
            </span>

            <h2 className="client-zigzag-title">
              {t('guide.headline', 'Hướng Dẫn Khách Tham Quan Thực Địa')}
            </h2>

            <div className="client-zigzag-guide-cards">
              {/* Giờ mở cửa */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Thời gian mở cửa đón khách</span>
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

              {/* Vé tham quan */}
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

              {/* Trải nghiệm Quét mã QR */}
              <div className="client-zigzag-guide-item">
                <div className="client-zigzag-guide-header">
                  <span className="client-zigzag-guide-label">Trải nghiệm quét mã QR tại điểm</span>
                </div>
                <p className="client-zigzag-desc" style={{ margin: '4px 0 10px 0', fontSize: '0.84rem' }}>
                  Dùng camera điện thoại quét mã QR cạnh chú thích mỗi hiện vật để xem mô hình 3D và nghe thuyết minh bản ngữ.
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branding.address || 'Bảo tàng Lịch sử TP. Hồ Chí Minh, 2 Nguyễn Bỉnh Khiêm, Quận 1')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-zigzag-btn-primary"
                  style={{ textDecoration: 'none', width: 'fit-content', marginTop: 6 }}
                >
                  <span>Chỉ đường trên Google Maps</span>
                  <ArrowUpRight size={15} />
                </a>
              </div>
            </div>

            {onViewAllGuide && (
              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onViewAllGuide}
                >
                  <span>{t('guide.btnViewAll', 'Xem cẩm nang tham quan đầy đủ')}</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
