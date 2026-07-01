"use client";

/**
 * Dashboard "Hoje" — Minha Rotina (Prompt 5 + rework por-dia).
 * O dia selecionado no mini-calendário controla hábitos, água/refeições e
 * rotinas. Cada dia fica salvo; ao abrir um novo dia ele nasce limpo.
 */

import { useState, type ReactNode } from "react";
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

/* ── Ícones de linha (sépia/accent), no estilo do app ── */
const svg = (children: ReactNode) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const IconAgenda = svg(
  <>
    <rect x="3" y="4.5" width="18" height="17" rx="2" />
    <path d="M8 2.5v4M16 2.5v4M3 9.5h18" />
    <path d="M7.5 14h3M13.5 14h3M7.5 17.5h3M13.5 17.5h3" />
  </>,
);
const IconDiario = svg(
  <>
    <path d="M12 6.5C10.3 5.2 7.6 4.6 5 4.6V18c2.6 0 5.3.6 7 1.9 1.7-1.3 4.4-1.9 7-1.9V4.6c-2.6 0-5.3.6-7 1.9Z" />
    <path d="M12 6.5v13.4" />
  </>,
);
const IconSaude = svg(
  <path d="M12 20.5S3.5 15.6 3.5 9.6C3.5 6.9 5.6 5 8 5c1.7 0 3.1 1 4 2.3C12.9 6 14.3 5 16 5c2.4 0 4.5 1.9 4.5 4.6 0 6-8.5 10.9-8.5 10.9Z" />,
);
const IconPets = svg(
  <>
    <ellipse cx="6" cy="11" rx="1.7" ry="2.2" fill="currentColor" stroke="none" />
    <ellipse cx="9.7" cy="7.7" rx="1.7" ry="2.3" fill="currentColor" stroke="none" />
    <ellipse cx="14.3" cy="7.7" rx="1.7" ry="2.3" fill="currentColor" stroke="none" />
    <ellipse cx="18" cy="11" rx="1.7" ry="2.2" fill="currentColor" stroke="none" />
    <path d="M12 12.8c-2.6 0-4.7 2-4.7 4.2 0 1.6 1.3 2.5 3 2.5.9 0 1.3-.3 1.7-.3s.8.3 1.7.3c1.7 0 3-.9 3-2.5 0-2.2-2.1-4.2-4.7-4.2Z" fill="currentColor" stroke="none" />
  </>,
);
const IconFinancas = svg(
  <>
    <circle cx="12" cy="8.5" r="5.5" />
    <path d="M12 5.6v5.8M13.7 6.7a1.9 1.9 0 0 0-1.7-1c-1.1 0-1.9.7-1.9 1.5 0 2 3.6 1.1 3.6 3.1 0 .8-.9 1.5-1.9 1.5a1.9 1.9 0 0 1-1.7-1" />
    <path d="M6.5 14.2v3.3c0 1.5 2.5 2.5 5.5 2.5s5.5-1 5.5-2.5v-3.3" />
  </>,
);
const IconCompras = svg(
  <>
    <path d="M3 3.5h2l2.3 11.4a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7.5H6" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </>,
);
const IconCommonplace = svg(
  <>
    <rect x="4" y="15.3" width="16" height="4.2" rx="1" />
    <rect x="5.4" y="11.1" width="13.2" height="4.2" rx="1" />
    <rect x="4.6" y="6.9" width="14.8" height="4.2" rx="1" />
  </>,
);

const SECTIONS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/agenda", label: "Agenda", icon: IconAgenda },
  { href: "/diario", label: "Diário", icon: IconDiario },
  { href: "/saude", label: "Saúde", icon: IconSaude },
  { href: "/pets", label: "Pets", icon: IconPets },
  { href: "/financas", label: "Finanças", icon: IconFinancas },
  { href: "/compras", label: "Compras", icon: IconCompras },
  { href: "/commonplace", label: "Commonplace", icon: IconCommonplace },
];

export default function HomePage() {
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const selectedDate = new Date(selected + "T00:00:00");
  const isToday = selected === toISODate(new Date());

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
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
        {!isToday && (
          <button
            onClick={() => setSelected(toISODate(new Date()))}
            className="text-ink font-bold font-sans uppercase text-sm border-b-2 border-ink hover:text-accent transition"
          >
            Ir para Hoje
          </button>
        )}
      </header>

      {/* Navegação por seção — cartões com ícone */}
      <nav className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--rule-line)]/60 bg-paper/50 px-2 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:bg-paper-shade/30"
          >
            <span className="text-accent transition group-hover:scale-110">{s.icon}</span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wide text-ink">
              {s.label}
            </span>
          </Link>
        ))}
      </nav>

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
