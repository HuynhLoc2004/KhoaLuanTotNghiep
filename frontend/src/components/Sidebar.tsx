import React, { useState, useEffect } from 'react';
import { Compass, Landmark, Box, BarChart3, Settings, Camera, X, Languages, PanelLeftClose, LayoutTemplate, ChevronDown, Layers } from 'lucide-react';
import { AdminTab } from '../types';
import { useSystemBranding } from '../context/SystemBrandingContext';
import { useClientTranslation } from '../context/ClientTranslationContext';
import { HOMEPAGE_SECTIONS } from '../constants/homepageSections';

interface SidebarProps {
  currentTab: AdminTab;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onTabChange: (tab: AdminTab, sectionId?: string) => void;
  roomCount: number;
  homepageSection?: string;
  onHomepageSectionChange?: (sectionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  isOpen,
  onClose,
  onToggle,
  onTabChange,
  roomCount,
  homepageSection,
  onHomepageSectionChange
}) => {
  const { branding } = useSystemBranding();
  const { t, currentLang } = useClientTranslation();
  const [isHomepageExpanded, setIsHomepageExpanded] = useState<boolean>(true);

  // Tự động mở menu con Trang chủ khi người dùng đang ở tab homepage_cms
  useEffect(() => {
    if (currentTab === 'homepage_cms') {
      setIsHomepageExpanded(true);
    }
  }, [currentTab]);

  const handleItemClick = (tab: AdminTab) => {
    onTabChange(tab);
    if (window.innerWidth <= 1024) {
      onClose();
    }
  };

  const handleHomepageMainClick = () => {
    if (currentTab !== 'homepage_cms') {
      onTabChange('homepage_cms', homepageSection || 'panel-brand');
      setIsHomepageExpanded(true);
    } else {
      setIsHomepageExpanded(!isHomepageExpanded);
    }
  };

  const handleSubSectionClick = (sectionId: string) => {
    if (onHomepageSectionChange) {
      onHomepageSectionChange(sectionId);
    }
    onTabChange('homepage_cms', sectionId);
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
        {/* NHÓM 1: QUẢN LÝ CÁC TRANG (PAGES CMS) */}
        <div className="sidebar-group-label" style={{ marginTop: 2 }}>
          <span>QUẢN LÝ CÁC TRANG</span>
        </div>

        {/* 1.1 Quản lý Trang chủ */}
        <div className="nav-collapsible-wrapper">
          <button
            type="button"
            className={`nav-item ${currentTab === 'homepage_cms' ? 'active' : ''}`}
            onClick={handleHomepageMainClick}
            title="Quản lý giao diện & 7 phân khu trang chủ"
          >
            <LayoutTemplate size={16} />
            <span>{t('nav.homepageCms', 'Trang chủ (Homepage)')}</span>
            <ChevronDown
              size={14}
              style={{
                marginLeft: 'auto',
                transform: isHomepageExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                opacity: 0.7
              }}
            />
          </button>

          {/* Danh sách 7 phân khu độc lập của Trang chủ */}
          {isHomepageExpanded && (
            <div className="nav-sub-menu">
              {HOMEPAGE_SECTIONS.map((sec) => {
                const isSecActive = currentTab === 'homepage_cms' && (homepageSection || 'panel-brand') === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`nav-sub-item ${isSecActive ? 'active' : ''}`}
                    onClick={() => handleSubSectionClick(sec.id)}
                    title={sec.desc}
                  >
                    <span className="nav-sub-num">{sec.num}</span>
                    <span className="nav-sub-text">{sec.shortLabel.replace(/^\d+\.\s*/, '')}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 1.2 Quản lý Trang Gian phòng 360° */}
        <button
          className={`nav-item ${currentTab === 'rooms' || currentTab === 'studio' ? 'active' : ''}`}
          onClick={() => handleItemClick('rooms')}
          title="Quản lý danh sách gian trưng bày, ảnh toàn cảnh 360° và các điểm hotspot"
        >
          <Compass size={16} />
          <span>{t('nav.roomsPage', 'Trang Gian phòng 360°')}</span>
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

        {/* 1.3 Quản lý Trang Cổ vật 3D */}
        <button
          className={`nav-item ${currentTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => handleItemClick('artifacts')}
          title="Quản lý kho hiện vật di sản, mô hình 3D xoay 360° và thuyết minh"
        >
          <Box size={16} />
          <span>{t('nav.artifactsPage', 'Trang Cổ vật & Bảo vật 3D')}</span>
        </button>

        {/* 1.4 Quản lý Trang Cẩm nang & Sơ đồ */}
        <button
          className={`nav-item ${currentTab === 'guide' ? 'active' : ''}`}
          onClick={() => handleItemClick('guide')}
          title="Quản lý sơ đồ mặt bằng tham quan, giờ mở cửa, bảng giá vé, bản đồ và tiện ích"
        >
          <Layers size={16} />
          <span>{t('nav.guidePage', 'Trang Cẩm nang & Sơ đồ')}</span>
        </button>

        {/* NHÓM 2: CÔNG CỤ TOUR 360° & ĐỒNG BỘ */}
        <div className="sidebar-group-divider" />
        <div className="sidebar-group-label">
          <span>CÔNG CỤ TOUR 360°</span>
        </div>

        <button
          className={`nav-item ${currentTab === 'poc_stitching' ? 'active' : ''}`}
          onClick={() => handleItemClick('poc_stitching')}
          title="Tạo và ghép ảnh toàn cảnh equirectangular 360° từ máy ảnh hoặc webcam"
        >
          <Camera size={16} />
          <span>{t('nav.pocStitching', 'Tạo ảnh toàn cảnh 360°')}</span>
        </button>

        {/* NHÓM 3: HỆ THỐNG & BÁO CÁO */}
        <div className="sidebar-group-divider" />
        <div className="sidebar-group-label">
          <span>HỆ THỐNG & BÁO CÁO</span>
        </div>

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
