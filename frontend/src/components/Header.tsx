import React from 'react';
import { ChevronRight, Menu, Sun, Moon, ExternalLink, Landmark, Shield, ArrowLeft, LogOut } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSystemBranding } from '../context/SystemBrandingContext';
import { ClientLanguagePicker } from './ClientLanguagePicker';
import { useClientTranslation } from '../context/ClientTranslationContext';

interface HeaderProps {
  currentTab: AdminTab;
  activeRoom?: MuseumRoom | null;
  onBackToRooms?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeRoom,
  onBackToRooms,
  onToggleSidebar
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { branding } = useSystemBranding();
  const { t, localize, currentLang } = useClientTranslation();

  const getTabLabel = (tab: AdminTab): string => {
    switch (tab) {
      case 'rooms': return t('nav.rooms', 'Quản lý Trang Gian phòng 360°');
      case 'studio': return t('nav.studio', 'Biên tập Hotspot 360°');
      case 'poc_stitching': return t('nav.pocStitching', 'Tạo Ảnh Toàn Cảnh 360°');
      case 'artifacts': return t('nav.artifacts', 'Quản lý Trang Cổ vật & Bảo vật 3D');
      case 'homepage_cms': return t('nav.homepageCms', 'Quản lý Trang chủ & Giao diện');
      case 'guide': return t('nav.guidePage', 'Quản lý Trang Cẩm nang & Sơ đồ');
      case 'languages': return t('nav.languages', 'Quản trị Ngôn ngữ & Voice AI');
      case 'analytics': return t('nav.analytics', 'Báo cáo & Thống kê');
      case 'settings': return t('nav.settings', 'Cấu hình hệ thống');
      default: return t('nav.dashboard', 'Bảng Điều Khiển');
    }
  };

  return (
    <header className="admin-header">
      {/* Cụm Điều hướng & Breadcrumb bên trái */}
      <div className="header-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="header-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            title="Ẩn / Hiện thanh điều hướng (Ctrl + B)"
            aria-label="Mở hoặc thu gọn thanh điều hướng"
          >
            <Menu size={18} />
          </button>
        )}

        <nav className="header-breadcrumbs" aria-label="Đường dẫn điều hướng">
          <div className="breadcrumb-root">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt=""
                style={{ width: 15, height: 15, objectFit: 'contain', marginRight: 4, verticalAlign: 'middle' }}
              />
            ) : (
              <Landmark size={14} className="breadcrumb-museum-icon" />
            )}
            <span className="breadcrumb-museum-name">
              {currentLang === 'vi' ? (branding.shortName || branding.museumName || t('nav.breadcrumbMuseum', 'Bảo tàng Lịch sử')) : t('nav.breadcrumbMuseum', 'History Museum')}
            </span>
          </div>

          <ChevronRight size={13} className="breadcrumb-divider" />

          {currentTab === 'studio' && activeRoom ? (
            <>
              {onBackToRooms && (
                <button
                  type="button"
                  className="breadcrumb-mobile-back"
                  onClick={onBackToRooms}
                  title={t('rooms.prev', 'Quay lại danh sách phòng')}
                  aria-label="Quay lại danh sách phòng"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <button
                type="button"
                className="breadcrumb-link"
                onClick={onBackToRooms}
              >
                {t('nav.rooms', 'Gian trưng bày & Tour 360')}
              </button>
              <ChevronRight size={13} className="breadcrumb-divider" />
              <span className="breadcrumb-active" title={activeRoom.name}>
                {localize(activeRoom, 'name', activeRoom.name)}
              </span>
            </>
          ) : (
            <span className="breadcrumb-active">
              {getTabLabel(currentTab)}
            </span>
          )}
        </nav>
      </div>

      {/* Cụm Thao tác Quản trị bên phải (Chuẩn mực di sản, xóa sạch chất AI-hóa) */}
      <div className="header-actions">
        {/* Nút xem nhanh trang khách tham quan */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="header-tour-link"
          title={t('nav.viewTour', 'Mở giao diện khách tham quan trong tab mới')}
        >
          <ExternalLink size={13} />
          <span className="header-tour-label">{t('nav.viewTour', 'Xem Tour Khách')}</span>
        </a>

        {/* Nút chọn Ngôn ngữ hiển thị */}
        <ClientLanguagePicker variant="full" />

        {/* Nút chuyển đổi Giao diện Tối / Sáng */}
        <button
          type="button"
          onClick={toggleTheme}
          className="header-theme-btn"
          title={theme === 'dark' ? t('nav.themeLight', 'Chuyển sang giao diện Sáng') : t('nav.themeDark', 'Chuyển sang giao diện Tối')}
          aria-label="Chuyển chế độ màu"
        >
          {theme === 'dark' ? (
            <Sun size={16} style={{ color: 'var(--accent-gold)' }} />
          ) : (
            <Moon size={16} style={{ color: 'var(--text-muted)' }} />
          )}
        </button>

        {/* Đường phân cách mảnh */}
        <div className="header-separator" />

        {/* Khối Thông tin Người Quản trị Di sản */}
        <div className="header-user-profile" title={`Tài khoản: ${user?.email || 'admin'}`}>
          <div className="header-user-avatar">
            <Shield size={14} />
          </div>
          <div className="header-user-meta">
            <span className="header-user-name">
              {user?.fullName && !user.fullName.includes('Bảo tàng Lịch sử')
                ? user.fullName
                : t('nav.adminTitle', `Ban Quản trị ${branding.shortName || 'Bảo tàng Lịch sử'}`)}
            </span>
            <span className="header-user-role">
              {user?.role === 'admin' ? t('nav.adminRole', 'Quản trị viên (Admin)') : (user?.role || 'Admin')}
            </span>
          </div>
        </div>

        {/* Nút Đăng xuất an toàn */}
        <button
          type="button"
          className="header-logout-btn"
          onClick={logout}
          title="Đăng xuất khỏi hệ thống quản trị"
          aria-label="Đăng xuất"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};
