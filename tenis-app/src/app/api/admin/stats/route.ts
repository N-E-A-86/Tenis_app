import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const [stats] = await db.query(
      `SELECT
        (SELECT count(*) FROM "User")::int as "totalUsers",
        (SELECT count(*) FROM "Court" WHERE "isActive" = true)::int as "totalCourts",
        (SELECT count(*) FROM "Reservation")::int as "totalReservations",
        (SELECT count(*) FROM "Reservation" WHERE "status" = 'CONFIRMED')::int as "confirmedReservations",
        (SELECT count(*) FROM "Reservation" WHERE "status" = 'PENDING')::int as "pendingReservations",
        (SELECT count(*) FROM "Reservation" WHERE "startTime" >= $1 AND "startTime" < $2)::int as "todayReservations",
        (SELECT COALESCE(sum(amount), 0) FROM "Payment" WHERE "status" = 'APPROVED')::numeric as "revenue"`,
      [todayStart.toISOString(), todayEnd.toISOString()]
    );

    return NextResponse.json({
      totalUsers: stats?.totalUsers ?? 0,
      totalCourts: stats?.totalCourts ?? 0,
      totalReservations: stats?.totalReservations ?? 0,
      confirmedReservations: stats?.confirmedReservations ?? 0,
      pendingReservations: stats?.pendingReservations ?? 0,
      todayReservations: stats?.todayReservations ?? 0,
      revenue: Number(stats?.revenue ?? 0),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
