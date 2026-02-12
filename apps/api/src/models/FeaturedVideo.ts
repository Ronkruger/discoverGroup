import mongoose, { Schema, Document } from 'mongoose';

export interface IFeaturedVideo extends Document {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  display_order: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedVideoSchema = new Schema<IFeaturedVideo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    video_url: { type: String, required: true },
    thumbnail_url: { type: String },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeaturedVideo>('FeaturedVideo', FeaturedVideoSchema);
