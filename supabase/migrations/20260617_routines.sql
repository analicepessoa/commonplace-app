-- =====================================================================
-- Prompt 5 — Rotinas, Hábitos, Água, Refeições
-- Execute no SQL Editor do Supabase.
-- =====================================================================

-- Hábitos e seus registros diários (presença de log = feito naquele dia)
CREATE TABLE IF NOT EXISTS habits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color_hex  VARCHAR(7) NOT NULL DEFAULT '#22c55e',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT current_date,
  UNIQUE (habit_id, log_date)
);

-- Hidratação por dia
CREATE TABLE IF NOT EXISTS water_intake (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_date DATE NOT NULL UNIQUE DEFAULT current_date,
  glasses     INT NOT NULL DEFAULT 0,
  goal        INT NOT NULL DEFAULT 8
);

-- Refeições do dia (checklist)
CREATE TABLE IF NOT EXISTS meals (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_date DATE NOT NULL DEFAULT current_date,
  name      TEXT NOT NULL,
  done      BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (meal_date, name)
);

-- Rotinas fixas (ex.: Trabalho) com deslocamento manual em minutos
CREATE TABLE IF NOT EXISTS routines (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  location       TEXT,
  start_time     TIME NOT NULL,
  travel_minutes INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date  ON habit_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_meals_date       ON meals(meal_date);
CREATE INDEX IF NOT EXISTS idx_routines_start   ON routines(start_time);

-- Policies de RLS abertas (single-user, igual ao restante do app)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['habits','habit_logs','water_intake','meals','routines'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format(
      'CREATE POLICY "anon_full_access" ON %I FOR ALL
         TO anon, authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;
