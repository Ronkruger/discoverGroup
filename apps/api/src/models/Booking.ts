import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  tour: mongoose.Types.ObjectId;
  passengers: number;
  totalAmount: number;
  status: string;
}

const BookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  passengers: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
