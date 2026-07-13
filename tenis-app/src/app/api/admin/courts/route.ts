import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { data: courts } = await supabaseAdmin
      .from("Court")
      .select("*")
      .order("name", { ascending: true });

    // Obtener counts de reservas
    const courtsWithCounts = await Promise.all(
      (courts ?? []).map(async (court) => {
        const { count } = await supabaseAdmin
          .from("Reservation")
          .select("*", { count: "exact", head: true })
          .eq("courtId", court.id);
        return { ...court, reservation_count: count ?? 0 };
      })
    );

    return NextResponse.json(courtsWithCounts);
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Error al obtener canchas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, surfaceType, pricePerHour, imageUrl } = body;

    if (!name || !pricePerHour) {
      return NextResponse.json(
        { error: "Nombre y precio son requeridos" },
        { status: 400 }
      );
    }

    const { data: court, error } = await supabaseAdmin
      .from("Court")
      .insert({
        name,
        description: description ?? null,
        surfaceType: surfaceType || "CLAY",
        pricePerHour: parseFloat(pricePerHour),
        imageUrl: imageUrl ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al crear cancha" },
        { status: 500 }
      );
    }

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error("Error creating court:", error);
    return NextResponse.json(
      { error: "Error al crear cancha" },
      { status: 500 }
    );
  }
}
