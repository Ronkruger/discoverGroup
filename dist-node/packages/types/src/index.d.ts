export type TravelWindow = {
    start: string;
    end: string;
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
    [key: string]: unknown;
};
export type Tour = {
    id: string;
    slug: string;
    title: string;
    summary?: string | null;
    line?: string | null;
    durationDays?: number;
    highlights?: string[];
    images?: string[];
    guaranteedDeparture?: boolean;
    bookingPdfUrl?: string | null;
    travelWindow?: TravelWindow | null;
    itinerary?: ItineraryItem[];
    fullStops?: FullStop[];
    regularPricePerPerson?: number;
    promoPricePerPerson?: number | null;
    basePricePerDay?: number;
    additionalInfo?: AdditionalInfo | null;
    [key: string]: unknown;
};
export type TourCreate = Partial<Pick<Tour, "slug" | "title" | "summary" | "line" | "durationDays" | "highlights" | "images" | "regularPricePerPerson" | "promoPricePerPerson" | "additionalInfo">>;
//# sourceMappingURL=index.d.ts.map