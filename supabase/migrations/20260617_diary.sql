-- =====================================================================
-- Diário: blocos de texto (diary_notes) e checklists (diary_tasks)
-- servindo as visões Mensal / Semanal / Diário via scope + period_key.
--   period_key: monthly='YYYY-MM', weekly='YYYY-MM-Sn', daily='YYYY-MM-DD'
-- Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS diary_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope      VARCHAR(10) NOT NULL CHECK (scope IN ('monthly','weekly','daily')),
  period_key TEXT NOT NULL,
  field      TEXT NOT NULL,
  content    TEXT,
  UNIQUE (scope, period_key, field)
);

CREATE TABLE IF NOT EXISTS diary_tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope      VARCHAR(10) NOT NULL CHECK (scope IN ('monthly','weekly','daily')),
  period_key TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  done       BOOLEAN NOT NULL DEFAULT false,
  position   INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_diary_tasks_period ON diary_tasks(scope, period_key);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['diary_notes','diary_tasks'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format('CREATE POLICY "anon_full_access" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;
