import React from 'react';
import { ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { AdminTab, MuseumRoom } from '../types';

interface HeaderProps {
  currentTab: AdminTab;
  activeRoom?: MuseumRoom | null;
  onBackToRooms?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, activeRoom, onBackToRooms }) => {
  return (
    <header className="admin-header">
      <div className="breadcrumbs">
        <span>Bảo tàng Lịch sử TP.HCM</span>
        <ChevronRight size={14} />
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

      <div className="header-actions">
        <div className="status-badge-live">
          <span className="status-dot" />
          <span>Máy chủ API: Trực tuyến</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--primary)' }} />
          <span>Quản trị viên Di sản</span>
        </div>
      </div>
    </header>
  );
};
