import React from 'react';
import { ChevronRight, Menu, Sun, Moon, ExternalLink, Landmark, Shield } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const currentTabInfo = TAB_TITLES[currentTab] || { label: 'Bảng Điều Khiển' };

  return (
    <header className="admin-header">
      {/* Cụm Điều hướng & Breadcrumb bên trái */}
      <div className="header-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Mở menu điều hướng"
          >
            <Menu size={20} />
          </button>
        )}

        <nav className="header-breadcrumbs" aria-label="Đường dẫn điều hướng">
          <div className="breadcrumb-root">
            <Landmark size={14} className="breadcrumb-museum-icon" />
            <span className="breadcrumb-museum-name">Bảo tàng Lịch sử TP.HCM</span>
          </div>

          <ChevronRight size={13} className="breadcrumb-divider" />

          {currentTab === 'studio' && activeRoom ? (
            <>
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
        <div className="header-user-profile" title="Tài khoản Quản trị viên Bảo tàng">
          <div className="header-user-avatar">
            <Shield size={14} />
          </div>
          <div className="header-user-meta">
            <span className="header-user-name">Ban Quản lý</span>
            <span className="header-user-role">Quản trị viên</span>
          </div>
        </div>
      </div>
    </header>
  );
};
