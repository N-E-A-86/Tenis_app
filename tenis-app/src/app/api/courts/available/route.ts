import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");

  if (!courtId || !date) {
    return NextResponse.json(
      { error: "Faltan courtId o date" },
      { status: 400 }
    );
  }

  try {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const reservations = await db.query(
      `SELECT "startTime", "endTime" FROM "Reservation"
       WHERE "courtId" = $1
         AND "status" = ANY($2)
         AND "startTime" >= $3
         AND "endTime" < $4`,
      [courtId, ["PENDING", "CONFIRMED"], selectedDate.toISOString(), nextDay.toISOString()]
    );

    const bookedSlots = (reservations ?? []).map((r) => {
      const start = new Date(r.startTime);
      return start.getHours();
    });

    const slots = [];
    for (let hour = 8; hour <= 23; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: !bookedSlots.includes(hour),
      });
    }

    return NextResponse.json({ slots, date: selectedDate.toISOString() });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Error al verificar disponibilidad" },
      { status: 500 }
    );
  }
}
