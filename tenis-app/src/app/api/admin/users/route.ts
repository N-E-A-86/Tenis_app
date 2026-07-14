import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Fetch all users
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("id, name, email, role, phone, createdAt")
      .order("createdAt", { ascending: false });

    // Fetch all reservations in one query to avoid N+1
    const { data: reservations } = await supabaseAdmin
      .from("Reservation")
      .select("userId, totalAmount");

    // Aggregate stats per user
    const statsByUser: Record<string, { count: number; totalSpent: number }> = {};

    for (const r of reservations ?? []) {
      if (!statsByUser[r.userId]) {
        statsByUser[r.userId] = { count: 0, totalSpent: 0 };
      }
      statsByUser[r.userId].count += 1;
      statsByUser[r.userId].totalSpent += Number(r.totalAmount ?? 0);
    }

    // Join stats into users
    const usersWithStats = (users ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      reservationCount: statsByUser[user.id]?.count ?? 0,
      totalSpent: statsByUser[user.id]?.totalSpent ?? 0,
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}