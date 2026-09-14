import { MuseumConfigStore } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";

export interface AnalyticsTransaction {
  id: string;
  visitorName: string;
  ticketType: string;
  amount: number;
  entryGate: string;
  timestamp: string;
  paymentMethod: string;
  status: "VALID" | "PENDING" | "REFUNDED";
}

// Generate realistic dataset (60+ records)
const MOCK_NAMES = [
  "Trần Văn An", "Nguyễn Thị Mai Lan", "Lê Hoàng Quân", "Phạm Quốc Hùng", "Võ Thị Bích Ngọc",
  "Đoàn Trường THPT Lê Hồng Phong (35 HS)", "Johnathan Smith (Đoàn Mỹ - 8 khách)", "Trịnh Phương Thảo",
  "Đặng Quang Minh", "Bùi Thanh Trúc", "Đỗ Văn Lâm", "Hoàng Kim Ngân", "Ngô Thế Phong",
  "Đoàn Đại Học Kiến Trúc (24 SV)", "Takashi Tanaka (Nhật Bản)", "Kim Min-ji (Hàn Quốc)",
  "Lý Gia Hân", "Phan Gia Huy", "Dương Yến Nhi", "Chu Đức Thắng", "Mai Xuân Hùng",
  "Lương Thùy Linh", "Vũ Đình Trọng", "Trương Mỹ Dung", "Tống Bá Đạt", "Nguyễn Hải Đăng",
  "Đoàn Lữ Hành Saigontourist (18 khách)", "David Nguyen (Việt kiều Úc)", "Hồ Ngọc Hà",
  "Cao Thái Sơn", "Phạm Quỳnh Anh", "Lê Bảo Bình", "Trần Đình Trọng", "Nguyễn Công Phượng",
  "Đoàn Gia Đình Bác Nguyễn Văn Tuấn (6 người)", "Jean-Pierre Dupont (Pháp)", "Hans Schmidt (Đức)"
];

const TICKET_TYPES = [
  { name: "Vé Tiêu Chuẩn Người Lớn", price: 40000 },
  { name: "Vé Ưu Đãi Học Sinh / Sinh Viên", price: 20000 },
  { name: "Vé Du Khách Quốc Tế", price: 80000 },
  { name: "Gói Trải Nghiệm Toàn Diện (VR 360 + 3D)", price: 120000 },
  { name: "Vé Tour Hướng Dẫn Viên Đoàn", price: 300000 }
];

const GATES = ["Cổng Chính A1 (Quang Học)", "Cổng Soát Vé A2", "Cổng Cổ Vật Phụ B1", "Khu Vực Tour VR 360 Cổng C"];
const PAYMENTS = ["QR MoMo", "VNPAY QR", "Thẻ Tín Dụng / POS", "Tiền Mặt Tại Quầy"];

export const ALL_TRANSACTIONS: AnalyticsTransaction[] = [];

// Seed 65 detailed records
for (let i = 1; i <= 65; i++) {
  const name = MOCK_NAMES[i % MOCK_NAMES.length] + (i > MOCK_NAMES.length ? ` #${i}` : "");
  const ticket = TICKET_TYPES[i % TICKET_TYPES.length];
  const isGroup = name.includes("Đoàn");
  const multiplier = isGroup ? (name.includes("35") ? 35 : name.includes("24") ? 24 : name.includes("18") ? 18 : 6) : 1;
  const gate = GATES[i % GATES.length];
  const payment = PAYMENTS[i % PAYMENTS.length];
  const status: "VALID" | "PENDING" | "REFUNDED" = (i % 15 === 0) ? "REFUNDED" : (i % 7 === 0) ? "PENDING" : "VALID";
  
  const hour = String(8 + Math.floor(i / 8)).padStart(2, '0');
  const minute = String((i * 7) % 60).padStart(2, '0');
  const second = String((i * 13) % 60).padStart(2, '0');

  ALL_TRANSACTIONS.push({
    id: `TK-2026-${String(1000 + i)}`,
    visitorName: name,
    ticketType: ticket.name + (multiplier > 1 ? ` (x${multiplier})` : ""),
    amount: ticket.price * multiplier,
    entryGate: gate,
    timestamp: `11/09/2026 ${hour}:${minute}:${second}`,
    paymentMethod: payment,
    status
  });
}

// State
let currentAnalyticsPeriod: "today" | "week" | "month" | "quarter" | "year" = "today";
let analyticsPageSize = 10;
let analyticsCurrentPage = 1;
let searchQuery = "";
let selectedTypeFilter = "ALL";
let selectedStatusFilter = "ALL";

export function renderAdminAnalyticsPage(): string {
  const analytics = MuseumConfigStore.getAnalytics(currentAnalyticsPeriod);

  // Filter dataset
  const filtered = ALL_TRANSACTIONS.filter(t => {
    const matchSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.ticketType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedTypeFilter === "ALL" || t.ticketType.includes(selectedTypeFilter);
    const matchStatus = selectedStatusFilter === "ALL" || t.status === selectedStatusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Calculate totals
  const totalRevenue = filtered.reduce((sum, item) => sum + (item.status === "VALID" ? item.amount : 0), 0);
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / analyticsPageSize) || 1;

  if (analyticsCurrentPage > totalPages) analyticsCurrentPage = totalPages;
  if (analyticsCurrentPage < 1) analyticsCurrentPage = 1;

  const startIndex = (analyticsCurrentPage - 1) * analyticsPageSize;
  const endIndex = Math.min(startIndex + analyticsPageSize, totalCount);
  const pageRows = filtered.slice(startIndex, endIndex);

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
              CỔNG QUẢN TRỊ ADMIN / THỐNG KÊ & BÁO CÁO TOÀN DIỆN
            </span>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
            <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
              Dữ Liệu Hợp Nhất 2026
            </span>
          </div>
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
            Trung Tâm Phân Tích Dữ Liệu, Doanh Thu & Lưu Lượng
          </h1>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
            Báo cáo kiểm toán minh bạch, đối soát vé cổng, phân tích mật độ các sảnh và trích xuất dữ liệu Excel/PDF.
          </p>
        </div>

        <!-- Export Actions Header -->
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-secondary" id="btn-export-excel" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.15rem; font-weight: 700; font-size: 0.88rem; border-color: #16a34a; color: #16a34a;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Xuất Excel (.xlsx / .csv)</span>
          </button>

          <button class="btn btn-primary" id="btn-export-pdf" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.15rem; font-weight: 700; font-size: 0.88rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>In / Xuất Báo Cáo PDF</span>
          </button>
        </div>
      </div>

      <!-- Time Period Filter Chips -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;" id="analytics-period-chips">
        <button class="chip ${currentAnalyticsPeriod === 'today' ? 'active' : ''}" data-period="today">Hôm Nay (11/09)</button>
        <button class="chip ${currentAnalyticsPeriod === 'week' ? 'active' : ''}" data-period="week">Tuần Này</button>
        <button class="chip ${currentAnalyticsPeriod === 'month' ? 'active' : ''}" data-period="month">Tháng 09/2026</button>
        <button class="chip ${currentAnalyticsPeriod === 'quarter' ? 'active' : ''}" data-period="quarter">Quý 3</button>
        <button class="chip ${currentAnalyticsPeriod === 'year' ? 'active' : ''}" data-period="year">Cả Năm 2026</button>
      </div>

      <!-- 4 High-Impact KPI Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.75rem;">
        <div class="card" style="border-top: 4px solid #16a34a;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Doanh Thu Vé (Đang Lọc)</div>
          <div style="font-size: 2rem; font-weight: 900; color: #16a34a; margin: 0.35rem 0;">${totalRevenue.toLocaleString()} đ</div>
          <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">↑ +18.4% so với trung bình tuần</div>
        </div>

        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Tổng Lượt Khách Tham Quan</div>
          <div style="font-size: 2rem; font-weight: 900; color: var(--color-primary); margin: 0.35rem 0;">${analytics.totalVisitors.toLocaleString()} khách</div>
          <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">97.5% qua cổng quang học QR</div>
        </div>

        <div class="card" style="border-top: 4px solid #0284c7;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Lượt Tương Tác 3D & Thuyết Minh</div>
          <div style="font-size: 2rem; font-weight: 900; color: #0284c7; margin: 0.35rem 0;">${analytics.voiceAiPlays.toLocaleString()} lượt</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">Độ dài nghe trung bình: 3m 42s</div>
        </div>

        <div class="card" style="border-top: 4px solid #eab308;">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Khảo Sát Quiz & Hoàn Thành Tem</div>
          <div style="font-size: 2rem; font-weight: 900; color: #ca8a04; margin: 0.35rem 0;">${analytics.quizCompletions.toLocaleString()} tem</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">Tỷ lệ nhận quà lưu niệm: 62.8%</div>
        </div>
      </div>

      <!-- Sảnh Phân Bổ Mật Độ (Collapsible Summary) -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="font-size: 1.05rem; color: var(--color-primary); margin: 0; font-weight: 800;">
            Phân Bổ Mật Độ & Lưu Lượng Từng Không Gian Gian Phòng (Bản Đồ Nhiệt)
          </h3>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Tự động làm mới mỗi 60s</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          ${analytics.roomDistribution.map(rd => `
            <div style="padding: 0.85rem 1rem; background: var(--color-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.4rem;">
                <span style="color: var(--color-text-main);">${rd.room}</span>
                <span style="color: var(--color-secondary);">${rd.visitors} khách (${rd.percentage}%)</span>
              </div>
              <div style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden;">
                <div style="width: ${rd.percentage}%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); border-radius: 3px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MAIN DATA LEDGER CARD: SEARCH, FILTER, EXPORT, PAGINATION -->
      <div class="card" id="analytics-table-container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary); margin: 0 0 0.2rem 0;">
              Nhật Ký Giao Dịch & Lượt Tham Quan Chi Tiết
            </h2>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Theo dõi 100% dòng tiền bán vé và lưu lượng khách qua cổng theo thời gian thực.
            </div>
          </div>

          <!-- Controls: Search & Filters -->
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <!-- Search input -->
            <div style="position: relative;">
              <input type="text" id="analytics-search-input" value="${searchQuery}" placeholder="Tìm mã vé, tên khách, đoàn..." style="padding: 0.55rem 0.9rem 0.55rem 2.2rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); width: 230px;" />
              <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none;">
                ${Icons.search}
              </span>
            </div>

            <!-- Ticket Type Filter -->
            <select id="analytics-filter-type" style="padding: 0.55rem 0.85rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);">
              <option value="ALL" ${selectedTypeFilter === 'ALL' ? 'selected' : ''}>Tất Cả Loại Vé</option>
              <option value="Người Lớn" ${selectedTypeFilter === 'Người Lớn' ? 'selected' : ''}>Vé Người Lớn</option>
              <option value="Học Sinh" ${selectedTypeFilter === 'Học Sinh' ? 'selected' : ''}>Vé Học Sinh / SV</option>
              <option value="Quốc Tế" ${selectedTypeFilter === 'Quốc Tế' ? 'selected' : ''}>Vé Du Khách Quốc Tế</option>
              <option value="VR 360" ${selectedTypeFilter === 'VR 360' ? 'selected' : ''}>Gói VR 360 & 3D</option>
              <option value="Đoàn" ${selectedTypeFilter === 'Đoàn' ? 'selected' : ''}>Vé Tour Đoàn</option>
            </select>

            <!-- Status Filter -->
            <select id="analytics-filter-status" style="padding: 0.55rem 0.85rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);">
              <option value="ALL" ${selectedStatusFilter === 'ALL' ? 'selected' : ''}>Tất Cả Trạng Thái</option>
              <option value="VALID" ${selectedStatusFilter === 'VALID' ? 'selected' : ''}>✓ Đã Vào Cổng</option>
              <option value="PENDING" ${selectedStatusFilter === 'PENDING' ? 'selected' : ''}>⏳ Chưa Quét</option>
              <option value="REFUNDED" ${selectedStatusFilter === 'REFUNDED' ? 'selected' : ''}>✕ Đã Hoàn Tiền</option>
            </select>
          </div>
        </div>

        <!-- Ledger Table -->
        <div style="overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 1.25rem;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem;">
            <thead>
              <tr style="background: rgba(var(--color-surface-rgb), 0.7); border-bottom: 2px solid var(--color-border);">
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">MÃ VÉ / TRANSACTION</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">DU KHÁCH / ĐOÀN ĐẠI BIỂU</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">LOẠI VÉ / DỊCH VỤ</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">CỔNG SOÁT / KHU VỰC</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">THỜI GIAN</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">SỐ TIỀN</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted);">THANH TOÁN</th>
                <th style="padding: 0.8rem 1rem; font-weight: 700; color: var(--color-text-muted); text-align: center;">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              ${pageRows.length === 0 ? `
                <tr>
                  <td colspan="8" style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
                    Không tìm thấy bản ghi giao dịch nào khớp với bộ lọc.
                  </td>
                </tr>
              ` : pageRows.map(row => `
                <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.15s ease;">
                  <td style="padding: 0.75rem 1rem; font-family: monospace; font-weight: 700; color: var(--color-primary);">
                    ${row.id}
                  </td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600; color: var(--color-text-main);">
                    ${row.visitorName}
                  </td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-main);">
                    ${row.ticketType}
                  </td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-muted);">
                    ${row.entryGate}
                  </td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-muted); font-size: 0.78rem;">
                    ${row.timestamp}
                  </td>
                  <td style="padding: 0.75rem 1rem; font-weight: 800; color: ${row.status === 'REFUNDED' ? '#ef4444' : '#16a34a'};">
                    ${row.status === 'REFUNDED' ? '-' : ''}${row.amount.toLocaleString()} đ
                  </td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-muted); font-size: 0.78rem;">
                    ${row.paymentMethod}
                  </td>
                  <td style="padding: 0.75rem 1rem; text-align: center;">
                    ${row.status === 'VALID' ? `
                      <span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22c55e; padding: 2px 8px; font-size: 0.72rem; font-weight: 700;">
                        ✓ Hợp Lệ
                      </span>
                    ` : row.status === 'PENDING' ? `
                      <span class="badge-pill" style="background: rgba(234, 179, 8, 0.15); color: #ca8a04; border-color: #eab308; padding: 2px 8px; font-size: 0.72rem; font-weight: 700;">
                        ⏳ Chưa Quét
                      </span>
                    ` : `
                      <span class="badge-pill" style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border-color: #ef4444; padding: 2px 8px; font-size: 0.72rem; font-weight: 700;">
                        ✕ Đã Hoàn Vé
                      </span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- FULL-FEATURED PAGINATION BAR: 10 - 20 - 30 - 50 ITEMS/PAGE -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-top: 0.5rem;">
          <!-- Left: Total Rows & Page Size Selector -->
          <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">
            <div>
              Hiển thị <b>${totalCount === 0 ? 0 : startIndex + 1}</b> - <b>${endIndex}</b> trên tổng số <b>${totalCount}</b> giao dịch
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>Số dòng / trang:</span>
              <select id="analytics-page-size-select" style="padding: 0.35rem 0.65rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); font-weight: 700; color: var(--color-primary);">
                <option value="10" ${analyticsPageSize === 10 ? 'selected' : ''}>10 / trang</option>
                <option value="20" ${analyticsPageSize === 20 ? 'selected' : ''}>20 / trang</option>
                <option value="30" ${analyticsPageSize === 30 ? 'selected' : ''}>30 / trang</option>
                <option value="50" ${analyticsPageSize === 50 ? 'selected' : ''}>50 / trang</option>
              </select>
            </div>
          </div>

          <!-- Right: Pagination Buttons -->
          <div style="display: flex; gap: 0.35rem; align-items: center;" id="analytics-pagination-controls">
            <!-- First Page -->
            <button class="btn btn-secondary pagination-btn" data-page="1" ${analyticsCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              « Đầu
            </button>

            <!-- Prev Page -->
            <button class="btn btn-secondary pagination-btn" data-page="${analyticsCurrentPage - 1}" ${analyticsCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              ‹ Trước
            </button>

            <!-- Page Number Pills -->
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              if (totalPages > 7) {
                // Show condensed page numbers
                if (p !== 1 && p !== totalPages && Math.abs(p - analyticsCurrentPage) > 1) {
                  if (p === 2 || p === totalPages - 1) return `<span style="padding: 0 0.25rem; color: var(--color-text-muted);">...</span>`;
                  return '';
                }
              }
              const isActive = p === analyticsCurrentPage;
              return `
                <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'} pagination-btn" data-page="${p}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700; ${isActive ? 'background: var(--color-primary); color: white;' : ''}">
                  ${p}
                </button>
              `;
            }).join('')}

            <!-- Next Page -->
            <button class="btn btn-secondary pagination-btn" data-page="${analyticsCurrentPage + 1}" ${analyticsCurrentPage === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Sau ›
            </button>

            <!-- Last Page -->
            <button class="btn btn-secondary pagination-btn" data-page="${totalPages}" ${analyticsCurrentPage === totalPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Cuối »
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export to Excel / CSV with UTF-8 BOM
function exportAnalyticsExcel() {
  const headers = ["Mã Vé", "Du Khách / Đoàn", "Loại Vé", "Cổng Soát Vé", "Thời Gian", "Số Tiền (VNĐ)", "Phương Thức", "Trạng Thái"];
  const rows = ALL_TRANSACTIONS.map(item => [
    item.id,
    `"${item.visitorName.replace(/"/g, '""')}"`,
    `"${item.ticketType.replace(/"/g, '""')}"`,
    `"${item.entryGate.replace(/"/g, '""')}"`,
    `"${item.timestamp}"`,
    item.amount,
    `"${item.paymentMethod}"`,
    item.status === 'VALID' ? "Đã qua cổng" : item.status === 'PENDING' ? "Chưa quét" : "Đã hoàn vé"
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BaoCao_ThongKe_BaoTang_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert("✓ Đã trích xuất thành công tập tin Excel (.csv UTF-8)! Mở bằng Excel sẽ hiển thị tiếng Việt hoàn chỉnh.");
}

// Export / Print PDF Report Modal
function exportAnalyticsPDF() {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Vui lòng cho phép mở cửa sổ popup để in hoặc xuất file PDF.");
    return;
  }

  const analytics = MuseumConfigStore.getAnalytics(currentAnalyticsPeriod);
  const totalRev = ALL_TRANSACTIONS.reduce((s, i) => s + (i.status === 'VALID' ? i.amount : 0), 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>BÁO CÁO THỐNG KÊ DOANH THU & LƯỢNG KHÁCH - BẢO TÀNG LỊCH SỬ TP.HCM</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
        .sub-header { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
        .title { font-size: 20px; font-weight: bold; margin: 10px 0; color: #0f172a; }
        .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
        .kpi-row { display: flex; justify-content: space-between; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; }
        .kpi-item { text-align: center; }
        .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
        .kpi-value { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: bold; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; }
        .sign { text-align: center; width: 200px; }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: right; margin-bottom: 15px;">
        <button onclick="window.print()" style="padding: 8px 18px; background: #0284c7; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
          🖨️ In hoặc Lưu File PDF
        </button>
      </div>

      <div class="header">
        <div class="sub-header">SỞ VĂN HÓA VÀ THỂ THAO TP. HỒ CHÍ MINH • BẢO TÀNG LỊCH SỬ TP.HCM</div>
        <div class="title">BÁO CÁO TOÀN DIỆN DOANH THU & ĐỐI SOÁT VÉ CỔNG</div>
        <div class="meta">Thời gian lập báo cáo: ${new Date().toLocaleString('vi-VN')} | Người lập: ThS. Lê Quang Long (Giám Tuyển Trưởng)</div>
      </div>

      <div class="kpi-row">
        <div class="kpi-item">
          <div class="kpi-label">Tổng Doanh Thu Đối Soát</div>
          <div class="kpi-value" style="color: #16a34a;">${totalRev.toLocaleString()} đ</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Tổng Lượt Khách Vào Cổng</div>
          <div class="kpi-value">${analytics.totalVisitors.toLocaleString()} lượt</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Tỷ Lệ Vé Quét Hợp Lệ</div>
          <div class="kpi-value">97.5%</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-label">Tổng Số Giao Dịch Ghi Nhận</div>
          <div class="kpi-value">${ALL_TRANSACTIONS.length} giao dịch</div>
        </div>
      </div>

      <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px;">CHI TIẾT DANH MỤC GIAO DỊCH VÀ SOÁT VÉ ĐIỆN TỬ:</div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>MÃ VÉ</th>
            <th>DU KHÁCH / ĐOÀN</th>
            <th>LOẠI VÉ / DỊCH VỤ</th>
            <th>CỔNG SOÁT</th>
            <th>THỜI GIAN</th>
            <th>SỐ TIỀN</th>
            <th>THANH TOÁN</th>
            <th>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          ${ALL_TRANSACTIONS.slice(0, 30).map((r, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-family: monospace; font-weight: bold;">${r.id}</td>
              <td>${r.visitorName}</td>
              <td>${r.ticketType}</td>
              <td>${r.entryGate}</td>
              <td>${r.timestamp}</td>
              <td style="font-weight: bold;">${r.amount.toLocaleString()} đ</td>
              <td>${r.paymentMethod}</td>
              <td>${r.status === 'VALID' ? 'Đã qua cổng' : r.status === 'PENDING' ? 'Chưa quét' : 'Đã hoàn vé'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="font-size: 10px; color: #64748b; margin-top: 8px;">* Báo cáo trích xuất mẫu 30 giao dịch gần nhất phục vụ in ấn tài liệu lưu trữ.</div>

      <div class="footer">
        <div class="sign">
          <div><b>CÁN BỘ ĐỐI SOÁT VÉ</b></div>
          <div style="margin-top: 50px; font-style: italic;">Nguyễn Thị Mai</div>
        </div>
        <div class="sign">
          <div><b>GIÁM ĐỐC TRUNG TÂM DI SẢN SỐ</b></div>
          <div style="margin-top: 50px; font-style: italic;">ThS. Lê Quang Long</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function initAdminAnalyticsPage() {
  // Period filter chips
  const periodChips = document.querySelectorAll("#analytics-period-chips .chip");
  periodChips.forEach(chip => {
    chip.addEventListener("click", () => {
      currentAnalyticsPeriod = chip.getAttribute("data-period") as any;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Export Excel
  const btnExportExcel = document.getElementById("btn-export-excel");
  if (btnExportExcel) {
    btnExportExcel.addEventListener("click", exportAnalyticsExcel);
  }

  // Export PDF
  const btnExportPdf = document.getElementById("btn-export-pdf");
  if (btnExportPdf) {
    btnExportPdf.addEventListener("click", exportAnalyticsPDF);
  }

  // Search input
  const searchInput = document.getElementById("analytics-search-input") as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      analyticsCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Type filter
  const filterType = document.getElementById("analytics-filter-type") as HTMLSelectElement;
  if (filterType) {
    filterType.addEventListener("change", (e) => {
      selectedTypeFilter = (e.target as HTMLSelectElement).value;
      analyticsCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Status filter
  const filterStatus = document.getElementById("analytics-filter-status") as HTMLSelectElement;
  if (filterStatus) {
    filterStatus.addEventListener("change", (e) => {
      selectedStatusFilter = (e.target as HTMLSelectElement).value;
      analyticsCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Page Size Selector: 10, 20, 30, 50
  const pageSizeSelect = document.getElementById("analytics-page-size-select") as HTMLSelectElement;
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      analyticsPageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
      analyticsCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Pagination buttons
  const paginationBtns = document.querySelectorAll(".pagination-btn");
  paginationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.getAttribute("data-page") || "1", 10);
      if (!isNaN(page)) {
        analyticsCurrentPage = page;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });
}
