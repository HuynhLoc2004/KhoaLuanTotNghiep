import { Router, Request, Response } from 'express';
import { RoomModel, IRoom } from '../models/Room.js';
import { PanoramaModel } from '../models/Panorama.js';
import { Language, ILanguage } from '../models/Language.js';
import { VisitEventModel } from '../models/VisitEvent.js';
import { cacheGet, cacheSet, cacheDel } from '../services/redis.js';

export const analyticsRouter = Router();

const CACHE_KEY = 'analytics:overview';
const CACHE_TTL_SECONDS = 30;

/** Gọi sau mỗi lần dữ liệu gian phòng thay đổi để báo cáo không hiển thị số cũ. */
export const xoaCacheThongKe = () => cacheDel(CACHE_KEY);

interface PendingIssue {
  roomId: string;
  code: string;
  name: string;
  issues: string[];
}

/**
 * Trả về chuỗi 'YYYY-MM-DD' theo giờ Việt Nam.
 *
 * Không dùng giờ địa phương của máy chủ: VPS thường chạy UTC, khi đó một ảnh ghép
 * lúc 2 giờ sáng giờ Việt Nam sẽ bị xếp nhầm sang ngày hôm trước.
 */
const MUI_GIO = 'Asia/Ho_Chi_Minh';
const dinhDangNgay = new Intl.DateTimeFormat('en-CA', {
  timeZone: MUI_GIO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
const toDayKey = (d: Date): string => dinhDangNgay.format(d);

/**
 * Rút tên tệp từ một đường dẫn ảnh để đối sánh.
 *
 * Gian phòng có thể lưu URL tuyệt đối ('http://host/uploads/x.jpg') trong khi bản ghi
 * panorama lưu đường dẫn tương đối ('/uploads/x.jpg'). So sánh nguyên chuỗi sẽ trượt
 * và ảnh đã gắn phòng bị đếm nhầm thành ảnh mồ côi.
 */
const tenTep = (url: string): string => {
  if (!url) return '';
  try {
    const duong = url.startsWith('http') ? new URL(url).pathname : url.split('?')[0];
    return decodeURIComponent(duong.split('/').filter(Boolean).pop() || '').toLowerCase();
  } catch {
    return url.split('/').filter(Boolean).pop()?.toLowerCase() || '';
  }
};

/**
 * GET /api/analytics/overview
 *
 * Tổng hợp số liệu KHO NỘI DUNG từ ba collection có thật: museumrooms, panoramas,
 * languages. Đây là thống kê tình trạng số hóa, không phải thống kê lượt tham quan:
 * hệ thống hiện chưa ghi nhận sự kiện truy cập nào của khách, nên mọi chỉ số ở đây
 * đều đếm từ dữ liệu quản trị chứ không suy diễn.
 */
export const buildOverview = (
  rooms: IRoom[],
  panoramas: any[],
  languages: ILanguage[],
  suKien: any[] = []
) => {
  {
    // ---- Gian phòng ----------------------------------------------------
    const activeRooms = rooms.filter((r) => r.active);
    // Đối sánh theo tên tệp, không theo nguyên URL (xem chú thích hàm tenTep)
    const tenTepDaGan = new Set(
      rooms.map((r) => tenTep(r.panoramaUrl || '')).filter(Boolean)
    );
    const roomsWithPanorama = rooms.filter((r) => !!r.panoramaUrl);
    // Ảnh ngoại vi (ảnh stock, link ngoài) khác hẳn ảnh do bảo tàng tự ghép.
    // Gộp chung hai thứ lại rồi gọi là "đã số hóa" sẽ thổi phồng tiến độ, nên tách ra.
    const tenTepTuGhep = new Set(
      panoramas.map((p: any) => tenTep(p.panoramaUrl || p.url || '') || (p.filename || '').toLowerCase())
        .filter(Boolean)
    );
    const roomsWithOwnPanorama = rooms.filter(
      (r) => !!r.panoramaUrl && tenTepDaGan.has(tenTep(r.panoramaUrl)) && tenTepTuGhep.has(tenTep(r.panoramaUrl))
    );
    const roomsWithHotspots = rooms.filter((r) => (r.hotspots?.length || 0) > 0);
    const roomsAiEnabled = rooms.filter((r) => r.aiVoiceEnabled);
    const totalHotspots = rooms.reduce((sum, r) => sum + (r.hotspots?.length || 0), 0);

    // ---- Ảnh 360 -------------------------------------------------------
    const totalBytes = panoramas.reduce((sum: number, p: any) => sum + (p.sizeBytes || 0), 0);
    const framesSamples = panoramas
      .map((p: any) => p.inputFramesCount || 0)
      .filter((n: number) => n > 0);

    // Ảnh mồ côi: đã ghép xong nhưng chưa gắn vào gian phòng nào
    const orphanPanoramas = panoramas.filter((p: any) => {
      if (p.linkedRoomId) return false;
      const ten = tenTep(p.panoramaUrl || p.url || '') || (p.filename || '').toLowerCase();
      return !ten || !tenTepDaGan.has(ten);
    });

    // Sản lượng ghép ảnh 30 ngày gần nhất, tính cả những ngày bằng 0
    const DAYS = 30;
    const today = new Date();
    const byDayMap = new Map<string, number>();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      byDayMap.set(toDayKey(d), 0);
    }
    panoramas.forEach((p: any) => {
      if (!p.createdAt) return;
      const key = toDayKey(new Date(p.createdAt));
      if (byDayMap.has(key)) byDayMap.set(key, (byDayMap.get(key) || 0) + 1);
    });
    const panoramasByDay = [...byDayMap.entries()].map(([date, count]) => ({ date, count }));

    // Tích lũy kho ảnh: số ảnh đã có TRƯỚC cửa sổ 30 ngày cộng dồn theo từng ngày,
    // để đường biểu diễn phản ánh đúng quy mô kho chứ không bắt đầu lại từ 0.
    const windowStart = new Date(today);
    windowStart.setDate(today.getDate() - (DAYS - 1));
    windowStart.setHours(0, 0, 0, 0);
    const baselineCount = panoramas.filter(
      (p: any) => p.createdAt && new Date(p.createdAt) < windowStart
    ).length;
    let running = baselineCount;
    const panoramasCumulative = panoramasByDay.map((d) => {
      running += d.count;
      return { date: d.date, total: running };
    });

    // Phân bố số ảnh góc đầu vào, đối chiếu chuẩn 16-24 tấm của thuật toán ghép.
    // Panorama dưới 16 tấm là nguồn thiếu gối đầu, dễ hở mảng.
    const framesBuckets = [
      { label: 'Dưới 8', min: 1, max: 7, belowStandard: true },
      { label: '8 - 15', min: 8, max: 15, belowStandard: true },
      { label: '16 - 24', min: 16, max: 24, belowStandard: false },
      { label: 'Trên 24', min: 25, max: Number.MAX_SAFE_INTEGER, belowStandard: false }
    ].map((b) => ({
      label: b.label,
      belowStandard: b.belowStandard,
      count: framesSamples.filter((n: number) => n >= b.min && n <= b.max).length
    }));
    const framesBelowStandard = framesSamples.filter((n: number) => n < 16).length;

    // ---- Độ phủ đa ngôn ngữ -------------------------------------------
    // Một phòng coi là đã dịch sang ngôn ngữ X khi có ít nhất tên hoặc mô tả.
    const activeLanguages = languages.filter((l) => l.isActive);

    /**
     * Mức độ dịch của một phòng sang một ngôn ngữ.
     * Chỉ có tên mà thiếu mô tả thì khách vẫn không đọc được nội dung phòng,
     * nên không thể tính là đã dịch xong.
     */
    const mucDoDich = (room: IRoom, lang: ILanguage): 'du' | 'mot-phan' | 'chua' => {
      if (lang.isDefault) return 'du'; // tiếng gốc nằm ở các trường chính
      const t = (room.translations as any)?.[lang.code];
      if (!t) return 'chua';
      const coTen = !!(t.name && String(t.name).trim());
      const coMoTa = !!(t.description && String(t.description).trim());
      if (coTen && coMoTa) return 'du';
      if (coTen || coMoTa) return 'mot-phan';
      return 'chua';
    };

    const languageCoverage = activeLanguages.map((lang) => {
      let du = 0;
      let motPhan = 0;
      rooms.forEach((r) => {
        const m = mucDoDich(r, lang);
        if (m === 'du') du++;
        else if (m === 'mot-phan') motPhan++;
      });
      return {
        code: lang.code,
        nativeName: lang.nativeName,
        isDefault: !!lang.isDefault,
        translatedRooms: du,
        partialRooms: motPhan,
        totalRooms: rooms.length,
        coveragePercent: rooms.length ? Math.round((du / rooms.length) * 100) : 0
      };
    });

    // ---- Việc tồn đọng -------------------------------------------------
    const pending: PendingIssue[] = [];
    rooms.forEach((r) => {
      const issues: string[] = [];
      if (!r.panoramaUrl) issues.push('Chưa có ảnh 360');
      if (!(r.hotspots?.length)) issues.push('Chưa có điểm neo');
      if (r.aiVoiceEnabled && !r.aiScript) issues.push('Bật thuyết minh AI nhưng thiếu kịch bản');
      const chuaDich = activeLanguages
        .filter((l) => !l.isDefault && mucDoDich(r, l) === 'chua')
        .map((l) => l.nativeName);
      const dichDangDo = activeLanguages
        .filter((l) => !l.isDefault && mucDoDich(r, l) === 'mot-phan')
        .map((l) => l.nativeName);
      if (chuaDich.length) issues.push(`Thiếu bản dịch: ${chuaDich.join(', ')}`);
      if (dichDangDo.length) issues.push(`Bản dịch còn dang dở: ${dichDangDo.join(', ')}`);
      if (!r.active) issues.push('Đang tắt, khách không xem được');
      if (issues.length) {
        pending.push({ roomId: r.id, code: r.code, name: r.name, issues });
      }
    });

    // Tồn đọng gom theo LOẠI việc, để thấy công sức đang dồn vào đâu
    const issueTypeCount = new Map<string, number>();
    pending.forEach((row) => {
      row.issues.forEach((issue) => {
        // Gộp mọi biến thể "Thiếu bản dịch: X, Y" về một loại duy nhất
        const key = issue.startsWith('Thiếu bản dịch')
          ? 'Thiếu bản dịch'
          : issue.startsWith('Bản dịch còn dang dở')
            ? 'Bản dịch còn dang dở'
            : issue;
        issueTypeCount.set(key, (issueTypeCount.get(key) || 0) + 1);
      });
    });
    const pendingByType = [...issueTypeCount.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // ---- Lượt truy cập -------------------------------------------------
    // Đếm từ collection visitevents. Mỗi sự kiện là ẩn danh: không IP, không email.
    const theoNgay = new Map<string, {
      phienDangNhap: Set<string>;
      phienVangLai: Set<string>;
      khach: Set<string>;
    }>();
    for (const [ngay] of byDayMap) {
      theoNgay.set(ngay, { phienDangNhap: new Set(), phienVangLai: new Set(), khach: new Set() });
    }

    const phienDaThay = new Set<string>();
    const khachDaThay = new Set<string>();
    const khachDangNhap = new Set<string>();
    const theoThietBi = new Map<string, Set<string>>();
    const luotTheoPhong = new Map<string, number>();

    suKien.forEach((e: any) => {
      if (!e?.createdAt) return;
      const ngay = toDayKey(new Date(e.createdAt));
      const o = theoNgay.get(ngay);
      if (o) {
        (e.isAuthenticated ? o.phienDangNhap : o.phienVangLai).add(e.sessionId);
        o.khach.add(e.visitorId);
      }
      phienDaThay.add(e.sessionId);
      khachDaThay.add(e.visitorId);
      if (e.isAuthenticated) khachDangNhap.add(e.visitorId);

      const tb = e.device || 'khong-ro';
      if (!theoThietBi.has(tb)) theoThietBi.set(tb, new Set());
      theoThietBi.get(tb)!.add(e.sessionId);

      if (e.type === 'room_view' && e.roomId) {
        luotTheoPhong.set(e.roomId, (luotTheoPhong.get(e.roomId) || 0) + 1);
      }
    });

    const tenPhong = new Map(rooms.map((r) => [r.id, { code: r.code, name: r.name }]));

    const visitors = {
      // Hệ thống chưa có đăng nhập nên chuỗi "đã đăng nhập" hiện luôn bằng 0.
      // Giữ nguyên cấu trúc để khi bổ sung đăng nhập là có số ngay, không phải sửa báo cáo.
      hasAuthSystem: false,
      totalEvents: suKien.length,
      totalSessions: phienDaThay.size,
      uniqueVisitors: khachDaThay.size,
      authenticatedVisitors: khachDangNhap.size,
      anonymousVisitors: khachDaThay.size - khachDangNhap.size,
      byDay: [...theoNgay.entries()].map(([date, o]) => ({
        date,
        dangNhap: o.phienDangNhap.size,
        vangLai: o.phienVangLai.size,
        khachDuyNhat: o.khach.size
      })),
      byDevice: [...theoThietBi.entries()]
        .map(([device, set]) => ({ device, sessions: set.size }))
        .sort((a, b) => b.sessions - a.sessions),
      topRooms: [...luotTheoPhong.entries()]
        .map(([roomId, views]) => ({
          roomId,
          code: tenPhong.get(roomId)?.code || roomId,
          name: tenPhong.get(roomId)?.name || 'Gian phòng đã xóa',
          views
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8)
    };

    const payload = {
      rooms: {
        total: rooms.length,
        active: activeRooms.length,
        inactive: rooms.length - activeRooms.length,
        withPanorama: roomsWithPanorama.length,
        withOwnPanorama: roomsWithOwnPanorama.length,
        withExternalPanorama: roomsWithPanorama.length - roomsWithOwnPanorama.length,
        withHotspots: roomsWithHotspots.length,
        aiEnabled: roomsAiEnabled.length,
        totalHotspots,
        avgHotspots: rooms.length ? Number((totalHotspots / rooms.length).toFixed(1)) : 0,
        digitizationPercent: rooms.length
          ? Math.round((roomsWithPanorama.length / rooms.length) * 100)
          : 0
      },
      panoramas: {
        total: panoramas.length,
        totalBytes,
        orphanCount: orphanPanoramas.length,
        orphans: orphanPanoramas.slice(0, 20).map((p: any) => ({
          id: p.id,
          filename: p.filename,
          title: p.title,
          sizeBytes: p.sizeBytes || 0,
          createdAt: p.createdAt
        })),
        avgInputFrames: framesSamples.length
          ? Number((framesSamples.reduce((a: number, b: number) => a + b, 0) / framesSamples.length).toFixed(1))
          : 0,
        framesSampleCount: framesSamples.length,
        framesBelowStandard,
        framesBuckets,
        byDay: panoramasByDay,
        cumulative: panoramasCumulative
      },
      languages: {
        totalRegistered: languages.length,
        activeCount: activeLanguages.length,
        coverage: languageCoverage
      },
      pending,
      pendingByType,
      // Con số này do quản trị viên tự nhập trong form sửa gian phòng, KHÔNG phải
      // số đo tự động. Giao diện phải nói rõ điều đó để không ai hiểu nhầm là đo thật.
      manualMetrics: {
        totalQrScans: rooms.reduce((sum, r) => sum + (r.qrScanCount || 0), 0),
        source: 'Quản trị viên nhập tay trong form sửa gian phòng'
      },
      visitors,
      visitorAnalytics: {
        available: true,
        reason:
          'Lượt truy cập đếm từ nhật ký sự kiện ẩn danh. Chưa có hệ thống đăng nhập nên chuỗi "đã đăng nhập" còn bằng 0.'
      },
      generatedAt: new Date().toISOString()
    };

    return payload;
  }
};

analyticsRouter.get('/overview', async (req: Request, res: Response) => {
  try {
    if (req.query.refresh !== '1') {
      const cached = await cacheGet<any>(CACHE_KEY);
      if (cached) {
        return res.json({ success: true, data: cached, fromCache: true });
      }
    }

    const moc30Ngay = new Date();
    moc30Ngay.setDate(moc30Ngay.getDate() - 29);
    moc30Ngay.setHours(0, 0, 0, 0);

    const [rooms, panoramas, languages, suKien] = await Promise.all([
      RoomModel.find({}).sort({ orderIndex: 1 }).lean<IRoom[]>(),
      PanoramaModel.find({}).lean(),
      Language.find({}).sort({ order: 1 }).lean<ILanguage[]>(),
      VisitEventModel.find({ createdAt: { $gte: moc30Ngay } })
        .select('type sessionId visitorId isAuthenticated roomId device createdAt')
        .lean()
    ]);

    const payload = buildOverview(rooms, panoramas as any[], languages, suKien as any[]);

    await cacheSet(CACHE_KEY, payload, CACHE_TTL_SECONDS);
    res.json({ success: true, data: payload });
  } catch (err: any) {
    console.error('[Analytics Overview Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
