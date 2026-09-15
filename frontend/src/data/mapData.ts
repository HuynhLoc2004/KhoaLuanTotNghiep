import { ARTIFACTS_DATA } from "./artifacts";

export interface MapRoom {
  id: string;
  name: string;
  buildingId: string;
  floorLevel: number;
  areaM2: number;
  theme: string;
  color: string;
  // Canvas coordinate bounding box
  rect: { x: number; y: number; w: number; h: number };
  tour360RoomId?: string; // Links directly to #tour360
  currentVisitors: number;
  maxCapacity: number;
  density: "low" | "medium" | "high"; // For crowd dispatching
  featuredArtifactIds: string[];
}

export interface FloorLevel {
  level: number;
  name: string;
  subName: string;
  rooms: MapRoom[];
}

export interface Building {
  id: string;
  name: string;
  code: string;
  description: string;
  floors: FloorLevel[];
}

export interface WayfindingRoute {
  id: string;
  title: string;
  badge: string;
  durationMin: number;
  description: string;
  stopRoomIds: string[];
  waypoints: { x: number; y: number; label?: string }[];
}

// Preconfigured Museum Campus Buildings
export const BUILDINGS_DATA: Building[] = [
  {
    id: "bldg-main",
    name: "Tòa Nhà Trưng Bày Trung Tâm",
    code: "TÒA A",
    description: "Công trình kiến trúc di sản 3 tầng lưu giữ hơn 30.000 cổ vật quý giá.",
    floors: [
      {
        level: 1,
        name: "Tầng 1 - Văn Minh Tiền Sử & Đông Sơn",
        subName: "Đồ đá, đồ đồng và văn hóa các thời kỳ dựng nước",
        rooms: [
          {
            id: "room-dong-son",
            name: "Gian Trưng Bày Đông Sơn",
            buildingId: "bldg-main",
            floorLevel: 1,
            areaM2: 240,
            theme: "Thời đại Kim khí (Thế kỷ 7 TCN - Thế kỷ 1 SCN)",
            color: "#f59e0b",
            rect: { x: 80, y: 100, w: 260, h: 180 },
            tour360RoomId: "room-dong-son",
            currentVisitors: 18,
            maxCapacity: 60,
            density: "low",
            featuredArtifactIds: ["trong-dong-dong-son", "riew-xoe-dong-son"]
          },
          {
            id: "room-sa-huynh",
            name: "Gian Văn Hóa Sa Huỳnh",
            buildingId: "bldg-main",
            floorLevel: 1,
            areaM2: 180,
            theme: "Khuyên tai hai đầu thú & Mộ chum gốm",
            color: "#38bdf8",
            rect: { x: 380, y: 100, w: 220, h: 180 },
            tour360RoomId: "room-champa",
            currentVisitors: 25,
            maxCapacity: 50,
            density: "medium",
            featuredArtifactIds: ["khuyen-tai-sa-huynh"]
          },
          {
            id: "room-entrance-hall",
            name: "Sảnh Đón Tiếp & Soát Vé Cổng A1",
            buildingId: "bldg-main",
            floorLevel: 1,
            areaM2: 320,
            theme: "Quầy vé QR & Hướng dẫn âm thanh",
            color: "#10b981",
            rect: { x: 230, y: 320, w: 220, h: 140 },
            currentVisitors: 42,
            maxCapacity: 100,
            density: "medium",
            featuredArtifactIds: []
          }
        ]
      },
      {
        level: 2,
        name: "Tầng 2 - Nghệ Thuật Champa & Óc Eo",
        subName: "Di sản điêu khắc sa thạch cổ & Văn minh Phù Nam phương Nam",
        rooms: [
          {
            id: "room-champa",
            name: "Sảnh Văn Hóa Nghệ Thuật Champa",
            buildingId: "bldg-main",
            floorLevel: 2,
            areaM2: 280,
            theme: "Kiệt tác điêu khắc Trà Kiệu & Đồng Dương",
            color: "#ec4899",
            rect: { x: 70, y: 90, w: 280, h: 200 },
            tour360RoomId: "room-champa",
            currentVisitors: 55,
            maxCapacity: 60,
            density: "high",
            featuredArtifactIds: ["devi-tra-kieu", "buddha-dong-duong"]
          },
          {
            id: "room-oc-eo",
            name: "Sảnh Văn Hóa Óc Eo & Phù Nam",
            buildingId: "bldg-main",
            floorLevel: 2,
            areaM2: 260,
            theme: "Vàng lá linh phù & Tượng Phật gỗ ngập mặn",
            color: "#14b8a6",
            rect: { x: 390, y: 90, w: 250, h: 200 },
            tour360RoomId: "room-oc-eo",
            currentVisitors: 22,
            maxCapacity: 55,
            density: "low",
            featuredArtifactIds: ["tuong-phat-go-oc-eo", "la-vang-oc-eo"]
          },
          {
            id: "room-lab-gallery",
            name: "Phòng Trưng Bày Chuyên Đề & Giám Định",
            buildingId: "bldg-main",
            floorLevel: 2,
            areaM2: 200,
            theme: "Hồ sơ số hóa bảo vật & Chiếu phim tư liệu",
            color: "#6366f1",
            rect: { x: 230, y: 330, w: 220, h: 130 },
            currentVisitors: 15,
            maxCapacity: 40,
            density: "low",
            featuredArtifactIds: []
          }
        ]
      },
      {
        level: 3,
        name: "Tầng 3 - Cổ Vật Triều Nguyễn & Mỹ Thuật Cổ",
        subName: "Đồ sứ ngự dụng, pháp lam và bảo ấn hoàng cung",
        rooms: [
          {
            id: "room-nguyen-dynasty",
            name: "Gian Cổ Vật Hoàng Cung Triều Nguyễn",
            buildingId: "bldg-main",
            floorLevel: 3,
            areaM2: 300,
            theme: "Mỹ thuật cung đình Huế thế kỷ 19 - 20",
            color: "#eab308",
            rect: { x: 100, y: 100, w: 250, h: 200 },
            tour360RoomId: "room-dong-son",
            currentVisitors: 30,
            maxCapacity: 60,
            density: "medium",
            featuredArtifactIds: ["dinh-dong-trieu-nguyen"]
          },
          {
            id: "room-ceramics",
            name: "Kho Mở Gốm Cổ Chu Đậu & Bát Tràng",
            buildingId: "bldg-main",
            floorLevel: 3,
            areaM2: 250,
            theme: "Gốm hoa lam xuất khẩu thế kỷ 15",
            color: "#06b6d4",
            rect: { x: 390, y: 100, w: 240, h: 200 },
            currentVisitors: 14,
            maxCapacity: 45,
            density: "low",
            featuredArtifactIds: []
          }
        ]
      }
    ]
  },
  {
    id: "bldg-heritage",
    name: "Khu Nhà Nghiên Cứu & Trưng Bày Tạm",
    code: "TÒA B",
    description: "Khu vực hội thảo khoa học và kho lưu trữ mẫu khảo cổ chuyên ngành.",
    floors: [
      {
        level: 1,
        name: "Tầng 1 - Hội Thảo & Triển Lãm Đương Đại",
        subName: "Các chuyên đề di sản giao lưu quốc tế",
        rooms: [
          {
            id: "room-b-gallery",
            name: "Sảnh Triển Lãm Chuyên Đề Tạm Thời",
            buildingId: "bldg-heritage",
            floorLevel: 1,
            areaM2: 350,
            theme: "Di sản gốm hoa nâu Đại Việt",
            color: "#8b5cf6",
            rect: { x: 120, y: 120, w: 460, h: 260 },
            currentVisitors: 12,
            maxCapacity: 80,
            density: "low",
            featuredArtifactIds: []
          }
        ]
      }
    ]
  },
  {
    id: "bldg-garden",
    name: "Vườn Điêu Khắc Sa Thạch Ngoài Trời",
    code: "KHU C",
    description: "Không gian mở trưng bày các bệ đá ngàn năm tuổi dưới vòm cây xanh.",
    floors: [
      {
        level: 1,
        name: "Mặt Bằng Vườn Khảo Cổ Ngoài Trời",
        subName: "Bia đá, linh vật Yoni & Linga sa thạch nguyên khối",
        rooms: [
          {
            id: "room-garden-exhibit",
            name: "Vườn Sa Thạch Cổ Đại",
            buildingId: "bldg-garden",
            floorLevel: 1,
            areaM2: 500,
            theme: "Nghệ thuật tạc đá lộ thiên",
            color: "#84cc16",
            rect: { x: 100, y: 100, w: 500, h: 300 },
            currentVisitors: 28,
            maxCapacity: 120,
            density: "low",
            featuredArtifactIds: []
          }
        ]
      }
    ]
  }
];

// Preconfigured Smart Wayfinding Routes
export const WAYFINDING_ROUTES: WayfindingRoute[] = [
  {
    id: "route-fast-30",
    title: "Tour Nhanh 30 Phút: Bảo Vật Quốc Gia",
    badge: "30 Phút • Tiêu Biểu",
    durationMin: 30,
    description: "Dành cho du khách có ít thời gian. Hệ thống dẫn bạn qua 4 bảo vật quốc gia đắt giá nhất của bảo tàng.",
    stopRoomIds: ["room-entrance-hall", "room-dong-son", "room-champa", "room-oc-eo"],
    waypoints: [
      { x: 340, y: 390, label: "Xuất phát: Cổng A1" },
      { x: 340, y: 260 },
      { x: 210, y: 260 },
      { x: 210, y: 190, label: "Chặng 1: Trống Đồng Đông Sơn" },
      { x: 340, y: 190 },
      { x: 490, y: 190, label: "Chặng 2: Nữ Thần Devi Trà Kiệu" },
      { x: 490, y: 290, label: "Chặng 3: Tượng Phật Gỗ Óc Eo" }
    ]
  },
  {
    id: "route-school-60",
    title: "Tour Học Đường 60 Phút: Văn Minh Kim Khí & Sông Nước",
    badge: "60 Phút • Học Tập",
    durationMin: 60,
    description: "Phù hợp cho học sinh, sinh viên nghiên cứu tiến trình lịch sử từ thời Đồ Đồng đến nền văn minh cổ phương Nam.",
    stopRoomIds: ["room-entrance-hall", "room-dong-son", "room-sa-huynh", "room-oc-eo"],
    waypoints: [
      { x: 340, y: 390, label: "Xuất phát: Cổng A1" },
      { x: 210, y: 260 },
      { x: 210, y: 190, label: "Chặng 1: Gian Đông Sơn" },
      { x: 340, y: 190 },
      { x: 490, y: 190, label: "Chặng 2: Gian Sa Huỳnh" },
      { x: 490, y: 100 },
      { x: 340, y: 100, label: "Chặng 3: Sảnh Óc Eo & Phù Nam" }
    ]
  },
  {
    id: "route-full-90",
    title: "Tour Toàn Diện 90 Phút: Đại Hành Trình Di Sản",
    badge: "90 Phút • Chuyên Sâu",
    durationMin: 90,
    description: "Trải nghiệm trọn vẹn toàn bộ 3 tầng trưng bày của Tòa nhà chính, bao gồm cả cổ vật triều Nguyễn và vườn ngoài trời.",
    stopRoomIds: ["room-entrance-hall", "room-dong-son", "room-champa", "room-oc-eo", "room-nguyen-dynasty"],
    waypoints: [
      { x: 340, y: 390, label: "Cổng A1" },
      { x: 210, y: 190, label: "Tầng 1: Đông Sơn" },
      { x: 490, y: 190, label: "Tầng 1: Sa Huỳnh" },
      { x: 210, y: 100, label: "Tầng 2: Champa" },
      { x: 490, y: 100, label: "Tầng 2: Óc Eo" },
      { x: 220, y: 200, label: "Tầng 3: Triều Nguyễn" }
    ]
  }
];

export const MapConfigStore = {
  buildings: [...BUILDINGS_DATA],
  routes: [...WAYFINDING_ROUTES],
  selectedBuildingId: "bldg-main",
  selectedFloorLevel: 1,
  activeRouteId: "route-fast-30" as string | null,

  init() {
    try {
      const savedB = localStorage.getItem("museum_map_buildings");
      if (savedB) this.buildings = JSON.parse(savedB);
      const savedR = localStorage.getItem("museum_map_routes");
      if (savedR) this.routes = JSON.parse(savedR);
    } catch (_) {}
  },

  getCurrentBuilding(): Building {
    return this.buildings.find(b => b.id === this.selectedBuildingId) || this.buildings[0];
  },

  getCurrentFloor(): FloorLevel {
    const b = this.getCurrentBuilding();
    return b.floors.find(f => f.level === this.selectedFloorLevel) || b.floors[0];
  },

  getRoomById(roomId: string): MapRoom | undefined {
    for (const b of this.buildings) {
      for (const f of b.floors) {
        const r = f.rooms.find(x => x.id === roomId);
        if (r) return r;
      }
    }
    return undefined;
  },

  updateRoomDensity(roomId: string, count: number) {
    const r = this.getRoomById(roomId);
    if (r) {
      r.currentVisitors = count;
      const ratio = count / r.maxCapacity;
      r.density = ratio >= 0.8 ? "high" : ratio >= 0.4 ? "medium" : "low";
      localStorage.setItem("museum_map_buildings", JSON.stringify(this.buildings));
      window.dispatchEvent(new CustomEvent("museum:map-updated"));
    }
  },

  addBuilding(name: string, code: string, description: string): Building {
    const newBldg: Building = {
      id: "bldg-" + Date.now(),
      name,
      code: code || "TÒA " + String.fromCharCode(65 + this.buildings.length),
      description: description || "Tòa nhà trưng bày bảo tàng mới được khởi tạo từ CMS.",
      floors: [
        { level: 1, name: "Tầng 1 - Sảnh Trưng Bày Chính", subName: "Khu vực trưng bày mới", rooms: [] },
        { level: 2, name: "Tầng 2 - Triển Lãm Chuyên Đề", subName: "Các phòng triển lãm chuyên đề", rooms: [] }
      ]
    };
    this.buildings.push(newBldg);
    localStorage.setItem("museum_map_buildings", JSON.stringify(this.buildings));
    window.dispatchEvent(new CustomEvent("museum:map-updated"));
    return newBldg;
  },

  addRoom(buildingId: string, floorLevel: number, name: string, theme: string, tour360RoomId: string, maxCap: number) {
    let b = this.buildings.find(x => x.id === buildingId);
    if (!b && this.buildings.length > 0) b = this.buildings[0];
    if (b) {
      let f = b.floors.find(fl => fl.level === floorLevel);
      if (!f) {
        f = { level: floorLevel, name: `Tầng ${floorLevel} - Sảnh Triển Lãm Mới`, subName: "Khu vực trưng bày", rooms: [] };
        b.floors.push(f);
      }
      const newRoom: MapRoom = {
        id: "room-" + Date.now(),
        name,
        buildingId: b.id,
        floorLevel,
        areaM2: 200,
        theme,
        color: "#38bdf8",
        rect: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 150, w: 220, h: 160 },
        tour360RoomId,
        currentVisitors: Math.round(Math.random() * 25) + 5,
        maxCapacity: maxCap || 60,
        density: "low",
        featuredArtifactIds: []
      };
      f.rooms.push(newRoom);
      localStorage.setItem("museum_map_buildings", JSON.stringify(this.buildings));
      window.dispatchEvent(new CustomEvent("museum:map-updated"));
    }
  }
};
