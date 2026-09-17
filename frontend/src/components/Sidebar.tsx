import React from 'react';
import { Compass, Landmark, Box, BarChart3, Settings, Sparkles, X } from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  roomCount: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  roomCount,
  isOpen = false,
  onClose
}) => {
  const handleItemClick = (tab: AdminTab) => {
    onTabChange(tab);
    if (onClose) onClose();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="museum-emblem">BT</div>
        <div className="sidebar-title" style={{ flex: 1 }}>
          <h1>Bảo tàng Lịch sử</h1>
          <p>TP. Hồ Chí Minh • Quản trị</p>
        </div>
        {onClose && (
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentTab === 'rooms' || currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => handleItemClick('rooms')}
        >
          <Compass size={18} />
          <span>Gian trưng bày & Tour 360</span>
          <span
            style={{
              marginLeft: 'auto',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 999
            }}
          >
            {roomCount}
          </span>
        </button>

        <button
          className={`nav-item ${currentTab === 'poc_stitching' ? 'active' : ''}`}
          onClick={() => handleItemClick('poc_stitching')}
          style={{
            color: currentTab === 'poc_stitching' ? 'var(--primary)' : 'var(--text-main)',
            background: currentTab === 'poc_stitching' ? 'var(--primary-light)' : 'transparent',
            borderColor: currentTab === 'poc_stitching' ? 'var(--primary-border)' : 'transparent'
          }}
        >
          <Sparkles size={18} style={{ color: '#D97706' }} />
          <span style={{ fontWeight: 600 }}>Tự Động Ghép 360 (PoC)</span>
          <span
            style={{
              marginLeft: 'auto',
              background: '#FEF3C7',
              color: '#B45309',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 4
            }}
          >
            AI/CV
          </span>
        </button>

        <button
          className={`nav-item ${currentTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => handleItemClick('artifacts')}
        >
          <Box size={18} />
          <span>Hiện vật & Cổ vật di sản</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleItemClick('analytics')}
        >
          <BarChart3 size={18} />
          <span>Báo cáo & Thống kê</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleItemClick('settings')}
        >
          <Settings size={18} />
          <span>Cấu hình hệ thống</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Landmark size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Đề tài Tốt nghiệp 2026</span>
        </div>
        <div>Hệ thống Tour 360 AI Di sản</div>
      </div>
    </aside>
  );
};
