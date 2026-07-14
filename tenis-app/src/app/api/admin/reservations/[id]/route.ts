import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const { data: reservation } = await supabaseAdmin
      .from("Reservation")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Admin can override any status
    if (body.status) {
      const { data: updated } = await supabaseAdmin
        .from("Reservation")
        .update({ status: body.status })
        .eq("id", id)
        .select("id, status")
        .single();

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Sin cambios" }, { status: 400 });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}