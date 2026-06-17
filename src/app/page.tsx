"use client";

/**
 * Dashboard "Hoje" — Minha Rotina (Prompt 5 + rework por-dia).
 * O dia selecionado no mini-calendário controla hábitos, água/refeições e
 * rotinas. Cada dia fica salvo; ao abrir um novo dia ele nasce limpo.
 */

import { useState } from "react";
import Link from "next/link";
import TodaySummary from "@/components/rotina/TodaySummary";
import MiniCalendar from "@/components/rotina/MiniCalendar";
import HabitTracker from "@/components/rotina/HabitTracker";
import WaterTracker from "@/components/rotina/WaterTracker";
import RoutineModal from "@/components/rotina/RoutineModal";
import { toISODate } from "@/lib/api";

const FMT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function HomePage() {
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const selectedDate = new Date(selected + "T00:00:00");
  const isToday = selected === toISODate(new Date());

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-hand text-5xl font-bold text-ink">Minha Rotina</h1>
          <p className="mt-1 capitalize text-ink-soft">
            {FMT.format(selectedDate)}
            {isToday && (
              <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium normal-case text-ink">
                hoje
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setSelected(toISODate(new Date()))}
              className="rounded-lg border border-stone-300 bg-paper px-3 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
            >
              Hoje
            </button>
          )}
          <Link
            href="/diario"
            className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
          >
            Diário →
          </Link>
          <Link
            href="/saude"
            className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
          >
            Saúde →
          </Link>
          <Link
            href="/pets"
            className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
          >
            Pets →
          </Link>
          <Link
            href="/financas"
            className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
          >
            Finanças →
          </Link>
          <Link
            href="/commonplace"
            className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
          >
            Commonplace →
          </Link>
        </div>
      </header>

      <TodaySummary date={selected} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <MiniCalendar selected={selected} onSelect={setSelected} />
          <WaterTracker date={selected} />
        </div>
        <div className="space-y-6">
          <HabitTracker date={selected} />
          <RoutineModal date={selected} />
        </div>
      </div>
    </main>
  );
}
