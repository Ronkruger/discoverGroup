// Simple test script to add a tour with departure dates
const fetch = require('node-fetch');

const sampleTour = {
  title: "Japan Cherry Blossom Adventure",
  slug: "japan-cherry-blossom-adventure",
  summary: "Experience the magic of Japan during cherry blossom season with multiple departure options.",
  description: "Join us for an unforgettable journey through Japan during the breathtaking cherry blossom season. This carefully curated tour offers multiple departure dates to suit your schedule, allowing you to witness the ephemeral beauty of sakura in full bloom.",
  durationDays: 10,
  regularPricePerPerson: 150000,
  promoPricePerPerson: 135000,
  countries: ["Japan"],
  images: [
    "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800"
  ],
  departureDates: [
    {
      startDate: "2026-02-04",
      endDate: "2026-02-18"
    },
    {
      startDate: "2026-03-15",
      endDate: "2026-03-29"
    },
    {
      startDate: "2026-05-27", 
      endDate: "2026-06-10"
    }
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival in Tokyo",
      description: "Welcome to Japan! Transfer to hotel and welcome dinner."
    },
    {
      day: 2,
      title: "Tokyo City Tour",
      description: "Explore modern Tokyo including Shibuya, Harajuku, and traditional Asakusa."
    }
  ]
};

async function addTour() {
  try {
    console.log('Adding sample tour with departure dates...');
    
    const response = await fetch('http://localhost:4000/admin/tours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleTour)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add tour: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Tour added successfully:', result.slug);
    console.log('Departure dates:', result.departureDates);

  } catch (error) {
    console.error('❌ Error adding tour:', error.message);
  }
}

// Run the test
addTour();