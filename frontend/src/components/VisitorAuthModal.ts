import { AuthState } from "../data/auth";
import { Icons } from "./Icons";
import { showToast } from "./Toast";
import { t } from "../data/i18n";

let pendingEmail = "";

export function renderVisitorAuthModal(): string {
  return `
    <div id="visitor-auth-modal" style="display: none; position: fixed; inset: 0; background: rgba(13,30,45,0.75); backdrop-filter: blur(8px); z-index: 1000; align-items: center; justify-content: center; padding: 1.5rem;">
      <div class="card animate-fade-in" style="max-width: 460px; width: 100%; border: 1.5px solid var(--color-primary); box-shadow: 0 24px 60px rgba(0,0,0,0.4); padding: 2.2rem; background: var(--color-surface); border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-xs); background: rgba(212,175,55,0.15); color: #d4af37; display: flex; align-items: center; justify-content: center;">
              ${Icons.user}
            </div>
            <div>
              <h3 style="font-family: 'Cinzel', serif; font-size: 1.25rem; font-weight: 800; color: var(--color-primary); margin: 0;">
                ${t("auth.modalTitle")}
              </h3>
              <div style="font-size: 0.74rem; color: var(--color-text-muted); font-weight: 600;">
                BẢO MẬT KHÔNG MẬT KHẨU (PASSWORDLESS)
              </div>
            </div>
          </div>
          <button id="close-visitor-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: var(--color-text-muted); line-height: 1;">&times;</button>
        </div>

        <p style="font-size: 0.86rem; color: var(--color-text-muted); margin-bottom: 1.5rem; line-height: 1.6;">
          ${t("auth.step1Desc")}
        </p>

        <!-- STEP 1: INPUT EMAIL -->
        <div id="otp-step-1">
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.4rem;">
              ${t("auth.step1Title")}
            </label>
            <input type="email" id="visitor-email-input" class="lang-select" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; border-radius: var(--radius-sm);" placeholder="vidu: khachthamquan@gmail.com" value="" required />
            <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 0.35rem;">
              * Mặc định tài khoản là User bình thường trừ khi được Admin cấp quyền các Page trong Dashboard.
            </div>
          </div>

          <button class="btn btn-primary" id="send-otp-btn" style="width: 100%; padding: 0.85rem; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>${t("auth.btnSendOtp")}</span>
            ${Icons.arrowRight}
          </button>
        </div>

        <!-- STEP 2: INPUT OTP -->
        <div id="otp-step-2" style="display: none;">
          <div style="background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-sm); padding: 0.8rem; margin-bottom: 1.25rem; font-size: 0.84rem; color: var(--color-text-main);">
            <div>Đã gửi mã đến: <strong id="display-target-email" style="color: #d4af37;"></strong></div>
            <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 0.2rem;">
              Kiểm tra hộp thư đến (hoặc hòm thư rác / console máy chủ). Mã có hiệu lực trong 5 phút.
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); display: block; margin-bottom: 0.5rem;">
              ${t("auth.step2Title")}
            </label>
            <input type="text" id="otp-code-input" maxlength="6" class="lang-select mono" style="width: 100%; padding: 0.8rem; font-size: 1.4rem; font-weight: 800; text-align: center; letter-spacing: 6px; border: 2px solid var(--color-primary); border-radius: var(--radius-sm);" placeholder="------" />
          </div>

          <div style="display: flex; gap: 0.8rem;">
            <button class="btn btn-secondary" id="btn-back-to-step-1" style="flex: 1; padding: 0.8rem; font-size: 0.88rem; font-weight: 700;">
              <span>← ${t("common.back")}</span>
            </button>
            <button class="btn btn-primary" id="verify-otp-btn" style="flex: 2; padding: 0.8rem; font-size: 0.92rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              ${Icons.check}
              <span>${t("auth.btnVerify")}</span>
            </button>
          </div>
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
  const backBtn = document.getElementById("btn-back-to-step-1");
  const step1 = document.getElementById("otp-step-1");
  const step2 = document.getElementById("otp-step-2");
  const emailInput = document.getElementById("visitor-email-input") as HTMLInputElement;
  const otpInput = document.getElementById("otp-code-input") as HTMLInputElement;
  const displayEmail = document.getElementById("display-target-email");

  // Close modal
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Back to step 1
  if (backBtn && step1 && step2) {
    backBtn.addEventListener("click", () => {
      step2.style.display = "none";
      step1.style.display = "block";
    });
  }

  // STEP 1: SEND OTP
  if (sendOtpBtn && emailInput && step1 && step2) {
    sendOtpBtn.addEventListener("click", async () => {
      const email = emailInput.value.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        showToast("Vui lòng nhập địa chỉ email hợp lệ!", "warning");
        emailInput.focus();
        return;
      }

      sendOtpBtn.setAttribute("disabled", "true");
      sendOtpBtn.innerHTML = `<span>Đang gửi mã...</span>`;

      try {
        const res = await fetch("http://localhost:3000/api/v1/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const json = await res.json();

        if (!json.success) {
          showToast(json.message || "Không thể gửi OTP!", "error");
          sendOtpBtn.removeAttribute("disabled");
          sendOtpBtn.innerHTML = `<span>Gửi Mã OTP 6 Số Qua Email</span> ${Icons.arrowRight}`;
          return;
        }

        pendingEmail = email;
        if (displayEmail) displayEmail.textContent = email;

        // If dev OTP provided
        if (json.devOtp && otpInput) {
          otpInput.value = json.devOtp;
        }

        showToast(json.message || "Mã OTP đã được gửi đến email!", "success");
        if (json.note) {
          showToast(json.note, "info");
        }

        step1.style.display = "none";
        step2.style.display = "block";
        otpInput?.focus();
      } catch (err: any) {
        showToast("Không thể kết nối máy chủ API (Port 3000). Vui lòng thử lại!", "error");
      } finally {
        sendOtpBtn.removeAttribute("disabled");
        sendOtpBtn.innerHTML = `<span>Gửi Mã OTP 6 Số Qua Email</span> ${Icons.arrowRight}`;
      }
    });
  }

  // STEP 2: VERIFY OTP
  if (verifyOtpBtn && otpInput && modal) {
    verifyOtpBtn.addEventListener("click", async () => {
      const otp = otpInput.value.trim();
      if (!otp || otp.length < 6) {
        showToast("Vui lòng nhập đủ 6 số mã xác thực OTP!", "warning");
        otpInput.focus();
        return;
      }

      verifyOtpBtn.setAttribute("disabled", "true");
      verifyOtpBtn.innerHTML = `<span>Đang xác thực...</span>`;

      try {
        const res = await fetch("http://localhost:3000/api/v1/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: pendingEmail,
            otp
          })
        });

        const json = await res.json();

        if (!json.success) {
          showToast(json.message || "Mã OTP không đúng hoặc đã hết hạn!", "error");
          verifyOtpBtn.removeAttribute("disabled");
          verifyOtpBtn.innerHTML = `${Icons.check} <span>Xác Nhận & Đăng Nhập</span>`;
          return;
        }

        // Login successful!
        AuthState.loginWithServerSession(json.user, json.token);

        modal.style.display = "none";

        if (json.user.role === "super_admin") {
          showToast(`Chào mừng Quản trị viên tối cao: ${json.user.name}! Bạn có toàn quyền trên 11 trang.`, "success");
          window.location.hash = "#admin-scan";
        } else if (json.user.allowedPages && json.user.allowedPages.length > 0) {
          showToast(`Đăng nhập thành công! Bạn được phân công quản lý ${json.user.allowedPages.length} trang trong Dashboard.`, "success");
          window.location.hash = `#${json.user.allowedPages[0]}`;
        } else {
          showToast(`Đăng nhập thành công! Chào mừng du khách ${json.user.name}.`, "success");
          window.location.hash = "#profile";
        }

        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } catch (err: any) {
        showToast("Không thể kết nối máy chủ xác thực!", "error");
      } finally {
        verifyOtpBtn.removeAttribute("disabled");
        verifyOtpBtn.innerHTML = `${Icons.check} <span>Xác Nhận & Đăng Nhập</span>`;
      }
    });
  }
}

export const initVisitorAuthListeners = initVisitorAuthModalLogic;
