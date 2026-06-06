export interface Subject {
  id: number;
  name: string;
  created_at: string;
}

export interface Test {
  id: number;
  subject_id: number;
  author_name: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

export interface Result {
  id: number;
  test_id: number;
  selected_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface TestWithResult extends Test {
  latest_result?: Result;
}

export interface TestStats {
  test_id: number;
  total_attempts: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_pct: number;
}

export type FilterMode = 'all' | 'incorrect' | 'unanswered';

export interface Stats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
