import React from 'react';
import { ChevronRight, ShieldCheck, Menu } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';

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
