"use client";

/**
 * HabitTracker — hábitos do dia selecionado, com recorrência por dia da semana,
 * sequência (streak), faixa pintada dos últimos dias e opção de pular um dia.
 */

import { useEffect, useMemo, useState } from "react";
import {
  listHabits,
  listHabitLogs,
  setHabitStatus,
  clearHabitLog,
  createHabit,
  updateHabit,
  deleteHabit,
  computeStreak,
  isScheduledOn,
  toISODate,
} from "@/lib/api";
import type { Habit, HabitLog } from "@/lib/database.types";
import CustomButton from "@/components/ui/CustomButton";

const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const STRIP_DAYS = 7;
const HISTORY_DAYS = 90;

function parseISO(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export default function HabitTracker({ date }: { date: string }) {
  const selected = parseISO(date);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form de novo/editar hábito
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDays, setNewDays] = useState<number[]>([]);

  const historyFrom = useMemo(() => {
    const d = parseISO(date);
    d.setDate(d.getDate() - HISTORY_DAYS);
    return toISODate(d);
  }, [date]);

  useEffect(() => {
    setLoading(true);
    Promise.all([listHabits(), listHabitLogs(historyFrom, date)])
      .then(([h, l]) => {
        setHabits(h);
        setLogs(l);
      })
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [date, historyFrom]);

  // habit_id -> { done: Set<date>, skipped: Set<date> }
  const statusByHabit = useMemo(() => {
    const map = new Map<string, { done: Set<string>; skipped: Set<string> }>();
    for (const log of logs) {
      if (!map.has(log.habit_id))
        map.set(log.habit_id, { done: new Set(), skipped: new Set() });
      const e = map.get(log.habit_id)!;
      if (log.status === "skipped") e.skipped.add(log.log_date);
      else e.done.add(log.log_date);
    }
    return map;
  }, [logs]);

  const stripDays = useMemo(() => {
    const arr: string[] = [];
    for (let i = STRIP_DAYS - 1; i >= 0; i--) {
      const d = parseISO(date);
      d.setDate(d.getDate() - i);
      arr.push(toISODate(d));
    }
    return arr;
  }, [date]);

  // Hábitos agendados para o dia selecionado e não pulados
  const todaysHabits = habits.filter(
    (h) =>
      isScheduledOn(h.days_of_week, selected) &&
      !(statusByHabit.get(h.id)?.skipped.has(date) ?? false),
  );

  function optimisticSet(habitId: string, status: "done" | "skipped" | null) {
    setLogs((prev) => {
      const without = prev.filter(
        (l) => !(l.habit_id === habitId && l.log_date === date),
      );
      if (status === null) return without;
      return [
        ...without,
        { id: `tmp-${habitId}-${date}`, habit_id: habitId, log_date: date, status },
      ];
    });
  }

  async function toggleDone(habit: Habit) {
    const isDone = statusByHabit.get(habit.id)?.done.has(date) ?? false;
    optimisticSet(habit.id, isDone ? null : "done");
    try {
      if (isDone) await clearHabitLog(habit.id, date);
      else await setHabitStatus(habit.id, date, "done");
    } catch (e) {
      console.error("toggleDone falhou:", e);
    }
  }

  async function toggleDoneOnDay(habit: Habit, day: string) {
    const isDone = statusByHabit.get(habit.id)?.done.has(day) ?? false;
    setLogs((prev) => {
      const without = prev.filter(
        (l) => !(l.habit_id === habit.id && l.log_date === day),
      );
      return isDone
        ? without
        : [
            ...without,
            { id: `tmp-${habit.id}-${day}`, habit_id: habit.id, log_date: day, status: "done" as const },
          ];
    });
    try {
      if (isDone) await clearHabitLog(habit.id, day);
      else await setHabitStatus(habit.id, day, "done");
    } catch (e) {
      console.error("toggleDoneOnDay falhou:", e);
    }
  }

  async function skipToday(habit: Habit) {
    optimisticSet(habit.id, "skipped");
    try {
      await setHabitStatus(habit.id, date, "skipped");
    } catch (e) {
      console.error("skipToday falhou:", e);
    }
  }

  function openCreate() {
    setEditingId(null);
    setNewName("");
    setNewDays([]);
    setAdding(true);
  }

  function openEdit(habit: Habit) {
    setEditingId(habit.id);
    setNewName(habit.name);
    setNewDays(habit.days_of_week ?? []);
    setAdding(true);
  }

  function closeForm() {
    setAdding(false);
    setEditingId(null);
    setNewName("");
    setNewDays([]);
  }

  async function handleSave() {
    const name = newName.trim();
    if (!name) return;
    const days = newDays.length > 0 ? newDays : null;
    try {
      if (editingId) {
        const updated = await updateHabit(editingId, { name, days_of_week: days });
        setHabits((prev) => prev.map((h) => (h.id === editingId ? updated : h)));
      } else {
        const created = await createHabit({ name, days_of_week: days });
        setHabits((prev) => [...prev, created]);
      }
      closeForm();
    } catch (e) {
      alert("Erro ao salvar hábito: " + (e as Error).message);
    }
  }

  async function handleDelete(habit: Habit) {
    if (!confirm(`Remover o hábito "${habit.name}" de todos os dias?`)) return;
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
        <CustomButton size="sm" onClick={() => (adding ? closeForm() : openCreate())}>
          {adding ? "Fechar" : "+ Hábito"}
        </CustomButton>
      </div>

      {adding && (
        <div className="mb-4 rounded-xl border border-stone-200 bg-white p-3">
          <p className="mb-2 text-sm font-medium text-ink-soft">
            {editingId ? "Editar hábito" : "Novo hábito"}
          </p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do hábito (ex.: Treinar)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-stone-400"
          />
          <p className="mt-3 text-sm text-ink-soft">
            Repete em (vazio = todo dia):
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {WEEK.map((label, idx) => {
              const on = newDays.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() =>
                    setNewDays((prev) =>
                      on ? prev.filter((d) => d !== idx) : [...prev, idx],
                    )
                  }
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    on
                      ? "bg-ink text-paper"
                      : "border border-stone-300 text-ink-soft hover:bg-stone-100"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-end">
            <CustomButton size="sm" onClick={handleSave}>
              Salvar
            </CustomButton>
          </div>
        </div>
      )}

      {loading && <p className="text-ink-soft">Carregando…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && todaysHabits.length === 0 && !error && (
        <p className="text-ink-soft">
          Nenhum hábito para este dia. Crie um em “+ Hábito”.
        </p>
      )}

      <ul className="space-y-3">
        {todaysHabits.map((habit) => {
          const st = statusByHabit.get(habit.id);
          const doneSet = st?.done ?? new Set<string>();
          const streak = computeStreak(doneSet, selected);
          const doneToday = doneSet.has(date);
          return (
            <li
              key={habit.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-50"
            >
              <button
                onClick={() => toggleDone(habit)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition"
                style={{
                  borderColor: habit.color_hex,
                  backgroundColor: doneToday ? habit.color_hex : "transparent",
                  color: doneToday ? "#fff" : habit.color_hex,
                }}
                title={doneToday ? "Cumprido" : "Marcar"}
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
                <div className="mt-1.5 flex gap-1">
                  {stripDays.map((day) => {
                    const on = doneSet.has(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDoneOnDay(habit, day)}
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

              <div className="flex shrink-0 flex-col items-center gap-1">
                <button
                  onClick={() => skipToday(habit)}
                  className="text-xs text-stone-400 transition hover:text-amber-600"
                  title="Pular só neste dia"
                >
                  pular
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(habit)}
                    className="text-stone-300 transition hover:text-ink-soft"
                    title="Editar hábito"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(habit)}
                    className="text-stone-300 transition hover:text-red-500"
                    title="Excluir hábito"
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
