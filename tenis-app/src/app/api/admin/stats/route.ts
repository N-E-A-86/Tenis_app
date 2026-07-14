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

    const [
      { count: totalUsers },
      { count: totalCourts },
      { count: totalReservations },
      { count: confirmedReservations },
      { count: pendingReservations },
      { count: todayReservations },
      { data: payments },
    ] = await Promise.all([
      supabaseAdmin.from("User").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Court").select("*", { count: "exact", head: true }).eq("isActive", true),
      supabaseAdmin.from("Reservation").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Reservation").select("*", { count: "exact", head: true }).eq("status", "CONFIRMED"),
      supabaseAdmin.from("Reservation").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
      supabaseAdmin.from("Reservation").select("*", { count: "exact", head: true }).gte("startTime", todayStart.toISOString()).lt("startTime", todayEnd.toISOString()),
      supabaseAdmin.from("Payment").select("amount").in("status", ["APPROVED", "completed"]),
    ]);

    const revenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

    return NextResponse.json({
      totalUsers: totalUsers ?? 0,
      totalCourts: totalCourts ?? 0,
      totalReservations: totalReservations ?? 0,
      confirmedReservations: confirmedReservations ?? 0,
      pendingReservations: pendingReservations ?? 0,
      todayReservations: todayReservations ?? 0,
      revenue,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
