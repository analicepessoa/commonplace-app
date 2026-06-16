/**
 * Inicialização do cliente Supabase (singleton).
 *
 * As credenciais vêm de variáveis de ambiente públicas (NEXT_PUBLIC_*),
 * portanto a `anon key` é segura para o client-side desde que as policies
 * de RLS estejam configuradas no banco.
 *
 * Configure em `.env.local` (veja `.env.example`):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis do Supabase ausentes. Defina NEXT_PUBLIC_SUPABASE_URL e " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (veja .env.example).",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
