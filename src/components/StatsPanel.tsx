import React from "react";

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border px-4 py-3 bg-white/5 border-white/10">
      <div className="text-[11px] tracking-wide text-white/80">{label}</div>
      <div className="text-2xl font-extrabold mt-0.5">{value}</div>
    </div>
  );
}

export function StatsPanel({
  made,
  fgPct,
  streak,
  grade,
}: {
  made: number;
  fgPct: number;
  streak: number;
  grade: number;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid gap-3 w-[220px]">
        <StatCard label="SHOTS MADE" value={made} />
        <StatCard label="GRADE" value={`${grade.toFixed(1)}%`} />
        <StatCard label="FG%" value={`${fgPct}%`} />
        <StatCard label="STREAK" value={streak} />
      </div>
    </div>
  );
}
