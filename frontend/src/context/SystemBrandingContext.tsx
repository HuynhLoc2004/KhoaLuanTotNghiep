import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemBranding } from '../types';
import { api } from '../services/api';

const LOCAL_STORAGE_KEY = 'system_branding_cache';

export const DEFAULT_BRANDING_STATE: SystemBranding = {
  museumName: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh',
  shortName: 'Bảo tàng Lịch sử',
  emblemText: 'BT',
  logoUrl: '',
  tagline: 'Hệ thống Tour 360 Không gian Di sản',
  city: 'TP. Hồ Chí Minh',
  address: 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  contactEmail: 'huynhtanlocpp09@gmail.com',
  hotline: '(028) 3829 8146',
  emailSenderName: 'Bảo Tàng Lịch Sử TP.HCM',
  guideMapUrl: '',
  guideMapTitle: 'Sơ đồ mặt bằng các gian trưng bày',
  guideMapDesc: 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM'
};

interface SystemBrandingContextType {
  branding: SystemBranding;
  isLoading: boolean;
  updateBranding: (patch: Partial<SystemBranding>) => Promise<SystemBranding>;
  refreshBranding: () => Promise<void>;
}

const SystemBrandingContext = createContext<SystemBrandingContextType | undefined>(undefined);

export const SystemBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<SystemBranding>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.museumName) {
            return { ...DEFAULT_BRANDING_STATE, ...parsed };
          }
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_BRANDING_STATE;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBranding = async () => {
    try {
      const data = await api.getBranding();
      if (data && data.museumName) {
        setBranding(data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  // Tự động đồng bộ Tiêu đề Tab trình duyệt (document.title) & Favicon theo thương hiệu bảo tàng
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const name = branding.shortName || branding.museumName || 'Bảo tàng Di sản';
      document.title = `${name} - Hệ thống Tour 360 Không gian Di sản`;

      // Xác định Favicon mục tiêu: Dùng logo bảo tàng nếu có, nếu không thì dùng favicon chuẩn bảo tàng
      const hasCustomLogo = Boolean(branding.logoUrl && branding.logoUrl.trim());
      const targetIconUrl = hasCustomLogo
        ? branding.logoUrl!.trim()
        : `/favicon.svg?v=${branding.updatedAt ? new Date(branding.updatedAt).getTime() : Date.now()}`;

      let favicons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
      if (favicons.length > 0) {
        favicons.forEach((el) => {
          el.href = targetIconUrl;
          if (!hasCustomLogo) {
            el.type = 'image/svg+xml';
          }
        });
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = hasCustomLogo ? 'image/png' : 'image/svg+xml';
        newFavicon.href = targetIconUrl;
        document.head.appendChild(newFavicon);
      }
    }
  }, [branding]);

  const handleUpdateBranding = async (patch: Partial<SystemBranding>): Promise<SystemBranding> => {
    const updated = await api.updateBranding(patch);
    setBranding(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
    return updated;
  };

  return (
    <SystemBrandingContext.Provider
      value={{
        branding,
        isLoading,
        updateBranding: handleUpdateBranding,
        refreshBranding: fetchBranding
      }}
    >
      {children}
    </SystemBrandingContext.Provider>
  );
};

export const useSystemBranding = (): SystemBrandingContextType => {
  const context = useContext(SystemBrandingContext);
  if (!context) {
    throw new Error('useSystemBranding must be used within a SystemBrandingProvider');
  }
  return context;
};
