"use client";

import type { Database } from "@/types/database";

type UptimeRecord = Database["public"]["Tables"]["uptime_records"]["Row"];

const statusToColor = (status: string): string => {
  switch (status) {
    case "operational": return "bg-emerald-400";
    case "degraded": return "bg-yellow-400";
    case "partial_outage": return "bg-orange-400";
    case "major_outage": return "bg-red-500";
    case "maintenance": return "bg-blue-400";
    default: return "bg-gray-200";
  }
};

export function UptimeBar({ records }: { records: UptimeRecord[] }) {
  // Build 90-day array (oldest first)
  const days = 90;
  const today = new Date();
  const dayMap = new Map(records.map((r) => [r.date, r]));

  const bars: { date: string; status: string; uptime: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const record = dayMap.get(dateStr);
    bars.push({
      date: dateStr,
      status: record?.status ?? "no_data",
      uptime: record?.uptime_percent ?? 100,
    });
  }

  const totalUptime =
    records.length === 0
      ? 100
      : records.reduce((sum, r) => sum + Number(r.uptime_percent), 0) / records.length;

  return (
    <div>
      <div className="flex gap-0.5 h-6">
        {bars.map((bar) => (
          <div
            key={bar.date}
            className={`flex-1 rounded-sm ${
              bar.status === "no_data" ? "bg-gray-100" : statusToColor(bar.status)
            }`}
            title={`${bar.date}: ${bar.uptime}% uptime`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">90 days ago</span>
        <span className="text-xs text-gray-500 font-medium">
          {totalUptime.toFixed(2)}% uptime
        </span>
        <span className="text-xs text-gray-400">Today</span>
      </div>
    </div>
  );
}
