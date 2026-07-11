import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const courts = await db.query(
      'SELECT * FROM "Court" WHERE "isActive" = $1 ORDER BY "name" ASC',
      [true]
    );

    return NextResponse.json(courts ?? []);
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Error al obtener las canchas" },
      { status: 500 }
    );
  }
}
