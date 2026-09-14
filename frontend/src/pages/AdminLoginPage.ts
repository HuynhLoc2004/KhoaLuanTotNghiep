import { AuthState } from "../data/auth";
import { Icons } from "../components/Icons";

export function renderAdminLoginPage(): string {
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at top, rgba(102,163,191,0.18) 0%, rgba(242,239,231,0.95) 100%); padding: 1.5rem;">
      <div class="card" style="max-width: 480px; width: 100%; border: 2px solid var(--color-primary); box-shadow: 0 20px 50px -10px rgba(51,104,160,0.25); padding: 2.5rem;">
        <!-- Emblem Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 58px; height: 58px; background: var(--color-primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; margin: 0 auto 1rem; box-shadow: 0 8px 20px -4px rgba(51,104,160,0.45);">
            ${Icons.shield}
          </div>
          <div class="brand-subtitle" style="letter-spacing: 0.12em; font-size: 0.8rem;">CỔNG QUẢN TRỊ NỘI BỘ</div>
          <h2 style="font-size: 1.5rem; color: var(--color-primary); margin-top: 0.35rem;">
            Bảo Tàng Lịch Sử TP.HCM
          </h2>
          <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-top: 0.25rem;">
            Hệ thống điều hành số hóa hiện vật & soát vé tự động
          </p>
        </div>

        <!-- Login Form -->
        <form id="admin-login-form" onsubmit="event.preventDefault();">
          <div style="margin-bottom: 1.2rem;">
            <label style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
              Tài khoản cán bộ:
            </label>
            <input type="email" id="admin-email" required class="lang-select" style="width: 100%; padding: 0.75rem; font-size: 0.92rem;" value="admin@museum.hcmc.vn" />
          </div>

          <div style="margin-bottom: 1.2rem;">
            <label style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
              Mật khẩu truy cập:
            </label>
            <input type="password" id="admin-password" required class="lang-select" style="width: 100%; padding: 0.75rem; font-size: 0.92rem;" value="••••••••" />
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
              Phân quyền đảm nhiệm:
            </label>
            <select id="admin-role-select" class="lang-select" style="width: 100%; padding: 0.75rem; font-size: 0.9rem;">
              <option value="curator">Curator - Giám tuyển & Duyệt 3D</option>
              <option value="staff">Gate Staff - Cán bộ Soát vé cửa kiểm soát</option>
              <option value="super_admin">Quản trị viên toàn quyền hệ thống</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-submit-admin-login" style="width: 100%; padding: 0.85rem; font-size: 0.95rem;">
            ${Icons.shield}
            <span>Đăng Nhập Cổng Điều Hành Admin</span>
          </button>
        </form>

        <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid var(--color-card-border); padding-top: 1.25rem;">
          <a href="#home" style="font-size: 0.85rem; font-weight: 600; color: var(--color-primary); text-decoration: none;">
            ← Quay lại Cổng Du Khách Tham Quan
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initAdminLoginPageLogic() {
  const form = document.getElementById("admin-login-form");
  const roleSelect = document.getElementById("admin-role-select") as HTMLSelectElement;

  if (form) {
    form.addEventListener("submit", () => {
      const selectedRole = (roleSelect?.value as any) || "curator";
      AuthState.loginAdmin(selectedRole);
      alert(`Đăng nhập thành công với vai trò: ${AuthState.admin.roleTitle}`);
      window.location.hash = "#admin";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
export const initAdminLoginListeners = initAdminLoginPageLogic;
