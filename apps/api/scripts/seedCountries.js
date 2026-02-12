// Seed script to populate countries collection
// Run: node apps/api/scripts/seedCountries.js

require('dotenv').config({ path: './apps/api/.env' });
const mongoose = require('mongoose');

// Country Schema (inline for script)
const countrySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  heroImageUrl: String,
  heroImages: [String],
  heroQuery: String,
  bestTime: { type: String, required: true },
  currency: { type: String, required: true },
  language: { type: String, required: true },
  visaInfo: String,
  attractions: [{
    title: String,
    description: String,
    imageUrl: String,
    displayOrder: Number
  }],
  testimonials: [{
    quote: String,
    author: String,
    displayOrder: Number
  }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const Country = mongoose.model('Country', countrySchema);

const countries = [
  {
    name: 'France',
    slug: 'france',
    description: 'Experience the romance and elegance of France, from the iconic Eiffel Tower in Paris to the lavender fields of Provence. Discover world-class cuisine, stunning architecture, and rich cultural heritage in the heart of Europe.',
    heroImages: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1920',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=1920'
    ],
    heroQuery: 'paris france eiffel tower',
    bestTime: 'April to October',
    currency: 'EUR (€)',
    language: 'French',
    visaInfo: 'Schengen visa required for most nationalities. EU citizens can enter visa-free.',
    attractions: [
      {
        title: 'Eiffel Tower',
        description: 'The iconic iron lattice tower standing 330 meters tall in the heart of Paris.',
        imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
        displayOrder: 1
      },
      {
        title: 'Louvre Museum',
        description: "The world's largest art museum, home to the Mona Lisa and Venus de Milo.",
        imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
        displayOrder: 2
      },
      {
        title: 'French Riviera',
        description: 'Stunning Mediterranean coastline with glamorous cities like Nice and Cannes.',
        imageUrl: 'https://images.unsplash.com/photo-1565007454596-c2ac936c57b9?w=800',
        displayOrder: 3
      },
      {
        title: 'Mont Saint-Michel',
        description: 'Medieval abbey perched on a rocky island, one of France\'s most iconic landmarks.',
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        displayOrder: 4
      }
    ],
    testimonials: [
      {
        quote: 'Our tour through France was absolutely magical! Every moment felt like a scene from a movie.',
        author: 'Sarah Johnson, USA',
        displayOrder: 1
      },
      {
        quote: 'The attention to detail and local expertise made this trip unforgettable. Highly recommend!',
        author: 'Michael Chen, Singapore',
        displayOrder: 2
      }
    ],
    isActive: true
  },
  {
    name: 'Italy',
    slug: 'italy',
    description: 'Immerse yourself in the timeless beauty of Italy, where ancient Roman ruins meet Renaissance masterpieces. From the canals of Venice to the rolling hills of Tuscany, Italy offers unparalleled art, cuisine, and history.',
    heroImages: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1920',
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920',
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1920'
    ],
    heroQuery: 'rome italy colosseum',
    bestTime: 'April to June, September to October',
    currency: 'EUR (€)',
    language: 'Italian',
    visaInfo: 'Schengen visa required for most nationalities. EU citizens can enter visa-free.',
    attractions: [
      {
        title: 'Colosseum',
        description: 'Ancient amphitheater and iconic symbol of Imperial Rome.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
        displayOrder: 1
      },
      {
        title: 'Venice Canals',
        description: 'Romantic waterways winding through historic palaces and bridges.',
        imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800',
        displayOrder: 2
      },
      {
        title: 'Florence Cathedral',
        description: 'Stunning Renaissance cathedral with Brunelleschi\'s famous dome.',
        imageUrl: 'https://images.unsplash.com/photo-1552342456-feca14725a32?w=800',
        displayOrder: 3
      },
      {
        title: 'Amalfi Coast',
        description: 'Breathtaking coastal scenery with colorful cliffside villages.',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        displayOrder: 4
      }
    ],
    testimonials: [
      {
        quote: 'Italy exceeded every expectation! The food, the history, the people - everything was perfect.',
        author: 'Emma Rodriguez, Spain',
        displayOrder: 1
      }
    ],
    isActive: true
  },
  {
    name: 'Switzerland',
    slug: 'switzerland',
    description: 'Discover the stunning Alpine landscapes of Switzerland, where snow-capped peaks meet crystal-clear lakes. Experience world-renowned chocolate, precision watches, and charming mountain villages in this picture-perfect destination.',
    heroImages: [
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1920'
    ],
    heroQuery: 'switzerland alps mountains',
    bestTime: 'June to September (summer), December to March (skiing)',
    currency: 'CHF (Swiss Franc)',
    language: 'German, French, Italian, Romansh',
    visaInfo: 'Schengen visa required for most nationalities. EU citizens can enter visa-free.',
    attractions: [
      {
        title: 'Matterhorn',
        description: 'Iconic pyramid-shaped mountain peak in the Swiss Alps.',
        imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        displayOrder: 1
      },
      {
        title: 'Lake Geneva',
        description: 'Stunning alpine lake surrounded by mountains and vineyards.',
        imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        displayOrder: 2
      },
      {
        title: 'Jungfraujoch',
        description: 'Top of Europe - highest railway station with spectacular glacier views.',
        imageUrl: 'https://images.unsplash.com/photo-1598966739654-5e9cef76ee85?w=800',
        displayOrder: 3
      },
      {
        title: 'Lucerne',
        description: 'Charming medieval town with covered wooden bridge and mountain backdrop.',
        imageUrl: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800',
        displayOrder: 4
      }
    ],
    testimonials: [
      {
        quote: 'Switzerland\'s natural beauty is beyond words. Every turn reveals another postcard-perfect view!',
        author: 'James Wilson, Australia',
        displayOrder: 1
      }
    ],
    isActive: true
  },
  {
    name: 'Vatican City',
    slug: 'vatican-city',
    description: 'Explore the world\'s smallest independent state, home to the Pope and the heart of the Catholic Church. Marvel at Michelangelo\'s Sistine Chapel, St. Peter\'s Basilica, and centuries of priceless art within the Vatican Museums.',
    heroImages: [
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1920',
      'https://images.unsplash.com/photo-1552035658-e577c4e2fe7f?w=1920'
    ],
    heroQuery: 'vatican city st peters basilica',
    bestTime: 'October to April (cooler weather, fewer crowds)',
    currency: 'EUR (€)',
    language: 'Italian, Latin',
    visaInfo: 'No separate visa needed - accessible from Rome (Italy). Schengen visa applies.',
    attractions: [
      {
        title: 'St. Peter\'s Basilica',
        description: 'Largest church in the world and architectural masterpiece of Renaissance.',
        imageUrl: 'https://images.unsplash.com/photo-1552035658-e577c4e2fe7f?w=800',
        displayOrder: 1
      },
      {
        title: 'Sistine Chapel',
        description: 'Home to Michelangelo\'s iconic ceiling fresco "The Creation of Adam".',
        imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800',
        displayOrder: 2
      },
      {
        title: 'Vatican Museums',
        description: 'Vast collection of art and historical artifacts spanning centuries.',
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        displayOrder: 3
      },
      {
        title: 'St. Peter\'s Square',
        description: 'Grand plaza designed by Bernini, site of papal addresses and ceremonies.',
        imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800',
        displayOrder: 4
      }
    ],
    testimonials: [
      {
        quote: 'The spiritual and artistic experience at Vatican City is indescribable. A must-visit!',
        author: 'Maria Santos, Philippines',
        displayOrder: 1
      }
    ],
    isActive: true
  },
  {
    name: 'Spain',
    slug: 'spain',
    description: 'Experience the vibrant culture of Spain, from flamenco dancing in Seville to Gaudí\'s masterpieces in Barcelona. Enjoy world-class beaches, delicious tapas, and a rich blend of Moorish and Christian heritage.',
    heroImages: [
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1920'
    ],
    heroQuery: 'barcelona spain sagrada familia',
    bestTime: 'May to June, September to October',
    currency: 'EUR (€)',
    language: 'Spanish (Castilian), Catalan, Basque, Galician',
    visaInfo: 'Schengen visa required for most nationalities. EU citizens can enter visa-free.',
    attractions: [
      {
        title: 'Sagrada Familia',
        description: 'Gaudí\'s unfinished masterpiece and Barcelona\'s most iconic landmark.',
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        displayOrder: 1
      },
      {
        title: 'Alhambra',
        description: 'Stunning Moorish palace and fortress complex in Granada.',
        imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
        displayOrder: 2
      },
      {
        title: 'Park Güell',
        description: 'Whimsical public park designed by Antoni Gaudí with mosaic artworks.',
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        displayOrder: 3
      },
      {
        title: 'Plaza Mayor, Madrid',
        description: 'Historic central square surrounded by baroque architecture.',
        imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
        displayOrder: 4
      }
    ],
    testimonials: [
      {
        quote: 'Spain\'s energy is contagious! From the food to the festivals, every day was an adventure.',
        author: 'Carlos Menendez, Mexico',
        displayOrder: 1
      }
    ],
    isActive: true
  }
];

async function seedCountries() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing countries...');
    await Country.deleteMany({});
    console.log('✅ Cleared existing countries');

    console.log('📝 Inserting seed countries...');
    const result = await Country.insertMany(countries);
    console.log(`✅ Successfully seeded ${result.length} countries:`);
    result.forEach(country => {
      console.log(`   - ${country.name} (slug: ${country.slug})`);
    });

    console.log('\n✨ Seed complete! You can now visit:');
    console.log('   - http://discover-grp.netlify.app/destinations/france');
    console.log('   - http://discover-grp.netlify.app/destinations/italy');
    console.log('   - http://discover-grp.netlify.app/destinations/switzerland');
    console.log('   - http://discover-grp.netlify.app/destinations/vatican-city');
    console.log('   - http://discover-grp.netlify.app/destinations/spain');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding countries:', error);
    process.exit(1);
  }
}

seedCountries();
