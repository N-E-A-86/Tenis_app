import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    const reservation = await db.queryOne(
      `SELECT * FROM "Reservation" WHERE "id" = $1`,
      [id]
    );

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    if (reservation.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (body.status === "CANCELLED") {
      if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
        return NextResponse.json(
          { error: "No se puede cancelar esta reserva" },
          { status: 400 }
        );
      }
    }

    const [updated] = await db.query(
      `UPDATE "Reservation" SET "status" = $1, "updatedAt" = NOW()
       WHERE "id" = $2
       RETURNING *`,
      [body.status, id]
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}
