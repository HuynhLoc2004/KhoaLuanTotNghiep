import mongoose, { Schema, Document } from 'mongoose';

export type SpatialDirection =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'center'
  | 'up'
  | 'down'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

export type CompassDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'northeast'
  | 'northwest'
  | 'southeast'
  | 'southwest';

export interface IFloorPlanNode {
  id: string;
  roomId?: string; // Liên kết với MuseumRoom.id nếu có phòng 360° tương ứng
  code: string;    // Ví dụ: 'KHU-A', 'KHU-B', 'SANH-BAT-GIAC'
  name: string;    // Ví dụ: 'Thời Tiền Sử & Khởi Nguồn Dân Tộc'
  period?: string;
  category?: string;
  // Tọa độ chuẩn hóa theo tỷ lệ phần trăm (0 - 100%) trên mặt bằng
  x: number;
  y: number;
  width: number;
  height: number;
  isEntrance?: boolean;
  colorTag?: string;
  panoramaUrl?: string; // Dùng để chuyển vào Tour 360°
  thumbnailUrl?: string;
}

export interface IFloorPlanEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  direction: SpatialDirection;
  compassDirection: CompassDirection;
  doorX: number; // Tọa độ phần trăm (0-100%) của cánh cửa thông phòng
  doorY: number;
  label: string; // Ví dụ: 'Lối sang Gian Điêu khắc Chăm Pa'
  targetRoomName?: string;
  distance?: number;
  isReturn?: boolean;
}

export interface ICompassOrientation {
  detected: boolean;
  northAngleDeg: number;
  confidence: number;
  description: string;
}

export interface IFloorPlanMap extends Document {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageWidth: number;
  imageHeight: number;
  analyzedAt: Date;
  analysisAlgorithm: string;
  compassOrientation?: ICompassOrientation;
  nodes: IFloorPlanNode[];
  edges: IFloorPlanEdge[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FloorPlanNodeSchema = new Schema<IFloorPlanNode>({
  id: { type: String, required: true },
  roomId: { type: String },
  code: { type: String, required: true },
  name: { type: String, required: true },
  period: { type: String, default: '' },
  category: { type: String, default: '' },
  x: { type: Number, required: true, min: 0, max: 100 },
  y: { type: Number, required: true, min: 0, max: 100 },
  width: { type: Number, required: true, min: 1, max: 100 },
  height: { type: Number, required: true, min: 1, max: 100 },
  isEntrance: { type: Boolean, default: false },
  colorTag: { type: String, default: '#C5A880' },
  panoramaUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' }
}, { _id: false });

const FloorPlanEdgeSchema = new Schema<IFloorPlanEdge>({
  id: { type: String, required: true },
  fromNodeId: { type: String, required: true },
  toNodeId: { type: String, required: true },
  direction: {
    type: String,
    enum: ['front', 'back', 'left', 'right', 'center', 'up', 'down', 'northeast', 'northwest', 'southeast', 'southwest'],
    required: true
  },
  compassDirection: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest'],
    default: 'north'
  },
  doorX: { type: Number, required: true, min: 0, max: 100 },
  doorY: { type: Number, required: true, min: 0, max: 100 },
  label: { type: String, required: true },
  targetRoomName: { type: String, default: '' },
  distance: { type: Number, default: 0 },
  isReturn: { type: Boolean, default: false }
}, { _id: false });

const FloorPlanMapSchema = new Schema<IFloorPlanMap>({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: 'Sơ đồ mặt bằng & Mạng không gian kiến trúc' },
  description: { type: String, default: 'Mạng lưới liên kết không gian và cửa thông phòng được phân tích từ sơ đồ kiến trúc' },
  imageUrl: { type: String, default: '' },
  imageWidth: { type: Number, default: 1200 },
  imageHeight: { type: Number, default: 800 },
  analyzedAt: { type: Date, default: Date.now },
  analysisAlgorithm: { type: String, default: 'Sharp-Spatial-Topology-Engine-v1' },
  compassOrientation: {
    detected: { type: Boolean, default: false },
    northAngleDeg: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    description: { type: String, default: 'Hướng Bắc quy chuẩn (Phía trên)' }
  },
  nodes: [FloorPlanNodeSchema],
  edges: [FloorPlanEdgeSchema],
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

FloorPlanMapSchema.index({ id: 1 });
FloorPlanMapSchema.index({ active: 1 });

export const FloorPlanMapModel = mongoose.model<IFloorPlanMap>('FloorPlanMap', FloorPlanMapSchema);
