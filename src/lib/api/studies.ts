/** CRUD da Central de Estudos. */

import { supabase } from "@/lib/supabaseClient";
import type {
  Database,
  StudyArea,
  StudyContent,
  StudyTask,
} from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type AreaInsert = Database["public"]["Tables"]["study_areas"]["Insert"];
type AreaUpdate = Database["public"]["Tables"]["study_areas"]["Update"];
type ContentInsert = Database["public"]["Tables"]["study_contents"]["Insert"];
type ContentUpdate = Database["public"]["Tables"]["study_contents"]["Update"];
type TaskInsert = Database["public"]["Tables"]["study_tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["study_tasks"]["Update"];

const DEFAULT_AREAS: AreaInsert[] = [
  { name: "Faculdade", icon: "🎓", category: "Formação", priority: "essential" },
  { name: "Concurso", icon: "🏆", category: "Carreira", priority: "important" },
  { name: "Preparação de aulas", icon: "🧑‍🏫", category: "Trabalho", priority: "important" },
  { name: "Inglês Avançado", icon: "🇬🇧", category: "Idiomas", priority: "important" },
  { name: "Marcenaria", icon: "🪚", category: "Habilidade", priority: "optional" },
];

export async function listStudyAreas(): Promise<StudyArea[]> {
  return unwrapList(
    "listStudyAreas",
    await supabase
      .from("study_areas")
      .select("*")
      .order("active", { ascending: false })
      .order("name", { ascending: true }),
  );
}

export async function seedDefaultStudyAreas(): Promise<StudyArea[]> {
  return unwrapList(
    "seedDefaultStudyAreas",
    await supabase
      .from("study_areas")
      .upsert(DEFAULT_AREAS, { onConflict: "owner_id,name", ignoreDuplicates: true })
      .select(),
  );
}

export async function createStudyArea(payload: AreaInsert): Promise<StudyArea> {
  return unwrap(
    "createStudyArea",
    await supabase.from("study_areas").insert(payload).select().single(),
  );
}

export async function updateStudyArea(
  id: string,
  patch: AreaUpdate,
): Promise<StudyArea> {
  return unwrap(
    "updateStudyArea",
    await supabase
      .from("study_areas")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteStudyArea(id: string): Promise<void> {
  const { error } = await supabase.from("study_areas").delete().eq("id", id);
  if (error) throw error;
}

export async function listStudyContents(): Promise<StudyContent[]> {
  return unwrapList(
    "listStudyContents",
    await supabase.from("study_contents").select("*").order("title"),
  );
}

export async function createStudyContent(
  payload: ContentInsert,
): Promise<StudyContent> {
  return unwrap(
    "createStudyContent",
    await supabase.from("study_contents").insert(payload).select().single(),
  );
}

export async function updateStudyContent(
  id: string,
  patch: ContentUpdate,
): Promise<StudyContent> {
  return unwrap(
    "updateStudyContent",
    await supabase
      .from("study_contents")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteStudyContent(id: string): Promise<void> {
  const { error } = await supabase.from("study_contents").delete().eq("id", id);
  if (error) throw error;
}

export async function findOrCreateStudyContent(
  areaId: string,
  title: string,
): Promise<StudyContent | null> {
  const cleanTitle = title.trim();
  if (!cleanTitle) return null;

  const existing = await supabase
    .from("study_contents")
    .select("*")
    .eq("area_id", areaId)
    .ilike("title", cleanTitle)
    .limit(1)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;
  return createStudyContent({ area_id: areaId, title: cleanTitle });
}

export async function listStudyTasks(
  firstDate: string,
  lastDate: string,
): Promise<StudyTask[]> {
  return unwrapList(
    "listStudyTasks",
    await supabase
      .from("study_tasks")
      .select("*")
      .gte("scheduled_date", firstDate)
      .lte("scheduled_date", lastDate)
      .order("scheduled_date")
      .order("created_at"),
  );
}

export async function createStudyTask(payload: TaskInsert): Promise<StudyTask> {
  return unwrap(
    "createStudyTask",
    await supabase.from("study_tasks").insert(payload).select().single(),
  );
}

export async function updateStudyTask(
  id: string,
  patch: TaskUpdate,
): Promise<StudyTask> {
  return unwrap(
    "updateStudyTask",
    await supabase
      .from("study_tasks")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteStudyTask(id: string): Promise<void> {
  const { error } = await supabase.from("study_tasks").delete().eq("id", id);
  if (error) throw error;
}
