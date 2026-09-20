import React from 'react';
import { ChevronRight, Menu, Sun, Moon, ExternalLink, Landmark, Shield, ArrowLeft, LogOut } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSystemBranding } from '../context/SystemBrandingContext';
import { ClientLanguagePicker } from './ClientLanguagePicker';

interface HeaderProps {
  currentTab: AdminTab;
  activeRoom?: MuseumRoom | null;
  onBackToRooms?: () => void;
  onToggleSidebar?: () => void;
}

const TAB_TITLES: Record<AdminTab, { label: string; parent?: string }> = {
  rooms: { label: 'Gian trưng bày & Tour 360' },
  studio: { label: 'Biên tập Hotspot 360°', parent: 'Gian trưng bày & Tour 360' },
  poc_stitching: { label: 'Xưởng Ghép Ảnh Toàn Cảnh 360°' },
  artifacts: { label: 'Hiện vật & Cổ vật di sản' },
  languages: { label: 'Quản trị Ngôn ngữ & Voice AI' },
  analytics: { label: 'Báo cáo & Thống kê' },
  settings: { label: 'Cấu hình hệ thống' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeRoom,
  onBackToRooms,
  onToggleSidebar
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { branding } = useSystemBranding();
  const currentTabInfo = TAB_TITLES[currentTab] || { label: 'Bảng Điều Khiển' };

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
            <span className="breadcrumb-museum-name">{branding.shortName || branding.museumName}</span>
          </div>

          <ChevronRight size={13} className="breadcrumb-divider" />

          {currentTab === 'studio' && activeRoom ? (
            <>
              {onBackToRooms && (
                <button
                  type="button"
                  className="breadcrumb-mobile-back"
                  onClick={onBackToRooms}
                  title="Quay lại danh sách phòng"
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
                Gian trưng bày & Tour 360
              </button>
              <ChevronRight size={13} className="breadcrumb-divider" />
              <span className="breadcrumb-active" title={activeRoom.name}>
                {activeRoom.name}
              </span>
            </>
          ) : (
            <span className="breadcrumb-active">
              {currentTabInfo.label}
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
          title="Mở giao diện khách tham quan trong tab mới"
        >
          <ExternalLink size={13} />
          <span className="header-tour-label">Xem Tour Khách</span>
        </a>

        {/* Nút chọn Ngôn ngữ hiển thị */}
        <ClientLanguagePicker variant="full" />

        {/* Nút chuyển đổi Giao diện Tối / Sáng */}
        <button
          type="button"
          onClick={toggleTheme}
          className="header-theme-btn"
          title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
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
                : `Ban Quản trị ${branding.shortName}`}
            </span>
            <span className="header-user-role">{user?.role === 'admin' ? 'Quản trị viên (Admin)' : user?.role || 'Admin'}</span>
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
