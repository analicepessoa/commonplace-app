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
    <section className="vintage-box">
      <h2 className="vintage-header">Água & Refeições</h2>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {water && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ink font-bold font-sans uppercase text-sm border-b border-ink/20 pb-1 inline-block mb-2">
              Copos de Água: {water.glasses}/{water.goal}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => changeGlasses(water.glasses - 1)}
                className="font-hand text-xl text-ink opacity-60 hover:opacity-100 transition"
              >
                −
              </button>
              <button
                onClick={() => changeGlasses(water.glasses + 1)}
                className="font-hand text-xl text-ink hover:text-accent transition"
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
        <h3 className="mb-2 font-hand font-bold text-3xl text-ink">Refeições</h3>
        <ul className="space-y-1.5">
          {meals.map((meal) => (
            <li
              key={meal.id}
              className="group py-2 border-b border-ink/20 transition"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleMeal(meal)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-ink transition relative"
                  >
                    {meal.done ? (
                      <span className="absolute inset-0 bg-ink" style={{ clipPath: 'polygon(10% 0, 100% 20%, 90% 100%, 0 80%)' }}></span>
                    ) : ""}
                  </span>
                  <span
                    className={`font-hand text-2xl font-bold ${
                      meal.done ? "text-ink opacity-50 line-through" : "text-ink"
                    }`}
                  >
                    {meal.name}
                  </span>
                </button>
                <button
                  onClick={() => handleRenameMeal(meal)}
                  className="text-ink-soft/50 transition hover:text-ink"
                  title="Renomear refeição"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDeleteMeal(meal)}
                  className="text-ink-soft/50 transition hover:text-accent"
                  title="Remover refeição"
                >
                  ×
                </button>
              </div>
              <input
                value={meal.detail ?? ""}
                onChange={(e) => updateDetailLocal(meal.id, e.target.value)}
                onBlur={(e) => saveDetail(meal.id, e.target.value)}
                placeholder="Detalhes (ex: o que comeu)..."
                className="ml-8 mt-1 w-[calc(100%-2rem)] bg-transparent border-b border-ink/30 px-1 py-1 text-lg font-hand text-ink outline-none placeholder:text-ink/40"
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddMeal();
            }}
            placeholder="Nova refeição..."
            className="flex-1 bg-transparent border-b-2 border-ink/30 px-2 py-1 outline-none focus:border-ink font-hand text-2xl font-bold text-ink placeholder:text-ink/40"
          />
          <button
            onClick={handleAddMeal}
            className="text-ink font-bold font-sans uppercase text-sm border-b-2 border-ink hover:text-accent transition"
          >
            Adicionar
          </button>
        </div>
      </div>
    </section>
  );
}
