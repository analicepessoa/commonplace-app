"use client";

/**
 * WaterTracker — hidratação do dia (copos pintados, com meta) + checklist de
 * refeições.
 */

import { useEffect, useState } from "react";
import {
  getOrCreateWater,
  setWaterGlasses,
  getOrCreateMeals,
  toggleMeal,
} from "@/lib/api";
import type { Meal, WaterIntake } from "@/lib/database.types";

export default function WaterTracker({ date }: { date: string }) {
  const [water, setWater] = useState<WaterIntake | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWater(null);
    setMeals([]);
    Promise.all([getOrCreateWater(date), getOrCreateMeals(date)])
      .then(([w, m]) => {
        setWater(w);
        setMeals(m);
      })
      .catch((e) => setError(e.message ?? String(e)));
  }, [date]);

  async function changeGlasses(next: number) {
    if (!water) return;
    const clamped = Math.max(0, next);
    setWater({ ...water, glasses: clamped });
    try {
      await setWaterGlasses(water.id, clamped);
    } catch (e) {
      console.error("setWaterGlasses falhou:", e);
    }
  }

  async function handleToggleMeal(meal: Meal) {
    const done = !meal.done;
    setMeals((prev) => prev.map((m) => (m.id === meal.id ? { ...m, done } : m)));
    try {
      await toggleMeal(meal.id, done);
    } catch (e) {
      console.error("toggleMeal falhou:", e);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
      <h2 className="mb-4 font-hand text-3xl text-ink">Água & Refeições</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {water && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ink-soft">
              Água: {water.glasses}/{water.goal} copos
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => changeGlasses(water.glasses - 1)}
                className="h-7 w-7 rounded-md border border-stone-300 text-ink-soft transition hover:bg-stone-100"
              >
                −
              </button>
              <button
                onClick={() => changeGlasses(water.glasses + 1)}
                className="h-7 w-7 rounded-md border border-stone-300 text-ink-soft transition hover:bg-stone-100"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: water.goal }).map((_, i) => {
              const filled = i < water.glasses;
              return (
                <button
                  key={i}
                  onClick={() => changeGlasses(i + 1)}
                  className="text-2xl transition hover:scale-110"
                  title={`${i + 1} copos`}
                >
                  <span style={{ opacity: filled ? 1 : 0.25 }}>💧</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 font-hand text-2xl text-ink">Refeições</h3>
        <ul className="space-y-1.5">
          {meals.map((meal) => (
            <li key={meal.id}>
              <button
                onClick={() => handleToggleMeal(meal)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-stone-50"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                    meal.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-stone-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`font-hand text-xl ${
                    meal.done ? "text-ink-soft line-through" : "text-ink"
                  }`}
                >
                  {meal.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
