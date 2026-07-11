import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Solo procesar notificaciones de pago
    if (type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Obtener información del pago desde MP
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
      default:
        paymentStatus = "PENDING";
    }

    // Actualizar payment
    await prisma.payment.update({
      where: { reservationId },
      data: {
        status: paymentStatus,
        mpPaymentId: paymentId,
        mpMerchantOrderId: payment.order?.id ? BigInt(payment.order.id) : null,
      },
    });

    // Actualizar reserva
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: reservationStatus },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
