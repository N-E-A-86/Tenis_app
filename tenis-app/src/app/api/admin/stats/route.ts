import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalCourts,
      totalReservations,
      confirmedReservations,
      pendingReservations,
      todayReservations,
      revenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.court.count({ where: { isActive: true } }),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "CONFIRMED" } }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.reservation.count({
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalCourts,
      totalReservations,
      confirmedReservations,
      pendingReservations,
      todayReservations,
      revenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
