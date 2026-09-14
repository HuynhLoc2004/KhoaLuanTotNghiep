import { TOUR_SLOTS_DATA } from "../data/artifacts";
import { Icons } from "../components/Icons";

export function renderBookingPage(): string {
  return `
    <div class="page-viewport">
      <div style="margin-bottom: 2rem;">
        <div class="brand-subtitle">DỊCH VỤ THAM QUAN</div>
        <h1 style="font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem;">
          Đặt Lịch Tour Tham Quan Theo Lớp Học & Đoàn
        </h1>
        <p style="color: var(--color-text-muted);">
          Dành cho giáo viên và đoàn học sinh: Chọn ca giờ phù hợp, đăng ký số lượng và nhận vé QR điện tử vào cổng tự động.
        </p>
      </div>

      <!-- 2-Column Booking Workspace -->
      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: start;">
        <!-- Left: Slot Selection -->
        <div class="card">
          <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.calendar}
            <span>1. Chọn Ngày & Ca Giờ Tham Quan</span>
          </h3>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem;">
              Ngày tham quan dự kiến:
            </label>
            <input type="date" id="booking-date" class="lang-select" style="width: 100%; padding: 0.75rem; font-size: 0.92rem;" value="2026-09-15" />
          </div>

          <!-- Slots List with Capacity Progress -->
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${TOUR_SLOTS_DATA.map((slot, i) => {
              const remaining = slot.totalSeats - slot.bookedSeats;
              const percent = Math.round((slot.bookedSeats / slot.totalSeats) * 100);
              const isFull = remaining <= 0;

              return `
                <div class="tour-slot-card" data-slot-id="${slot.id}" style="border: 1.5px solid ${i === 0 ? 'var(--color-primary)' : 'var(--color-card-border)'}; background: ${i === 0 ? 'rgba(var(--color-surface-rgb), 0.25)' : 'var(--color-card-bg)'}; border-radius: var(--radius-md); padding: 1rem; cursor: pointer; transition: all 0.16s ease;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <span class="mono" style="font-size: 1rem; font-weight: 800; color: var(--color-primary);">${slot.time}</span>
                      <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 8px;">${slot.guide}</span>
                    </div>
                    <span style="font-size: 0.82rem; font-weight: 700; color: ${isFull ? '#DC2626' : 'var(--color-secondary)'};">
                      ${isFull ? 'Đã hết chỗ' : `Còn ${remaining} chỗ`}
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 0.5rem;">
                    <div style="width: ${percent}%; height: 100%; background: ${isFull ? '#DC2626' : 'var(--color-primary)'}; border-radius: 3px;"></div>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--color-text-muted);">
                    <span>Ngôn ngữ: ${slot.language}</span>
                    <span>Đã đặt ${slot.bookedSeats}/${slot.totalSeats}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Registration Form & Ticket Output -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card" id="booking-form-card">
            <h3 style="font-size: 1.15rem; color: var(--color-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              ${Icons.user}
              <span>2. Thông Tin Đoàn & Lớp Học</span>
            </h3>

            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
                  Đơn vị / Trường học:
                </label>
                <input type="text" id="group-name" class="lang-select" style="width: 100%; padding: 0.65rem;" value="Trường THPT Gia Định - Lớp 12A3" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
                    Người phụ trách:
                  </label>
                  <input type="text" id="contact-name" class="lang-select" style="width: 100%; padding: 0.65rem;" value="Thầy Nguyễn Văn Nam" />
                </div>
                <div>
                  <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
                    Số điện thoại:
                  </label>
                  <input type="tel" id="contact-phone" class="lang-select" style="width: 100%; padding: 0.65rem;" value="0908123456" />
                </div>
              </div>

              <div>
                <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); display: block; margin-bottom: 0.35rem;">
                  Số lượng học sinh & khách:
                </label>
                <input type="number" id="attendees-count" class="lang-select" style="width: 100%; padding: 0.65rem;" value="35" min="1" max="50" />
              </div>
            </div>

            <button class="btn btn-primary" id="submit-booking-btn" style="width: 100%;">
              ${Icons.check}
              <span>Xác Nhận Đặt Tour & Nhận Vé QR</span>
            </button>
          </div>

          <!-- Generated QR Ticket Card -->
          <div class="card" id="ticket-result-card" style="display: none; border-top: 4px solid var(--color-primary); background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,223,219,0.3) 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span class="badge-pill">VÉ ĐOÀN ĐIỆN TỬ</span>
              <span class="mono" id="ticket-code" style="font-weight: 800; color: var(--color-primary);">TKT-TOUR-9921</span>
            </div>

            <div style="display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1rem;">
              <!-- Simulated QR Code SVG -->
              <div style="width: 90px; height: 90px; background: #fff; border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; padding: 6px;">
                <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: var(--color-primary);">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z"/>
                </svg>
              </div>

              <div>
                <h4 id="ticket-group" style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.25rem;">
                  Lớp 12A3 - THPT Gia Định
                </h4>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);" id="ticket-time-info">
                  Ca 09:00 - 10:30 • 35 Khách
                </div>
                <div style="font-size: 0.75rem; color: #16A34A; font-weight: 700; margin-top: 0.35rem;">
                  Đã duyệt tự động • Sẵn sàng quét tại cổng
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-outline" onclick="window.print()" style="flex: 1; font-size: 0.82rem; padding: 0.5rem;">
                In Thẻ Vé
              </button>
              <a href="#admin" class="btn btn-primary" style="flex: 1; font-size: 0.82rem; padding: 0.5rem;">
                Thử Quét Cổng Admin →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initBookingPageLogic() {
  const slotCards = document.querySelectorAll(".tour-slot-card");
  slotCards.forEach(card => {
    card.addEventListener("click", () => {
      slotCards.forEach(c => {
        (c as HTMLElement).style.borderColor = "var(--color-card-border)";
        (c as HTMLElement).style.background = "var(--color-card-bg)";
      });
      (card as HTMLElement).style.borderColor = "var(--color-primary)";
      (card as HTMLElement).style.background = "rgba(var(--color-surface-rgb), 0.25)";
    });
  });

  const submitBtn = document.getElementById("submit-booking-btn");
  const ticketResult = document.getElementById("ticket-result-card");
  const groupInput = document.getElementById("group-name") as HTMLInputElement;
  const countInput = document.getElementById("attendees-count") as HTMLInputElement;

  if (submitBtn && ticketResult) {
    submitBtn.addEventListener("click", () => {
      submitBtn.textContent = "Đang xử lý...";
      setTimeout(() => {
        ticketResult.style.display = "block";
        const groupEl = document.getElementById("ticket-group");
        const timeEl = document.getElementById("ticket-time-info");
        if (groupEl && groupInput) groupEl.textContent = groupInput.value;
        if (timeEl && countInput) timeEl.textContent = `Ca 09:00 - 10:30 • ${countInput.value} Khách`;
        ticketResult.scrollIntoView({ behavior: "smooth" });
        submitBtn.textContent = "Đặt Tour Thành Công";
      }, 400);
    });
  }
}

export const initBookingListeners = initBookingPageLogic;
