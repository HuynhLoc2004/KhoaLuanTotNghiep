export interface UserProfile {
  name: string;
  phone: string;
  role: "visitor" | "student";
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
  role: "director" | "curator" | "gate_staff";
  roleTitle: string;
}

// Global Auth State
export const AuthState = {
  isVisitorLoggedIn: false,
  visitor: {
    name: "Nguyễn Văn An",
    phone: "0908 123 456",
    role: "student",
    level: "Giám Tuyển Tập Sự",
    exp: 420,
    stampsCount: 2,
    ticketsCount: 1,
    ticketCode: "TKT-VN-98421",
    passportStamps: ["Dấu Ấn Óc Eo", "Bảo Vật Đồng Dương"]
  } as UserProfile,

  isAdminLoggedIn: false,
  admin: {
    email: "admin@museum.hcmc.vn",
    name: "ThS. Lê Quang Long",
    role: "curator",
    roleTitle: "Giám Tuyển Trưởng"
  } as AdminProfile,

  loginVisitor(phone: string, name?: string) {
    this.isVisitorLoggedIn = true;
    this.visitor.phone = phone;
    if (name) this.visitor.name = name;
    localStorage.setItem("museum_visitor_auth", "true");
  },

  logoutVisitor() {
    this.isVisitorLoggedIn = false;
    localStorage.removeItem("museum_visitor_auth");
  },

  loginAdmin(role: "director" | "curator" | "gate_staff" = "curator", roleTitle?: string) {
    this.isAdminLoggedIn = true;
    this.admin.role = role;
    if (roleTitle) {
      this.admin.roleTitle = roleTitle;
    } else if (role === "director") {
      this.admin.roleTitle = "Ban Giám Đốc Bảo Tàng";
    } else if (role === "gate_staff") {
      this.admin.roleTitle = "Cán Bộ Soát Vé Cổng";
    } else {
      this.admin.roleTitle = "Giám Tuyển Trưởng";
    }
    localStorage.setItem("museum_admin_auth", "true");
  },

  logoutAdmin() {
    this.isAdminLoggedIn = false;
    localStorage.removeItem("museum_admin_auth");
  }
};
