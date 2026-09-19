import mongoose, { Schema, Document } from 'mongoose';

export interface IPanorama extends Document {
  id: string;
  filename: string;
  title: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  localUrl?: string;
  cloudinaryUrl?: string;
  r2Url?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  sizeBytes?: number;
  inputFramesCount?: number;
  status: 'ready' | 'processing' | 'failed';
  linkedRoomId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PanoramaSchema = new Schema<IPanorama>({
  id: { type: String, required: true, unique: true },
  filename: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: 'Không gian toàn cảnh 360°' },
  panoramaUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  localUrl: { type: String },
  cloudinaryUrl: { type: String },
  r2Url: { type: String },
  width: { type: Number, default: 4096 },
  height: { type: Number, default: 2048 },
  aspectRatio: { type: Number, default: 2.0 },
  sizeBytes: { type: Number, default: 0 },
  inputFramesCount: { type: Number, default: 0 },
  status: { type: String, enum: ['ready', 'processing', 'failed'], default: 'ready' },
  linkedRoomId: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: any) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const PanoramaModel = mongoose.models.Panorama || mongoose.model<IPanorama>('Panorama', PanoramaSchema);
