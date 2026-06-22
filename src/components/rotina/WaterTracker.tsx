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
  addMeal,
  renameMeal,
  setMealDetail,
  deleteMeal,
} from "@/lib/api";
import type { Meal, WaterIntake } from "@/lib/database.types";

export default function WaterTracker({ date }: { date: string }) {
  const [water, setWater] = useState<WaterIntake | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState("");
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

  async function handleAddMeal() {
    const name = newMeal.trim();
    if (!name) return;
    setNewMeal("");
    try {
      const created = await addMeal(date, name);
      setMeals((prev) => [...prev, created]);
    } catch (e) {
      alert("Erro ao adicionar refeição: " + (e as Error).message);
    }
  }

  async function handleRenameMeal(meal: Meal) {
    const name = window.prompt("Editar refeição:", meal.name);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === meal.name) return;
    setMeals((prev) =>
      prev.map((m) => (m.id === meal.id ? { ...m, name: trimmed } : m)),
    );
    try {
      await renameMeal(meal.id, trimmed);
    } catch (e) {
      console.error("renameMeal falhou:", e);
    }
  }

  function updateDetailLocal(id: string, detail: string) {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, detail } : m)));
  }
  async function saveDetail(id: string, detail: string) {
    try {
      await setMealDetail(id, detail);
    } catch (e) {
      console.error("setMealDetail falhou:", e);
    }
  }

  async function handleDeleteMeal(meal: Meal) {
    setMeals((prev) => prev.filter((m) => m.id !== meal.id));
    try {
      await deleteMeal(meal.id);
    } catch (e) {
      console.error("deleteMeal falhou:", e);
    }
  }

  return (
    <section className="relative rounded-2xl border border-stone-200 bg-card p-5 shadow-sm">
      <span className="pin absolute" style={{ top: -8, right: 18 }} aria-hidden />
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
            <li
              key={meal.id}
              className="group rounded-lg border border-[#e0d2b0] bg-card px-3 py-2 shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleMeal(meal)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
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
                <button
                  onClick={() => handleRenameMeal(meal)}
                  className="text-stone-400 transition hover:text-ink-soft"
                  title="Renomear refeição"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteMeal(meal)}
                  className="text-stone-400 transition hover:text-red-500"
                  title="Remover refeição"
                >
                  ×
                </button>
              </div>
              <input
                value={meal.detail ?? ""}
                onChange={(e) => updateDetailLocal(meal.id, e.target.value)}
                onBlur={(e) => saveDetail(meal.id, e.target.value)}
                placeholder="o que comeu…"
                className="ml-9 mt-1 w-[calc(100%-2.25rem)] rounded-md border border-stone-200 bg-white/70 px-2 py-1 text-sm outline-none focus:border-stone-400"
              />
            </li>
          ))}
        </ul>

        <div className="mt-3 flex gap-2">
          <input
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddMeal();
            }}
            placeholder="Adicionar refeição…"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-stone-400"
          />
          <button
            onClick={handleAddMeal}
            className="rounded-lg bg-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-300"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
