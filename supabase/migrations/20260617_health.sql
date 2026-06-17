-- =====================================================================
-- Saúde: consultas, medicações e calendário menstrual
-- Execute no SQL Editor do Supabase.
-- =====================================================================

CREATE TABLE IF NOT EXISTS health_appointments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty  TEXT NOT NULL,
  appt_date  DATE,
  appt_time  TIME,
  notes      TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS health_medications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  dosage     TEXT,
  purpose    TEXT,
  schedule   TEXT,
  start_date DATE,
  end_date   DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS menstrual_cycles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date   DATE,
  flow       VARCHAR(10) CHECK (flow IN ('leve','medio','intenso')),
  notes      TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['health_appointments','health_medications','menstrual_cycles'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format('CREATE POLICY "anon_full_access" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;
