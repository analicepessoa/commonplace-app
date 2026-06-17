-- =====================================================================
-- Orçamentos (limite x gasto por categoria/nome). Execute no SQL Editor.
-- =====================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  limit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_full_access" ON budgets;
CREATE POLICY "anon_full_access" ON budgets FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);
