/**
 * CRUD — rotinas fixas (ex.: Trabalho) com deslocamento manual.
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database, Routine } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type RoutineInsert = Database["public"]["Tables"]["routines"]["Insert"];

export async function listRoutines(): Promise<Routine[]> {
  return unwrapList(
    "listRoutines",
    await supabase.from("routines").select("*").order("start_time"),
  );
}

export async function createRoutine(payload: RoutineInsert): Promise<Routine> {
  return unwrap(
    "createRoutine",
    await supabase.from("routines").insert(payload).select().single(),
  );
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteRoutine:", error);
    throw error;
  }
}

/**
 * Calcula o horário de saída recuando `travel_minutes` do início (HH:MM).
 * Retorna "HH:MM". Ex.: start 09:00, travel 30 -> "08:30".
 */
export function computeLeaveTime(
  startTime: string,
  travelMinutes: number,
): string {
  const [h, m] = startTime.split(":").map(Number);
  let total = h * 60 + m - travelMinutes;
  total = ((total % 1440) + 1440) % 1440; // normaliza no dia
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
