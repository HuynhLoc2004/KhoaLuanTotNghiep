// Dynamic Permission definition for a single page
export interface PagePermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve?: boolean;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "member" | "staff" | "super_admin";
  assignedRoles: string[]; // List of role IDs
  allowedPages: string[];  // List of page IDs (e.g. ["admin-artifacts", "admin-scan"])
  pagePermissions: Record<string, PagePermissionActions>;
}

export interface UserProfile {
  name: string;
  phone?: string;
  email: string;
  role: "visitor" | "student" | "member";
  level: string;
  exp: number;
  stampsCount: number;
  ticketsCount: number;
  ticketCode: string;
  passportStamps: string[];
}

export interface AdminProfile {
  email: string;
  name: string;
  role: "super_admin" | "staff" | "curator" | "gate_staff" | "director";
  roleTitle: string;
}

export const ALL_ADMIN_PAGES = [
  "admin-scan",
  "admin-artifacts",
  "admin-rooms",
  "admin-tour360",
  "admin-nodes",
  "admin-buildings",
  "admin-map",
  "admin-analytics",
  "admin-settings",
  "admin-roles",
  "admin-approvals"
];

// Global Auth State
export const AuthState = {
  isVisitorLoggedIn: false,
  isAdminLoggedIn: false,

  currentUser: null as UserSession | null,

  visitor: {
    name: "Khách Tham Quan",
    phone: "0908 123 456",
    email: "khachthamquan@gmail.com",
    role: "member",
    level: "Nhà Khám Phá Mới",
    exp: 100,
    stampsCount: 1,
    ticketsCount: 1,
    ticketCode: "TKT-VN-98421",
    passportStamps: ["Dấu Ấn Óc Eo"]
  } as UserProfile,

  admin: {
    email: "admin@museum.hcmc.vn",
    name: "Quản Trị Viên Tối Cao",
    role: "super_admin",
    roleTitle: "Quản Trị Viên Toàn Quyền"
  } as AdminProfile,

  // Initialize session from localStorage
  init() {
    try {
      const savedUser = localStorage.getItem("museum_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as UserSession;
        this.currentUser = parsed;
        this.isVisitorLoggedIn = true;

        this.visitor.name = parsed.name;
        this.visitor.email = parsed.email;

        if (parsed.role === "super_admin" || (parsed.allowedPages && parsed.allowedPages.length > 0)) {
          this.isAdminLoggedIn = true;
          this.admin.email = parsed.email;
          this.admin.name = parsed.name;
          this.admin.role = parsed.role;
          this.admin.roleTitle = parsed.role === "super_admin"
            ? "Quản Trị Viên Toàn Quyền"
            : `Cán Bộ Quản Trị (${parsed.allowedPages.length} Trang)`;
        }
      } else {
        // Fallback backward compatibility checks
        if (localStorage.getItem("museum_visitor_auth") === "true") {
          this.isVisitorLoggedIn = true;
        }
        if (localStorage.getItem("museum_admin_auth") === "true") {
          this.isAdminLoggedIn = true;
        }
      }
    } catch (_) {}
  },

  // Check if current user can access a specific page
  canAccessPage(pageId: string): boolean {
    if (!this.isAdminLoggedIn && !this.isVisitorLoggedIn) return false;

    // Super Admin has unrestricted access to all pages
    if (this.currentUser?.role === "super_admin" || this.admin.role === "super_admin") {
      return true;
    }

    if (!this.currentUser) {
      // Fallback if logged in via legacy admin login form
      return true;
    }

    const cleanPage = pageId.toLowerCase().replace("#", "").split("?")[0];
    const allowed = this.currentUser.allowedPages || [];

    return allowed.some(p => p.toLowerCase() === cleanPage || cleanPage.includes(p.toLowerCase()));
  },

  // Check if user has permission for a specific action on a page (view, create, edit, delete, approve)
  hasPermission(pageId: string, action: "view" | "create" | "edit" | "delete" | "approve"): boolean {
    if (this.currentUser?.role === "super_admin" || this.admin.role === "super_admin") {
      return true;
    }

    if (!this.currentUser) return false;

    const cleanPage = pageId.toLowerCase().replace("#", "").split("?")[0];
    const perms = this.currentUser.pagePermissions?.[cleanPage];

    if (!perms) return false;
    return perms[action] === true;
  },

  // Check if user has access to Admin Dashboard (at least 1 admin page or super_admin)
  canAccessAdmin(): boolean {
    if (this.currentUser?.role === "super_admin" || this.admin.role === "super_admin") {
      return true;
    }
    if (this.currentUser && this.currentUser.allowedPages && this.currentUser.allowedPages.length > 0) {
      return true;
    }
    return this.isAdminLoggedIn;
  },

  // Get first allowed page for redirect when user lands on an unauthorized tab
  getFirstAllowedPage(): string {
    if (this.currentUser?.role === "super_admin" || this.admin.role === "super_admin") {
      return "admin-scan";
    }
    if (this.currentUser && this.currentUser.allowedPages && this.currentUser.allowedPages.length > 0) {
      return this.currentUser.allowedPages[0];
    }
    return "home";
  },

  // Login with verified User Session from server
  loginWithServerSession(user: UserSession, token: string) {
    this.currentUser = user;
    this.isVisitorLoggedIn = true;

    this.visitor.name = user.name;
    this.visitor.email = user.email;

    localStorage.setItem("museum_token", token);
    localStorage.setItem("museum_current_user", JSON.stringify(user));
    localStorage.setItem("museum_visitor_auth", "true");

    if (user.role === "super_admin" || (user.allowedPages && user.allowedPages.length > 0)) {
      this.isAdminLoggedIn = true;
      this.admin.email = user.email;
      this.admin.name = user.name;
      this.admin.role = user.role;
      this.admin.roleTitle = user.role === "super_admin"
        ? "Quản Trị Viên Toàn Quyền"
        : `Cán Bộ Quản Trị (${user.allowedPages.length} Trang)`;
      localStorage.setItem("museum_admin_auth", "true");
    } else {
      this.isAdminLoggedIn = false;
      localStorage.removeItem("museum_admin_auth");
    }
  },

  // Legacy visitor login
  loginVisitor(emailOrPhone: string, name?: string) {
    this.isVisitorLoggedIn = true;
    if (emailOrPhone.includes("@")) {
      this.visitor.email = emailOrPhone;
    } else {
      this.visitor.phone = emailOrPhone;
    }
    if (name) this.visitor.name = name;
    localStorage.setItem("museum_visitor_auth", "true");
  },

  logoutVisitor() {
    this.isVisitorLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem("museum_visitor_auth");
    localStorage.removeItem("museum_current_user");
    localStorage.removeItem("museum_token");
  },

  // Legacy admin login
  loginAdmin(role: "super_admin" | "staff" | "curator" | "gate_staff" | "director" = "super_admin", roleTitle?: string) {
    this.isAdminLoggedIn = true;
    this.admin.role = role;
    if (roleTitle) {
      this.admin.roleTitle = roleTitle;
    } else if (role === "super_admin") {
      this.admin.roleTitle = "Quản Trị Viên Toàn Quyền";
    } else {
      this.admin.roleTitle = "Cán Bộ Quản Trị";
    }
    localStorage.setItem("museum_admin_auth", "true");
  },

  canApprove(): boolean {
    return this.admin.role === "super_admin" ||
      this.currentUser?.role === "super_admin" ||
      this.hasPermission("admin-approvals", "approve");
  },

  logoutAdmin() {
    this.isAdminLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem("museum_admin_auth");
    localStorage.removeItem("museum_current_user");
    localStorage.removeItem("museum_token");
  }
};

// Initialize on module load
AuthState.init();
