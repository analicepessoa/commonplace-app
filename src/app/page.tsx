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
import Doodle from "@/components/ui/Doodle";
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
          <h1 className="font-hand text-6xl font-bold text-ink mb-2">Minha Rotina</h1>
          <p className="mt-1 font-sans text-sm font-bold uppercase tracking-widest text-ink/70">
            {FMT.format(selectedDate)}
            {isToday && (
              <span className="ml-2 border-b border-accent text-accent">
                Hoje
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {!isToday && (
            <button
              onClick={() => setSelected(toISODate(new Date()))}
              className="text-ink font-bold font-sans uppercase text-sm border-b-2 border-ink hover:text-accent transition"
            >
              Ir para Hoje
            </button>
          )}
          <Link
            href="/diario"
            className="text-ink font-bold font-sans uppercase text-sm hover:text-accent transition"
          >
            Diário →
          </Link>
          <Link
            href="/saude"
            className="text-ink font-bold font-sans uppercase text-sm hover:text-accent transition"
          >
            Saúde →
          </Link>
          <Link
            href="/pets"
            className="text-ink font-bold font-sans uppercase text-sm hover:text-accent transition"
          >
            Pets →
          </Link>
          <Link
            href="/financas"
            className="text-ink font-bold font-sans uppercase text-sm hover:text-accent transition"
          >
            Finanças →
          </Link>
          <Link
            href="/commonplace"
            className="text-ink font-bold font-sans uppercase text-sm hover:text-accent transition"
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
