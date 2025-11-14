// Script to seed Route A Preferred with complete data including fullStops and itinerary
const mongoose = require('mongoose');
require('dotenv').config({ path: './apps/api/.env' });

const tourData = {
  title: "Route A Preferred - European Adventure",
  slug: "route-a-preferred-europe",
  summary: "14-day journey through France, Switzerland, Italy, and Vatican City.",
  line: "ROUTE_A",
  durationDays: 14,
  highlights: ["Paris", "Zurich", "Milan", "Florence", "Rome"],
  images: ["../image.png"],
  guaranteedDeparture: true,
  regularPricePerPerson: 250000,
  promoPricePerPerson: 160000,
  basePricePerDay: 18000,
  allowsDownpayment: true,
  departureDates: [
    { start: "2026-02-04", end: "2026-02-18" },
    { start: "2026-05-27", end: "2026-06-10" },
    { start: "2026-09-23", end: "2026-10-07" }
  ],
  travelWindow: {
    start: "2026-02-04",
    end: "2026-02-18"
  },
  additionalInfo: {
    countriesVisited: ["France", "Switzerland", "Italy", "Vatican City"],
    startingPoint: "Manila, Philippines",
    endingPoint: "Manila, Philippines",
    mainCities: {
      "France": ["Paris"],
      "Switzerland": ["Zurich"],
      "Italy": ["Milan", "Florence", "Rome"],
      "Vatican City": ["Vatican City"]
    }
  },
  fullStops: [
    { city: "Paris", country: "France", days: 3, isStart: true },
    { city: "Zurich", country: "Switzerland", days: 2 },
    { city: "Milan", country: "Italy", days: 2 },
    { city: "Florence", country: "Italy", days: 3 },
    { city: "Rome", country: "Italy", days: 3 },
    { city: "Vatican City", country: "Vatican City", days: 1, isEnd: true }
  ],
  itinerary: [
    { day: 1, title: "Arrival in Manila & Flight to Paris", description: "Depart Manila, overnight flight to Paris" },
    { day: 2, title: "Arrival in Paris", description: "Meet and greet, transfer to hotel, welcome dinner" },
    { day: 3, title: "Paris City Tour", description: "Eiffel Tower, Louvre Museum, Seine River cruise" },
    { day: 4, title: "Paris Free Day", description: "Optional Versailles tour or shopping on Champs-Élysées" },
    { day: 5, title: "Travel to Zurich", description: "Train to Zurich, afternoon city tour" },
    { day: 6, title: "Zurich & Swiss Alps", description: "Mount Titlis excursion, Swiss chocolate tasting" },
    { day: 7, title: "Travel to Milan", description: "Train to Milan, Duomo Cathedral visit" },
    { day: 8, title: "Milan & Lake Como", description: "Shopping district, optional Lake Como day trip" },
    { day: 9, title: "Travel to Florence", description: "Train to Florence, walking tour of historic center" },
    { day: 10, title: "Florence Art & Culture", description: "Uffizi Gallery, Ponte Vecchio, Michelangelo's David" },
    { day: 11, title: "Florence to Rome", description: "Train to Rome, Colosseum and Roman Forum" },
    { day: 12, title: "Rome Ancient Sites", description: "Pantheon, Trevi Fountain, Spanish Steps" },
    { day: 13, title: "Vatican City", description: "Vatican Museums, Sistine Chapel, St. Peter's Basilica" },
    { day: 14, title: "Departure", description: "Transfer to airport, flight back to Manila" }
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
    mainCities: { type: mongoose.Schema.Types.Mixed }
  },
  regularPricePerPerson: { type: Number },
  promoPricePerPerson: { type: Number, default: null },
}, { 
  timestamps: true,
  strict: false
});

const Tour = mongoose.model('Tour', TourSchema);

async function seedTour() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');

    // Delete existing tour with same slug
    await Tour.deleteOne({ slug: tourData.slug });
    console.log('🗑️  Deleted existing tour (if any)');

    // Insert new tour
    const tour = await Tour.create(tourData);
    console.log('✅ Tour seeded successfully:', tour.title);
    console.log('📋 Tour slug:', tour.slug);
    console.log('📍 Full stops:', tour.fullStops?.length);
    console.log('🗺️  Itinerary days:', tour.itinerary?.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tour:', error);
    process.exit(1);
  }
}

seedTour();
