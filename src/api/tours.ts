import type { Tour } from "../types/index.js";

// Use VITE_API_BASE_URL consistently
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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

export async function fetchFeaturedTours(limit: number = 6): Promise<Tour[]> {
  try {
    const response = await fetch(`${API_BASE}/public/tours?limit=${limit}&featured=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch featured tours: ${response.status}`);
    }
    const tours = await response.json();
    console.log('✅ Loaded featured tours from API:', tours.length);
    return tours;
  } catch (error) {
    console.error("❌ Error fetching featured tours from API:", error);
    // Fallback to fetching all tours and taking first 6
    console.log('⚠️ Falling back to fetchTours with limit');
    const allTours = await fetchTours();
    return allTours.slice(0, limit);
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
  try {
    const tours = await fetchTours();
    const continents = new Set<string>();
    
    tours.forEach(tour => {
      if (typeof tour.continent === "string" && tour.continent.length > 0) {
        continents.add(tour.continent);
      }
    });
    
    // Return sorted continents, with Europe first if it exists
    const continentList = Array.from(continents).sort();
    const europeIndex = continentList.indexOf('Europe');
    if (europeIndex > 0) {
      continentList.splice(europeIndex, 1);
      continentList.unshift('Europe');
    }
    
    return continentList;
  } catch {
    // Fallback to hardcoded list
    return ["Europe", "Asia", "North America"];
  }
}

export async function fetchCountriesByContinent(continent: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/public/tours/by-continent/${encodeURIComponent(continent)}/countries`);
    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    // Fallback to getting countries from tours
    const tours = await fetchTours();
    const countries = new Set<string>();
    
    tours.forEach(tour => {
      if (tour.continent === continent) {
        const tourCountries = Array.isArray(tour.additionalInfo?.countriesVisited)
          ? tour.additionalInfo?.countriesVisited
          : Array.isArray(tour.additionalInfo?.countries)
            ? tour.additionalInfo?.countries
            : [];
        tourCountries.forEach((country: string) => countries.add(country));
      }
    });
    
    return Array.from(countries).sort();
  }
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
