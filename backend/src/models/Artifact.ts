import mongoose, { Schema, Document } from 'mongoose';

export interface IArtifactTranslation {
  name?: string;
  period?: string;
  category?: string;
  origin?: string;
  description?: string;
  audioNarrationUrl?: string;
}

export interface IArtifactMetadata {
  vertices?: number;
  faces?: number;
  sizeBytes?: number;
  width?: number;
  height?: number;
  depth?: number;
  generatedAt?: Date;
  inputImageSha256?: string;
}

export interface IArtifact extends Document {
  id: string;
  code: string;
  name: string;
  category: string;
  period: string;
  origin: string;
  description: string;
  dimensions?: string;
  images: string[];
  thumbnailUrl: string;
  model3dUrl?: string;
  audioNarrationUrl?: string;
  voiceLanguage?: string;
  qrCodeUrl?: string;
  status: 'active' | 'archived' | 'draft';
  processingStatus: 'idle' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  modelMetadata?: IArtifactMetadata;
  translations?: Record<string, IArtifactTranslation>;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArtifactSchema = new Schema<IArtifact>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: 'Cổ vật di sản', trim: true },
    period: { type: String, default: 'Thời cổ', trim: true },
    origin: { type: String, default: 'Bảo tàng Lịch sử TP.HCM', trim: true },
    description: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    images: { type: [String], default: [] },
    thumbnailUrl: { type: String, default: '' },
    model3dUrl: { type: String, default: '' },
    audioNarrationUrl: { type: String, default: '' },
    voiceLanguage: { type: String, default: 'vi' },
    qrCodeUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'archived', 'draft'], default: 'active' },
    processingStatus: { type: String, enum: ['idle', 'processing', 'completed', 'failed'], default: 'idle' },
    processingError: { type: String, default: '' },
    modelMetadata: {
      vertices: { type: Number, default: 0 },
      faces: { type: Number, default: 0 },
      sizeBytes: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
      generatedAt: { type: Date },
      inputImageSha256: { type: String, default: '' }
    },
    translations: { type: Schema.Types.Mixed, default: {} },
    orderIndex: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const ArtifactModel = mongoose.model<IArtifact>('Artifact', ArtifactSchema);
