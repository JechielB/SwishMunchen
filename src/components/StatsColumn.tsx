import React from "react";

export function StatsColumn({
  made,
  fgPct,
  streak,
}: {
  made: number;
  fgPct: number;
  streak: number;
}) {
  return (
    <aside className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col gap-4 w-[200px]">
        <Card>
          <Label>SHOTS MADE</Label>
          <Value>{made}</Value>
        </Card>
        <Card>
          <Label>FG%</Label>
          <Value>{fgPct}%</Value>
        </Card>
        <Card>
          <Label>STREAK</Label>
          <div className="flex items-center gap-2">
            {streak >= 3 ? <span className="animate-pulse">🔥</span> : null}
            <Value className="!text-2xl">{streak}</Value>
          </div>
        </Card>
      </div>
    </aside>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border bg-white/5 backdrop-blur p-3"
      style={{ borderColor: "rgba(255,255,255,0.15)" }}
    >
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-white/80 text-xs mb-1">{children}</div>;
}
function Value({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-xl font-extrabold ${className}`}>{children}</div>
  );
}
