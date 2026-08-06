"use client";

import { useMemo, useState } from "react";
import type { FitnessWorkoutSession } from "@/lib/database.types";
import { toISODate } from "@/lib/api";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Props {
  sessions: FitnessWorkoutSession[];
  onToggle: (date: string, existing?: FitnessWorkoutSession) => void | Promise<void>;
}

export default function FitnessCalendar({ sessions, onToggle }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toISODate(new Date());
  const byDate = useMemo(() => new Map(sessions.map((session) => [session.workout_date, session])), [sessions]);
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthCount = sessions.filter((session) => session.workout_date.startsWith(monthKey)).length;

  function move(direction: number) {
    setCursor(new Date(year, month + direction, 1));
  }

  return (
    <section className="grimoire-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule-line)]/50 pb-3">
        <div>
          <h2 className="grimoire-header border-0 pb-0">Calendário de treinos</h2>
          <p className="mt-1 text-xs text-ink-soft">{monthCount} {monthCount === 1 ? "treino" : "treinos"} neste mês</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => move(-1)} className="rounded-lg border border-[var(--rule-line)]/50 px-3 py-1.5 hover:bg-paper-shade/35" aria-label="Mês anterior">‹</button>
          <span className="min-w-36 text-center font-hand text-xl text-ink">{MONTHS[month]} {year}</span>
          <button onClick={() => move(1)} className="rounded-lg border border-[var(--rule-line)]/50 px-3 py-1.5 hover:bg-paper-shade/35" aria-label="Próximo mês">›</button>
        </div>
      </div>
      <p className="mb-3 text-xs text-ink-soft">Clique em um dia para marcar ou desmarcar um treino.</p>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="pb-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft">{day}</div>
        ))}
        {Array.from({ length: firstWeekday }).map((_, index) => <div key={`empty-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = toISODate(new Date(year, month, day));
          const session = byDate.get(date);
          return (
            <button
              key={date}
              onClick={() => onToggle(date, session)}
              className={`relative aspect-square rounded-lg border text-sm font-medium transition hover:-translate-y-0.5 ${
                session
                  ? "border-accent bg-accent text-paper shadow-sm"
                  : date === today
                    ? "border-accent/80 bg-paper-shade/25 text-ink"
                    : "border-[var(--rule-line)]/30 bg-paper/45 text-ink hover:border-accent/60"
              }`}
              aria-label={`${session ? "Desmarcar" : "Marcar"} treino em ${date}`}
            >
              {day}
              {session && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-paper" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
