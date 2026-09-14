import { AuthState } from "../data/auth";
import { Icons } from "../components/Icons";

export function renderUserProfilePage(): string {
  const visitor = AuthState.visitor;

  return `
    <div class="page-viewport">
      <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="brand-subtitle">HỒ SƠ KHÁCH THAM QUAN</div>
          <h1 style="font-size: 2rem; color: var(--color-primary); margin-top: 0.2rem;">
            Hộ Chiếu Di Sản & Vé Của Tôi
          </h1>
        </div>

        <button class="btn btn-outline" id="btn-visitor-logout" style="font-size: 0.82rem; padding: 0.5rem 0.95rem;">
          ${Icons.logout}
          <span>Đăng Xuất Tài Khoản</span>
        </button>
      </div>

      <!-- Main Profile Workspace -->
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; align-items: start;">
        <!-- Left Column: Boarding Pass Digital Ticket -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Boarding Pass Card -->
          <div class="card" style="padding: 2rem; background: linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(200,223,219,0.3) 100%); border-top: 5px solid var(--color-primary); position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--color-card-border); padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
              <div>
                <span class="badge-pill" style="font-size: 0.72rem;">THẺ THAM QUAN ĐIỆN TỬ</span>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-primary); margin-top: 0.35rem;">
                  Bảo Tàng Lịch Sử TP.HCM
                </div>
              </div>
              <div style="text-align: right;">
                <span class="mono" style="font-weight: 800; font-size: 1rem; color: var(--color-primary);">
                  ${visitor.ticketCode}
                </span>
                <div style="font-size: 0.75rem; color: #16A34A; font-weight: 700;">HỢP LỆ</div>
              </div>
            </div>

            <!-- Ticket Details Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.75rem;">
              <div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Du Khách</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-main);">${visitor.name}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Số Điện Thoại</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-text-main);">${visitor.phone}</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Loại Vé</div>
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-secondary);">Học Sinh / Đoàn</div>
              </div>
            </div>

            <!-- QR Verification Block -->
            <div style="display: flex; gap: 1.5rem; align-items: center; background: rgba(255, 255, 255, 0.9); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-card-border);">
              <div style="width: 80px; height: 80px; background: #fff; padding: 4px; border: 1px solid var(--color-primary); border-radius: var(--radius-xs);">
                <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-primary);">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.2rem;">
                  Đưa mã này qua máy quét tự động
                </div>
                <div style="font-size: 0.76rem; color: var(--color-text-muted); line-height: 1.4;">
                  Cổng kiểm soát quang học nhận diện trong &lt; 100ms. Thẻ có giá trị trong ngày tham quan.
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem;">
              <button class="btn btn-outline" onclick="window.print()" style="flex: 1; font-size: 0.82rem; padding: 0.55rem;">
                In Thẻ Vé
              </button>
              <a href="#admin" class="btn btn-primary" style="flex: 1; font-size: 0.82rem; padding: 0.55rem;">
                Thử Nghiệm Cổng Soát Vé →
              </a>
            </div>
          </div>
        </div>

        <!-- Right Column: Passport Badges & Stats -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.user}
              <span>Thành Tựu & Tem Sưu Tập</span>
            </h3>

            <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem;">
              <div>
                <div class="mono" style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary);">${visitor.exp}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Điểm tri thức EXP</div>
              </div>
              <div>
                <div class="mono" style="font-size: 1.5rem; font-weight: 800; color: var(--color-secondary);">${visitor.passportStamps.length}/6</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Tem cổ vật</div>
              </div>
              <div>
                <div class="mono" style="font-size: 1.5rem; font-weight: 800; color: #16A34A;">Cấp 2</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Nhà Thám Hiểm</div>
              </div>
            </div>

            <!-- List of Unlocked Stamps -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${visitor.passportStamps.map(st => `
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem; border-radius: var(--radius-sm); background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border);">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">
                    ${Icons.check}
                  </div>
                  <div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-main);">${st}</div>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">Đã hoàn thành câu hỏi trắc nghiệm</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initUserProfilePageLogic() {
  const logoutBtn = document.getElementById("btn-visitor-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      AuthState.logoutVisitor();
      alert("Đã đăng xuất tài khoản du khách.");
      window.location.hash = "#home";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
export const initUserProfileListeners = initUserProfilePageLogic;
