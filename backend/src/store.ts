import fs from 'fs';
import path from 'path';
import { MuseumRoom, Hotspot } from './types.js';

const DATA_FILE = path.join(process.cwd(), 'data_rooms.json');

// Dữ liệu mẫu chuẩn của Bảo tàng Lịch sử Thành phố Hồ Chí Minh
const INITIAL_ROOMS: MuseumRoom[] = [
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
        type: 'navigation',
        title: 'Phòng Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -3,
        yaw: 42
      },
      {
        id: 'hs-2',
        type: 'info',
        title: 'Văn bia kỷ niệm khánh thành (1929)',
        description: 'Ghi dấu lễ khánh thành ngày 01/01/1929 dưới tên gọi ban đầu Bảo tàng Blanchard de la Brosse.',
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
    name: 'Phòng Thời Tiền Sử',
    period: 'Thời đại Đồ đá & Đồ đồng',
    description: 'Trưng bày các hiện vật khảo cổ học từ Thời kỳ Đồ đá cũ, Đồ đá mới đến Thời đại Kim khí tại lưu vực sông Hồng và khu vực Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: -15, fov: 90 },
    hotspots: [
      {
        id: 'hs-3',
        type: 'navigation',
        title: 'Sảnh Chính',
        targetRoomId: 'room-sanh-chinh',
        pitch: -4,
        yaw: 175
      },
      {
        id: 'hs-4',
        type: 'navigation',
        title: 'Phòng Văn hóa Óc Eo – Phù Nam',
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
    name: 'Phòng Văn hóa Óc Eo – Phù Nam',
    period: 'Thế kỷ I – VII SCN',
    description: 'Bộ sưu tập cổ vật đồ trang sức vàng, gốm cổ và điêu khắc tượng Phật gỗ độc bản của nền văn minh Óc Eo cổ đại tại đồng bằng Nam Bộ.',
    panoramaUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=2400&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80',
    initialView: { pitch: 0, yaw: 10, fov: 90 },
    hotspots: [
      {
        id: 'hs-5',
        type: 'navigation',
        title: 'Phòng Thời Tiền Sử',
        targetRoomId: 'room-tien-su',
        pitch: -2,
        yaw: -160
      },
      {
        id: 'hs-6',
        type: 'info',
        title: 'Tượng Phật gỗ cổ Óc Eo (Bảo vật Quốc gia)',
        description: 'Tượng Phật gỗ có niên đại thế kỷ thứ 4, bảo quản nguyên vẹn trong tầng bùn cổ và được công nhận là Bảo vật Quốc gia.',
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
