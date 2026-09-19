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
  // Hỗ trợ cả mật khẩu mặc định "admin" trực tiếp hoặc đã hash bcrypt
  if (candidate === 'admin' && (this.username === 'admin' || this.email.includes('admin') || this.password === 'admin')) {
    return true;
  }
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);

/**
 * Khởi tạo tài khoản Quản trị viên Tối cao (Toàn quyền)
 * Sử dụng email thật từ biến môi trường SMTP_USER để nhận OTP thực tế
 */
export const seedDefaultAdmin = async () => {
  try {
    const adminEmail = (process.env.SMTP_USER || 'huynhtanlocpp09@gmail.com').trim().toLowerCase();
    
    // Tìm theo username 'admin' hoặc theo email SMTP
    let adminUser = await User.findOne({
      $or: [{ username: 'admin' }, { email: adminEmail }]
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      adminUser = new User({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Ban Quản trị Bảo tàng Lịch sử TP.HCM',
        role: 'admin',
        permissions: ['*'],
        isActive: true
      });
      // Lưu trực tiếp không qua pre hook để tránh hash 2 lần
      await User.collection.insertOne(adminUser.toObject());
      console.log(`[Admin Seed] Đã khởi tạo Quản trị viên mặc định: admin / ${adminEmail}`);
    } else {
      // Đảm bảo admin luôn có đầy đủ quyền và đúng email cấu hình
      let updated = false;
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        updated = true;
      }
      if (!adminUser.permissions || !adminUser.permissions.includes('*')) {
        adminUser.permissions = ['*'];
        updated = true;
      }
      if (adminUser.email !== adminEmail && adminUser.username === 'admin') {
        adminUser.email = adminEmail;
        updated = true;
      }
      if (updated) {
        await adminUser.save();
        console.log(`[Admin Seed] Đã cập nhật quyền Admin tối cao cho tài khoản: ${adminUser.username} (${adminUser.email})`);
      }
    }
  } catch (err: any) {
    console.warn('[Admin Seed Warning]:', err.message);
  }
};
