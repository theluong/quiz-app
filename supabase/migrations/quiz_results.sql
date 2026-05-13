-- Create table quiz_results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  category_name TEXT,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  wrong_count INTEGER NOT NULL,
  skipped_count INTEGER DEFAULT 0,
  score INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for testing (enable later for security)
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON quiz_results(created_at DESC);

-- If RLS is enabled, create policies
DROP POLICY IF EXISTS "Allow all inserts" ON quiz_results;
DROP POLICY IF EXISTS "Allow all selects" ON quiz_results;

CREATE POLICY "Allow all inserts" ON quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all selects" ON quiz_results FOR SELECT USING (true);
