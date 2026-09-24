import React from 'react';
import { Landmark, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const ClientFooter: React.FC = () => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="client-footer">
      <div className="client-container">
        <div className="client-footer-grid">
          {/* Cột 1: Thông tin bảo tàng */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.shortName}
                  style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 6 }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--c-primary)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontFamily: 'serif'
                  }}
                >
                  {branding.emblemText || 'BT'}
                </div>
              )}
              <h3 className="client-footer-brand-title" style={{ margin: 0 }}>
                {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}
              </h3>
            </div>

            <p className="client-footer-brand-desc">
              {branding.tagline ||
                'Hệ thống không gian Tour 360° và số hóa cổ vật di sản văn hóa, kết nối tinh hoa quá khứ cùng công nghệ hiện đại.'}
            </p>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.explore', 'Khám Phá')}</h4>
            <ul className="client-footer-links">
              <li>
                <a
                  href="#hero"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('hero');
                  }}
                >
                  {t('nav.home', 'Trang chủ')}
                </a>
              </li>
              <li>
                <a
                  href="#intro"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('intro');
                  }}
                >
                  {t('nav.intro', 'Giới thiệu di sản')}
                </a>
              </li>
              <li>
                <a
                  href="#rooms"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('rooms');
                  }}
                >
                  {t('nav.rooms360', 'Gian phòng 360°')}
                </a>
              </li>
              <li>
                <a
                  href="#artifacts"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('artifacts');
                  }}
                >
                  {t('nav.artifacts3d', 'Cổ vật di sản 3D')}
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Trải nghiệm & Hướng dẫn */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.guide', 'Hướng Dẫn')}</h4>
            <ul className="client-footer-links">
              <li>
                <a
                  href="#topics"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('topics');
                  }}
                >
                  {t('nav.topics', 'Chuyên đề lịch sử')}
                </a>
              </li>
              <li>
                <a
                  href="#guide"
                  className="client-footer-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('guide');
                  }}
                >
                  {t('nav.guide', 'Giờ mở cửa & Vé')}
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="client-footer-col-title">{t('footer.contact', 'Liên Hệ')}</h4>
            <ul className="client-footer-links">
              <li style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <MapPin size={15} style={{ color: 'var(--c-gold)', flexShrink: 0, marginTop: 3 }} />
                <span>{branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Q.1, TP.HCM'}</span>
              </li>
              <li style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <Phone size={15} style={{ color: 'var(--c-gold)', flexShrink: 0, marginTop: 3 }} />
                <span>{branding.hotline || '(028) 3829 8146'}</span>
              </li>
              <li style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <Mail size={15} style={{ color: 'var(--c-gold)', flexShrink: 0, marginTop: 3 }} />
                <span>{branding.contactEmail || 'huynhtanlocpp09@gmail.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Thanh bản quyền & Nút cuộn lên đầu */}
        <div className="client-footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}. Tất cả quyền được bảo lưu.
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#A8A29E',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};
