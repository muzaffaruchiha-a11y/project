import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { TestWithResult } from '../types';

interface Props {
  question: TestWithResult;
  index: number;
  total: number;
  onAnswer: (testId: number, choice: string) => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

const OPTIONS: Array<{ key: 'A' | 'B' | 'C' | 'D' }> = [
  { key: 'A' }, { key: 'B' }, { key: 'C' }, { key: 'D' },
];

export function QuestionCard({ question, index, total, onAnswer, onNext, onPrev }: Props) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setAnswered(false);
    setSelected(null);
  }, [question.id]);

  function getOptionText(key: 'A' | 'B' | 'C' | 'D') {
    if (key === 'A') return question.option_a;
    if (key === 'B') return question.option_b;
    if (key === 'C') return question.option_c;
    return question.option_d;
  }

  function getOptionStyle(key: 'A' | 'B' | 'C' | 'D') {
    if (!answered) {
      return 'bg-slate-800 border-slate-600 hover:border-blue-500 hover:bg-slate-700 cursor-pointer text-slate-200';
    }
    if (key === question.correct_answer) {
      return 'bg-emerald-900/60 border-emerald-500 text-emerald-100 cursor-default';
    }
    if (key === selected && key !== question.correct_answer) {
      return 'bg-red-900/60 border-red-500 text-red-100 cursor-default';
    }
    return 'bg-slate-800/40 border-slate-700 text-slate-500 cursor-default';
  }

  function getOptionIcon(key: 'A' | 'B' | 'C' | 'D') {
    if (!answered) return null;
    if (key === question.correct_answer) {
      return <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    }
    if (key === selected && key !== question.correct_answer) {
      return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    }
    return null;
  }

  async function handleSelect(key: string) {
    if (answered) return;
    setSelected(key);
    setAnswered(true);
    await onAnswer(question.id, key);
  }

  const isCorrect = answered && selected === question.correct_answer;

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
          Savol {index + 1} / {total}
        </span>
        {answered && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isCorrect ? 'bg-emerald-900/60 text-emerald-300' : 'bg-red-900/60 text-red-300'
          }`}>
            {isCorrect ? "To'g'ri" : "Noto'g'ri"}
          </span>
        )}
      </div>

      <p className="text-slate-100 text-lg font-medium leading-relaxed mb-6">
        {question.question}
      </p>

      <div className="space-y-3 mb-6">
        {OPTIONS.map(({ key }) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${getOptionStyle(key)}`}
            disabled={answered}
          >
            <span className="w-7 h-7 rounded-lg bg-slate-700/80 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
              {key}
            </span>
            <span className="flex-1 text-sm leading-snug">{getOptionText(key)}</span>
            {getOptionIcon(key)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          ← Oldingi
        </button>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="flex-1 py-2.5 rounded-xl border border-slate-600 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          Keyingi →
        </button>
      </div>
    </div>
  );
}
