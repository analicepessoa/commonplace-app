/**
 * Dados agregados da tela de Índice do Commonplace.
 *
 * Monta a árvore Categoria → Subcategorias (+ contagem de notas) em poucas
 * consultas, evitando N+1.
 */

import { supabase } from "@/lib/supabaseClient";
import type { Category, Subcategory } from "@/lib/database.types";
import { unwrapList } from "./helpers";

export interface SubcategoryWithCount extends Subcategory {
  entryCount: number;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: SubcategoryWithCount[];
}

export async function getCommonplaceIndex(): Promise<
  CategoryWithSubcategories[]
> {
  const [categories, subcategories, entries] = await Promise.all([
    unwrapList<Category>(
      "getCommonplaceIndex.categories",
      await supabase.from("categories").select("*").order("name"),
    ),
    unwrapList<Subcategory>(
      "getCommonplaceIndex.subcategories",
      await supabase.from("subcategories").select("*").order("name"),
    ),
    unwrapList<{ subcategory_id: string | null }>(
      "getCommonplaceIndex.entries",
      await supabase.from("commonplace_entries").select("subcategory_id"),
    ),
  ]);

  const countBySub = new Map<string, number>();
  for (const e of entries) {
    if (!e.subcategory_id) continue;
    countBySub.set(
      e.subcategory_id,
      (countBySub.get(e.subcategory_id) ?? 0) + 1,
    );
  }

  return categories.map((cat) => ({
    ...cat,
    subcategories: subcategories
      .filter((s) => s.category_id === cat.id)
      .map((s) => ({ ...s, entryCount: countBySub.get(s.id) ?? 0 })),
  }));
}
