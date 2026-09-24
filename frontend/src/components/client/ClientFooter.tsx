import React from 'react';
import { ArrowUp } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFooterProps {
  onNavigatePage?: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
}

export const ClientFooter: React.FC<ClientFooterProps> = ({ onNavigatePage }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (page: 'home' | 'rooms' | 'artifacts' | 'guide', hashTarget?: string) => {
    if (onNavigatePage) {
      onNavigatePage(page);
    }
    if (hashTarget) {
      setTimeout(() => {
        const el = document.getElementById(hashTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Đồng bộ danh mục liên kết động từ cấu hình Menu của Admin CMS (nếu có)
  const dynamicMenuItems = (branding.headerMenuItems || []).filter((item) => item.active !== false);

  return (
    <footer className="client-footer">
      <div className="client-container">
        <div className="client-footer-grid">
          {/* Cột 1: Thông tin bảo tàng & Nhận diện thương hiệu đồng bộ */}
          <div className="client-footer-brand-col">
            <div className="client-footer-brand-header">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.shortName || branding.museumName}
                  className="client-footer-logo"
                />
              ) : (
                <div className="client-footer-emblem" title={branding.shortName || 'Bảo tàng Lịch sử'}>
                  <span>{branding.emblemText || 'BT'}</span>
                </div>
              )}
              <h3 className="client-footer-brand-title">
                {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}
              </h3>
            </div>

            <p className="client-footer-brand-desc">
              {branding.tagline ||
                'Bảo tồn và lan tỏa các giá trị di sản lịch sử văn hóa dân tộc thông qua trải nghiệm thực tế ảo 360° và số hóa hiện vật tương tác.'}
            </p>
          </div>

          {/* Cột 2: Khám phá di sản ảo (Đồng bộ động từ Menu Admin) */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.explore', 'Khám Phá Di Sản')}</h4>
            <ul className="client-footer-links">
              {dynamicMenuItems.length > 0 ? (
                dynamicMenuItems.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.linkType === 'custom' ? item.target : `#${item.target}`}
                      className="client-footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.linkType === 'custom') {
                          window.open(item.target, item.isNewTab ? '_blank' : '_self');
                        } else if (item.linkType === 'page') {
                          handleNav(item.target as any);
                        } else {
                          handleNav('home', item.target);
                        }
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <a
                      href="#hero"
                      className="client-footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('home', 'hero');
                      }}
                    >
                      {t('nav.home', 'Trang chủ di sản')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#rooms"
                      className="client-footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('rooms', 'rooms');
                      }}
                    >
                      {t('nav.rooms360', 'Gian phòng trưng bày 360°')}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#artifacts"
                      className="client-footer-link"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNav('artifacts', 'artifacts');
                      }}
                    >
                      {t('nav.artifacts3d', 'Kho tàng cổ vật 3D')}
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Cột 3: Kế hoạch tham quan */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.guide', 'Kế Hoạch Tham Quan')}</h4>
            <ul className="client-footer-links">
              <li>
                <a
                  href="#guide"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('guide', 'guide');
                  }}
                >
                  {t('guide.hoursAndTickets', 'Thời gian mở cửa & Biểu phí')}
                </a>
              </li>
              <li>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    branding.address || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-footer-link"
                >
                  {t('guide.mapDirections', 'Bản đồ vị trí thực địa')}
                </a>
              </li>
              <li>
                <a
                  href="#intro"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav('home', 'intro');
                  }}
                >
                  {t('nav.intro', 'Kiến trúc & Lịch sử hình thành')}
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin liên hệ thực tế (Đồng bộ 100% từ cấu hình Admin) */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.contact', 'Liên Hệ Trực Tiếp')}</h4>
            <ul className="client-footer-links">
              <li className="client-footer-contact-item">
                <span className="client-footer-contact-lbl">Địa chỉ:</span>
                <span className="client-footer-contact-val">
                  {branding.address ? branding.address : 'Chưa bổ sung'}
                </span>
              </li>
              <li className="client-footer-contact-item">
                <span className="client-footer-contact-lbl">Điện thoại:</span>
                <span className="client-footer-contact-val">
                  {branding.hotline ? branding.hotline : 'Chưa bổ sung'}
                </span>
              </li>
              <li className="client-footer-contact-item">
                <span className="client-footer-contact-lbl">Thư điện tử:</span>
                <span className="client-footer-contact-val">
                  {branding.contactEmail ? (
                    <a
                      href={`mailto:${branding.contactEmail}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#D4AF37'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
                    >
                      {branding.contactEmail}
                    </a>
                  ) : (
                    'Chưa bổ sung'
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh chân trang & Nút cuộn lên đầu */}
        <div className="client-footer-bottom">
          <div className="client-footer-copyright">
            &copy; {new Date().getFullYear()} {branding.footerCopyrightText ? branding.footerCopyrightText : `${branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}. Tất cả quyền được bảo lưu.`}
          </div>

          <button
            type="button"
            className="client-footer-scroll-top"
            onClick={scrollToTop}
            title={t('footer.scrollToTop', 'Về đầu trang')}
            aria-label={t('footer.scrollToTop', 'Về đầu trang')}
          >
            <span>{t('footer.top', 'Đầu trang')}</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
