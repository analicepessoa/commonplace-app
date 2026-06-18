-- =====================================================================
-- Canvas: imagens soltas + estilo de texto; Refeições: detalhe (o que comeu).
-- Execute no SQL Editor do Supabase.
-- =====================================================================

-- Permitir elementos do tipo 'image' no canvas + estilo de texto
ALTER TABLE floating_elements DROP CONSTRAINT IF EXISTS floating_elements_type_check;
ALTER TABLE floating_elements ADD CONSTRAINT floating_elements_type_check
  CHECK (type IN ('sticker','post-it','sketch','note','image'));

ALTER TABLE floating_elements ADD COLUMN IF NOT EXISTS color       TEXT;
ALTER TABLE floating_elements ADD COLUMN IF NOT EXISTS font_size   INT;
ALTER TABLE floating_elements ADD COLUMN IF NOT EXISTS font_family TEXT;

-- Refeição ganha o detalhe do que foi comido
ALTER TABLE meals ADD COLUMN IF NOT EXISTS detail TEXT;
