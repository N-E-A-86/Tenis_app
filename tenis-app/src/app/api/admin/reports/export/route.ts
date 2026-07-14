import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

type ReportType = "reservations" | "revenue" | "courts" | "daily";

type SupaRow = Record<string, unknown> & {
  startTime: string;
  totalAmount: number | null;
  status: string;
  court: { name: string } | { name: string }[] | null;
  user: { name: string | null; email: string | null } | { name: string | null; email: string | null }[] | null;
  payment: { amount: number; status: string } | { amount: number; status: string }[] | null;
};

function buildCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "reservations") as ReportType;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format"); // "csv" or undefined

  try {
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];

    if (type === "reservations") {
      let query = supabaseAdmin
        .from("Reservation")
        .select(`
          id,
          startTime,
          endTime,
          status,
          totalAmount,
          user:userId(name, email),
          court:courtId(name),
          payment:Payment!reservationId(amount, status)
        `)
        .order("startTime", { ascending: false })
        .limit(500);

      if (from) query = query.gte("startTime", new Date(from).toISOString());
      if (to) query = query.lte("startTime", new Date(to).toISOString());

      const { data: rawRows } = await query;
      data = (rawRows ?? []).map((r) => {
        const row = r as SupaRow;
        const c = Array.isArray(row.court) ? row.court[0] : row.court;
        const u = Array.isArray(row.user) ? row.user[0] : row.user;
        return {
          id: row.id,
          date: new Date(row.startTime).toLocaleDateString("es-AR"),
          hour: new Date(row.startTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }),
          court: c?.name ?? "",
          user: (u?.name || u?.email) ?? "",
          status: row.status,
          amount: Number(row.totalAmount ?? 0),
          payment: Array.isArray(row.payment) ? (row.payment[0] as Record<string, unknown>)?.status : (row.payment as Record<string, unknown>)?.status ?? "",
        };
      });
      headers = ["Fecha", "Hora", "Cancha", "Usuario", "Estado", "Monto", "Pago"];
    } else if (type === "revenue") {
      let query = supabaseAdmin
        .from("Payment")
        .select("amount, status, createdAt, reservation:reservationId(startTime, court:courtId(name))")
        .eq("status", "APPROVED")
        .order("createdAt", { ascending: false })
        .limit(500);

      if (from) query = query.gte("createdAt", new Date(from).toISOString());
      if (to) query = query.lte("createdAt", new Date(to).toISOString());

      const { data: revRows } = await query;
      data = (revRows ?? []).map((r) => {
        const rev = r as Record<string, unknown>;
        const res = rev.reservation as Record<string, unknown> | undefined;
        const court = res?.court as Record<string, unknown> | undefined;
        return {
          date: new Date(rev.createdAt as string).toLocaleDateString("es-AR"),
          court: (court?.name as string) ?? "",
          amount: Number(rev.amount ?? 0),
        };
      });
      headers = ["Fecha", "Cancha", "Monto"];
    } else if (type === "courts") {
      const { data: reservations } = await supabaseAdmin
        .from("Reservation")
        .select("totalAmount, court:courtId(name)");

      const byCourt: Record<string, { count: number; revenue: number }> = {};
      for (const raw of reservations ?? []) {
        const r = raw as SupaRow;
        const c = Array.isArray(r.court) ? r.court[0] : r.court;
        const name = c?.name ?? "Sin cancha";
        if (!byCourt[name]) byCourt[name] = { count: 0, revenue: 0 };
        byCourt[name].count += 1;
        byCourt[name].revenue += Number(r.totalAmount ?? 0);
      }

      data = Object.entries(byCourt)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, s]) => ({ name, count: s.count, revenue: s.revenue }));
      headers = ["Cancha", "Reservas", "Ingresos"];
    } else if (type === "daily") {
      let query = supabaseAdmin
        .from("Reservation")
        .select("startTime, totalAmount, status")
        .order("startTime", { ascending: false })
        .limit(1000);

      if (from) query = query.gte("startTime", new Date(from).toISOString());
      if (to) query = query.lte("startTime", new Date(to).toISOString());

      const { data: rows } = await query;

      const byDay: Record<string, { count: number; revenue: number; confirmed: number; cancelled: number }> = {};
      for (const raw of rows ?? []) {
        const r = raw as { startTime: string; totalAmount: number | null; status: string };
        const day = new Date(r.startTime).toLocaleDateString("es-AR");
        if (!byDay[day]) byDay[day] = { count: 0, revenue: 0, confirmed: 0, cancelled: 0 };
        byDay[day].count += 1;
        byDay[day].revenue += Number(r.totalAmount ?? 0);
        if (r.status === "CONFIRMED" || r.status === "COMPLETED") byDay[day].confirmed += 1;
        if (r.status === "CANCELLED") byDay[day].cancelled += 1;
      }

      data = Object.entries(byDay)
        .sort(([a], [b]) => new Date(a.split("/").reverse().join("-")).getTime() - new Date(b.split("/").reverse().join("-")).getTime())
        .map(([day, s]) => ({ day, count: s.count, revenue: s.revenue, confirmed: s.confirmed, cancelled: s.cancelled }));
      headers = ["Día", "Reservas", "Ingresos", "Confirmadas", "Canceladas"];
    }

    if (format === "csv") {
      const csvRows = data.map((row) =>
        headers.map((h) => String(row[h] ?? "")).map((v) => v.replace(/,/g, ", "))
      );
      const csv = buildCSV(headers, csvRows);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=reporte-${type}-${new Date().toISOString().slice(0, 10)}.csv`,
        },
      });
    }

    return NextResponse.json({ data, headers, total: data.length });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 });
  }
}
