import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  try {
    let query = supabaseAdmin
      .from("Reservation")
      .select("*, user:userId(*), court:courtId(*), payment:Payment!reservationId(amount, status, method, createdAt)");

    if (status) {
      query = query.eq("status", status);
    }

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query
        .gte("startTime", selectedDate.toISOString())
        .lt("endTime", nextDay.toISOString());
    }

    const { data: reservations } = await query
      .order("startTime", { ascending: false });

    return NextResponse.json(reservations ?? []);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}
