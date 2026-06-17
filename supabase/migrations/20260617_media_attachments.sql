-- =====================================================================
-- Mídia reutilizável: bucket de Storage + tabela de anexos polimórfica
-- Execute no SQL Editor do Supabase.
-- =====================================================================

-- Bucket público para fotos, áudios e vídeos do app
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy de acesso ao bucket 'media' (single-user)
DROP POLICY IF EXISTS "media_anon_all" ON storage.objects;
CREATE POLICY "media_anon_all" ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

-- Tabela de anexos: qualquer entidade (nota, transação, pet, etc.) pode ter
-- mídias associadas via (owner_type, owner_id).
CREATE TABLE IF NOT EXISTS attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type   TEXT NOT NULL,                 -- ex.: 'entry', 'transaction', 'pet', 'pet_log', 'goal'
  owner_id     UUID NOT NULL,
  kind         VARCHAR(10) NOT NULL CHECK (kind IN ('image', 'audio', 'video')),
  url          TEXT NOT NULL,                 -- URL pública
  storage_path TEXT,                          -- caminho no bucket (para apagar do Storage)
  caption      TEXT,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_attachments_owner
  ON attachments(owner_type, owner_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_full_access" ON attachments;
CREATE POLICY "anon_full_access" ON attachments FOR ALL
  TO anon, authenticated USING (true) WITH CHECK (true);
