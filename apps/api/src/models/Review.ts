import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  tourSlug?: string;
  tourTitle?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tourSlug: {
    type: String,
    trim: true,
  },
  tourTitle: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IReview>('Review', ReviewSchema);
