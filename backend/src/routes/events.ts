import { Router, Request, Response } from 'express';
import { VisitEventModel, VisitEventType } from '../models/VisitEvent.js';

export const eventsRouter = Router();

const LOAI_HOP_LE: VisitEventType[] = [
  'page_view',
  'room_view',
  'tour_start',
  'qr_scan',
  'audio_play'
];

/** Trần số sự kiện nhận trong một lần gọi, chặn việc bơm rác làm phình collection. */
const TOI_DA_MOI_LAN = 25;
const DAI_TOI_DA = 120;

const catChuoi = (v: unknown, dai = DAI_TOI_DA): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, dai) : null;
};

/** Suy ra loại thiết bị từ User-Agent. Không lưu lại nguyên chuỗi UA. */
const suyRaThietBi = (ua: string): string => {
  const s = (ua || '').toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return 'tablet';
  if (/mobi|android|iphone|ipod|phone/.test(s)) return 'mobile';
  return 'desktop';
};

/**
 * POST /api/events
 *
 * Nhận nhật ký truy cập ẩn danh từ trình duyệt khách.
 *
 * Nguyên tắc riêng tư: KHÔNG lưu địa chỉ IP, KHÔNG lưu nguyên chuỗi User-Agent,
 * KHÔNG lưu email hay tên. sessionId và visitorId do trình duyệt tự sinh ngẫu nhiên,
 * không suy ngược ra được danh tính người dùng.
 */
eventsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const goi = Array.isArray(req.body?.events) ? req.body.events : [req.body];
    if (goi.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có sự kiện nào' });
    }
    if (goi.length > TOI_DA_MOI_LAN) {
      return res
        .status(413)
        .json({ success: false, message: `Mỗi lần gửi tối đa ${TOI_DA_MOI_LAN} sự kiện` });
    }

    const thietBi = suyRaThietBi(String(req.headers['user-agent'] || ''));

    const banGhi = goi
      .map((e: any) => {
        const type = catChuoi(e?.type, 20) as VisitEventType | null;
        const sessionId = catChuoi(e?.sessionId, 64);
        const visitorId = catChuoi(e?.visitorId, 64);
        if (!type || !LOAI_HOP_LE.includes(type) || !sessionId || !visitorId) return null;
        return {
          type,
          sessionId,
          visitorId,
          isAuthenticated: e?.isAuthenticated === true,
          userRef: catChuoi(e?.userRef, 64),
          roomId: catChuoi(e?.roomId, 64),
          langCode: catChuoi(e?.langCode, 10),
          path: catChuoi(e?.path, DAI_TOI_DA),
          device: thietBi
        };
      })
      .filter(Boolean);

    if (banGhi.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có sự kiện hợp lệ' });
    }

    // ordered: false để một bản ghi hỏng không chặn cả lô
    await VisitEventModel.insertMany(banGhi, { ordered: false });
    res.json({ success: true, received: banGhi.length });
  } catch (err: any) {
    console.error('[Events Ingest Error]:', err.message);
    // Lỗi ghi nhật ký không được làm hỏng trải nghiệm của khách đang xem tour
    res.status(200).json({ success: false, message: 'Ghi nhật ký thất bại' });
  }
});
