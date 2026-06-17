-- =====================================================================
-- Pets: cadastro + tracks (remédios, vacinas, banhos, peso). Fotos via
-- attachments (owner_type='pet'). Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS pets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  breed      TEXT,
  birth_date DATE,
  notes      TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS pet_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  kind       VARCHAR(12) NOT NULL CHECK (kind IN ('medicine','vaccine','bath','weight','note')),
  log_date   DATE NOT NULL DEFAULT current_date,
  detail     TEXT,
  value      NUMERIC(7,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_pet_logs_pet ON pet_logs(pet_id);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pets','pet_logs'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format('CREATE POLICY "anon_full_access" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;
