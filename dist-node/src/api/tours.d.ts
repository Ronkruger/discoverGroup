import type { Tour } from "../types";
export declare function fetchTours(): Promise<Tour[]>;
export declare function fetchTourBySlug(slug: string): Promise<Tour | null>;
export declare function fetchContinents(): Promise<string[]>;
export declare function fetchCountriesByContinent(continent: string): Promise<string[]>;
export declare function fetchToursByCountry(country: string): Promise<Tour[]>;
export declare function fetchToursByContinent(continent: string): Promise<Tour[]>;
//# sourceMappingURL=tours.d.ts.map