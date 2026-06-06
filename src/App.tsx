import { useState, useMemo, useCallback } from 'react';
import { BookOpen, Settings } from 'lucide-react';
import { useSubjects } from './hooks/useSubjects';
import { useTests } from './hooks/useTests';
import { useToast } from './hooks/useToast';
import { SubjectSelector } from './components/SubjectSelector';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { QuestionCard } from './components/QuestionCard';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer } from './components/Toast';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { FilterMode, Test } from './types';

type Tab = 'practice' | 'admin';

export default function App() {
  const [tab, setTab] = useState<Tab>('practice');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const { subjects, loading: subjectsLoading, add: addSubject, remove: deleteSubject } = useSubjects();
  const {
    tests,
    loading: testsLoading,
    getFiltered,
    stats,
    answer,
    addTest,
    updateTest,
    deleteTest,
    resetProgress,
  } = useTests(selectedSubjectId);

  const { toasts, addToast, removeToast } = useToast();

  const filtered = useMemo(() => getFiltered(filter), [getFiltered, filter]);
  const currentQuestion = filtered[currentIndex] ?? null;
  const currentStats = useMemo(() => stats(), [stats]);

  const handleSubjectSelect = useCallback((id: number) => {
    setSelectedSubjectId(id);
    setFilter('all');
    setCurrentIndex(0);
  }, []);

  const handleFilterChange = useCallback((mode: FilterMode) => {
    setFilter(mode);
    setCurrentIndex(0);
  }, []);

  const handleAnswer = useCallback(async (testId: number, choice: string) => {
    await answer(testId, choice);
  }, [answer]);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, filtered.length - 1));
  }, [filtered.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const handleResetProgress = useCallback(async () => {
    await resetProgress();
  }, [resetProgress]);

  const handleAddTest = useCallback(async (test: Omit<Test, 'id' | 'created_at'>) => {
    return addTest(test);
  }, [addTest]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">English Test</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Test Platformasi</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setTab('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                tab === 'practice' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Test
            </button>
            <button
              onClick={() => setTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                tab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Boshqaruv
            </button>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {tab === 'practice' ? (
          <>
            {/* Subject selector */}
            <SubjectSelector
              subjects={subjects}
              loading={subjectsLoading}
              selectedId={selectedSubjectId}
              onSelect={handleSubjectSelect}
            />

            {selectedSubjectId && (
              <>
                {testsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <StatsBar stats={currentStats} />
                    <FilterBar filter={filter} stats={currentStats} onChange={handleFilterChange} />

                    {currentQuestion ? (
                      <QuestionCard
                        question={currentQuestion}
                        index={currentIndex}
                        total={filtered.length}
                        onAnswer={handleAnswer}
                        onNext={handleNext}
                        onPrev={handlePrev}
                      />
                    ) : (
                      <EmptyState filter={filter} onClear={() => handleFilterChange('all')} />
                    )}
                  </>
                )}
              </>
            )}

            {!selectedSubjectId && !subjectsLoading && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-10 flex flex-col items-center gap-4 text-center backdrop-blur-sm">
                <div className="w-14 h-14 rounded-2xl bg-blue-900/40 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-slate-300 font-medium">Test ishlash uchun fan tanlang</p>
              </div>
            )}
          </>
        ) : (
          <AdminPanel
            subjects={subjects}
            onAddSubject={addSubject}
            onDeleteSubject={deleteSubject}
            tests={tests}
            onAddTest={handleAddTest}
            onUpdateTest={updateTest}
            onDeleteTest={deleteTest}
            onResetProgress={handleResetProgress}
            onToast={addToast}
          />
        )}
      </main>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function EmptyState({ filter, onClear }: { filter: string; onClear: () => void }) {
  const messages: Record<string, string> = {
    incorrect: "Hali xato ishlangan savollar yo'q. Davom eting!",
    unanswered: "Barcha savollarga javob berildi!",
    all: "Savollar topilmadi.",
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-10 flex flex-col items-center gap-4 text-center backdrop-blur-sm">
      <p className="text-slate-300 font-medium">{messages[filter] ?? "Savollar topilmadi."}</p>
      {filter !== 'all' && (
        <button onClick={onClear} className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
          Barcha savollarni ko'rish
        </button>
      )}
    </div>
  );
}
