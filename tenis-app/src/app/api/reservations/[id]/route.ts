import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Solo el dueño o admin puede modificar
    const isAdmin = session.user.role === "ADMIN";
    if (reservation.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Solo permitir cancelar si está PENDING o CONFIRMED
    if (body.status === "CANCELLED") {
      if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
        return NextResponse.json(
          { error: "No se puede cancelar esta reserva" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: body.status },
      include: { court: true, payment: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}
