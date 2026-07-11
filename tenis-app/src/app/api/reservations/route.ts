import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const reservations = await db.query(
      `SELECT r.*,
        row_to_json(c.*) as court,
        row_to_json(p.*) as payment
       FROM "Reservation" r
       LEFT JOIN "Court" c ON c.id = r."courtId"
       LEFT JOIN "Payment" p ON p."reservationId" = r.id
       WHERE r."userId" = $1
       ORDER BY r."startTime" DESC`,
      [session.user.id]
    );

    return NextResponse.json(reservations ?? []);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courtId, date, hour } = body;

    if (!courtId || !date || hour === undefined) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const court = await db.queryOne(
      `SELECT * FROM "Court" WHERE "id" = $1`,
      [courtId]
    );

    if (!court || !court.isActive) {
      return NextResponse.json(
        { error: "Cancha no disponible" },
        { status: 404 }
      );
    }

    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    if (hour < 8 || hour > 23) {
      return NextResponse.json(
        { error: "Horario no permitido (08:00 - 00:00)" },
        { status: 400 }
      );
    }

    const existingReservation = await db.queryOne(
      `SELECT id FROM "Reservation"
       WHERE "courtId" = $1
         AND "status" = ANY($2)
         AND "startTime" < $3
         AND "endTime" > $4`,
      [courtId, ["PENDING", "CONFIRMED"], endTime.toISOString(), startTime.toISOString()]
    );

    if (existingReservation) {
      return NextResponse.json(
        { error: "El horario ya está reservado" },
        { status: 409 }
      );
    }

    const [reservation] = await db.query(
      `INSERT INTO "Reservation" ("userId", "courtId", "startTime", "endTime", "totalPrice", "status")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        session.user.id,
        courtId,
        startTime.toISOString(),
        endTime.toISOString(),
        court.pricePerHour,
        "PENDING",
      ]
    );

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
