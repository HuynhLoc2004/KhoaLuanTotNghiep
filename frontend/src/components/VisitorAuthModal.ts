import { AuthState } from "../data/auth";
import { Icons } from "./Icons";
import { showToast } from "./Toast";

export function renderVisitorAuthModal(): string {
  return `
    <div id="visitor-auth-modal" style="display: none; position: fixed; inset: 0; background: rgba(13,30,45,0.65); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center; padding: 1.5rem;">
      <div class="card" style="max-width: 440px; width: 100%; border: 2px solid var(--color-primary); box-shadow: 0 24px 60px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-xs); background: var(--color-surface); color: var(--color-primary); display: flex; align-items: center; justify-content: center;">
              ${Icons.user}
            </div>
            <h3 style="font-size: 1.15rem; color: var(--color-primary);">Đăng Nhập Du Khách</h3>
          </div>
          <button id="close-visitor-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted);">&times;</button>
        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
          Đăng nhập không cần mật khẩu bằng Số điện thoại để đồng bộ vé tham quan và bộ sưu tập tem di sản của bạn.
        </p>

        <!-- Step 1: Input Phone -->
        <div id="otp-step-1">
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem;">
              Số điện thoại di động:
            </label>
            <input type="tel" id="visitor-phone-input" class="lang-select" style="width: 100%; padding: 0.75rem; font-size: 0.95rem;" placeholder="0908 123 456" value="0908 123 456" />
          </div>

          <button class="btn btn-primary" id="send-otp-btn" style="width: 100%; padding: 0.85rem;">
            <span>Nhận Mã OTP 6 Số Qua SMS</span>
            ${Icons.arrowRight}
          </button>
        </div>

        <!-- Step 2: Input OTP -->
        <div id="otp-step-2" style="display: none;">
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem;">
              Nhập mã xác thực 6 số gửi về điện thoại:
            </label>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 0.75rem;">
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="8" />
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="9" />
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="1" />
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="4" />
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="2" />
              <input type="text" maxlength="1" class="mono otp-box" style="width: 44px; height: 50px; text-align: center; font-size: 1.4rem; font-weight: 800; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); background: var(--color-canvas);" value="0" />
            </div>
            <div style="font-size: 0.78rem; color: var(--color-secondary); text-align: center; font-weight: 600;">
              Mã demo điền sẵn • Bấm xác nhận ngay
            </div>
          </div>

          <button class="btn btn-primary" id="verify-otp-btn" style="width: 100%; padding: 0.85rem;">
            ${Icons.check}
            <span>Xác Nhận & Mở Hồ Sơ Di Sản</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initVisitorAuthModalLogic() {
  const modal = document.getElementById("visitor-auth-modal");
  const closeBtn = document.getElementById("close-visitor-modal");
  const sendOtpBtn = document.getElementById("send-otp-btn");
  const verifyOtpBtn = document.getElementById("verify-otp-btn");
  const step1 = document.getElementById("otp-step-1");
  const step2 = document.getElementById("otp-step-2");
  const phoneInput = document.getElementById("visitor-phone-input") as HTMLInputElement;

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (sendOtpBtn && step1 && step2) {
    sendOtpBtn.addEventListener("click", () => {
      sendOtpBtn.textContent = "Đang gửi mã...";
      setTimeout(() => {
        step1.style.display = "none";
        step2.style.display = "block";
      }, 400);
    });
  }

  if (verifyOtpBtn && modal) {
    verifyOtpBtn.addEventListener("click", () => {
      const phone = phoneInput ? phoneInput.value : "0908 123 456";
      AuthState.loginVisitor(phone, "Nguyễn Văn An");
      modal.style.display = "none";
      showToast("Đăng nhập thành công! Chào mừng Nguyễn Văn An.", "success");
      window.location.hash = "#profile";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}

export const initVisitorAuthListeners = initVisitorAuthModalLogic;
