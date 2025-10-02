import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Check if tours already exist
  const existingTours = await prisma.tour.count();
  if (existingTours > 0) {
    console.log(`Database already has ${existingTours} tour(s). Skipping seed.`);
    return;
  }

  // Create initial tours
  const tour1 = await prisma.tour.create({
    data: {
      slug: "route-a-preferred-europe",
      title: "Route A Preferred - European Adventure",
      summary:
        "14-day journey through France, Switzerland, Italy, and Vatican City, (international flights to/from Manila handled separately).",
      durationDays: 14,
      line: "ROUTE_A",
      published: true,
      regularPricePerPerson: 180000,
      promoPricePerPerson: 160000,
      basePricePerDay: 11429,
    },
  });

  console.log("Created tour:", tour1.title);

  const tour2 = await prisma.tour.create({
    data: {
      slug: "red-line-paris-rome",
      title: "Red Line: Paris to Rome",
      summary: "Classic European tour covering France, Switzerland, and Italy.",
      durationDays: 10,
      line: "RED",
      published: true,
      regularPricePerPerson: 120000,
      promoPricePerPerson: 100000,
    },
  });

  console.log("Created tour:", tour2.title);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
