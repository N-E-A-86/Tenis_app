import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Fetch user
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id, email, name, phone, image, role, createdAt")
      .eq("id", id)
      .single();

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Fetch user's reservations with court and payment info
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select(`
        id,
        startTime,
        endTime,
        status,
        totalAmount,
        court:courtId(name),
        payment:Payment!reservationId(amount, status)
      `)
      .eq("userId", id)
      .order("startTime", { ascending: false })
      .limit(20);

    const mappedReservations = (reservations ?? []).map((r) => ({
      id: r.id,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      totalAmount: r.totalAmount,
      court: Array.isArray(r.court) ? r.court[0] : r.court,
      payment: Array.isArray(r.payment) ? r.payment[0] : r.payment,
    }));

    // Stats
    const totalReservations = mappedReservations.length;
    const totalSpent = mappedReservations.reduce(
      (sum, r) => sum + Number(r.totalAmount ?? 0),
      0
    );

    return NextResponse.json({
      user,
      reservations: mappedReservations,
      stats: {
        totalReservations,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Error fetching user detail:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del usuario" },
      { status: 500 }
    );
  }
}