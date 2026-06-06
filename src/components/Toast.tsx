import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Toast as ToastType, ToastType as TType } from '../types';

interface Props {
  toasts: ToastType[];
  onRemove: (id: number) => void;
}

const iconMap: Record<TType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styleMap: Record<TType, string> = {
  success: 'bg-emerald-900/90 border-emerald-600 text-emerald-100',
  error: 'bg-red-900/90 border-red-600 text-red-100',
  info: 'bg-blue-900/90 border-blue-600 text-blue-100',
};

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = iconMap[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-xl animate-slide-in ${styleMap[t.type]}`}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm flex-1 leading-snug">{t.message}</p>
            <button onClick={() => onRemove(t.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
