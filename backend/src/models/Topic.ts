import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  id: string;
  name: string;
  description: string;
  orderIndex: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    orderIndex: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Tự động gán id nếu chưa có
TopicSchema.pre('validate', function () {
  if (!this.id && this.name) {
    const slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.id = slug || `topic-${Date.now()}`;
  }
});

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);

// 4 chuyên đề ban đầu của Bảo tàng Lịch sử TP.HCM để tự động nạp hạt nhân nếu DB trống
export const INITIAL_TOPICS = [
  {
    id: 'tien-trinh-lich-su-vn',
    name: 'Tiến trình Lịch sử VN',
    description: 'Từ thời Tiền sử, Dựng nước (Hùng Vương), Bắc thuộc, đến các triều đại Đinh - Lê - Lý - Trần - Lê - Nguyễn (1802 - 1945).',
    orderIndex: 1,
    active: true
  },
  {
    id: 'van-hoa-nam-bo-co-vat',
    name: 'Văn hóa Nam Bộ & Cổ vật',
    description: 'Văn hóa Óc Eo - Phù Nam, Nghệ thuật Champa, Văn hóa Khmer và Điêu khắc Phật giáo Nam Bộ.',
    orderIndex: 2,
    active: true
  },
  {
    id: 'suu-tap-dac-biet',
    name: 'Sưu tập Đặc biệt',
    description: 'Bộ sưu tập cổ vật quý do học giả Vương Hồng Sển hiến tặng, vũ khí, pháp lam và mỹ thuật cung đình.',
    orderIndex: 3,
    active: true
  },
  {
    id: 'thoi-ky-thanh-lap-kien-truc-dong-duong',
    name: 'Thời kỳ Thành lập & Kiến trúc Đông Dương',
    description: 'Lịch sử thành lập bảo tàng năm 1929 và phong cách kiến trúc Đông Dương (Indochine).',
    orderIndex: 4,
    active: true
  }
];
