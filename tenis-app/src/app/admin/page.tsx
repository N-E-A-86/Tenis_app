"use client";

import { useState, useEffect, useCallback } from "react";
import StatsCards from "@/components/admin/StatsCards";
import RevenueChart from "@/components/admin/RevenueChart";
import CourtChart from "@/components/admin/CourtChart";
import TodayReservations from "@/components/admin/TodayReservations";
import RecentActivity from "@/components/admin/RecentActivity";
import Alerts from "@/components/admin/Alerts";
import DateRangeSelector, { getDateRange } from "@/components/admin/DateRangeSelector";

interface AdminStats {
  totalUsers: number;
  totalCourts: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  todayReservations: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleDateChange = useCallback(
    (value: string, range: { from: Date; to: Date }) => {
      setDateRange(value);
      setFrom(range.from.toISOString());
      setTo(range.to.toISOString());
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <DateRangeSelector value={dateRange} onChange={handleDateChange} />
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats} />

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        <RevenueChart from={from} to={to} />
        <CourtChart />
      </div>

      {/* Lists row */}
      <div className="grid md:grid-cols-2 gap-6">
        <TodayReservations />
        <RecentActivity />
      </div>

      {/* Alerts */}
      <Alerts />
    </div>
  );
}
