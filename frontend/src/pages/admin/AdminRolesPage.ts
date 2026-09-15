import { MuseumConfigStore, SYSTEM_PAGES, PermissionLevel } from "../../data/museumConfig";
import { Icons } from "../../components/Icons";
import { showToast } from "../../components/Toast";

export function renderAdminRolesPage(): string {
  const allRoles = MuseumConfigStore.roles;
  const allStaff = MuseumConfigStore.staff;

  return `
    <div class="page-viewport" style="max-width: 1400px; padding: 1.5rem 2rem;">
      <!-- Breadcrumb & Header -->
      <div style="margin-bottom: 1.75rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase;">
            CỔNG QUẢN TRỊ ADMIN / MA TRẬN PHÂN QUYỀN RBAC
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">•</span>
          <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 8px; background: rgba(34, 197, 94, 0.15); color: #16A34A; border-color: #22C55E;">
            Role-Based Access Control
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--color-text-main); margin: 0 0 0.25rem 0;">
          Phân Quyền Vai Trò & Ma Trận Phân Quyền Quản Trị
        </h1>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">
          Chỉ định quyền hạn truy cập theo từng trang nghiệp vụ cụ thể cho từng vai trò và nhân sự bảo tàng qua các danh sách Select chuẩn hóa.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; margin-bottom: 2rem; align-items: start;">
        <!-- Select-Based RBAC Assignment Form -->
        <div class="card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Thiết Lập Phân Quyền Vai Trò (Dạng Select)
            </h3>
            <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,197,94,0.15); color: #16A34A; border-color: #22C55E;">
              RBAC Engine
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Admin chọn Vai Trò, Trang Nghiệp Vụ, Mức Quyền Thao Tác và Gán Cán Bộ phụ trách hoàn toàn qua Dropdown Select, không cần gõ phím tự do.
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

            <!-- 4. Select Staff Member -->
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

            <button type="button" class="btn btn-primary" id="btn-save-rbac-assignment" style="width: 100%; padding: 0.75rem; justify-content: center;">
              ${Icons.check}
              <span>Lưu Phân Quyền & Cập Nhật Ma Trận RBAC</span>
            </button>
          </form>
        </div>

        <!-- Create New Role Box -->
        <div class="card" style="border-top: 4px solid var(--color-secondary);">
          <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.5rem;">
            Tạo Vai Trò Quản Trị Mới
          </h3>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
            Thêm vai trò chức danh mới vào hệ thống mà không cần lập trình viên can thiệp.
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
              <input type="text" id="new-custom-role-desc" class="lang-select" style="width: 100%; padding: 0.65rem;" placeholder="VD: Giám sát hiện vật và duyệt nội dung 360" />
            </div>

            <button type="button" class="btn btn-secondary" id="btn-create-custom-role" style="width: 100%; padding: 0.75rem; justify-content: center;">
              + Tạo Thêm Vai Trò Mới
            </button>
          </form>
        </div>
      </div>

      <!-- Comprehensive RBAC Matrix Table -->
      <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.1rem; color: var(--color-primary); margin: 0;">
              Bảng Tổng Hợp Ma Trận Phân Quyền (Role × Page × Permission)
            </h3>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 0.2rem 0 0 0;">
              Admin nhìn vào là thấy rõ từng vai trò được phép vào trang nào và mức độ quyền hạn là gì.
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
                    <td style="padding: 0.75rem; color: var(--color-text-muted); font-size: 0.8rem; max-width: 220px; vertical-align: top;">
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

      <!-- Staff Roster Table -->
      <div class="card">
        <h3 style="font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem;">
          Danh Sách Cán Bộ & Nhân Sự Bảo Tàng
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
  `;
}

export function initAdminRolesPage() {
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
