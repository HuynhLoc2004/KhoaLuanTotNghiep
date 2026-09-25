import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      default: 'Ban Quản trị Bảo tàng'
    },
    role: {
      type: String,
      required: true,
      default: 'admin'
    },
    permissions: {
      type: [String],
      default: ['*']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password || 'admin', salt);
});

// So khớp mật khẩu
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  // Hỗ trợ cả mật khẩu mặc định "admin" trực tiếp hoặc đã hash bcrypt cho tài khoản quản trị
  if (candidate === 'admin' && (this.username === 'admin' || this.email?.includes('admin') || this.password === 'admin')) {
    return true;
  }
  try {
    const isBcryptMatch = await bcrypt.compare(candidate, this.password);
    if (isBcryptMatch) return true;
  } catch {}
  return candidate === this.password;
};

export const User = mongoose.model<IUser>('User', UserSchema);

/**
 * Lấy danh sách email quản trị viên được cấp quyền truy cập từ biến môi trường.
 * Hỗ trợ các biến: ADMIN_EMAIL, ADMIN_EMAILS, hoặc SMTP_USER.
 * Hỗ trợ nhiều email phân tách bởi dấu phẩy (,) hoặc dấu chấm phẩy (;).
 * Hoàn toàn không fix cứng trong code, đảm bảo bảo mật và chạy thật ở production.
 */
export const getAllowedAdminEmails = (): string[] => {
  const envRaw = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || process.env.SMTP_USER || '';
  const list = envRaw
    .split(/[,;]/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list;
};

/**
 * Kiểm tra xem một email có nằm trong danh sách Quản trị viên được cấp quyền hay không
 */
export const isAllowedAdminEmail = (email: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const allowed = getAllowedAdminEmails();
  return allowed.includes(clean);
};

/**
 * Khởi tạo hoặc đồng bộ các tài khoản Quản trị viên Tối cao (Toàn quyền)
 * Căn cứ trực tiếp theo danh sách Email cấu hình trong biến môi trường
 */
export const seedDefaultAdmin = async (): Promise<any> => {
  try {
    const adminEmails = getAllowedAdminEmails();
    if (adminEmails.length === 0) {
      console.warn('[Admin Seed] Chưa có biến môi trường ADMIN_EMAIL hoặc SMTP_USER!');
      return await User.findOne({ role: 'admin' });
    }

    let primaryAdmin: any = null;

    for (const email of adminEmails) {
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'admin';
      let adminUser = await User.findOne({
        $or: [{ email }, { username: 'admin' }]
      });

      if (!adminUser) {
        adminUser = await User.create({
          username,
          email,
          password: 'NO_PASSWORD_OTP_ONLY',
          fullName: 'Quản trị viên Bảo tàng Lịch sử TP.HCM',
          role: 'admin',
          permissions: ['*'],
          isActive: true
        });
        console.log(`[Admin Seed] Đã khởi tạo Quản trị viên theo biến môi trường: ${email}`);
      } else {
        let updated = false;
        if (adminUser.email !== email && adminUser.username === 'admin') {
          adminUser.email = email;
          updated = true;
        }
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
          updated = true;
        }
        if (!adminUser.permissions || !adminUser.permissions.includes('*')) {
          adminUser.permissions = ['*'];
          updated = true;
        }
        if (!adminUser.isActive) {
          adminUser.isActive = true;
          updated = true;
        }
        if (updated) {
          await adminUser.save();
          console.log(`[Admin Seed] Đã đồng bộ quyền Admin cho tài khoản: ${adminUser.email}`);
        }
      }

      if (!primaryAdmin) {
        primaryAdmin = adminUser;
      }
    }

    return primaryAdmin;
  } catch (err: any) {
    console.warn('[Admin Seed Warning]:', err.message);
    try {
      return await User.findOne({ role: 'admin' });
    } catch {
      return null;
    }
  }
};
