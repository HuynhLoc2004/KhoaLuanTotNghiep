import React from 'react';
import { Compass, Landmark, Box, Map, BarChart3, Settings, Eye, Sparkles } from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  roomCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, roomCount }) => {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="museum-emblem">BT</div>
        <div className="sidebar-title">
          <h1>Bảo tàng Lịch sử</h1>
          <p>TP. Hồ Chí Minh • Quản trị</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentTab === 'rooms' || currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => onTabChange('rooms')}
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
          onClick={() => onTabChange('poc_stitching')}
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
          onClick={() => onTabChange('artifacts')}
        >
          <Box size={18} />
          <span>Hiện vật & Cổ vật di sản</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <BarChart3 size={18} />
          <span>Báo cáo & Thống kê</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
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
