import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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
    const [court] = await db.query(
      `UPDATE "Court"
       SET "name" = $1, "description" = $2, "surfaceType" = $3,
           "pricePerHour" = $4, "imageUrl" = $5, "isActive" = $6,
           "updatedAt" = NOW()
       WHERE "id" = $7
       RETURNING *`,
      [
        body.name,
        body.description,
        body.surfaceType,
        body.pricePerHour ? parseFloat(body.pricePerHour) : null,
        body.imageUrl,
        body.isActive,
        id,
      ]
    );

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
    await db.query(
      `UPDATE "Court" SET "isActive" = false, "updatedAt" = NOW() WHERE "id" = $1`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar cancha" },
      { status: 500 }
    );
  }
}
