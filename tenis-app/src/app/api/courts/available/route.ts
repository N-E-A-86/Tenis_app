import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courtId = searchParams.get("courtId");
  const date = searchParams.get("date");

  if (!courtId || !date) {
    return NextResponse.json(
      { error: "Faltan courtId o date" },
      { status: 400 }
    );
  }

  try {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const [resResult, blockedResult] = await Promise.all([
      supabaseAdmin
        .from("Reservation")
        .select("startTime, endTime")
        .eq("courtId", courtId)
        .in("status", ["PENDING", "CONFIRMED"])
        .gte("startTime", selectedDate.toISOString())
        .lt("endTime", nextDay.toISOString()),
      supabaseAdmin
        .from("BlockedSlot")
        .select("startTime, endTime")
        .eq("courtId", courtId)
        .gte("startTime", selectedDate.toISOString())
        .lt("startTime", nextDay.toISOString()),
    ]);

    const reservations = resResult.data ?? [];
    const blockedSlots = blockedResult.data ?? [];

    const bookedHours = new Set<number>();

    for (const r of reservations) {
      bookedHours.add(new Date(r.startTime).getHours());
    }
    for (const b of blockedSlots) {
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      for (let h = start.getHours(); h < end.getHours(); h++) {
        bookedHours.add(h);
      }
    }

    const slots = [];
    for (let hour = 8; hour <= 23; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: !bookedHours.has(hour),
      });
    }

    return NextResponse.json({ slots, date: selectedDate.toISOString() });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Error al verificar disponibilidad" },
      { status: 500 }
    );
  }
}
