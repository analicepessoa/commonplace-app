"use client";

/**
 * DailyView — visão Diário (print 6): mood, afirmação, prioridades, tarefas,
 * agenda horária 6h–21h e gratidão. Hábitos, hidratação e refeições do dia são
 * reaproveitados dos componentes da rotina (mesma fonte de dados por data).
 *
 * Estética grimoire/dark-academia: seções com cabeçalho Cinzel + ícone de tinta,
 * pautas terracotta e campos manuscritos (font-hand). Ver `globals.css`.
 */

import { useEffect, useState } from "react";
import { listNotes, setNote, toISODate } from "@/lib/api";
import NoteField from "./NoteField";
import TaskChecklist from "./TaskChecklist";
import HabitTracker from "@/components/rotina/HabitTracker";
import WaterTracker from "@/components/rotina/WaterTracker";

const MOODS = ["😀", "🙂", "😐", "🙁", "😢"];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6h..21h

/* ── Ícones de tinta (inline, herdam a cor accent via .grimoire-header svg) ── */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const FeatherIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.7" />
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

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
    <div className="space-y-6">
      {/* Seletor de dia */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded-lg border border-[var(--rule-line)] bg-paper/40 px-3 py-1.5 font-hand text-lg text-ink outline-none focus:border-accent"
        />
        <button
          onClick={() => setDay(toISODate(new Date()))}
          className="rounded-lg border border-ink-soft/50 px-3 py-1.5 font-hand text-lg text-ink-soft transition hover:bg-paper-shade/40 hover:text-ink"
        >
          Hoje
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-6">
          {/* Humor */}
          <section className="grimoire-card">
            <h2 className="grimoire-header text-base">
              <SunIcon /> Humor do dia
            </h2>
            <div className="mt-3 flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => pickMood(m)}
                  className={`rounded-full p-1 text-2xl transition ${
                    fields.mood === m
                      ? "scale-110 bg-paper-shade/60 ring-2 ring-accent"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          {/* Intenções */}
          <section className="grimoire-card space-y-4">
            <h2 className="grimoire-header text-base">
              <StarIcon /> Intenções
            </h2>
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
          </section>

          {/* Tarefas */}
          <section className="grimoire-card">
            <h2 className="grimoire-header mb-3 text-base">
              <MoonIcon /> Tarefas
            </h2>
            <TaskChecklist scope="daily" periodKey={day} label="" />
          </section>

          {/* Rituais do dia (hábitos + água) — cada tracker já é sua própria caixa */}
          <HabitTracker date={day} />
          <WaterTracker date={day} />

          {/* Pensamentos */}
          <section className="grimoire-card space-y-4">
            <h2 className="grimoire-header text-base">
              <FeatherIcon /> Pensamentos
            </h2>
            <NoteField
              label="Sobre o dia"
              value={fields.about ?? ""}
              onChange={(v) => update("about", v)}
              onSave={(v) => save("about", v)}
              rows={6}
            />
            <NoteField
              label="Hoje eu agradeço por"
              value={fields.gratitude ?? ""}
              onChange={(v) => update("gratitude", v)}
              onSave={(v) => save("gratitude", v)}
              rows={3}
            />
          </section>
        </div>

        {/* Coluna direita: agenda horária */}
        <div>
          <section className="grimoire-card">
            <h2 className="grimoire-header text-base">
              <ClockIcon /> Agenda do dia
            </h2>
            <div className="mt-3 space-y-0">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex items-center gap-2 border-b border-[var(--rule-line)]/40 last:border-0"
                >
                  <span className="w-10 shrink-0 text-right font-hand text-lg font-semibold text-accent">
                    {h}h
                  </span>
                  <input
                    value={fields[`hour-${h}`] ?? ""}
                    onChange={(e) => update(`hour-${h}`, e.target.value)}
                    onBlur={(e) => save(`hour-${h}`, e.target.value)}
                    className="flex-1 bg-transparent px-1 py-1.5 font-hand text-lg font-semibold text-ink outline-none placeholder:text-ink-soft/40"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
