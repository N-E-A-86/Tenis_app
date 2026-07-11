import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const selectedDate = new Date(date as string);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Obtener reservas existentes para esa cancha y fecha
    const reservations = await prisma.reservation.findMany({
      where: {
        courtId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: selectedDate },
        endTime: { lt: nextDay },
      },
      select: { startTime: true, endTime: true },
    });

    const bookedSlots = reservations.map((r) => {
      const start = new Date(r.startTime);
      return start.getHours();
    });

    // Generar slots disponibles (08:00 - 23:00)
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
