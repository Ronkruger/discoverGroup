import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.tour.findFirst({ where: { slug: "route-a-preferred" } });
  if (!existing) {
    await prisma.tour.create({
      data: {
        slug: "route-a-preferred",
        title: "Route A Preferred - European Adventure",
        durationDays: 14,
      },
    });
    console.log("Seeded initial tour");
  } else {
    console.log("Seed data already present");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });