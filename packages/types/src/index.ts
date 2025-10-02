export type Tour = {
  id?: number | string;
  slug: string;
  title: string;
  summary?: string;
  durationDays?: number;
  line?: string;
  published?: boolean;
  regularPricePerPerson?: number;
  promoPricePerPerson?: number;
  basePricePerDay?: number;
};

export type Transaction = {
  id: string;
  tourId?: number | string;
  amount: number;
  currency?: string;
  status: string;
  createdAt: string;
};