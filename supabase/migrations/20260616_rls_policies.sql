-- =====================================================================
-- Policies de RLS — acesso aberto para a anon key
-- =====================================================================
-- ATENÇÃO: este app ainda não tem autenticação. Estas policies liberam
-- LEITURA E ESCRITA TOTAL para qualquer pessoa com a anon key (uso pessoal /
-- single-user). Quando houver login por usuário, troque o USING/WITH CHECK
-- por algo como `auth.uid() = user_id`.
-- =====================================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','subcategories','commonplace_entries',
    'floating_elements','transactions'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format(
      'CREATE POLICY "anon_full_access" ON %I FOR ALL
         TO anon, authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- ---------- Storage: acesso ao bucket financial-receipts (Prompt 6) ----------
DROP POLICY IF EXISTS "receipts_anon_all" ON storage.objects;
CREATE POLICY "receipts_anon_all" ON storage.objects FOR ALL
  TO anon, authenticated
  USING (bucket_id = 'financial-receipts')
  WITH CHECK (bucket_id = 'financial-receipts');
