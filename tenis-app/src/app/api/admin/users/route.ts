import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const users = await db.query(
      `SELECT id, name, email, role, "createdAt",
        (SELECT count(*) FROM "Reservation" WHERE "userId" = "User"."id") as reservation_count
       FROM "User"
       ORDER BY "createdAt" DESC`
    );

    return NextResponse.json(users ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
