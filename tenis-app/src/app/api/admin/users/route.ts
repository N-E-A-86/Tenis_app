import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("id, name, email, role, createdAt")
      .order("createdAt", { ascending: false });

    // Obtener counts de reservas para cada usuario
    const usersWithCounts = await Promise.all(
      (users ?? []).map(async (user) => {
        const { count } = await supabaseAdmin
          .from("Reservation")
          .select("*", { count: "exact", head: true })
          .eq("userId", user.id);
        return { ...user, reservation_count: count ?? 0 };
      })
    );

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}
