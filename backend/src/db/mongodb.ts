import mongoose from 'mongoose';
import { RoomModel, IRoom, IHotspot } from '../models/Room.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/museum';

const INITIAL_ROOMS = [
  {
    id: 'room-sanh-chinh',
    code: 'P-101',
    name: 'Sảnh Đón Khách & Giới Thiệu Tổng Thể',
    period: 'Thời kỳ Thành lập & Kiến trúc Đông Dương',
    description: 'Sảnh chính đón tiếp khách tham quan Bảo tàng Lịch sử TP.HCM với kiến trúc bát giác đặc trưng kết hợp phong cách Đông Dương cổ kính.',
    panoramaUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    hotspots: [
      {
        id: 'hs-1',
        type: 'navigation' as const,
        title: 'Bước vào Gian Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -3,
        yaw: 42
      },
      {
        id: 'hs-2',
        type: 'info' as const,
        title: 'Bia đá lưu niệm kiến trúc bảo tàng',
        description: 'Được khánh thành năm 1929 dưới tên gọi Bảo tàng Blanchard de la Brosse.',
        pitch: 5,
        yaw: -60
      }
    ],
    orderIndex: 1,
    active: true
  },
  {
    id: 'room-tien-su',
    code: 'P-102',
    name: 'Gian Thời Tiền Sử Việt Nam',
    period: 'Thời kỳ Đồ Đá & Đồ Đồng (Cách nay hàng ngàn năm)',
    description: 'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí tại lưu vực sông Hồng và Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: -15, fov: 90 },
    hotspots: [
      {
        id: 'hs-3',
        type: 'navigation' as const,
        title: 'Quay lại Sảnh Đón Khách',
        targetRoomId: 'room-sanh-chinh',
        pitch: -4,
        yaw: 175
      },
      {
        id: 'hs-4',
        type: 'navigation' as const,
        title: 'Sang Gian Văn Hóa Óc Eo - Phù Nam',
        targetRoomId: 'room-oc-eo',
        pitch: -2,
        yaw: 35
      }
    ],
    orderIndex: 2,
    active: true
  },
  {
    id: 'room-oc-eo',
    code: 'P-103',
    name: 'Gian Văn Hóa Óc Eo & Vương Quốc Phù Nam',
    period: 'Thế kỷ I đến Thế kỷ VII sau Công nguyên',
    description: 'Bộ sưu tập cổ vật đồ trang sức bằng vàng, tượng Phật bằng gỗ và gốm sứ độc bản của nền văn minh cổ Óc Eo ở Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: 10, fov: 90 },
    hotspots: [
      {
        id: 'hs-5',
        type: 'navigation' as const,
        title: 'Quay lại Gian Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -2,
        yaw: -160
      },
      {
        id: 'hs-6',
        type: 'info' as const,
        title: 'Tượng Phật Gỗ Cổ Óc Eo',
        description: 'Bảo vật Quốc gia có niên đại thế kỷ thứ 4, bảo quản nguyên vẹn trong lớp bùn cổ.',
        pitch: 2,
        yaw: 25
      }
    ],
    orderIndex: 3,
    active: true
  }
];

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[MongoDB] Đã kết nối cơ sở dữ liệu thực thành công tại: ${MONGO_URI}`);

    // Seed if empty
    const count = await RoomModel.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Khởi tạo dữ liệu các gian phòng Bảo tàng Lịch sử TP.HCM...');
      await RoomModel.insertMany(INITIAL_ROOMS);
      console.log('[MongoDB] Đã nạp thành công dữ liệu khởi tạo vào MongoDB!');
    }
  } catch (err: any) {
    console.error('[MongoDB] Lỗi kết nối MongoDB:', err.message);
  }
};
