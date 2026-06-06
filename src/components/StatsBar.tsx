import type { Stats } from '../types';

interface Props {
  stats: Stats;
}

export function StatsBar({ stats }: Props) {
  const { total, answered, correct, incorrect, unanswered } = stats;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  const correctPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex flex-wrap gap-3 mb-4">
        <StatChip label="Jami" value={total} color="text-slate-300" bg="bg-slate-700/60" />
        <StatChip label="Javob berilgan" value={answered} color="text-blue-300" bg="bg-blue-900/40" />
        <StatChip label="To'g'ri" value={correct} color="text-emerald-300" bg="bg-emerald-900/40" />
        <StatChip label="Noto'g'ri" value={incorrect} color="text-red-300" bg="bg-red-900/40" />
        <StatChip label="Qolgan" value={unanswered} color="text-amber-300" bg="bg-amber-900/40" />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progress</span>
          <span>{pct}% javob berilgan · {correctPct}% to'g'ri</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        {answered > 0 && (
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${correctPct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bg} flex-1 min-w-[80px]`}>
      <span className={`text-xl font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-xs text-slate-400 leading-tight">{label}</span>
    </div>
  );
}
