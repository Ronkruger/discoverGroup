const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface Country {
  _id: string;
  name: string;
  slug: string;
  description: string;
  heroImageUrl?: string; // Primary hero image URL (backward compatibility)
  heroImages?: string[]; // Array of hero image URLs
  heroQuery?: string;
  bestTime: string;
  currency: string;
  language: string;
  visaInfo?: string;
  attractions: Attraction[];
  testimonials: Testimonial[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attraction {
  _id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface Testimonial {
  _id?: string;
  quote: string;
  author?: string;
  displayOrder: number;
}

export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${API_BASE_URL}/api/countries`);
  if (!response.ok) {
    throw new Error('Failed to fetch countries');
  }
  return response.json();
}

export async function fetchCountryBySlug(slug: string): Promise<Country | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/countries/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch country');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching country:', error);
    return null;
  }
}

export async function createCountry(country: Partial<Country>): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(country),
  });
  if (!response.ok) {
    let errorMessage = 'Failed to create country';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function updateCountry(id: string, country: Partial<Country>): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(country),
  });
  if (!response.ok) {
    let errorMessage = 'Failed to update country';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status}): ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function deleteCountry(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete country');
  }
}

export async function addAttraction(countryId: string, attraction: Omit<Attraction, '_id'>): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/attractions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attraction),
  });
  if (!response.ok) {
    throw new Error('Failed to add attraction');
  }
  return response.json();
}

export async function updateAttraction(
  countryId: string,
  attractionId: string,
  attraction: Partial<Attraction>
): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/attractions/${attractionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attraction),
  });
  if (!response.ok) {
    throw new Error('Failed to update attraction');
  }
  return response.json();
}

export async function deleteAttraction(countryId: string, attractionId: string): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/attractions/${attractionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete attraction');
  }
  return response.json();
}

export async function addTestimonial(countryId: string, testimonial: Omit<Testimonial, '_id'>): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testimonial),
  });
  if (!response.ok) {
    throw new Error('Failed to add testimonial');
  }
  return response.json();
}

export async function updateTestimonial(
  countryId: string,
  testimonialId: string,
  testimonial: Partial<Testimonial>
): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/testimonials/${testimonialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testimonial),
  });
  if (!response.ok) {
    throw new Error('Failed to update testimonial');
  }
  return response.json();
}

export async function deleteTestimonial(countryId: string, testimonialId: string): Promise<Country> {
  const response = await fetch(`${API_BASE_URL}/api/countries/${countryId}/testimonials/${testimonialId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete testimonial');
  }
  return response.json();
}
