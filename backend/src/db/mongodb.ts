import mongoose from 'mongoose';
import { RoomModel, IRoom, IHotspot } from '../models/Room.js';
import { cacheDel } from '../services/redis.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/museum';

const INITIAL_ROOMS = [
  {
    id: 'room-sanh-chinh',
    code: 'P-101',
    name: 'Sảnh Chính',
    period: 'Kiến trúc Đông Dương (1929)',
    description: 'Sảnh trung tâm đón tiếp khách tham quan Bảo tàng Lịch sử TP.HCM, nổi bật với kiến trúc bát giác cổ kính mang phong cách Đông Dương thời kỳ đầu.',
    panoramaUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: 0, fov: 90 },
    hotspots: [
      {
        id: 'hs-1',
        type: 'navigation' as const,
        title: 'Phòng Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -3,
        yaw: 42
      },
      {
        id: 'hs-2',
        type: 'info' as const,
        title: 'Văn bia kỷ niệm khánh thành (1929)',
        description: 'Ghi dấu lễ khánh thành ngày 01/01/1929 dưới tên gọi ban đầu Bảo tàng Blanchard de la Brosse.',
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
    name: 'Phòng Thời Tiền Sử',
    period: 'Thời đại Đồ đá & Đồ đồng',
    description: 'Trưng bày các hiện vật khảo cổ học từ Thời kỳ Đồ đá cũ, Đồ đá mới đến Thời đại Kim khí tại lưu vực sông Hồng và khu vực Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: -15, fov: 90 },
    hotspots: [
      {
        id: 'hs-3',
        type: 'navigation' as const,
        title: 'Sảnh Chính',
        targetRoomId: 'room-sanh-chinh',
        pitch: -4,
        yaw: 175
      },
      {
        id: 'hs-4',
        type: 'navigation' as const,
        title: 'Phòng Văn hóa Óc Eo – Phù Nam',
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
    name: 'Phòng Văn hóa Óc Eo – Phù Nam',
    period: 'Thế kỷ I – VII SCN',
    description: 'Bộ sưu tập cổ vật đồ trang sức vàng, gốm cổ và điêu khắc tượng Phật gỗ độc bản của nền văn minh Óc Eo cổ đại tại đồng bằng Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: 10, fov: 90 },
    hotspots: [
      {
        id: 'hs-5',
        type: 'navigation' as const,
        title: 'Phòng Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -2,
        yaw: -160
      },
      {
        id: 'hs-6',
        type: 'info' as const,
        title: 'Tượng Phật gỗ cổ Óc Eo (Bảo vật Quốc gia)',
        description: 'Tượng Phật gỗ có niên đại thế kỷ thứ 4, bảo quản nguyên vẹn trong tầng bùn cổ và được công nhận là Bảo vật Quốc gia.',
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

    // Dọn dẹp hoàn toàn các gian phòng mock chứa ảnh Unsplash ngẫu nhiên, không để dữ liệu rác tồn tại
    try {
      const deletedMock = await RoomModel.deleteMany({
        panoramaUrl: { $regex: /images\.unsplash\.com/i }
      });
      if (deletedMock.deletedCount > 0) {
        console.log(`[MongoDB] Đã dọn dẹp ${deletedMock.deletedCount} gian phòng mock Unsplash cũ để đồng bộ 100% dữ liệu thực từ Admin.`);
        try {
          await cacheDel('rooms:all');
        } catch {}
      }
    } catch (cleanErr) {
      console.warn('[MongoDB] Không thể dọn dẹp phòng mock Unsplash:', cleanErr);
    }
      // Tự động chuẩn hóa dữ liệu cũ mang tính AI / rườm rà sang thuật ngữ bảo tàng chuẩn mực
      try {
        await RoomModel.updateOne(
          { id: 'room-sanh-chinh', name: { $regex: /Sảnh Đón Khách/i } },
          {
            $set: {
              name: 'Sảnh Chính',
              period: 'Kiến trúc Đông Dương (1929)',
              description: 'Sảnh trung tâm đón tiếp khách tham quan Bảo tàng Lịch sử TP.HCM, nổi bật với kiến trúc bát giác cổ kính mang phong cách Đông Dương thời kỳ đầu.'
            }
          }
        );
        await RoomModel.updateOne(
          { id: 'room-tien-su', name: { $regex: /Gian Thời Tiền Sử/i } },
          {
            $set: {
              name: 'Phòng Thời Tiền Sử',
              period: 'Thời đại Đồ đá & Đồ đồng'
            }
          }
        );
        await RoomModel.updateOne(
          { id: 'room-oc-eo', name: { $regex: /Gian Văn Hóa/i } },
          {
            $set: {
              name: 'Phòng Văn hóa Óc Eo – Phù Nam',
              period: 'Thế kỷ I – VII SCN'
            }
          }
        );

        // Chuẩn hóa hotspot titles
        const allRooms = await RoomModel.find({});
        for (const r of allRooms) {
          let modified = false;
          const newHotspots = (r.hotspots || []).map((hs: any) => {
            let t = hs.title || '';
            const original = t;
            t = t.replace(/^Bước vào\s+/i, '');
            t = t.replace(/^Quay lại\s+Sảnh Đón Khách/i, 'Sảnh Chính');
            t = t.replace(/^Quay lại\s+/i, '');
            t = t.replace(/^Sang\s+/i, '');
            t = t.replace(/Gian Thời Tiền Sử/i, 'Phòng Thời Tiền Sử');
            t = t.replace(/Gian Văn Hóa Óc Eo\s*-\s*Phù Nam/i, 'Phòng Văn hóa Óc Eo – Phù Nam');
            t = t.replace(/Bia đá lưu niệm kiến trúc bảo tàng/i, 'Văn bia kỷ niệm khánh thành (1929)');
            t = t.replace(/Tượng Phật Gỗ Cổ Óc Eo/i, 'Tượng Phật gỗ cổ Óc Eo (Bảo vật Quốc gia)');
            if (t !== original) {
              modified = true;
              return { ...(hs.toObject ? hs.toObject() : hs), title: t };
            }
            return hs;
          });
          if (modified) {
            r.hotspots = newHotspots;
            await r.save();
          }
        }
      } catch (migrateErr) {
        console.warn('[MongoDB Migration Warning]:', migrateErr);
      }
  } catch (err: any) {
    console.error('[MongoDB] Lỗi kết nối MongoDB:', err.message);
  }
};
