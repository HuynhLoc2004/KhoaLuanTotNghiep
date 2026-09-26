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
  Landmark,
  QrCode,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useSystemBranding, DEFAULT_HEADER_MENU } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { useAuth } from '../../context/AuthContext';
import { HeaderMenuItem, HeaderSubMenuItem } from '../../types';

interface ClientNavbarProps {
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
  activeSection?: string;
  onNavigatePage?: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  onOpenQRScanner?: () => void;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin,
  activeSection = 'hero',
  onNavigatePage,
  onOpenQRScanner
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, activeLanguages, changeLanguage, t } = useClientTranslation();
  const { user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [mobileExpandedIds, setMobileExpandedIds] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  // Hiệu ứng lắng nghe cuộn trang
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
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động đóng Mobile Menu khi xoay màn hình hoặc resize lên màn hình lớn (Desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Khóa cuộn trang nền khi mở Mobile Drawer
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavItemClick = (item: { linkType?: string; target: string; isNewTab?: boolean }) => {
    setIsMobileMenuOpen(false);
    setActiveDropdownId(null);

    if (item.linkType === 'custom') {
      if (item.target) {
        window.open(item.target, item.isNewTab ? '_blank' : '_self');
      }
      return;
    }

    if (item.linkType === 'page') {
      const pageTarget = item.target as 'home' | 'rooms' | 'artifacts' | 'guide';
      if (onNavigatePage) {
        onNavigatePage(pageTarget);
        if (pageTarget === 'home') {
          scrollToSection('hero');
        }
      }
      return;
    }

    // Anchor
    const cleanId = (item.target || '').replace(/^#/, '');
    if (cleanId) {
      if (onNavigatePage) {
        onNavigatePage('home');
        setTimeout(() => scrollToSection(cleanId), 100);
      } else {
        scrollToSection(cleanId);
      }
    }
  };

  const isItemActive = (item: { linkType?: string; target: string }) => {
    if (item.linkType === 'page') {
      if (item.target === 'home') return activeSection === 'hero' || activeSection === 'intro';
      return activeSection === item.target;
    }
    if (item.linkType === 'anchor') {
      const clean = (item.target || '').replace(/^#/, '');
      return activeSection === clean;
    }
    return false;
  };

  const currentLangObj = activeLanguages.find((l) => l.code === currentLang) || {
    code: 'vi',
    name: 'Tiếng Việt',
    flagIcon: '🇻🇳'
  };

  // Lấy danh sách menu động từ branding, fallback về mặc định nếu chưa cấu hình
  const menuItems: HeaderMenuItem[] = (branding.headerMenuItems && branding.headerMenuItems.length > 0)
    ? branding.headerMenuItems
    : DEFAULT_HEADER_MENU;

  const visibleMenuItems = menuItems.filter((m) => m.active !== false);

  return (
    <>
      {/* Lớp nền mờ khi mở Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="client-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

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
              <span>{branding.emblemText || 'BT'}</span>
            </div>
          )}
          <div className="client-nav-title-group">
            <span className="client-nav-title">{t(branding.shortName || 'Bảo tàng Lịch sử', branding.shortName || 'Bảo tàng Lịch sử')}</span>
            <div className="client-nav-subtitle-row">
              <span className="client-nav-tagline">{t(branding.city || 'TP. HỒ CHÍ MINH', branding.city || 'TP. HỒ CHÍ MINH')}</span>
              <span className="client-nav-dot">•</span>
              <span className="client-nav-badge">
                <span className="client-nav-pulse-dot" />
                <span>{t('nav.badgeTour', 'TOUR 360°')}</span>
              </span>
            </div>
          </div>
        </a>

        {/* 2. Menu Điều Hướng Động Dạng Viên Thuốc (Capsule Island Nav) Hỗ Trợ Dropdown Đa Cấp */}
        <div className={`client-nav-menu-wrapper ${isScrolled ? 'is-scrolled' : ''}`} ref={navDropdownRef}>
          <ul className="client-nav-menu">
            {visibleMenuItems.map((item) => {
              const activeChildren = (item.children || []).filter((c) => c.active !== false);
              const hasChildren = activeChildren.length > 0;
              const isParentActive = isItemActive(item) || activeChildren.some(isItemActive);
              const isDropdownOpen = activeDropdownId === item.id;
              const translatedLabel = t(item.label, item.label);

              if (hasChildren) {
                return (
                  <li
                    key={item.id}
                    className="client-nav-item client-nav-item-dropdown"
                    onMouseEnter={() => setActiveDropdownId(item.id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                    style={{ position: 'relative' }}
                  >
                    <button
                      type="button"
                      className={`client-nav-link client-nav-dropdown-trigger ${isParentActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.linkType !== 'dropdown_only') {
                          handleNavItemClick(item);
                        } else {
                          setActiveDropdownId((prev) => (prev === item.id ? null : item.id));
                        }
                      }}
                      aria-expanded={isDropdownOpen}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        font: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <span>{translatedLabel}</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          opacity: 0.7
                        }}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="client-nav-dropdown">
                        {activeChildren.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className={`client-nav-dropdown-item ${isItemActive(sub) ? 'active' : ''}`}
                            onClick={() => handleNavItemClick(sub)}
                          >
                            <span>{t(sub.label, sub.label)}</span>
                            {sub.linkType === 'custom' && <ExternalLink size={12} style={{ opacity: 0.6 }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.id} className="client-nav-item">
                  <button
                    type="button"
                    className={`client-nav-link ${isItemActive(item) ? 'active' : ''}`}
                    onClick={() => handleNavItemClick(item)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      font: 'inherit'
                    }}
                  >
                    {translatedLabel}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cụm hành động bên phải: Ngôn ngữ, Đổi Theme, Đăng nhập */}
        <div className="client-nav-actions">
          {/* Bộ chọn ngôn ngữ */}
          <div style={{ position: 'relative' }} ref={langDropdownRef}>
            <button
              type="button"
              className="client-theme-toggle client-nav-lang-btn"
              onClick={() => setIsLangDropdownOpen((prev) => !prev)}
              aria-label="Chọn ngôn ngữ"
              title={`Ngôn ngữ: ${currentLangObj.name || 'Tiếng Việt'}`}
            >
              <span className="client-nav-lang-code">{currentLangObj.code ? currentLangObj.code.toUpperCase() : 'VI'}</span>
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

          {/* Nút Quét mã QR Hiện Vật bằng Camera Trực Tiếp */}
          {onOpenQRScanner && (
            <button
              type="button"
              className="client-theme-toggle client-nav-qr-btn"
              onClick={onOpenQRScanner}
              title={t('nav.scanQrTooltip', 'Quét mã QR hiện vật hoặc gian phòng bằng Camera')}
              aria-label={t('nav.scanQr', 'Quét QR')}
            >
              <QrCode size={16} style={{ color: '#D4AF37' }} />
              <span className="client-nav-qr-text">{t('nav.scanQr', 'Quét QR')}</span>
            </button>
          )}

          {/* Nút chuyển đổi Light / Dark Theme */}
          <button
            type="button"
            className="client-theme-toggle"
            onClick={onToggleClientTheme}
            title={clientTheme === 'light' ? t('nav.themeNight', 'Chuyển sang chế độ ban đêm') : t('nav.themeDay', 'Chuyển sang chế độ ban ngày')}
            aria-label={t('nav.themeToggle', 'Chuyển chế độ sáng tối')}
          >
            {clientTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Đăng nhập hoặc Menu người dùng (Thiết kế capsule thu gọn, lấy tên từ email) */}
          {user ? (
            <div className="client-user-menu" ref={userDropdownRef}>
              <button
                type="button"
                className="client-user-btn"
                onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                title={user.email || user.username}
              >
                <div className="client-user-avatar">
                  <User size={14} />
                </div>
                <span className="client-user-name">
                  {user.email ? user.email.split('@')[0] : (user.username || 'Tài khoản')}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: 2 }}>▼</span>
              </button>

              {isUserDropdownOpen && (
                <div className="client-user-dropdown" style={{ minWidth: 180 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--c-border-subtle)', marginBottom: 2 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-primary)', wordBreak: 'break-all' }}>
                      {user.email || user.username}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="client-user-dropdown-item"
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      logout();
                    }}
                    style={{ color: '#EF4444' }}
                  >
                    <LogOut size={15} />
                    <span>{t('nav.logout', 'Đăng xuất')}</span>
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
            className={`client-nav-mobile-toggle ${isMobileMenuOpen ? 'is-active' : ''}`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Mở menu điều hướng"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Drawer Menu - Độc lập, không làm phình to hoặc biến dạng góc của Navbar */}
    {isMobileMenuOpen && (
      <div className="client-mobile-drawer">
          {/* Thông tin người dùng nếu đã đăng nhập */}
          {user && (
            <div className="client-mobile-user-card">
              <div className="client-user-avatar">
                {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.fullName || user.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                  {user.role === 'admin' ? t('nav.adminRole', 'Quản trị viên hệ thống') : user.email}
                </div>
              </div>
            </div>
          )}

          {/* Danh sách mục điều hướng */}
          {visibleMenuItems.map((item) => {
            const activeChildren = (item.children || []).filter((c) => c.active !== false);
            const hasChildren = activeChildren.length > 0;
            const isParentActive = isItemActive(item) || activeChildren.some(isItemActive);
            const isExpanded = !!mobileExpandedIds[item.id];
            const translatedLabel = t(item.label, item.label);

            if (hasChildren) {
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <button
                    type="button"
                    className={`client-mobile-nav-link ${isParentActive ? 'active' : ''}`}
                    onClick={() => {
                      setMobileExpandedIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                  >
                    <span>{translatedLabel}</span>
                    <ChevronDown
                      size={16}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.7
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div className="client-mobile-sub-menu" style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 14, marginTop: 4 }}>
                      {activeChildren.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          className={`client-mobile-nav-link ${isItemActive(sub) ? 'active' : ''}`}
                          onClick={() => handleNavItemClick(sub)}
                          style={{ fontSize: '0.86rem', opacity: 0.95 }}
                        >
                          <span>└─ {t(sub.label, sub.label)}</span>
                          {sub.linkType === 'custom' && <ExternalLink size={12} style={{ opacity: 0.5 }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={`client-mobile-nav-link ${isItemActive(item) ? 'active' : ''}`}
                onClick={() => handleNavItemClick(item)}
              >
                <span>{translatedLabel}</span>
              </button>
            );
          })}

          {/* Nút Quét mã QR bằng Camera */}
          {onOpenQRScanner && (
            <button
              type="button"
              className="client-mobile-qr-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenQRScanner();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.08) 100%)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginTop: 6
              }}
            >
              <QrCode size={18} />
              <span>{t('nav.scanQRCamera', 'Quét Mã QR Bằng Camera')}</span>
            </button>
          )}

          {/* Dải chọn ngôn ngữ nhanh trên Mobile */}
          <div className="client-mobile-lang-row">
            <span style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>
              {t('common.language', 'Ngôn ngữ')}:
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {activeLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`client-mobile-lang-chip ${lang.code === currentLang ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <span>{lang.flagIcon}</span>
                  <span>{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nút Đăng nhập hoặc Đăng xuất */}
          {user ? (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', padding: '0 8px', wordBreak: 'break-all' }}>
                {user.email || user.username}
              </div>
              <button
                type="button"
                className="client-mobile-nav-link"
                style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LogOut size={16} />
                  <span>{t('nav.logout', 'Đăng xuất tài khoản')}</span>
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="client-nav-login-btn"
              style={{ marginTop: 8, justifyContent: 'center', width: '100%', display: 'inline-flex' }}
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
    </>
  );
};
