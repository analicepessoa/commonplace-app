import { supabase } from "@/lib/supabaseClient";
import type {
  Database,
  FitnessAchievement,
  FitnessExercisePreference,
  FitnessRecipe,
  FitnessWeightLog,
  FitnessWorkoutSession,
} from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";

type PreferenceInsert = Database["public"]["Tables"]["fitness_exercise_preferences"]["Insert"];
type SessionInsert = Database["public"]["Tables"]["fitness_workout_sessions"]["Insert"];
type RecipeInsert = Database["public"]["Tables"]["fitness_recipes"]["Insert"];
type AchievementInsert = Database["public"]["Tables"]["fitness_achievements"]["Insert"];

export async function listFitnessPreferences(): Promise<FitnessExercisePreference[]> {
  return unwrapList("listFitnessPreferences", await supabase.from("fitness_exercise_preferences").select("*").order("sort_order"));
}

export async function saveFitnessPreference(payload: PreferenceInsert): Promise<FitnessExercisePreference> {
  return unwrap(
    "saveFitnessPreference",
    await supabase.from("fitness_exercise_preferences").upsert(payload, { onConflict: "slot_key" }).select().single(),
  );
}

export async function deleteFitnessPreference(slotKey: string): Promise<void> {
  const { error } = await supabase.from("fitness_exercise_preferences").delete().eq("slot_key", slotKey);
  if (error) throw error;
}

export async function listFitnessSessions(): Promise<FitnessWorkoutSession[]> {
  return unwrapList("listFitnessSessions", await supabase.from("fitness_workout_sessions").select("*").order("workout_date", { ascending: false }));
}

export async function saveFitnessSession(payload: SessionInsert): Promise<FitnessWorkoutSession> {
  return unwrap(
    "saveFitnessSession",
    await supabase.from("fitness_workout_sessions").upsert(payload, { onConflict: "workout_date" }).select().single(),
  );
}

export async function deleteFitnessSession(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_workout_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function listFitnessWeightLogs(): Promise<FitnessWeightLog[]> {
  return unwrapList("listFitnessWeightLogs", await supabase.from("fitness_weight_logs").select("*").order("created_at", { ascending: false }));
}

export async function addFitnessWeightLog(exerciseKey: string, exerciseName: string, weight: number): Promise<FitnessWeightLog> {
  return unwrap(
    "addFitnessWeightLog",
    await supabase.from("fitness_weight_logs").insert({ exercise_key: exerciseKey, exercise_name: exerciseName, weight }).select().single(),
  );
}

export async function listFitnessRecipes(): Promise<FitnessRecipe[]> {
  return unwrapList("listFitnessRecipes", await supabase.from("fitness_recipes").select("*").order("created_at", { ascending: false }));
}

export async function addFitnessRecipe(payload: RecipeInsert): Promise<FitnessRecipe> {
  return unwrap("addFitnessRecipe", await supabase.from("fitness_recipes").insert(payload).select().single());
}

export async function deleteFitnessRecipe(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_recipes").delete().eq("id", id);
  if (error) throw error;
}

export async function listFitnessAchievements(): Promise<FitnessAchievement[]> {
  return unwrapList("listFitnessAchievements", await supabase.from("fitness_achievements").select("*").order("achieved_at", { ascending: false }));
}

export async function addFitnessAchievement(payload: AchievementInsert): Promise<FitnessAchievement> {
  return unwrap("addFitnessAchievement", await supabase.from("fitness_achievements").insert(payload).select().single());
}

export async function deleteFitnessAchievement(id: string): Promise<void> {
  const { error } = await supabase.from("fitness_achievements").delete().eq("id", id);
  if (error) throw error;
}
