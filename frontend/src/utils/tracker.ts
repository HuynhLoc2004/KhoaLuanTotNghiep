import { API_BASE } from '../services/api';

/**
 * Ghi nhận lượt truy cập ẩn danh.
 *
 * Nguyên tắc: không thu thập bất kỳ thông tin nhận dạng cá nhân nào.
 * - visitorId: chuỗi ngẫu nhiên lưu trong localStorage, dùng để đếm khách duy nhất.
 * - sessionId: chuỗi ngẫu nhiên lưu trong sessionStorage, mất khi đóng tab.
 * Cả hai đều do trình duyệt tự sinh, máy chủ không suy ngược ra được người dùng.
 * Không gửi email, tên, hay tọa độ. Địa chỉ IP không được máy chủ lưu lại.
 */

const KHOA_KHACH = 'museum_visitor_id';
const KHOA_PHIEN = 'museum_session_id';

export type LoaiSuKien = 'page_view' | 'room_view' | 'tour_start' | 'qr_scan' | 'audio_play';

export interface SuKienTruyCap {
  type: LoaiSuKien;
  roomId?: string;
  langCode?: string;
  path?: string;
  isAuthenticated?: boolean;
  userRef?: string;
}

const sinhId = (): string => {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* trình duyệt cũ */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Đọc id đã lưu, tạo mới nếu chưa có. Mọi truy cập storage đều bọc try/catch vì
 *  chế độ riêng tư hoặc thiết lập chặn cookie có thể ném lỗi. */
const layId = (kho: 'local' | 'session', khoa: string): string => {
  try {
    const store = kho === 'local' ? localStorage : sessionStorage;
    let v = store.getItem(khoa);
    if (!v) {
      v = sinhId();
      store.setItem(khoa, v);
    }
    return v;
  } catch {
    // Không lưu được thì vẫn ghi nhận, chỉ là mỗi lần tải trang tính là một khách mới
    return sinhId();
  }
};

let hangDoi: any[] = [];
let henGio: any = null;

const guiNgay = (dungSendBeacon = false) => {
  if (hangDoi.length === 0) return;
  const goi = hangDoi.splice(0, 25);
  const body = JSON.stringify({ events: goi });
  const url = `${API_BASE}/events`;

  try {
    if (dungSendBeacon && navigator.sendBeacon) {
      // Khi người dùng đóng tab, fetch thường bị hủy giữa chừng
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {
      /* Ghi nhật ký thất bại không được ảnh hưởng tới trải nghiệm xem tour */
    });
  } catch {
    /* bỏ qua */
  }
};

/** Gom sự kiện rồi gửi theo lô, tránh bắn một request cho mỗi cú bấm. */
export const ghiSuKien = (suKien: SuKienTruyCap): void => {
  try {
    hangDoi.push({
      ...suKien,
      sessionId: layId('session', KHOA_PHIEN),
      visitorId: layId('local', KHOA_KHACH),
      isAuthenticated: suKien.isAuthenticated === true,
      path: suKien.path ?? (typeof location !== 'undefined' ? location.pathname : undefined)
    });
    clearTimeout(henGio);
    henGio = setTimeout(() => guiNgay(false), 1200);
  } catch {
    /* bỏ qua */
  }
};

/** Gắn một lần lúc khởi động ứng dụng: đẩy nốt hàng đợi khi người dùng rời trang. */
export const khoiTaoTracker = (): void => {
  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') guiNgay(true);
  });
  window.addEventListener('pagehide', () => guiNgay(true));
};
