import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageSettings extends Document {
  statistics: {
    travelers: number;
    packages: number;
    rating: number;
    destinations: number;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    promoText: string;
    promoButtonText: string;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
  }>;
  logo: {
    url: string;
    height: number;
  };
  updatedAt: Date;
}

const HomepageSettingsSchema = new Schema<IHomepageSettings>({
  statistics: {
    travelers: { type: Number, default: 30000 },
    packages: { type: Number, default: 75 },
    rating: { type: Number, default: 4.9 },
    destinations: { type: Number, default: 25 },
  },
  hero: {
    title: { type: String, default: 'Experience the Magic of European Adventures' },
    subtitle: { type: String, default: 'Discover breathtaking destinations with expertly crafted tours' },
    ctaText: { type: String, default: 'Explore Tours' },
    ctaLink: { type: String, default: '#tours' },
    promoText: { type: String, default: 'Limited Time Offer: Up to 30% off on European Tours!' },
    promoButtonText: { type: String, default: 'Book Now' },
  },
  features: [{
    id: String,
    title: String,
    description: String,
    icon: String,
  }],
  testimonials: [{
    id: String,
    name: String,
    location: String,
    rating: Number,
    text: String,
    image: String,
  }],
  logo: {
    url: { type: String, default: '/logo.png' },
    height: { type: Number, default: 64 },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IHomepageSettings>('HomepageSettings', HomepageSettingsSchema);
