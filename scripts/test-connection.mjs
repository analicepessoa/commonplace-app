// Teste rápido de conexão com o Supabase (Prompt 1).
// Uso: node scripts/test-connection.mjs
import { createClient } from "@supabase/supabase-js";

const url = "https://fmfudnkkvwurcfdwbvkg.supabase.co";
const key = "sb_publishable_QpAMd6M1BImqdjDat6P-vQ_UWq28LkF";
const supabase = createClient(url, key);

const tables = [
  "categories",
  "subcategories",
  "commonplace_entries",
  "floating_elements",
  "transactions",
];

let ok = true;
for (const t of tables) {
  const { count, error } = await supabase
    .from(t)
    .select("*", { count: "exact", head: true });
  if (error) {
    ok = false;
    console.log(`❌ ${t}: ${error.message}`);
  } else {
    console.log(`✅ ${t}: acessível (${count} linhas)`);
  }
}

console.log("\n--- Categorias (seed) ---");
const { data, error } = await supabase
  .from("categories")
  .select("name, color_hex")
  .order("name");
if (error) console.log("Erro ao ler categorias:", error.message);
else data.forEach((c) => console.log(`  ${c.color_hex}  ${c.name}`));

process.exit(ok ? 0 : 1);
