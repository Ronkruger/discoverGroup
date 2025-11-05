import type { Tour } from "../types/index.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchTours(): Promise<Tour[]> {
  try {
    const response = await fetch(`${API_BASE}/public/tours`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tours: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tours:", error);
    return mockTours;
  }
}

export async function fetchTourBySlug(slug: string): Promise<Tour | null> {
  try {
    const response = await fetch(`${API_BASE}/public/tours/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch tour: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching tour by slug:", error);
    return mockTours.find((t) => t.slug === slug) ?? null;
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

const mockTours: Tour[] = [
  {
    id: "route-a-preferred",
    slug: "route-a-preferred-europe",
    title: "Route A Preferred - European Adventure",
    summary: "14-day journey through France, Switzerland, Italy, and Vatican City.",
    line: "ROUTE_A",
    durationDays: 14,
    highlights: ["Paris", "Zurich", "Milan", "Florence", "Rome"],
    images: ["../image.png"],
    guaranteedDeparture: true,
    regularPricePerPerson: 250000,
    promoPricePerPerson: 160000,
    allowsDownpayment: true,
    departureDates: ["2026-02-04", "2026-02-18", "2026-03-04", "2026-03-18"],
    travelWindow: {
      start: "2026-02-04",
      end: "2026-03-31"
    },
    additionalInfo: {
      countriesVisited: ["France", "Switzerland", "Italy", "Vatican City"],
      startingPoint: "Manila, Philippines",
      endingPoint: "Manila, Philippines"
    }
  }
];
