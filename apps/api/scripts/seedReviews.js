const mongoose = require('mongoose');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/discovergroup';

// Review Schema
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tourSlug: String,
  tourTitle: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBooking: { type: Boolean, default: false }
});

const Review = mongoose.model('Review', reviewSchema);

// Seed data - approved reviews
const seedReviews = [
  {
    name: "Emma Thompson",
    rating: 5,
    comment: "An absolutely incredible journey through Europe! Every detail was perfectly planned and executed.",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "mediterranean-grand-tour",
    tourTitle: "Mediterranean Grand Tour",
    createdAt: new Date('2024-11-15')
  },
  {
    name: "Michael Chen",
    rating: 5,
    comment: "Our guide was phenomenal — truly passionate and knowledgeable. This trip exceeded all expectations!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-a-preferred",
    tourTitle: "European Highlights Tour",
    createdAt: new Date('2024-11-20')
  },
  {
    name: "Isabella Rodriguez",
    rating: 5,
    comment: "The accommodations were stunning and the itinerary was perfectly paced. Already planning our next adventure!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-b-classic",
    tourTitle: "Classic Europe Experience",
    createdAt: new Date('2024-11-25')
  },
  {
    name: "David Park",
    rating: 5,
    comment: "Unforgettable experience! The blend of culture, history, and local cuisine was perfect. Highly recommend!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-c-premium",
    tourTitle: "Premium European Tour",
    createdAt: new Date('2024-12-01')
  },
  {
    name: "Sophie Anderson",
    rating: 5,
    comment: "Best vacation ever! From the Eiffel Tower to the Swiss Alps, every moment was magical. Thank you!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "mediterranean-grand-tour",
    tourTitle: "Mediterranean Grand Tour",
    createdAt: new Date('2024-12-03')
  },
  {
    name: "James Wilson",
    rating: 5,
    comment: "Outstanding tour company! Professional, organized, and fun. Made lifelong friends on this trip!",
    isApproved: true,
    verifiedBooking: false,
    createdAt: new Date('2024-12-05')
  },
  {
    name: "Maria Garcia",
    rating: 5,
    comment: "As a solo traveler, I felt safe and welcomed throughout. The group was amazing and the experiences unforgettable!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-a-preferred",
    tourTitle: "European Highlights Tour",
    createdAt: new Date('2024-12-07')
  },
  {
    name: "Robert Kim",
    rating: 5,
    comment: "Worth every penny! The hotels were luxurious, meals delicious, and our guide made history come alive.",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-c-premium",
    tourTitle: "Premium European Tour",
    createdAt: new Date('2024-12-08')
  },
  {
    name: "Lisa Martinez",
    rating: 5,
    comment: "This tour exceeded my expectations in every way. Can't wait to book another trip with Discover Group!",
    isApproved: true,
    verifiedBooking: false,
    tourSlug: "route-b-classic",
    tourTitle: "Classic Europe Experience",
    createdAt: new Date('2024-12-09')
  },
  {
    name: "Thomas Brown",
    rating: 5,
    comment: "Incredible value for money. Saw so much, learned so much, and made memories that will last forever!",
    isApproved: true,
    verifiedBooking: false,
    createdAt: new Date('2024-12-10')
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing reviews (optional - comment out if you want to keep existing reviews)
    console.log('Clearing existing reviews...');
    await Review.deleteMany({});
    console.log('Existing reviews cleared.');

    // Insert seed reviews
    console.log('Inserting seed reviews...');
    const result = await Review.insertMany(seedReviews);
    console.log(`Successfully inserted ${result.length} reviews!`);

    // Display summary
    console.log('\nSeed Summary:');
    console.log(`- Total reviews: ${result.length}`);
    console.log(`- Approved reviews: ${result.filter(r => r.isApproved).length}`);
    console.log(`- Average rating: ${(result.reduce((sum, r) => sum + r.rating, 0) / result.length).toFixed(2)}`);

    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
