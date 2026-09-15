import { ARTIFACTS_DATA } from "../data/artifacts";
import { MapConfigStore } from "../data/mapData";
import { MuseumConfigStore, FeatureToggles, SYSTEM_PAGES, PermissionLevel } from "../data/museumConfig";
import { Icons } from "../components/Icons";
import { showToast } from "../components/Toast";

let currentSection: "scan" | "artifacts" | "tour360" | "map" | "analytics" | "settings" | "roles" = "scan";
let currentAnalyticsPeriod: "today" | "week" | "month" | "quarter" | "year" = "today";
let logCurrentPage: number = 1;
const LOGS_PER_PAGE = 4;
let selectedTourRoomId: string = "room-champa";

export function renderAdminPage(): string {
  const branding = MuseumConfigStore.branding;
  const features = MuseumConfigStore.features;
  const analytics = MuseumConfigStore.getAnalytics(currentAnalyticsPeriod);
  const allLogs = MuseumConfigStore.getScanLogs();
  const totalLogPages = Math.ceil(allLogs.length / LOGS_PER_PAGE) || 1;
  const currentLogs = allLogs.slice((logCurrentPage - 1) * LOGS_PER_PAGE, logCurrentPage * LOGS_PER_PAGE);

  const rooms = MuseumConfigStore.rooms360;
  const activeRoom = rooms.find(r => r.id === selectedTourRoomId) || rooms[0];
  const allRoles = MuseumConfigStore.roles;
  const allStaff = MuseumConfigStore.staff;
  const allLanguages = MuseumConfigStore.languages;

  return `
    <div class="page-viewport">
      <!-- Admin Top Banner -->
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="badge-pill" style="background: rgba(180, 83, 9, 0.15); color: var(--color-primary); border-color: var(--color-primary); font-size: 0.75rem;">
              TRUNG TÂM ĐIỀU HÀNH DI SẢN SỐ
            </span>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">
              Phiên bản CMS: 3.5.0-PRO
            </span>
          </div>
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--color-text-main); margin: 0;">
            Bảng Điều Khiển Quản Trị Trung Tâm
          </h1>
          <p style="font-size: 0.88rem; color: var(--color-text-muted); margin: 0.35rem 0 0 0;">
            Quản trị 100% tài nguyên: Không gian Tour Ảo 360°, Hiện vật 3D, Cổng soát vé, Ngôn ngữ & Ma trận phân quyền RBAC dạng Select.
          </p>
        </div>

        <!-- Quick Switch Workspace Tabs -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="admin-workspace-chips">
          <button class="chip ${currentSection === 'scan' ? 'active' : ''}" data-section="scan">
            ${Icons.qr}
            <span>Soát Vé Cổng</span>
          </button>
          <button class="chip ${currentSection === 'artifacts' ? 'active' : ''}" data-section="artifacts">
            ${Icons.cube}
            <span>Quản Lý Cổ Vật</span>
          </button>
          <button class="chip ${currentSection === 'tour360' ? 'active' : ''}" data-section="tour360">
            ${Icons.compass}
            <span>Tour Ảo 360°</span>
          </button>
          <button class="chip ${currentSection === 'map' ? 'active' : ''}" data-section="map">
            ${Icons.map}
            <span>Sơ Đồ & Dẫn Đường</span>
          </button>
          <button class="chip ${currentSection === 'analytics' ? 'active' : ''}" data-section="analytics">
            ${Icons.ticket}
            <span>Thống Kê</span>
          </button>
          <button class="chip ${currentSection === 'settings' ? 'active' : ''}" data-section="settings">
            ${Icons.filter}
            <span>Cấu Hình & Ngôn Ngữ</span>
          </button>
          <button class="chip ${currentSection === 'roles' ? 'active' : ''}" data-section="roles">
            ${Icons.user}
            <span>Phân Quyền RBAC</span>
          </button>
        </div>
      </div>

      <!-- SECTION 1: GATE SCANNER (<100MS) -->
      <div id="section-scan" style="display: ${currentSection === 'scan' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; margin-bottom: 2rem;">
          <!-- Left: Optical QR Scanner Simulation -->
          <div class="card" style="border-top: 4px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0 0 0.2rem 0;">
                  Máy Quét Vé Quang Học Cổng Tự Động
                </h3>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                  Thời gian phản hồi mục tiêu: &lt; 100ms • Xác thực Offline & Online
                </div>
              </div>
              <span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
                Cổng A1: Trực Tuyến
              </span>
            </div>

            <!-- Fast Scan Input -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem;">
              <input 
                type="text" 
                id="scan-ticket-input" 
                class="lang-select" 
                style="flex: 1; padding: 0.75rem 1rem; font-family: monospace; font-size: 1rem; font-weight: 700; text-transform: uppercase;" 
                placeholder="Nhập mã vé hoặc quét QR (VD: TKT-TOUR-9921)..." 
                value="TKT-TOUR-9921"
              />
              <button class="btn btn-primary" id="btn-simulate-scan" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;">
                ${Icons.qr}
                <span>Quét Ngay (&lt;50ms)</span>
              </button>
            </div>

            <!-- Preset Quick Testing Buttons -->
            <div style="margin-bottom: 1.5rem;">
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.4rem; font-weight: 600;">Mã vé mẫu để test nhanh:</div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-secondary preset-code" data-code="TKT-TOUR-9921" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  Học sinh THPT Gia Định (Hợp lệ)
                </button>
                <button class="btn btn-secondary preset-code" data-code="TKT-SOLO-4812" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  Vé khách lẻ người lớn (Hợp lệ)
                </button>
                <button class="btn btn-danger preset-code" data-code="TKT-EXPIRED-00" style="font-size: 0.75rem; padding: 0.35rem 0.65rem;">
                  Vé đã hết hạn (Từ chối)
                </button>
              </div>
            </div>

            <!-- Instant Verification Result Display -->
            <div id="scan-result-card" style="border: 2px dashed var(--color-card-border); border-radius: var(--radius-md); padding: 1.25rem; background: rgba(var(--color-surface-rgb), 0.3); transition: all 0.2s ease;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <span id="scan-status-badge" class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
                  SẴN SÀNG QUÉT
                </span>
                <span style="font-size: 0.75rem; color: var(--color-text-muted);" id="scan-speed-indicator">Thời gian xử lý: 41ms</span>
              </div>
              <div id="scan-group-title" style="font-size: 1.15rem; font-weight: 800; color: var(--color-text-main);">
                Chưa có yêu cầu quét vé
              </div>
              <div id="scan-group-details" style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.25rem;">
                Vui lòng đặt mã QR trước ống kính hoặc bấm nút "Quét Ngay" để mô phỏng mở cổng xoay Barrier.
              </div>
            </div>
          </div>

          <!-- Right: Gate Access Status Summary -->
          <div class="card">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem;">
              Trạng Thái Các Cổng Soát Vé
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
                <div>
                  <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.88rem;">Cổng A1 (Cổng chính mặt đường)</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Barrier tự động • 1,240 lượt qua</div>
                </div>
                <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Bình thường</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
                <div>
                  <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.88rem;">Cổng A2 (Làn ưu tiên khách đoàn)</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Máy quét quang học • 850 lượt qua</div>
                </div>
                <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Bình thường</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.4); border: 1px solid var(--color-card-border);">
                <div>
                  <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.88rem;">Cổng B1 (Lối vào Vườn Khảo Cổ)</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Thiết bị cầm tay Handheld • 320 lượt qua</div>
                </div>
                <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">Bình thường</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Scan Logs Table with Pagination -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
                Nhật Ký Quét Vé Vào Cổng Thời Gian Thực
              </h3>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                Tổng cộng: ${allLogs.length} lượt quét • Trang ${logCurrentPage} / ${totalLogPages}
              </div>
            </div>

            <!-- Pagination Buttons -->
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <button class="btn btn-secondary" id="log-prev-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;" ${logCurrentPage === 1 ? 'disabled' : ''}>
                ${Icons.chevronLeft} Trước
              </button>
              ${Array.from({ length: totalLogPages }, (_, i) => i + 1).map(p => `
                <button class="btn ${p === logCurrentPage ? 'btn-primary' : 'btn-secondary'} log-page-btn" data-page="${p}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; min-width: 32px;">
                  ${p}
                </button>
              `).join('')}
              <button class="btn btn-secondary" id="log-next-btn" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;" ${logCurrentPage === totalLogPages ? 'disabled' : ''}>
                Sau ${Icons.chevronRight}
              </button>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                  <th style="padding: 0.75rem;">Mã Vé</th>
                  <th style="padding: 0.75rem;">Đối Tượng / Khách Hàng</th>
                  <th style="padding: 0.75rem;">Loại Vé</th>
                  <th style="padding: 0.75rem;">Cổng Vào</th>
                  <th style="padding: 0.75rem;">Thời Gian</th>
                  <th style="padding: 0.75rem;">Độ Trễ</th>
                  <th style="padding: 0.75rem;">Kết Quả</th>
                </tr>
              </thead>
              <tbody>
                ${currentLogs.map(log => `
                  <tr style="border-bottom: 1px solid var(--color-card-border);">
                    <td style="padding: 0.75rem; font-family: monospace; font-weight: 700; color: var(--color-primary);">${log.ticketCode}</td>
                    <td style="padding: 0.75rem; font-weight: 600;">${log.visitorName}</td>
                    <td style="padding: 0.75rem;">${log.groupType}</td>
                    <td style="padding: 0.75rem;">${log.gate}</td>
                    <td style="padding: 0.75rem; color: var(--color-text-muted);">${log.time}</td>
                    <td style="padding: 0.75rem; font-family: monospace; color: #16A34A;">${log.durationMs}ms</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: ${log.status === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${log.status === 'success' ? '#16A34A' : '#DC2626'}; border-color: ${log.status === 'success' ? '#22C55E' : '#EF4444'};">
                        ${log.status === 'success' ? 'Mở Cổng Thành Công' : 'Từ Chối Vé Hết Hạn'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION 2: ARTIFACT MANAGEMENT & AI QUIZ GENERATOR -->
      <div id="section-artifacts" style="display: ${currentSection === 'artifacts' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
          <!-- AI Quiz Auto-Generator Card -->
          <div class="card" style="border-top: 4px solid var(--color-secondary);">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
              AI Sinh Bộ Câu Hỏi Đố Vui Tự Động Từ Hồ Sơ Hiện Vật
            </h3>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Admin không cần soạn câu hỏi thủ công. Trí tuệ nhân tạo sẽ trích xuất niên đại, chất liệu và hoa văn từ cơ sở dữ liệu để tạo bộ Quiz tương tác.
            </p>

            <div style="margin-bottom: 1rem;">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
                Chọn Hiện Vật Nguồn Cho AI:
              </label>
              <select class="lang-select" id="admin-ai-artifact-select" style="width: 100%; padding: 0.65rem;">
                ${ARTIFACTS_DATA.map(a => `
                  <option value="${a.id}">${a.name} (${a.era})</option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-secondary" id="btn-admin-ai-gen" style="width: 100%; padding: 0.75rem;">
              ${Icons.quiz}
              <span>Phân Tích Bảng Chú Thích & Sinh Câu Hỏi Mới</span>
            </button>

            <!-- Simulated Output Box -->
            <div id="ai-gen-result" style="display: none; margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(var(--color-surface-rgb), 0.5); border: 1px solid var(--color-secondary);">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 0.35rem;">
                KẾT QUẢ SINH TỰ ĐỘNG TỪ AI:
              </div>
              <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 0.5rem;">
                "Hình tượng mặt trời ở chính giữa trống đồng Đông Sơn có bao nhiêu cánh tia sáng?"
              </div>
              <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                • Đáp án đúng: 14 tia sáng • Độ khó: Trung bình • Đã đẩy vào ngân hàng câu hỏi.
              </div>
            </div>
          </div>

          <!-- Artifact Quick Status -->
          <div class="card">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
              Thống Kê Kho Số Hóa 3D
            </h3>
            <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">Hiện vật đã quét 3D WebGL:</span>
                <span style="font-weight: 800; color: var(--color-primary);">6 / 6 Bảo vật (100%)</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">Bản ghi âm giọng đọc Voice AI:</span>
                <span style="font-weight: 800; color: var(--color-secondary);">6 Bản ghi chuẩn</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">Tổng lượt xoay tương tác 3D:</span>
                <span style="font-weight: 800; color: #16A34A;">12,840 lượt</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">Độ phân giải vân bề mặt trung bình:</span>
                <span style="font-weight: 800; color: var(--color-text-main);">4K PBR Normal Maps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: TOUR 360° MANAGEMENT (NEW CMS WORKSPACE) -->
      <div id="section-tour360" style="display: ${currentSection === 'tour360' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
          <!-- Left: Add Showcase Pin Form via Selects -->
          <div class="card" style="border-top: 4px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
                Ghim Hiện Vật Vào Sảnh 360° (Không Nhập Bừa)
              </h3>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
                CMS Tương Tác
              </span>
            </div>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Admin chọn sảnh, chọn cổ vật từ danh mục có sẵn và chọn góc đặt bước chân (Walk Node) để gắn biển chú thích trực tiếp vào không gian 360°.
            </p>

            <form id="add-tour-pin-form">
              <!-- Select Room -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  1. Chọn Gian Sảnh Trưng Bày:
                </label>
                <select id="admin-pin-room-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${rooms.map(r => `
                    <option value="${r.id}" ${r.id === activeRoom.id ? 'selected' : ''}>${r.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Select Artifact -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  2. Chọn Hiện Vật Cần Ghim (Dropdown từ Kho Cổ Vật):
                </label>
                <select id="admin-pin-artifact-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${ARTIFACTS_DATA.map(a => `
                    <option value="${a.id}" data-title="${a.name}" data-era="${a.era}">${a.name} • ${a.era}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Select Walk Node Anchor -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  3. Chọn Điểm Quan Sát Gần Nhất (Walk Node Anchor):
                </label>
                <select id="admin-pin-node-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${activeRoom.nodes.map(n => `
                    <option value="${n.id}">${n.name} (ID: ${n.id})</option>
                  `).join('')}
                </select>
              </div>

              <button type="button" class="btn btn-primary" id="btn-add-tour-pin" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;">
                ${Icons.check}
                <span>Thêm Điểm Ghim Cổ Vật Vào Sảnh 360°</span>
              </button>
            </form>
          </div>

          <!-- Right: Room Status & Walk Nodes -->
          <div class="card">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
              Thông Tin Sảnh Đang Chọn: ${activeRoom.name}
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
              ${activeRoom.description}
            </p>

            <div style="background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.4rem;">
                DANH SÁCH ĐIỂM BƯỚC CHÂN (WALK NODES TRÊN SÀN):
              </div>
              ${activeRoom.nodes.map((n, i) => `
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="color: var(--color-text-main); font-weight: 600;">${i + 1}. ${n.name}</span>
                  <span style="color: var(--color-text-muted); font-family: monospace;">(${n.position.x}, ${n.position.z})</span>
                </div>
              `).join('')}
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <a href="#tour360" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none; justify-content: center; font-size: 0.82rem;">
                ${Icons.compass}
                <span>Xem Trực Tiếp Tour 360°</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Table of Active Showcase Pins in this Room -->
        <div class="card">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem;">
            Các Điểm Ghim Hiện Vật Trong Sảnh: ${activeRoom.name}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                <th style="padding: 0.75rem;">Mã Ghim</th>
                <th style="padding: 0.75rem;">Tên Hiện Vật</th>
                <th style="padding: 0.75rem;">Niên Đại</th>
                <th style="padding: 0.75rem;">Vị Trí Tọa Độ 3D (X, Y, Z)</th>
                <th style="padding: 0.75rem;">Gần Điểm Node</th>
                <th style="padding: 0.75rem;">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              ${activeRoom.showcases.map(pin => `
                <tr style="border-bottom: 1px solid var(--color-card-border);">
                  <td style="padding: 0.75rem; font-family: monospace; color: var(--color-primary); font-weight: 700;">${pin.id}</td>
                  <td style="padding: 0.75rem; font-weight: 700; color: var(--color-text-main);">${pin.title}</td>
                  <td style="padding: 0.75rem; color: var(--color-text-muted);">${pin.era}</td>
                  <td style="padding: 0.75rem; font-family: monospace;">(${Math.round(pin.position.x)}, ${Math.round(pin.position.y)}, ${Math.round(pin.position.z)})</td>
                  <td style="padding: 0.75rem; color: var(--color-secondary);">${pin.roomNodeId}</td>
                  <td style="padding: 0.75rem;">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">
                      Đang Hoạt Động
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>


      <!-- SECTION: FLOOR MAP & BLUEPRINT CMS -->
      <div id="section-map" style="display: ${currentSection === 'map' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
          <!-- Left: Blueprint Upload & AI Scan Simulation -->
          <div class="card" style="border-top: 4px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
                Tải Lên Sơ Đồ Kiến Trúc & Quét Phân Tích AI
              </h3>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(56, 189, 248, 0.15); color: #0284c7; border-color: #38bdf8;">
                AI Blueprint Scanner
              </span>
            </div>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Admin tải ảnh chụp bản vẽ mặt bằng bảo tàng (JPG, PNG, DWG). AI sẽ tự động phân tích các phân vùng, lối đi và nhận diện ranh giới phòng sảnh.
            </p>

            <!-- Dropzone Simulation -->
            <div id="blueprint-dropzone" style="border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: var(--radius-lg); padding: 2rem 1.5rem; text-align: center; background: rgba(var(--color-surface-rgb), 0.3); margin-bottom: 1.25rem; cursor: pointer;">
              <div style="color: #38bdf8; font-size: 2.5rem; margin-bottom: 0.5rem; display: flex; justify-content: center;">
                ${Icons.map}
              </div>
              <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.95rem; margin-bottom: 0.25rem;">
                Kéo thả file sơ đồ mặt bằng vào đây hoặc <span style="color: #38bdf8; text-decoration: underline;">Chọn từ máy tính</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                Đã nạp sẵn: <code>SO_DO_MAT_BANG_BAO_TANG_TOA_A_2026.PNG</code> (Bản vẽ CAD 4K)
              </div>
            </div>

            <!-- AI Trigger Button -->
            <button class="btn btn-secondary" id="btn-scan-blueprint-ai" style="width: 100%; padding: 0.75rem; justify-content: center; font-size: 0.88rem;">
              ${Icons.compass}
              <span id="scan-blueprint-label">Kích Hoạt AI Quét Nhận Diện Ranh Giới Tòa Nhà & Phòng</span>
            </button>

            <!-- AI Scan Results Box -->
            <div id="ai-blueprint-results" style="display: none; margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(34, 197, 94, 0.08); border: 1px solid #22c55e;">
              <div style="font-size: 0.8rem; font-weight: 800; color: #16a34a; margin-bottom: 0.4rem;">
                ✓ KẾT QUẢ PHÂN TÍCH AI (ĐỘ CHÍNH XÁC 99.2%):
              </div>
              <div style="font-size: 0.8rem; color: var(--color-text-main); line-height: 1.5;">
                • Nhận diện: <b>3 Tòa nhà</b> (Tòa A Trưng bày chính, Tòa B Nghiên cứu, Khu C Vườn Sa thạch).<br/>
                • Nhận diện: <b>7 Gian phòng triển lãm</b>, 3 Cầu thang bộ, 2 Thang máy, 4 Cửa thoát hiểm.<br/>
                • Tọa độ và ranh giới đã được tự động liên kết với Bản Đồ Tầng 2.5D cho Du khách.
              </div>
            </div>
          </div>

          <!-- Right: Select-Based Room & 360 Bridge Mapping Form -->
          <div class="card" style="border-top: 4px solid var(--color-secondary);">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
              Thiết Lập Phòng & Cầu Nối Bay Vào Sảnh 360°
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Admin chọn Tòa nhà, Tầng, và gán liên kết sang Sảnh Tour 360° tương ứng hoàn toàn bằng Select.
            </p>

            <form id="map-room-config-form">
              <!-- Select Building -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  1. Chọn Tòa Nhà (Building):
                </label>
                <select id="admin-map-bldg-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${MapConfigStore.buildings.map(b => `
                    <option value="${b.id}">${b.code} - ${b.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Select Floor -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  2. Chọn Tầng Trưng Bày (Floor Level):
                </label>
                <select id="admin-map-floor-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  <option value="1">Tầng 1 - Văn Minh Tiền Sử & Đông Sơn</option>
                  <option value="2">Tầng 2 - Nghệ Thuật Champa & Óc Eo</option>
                  <option value="3">Tầng 3 - Cổ Vật Triều Nguyễn & Gốm Cổ</option>
                </select>
              </div>

              <!-- Room Name -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  3. Tên Gian Phòng / Khu Trưng Bày:
                </label>
                <input type="text" id="admin-map-room-name" class="lang-select" style="width: 100%; padding: 0.65rem;" placeholder="VD: Sảnh Điêu Khắc Sa Thạch" value="Gian Trưng Bày Mới Bổ Sung" />
              </div>

              <!-- Link to 360 Tour Hall (Select) -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  4. Liên Kết Cầu Nối Bay Sang Sảnh 360° (Tour 360 Room):
                </label>
                <select id="admin-map-tour-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${MuseumConfigStore.rooms360.map(r => `
                    <option value="${r.id}">${r.name}</option>
                  `).join('')}
                  <option value="none">Chưa liên kết 360°</option>
                </select>
              </div>

              <!-- Max Capacity -->
              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  5. Ngưỡng Cảnh Báo Phân Luồng (Sức chứa tối đa):
                </label>
                <input type="number" id="admin-map-capacity" class="lang-select" style="width: 100%; padding: 0.65rem;" value="60" />
              </div>

              <button type="button" class="btn btn-primary" id="btn-save-map-room" style="width: 100%; padding: 0.75rem;">
                ${Icons.check}
                <span>Lưu Gian Phòng & Cập Nhật Lên Sơ Đồ 2.5D</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Mapped Rooms & Crowd Status Table -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
              Danh Sách Các Gian Phòng Đang Hoạt Động & Mật Độ Khách Thực Tế
            </h3>
            <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
              Đồng bộ thời gian thực
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                  <th style="padding: 0.75rem;">Tòa Nhà & Tầng</th>
                  <th style="padding: 0.75rem;">Tên Gian Phòng</th>
                  <th style="padding: 0.75rem;">Chủ Đề Trưng Bày</th>
                  <th style="padding: 0.75rem;">Mật Độ Khách Hiện Tại</th>
                  <th style="padding: 0.75rem;">Cầu Nối Tour 360°</th>
                  <th style="padding: 0.75rem;">Phân Luồng Thử Nghiệm</th>
                </tr>
              </thead>
              <tbody>
                ${MapConfigStore.buildings.flatMap(b => b.floors.flatMap(f => f.rooms.map(r => `
                  <tr style="border-bottom: 1px solid var(--color-card-border);">
                    <td style="padding: 0.75rem; font-weight: 700; color: var(--color-primary);">${b.code} - Tầng ${f.level}</td>
                    <td style="padding: 0.75rem; font-weight: 800; color: var(--color-text-main);">${r.name}</td>
                    <td style="padding: 0.75rem; color: var(--color-text-muted); font-size: 0.8rem;">${r.theme}</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: ${r.density === 'low' ? 'rgba(34,197,94,0.15)' : r.density === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${r.density === 'low' ? '#16a34a' : r.density === 'medium' ? '#d97706' : '#dc2626'}; border-color: ${r.density === 'low' ? '#22c55e' : r.density === 'medium' ? '#f59e0b' : '#ef4444'};">
                        ${r.currentVisitors} / ${r.maxCapacity} Khách (${r.density.toUpperCase()})
                      </span>
                    </td>
                    <td style="padding: 0.75rem;">
                      ${r.tour360RoomId ? `
                        <span style="color: #0284c7; font-weight: 700; font-size: 0.8rem;">✓ ${r.tour360RoomId}</span>
                      ` : `
                        <span style="color: var(--color-text-muted); font-size: 0.8rem;">Chưa có</span>
                      `}
                    </td>
                    <td style="padding: 0.75rem;">
                      <button class="btn btn-secondary sim-density-btn" data-room-id="${r.id}" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">
                        +10 Khách
                      </button>
                    </td>
                  </tr>
                `))).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- SECTION 4: ANALYTICS -->
      <div id="section-analytics" style="display: ${currentSection === 'analytics' ? 'block' : 'none'};">
        <!-- Time Filter Chips -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;" id="analytics-period-chips">
          <button class="chip ${currentAnalyticsPeriod === 'today' ? 'active' : ''}" data-period="today">Hôm Nay</button>
          <button class="chip ${currentAnalyticsPeriod === 'week' ? 'active' : ''}" data-period="week">Tuần Này</button>
          <button class="chip ${currentAnalyticsPeriod === 'month' ? 'active' : ''}" data-period="month">Tháng Này</button>
          <button class="chip ${currentAnalyticsPeriod === 'quarter' ? 'active' : ''}" data-period="quarter">Quý Này</button>
          <button class="chip ${currentAnalyticsPeriod === 'year' ? 'active' : ''}" data-period="year">Cả Năm</button>
        </div>

        <!-- 4 KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
          <div class="card">
            <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Tổng Lượt Khách</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--color-primary); margin: 0.4rem 0;">${analytics.totalVisitors.toLocaleString()}</div>
            <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">↑ +14.2% so với kỳ trước</div>
          </div>
          <div class="card">
            <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Vé QR Hợp Lệ</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--color-secondary); margin: 0.4rem 0;">${analytics.validTickets.toLocaleString()}</div>
            <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">Tỷ lệ chuẩn: 97.5%</div>
          </div>
          <div class="card">
            <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Lượt Nghe Voice AI</div>
            <div style="font-size: 2rem; font-weight: 900; color: #0284c7; margin: 0.4rem 0;">${analytics.voiceAiPlays.toLocaleString()}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Đa ngôn ngữ trực tuyến</div>
          </div>
          <div class="card">
            <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Lượt Chơi Quiz & Tem</div>
            <div style="font-size: 2rem; font-weight: 900; color: #16A34A; margin: 0.4rem 0;">${analytics.quizCompletions.toLocaleString()}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Học tập di sản tương tác</div>
          </div>
        </div>

        <!-- Room Visitor Distribution -->
        <div class="card">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1.25rem;">
            Phân Bố Mật Độ Khách Theo Không Gian Sảnh
          </h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${analytics.roomDistribution.map(rd => `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">
                  <span>${rd.room}</span>
                  <span>${rd.visitors.toLocaleString()} khách (${rd.percentage}%)</span>
                </div>
                <div style="height: 8px; background: rgba(var(--color-surface-rgb), 0.6); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${rd.percentage}%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SECTION 5: SETTINGS, FEATURE FLAGS & LANGUAGES -->
      <div id="section-settings" style="display: ${currentSection === 'settings' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
          <!-- Branding Form -->
          <div class="card" style="border-top: 4px solid var(--color-primary);">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem;">
              1. Cấu Hình Thương Hiệu Bảo Tàng (Multi-Museum CMS)
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Thay đổi thông tin tại đây sẽ tự động cập nhật ngay trên toàn bộ giao diện Web du khách.
            </p>

            <form id="branding-settings-form">
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Tên Bảo Tàng:
                </label>
                <input type="text" id="setting-museum-name" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.name}" />
              </div>

              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Khẩu Hiệu / Tiêu Đề Phụ:
                </label>
                <input type="text" id="setting-museum-subname" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.subName}" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem;">
                <div>
                  <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                    Đơn Vị Chủ Quản:
                  </label>
                  <input type="text" id="setting-museum-unit" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.unit}" />
                </div>
                <div>
                  <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                    Số Điện Thoại Hotline:
                  </label>
                  <input type="text" id="setting-museum-hotline" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.hotline}" />
                </div>
              </div>

              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Địa Chỉ Trụ Sở:
                </label>
                <input type="text" id="setting-museum-address" class="lang-select" style="width: 100%; padding: 0.65rem;" value="${branding.address}" />
              </div>

              <button type="button" class="btn btn-primary" id="btn-save-branding" style="width: 100%;">
                ${Icons.check}
                <span>Lưu Thay Đổi & Cập Nhật Sang Web Du Khách</span>
              </button>
            </form>
          </div>

          <!-- Feature Flags & Dynamic Language Management -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Feature Flags -->
            <div class="card" style="border-top: 4px solid var(--color-secondary);">
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
                2. Công Tắc Bật / Tắt Tính Năng (Feature Flags)
              </h3>
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
                Khi tắt tính năng nào, tính năng đó sẽ tự ẩn khỏi Menu du khách ngay lập tức.
              </p>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${[
                  { key: 'enableTour360', label: 'Tour Ảo VR 360° Bước Đi', desc: 'Sảnh panorama và điểm ghim cổ vật' },
                  { key: 'enable3D', label: 'Mô Hình 3D WebGL Tương Tác', desc: 'Kéo xoay 360 độ hiện vật' },
                  { key: 'enableVoiceAI', label: 'Voice AI Đọc Bảng Chú Thích', desc: 'Giọng đọc tự động đa ngôn ngữ' },
                  { key: 'enableQuiz', label: 'Trò Chơi Đố Vui & Sổ Tem Số', desc: 'Mini-game thử thách kiến thức' },
                  { key: 'enableTourBooking', label: 'Đặt Lịch Tour Theo Lớp & Đoàn', desc: 'Đăng ký ca giờ và cấp vé QR' },
                  { key: 'enableBroadcast', label: 'Loa Phát Thanh Trực Tiếp', desc: 'Dòng tin phát thanh ở thanh bên' },
                  { key: 'enablePassport', label: 'Hộ Chiếu & Hồ Sơ Du Khách', desc: 'Tích lũy tem và điểm danh hiệu' }
                ].map(f => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.75rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.25); border: 1px solid var(--color-card-border);">
                    <div>
                      <div style="font-weight: 700; color: var(--color-text-main); font-size: 0.85rem;">${f.label}</div>
                      <div style="font-size: 0.72rem; color: var(--color-text-muted);">${f.desc}</div>
                    </div>
                    <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                      <input type="checkbox" class="feature-toggle-checkbox" data-feature="${f.key}" ${(features as any)[f.key] ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;" />
                      <span style="position: absolute; cursor: pointer; inset: 0; background-color: ${(features as any)[f.key] ? 'var(--color-primary)' : '#CBD5E1'}; transition: .2s; border-radius: 24px;">
                        <span style="position: absolute; height: 18px; width: 18px; left: ${(features as any)[f.key] ? '23px' : '3px'}; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%;"></span>
                      </span>
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Language Packages Management -->
            <div class="card" style="border-top: 4px solid #0284c7;">
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
                3. Quản Lý Gói Ngôn Ngữ Hệ Thống
              </h3>
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                Admin bật/tắt ngôn ngữ tại đây sẽ lập tức thay đổi danh sách lựa chọn trong Dropdown ngôn ngữ của Du khách.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                ${allLanguages.map(l => `
                  <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer;">
                    <span>${l.label}</span>
                    <input type="checkbox" class="lang-toggle-cb" data-lang="${l.code}" ${l.active ? 'checked' : ''} />
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Broadcast -->
        <div class="card">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
            4. Phát Thông Báo Trực Tiếp Đến Du Khách (Live Broadcast)
          </h3>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem;">
            Thông báo này sẽ xuất hiện ngay lập tức tại hộp Loa Bảo Tàng trên màn hình du khách.
          </p>

          <div style="display: flex; gap: 0.75rem;">
            <input type="text" id="new-announcement-input" class="lang-select" style="flex: 1; padding: 0.75rem;" placeholder="Nhập nội dung thông báo phát thanh..." />
            <button class="btn btn-primary" id="btn-publish-announcement" style="padding: 0.75rem 1.5rem;">
              Phát Loa Ngay
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION 6: SELECT-BASED RBAC MATRIX & DASHBOARD -->
      <div id="section-roles" style="display: ${currentSection === 'roles' ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
          <!-- Select-Based RBAC Assignment Form (User explicitly asked: "k cần nhập bừa có cho họ chọn dạng select") -->
          <div class="card" style="border-top: 4px solid var(--color-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
                Thiết Lập Phân Quyền Vai Trò (Dạng Select)
              </h3>
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">
                RBAC Matrix Engine
              </span>
            </div>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Admin phân quyền rõ ràng: Chọn Vai Trò, Chọn Trang Nghiệp Vụ, Chọn Mức Độ Quyền Hạn và Gán Cán Bộ phụ trách qua các danh sách Select.
            </p>

            <form id="rbac-assignment-form">
              <!-- 1. Select Role -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  1. Chọn Vai Trò Cần Phân Quyền (Role):
                </label>
                <select id="rbac-role-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${allRoles.map(r => `
                    <option value="${r.id}">${r.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- 2. Select System Page -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  2. Chọn Trang / Nghiệp Vụ Quản Lý (System Page):
                </label>
                <select id="rbac-page-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${SYSTEM_PAGES.map(p => `
                    <option value="${p.id}">[${p.category.toUpperCase()}] ${p.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- 3. Select Permission Level -->
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  3. Chọn Mức Quyền Thao Tác (Permission Level):
                </label>
                <select id="rbac-permission-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  <option value="FULL_ACCESS">Toàn Quyền Quản Trị (FULL_ACCESS - Thêm, Sửa, Xóa, Duyệt)</option>
                  <option value="EDITOR">Biên Tập Viên (EDITOR - Thêm mới và Chỉnh sửa nội dung)</option>
                  <option value="REVIEWER">Kiểm Duyệt Viên (REVIEWER - Thẩm định, Duyệt hồ sơ)</option>
                  <option value="READ_ONLY">Chỉ Xem Dữ Liệu (READ_ONLY - Xem báo cáo, Không sửa)</option>
                  <option value="NONE">Không Cho Phép Truy Cập (NONE - Khóa trang này)</option>
                </select>
              </div>

              <!-- 4. Select Staff User -->
              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  4. Gán Thêm Cán Bộ Đảm Nhiệm Vai Trò Này (Staff Member):
                </label>
                <select id="rbac-staff-select" class="lang-select" style="width: 100%; padding: 0.65rem;">
                  ${allStaff.map(s => `
                    <option value="${s.id}">${s.name} (${s.email}) - ${s.roleTitle}</option>
                  `).join('')}
                </select>
              </div>

              <button type="button" class="btn btn-primary" id="btn-save-rbac-assignment" style="width: 100%; padding: 0.75rem;">
                ${Icons.check}
                <span>Lưu Phân Quyền & Cập Nhật Ma Trận RBAC</span>
              </button>
            </form>
          </div>

          <!-- Create New Role Quick Box -->
          <div class="card" style="border-top: 4px solid var(--color-secondary);">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 0.5rem;">
              Tạo Vai Trò Quản Trị Mới
            </h3>
            <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              Thêm vai trò mới vào hệ thống mà không cần lập trình viên can thiệp.
            </p>

            <form id="create-new-role-form">
              <div style="margin-bottom: 0.85rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Tên Vai Trò Mới:
                </label>
                <input type="text" id="new-custom-role-name" class="lang-select" style="width: 100%; padding: 0.65rem;" placeholder="VD: Trưởng Phòng Khảo Cổ Số" />
              </div>

              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.3rem;">
                  Mô Tả Nhiệm Vụ:
                </label>
                <input type="text" id="new-custom-role-desc" class="lang-select" style="width: 100%; padding: 0.65rem;" placeholder="VD: Giám sát trưng bày và duyệt nội dung 360" />
              </div>

              <button type="button" class="btn btn-secondary" id="btn-create-custom-role" style="width: 100%; padding: 0.75rem;">
                + Tạo Thêm Vai Trò Này
              </button>
            </form>
          </div>
        </div>

        <!-- Comprehensive RBAC Matrix Dashboard Table (User request: "dash board admin lun tổng hợp các role hay các page quản lí lại khi mà họ phân quyền là biết quyền gì role gì page nào") -->
        <div class="card" style="margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="font-size: 1.15rem; color: var(--color-primary); margin: 0;">
                Bảng Tổng Hợp Ma Trận Phân Quyền (Role × Page × Permission)
              </h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0.2rem 0 0 0;">
                Nhìn vào bảng này Admin biết ngay Vai trò nào được phép vào Trang nào và Mức độ quyền hạn là gì.
              </p>
            </div>
            <span class="badge-pill" style="font-size: 0.75rem; padding: 2px 10px;">
              Tổng: ${allRoles.length} Vai Trò
            </span>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--color-card-border); color: var(--color-text-muted);">
                  <th style="padding: 0.75rem;">Vai Trò (Role)</th>
                  <th style="padding: 0.75rem;">Mô Tả Nhiệm Vụ</th>
                  <th style="padding: 0.75rem;">Trang Được Phép & Mức Quyền</th>
                  <th style="padding: 0.75rem;">Cán Bộ Đảm Nhiệm</th>
                  <th style="padding: 0.75rem; text-align: center;">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                ${allRoles.map(role => {
                  const assignedStaff = allStaff.filter(s => role.assignedStaffIds?.includes(s.id));
                  return `
                    <tr style="border-bottom: 1px solid var(--color-card-border);">
                      <td style="padding: 0.75rem; font-weight: 800; color: var(--color-primary); vertical-align: top;">
                        ${role.name}
                        <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: monospace; font-weight: normal;">ID: ${role.id}</div>
                      </td>
                      <td style="padding: 0.75rem; color: var(--color-text-muted); font-size: 0.8rem; max-width: 200px; vertical-align: top;">
                        ${role.description}
                      </td>
                      <td style="padding: 0.75rem; vertical-align: top;">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                          ${Object.entries(role.pagePermissions || {}).map(([pageId, perm]) => {
                            const pageDef = SYSTEM_PAGES.find(p => p.id === pageId);
                            const pageName = pageDef ? pageDef.name : pageId;
                            let permColor = "#16A34A";
                            let permBg = "rgba(34, 197, 94, 0.15)";
                            if (perm === 'EDITOR') { permColor = "#0284c7"; permBg = "rgba(56, 189, 248, 0.15)"; }
                            if (perm === 'REVIEWER') { permColor = "#d97706"; permBg = "rgba(217, 119, 6, 0.15)"; }
                            if (perm === 'READ_ONLY') { permColor = "#64748b"; permBg = "rgba(100, 116, 139, 0.15)"; }

                            return `
                              <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; background: ${permBg}; color: ${permColor}; border: 1px solid ${permColor}; font-weight: 600;">
                                ${pageName}: <b>${perm}</b>
                              </span>
                            `;
                          }).join('')}
                        </div>
                      </td>
                      <td style="padding: 0.75rem; vertical-align: top;">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                          ${assignedStaff.length > 0 ? assignedStaff.map(s => `
                            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-main);">
                              • ${s.name} <span style="font-size: 0.7rem; color: var(--color-text-muted);">(${s.email})</span>
                            </span>
                          `).join('') : '<span style="font-size: 0.75rem; color: var(--color-text-muted); font-style: italic;">Chưa gán cán bộ</span>'}
                        </div>
                      </td>
                      <td style="padding: 0.75rem; text-align: center; vertical-align: top;">
                        <button class="btn btn-secondary quick-edit-role-btn" data-role-id="${role.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
                          Sửa Quyền
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Staff Users Roster Table -->
        <div class="card">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem;">
            Danh Sách Tài Khoản Cán Bộ & Nhân Sự Bảo Tàng
          </h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-card-border); color: var(--color-text-muted);">
                  <th style="padding: 0.75rem;">Mã Nhân Viên</th>
                  <th style="padding: 0.75rem;">Họ Và Tên Cán Bộ</th>
                  <th style="padding: 0.75rem;">Email Công Vụ</th>
                  <th style="padding: 0.75rem;">Chức Danh Bổ Nhiệm</th>
                  <th style="padding: 0.75rem;">Trạng Thái Làm Việc</th>
                </tr>
              </thead>
              <tbody>
                ${allStaff.map(s => `
                  <tr style="border-bottom: 1px solid var(--color-card-border);">
                    <td style="padding: 0.75rem; font-family: monospace;">${s.id}</td>
                    <td style="padding: 0.75rem; font-weight: 700; color: var(--color-primary);">${s.name}</td>
                    <td style="padding: 0.75rem;">${s.email}</td>
                    <td style="padding: 0.75rem;">${s.roleTitle}</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.12); color: #16A34A; border-color: #22C55E;">
                        Đang làm việc
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT LISTENERS & CMS INTERACTIVITY
// -------------------------------------------------------------
export function initAdminPageLogic() {
  // Switch Section via Top Workspace Chips
  const sectionChips = document.querySelectorAll("#admin-workspace-chips .chip");
  sectionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      currentSection = chip.getAttribute("data-section") as any;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Switch Section via Left Sidebar Buttons
  window.addEventListener("admin:switch-section", ((e: CustomEvent) => {
    if (e.detail && e.detail.section) {
      currentSection = e.detail.section;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }) as EventListener);

  // Section 1: Gate Scanner logic
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
        scanTitle.textContent = "VÉ ĐÃ HẾT HẠN HOẶC KHÔNG HỢP LỆ (TỪ CHỐI)";
        scanTitle.style.color = "#DC2626";
      } else {
        scanResult.style.background = "rgba(22, 163, 74, 0.08)";
        scanResult.style.borderColor = "#16A34A";
        scanTitle.textContent = `HỢP LỆ: ${code} (Khách tham quan hợp lệ)`;
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

  // Scan Log Pagination
  const logPrev = document.getElementById("log-prev-btn");
  const logNext = document.getElementById("log-next-btn");
  const logPages = document.querySelectorAll(".log-page-btn");

  if (logPrev) {
    logPrev.addEventListener("click", () => {
      if (logCurrentPage > 1) {
        logCurrentPage--;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  }

  if (logNext) {
    logNext.addEventListener("click", () => {
      const allLogs = MuseumConfigStore.getScanLogs();
      const totalLogPages = Math.ceil(allLogs.length / LOGS_PER_PAGE) || 1;
      if (logCurrentPage < totalLogPages) {
        logCurrentPage++;
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  }

  logPages.forEach(btn => {
    btn.addEventListener("click", () => {
      logCurrentPage = parseInt(btn.getAttribute("data-page") || "1", 10);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Section 2: AI Quiz generation
  const genBtn = document.getElementById("btn-admin-ai-gen");
  const aiResult = document.getElementById("ai-gen-result");
  if (genBtn && aiResult) {
    genBtn.addEventListener("click", () => {
      genBtn.textContent = "AI đang xử lý trích xuất...";
      setTimeout(() => {
        aiResult.style.display = "block";
        genBtn.textContent = "Đã Phê Duyệt & Sinh Quiz";
      }, 400);
    });
  }

  // Section 3: 360 Tour CMS - Add Showcase Pin
  const addPinBtn = document.getElementById("btn-add-tour-pin");
  const pinRoomSelect = document.getElementById("admin-pin-room-select") as HTMLSelectElement;
  const pinArtifactSelect = document.getElementById("admin-pin-artifact-select") as HTMLSelectElement;
  const pinNodeSelect = document.getElementById("admin-pin-node-select") as HTMLSelectElement;

  if (pinRoomSelect) {
    pinRoomSelect.addEventListener("change", (e) => {
      selectedTourRoomId = (e.target as HTMLSelectElement).value;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  if (addPinBtn && pinRoomSelect && pinArtifactSelect && pinNodeSelect) {
    addPinBtn.addEventListener("click", () => {
      const roomId = pinRoomSelect.value;
      const artifactId = pinArtifactSelect.value;
      const opt = pinArtifactSelect.options[pinArtifactSelect.selectedIndex];
      const title = opt.getAttribute("data-title") || "Hiện vật mới";
      const era = opt.getAttribute("data-era") || "Niên đại cổ";
      const nodeId = pinNodeSelect.value;

      MuseumConfigStore.addShowcasePin(roomId, artifactId, title, era, nodeId);
      showToast(`Đã thêm thành công điểm ghim cho [${title}] vào sảnh 360°!`, "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }


  // Section Map CMS: AI Blueprint Scan Button
  const scanAiBtn = document.getElementById("btn-scan-blueprint-ai");
  const aiResultsBox = document.getElementById("ai-blueprint-results");
  if (scanAiBtn && aiResultsBox) {
    scanAiBtn.addEventListener("click", () => {
      scanAiBtn.textContent = "AI Đang Quét Bản Vẽ Kiến Trúc CAD...";
      setTimeout(() => {
        aiResultsBox.style.display = "block";
        scanAiBtn.textContent = "✓ Đã Quét Xong & Liên Kết Sơ Đồ 2.5D";
      }, 500);
    });
  }

  // Section Map CMS: Save Room Form
  const saveMapRoomBtn = document.getElementById("btn-save-map-room");
  const mapBldgSelect = document.getElementById("admin-map-bldg-select") as HTMLSelectElement;
  const mapFloorSelect = document.getElementById("admin-map-floor-select") as HTMLSelectElement;
  const mapRoomNameInput = document.getElementById("admin-map-room-name") as HTMLInputElement;
  const mapTourSelect = document.getElementById("admin-map-tour-select") as HTMLSelectElement;
  const mapCapInput = document.getElementById("admin-map-capacity") as HTMLInputElement;

  if (saveMapRoomBtn && mapBldgSelect && mapFloorSelect && mapRoomNameInput && mapTourSelect) {
    saveMapRoomBtn.addEventListener("click", () => {
      const bldgId = mapBldgSelect.value;
      const floorLvl = parseInt(mapFloorSelect.value, 10);
      const roomName = mapRoomNameInput.value.trim();
      const tourId = mapTourSelect.value === "none" ? "" : mapTourSelect.value;
      const cap = parseInt(mapCapInput?.value || "60", 10);

      if (!roomName) {
        showToast("Vui lòng nhập tên gian phòng!", "warning");
        return;
      }

      MapConfigStore.addRoom(bldgId, floorLvl, roomName, "Không gian khảo cổ học & di sản số", tourId, cap);
      showToast(`Đã thêm gian phòng: [${roomName}] vào sơ đồ Tầng ${floorLvl} thành công!`, "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Section Map CMS: Simulate Visitor Density Change
  const simDensityBtns = document.querySelectorAll(".sim-density-btn");
  simDensityBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rId = btn.getAttribute("data-room-id");
      if (rId) {
        const room = MapConfigStore.getRoomById(rId);
        if (room) {
          const newCount = (room.currentVisitors + 10) % (room.maxCapacity + 15);
          MapConfigStore.updateRoomDensity(rId, newCount);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }
    });
  });

  // Section 4: Analytics Period Switcher
  const periodChips = document.querySelectorAll("#analytics-period-chips .chip");
  periodChips.forEach(chip => {
    chip.addEventListener("click", () => {
      currentAnalyticsPeriod = chip.getAttribute("data-period") as any;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  });

  // Section 5: Save Branding Settings
  const saveBrandingBtn = document.getElementById("btn-save-branding");
  if (saveBrandingBtn) {
    saveBrandingBtn.addEventListener("click", () => {
      const name = (document.getElementById("setting-museum-name") as HTMLInputElement)?.value;
      const subName = (document.getElementById("setting-museum-subname") as HTMLInputElement)?.value;
      const unit = (document.getElementById("setting-museum-unit") as HTMLInputElement)?.value;
      const address = (document.getElementById("setting-museum-address") as HTMLInputElement)?.value;
      const hotline = (document.getElementById("setting-museum-hotline") as HTMLInputElement)?.value;

      MuseumConfigStore.updateBranding({ name, subName, unit, address, hotline });
      showToast("Đã lưu và cập nhật thông tin thương hiệu bảo tàng thành công!", "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Section 5: Feature Toggles Checkboxes
  const featureCheckboxes = document.querySelectorAll(".feature-toggle-checkbox");
  featureCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const key = target.getAttribute("data-feature") as keyof FeatureToggles;
      if (key) {
        MuseumConfigStore.toggleFeature(key, target.checked);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });

  // Section 5: Language Toggles
  const langCheckboxes = document.querySelectorAll(".lang-toggle-cb");
  langCheckboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const langCode = target.getAttribute("data-lang");
      if (langCode) {
        MuseumConfigStore.toggleLanguageActive(langCode, target.checked);
      }
    });
  });

  // Section 5: Publish Announcement
  const publishAnnBtn = document.getElementById("btn-publish-announcement");
  const annInput = document.getElementById("new-announcement-input") as HTMLInputElement;
  if (publishAnnBtn && annInput) {
    publishAnnBtn.addEventListener("click", () => {
      const val = annInput.value.trim();
      if (!val) {
        showToast("Vui lòng nhập nội dung thông báo phát thanh!", "warning");
        return;
      }
      MuseumConfigStore.addAnnouncement(val);
      annInput.value = "";
      showToast("Đã phát loa thông báo thành công đến toàn thể du khách!", "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Section 6: RBAC Assignment Form Submission
  const saveRbacBtn = document.getElementById("btn-save-rbac-assignment");
  const roleSelect = document.getElementById("rbac-role-select") as HTMLSelectElement;
  const pageSelect = document.getElementById("rbac-page-select") as HTMLSelectElement;
  const permSelect = document.getElementById("rbac-permission-select") as HTMLSelectElement;
  const staffSelect = document.getElementById("rbac-staff-select") as HTMLSelectElement;

  if (saveRbacBtn && roleSelect && pageSelect && permSelect && staffSelect) {
    saveRbacBtn.addEventListener("click", () => {
      const roleId = roleSelect.value;
      const pageId = pageSelect.value;
      const perm = permSelect.value as PermissionLevel;
      const staffId = staffSelect.value;

      const role = MuseumConfigStore.roles.find(r => r.id === roleId);
      if (role) {
        if (!role.pagePermissions) role.pagePermissions = {};
        if ((perm as string) === "NONE") {
          delete role.pagePermissions[pageId];
          role.allowedPages = role.allowedPages.filter(p => p !== pageId);
        } else {
          role.pagePermissions[pageId] = perm;
          if (!role.allowedPages.includes(pageId)) role.allowedPages.push(pageId);
        }

        if (staffId && !role.assignedStaffIds?.includes(staffId)) {
          if (!role.assignedStaffIds) role.assignedStaffIds = [];
          role.assignedStaffIds.push(staffId);
        }

        localStorage.setItem("museum_config_roles", JSON.stringify(MuseumConfigStore.roles));
        window.dispatchEvent(new CustomEvent("museum:config-updated"));
        showToast(`Đã cập nhật phân quyền: Vai trò [${role.name}] -> Trang [${pageId}] thành [${perm}]!`, "success");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  }

  // Section 6: Create New Custom Role
  const createRoleBtn = document.getElementById("btn-create-custom-role");
  const newRoleNameInput = document.getElementById("new-custom-role-name") as HTMLInputElement;
  const newRoleDescInput = document.getElementById("new-custom-role-desc") as HTMLInputElement;

  if (createRoleBtn && newRoleNameInput && newRoleDescInput) {
    createRoleBtn.addEventListener("click", () => {
      const name = newRoleNameInput.value.trim();
      const desc = newRoleDescInput.value.trim();
      if (!name) {
        showToast("Vui lòng nhập tên vai trò!", "warning");
        return;
      }

      MuseumConfigStore.addRole(name, desc, ["home", "artifact", "tour360"], { tour360: "FULL_ACCESS", artifact: "EDITOR" }, []);
      newRoleNameInput.value = "";
      newRoleDescInput.value = "";
      showToast(`Đã tạo vai trò mới: [${name}] thành công! Bạn có thể gán quyền chi tiết ngay bây giờ.`, "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Section 6: Quick Edit Role Buttons
  const quickEditBtns = document.querySelectorAll(".quick-edit-role-btn");
  quickEditBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rId = btn.getAttribute("data-role-id");
      if (rId && roleSelect) {
        roleSelect.value = rId;
        roleSelect.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

export const initAdminListeners = initAdminPageLogic;
