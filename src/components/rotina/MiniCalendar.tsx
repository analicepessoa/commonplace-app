"use client";

/**
 * MiniCalendar — calendário mensal compacto, com o dia de hoje destacado.
 */

import { useState } from "react";

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

export default function MiniCalendar() {
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d: number) =>
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="rounded-2xl border border-stone-200 bg-paper p-4 shadow-sm">
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
        {cells.map((d, i) => (
          <div
            key={i}
            className={
              d === null
                ? ""
                : isToday(d)
                  ? "mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-ink font-medium text-paper"
                  : "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm text-ink transition hover:bg-stone-100"
            }
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
