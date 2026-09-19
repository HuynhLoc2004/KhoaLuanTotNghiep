import React from 'react';
import { ChevronRight, ShieldCheck, Menu, Sun, Moon } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';
import { useTheme } from '../context/ThemeContext';

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

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onToggleSidebar && (
          <button
            className="mobile-hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Mở menu điều hướng"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="breadcrumbs">
          <span className="breadcrumb-brand">Bảo tàng Lịch sử TP.HCM</span>
          <ChevronRight size={14} className="breadcrumb-sep" />
          <span
            style={{ cursor: activeRoom ? 'pointer' : 'default', textDecoration: activeRoom ? 'underline' : 'none' }}
            onClick={activeRoom ? onBackToRooms : undefined}
          >
            Gian trưng bày & Tour 360
          </span>
          {activeRoom && (
            <>
              <ChevronRight size={14} />
              <span className="current">{activeRoom.name}</span>
            </>
          )}
        </div>
      </div>

      <div className="header-actions">
        {/* Nút chuyển đổi Giao diện Tối / Sáng */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
          aria-label="Chuyển chế độ màu"
        >
          {theme === 'dark' ? (
            <Sun size={17} style={{ color: '#FCD34D' }} />
          ) : (
            <Moon size={17} style={{ color: '#64748B' }} />
          )}
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Giao diện Tối' : 'Giao diện Sáng'}
          </span>
        </button>

        <div className="status-badge-live">
          <span className="status-dot" />
          <span className="status-badge-text">API: Trực tuyến</span>
        </div>

        <div className="admin-role-badge">
          <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
          <span>Quản trị viên</span>
        </div>
      </div>
    </header>
  );
};
