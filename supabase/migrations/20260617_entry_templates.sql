-- =====================================================================
-- Templates por subcategoria + campos estruturados das notas.
-- Execute no SQL Editor do Supabase.
-- =====================================================================

-- Qual template a subcategoria usa (book, movie, recipe, generic...).
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS template TEXT;
UPDATE subcategories SET template = 'book'  WHERE name ILIKE 'livros';
UPDATE subcategories SET template = 'movie' WHERE name ILIKE 'filmes%';

-- Valores dos campos do template, por nota (key-value flexível).
CREATE TABLE IF NOT EXISTS entry_fields (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES commonplace_entries(id) ON DELETE CASCADE,
  field    TEXT NOT NULL,
  value    TEXT,
  UNIQUE (entry_id, field)
);
CREATE INDEX IF NOT EXISTS idx_entry_fields_entry ON entry_fields(entry_id);

ALTER TABLE entry_fields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_full_access" ON entry_fields;
CREATE POLICY "anon_full_access" ON entry_fields FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
