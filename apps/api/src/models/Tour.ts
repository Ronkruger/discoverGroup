import mongoose, { Schema, Document } from 'mongoose';

export interface ITour extends Document {
  title: string;
  slug: string;
  durationDays: number;
  description?: string;
}

const TourSchema = new Schema<ITour>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  durationDays: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model<ITour>('Tour', TourSchema);
