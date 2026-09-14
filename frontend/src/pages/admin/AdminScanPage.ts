import { MuseumConfigStore, ScanLogItem } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";

// Generate 45 realistic scan logs
const GATES = ["Cổng Chính A1 (Quang Học)", "Cổng Soát Vé A2", "Cổng Ưu Tiên Đoàn B1", "Cổng Vườn Sa Thạch C1"];
const GROUPS: ("Đoàn học sinh" | "Khách lẻ" | "Gia đình")[] = ["Khách lẻ", "Đoàn học sinh", "Gia đình"];
const NAMES = [
  "THPT Gia Định (Lớp 12A3 - 42 HS)", "Nguyễn Văn An", "Trường Quốc Tế Á Châu", "Khách Vãng Lai (Vé cũ)",
  "Lê Thị Thảo", "Trần Đình Trọng", "Đoàn Đại Học Sư Phạm", "Đoàn Du Lịch Vietravel",
  "Phạm Hoàng Quân", "Bùi Thanh Trúc", "Võ Minh Trí", "Đỗ Hải Yến", "Ngô Quốc Bảo",
  "Trương Gia Hân", "Đặng Thùy Dung", "Lý Cẩm Tú", "Hoàng Kim Chi", "Phan Anh Tuấn",
  "Chu Mạnh Cường", "Vũ Đình Khải", "Mai Quốc Hùng", "Lương Thùy Linh", "Dương Nhật Minh",
  "Đoàn Khách Du Lịch Pháp (14 người)", "Takashi Yamada", "Kim Min-woo", "Robert Davis",
  "Trần Thị Mai", "Phạm Văn Đồng", "Lê Hồng Sơn", "Nguyễn Công Thành", "Tống Bá Đạt"
];

const EXTENDED_SCAN_LOGS: ScanLogItem[] = [];
for (let i = 1; i <= 45; i++) {
  const name = NAMES[i % NAMES.length] + (i > NAMES.length ? ` (${i})` : "");
  const gate = GATES[i % GATES.length];
  const group = GROUPS[i % GROUPS.length];
  const isRejected = (i % 9 === 0);
  const hour = String(8 + Math.floor(i / 6)).padStart(2, '0');
  const min = String((i * 11) % 60).padStart(2, '0');
  const sec = String((i * 17) % 60).padStart(2, '0');

  EXTENDED_SCAN_LOGS.push({
    id: `LOG-${String(i).padStart(2, '0')}`,
    ticketCode: isRejected ? `TKT-EXPIRED-${100 + i}` : `TKT-VAL-${2000 + i}`,
    visitorName: name,
    groupType: group,
    time: `${hour}:${min}:${sec}`,
    status: isRejected ? "rejected" : "success",
    gate,
    durationMs: Math.floor(25 + (i * 3) % 45)
  });
}

let logCurrentPage = 1;
let logPageSize = 10;
let logSearchQuery = "";
let logStatusFilter = "ALL";

export function renderAdminScanPage(): string {
  const filteredLogs = EXTENDED_SCAN_LOGS.filter(log => {
    const matchSearch = log.ticketCode.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                        log.visitorName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                        log.gate.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchStatus = logStatusFilter === "ALL" || log.status === logStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalLogs = filteredLogs.length;
  const totalLogPages = Math.ceil(totalLogs / logPageSize) || 1;

  if (logCurrentPage > totalLogPages) logCurrentPage = totalLogPages;
  if (logCurrentPage < 1) logCurrentPage = 1;

  const startIndex = (logCurrentPage - 1) * logPageSize;
  const endIndex = Math.min(startIndex + logPageSize, totalLogs);
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Sleek Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / SOÁT VÉ CỔNG QUANG HỌC
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
            Trực Tiếp &lt;100ms
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Bộ Soát Vé Cổng Quang Học & Xác Thực QR Siêu Tốc
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Hệ thống kiểm soát cửa từ tự động, xác thực vé điện tử trong dưới 100 mili-giây và ghi nhận lịch sử vào cổng.
        </p>
      </div>

      <!-- Live Simulator & Gateway Status -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <!-- Scanner Terminal Simulator -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Máy Quét Mã QR Quang Học Tại Cổng
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
              Cảm Biến Sẵn Sàng
            </span>
          </div>

          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            Du khách đưa mã QR trên vé điện tử vào vùng quét camera. Hệ thống lập tức giải mã và gửi tín hiệu mở barrier tự động.
          </p>

          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" id="scan-ticket-input" placeholder="Nhập hoặc quét mã vé (VD: TKT-TOUR-9921)..." 
              value="TKT-TOUR-9921"
              style="flex: 1; padding: 0.65rem 0.85rem; font-family: monospace; font-size: 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);" />
            <button class="btn btn-primary" id="btn-simulate-scan" style="padding: 0 1.25rem; font-weight: 700;">
              Quét Ngay
            </button>
          </div>

          <!-- Quick Test Presets -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <button class="chip preset-code" data-code="TKT-TOUR-9921" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
              Vé Hợp Lệ: TKT-TOUR-9921
            </button>
            <button class="chip preset-code" data-code="TKT-SOLO-4812" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
              Khách Lẻ: TKT-SOLO-4812
            </button>
            <button class="chip preset-code" data-code="TKT-EXPIRED-99" style="font-size: 0.75rem; padding: 0.25rem 0.6rem; border-color: #ef4444; color: #ef4444;">
              Vé Hết Hạn: TKT-EXPIRED-99
            </button>
          </div>

          <!-- Dynamic Result Box -->
          <div id="scan-result-card" style="padding: 1rem; border-radius: var(--radius-md); background: rgba(var(--color-surface-rgb), 0.5); border: 1px solid var(--color-border); transition: all 0.2s ease;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #16A34A; margin-bottom: 0.25rem;" id="scan-group-title">
              SẴN SÀNG QUÉT VÉ
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);" id="scan-detail-text">
              Thời gian phản hồi dự kiến: &lt;50ms • Tự động kích hoạt rơ-le mở cổng điện tử.
            </div>
          </div>
        </div>

        <!-- Barrier Gate Live Monitoring -->
        <div class="card">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem;">
            Trạng Thái 4 Cổng Kiểm Soát Trực Tiếp
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <div>
                <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.85rem;">Cổng A1 (Cổng chính Nguyễn Bỉnh Khiêm)</div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">Barrier tự động • 1,240 lượt qua</div>
              </div>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Online</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <div>
                <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.85rem;">Cổng A2 (Làn ưu tiên khách đoàn)</div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">Máy quét quang học • 850 lượt qua</div>
              </div>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Online</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
              <div>
                <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.85rem;">Cổng B1 (Lối vào Vườn Sa Thạch)</div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">Máy cầm tay POS • 320 lượt qua</div>
              </div>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Real-time Scan Logs Table with Full Pagination (10 - 20 - 30 - 50) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0 0 0.2rem 0; font-weight: 800;">
              Nhật Ký Quét Vé Vào Cổng Thời Gian Thực
            </h3>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Theo dõi đối soát thẻ/vé khách tham quan theo từng cổng kiểm soát.
            </div>
          </div>

          <!-- Controls: Search & Status Filter -->
          <div style="display: flex; gap: 0.65rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="scan-log-search" value="${logSearchQuery}" placeholder="Tìm theo mã vé, tên..." style="padding: 0.45rem 0.8rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); width: 200px;" />

            <select id="scan-log-status-filter" style="padding: 0.45rem 0.75rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface);">
              <option value="ALL" ${logStatusFilter === 'ALL' ? 'selected' : ''}>Tất Cả Kết Quả</option>
              <option value="success" ${logStatusFilter === 'success' ? 'selected' : ''}>✓ Hợp Lệ</option>
              <option value="rejected" ${logStatusFilter === 'rejected' ? 'selected' : ''}>✕ Từ Chối</option>
            </select>
          </div>
        </div>

        <div style="overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm); margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
            <thead>
              <tr style="background: rgba(var(--color-surface-rgb), 0.7); border-bottom: 2px solid var(--color-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem 1rem;">MÃ VÉ</th>
                <th style="padding: 0.75rem 1rem;">KHÁCH HÀNG / ĐƠN VỊ</th>
                <th style="padding: 0.75rem 1rem;">LOẠI ĐỐI TƯỢNG</th>
                <th style="padding: 0.75rem 1rem;">CỔNG VÀO</th>
                <th style="padding: 0.75rem 1rem;">THỜI GIAN</th>
                <th style="padding: 0.75rem 1rem;">ĐỘ TRỄ</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">KẾT QUẢ</th>
              </tr>
            </thead>
            <tbody>
              ${currentLogs.length === 0 ? `
                <tr>
                  <td colspan="7" style="padding: 2.5rem; text-align: center; color: var(--color-text-muted);">
                    Không tìm thấy dữ liệu soát vé phù hợp.
                  </td>
                </tr>
              ` : currentLogs.map(log => `
                <tr style="border-bottom: 1px solid var(--color-border);">
                  <td style="padding: 0.75rem 1rem; font-family: monospace; font-weight: 700; color: var(--color-primary);">${log.ticketCode}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600;">${log.visitorName}</td>
                  <td style="padding: 0.75rem 1rem;">${log.groupType}</td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-muted);">${log.gate}</td>
                  <td style="padding: 0.75rem 1rem; color: var(--color-text-muted); font-size: 0.78rem;">${log.time}</td>
                  <td style="padding: 0.75rem 1rem; font-family: monospace; color: #16A34A; font-weight: 700;">${log.durationMs}ms</td>
                  <td style="padding: 0.75rem 1rem; text-align: center;">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: ${log.status === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${log.status === 'success' ? '#16A34A' : '#DC2626'}; border-color: ${log.status === 'success' ? '#22C55E' : '#EF4444'};">
                      ${log.status === 'success' ? '✓ Hợp Lệ • Mở Cổng' : '✕ Từ Chối (Hết Hạn)'}
                    </span>
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
              Hiển thị <b>${totalLogs === 0 ? 0 : startIndex + 1}</b> - <b>${endIndex}</b> trên tổng <b>${totalLogs}</b> lượt quét
            </div>

            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>Số dòng:</span>
              <select id="scan-page-size-select" style="padding: 0.35rem 0.65rem; font-size: 0.82rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-surface); font-weight: 700; color: var(--color-primary);">
                <option value="10" ${logPageSize === 10 ? 'selected' : ''}>10 / trang</option>
                <option value="20" ${logPageSize === 20 ? 'selected' : ''}>20 / trang</option>
                <option value="30" ${logPageSize === 30 ? 'selected' : ''}>30 / trang</option>
                <option value="50" ${logPageSize === 50 ? 'selected' : ''}>50 / trang</option>
              </select>
            </div>
          </div>

          <!-- Pagination buttons -->
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <button class="btn btn-secondary scan-pag-btn" data-page="1" ${logCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              « Đầu
            </button>
            <button class="btn btn-secondary scan-pag-btn" data-page="${logCurrentPage - 1}" ${logCurrentPage === 1 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              ‹ Trước
            </button>

            ${Array.from({ length: totalLogPages }, (_, i) => i + 1).map(p => `
              <button class="btn ${p === logCurrentPage ? 'btn-primary' : 'btn-secondary'} scan-pag-btn" data-page="${p}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 700;">
                ${p}
              </button>
            `).join('')}

            <button class="btn btn-secondary scan-pag-btn" data-page="${logCurrentPage + 1}" ${logCurrentPage === totalLogPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Sau ›
            </button>
            <button class="btn btn-secondary scan-pag-btn" data-page="${totalLogPages}" ${logCurrentPage === totalLogPages ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''} style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
              Cuối »
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAdminScanPage() {
  const scanBtn = document.getElementById("btn-simulate-scan");
  const scanInput = document.getElementById("scan-ticket-input") as HTMLInputElement;
  const scanResult = document.getElementById("scan-result-card");
  const scanTitle = document.getElementById("scan-group-title");

  if (scanBtn && scanInput && scanResult && scanTitle) {
    scanBtn.addEventListener("click", () => {
      const code = scanInput.value.trim().toUpperCase();
      if (code.includes("EXPIRED")) {
        scanResult.style.background = "rgba(220, 38, 38, 0.08)";
        scanResult.style.borderColor = "#DC2626";
        scanTitle.textContent = "✕ VÉ ĐÃ HẾT HẠN HOẶC KHÔNG HỢP LỆ (TỪ CHỐI)";
        scanTitle.style.color = "#DC2626";
      } else {
        scanResult.style.background = "rgba(22, 163, 74, 0.08)";
        scanResult.style.borderColor = "#16A34A";
        scanTitle.textContent = `✓ HỢP LỆ: ${code} (Mở barrier thành công - Độ trễ 36ms)`;
        scanTitle.style.color = "#15803D";
      }
    });
  }

  const presets = document.querySelectorAll(".preset-code");
  presets.forEach(p => {
    p.addEventListener("click", () => {
      const code = p.getAttribute("data-code") || "";
      if (scanInput) scanInput.value = code;
      if (scanBtn) scanBtn.click();
    });
  });

  // Search input
  const searchInput = document.getElementById("scan-log-search") as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      logSearchQuery = (e.target as HTMLInputElement).value;
      logCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Status filter
  const statusFilter = document.getElementById("scan-log-status-filter") as HTMLSelectElement;
  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      logStatusFilter = (e.target as HTMLSelectElement).value;
      logCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Page Size selector (10, 20, 30, 50)
  const pageSizeSelect = document.getElementById("scan-page-size-select") as HTMLSelectElement;
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", (e) => {
      logPageSize = parseInt((e.target as HTMLSelectElement).value, 10) || 10;
      logCurrentPage = 1;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Pagination buttons
  const pagBtns = document.querySelectorAll(".scan-pag-btn");
  pagBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.getAttribute("data-page") || "1", 10);
      if (!isNaN(page)) {
        logCurrentPage = page;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });
}
