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
  guideMapUrl?: string;
  guideMapTitle?: string;
  guideMapDesc?: string;
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
  guideMapUrl: '',
  guideMapTitle: 'Sơ đồ mặt bằng các gian trưng bày',
  guideMapDesc: 'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM',
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
