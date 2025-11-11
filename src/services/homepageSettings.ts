// Service to fetch homepage settings from admin panel
// Settings are stored in localStorage by the admin panel

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
 * Get homepage settings from localStorage (set by admin panel)
 * Falls back to default settings if not found
 */
export function getHomepageSettings(): HomepageSettings {
  try {
    const savedSettings = localStorage.getItem('discovergroup-homepage-settings');
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        logo: { ...DEFAULT_SETTINGS.logo, ...(parsed.logo || {}) },
        hero: { ...DEFAULT_SETTINGS.hero, ...(parsed.hero || {}) },
        statistics: { ...DEFAULT_SETTINGS.statistics, ...(parsed.statistics || {}) },
        features: parsed.features || DEFAULT_SETTINGS.features,
        testimonials: parsed.testimonials || DEFAULT_SETTINGS.testimonials,
      };
    }
  } catch (error) {
    console.error('Error loading homepage settings:', error);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Subscribe to homepage settings changes
 * Calls callback whenever settings are updated in localStorage
 */
export function subscribeToSettingsChanges(callback: (settings: HomepageSettings) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === 'discovergroup-homepage-settings') {
      callback(getHomepageSettings());
    }
  };
  
  // Listen for postMessage from admin panel (cross-domain sync)
  const messageHandler = (event: MessageEvent) => {
    // Only accept messages from admin domain
    const adminOrigins = ['http://localhost:5174', 'https://lambent-dodol-2486cc.netlify.app'];
    if (!adminOrigins.includes(event.origin)) return;
    
    if (event.data.type === 'SYNC_HOMEPAGE_SETTINGS' && event.data.settings) {
      try {
        localStorage.setItem('discovergroup-homepage-settings', JSON.stringify(event.data.settings));
        callback(event.data.settings);
        console.log('✅ Homepage settings synced from admin panel');
      } catch (error) {
        console.error('Error syncing settings:', error);
      }
    }
  };
  
  window.addEventListener('storage', handler);
  window.addEventListener('message', messageHandler);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('message', messageHandler);
  };
}
