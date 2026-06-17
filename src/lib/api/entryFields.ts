/**
 * CRUD — campos estruturados de uma nota (entry_fields), key-value por nota.
 */

import { supabase } from "@/lib/supabaseClient";
import type { EntryField } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

export async function listEntryFields(entryId: string): Promise<EntryField[]> {
  return unwrapList(
    "listEntryFields",
    await supabase.from("entry_fields").select("*").eq("entry_id", entryId),
  );
}

export async function setEntryField(
  entryId: string,
  field: string,
  value: string,
): Promise<EntryField> {
  return unwrap(
    "setEntryField",
    await supabase
      .from("entry_fields")
      .upsert(
        { entry_id: entryId, field, value },
        { onConflict: "entry_id,field" },
      )
      .select()
      .single(),
  );
}
