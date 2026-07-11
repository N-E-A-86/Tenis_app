import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mpPayment } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    const payment = await mpPayment.get({ id: paymentId });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const reservationId = payment.metadata?.reservation_id as string;
    if (!reservationId) {
      return NextResponse.json({ error: "No reservation ID" }, { status: 400 });
    }

    const mpStatus = payment.status;
    let paymentStatus: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" = "PENDING";
    let reservationStatus: "PENDING" | "CONFIRMED" | "CANCELLED" = "PENDING";

    switch (mpStatus) {
      case "approved":
        paymentStatus = "APPROVED";
        reservationStatus = "CONFIRMED";
        break;
      case "rejected":
      case "cancelled":
        paymentStatus = "REJECTED";
        reservationStatus = "CANCELLED";
        break;
      case "refunded":
        paymentStatus = "REFUNDED";
        reservationStatus = "CANCELLED";
        break;
    }

    await db.query(
      `UPDATE "Payment" SET "status" = $1, "mpPaymentId" = $2, "updatedAt" = NOW()
       WHERE "reservationId" = $3`,
      [paymentStatus, Number(paymentId), reservationId]
    );

    await db.query(
      `UPDATE "Reservation" SET "status" = $1, "updatedAt" = NOW()
       WHERE "id" = $2`,
      [reservationStatus, reservationId]
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
