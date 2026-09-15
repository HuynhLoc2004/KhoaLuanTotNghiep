export interface ConfirmModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger" for destructive actions (red confirm btn), "primary" for normal */
  variant?: "danger" | "primary" | "warning";
  icon?: string; // emoji or SVG string
}

/**
 * Show a themed confirm modal that matches the site's design system.
 * Returns a Promise<boolean> — true if the user confirmed, false if cancelled.
 *
 * Usage:
 *   const ok = await showConfirm({ message: "Xóa mục này?", variant: "danger" });
 *   if (ok) { ... }
 */
export function showConfirm(options: ConfirmModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    // --- Remove any existing modal ---
    document.getElementById("custom-confirm-overlay")?.remove();

    const {
      title = "Xác Nhận",
      message,
      confirmText = "Xác Nhận",
      cancelText = "Hủy Bỏ",
      variant = "primary",
      icon = variant === "danger" ? "🗑️" : variant === "warning" ? "⚠️" : "✅",
    } = options;

    const variantStyles: Record<string, { btn: string; accent: string; glow: string }> = {
      danger: {
        btn: "background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border: none;",
        accent: "#dc2626",
        glow: "rgba(220, 38, 38, 0.2)",
      },
      primary: {
        btn: "background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover)); color: white; border: none;",
        accent: "var(--color-primary)",
        glow: "rgba(51, 104, 160, 0.2)",
      },
      warning: {
        btn: "background: linear-gradient(135deg, #d97706, #b45309); color: white; border: none;",
        accent: "#d97706",
        glow: "rgba(217, 119, 6, 0.2)",
      },
    };

    const vs = variantStyles[variant] ?? variantStyles.primary;

    // --- Build overlay DOM ---
    const overlay = document.createElement("div");
    overlay.id = "custom-confirm-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "confirm-modal-title");

    overlay.innerHTML = `
      <div class="confirm-modal-backdrop" id="confirm-modal-backdrop"></div>
      <div class="confirm-modal-box" id="confirm-modal-box">
        <div class="confirm-modal-icon-ring">
          <span class="confirm-modal-icon">${icon}</span>
        </div>
        <h2 class="confirm-modal-title" id="confirm-modal-title">${title}</h2>
        <p class="confirm-modal-message">${message}</p>
        <div class="confirm-modal-actions">
          <button class="confirm-modal-btn confirm-modal-cancel" id="confirm-modal-cancel">${cancelText}</button>
          <button class="confirm-modal-btn confirm-modal-confirm" id="confirm-modal-confirm" style="${vs.btn}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add("confirm-modal-visible");
    });

    const close = (result: boolean) => {
      overlay.classList.remove("confirm-modal-visible");
      overlay.classList.add("confirm-modal-hiding");
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 220);
    };

    document.getElementById("confirm-modal-confirm")?.addEventListener("click", () => close(true));
    document.getElementById("confirm-modal-cancel")?.addEventListener("click", () => close(false));
    document.getElementById("confirm-modal-backdrop")?.addEventListener("click", () => close(false));

    // ESC key support
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { document.removeEventListener("keydown", onKey); close(false); }
      if (e.key === "Enter") { document.removeEventListener("keydown", onKey); close(true); }
    };
    document.addEventListener("keydown", onKey);

    // Focus confirm button for accessibility
    setTimeout(() => (document.getElementById("confirm-modal-cancel") as HTMLElement)?.focus(), 50);
  });
}

// Expose globally (for inline onclick usage if needed)
(window as any).showConfirm = showConfirm;
