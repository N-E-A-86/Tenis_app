import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select(`
        id,
        startTime,
        endTime,
        status,
        totalAmount,
        user:userId(name, email, phone),
        court:courtId(name),
        payment:Payment!reservationId(amount, status)
      `)
      .gte("startTime", todayStart.toISOString())
      .lt("startTime", todayEnd.toISOString())
      .order("startTime", { ascending: true });

    const data = (reservations ?? []).map((r) => ({
      id: r.id,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      totalAmount: r.totalAmount,
      user: Array.isArray(r.user) ? r.user[0] : r.user,
      court: Array.isArray(r.court) ? r.court[0] : r.court,
      payment: Array.isArray(r.payment) ? r.payment[0] : r.payment,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching today reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas de hoy" },
      { status: 500 }
    );
  }
}
