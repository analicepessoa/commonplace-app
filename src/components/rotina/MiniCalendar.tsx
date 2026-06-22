"use client";

/**
 * MiniCalendar — calendário mensal controlado: destaca o dia selecionado e o
 * dia de hoje, e avisa o pai quando um dia é escolhido.
 */

import { useState } from "react";
import { toISODate } from "@/lib/api";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MiniCalendarProps {
  selected: string; // YYYY-MM-DD
  onSelect: (iso: string) => void;
}

export default function MiniCalendar({ selected, onSelect }: MiniCalendarProps) {
  const today = new Date();
  const selDate = new Date(selected + "T00:00:00");
  const [view, setView] = useState(
    new Date(selDate.getFullYear(), selDate.getMonth(), 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const sameDay = (d: number, ref: Date) =>
    d === ref.getDate() &&
    month === ref.getMonth() &&
    year === ref.getFullYear();

  return (
    <div className="rounded-2xl border border-stone-200 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-stone-100"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="font-hand text-2xl text-ink">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-stone-100"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-xs font-medium text-ink-soft">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const isSel = sameDay(d, selDate);
          const isToday = sameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => onSelect(toISODate(new Date(year, month, d)))}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition ${
                isSel
                  ? "bg-ink font-medium text-paper"
                  : isToday
                    ? "text-ink ring-2 ring-ink/40 hover:bg-stone-100"
                    : "text-ink hover:bg-stone-100"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
