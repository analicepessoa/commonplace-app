/**
 * CRUD — tabela `floating_elements` (stickers, post-its e sketches do canvas).
 *
 * Inclui helpers usados pela mecânica de drag-and-drop do Prompt 3:
 *  - updatePosition: persiste pos_x/pos_y/scale/rotation no onDragEnd
 *  - bringToFront:   recalcula o maior z_index da página e aplica ao item
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type FloatingInsert =
  Database["public"]["Tables"]["floating_elements"]["Insert"];
type FloatingUpdate =
  Database["public"]["Tables"]["floating_elements"]["Update"];

export async function listFloatingElements(entryId: string) {
  return unwrapList(
    "listFloatingElements",
    await supabase
      .from("floating_elements")
      .select("*")
      .eq("entry_id", entryId)
      .order("z_index", { ascending: true }),
  );
}

export async function createFloatingElement(payload: FloatingInsert) {
  return unwrap(
    "createFloatingElement",
    await supabase
      .from("floating_elements")
      .insert(payload)
      .select()
      .single(),
  );
}

export async function updateFloatingElement(
  id: string,
  payload: FloatingUpdate,
) {
  return unwrap(
    "updateFloatingElement",
    await supabase
      .from("floating_elements")
      .update(payload)
      .eq("id", id)
      .select()
      .single(),
  );
}

/** Persiste a posição/transformação após arrastar (onDragEnd). */
export async function updatePosition(
  id: string,
  pos: { pos_x: number; pos_y: number; scale?: number; rotation?: number },
) {
  return updateFloatingElement(id, pos);
}

/** Traz o elemento clicado para o topo da camada visual da página. */
export async function bringToFront(id: string, entryId: string) {
  const elements = await listFloatingElements(entryId);
  const maxZ = elements.reduce((max, el) => Math.max(max, el.z_index), 0);
  return updateFloatingElement(id, { z_index: maxZ + 1 });
}

export async function deleteFloatingElement(id: string) {
  const { error } = await supabase
    .from("floating_elements")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Supabase error em deleteFloatingElement:", error);
    throw error;
  }
}
