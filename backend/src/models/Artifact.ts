import mongoose, { Schema, Document } from 'mongoose';

export interface IArtifact extends Document {
  id: string;
  code: string;
  name: string;
  period: string;
  roomId?: string;
  material?: string;
  dimensions?: string;
  origin?: string;
  description: string;
  audioNarrationUrl?: string;
  audioText?: string;
  images360: string[];
  model3dUrl?: string;
  thumbnailUrl: string;
  qrCodeDataUrl?: string;
  qrTargetUrl?: string;
  featured: boolean;
  orderIndex: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ArtifactSchema = new Schema<IArtifact>({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  period: { type: String, default: 'Thời kỳ Cổ đại' },
  roomId: { type: String, default: '' },
  material: { type: String, default: '' },
  dimensions: { type: String, default: '' },
  origin: { type: String, default: 'Bảo tàng Lịch sử TP. Hồ Chí Minh' },
  description: { type: String, default: '' },
  audioNarrationUrl: { type: String, default: '' },
  audioText: { type: String, default: '' },
  images360: { type: [String], default: [] },
  model3dUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, required: true },
  qrCodeDataUrl: { type: String, default: '' },
  qrTargetUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  orderIndex: { type: Number, default: 1 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

export const ArtifactModel = mongoose.model<IArtifact>('MuseumArtifact', ArtifactSchema);
