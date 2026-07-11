import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: {
        court: true,
        payment: true,
      },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json(reservations);
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

    // Validar cancha
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court || !court.isActive) {
      return NextResponse.json(
        { error: "Cancha no disponible" },
        { status: 404 }
      );
    }

    // Calcular horarios
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    // Validar horario permitido (08:00 - 00:00)
    if (hour < 8 || hour > 23) {
      return NextResponse.json(
        { error: "Horario no permitido (08:00 - 00:00)" },
        { status: 400 }
      );
    }

    // Verificar disponibilidad
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        courtId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "El horario ya está reservado" },
        { status: 409 }
      );
    }

    // Crear reserva
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        courtId,
        startTime,
        endTime,
        totalPrice: court.pricePerHour,
        status: "PENDING",
      },
      include: {
        court: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
