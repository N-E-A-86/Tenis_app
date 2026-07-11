import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { preference } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "Falta reservationId" },
        { status: 400 }
      );
    }

    const [reservation] = await db.query(
      `SELECT r.*,
        row_to_json(c.*) as court,
        row_to_json(u.*) as "user"
       FROM "Reservation" r
       LEFT JOIN "Court" c ON c.id = r."courtId"
       LEFT JOIN "User" u ON u.id = r."userId"
       WHERE r."id" = $1`,
      [reservationId]
    );

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        { error: "La reserva no está pendiente" },
        { status: 400 }
      );
    }

    const mpPreference = await preference.create({
      body: {
        items: [
          {
            id: reservation.id,
            title: `Reserva: ${reservation.court.name} - ${new Date(reservation.startTime).toLocaleDateString("es-AR")} ${new Date(reservation.startTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`,
            quantity: 1,
            unit_price: Number(reservation.totalPrice),
            currency_id: "ARS",
          },
        ],
        payer: {
          email: reservation.user.email,
          name: reservation.user.name || undefined,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/canchas/${reservation.courtId}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        metadata: {
          reservation_id: reservation.id,
        },
      },
    });

    await db.query(
      `INSERT INTO "Payment" ("reservationId", amount, status, "mpPreferenceId")
       VALUES ($1, $2, $3, $4)`,
      [reservation.id, reservation.totalPrice, "PENDING", mpPreference.id]
    );

    return NextResponse.json({
      preferenceId: mpPreference.id,
      initPoint: mpPreference.init_point,
      sandboxInitPoint: mpPreference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating payment preference:", error);
    return NextResponse.json(
      { error: "Error al crear el pago" },
      { status: 500 }
    );
  }
}
