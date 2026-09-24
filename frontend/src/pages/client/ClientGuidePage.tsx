import React from 'react';
import { ArrowLeft, Clock, Ticket, MapPin, QrCode, Phone, ArrowUpRight, ShieldCheck, Info } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientGuidePageProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
}

export const ClientGuidePage: React.FC<ClientGuidePageProps> = ({
  onNavigateHome,
  onNavigatePage,
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const address = branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';
  const hotline = branding.hotline || '(028) 3829 8146';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="client-portal" data-client-theme={clientTheme}>
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={onToggleClientTheme}
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="guide"
        onNavigatePage={onNavigatePage}
      />

      <main className="client-subpage">
        <div className="client-container">
          {/* Breadcrumb & Header */}
          <div className="client-subpage-hero">
            <div className="client-subpage-breadcrumb">
              <button
                type="button"
                className="client-breadcrumb-btn"
                onClick={onNavigateHome}
              >
                <ArrowLeft size={14} />
                <span>{t('nav.home', 'Trang chủ')}</span>
              </button>
              <span className="client-breadcrumb-sep">/</span>
              <span className="client-breadcrumb-current">
                {t('guide.pageTitle', 'Hướng dẫn tham quan')}
              </span>
            </div>

            <span className="client-zigzag-tag">
              {t('guide.tag', 'Cẩm Nang Khách Tham Quan')}
            </span>

            <h1 className="client-subpage-title">
              {t('guide.pageHeading', 'Hướng Dẫn Khách Tham Quan Thực Địa')}
            </h1>

            <p className="client-subpage-lead">
              {t(
                'guide.pageLead',
                'Kế hoạch tham quan hoàn chỉnh bao gồm thời gian mở cửa, biểu phí vé niêm yết, chỉ dẫn đường đi và tiện ích trải nghiệm quét mã QR tương tác tại mỗi gian trưng bày.'
              )}
            </p>
          </div>

          {/* Lưới các khối thông tin hướng dẫn */}
          <div className="client-guide-grid">
            {/* 1. Giờ mở cửa */}
            <div className="client-guide-card">
              <div className="client-guide-icon-box">
                <Clock size={24} />
              </div>
              <h2 className="client-guide-card-title">Thời Gian Mở Cửa</h2>
              <div className="client-guide-badge" style={{ marginBottom: 12 }}>
                Thứ Ba – Chủ Nhật hàng tuần
              </div>
              <ul className="client-guide-list">
                <li>
                  <strong>Buổi Sáng:</strong> 08:00 – 11:30
                </li>
                <li>
                  <strong>Buổi Chiều:</strong> 13:30 – 17:00
                </li>
              </ul>
              <p className="client-guide-note">
                * Bảo tàng đóng cửa vào các ngày Thứ Hai để thực hiện công tác bảo tồn, vệ sinh cổ vật và bảo dưỡng hệ thống kỹ thuật.
              </p>
            </div>

            {/* 2. Biểu phí vé */}
            <div className="client-guide-card">
              <div className="client-guide-icon-box">
                <Ticket size={24} />
              </div>
              <h2 className="client-guide-card-title">Biểu Phí Vé Tham Quan</h2>
              <div className="client-guide-tickets-table">
                <div className="client-zigzag-ticket-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                  <span>Khách người lớn (công dân VN & quốc tế)</span>
                  <strong>30.000 VNĐ / vé</strong>
                </div>
                <div className="client-zigzag-ticket-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                  <span>Học sinh, sinh viên, người cao tuổi</span>
                  <strong className="highlight">Miễn phí / Ưu đãi 50%</strong>
                </div>
                <div className="client-zigzag-ticket-row" style={{ padding: '8px 0' }}>
                  <span>Trẻ em dưới 6 tuổi, người khuyết tật</span>
                  <strong className="highlight">Miễn phí hoàn toàn</strong>
                </div>
              </div>
            </div>

            {/* 3. Địa chỉ & Chỉ đường */}
            <div className="client-guide-card">
              <div className="client-guide-icon-box">
                <MapPin size={24} />
              </div>
              <h2 className="client-guide-card-title">Địa Chỉ & Liên Hệ</h2>
              <p style={{ margin: '8px 0 14px 0', color: 'var(--c-text-secondary)', fontSize: '0.92rem' }}>
                {address}
              </p>
              <div style={{ marginBottom: 16, fontSize: '0.88rem', color: 'var(--c-text-muted)' }}>
                Đường dây nóng hỗ trợ: <strong style={{ color: 'var(--c-text-primary)' }}>{hotline}</strong>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="client-zigzag-btn-primary"
                style={{ textDecoration: 'none', width: 'fit-content' }}
              >
                <span>Chỉ đường trên Google Maps</span>
                <ArrowUpRight size={15} />
              </a>
            </div>

            {/* 4. Trải nghiệm Quét mã QR */}
            <div className="client-guide-card">
              <div className="client-guide-icon-box">
                <QrCode size={24} />
              </div>
              <h2 className="client-guide-card-title">Trải Nghiệm QR Tại Điểm</h2>
              <p style={{ margin: '8px 0 14px 0', color: 'var(--c-text-secondary)', fontSize: '0.92rem' }}>
                Mỗi hiện vật và tủ kính trong bảo tàng đều được gắn một bảng chú thích kèm mã QR độc bản.
              </p>
              <ul className="client-guide-list">
                <li>Dùng điện thoại quét mã QR để mở mô hình 3D trên màn hình.</li>
                <li>Nghe thuyết minh âm thanh đa ngôn ngữ tự động (Audio Guide).</li>
                <li>Khám phá nguồn gốc, thời kỳ và giá trị văn hóa chi tiết.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  );
};
