import { Router, Request, Response } from "express";

export const adminRouter = Router();

// 1. Gate operations - Ticket Scan Verification (<100ms)
adminRouter.post("/scan-ticket", (req: Request, res: Response) => {
  const { ticketCode } = req.body;
  if (!ticketCode) {
    res.status(400).json({ success: false, error: "Mã vé không được để trống" });
    return;
  }

  // Fast hash/redis check mock
  const isValid = ticketCode.startsWith("VIP") || ticketCode.startsWith("TK-") || ticketCode.length >= 6;

  if (isValid) {
    res.json({
      success: true,
      valid: true,
      ticketCode,
      visitorName: "Du khách Nguyễn Văn A",
      ticketType: "Vé Người Lớn - Hộ Chiếu Di Sản",
      scannedAt: new Date().toISOString(),
      responseTimeMs: Math.floor(Math.random() * 45) + 15,
    });
  } else {
    res.status(422).json({
      success: false,
      valid: false,
      error: "Vé không hợp lệ hoặc đã qua cửa trước đó!",
    });
  }
});

// 2. Analytics overview metrics
adminRouter.get("/analytics", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalVisitorsToday: 1248,
      ticketsScannedGate: 1102,
      active3DTours: 345,
      voiceAIListeners: 890,
      popularRoom: "Gian Tiền Sử & Cổ Đại (Đông Sơn)",
      gatePassRatePct: 98.4,
    },
  });
});

// 3. Feature toggles configuration
let featureConfig = {
  enable3D: true,
  enableVoiceAI: true,
  enableQuiz: true,
  enableTourBooking: true,
  enableBroadcast: true,
  maintenanceMode: false,
};

adminRouter.get("/config", (req: Request, res: Response) => {
  res.json({ success: true, data: featureConfig });
});

adminRouter.put("/config", (req: Request, res: Response) => {
  featureConfig = { ...featureConfig, ...req.body };
  res.json({ success: true, message: "Đã cập nhật cấu hình tính năng hệ thống!", data: featureConfig });
});

// 4. RBAC Roles & Permissions mapping
const rbacRoles = [
  {
    roleId: "ROLE_SUPER_ADMIN",
    title: "Giám Đốc / Quản Trị Viên Tối Cao",
    permissions: ["GATE_OPS", "CMS", "3DGS_TOUR", "MAP_NAV", "SYS_ADMIN"],
  },
  {
    roleId: "ROLE_GATE_STAFF",
    title: "Cán Bộ Soát Vé Cổng",
    permissions: ["GATE_OPS"],
  },
  {
    roleId: "ROLE_CURATOR",
    title: "Cán Bộ Quản Lý Kho & Hiện Vật",
    permissions: ["CMS", "3DGS_TOUR"],
  },
  {
    roleId: "ROLE_EXHIBIT_ENGINEER",
    title: "Kỹ Sư Trưng Bày & Sơ Đồ Mặt Bằng",
    permissions: ["3DGS_TOUR", "MAP_NAV"],
  },
];

adminRouter.get("/roles", (req: Request, res: Response) => {
  res.json({ success: true, data: rbacRoles });
});
