/**
 * Templates estruturados por subcategoria do Commonplace.
 *
 * Cada template define os campos que a nota daquela subcategoria mostra (além
 * do canvas livre, post-its e mídia, que continuam disponíveis sempre).
 */

export type FieldType = "text" | "textarea" | "rating" | "date" | "boolean";

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
}

export interface TemplateDef {
  id: string;
  label: string;
  fields: TemplateField[];
}

export const TEMPLATES: Record<string, TemplateDef> = {
  book: {
    id: "book",
    label: "Leitura",
    fields: [
      { key: "author", label: "Autor", type: "text" },
      { key: "genre", label: "Gênero", type: "text" },
      { key: "date_start", label: "Data início", type: "date" },
      { key: "date_end", label: "Data fim", type: "date" },
      { key: "rating", label: "Avaliação", type: "rating" },
      { key: "review", label: "Resenha", type: "textarea" },
      { key: "favorite_quote", label: "Trecho favorito", type: "textarea" },
      { key: "recommend", label: "Recomendaria?", type: "boolean" },
    ],
  },
  movie: {
    id: "movie",
    label: "Filme / Série",
    fields: [
      { key: "director", label: "Direção", type: "text" },
      { key: "genre", label: "Gênero", type: "text" },
      { key: "year", label: "Ano", type: "text" },
      { key: "where", label: "Onde assistir", type: "text" },
      { key: "rating", label: "Avaliação", type: "rating" },
      { key: "review", label: "Resenha", type: "textarea" },
      { key: "recommend", label: "Recomendaria?", type: "boolean" },
    ],
  },
  recipe: {
    id: "recipe",
    label: "Receita",
    fields: [
      { key: "time", label: "Tempo", type: "text" },
      { key: "servings", label: "Porções", type: "text" },
      { key: "ingredients", label: "Ingredientes", type: "textarea" },
      { key: "steps", label: "Modo de preparo", type: "textarea" },
    ],
  },
};

/** Lista de templates para seletor (inclui "nenhum"). */
export const TEMPLATE_OPTIONS = [
  { id: "", label: "Nenhum (só texto livre)" },
  ...Object.values(TEMPLATES).map((t) => ({ id: t.id, label: t.label })),
];

export function getTemplate(id: string | null): TemplateDef | null {
  if (!id) return null;
  return TEMPLATES[id] ?? null;
}
