import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");

  try {
    let query = supabaseAdmin
      .from("BlockedSlot")
      .select("*, Court(name)")
      .order("date", { ascending: true })
      .order("startTime", { ascending: true });

    if (courtId) query = query.eq("courtId", courtId);
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query = query.gte("startTime", start.toISOString()).lt("startTime", end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ blockedSlots: data ?? [] });
  } catch (error) {
    console.error("Error fetching blocked slots:", error);
    return NextResponse.json(
      { error: "Error al obtener bloqueos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courtId, date, startTime, endTime, reason } = body;

    if (!courtId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (courtId, date, startTime, endTime)" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("BlockedSlot")
      .insert({
        courtId,
        date,
        startTime,
        endTime,
        reason: reason || "Mantenimiento",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ blockedSlot: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating blocked slot:", error);
    return NextResponse.json(
      { error: "Error al crear bloqueo" },
      { status: 500 }
    );
  }
}
