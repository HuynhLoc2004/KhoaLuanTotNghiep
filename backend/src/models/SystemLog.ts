import mongoose, { Schema, Document } from 'mongoose';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

export type LogModule =
  | 'ROOMS'
  | 'ARTIFACTS'
  | 'STITCHING'
  | 'FLOOR_PLAN'
  | 'TICKETS'
  | 'AUTH'
  | 'SYSTEM'
  | 'AI_VOICE'
  | 'DATABASE'
  | 'SHOWCASE';

export interface ISystemLog extends Document {
  level: LogLevel;
  module: LogModule;
  action: string;
  message: string;
  statusCode?: number;
  durationMs?: number;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  username?: string;
  role?: string;
  resource?: string;
  method?: string;
  path?: string;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  };
  details?: Record<string, any>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SystemLogSchema: Schema = new Schema(
  {
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'SUCCESS'],
      default: 'INFO',
      index: true
    },
    module: {
      type: String,
      enum: [
        'ROOMS',
        'ARTIFACTS',
        'STITCHING',
        'FLOOR_PLAN',
        'TICKETS',
        'AUTH',
        'SYSTEM',
        'AI_VOICE',
        'DATABASE',
        'SHOWCASE'
      ],
      default: 'SYSTEM',
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true
    },
    statusCode: {
      type: Number,
      index: true
    },
    durationMs: {
      type: Number,
      default: 0
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      default: 'system',
      index: true
    },
    username: {
      type: String,
      default: 'Hệ thống'
    },
    role: {
      type: String,
      default: 'system'
    },
    resource: {
      type: String,
      default: '',
      index: true
    },
    method: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      default: '',
      index: true
    },
    error: {
      name: { type: String },
      message: { type: String },
      stack: { type: String },
      code: { type: String }
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    tags: {
      type: [String],
      default: [],
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'system_logs'
  }
);

// Indexes phục vụ lọc đa chiều nhanh chóng
SystemLogSchema.index({ createdAt: -1 });
SystemLogSchema.index({ level: 1, createdAt: -1 });
SystemLogSchema.index({ module: 1, createdAt: -1 });
SystemLogSchema.index({ level: 1, module: 1, createdAt: -1 });
SystemLogSchema.index({ 'error.message': 'text', message: 'text', action: 'text' });

export const SystemLogModel = mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
export default SystemLogModel;
