export interface Tour {
  id?: string | number;
  slug: string;
  title: string;
  summary?: string;
  durationDays?: number;
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  additionalInfo?: string;
}
export type TourPayload = Partial<Pick<Tour, "slug" | "title" | "summary" | "durationDays" | "regularPricePerPerson" | "promoPricePerPerson" | "additionalInfo">>;
export declare function fetchTours(): Promise<Tour[]>;
export declare function fetchTourById(id: string | number): Promise<Tour | null>;
export declare function createTour(data: TourPayload): Promise<Tour>;
export declare function updateTour(id: string | number, data: TourPayload): Promise<Tour>;
export declare function deleteTour(id: string | number): Promise<void>;
//# sourceMappingURL=apiClient.d.ts.map