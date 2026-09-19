import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    permissions: {
      type: [String],
      default: []
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);

export const DEFAULT_ROLES = [
  {
    name: 'admin',
    displayName: 'Quản trị viên Hệ thống (Toàn quyền)',
    description: 'Quyền cao nhất: Quản lý toàn bộ gian phòng, tour 360, hiện vật, ngôn ngữ, AI, và phân quyền người dùng.',
    permissions: ['*'],
    isSystem: true
  },
  {
    name: 'staff',
    displayName: 'Nhân viên nghiệp vụ Bảo tàng',
    description: 'Quản lý thông tin gian phòng, tải ảnh 360, biên tập hotspot, hiện vật và kịch bản thuyết minh.',
    permissions: [
      'rooms:read',
      'rooms:write',
      'artifacts:manage',
      'stitch:manage',
      'languages:manage'
    ],
    isSystem: true
  },
  {
    name: 'client',
    displayName: 'Khách tham quan Trực tuyến',
    description: 'Khách tham quan khám phá không gian bảo tàng 360, nghe Voice AI và xem tư liệu hiện vật.',
    permissions: ['rooms:read', 'artifacts:read', 'tour:view'],
    isSystem: true
  }
];

export const seedDefaultRoles = async () => {
  try {
    for (const defRole of DEFAULT_ROLES) {
      const existing = await Role.findOne({ name: defRole.name });
      if (!existing) {
        await Role.create(defRole);
        console.log(`[RBAC] Đã khởi tạo Role mặc định: ${defRole.name} (${defRole.displayName})`);
      }
    }
  } catch (err: any) {
    console.warn('[RBAC Seed Warning]:', err.message);
  }
};
