import { BookOpen, ChevronRight } from 'lucide-react';
import type { Subject } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  subjects: Subject[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function SubjectSelector({ subjects, loading, selectedId, onSelect }: Props) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-slate-200 mb-1">Fan tanlang</h2>
      <p className="text-xs text-slate-500 mb-4">Test ishlash uchun fanni tanlang</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {subjects.map((s) => {
          const active = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                active
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.name}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
