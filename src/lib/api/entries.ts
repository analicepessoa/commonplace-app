/**
 * CRUD — tabela `commonplace_entries` (notas de texto fixo das páginas).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type EntryInsert =
  Database["public"]["Tables"]["commonplace_entries"]["Insert"];
type EntryUpdate =
  Database["public"]["Tables"]["commonplace_entries"]["Update"];

export async function listEntries() {
  return unwrapList(
    "listEntries",
    await supabase
      .from("commonplace_entries")
      .select("*")
      .order("created_at", { ascending: false }),
  );
}

export async function listEntriesBySubcategory(subcategoryId: string) {
  return unwrapList(
    "listEntriesBySubcategory",
    await supabase
      .from("commonplace_entries")
      .select("*")
      .eq("subcategory_id", subcategoryId)
      .order("created_at", { ascending: false }),
  );
}

/** Busca textual simples em título e corpo (para o filtro rápido do índice). */
export async function searchEntries(term: string) {
  const escaped = term.replace(/[%_]/g, (m) => `\\${m}`);
  return unwrapList(
    "searchEntries",
    await supabase
      .from("commonplace_entries")
      .select("*")
      .or(`title.ilike.%${escaped}%,body_content.ilike.%${escaped}%`)
      .order("created_at", { ascending: false }),
  );
}

export async function getEntry(id: string) {
  return unwrap(
    "getEntry",
    await supabase
      .from("commonplace_entries")
      .select("*")
      .eq("id", id)
      .single(),
  );
}

export async function createEntry(payload: EntryInsert) {
  return unwrap(
    "createEntry",
    await supabase
      .from("commonplace_entries")
      .insert(payload)
      .select()
      .single(),
  );
}

export async function updateEntry(id: string, payload: EntryUpdate) {
  return unwrap(
    "updateEntry",
    await supabase
      .from("commonplace_entries")
      .update(payload)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteEntry(id: string) {
  const { error } = await supabase
    .from("commonplace_entries")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Supabase error em deleteEntry:", error);
    throw error;
  }
}
