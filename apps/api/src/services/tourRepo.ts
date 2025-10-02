import prisma from "./prismaClient";

export type TourCreateData = {
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

export type TourUpdateData = Partial<TourCreateData>;

export async function getAllTours() {
  return await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getTourById(id: string) {
  return await prisma.tour.findUnique({
    where: { id },
  });
}

export async function createTour(data: TourCreateData) {
  return await prisma.tour.create({
    data,
  });
}

export async function updateTour(id: string, data: TourUpdateData) {
  return await prisma.tour.update({
    where: { id },
    data,
  });
}

export async function deleteTour(id: string) {
  return await prisma.tour.delete({
    where: { id },
  });
}
