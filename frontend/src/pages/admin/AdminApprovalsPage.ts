import { PendingApprovalStore, PendingRequest, MuseumConfigStore } from "../../data/museumConfig";
import { AuthState } from "../../data/auth";
import { showToast } from "../../components/Toast";

const ACTION_LABELS: Record<string, string> = {
  ADD_ROOM360: "Thêm Gian Sảnh 360°",
  ADD_WALK_NODE: "Thêm Walk Node",
  ADD_ARTIFACT: "Thêm Hiện Vật",
  ADD_SHOWCASE_PIN: "Ghim Cổ Vật",
  ADD_ANNOUNCEMENT: "Thêm Thông Báo",
  ADD_ROLE: "Tạo Vai Trò Mới",
  ADD_BUILDING: "Thêm Tòa Nhà",
  ADD_MAP_POINT: "Thêm Điểm Bản Đồ",
};

const STATUS_BADGE: Record<string, string> = {
  pending: `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(245,158,11,0.15);color:#d97706;border:1px solid #fbbf24;"><span style="width:7px;height:7px;border-radius:50%;background:#d97706;display:inline-block;"></span> CHỜ DUYỆT</span>`,
  approved: `<span style="font-size:0.72rem;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(34,197,94,0.15);color:#16a34a;border:1px solid #22c55e;">✓ ĐÃ DUYỆT</span>`,
  rejected: `<span style="font-size:0.72rem;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(239,68,68,0.12);color:#dc2626;border:1px solid #ef4444;">✕ TỪ CHỐI</span>`,
};

function renderPayloadTable(payload: Record<string, unknown>): string {
  const entries = Object.entries(payload);
  if (!entries.length) return `<span style="color:var(--color-text-muted);font-size:0.8rem;">Không có dữ liệu bổ sung.</span>`;
  return `<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
    ${entries.map(([k, v]) => `
      <tr>
        <td style="padding:3px 8px 3px 0;color:var(--color-text-muted);font-weight:600;white-space:nowrap;">${k}:</td>
        <td style="padding:3px 0;color:var(--color-text-main);word-break:break-word;">${String(v)}</td>
      </tr>
    `).join("")}
  </table>`;
}

function renderRow(req: PendingRequest, canApprove: boolean): string {
  const isPending = req.status === "pending";
  return `
    <tr data-req-id="${req.id}" style="border-bottom:1px solid var(--color-border);vertical-align:top;${isPending ? "" : "opacity:0.6;"}">
      <td style="padding:0.9rem 0.85rem;">
        <div style="font-size:0.7rem;font-weight:800;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">${ACTION_LABELS[req.actionType] ?? req.actionType}</div>
        <div style="font-size:0.9rem;font-weight:700;color:var(--color-text-main);">${req.label}</div>
      </td>
      <td style="padding:0.9rem 0.85rem;">
        <div style="font-size:0.85rem;font-weight:700;color:var(--color-secondary);">${req.submittedBy}</div>
        <div style="font-size:0.75rem;color:var(--color-text-muted);">${req.submittedAt}</div>
      </td>
      <td style="padding:0.9rem 0.85rem;max-width:240px;">
        <details>
          <summary style="font-size:0.8rem;color:var(--color-primary);font-weight:600;cursor:pointer;list-style:none;">Chi tiết ▾</summary>
          <div style="margin-top:0.4rem;padding:0.5rem;background:var(--color-surface);border-radius:var(--radius-xs);border:1px solid var(--color-border);">
            ${renderPayloadTable(req.payload)}
          </div>
        </details>
      </td>
      <td style="padding:0.9rem 0.85rem;text-align:center;">${STATUS_BADGE[req.status] ?? ""}</td>
      <td style="padding:0.9rem 0.85rem;text-align:center;">
        ${isPending && canApprove ? `
          <div style="display:flex;gap:0.4rem;justify-content:center;">
            <button class="btn btn-primary approve-btn" data-id="${req.id}" style="font-size:0.78rem;padding:0.3rem 0.65rem;">✓ Duyệt</button>
            <button class="btn btn-danger reject-btn" data-id="${req.id}" style="font-size:0.78rem;padding:0.3rem 0.65rem;">✕ Từ chối</button>
          </div>
        ` : isPending ? `<span style="font-size:0.78rem;color:var(--color-text-muted);">Cần quyền GĐ</span>` : `<span style="font-size:0.78rem;color:var(--color-text-muted);">—</span>`}
      </td>
    </tr>
  `;
}

export function renderAdminApprovalsPage(): string {
  const canApprove = AuthState.canApprove();
  const all = PendingApprovalStore.getAll();
  const pending = PendingApprovalStore.getPending();
  const approved = all.filter(r => r.status === "approved");
  const rejected = all.filter(r => r.status === "rejected");
  const history = all.filter(r => r.status !== "pending");

  return `
    <div class="page-viewport" style="max-width:1400px;padding:1.5rem 2rem;">
      <!-- Header -->
      <div style="margin-bottom:1.75rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
        <div>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
            <span style="font-size:0.72rem;font-weight:700;color:var(--color-primary);letter-spacing:0.05em;text-transform:uppercase;">
              CỔNG QUẢN TRỊ ADMIN / DUYỆT YÊU CẦU HỆ THỐNG
            </span>
            ${canApprove
      ? `<span class="badge-pill" style="font-size:0.7rem;padding:1px 8px;background:rgba(34,197,94,0.15);color:#16a34a;border-color:#22c55e;">🔑 Quyền Giám Đốc</span>`
      : `<span class="badge-pill" style="font-size:0.7rem;padding:1px 8px;background:rgba(245,158,11,0.15);color:#d97706;border-color:#fbbf24;">Xem Lịch Sử</span>`}
          </div>
          <h1 style="font-size:1.75rem;font-weight:800;color:var(--color-text-main);margin:0 0 0.25rem 0;">
            Hệ Thống Phê Duyệt Yêu Cầu Thêm Mới
          </h1>
          <p style="font-size:0.85rem;color:var(--color-text-muted);margin:0;">
            ${canApprove
      ? "Bạn có quyền Giám Đốc — phê duyệt hoặc từ chối yêu cầu của nhân sự trước khi dữ liệu được lưu vào hệ thống."
      : "Bạn không có quyền duyệt. Khi bạn gửi yêu cầu thêm mới, hệ thống sẽ chờ Admin Giám Đốc phê duyệt."}
          </p>
        </div>
        ${pending.length > 0 && canApprove ? `
          <button class="btn btn-primary" id="btn-approve-all" style="display:flex;align-items:center;gap:0.5rem;font-weight:700;padding:0.7rem 1.4rem;">
            ✓ Duyệt Tất Cả (${pending.length})
          </button>
        ` : ""}
      </div>

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem;">
        <div class="card" style="padding:1rem 1.25rem;border-top:3px solid #d97706;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.25rem;">Chờ Duyệt</div>
          <div style="font-size:2.2rem;font-weight:900;color:#d97706;">${pending.length}</div>
        </div>
        <div class="card" style="padding:1rem 1.25rem;border-top:3px solid #16a34a;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.25rem;">Đã Duyệt</div>
          <div style="font-size:2.2rem;font-weight:900;color:#16a34a;">${approved.length}</div>
        </div>
        <div class="card" style="padding:1rem 1.25rem;border-top:3px solid #dc2626;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.25rem;">Từ Chối</div>
          <div style="font-size:2.2rem;font-weight:900;color:#dc2626;">${rejected.length}</div>
        </div>
        <div class="card" style="padding:1rem 1.25rem;border-top:3px solid var(--color-primary);">
          <div style="font-size:0.7rem;font-weight:700;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.25rem;">Tổng Cộng</div>
          <div style="font-size:2.2rem;font-weight:900;color:var(--color-primary);">${all.length}</div>
        </div>
      </div>

      <!-- Pending Requests Table -->
      <div class="card" style="margin-bottom:1.5rem;border-top:4px solid #d97706;">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
          <h3 style="font-size:1.1rem;font-weight:800;color:var(--color-text-main);margin:0;">⏳ Yêu Cầu Đang Chờ Phê Duyệt</h3>
          ${pending.length > 0 ? `<span style="font-size:0.78rem;font-weight:800;padding:2px 10px;border-radius:999px;background:#d97706;color:white;">${pending.length}</span>` : ""}
        </div>
        ${pending.length === 0 ? `
          <div style="padding:2.5rem;text-align:center;color:var(--color-text-muted);">
            <div style="font-size:2.5rem;margin-bottom:0.5rem;">✅</div>
            <div style="font-weight:700;font-size:0.95rem;">Hàng đợi trống — không có yêu cầu nào đang chờ duyệt</div>
          </div>
        ` : `
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;text-align:left;">
              <thead>
                <tr style="background:rgba(var(--color-surface-rgb),0.7);border-bottom:2px solid var(--color-border);color:var(--color-text-muted);">
                  <th style="padding:0.75rem 0.85rem;">LOẠI THAO TÁC</th>
                  <th style="padding:0.75rem 0.85rem;">NGƯỜI YÊU CẦU</th>
                  <th style="padding:0.75rem 0.85rem;">DỮ LIỆU GỬI KÈM</th>
                  <th style="padding:0.75rem 0.85rem;text-align:center;">TRẠNG THÁI</th>
                  <th style="padding:0.75rem 0.85rem;text-align:center;">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>${pending.map(r => renderRow(r, canApprove)).join("")}</tbody>
            </table>
          </div>
        `}
      </div>

      <!-- History Table -->
      ${history.length > 0 ? `
        <div class="card">
          <h3 style="font-size:1.1rem;font-weight:800;color:var(--color-text-main);margin:0 0 1rem 0;">📋 Lịch Sử Đã Xử Lý</h3>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;text-align:left;">
              <thead>
                <tr style="background:rgba(var(--color-surface-rgb),0.7);border-bottom:2px solid var(--color-border);color:var(--color-text-muted);">
                  <th style="padding:0.75rem 0.85rem;">LOẠI THAO TÁC</th>
                  <th style="padding:0.75rem 0.85rem;">NGƯỜI YÊU CẦU</th>
                  <th style="padding:0.75rem 0.85rem;">DỮ LIỆU GỬI KÈM</th>
                  <th style="padding:0.75rem 0.85rem;text-align:center;">TRẠNG THÁI</th>
                  <th style="padding:0.75rem 0.85rem;text-align:center;"></th>
                </tr>
              </thead>
              <tbody>${history.map(r => renderRow(r, false)).join("")}</tbody>
            </table>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/** Execute the approved action into the real store */
function executeApprovedAction(req: PendingRequest) {
  const p = req.payload;
  switch (req.actionType) {
    case "ADD_ROOM360":
      MuseumConfigStore.addRoom360(
        String(p["name"] ?? ""),
        String(p["eraTitle"] ?? ""),
        String(p["description"] ?? "")
      );
      break;
    case "ADD_WALK_NODE":
      MuseumConfigStore.addWalkNode(String(p["roomId"] ?? ""), String(p["name"] ?? ""));
      break;
    case "ADD_ANNOUNCEMENT":
      MuseumConfigStore.addAnnouncement(
        String(p["content"] ?? ""),
        (p["priority"] as "normal" | "urgent") ?? "normal"
      );
      break;
    case "ADD_SHOWCASE_PIN":
      MuseumConfigStore.addShowcasePin(
        String(p["roomId"] ?? ""),
        String(p["artifactId"] ?? ""),
        String(p["title"] ?? ""),
        String(p["era"] ?? ""),
        String(p["roomNodeId"] ?? "")
      );
      break;
    default:
      // Artifact / building / map — payload stored, no direct store fn yet
      break;
  }
}

export function initAdminApprovalsPage() {
  const canApprove = AuthState.canApprove();

  // Approve all pending
  const approveAllBtn = document.getElementById("btn-approve-all");
  if (approveAllBtn && canApprove) {
    approveAllBtn.addEventListener("click", () => {
      const pending = PendingApprovalStore.getPending();
      let count = 0;
      pending.forEach(req => {
        const approved = PendingApprovalStore.approve(req.id);
        if (approved) { executeApprovedAction(approved); count++; }
      });
      showToast(`✅ Đã phê duyệt và áp dụng ${count} yêu cầu vào hệ thống!`, "success");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }

  // Individual approve
  document.querySelectorAll<HTMLButtonElement>(".approve-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset["id"];
      if (!id) return;
      const approved = PendingApprovalStore.approve(id);
      if (approved) {
        executeApprovedAction(approved);
        showToast(`✅ Đã phê duyệt: "${approved.label}"`, "success");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });

  // Individual reject
  document.querySelectorAll<HTMLButtonElement>(".reject-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset["id"];
      if (!id) return;
      const req = PendingApprovalStore.getAll().find(r => r.id === id);
      if (PendingApprovalStore.reject(id)) {
        showToast(`❌ Đã từ chối: "${req?.label ?? id}"`, "warning");
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    });
  });
}
