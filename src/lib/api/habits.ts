/**
 * CRUD — hábitos e seus registros diários.
 *
 * Recorrência: `days_of_week` é um array de 0..6 (0=domingo). NULL/vazio = todos
 * os dias. Um hábito aparece num dia se for agendado para o dia-da-semana dele.
 *
 * Registro do dia (`habit_logs`, único por habit_id+log_date):
 *  - status 'done'    → cumprido naquele dia
 *  - status 'skipped' → removido/pulado naquele dia (não conta, some da lista)
 *  - sem linha        → pendente
 */

import { supabase } from "@/lib/supabaseClient";
import type {
  Database,
  Habit,
  HabitLog,
  HabitLogStatus,
} from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];

/** Data local no formato YYYY-MM-DD (sem deslocamento de fuso). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Um item recorrente está agendado para a data? (null/vazio = todo dia) */
export function isScheduledOn(
  days: number[] | null | undefined,
  date: Date,
): boolean {
  if (!days || days.length === 0) return true;
  return days.includes(date.getDay());
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

/** Define o status de um hábito num dia (upsert). */
export async function setHabitStatus(
  habitId: string,
  date: string,
  status: HabitLogStatus,
): Promise<HabitLog> {
  return unwrap(
    "setHabitStatus",
    await supabase
      .from("habit_logs")
      .upsert(
        { habit_id: habitId, log_date: date, status },
        { onConflict: "habit_id,log_date" },
      )
      .select()
      .single(),
  );
}

/** Remove o registro do dia (volta a "pendente"). */
export async function clearHabitLog(
  habitId: string,
  date: string,
): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("log_date", date);
  if (error) {
    console.error("Supabase error em clearHabitLog:", error);
    throw error;
  }
}

/**
 * Calcula a sequência (streak) de dias consecutivos cumpridos terminando hoje.
 * `doneDates` é o conjunto de datas (YYYY-MM-DD) com status 'done'.
 */
export function computeStreak(
  doneDates: Set<string>,
  today = new Date(),
): number {
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
