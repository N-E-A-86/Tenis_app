import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL!,
});

const courts = [
  {
    name: "Cancha Central",
    description:
      "Cancha principal con capacidad para 200 espectadores. Superficie de polvo de ladrillo profesional, ideal para torneos y partidos importantes.",
    surfaceType: "CLAY" as const,
    pricePerHour: 8000,
  },
  {
    name: "Cancha 2",
    description:
      "Cancha de polvo de ladrillo con iluminación LED profesional. Perfecta para partidos diurnos y nocturnos.",
    surfaceType: "CLAY" as const,
    pricePerHour: 6000,
  },
  {
    name: "Cancha 3",
    description:
      "Cancha rápida de superficie sintética. Ideal para jugadores que prefieren un juego más veloz.",
    surfaceType: "SYNTHETIC" as const,
    pricePerHour: 5000,
  },
  {
    name: "Cancha 4",
    description:
      "Cancha de superficie dura con tecnología de absorción de impacto. Recomendada para jugadores con experiencia.",
    surfaceType: "HARD" as const,
    pricePerHour: 7000,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const court of courts) {
    const existing = await prisma.court.findUnique({
      where: { name: court.name },
    });

    if (!existing) {
      await prisma.court.create({ data: court });
      console.log(`  ✓ ${court.name}`);
    } else {
      console.log(`  - ${court.name} (already exists)`);
    }
  }

  console.log("✅ Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
