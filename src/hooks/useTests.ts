import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Test, TestWithResult, Result, FilterMode, Stats } from '../types';

export function useTests(subjectId: number | null) {
  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = useCallback(async () => {
  if (!subjectId) { setTests([]); setLoading(false); return; }
  if (!supabase) { setLoading(false); return; }  // ← shu qator qo'shing
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('subject_id', subjectId)
      .order('id');
    if (!error && data) setTests(data);
  } catch (e) {
    console.error('fetchTests error:', e);
  } finally {
    setLoading(false);
  }
}, [subjectId]);

  const fetchResults = useCallback(async () => {
    if (!subjectId) { setResults([]); return; }
    const { data: tData } = await supabase
      .from('tests')
      .select('id')
      .eq('subject_id', subjectId);
    if (!tData || tData.length === 0) { setResults([]); return; }

    const testIds = tData.map(t => t.id);
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .in('test_id', testIds)
      .order('created_at', { ascending: false });
    if (!error && data) setResults(data);
  }, [subjectId]);

  useEffect(() => { fetchTests(); fetchResults(); }, [fetchTests, fetchResults]);

  const latestResults = useCallback((): Map<number, Result> => {
    const map = new Map<number, Result>();
    for (const r of results) {
      if (!map.has(r.test_id)) map.set(r.test_id, r);
    }
    return map;
  }, [results]);

  const getFiltered = useCallback((mode: FilterMode): TestWithResult[] => {
    const lr = latestResults();
    return tests.map(t => {
      const latest = lr.get(t.id);
      return { ...t, latest_result: latest };
    }).filter(t => {
      if (mode === 'all') return true;
      if (mode === 'unanswered') return !t.latest_result;
      if (mode === 'incorrect') return !!t.latest_result && !t.latest_result.is_correct;
      return true;
    });
  }, [tests, latestResults]);

  const stats = useCallback((): Stats => {
    const lr = latestResults();
    const answeredIds = new Set(lr.keys());
    const correct = [...lr.values()].filter(r => r.is_correct).length;
    const incorrect = answeredIds.size - correct;
    return {
      total: tests.length,
      answered: answeredIds.size,
      correct,
      incorrect,
      unanswered: tests.length - answeredIds.size,
    };
  }, [tests, latestResults]);

  const answer = useCallback(async (testId: number, selected: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;
    const isCorrect = selected.toUpperCase() === test.correct_answer.toUpperCase();
    await supabase.from('results').insert({
      test_id: testId,
      selected_answer: selected,
      is_correct: isCorrect,
    });
    await fetchResults();
  }, [tests, fetchResults]);

  const addTest = useCallback(async (test: Omit<Test, 'id' | 'created_at'>): Promise<string | null> => {
    const { error } = await supabase.from('tests').insert(test);
    if (error) return error.message;
    await fetchTests();
    return null;
  }, [fetchTests]);

  const updateTest = useCallback(async (id: number, updates: Partial<Test>): Promise<string | null> => {
    const { error } = await supabase.from('tests').update(updates).eq('id', id);
    if (error) return error.message;
    await fetchTests();
    return null;
  }, [fetchTests]);

  const deleteTest = useCallback(async (id: number): Promise<string | null> => {
    const { error } = await supabase.from('tests').delete().eq('id', id);
    if (error) return error.message;
    await fetchTests();
    await fetchResults();
    return null;
  }, [fetchTests, fetchResults]);

  const resetProgress = useCallback(async () => {
    if (!subjectId) return;
    const { data: tData } = await supabase
      .from('tests')
      .select('id')
      .eq('subject_id', subjectId);
    if (!tData || tData.length === 0) return;
    const testIds = tData.map(t => t.id);
    await supabase.from('results').delete().in('test_id', testIds);
    await fetchResults();
  }, [subjectId, fetchResults]);

  return {
    tests,
    results,
    loading,
    getFiltered,
    stats,
    answer,
    addTest,
    updateTest,
    deleteTest,
    resetProgress,
    refetch: fetchTests,
    refetchResults: fetchResults,
  };
}
