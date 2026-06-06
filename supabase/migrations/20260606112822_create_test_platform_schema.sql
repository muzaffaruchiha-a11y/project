/*
# Create Test Platform Schema

1. New Tables
- `subjects` — stores subject categories (Pedagogika, Matematika, etc.)
  - `id` (serial, primary key)
  - `name` (text, unique, not null)
  - `created_at` (timestamptz, default now())
- `tests` — stores individual test questions
  - `id` (serial, primary key)
  - `subject_id` (integer, foreign key to subjects.id, not null)
  - `author_name` (text, not null)
  - `question` (text, not null)
  - `option_a` (text, not null)
  - `option_b` (text, not null)
  - `option_c` (text, not null)
  - `option_d` (text, not null)
  - `correct_answer` (text, not null, one of A/B/C/D)
  - `created_at` (timestamptz, default now())
- `results` — stores user answer results for each test question
  - `id` (serial, primary key)
  - `test_id` (integer, foreign key to tests.id, not null)
  - `selected_answer` (text, not null)
  - `is_correct` (boolean, not null)
  - `created_at` (timestamptz, default now())

2. Indexes
- `tests_subject_id_idx` on tests(subject_id) for fast subject filtering
- `results_test_id_idx` on results(test_id) for fast result lookups

3. Security
- RLS enabled on all tables.
- Single-tenant (no auth): `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`.
  Data is intentionally public/shared; any visitor can read/write.
*/

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_subjects" ON subjects;
CREATE POLICY "public_select_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_subjects" ON subjects;
CREATE POLICY "public_insert_subjects" ON subjects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_subjects" ON subjects;
CREATE POLICY "public_update_subjects" ON subjects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_subjects" ON subjects;
CREATE POLICY "public_delete_subjects" ON subjects FOR DELETE
  TO anon, authenticated USING (true);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id serial PRIMARY KEY,
  subject_id integer NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_tests" ON tests;
CREATE POLICY "public_select_tests" ON tests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_tests" ON tests;
CREATE POLICY "public_insert_tests" ON tests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_tests" ON tests;
CREATE POLICY "public_update_tests" ON tests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_tests" ON tests;
CREATE POLICY "public_delete_tests" ON tests FOR DELETE
  TO anon, authenticated USING (true);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id serial PRIMARY KEY,
  test_id integer NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  selected_answer text NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_results" ON results;
CREATE POLICY "public_select_results" ON results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_results" ON results;
CREATE POLICY "public_insert_results" ON results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_results" ON results;
CREATE POLICY "public_update_results" ON results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_results" ON results;
CREATE POLICY "public_delete_results" ON results FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS tests_subject_id_idx ON tests(subject_id);
CREATE INDEX IF NOT EXISTS results_test_id_idx ON results(test_id);
