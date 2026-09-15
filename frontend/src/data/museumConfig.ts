import { i18n } from "./i18n";

export interface MuseumBranding {
  name: string;
  subName: string;
  unit: string;
  city: string;
  address: string;
  hotline: string;
}

export interface FeatureToggles {
  enable3D: boolean;
  enableTour360: boolean;
  enableVoiceAI: boolean;
  enableQuiz: boolean;
  enableTourBooking: boolean;
  enableBroadcast: boolean;
  enablePassport: boolean;
}

export interface SystemAnnouncement {
  id: string;
  content: string;
  priority: "normal" | "urgent";
  createdAt: string;
  active: boolean;
}

export interface WalkNode360 {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  connectedNodeIds: string[];
}

export interface ShowcasePin360 {
  id: string;
  artifactId: string;
  title: string;
  era: string;
  position: { x: number; y: number; z: number };
  roomNodeId: string;
}

export interface Tour360Room {
  id: string;
  name: string;
  eraTitle: string;
  description: string;
  panoramaTheme: "champa" | "oc-eo" | "dong-son";
  nodes: WalkNode360[];
  showcases: ShowcasePin360[];
}

export interface LanguagePackage {
  code: string;
  label: string;
  speechCode: string;
  active: boolean;
  name?: string;
  nativeName?: string;
  flag?: string;
  customAdded?: boolean;
}

export interface PageDefinition {
  id: string;
  name: string;
  category: "public" | "admin";
  description: string;
}

export type PermissionLevel = "FULL_ACCESS" | "EDITOR" | "REVIEWER" | "READ_ONLY";

// ─── Pending Approval System ───────────────────────────────────────────────
export type PendingActionType =
  | "ADD_ROOM360"
  | "ADD_WALK_NODE"
  | "ADD_ARTIFACT"
  | "ADD_SHOWCASE_PIN"
  | "ADD_ANNOUNCEMENT"
  | "ADD_ROLE"
  | "ADD_BUILDING"
  | "ADD_MAP_POINT";

export interface PendingRequest {
  id: string;
  actionType: PendingActionType;
  label: string;        // Human-readable summary
  submittedBy: string;  // staff name
  submittedAt: string;
  payload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
}

export const PendingApprovalStore = {
  requests: [] as PendingRequest[],

  _save() {
    localStorage.setItem("museum_pending_approvals", JSON.stringify(this.requests));
  },

  init() {
    try {
      const saved = localStorage.getItem("museum_pending_approvals");
      if (saved) this.requests = JSON.parse(saved);
    } catch (_) { }
  },

  submit(actionType: PendingActionType, label: string, submittedBy: string, payload: Record<string, unknown>): PendingRequest {
    const req: PendingRequest = {
      id: "pend-" + Date.now(),
      actionType,
      label,
      submittedBy,
      submittedAt: new Date().toLocaleString("vi-VN"),
      payload,
      status: "pending"
    };
    this.requests.unshift(req);
    this._save();
    window.dispatchEvent(new CustomEvent("museum:pending-updated"));
    return req;
  },

  getPending(): PendingRequest[] {
    return this.requests.filter(r => r.status === "pending");
  },

  getAll(): PendingRequest[] {
    return this.requests;
  },

  approve(id: string): PendingRequest | null {
    const req = this.requests.find(r => r.id === id);
    if (!req || req.status !== "pending") return null;
    req.status = "approved";
    this._save();
    return req;
  },

  reject(id: string): boolean {
    const req = this.requests.find(r => r.id === id);
    if (!req || req.status !== "pending") return false;
    req.status = "rejected";
    this._save();
    return true;
  },

  pendingCount(): number {
    return this.requests.filter(r => r.status === "pending").length;
  }
};

// ─── Culture / Era Store ──────────────────────────────────────────────────────
export interface CultureItem {
  id: string;
  name: string;        // Tên văn hóa (hiển thị trong select)
  period: string;      // Niên đại tham khảo (VD: "Thế kỷ 3 TCN - 1 CN")
  description: string; // Mô tả ngắn
  color: string;       // Màu badge (hex)
  order: number;       // Thứ tự hiển thị
}

export const CultureStore = {
  items: [] as CultureItem[],

  _save() {
    localStorage.setItem("museum_cultures", JSON.stringify(this.items));
  },

  init() {
    try {
      const saved = localStorage.getItem("museum_cultures");
      if (saved) {
        this.items = JSON.parse(saved);
        return;
      }
    } catch (_) {}
    // Default seed data
    this.items = [
      { id: "culture-dongson", name: "Văn Hóa Đông Sơn", period: "Thế kỷ 7 TCN - 3 CN", description: "Nền văn hóa đồng thau rực rỡ của người Việt cổ, nổi bật với trống đồng.", color: "#b45309", order: 1 },
      { id: "culture-sahuynh", name: "Văn Hóa Sa Huỳnh", period: "Thế kỷ 10 TCN - 2 CN", description: "Văn hóa sắt tiền sử miền Trung Việt Nam, đặc trưng bởi đồ trang sức thủy tinh.", color: "#0891b2", order: 2 },
      { id: "culture-oceo", name: "Văn Hóa Óc Eo", period: "Thế kỷ 1 - 7 CN", description: "Trung tâm thương mại hàng hải của vương quốc Phù Nam ở đồng bằng sông Cửu Long.", color: "#059669", order: 3 },
      { id: "culture-champa", name: "Nghệ Thuật Champa", period: "Thế kỷ 2 - 17 CN", description: "Di sản nghệ thuật Hindu-Phật giáo của vương quốc Chăm Pa.", color: "#dc2626", order: 4 },
      { id: "culture-nguyen", name: "Triều Nguyễn", period: "1802 - 1945", description: "Triều đại phong kiến cuối cùng của Việt Nam với kinh đô Huế.", color: "#7c3aed", order: 5 },
      { id: "culture-ancient", name: "Cổ Đại / Chưa Xác Định", period: "Không rõ", description: "Hiện vật chưa được phân loại hoặc thuộc các thời kỳ cổ xưa khác.", color: "#6b7280", order: 6 },
    ];
    this._save();
  },

  add(name: string, period: string, description: string, color: string): CultureItem {
    const item: CultureItem = {
      id: "culture-" + Date.now(),
      name: name.trim(),
      period: period.trim(),
      description: description.trim(),
      color,
      order: this.items.length + 1,
    };
    this.items.push(item);
    this._save();
    return item;
  },

  delete(id: string): boolean {
    const idx = this.items.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    this._save();
    return true;
  },

  update(id: string, patch: Partial<Omit<CultureItem, "id">>): boolean {
    const item = this.items.find(c => c.id === id);
    if (!item) return false;
    Object.assign(item, patch);
    this._save();
    return true;
  },

  getAll(): CultureItem[] {
    return [...this.items].sort((a, b) => a.order - b.order);
  }
};

export interface DynamicRole {
  id: string;
  name: string;
  description: string;
  allowedPages: string[];
  pagePermissions: Record<string, PermissionLevel>;
  assignedStaffIds: string[];
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleTitle: string;
  status: "active" | "inactive";
}

export interface ScanLogItem {
  id: string;
  ticketCode: string;
  visitorName: string;
  groupType: "Đoàn học sinh" | "Khách lẻ" | "Gia đình";
  time: string;
  status: "success" | "rejected";
  gate: string;
  durationMs: number;
}

export interface AnalyticsPeriodData {
  totalVisitors: number;
  validTickets: number;
  voiceAiPlays: number;
  quizCompletions: number;
  avgScanDurationMs: number;
  roomDistribution: { room: string; visitors: number; percentage: number }[];
}

export const SYSTEM_PAGES: PageDefinition[] = [
  { id: "home", name: "Trang Chủ & Hero", category: "public", description: "Hiển thị trang chủ và bảo vật quốc gia" },
  { id: "artifact", name: "Hiện Vật 3D & Chú Thích", category: "public", description: "Soi mô hình 3D và nghe bảng chú thích" },
  { id: "tour360", name: "Tour Ảo 360° Đi Trong Phòng", category: "public", description: "Trải nghiệm thực tế ảo bước đi trong các sảnh bảo tàng" },
  { id: "quiz", name: "Đố Vui Tri Thức & Sổ Tem", category: "public", description: "Trò chơi trắc nghiệm và gamification hộ chiếu" },
  { id: "booking", name: "Đặt Lịch Tour Tham Quan", category: "public", description: "Đăng ký ca giờ cho lớp học và đoàn khách" },
  { id: "profile", name: "Hồ Sơ & Thẻ Vé QR Du Khách", category: "public", description: "Quản lý vé điện tử và cấp bậc thám hiểm" },
  { id: "scan", name: "Cổng Soát Vé Quang Học", category: "admin", description: "Quét thẻ vé tự động dưới 100ms" },
  { id: "artifacts_cms", name: "Quản Lý Kho Hiện Vật", category: "admin", description: "Thêm sửa bảng chú thích, duyệt 3D và sinh Quiz" },
  { id: "tour360_cms", name: "Quản Lý Tour Ảo 360°", category: "admin", description: "Cấu hình phòng 360, điểm bước chân và ghim tủ kính" },
  { id: "analytics", name: "Báo Cáo Thống Kê Toàn Diện", category: "admin", description: "Xem lưu lượng theo ngày, tuần, tháng, quý, năm" },
  { id: "settings", name: "Cấu Hình & Bật/Tắt Tính Năng", category: "admin", description: "Tùy biến thương hiệu bảo tàng và Feature Toggles" },
  { id: "roles", name: "Phân Quyền Quản Trị (RBAC)", category: "admin", description: "Tạo vai trò mới và phân quyền theo trang" }
];

export const AVAILABLE_LANGUAGES: LanguagePackage[] = [
  { code: "vi", label: "VI - Tiếng Việt", speechCode: "vi-VN", active: true },
  { code: "en", label: "EN - English", speechCode: "en-US", active: true },
  { code: "ja", label: "JA - 日本語", speechCode: "ja-JP", active: true },
  { code: "ko", label: "KO - 한국어", speechCode: "ko-KR", active: true },
  { code: "fr", label: "FR - Français", speechCode: "fr-FR", active: true },
  { code: "de", label: "DE - Deutsch", speechCode: "de-DE", active: false },
  { code: "es", label: "ES - Español", speechCode: "es-ES", active: false }
];

const DEFAULT_BRANDING: MuseumBranding = {
  name: "BẢO TÀNG LỊCH SỬ",
  subName: "TP. HỒ CHÍ MINH • DIGITAL HERITAGE",
  unit: "Sở Văn Hóa & Thể Thao TP.HCM",
  city: "Thành phố Hồ Chí Minh",
  address: "Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP.HCM",
  hotline: "028 3829 8146"
};

const DEFAULT_FEATURES: FeatureToggles = {
  enable3D: true,
  enableTour360: true,
  enableVoiceAI: true,
  enableQuiz: true,
  enableTourBooking: true,
  enableBroadcast: true,
  enablePassport: true
};

const DEFAULT_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: "ann-1",
    content: "Triển lãm chuyên đề 'Văn hóa Óc Eo - Phù Nam' mở cửa tự do tại Sảnh 3. Ca tour 10:15 còn 5 chỗ trống.",
    priority: "normal",
    createdAt: "2026-09-09 08:30",
    active: true
  }
];

const DEFAULT_ROOMS_360: Tour360Room[] = [
  {
    id: "room-champa",
    name: "Sảnh Văn Hóa Nghệ Thuật Champa",
    eraTitle: "Thế kỷ 2 - Thế kỷ 17",
    description: "Không gian trưng bày các kiệt tác điêu khắc sa thạch và đồng thau cổ Champa rực rỡ.",
    panoramaTheme: "champa",
    nodes: [
      { id: "node-champa-1", name: "Vị trí Cửa Vào Sảnh", position: { x: 0, y: 0, z: 0 }, connectedNodeIds: ["node-champa-2"] },
      { id: "node-champa-2", name: "Vị trí Gian Trung Tâm (Bảo vật)", position: { x: 0, y: 0, z: -150 }, connectedNodeIds: ["node-champa-1", "node-champa-3"] },
      { id: "node-champa-3", name: "Vị trí Tủ Kính Phía Tây", position: { x: -120, y: 0, z: -220 }, connectedNodeIds: ["node-champa-2"] }
    ],
    showcases: [
      { id: "pin-cp-1", artifactId: "buddha-dong-duong", title: "Tượng Phật Đồng Dương", era: "Thế kỷ 8 - 9", position: { x: 0, y: 15, z: -280 }, roomNodeId: "node-champa-2" },
      { id: "pin-cp-2", artifactId: "devi-tra-kieu", title: "Tượng Nữ Thần Devi Trà Kiệu", era: "Thế kỷ 10", position: { x: -180, y: 10, z: -260 }, roomNodeId: "node-champa-3" }
    ]
  },
  {
    id: "room-oc-eo",
    name: "Sảnh Văn Hóa Óc Eo & Phù Nam",
    eraTitle: "Thế kỷ 1 - Thế kỷ 7",
    description: "Không gian lưu giữ các di vật bằng vàng, gỗ cổ ngập mặn và đá quý của nền văn minh sông nước phương Nam.",
    panoramaTheme: "oc-eo",
    nodes: [
      { id: "node-oceo-1", name: "Cửa Sảnh Óc Eo", position: { x: 0, y: 0, z: 0 }, connectedNodeIds: ["node-oceo-2"] },
      { id: "node-oceo-2", name: "Trung Tâm Sảnh Phù Nam", position: { x: 0, y: 0, z: -160 }, connectedNodeIds: ["node-oceo-1"] }
    ],
    showcases: [
      { id: "pin-oe-1", artifactId: "tuong-phat-go-oc-eo", title: "Tượng Phật Gỗ Óc Eo", era: "Thế kỷ 4 - 6", position: { x: 60, y: 20, z: -250 }, roomNodeId: "node-oceo-2" },
      { id: "pin-oe-2", artifactId: "la-vang-oc-eo", title: "Linh Phù Vàng Thần Vishnu", era: "Thế kỷ 5", position: { x: -80, y: 5, z: -220 }, roomNodeId: "node-oceo-2" }
    ]
  },
  {
    id: "room-dong-son",
    name: "Gian Trưng Bày Văn Hóa Đông Sơn",
    eraTitle: "Thế kỷ 7 TCN - Thế kỷ 1 SCN",
    description: "Nơi tôn vinh nền văn minh kim khí rực rỡ của người Việt cổ với trống đồng và vũ khí nghi lễ.",
    panoramaTheme: "dong-son",
    nodes: [
      { id: "node-ds-1", name: "Cửa Vào Gian Đông Sơn", position: { x: 0, y: 0, z: 0 }, connectedNodeIds: ["node-ds-2"] },
      { id: "node-ds-2", name: "Gian Đặt Trống Đồng", position: { x: 0, y: 0, z: -140 }, connectedNodeIds: ["node-ds-1"] }
    ],
    showcases: [
      { id: "pin-ds-1", artifactId: "trong-dong-dong-son", title: "Trống Đồng Đông Sơn", era: "Thế kỷ 3 TCN", position: { x: 0, y: -10, z: -240 }, roomNodeId: "node-ds-2" }
    ]
  }
];

const DEFAULT_STAFF: StaffUser[] = [
  { id: "st-1", name: "ThS. Lê Quang Long", email: "long.le@museum.hcmc.vn", roleId: "super_admin", roleTitle: "Giám Tuyển Trưởng", status: "active" },
  { id: "st-2", name: "Huỳnh Tấn Lộc", email: "loc.huynh@museum.hcmc.vn", roleId: "super_admin", roleTitle: "Kỹ Sư Trưởng Nền Tảng", status: "active" },
  { id: "st-3", name: "Trịnh Vĩ Thành", email: "thanh.trinh@museum.hcmc.vn", roleId: "curator_lead", roleTitle: "Chuyên Viên Số Hóa 3D", status: "active" },
  { id: "st-4", name: "Nguyễn Thị Mai", email: "mai.nguyen@museum.hcmc.vn", roleId: "gate_officer", roleTitle: "Trưởng Ca Soát Vé Cổng A", status: "active" },
  { id: "st-5", name: "Trần Minh Quân", email: "quan.tran@museum.hcmc.vn", roleId: "media_officer", roleTitle: "Cán Bộ Điều Phối Tour", status: "active" }
];

const DEFAULT_ROLES: DynamicRole[] = [
  {
    id: "super_admin",
    name: "Quản Trị Viên Toàn Quyền",
    description: "Toàn quyền quản trị hệ thống, cấu hình bảo tàng và phân quyền nhân sự.",
    allowedPages: ["home", "artifact", "tour360", "quiz", "booking", "scan", "artifacts_cms", "tour360_cms", "analytics", "settings", "roles"],
    pagePermissions: {
      scan: "FULL_ACCESS",
      artifacts_cms: "FULL_ACCESS",
      tour360_cms: "FULL_ACCESS",
      analytics: "FULL_ACCESS",
      settings: "FULL_ACCESS",
      roles: "FULL_ACCESS"
    },
    assignedStaffIds: ["st-1", "st-2"]
  },
  {
    id: "curator_lead",
    name: "Ban Giám Tuyển & Số Hóa 3D",
    description: "Biên tập bảng chú thích, kiểm duyệt hiện vật 3D và ghim cổ vật vào Tour 360°.",
    allowedPages: ["artifact", "tour360", "artifacts_cms", "tour360_cms", "analytics"],
    pagePermissions: {
      artifacts_cms: "FULL_ACCESS",
      tour360_cms: "FULL_ACCESS",
      analytics: "READ_ONLY"
    },
    assignedStaffIds: ["st-3"]
  },
  {
    id: "gate_officer",
    name: "Cán Bộ Soát Vé Cổng Kiểm Soát",
    description: "Vận hành máy quét quang học QR và kiểm tra hợp lệ thẻ vé vào cổng.",
    allowedPages: ["scan"],
    pagePermissions: {
      scan: "FULL_ACCESS"
    },
    assignedStaffIds: ["st-4"]
  },
  {
    id: "media_officer",
    name: "Cán Bộ Truyền Thông & Sự Kiện",
    description: "Phát thông báo loa, quản lý tour đoàn và theo dõi số liệu báo cáo.",
    allowedPages: ["analytics", "settings"],
    pagePermissions: {
      analytics: "READ_ONLY",
      settings: "EDITOR"
    },
    assignedStaffIds: ["st-5"]
  }
];

const SCAN_LOGS_SAMPLE: ScanLogItem[] = [
  { id: "LOG-01", ticketCode: "TKT-TOUR-9921", visitorName: "THPT Gia Định (Lớp 12A3)", groupType: "Đoàn học sinh", time: "09:14:22", status: "success", gate: "Cổng Chính A1", durationMs: 42 },
  { id: "LOG-02", ticketCode: "TKT-SOLO-4812", visitorName: "Nguyễn Văn An", groupType: "Khách lẻ", time: "09:12:05", status: "success", gate: "Cổng Chính A2", durationMs: 38 },
  { id: "LOG-03", ticketCode: "TKT-TOUR-9920", visitorName: "Trường Quốc Tế Á Châu", groupType: "Đoàn học sinh", time: "09:05:40", status: "success", gate: "Cổng Đoàn B1", durationMs: 51 },
  { id: "LOG-04", ticketCode: "TKT-EXPIRED-00", visitorName: "Khách Vãng Lai (Vé cũ)", groupType: "Khách lẻ", time: "08:58:19", status: "rejected", gate: "Cổng Chính A1", durationMs: 29 },
  { id: "LOG-05", ticketCode: "TKT-SOLO-4810", visitorName: "Trần Thị Thu Thảo", groupType: "Gia đình", time: "08:45:11", status: "success", gate: "Cổng Chính A2", durationMs: 44 },
  { id: "LOG-06", ticketCode: "TKT-SOLO-4809", visitorName: "Jean-Pierre Dupont", groupType: "Khách lẻ", time: "08:35:02", status: "success", gate: "Cổng Quốc Tế A3", durationMs: 46 },
  { id: "LOG-07", ticketCode: "TKT-TOUR-9918", visitorName: "Đoàn Cựu Chiến Binh Q3", groupType: "Đoàn học sinh", time: "08:20:15", status: "success", gate: "Cổng Đoàn B1", durationMs: 48 },
  { id: "LOG-08", ticketCode: "TKT-SOLO-4805", visitorName: "Phạm Hải Đăng", groupType: "Khách lẻ", time: "08:15:30", status: "success", gate: "Cổng Chính A1", durationMs: 35 }
];

export const MuseumConfigStore = {
  branding: { ...DEFAULT_BRANDING },
  features: { ...DEFAULT_FEATURES },
  announcements: [...DEFAULT_ANNOUNCEMENTS],
  rooms360: [...DEFAULT_ROOMS_360],
  roles: [...DEFAULT_ROLES],
  staff: [...DEFAULT_STAFF],
  languages: [...AVAILABLE_LANGUAGES],
  currentLanguage: "vi" as string,

  init() {
    try {
      const savedB = localStorage.getItem("museum_config_branding");
      if (savedB) this.branding = JSON.parse(savedB);

      const savedF = localStorage.getItem("museum_config_features");
      if (savedF) this.features = JSON.parse(savedF);

      const savedA = localStorage.getItem("museum_config_announcements");
      if (savedA) this.announcements = JSON.parse(savedA);

      const savedR = localStorage.getItem("museum_config_roles");
      if (savedR) this.roles = JSON.parse(savedR);

      const savedL = localStorage.getItem("museum_config_langs");
      if (savedL) this.languages = JSON.parse(savedL);

      const curL = localStorage.getItem("museum_config_lang");
      if (curL) this.currentLanguage = curL;

      const savedRooms = localStorage.getItem("museum_config_rooms360");
      if (savedRooms) this.rooms360 = JSON.parse(savedRooms);

      this.syncLanguagesWithServer();
    } catch (_) { }
  },

  async syncLanguagesWithServer() {
    try {
      const res = await fetch("http://localhost:3000/api/v1/languages");
      if (res.ok) {
        const data = await res.json();
        if (data && data.configured && Array.isArray(data.configured)) {
          data.configured.forEach((srvLang: any) => {
            const idx = this.languages.findIndex(l => l.code === srvLang.code);
            const pkg: LanguagePackage = {
              code: srvLang.code,
              label: `${srvLang.code.toUpperCase()} - ${srvLang.nativeName || srvLang.name}`,
              speechCode: srvLang.speechCode,
              active: srvLang.active,
              name: srvLang.name,
              nativeName: srvLang.nativeName,
              flag: srvLang.flag,
              customAdded: srvLang.customAdded
            };
            if (idx !== -1) {
              this.languages[idx] = { ...this.languages[idx], ...pkg };
            } else {
              this.languages.push(pkg);
            }
          });
          localStorage.setItem("museum_config_langs", JSON.stringify(this.languages));
          window.dispatchEvent(new CustomEvent("museum:config-updated"));
        }
      }
    } catch (_) {}
  },

  updateBranding(newBranding: Partial<MuseumBranding>) {
    this.branding = { ...this.branding, ...newBranding };
    localStorage.setItem("museum_config_branding", JSON.stringify(this.branding));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  toggleFeature(featureKey: keyof FeatureToggles, value: boolean) {
    this.features[featureKey] = value;
    localStorage.setItem("museum_config_features", JSON.stringify(this.features));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  setLanguage(langCode: string) {
    this.currentLanguage = langCode;
    localStorage.setItem("museum_config_lang", langCode);
    i18n.setLanguage(langCode);
    window.dispatchEvent(new CustomEvent("museum:language-changed", { detail: { lang: langCode } }));
  },

  addLanguagePackage(langPkg: LanguagePackage) {
    const existingIdx = this.languages.findIndex(l => l.code === langPkg.code);
    if (existingIdx !== -1) {
      this.languages[existingIdx] = { ...this.languages[existingIdx], ...langPkg, active: true };
    } else {
      this.languages.push(langPkg);
    }
    localStorage.setItem("museum_config_langs", JSON.stringify(this.languages));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  removeLanguagePackage(code: string) {
    this.languages = this.languages.filter(l => l.code !== code);
    localStorage.setItem("museum_config_langs", JSON.stringify(this.languages));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  toggleLanguageActive(langCode: string, active: boolean) {
    const l = this.languages.find(x => x.code === langCode);
    if (l) {
      l.active = active;
      localStorage.setItem("museum_config_langs", JSON.stringify(this.languages));
      // Notify backend if available
      fetch(`http://localhost:3000/api/v1/languages/${langCode}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active })
      }).catch(() => {});
      window.dispatchEvent(new CustomEvent("museum:config-updated"));
    }
  },

  getActiveLanguages(): LanguagePackage[] {
    return this.languages.filter(l => l.active);
  },

  addAnnouncement(content: string, priority: "normal" | "urgent" = "normal") {
    const newAnn: SystemAnnouncement = {
      id: "ann-" + Date.now(),
      content,
      priority,
      createdAt: new Date().toLocaleString("vi-VN"),
      active: true
    };
    this.announcements.unshift(newAnn);
    localStorage.setItem("museum_config_announcements", JSON.stringify(this.announcements));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  addRole(name: string, description: string, allowedPages: string[], pagePermissions: Record<string, PermissionLevel>, assignedStaffIds: string[]) {
    const newRole: DynamicRole = {
      id: "role-" + Date.now(),
      name,
      description,
      allowedPages,
      pagePermissions,
      assignedStaffIds
    };
    this.roles.push(newRole);
    localStorage.setItem("museum_config_roles", JSON.stringify(this.roles));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
  },

  addShowcasePin(roomId: string, artifactId: string, title: string, era: string, roomNodeId: string) {
    const room = this.rooms360.find(r => r.id === roomId);
    if (room) {
      room.showcases.push({
        id: "pin-" + Date.now(),
        artifactId,
        title,
        era,
        position: { x: (Math.random() - 0.5) * 200, y: Math.random() * 20, z: -250 },
        roomNodeId
      });
      localStorage.setItem("museum_config_rooms360", JSON.stringify(this.rooms360));
      window.dispatchEvent(new CustomEvent("museum:config-updated"));
    }
  },

  addRoom360(name: string, eraTitle: string, description: string): Tour360Room {
    const newRoom: Tour360Room = {
      id: "room-" + Date.now(),
      name,
      eraTitle: eraTitle || "Triều đại lịch sử",
      description: description || "Sảnh trưng bày không gian 3DGS mới được khởi tạo.",
      panoramaTheme: "champa",
      nodes: [
        { id: "node-" + Date.now() + "-1", name: "Vị trí Cửa Vào Sảnh", position: { x: 0, y: 0, z: 0 }, connectedNodeIds: [] },
        { id: "node-" + Date.now() + "-2", name: "Vị trí Gian Trung Tâm", position: { x: 0, y: 0, z: -150 }, connectedNodeIds: [] }
      ],
      showcases: []
    };
    this.rooms360.push(newRoom);
    localStorage.setItem("museum_config_rooms360", JSON.stringify(this.rooms360));
    window.dispatchEvent(new CustomEvent("museum:config-updated"));
    return newRoom;
  },

  addWalkNode(roomId: string, name: string): WalkNode360 | null {
    const room = this.rooms360.find(r => r.id === roomId);
    if (room) {
      const newNode: WalkNode360 = {
        id: "node-" + Date.now(),
        name,
        position: { x: Math.round((Math.random() - 0.5) * 200), y: 0, z: Math.round(-100 - Math.random() * 150) },
        connectedNodeIds: room.nodes.length > 0 ? [room.nodes[0].id] : []
      };
      room.nodes.push(newNode);
      localStorage.setItem("museum_config_rooms360", JSON.stringify(this.rooms360));
      window.dispatchEvent(new CustomEvent("museum:config-updated"));
      return newNode;
    }
    return null;
  },

  deleteWalkNode(roomId: string, nodeId: string): boolean {
    const room = this.rooms360.find(r => r.id === roomId);
    if (room) {
      room.nodes = room.nodes.filter(n => n.id !== nodeId);
      localStorage.setItem("museum_config_rooms360", JSON.stringify(this.rooms360));
      window.dispatchEvent(new CustomEvent("museum:config-updated"));
      return true;
    }
    return false;
  },


  getAnalytics(period: "today" | "week" | "month" | "quarter" | "year"): AnalyticsPeriodData {
    const multipliers: Record<string, number> = {
      today: 1,
      week: 6.8,
      month: 28.5,
      quarter: 84,
      year: 340
    };
    const mult = multipliers[period] || 1;

    return {
      totalVisitors: Math.round(1420 * mult),
      validTickets: Math.round(1385 * mult),
      voiceAiPlays: Math.round(3120 * mult),
      quizCompletions: Math.round(890 * mult),
      avgScanDurationMs: 41,
      roomDistribution: [
        { room: "Sảnh Văn Hóa Champa", visitors: Math.round(520 * mult), percentage: 37 },
        { room: "Sảnh Văn Hóa Óc Eo", visitors: Math.round(410 * mult), percentage: 29 },
        { room: "Gian Trưng Bày Đông Sơn", visitors: Math.round(290 * mult), percentage: 20 },
        { room: "Cổ Vật Triều Nguyễn", visitors: Math.round(200 * mult), percentage: 14 }
      ]
    };
  },

  getScanLogs(): ScanLogItem[] {
    return SCAN_LOGS_SAMPLE;
  },

  getActiveAnnouncement(): string {
    const active = this.announcements.find(a => a.active);
    return active ? active.content : "Bảo tàng mở cửa đón khách từ 08:00 đến 17:00 tất cả các ngày trong tuần.";
  }
};

MuseumConfigStore.init();
PendingApprovalStore.init();
