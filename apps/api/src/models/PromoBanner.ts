import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoBanner extends Document {
  isEnabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  discountPercentage: number;
  discountedTours: string[]; // Array of tour slugs
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromoBannerSchema: Schema = new Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
      default: 'Limited Time Offer',
    },
    message: {
      type: String,
      required: true,
      default: 'Up to 30% off on European Tours!',
    },
    ctaText: {
      type: String,
      default: 'Book Now',
    },
    ctaLink: {
      type: String,
      default: '/deals',
    },
    backgroundColor: {
      type: String,
      default: '#1e40af', // blue-800
    },
    textColor: {
      type: String,
      default: '#ffffff',
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountedTours: [{
      type: String, // tour slug
    }],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active banner at a time
PromoBannerSchema.pre('save', async function(next) {
  if (this.isEnabled) {
    // Disable all other banners
    await mongoose.model('PromoBanner').updateMany(
      { _id: { $ne: this._id } },
      { isEnabled: false }
    );
  }
  next();
});

export default mongoose.model<IPromoBanner>('PromoBanner', PromoBannerSchema);
