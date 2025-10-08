import * as api from "./apiClient";
/**
 * Local fallback for the 'Tour' type to avoid the "Cannot find module '@discovergroup/types'"
 * error during compilation; replace with the real type definitions when the package is available.
 */
export type Tour = unknown;
export declare function getAllTours(): Promise<Tour[]>;
export declare function getTourById(id: string | number): Promise<Tour | null>;
export declare function createTour(data: api.TourPayload): Promise<Tour>;
export declare function updateTour(id: string | number, data: Partial<Tour>): Promise<Tour>;
export declare function deleteTour(id: string | number): Promise<void>;
//# sourceMappingURL=tourRepo.d.ts.map