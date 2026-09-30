import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  id?: string;
  ticketCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  ticketType: string; // 'standard' | 'student' | 'child' | 'vip'
  ticketTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  visitDate: Date;
  timeSlot: string; // '08:00 - 11:30' | '13:30 - 17:00'
  status: 'paid' | 'used' | 'cancelled' | 'pending';
  paymentMethod: string;
  qrCodeData: string;
  notes?: string;
  mongoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    userName: {
      type: String,
      default: 'Khách tham quan'
    },
    userPhone: {
      type: String,
      default: '',
      trim: true
    },
    ticketType: {
      type: String,
      default: 'standard',
      index: true
    },
    ticketTitle: {
      type: String,
      default: 'Vé Tham Quan Tiêu Chuẩn'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    unitPrice: {
      type: Number,
      default: 30000
    },
    totalAmount: {
      type: Number,
      default: 30000
    },
    visitDate: {
      type: Date,
      required: true,
      index: true
    },
    timeSlot: {
      type: String,
      default: '08:00 - 11:30'
    },
    status: {
      type: String,
      enum: ['paid', 'used', 'cancelled', 'pending'],
      default: 'paid',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'VNPay / Chuyển khoản QR'
    },
    qrCodeData: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    mongoId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

TicketSchema.index({ userId: 1, createdAt: -1 });
TicketSchema.index({ userEmail: 1, createdAt: -1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
