-- =====================================================================
-- Agenda de compromissos (events). Acesso só autenticado.
-- Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  notes      TEXT,
  done       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authed_full_access" ON events;
CREATE POLICY "authed_full_access" ON events FOR ALL
  TO authenticated USING (true) WITH CHECK (true);
