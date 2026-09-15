export type ToastType = "success" | "error" | "info" | "warning";

export function initToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
}

export function showToast(
  message: string,
  type: ToastType = "success",
  durationMs: number = 3500
) {
  initToastContainer();
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  const iconMap: Record<ToastType, string> = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const titleMap: Record<ToastType, string> = {
    success: "Thành Công",
    error: "Thông Báo Lỗi",
    warning: "Cảnh Báo",
    info: "Thông Tin Hệ Thống",
  };

  toast.innerHTML = `
    <div class="toast-icon-wrapper">
      ${iconMap[type]}
    </div>
    <div class="toast-content">
      <div class="toast-title">${titleMap[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Đóng">&times;</button>
    <div class="toast-progress" style="animation-duration: ${durationMs}ms;"></div>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  const dismiss = () => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => {
      toast.remove();
    }, 350);
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", dismiss);
  }

  container.appendChild(toast);

  // Trigger slide-in transition after append
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto dismiss timer
  const autoDismissTimer = setTimeout(() => {
    dismiss();
  }, durationMs);

  toast.addEventListener("mouseenter", () => {
    clearTimeout(autoDismissTimer);
    const progress = toast.querySelector(".toast-progress") as HTMLElement;
    if (progress) progress.style.animationPlayState = "paused";
  });
}

// Global window declaration for easy access or fallback
(window as any).showToast = showToast;
