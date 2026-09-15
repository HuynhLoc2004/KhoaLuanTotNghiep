import { generateQRCodeSVG, getArtifactScanURL } from "../utils/qrCode";
import { Icons } from "./Icons";
import { showToast } from "./Toast";

export interface QRModalItem {
  id: string;
  code: string;
  name: string;
  era: string;
  room?: string;
  thumbnail?: string;
}

let activeModalItem: QRModalItem | null = null;

export function renderQRPrintModal(): string {
  return `
    <div id="qr-print-overlay" class="artifact-drawer-overlay" aria-hidden="true" style="z-index: 9999;">
      <div class="artifact-drawer-backdrop" id="qr-print-backdrop"></div>
      
      <div class="artifact-drawer" id="qr-print-drawer" role="dialog" aria-modal="true" style="max-width: 540px; width: 95%;">
        <!-- Header -->
        <div class="artifact-drawer-header">
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.25rem;">
              TEM NHÃN MÃ QR THỰC TẾ
            </div>
            <h2 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--color-text-main);">
              In Tem Nhãn QR Cho Hiện Vật
            </h2>
          </div>
          <button id="qr-print-close" class="artifact-drawer-close-btn" aria-label="Đóng">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body / Preview -->
        <div class="artifact-drawer-body" style="padding: 1.5rem;">
          <div style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1.25rem; text-align: center;">
            Tem nhãn dưới đây sẽ được dán trực tiếp bên cạnh hiện vật tại tủ kính phòng trưng bày. Du khách quét QR bằng điện thoại để xem mô hình 3D & nghe thuyết minh Voice AI.
          </div>

          <!-- Printable Museum Label Card Container -->
          <div id="printable-museum-label" style="background: #ffffff; color: #0f172a; border: 3px double #b45309; border-radius: 12px; padding: 1.5rem; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 0 auto; max-width: 380px;">
            <!-- Museum Branding Header -->
            <div style="border-bottom: 2px solid #b45309; padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <div style="font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; color: #b45309; text-transform: uppercase;">
                BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH
              </div>
              <div style="font-size: 0.88rem; font-weight: 900; color: #1e3a8a; margin-top: 2px;">
                BẢO VẬT DI SẢN CỔ VẬT
              </div>
            </div>

            <!-- QR Code Container -->
            <div id="qr-code-svg-holder" style="display: flex; justify-content: center; align-items: center; margin: 1rem 0; padding: 0.75rem; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
              <!-- SVG will be dynamically injected here -->
            </div>

            <!-- Artifact Info -->
            <div style="margin-bottom: 0.75rem;">
              <div id="qr-label-code" style="font-family: monospace; font-size: 0.78rem; font-weight: 800; color: #0284c7; letter-spacing: 0.05em; margin-bottom: 0.2rem;">
                MÃ SỐ: BTLS-AR-000
              </div>
              <div id="qr-label-name" style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-bottom: 0.35rem; line-height: 1.3;">
                Tên Hiện Vật
              </div>
              <div id="qr-label-era" style="display: inline-block; font-size: 0.75rem; font-weight: 700; color: #b45309; background: #fef3c7; padding: 2px 10px; border-radius: 999px; border: 1px solid #fde68a;">
                Văn Hóa Đông Sơn
              </div>
            </div>

            <!-- Instructions footer -->
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 0.65rem; font-size: 0.72rem; color: #475569; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <span>Quét mã QR để xem 3D 360° & Nghe thuyết minh Voice AI</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="artifact-drawer-footer">
          <button type="button" id="qr-print-cancel" class="btn btn-secondary" style="flex: 1; justify-content: center; padding: 0.7rem;">
            Đóng
          </button>
          <button type="button" id="qr-print-action-btn" class="btn btn-primary" style="flex: 2; justify-content: center; padding: 0.7rem; font-weight: 800; background: linear-gradient(135deg, #0284c7, #1e3a8a);">
            ${Icons.qr}
            <span>🖨️ In Tem Nhãn (Ctrl + P)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function openQRPrintModal(item: QRModalItem) {
  activeModalItem = item;
  const overlay = document.getElementById("qr-print-overlay");
  const svgHolder = document.getElementById("qr-code-svg-holder");
  const labelCode = document.getElementById("qr-label-code");
  const labelName = document.getElementById("qr-label-name");
  const labelEra  = document.getElementById("qr-label-era");

  if (!overlay || !svgHolder) return;

  const targetURL = getArtifactScanURL(item.id || item.code);
  svgHolder.innerHTML = generateQRCodeSVG(targetURL, { size: 180, color: "#0f172a" });

  if (labelCode) labelCode.textContent = `MÃ SỐ: ${item.code}`;
  if (labelName) labelName.textContent = item.name;
  if (labelEra)  labelEra.textContent  = item.era || "Cổ đại";

  overlay.removeAttribute("aria-hidden");
  overlay.classList.add("open");
}

export function closeQRPrintModal() {
  const overlay = document.getElementById("qr-print-overlay");
  overlay?.classList.remove("open");
  overlay?.setAttribute("aria-hidden", "true");
  activeModalItem = null;
}

export function initQRPrintModalListeners() {
  const closeBtn = document.getElementById("qr-print-close");
  const cancelBtn = document.getElementById("qr-print-cancel");
  const printBtn = document.getElementById("qr-print-action-btn");
  const backdrop = document.getElementById("qr-print-backdrop");

  closeBtn?.addEventListener("click", closeQRPrintModal);
  cancelBtn?.addEventListener("click", closeQRPrintModal);
  backdrop?.addEventListener("click", closeQRPrintModal);

  printBtn?.addEventListener("click", () => {
    if (!activeModalItem) return;
    showToast(`🖨️ Đang mở lệnh in tem nhãn cho [${activeModalItem.name}]...`, "info");
    
    // Inject print styles dynamically to print only the label card
    const styleEl = document.createElement("style");
    styleEl.id = "print-label-style";
    styleEl.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #printable-museum-label, #printable-museum-label * { visibility: visible !important; }
        #printable-museum-label {
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 100% !important;
          max-width: 400px !important;
          box-shadow: none !important;
          border: 3px double #b45309 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
    window.print();
    setTimeout(() => {
      document.getElementById("print-label-style")?.remove();
    }, 1000);
  });
}
