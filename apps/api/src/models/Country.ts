import mongoose from 'mongoose';

const countryAttractionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  displayOrder: { type: Number, default: 0 }
});

const countryTestimonialSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  author: { type: String },
  displayOrder: { type: Number, default: 0 }
});

const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  heroImageUrl: { type: String }, // Primary hero image (backward compatibility)
  heroImages: [{ type: String }], // Array of hero image URLs
  heroQuery: { type: String },
  bestTime: { type: String, required: true },
  currency: { type: String, required: true },
  language: { type: String, required: true },
  visaInfo: { type: String },
  attractions: [countryAttractionSchema],
  testimonials: [countryTestimonialSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
countrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate slug from name before saving
countrySchema.pre('save', function(next) {
  try {
    if (this.isModified('name') && !this.slug) {
      if (!this.name || this.name.trim().length === 0) {
        return next(new Error('Country name cannot be empty'));
      }
      this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!this.slug || this.slug.length === 0) {
        return next(new Error('Unable to generate slug from country name'));
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.models.Country || mongoose.model('Country', countrySchema);
