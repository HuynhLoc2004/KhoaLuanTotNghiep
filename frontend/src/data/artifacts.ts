export interface Artifact {
  id: string;
  code: string;
  name: string;
  era: string;
  periodGroup: "dong-son" | "sa-huynh" | "oc-eo" | "champa" | "trieu-nguyen";
  material: string;
  location: string;
  room: string;
  thumbnail: string;
  placardText: string;
  audioDuration: string;
  hotspots: {
    title: string;
    description: string;
    x: number;
    y: number;
    z: number;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const ARTIFACTS_DATA: Artifact[] = [
  {
    id: "buddha-dong-duong",
    code: "AR-001",
    name: "Tượng Phật Đồng Dương",
    era: "Thế kỷ 8 - 9",
    periodGroup: "champa",
    material: "Hợp kim đồng thau cổ",
    location: "Phòng Trưng Bày 3",
    room: "Sảnh Văn Hóa Champa",
    thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    placardText: "Bảo vật quốc gia. Pho tượng Phật đứng bằng đồng thau, phong cách nghệ thuật Amaravati tiêu biểu với nếp gấp áo cà sa vắt qua vai trái. Di vật minh chứng cho giao lưu hàng hải văn hóa rực rỡ phương Nam.",
    audioDuration: "02:15",
    hotspots: [
      { title: "Nhục kế Ushnisha", description: "Búi tóc xoắn ốc biểu trưng cho trí tuệ giác ngộ.", x: 0, y: 1.8, z: 0.2 },
      { title: "Nếp áo Amaravati", description: "Các đường dợn sóng mềm mại vắt vai trái.", x: -0.3, y: 0.9, z: 0.1 },
      { title: "Đồng thau đúc rỗng", description: "Kỹ thuật đúc khuôn sáp cháy tinh xảo.", x: 0.2, y: 0.4, z: 0.1 }
    ],
    quiz: [
      {
        question: "Tượng Phật Đồng Dương mang phong cách nghệ thuật nào sau đây?",
        options: ["Phong cách Gandhara (Bắc Ấn)", "Phong cách Amaravati (Nam Ấn)", "Phong cách Dvaravati (Thái Lan)", "Phong cách Đường (Trung Hoa)"],
        correctIndex: 1,
        explanation: "Nếp gấp áo cà sa dạt sang một bên và đường nét khuôn mặt là nét đặc trưng của trường phái Amaravati."
      }
    ]
  },
  {
    id: "trong-dong-dong-son",
    code: "AR-002",
    name: "Trống Đồng Đông Sơn",
    era: "Thế kỷ 3 TCN - Thế kỷ 1 SCN",
    periodGroup: "dong-son",
    material: "Đồng cổ",
    location: "Phòng Trưng Bày 1",
    room: "Sảnh Tiền Sử & Sơ Sử",
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    placardText: "Trống đồng loại I Heger. Mặt trống đúc nổi hình ngôi sao 14 cánh ở trung tâm tượng trưng cho mặt trời, xen kẽ hoa văn chim Lạc bay ngược chiều kim đồng hồ và cảnh giã gạo mừng ngày hội mùa.",
    audioDuration: "01:50",
    hotspots: [
      { title: "Ngôi sao 14 cánh", description: "Tín ngưỡng tôn sùng thần Mặt Trời.", x: 0, y: 1.2, z: 0 },
      { title: "Chim Lạc bay", description: "Họa tiết chim sải cánh dài biểu tượng tâm linh.", x: 0.4, y: 1.1, z: 0.3 }
    ],
    quiz: [
      {
        question: "Ở tâm mặt Trống Đồng Đông Sơn có hình tượng gì?",
        options: ["Hình mặt trời ngôi sao nhiều cánh", "Hình hoa sen nở", "Hình rồng thời Lý", "Hình ngọn núi thiêng"],
        correctIndex: 0,
        explanation: "Trung tâm mặt trống luôn là hình mặt trời với các tia sáng tỏa ra."
      }
    ]
  },
  {
    id: "mao-vang-oc-eo",
    code: "AR-003",
    name: "Mão Vàng Chạm Khắc Óc Eo",
    era: "Thế kỷ 5 - 6",
    periodGroup: "oc-eo",
    material: "Vàng lá dát mỏng",
    location: "Phòng Trưng Bày 3",
    room: "Sảnh Văn Hóa Óc Eo",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    placardText: "Bảo vật hoàng gia Phù Nam. Mão được tạo tác từ lá vàng dát mỏng, chạm nổi hình tượng hoa sen thiêng và các vị thần bảo hộ vương quyền của thương cảng quốc tế Óc Eo cổ.",
    audioDuration: "02:05",
    hotspots: [
      { title: "Họa tiết hoa sen vàng", description: "Kỹ thuật đục gõ dập nổi tinh xảo trên vàng lá.", x: 0, y: 0.8, z: 0.2 }
    ],
    quiz: [
      {
        question: "Mão Vàng chạm khắc Óc Eo thuộc về nền văn hóa cổ nào ở Nam Bộ?",
        options: ["Văn hóa Sa Huỳnh", "Văn hóa Đồng Nai", "Văn hóa Phù Nam - Óc Eo", "Văn hóa Đông Sơn"],
        correctIndex: 2,
        explanation: "Di vật này thuộc thời kỳ rực rỡ của vương quốc Phù Nam với cảng thị Óc Eo."
      }
    ]
  },
  {
    id: "khuyen-tai-sa-huynh",
    code: "AR-004",
    name: "Khuyên Tai Hai Đầu Thú Sa Huỳnh",
    era: "Khoảng 2.000 năm trước",
    periodGroup: "sa-huynh",
    material: "Đá ngọc Nephrite",
    location: "Phòng Trưng Bày 2",
    room: "Sảnh Sa Huỳnh",
    thumbnail: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    placardText: "Cặp khuyên tai bằng ngọc bích chạm khắc hình hai đầu linh thú đối xứng, biểu tượng quyền uy và tín ngưỡng tôn sùng thiên nhiên của thủ lĩnh cư dân Sa Huỳnh cổ đại.",
    audioDuration: "01:30",
    hotspots: [
      { title: "Đầu linh thú đối xứng", description: "Được mài nhẵn bóng bằng kỹ thuật cưa dây cát thạch anh.", x: 0, y: 0.5, z: 0.1 }
    ],
    quiz: [
      {
        question: "Khuyên tai hai đầu thú Sa Huỳnh được chế tác từ chất liệu gì?",
        options: ["Đá ngọc Nephrite / Thạch anh", "Kim loại vàng", "Gốm nung tráng men", "Xương thú"],
        correctIndex: 0,
        explanation: "Cư dân Sa Huỳnh có kỹ nghệ chế tác đá ngọc tinh tế hàng đầu Đông Nam Á."
      }
    ]
  },
  {
    id: "tuong-nu-than-devi",
    code: "AR-005",
    name: "Tượng Nữ Thần Devi Trà Kiệu",
    era: "Thế kỷ 10",
    periodGroup: "champa",
    material: "Đá sa thạch",
    location: "Phòng Trưng Bày 3",
    room: "Sảnh Điêu Khắc Champa",
    thumbnail: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    placardText: "Tác phẩm điêu khắc sa thạch đỉnh cao phong cách Trà Kiệu. Nụ cười huyền bí và khuôn mặt tròn đôn hậu phản ánh lý tưởng thẩm mỹ và đời sống tâm linh của vương quốc Champa thế kỷ 10.",
    audioDuration: "01:45",
    hotspots: [
      { title: "Nụ cười Trà Kiệu", description: "Đặc trưng nụ cười kín đáo và khóe mắt dài cong nhẹ.", x: 0, y: 0.9, z: 0.2 }
    ],
    quiz: [
      {
        question: "Tượng Nữ Thần Devi thuộc phong cách điêu khắc Champa nào?",
        options: ["Phong cách Đồng Dương", "Phong cách Trà Kiệu", "Phong cách Mỹ Sơn E1", "Phong cách Tháp Mẫm"],
        correctIndex: 1,
        explanation: "Đây là tác phẩm tiêu biểu của phong cách Trà Kiệu thế kỷ 10."
      }
    ]
  },
  {
    id: "sung-than-cong-nguyen",
    code: "AR-006",
    name: "Súng Thần Công Thời Nguyễn",
    era: "Năm 1802 - 1820",
    periodGroup: "trieu-nguyen",
    material: "Hợp kim đồng gang",
    location: "Sân Vườn Di Tích",
    room: "Khu Vực Binh Khí Cổ",
    thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80",
    placardText: "Khẩu thần công đúc dưới triều vua Gia Long. Thân súng khắc chữ Hán ghi rõ phiên hiệu, trọng lượng, số đo thuốc đạn và danh tính thợ đúc của xưởng đúc vũ khí kinh thành Huế.",
    audioDuration: "01:40",
    hotspots: [
      { title: "Chữ Hán khắc chìm", description: "Ghi niên hiệu Gia Long và quy chuẩn thuốc pháo.", x: 0, y: 0.4, z: 0.3 }
    ],
    quiz: [
      {
        question: "Súng thần công tại bảo tàng được đúc dưới triều đại phong kiến nào?",
        options: ["Nhà Hậu Lê", "Nhà Tây Sơn", "Triều Nguyễn", "Nhà Mạc"],
        correctIndex: 2,
        explanation: "Khẩu pháo mang niên hiệu triều Nguyễn thế kỷ 19."
      }
    ]
  },
  {
    id: "binh-gom-cay-mai",
    code: "AR-007",
    name: "Bình Gốm Cây Mai Men Xanh",
    era: "Thế kỷ 19",
    periodGroup: "trieu-nguyen",
    material: "Gốm men màu",
    location: "Phòng Trưng Bày 4",
    room: "Sảnh Gốm Cổ Sài Gòn",
    thumbnail: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80",
    placardText: "Sản phẩm của lò gốm Cây Mai lừng danh vùng Chợ Lớn xưa. Bình phủ men màu xanh đồng đặc trưng, thân đắp nổi tích truyện dân gian và phong cảnh sông nước Nam Bộ.",
    audioDuration: "01:35",
    hotspots: [
      { title: "Men xanh đồng Cây Mai", description: "Sắc men bí truyền của thợ gốm Chợ Lớn xưa.", x: 0, y: 0.6, z: 0.2 }
    ],
    quiz: [
      {
        question: "Lò gốm Cây Mai xưa thuộc vùng đất nào của Nam Bộ?",
        options: ["Biên Hòa - Đồng Nai", "Vùng Chợ Lớn - Sài Gòn", "Lái Thiêu - Bình Dương", "Vĩnh Long"],
        correctIndex: 1,
        explanation: "Lò gốm Cây Mai trứ danh nằm tại khu vực Chợ Lớn (Sài Gòn) vào thế kỷ 19."
      }
    ]
  },
  {
    id: "linh-phu-phu-nam",
    code: "AR-008",
    name: "Linh Phù Vàng Thần Vishnu",
    era: "Thế kỷ 6",
    periodGroup: "oc-eo",
    material: "Vàng khắc chữ Phạn",
    location: "Phòng Trưng Bày 3",
    room: "Sảnh Văn Hóa Óc Eo",
    thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    placardText: "Lá bùa vàng mỏng khắc minh văn chữ Phạn cổ (Sanskrit) cầu nguyện phúc lành của thần Vishnu. Hiện vật khẳng định mối giao lưu văn hóa và tôn giáo sớm của phương Nam với văn minh Ấn Độ.",
    audioDuration: "01:25",
    hotspots: [
      { title: "Chữ Phạn cổ", description: "Các ký tự Sanskrit khắc chìm tinh vi trên lá vàng.", x: 0, y: 0.3, z: 0.1 }
    ],
    quiz: [
      {
        question: "Chữ khắc trên lá linh phù vàng Óc Eo là hệ chữ viết nào?",
        options: ["Chữ Nôm", "Chữ Phạn (Sanskrit)", "Chữ Hán", "Chữ La-tinh"],
        correctIndex: 1,
        explanation: "Cư dân Phù Nam sử dụng chữ Phạn cổ trong các văn bản tôn giáo và giao dịch."
      }
    ]
  }
];

export interface TourSlot {
  id: string;
  time: string;
  totalSeats: number;
  bookedSeats: number;
  guide: string;
  language: string;
}

export const TOUR_SLOTS_DATA: TourSlot[] = [
  { id: "slot-1", time: "08:30 - 10:00 (Ca Sáng 1)", totalSeats: 35, bookedSeats: 20, guide: "ThS. Nguyễn Văn Bình", language: "Tiếng Việt" },
  { id: "slot-2", time: "10:15 - 11:45 (Ca Sáng 2)", totalSeats: 35, bookedSeats: 30, guide: "ThS. Trần Thu Hà", language: "Tiếng Việt / English" },
  { id: "slot-3", time: "14:00 - 15:30 (Ca Chiều 1)", totalSeats: 35, bookedSeats: 12, guide: "ThS. Lê Quang Long", language: "Tiếng Việt" },
  { id: "slot-4", time: "15:45 - 17:15 (Ca Chiều 2)", totalSeats: 35, bookedSeats: 0, guide: "Hướng dẫn viên trực ca", language: "Tiếng Việt" }
];
