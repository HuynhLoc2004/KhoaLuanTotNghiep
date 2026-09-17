import fs from 'fs';
import path from 'path';
import { MuseumRoom, Hotspot } from './types.js';

const DATA_FILE = path.join(process.cwd(), 'data_rooms.json');

// Dữ liệu mẫu chuẩn của Bảo tàng Lịch sử Thành phố Hồ Chí Minh
const INITIAL_ROOMS: MuseumRoom[] = [
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
        type: 'navigation',
        title: 'Bước vào Gian Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -3,
        yaw: 42
      },
      {
        id: 'hs-2',
        type: 'info',
        title: 'Bia đá lưu niệm kiến trúc bảo tàng',
        description: 'Được khánh thành năm 1929 dưới tên gọi Bảo tàng Blanchard de la Brosse.',
        pitch: 5,
        yaw: -60
      }
    ],
    orderIndex: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
        type: 'navigation',
        title: 'Quay lại Sảnh Đón Khách',
        targetRoomId: 'room-sanh-chinh',
        pitch: -4,
        yaw: 175
      },
      {
        id: 'hs-4',
        type: 'navigation',
        title: 'Sang Gian Văn Hóa Óc Eo - Phù Nam',
        targetRoomId: 'room-oc-eo',
        pitch: -2,
        yaw: 35
      }
    ],
    orderIndex: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
        type: 'navigation',
        title: 'Quay lại Gian Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -2,
        yaw: -160
      },
      {
        id: 'hs-6',
        type: 'info',
        title: 'Tượng Phật Gỗ Cổ Óc Eo',
        description: 'Bảo vật Quốc gia có niên đại thế kỷ thứ 4, bảo quản nguyên vẹn trong lớp bùn cổ.',
        pitch: 2,
        yaw: 25
      }
    ],
    orderIndex: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class RoomStore {
  private rooms: MuseumRoom[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.rooms = JSON.parse(raw);
      } else {
        this.rooms = INITIAL_ROOMS;
        this.save();
      }
    } catch {
      this.rooms = INITIAL_ROOMS;
    }
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.rooms, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data_rooms.json:', err);
    }
  }

  public getAll(): MuseumRoom[] {
    return [...this.rooms].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getById(id: string): MuseumRoom | undefined {
    return this.rooms.find(r => r.id === id);
  }

  public create(room: Omit<MuseumRoom, 'id' | 'createdAt' | 'updatedAt' | 'hotspots'>): MuseumRoom {
    const newRoom: MuseumRoom = {
      ...room,
      id: `room-${Date.now()}`,
      hotspots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.rooms.push(newRoom);
    this.save();
    return newRoom;
  }

  public update(id: string, patch: Partial<MuseumRoom>): MuseumRoom | null {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.rooms[index] = {
      ...this.rooms[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.rooms[index];
  }

  public delete(id: string): boolean {
    const prevLen = this.rooms.length;
    this.rooms = this.rooms.filter(r => r.id !== id);
    if (this.rooms.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public addHotspot(roomId: string, hotspot: Omit<Hotspot, 'id'>): Hotspot | null {
    const room = this.getById(roomId);
    if (!room) return null;
    const newHs: Hotspot = {
      ...hotspot,
      id: `hs-${Date.now()}`
    };
    room.hotspots.push(newHs);
    this.update(roomId, { hotspots: room.hotspots });
    return newHs;
  }

  public updateHotspot(roomId: string, hotspotId: string, patch: Partial<Hotspot>): Hotspot | null {
    const room = this.getById(roomId);
    if (!room) return null;
    const hsIndex = room.hotspots.findIndex(h => h.id === hotspotId);
    if (hsIndex === -1) return null;
    room.hotspots[hsIndex] = { ...room.hotspots[hsIndex], ...patch };
    this.update(roomId, { hotspots: room.hotspots });
    return room.hotspots[hsIndex];
  }

  public removeHotspot(roomId: string, hotspotId: string): boolean {
    const room = this.getById(roomId);
    if (!room) return null as unknown as boolean;
    const prev = room.hotspots.length;
    room.hotspots = room.hotspots.filter(h => h.id !== hotspotId);
    if (room.hotspots.length !== prev) {
      this.update(roomId, { hotspots: room.hotspots });
      return true;
    }
    return false;
  }
}

export const roomStore = new RoomStore();
