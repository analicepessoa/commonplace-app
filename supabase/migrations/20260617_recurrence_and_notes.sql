-- =====================================================================
-- Rework: recorrência (hábitos/rotinas) + bloco de nota no canvas
-- Execute no SQL Editor do Supabase.
-- =====================================================================

-- ---------- Recorrência por dia da semana ----------
-- days_of_week: array de 0..6 (0=domingo ... 6=sábado).
-- NULL ou vazio = todos os dias.
ALTER TABLE habits   ADD COLUMN IF NOT EXISTS days_of_week smallint[];
ALTER TABLE routines ADD COLUMN IF NOT EXISTS days_of_week smallint[];

-- ---------- Status do log de hábito (permite "pular" um dia) ----------
ALTER TABLE habit_logs
  ADD COLUMN IF NOT EXISTS status varchar(10) NOT NULL DEFAULT 'done';
ALTER TABLE habit_logs DROP CONSTRAINT IF EXISTS habit_logs_status_check;
ALTER TABLE habit_logs
  ADD CONSTRAINT habit_logs_status_check CHECK (status IN ('done', 'skipped'));

-- ---------- Bloco de nota no canvas + tamanho livre ----------
ALTER TABLE floating_elements DROP CONSTRAINT IF EXISTS floating_elements_type_check;
ALTER TABLE floating_elements
  ADD CONSTRAINT floating_elements_type_check
  CHECK (type IN ('sticker', 'post-it', 'sketch', 'note'));
ALTER TABLE floating_elements ADD COLUMN IF NOT EXISTS width  float;
ALTER TABLE floating_elements ADD COLUMN IF NOT EXISTS height float;
