import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Subject } from '../types';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('id');
      if (!error && data) setSubjects(data);
    } catch (e) {
      console.error('useSubjects fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (name: string): Promise<string | null> => {
    if (!supabase) return 'Supabase ulanmagan';
    const { error } = await supabase.from('subjects').insert({ name });
    if (error) return error.message;
    await fetch();
    return null;
  }, [fetch]);

  const remove = useCallback(async (id: number): Promise<string | null> => {
    if (!supabase) return 'Supabase ulanmagan';
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) return error.message;
    await fetch();
    return null;
  }, [fetch]);

  return { subjects, loading, add, remove, refetch: fetch };
}
