import mongoose, { Schema, Document } from 'mongoose';

export interface IArchivedLogPackage extends Document {
  packageId: string;
  fileName: string;
  filePath: string;
  recordCount: number;
  fileSizeBytes: number;
  category: 'BOT_SCANS_ONLY' | 'ROUTINE_INFO' | 'FULL_PRUNE_WITH_TRACE_PRESERVED';
  olderThanDays: number;
  dateFrom?: Date;
  dateTo?: Date;
  archivedBy: string;
  restoredAt?: Date;
  createdAt: Date;
}

const ArchivedLogPackageSchema: Schema = new Schema(
  {
    packageId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    recordCount: {
      type: Number,
      default: 0
    },
    fileSizeBytes: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ['BOT_SCANS_ONLY', 'ROUTINE_INFO', 'FULL_PRUNE_WITH_TRACE_PRESERVED'],
      default: 'FULL_PRUNE_WITH_TRACE_PRESERVED'
    },
    olderThanDays: {
      type: Number,
      default: 30
    },
    dateFrom: {
      type: Date
    },
    dateTo: {
      type: Date
    },
    archivedBy: {
      type: String,
      default: 'Admin'
    },
    restoredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const ArchivedLogPackageModel = mongoose.model<IArchivedLogPackage>(
  'ArchivedLogPackage',
  ArchivedLogPackageSchema,
  'archived_log_packages'
);
