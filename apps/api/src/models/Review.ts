import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  userEmail?: string;
  userId?: mongoose.Types.ObjectId;
  bookingId?: string;
  tourSlug?: string;
  tourTitle?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isVerifiedBooking: boolean;
  helpfulVotes: number;
  categories: {
    tourGuide: number;
    cleanliness: number;
    communication: number;
    value: number;
    organization: number;
  };
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  userEmail: {
    type: String,
    trim: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  bookingId: {
    type: String,
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
  isVerifiedBooking: {
    type: Boolean,
    default: false,
  },
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  categories: {
    tourGuide: { type: Number, min: 1, max: 5, default: 5 },
    cleanliness: { type: Number, min: 1, max: 5, default: 5 },
    communication: { type: Number, min: 1, max: 5, default: 5 },
    value: { type: Number, min: 1, max: 5, default: 5 },
    organization: { type: Number, min: 1, max: 5, default: 5 },
  },
  photos: [{
    type: String,
    trim: true,
  }],
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
