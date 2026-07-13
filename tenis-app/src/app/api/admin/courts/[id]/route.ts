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

    const { data: court, error } = await supabaseAdmin
      .from("Court")
      .update({
        name: body.name,
        description: body.description,
        surfaceType: body.surfaceType,
        pricePerHour: body.pricePerHour ? parseFloat(body.pricePerHour) : null,
        imageUrl: body.imageUrl,
        isActive: body.isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar cancha" },
        { status: 500 }
      );
    }

    return NextResponse.json(court);
  } catch (error) {
    console.error("Error updating court:", error);
    return NextResponse.json(
      { error: "Error al actualizar cancha" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { error } = await supabaseAdmin
      .from("Court")
      .update({ isActive: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar cancha" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting court:", error);
    return NextResponse.json(
      { error: "Error al eliminar cancha" },
      { status: 500 }
    );
  }
}
