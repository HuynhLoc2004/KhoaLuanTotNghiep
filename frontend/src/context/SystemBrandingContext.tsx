import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemBranding } from '../types';
import { api } from '../services/api';

const LOCAL_STORAGE_KEY = 'system_branding_cache';

export const DEFAULT_HEADER_MENU = [
  {
    id: 'menu-intro',
    label: 'Giới thiệu',
    linkType: 'anchor' as const,
    target: 'intro',
    active: true,
    order: 1,
    children: []
  },
  {
    id: 'menu-rooms',
    label: 'Gian phòng 360°',
    linkType: 'page' as const,
    target: 'rooms',
    active: true,
    order: 2,
    children: []
  },
  {
    id: 'menu-artifacts',
    label: 'Cổ vật 3D',
    linkType: 'page' as const,
    target: 'artifacts',
    active: true,
    order: 3,
    children: []
  },
  {
    id: 'menu-guide',
    label: 'Tham quan',
    linkType: 'page' as const,
    target: 'guide',
    active: true,
    order: 4,
    children: []
  }
];

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
  headerMenuItems: DEFAULT_HEADER_MENU,
  heroTitle: 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
  heroTagline: 'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.',
  heroBannerUrl: '',
  heroVideoUrl: '',
  heroCta1Text: 'Bắt Đầu Tour 360°',
  heroCta2Text: 'Chiêm Ngưỡng Cổ Vật 3D',
  introTag: 'Kiến Trúc & Không Gian',
  introTitle: 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh',
  introDesc: 'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.',
  introBadgeText: 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia',
  introImageUrl: '',
  introCtaText: 'Khám phá gian trưng bày',
  roomsTag: 'Không Gian Thực Tế Ảo',
  roomsTitle: 'Hệ Thống Gian Phòng Tour 360°',
  roomsDesc: 'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.',
  roomsCtaText: 'Khám phá tất cả gian phòng 360°',
  roomsFeaturedId: '',
  roomsShowcaseImageUrl: '',
  artifactsTag: 'Bảo Vật Di Sản & Mô Hình 3D',
  artifactsTitle: 'Kho Tàng Cổ Vật & Bảo Vật Di Sản',
  artifactsDesc: 'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác và hệ thống thuyết minh âm thanh đa ngôn ngữ.',
  artifactsCtaText: 'Khám phá toàn bộ kho hiện vật',
  guideTag: 'Kế Hoạch & Sơ Đồ',
  guideTitle: 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa',
  guideDesc: 'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.',
  guideCtaText: 'Xem cẩm nang & sơ đồ tham quan',
  guideMapUrl: '',
  guideMapTitle: 'Sơ đồ mặt bằng các gian trưng bày',
  guideMapDesc: 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM',
  guideOpeningDays: 'Thứ Ba – Chủ Nhật',
  guideMorningHours: '08:00 – 11:30',
  guideAfternoonHours: '13:30 – 17:00',
  guideClosedNote: 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật.',
  guideTicketAdult: '30.000 ₫',
  guideTicketStudent: '15.000 ₫',
  guideTicketChild: 'Miễn phí',
  guideBusRoutes: 'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.',
  guideParkingInfo: 'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.',
  guideGoogleMapsUrl: 'https://maps.app.goo.gl/3f9m4xVjM8k3E4wz9',
  guideGoogleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2974959146194!2d106.70295171120286!3d10.788506858925585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4ae1b9338f%3A0x6b09337ec5c8d626!2zQuG6o28gdMOgbmcgTOG7i2NoIHPhu60gVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn',
  guideRule1Title: 'Quét mã QR tại tủ hiện vật',
  guideRule1Desc: 'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
  guideRule2Title: 'Thuyết minh Audio Guide song ngữ',
  guideRule2Desc: 'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
  guideRule3Title: 'Bảo quản di sản & Hiện vật',
  guideRule3Desc: 'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
  guideRule4Title: 'Trang phục & Văn minh tham quan',
  guideRule4Desc: 'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.',
  footerCopyrightText: ''
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

    // Lắng nghe sự kiện đồng bộ giữa các Tab trình duyệt (Admin lưu ở Tab 1 -> Tab 2 Khách nhận dữ liệu thật tức thì)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.museumName) {
            setBranding(parsed);
          }
        } catch {}
      }
    };

    // Khi người dùng chuyển tab quay lại trang (tab focus), tự động tải lại dữ liệu mới nhất từ server
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchBranding();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', fetchBranding);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', fetchBranding);
      }
    };
  }, []);

  // Tự động đồng bộ Tiêu đề Tab trình duyệt (document.title) & Favicon theo thương hiệu bảo tàng
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const name = branding.shortName || branding.museumName || 'Bảo tàng Di sản';
      document.title = `${name} - Hệ thống Tour 360 Không gian Di sản`;

      // Xác định Favicon mục tiêu: Dùng logo ảnh nếu có, nếu không thì dùng biểu trưng (emblem) chuẩn bảo tàng
      const hasCustomLogo = Boolean(branding.logoUrl && branding.logoUrl.trim());
      let targetIconUrl = '';
      if (hasCustomLogo) {
        targetIconUrl = branding.logoUrl!.trim();
      } else {
        const emblem = (branding.emblemText || 'BT').trim() || 'BT';
        const fontSize = emblem.length > 2 ? (emblem.length > 3 ? 18 : 22) : 28;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8C2D19"/><stop offset="100%" stop-color="#5A1A0C"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F3E5AB"/><stop offset="50%" stop-color="#D4A86A"/><stop offset="100%" stop-color="#AA7C39"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#bgGrad)"/><rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-opacity="0.85"/><text x="32" y="44" font-family="'Be Vietnam Pro', system-ui, -apple-system, sans-serif, Arial" font-size="${fontSize}" font-weight="800" text-anchor="middle" fill="#FFFFFF" letter-spacing="1">${emblem}</text></svg>`;
        targetIconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      }

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
