/**
 * Sao chép văn bản vào bộ nhớ tạm.
 *
 * Clipboard API chỉ hoạt động trong secure context (HTTPS hoặc localhost).
 * Khi hệ thống chạy trên VPS qua HTTP thuần, `navigator.clipboard` không tồn tại
 * hoặc bị reject, nên cần cơ chế dự phòng bằng textarea ẩn + execCommand.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[clipboard] Clipboard API thất bại, dùng execCommand:', err);
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[clipboard] Fallback execCommand thất bại:', err);
    return false;
  }
};
