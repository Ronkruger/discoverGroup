require('dotenv').config();
const mongoose = require('mongoose');
const Tour = require('../src/models/Tour').default;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const testTour = {
  slug: 'route-a-preferred',
  title: 'Route A Preferred',
  itinerary: [
    { day: 1, city: 'Manila', description: 'Arrival and welcome.' },
    { day: 2, city: 'Cebu', description: 'Island tour.' }
  ],
  fullStops: [
    { city: 'Manila', days: 1 },
    { city: 'Cebu', days: 1 }
  ],
  images: [
    'https://your-storage-url/image1.jpg'
  ],
  durationDays: 2,
  guaranteedDeparture: true,
  additionalInfo: {
    countriesVisited: ['Philippines'],
    startingPoint: 'Manila',
    endingPoint: 'Cebu'
  }
};

Tour.findOneAndUpdate({ slug: testTour.slug }, testTour, { upsert: true, new: true })
  .then(doc => {
    console.log('Seeded tour:', doc);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding tour:', err);
    mongoose.disconnect();
  });
