import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    // Get all approved payments with their reservation details
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select(`
        startTime,
        totalAmount,
        payment:Payment!reservationId(amount, status)
      `)
      .not("payment", "is", null);

    // Filter approved and date range
    const approved = (reservations ?? []).filter((r) => {
      const payment = Array.isArray(r.payment) ? r.payment[0] : r.payment;
      if (!payment) return false;
      const payStatus = payment.status?.toLowerCase();
      if (payStatus !== "completed" && payStatus !== "approved") return false;
      if (from && new Date(r.startTime) < new Date(from)) return false;
      if (to && new Date(r.startTime) > new Date(to)) return false;
      return true;
    });

    // Group by month
    const byMonth: Record<string, { revenue: number; reservations: number }> = {};

    for (const r of approved) {
      const payment = Array.isArray(r.payment) ? r.payment[0] : r.payment;
      const month = new Date(r.startTime).toISOString().slice(0, 7); // "2026-07"
      if (!byMonth[month]) byMonth[month] = { revenue: 0, reservations: 0 };
      byMonth[month].revenue += Number(payment?.amount ?? r.totalAmount);
      byMonth[month].reservations += 1;
    }

    // Convert to sorted array
    const data = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        revenue: stats.revenue,
        reservations: stats.reservations,
      }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    return NextResponse.json(
      { error: "Error al obtener ingresos" },
      { status: 500 }
    );
  }
}
