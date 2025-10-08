export type ItineraryDay = {
    day: number;
    title: string;
    description?: string;
};
export type Stop = {
    city: string;
    country?: string;
    isStart?: boolean;
    isEnd?: boolean;
    days?: number;
};
export type AdditionalInfo = {
    startingPoint?: string;
    endingPoint?: string;
    countriesVisited?: string[];
    mainCities?: Record<string, string[]>;
    [key: string]: unknown;
};
export type TravelWindow = {
    start: string;
    end: string;
};
export type Tour = {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    line?: string;
    durationDays: number;
    highlights?: string[];
    images?: string[];
    guaranteedDeparture?: boolean;
    bookingPdfUrl?: string;
    departureDates?: string[];
    travelWindow?: TravelWindow;
    itinerary?: ItineraryDay[];
    fullStops?: Stop[];
    basePricePerDay?: number;
    additionalInfo?: AdditionalInfo;
    [key: string]: unknown;
};
//# sourceMappingURL=index.d.ts.map