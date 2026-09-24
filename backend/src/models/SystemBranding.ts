import mongoose, { Schema, Document } from 'mongoose';
import { cacheGet, cacheSet } from '../services/redis.js';

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
  // Artifacts Section
  artifactsTag?: string;
  artifactsTitle?: string;
  artifactsDesc?: string;
  artifactsCtaText?: string;
  // Guide & Floor Plan Section
  guideTag?: string;
  guideTitle?: string;
  guideDesc?: string;
  guideCtaText?: string;
  guideMapUrl?: string;
  guideMapTitle?: string;
  guideMapDesc?: string;
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
      return cached;
    }
  } catch {
    // Redis lỗi không làm gián đoạn hệ thống
  }

  try {
    let branding = await SystemBranding.findOne().lean();
    if (!branding) {
      const created = await SystemBranding.create(DEFAULT_BRANDING);
      branding = created.toObject();
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
