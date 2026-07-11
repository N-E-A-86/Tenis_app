import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

const courts = [
  {
    name: "Cancha Central",
    description:
      "Cancha principal con capacidad para 200 espectadores. Superficie de polvo de ladrillo profesional, ideal para torneos y partidos importantes.",
    surfaceType: "CLAY",
    pricePerHour: 8000,
  },
  {
    name: "Cancha 2",
    description:
      "Cancha de polvo de ladrillo con iluminación LED profesional. Perfecta para partidos diurnos y nocturnos.",
    surfaceType: "CLAY",
    pricePerHour: 6000,
  },
  {
    name: "Cancha 3",
    description:
      "Cancha rápida de superficie sintética. Ideal para jugadores que prefieren un juego más veloz.",
    surfaceType: "SYNTHETIC",
    pricePerHour: 5000,
  },
  {
    name: "Cancha 4",
    description:
      "Cancha de superficie dura con tecnología de absorción de impacto. Recomendada para jugadores con experiencia.",
    surfaceType: "HARD",
    pricePerHour: 7000,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const court of courts) {
    const { rows: existing } = await pool.query(
      `SELECT id FROM "Court" WHERE name = $1`,
      [court.name]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO "Court" (name, description, "surfaceType", "pricePerHour")
         VALUES ($1, $2, $3, $4)`,
        [court.name, court.description, court.surfaceType, court.pricePerHour]
      );
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
    await pool.end();
  });
