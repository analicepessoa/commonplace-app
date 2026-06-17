"use client";

/**
 * HabitTracker — checklist de hábitos com contador de sequência (streak) e
 * uma faixa dos últimos 7 dias "pintada" como marcador.
 */

import { useEffect, useMemo, useState } from "react";
import {
  listHabits,
  listHabitLogs,
  toggleHabit,
  createHabit,
  deleteHabit,
  computeStreak,
  toISODate,
} from "@/lib/api";
import type { Habit, HabitLog } from "@/lib/database.types";
import CustomButton from "@/components/ui/CustomButton";

const WINDOW_DAYS = 7;

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const arr: string[] = [];
    const d = new Date();
    for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
      const day = new Date(d);
      day.setDate(d.getDate() - i);
      arr.push(toISODate(day));
    }
    return arr;
  }, []);
  const todayISO = days[days.length - 1];

  useEffect(() => {
    Promise.all([listHabits(), listHabitLogs(days[0], todayISO)])
      .then(([h, l]) => {
        setHabits(h);
        setLogs(l);
      })
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [days, todayISO]);

  const doneByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!map.has(log.habit_id)) map.set(log.habit_id, new Set());
      map.get(log.habit_id)!.add(log.log_date);
    }
    return map;
  }, [logs]);

  async function handleToggle(habit: Habit, date: string) {
    const set = doneByHabit.get(habit.id) ?? new Set<string>();
    const willBeDone = !set.has(date);
    // otimista
    setLogs((prev) =>
      willBeDone
        ? [...prev, { id: `tmp-${habit.id}-${date}`, habit_id: habit.id, log_date: date }]
        : prev.filter((l) => !(l.habit_id === habit.id && l.log_date === date)),
    );
    try {
      await toggleHabit(habit.id, date);
    } catch (e) {
      console.error("toggleHabit falhou:", e);
    }
  }

  async function handleAdd() {
    const name = window.prompt("Novo hábito:", "");
    if (!name) return;
    try {
      const created = await createHabit({ name });
      setHabits((prev) => [...prev, created]);
    } catch (e) {
      alert("Erro ao criar hábito: " + (e as Error).message);
    }
  }

  async function handleDelete(habit: Habit) {
    if (!confirm(`Remover o hábito "${habit.name}"?`)) return;
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    try {
      await deleteHabit(habit.id);
    } catch (e) {
      console.error("deleteHabit falhou:", e);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">Hábitos</h2>
        <CustomButton size="sm" onClick={handleAdd}>
          + Hábito
        </CustomButton>
      </div>

      {loading && <p className="text-ink-soft">Carregando…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && habits.length === 0 && !error && (
        <p className="text-ink-soft">
          Nenhum hábito ainda. Crie o primeiro em “+ Hábito”.
        </p>
      )}

      <ul className="space-y-3">
        {habits.map((habit) => {
          const set = doneByHabit.get(habit.id) ?? new Set<string>();
          const streak = computeStreak(set);
          const doneToday = set.has(todayISO);
          return (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-50"
            >
              <button
                onClick={() => handleToggle(habit, todayISO)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition"
                style={{
                  borderColor: habit.color_hex,
                  backgroundColor: doneToday ? habit.color_hex : "transparent",
                  color: doneToday ? "#fff" : habit.color_hex,
                }}
                title={doneToday ? "Cumprido hoje" : "Marcar hoje"}
              >
                {doneToday ? "✓" : ""}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-hand text-xl text-ink">
                    {habit.name}
                  </span>
                  <span
                    className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${habit.color_hex}1a`,
                      color: habit.color_hex,
                    }}
                    title="Sequência de dias"
                  >
                    🔥 {streak}
                  </span>
                </div>
                {/* faixa pintada dos últimos dias */}
                <div className="mt-1.5 flex gap-1">
                  {days.map((day) => {
                    const on = set.has(day);
                    return (
                      <button
                        key={day}
                        onClick={() => handleToggle(habit, day)}
                        className="h-3 flex-1 rounded-sm transition"
                        style={{
                          backgroundColor: on
                            ? habit.color_hex
                            : `${habit.color_hex}26`,
                        }}
                        title={day}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handleDelete(habit)}
                className="shrink-0 text-stone-300 transition hover:text-red-500"
                title="Remover hábito"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
