/**
 * Mantém atividade mínima no projeto gratuito do Supabase.
 * A consulta respeita o RLS e não lê conteúdo privado sem uma sessão.
 */
async function supabaseKeepalive() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Variáveis NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes.");
  }

  const response = await fetch(`${url}/rest/v1/categories?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "User-Agent": "commonplace-netlify-keepalive/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase respondeu ${response.status}.`);
  }

  console.log("Supabase ativo em", new Date().toISOString());
}

export default supabaseKeepalive;

export const config = {
  schedule: "0 */8 * * *",
};
