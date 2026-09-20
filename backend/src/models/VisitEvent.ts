import mongoose, { Schema, Document } from 'mongoose';

export type VisitEventType =
  | 'page_view'
  | 'room_view'
  | 'tour_start'
  | 'qr_scan'
  | 'audio_play';

export interface IVisitEvent extends Document {
  type: VisitEventType;
  /** Định danh phiên, đổi mỗi lần mở lại trình duyệt. Không gắn với danh tính. */
  sessionId: string;
  /** Định danh thiết bị ẩn danh, dùng để đếm khách duy nhất. Không gắn với danh tính. */
  visitorId: string;
  /** Có tài khoản đăng nhập hay không. Hiện luôn false vì hệ thống chưa có đăng nhập. */
  isAuthenticated: boolean;
  /** Mã tài khoản khi đã đăng nhập. Không lưu email, tên hay bất kỳ thông tin cá nhân nào. */
  userRef?: string | null;
  roomId?: string | null;
  langCode?: string | null;
  path?: string | null;
  /** 'mobile' | 'tablet' | 'desktop', suy ra từ User-Agent ngay lúc nhận. */
  device?: string | null;
  createdAt: Date;
}

const VisitEventSchema = new Schema<IVisitEvent>(
  {
    type: {
      type: String,
      required: true,
      enum: ['page_view', 'room_view', 'tour_start', 'qr_scan', 'audio_play'],
      index: true
    },
    sessionId: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    isAuthenticated: { type: Boolean, default: false, index: true },
    userRef: { type: String, default: null },
    roomId: { type: String, default: null, index: true },
    langCode: { type: String, default: null },
    path: { type: String, default: null },
    device: { type: String, default: null }
  },
  {
    // Chỉ cần createdAt; sự kiện là bản ghi bất biến, không bao giờ sửa.
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Truy vấn chính luôn là "các sự kiện trong N ngày gần đây", nên index theo thời gian giảm dần.
VisitEventSchema.index({ createdAt: -1 });
VisitEventSchema.index({ createdAt: -1, isAuthenticated: 1 });

/**
 * Tự xóa bản ghi sau 400 ngày.
 *
 * Nhật ký truy cập phình rất nhanh và dữ liệu quá một năm không còn giá trị báo cáo.
 * Giữ 400 ngày là đủ để so sánh cùng kỳ năm trước rồi tự dọn.
 */
VisitEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 400 * 24 * 60 * 60 });

export const VisitEventModel =
  mongoose.models.VisitEvent ||
  mongoose.model<IVisitEvent>('VisitEvent', VisitEventSchema);
