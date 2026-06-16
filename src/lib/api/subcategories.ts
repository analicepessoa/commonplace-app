/**
 * CRUD — tabela `subcategories` (índices vinculados a uma categoria mestre).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type SubcategoryInsert =
  Database["public"]["Tables"]["subcategories"]["Insert"];
type SubcategoryUpdate =
  Database["public"]["Tables"]["subcategories"]["Update"];

export async function listSubcategories() {
  return unwrapList(
    "listSubcategories",
    await supabase.from("subcategories").select("*").order("name"),
  );
}

export async function listSubcategoriesByCategory(categoryId: string) {
  return unwrapList(
    "listSubcategoriesByCategory",
    await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("name"),
  );
}

export async function getSubcategory(id: string) {
  return unwrap(
    "getSubcategory",
    await supabase.from("subcategories").select("*").eq("id", id).single(),
  );
}

export async function createSubcategory(payload: SubcategoryInsert) {
  return unwrap(
    "createSubcategory",
    await supabase.from("subcategories").insert(payload).select().single(),
  );
}

export async function updateSubcategory(
  id: string,
  payload: SubcategoryUpdate,
) {
  return unwrap(
    "updateSubcategory",
    await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteSubcategory:", error);
    throw error;
  }
}
