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

  return unwrap(
    "getOrCreateWater.create",
    await supabase
      .from("water_intake")
      .insert({ intake_date: date })
      .select()
      .single(),
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
  const created = await unwrapList<Meal>(
    "getOrCreateMeals.create",
    await supabase.from("meals").insert(rows).select(),
  );
  return sortMeals(created);
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

function sortMeals(meals: Meal[]): Meal[] {
  const order = new Map(DEFAULT_MEALS.map((n, i) => [n, i]));
  return [...meals].sort(
    (a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99),
  );
}
