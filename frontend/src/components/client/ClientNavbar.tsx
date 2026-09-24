import React, { useState } from 'react';
import {
  Compass,
  Box,
  Layers,
  Info,
  Calendar,
  Lock,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  Landmark
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useTheme } from '../../context/ThemeContext';

interface ClientNavbarProps {
  onNavigateAdmin: () => void;
  onSelectRoom?: (roomCode: string) => void;
  activeSection?: string;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
  onNavigateAdmin,
  activeSection = 'hero'
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, activeLanguages, changeLanguage, t } = useClientTranslation();
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentLangObj = activeLanguages.find((l) => l.code === currentLang) || {
    code: 'vi',
    name: 'Tiếng Việt',
    flagIcon: '🇻🇳'
  };

  return (
    <nav className="client-navbar">
      <div className="client-container client-navbar-inner">
        {/* Brand Logo & Name */}
        <a href="#hero" className="client-brand" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.shortName} className="client-brand-logo" />
          ) : (
            <div className="client-brand-emblem">
              <span>{branding.emblemText || 'BT'}</span>
            </div>
          )}
          <div className="client-brand-text">
            <span className="client-brand-name">{branding.shortName || 'Bảo tàng Lịch sử'}</span>
            <span className="client-brand-sub">{branding.tagline || 'Tour 360 & Di sản số'}</span>
          </div>
        </a>

        {/* Navigation Menu (Desktop) */}
        <ul className="client-nav-links">
          <li>
            <a
              href="#hero"
              className={`client-nav-link ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
            >
              {t('nav.home', 'Trang chủ')}
            </a>
          </li>
          <li>
            <a
              href="#rooms"
              className={`client-nav-link ${activeSection === 'rooms' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('rooms'); }}
            >
              {t('nav.rooms360', 'Tham quan 360°')}
            </a>
          </li>
          <li>
            <a
              href="#artifacts"
              className={`client-nav-link ${activeSection === 'artifacts' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('artifacts'); }}
            >
              {t('nav.artifacts3d', 'Cổ vật di sản 3D')}
            </a>
          </li>
          <li>
            <a
              href="#topics"
              className={`client-nav-link ${activeSection === 'topics' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('topics'); }}
            >
              {t('nav.exhibitions', 'Chuyên đề lịch sử')}
            </a>
          </li>
          <li>
            <a
              href="#guide"
              className={`client-nav-link ${activeSection === 'guide' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('guide'); }}
            >
              {t('nav.visitorGuide', 'Hướng dẫn tham quan')}
            </a>
          </li>
        </ul>

        {/* Actions Group (Language + Theme + Admin Link) */}
        <div className="client-nav-actions">
          {/* Bộ chọn Đa Ngôn Ngữ */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="client-btn-admin"
              style={{ gap: 6, padding: '6px 12px' }}
              title="Chọn ngôn ngữ hiển thị"
            >
              <span style={{ fontSize: '14px' }}>{currentLangObj.flagIcon || '🌐'}</span>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{currentLang.toUpperCase()}</span>
            </button>

            {isLangDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 6,
                  minWidth: 160,
                  zIndex: 1100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: currentLang === lang.code ? 'rgba(140, 45, 25, 0.1)' : 'transparent',
                      color: currentLang === lang.code ? 'var(--primary)' : 'var(--text-main)',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: currentLang === lang.code ? 600 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <span>{lang.flagIcon || '🌐'}</span>
                    <span>{lang.nativeName || lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Đổi Dark / Light mode */}
          <button
            type="button"
            className="client-btn-admin"
            onClick={toggleTheme}
            style={{ padding: '7px 10px' }}
            title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {theme === 'dark' ? <Sun size={15} style={{ color: 'var(--accent-gold)' }} /> : <Moon size={15} />}
          </button>

          {/* Nút Cổng Quản Trị Admin */}
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="client-btn-admin"
            title="Đăng nhập ban quản lý bảo tàng"
          >
            <Lock size={14} />
            <span>{t('nav.adminPortal', 'Cổng Quản Trị')}</span>
          </button>

          {/* Nút Hamburger menu Mobile */}
          <button
            type="button"
            className="client-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="client-mobile-drawer">
          <a
            href="#hero"
            className="client-mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
          >
            {t('nav.home', 'Trang chủ')}
          </a>
          <a
            href="#rooms"
            className="client-mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('rooms'); }}
          >
            {t('nav.rooms360', 'Tham quan 360°')}
          </a>
          <a
            href="#artifacts"
            className="client-mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('artifacts'); }}
          >
            {t('nav.artifacts3d', 'Cổ vật di sản 3D')}
          </a>
          <a
            href="#topics"
            className="client-mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('topics'); }}
          >
            {t('nav.exhibitions', 'Chuyên đề lịch sử')}
          </a>
          <a
            href="#guide"
            className="client-mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('guide'); }}
          >
            {t('nav.visitorGuide', 'Hướng dẫn tham quan')}
          </a>

          <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Lock size={15} />
              <span>{t('nav.adminPortal', 'Cổng Quản Trị Bảo Tàng')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
