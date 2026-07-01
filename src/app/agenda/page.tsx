"use client";

/**
 * Agenda de compromissos — cadastra eventos com data (e hora opcional),
 * agrupados por mês. Marcar como feito, editar e excluir.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";
import { toISODate } from "@/lib/api";
import type { EventItem } from "@/lib/database.types";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const inputCls = "grimoire-input text-sm";

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}
function dayLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export default function AgendaPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ title: "", date: toISODate(new Date()), time: "", notes: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [ef, setEf] = useState({ title: "", date: "", time: "" });

  function reload() {
    return listEvents().then(setItems).catch(() => {});
  }
  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const todayISO = toISODate(new Date());

  async function add() {
    if (!f.title.trim() || !f.date) return;
    await createEvent({
      title: f.title.trim(),
      event_date: f.date,
      event_time: f.time || null,
      notes: f.notes || null,
    });
    setF({ title: "", date: toISODate(new Date()), time: "", notes: "" });
    await reload();
  }
  async function toggleDone(e: EventItem) {
    const done = !e.done;
    setItems((p) => p.map((x) => (x.id === e.id ? { ...x, done } : x)));
    await updateEvent(e.id, { done }).catch(() => {});
  }
  async function remove(id: string) {
    if (!confirm("Remover este compromisso?")) return;
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteEvent(id).catch(() => {});
  }
  function startEdit(e: EventItem) {
    setEditId(e.id);
    setEf({ title: e.title, date: e.event_date, time: e.event_time ?? "" });
  }
  async function saveEdit(e: EventItem) {
    await updateEvent(e.id, {
      title: ef.title.trim() || e.title,
      event_date: ef.date || e.event_date,
      event_time: ef.time || null,
    }).catch(() => {});
    setEditId(null);
    await reload();
  }

  // Agrupa por mês (YYYY-MM), mantendo a ordem já vinda do banco
  const groups = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of items) {
      const key = e.event_date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="page-title text-5xl font-bold">Agenda</h1>
        <Link
          href="/"
          className="rounded-lg border border-[var(--rule-line)] px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-shade/40"
        >
          ← Minha Rotina
        </Link>
      </header>

      {/* Novo compromisso */}
      <div className="grimoire-card mb-6">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto_auto]">
          <input className={inputCls} placeholder="Compromisso (ex.: Dentista)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <input className={inputCls} type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          <input className={inputCls} type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
          <button onClick={add} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">+ Marcar</button>
        </div>
        <input
          className={`${inputCls} mt-2 w-full`}
          placeholder="Observação (opcional)"
          value={f.notes}
          onChange={(e) => setF({ ...f, notes: e.target.value })}
        />
      </div>

      {loading && <p className="text-ink-soft">Carregando…</p>}
      {!loading && items.length === 0 && (
        <p className="text-ink-soft">Nenhum compromisso ainda. Marque o primeiro acima.</p>
      )}

      {/* Lista agrupada por mês */}
      <div className="space-y-6">
        {groups.map(([key, evs]) => (
          <section key={key}>
            <h2 className="mb-2 font-hand text-2xl text-ink">{monthLabel(key)}</h2>
            <ul className="space-y-2">
              {evs.map((e) =>
                editId === e.id ? (
                  <li key={e.id} className="grimoire-row px-4 py-3">
                    <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto_auto]">
                      <input className={inputCls} value={ef.title} onChange={(ev) => setEf({ ...ef, title: ev.target.value })} />
                      <input className={inputCls} type="date" value={ef.date} onChange={(ev) => setEf({ ...ef, date: ev.target.value })} />
                      <input className={inputCls} type="time" value={ef.time} onChange={(ev) => setEf({ ...ef, time: ev.target.value })} />
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(e)} className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-paper hover:opacity-90">Salvar</button>
                        <button onClick={() => setEditId(null)} className="rounded-lg border border-[var(--rule-line)] px-3 py-2 text-sm text-ink-soft hover:bg-paper-shade/40">Cancelar</button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    key={e.id}
                    className={`flex items-center gap-3 rounded-xl border bg-paper/50 px-4 py-3 shadow-sm ${
                      e.done ? "border-[var(--rule-line)]/40 opacity-60" : e.event_date < todayISO ? "border-[var(--rule-line)]/30 opacity-70" : "border-[var(--rule-line)]/60"
                    }`}
                  >
                    <button
                      onClick={() => toggleDone(e)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                        e.done ? "border-ink bg-ink text-paper" : "border-ink/50 text-transparent"
                      }`}
                      title={e.done ? "Feito" : "Marcar como feito"}
                    >
                      ✓
                    </button>
                    <div className="w-16 shrink-0 text-center">
                      <div className="font-hand text-xl leading-none text-ink">{dayLabel(e.event_date)}</div>
                      {e.event_time && <div className="text-xs text-ink-soft">{e.event_time.slice(0, 5)}</div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-ink ${e.done ? "line-through" : ""}`}>{e.title}</p>
                      {e.notes && <p className="truncate text-xs text-ink-soft">{e.notes}</p>}
                    </div>
                    <button onClick={() => startEdit(e)} className="text-ink-soft/50 transition hover:text-ink" title="Editar">✎</button>
                    <button onClick={() => remove(e.id)} className="text-ink-soft/50 transition hover:text-accent" title="Remover">×</button>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
