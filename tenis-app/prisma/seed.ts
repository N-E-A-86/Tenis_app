import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
    const { data: existing } = await supabase
      .from("Court")
      .select("id")
      .eq("name", court.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from("Court")
        .insert({
          name: court.name,
          description: court.description,
          surfaceType: court.surfaceType,
          pricePerHour: court.pricePerHour,
        });

      if (error) {
        console.log(`  ✗ ${court.name}: ${error.message}`);
      } else {
        console.log(`  ✓ ${court.name}`);
      }
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
  });
