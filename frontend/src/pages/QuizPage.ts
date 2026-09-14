import { ARTIFACTS_DATA } from "../data/artifacts";
import { Icons } from "../components/Icons";
import confetti from "canvas-confetti";

let currentQuizArtifactIndex = 0;
let currentQuestionIndex = 0;
let userScore = 420;
let unlockedStamps = ["Dấu Ấn Óc Eo", "Bảo Vật Đồng Dương"];

export function renderQuizPage(): string {
  const artifact = ARTIFACTS_DATA[currentQuizArtifactIndex] || ARTIFACTS_DATA[0];
  const q = artifact.quiz[currentQuestionIndex] || artifact.quiz[0];

  return `
    <div class="page-viewport">
      <div style="margin-bottom: 2rem;">
        <div class="brand-subtitle">TRÒ CHƠI TRI THỨC DI SẢN</div>
        <h1 style="font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem;">
          Thử Thách Lịch Sử & Sưu Tập Tem Hộ Chiếu Số
        </h1>
        <p style="color: var(--color-text-muted);">
          Câu hỏi trắc nghiệm được trích xuất trực tiếp từ <b>bảng chú thích tại tủ kính bảo tàng</b>. Trả lời đúng để tích lũy tem và nâng bậc danh hiệu.
        </p>
      </div>

      <!-- Main Quiz & Passport Grid -->
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; align-items: start;">
        <!-- Left: Interactive Quiz Card -->
        <div class="card" id="quiz-card" style="border-top: 4px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <span class="badge-pill" style="font-weight: 700;">
              Chủ đề: ${artifact.name} (${artifact.code})
            </span>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary);" class="mono">
              Điểm tích lũy: <span id="score-display">${userScore}</span> EXP
            </div>
          </div>

          <!-- Question Text -->
          <h3 style="font-size: 1.2rem; color: var(--color-text-main); margin-bottom: 1.5rem; line-height: 1.5;">
            "${q.question}"
          </h3>

          <!-- Options Grid -->
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.5rem;" id="quiz-options-list">
            ${q.options.map((opt, i) => `
              <button class="btn btn-outline quiz-opt-btn" data-index="${i}" style="width: 100%; justify-content: flex-start; text-align: left; padding: 0.85rem 1.15rem; font-size: 0.9rem; line-height: 1.4;">
                <span class="mono" style="margin-right: 0.75rem; font-weight: 800; color: var(--color-primary);">${String.fromCharCode(65 + i)}.</span>
                <span>${opt}</span>
              </button>
            `).join('')}
          </div>

          <!-- Feedback Box -->
          <div id="quiz-feedback-box" style="display: none; padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.88rem; line-height: 1.5;">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">
              Cổ vật tiếp theo: <b>${ARTIFACTS_DATA[(currentQuizArtifactIndex + 1) % ARTIFACTS_DATA.length].name}</b>
            </span>

            <button class="btn btn-primary" id="next-quiz-btn" style="display: none;">
              <span>Câu Tiếp Theo</span>
              ${Icons.arrowRight}
            </button>
          </div>
        </div>

        <!-- Right: Digital Passport Stamps Collection -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="card" style="background: linear-gradient(135deg, rgba(200,223,219,0.3) 0%, rgba(242,239,231,0.8) 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div class="brand-subtitle" style="font-size: 0.75rem;">HỘ CHIẾU DI SẢN SỐ</div>
              <span class="badge-pill" style="font-weight: 800;">${unlockedStamps.length}/6 TEM</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-bottom: 1.25rem;" id="stamps-grid">
              ${[
                { name: "Dấu Ấn Óc Eo", period: "Óc Eo", unlocked: true },
                { name: "Bảo Vật Đồng Dương", period: "Champa", unlocked: true },
                { name: "Âm Vang Đông Sơn", period: "Đông Sơn", unlocked: false },
                { name: "Khuyên Tai Sa Huỳnh", period: "Sa Huỳnh", unlocked: false },
                { name: "Bảo Kiếm Triều Nguyễn", period: "Nguyễn", unlocked: false },
                { name: "Bí Ẩn Càn Long", period: "Gốm Cổ", unlocked: false }
              ].map((st) => `
                <div style="border: 1.5px dashed ${st.unlocked ? 'var(--color-primary)' : 'rgba(0,0,0,0.15)'}; background: ${st.unlocked ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.02)'}; border-radius: var(--radius-sm); padding: 0.75rem 0.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90px;">
                  <div style="width: 28px; height: 28px; border-radius: 50%; background: ${st.unlocked ? 'var(--color-primary)' : 'rgba(0,0,0,0.1)'}; color: #fff; display: flex; align-items: center; justify-content: center; margin-bottom: 0.4rem; font-size: 0.75rem;">
                    ${st.unlocked ? Icons.check : '?'}
                  </div>
                  <div style="font-size: 0.72rem; font-weight: 700; color: ${st.unlocked ? 'var(--color-primary)' : 'var(--color-text-muted)'}; line-height: 1.2;">
                    ${st.name}
                  </div>
                </div>
              `).join('')}
            </div>

            <p style="font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.5; margin-bottom: 0.85rem;">
              Mỗi khi hoàn thành bài đố vui về hiện vật, bạn được đóng dấu 1 tem số lưu vào hồ sơ cá nhân.
            </p>

            <a href="#profile" class="btn btn-outline" style="width: 100%; font-size: 0.82rem; padding: 0.55rem;">
              ${Icons.user}
              <span>Xem Vé & Hồ Sơ Cá Nhân</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initQuizPageLogic() {
  const artifact = ARTIFACTS_DATA[currentQuizArtifactIndex] || ARTIFACTS_DATA[0];
  const q = artifact.quiz[currentQuestionIndex] || artifact.quiz[0];

  const optBtns = document.querySelectorAll(".quiz-opt-btn");
  const feedbackBox = document.getElementById("quiz-feedback-box");
  const nextBtn = document.getElementById("next-quiz-btn");
  const scoreDisplay = document.getElementById("score-display");

  optBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const chosenIdx = parseInt(btn.getAttribute("data-index") || "0", 10);
      optBtns.forEach(b => (b as HTMLButtonElement).disabled = true);

      if (!feedbackBox) return;
      feedbackBox.style.display = "block";

      if (chosenIdx === q.correctIndex) {
        userScore += 50;
        if (scoreDisplay) scoreDisplay.textContent = userScore.toString();

        feedbackBox.style.background = "rgba(22, 163, 74, 0.12)";
        feedbackBox.style.border = "1.5px solid #16A34A";
        feedbackBox.style.color = "#15803D";
        feedbackBox.innerHTML = `
          <b>Chính xác! (+50 EXP)</b><br/>
          ${q.explanation}
        `;

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (_) {}
      } else {
        feedbackBox.style.background = "rgba(220, 38, 38, 0.1)";
        feedbackBox.style.border = "1.5px solid #DC2626";
        feedbackBox.style.color = "#B91C1C";
        feedbackBox.innerHTML = `
          <b>Chưa chính xác!</b><br/>
          Đáp án đúng là: <b>${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex]}</b>.<br/>
          <i>${q.explanation}</i>
        `;
      }

      if (nextBtn) nextBtn.style.display = "inline-flex";
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentQuizArtifactIndex = (currentQuizArtifactIndex + 1) % ARTIFACTS_DATA.length;
      currentQuestionIndex = 0;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
  }
}
export const initQuizListeners = initQuizPageLogic;
