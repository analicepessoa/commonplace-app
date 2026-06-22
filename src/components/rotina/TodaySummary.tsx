"use client";

/**
 * TodaySummary — resumo do dia na home: humor, afirmação, lista de compras e
 * uma visão rápida (hábitos, água, tarefas) do dia selecionado. Lê das mesmas
 * fontes do Diário/Rotina (sem dados duplicados).
 */

import { useEffect, useState } from "react";
import {
  listNotes,
  setNote,
  listHabits,
  listHabitLogs,
  isScheduledOn,
  getOrCreateWater,
  listTasks,
} from "@/lib/api";
import NoteField from "@/components/diario/NoteField";

const MOODS = ["😀", "🙂", "😐", "🙁", "😢"];

export default function TodaySummary({ date }: { date: string }) {
  const d = new Date(date + "T00:00:00");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [habits, setHabits] = useState({ done: 0, total: 0 });
  const [water, setWater] = useState({ glasses: 0, goal: 8 });
  const [tasks, setTasks] = useState({ done: 0, total: 0 });

  useEffect(() => {
    listNotes("daily", date)
      .then((notes) => {
        const map: Record<string, string> = {};
        for (const n of notes) map[n.field] = n.content ?? "";
        setFields(map);
      })
      .catch(() => {});

    Promise.all([listHabits(), listHabitLogs(date, date)])
      .then(([hs, logs]) => {
        const scheduled = hs.filter((h) => isScheduledOn(h.days_of_week, d));
        const doneIds = new Set(
          logs.filter((l) => l.status === "done").map((l) => l.habit_id),
        );
        setHabits({
          total: scheduled.length,
          done: scheduled.filter((h) => doneIds.has(h.id)).length,
        });
      })
      .catch(() => {});

    getOrCreateWater(date)
      .then((w) => setWater({ glasses: w.glasses, goal: w.goal }))
      .catch(() => {});

    listTasks("daily", date)
      .then((ts) =>
        setTasks({ total: ts.length, done: ts.filter((t) => t.done).length }),
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function pickMood(emoji: string) {
    setFields((p) => ({ ...p, mood: emoji }));
    setNote("daily", date, "mood", emoji).catch(() => {});
  }

  return (
    <section className="relative mb-6 rounded-2xl border border-stone-200 bg-card p-5 shadow-sm">
      <span className="washi-tape" style={{ top: -10, left: 28 }} aria-hidden />
      <span
        className="pin absolute"
        style={{ top: -8, right: 18 }}
        aria-hidden
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Como estou me sentindo hoje?
            </span>
            <div className="mt-1 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => pickMood(m)}
                  className={`rounded-full p-1 text-2xl transition ${
                    fields.mood === m ? "scale-110 bg-amber-100" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <NoteField
            label="Afirmação do dia"
            value={fields.affirmation ?? ""}
            onChange={(v) => setFields((p) => ({ ...p, affirmation: v }))}
            onSave={(v) => setNote("daily", date, "affirmation", v).catch(() => {})}
            rows={2}
          />
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Mini label="Hábitos" value={`${habits.done}/${habits.total}`} />
            <Mini label="Água" value={`${water.glasses}/${water.goal}`} />
            <Mini label="Tarefas" value={`${tasks.done}/${tasks.total}`} />
          </div>
          <NoteField
            label="Lista de compras"
            value={fields.shopping ?? ""}
            onChange={(v) => setFields((p) => ({ ...p, shopping: v }))}
            onSave={(v) => setNote("daily", date, "shopping", v).catch(() => {})}
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
      <p className="text-lg font-semibold text-ink">{value}</p>
      <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}
