import React, { useState, useRef, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  Shield,
  User,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Compass,
  Box,
  Layers,
  Info,
  Calendar,
  Landmark
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useAuth } from '../../context/AuthContext';

interface ClientNavbarProps {
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
  activeSection?: string;
  onNavigatePage?: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin,
  activeSection = 'hero',
  onNavigatePage
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, activeLanguages, changeLanguage, t } = useClientTranslation();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Hiệu ứng lắng nghe cuộn trang: Khi ở đỉnh trang (top = 0) menu đứng yên, khi cuộn nhẹ xuống sẽ giật nảy sang trái
  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(top > 25);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <nav className={`client-navbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="client-container client-nav-inner">
        {/* 1. Logo & Tên bảo tàng sang trọng chuẩn di sản */}
        <a
          href="#hero"
          className="client-nav-brand"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigatePage) {
              onNavigatePage('home');
            } else {
              scrollToSection('hero');
            }
          }}
        >
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.shortName} className="client-nav-logo" />
          ) : (
            <div className="client-nav-emblem" title={branding.shortName || 'Bảo tàng Lịch sử'}>
              <Landmark size={18} strokeWidth={1.75} className="client-nav-emblem-icon" />
            </div>
          )}
          <div className="client-nav-title-group">
            <span className="client-nav-title">{branding.shortName || 'Bảo tàng Lịch sử'}</span>
            <div className="client-nav-subtitle-row">
              <span className="client-nav-tagline">{branding.city || 'TP. HỒ CHÍ MINH'}</span>
              <span className="client-nav-dot">•</span>
              <span className="client-nav-badge">
                <span className="client-nav-pulse-dot" />
                <span>TOUR 360°</span>
              </span>
            </div>
          </div>
        </a>

        {/* 2. Menu Điều Hướng Dạng Viên Thuốc (Capsule Island Nav) Cực Kì Hiện Đại */}
        <div className={`client-nav-menu-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
          <ul className="client-nav-menu">
            <li>
              <a
                href="#intro"
                className={`client-nav-link ${activeSection === 'intro' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigatePage) {
                    onNavigatePage('home');
                    setTimeout(() => scrollToSection('intro'), 100);
                  } else {
                    scrollToSection('intro');
                  }
                }}
              >
                {t('nav.intro', 'Giới thiệu')}
              </a>
            </li>
            <li>
              <a
                href="#rooms"
                className={`client-nav-link ${activeSection === 'rooms' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigatePage) {
                    onNavigatePage('rooms');
                  } else {
                    scrollToSection('rooms');
                  }
                }}
              >
                {t('nav.rooms360', 'Gian phòng 360°')}
              </a>
            </li>
            <li>
              <a
                href="#artifacts"
                className={`client-nav-link ${activeSection === 'artifacts' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigatePage) {
                    onNavigatePage('artifacts');
                  } else {
                    scrollToSection('artifacts');
                  }
                }}
              >
                {t('nav.artifacts3d', 'Cổ vật 3D')}
              </a>
            </li>
            <li>
              <a
                href="#guide"
                className={`client-nav-link ${activeSection === 'guide' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigatePage) {
                    onNavigatePage('guide');
                  } else {
                    scrollToSection('guide');
                  }
                }}
              >
                {t('nav.guide', 'Tham quan')}
              </a>
            </li>
          </ul>
        </div>

        {/* Cụm hành động bên phải: Ngôn ngữ, Đổi Theme, Đăng nhập */}
        <div className="client-nav-actions">
          {/* Bộ chọn ngôn ngữ */}
          <div style={{ position: 'relative' }} ref={langDropdownRef}>
            <button
              type="button"
              className="client-theme-toggle"
              style={{ width: 'auto', padding: '0 12px', gap: 6, fontSize: '0.84rem' }}
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              aria-label="Chọn ngôn ngữ"
            >
              <span style={{ fontSize: '15px' }}>{currentLangObj.flagIcon}</span>
              <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{currentLangObj.code}</span>
            </button>

            {isLangDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 170,
                  background: 'var(--c-bg-card)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--c-radius-md)',
                  boxShadow: 'var(--c-shadow-lg)',
                  padding: 6,
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3
                }}
              >
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 'var(--c-radius-sm)',
                      background: lang.code === currentLang ? 'var(--c-gold-light)' : 'transparent',
                      color: lang.code === currentLang ? 'var(--c-gold)' : 'var(--c-text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      fontWeight: lang.code === currentLang ? 700 : 500,
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <span>{lang.flagIcon}</span>
                    <span>{lang.nativeName || lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút chuyển đổi Light / Dark Theme */}
          <button
            type="button"
            className="client-theme-toggle"
            onClick={onToggleClientTheme}
            title={clientTheme === 'light' ? 'Chuyển sang chế độ ban đêm' : 'Chuyển sang chế độ ban ngày'}
            aria-label="Chuyển chế độ sáng tối"
          >
            {clientTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Đăng nhập hoặc Menu người dùng (Thiết kế capsule thu gọn thông minh) */}
          {user ? (
            <div className="client-user-menu" ref={userDropdownRef}>
              <button
                type="button"
                className="client-user-btn"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                title={user.fullName || user.username}
              >
                <div className="client-user-avatar">
                  {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                </div>
                <span className="client-user-name">
                  {user.role === 'admin'
                    ? 'Quản trị viên'
                    : (user.fullName?.split(' ').pop() || user.username || 'Tài khoản')}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: 2 }}>▼</span>
              </button>

              {isUserDropdownOpen && (
                <div className="client-user-dropdown">
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--c-border-subtle)', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--c-text-primary)' }}>
                      {user.fullName || user.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: 2 }}>
                      {user.email}
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      className="client-user-dropdown-item"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onNavigateAdmin();
                      }}
                    >
                      <Shield size={15} style={{ color: 'var(--c-primary)' }} />
                      <span style={{ fontWeight: 600 }}>Cổng Quản Trị Hệ Thống</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="client-user-dropdown-item"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="client-nav-login-btn"
              onClick={onOpenLoginModal}
            >
              <LogIn size={16} />
              <span>{t('auth.login', 'Đăng nhập')}</span>
            </button>
          )}

          {/* Nút Toggle Mobile Drawer */}
          <button
            type="button"
            className="client-nav-mobile-toggle"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            background: 'var(--c-bg-card)',
            borderBottom: '1px solid var(--c-border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          <a
            href="#intro"
            className="client-nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('intro');
            }}
          >
            {t('nav.intro', 'Giới thiệu')}
          </a>
          <a
            href="#rooms"
            className="client-nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('rooms');
            }}
          >
            {t('nav.rooms360', 'Gian phòng 360°')}
          </a>
          <a
            href="#artifacts"
            className="client-nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('artifacts');
            }}
          >
            {t('nav.artifacts3d', 'Cổ vật 3D')}
          </a>

          <a
            href="#guide"
            className="client-nav-link"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('guide');
            }}
          >
            {t('nav.guide', 'Tham quan')}
          </a>

          {!user && (
            <button
              type="button"
              className="client-nav-login-btn"
              style={{ marginTop: 8, justifyContent: 'center', width: '100%' }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLoginModal();
              }}
            >
              <LogIn size={16} />
              <span>{t('auth.login', 'Đăng nhập')}</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
