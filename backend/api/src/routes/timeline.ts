import { Router, Request, Response } from "express";

export const timelineRouter = Router();

export interface TimelineEra {
  id: string;
  code: string;
  name: string;
  periodRange: string;
  startYear: number;
  endYear: number;
  highlightTheme: string;
  description: string;
  color: string;
  roomName: string;
  featuredArtifactCode: string;
  thumbnail: string;
  keyEvents: {
    year: string;
    event: string;
  }[];
  artifactsCount: number;
}

export interface TimelineJourneyNode {
  nodeId: string;
  stepNumber: number;
  title: string;
  eraName: string;
  locationRoom: string;
  artifactCode: string;
  artifactName: string;
  thumbnail: string;
  curatorNarration: string;
  voiceAudioUrl?: string;
  voiceDuration: string;
  historicalSignificance: string;
  tour360NodeId?: string;
}

export interface TimelineJourney {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  estimatedMinutes: number;
  bannerImage: string;
  tags: string[];
  totalNodes: number;
  nodes: TimelineJourneyNode[];
}

export interface RelatedArtifact {
  artifactId: string;
  code: string;
  name: string;
  era: string;
  relationType: "SAME_ERA" | "CULTURAL_CROSSOVER" | "MATERIAL_TECHNIQUE" | "SACRED_MOTIF";
  relationLabel: string;
  reason: string;
  thumbnail: string;
  room: string;
}

// 1. Data Store: 6 Historical Eras
const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: "dong-son",
    code: "ERA-01",
    name: "Văn Hóa Đông Sơn & Thời Đại Hùng Vương",
    periodRange: "Thế kỷ 7 TCN – Thế kỷ 1 SCN",
    startYear: -700,
    endYear: 100,
    highlightTheme: "Kỷ Nguyên Đúc Đồng & Tín Ngưỡng Thần Mặt Trời",
    description: "Đỉnh cao của thời đại kim khí Việt Nam với kỹ thuật đúc đồng điêu luyện. Trống đồng và thạp đồng khắc họa đời sống sinh hoạt, lễ hội cầu mùa và khát vọng chinh phục tự nhiên của người Việt cổ.",
    color: "#d97706",
    roomName: "Sảnh Tiền Sử & Sơ Sử (Phòng 1)",
    featuredArtifactCode: "AR-002",
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "Thế kỷ 7 TCN", event: "Nhà nước Văn Lang hình thành dưới thời các Vua Hùng" },
      { year: "Thế kỷ 3 TCN", event: "Đỉnh cao kỹ thuật đúc Trống Đồng Đông Sơn loại I Heger" },
      { year: "208 TCN", event: "Thục Phán An Dương Vương lập nước Âu Lạc, xây thành Cổ Loa" }
    ],
    artifactsCount: 14
  },
  {
    id: "sa-huynh",
    code: "ERA-02",
    name: "Nền Văn Hóa Sa Huỳnh",
    periodRange: "Thế kỷ 10 TCN – Thế kỷ 2 SCN",
    startYear: -1000,
    endYear: 200,
    highlightTheme: "Nghệ Thuật Chế Tác Ngọc & Mộ Chum Độc Bản",
    description: "Nền văn hóa khảo cổ duyên hải miền Trung rực rỡ với truyền thống táng thức trong chum gốm khổng lồ, kỹ nghệ chế tác trang sức đá ngọc nephrite và thủy tinh hai đầu thú độc đáo bậc nhất châu Á.",
    color: "#b45309",
    roomName: "Sảnh Văn Hóa Sa Huỳnh",
    featuredArtifactCode: "AR-004",
    thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "Thế kỷ 10 TCN", event: "Xuất hiện các cụm di chỉ mộ táng chum gốm hình trụ đầu tiên" },
      { year: "Thế kỷ 2 TCN", event: "Giao thương hàng hải kết nối đồ trang sức ngọc bích khắp Đông Nam Á" }
    ],
    artifactsCount: 9
  },
  {
    id: "oc-eo",
    code: "ERA-03",
    name: "Vương Quốc Phù Nam & Văn Hóa Óc Eo",
    periodRange: "Thế kỷ 1 – Thế kỷ 7 SCN",
    startYear: 100,
    endYear: 700,
    highlightTheme: "Cảng Thị Quốc Tế & Kim Hoàn Hoàng Triều Phù Nam",
    description: "Đô thị cảng thị quốc tế phồn vinh bậc nhất Đông Nam Á cổ đại tại đồng bằng sông Cửu Long. Nơi hội tụ các dòng chảy thương mại Ấn Độ - La Mã với di sản vàng lá chạm khắc và tượng sa thạch.",
    color: "#059669",
    roomName: "Sảnh Văn Hóa Óc Eo & Phù Nam (Phòng 2)",
    featuredArtifactCode: "AR-003",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "Thế kỷ 1 - 2 SCN", event: "Cảng thị Óc Eo đón nhận các đoàn thương thuyền từ La Mã, Ba Tư và Ấn Độ" },
      { year: "Thế kỷ 5 SCN", event: "Đỉnh cao chế tác lá vàng dát mỏng, ngọc quý và tượng thần Hindu giáo" },
      { year: "Thế kỷ 7 SCN", event: "Phù Nam chuyển giao dần tầm ảnh hưởng cho triều đại Chân Lạp cổ" }
    ],
    artifactsCount: 18
  },
  {
    id: "champa",
    code: "ERA-04",
    name: "Nghệ Thuật Điêu Khắc Champa",
    periodRange: "Thế kỷ 2 – Thế kỷ 17 SCN",
    startYear: 200,
    endYear: 1700,
    highlightTheme: "Thần Thoại Sa Thạch & Vũ Điệu Thần Linh Amaravati",
    description: "Kho tàng điêu khắc đá sa thạch và tượng đồng thau trứ danh. Các pho tượng Bồ tát, vũ nữ Trà Kiệu, thần Shiva thể hiện sự hòa quyện tuyệt mỹ giữa Ấn Độ giáo và tâm hồn bản địa.",
    color: "#0284c7",
    roomName: "Sảnh Văn Hóa Champa (Phòng 3)",
    featuredArtifactCode: "AR-001",
    thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "Năm 192 SCN", event: "Nhà nước Lâm Ấp được thành lập tại miền Trung Việt Nam" },
      { year: "Thế kỷ 8 - 9", event: "Kiến tạo trung tâm Phật giáo Đồng Dương và đúc pho tượng Phật đồng thau độc bản" },
      { year: "Thế kỷ 10", event: "Phong cách nghệ thuật Trà Kiệu với phù điêu vũ nữ Apsara duyên dáng" }
    ],
    artifactsCount: 22
  },
  {
    id: "ly-tran",
    code: "ERA-05",
    name: "Kỷ Nguyên Văn Minh Đại Việt (Lý - Trần)",
    periodRange: "Năm 1009 – Năm 1400",
    startYear: 1009,
    endYear: 1400,
    highlightTheme: "Tam Giáo Đồng Nguyên, Rồng Cuộn & Gốm Men Ngọc",
    description: "Kỷ nguyên độc lập quật cường, mở đầu bằng chiếu dời đô về Thăng Long của vua Lý Thái Tổ. Nghệ thuật đạt đỉnh cao thanh nhã với tượng Phật A Di Đà, gốm men ngọc (Celadon) và hình tượng rồng giun hiền hòa.",
    color: "#7c3aed",
    roomName: "Sảnh Văn Minh Đại Việt (Phòng 4)",
    featuredArtifactCode: "AR-005",
    thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "1009", event: "Lý Công Uẩn lên ngôi hoàng đế, mở ra vương triều nhà Lý hưng thịnh" },
      { year: "1010", event: "Dời đô từ Hoa Lư về thành Thăng Long" },
      { year: "1288", event: "Đại thắng quân Nguyên Mông trên sông Bạch Đằng thời Trần" }
    ],
    artifactsCount: 16
  },
  {
    id: "le-nguyen",
    code: "ERA-06",
    name: "Hoàng Triều Tây Sơn & Triều Nguyễn",
    periodRange: "Năm 1778 – Năm 1945",
    startYear: 1778,
    endYear: 1945,
    highlightTheme: "Cung Đình Huế, Ấn Vàng & Mỹ Thuật Pháp Lam",
    description: "Giai đoạn giang sơn thu về một mối. Di sản cung đình tráng lệ với ngọc tỷ truyền quốc, trang phục thêu chỉ vàng, đồ sứ ký kiểu và mỹ nghệ pháp lam đỉnh cao của triều đại quân chủ cuối cùng.",
    color: "#dc2626",
    roomName: "Sảnh Cổ Vật Hoàng Triều Nguyễn (Phòng 5)",
    featuredArtifactCode: "AR-006",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    keyEvents: [
      { year: "1789", event: "Đại đế Quang Trung đại phá 29 vạn quân Mãn Thanh mùa xuân Kỷ Dậu" },
      { year: "1802", event: "Vua Gia Long lập triều Nguyễn, đặt kinh đô tại Huế" },
      { year: "1945", event: "Vua Bảo Đại thoái vị, chấm dứt chế độ quân chủ tại Việt Nam" }
    ],
    artifactsCount: 26
  }
];

// 2. Data Store: Guided Journeys (Storytelling Mode)
const TIMELINE_JOURNEYS: TimelineJourney[] = [
  {
    id: "journey-dong-son-to-oc-eo",
    title: "Từ Dòng Sông Hồng Đến Thương Cảng Óc Eo",
    subtitle: "Hành trình hội tụ các nền văn minh cổ đại trên dải đất Việt",
    summary: "Theo chân các nhà khảo cổ khám phá sự giao thoa kỳ diệu giữa cư dân nông nghiệp lúa nước sông Hồng với thương cảng viễn dương Phù Nam cổ xưa.",
    estimatedMinutes: 20,
    bannerImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    tags: ["Khảo cổ học", "Văn hóa cổ đại", "Bảo vật quốc gia"],
    totalNodes: 3,
    nodes: [
      {
        nodeId: "J1-STEP-1",
        stepNumber: 1,
        title: "Bình Minh Đồng Sơn: Nhịp Giã Gạo & Trống Đồng",
        eraName: "Văn Hóa Đông Sơn (TK 7 TCN - TK 1 SCN)",
        locationRoom: "Sảnh Tiền Sử & Sơ Sử",
        artifactCode: "AR-002",
        artifactName: "Trống Đồng Đông Sơn",
        thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Chào mừng quý khách đến với chặng đầu tiên. Ngay trước mắt bạn là chiếc Trống Đồng Đông Sơn loại I Heger. Hãy nhìn kỹ vào tâm mặt trống: hình mặt trời 14 tia rực rỡ tượng trưng cho quyền năng tối thượng nuôi sống vạn vật, bao bọc xung quanh là 16 cánh chim Lạc sải cánh dài biểu thị ước vọng vươn tới trời cao.",
        voiceDuration: "01:50",
        historicalSignificance: "Hiện vật khẳng định người Việt cổ đã làm chủ kỹ thuật luyện kim đồng thau từ hơn 2.500 năm trước.",
        tour360NodeId: "NODE-ROOM-DONG-SON"
      },
      {
        nodeId: "J1-STEP-2",
        stepNumber: 2,
        title: "Duyên Hải Miền Trung: Huyền Thoại Mộ Chum Sa Huỳnh",
        eraName: "Văn Hóa Sa Huỳnh (TK 10 TCN - TK 2 SCN)",
        locationRoom: "Sảnh Văn Hóa Sa Huỳnh",
        artifactCode: "AR-004",
        artifactName: "Khuyên Tai Hai Đầu Thú Sa Huỳnh",
        thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Rời vùng châu thổ sông Hồng, chúng ta đến với dải cát duyên hải miền Trung. Người Sa Huỳnh không chỉ táng thức người mất trong chum gốm khổng lồ mà còn là bậc thầy mài ngọc. Khuyên tai hai đầu thú bằng ngọc nephrite này thể hiện sự đối xứng thiêng liêng và là vật hộ mệnh cho những chuyến hải hành vượt bão.",
        voiceDuration: "02:10",
        historicalSignificance: "Dấu tích cho thấy mạng lưới giao thương hàng hải trao đổi ngọc bích từ Việt Nam lan tỏa khắp Đông Nam Á.",
        tour360NodeId: "NODE-ROOM-SA-HUYNH"
      },
      {
        nodeId: "J1-STEP-3",
        stepNumber: 3,
        title: "Thương Cảng Óc Eo: Vương Triều Lá Vàng Phù Nam",
        eraName: "Văn Hóa Óc Eo (TK 1 - TK 7 SCN)",
        locationRoom: "Sảnh Văn Hóa Óc Eo & Phù Nam",
        artifactCode: "AR-003",
        artifactName: "Mão Vàng Chạm Khắc Óc Eo",
        thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Điểm dừng chân thứ ba đưa chúng ta tới miền Tây Nam Bộ. Vương quốc Phù Nam từng sở hữu cảng thị Óc Eo sầm uất, nơi tiền vàng La Mã và đá quý Ba Tư cập bến. Chiếc Mão Vàng này được gõ dập nổi tinh xảo trên vàng lá nguyên chất với hoa văn hoa sen thiêng, dành riêng cho bậc quân vương.",
        voiceDuration: "02:05",
        historicalSignificance: "Minh chứng sáng ngời cho kỹ thuật kim hoàn thượng thừa và tầm vóc quốc tế của thương cảng miền Nam thời cổ đại.",
        tour360NodeId: "NODE-ROOM-OC-EO"
      }
    ]
  },
  {
    id: "journey-champa-sculpture",
    title: "Vũ Điệu Thần Linh: Nghệ Thuật Điêu Khắc Champa",
    subtitle: "Thần thoại Ấn Độ giáo và pho tượng Phật đồng thau cổ bậc nhất",
    summary: "Hành trình đưa quý khách chiêm ngưỡng vẻ đẹp uyển chuyển của các vũ nữ Apsara và pho tượng Phật Đồng Dương được công nhận là Bảo vật Quốc gia.",
    estimatedMinutes: 15,
    bannerImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80",
    tags: ["Bảo vật quốc gia", "Nghệ thuật Champa", "Phật giáo"],
    totalNodes: 2,
    nodes: [
      {
        nodeId: "J2-STEP-1",
        stepNumber: 1,
        title: "Pho Tượng Phật Đồng Dương Amaravati",
        eraName: "Nghệ Thuật Champa (Thế kỷ 8 - 9)",
        locationRoom: "Sảnh Văn Hóa Champa",
        artifactCode: "AR-001",
        artifactName: "Tượng Phật Đồng Dương",
        thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Quý khách đang đứng trước một trong những pho tượng đồng thau cổ lớn và hoàn hảo nhất Đông Nam Á. Tượng Phật Đồng Dương cao hơn 1 mét, đúc bằng hợp kim đồng thau rỗng, mang phong cách nghệ thuật Amaravati Nam Ấn với những nếp gấp áo cà sa mềm mại buông rủ qua vai trái.",
        voiceDuration: "02:15",
        historicalSignificance: "Bảo vật Quốc gia độc bản phản ánh thời kỳ cực thịnh của Phật giáo Đại thừa tại vương triều Champa.",
        tour360NodeId: "NODE-ROOM-CHAMPA"
      },
      {
        nodeId: "J2-STEP-2",
        stepNumber: 2,
        title: "Vũ Nữ Apsara & Sự Uyển Chuyển Của Đá Sa Thạch",
        eraName: "Nghệ Thuật Champa (Thế kỷ 10)",
        locationRoom: "Sảnh Văn Hóa Champa",
        artifactCode: "AR-007",
        artifactName: "Phù Điêu Vũ Nữ Apsara Trà Kiệu",
        thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Từng khối đá sa thạch thô ráp dưới bàn tay tài hoa của các nghệ nhân Champa đã hóa thân thành những đường cong mềm mại của nàng Apsara. Nụ cười bí ẩn, vòng eo thon thả và đôi tay uốn lượn như đang hòa vào vũ điệu dâng hiến cho các vị thần tối cao trên đỉnh tháp cổ.",
        voiceDuration: "01:45",
        historicalSignificance: "Tuyệt tác phong cách Trà Kiệu tôn vinh cái đẹp hình thể và âm nhạc cung đình Champa xưa.",
        tour360NodeId: "NODE-ROOM-CHAMPA-2"
      }
    ]
  },
  {
    id: "journey-ly-tran-heritage",
    title: "Hào Khí Đông A: Văn Minh Đại Việt Thời Lý - Trần",
    subtitle: "Dấu ấn Thăng Long ngàn năm văn hiến và tinh thần độc lập quật khởi",
    summary: "Hòa mình vào thời kỳ rực rỡ nhất của nền văn minh Đại Việt với kiến trúc Hoàng thành Thăng Long, tượng Phật thời Lý và chiến công Bạch Đằng giang oanh liệt.",
    estimatedMinutes: 25,
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    tags: ["Lịch sử Đại Việt", "Triều Lý", "Triều Trần"],
    totalNodes: 2,
    nodes: [
      {
        nodeId: "J3-STEP-1",
        stepNumber: 1,
        title: "Hình Tượng Rồng Thời Lý: Thanh Thoát & Từ Bi",
        eraName: "Triều Lý (1009 - 1225)",
        locationRoom: "Sảnh Văn Minh Đại Việt",
        artifactCode: "AR-005",
        artifactName: "Đầu Rồng Đất Nung Hoàng Thành Thăng Long",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Sau một nghìn năm Bắc thuộc, vương triều nhà Lý đã xác lập bản sắc văn hóa tự chủ. Khác với rồng phương Bắc dữ tợn, Rồng thời Lý uốn lượn nhịp nhàng hình sin như dòng sông Hồng, thân trơn, miệng ngậm ngọc châu, biểu thị cho sự thanh bình và tinh thần nhân ái của Phật giáo.",
        voiceDuration: "02:00",
        historicalSignificance: "Biểu tượng đỉnh cao của nền mỹ thuật Đại Việt phục hưng sau ngày định đô Thăng Long.",
        tour360NodeId: "NODE-ROOM-DAI-VIET"
      },
      {
        nodeId: "J3-STEP-2",
        stepNumber: 2,
        title: "Gốm Men Ngọc & Hào Khí Đông A Thời Trần",
        eraName: "Triều Trần (1225 - 1400)",
        locationRoom: "Sảnh Văn Minh Đại Việt",
        artifactCode: "AR-008",
        artifactName: "Thạp Gốm Hoa Nâu Thời Trần",
        thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
        curatorNarration: "Bước sang thời Trần, mỹ thuật mang hơi thở mạnh mẽ, khoáng đạt của những chiến binh ba lần đại thắng quân Nguyên Mông. Chiếc thạp gốm hoa nâu này với họa tiết dũng sĩ cưỡi ngựa múa giáo toát lên vẻ đẹp mộc mạc nhưng tràn đầy hào khí Đông A quật khởi.",
        voiceDuration: "01:55",
        historicalSignificance: "Dòng gốm hoa nâu đặc trưng duy nhất của người Việt, phản ánh tinh thần thượng võ và bản sắc dân tộc độc lập.",
        tour360NodeId: "NODE-ROOM-DAI-VIET-2"
      }
    ]
  }
];

// 3. Related Artifacts Graph Database
const RELATED_ARTIFACTS_MAP: Record<string, RelatedArtifact[]> = {
  "AR-001": [
    {
      artifactId: "mao-vang-oc-eo",
      code: "AR-003",
      name: "Mão Vàng Chạm Khắc Óc Eo",
      era: "Văn Hóa Óc Eo (TK 5 - 6)",
      relationType: "CULTURAL_CROSSOVER",
      relationLabel: "Giao lưu hàng hải phương Nam",
      reason: "Cả hai hiện vật đều là đỉnh cao tôn giáo phương Nam, minh chứng cho sự du nhập và bản địa hóa Phật giáo và Ấn Độ giáo trong cùng giai đoạn lịch sử.",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
      room: "Sảnh Văn Hóa Óc Eo"
    },
    {
      artifactId: "buddha-ly",
      code: "AR-005",
      name: "Tượng Phật A Di Đà Thời Lý",
      era: "Triều Lý (Thế kỷ 11)",
      relationType: "SACRED_MOTIF",
      relationLabel: "Nghệ thuật tượng Phật Việt Nam",
      reason: "So sánh sự khác biệt triết lý tạo tác giữa phong cách Amaravati Champa (mảnh dẻ, sóng áo dạt) và phong cách Phật tích thời Lý (đài sen, áo cà sa phủ kín nghiêm cẩn).",
      thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=400&q=80",
      room: "Sảnh Văn Minh Đại Việt"
    }
  ],
  "AR-002": [
    {
      artifactId: "khuyen-tai-sa-huynh",
      code: "AR-004",
      name: "Khuyên Tai Hai Đầu Thú Sa Huỳnh",
      era: "Văn Hóa Sa Huỳnh (TK 2 TCN)",
      relationType: "SAME_ERA",
      relationLabel: "Đồng đại sơ sử Việt Nam",
      reason: "Trống Đồng Đông Sơn ở phía Bắc và khuyên tai Sa Huỳnh ở miền Trung cùng tồn tại trong thiên niên kỷ 1 TCN, bổ sung cho bức tranh toàn cảnh về buổi đầu lập quốc.",
      thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=400&q=80",
      room: "Sảnh Văn Hóa Sa Huỳnh"
    },
    {
      artifactId: "riu-dong-dong-son",
      code: "AR-009",
      name: "Rìu Đồng Lưỡi Xéo Đông Sơn",
      era: "Văn Hóa Đông Sơn (TK 3 TCN)",
      relationType: "MATERIAL_TECHNIQUE",
      relationLabel: "Cùng kỹ nghệ luyện kim đồng thau",
      reason: "Cùng sử dụng kỹ thuật đúc đồng hai mang khuôn tinh vi với hoa văn khắc chìm cảnh thuyền chiến và chim thần.",
      thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
      room: "Sảnh Tiền Sử & Sơ Sử"
    }
  ],
  "AR-003": [
    {
      artifactId: "buddha-dong-duong",
      code: "AR-001",
      name: "Tượng Phật Đồng Dương",
      era: "Văn Hóa Champa (TK 8 - 9)",
      relationType: "CULTURAL_CROSSOVER",
      relationLabel: "Giao lưu thương cảng Nam Bộ & Nam Trung Bộ",
      reason: "Hai bảo vật thể hiện hai đỉnh cao kim loại quý (vàng lá Óc Eo và đồng thau Champa) của các cư dân viễn dương thời cổ đại.",
      thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      room: "Sảnh Văn Hóa Champa"
    }
  ]
};

// ==========================================
// ROUTES IMPLEMENTATION
// ==========================================

// 1. GET /api/v1/timeline/eras
timelineRouter.get("/eras", (req: Request, res: Response) => {
  res.json({
    success: true,
    count: TIMELINE_ERAS.length,
    data: TIMELINE_ERAS
  });
});

// 2. GET /api/v1/timeline/journeys
timelineRouter.get("/journeys", (req: Request, res: Response) => {
  const journeysSummary = TIMELINE_JOURNEYS.map(j => ({
    id: j.id,
    title: j.title,
    subtitle: j.subtitle,
    summary: j.summary,
    estimatedMinutes: j.estimatedMinutes,
    bannerImage: j.bannerImage,
    tags: j.tags,
    totalNodes: j.totalNodes
  }));

  res.json({
    success: true,
    count: journeysSummary.length,
    data: journeysSummary
  });
});

// 3. GET /api/v1/timeline/journeys/:id
timelineRouter.get("/journeys/:id", (req: Request, res: Response) => {
  const journeyId = req.params.id;
  const journey = TIMELINE_JOURNEYS.find(j => j.id === journeyId);

  if (!journey) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy hành trình giám tuyển với mã: ${journeyId}`
    });
  }

  res.json({
    success: true,
    data: journey
  });
});

// 4. GET /api/v1/timeline/artifacts/:code/related
timelineRouter.get("/artifacts/:code/related", (req: Request, res: Response) => {
  const artifactCode = req.params.code.toUpperCase();
  const relatedList = RELATED_ARTIFACTS_MAP[artifactCode] || [];

  res.json({
    success: true,
    artifactCode,
    count: relatedList.length,
    data: relatedList
  });
});
