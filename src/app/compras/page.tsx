"use client";

/**
 * Compras — lista de compras por mês (marcar no mercado), uma lista rápida da
 * semana, notas/posts do mês e calculadoras flutuantes. Reaproveita as tabelas
 * do diário (diary_tasks/diary_notes) com period_key namespeado em `shop:` —
 * sincroniza pelo Supabase, sem migration nova.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { listNotes, setNote, monthKey } from "@/lib/api";
import NoteField from "@/components/diario/NoteField";
import TaskChecklist from "@/components/diario/TaskChecklist";
import MediaPanel from "@/components/ui/MediaPanel";
import CalculatorLayer from "@/components/ui/CalculatorLayer";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** UUID determinístico por mês para os anexos (owner_id é UUID). */
function monthMediaId(key: string) {
  return `c0117a55-aaaa-4aaa-8aaa-${key.replace("-", "")}000000`;
}

export default function ComprasPage() {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const key = monthKey(month);
  const shopKey = `shop:${key}`;
  const [fields, setFields] = useState<Record<string, string>>({});

  useEffect(() => {
    listNotes("monthly", shopKey)
      .then((notes) => {
        const map: Record<string, string> = {};
        for (const n of notes) map[n.field] = n.content ?? "";
        setFields(map);
      })
      .catch(() => setFields({}));
  }, [shopKey]);

  function update(field: string, v: string) {
    setFields((prev) => ({ ...prev, [field]: v }));
  }
  function save(field: string, v: string) {
    setNote("monthly", shopKey, field, v).catch((e) =>
      console.error("setNote falhou:", e),
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="page-title text-5xl font-bold">Compras</h1>
        <Link
          href="/"
          className="rounded-lg border border-[var(--rule-line)] px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-shade/40"
        >
          ← Minha Rotina
        </Link>
      </header>

      {/* Navegação de mês */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-paper-shade/40"
        >
          ‹
        </button>
        <h2 className="font-hand text-3xl text-ink">
          {MONTHS[month.getMonth()]} {month.getFullYear()}
        </h2>
        <button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="rounded-md px-2 py-1 text-ink-soft transition hover:bg-paper-shade/40"
        >
          ›
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista do mês */}
        <section className="grimoire-card">
          <h2 className="grimoire-header mb-3 text-base">🛒 Lista do mês</h2>
          <p className="mb-2 text-xs text-ink-soft/70">
            Adicione tudo que precisa e vá marcando no mercado.
          </p>
          <TaskChecklist scope="monthly" periodKey={shopKey} label="" />
        </section>

        {/* Lista da semana + notas */}
        <div className="space-y-6">
          <section className="grimoire-card">
            <h2 className="grimoire-header mb-3 text-base">📅 Para esta semana</h2>
            <TaskChecklist scope="monthly" periodKey={`${shopKey}:semana`} label="" />
          </section>

          <section className="grimoire-card space-y-3">
            <h2 className="grimoire-header text-base">📝 Notas &amp; ideias</h2>
            <NoteField
              label="Notas do mês"
              value={fields.notas ?? ""}
              onChange={(v) => update("notas", v)}
              onSave={(v) => save("notas", v)}
              rows={4}
            />
            <NoteField
              label="Lista de presentes / outros"
              value={fields.ideias ?? ""}
              onChange={(v) => update("ideias", v)}
              onSave={(v) => save("ideias", v)}
              rows={3}
            />
          </section>
        </div>
      </div>

      {/* Posts & fotos do mês */}
      <section className="grimoire-card mt-6">
        <MediaPanel
          ownerType="compras"
          ownerId={monthMediaId(key)}
          label="Posts & fotos do mês"
        />
      </section>

      {/* Calculadoras flutuantes */}
      <CalculatorLayer />
    </main>
  );
}
