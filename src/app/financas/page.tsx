"use client";

/**
 * Finanças (Fase 6, parte 1) — Controle Mensal, Metas (com foto/progresso) e
 * Gastos Futuros. OCR de comprovantes entra na parte 2.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  monthKey,
  toISODate,
} from "@/lib/api";
import type {
  Transaction,
  TransactionType,
  FinancialGoal,
  Budget,
} from "@/lib/database.types";
import MediaPanel from "@/components/ui/MediaPanel";
import ReceiptUploader from "@/components/financas/ReceiptUploader";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const inputCls =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400";
type Tab = "mensal" | "metas" | "futuros" | "comprovante" | "orcamentos";

export default function FinancasPage() {
  const [tab, setTab] = useState<Tab>("mensal");
  const tabs: { id: Tab; label: string }[] = [
    { id: "mensal", label: "Controle Mensal" },
    { id: "metas", label: "Metas" },
    { id: "futuros", label: "Gastos Futuros" },
    { id: "orcamentos", label: "Orçamentos" },
    { id: "comprovante", label: "Comprovante (OCR)" },
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="font-hand text-5xl font-bold text-ink">Finanças</h1>
        <Link href="/" className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100">
          ← Minha Rotina
        </Link>
      </header>
      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-full border border-stone-200 bg-white/70 p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-stone-100"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "mensal" && <MensalTab />}
      {tab === "metas" && <MetasTab />}
      {tab === "futuros" && <FuturosTab />}
      {tab === "orcamentos" && <OrcamentosTab />}
      {tab === "comprovante" && (
        <div className="rounded-2xl border border-stone-200 bg-paper p-6 shadow-sm">
          <ReceiptUploader />
        </div>
      )}
    </main>
  );
}

function OrcamentosTab() {
  const [items, setItems] = useState<Budget[]>([]);
  const [f, setF] = useState({ name: "", limit: "" });

  useEffect(() => {
    listBudgets().then(setItems).catch(() => {});
  }, []);

  async function add() {
    if (!f.name.trim()) return;
    const created = await createBudget({
      name: f.name.trim(),
      limit_amount: Number(f.limit) || 0,
    });
    setItems((p) => [...p, created]);
    setF({ name: "", limit: "" });
  }
  async function setSpent(b: Budget, spent: number) {
    setItems((p) => p.map((x) => (x.id === b.id ? { ...x, spent_amount: spent } : x)));
    await updateBudget(b.id, { spent_amount: spent }).catch(() => {});
  }
  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteBudget(id).catch(() => {});
  }

  return (
    <div>
      <div className="mb-5 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
        <input className={inputCls} placeholder="Categoria (ex.: Mercado)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Limite" value={f.limit} onChange={(e) => setF({ ...f, limit: e.target.value })} />
        <button onClick={add} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90">+ Orçamento</button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-stone-400">Nenhum orçamento.</p>}
        {items.map((b) => {
          const pct = b.limit_amount > 0 ? Math.min(100, (Number(b.spent_amount) / Number(b.limit_amount)) * 100) : 0;
          const over = Number(b.spent_amount) > Number(b.limit_amount);
          return (
            <div key={b.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-hand text-xl text-ink">{b.name}</span>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={Number(b.spent_amount)} onBlur={(e) => setSpent(b, Number(e.target.value))} className={`${inputCls} w-28`} />
                  <span className="text-sm text-ink-soft">/ {BRL.format(Number(b.limit_amount))}</span>
                  <button onClick={() => remove(b.id)} className="text-stone-300 hover:text-red-500">×</button>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: over ? "#dc2626" : "#16a34a" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MensalTab() {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [items, setItems] = useState<Transaction[]>([]);
  const [f, setF] = useState<{ title: string; amount: string; type: TransactionType; due_date: string }>(
    { title: "", amount: "", type: "expense", due_date: toISODate(new Date()) },
  );

  useEffect(() => { listTransactions().then(setItems).catch(() => {}); }, []);

  const key = monthKey(month);
  const monthItems = useMemo(
    () => items.filter((t) => (t.due_date ?? t.created_at.slice(0, 10)).slice(0, 7) === key),
    [items, key],
  );
  const totals = useMemo(() => {
    let income = 0, expense = 0, savings = 0;
    for (const t of monthItems) {
      if (t.type === "income") income += Number(t.amount);
      else if (t.type === "expense") expense += Number(t.amount);
      else savings += Number(t.amount);
    }
    return { income, expense, savings, balance: income - expense };
  }, [monthItems]);

  async function add() {
    if (!f.title.trim() || !f.amount) return;
    const created = await createTransaction({
      title: f.title.trim(), amount: Number(f.amount), type: f.type,
      due_date: f.due_date || null,
    });
    setItems((p) => [...p, created]);
    // pula para o mês do lançamento, pra ele aparecer na hora
    const eff = created.due_date ?? created.created_at.slice(0, 10);
    const d = new Date(eff + "T00:00:00");
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setF({ title: "", amount: "", type: f.type, due_date: toISODate(new Date()) });
  }
  async function togglePaid(t: Transaction) {
    const status = t.status === "paid" ? "pending" : "paid";
    setItems((p) => p.map((x) => (x.id === t.id ? { ...x, status } : x)));
    await updateTransaction(t.id, { status }).catch(() => {});
  }
  async function remove(id: string) {
    if (!confirm("Remover este lançamento?")) return;
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteTransaction(id).catch(() => {});
  }

  // edição inline
  const [editId, setEditId] = useState<string | null>(null);
  const [ef, setEf] = useState<{ title: string; amount: string; type: TransactionType; due_date: string }>(
    { title: "", amount: "", type: "expense", due_date: "" },
  );
  function startEdit(t: Transaction) {
    setEditId(t.id);
    setEf({ title: t.title, amount: String(t.amount), type: t.type, due_date: t.due_date ?? "" });
  }
  async function saveEdit(t: Transaction) {
    const patch = {
      title: ef.title.trim() || t.title,
      amount: Number(ef.amount),
      type: ef.type,
      due_date: ef.due_date || null,
    };
    setItems((p) => p.map((x) => (x.id === t.id ? { ...x, ...patch } : x)));
    setEditId(null);
    await updateTransaction(t.id, patch).catch((e) => console.error("edit tx:", e));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md px-2 py-1 text-ink-soft hover:bg-stone-100">‹</button>
        <h2 className="font-hand text-2xl text-ink">{MONTHS[month.getMonth()]} {month.getFullYear()}</h2>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-md px-2 py-1 text-ink-soft hover:bg-stone-100">›</button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Entradas" value={BRL.format(totals.income)} color="#16a34a" />
        <Stat label="Saídas" value={BRL.format(totals.expense)} color="#dc2626" />
        <Stat label="Guardado" value={BRL.format(totals.savings)} color="#2563eb" />
        <Stat label="Saldo" value={BRL.format(totals.balance)} color={totals.balance >= 0 ? "#16a34a" : "#dc2626"} />
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input className={inputCls} placeholder="Descrição" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input className={inputCls} type="number" step="0.01" placeholder="Valor" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as TransactionType })}>
          <option value="income">Entrada</option>
          <option value="expense">Saída</option>
          <option value="savings">Guardar</option>
        </select>
        <input className={inputCls} type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
        <button onClick={add} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90">+</button>
      </div>

      <ul className="space-y-2">
        {monthItems.length === 0 && (
          <li className="text-sm text-stone-400">
            Nada neste mês.
            {items.length > 0 && " Você tem lançamentos em outros meses — use as setas ‹ › acima."}
          </li>
        )}
        {monthItems.map((t) =>
          editId === t.id ? (
            <li key={t.id} className="rounded-xl border border-stone-300 bg-white px-4 py-3">
              <div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <input className={inputCls} value={ef.title} onChange={(e) => setEf({ ...ef, title: e.target.value })} />
                <input className={inputCls} type="number" step="0.01" value={ef.amount} onChange={(e) => setEf({ ...ef, amount: e.target.value })} />
                <select className={inputCls} value={ef.type} onChange={(e) => setEf({ ...ef, type: e.target.value as TransactionType })}>
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                  <option value="savings">Guardar</option>
                </select>
                <input className={inputCls} type="date" value={ef.due_date} onChange={(e) => setEf({ ...ef, due_date: e.target.value })} />
                <div className="flex gap-1">
                  <button onClick={() => saveEdit(t)} className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-paper hover:opacity-90">Salvar</button>
                  <button onClick={() => setEditId(null)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-ink-soft hover:bg-stone-100">Cancelar</button>
                </div>
              </div>
            </li>
          ) : (
            <li key={t.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => togglePaid(t)} title={t.status === "paid" ? "Pago" : "Pendente"}
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${t.status === "paid" ? "border-emerald-500 bg-emerald-500" : "border-stone-300"}`} />
                <div>
                  <p className="text-ink">{t.title}</p>
                  <p className="text-xs text-ink-soft">{t.due_date ?? "sem data"}{t.status === "pending" ? " · pendente" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: t.type === "income" ? "#16a34a" : t.type === "expense" ? "#dc2626" : "#2563eb" }} className="font-medium">
                  {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}{BRL.format(Number(t.amount))}
                </span>
                <button onClick={() => startEdit(t)} className="text-stone-400 transition hover:text-ink" title="Editar">✎</button>
                <button onClick={() => remove(t.id)} className="text-stone-400 transition hover:text-red-500" title="Remover">×</button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-0.5 text-lg font-semibold" style={{ color }}>{value}</p>
    </div>
  );
}

function MetasTab() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [f, setF] = useState({ title: "", target: "" });

  useEffect(() => { listGoals().then(setGoals).catch(() => {}); }, []);

  async function add() {
    if (!f.title.trim()) return;
    const created = await createGoal({ title: f.title.trim(), target_amount: Number(f.target) || 0 });
    setGoals((p) => [...p, created]);
    setF({ title: "", target: "" });
  }
  async function setSaved(g: FinancialGoal, saved: number) {
    setGoals((p) => p.map((x) => (x.id === g.id ? { ...x, saved_amount: saved } : x)));
    await updateGoal(g.id, { saved_amount: saved }).catch(() => {});
  }
  async function remove(id: string) {
    setGoals((p) => p.filter((x) => x.id !== id));
    await deleteGoal(id).catch(() => {});
  }

  return (
    <div>
      <div className="mb-5 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
        <input className={inputCls} placeholder="Meta (ex.: Viagem)" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Valor que preciso" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} />
        <button onClick={add} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90">+ Meta</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {goals.length === 0 && <p className="text-sm text-stone-400">Nenhuma meta ainda.</p>}
        {goals.map((g) => {
          const pct = g.target_amount > 0 ? Math.min(100, (Number(g.saved_amount) / Number(g.target_amount)) * 100) : 0;
          return (
            <div key={g.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-hand text-2xl text-ink">{g.title}</h3>
                <button onClick={() => remove(g.id)} className="text-stone-300 hover:text-red-500">×</button>
              </div>
              <MediaPanel ownerType="goal" ownerId={g.id} label="Foto" className="mb-3" />
              <div className="mb-1 flex justify-between text-sm text-ink-soft">
                <span>{BRL.format(Number(g.saved_amount))}</span>
                <span>de {BRL.format(Number(g.target_amount))}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-ink-soft">Já guardei:</span>
                <input type="number" defaultValue={Number(g.saved_amount)} onBlur={(e) => setSaved(g, Number(e.target.value))}
                  className={`${inputCls} w-32`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FuturosTab() {
  const [items, setItems] = useState<Transaction[]>([]);
  useEffect(() => { listTransactions().then(setItems).catch(() => {}); }, []);
  const today = new Date().toISOString().slice(0, 10);
  const future = items.filter((t) => t.due_date && t.due_date > today && t.status === "pending");
  return (
    <div>
      <p className="mb-4 text-sm text-ink-soft">Contas e gastos pendentes com vencimento futuro.</p>
      <ul className="space-y-2">
        {future.length === 0 && <li className="text-sm text-stone-400">Nenhum gasto futuro pendente.</li>}
        {future.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="text-ink">{t.title}</p>
              <p className="text-xs text-ink-soft">vence {t.due_date}</p>
            </div>
            <span className="font-medium text-red-600">{BRL.format(Number(t.amount))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
