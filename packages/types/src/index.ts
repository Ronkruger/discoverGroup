// Shared types for the monorepo — keep this as the single source of truth for Tour.
export type TravelWindow = {
  start: string; // ISO date string, e.g. "2025-09-01"
  end: string;   // ISO date string, e.g. "2025-10-15"
};

export type ItineraryItem = {
  day: number;
  title: string;
  description?: string;
};

export type FullStop = {
  city: string;
  country: string;
  days?: number;
};

export type AdditionalInfo = {
  countriesVisited?: string[];
  startingPoint?: string;
  endingPoint?: string;
  mainCities?: Record<string, string[]>;
  // allow extra fields the API might include
  [key: string]: unknown;
};

export type Tour = {
  // ID in your mock is a string like "1" or a slug-based id; choose string for compatibility
  id: string;

  slug: string;
  title: string;
  summary?: string | null;
  line?: string | null;
  durationDays?: number;

  highlights?: string[];
  images?: string[]; // relative paths or URLs
  guaranteedDeparture?: boolean;
  bookingPdfUrl?: string | null;
  video_url?: string | null; // Storage URL for tour video

  travelWindow?: TravelWindow | null;
  itinerary?: ItineraryItem[];
  fullStops?: FullStop[];

  // Pricing (per-person totals expressed in PHP in your mock)
  regularPricePerPerson?: number;
  promoPricePerPerson?: number | null;
  // legacy field kept for compatibility
  basePricePerDay?: number;

  additionalInfo?: AdditionalInfo | null;

  // Sale fields
  isSaleEnabled?: boolean;
  saleEndDate?: string | null;

  // allow future fields without breaking consumers
  [key: string]: unknown;
};

export type TourCreate = Partial<
  Pick<
    Tour,
    | "slug"
    | "title"
    | "summary"
    | "line"
    | "durationDays"
    | "highlights"
    | "images"
    | "regularPricePerPerson"
    | "promoPricePerPerson"
    | "additionalInfo"
    | "isSaleEnabled"
    | "saleEndDate"
  >
>;