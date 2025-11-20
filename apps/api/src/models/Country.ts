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
  heroImageUrl: { type: String },
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
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.models.Country || mongoose.model('Country', countrySchema);
