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
    <section className="vintage-box mb-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-ink font-sans border-b border-ink/20 pb-1 mb-2 inline-block">
              Humor & Inspiração
            </span>
            <div className="mt-1 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => pickMood(m)}
                  className={`rounded-full p-1 text-3xl transition ${
                    fields.mood === m ? "scale-110 drop-shadow-md" : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
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
          <div className="flex gap-6 mb-4">
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
    <div className="flex-1 border-b border-ink/20 pb-2">
      <p className="text-3xl font-hand font-bold text-ink">{value}</p>
      <p className="text-xs uppercase tracking-widest font-sans font-bold text-ink opacity-70">{label}</p>
    </div>
  );
}
