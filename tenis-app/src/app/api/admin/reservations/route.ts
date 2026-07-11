import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  try {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`r."status" = $${paramIndex++}`);
      values.push(status);
    }

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      conditions.push(`r."startTime" >= $${paramIndex++}`);
      values.push(selectedDate.toISOString());
      conditions.push(`r."endTime" < $${paramIndex++}`);
      values.push(nextDay.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const reservations = await db.query(
      `SELECT r.*,
        row_to_json(u.*) as "user",
        row_to_json(c.*) as court,
        row_to_json(p.*) as payment
       FROM "Reservation" r
       LEFT JOIN "User" u ON u.id = r."userId"
       LEFT JOIN "Court" c ON c.id = r."courtId"
       LEFT JOIN "Payment" p ON p."reservationId" = r.id
       ${whereClause}
       ORDER BY r."startTime" DESC`,
      values
    );

    return NextResponse.json(reservations ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}
