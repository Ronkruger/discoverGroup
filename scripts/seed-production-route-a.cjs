// Script to seed Route A Preferred to PRODUCTION MongoDB
const mongoose = require('mongoose');

// Production MongoDB URI (from render-api.env)
const PRODUCTION_MONGODB_URI = 'mongodb+srv://discovergroup_user:l8VdqrBa7meFhjlI@discovergroup.s2s329l.mongodb.net/discovergroup?retryWrites=true&w=majority&appName=discovergroup';

const tourData = {
  title: "Route A Preferred",
  slug: "route-a-preferred",
  summary: "route a preferred is focus more on europe tours",
  line: "ROUTE_A",
  durationDays: 13,
  highlights: ["Paris", "Zurich", "Milan", "Florence", "Rome", "Vatican City"],
  images: [],
  guaranteedDeparture: true,
  regularPricePerPerson: 250000,
  promoPricePerPerson: null,
  basePricePerDay: 19230,
  allowsDownpayment: false,
  bookingPdfUrl: "https://flippingbook.com/account/online/454836211/1",
  departureDates: [
    { start: "2026-02-04", end: "2026-02-18" },
    { start: "2026-05-27", end: "2026-06-10" }
  ],
  travelWindow: {
    start: "2026-02-04",
    end: "2026-02-18"
  },
  continent: "Europe",
  shortDescription: "",
  isSaleEnabled: false,
  saleEndDate: null,
  additionalInfo: {
    countriesVisited: [],
    startingPoint: "",
    endingPoint: "",
    mainCities: {},
    countries: ["France", "Switzerland", "Italy", "Vatican City"]
  },
  // CRITICAL: Add fullStops for TourBuilder
  fullStops: [
    { city: "Paris", country: "France", days: 3, isStart: true },
    { city: "Zurich", country: "Switzerland", days: 2 },
    { city: "Milan", country: "Italy", days: 2 },
    { city: "Florence", country: "Italy", days: 2 },
    { city: "Rome", country: "Italy", days: 3 },
    { city: "Vatican City", country: "Vatican City", days: 1, isEnd: true }
  ],
  // Keep existing itinerary (15 days as shown in production)
  itinerary: [
    { day: 1, title: "Departure from Manila", description: "Evening flight to Paris" },
    { day: 2, title: "Arrival in Paris", description: "Meet and greet, transfer to hotel" },
    { day: 3, title: "Paris City Tour", description: "Eiffel Tower, Louvre Museum, Seine River cruise" },
    { day: 4, title: "Paris Free Day", description: "Optional Versailles tour or shopping" },
    { day: 5, title: "Travel to Zurich", description: "Train to Zurich, afternoon city tour" },
    { day: 6, title: "Zurich & Swiss Alps", description: "Mount Titlis excursion" },
    { day: 7, title: "Travel to Milan", description: "Train to Milan, Duomo Cathedral" },
    { day: 8, title: "Milan & Lake Como", description: "Shopping district, Lake Como" },
    { day: 9, title: "Travel to Florence", description: "Train to Florence, walking tour" },
    { day: 10, title: "Florence Art & Culture", description: "Uffizi Gallery, Michelangelo's David" },
    { day: 11, title: "Travel to Rome", description: "Train to Rome, Colosseum" },
    { day: 12, title: "Rome Ancient Sites", description: "Pantheon, Trevi Fountain" },
    { day: 13, title: "Vatican City", description: "Vatican Museums, Sistine Chapel" },
    { day: 14, title: "Rome Free Day", description: "Last day shopping and exploration" },
    { day: 15, title: "Return to Manila", description: "Transfer to airport, flight home" }
  ]
};

const TourSchema = new mongoose.Schema({
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
    mainCities: { type: mongoose.Schema.Types.Mixed },
    countries: [{ type: String }]
  },
  regularPricePerPerson: { type: Number },
  promoPricePerPerson: { type: Number, default: null },
  isSaleEnabled: { type: Boolean, default: false },
  saleEndDate: { type: String, default: null },
  continent: { type: String },
  shortDescription: { type: String },
  mainImage: { type: String },
  galleryImages: [{ type: String }],
  relatedImages: [{ type: String }]
}, { 
  timestamps: true,
  strict: false
});

const Tour = mongoose.model('Tour', TourSchema);

async function seedProductionTour() {
  try {
    console.log('🔗 Connecting to PRODUCTION MongoDB...');
    console.log('📍 URI:', PRODUCTION_MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to PRODUCTION MongoDB');

    // Find existing tour
    const existing = await Tour.findOne({ slug: tourData.slug });
    
    if (existing) {
      console.log('📝 Found existing tour, updating fullStops and itinerary...');
      
      // Update only fullStops and itinerary using updateOne to avoid schema validation issues
      await Tour.updateOne(
        { slug: tourData.slug },
        { 
          $set: {
            fullStops: tourData.fullStops,
            itinerary: tourData.itinerary
          }
        }
      );
      console.log('✅ Tour updated successfully!');
    } else {
      console.log('📝 Creating new tour...');
      const tour = await Tour.create(tourData);
      console.log('✅ Tour created successfully!');
    }

    console.log('📋 Tour slug:', tourData.slug);
    console.log('📍 Full stops:', tourData.fullStops.length);
    console.log('🗺️  Itinerary days:', tourData.itinerary.length);
    console.log('');
    console.log('🎉 Production database updated!');
    console.log('🔄 Now refresh your browser to see the changes.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production tour:', error);
    process.exit(1);
  }
}

seedProductionTour();
