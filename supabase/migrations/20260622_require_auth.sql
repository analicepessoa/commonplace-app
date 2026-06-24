-- =====================================================================
-- Tranca o acesso aos dados: somente usuários AUTENTICADOS (remove anon).
-- Execute no SQL Editor do Supabase.
-- =====================================================================

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories','subcategories','commonplace_entries','floating_elements','transactions',
    'habits','habit_logs','water_intake','meals','routines','attachments',
    'diary_notes','diary_tasks','health_appointments','health_medications','menstrual_cycles',
    'pets','pet_logs','entry_fields','financial_goals','budgets','recurring_transactions'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_full_access" ON %I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "authed_full_access" ON %I;', t);
    EXECUTE format('CREATE POLICY "authed_full_access" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- Storage: escrita exige login (leitura segue pública pois os buckets são public)
DROP POLICY IF EXISTS "media_anon_all" ON storage.objects;
DROP POLICY IF EXISTS "media_authed_all" ON storage.objects;
CREATE POLICY "media_authed_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "receipts_anon_all" ON storage.objects;
DROP POLICY IF EXISTS "receipts_authed_all" ON storage.objects;
CREATE POLICY "receipts_authed_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'financial-receipts') WITH CHECK (bucket_id = 'financial-receipts');
