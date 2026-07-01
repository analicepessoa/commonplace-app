"use client";

/**
 * MonthlyView — visão Mensal do diário: calendário do mês + Notas + Metas +
 * Tarefas do mês (print 4 do planner).
 */

import { useEffect, useState } from "react";
import { listNotes, setNote, monthKey } from "@/lib/api";
import NoteField from "./NoteField";
import TaskChecklist from "./TaskChecklist";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export default function MonthlyView({ month }: { month: Date }) {
  const key = monthKey(month);
  const [fields, setFields] = useState<Record<string, string>>({
    notes: "",
    goals: "",
  });

  useEffect(() => {
    listNotes("monthly", key)
      .then((notes) => {
        const map: Record<string, string> = { notes: "", goals: "" };
        for (const n of notes) map[n.field] = n.content ?? "";
        setFields(map);
      })
      .catch(() => {});
  }, [key]);

  function update(field: string, v: string) {
    setFields((prev) => ({ ...prev, [field]: v }));
  }
  function save(field: string, v: string) {
    setNote("monthly", key, field, v).catch((e) =>
      console.error("setNote falhou:", e),
    );
  }

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendário */}
      <section className="grimoire-card lg:col-span-2">
        <h2 className="grimoire-header mb-3 text-base">Calendário</h2>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="pb-1 text-xs font-semibold tracking-wide text-ink-soft"
            >
              {w}
            </div>
          ))}
          {cells.map((d, i) => (
            <div
              key={i}
              className={
                d === null
                  ? ""
                  : "flex h-16 items-start justify-end rounded-lg border border-[var(--rule-line)]/40 bg-paper/40 p-1 text-sm text-ink"
              }
            >
              {d ?? ""}
            </div>
          ))}
        </div>
      </section>

      {/* Notas, Metas, Tarefas */}
      <section className="grimoire-card space-y-4">
        <NoteField
          label="Notas"
          value={fields.notes}
          onChange={(v) => update("notes", v)}
          onSave={(v) => save("notes", v)}
        />
        <NoteField
          label="Metas"
          value={fields.goals}
          onChange={(v) => update("goals", v)}
          onSave={(v) => save("goals", v)}
        />
        <TaskChecklist scope="monthly" periodKey={key} label="Tarefas do mês" />
      </section>
    </div>
  );
}
