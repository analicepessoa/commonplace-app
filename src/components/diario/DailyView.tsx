"use client";

/**
 * DailyView — visão Diário (print 6): mood, afirmação, prioridades, tarefas,
 * agenda horária 6h–21h e gratidão. Hábitos, hidratação e refeições do dia são
 * reaproveitados dos componentes da rotina (mesma fonte de dados por data).
 */

import { useEffect, useState } from "react";
import { listNotes, setNote, toISODate } from "@/lib/api";
import NoteField from "./NoteField";
import TaskChecklist from "./TaskChecklist";
import HabitTracker from "@/components/rotina/HabitTracker";
import WaterTracker from "@/components/rotina/WaterTracker";

const MOODS = ["😀", "🙂", "😐", "🙁", "😢"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6h..21h

export default function DailyView({ initialDay }: { initialDay?: string }) {
  const [day, setDay] = useState(initialDay ?? toISODate(new Date()));
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    listNotes("daily", day)
      .then((notes) => {
        const map: Record<string, string> = {};
        for (const n of notes) map[n.field] = n.content ?? "";
        setFields(map);
      })
      .catch(() => setFields({}));
  }, [day]);

  function update(field: string, v: string) {
    setFields((prev) => ({ ...prev, [field]: v }));
  }
  function save(field: string, v: string) {
    setNote("daily", day, field, v).catch((e) =>
      console.error("setNote falhou:", e),
    );
  }
  function pickMood(emoji: string) {
    update("mood", emoji);
    save("mood", emoji);
  }

  return (
    <div className="space-y-5">
      {/* Seletor de dia */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-stone-400"
        />
        <button
          onClick={() => setDay(toISODate(new Date()))}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-ink-soft transition hover:bg-stone-100"
        >
          Hoje
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-4">
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
                    fields.mood === m
                      ? "scale-110 bg-amber-100"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <NoteField
            label="Afirmação"
            value={fields.affirmation ?? ""}
            onChange={(v) => update("affirmation", v)}
            onSave={(v) => save("affirmation", v)}
            rows={2}
          />
          <NoteField
            label="Prioridades"
            value={fields.priorities ?? ""}
            onChange={(v) => update("priorities", v)}
            onSave={(v) => save("priorities", v)}
            rows={3}
          />
          <TaskChecklist scope="daily" periodKey={day} label="Tarefas" />

          <HabitTracker date={day} />
          <WaterTracker date={day} />

          <NoteField
            label="Hoje eu agradeço por"
            value={fields.gratitude ?? ""}
            onChange={(v) => update("gratitude", v)}
            onSave={(v) => save("gratitude", v)}
            rows={3}
          />
        </div>

        {/* Coluna direita: agenda horária */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Agenda
          </span>
          <div className="mt-1 space-y-1">
            {HOURS.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-right text-sm font-medium text-ink-soft">
                  {h}h
                </span>
                <input
                  value={fields[`hour-${h}`] ?? ""}
                  onChange={(e) => update(`hour-${h}`, e.target.value)}
                  onBlur={(e) => save(`hour-${h}`, e.target.value)}
                  className="flex-1 border-b border-stone-200 bg-transparent px-1 py-1 text-sm text-ink outline-none focus:border-stone-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
