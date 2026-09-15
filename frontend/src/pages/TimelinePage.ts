import { Icons } from "../components/Icons";
import { ARTIFACTS_DATA, Artifact } from "../data/artifacts";
import { showToast } from "../components/Toast";

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
  relationType: string;
  relationLabel: string;
  reason: string;
  thumbnail: string;
  room: string;
}

export const TimelineStore = {
  activeMode: "free" as "free" | "guided",
  selectedEraId: "dong-son",
  selectedJourneyId: "journey-dong-son-to-oc-eo",
  currentJourneyStep: 0,
  isPlayingAudio: false,

  eras: [
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
  ] as TimelineEra[],

  journeys: [
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
          title: "Bình Minh Đông Sơn: Nhịp Giã Gạo & Trống Đồng",
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
      summary: "Chiêm ngưỡng vẻ đẹp uyển chuyển của các vũ nữ Apsara và pho tượng Phật Đồng Dương được công nhận là Bảo vật Quốc gia.",
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
      summary: "Thời kỳ phục hưng rực rỡ nhất của nền văn minh Đại Việt với kiến trúc Hoàng thành Thăng Long, tượng Phật thời Lý và chiến công Bạch Đằng giang oanh liệt.",
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
  ] as TimelineJourney[]
};

function speakCuratorText(text: string) {
  if (!("speechSynthesis" in window)) {
    showToast("Trình duyệt không hỗ trợ Web Speech API", "warning");
    return;
  }

  if (TimelineStore.isPlayingAudio) {
    window.speechSynthesis.cancel();
    TimelineStore.isPlayingAudio = false;
    updateAudioButtonUI(false);
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    TimelineStore.isPlayingAudio = true;
    updateAudioButtonUI(true);
  };

  utterance.onend = () => {
    TimelineStore.isPlayingAudio = false;
    updateAudioButtonUI(false);
  };

  utterance.onerror = () => {
    TimelineStore.isPlayingAudio = false;
    updateAudioButtonUI(false);
  };

  window.speechSynthesis.speak(utterance);
}

function updateAudioButtonUI(isPlaying: boolean) {
  const btn = document.getElementById("btn-curator-voice");
  if (!btn) return;
  if (isPlaying) {
    btn.innerHTML = `${Icons.pause} <span>Tạm Dừng Thuyết Minh Giám Tuyển</span>`;
    btn.classList.add("playing");
  } else {
    btn.innerHTML = `${Icons.volume} <span>Nghe Giọng Đọc Thuyết Minh Giám Tuyển</span>`;
    btn.classList.remove("playing");
  }
}

export function renderTimelinePage(): string {
  const isFree = TimelineStore.activeMode === "free";
  const selectedEra = TimelineStore.eras.find(e => e.id === TimelineStore.selectedEraId) || TimelineStore.eras[0];
  const activeJourney = TimelineStore.journeys.find(j => j.id === TimelineStore.selectedJourneyId) || TimelineStore.journeys[0];
  const activeNode = activeJourney.nodes[TimelineStore.currentJourneyStep] || activeJourney.nodes[0];

  const currentEraArtifacts = ARTIFACTS_DATA.filter(a => {
    if (selectedEra.id === "dong-son") return a.periodGroup === "dong-son";
    if (selectedEra.id === "sa-huynh") return a.periodGroup === "sa-huynh";
    if (selectedEra.id === "oc-eo") return a.periodGroup === "oc-eo";
    if (selectedEra.id === "champa") return a.periodGroup === "champa";
    if (selectedEra.id === "le-nguyen") return a.periodGroup === "trieu-nguyen";
    return true;
  });

  return `
    <div class="timeline-page-container animate-fade-in" style="padding: 1.5rem 2rem; max-width: 1400px; margin: 0 auto;">
      <div class="timeline-hero-header" style="background: linear-gradient(135deg, rgba(15, 14, 14, 0.95), rgba(30, 25, 20, 0.9)), url('https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80') center/cover; padding: 2.2rem 2.5rem; border-radius: var(--radius-lg); border: 1px solid rgba(212, 175, 55, 0.3); margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="position: relative; z-index: 2; max-width: 900px;">
          <div style="display: flex; align-items: center; gap: 0.6rem; color: #d4af37; font-weight: 700; letter-spacing: 0.1em; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.5rem;">
            ${Icons.clock}
            <span>DÒNG THỜI GIAN SỐNG • LIVING TIMELINE</span>
          </div>
          <h1 style="font-family: 'Cinzel', serif; font-size: 2.3rem; font-weight: 800; color: #f5f2eb; margin: 0 0 0.6rem 0; line-height: 1.2; text-shadow: 0 2px 10px rgba(0,0,0,0.7);">
            Khám Phá Các Triều Đại Lịch Sử Việt Nam
          </h1>
          <p style="color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin: 0 0 1.5rem 0;">
            Hành trình xuyên không qua 2.500 năm di sản từ bình minh Đông Sơn sông Hồng, thương cảng Óc Eo rực rỡ, vũ điệu sa thạch Champa đến kỷ nguyên văn hiến Đại Việt và cung đình Huế.
          </p>

          <div style="display: inline-flex; background: rgba(0,0,0,0.6); padding: 0.35rem; border-radius: 999px; border: 1px solid rgba(212, 175, 55, 0.4); backdrop-filter: blur(8px);">
            <button id="btn-mode-free" class="btn-timeline-mode ${isFree ? 'active' : ''}" style="border: none; border-radius: 999px; padding: 0.5rem 1.4rem; font-size: 0.88rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.25s; ${isFree ? 'background: #d4af37; color: #0f0e0e; box-shadow: 0 0 15px rgba(212,175,55,0.4);' : 'background: transparent; color: #cbd5e1;'}">
              ${Icons.filter}
              <span>Khám Phá Tự Do (Free Explore)</span>
            </button>
            <button id="btn-mode-guided" class="btn-timeline-mode ${!isFree ? 'active' : ''}" style="border: none; border-radius: 999px; padding: 0.5rem 1.4rem; font-size: 0.88rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.25s; ${!isFree ? 'background: #d4af37; color: #0f0e0e; box-shadow: 0 0 15px rgba(212,175,55,0.4);' : 'background: transparent; color: #cbd5e1;'}">
              ${Icons.compass}
              <span>Hành Trình Giám Tuyển (Guided Story)</span>
            </button>
          </div>
        </div>
      </div>

      ${isFree ? renderFreeExploreMode(selectedEra, currentEraArtifacts) : renderGuidedJourneyMode(activeJourney, activeNode)}
    </div>

    <div id="timeline-modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 1rem;">
      <div id="timeline-modal-content" style="background: var(--color-surface); border: 1px solid rgba(212,175,55,0.4); border-radius: var(--radius-lg); max-width: 650px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative;">
      </div>
    </div>
  `;
}

function renderFreeExploreMode(selectedEra: TimelineEra, currentEraArtifacts: Artifact[]): string {
  return `
    <div class="free-explore-wrapper animate-fade-in">
      <div class="era-stepper-container" style="margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.8rem;">
        <div style="display: flex; gap: 1rem; min-width: 950px; position: relative;">
          ${TimelineStore.eras.map((era, index) => {
            const isSelected = era.id === selectedEra.id;
            return `
              <div class="era-step-card ${isSelected ? 'selected' : ''}" data-era-id="${era.id}" style="flex: 1; padding: 1.1rem 1rem; background: ${isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(15,14,14,0.95))' : 'var(--color-surface)'}; border: 1px solid ${isSelected ? '#d4af37' : 'var(--color-border)'}; border-radius: var(--radius-md); cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; ${isSelected ? 'box-shadow: 0 4px 20px rgba(212,175,55,0.25); transform: translateY(-2px);' : ''}">
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: ${isSelected ? '#d4af37' : 'var(--color-text-muted)'}; margin-bottom: 0.3rem;">
                  MỐC 0${index + 1}
                </div>
                <div style="font-size: 0.92rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 0.3rem; line-height: 1.3;">
                  ${era.name.split("&")[0].trim()}
                </div>
                <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;">
                  ${era.periodRange}
                </div>
                ${isSelected ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #d4af37;"></div>` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div class="era-spotlight-card" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 2.5rem; box-shadow: 0 5px 20px rgba(0,0,0,0.2);">
        <div>
          <div style="display: inline-block; padding: 0.3rem 0.8rem; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 999px; color: #d4af37; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.8rem;">
            ${selectedEra.periodRange} • ${selectedEra.artifactsCount} HIỆN VẬT LƯU TRỮ
          </div>
          <h2 style="font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: 800; color: var(--color-primary); margin: 0 0 0.8rem 0;">
            ${selectedEra.name}
          </h2>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 1rem;">
            ✦ ${selectedEra.highlightTheme}
          </div>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">
            ${selectedEra.description}
          </p>

          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <a href="#tour360" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; padding: 0.65rem 1.2rem; font-weight: 700; font-size: 0.88rem;">
              ${Icons.compass}
              <span>Vào Tham Quan ${selectedEra.roomName}</span>
            </a>
            <button class="btn btn-secondary btn-era-read-aloud" data-text="${selectedEra.name}. ${selectedEra.description}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.2rem; font-weight: 700; font-size: 0.88rem;">
              ${Icons.volume}
              <span>Nghe Thuyết Minh Thời Kỳ</span>
            </button>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.4rem;">
          <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: #d4af37; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
            ${Icons.calendar}
            <span>Dấu Mốc Lịch Sử Trọng Điểm</span>
          </div>
          <div class="key-events-list" style="display: flex; flex-direction: column; gap: 1rem; position: relative;">
            ${selectedEra.keyEvents.map((ev, i) => `
              <div style="display: flex; gap: 0.9rem; align-items: flex-start; position: relative;">
                <div style="min-width: 22px; height: 22px; border-radius: 50%; background: #d4af37; color: #0f0e0e; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 900; margin-top: 0.1rem;">
                  ${i + 1}
                </div>
                <div>
                  <div style="font-size: 0.84rem; font-weight: 800; color: var(--color-text-main);">${ev.year}</div>
                  <div style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5;">${ev.event}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="font-family: 'Cinzel', serif; font-size: 1.35rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.3rem 0;">
            Bảo Vật & Hiện Vật Tiêu Biểu (${currentEraArtifacts.length})
          </h3>
          <p style="font-size: 0.86rem; color: var(--color-text-muted); margin: 0;">
            Các di vật khảo cổ hiện đang được bảo quản và trưng bày tại Bảo tàng Lịch sử TP.HCM
          </p>
        </div>
      </div>

      <div class="era-artifacts-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${currentEraArtifacts.map(art => `
          <div class="artifact-card animate-fade-in" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.25s, box-shadow 0.25s;">
            <div style="height: 190px; position: relative; overflow: hidden;">
              <img src="${art.thumbnail}" alt="${art.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" loading="lazy">
              <div style="position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(15,14,14,0.85); color: #d4af37; font-size: 0.72rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 999px; border: 1px solid rgba(212,175,55,0.4);">
                ${art.code}
              </div>
              <div style="position: absolute; bottom: 0.75rem; right: 0.75rem; background: rgba(15,14,14,0.85); color: #f5f2eb; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px;">
                ${art.room}
              </div>
            </div>

            <div style="padding: 1.2rem; flex: 1; display: flex; flex-direction: column;">
              <h4 style="font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 800; color: var(--color-primary); margin: 0 0 0.4rem 0;">
                ${art.name}
              </h4>
              <div style="font-size: 0.8rem; color: var(--color-secondary); font-weight: 600; margin-bottom: 0.6rem;">
                ${art.era} • Chất liệu: ${art.material}
              </div>
              <p style="font-size: 0.84rem; color: var(--color-text-muted); line-height: 1.6; margin: 0 0 1.2rem 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${art.placardText}
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: auto;">
                <button class="btn btn-secondary btn-view-related" data-code="${art.code}" style="padding: 0.55rem; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                  ${Icons.cube}
                  <span>Cổ Vật Liên Đới</span>
                </button>
                <a href="#artifact?id=${art.id}" class="btn btn-primary" style="padding: 0.55rem; font-size: 0.8rem; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                  <span>Chi Tiết 3D</span>
                  ${Icons.arrowRight}
                </a>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderGuidedJourneyMode(activeJourney: TimelineJourney, activeNode: TimelineJourneyNode): string {
  const currentStep = TimelineStore.currentJourneyStep;
  const isFirst = currentStep === 0;
  const isLast = currentStep === activeJourney.nodes.length - 1;

  return `
    <div class="guided-journey-wrapper animate-fade-in">
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem;">
        ${TimelineStore.journeys.map(j => {
          const isCurrent = j.id === activeJourney.id;
          return `
            <div class="journey-select-tab ${isCurrent ? 'active' : ''}" data-journey-id="${j.id}" style="padding: 0.9rem 1.4rem; background: ${isCurrent ? 'linear-gradient(135deg, rgba(212,175,55,0.2), var(--color-surface))' : 'var(--color-surface)'}; border: 1px solid ${isCurrent ? '#d4af37' : 'var(--color-border)'}; border-radius: var(--radius-md); cursor: pointer; min-width: 280px; transition: all 0.25s ease;">
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #d4af37; margin-bottom: 0.2rem;">
                HÀNH TRÌNH GIÁM TUYỂN • ${j.estimatedMinutes} PHÚT
              </div>
              <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 0.2rem;">
                ${j.title}
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);">
                ${j.totalNodes} chặng khám phá
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="journey-stage-card" style="background: var(--color-surface); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.35); margin-bottom: 2rem;">
        <div style="background: rgba(0,0,0,0.25); border-bottom: 1px solid var(--color-border); padding: 1.2rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #d4af37; font-weight: 800; margin-bottom: 0.2rem;">
              CHẶNG ${activeNode.stepNumber} / ${activeJourney.nodes.length}
            </div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-main);">
              ${activeNode.title}
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${activeJourney.nodes.map((n, idx) => `
              <div class="step-pill ${idx === currentStep ? 'active' : (idx < currentStep ? 'completed' : '')}" data-step-index="${idx}" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; cursor: pointer; transition: all 0.25s; ${idx === currentStep ? 'background: #d4af37; color: #0f0e0e; box-shadow: 0 0 10px rgba(212,175,55,0.5);' : (idx < currentStep ? 'background: rgba(212,175,55,0.3); color: #d4af37;' : 'background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted);')}">
                ${idx + 1}
              </div>
            `).join("")}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.15fr; gap: 2.5rem; padding: 2.5rem;">
          <div>
            <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.4); border: 1px solid var(--color-border); height: 360px;">
              <img src="${activeNode.thumbnail}" alt="${activeNode.artifactName}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              <div style="position: absolute; bottom: 0; inset-inline: 0; background: linear-gradient(transparent, rgba(15,14,14,0.95)); padding: 1.5rem 1.2rem 1rem 1.2rem;">
                <div style="color: #d4af37; font-size: 0.78rem; font-weight: 800; margin-bottom: 0.2rem;">
                  ${activeNode.eraName}
                </div>
                <div style="color: #f5f2eb; font-size: 1.2rem; font-weight: 800; font-family: 'Cinzel', serif;">
                  ${activeNode.artifactName}
                </div>
                <div style="color: #94a3b8; font-size: 0.8rem; font-weight: 600;">
                  Vị trí: ${activeNode.locationRoom}
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 1.2rem;">
              <a href="#tour360" class="btn btn-secondary" style="text-decoration: none; padding: 0.7rem; font-size: 0.84rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                ${Icons.compass}
                <span>Xem Phòng 360°</span>
              </a>
              <a href="#artifact?code=${activeNode.artifactCode}" class="btn btn-secondary" style="text-decoration: none; padding: 0.7rem; font-size: 0.84rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                ${Icons.cube}
                <span>Xoay 3D Cổ Vật</span>
              </a>
            </div>
          </div>

          <div style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; gap: 0.6rem; color: #d4af37; font-size: 0.82rem; font-weight: 800; text-transform: uppercase; margin-bottom: 0.8rem;">
              <span>✦ LỜI DẪN CỦA GIÁM ĐỐC GIÁM TUYỂN (CURATOR)</span>
            </div>

            <div style="background: rgba(212,175,55,0.06); border-left: 3px solid #d4af37; padding: 1.4rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-bottom: 1.5rem;">
              <p style="font-size: 1.05rem; line-height: 1.8; color: var(--color-text-main); font-style: italic; margin: 0;">
                "${activeNode.curatorNarration}"
              </p>
            </div>

            <div style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1.2rem; margin-bottom: 2rem;">
              <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: var(--color-secondary); margin-bottom: 0.4rem;">
                Ý Nghĩa Lịch Sử & Thẩm Định Khảo Cổ
              </div>
              <div style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.6;">
                ${activeNode.historicalSignificance}
              </div>
            </div>

            <div style="margin-top: auto; display: flex; flex-direction: column; gap: 1rem;">
              <button id="btn-curator-voice" class="btn btn-primary" data-text="${activeNode.curatorNarration}" style="padding: 0.8rem 1.5rem; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.6rem;">
                ${Icons.volume}
                <span>Nghe Giọng Đọc Thuyết Minh Giám Tuyển (${activeNode.voiceDuration})</span>
              </button>

              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <button id="btn-prev-step" class="btn btn-secondary" style="padding: 0.65rem 1.2rem; font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;" ${isFirst ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                  ${Icons.chevronLeft}
                  <span>Chặng Trước</span>
                </button>

                <div style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">
                  Chặng ${currentStep + 1} của ${activeJourney.nodes.length}
                </div>

                <button id="btn-next-step" class="btn ${isLast ? 'btn-secondary' : 'btn-primary'}" style="padding: 0.65rem 1.2rem; font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;" ${isLast ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                  <span>${isLast ? 'Hoàn Thành Hành Trình' : 'Chặng Kế Tiếp'}</span>
                  ${Icons.chevronRight}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initTimelinePageLogic() {
  const btnFree = document.getElementById("btn-mode-free");
  const btnGuided = document.getElementById("btn-mode-guided");

  btnFree?.addEventListener("click", () => {
    if (TimelineStore.activeMode !== "free") {
      TimelineStore.activeMode = "free";
      window.speechSynthesis?.cancel();
      TimelineStore.isPlayingAudio = false;
      renderActiveTabContent();
    }
  });

  btnGuided?.addEventListener("click", () => {
    if (TimelineStore.activeMode !== "guided") {
      TimelineStore.activeMode = "guided";
      window.speechSynthesis?.cancel();
      TimelineStore.isPlayingAudio = false;
      renderActiveTabContent();
    }
  });

  document.querySelectorAll(".era-step-card").forEach(card => {
    card.addEventListener("click", () => {
      const eraId = card.getAttribute("data-era-id");
      if (eraId && eraId !== TimelineStore.selectedEraId) {
        TimelineStore.selectedEraId = eraId;
        window.speechSynthesis?.cancel();
        TimelineStore.isPlayingAudio = false;
        renderActiveTabContent();
      }
    });
  });

  document.querySelectorAll(".journey-select-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const jId = tab.getAttribute("data-journey-id");
      if (jId && jId !== TimelineStore.selectedJourneyId) {
        TimelineStore.selectedJourneyId = jId;
        TimelineStore.currentJourneyStep = 0;
        window.speechSynthesis?.cancel();
        TimelineStore.isPlayingAudio = false;
        renderActiveTabContent();
      }
    });
  });

  document.querySelectorAll(".step-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const stepIdx = parseInt(pill.getAttribute("data-step-index") || "0", 10);
      TimelineStore.currentJourneyStep = stepIdx;
      window.speechSynthesis?.cancel();
      TimelineStore.isPlayingAudio = false;
      renderActiveTabContent();
    });
  });

  document.getElementById("btn-prev-step")?.addEventListener("click", () => {
    if (TimelineStore.currentJourneyStep > 0) {
      TimelineStore.currentJourneyStep--;
      window.speechSynthesis?.cancel();
      TimelineStore.isPlayingAudio = false;
      renderActiveTabContent();
    }
  });

  document.getElementById("btn-next-step")?.addEventListener("click", () => {
    const activeJourney = TimelineStore.journeys.find(j => j.id === TimelineStore.selectedJourneyId) || TimelineStore.journeys[0];
    if (TimelineStore.currentJourneyStep < activeJourney.nodes.length - 1) {
      TimelineStore.currentJourneyStep++;
      window.speechSynthesis?.cancel();
      TimelineStore.isPlayingAudio = false;
      renderActiveTabContent();
    }
  });

  document.getElementById("btn-curator-voice")?.addEventListener("click", (e) => {
    const btn = e.currentTarget as HTMLElement;
    const text = btn.getAttribute("data-text") || "";
    speakCuratorText(text);
  });

  document.querySelectorAll(".btn-era-read-aloud").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const text = (e.currentTarget as HTMLElement).getAttribute("data-text") || "";
      speakCuratorText(text);
    });
  });

  document.querySelectorAll(".btn-view-related").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const code = (e.currentTarget as HTMLElement).getAttribute("data-code") || "";
      openRelatedArtifactsModal(code);
    });
  });

  const backdrop = document.getElementById("timeline-modal-backdrop");
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.style.display = "none";
    }
  });
}

function renderActiveTabContent() {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = renderTimelinePage();
    initTimelinePageLogic();
  }
}

async function openRelatedArtifactsModal(artifactCode: string) {
  const backdrop = document.getElementById("timeline-modal-backdrop");
  const modalContent = document.getElementById("timeline-modal-content");
  if (!backdrop || !modalContent) return;

  modalContent.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 1.2rem; font-weight: 700; color: #d4af37;">Đang tải danh sách cổ vật liên đới...</div>
    </div>
  `;
  backdrop.style.display = "flex";

  try {
    let relatedList: RelatedArtifact[] = [];
    try {
      const res = await fetch(`http://localhost:3000/api/v1/timeline/artifacts/${artifactCode}/related`);
      const json = await res.json();
      if (json.success) {
        relatedList = json.data;
      }
    } catch {
      if (artifactCode === "AR-001") {
        relatedList = [
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
          }
        ];
      }
    }

    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.8rem;">
        <div>
          <div style="font-size: 0.76rem; text-transform: uppercase; font-weight: 800; color: #d4af37;">
            MẠNG LƯỚI KHẢO CỔ LIÊN ĐỚI
          </div>
          <h3 style="font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 800; color: var(--color-primary); margin: 0.2rem 0 0 0;">
            Hiện Vật Liên Quan Với ${artifactCode}
          </h3>
        </div>
        <button id="btn-close-timeline-modal" style="background: transparent; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; padding: 0.3rem;">
          ${Icons.x}
        </button>
      </div>

      ${relatedList.length === 0 ? `
        <div style="padding: 2rem; text-align: center; color: var(--color-text-muted);">
          Hiện chưa có liên kết giám định đặc biệt nào được ghi nhận cho hiện vật này.
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
          ${relatedList.map(rel => `
            <div style="background: rgba(0,0,0,0.15); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.2rem; display: flex; gap: 1.2rem; align-items: flex-start;">
              <img src="${rel.thumbnail}" alt="${rel.name}" style="width: 110px; height: 110px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--color-border); flex-shrink: 0;">
              <div style="flex: 1;">
                <div style="display: inline-block; padding: 0.2rem 0.6rem; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); border-radius: 4px; font-size: 0.72rem; font-weight: 800; color: #d4af37; margin-bottom: 0.4rem;">
                  ${rel.relationLabel}
                </div>
                <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 0.2rem;">
                  ${rel.name} (${rel.code})
                </div>
                <div style="font-size: 0.78rem; color: var(--color-secondary); font-weight: 600; margin-bottom: 0.5rem;">
                  ${rel.era} • ${rel.room}
                </div>
                <p style="font-size: 0.84rem; color: var(--color-text-muted); line-height: 1.5; margin: 0 0 0.8rem 0;">
                  <strong style="color: var(--color-text-main);">Lý do giám định:</strong> ${rel.reason}
                </p>
                <a href="#artifact?code=${rel.code}" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; font-size: 0.78rem; font-weight: 700; text-decoration: none;">
                  <span>Xem Chi Tiết Cổ Vật</span>
                  ${Icons.arrowRight}
                </a>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    `;

    document.getElementById("btn-close-timeline-modal")?.addEventListener("click", () => {
      backdrop.style.display = "none";
    });
  } catch (err) {
    showToast("Không thể tải thông tin hiện vật liên đới", "error");
    backdrop.style.display = "none";
  }
}
