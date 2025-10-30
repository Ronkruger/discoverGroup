import mongoose, { Schema, Document } from 'mongoose';

export interface ITour extends Document {
  title: string;
  slug: string;
  summary?: string;
  line?: string;
  durationDays: number;
  highlights?: string[];
  images?: string[];
  guaranteedDeparture?: boolean;
  bookingPdfUrl?: string;
  departureDates?: string[];
  travelWindow?: {
    start: string;
    end: string;
  };
  itinerary?: Array<{
    day: number;
    title: string;
    description?: string;
  }>;
  fullStops?: Array<{
    city: string;
    country?: string;
    isStart?: boolean;
    isEnd?: boolean;
    days?: number;
  }>;
  basePricePerDay?: number;
  allowsDownpayment?: boolean;
  additionalInfo?: {
    startingPoint?: string;
    endingPoint?: string;
    countriesVisited?: string[];
    mainCities?: Record<string, string[]>;
    [key: string]: unknown;
  };
  regularPricePerPerson?: number;
  promoPricePerPerson?: number | null;
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;
  [key: string]: unknown;
}

const TourSchema = new Schema<ITour>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String },
  line: { type: String },
  durationDays: { type: Number, required: true },
  highlights: [{ type: String }],
  images: [{ type: String }],
  guaranteedDeparture: { type: Boolean, default: false },
  bookingPdfUrl: { type: String },
  departureDates: [{
    start: { type: String, required: true },
    end: { type: String, required: true }
  }],
  travelWindow: {
    start: { type: String },
    end: { type: String }
  },
  itinerary: [{
    day: { type: Number },
    title: { type: String },
    description: { type: String }
  }],
  fullStops: [{
    city: { type: String },
    country: { type: String },
    isStart: { type: Boolean },
    isEnd: { type: Boolean },
    days: { type: Number }
  }],
  basePricePerDay: { type: Number },
  allowsDownpayment: { type: Boolean, default: false },
  additionalInfo: {
    startingPoint: { type: String },
    endingPoint: { type: String },
    countriesVisited: [{ type: String }],
    mainCities: { type: Schema.Types.Mixed }
  },
  regularPricePerPerson: { type: Number },
  promoPricePerPerson: { type: Number, default: null },
  isSaleEnabled: { type: Boolean, default: false },
  saleEndDate: { type: String, default: null },
}, { 
  timestamps: true,
  strict: false // Allow additional fields for flexibility
});
export default mongoose.model<ITour>('Tour', TourSchema);