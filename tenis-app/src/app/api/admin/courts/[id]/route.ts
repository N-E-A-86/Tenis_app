import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const court = await prisma.court.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        surfaceType: body.surfaceType,
        pricePerHour: body.pricePerHour ? parseFloat(body.pricePerHour) : undefined,
        imageUrl: body.imageUrl,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(court);
  } catch (error) {
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
    // Soft delete - desactivar en lugar de borrar
    await prisma.court.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar cancha" },
      { status: 500 }
    );
  }
}
