import { Compass, Landmark, Box, BarChart3, Settings, Camera, X, Languages, PanelLeftClose } from 'lucide-react';
import { AdminTab } from '../types';

interface SidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  roomCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  roomCount,
  isOpen = false,
  onClose,
  onToggle
}) => {
  const handleItemClick = (tab: AdminTab) => {
    onTabChange(tab);
    // Chỉ tự động đóng menu trên màn hình nhỏ di động
    if (onClose && typeof window !== 'undefined' && window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="museum-emblem">BT</div>
        <div className="sidebar-title" style={{ flex: 1 }}>
          <h1>Bảo tàng Lịch sử</h1>
          <p>TP. Hồ Chí Minh • Quản trị</p>
        </div>
        {onToggle && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title="Thu gọn thanh điều hướng (Ctrl + B)"
            aria-label="Thu gọn thanh điều hướng"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
        {onClose && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Đóng menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentTab === 'rooms' || currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => handleItemClick('rooms')}
        >
          <Compass size={16} />
          <span>Gian trưng bày & Tour 360</span>
          <span
            style={{
              marginLeft: 'auto',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4
            }}
          >
            {roomCount}
          </span>
        </button>

        <button
          className={`nav-item ${currentTab === 'poc_stitching' ? 'active' : ''}`}
          onClick={() => handleItemClick('poc_stitching')}
        >
          <Camera size={16} />
          <span>Tạo ảnh toàn cảnh 360°</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => handleItemClick('artifacts')}
        >
          <Box size={16} />
          <span>Hiện vật & Cổ vật di sản</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'languages' ? 'active' : ''}`}
          onClick={() => handleItemClick('languages')}
        >
          <Languages size={16} />
          <span>Quản trị Ngôn ngữ & Voice AI</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleItemClick('analytics')}
        >
          <BarChart3 size={16} />
          <span>Báo cáo & Thống kê</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleItemClick('settings')}
        >
          <Settings size={16} />
          <span>Cấu hình hệ thống</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Landmark size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Đề tài Tốt nghiệp 2026</span>
        </div>
        <div>Hệ thống Tour 360 Không gian Di sản</div>
      </div>
    </aside>
  );
};
