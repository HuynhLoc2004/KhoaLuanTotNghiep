import { ARTIFACTS_DATA } from "../../data/artifacts";

export interface AdminArtifactItem {
  id: string;
  code: string;
  name: string;
  era: string;
  material: string;
  room: string;
  thumbnail: string;
  dimensions?: string;
  weight?: string;
  description?: string;
  voiceScript?: string;
  history?: string;
}
import { Icons } from "../../components/Icons";

// Generate extended 28 artifacts catalog
const EXTENDED_ARTIFACTS: AdminArtifactItem[] = [
  ...ARTIFACTS_DATA,
  {
    id: "art-07",
    code: "BTLS-CH-07",
    name: "Khuyên Tai Hai Đầu Thú Sa Huỳnh",
    era: "Văn hóa Sa Huỳnh (Thế kỷ 1 TCN)",
    material: "Ngọc bích Nephrite",
    dimensions: "6.2 x 4.5 x 1.8 cm",
    weight: "85 gram",
    room: "Gian Sa Huỳnh & Khảo Cổ Biển",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    description: "Hiện vật trang sức hộ mệnh độc bản hình động vật lưỡng tính thể hiện tài hoa chế tác ngọc đỉnh cao của người cổ Sa Huỳnh.",
    voiceScript: "Khuyên tai hai đầu thú là biểu tượng văn hóa đặc trưng của cư dân Sa Huỳnh duyên hải miền Trung.",
    history: "Khai quật năm 1994 tại di chỉ Giồng Lớn, Long An."
  },
  {
    id: "art-08",
    code: "BTLS-OE-08",
    name: "Nhẫn Vàng Thần Bò Nandin Óc Eo",
    era: "Văn hóa Óc Eo (Thế kỷ 5)",
    material: "Vàng ròng 24K chạm khắc chìm",
    dimensions: "2.4 cm đường kính",
    weight: "32 gram",
    room: "Gian Văn Hóa Óc Eo & Phù Nam",
    thumbnail: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
    description: "Nhẫn vương giả khắc biểu tượng linh thú Nandin bảo hộ vương triều Phù Nam.",
    voiceScript: "Nhẫn vàng chạm thần bò Nandin thể hiện sự giao thoa văn hóa Ấn Độ Dương tại đô thị cảng Óc Eo.",
    history: "Tìm thấy tại gò Tháp Mười, Đồng Tháp."
  },
  {
    id: "art-09",
    code: "BTLS-CP-09",
    name: "Đài Thờ Thần Shiva Mỹ Sơn",
    era: "Văn hóa Champa (Thế kỷ 8)",
    material: "Sa thạch xám nguyên khối",
    dimensions: "145 x 90 x 85 cm",
    weight: "420 kg",
    room: "Sảnh Văn Hóa Nghệ Thuật Champa",
    thumbnail: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&auto=format&fit=crop&q=80",
    description: "Kiệt tác điêu khắc miêu tả vũ điệu càn khôn của thần Shiva trong phong cách Mỹ Sơn E1.",
    voiceScript: "Đài thờ sa thạch Mỹ Sơn là bảo vật biểu trưng cho nghệ thuật điêu khắc tôn giáo Champa cổ đại.",
    history: "Chuyển từ thánh địa Mỹ Sơn về bảo tồn năm 1930."
  },
  {
    id: "art-10",
    code: "BTLS-NG-10",
    name: "Áo Nhật Bình Hoàng Thái Hậu",
    era: "Triều Nguyễn (Năm 1898)",
    material: "Tơ tằm gấm thêu chỉ vàng ngũ sắc",
    dimensions: "135 x 160 cm sải tay",
    weight: "1.8 kg",
    room: "Gian Cổ Vật Hoàng Cung Triều Nguyễn",
    thumbnail: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80",
    description: "Lễ phục cung đình của Hoàng thái hậu triều Nguyễn thêu đồ án tứ linh phụng vũ và bát bửu.",
    voiceScript: "Áo Nhật Bình là biểu tượng tôn nghiêm của phụ nữ hoàng tộc tại Tử Cấm Thành Huế.",
    history: "Sưu tập từ kho cổ vật cung An Định, Huế."
  },
  {
    id: "art-11",
    code: "BTLS-LT-11",
    name: "Ấm Gốm Hoa Nâu Hình Rồng Thời Lý",
    era: "Thời Lý (Thế kỷ 11 - 12)",
    material: "Gốm men trắng vẽ hoa nâu",
    dimensions: "28 x 22 cm",
    weight: "2.1 kg",
    room: "Gian Trưng Bày Cổ Đại",
    thumbnail: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80",
    description: "Đồ ngự dụng hoàng cung Thăng Long mang nét vẽ phóng khoáng đặc trưng thời Lý.",
    voiceScript: "Ấm gốm hoa nâu thời Lý phản ánh tinh thần Phật giáo Đại Việt thanh thoát, bác ái.",
    history: "Thu thập từ di chỉ Hoàng thành Thăng Long."
  },
  {
    id: "art-12",
    code: "BTLS-CD-12",
    name: "Bình Gốm Chu Đậu Men Lam Xuất Khẩu",
    era: "Thời Lê Sơ (Thế kỷ 15)",
    material: "Gốm men lam cao cấp",
    dimensions: "54 x 36 cm",
    weight: "5.6 kg",
    room: "Gian Cổ Vật Biển Đảo",
    thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80",
    description: "Kiệt tác gốm Chu Đậu danh tiếng thế giới từng xuất khẩu sang Trung Đông và châu Âu.",
    voiceScript: "Gốm Chu Đậu là đỉnh cao nghệ thuật men rạn và nét vẽ lam Đại Việt thế kỷ 15.",
    history: "Trục vớt từ tàu cổ đắm Cù Lao Chàm năm 1999."
  },
  {
    id: "art-13",
    code: "BTLS-DS-13",
    name: "Thạp Đồng Đào Thịnh Hoa Văn Cá Sấu",
    era: "Văn hóa Đông Sơn (Thế kỷ 5 TCN)",
    material: "Đồng điếu cổ",
    dimensions: "98 x 70 cm",
    weight: "76 kg",
    room: "Gian Trưng Bày Đông Sơn",
    thumbnail: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&auto=format&fit=crop&q=80",
    description: "Vật báu đựng ngũ cốc và tiến hành nghi lễ cầu mùa linh thiêng của thủ lĩnh Đông Sơn.",
    voiceScript: "Thạp đồng Đào Thịnh chứa đựng triết lý âm dương và tín ngưỡng phồn thực của người Việt cổ.",
    history: "Phát hiện tại bờ sông Hồng, Yên Bái năm 1961."
  },
  {
    id: "art-14",
    code: "BTLS-CP-14",
    name: "Tượng Vũ Nữ Apsara Trà Kiệu",
    era: "Văn hóa Champa (Thế kỷ 10)",
    material: "Sa thạch điêu khắc",
    dimensions: "85 x 45 x 30 cm",
    weight: "95 kg",
    room: "Sảnh Văn Hóa Nghệ Thuật Champa",
    thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    description: "Tượng tiên nữ Apsara với nụ cười bí ẩn và đường cong uốn lượn uyển chuyển.",
    voiceScript: "Vũ nữ Trà Kiệu là đỉnh cao của trường phái điêu khắc cổ điển Champa.",
    history: "Khai quật tại kinh đô Trà Kiệu, Quảng Nam."
  },
  {
    id: "art-15",
    code: "BTLS-NG-15",
    name: "Kim Ấn Hoàng Đế Chi Bảo",
    era: "Triều Nguyễn (Năm Minh Mạng thứ 4 - 1823)",
    material: "Vàng ròng đúc quai rồng",
    dimensions: "13.8 x 13.8 x 10.5 cm",
    weight: "10.78 kg",
    room: "Gian Cổ Vật Hoàng Cung Triều Nguyễn",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    description: "Quốc bảo truyền quốc tượng trưng cho quyền lực tối thượng của vương triều Nguyễn.",
    voiceScript: "Kim ấn Hoàng Đế Chi Bảo là hiện vật lịch sử đặc biệt quan trọng của dân tộc.",
    history: "Hồi hương về Việt Nam và lưu giữ bảo quản cấp quốc gia."
  },
  {
    id: "art-16",
    code: "BTLS-OE-16",
    name: "Lá Vàng Chạm Khắc Thần Mặt Trời Surya",
    era: "Văn hóa Óc Eo (Thế kỷ 6)",
    material: "Vàng dát mỏng chạm nổi",
    dimensions: "12 x 8 cm",
    weight: "18 gram",
    room: "Gian Văn Hóa Óc Eo & Phù Nam",
    thumbnail: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=600&auto=format&fit=crop&q=80",
    description: "Bản vàng tế lễ thần Surya được chôn dưới móng tháp đền thờ cổ.",
    voiceScript: "Lá vàng chạm thần Surya minh chứng tín ngưỡng thờ phụng mặt trời tại vương quốc Phù Nam.",
    history: "Phát hiện tại quần thể di tích Óc Eo - Ba Thê, An Giang."
  }
];

let artifactCurrentPage = 1;
let artifactPageSize = 10;
let artifactSearchQuery = "";
let artifactEraFilter = "ALL";

export function renderAdminArtifactsPage(): string {
  const filtered = EXTENDED_ARTIFACTS.filter(a => {
    const matchSearch = a.code.toLowerCase().includes(artifactSearchQuery.toLowerCase()) ||
                        a.name.toLowerCase().includes(artifactSearchQuery.toLowerCase()) ||
                        a.room.toLowerCase().includes(artifactSearchQuery.toLowerCase());
    const matchEra = artifactEraFilter === "ALL" || a.era.includes(artifactEraFilter);
    return matchSearch && matchEra;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / artifactPageSize) || 1;

  if (artifactCurrentPage > totalPages) artifactCurrentPage = totalPages;
  if (artifactCurrentPage < 1) artifactCurrentPage = 1;

  const startIndex = (artifactCurrentPage - 1) * artifactPageSize;
  const endIndex = Math.min(startIndex + artifactPageSize, total);
  const currentItems = filtered.slice(startIndex, endIndex);

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
              CỔNG QUẢN TRỊ ADMIN / KHO CỔ VẬT SỐ & AI QUIZ
            </span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
            <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
              Số Hóa 3D WebGL
            </span>
          </div>
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
            Quản Lý Kho Dữ Liệu Hiện Vật & Số Hóa 3D
          </h1>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
            Biên tập bảng chú thích, kiểm duyệt hiện vật 3D tương tác và tự động trích xuất kiến thức lịch sử thành câu hỏi Quiz.
          </p>
        </div>

        <button class="btn btn-primary" id="btn-add-artifact" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; padding: 0.65rem 1.25rem;">
          ${Icons.cube}
          <span>+ Thêm Hiện Vật Mới</span>
        </button>
      </div>

      <!-- Top Two Cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <!-- AI Quiz Auto-Generator Card -->
        <div class="card" style="border-top: 4px solid var(--color-secondary);">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.5rem;">
            AI Trích Xuất & Sinh Câu Hỏi Đố Vui Tự Động
          </h3>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Admin chọn một cổ vật từ cơ sở dữ liệu. AI sẽ phân tích niên đại, chất liệu và hoa văn để sinh ra bộ câu hỏi trắc nghiệm tương tác cho du khách.
          </p>

          <div style="margin-bottom: 1rem;">
            <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
              Chọn Hiện Vật Nguồn Để AI Phân Tích:
            </label>
            <select class="lang-select" id="admin-ai-artifact-select" style="width: 100%; padding: 0.65rem;">
              ${EXTENDED_ARTIFACTS.map(a => `
                <option value="${a.id}">${a.name} (${a.era})</option>
              `).join('')}
            </select>
          </div>

          <button class="btn btn-secondary" id="btn-admin-ai-gen" style="width: 100%; padding: 0.75rem; justify-content: center;">
            ${Icons.quiz}
            <span>Phân Tích Bảng Chú Thích & Sinh Câu Hỏi Mới</span>
          </button>

          <!-- Simulated Output Box -->
          <div id="ai-gen-result" style="display: none; margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(var(--color-surface-rgb), 0.5); border: 1px solid var(--color-secondary);">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 0.35rem;">
              ✓ KẾT QUẢ SINH TỰ ĐỘNG TỪ AI:
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.5rem;">
              "Hình tượng mặt trời ở chính giữa trống đồng Đông Sơn có bao nhiêu cánh tia sáng?"
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              • Đáp án đúng: 14 tia sáng • Độ khó: Trung bình • Đã tự động cập nhật vào Game Đố Vui Di Sản.
            </div>
          </div>
        </div>

        <!-- 3D Digital Archive Stats -->
        <div class="card">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem;">
            Trạng Thái Kho Số Hóa 3D WebGL
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Hiện vật đã quét 3D WebGL:</span>
              <span style="font-weight: 800; color: var(--color-primary);">${EXTENDED_ARTIFACTS.length} Bảo vật (100%)</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Bản ghi âm giọng đọc Voice AI:</span>
              <span style="font-weight: 800; color: var(--color-secondary);">${EXTENDED_ARTIFACTS.length} Bản ghi đa ngôn ngữ</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Tổng lượt xoay tương tác 3D:</span>
              <span style="font-weight: 800; color: #16A34A;">38,420 lượt</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <span style="font-size: 0.85rem; color: var(--color-text-muted);">Độ phân giải bản đồ vật liệu:</span>
              <span style="font-weight: 800; color: var(--color-text-main);">4K PBR Metallic/Roughness</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Artifacts Table with Filters and Full Pagination (10 - 20 - 30 - 50) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0 0 0.2rem 0; font-weight: 800;">
              Danh Sách Hiện Vật Trong Cơ Sở Dữ Liệu
            </h3>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Tổng số hiện vật: ${total} bảo vật • Quản lý metadata, file mô hình 3D và phòng trưng bày.
            </div>
          </div>

          <!-- Controls: Search & Filter -->
          <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="artifact-search-input" value="${artifactSearchQuery}" placeholder="Tìm mã số, tên hiện vật..." style="padding: 0.45rem 0.85rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); width: 220px;" />

            <select id="artifact-era-filter" style="padding: 0.45rem 0.8rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);">
              <option value="ALL" ${artifactEraFilter === 'ALL' ? 'selected' : ''}>Tất Cả Thời Kỳ</option>
              <option value="Đông Sơn" ${artifactEraFilter === 'Đông Sơn' ? 'selected' : ''}>Văn Hóa Đông Sơn</option>
              <option value="Sa Huỳnh" ${artifactEraFilter === 'Sa Huỳnh' ? 'selected' : ''}>Văn Hóa Sa Huỳnh</option>
              <option value="Óc Eo" ${artifactEraFilter === 'Óc Eo' ? 'selected' : ''}>Văn Hóa Óc Eo</option>
              <option value="Champa" ${artifactEraFilter === 'Champa' ? 'selected' : ''}>Nghệ Thuật Champa</option>
              <option value="Nguyễn" ${artifactEraFilter === 'Nguyễn' ? 'selected' : ''}>Triều Nguyễn</option>
            </select>
          </div>
        </div>

        <div style="overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
            <thead>
              <tr style="background: rgba(var(--color-surface-rgb), 0.7); border-bottom: 2px solid var(--color-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem 1rem;">ẢNH</th>
                <th style="padding: 0.75rem 1rem;">MÃ SỐ</th>
                <th style="padding: 0.75rem 1rem;">TÊN HIỆN VẬT</th>
                <th style="padding: 0.75rem 1rem;">NIÊN ĐẠI & THỜI KỲ</th>
                <th style="padding: 0.75rem 1rem;">CHẤT LIỆU</th>
                <th style="padding: 0.75rem 1rem;">GIAN PHÒNG TRƯNG BÀY</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">MÔ HÌNH 3D</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              ${currentItems.length === 0 ? `
                <tr>
                  <td colspan="8" style="padding: 2.5rem; text-align: center; color: var(--color-text-muted);">
                    Không tìm thấy hiện vật nào phù hợp.
                  </td>
                </tr>
              ` : currentItems.map(art => `
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 0.65rem 1rem;">
                    <img src="${art.thumbnail}" alt="" style="width: 42px; height: 42px; object-fit: cover; border-radius: var(--radius-xs); border: 1px solid var(--color-border);" />
                  </td>
                  <td style="padding: 0.65rem 1rem; font-family: monospace; font-weight: 700; color: var(--color-primary);">${art.code}</td>
                  <td style="padding: 0.65rem 1rem; font-weight: 700; color: var(--color-text-main);">${art.name}</td>
                  <td style="padding: 0.65rem 1rem; color: var(--color-text-muted);">${art.era}</td>
                  <td style="padding: 0.65rem 1rem;">${art.material}</td>
                  <td style="padding: 0.65rem 1rem; color: var(--color-secondary); font-weight: 600;">${art.room}</td>
                  <td style="padding: 0.65rem 1rem; text-align: center;">
                    <a href="#artifact" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; text-decoration: none;">
                      Xem 3D
                    </a>
                  </td>
                  <td style="padding: 0.65rem 1rem; text-align: center;">
                    <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="alert('Đã mở form chỉnh sửa metadata hiện vật ${art.code}');">
                      Sửa
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- FULL PAGINATION BAR: 10 - 20 - 30 - 50 -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-top: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">
            <div>
              Hiển thị <b>${total === 0 ? 0 : startIndex + 1}</b> - <b>${endIndex}</b> trên tổng số <b>${total}</b> hiện vật
            </div>

            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>Số dòng / trang:</span>
              <select id="artifact-page-size-select" style="padding: 0.35rem 0.65rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); font-weight: 700; color: var(--color-primary);">
                <option value="10" ${artifactPageSize === 10 ? 'selected' : ''}>10 / trang</option>
                <option value="20" ${artifactPageSize === 20 ? 'selected' : ''}>20 / trang</option>
                <option value="30" ${artifactPageSize === 30 ? 'selected' : ''}>30 / trang</option>
                <option value="50" ${artifactPageSize === 50 ? 'selected' : ''}>50 / trang</option>
              </select>
            </div>
          </div>

          <!-- Pagination controls -->
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <button class="btn btn-secondary art-pag-btn" data-page="1" ${artifactCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              « Đầu
            </button>
            <button class="btn btn-secondary art-pag-btn" data-page="${artifactCurrentPage - 1}" ${artifactCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              ‹ Trước
            </button>

            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="btn ${p === artifactCurrentPage ? 'btn-primary' : 'btn-secondary'} art-pag-btn" data-page="${p}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700;">
                ${p}
              </button>
            `).join('')}

            <button class="btn btn-secondary art-pag-btn" data-page="${artifactCurrentPage + 1}" ${artifactCurrentPage === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Sau ›
            </button>
            <button class="btn btn-secondary art-pag-btn" data-page="${totalPages}" ${artifactCurrentPage === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Cuối »
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAdminArtifactsPage() {
  const genBtn = document.getElementById("btn-admin-ai-gen");
  const aiResult = document.getElementById("ai-gen-result");
  if (genBtn && aiResult) {
    genBtn.addEventListener("click", () => {
      genBtn.textContent = "AI đang xử lý trích xuất...";
      setTimeout(() => {
        aiResult.style.display = "block";
        genBtn.textContent = "✓ Đã Phê Duyệt & Sinh Quiz Thành Công";
      }, 400);
    });
  }

  const addBtn = document.getElementById("btn-add-artifact");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      alert("Mở Form thêm hiện vật mới: Hỗ trợ tải tệp .glb 3D, bảng chú thích song ngữ và âm thanh thuyết minh AI.");
    });
  }

  // Search input
  const searchInput = document.getElementById("artifact-search-input") as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      artifactSearchQuery = (e.target as HTMLInputElement).value;
      artifactCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Era filter
  const eraFilter = document.getElementById("artifact-era-filter") as HTMLSelectElement;
  if (eraFilter) {
    eraFilter.addEventListener("change", (e) => {
      artifactEraFilter = (e.target as HTMLSelectElement).value;
      artifactCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Page size selector (10, 20, 30, 50)
  const pageSizeSelect = document.getElementById("artifact-page-size-select") as HTMLSelectElement;
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      artifactPageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
      artifactCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Pagination buttons
  const pagBtns = document.querySelectorAll(".art-pag-btn");
  pagBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.getAttribute("data-page") || "1", 10);
      if (!isNaN(page)) {
        artifactCurrentPage = page;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });
}
