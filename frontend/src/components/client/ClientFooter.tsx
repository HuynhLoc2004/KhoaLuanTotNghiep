import React from 'react';
import {
  Landmark,
  MapPin,
  Phone,
  Mail,
  Compass,
  Box,
  Layers,
  Lock,
  Globe,
  ArrowUp
} from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFooterProps {
  onNavigateAdmin: () => void;
}

export const ClientFooter: React.FC<ClientFooterProps> = ({ onNavigateAdmin }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="client-footer">
      <div className="client-container">
        <div className="client-footer-grid">
          {/* Cột 1: Thông tin nhận diện bảo tàng */}
          <div className="client-footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.shortName}
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--primary) 0%, #5a1a0c 100%)',
                    border: '1px solid var(--accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff8f0',
                    fontFamily: 'serif',
                    fontWeight: 800,
                    fontSize: 16
                  }}
                >
                  {branding.emblemText || 'BT'}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {branding.shortName || 'Bảo tàng Lịch sử'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  {branding.city || 'TP. Hồ Chí Minh'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {branding.museumName || 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh'} - Lưu giữ và phát huy giá trị di sản văn hóa dân tộc qua công nghệ thực tế ảo và số hóa 3D.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: 2 }} />
                <span>{branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span>{branding.hotline || '(028) 3829 8146'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span>{branding.contactEmail || 'huynhtanlocpp09@gmail.com'}</span>
              </span>
            </div>
          </div>

          {/* Cột 2: Trải nghiệm số hóa */}
          <div className="client-footer-col">
            <h4>{t('footer.colExp', 'Trải nghiệm số')}</h4>
            <ul className="client-footer-links">
              <li>
                <a href="#rooms" className="client-footer-link">
                  Tham quan Tour 360°
                </a>
              </li>
              <li>
                <a href="#artifacts" className="client-footer-link">
                  Bộ sưu tập cổ vật 3D
                </a>
              </li>
              <li>
                <a href="#topics" className="client-footer-link">
                  Không gian chuyên đề
                </a>
              </li>
              <li>
                <a href="#guide" className="client-footer-link">
                  Hướng dẫn quét mã QR
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin tham quan */}
          <div className="client-footer-col">
            <h4>{t('footer.colInfo', 'Thông tin bảo tàng')}</h4>
            <ul className="client-footer-links">
              <li>
                <a href="#intro" className="client-footer-link">
                  Giới thiệu & Kiến trúc
                </a>
              </li>
              <li>
                <a href="#guide" className="client-footer-link">
                  Lịch đón tiếp & Giờ mở cửa
                </a>
              </li>
              <li>
                <a href="#guide" className="client-footer-link">
                  Chỉ dẫn giao thông & Xe buýt
                </a>
              </li>
              <li>
                <a href="#guide" className="client-footer-link">
                  Nội quy khách tham quan
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Ban quản lý & Cổng điều hành */}
          <div className="client-footer-col">
            <h4>{t('footer.colAdmin', 'Hệ thống Quản trị')}</h4>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Dành riêng cho cán bộ nghiên cứu, giám tuyển và ban điều hành bảo tàng.
            </p>
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="client-btn-admin"
              style={{
                width: '100%',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.15)'
              }}
            >
              <Lock size={14} />
              <span>Đăng nhập Cổng Quản Trị</span>
            </button>
          </div>
        </div>

        {/* Thanh bản quyền cuối cùng */}
        <div className="client-footer-bottom">
          <div>
            © {new Date().getFullYear()} {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}. Tất cả quyền được bảo lưu.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>Hệ thống Bảo tàng Số Di sản 360°</span>
            <button
              type="button"
              onClick={scrollToTop}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
              title="Cuộn lên đầu trang"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
