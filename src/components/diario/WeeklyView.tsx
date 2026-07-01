"use client";

/**
 * WeeklyView — visão Semanal do diário (print 5): caixas por dia (Seg–Dom),
 * Prioridades, Tarefas Semanais e Anotações. Seletor de semana S1–S5.
 */

import { useEffect, useState } from "react";
import { listNotes, setNote, monthKey } from "@/lib/api";
import NoteField from "./NoteField";
import TaskChecklist from "./TaskChecklist";

const DAYS: { field: string; label: string }[] = [
  { field: "seg", label: "Segunda" },
  { field: "ter", label: "Terça" },
  { field: "qua", label: "Quarta" },
  { field: "qui", label: "Quinta" },
  { field: "sex", label: "Sexta" },
  { field: "sab", label: "Sábado" },
  { field: "dom", label: "Domingo" },
];

export default function WeeklyView({ month }: { month: Date }) {
  const [week, setWeek] = useState(1);
  const key = `${monthKey(month)}-S${week}`;
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    listNotes("weekly", key)
      .then((notes) => {
        const map: Record<string, string> = {};
        for (const n of notes) map[n.field] = n.content ?? "";
        setFields(map);
      })
      .catch(() => setFields({}));
  }, [key]);

  function update(field: string, v: string) {
    setFields((prev) => ({ ...prev, [field]: v }));
  }
  function save(field: string, v: string) {
    setNote("weekly", key, field, v).catch((e) =>
      console.error("setNote falhou:", e),
    );
  }

  return (
    <div>
      {/* Seletor de semana */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-sm text-ink-soft">Semana:</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setWeek(n)}
            className={`h-8 w-8 rounded-full text-sm font-medium transition ${
              week === n
                ? "bg-ink text-paper"
                : "border border-[var(--rule-line)] text-ink-soft hover:bg-paper-shade/40"
            }`}
          >
            S{n}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dias da semana */}
        <section className="grimoire-card space-y-3">
          <h2 className="grimoire-header mb-1 text-base">Semana</h2>
          {DAYS.map((d) => (
            <NoteField
              key={d.field}
              label={d.label}
              value={fields[d.field] ?? ""}
              onChange={(v) => update(d.field, v)}
              onSave={(v) => save(d.field, v)}
              rows={2}
            />
          ))}
        </section>

        {/* Prioridades, Tarefas, Anotações */}
        <section className="grimoire-card space-y-4">
          <NoteField
            label="Prioridades"
            value={fields.priorities ?? ""}
            onChange={(v) => update("priorities", v)}
            onSave={(v) => save("priorities", v)}
            rows={4}
          />
          <TaskChecklist scope="weekly" periodKey={key} label="Tarefas semanais" />
          <NoteField
            label="Anotações"
            value={fields.anotacoes ?? ""}
            onChange={(v) => update("anotacoes", v)}
            onSave={(v) => save("anotacoes", v)}
            rows={4}
          />
        </section>
      </div>
    </div>
  );
}
