/**
 * Dashboard "Hoje" — Minha Rotina (Prompt 5).
 * Mini-calendário, hábitos, água/refeições e rotinas fixas.
 */

import Link from "next/link";
import MiniCalendar from "@/components/rotina/MiniCalendar";
import HabitTracker from "@/components/rotina/HabitTracker";
import WaterTracker from "@/components/rotina/WaterTracker";
import RoutineModal from "@/components/rotina/RoutineModal";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-hand text-5xl font-bold text-ink">Minha Rotina</h1>
          <p className="mt-1 text-ink-soft">Seu dia, de um olhar só.</p>
        </div>
        <Link
          href="/commonplace"
          className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
        >
          Commonplace →
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <MiniCalendar />
          <WaterTracker />
        </div>
        <div className="space-y-6">
          <HabitTracker />
          <RoutineModal />
        </div>
      </div>
    </main>
  );
}
