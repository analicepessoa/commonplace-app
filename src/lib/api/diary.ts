/**
 * Diário — blocos de texto (diary_notes) e checklists (diary_tasks) por
 * escopo (monthly/weekly/daily) e período.
 *
 * period_key:
 *   monthly → 'YYYY-MM'
 *   weekly  → 'YYYY-MM-Sn'  (n = semana do mês, 1..6)
 *   daily   → 'YYYY-MM-DD'
 */

import { supabase } from "@/lib/supabaseClient";
import type { DiaryNote, DiaryScope, DiaryTask } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function weekOfMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

export function weekKey(d: Date): string {
  return `${monthKey(d)}-S${weekOfMonth(d)}`;
}

// ---------- Notas (blocos de texto por campo) ----------

export async function listNotes(
  scope: DiaryScope,
  periodKey: string,
): Promise<DiaryNote[]> {
  return unwrapList(
    "listNotes",
    await supabase
      .from("diary_notes")
      .select("*")
      .eq("scope", scope)
      .eq("period_key", periodKey),
  );
}

export async function setNote(
  scope: DiaryScope,
  periodKey: string,
  field: string,
  content: string,
): Promise<DiaryNote> {
  return unwrap(
    "setNote",
    await supabase
      .from("diary_notes")
      .upsert(
        { scope, period_key: periodKey, field, content },
        { onConflict: "scope,period_key,field" },
      )
      .select()
      .single(),
  );
}

// ---------- Tarefas (checklist) ----------

export async function listTasks(
  scope: DiaryScope,
  periodKey: string,
): Promise<DiaryTask[]> {
  return unwrapList(
    "listTasks",
    await supabase
      .from("diary_tasks")
      .select("*")
      .eq("scope", scope)
      .eq("period_key", periodKey)
      .order("position")
      .order("created_at"),
  );
}

export async function addTask(
  scope: DiaryScope,
  periodKey: string,
  content: string,
  position = 0,
): Promise<DiaryTask> {
  return unwrap(
    "addTask",
    await supabase
      .from("diary_tasks")
      .insert({ scope, period_key: periodKey, content, position })
      .select()
      .single(),
  );
}

export async function updateTask(
  id: string,
  patch: { content?: string; done?: boolean },
): Promise<DiaryTask> {
  return unwrap(
    "updateTask",
    await supabase
      .from("diary_tasks")
      .update(patch)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("diary_tasks").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteTask:", error);
    throw error;
  }
}
