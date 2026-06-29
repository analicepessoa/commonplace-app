/**
 * CRUD — Agenda de compromissos (events).
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database, EventItem } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export async function listEvents(): Promise<EventItem[]> {
  return unwrapList(
    "listEvents",
    await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true, nullsFirst: true }),
  );
}

export async function createEvent(payload: EventInsert): Promise<EventItem> {
  return unwrap(
    "createEvent",
    await supabase.from("events").insert(payload).select().single(),
  );
}

export async function updateEvent(
  id: string,
  patch: EventUpdate,
): Promise<EventItem> {
  return unwrap(
    "updateEvent",
    await supabase.from("events").update(patch).eq("id", id).select().single(),
  );
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
