import mongoose, { Schema, Document } from 'mongoose';
import { cacheGet, cacheSet } from '../services/redis.js';

export interface IHeaderSubMenuItem {
  id: string;
  label: string;
  linkType: 'page' | 'anchor' | 'custom';
  target: string;
  active: boolean;
  isNewTab?: boolean;
}

export interface IHeaderMenuItem {
  id: string;
  label: string;
  linkType: 'page' | 'anchor' | 'custom' | 'dropdown_only';
  target: string;
  active: boolean;
  isNewTab?: boolean;
  order: number;
  children?: IHeaderSubMenuItem[];
}

export interface ISystemBranding extends Document {
  museumName: string;
  shortName: string;
  emblemText: string;
  logoUrl?: string;
  tagline: string;
  city: string;
  address: string;
  contactEmail: string;
  hotline: string;
  emailSenderName: string;
  // Header Dynamic Menu Items (Hỗ trợ Dropdown đa cấp)
  headerMenuItems?: IHeaderMenuItem[];
  // Hero Showcase
  heroTitle?: string;
  heroTagline?: string;
  heroBannerUrl?: string;
  heroVideoUrl?: string;
  heroCta1Text?: string;
  heroCta2Text?: string;
  // Intro Section
  introTag?: string;
  introTitle?: string;
  introDesc?: string;
  introBadgeText?: string;
  introImageUrl?: string;
  introCtaText?: string;
  // Rooms Section
  roomsTag?: string;
  roomsTitle?: string;
  roomsDesc?: string;
  roomsCtaText?: string;
  roomsFeaturedId?: string;
  roomsShowcaseImageUrl?: string;
  // Artifacts Section
  artifactsTag?: string;
  artifactsTitle?: string;
  artifactsDesc?: string;
  artifactsCtaText?: string;
  artifactsFeaturedId?: string;
  artifactsShowcaseImageUrl?: string;
  // Guide & Floor Plan Section
  guideTag?: string;
  guideTitle?: string;
  guideDesc?: string;
  guideCtaText?: string;
  guideMapUrl?: string;
  guideMapTitle?: string;
  guideMapDesc?: string;
  // Thông tin thực địa & Bản đồ Google Maps do Admin quản lý
  guideOpeningDays?: string;
  guideMorningHours?: string;
  guideAfternoonHours?: string;
  guideClosedNote?: string;
  guideTicketAdult?: string;
  guideTicketStudent?: string;
  guideTicketChild?: string;
  guideBusRoutes?: string;
  guideParkingInfo?: string;
  guideGoogleMapsUrl?: string;
  guideGoogleMapsEmbed?: string;
  guideRule1Title?: string;
  guideRule1Desc?: string;
  guideRule2Title?: string;
  guideRule2Desc?: string;
  guideRule3Title?: string;
  guideRule3Desc?: string;
  guideRule4Title?: string;
  guideRule4Desc?: string;
  // Footer
  footerCopyrightText?: string;
  updatedAt: Date;
  updatedBy: string;
}

const SystemBrandingSchema = new Schema<ISystemBranding>(
  {
    museumName: {
      type: String,
      required: true,
      trim: true,
      default: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh'
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
      default: 'Bảo tàng Lịch sử'
    },
    emblemText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6,
      default: 'BT'
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true
    },
    tagline: {
      type: String,
      trim: true,
      default: 'Hệ thống Tour 360 Không gian Di sản'
    },
    city: {
      type: String,
      trim: true,
      default: 'TP. Hồ Chí Minh'
    },
    address: {
      type: String,
      trim: true,
      default: 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
    },
    contactEmail: {
      type: String,
      trim: true,
      default: 'huynhtanlocpp09@gmail.com'
    },
    hotline: {
      type: String,
      trim: true,
      default: '(028) 3829 8146'
    },
    emailSenderName: {
      type: String,
      trim: true,
      default: 'Bảo Tàng Lịch Sử TP.HCM'
    },
    // Header Dynamic Menu Items (Hỗ trợ Dropdown đa cấp)
    headerMenuItems: {
      type: Array,
      default: () => [
        {
          id: 'menu-intro',
          label: 'Giới thiệu',
          linkType: 'anchor',
          target: 'intro',
          active: true,
          order: 1,
          children: []
        },
        {
          id: 'menu-rooms',
          label: 'Gian phòng 360°',
          linkType: 'page',
          target: 'rooms',
          active: true,
          order: 2,
          children: []
        },
        {
          id: 'menu-artifacts',
          label: 'Cổ vật 3D',
          linkType: 'page',
          target: 'artifacts',
          active: true,
          order: 3,
          children: []
        },
        {
          id: 'menu-guide',
          label: 'Tham quan',
          linkType: 'page',
          target: 'guide',
          active: true,
          order: 4,
          children: []
        }
      ]
    },
    // Hero Showcase
    heroTitle: {
      type: String,
      trim: true,
      default: 'Bảo tàng Lịch sử TP. Hồ Chí Minh'
    },
    heroTagline: {
      type: String,
      trim: true,
      default: 'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.'
    },
    heroBannerUrl: {
      type: String,
      trim: true,
      default: ''
    },
    heroVideoUrl: {
      type: String,
      trim: true,
      default: ''
    },
    heroCta1Text: {
      type: String,
      trim: true,
      default: 'Bắt Đầu Tour 360°'
    },
    heroCta2Text: {
      type: String,
      trim: true,
      default: 'Chiêm Ngưỡng Cổ Vật 3D'
    },
    // Intro Section
    introTag: {
      type: String,
      trim: true,
      default: 'Kiến Trúc & Không Gian'
    },
    introTitle: {
      type: String,
      trim: true,
      default: 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh'
    },
    introDesc: {
      type: String,
      trim: true,
      default: 'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.'
    },
    introBadgeText: {
      type: String,
      trim: true,
      default: 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia'
    },
    introImageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    introCtaText: {
      type: String,
      trim: true,
      default: 'Khám phá gian trưng bày'
    },
    // Rooms Section
    roomsTag: {
      type: String,
      trim: true,
      default: 'Không Gian Thực Tế Ảo'
    },
    roomsTitle: {
      type: String,
      trim: true,
      default: 'Hệ Thống Gian Phòng Tour 360°'
    },
    roomsDesc: {
      type: String,
      trim: true,
      default: 'Khám phá toàn cảnh các không gian trưng bày qua ảnh toàn cảnh 360° sắc nét. Khách tham quan có thể di chuyển xuyên suốt giữa các phòng, tương tác với các điểm chú thích hiện vật và nghe thuyết minh lịch sử.'
    },
    roomsCtaText: {
      type: String,
      trim: true,
      default: 'Khám phá tất cả gian phòng 360°'
    },
    roomsFeaturedId: {
      type: String,
      trim: true,
      default: ''
    },
    roomsShowcaseImageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    // Artifacts Section
    artifactsTag: {
      type: String,
      trim: true,
      default: 'Bảo Vật Di Sản & Mô Hình 3D'
    },
    artifactsTitle: {
      type: String,
      trim: true,
      default: 'Kho Tàng Cổ Vật & Bảo Vật Di Sản'
    },
    artifactsDesc: {
      type: String,
      trim: true,
      default: 'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác và hệ thống thuyết minh âm thanh đa ngôn ngữ.'
    },
    artifactsCtaText: {
      type: String,
      trim: true,
      default: 'Khám phá toàn bộ kho hiện vật'
    },
    artifactsFeaturedId: {
      type: String,
      trim: true,
      default: ''
    },
    artifactsShowcaseImageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    // Guide & Floor Plan Section
    guideTag: {
      type: String,
      trim: true,
      default: 'Kế Hoạch & Sơ Đồ'
    },
    guideTitle: {
      type: String,
      trim: true,
      default: 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa'
    },
    guideDesc: {
      type: String,
      trim: true,
      default: 'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.'
    },
    guideCtaText: {
      type: String,
      trim: true,
      default: 'Xem cẩm nang & sơ đồ tham quan'
    },
    guideMapUrl: {
      type: String,
      default: '',
      trim: true
    },
    guideMapTitle: {
      type: String,
      default: 'Sơ đồ mặt bằng các gian trưng bày',
      trim: true
    },
    guideMapDesc: {
      type: String,
      default: 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM',
      trim: true
    },
    // Thông tin thực địa & Bản đồ Google Maps do Admin quản lý
    guideOpeningDays: {
      type: String,
      default: 'Thứ Ba – Chủ Nhật',
      trim: true
    },
    guideMorningHours: {
      type: String,
      default: '08:00 – 11:30',
      trim: true
    },
    guideAfternoonHours: {
      type: String,
      default: '13:30 – 17:00',
      trim: true
    },
    guideClosedNote: {
      type: String,
      default: 'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật.',
      trim: true
    },
    guideTicketAdult: {
      type: String,
      default: '30.000 ₫',
      trim: true
    },
    guideTicketStudent: {
      type: String,
      default: '15.000 ₫',
      trim: true
    },
    guideTicketChild: {
      type: String,
      default: 'Miễn phí',
      trim: true
    },
    guideBusRoutes: {
      type: String,
      default: 'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.',
      trim: true
    },
    guideParkingInfo: {
      type: String,
      default: 'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.',
      trim: true
    },
    guideGoogleMapsUrl: {
      type: String,
      default: 'https://maps.app.goo.gl/3f9m4xVjM8k3E4wz9',
      trim: true
    },
    guideGoogleMapsEmbed: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.2974959146194!2d106.70295171120286!3d10.788506858925585!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4ae1b9338f%3A0x6b09337ec5c8d626!2zQuG6o28gdMOgbmcgTOG7i2NoIHPhu60gVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn',
      trim: true
    },
    guideRule1Title: {
      type: String,
      default: 'Quét mã QR tại tủ hiện vật',
      trim: true
    },
    guideRule1Desc: {
      type: String,
      default: 'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.',
      trim: true
    },
    guideRule2Title: {
      type: String,
      default: 'Thuyết minh Audio Guide song ngữ',
      trim: true
    },
    guideRule2Desc: {
      type: String,
      default: 'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.',
      trim: true
    },
    guideRule3Title: {
      type: String,
      default: 'Bảo quản di sản & Hiện vật',
      trim: true
    },
    guideRule3Desc: {
      type: String,
      default: 'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.',
      trim: true
    },
    guideRule4Title: {
      type: String,
      default: 'Trang phục & Văn minh tham quan',
      trim: true
    },
    guideRule4Desc: {
      type: String,
      default: 'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.',
      trim: true
    },
    // Footer
    footerCopyrightText: {
      type: String,
      trim: true,
      default: ''
    },
    updatedBy: {
      type: String,
      default: 'Hệ thống'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const SystemBranding = mongoose.model<ISystemBranding>('SystemBranding', SystemBrandingSchema);

export const REDIS_BRANDING_KEY = 'system:branding:config';

export const DEFAULT_HEADER_MENU: IHeaderMenuItem[] = [
  {
    id: 'menu-intro',
    label: 'Giới thiệu',
    linkType: 'anchor',
    target: 'intro',
    active: true,
    order: 1,
    children: []
  },
  {
    id: 'menu-rooms',
    label: 'Gian phòng 360°',
    linkType: 'page',
    target: 'rooms',
    active: true,
    order: 2,
    children: []
  },
  {
    id: 'menu-artifacts',
    label: 'Cổ vật 3D',
    linkType: 'page',
    target: 'artifacts',
    active: true,
    order: 3,
    children: []
  },
  {
    id: 'menu-guide',
    label: 'Tham quan',
    linkType: 'page',
    target: 'guide',
    active: true,
    order: 4,
    children: []
  }
];

export const DEFAULT_BRANDING = {
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
  artifactsFeaturedId: '',
  artifactsShowcaseImageUrl: '',
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
  footerCopyrightText: '',
  updatedBy: 'Hệ thống'
};

/**
 * Lấy cấu hình nhận diện thương hiệu hiện tại của Bảo tàng.
 * Ưu tiên đọc từ Redis cache (<1ms), fallback sang MongoDB, nếu chưa có thì khởi tạo bản ghi mẫu.
 */
export async function getSystemBrandingConfig(): Promise<any> {
  try {
    const cached = await cacheGet<any>(REDIS_BRANDING_KEY);
    if (cached && cached.museumName) {
      if (!cached.headerMenuItems || cached.headerMenuItems.length === 0) {
        cached.headerMenuItems = DEFAULT_HEADER_MENU;
      }
      return cached;
    }
  } catch {
    // Redis lỗi không làm gián đoạn hệ thống
  }

  try {
    let branding = await SystemBranding.findOne().lean();

    // Phục hồi dữ liệu hai chiều giữa PostgreSQL (Primary) và MongoDB (Mirror)
    try {
      const { pgPool } = await import('../db/postgres.js');
      const pgRes = await pgPool.query('SELECT * FROM system_branding ORDER BY updated_at DESC LIMIT 1;');
      if (pgRes.rows.length > 0) {
        const row = pgRes.rows[0];
        const pgData = typeof row.data === 'string' ? JSON.parse(row.data || '{}') : (row.data || {});
        const pgUpdatedAt = row.updated_at ? new Date(row.updated_at).getTime() : 0;
        const mongoUpdatedAt = branding?.updatedAt ? new Date(branding.updatedAt).getTime() : 0;

        // Nếu PostgreSQL có cập nhật mới hơn MongoDB hoặc MongoDB chưa có dữ liệu hoàn chỉnh
        if (!branding || pgUpdatedAt >= mongoUpdatedAt) {
          const merged: Record<string, any> = {
            ...DEFAULT_BRANDING,
            ...pgData,
            museumName: row.museum_name || pgData.museumName || DEFAULT_BRANDING.museumName,
            shortName: row.short_name || pgData.shortName || DEFAULT_BRANDING.shortName,
            emblemText: row.emblem_text || pgData.emblemText || DEFAULT_BRANDING.emblemText,
            logoUrl: row.logo_url ?? pgData.logoUrl ?? '',
            tagline: row.tagline || pgData.tagline || DEFAULT_BRANDING.tagline,
            city: row.city || pgData.city || DEFAULT_BRANDING.city,
            address: row.address || pgData.address || DEFAULT_BRANDING.address,
            contactEmail: row.contact_email || pgData.contactEmail || DEFAULT_BRANDING.contactEmail,
            hotline: row.hotline || pgData.hotline || DEFAULT_BRANDING.hotline,
            headerMenuItems: typeof row.header_menu_items === 'string' ? JSON.parse(row.header_menu_items) : (row.header_menu_items || pgData.headerMenuItems || DEFAULT_HEADER_MENU),
            heroTitle: row.hero_title || pgData.heroTitle || DEFAULT_BRANDING.heroTitle,
            heroTagline: row.hero_tagline || pgData.heroTagline || DEFAULT_BRANDING.heroTagline,
            heroBannerUrl: row.hero_banner_url ?? pgData.heroBannerUrl ?? '',
            heroVideoUrl: row.hero_video_url ?? pgData.heroVideoUrl ?? '',
            heroCta1Text: pgData.heroCta1Text || DEFAULT_BRANDING.heroCta1Text,
            heroCta2Text: pgData.heroCta2Text || DEFAULT_BRANDING.heroCta2Text,
            introTag: pgData.introTag || DEFAULT_BRANDING.introTag,
            introTitle: row.intro_title || pgData.introTitle || DEFAULT_BRANDING.introTitle,
            introDesc: row.intro_desc || pgData.introDesc || DEFAULT_BRANDING.introDesc,
            introBadgeText: pgData.introBadgeText || DEFAULT_BRANDING.introBadgeText,
            introImageUrl: row.intro_image_url ?? pgData.introImageUrl ?? '',
            introCtaText: pgData.introCtaText || DEFAULT_BRANDING.introCtaText,
            roomsTag: pgData.roomsTag || DEFAULT_BRANDING.roomsTag,
            roomsTitle: pgData.roomsTitle || DEFAULT_BRANDING.roomsTitle,
            roomsDesc: pgData.roomsDesc || DEFAULT_BRANDING.roomsDesc,
            roomsCtaText: pgData.roomsCtaText || DEFAULT_BRANDING.roomsCtaText,
            roomsFeaturedId: pgData.roomsFeaturedId || '',
            roomsShowcaseImageUrl: pgData.roomsShowcaseImageUrl || '',
            artifactsTag: pgData.artifactsTag || DEFAULT_BRANDING.artifactsTag,
            artifactsTitle: pgData.artifactsTitle || DEFAULT_BRANDING.artifactsTitle,
            artifactsDesc: pgData.artifactsDesc || DEFAULT_BRANDING.artifactsDesc,
            artifactsCtaText: pgData.artifactsCtaText || DEFAULT_BRANDING.artifactsCtaText,
            guideTag: pgData.guideTag || DEFAULT_BRANDING.guideTag,
            guideTitle: pgData.guideTitle || DEFAULT_BRANDING.guideTitle,
            guideDesc: pgData.guideDesc || DEFAULT_BRANDING.guideDesc,
            guideCtaText: pgData.guideCtaText || DEFAULT_BRANDING.guideCtaText,
            guideMapUrl: row.guide_map_url ?? pgData.guideMapUrl ?? '',
            guideMapTitle: row.guide_map_title || pgData.guideMapTitle || DEFAULT_BRANDING.guideMapTitle,
            guideMapDesc: row.guide_map_desc || pgData.guideMapDesc || DEFAULT_BRANDING.guideMapDesc,
            guideOpeningDays: row.guide_opening_days || pgData.guideOpeningDays || DEFAULT_BRANDING.guideOpeningDays,
            guideMorningHours: row.guide_morning_hours || pgData.guideMorningHours || DEFAULT_BRANDING.guideMorningHours,
            guideAfternoonHours: row.guide_afternoon_hours || pgData.guideAfternoonHours || DEFAULT_BRANDING.guideAfternoonHours,
            guideClosedNote: row.guide_closed_note || pgData.guideClosedNote || DEFAULT_BRANDING.guideClosedNote,
            guideTicketAdult: row.guide_ticket_adult || pgData.guideTicketAdult || DEFAULT_BRANDING.guideTicketAdult,
            guideTicketStudent: row.guide_ticket_student || pgData.guideTicketStudent || DEFAULT_BRANDING.guideTicketStudent,
            guideTicketChild: row.guide_ticket_child || pgData.guideTicketChild || DEFAULT_BRANDING.guideTicketChild,
            guideBusRoutes: row.guide_bus_routes || pgData.guideBusRoutes || DEFAULT_BRANDING.guideBusRoutes,
            guideParkingInfo: row.guide_parking_info || pgData.guideParkingInfo || DEFAULT_BRANDING.guideParkingInfo,
            guideGoogleMapsUrl: row.guide_google_maps_url || pgData.guideGoogleMapsUrl || DEFAULT_BRANDING.guideGoogleMapsUrl,
            guideGoogleMapsEmbed: pgData.guideGoogleMapsEmbed || DEFAULT_BRANDING.guideGoogleMapsEmbed,
            guideRule1Title: pgData.guideRule1Title || DEFAULT_BRANDING.guideRule1Title,
            guideRule1Desc: pgData.guideRule1Desc || DEFAULT_BRANDING.guideRule1Desc,
            guideRule2Title: pgData.guideRule2Title || DEFAULT_BRANDING.guideRule2Title,
            guideRule2Desc: pgData.guideRule2Desc || DEFAULT_BRANDING.guideRule2Desc,
            guideRule3Title: pgData.guideRule3Title || DEFAULT_BRANDING.guideRule3Title,
            guideRule3Desc: pgData.guideRule3Desc || DEFAULT_BRANDING.guideRule3Desc,
            guideRule4Title: pgData.guideRule4Title || DEFAULT_BRANDING.guideRule4Title,
            guideRule4Desc: pgData.guideRule4Desc || DEFAULT_BRANDING.guideRule4Desc,
            footerCopyrightText: pgData.footerCopyrightText || ''
          };
          await SystemBranding.updateOne({}, { $set: merged }, { upsert: true });
          branding = await SystemBranding.findOne().lean();
        } else if (branding && mongoUpdatedAt > pgUpdatedAt) {
          const { pgUpsertBranding } = await import('../db/syncEngine.js');
          await pgUpsertBranding(branding);
        }
      }
    } catch (pgErr: any) {
      console.warn('[SystemBranding PG Fallback Warning]:', pgErr.message);
    }

    if (!branding) {
      const created = await SystemBranding.create(DEFAULT_BRANDING);
      branding = created.toObject();
    }

    if (!branding.headerMenuItems || branding.headerMenuItems.length === 0) {
      branding.headerMenuItems = DEFAULT_HEADER_MENU;
    }

    try {
      await cacheSet(REDIS_BRANDING_KEY, branding, 86400); // 24h
    } catch {}

    return branding;
  } catch (err) {
    console.error('[SystemBranding] Lỗi nạp cấu hình thương hiệu từ MongoDB:', err);
    return DEFAULT_BRANDING;
  }
}
