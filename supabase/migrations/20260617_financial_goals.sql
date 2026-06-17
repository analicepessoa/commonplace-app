-- =====================================================================
-- Metas financeiras (cards com foto + progresso). transactions já existe.
-- Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS financial_goals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  saved_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_full_access" ON financial_goals;
CREATE POLICY "anon_full_access" ON financial_goals FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);
