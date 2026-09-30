import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketType extends Document {
  code: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  benefits: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      default: 30000
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    },
    benefits: {
      type: [String],
      default: []
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

export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
