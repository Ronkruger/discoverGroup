// src/api/tours.ts
import type { Tour } from "../types";

/**
 * Mock tours dataset with helper lookup functions.
 *
 * Prices are expressed as per-person totals (regularPricePerPerson / promoPricePerPerson) in PHP.
 * These fields are used by the UI to compute totals (passengers × per-person price).
 *
 * For backwards compatibility the old basePricePerDay is still present on some tours, but
 * the UI no longer uses basePricePerDay as the default — it prefers regularPricePerPerson.
 */

const countryToContinent: Record<string, string> = {
  France: "Europe",
  Switzerland: "Europe",
  Italy: "Europe",
  "Vatican City": "Europe",
  Austria: "Europe",
  Germany: "Europe",
  Spain: "Europe",
  Portugal: "Europe",
  Philippines: "Asia",
  USA: "Americas",
  Canada: "Americas",
};

const mockTours: Tour[] = [
  // Example tour
  {
    id: "1",
    slug: "red-line-paris-rome",
    title: "Red Line – Paris to Rome",
    summary: "7-day journey from Paris through Lucerne and Florence to Rome.",
    line: "RED",
    durationDays: 7,
    highlights: ["Paris", "Lucerne", "Florence", "Rome"],
    images: ["../image.png"],
    guaranteedDeparture: true,
    bookingPdfUrl: "/assets/redline.pdf",
    travelWindow: {
      start: "2025-09-01",
      end: "2025-10-15",
    },
    itinerary: [
      { day: 1, title: "Arrival in Paris", description: "Welcome and free time in Paris." },
      { day: 2, title: "Paris City Tour", description: "Eiffel Tower, Louvre, and Seine cruise." },
      { day: 3, title: "Paris to Lucerne", description: "Drive through scenic French countryside into Switzerland." },
      { day: 4, title: "Lucerne", description: "Explore Lake Lucerne and Mount Pilatus." },
      { day: 5, title: "Lucerne to Florence", description: "Travel across the Alps into Italy." },
      { day: 6, title: "Florence", description: "Guided walking tour including Duomo and Ponte Vecchio." },
      { day: 7, title: "Florence to Rome", description: "Final destination with guided Rome highlights." },
    ],
    fullStops: [
      { city: "Paris", country: "France" },
      { city: "Lucerne", country: "Switzerland" },
      { city: "Florence", country: "Italy" },
      { city: "Rome", country: "Italy" },
    ],
    // Per-person totals in PHP (default to regular)
    regularPricePerPerson: 112000, // e.g., PHP 112,000 per person for the full 7-day tour
    promoPricePerPerson: 95000, // optional promo price
    // kept for compatibility but no longer used as primary source:
    basePricePerDay: 16000,
    additionalInfo: {
      countriesVisited: ["France", "Switzerland", "Italy"],
      startingPoint: "Paris, France",
      endingPoint: "Rome, Italy",
      mainCities: {
        france: ["Paris"],
        switzerland: ["Lucerne"],
        italy: ["Florence", "Rome"],
      },
    },
  },

  // Route A Preferred
  {
    id: "route-a-preferred",
    slug: "route-a-preferred-europe",
    title: "Route A Preferred - European Adventure",
    summary:
      "14-day journey through France, Switzerland, Italy, and Vatican City, (international flights to/from Manila handled separately).",
    line: "ROUTE_A",
    durationDays: 14,
    highlights: ["Paris", "Zurich", "Milan", "Florence", "Rome"],
    images: [
      "../image.png",
      "../image.png",
      "../image.png",
      "../image.png",
      "../image.png",
    ],
    guaranteedDeparture: true,
    bookingPdfUrl: "/assets/route-a-preferred.pdf",
    travelWindow: {
      start: "2026-02-04",
      end: "2026-02-18",
    },
    itinerary: [
      { day: 1, title: "Departure from Manila", description: "Check-in at Manila International Airport for your flight to Paris." },
      { day: 2, title: "Arrival in Paris, France", description: "Welcome to Paris! Transfer to hotel, evening welcome dinner with Eiffel Tower views." },
      { day: 3, title: "Paris City Tour", description: "Full day exploring Paris highlights including Louvre Museum and Notre-Dame Cathedral." },
      { day: 4, title: "Paris to Zurich", description: "Scenic train journey through France to Switzerland. Evening arrival in Zurich." },
      { day: 5, title: "Zurich, Switzerland", description: "Explore Zurich's Old Town, Lake Zurich, and optional Swiss Alps excursion." },
      { day: 6, title: "Zurich to Milan", description: "Morning departure to Italy. Afternoon arrival in Milan, visit Duomo Cathedral." },
      { day: 7, title: "Milan, Italy", description: "Full day in Milan including Last Supper viewing and shopping at Galleria." },
      { day: 8, title: "Milan to Florence", description: "Travel to Florence. Evening walking tour of historic center." },
      { day: 9, title: "Florence, Italy", description: "Discover Renaissance art at Uffizi Gallery and visit Michelangelo's David." },
      { day: 10, title: "Florence to Rome", description: "Morning transfer to Rome. Afternoon Vatican Museums visit." },
      { day: 11, title: "Rome & Vatican City", description: "St. Peter's Basilica, Sistine Chapel, and Vatican Gardens tour." },
      { day: 12, title: "Ancient Rome", description: "Colosseum, Roman Forum, and Pantheon exploration." },
      { day: 13, title: "Rome Departure", description: "Free morning for last-minute shopping. Evening flight to Manila." },
      { day: 14, title: "Arrival in Manila", description: "Morning arrival in Manila. Tour concludes." },
    ],
    fullStops: [
      { city: "Paris", country: "France", days: 2 },
      { city: "Zurich", country: "Switzerland", days: 2 },
      { city: "Milan", country: "Italy", days: 2 },
      { city: "Florence", country: "Italy", days: 2 },
      { city: "Rome", country: "Italy", days: 3 },
      { city: "Vatican City", country: "Vatican City", days: 1 },
    ],
    // Use per-person prices in PHP. Regular price (default) is 250,000 PHP per person for the whole tour.
    regularPricePerPerson: 250000,
    // Promo example (keeps earlier promo shown in mockups)
    promoPricePerPerson: 160000,
    // kept for compatibility
    basePricePerDay: 11429,
    additionalInfo: {
      startingPoint: "Manila, Philippines",
      endingPoint: "Manila, Philippines",
      countriesVisited: ["France", "Switzerland", "Italy", "Vatican City"],
      mainCities: {
        france: ["Paris"],
        switzerland: ["Zurich"],
        italy: ["Milan", "Florence", "Rome"],
        vaticanCity: ["Vatican City"],
      },
    },
  },
];

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function fetchTours(): Promise<Tour[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockTours;
}

export async function fetchTourBySlug(slug: string): Promise<Tour | null> {
  await new Promise((r) => setTimeout(r, 150));
  return mockTours.find((t) => t.slug === slug) ?? null;
}

export async function fetchContinents(): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 120));
  const countries = mockTours.reduce<string[]>((acc, t) => acc.concat(t.additionalInfo?.countriesVisited ?? []), []);
  const continents = countries.map((c) => countryToContinent[c] ?? "Other");
  return unique(continents);
}

export async function fetchCountriesByContinent(continent: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 120));
  const countries = mockTours.reduce<string[]>((acc, t) => acc.concat(t.additionalInfo?.countriesVisited ?? []), []);
  const filtered = countries.filter((c) => (countryToContinent[c] ?? "Other") === continent);
  return unique(filtered).sort((a, b) => a.localeCompare(b));
}

export async function fetchToursByCountry(country: string): Promise<Tour[]> {
  await new Promise((r) => setTimeout(r, 180));
  return mockTours.filter((t) => (t.additionalInfo?.countriesVisited ?? []).indexOf(country) !== -1);
}

export async function fetchToursByContinent(continent: string): Promise<Tour[]> {
  await new Promise((r) => setTimeout(r, 180));
  const continentCountries = new Set(
    Object.keys(countryToContinent).filter((country) => countryToContinent[country] === continent)
  );
  return mockTours.filter((t) =>
    (t.additionalInfo?.countriesVisited ?? []).some((c) => continentCountries.has(c))
  );
}