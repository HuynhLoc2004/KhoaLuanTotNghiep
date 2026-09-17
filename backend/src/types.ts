export interface Hotspot {
  id: string;
  type: 'navigation' | 'info';
  title: string;
  description?: string;
  targetRoomId?: string; // id của phòng đích khi bước tới
  pitch: number;        // Tọa độ góc nhìn thẳng đứng (-85 đến 85)
  yaw: number;          // Tọa độ góc nhìn phương ngang (-180 đến 180)
}

export interface MuseumRoom {
  id: string;
  code: string;         // Mã phòng: P101, P102...
  name: string;         // Tên gian trưng bày
  period: string;       // Thời kỳ lịch sử
  description: string;  // Giới thiệu lịch sử
  panoramaUrl: string;  // Đường dẫn ảnh Equirectangular 2:1
  thumbnailUrl: string;
  initialView: {
    pitch: number;
    yaw: number;
    fov: number;
  };
  hotspots: Hotspot[];
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
