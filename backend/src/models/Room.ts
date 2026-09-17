import mongoose, { Schema, Document } from 'mongoose';

export interface IHotspot {
  id: string;
  type: 'navigation' | 'info';
  title: string;
  description?: string;
  targetRoomId?: string;
  pitch: number;
  yaw: number;
}

export interface IRoom extends Document {
  id: string;
  code: string;
  name: string;
  period: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const HotspotSchema = new Schema<IHotspot>({
  id: { type: String, required: true },
  type: { type: String, enum: ['navigation', 'info'], default: 'navigation' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetRoomId: { type: String },
  pitch: { type: Number, required: true },
  yaw: { type: Number, required: true }
}, { _id: false });

const RoomSchema = new Schema<IRoom>({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  period: { type: String, default: 'Hiện vật Lịch sử' },
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

export const RoomModel = mongoose.model<IRoom>('MuseumRoom', RoomSchema);
