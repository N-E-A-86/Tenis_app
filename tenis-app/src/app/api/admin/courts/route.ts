import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const courts = await db.query(
      `SELECT *,
        (SELECT count(*) FROM "Reservation" WHERE "courtId" = "Court"."id") as reservation_count
       FROM "Court"
       ORDER BY "name" ASC`
    );

    return NextResponse.json(courts ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener canchas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, surfaceType, pricePerHour, imageUrl } = body;

    if (!name || !pricePerHour) {
      return NextResponse.json(
        { error: "Nombre y precio son requeridos" },
        { status: 400 }
      );
    }

    const [court] = await db.query(
      `INSERT INTO "Court" (name, description, "surfaceType", "pricePerHour", "imageUrl")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, surfaceType || "CLAY", parseFloat(pricePerHour), imageUrl ?? null]
    );

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear cancha" },
      { status: 500 }
    );
  }
}
