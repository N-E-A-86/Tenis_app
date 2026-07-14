import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

type CourtReservation = {
  totalAmount: number | null;
  court: { name: string } | { name: string }[] | null;
};

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select(`
        totalAmount,
        court:courtId(name)
      `);

    const byCourt: Record<string, { count: number; revenue: number }> = {};

    for (const raw of reservations ?? []) {
      const r = raw as CourtReservation;
      const courtObj = Array.isArray(r.court) ? r.court[0] : r.court;
      const courtName = courtObj?.name ?? "Sin cancha";
      if (!byCourt[courtName]) byCourt[courtName] = { count: 0, revenue: 0 };
      byCourt[courtName].count += 1;
      byCourt[courtName].revenue += Number(r.totalAmount ?? 0);
    }

    const data = Object.entries(byCourt)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, stats]) => ({ name, ...stats }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching court stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas de canchas" },
      { status: 500 }
    );
  }
}
