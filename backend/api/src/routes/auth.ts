import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

export const authRouter = Router();

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: "member" | "staff" | "super_admin";
  assignedRoles: string[]; // List of role IDs
  allowedPages: string[];  // List of page IDs (e.g. ["admin-artifacts"])
  pagePermissions: Record<string, {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve?: boolean;
  }>;
  createdAt: string;
  lastLoginAt: string;
}

export interface PageRole {
  id: string;
  pageId: string;
  name: string;
  description: string;
  category: "GATE_OPS" | "CMS" | "3DGS_TOUR" | "MAP_NAV" | "ANALYTICS" | "SYSTEM" | "APPROVAL";
  defaultPermissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve?: boolean;
  };
  assignedUsers: string[]; // User emails
}

interface StoredOTP {
  email: string;
  otp: string;
  expiresAt: number;
  createdAt: number;
}

// ==========================================
// 2. IN-MEMORY STORAGE & SEED DATA
// ==========================================

const otpCache = new Map<string, StoredOTP>();

// 11 PAGE ROLES (MỖI PAGE LÀ 1 ROLE RIÊNG)
const PAGE_ROLES: PageRole[] = [
  {
    id: "ROLE_SCAN",
    pageId: "admin-scan",
    name: "Quản Lý Soát Vé Cổng",
    description: "Soát vé quang học bằng camera/máy quét dưới 100ms, kiểm soát lượt vào",
    category: "GATE_OPS",
    defaultPermissions: { view: true, create: true, edit: false, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ARTIFACTS",
    pageId: "admin-artifacts",
    name: "Quản Lý Kho Hiện Vật",
    description: "Biên soạn bảng chú thích, cập nhật niên đại, tải ảnh 8K và mô hình 3D cổ vật",
    category: "CMS",
    defaultPermissions: { view: true, create: true, edit: true, delete: true, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ROOMS",
    pageId: "admin-rooms",
    name: "Quản Lý Gian Sảnh 360°",
    description: "Cấu hình ảnh photosphere 360, độ cao trần và ánh sáng sảnh trưng bày",
    category: "3DGS_TOUR",
    defaultPermissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_TOUR360",
    pageId: "admin-tour360",
    name: "Quản Lý Ghim Cổ Vật Tour 360°",
    description: "Định vị điểm ghim tương tác 3D trên tủ kính hiện vật trong không gian 360",
    category: "3DGS_TOUR",
    defaultPermissions: { view: true, create: true, edit: true, delete: true, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_NODES",
    pageId: "admin-nodes",
    name: "Quản Lý Walk Nodes 360°",
    description: "Thiết lập các vòng tròn bước chân di chuyển lướt mượt mà trên sàn nhà",
    category: "3DGS_TOUR",
    defaultPermissions: { view: true, create: true, edit: true, delete: true, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_BUILDINGS",
    pageId: "admin-buildings",
    name: "Quản Lý Tòa Nhà Kiến Trúc",
    description: "Quản lý danh mục tòa nhà kiến trúc bảo tàng và phân khu sảnh",
    category: "MAP_NAV",
    defaultPermissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_MAP",
    pageId: "admin-map",
    name: "Sơ Đồ Mặt Bằng & Dẫn Đường",
    description: "Chỉnh sửa tọa độ phòng và các điểm POI trên bản đồ sơ đồ tầng",
    category: "MAP_NAV",
    defaultPermissions: { view: true, create: true, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ANALYTICS",
    pageId: "admin-analytics",
    name: "Báo Cáo Thống Kê Toàn Diện",
    description: "Xem biểu đồ lưu lượng khách, số lượt quét vé, tương tác 3D và xuất báo cáo",
    category: "ANALYTICS",
    defaultPermissions: { view: true, create: false, edit: false, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_SETTINGS",
    pageId: "admin-settings",
    name: "Cấu Hình Hệ Thống & Toggles",
    description: "Tùy biến thương hiệu bảo tàng, khẩu hiệu, và bật/tắt Feature Toggles",
    category: "SYSTEM",
    defaultPermissions: { view: true, create: false, edit: true, delete: false, approve: false },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_ROLES",
    pageId: "admin-roles",
    name: "Phân Quyền Vai Trò (RBAC)",
    description: "Thiết lập quyền hạn 1 Page = 1 Role và phân bổ cán bộ đảm nhiệm",
    category: "SYSTEM",
    defaultPermissions: { view: true, create: true, edit: true, delete: true, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn"]
  },
  {
    id: "ROLE_APPROVALS",
    pageId: "admin-approvals",
    name: "Duyệt Yêu Cầu Thêm Mới",
    description: "Thẩm định và phê duyệt các yêu cầu thêm sảnh, hiện vật, tòa nhà từ cán bộ",
    category: "APPROVAL",
    defaultPermissions: { view: true, create: false, edit: false, delete: false, approve: true },
    assignedUsers: ["admin@museum.hcmc.vn"]
  }
];

// USER STORE
const USERS_DB: UserRecord[] = [
  {
    id: "usr-admin-super",
    email: "admin@museum.hcmc.vn",
    name: "Quản Trị Viên Tối Cao",
    role: "super_admin",
    assignedRoles: PAGE_ROLES.map(r => r.id),
    allowedPages: PAGE_ROLES.map(r => r.pageId),
    pagePermissions: PAGE_ROLES.reduce((acc, r) => {
      acc[r.pageId] = { view: true, create: true, edit: true, delete: true, approve: true };
      return acc;
    }, {} as UserRecord["pagePermissions"]),
    createdAt: "2026-09-01T00:00:00.000Z",
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "usr-curator-long",
    email: "long.curator@museum.hcmc.vn",
    name: "ThS. Lê Quang Long",
    role: "staff",
    assignedRoles: ["ROLE_ARTIFACTS", "ROLE_APPROVALS"],
    allowedPages: ["admin-artifacts", "admin-approvals"],
    pagePermissions: {
      "admin-artifacts": { view: true, create: true, edit: true, delete: false, approve: true },
      "admin-approvals": { view: true, create: false, edit: false, delete: false, approve: true }
    },
    createdAt: "2026-09-05T00:00:00.000Z",
    lastLoginAt: new Date().toISOString()
  }
];

// Helper: Calculate user's allowed pages and permissions from assigned page roles
function recalculateUserPermissions(user: UserRecord) {
  if (user.role === "super_admin") {
    user.allowedPages = PAGE_ROLES.map(r => r.pageId);
    user.pagePermissions = PAGE_ROLES.reduce((acc, r) => {
      acc[r.pageId] = { view: true, create: true, edit: true, delete: true, approve: true };
      return acc;
    }, {} as UserRecord["pagePermissions"]);
    return;
  }

  const allowedPagesSet = new Set<string>();
  const pagePerms: UserRecord["pagePermissions"] = {};

  user.assignedRoles.forEach(roleId => {
    const role = PAGE_ROLES.find(r => r.id === roleId);
    if (role) {
      allowedPagesSet.add(role.pageId);
      pagePerms[role.pageId] = { ...role.defaultPermissions };
    }
  });

  user.allowedPages = Array.from(allowedPagesSet);
  user.pagePermissions = pagePerms;

  // If user has at least one allowed admin page, upgrade role to staff, else member
  if (user.allowedPages.length > 0) {
    user.role = "staff";
  } else {
    user.role = "member";
  }
}

// ==========================================
// 3. NODEMAILER EMAIL TRANSPORTER
// ==========================================

async function sendOtpEmail(toEmail: string, otp: string): Promise<{ success: boolean; note?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0e0e; color: #f5f2eb; margin: 0; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: #1a1818; border: 1px solid #d4af37; border-radius: 12px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #332d20; padding-bottom: 20px; margin-bottom: 25px; }
        .title { color: #d4af37; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
        .subtitle { color: #a19d94; font-size: 13px; margin-top: 5px; }
        .otp-container { background: #0f0e0e; border: 2px dashed #d4af37; border-radius: 8px; text-align: center; padding: 20px; margin: 25px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #d4af37; font-family: monospace; }
        .desc { font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .footer { font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #332d20; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2 class="title">BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH</h2>
          <div class="subtitle">Nền Tảng Trải Nghiệm Di Sản Số & Tour Ảo 3D</div>
        </div>
        <p class="desc">Xin chào quý khách,</p>
        <p class="desc">Bạn đang thực hiện đăng nhập vào hệ thống Bảo tàng Lịch sử TP.HCM. Dưới đây là mã xác thực OTP của bạn:</p>
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        <p class="desc" style="color: #e2e8f0; font-size: 13px;">
          * Lưu ý: Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo mật thông tin vé và bộ sưu tập tem di sản của bạn.
        </p>
        <div class="footer">
          Bảo tàng Lịch sử TP. Hồ Chí Minh — Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM
        </div>
      </div>
    </body>
    </html>
  `;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Bảo Tàng Lịch Sử TP.HCM" <${smtpUser}>`,
        to: toEmail,
        subject: `[Bảo Tàng Lịch Sử] Mã OTP Xác Thực Đăng Nhập: ${otp}`,
        html: htmlContent
      });

      console.log(`[Email OTP] Sent successfully via SMTP to: ${toEmail}`);
      return { success: true };
    } catch (err: any) {
      console.error("[Email OTP] SMTP send failed:", err.message);
      return {
        success: true,
        note: `SMTP không kết nối được (${err.message}). Mã OTP test: ${otp}`
      };
    }
  }

  // Fallback for Local Dev / Test without SMTP credentials
  console.log(`=======================================================`);
  console.log(`📧 [SERVER EMAIL OTP DISPATCH]`);
  console.log(`👤 Người nhận: ${toEmail}`);
  console.log(`🔑 MÃ OTP XÁC THỰC: [ ${otp} ] (Hiệu lực: 5 phút)`);
  console.log(`=======================================================`);

  return {
    success: true,
    note: `Mã OTP đã được tạo trên máy chủ (Console log: ${otp})`
  };
}

// ==========================================
// 4. API ROUTES IMPLEMENTATION
// ==========================================

// 1. POST /api/v1/auth/otp/send - Generate & send 6-digit OTP via Email
authRouter.post("/otp/send", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập địa chỉ Email hợp lệ!"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpCache.set(normalizedEmail, {
    email: normalizedEmail,
    otp,
    expiresAt,
    createdAt: Date.now()
  });

  const mailResult = await sendOtpEmail(normalizedEmail, otp);

  res.json({
    success: true,
    message: `Mã OTP đã được gửi đến email ${normalizedEmail}!`,
    email: normalizedEmail,
    expiresInSeconds: 300,
    devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    note: mailResult.note
  });
});

// 2. POST /api/v1/auth/otp/verify - Verify OTP and issue session with user roles
authRouter.post("/otp/verify", (req: Request, res: Response) => {
  const { email, otp, name } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp đầy đủ Email và Mã OTP!"
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const cached = otpCache.get(normalizedEmail);

  if (!cached) {
    return res.status(400).json({
      success: false,
      message: "Không tìm thấy yêu cầu gửi OTP cho email này. Vui lòng bấm gửi lại mã!"
    });
  }

  if (Date.now() > cached.expiresAt) {
    otpCache.delete(normalizedEmail);
    return res.status(400).json({
      success: false,
      message: "Mã OTP đã hết hạn sử dụng. Vui lòng yêu cầu mã mới!"
    });
  }

  if (cached.otp !== otp.trim()) {
    return res.status(400).json({
      success: false,
      message: "Mã OTP không chính xác. Vui lòng kiểm tra lại!"
    });
  }

  // OTP is valid! Delete used OTP
  otpCache.delete(normalizedEmail);

  // Find existing user or create a NEW NORMAL USER (member role by default)
  let user = USERS_DB.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const defaultName = name || normalizedEmail.split("@")[0];
    user = {
      id: "usr-" + Date.now(),
      email: normalizedEmail,
      name: defaultName,
      role: "member",          // DEFAULT: User bình thường
      assignedRoles: [],       // Chưa có quyền quản trị
      allowedPages: [],        // Dashboard không hiện page nào
      pagePermissions: {},
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    USERS_DB.push(user);
    console.log(`[Auth] New normal user registered: ${normalizedEmail}`);
  } else {
    user.lastLoginAt = new Date().toISOString();
    recalculateUserPermissions(user);
  }

  // Issue session token
  const token = `token_${Buffer.from(normalizedEmail + ":" + Date.now()).toString("base64")}`;

  res.json({
    success: true,
    message: `Xác thực thành công! Chào mừng ${user.name}.`,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedRoles: user.assignedRoles,
      allowedPages: user.allowedPages,
      pagePermissions: user.pagePermissions
    }
  });
});

// 3. GET /api/v1/auth/me - Get current authenticated user profile & permissions
authRouter.get("/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const emailQuery = req.query.email as string;

  let emailToFind = "";
  if (emailQuery) {
    emailToFind = emailQuery.trim().toLowerCase();
  } else if (authHeader && authHeader.startsWith("Bearer token_")) {
    try {
      const decoded = Buffer.from(authHeader.replace("Bearer token_", ""), "base64").toString("utf-8");
      emailToFind = decoded.split(":")[0]?.toLowerCase();
    } catch (_) {}
  }

  if (!emailToFind) {
    return res.status(401).json({
      success: false,
      message: "Chưa xác thực hoặc không tìm thấy phiên đăng nhập!"
    });
  }

  const user = USERS_DB.find(u => u.email.toLowerCase() === emailToFind);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy hồ sơ người dùng trong hệ thống!"
    });
  }

  recalculateUserPermissions(user);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedRoles: user.assignedRoles,
      allowedPages: user.allowedPages,
      pagePermissions: user.pagePermissions
    }
  });
});

// 4. GET /api/v1/auth/roles - List all 11 Page Roles with permissions & assigned users
authRouter.get("/roles", (req: Request, res: Response) => {
  res.json({
    success: true,
    count: PAGE_ROLES.length,
    roles: PAGE_ROLES
  });
});

// 5. GET /api/v1/auth/users - List all users in system for Admin role assignment
authRouter.get("/users", (req: Request, res: Response) => {
  res.json({
    success: true,
    count: USERS_DB.length,
    users: USERS_DB.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      assignedRoles: u.assignedRoles,
      allowedPages: u.allowedPages,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }))
  });
});

// 6. POST /api/v1/auth/roles/assign - Assign user to a specific Page Role (1 Page = 1 Role)
authRouter.post("/roles/assign", (req: Request, res: Response) => {
  const { userEmail, roleId, action } = req.body; // action: "assign" | "unassign"

  if (!userEmail || !roleId) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp đầy đủ userEmail và roleId!"
    });
  }

  const normalizedEmail = userEmail.trim().toLowerCase();
  const role = PAGE_ROLES.find(r => r.id === roleId);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy vai trò trang với mã: ${roleId}`
    });
  }

  let user = USERS_DB.find(u => u.email.toLowerCase() === normalizedEmail);

  // If user does not exist in DB yet, create user with member role first
  if (!user) {
    user = {
      id: "usr-" + Date.now(),
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0],
      role: "member",
      assignedRoles: [],
      allowedPages: [],
      pagePermissions: {},
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    USERS_DB.push(user);
  }

  if (action === "unassign") {
    // Remove role from user
    user.assignedRoles = user.assignedRoles.filter(rId => rId !== roleId);
    role.assignedUsers = role.assignedUsers.filter(e => e.toLowerCase() !== normalizedEmail);
  } else {
    // Assign role to user
    if (!user.assignedRoles.includes(roleId)) {
      user.assignedRoles.push(roleId);
    }
    if (!role.assignedUsers.map(e => e.toLowerCase()).includes(normalizedEmail)) {
      role.assignedUsers.push(normalizedEmail);
    }
  }

  recalculateUserPermissions(user);

  console.log(`[RBAC] Updated user ${normalizedEmail}: allowedPages =`, user.allowedPages);

  res.json({
    success: true,
    message: action === "unassign"
      ? `Đã gỡ quyền ${role.name} của ${normalizedEmail}!`
      : `Đã cấp quyền ${role.name} (${role.pageId}) cho ${normalizedEmail}! Khi đăng nhập vào Dashboard, cán bộ chỉ thấy trang này.`,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedRoles: user.assignedRoles,
      allowedPages: user.allowedPages,
      pagePermissions: user.pagePermissions
    }
  });
});

// 7. POST /api/v1/auth/roles/update-permissions - Update checkboxes (view/create/edit/delete/approve)
authRouter.post("/roles/update-permissions", (req: Request, res: Response) => {
  const { roleId, permissions } = req.body;

  if (!roleId || !permissions) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp roleId và object permissions!"
    });
  }

  const role = PAGE_ROLES.find(r => r.id === roleId);
  if (!role) {
    return res.status(404).json({
      success: false,
      message: `Không tìm thấy vai trò với mã: ${roleId}`
    });
  }

  role.defaultPermissions = {
    ...role.defaultPermissions,
    ...permissions
  };

  // Re-sync permissions for all assigned users
  USERS_DB.forEach(user => {
    if (user.assignedRoles.includes(roleId)) {
      recalculateUserPermissions(user);
    }
  });

  res.json({
    success: true,
    message: `Đã cập nhật bảng quyền hạn chi tiết cho trang ${role.name}!`,
    role
  });
});
