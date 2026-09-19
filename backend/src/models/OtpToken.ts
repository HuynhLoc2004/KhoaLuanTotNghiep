import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpToken extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  lastSentAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpTokenSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 600 } // Tự động dọn dẹp sau 10 phút
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    attempts: {
      type: Number,
      default: 0
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const OtpToken = mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);
