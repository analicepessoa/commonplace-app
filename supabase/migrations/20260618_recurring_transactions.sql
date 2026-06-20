-- =====================================================================
-- Lançamentos recorrentes (fixos): modelos + materialização por mês.
-- Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  type         VARCHAR(10) NOT NULL CHECK (type IN ('income','expense','savings')),
  day_of_month INT NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 31),
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- Vincula cada lançamento materializado ao seu modelo fixo
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- Garante um único lançamento por (modelo, data) — evita duplicar no mesmo mês
CREATE UNIQUE INDEX IF NOT EXISTS uq_tx_recurring_due
  ON transactions (recurring_id, due_date) WHERE recurring_id IS NOT NULL;

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_full_access" ON recurring_transactions;
CREATE POLICY "anon_full_access" ON recurring_transactions FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);
