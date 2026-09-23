import { Compass, Landmark, Box, BarChart3, Settings, Camera, X, Languages, PanelLeftClose } from 'lucide-react';
import { AdminTab } from '../types';
import { useSystemBranding } from '../context/SystemBrandingContext';
import { useClientTranslation } from '../context/ClientTranslationContext';

interface SidebarProps {
  currentTab: AdminTab;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onTabChange: (tab: AdminTab) => void;
  roomCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  isOpen,
  onClose,
  onToggle,
  onTabChange,
  roomCount
}) => {
  const { branding } = useSystemBranding();
  const { t, currentLang } = useClientTranslation();

  const handleItemClick = (tab: AdminTab) => {
    onTabChange(tab);
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt=""
              style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF8F0',
                fontSize: 12,
                fontWeight: 700
              }}
            >
              {branding.emblemText || 'BT'}
            </div>
          )}
          <div className="sidebar-title" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--heading-color)', lineHeight: 1.25 }}>
              {currentLang === 'vi' ? (branding.shortName || branding.museumName) : t('nav.breadcrumbMuseum', 'History Museum')}
            </span>
            <span className="sidebar-sub" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {currentLang === 'vi' ? 'TP. Hồ Chí Minh • Quản trị' : 'Ho Chi Minh City • Admin'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-collapse-btn desktop-only"
          onClick={onToggle}
          title="Thu gọn / Mở rộng menu (Ctrl + B)"
          aria-label="Thu gọn hoặc mở rộng thanh điều hướng"
        >
          <PanelLeftClose size={16} />
        </button>

        {isOpen && (
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={onClose}
            title="Đóng menu"
            aria-label="Đóng thanh điều hướng"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentTab === 'rooms' || currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => handleItemClick('rooms')}
        >
          <Compass size={16} />
          <span>{t('nav.rooms', 'Gian trưng bày & Tour 360')}</span>
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
          <span>{t('nav.pocStitching', 'Tạo ảnh toàn cảnh 360°')}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => handleItemClick('artifacts')}
        >
          <Box size={16} />
          <span>{t('nav.artifacts', 'Hiện vật & Cổ vật di sản')}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'languages' ? 'active' : ''}`}
          onClick={() => handleItemClick('languages')}
        >
          <Languages size={16} />
          <span>{t('nav.languages', 'Quản trị Ngôn ngữ & Voice AI')}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleItemClick('analytics')}
        >
          <BarChart3 size={16} />
          <span>{t('nav.analytics', 'Báo cáo & Thống kê')}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleItemClick('settings')}
        >
          <Settings size={16} />
          <span>{t('nav.settings', 'Cấu hình hệ thống')}</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Landmark size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('common.thesisTitle', 'Đề tài Tốt nghiệp 2026')}</span>
        </div>
        <div>{t('common.thesisFooter', 'Hệ thống Tour 360 Không gian Di sản')}</div>
      </div>
    </aside>
  );
};
