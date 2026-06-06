import type { FilterMode, Stats } from '../types';

interface Props {
  filter: FilterMode;
  stats: Stats;
  onChange: (mode: FilterMode) => void;
}

const MODES: { mode: FilterMode; label: string; count: (s: Stats) => number }[] = [
  { mode: 'all', label: 'Barcha savollar', count: (s) => s.total },
  { mode: 'unanswered', label: 'Javobsiz', count: (s) => s.unanswered },
  { mode: 'incorrect', label: 'Xato ishlangan', count: (s) => s.incorrect },
];

export function FilterBar({ filter, stats, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map(({ mode, label, count }) => {
        const active = filter === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              active
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
              active ? 'bg-blue-500/60 text-blue-100' : 'bg-slate-700 text-slate-400'
            }`}>
              {count(stats)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
