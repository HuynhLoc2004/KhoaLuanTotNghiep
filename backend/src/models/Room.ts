import mongoose, { Schema, Document } from 'mongoose';

export interface IHotspot {
  id: string;
  type: 'navigation' | 'info' | 'artifact';
  title: string;
  description?: string;
  targetRoomId?: string;
  artifactId?: string;
  pitch: number;
  yaw: number;
}

export interface IRoomTranslation {
  name?: string;
  period?: string;
  category?: string;
  description?: string;
  narrationScript?: string;
  audioUrl?: string;
  aiKnowledgePrompt?: string;
}

export interface IRoom extends Document {
  id: string;
  code: string;
  name: string;
  period: string;
  category?: string;
  description: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialView: {
    pitch: number;
    yaw: number;
    fov: number;
  };
  hotspots: IHotspot[];
  orderIndex: number;
  active: boolean;
  aiVoiceEnabled?: boolean;
  aiKnowledgePrompt?: string;
  aiScript?: string;
  aiVoiceLang?: string;
  qrScanCount?: number;
  scenesCount?: number;
  translations?: Record<string, IRoomTranslation>;
  createdAt: Date;
  updatedAt: Date;
}

const HotspotSchema = new Schema<IHotspot>({
  id: { type: String, required: true },
  type: { type: String, enum: ['navigation', 'info', 'artifact'], default: 'navigation' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetRoomId: { type: String },
  artifactId: { type: String, ref: 'Artifact' },
  pitch: { type: Number, required: true },
  yaw: { type: Number, required: true }
}, { _id: false });

const RoomSchema = new Schema<IRoom>({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  period: { type: String, default: 'Tiến trình Lịch sử VN' },
  category: { type: String, default: 'Tiến trình Lịch sử VN' },
  description: { type: String, default: '' },
  panoramaUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  initialView: {
    pitch: { type: Number, default: 0 },
    yaw: { type: Number, default: 0 },
    fov: { type: Number, default: 90 }
  },
  hotspots: [HotspotSchema],
  orderIndex: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
  aiVoiceEnabled: { type: Boolean, default: false },
  aiKnowledgePrompt: { type: String, default: '' },
  aiScript: { type: String, default: '' },
  aiVoiceLang: { type: String, default: 'vi-south' },
  qrScanCount: { type: Number, default: 0 },
  scenesCount: { type: Number, default: 1 },
  translations: {
    type: Map,
    of: new Schema({
      name: { type: String },
      period: { type: String },
      category: { type: String },
      description: { type: String },
      narrationScript: { type: String },
      audioUrl: { type: String },
      aiKnowledgePrompt: { type: String }
    }, { _id: false }),
    default: {}
  }
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

RoomSchema.index({ code: 1 });
RoomSchema.index({ orderIndex: 1 });
RoomSchema.index({ active: 1 });

export const RoomModel = mongoose.model<IRoom>('MuseumRoom', RoomSchema);
