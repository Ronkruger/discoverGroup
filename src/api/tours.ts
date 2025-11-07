import type { Tour } from "../types/index.js";

// Use VITE_API_BASE_URL (consistent with .env files) or VITE_API_URL as fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchTours(): Promise<Tour[]> {
  try {
    const response = await fetch(`${API_BASE}/public/tours`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.status}`);
    }
    const tours = await response.json();
    console.log('✅ Loaded tours from API:', tours.length);
    return tours;
  } catch (error) {
    console.error("❌ Error fetching tours from API:", error);
    console.error("API_BASE:", API_BASE);
    // Don't return mock tours - throw error so user knows API is down
    throw new Error(`Failed to load tours from backend: ${error}`);
  }
}

export async function fetchTourBySlug(slug: string): Promise<Tour | null> {
  try {
    const response = await fetch(`${API_BASE}/public/tours/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch tour: ${response.status}`);
    }
    const tour = await response.json();
    console.log('✅ Loaded tour from API:', tour.title);
    return tour;
  } catch (error) {
    console.error("❌ Error fetching tour by slug:", error);
    console.error("API_BASE:", API_BASE);
    // Don't return mock tours - throw error so user knows API is down
    throw new Error(`Failed to load tour from backend: ${error}`);
  }
}

export async function fetchContinents(): Promise<string[]> {
  return ["Europe", "Asia", "North America"];
}

export async function fetchCountriesByContinent(continent: string): Promise<string[]> {
  const countries: Record<string, string[]> = {
    "Europe": ["France", "Switzerland", "Italy"],
    "Asia": ["Thailand", "Vietnam", "Philippines"],
    "North America": ["USA", "Canada"]
  };
  return countries[continent] || [];
}

export async function fetchDestinationsByContinent(continent: string): Promise<string[]> {
  return fetchCountriesByContinent(continent);
}

export async function fetchToursByCountry(country: string): Promise<Tour[]> {
  const tours = await fetchTours();
  return tours.filter((t) => (t.additionalInfo?.countriesVisited ?? []).includes(country));
}

export async function fetchToursByContinent(continent: string): Promise<Tour[]> {
  const tours = await fetchTours();
  const continentCountries = await fetchCountriesByContinent(continent);
  return tours.filter((t) => (t.additionalInfo?.countriesVisited ?? []).some((c) => continentCountries.includes(c)));
}
