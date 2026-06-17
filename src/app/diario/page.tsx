"use client";

/**
 * Diário — visões Mensal / Semanal / Diário por mês (Fase 2).
 * Mensal já funcional; Semanal e Diário entram nas próximas etapas.
 */

import { useState } from "react";
import Link from "next/link";
import MonthlyView from "@/components/diario/MonthlyView";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type View = "monthly" | "weekly" | "daily";

export default function DiarioPage() {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [view, setView] = useState<View>("monthly");

  const tabs: { id: View; label: string }[] = [
    { id: "monthly", label: "Mensal" },
    { id: "weekly", label: "Semanal" },
    { id: "daily", label: "Diário" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="font-hand text-5xl font-bold text-ink">Diário</h1>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
        >
          ← Minha Rotina
        </Link>
      </header>

      {/* Toggle de visão */}
      <div className="mb-5 inline-flex rounded-full border border-stone-200 bg-white/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === t.id
                ? "bg-ink text-paper"
                : "text-ink-soft hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Navegação de mês */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-stone-100"
        >
          ‹
        </button>
        <h2 className="font-hand text-3xl text-ink">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </h2>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-stone-100"
        >
          ›
        </button>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-paper p-6 shadow-sm">
        {view === "monthly" && <MonthlyView month={month} />}
        {view === "weekly" && (
          <p className="py-10 text-center text-ink-soft">
            Visão <strong>Semanal</strong> — em construção (próxima etapa).
          </p>
        )}
        {view === "daily" && (
          <p className="py-10 text-center text-ink-soft">
            Visão <strong>Diário</strong> — em construção (próxima etapa).
          </p>
        )}
      </section>
    </main>
  );
}
