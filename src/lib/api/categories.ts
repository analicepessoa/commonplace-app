/**
 * CRUD — tabela `categories` (categorias mestre do índice).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function listCategories() {
  return unwrapList(
    "listCategories",
    await supabase.from("categories").select("*").order("name"),
  );
}

export async function getCategory(id: string) {
  return unwrap(
    "getCategory",
    await supabase.from("categories").select("*").eq("id", id).single(),
  );
}

export async function createCategory(payload: CategoryInsert) {
  return unwrap(
    "createCategory",
    await supabase.from("categories").insert(payload).select().single(),
  );
}

export async function updateCategory(id: string, payload: CategoryUpdate) {
  return unwrap(
    "updateCategory",
    await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteCategory:", error);
    throw error;
  }
}
