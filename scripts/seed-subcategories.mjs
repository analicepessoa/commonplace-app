// Semeia subcategorias de exemplo (22 índices iniciais) e algumas notas.
// Idempotente: não faz nada se já existirem subcategorias.
// Uso: node scripts/seed-subcategories.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fmfudnkkvwurcfdwbvkg.supabase.co",
  "sb_publishable_QpAMd6M1BImqdjDat6P-vQ_UWq28LkF",
);

// Mapeia por prefixo do nome da categoria -> subcategorias
const MAP = {
  "Reflexões": ["Gratidão", "Diário Pessoal", "Autoconhecimento", "Metas & Intenções", "Desabafos"],
  "Inspirações": ["Citações", "Livros", "Filmes & Séries", "Pessoas que Admiro", "Trechos Marcantes"],
  "Ideias": ["Projetos", "Brainstorms", "Esboços", "Ideias de Negócio"],
  "Estilo de Vida": ["Receitas", "Hábitos", "Viagens", "Bem-estar"],
  "Curiosidade": ["Curiosidades", "Estudos", "Palavras Novas", "Perguntas Abertas"],
};

// Algumas notas de exemplo para a busca ter conteúdo (subcategoria -> [notas])
const NOTES = {
  "Citações": [
    { title: "Sêneca sobre o tempo", body_content: "Não é que temos pouco tempo, é que perdemos muito dele." },
    { title: "Sobre começar", body_content: "A melhor hora de plantar uma árvore foi há 20 anos. A segunda melhor é agora." },
  ],
  "Gratidão": [
    { title: "Manhã tranquila", body_content: "Café quente, silêncio e sol entrando pela janela." },
  ],
  "Hábitos": [
    { title: "Regra dos 2 minutos", body_content: "Se leva menos de dois minutos, faça agora." },
  ],
};

const { count } = await supabase
  .from("subcategories")
  .select("*", { count: "exact", head: true });
if (count > 0) {
  console.log(`Já existem ${count} subcategorias — nada a fazer.`);
  process.exit(0);
}

const { data: categories, error: catErr } = await supabase
  .from("categories")
  .select("id, name");
if (catErr) {
  console.error("Erro lendo categorias:", catErr.message);
  process.exit(1);
}

const subByName = {};
for (const [prefix, names] of Object.entries(MAP)) {
  const cat = categories.find((c) => c.name.startsWith(prefix));
  if (!cat) {
    console.warn(`Categoria com prefixo "${prefix}" não encontrada — pulando.`);
    continue;
  }
  for (const name of names) {
    const { data, error } = await supabase
      .from("subcategories")
      .insert({ category_id: cat.id, name })
      .select()
      .single();
    if (error) {
      console.error(`Erro criando "${name}":`, error.message);
    } else {
      subByName[name] = data.id;
      console.log(`+ subcategoria: ${name}  (${cat.name})`);
    }
  }
}

let notesCreated = 0;
for (const [subName, notes] of Object.entries(NOTES)) {
  const subId = subByName[subName];
  if (!subId) continue;
  for (const note of notes) {
    const { error } = await supabase
      .from("commonplace_entries")
      .insert({ subcategory_id: subId, ...note });
    if (error) console.error(`Erro criando nota "${note.title}":`, error.message);
    else notesCreated++;
  }
}

console.log(`\nOK: ${Object.keys(subByName).length} subcategorias e ${notesCreated} notas criadas.`);
