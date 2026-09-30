import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  ticketTypeCode: string;
  ticketTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  visitDate: Date;
  timeSlot: string;
}

export interface IOrder extends Document {
  id?: string;
  orderCode: number;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  paymentMethod: string;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCodeData?: string;
  paidAt?: Date;
  expiresAt: Date;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    ticketTypeCode: { type: String, required: true },
    ticketTitle: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    visitDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    orderCode: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      index: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'expired'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'PayOS'
    },
    paymentLinkId: {
      type: String
    },
    checkoutUrl: {
      type: String
    },
    qrCodeData: {
      type: String
    },
    paidAt: {
      type: Date
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    items: [OrderItemSchema]
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, expiresAt: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
