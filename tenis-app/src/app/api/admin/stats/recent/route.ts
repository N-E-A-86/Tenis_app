import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  try {
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select(`
        id,
        startTime,
        endTime,
        status,
        totalAmount,
        user:userId(name, email),
        court:courtId(name),
        payment:Payment!reservationId(amount, status)
      `)
      .order("startTime", { ascending: false })
      .limit(limit);

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
    console.error("Error fetching recent reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas recientes" },
      { status: 500 }
    );
  }
}
