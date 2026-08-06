-- =====================================================================
-- Academia — treinos, cargas, calendário, receitas e conquistas.
-- Execute no SQL Editor do projeto Supabase do Commonplace.
-- =====================================================================

CREATE TABLE IF NOT EXISTS fitness_exercise_preferences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_key    TEXT NOT NULL UNIQUE,
    workout_key TEXT NOT NULL,
    name        TEXT NOT NULL,
    sets        INTEGER NOT NULL DEFAULT 3 CHECK (sets BETWEEN 1 AND 20),
    reps        TEXT NOT NULL,
    video_query TEXT,
    category    TEXT NOT NULL DEFAULT 'core_full',
    is_custom   BOOLEAN NOT NULL DEFAULT false,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fitness_workout_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_date        DATE NOT NULL UNIQUE,
    workout_key         TEXT NOT NULL,
    completed_exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration_seconds    INTEGER NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fitness_weight_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_key  TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    weight        NUMERIC(7,2) NOT NULL CHECK (weight >= 0),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fitness_recipes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT NOT NULL,
    url        TEXT,
    notes      TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS fitness_achievements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content     TEXT NOT NULL,
    achieved_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fitness_sessions_date
    ON fitness_workout_sessions(workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_fitness_weights_exercise_date
    ON fitness_weight_logs(exercise_key, created_at DESC);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fitness_exercise_preferences',
    'fitness_workout_sessions',
    'fitness_weight_logs',
    'fitness_recipes',
    'fitness_achievements'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "authed_full_access" ON %I;', t);
    EXECUTE format(
      'CREATE POLICY "authed_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true);',
      t
    );
  END LOOP;
END $$;
