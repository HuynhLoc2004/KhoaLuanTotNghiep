import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketTimeSlot extends Document {
  slotName: string;
  maxCapacity: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTimeSlotSchema: Schema = new Schema(
  {
    slotName: {
      type: String,
      required: true,
      trim: true
    },
    maxCapacity: {
      type: Number,
      default: 300
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const TicketTimeSlot = mongoose.model<ITicketTimeSlot>('TicketTimeSlot', TicketTimeSlotSchema);
