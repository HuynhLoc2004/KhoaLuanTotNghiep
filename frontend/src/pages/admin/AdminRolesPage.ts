import { Icons } from "../../components/Icons";
import { showToast } from "../../components/Toast";
import { AuthState } from "../../data/auth";

export interface PageRoleItem {
  id: string;
  pageId: string;
  name: string;
  description: string;
  category: "GATE_OPS" | "CMS" | "3DGS_TOUR" | "MAP_NAV" | "ANALYTICS" | "SYSTEM" | "APPROVAL";
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve?: boolean;
  };
  assignedUsers: string[];
}

// 11 PAGE ROLES — 1 PAGE LÀ 1 ROLE RIÊNG
export const DEFAULT_PAGE_ROLES: PageRoleItem[] = [
  {
    id: "ROLE_SCAN",
    pageId: "admin-scan",
    name: "Quản Lý Soát Vé Cổng",
    description: "Soát vé quang học bằng camera/máy quét dưới 100ms, xem lịch sử quét thẻ",
    category: "GATE_OPS",
    permissions: { view: true, create: true, edit: false, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ARTIFACTS",
    pageId: "admin-artifacts",
    name: "Quản Lý Kho Hiện Vật",
    description: "Biên soạn bảng chú thích, cập nhật niên đại, tải ảnh 8K và mô hình 3D cổ vật",
    category: "CMS",
    permissions: { view: true, create: true, edit: true, delete: true, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn", "long.curator@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ROOMS",
    pageId: "admin-rooms",
    name: "Quản Lý Gian Sảnh 360°",
    description: "Cấu hình ảnh photosphere 360, độ cao trần và ánh sáng sảnh trưng bày",
    category: "3DGS_TOUR",
    permissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_TOUR360",
    pageId: "admin-tour360",
    name: "Quản Lý Ghim Cổ Vật Tour 360°",
    description: "Định vị điểm ghim tương tác 3D trên tủ kính hiện vật trong không gian 360",
    category: "3DGS_TOUR",
    permissions: { view: true, create: true, edit: true, delete: true, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_NODES",
    pageId: "admin-nodes",
    name: "Quản Lý Walk Nodes 360°",
    description: "Thiết lập các vòng tròn bước chân di chuyển lướt mượt mà trên sàn nhà",
    category: "3DGS_TOUR",
    permissions: { view: true, create: true, edit: true, delete: true, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_BUILDINGS",
    pageId: "admin-buildings",
    name: "Quản Lý Tòa Nhà Kiến Trúc",
    description: "Quản lý danh mục tòa nhà kiến trúc bảo tàng và phân khu sảnh",
    category: "MAP_NAV",
    permissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_MAP",
    pageId: "admin-map",
    name: "Sơ Đồ Mặt Bằng & Dẫn Đường",
    description: "Chỉnh sửa tọa độ phòng và các điểm POI trên bản đồ sơ đồ tầng",
    category: "MAP_NAV",
    permissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ANALYTICS",
    pageId: "admin-analytics",
    name: "Báo Cáo Thống Kê Toàn Diện",
    description: "Xem biểu đồ lưu lượng khách, số lượt quét vé, tương tác 3D và xuất báo cáo",
    category: "ANALYTICS",
    permissions: { view: true, create: false, edit: false, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_SETTINGS",
    pageId: "admin-settings",
    name: "Cấu Hình Hệ Thống & Toggles",
    description: "Tùy biến thương hiệu bảo tàng, khẩu hiệu, và bật/tắt Feature Toggles",
    category: "SYSTEM",
    permissions: { view: true, create: false, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ROLES",
    pageId: "admin-roles",
    name: "Phân Quyền Vai Trò (RBAC)",
    description: "Thiết lập quyền hạn 1 Page = 1 Role và phân bổ cán bộ đảm nhiệm",
    category: "SYSTEM",
    permissions: { view: true, create: true, edit: true, delete: true, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_APPROVALS",
    pageId: "admin-approvals",
    name: "Duyệt Yêu Cầu Thêm Mới",
    description: "Thẩm định và phê duyệt các yêu cầu thêm sảnh, hiện vật, tòa nhà từ cán bộ",
    category: "APPROVAL",
    permissions: { view: true, create: false, edit: false, delete: false, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn", "long.curator@museum.hcmc.vn"]
  }
];

// Local store for roles in UI
function getLocalRoles(): PageRoleItem[] {
  try {
    const saved = localStorage.getItem("museum_page_roles");
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return DEFAULT_PAGE_ROLES;
}

function saveLocalRoles(roles: PageRoleItem[]) {
  localStorage.setItem("museum_page_roles", JSON.stringify(roles));
}

export function renderAdminRolesPage(): string {
  const roles = getLocalRoles();

  return `
    <div class="page-viewport animate-fade-in" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.74rem; font-weight: 800; color: #d4af37; letter-spacing: 0.08em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / PHÂN QUYỀN ĐỘNG
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 10px; background: rgba(212,175,55,0.15); color: #d4af37; border-color: #d4af37;">
            1 PAGE = 1 ROLE RIÊNG
          </span>
        </div>
        <h1 style="font-family: 'Cinzel', serif; font-size: 2rem; font-weight: 800; color: var(--color-primary); margin: 0 0 0.4rem 0;">
          Phân Quyền Vai Trò Từng Trang (Granular RBAC)
        </h1>
        <p style="font-size: 0.92rem; color: var(--color-text-muted); margin: 0; line-height: 1.6; max-width: 1000px;">
          Chức vụ ở Dashboard <strong>không fix cứng</strong>: Mỗi trang nghiệp vụ là 1 Role độc lập. Bạn có thể tích chọn các quyền chi tiết (<strong>Xem, Thêm, Sửa, Xóa, Duyệt</strong>) và gán Email cán bộ. Khi đăng nhập vào Dashboard, cán bộ <strong>chỉ nhìn thấy đúng các trang mà họ được phân công</strong>!
        </p>
      </div>

      <!-- Instruction Highlight Box -->
      <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(15,14,14,0.3)); border: 1px solid rgba(212,175,55,0.35); border-radius: var(--radius-md); padding: 1.2rem 1.6rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: #d4af37; color: #0f0e0e; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
          🛡️
        </div>
        <div style="font-size: 0.88rem; color: var(--color-text-main); line-height: 1.5;">
          <strong style="color: #d4af37;">Quy Tắc Vận Hành:</strong> Mọi tài khoản du khách khi đăng nhập bằng OTP Email đều là <strong>User bình thường</strong>. Chỉ khi bạn (Admin) gán họ vào Role của trang nào bên dưới, họ mới được cấp quyền truy cập Dashboard và <strong>chỉ xuất hiện các tab được phân công trên Sidebar</strong>.
        </div>
      </div>

      <!-- 11 PAGE ROLES GRID -->
      <div class="page-roles-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${roles.map((role, idx) => `
          <div class="card role-card" data-role-id="${role.id}" style="border: 1px solid var(--color-border); border-left: 5px solid ${getCategoryColor(role.category)}; border-radius: var(--radius-md); padding: 1.6rem; background: var(--color-surface); box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.2rem;">
              <!-- Left: Title & Page ID -->
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem;">
                  <span style="font-size: 0.72rem; font-weight: 800; background: rgba(0,0,0,0.25); padding: 0.2rem 0.6rem; border-radius: 4px; color: ${getCategoryColor(role.category)}; border: 1px solid var(--color-border);">
                    ${role.category}
                  </span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted);">
                    Mã Role: <strong style="color: #d4af37;">${role.id}</strong>
                  </span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted);">
                    Trang: <code style="color: var(--color-primary); background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">#${role.pageId}</code>
                  </span>
                </div>
                <h3 style="font-family: 'Cinzel', serif; font-size: 1.3rem; font-weight: 800; color: var(--color-primary); margin: 0 0 0.3rem 0;">
                  ${idx + 1}. ${role.name}
                </h3>
                <p style="font-size: 0.86rem; color: var(--color-text-muted); margin: 0;">
                  ${role.description}
                </p>
              </div>

              <!-- Right: Quick Status Badge -->
              <div>
                <span class="badge-pill" style="font-size: 0.78rem; padding: 4px 12px; background: rgba(212,175,55,0.12); color: #d4af37; border-color: rgba(212,175,55,0.3); font-weight: 700;">
                  ${role.assignedUsers.length} Cán Bộ Được Cấp
                </span>
              </div>
            </div>

            <!-- PERMISSION CHECKBOXES (XEM, THÊM, SỬA, XÓA, DUYỆT) -->
            <div style="background: rgba(0,0,0,0.12); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 1rem 1.4rem; margin-bottom: 1.4rem;">
              <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
                <span>✦ Các Quyền Hạn Cho Phép Trong Trang Này:</span>
                <span style="font-size: 0.72rem; color: #d4af37;">(Tích chọn để bật/tắt quyền)</span>
              </div>

              <div style="display: flex; gap: 1.8rem; flex-wrap: wrap;" class="perms-checkbox-group" data-role-id="${role.id}">
                <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); cursor: pointer;">
                  <input type="checkbox" class="chk-perm" data-perm="view" ${role.permissions.view ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #d4af37;" />
                  <span>👁️ Xem Trang (View)</span>
                </label>

                <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); cursor: pointer;">
                  <input type="checkbox" class="chk-perm" data-perm="create" ${role.permissions.create ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #d4af37;" />
                  <span>➕ Thêm Mới (Create)</span>
                </label>

                <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); cursor: pointer;">
                  <input type="checkbox" class="chk-perm" data-perm="edit" ${role.permissions.edit ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #d4af37;" />
                  <span>✏️ Chỉnh Sửa (Edit)</span>
                </label>

                <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); cursor: pointer;">
                  <input type="checkbox" class="chk-perm" data-perm="delete" ${role.permissions.delete ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #dc2626;" />
                  <span>🗑️ Xóa Bỏ (Delete)</span>
                </label>

                <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); cursor: pointer;">
                  <input type="checkbox" class="chk-perm" data-perm="approve" ${role.permissions.approve ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: #059669;" />
                  <span>🛡️ Thẩm Định / Phê Duyệt (Approve)</span>
                </label>
              </div>
            </div>

            <!-- ASSIGNED USERS & ADD USER FORM -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; align-items: start;">
              <!-- Assigned Users List -->
              <div>
                <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                  Danh Sách Cán Bộ Được Cấp Trang Này (${role.assignedUsers.length}):
                </div>
                ${role.assignedUsers.length === 0 ? `
                  <div style="font-size: 0.82rem; color: var(--color-text-muted); font-style: italic;">
                    Chưa có cán bộ nào được gán vào trang này.
                  </div>
                ` : `
                  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${role.assignedUsers.map(uEmail => `
                      <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; background: rgba(0,0,0,0.25); border: 1px solid var(--color-border); border-radius: 999px; font-size: 0.82rem; color: var(--color-text-main);">
                        <span>👤 ${uEmail}</span>
                        ${uEmail !== "admin@museum.hcmc.vn" ? `
                          <button class="btn-remove-user-role" data-role-id="${role.id}" data-email="${uEmail}" title="Gỡ quyền trang này" style="background: none; border: none; color: #ef4444; font-size: 0.9rem; cursor: pointer; padding: 0; line-height: 1;">
                            &times;
                          </button>
                        ` : ''}
                      </span>
                    `).join("")}
                  </div>
                `}
              </div>

              <!-- Assign New User Form -->
              <div style="background: rgba(0,0,0,0.08); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.9rem;">
                <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; color: var(--color-primary); margin-bottom: 0.4rem;">
                  + Cấp Quyền Trang Này Cho User:
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="email" class="lang-select input-assign-email" data-role-id="${role.id}" placeholder="nhap.email@museum.vn" style="flex: 1; padding: 0.55rem 0.7rem; font-size: 0.85rem;" />
                  <button class="btn btn-primary btn-assign-role-user" data-role-id="${role.id}" style="padding: 0.55rem 1rem; font-size: 0.84rem; font-weight: 800; flex-shrink: 0;">
                    ${Icons.plus}
                    <span>Gán Quyền</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case "GATE_OPS": return "#0284c7";
    case "CMS": return "#d97706";
    case "3DGS_TOUR": return "#7c3aed";
    case "MAP_NAV": return "#059669";
    case "ANALYTICS": return "#0891b2";
    case "APPROVAL": return "#dc2626";
    case "SYSTEM": return "#b45309";
    default: return "#d4af37";
  }
}

// Listeners and Interactive Logic
export function initAdminRolesPageLogic() {
  const roles = getLocalRoles();

  // 1. Handle Checkbox Permission Change
  document.querySelectorAll(".chk-perm").forEach(chk => {
    chk.addEventListener("change", async (e) => {
      const target = e.target as HTMLInputElement;
      const permKey = target.getAttribute("data-perm") as "view" | "create" | "edit" | "delete" | "approve";
      const group = target.closest(".perms-checkbox-group");
      const roleId = group?.getAttribute("data-role-id");

      if (!roleId || !permKey) return;

      const role = roles.find(r => r.id === roleId);
      if (role) {
        role.permissions[permKey] = target.checked;
        saveLocalRoles(roles);

        // Sync to backend if available
        try {
          await fetch("http://localhost:3000/api/v1/auth/roles/update-permissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId, permissions: role.permissions })
          });
        } catch (_) {}

        showToast(`Đã cập nhật quyền [${permKey.toUpperCase()}] cho trang ${role.name}!`, "success");
      }
    });
  });

  // 2. Handle Assign User to Role
  document.querySelectorAll(".btn-assign-role-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const roleId = btn.getAttribute("data-role-id");
      if (!roleId) return;

      const input = document.querySelector(`.input-assign-email[data-role-id="${roleId}"]`) as HTMLInputElement;
      const email = input?.value.trim().toLowerCase();

      if (!email || !email.includes("@")) {
        showToast("Vui lòng nhập địa chỉ email hợp lệ để gán quyền!", "warning");
        input?.focus();
        return;
      }

      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      if (role.assignedUsers.map(e => e.toLowerCase()).includes(email)) {
        showToast(`Email ${email} đã có quyền quản lý trang này!`, "info");
        return;
      }

      role.assignedUsers.push(email);
      saveLocalRoles(roles);

      // Sync to backend
      try {
        await fetch("http://localhost:3000/api/v1/auth/roles/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, roleId, action: "assign" })
        });
      } catch (_) {}

      showToast(`Đã cấp quyền ${role.name} (#${role.pageId}) cho ${email}! Khi đăng nhập vào Dashboard, cán bộ chỉ thấy trang này.`, "success");

      // Re-render UI
      renderAdminRolesPageContainer();
    });
  });

  // 3. Handle Remove User from Role
  document.querySelectorAll(".btn-remove-user-role").forEach(btn => {
    btn.addEventListener("click", async () => {
      const roleId = btn.getAttribute("data-role-id");
      const email = btn.getAttribute("data-email");

      if (!roleId || !email) return;

      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      role.assignedUsers = role.assignedUsers.filter(e => e.toLowerCase() !== email.toLowerCase());
      saveLocalRoles(roles);

      // Sync to backend
      try {
        await fetch("http://localhost:3000/api/v1/auth/roles/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: email, roleId, action: "unassign" })
        });
      } catch (_) {}

      showToast(`Đã gỡ quyền ${role.name} của cán bộ ${email}!`, "info");

      renderAdminRolesPageContainer();
    });
  });
}

function renderAdminRolesPageContainer() {
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = renderAdminRolesPage();
    initAdminRolesPageLogic();
  }
}

export const initAdminRolesPage = initAdminRolesPageLogic;
