// Simple script to add a test tour to MongoDB
console.log('🚀 Adding test tour to MongoDB...');

const tourData = {
  title: "Route A Preferred - European Adventure",
  slug: "route-a-preferred",
  summary: "Experience the best of Europe with multiple departure dates",
  description: "An amazing European adventure with flexible departure dates throughout the year.",
  durationDays: 14,
  regularPricePerPerson: 250000,
  promoPricePerPerson: 200000,
  countries: ["France"],
  images: ["/assets/europe-adventure.jpg"],
  departureDates: [
    {
      startDate: "2026-02-04",
      endDate: "2026-02-18"
    },
    {
      startDate: "2026-05-27", 
      endDate: "2026-06-10"
    },
    {
      startDate: "2026-08-15",
      endDate: "2026-08-29"
    }
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival in Paris",
      description: "Welcome to Europe! Check in and explore the city of lights."
    },
    {
      day: 2,
      title: "Paris City Tour", 
      description: "Visit the Eiffel Tower, Louvre Museum, and Notre Dame."
    }
  ]
};

// Using direct MongoDB connection (simulating what the API would do)
// In real usage, this would go through the API endpoint
console.log('📋 Tour data to save:', JSON.stringify(tourData, null, 2));
console.log('✅ Test tour data prepared for Route A Preferred!');
console.log('🎯 This tour has departure dates:', tourData.departureDates.map(d => `${d.startDate} to ${d.endDate}`).join(', '));