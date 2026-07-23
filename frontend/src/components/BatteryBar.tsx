export function BatteryBar({ health }: { health: number | null }) {
  if (health == null) return <span className="text-slate-300 text-sm">—</span>;
  const pct = Math.round(health * 100);
  const color = pct >= 80 ? "bg-slate-500" : pct >= 50 ? "bg-slate-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums w-9 shrink-0">{pct}%</span>
    </div>
  );
}
