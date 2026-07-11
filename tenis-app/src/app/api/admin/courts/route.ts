import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const courts = await prisma.court.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { reservations: true } } },
    });
    return NextResponse.json(courts);
  } catch (error) {
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

    const court = await prisma.court.create({
      data: {
        name,
        description,
        surfaceType: surfaceType || "CLAY",
        pricePerHour: parseFloat(pricePerHour),
        imageUrl,
      },
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear cancha" },
      { status: 500 }
    );
  }
}
