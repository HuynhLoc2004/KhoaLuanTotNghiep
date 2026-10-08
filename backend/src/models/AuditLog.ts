import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: string;
  username?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  pgId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: String, default: 'system', index: true },
    username: { type: String, default: 'System Admin' },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
    pgId: { type: Number, index: true }
  },
  {
    timestamps: true,
    collection: 'audit_logs'
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLogModel;
