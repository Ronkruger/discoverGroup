import mongoose, { Schema, Document } from 'mongoose';

// Custom route added to a booking
export interface ICustomRoute {
  tourSlug: string;
  tourTitle: string;
  tourLine?: string;
  durationDays: number;
  pricePerPerson: number;
  insertAfterDay: number;
}

export interface IBooking extends Document {
  user?: mongoose.Types.ObjectId;
  tour?: mongoose.Types.ObjectId; // Make optional for backward compatibility
  tourSlug?: string; // Add tour slug field for when tour isn't in MongoDB
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
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentPurpose?: string;
  customRoutes?: ICustomRoute[]; // Custom routes added to base tour
  // Visa assistance fields
  visaAssistanceRequested?: boolean;
  visaDocumentsProvided?: boolean;
  visaDestinationCountries?: string;
  visaAssistanceStatus?: 'pending' | 'in-progress' | 'completed' | 'not-needed';
  visaAssistanceNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}


const BookingSchema = new Schema<IBooking>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: false }, // Make optional
  tourSlug: { type: String, required: false }, // Add tour slug field
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
  appointmentDate: { type: String },
  appointmentTime: { type: String },
  appointmentPurpose: { type: String },
  customRoutes: [{
    tourSlug: { type: String, required: true },
    tourTitle: { type: String, required: true },
    tourLine: { type: String },
    durationDays: { type: Number, required: true },
    pricePerPerson: { type: Number, required: true },
    insertAfterDay: { type: Number, required: true }
  }],
  // Visa assistance fields
  visaAssistanceRequested: { type: Boolean, default: false },
  visaDocumentsProvided: { type: Boolean, default: false },
  visaDestinationCountries: { type: String },
  visaAssistanceStatus: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed', 'not-needed'],
    default: 'not-needed'
  },
  visaAssistanceNotes: { type: String },
}, { timestamps: true });

export default mongoose.model<IBooking>('Booking', BookingSchema);
