import mongoose, { Schema, Document } from 'mongoose';


export interface IBooking extends Document {
  user?: mongoose.Types.ObjectId;
  tour: mongoose.Types.ObjectId;
  passengers: number;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPassport?: string;
  selectedDate: string;
  perPerson: number;
  paidAmount: number;
  paymentType: string;
  bookingId: string;
  bookingDate: string;
  paymentIntentId?: string;
  notes?: string;
}


const BookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  passengers: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerPassport: { type: String },
  selectedDate: { type: String, required: true },
  perPerson: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  paymentType: { type: String, required: true },
  bookingId: { type: String, required: true },
  bookingDate: { type: String, required: true },
  paymentIntentId: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
