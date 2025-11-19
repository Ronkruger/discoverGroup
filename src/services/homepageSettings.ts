// Service to fetch homepage settings from API
// Settings are managed by the admin panel and stored in the database

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface HomepageSettings {
  logo: {
    url: string;
    height: number;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    promoText: string;
    promoButtonText: string;
  };
  statistics: {
    travelers: number;
    packages: number;
    rating: number;
    destinations: number;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
  }>;
}

const DEFAULT_SETTINGS: HomepageSettings = {
  logo: {
    url: '/logo.png',
    height: 64,
  },
  hero: {
    title: 'Experience the Magic of European Adventures',
    subtitle: 'Discover breathtaking destinations with expertly crafted tours',
    ctaText: 'Explore Tours',
    ctaLink: '#tours',
    promoText: 'Limited Time Offer: Up to 30% off on European Tours!',
    promoButtonText: 'Book Now',
  },
  statistics: {
    travelers: 30000,
    packages: 75,
    rating: 4.9,
    destinations: 25,
  },
  features: [
    {
      id: '1',
      title: 'Expert Guides',
      description: 'Professional local guides with deep knowledge',
      icon: 'Users',
    },
    {
      id: '2',
      title: 'Best Prices',
      description: 'Competitive rates with no hidden fees',
      icon: 'Award',
    },
    {
      id: '3',
      title: 'Safe & Secure',
      description: 'Fully licensed and insured travel services',
      icon: 'Shield',
    },
    {
      id: '4',
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance',
      icon: 'Headphones',
    },
  ],
  testimonials: [
    {
      id: '1',
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      text: 'Absolutely incredible experience! The attention to detail and quality of service exceeded all expectations.',
      image: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: '2',
      name: 'Michael Chen',
      location: 'Singapore',
      rating: 5,
      text: 'Professional, reliable, and thoroughly enjoyable. The guides were knowledgeable and the itinerary was perfect.',
      image: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      location: 'Barcelona, Spain',
      rating: 5,
      text: 'Best travel agency I have ever worked with. They handled everything seamlessly and made our trip unforgettable.',
      image: 'https://i.pravatar.cc/150?img=3',
    },
  ],
};

/**
 * Get homepage settings from API
 * Uses sessionStorage for caching to reduce API calls
 */
export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    // Try to get from cache first
    const cached = sessionStorage.getItem('discovergroup-homepage-settings');
    const cacheTime = sessionStorage.getItem('discovergroup-homepage-settings-time');
    
    // Cache for 5 minutes
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < 5 * 60 * 1000) {
        return JSON.parse(cached);
      }
    }
    
    // Fetch from API
    const response = await fetch(`${API_URL}/api/homepage-settings`);
    
    if (response.ok) {
      const settings = await response.json();
      
      // Cache the settings
      sessionStorage.setItem('discovergroup-homepage-settings', JSON.stringify(settings));
      sessionStorage.setItem('discovergroup-homepage-settings-time', Date.now().toString());
      
      return settings;
    }
  } catch (error) {
    console.error('Error loading homepage settings from API:', error);
  }
  
  // Fallback to default settings
  return DEFAULT_SETTINGS;
}

/**
 * Get homepage settings synchronously from cache or defaults
 * Use this for initial render, then call getHomepageSettings() async
 */
export function getHomepageSettingsSync(): HomepageSettings {
  try {
    const cached = sessionStorage.getItem('discovergroup-homepage-settings');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading cached settings:', error);
  }
  return DEFAULT_SETTINGS;
}
