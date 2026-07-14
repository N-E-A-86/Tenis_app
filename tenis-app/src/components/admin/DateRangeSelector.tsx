"use client";

import { cn } from "@/lib/utils";

interface Range {
  label: string;
  value: string;
}

const RANGES: Range[] = [
  { label: "7 días", value: "7d" },
  { label: "30 días", value: "30d" },
  { label: "90 días", value: "90d" },
  { label: "Este mes", value: "month" },
];

function getDateRange(value: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  switch (value) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "month":
      from.setDate(1);
      break;
  }

  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string, range: { from: Date; to: Date }) => void;
}

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value, getDateRange(r.value))}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            value === r.value
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-white/5 text-gray-400 border border-white/10 hover:text-white hover:bg-white/10"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export { getDateRange };
