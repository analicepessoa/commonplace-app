/**
 * CRUD — hidratação (água) e refeições do dia.
 */

import { supabase } from "@/lib/supabaseClient";
import type { Meal, WaterIntake } from "@/lib/database.types";
import { unwrap, unwrapList } from "./helpers";
import { toISODate } from "./habits";

/** Refeições padrão criadas no primeiro acesso de um dia. */
export const DEFAULT_MEALS = ["Café da manhã", "Almoço", "Lanche", "Jantar"];

/** Busca (ou cria) o registro de água do dia. */
export async function getOrCreateWater(
  date = toISODate(new Date()),
): Promise<WaterIntake> {
  const found = await unwrapList<WaterIntake>(
    "getOrCreateWater.find",
    await supabase.from("water_intake").select("*").eq("intake_date", date),
  );
  if (found.length > 0) return found[0];

  // Cria de forma resistente a corrida: se outra chamada já criou, ignora o
  // conflito (constraint única em intake_date) e busca de novo.
  const { error } = await supabase
    .from("water_intake")
    .upsert({ intake_date: date }, { onConflict: "intake_date", ignoreDuplicates: true });
  if (error) console.error("getOrCreateWater.upsert:", error);

  return unwrap(
    "getOrCreateWater.refetch",
    await supabase.from("water_intake").select("*").eq("intake_date", date).single(),
  );
}

export async function setWaterGlasses(
  id: string,
  glasses: number,
): Promise<WaterIntake> {
  return unwrap(
    "setWaterGlasses",
    await supabase
      .from("water_intake")
      .update({ glasses: Math.max(0, glasses) })
      .eq("id", id)
      .select()
      .single(),
  );
}

/** Busca (ou cria) as refeições padrão do dia. */
export async function getOrCreateMeals(
  date = toISODate(new Date()),
): Promise<Meal[]> {
  const found = await unwrapList<Meal>(
    "getOrCreateMeals.find",
    await supabase.from("meals").select("*").eq("meal_date", date),
  );
  if (found.length > 0) {
    return sortMeals(found);
  }

  const rows = DEFAULT_MEALS.map((name) => ({ meal_date: date, name }));
  // Resistente a corrida: ignora conflito (única em meal_date+name) e re-busca.
  const { error } = await supabase
    .from("meals")
    .upsert(rows, { onConflict: "meal_date,name", ignoreDuplicates: true });
  if (error) console.error("getOrCreateMeals.upsert:", error);

  const all = await unwrapList<Meal>(
    "getOrCreateMeals.refetch",
    await supabase.from("meals").select("*").eq("meal_date", date),
  );
  return sortMeals(all);
}

export async function toggleMeal(id: string, done: boolean): Promise<Meal> {
  return unwrap(
    "toggleMeal",
    await supabase
      .from("meals")
      .update({ done })
      .eq("id", id)
      .select()
      .single(),
  );
}

/** Adiciona uma refeição avulsa ao dia. */
export async function addMeal(date: string, name: string): Promise<Meal> {
  return unwrap(
    "addMeal",
    await supabase
      .from("meals")
      .insert({ meal_date: date, name })
      .select()
      .single(),
  );
}

/** Renomeia uma refeição (corrigir sem precisar apagar e recriar). */
export async function renameMeal(id: string, name: string): Promise<Meal> {
  return unwrap(
    "renameMeal",
    await supabase
      .from("meals")
      .update({ name })
      .eq("id", id)
      .select()
      .single(),
  );
}

/** Atualiza o detalhe (o que foi comido) de uma refeição. */
export async function setMealDetail(id: string, detail: string): Promise<Meal> {
  return unwrap(
    "setMealDetail",
    await supabase
      .from("meals")
      .update({ detail })
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) {
    console.error("Supabase error em deleteMeal:", error);
    throw error;
  }
}

function sortMeals(meals: Meal[]): Meal[] {
  const order = new Map(DEFAULT_MEALS.map((n, i) => [n, i]));
  return [...meals].sort(
    (a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99),
  );
}
