import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: courts } = await supabaseAdmin
      .from("Court")
      .select("*")
      .eq("isActive", true)
      .order("name", { ascending: true });

    return NextResponse.json(courts ?? []);
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Error al obtener las canchas" },
      { status: 500 }
    );
  }
}
