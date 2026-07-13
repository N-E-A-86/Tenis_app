import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select("*, court:courtId(*), payment:reservationId(*)")
      .eq("userId", session.user.id)
      .order("startTime", { ascending: false });

    return NextResponse.json(reservations ?? []);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener las reservas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { courtId, date, hour } = body;

    if (!courtId || !date || hour === undefined) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Usar RPC atómico que verifica disponibilidad y crea la reserva
    const { data, error } = await supabaseAdmin.rpc("reservar_cancha", {
      p_user_id: session.user.id,
      p_court_id: courtId,
      p_date: date,
      p_hour: hour,
    });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json(
        { error: "Error al crear la reserva" },
        { status: 500 }
      );
    }

    if (!data?.success) {
      return NextResponse.json(
        { error: data?.error ?? "No se pudo crear la reserva" },
        { status: 409 }
      );
    }

    return NextResponse.json(data.reservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
