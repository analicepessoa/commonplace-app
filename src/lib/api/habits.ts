/**
 * CRUD — hábitos e seus registros diários.
 *
 * A presença de uma linha em `habit_logs` (habit_id, log_date) significa que
 * o hábito foi cumprido naquele dia. O "streak" é a quantidade de dias
 * consecutivos cumpridos terminando hoje.
 */

import { supabase } from "@/lib/supabaseClient";
import type { Database, Habit, HabitLog } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];

/** Data local no formato YYYY-MM-DD (sem deslocamento de fuso). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function listHabits(): Promise<Habit[]> {
  return unwrapList(
    "listHabits",
    await supabase.from("habits").select("*").order("created_at"),
  );
}

export async function createHabit(payload: HabitInsert): Promise<Habit> {
  return unwrap(
    "createHabit",
    await supabase.from("habits").insert(payload).select().single(),
  );
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteHabit:", error);
    throw error;
  }
}

/** Logs de um intervalo de datas (inclusive), para todos os hábitos. */
export async function listHabitLogs(
  from: string,
  to: string,
): Promise<HabitLog[]> {
  return unwrapList(
    "listHabitLogs",
    await supabase
      .from("habit_logs")
      .select("*")
      .gte("log_date", from)
      .lte("log_date", to),
  );
}

/** Marca/desmarca um hábito num dia (toggle). Retorna o novo estado. */
export async function toggleHabit(
  habitId: string,
  date: string,
): Promise<boolean> {
  const existing = await unwrapList<HabitLog>(
    "toggleHabit.check",
    await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .eq("log_date", date),
  );

  if (existing.length > 0) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("log_date", date);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("habit_logs")
    .insert({ habit_id: habitId, log_date: date });
  if (error) throw error;
  return true;
}

/**
 * Calcula a sequência (streak) de dias consecutivos cumpridos terminando hoje.
 * `doneDates` é o conjunto de datas (YYYY-MM-DD) em que o hábito foi cumprido.
 */
export function computeStreak(doneDates: Set<string>, today = new Date()): number {
  let streak = 0;
  const cursor = new Date(today);
  // Se hoje ainda não foi marcado, a sequência pode continuar até ontem.
  if (!doneDates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (doneDates.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
