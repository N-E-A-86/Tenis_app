import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

    const { data: reservation } = await supabaseAdmin
      .from("Reservation")
      .select("*, court:courtId(*), user:userId(*)")
      .eq("id", reservationId)
      .single();

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
        items: [{
          id: reservation.id,
          title: `Reserva: ${reservation.court.name} - ${new Date(reservation.startTime).toLocaleDateString("es-AR")} ${new Date(reservation.startTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`,
          quantity: 1,
          unit_price: Number(reservation.totalPrice),
          currency_id: "ARS",
        }],
        payer: {
          email: reservation.user.email,
          name: reservation.user.name || undefined,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/canchas/${reservation.courtId}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
        metadata: { reservation_id: reservation.id },
      },
    });

    const { error: insertError } = await supabaseAdmin
      .from("Payment")
      .insert({
        reservationId: reservation.id,
        amount: reservation.totalPrice,
        status: "PENDING",
        mpPreferenceId: mpPreference.id,
      });

    if (insertError) {
      console.error("Error inserting payment:", insertError);
    }

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
