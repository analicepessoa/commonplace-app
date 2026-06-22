"use client";

/**
 * Saúde (Fase 3) — sub-abas Consultas, Medicações e Calendário Menstrual.
 * Cada uma lista, adiciona e remove registros; painel de mídia ao final.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listAppointments,
  createAppointment,
  deleteAppointment,
  listMedications,
  createMedication,
  deleteMedication,
  listCycles,
  createCycle,
  deleteCycle,
} from "@/lib/api";
import type {
  HealthAppointment,
  HealthMedication,
  MenstrualCycle,
  MenstrualFlow,
} from "@/lib/database.types";
import MediaPanel from "@/components/ui/MediaPanel";

const SAUDE_MEDIA_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
type Tab = "consultas" | "medicacoes" | "menstrual";

const inputCls =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400";

export default function SaudePage() {
  const [tab, setTab] = useState<Tab>("consultas");
  const tabs: { id: Tab; label: string }[] = [
    { id: "consultas", label: "Consultas" },
    { id: "medicacoes", label: "Medicações" },
    { id: "menstrual", label: "Calendário Menstrual" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="page-title text-5xl font-bold">Saúde</h1>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-card px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
        >
          ← Minha Rotina
        </Link>
      </header>

      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-full border border-stone-200 bg-white/70 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-stone-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="relative rounded-2xl border border-stone-200 bg-card p-6 shadow-sm">
        <span className="washi-tape" style={{ top: -10, left: 32 }} aria-hidden />
        {tab === "consultas" && <ConsultasTab />}
        {tab === "medicacoes" && <MedicacoesTab />}
        {tab === "menstrual" && <MenstrualTab />}
      </section>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-card p-5 shadow-sm">
        <MediaPanel
          ownerType="saude"
          ownerId={SAUDE_MEDIA_ID}
          label="Exames & anexos"
        />
      </section>
    </main>
  );
}

function ConsultasTab() {
  const [items, setItems] = useState<HealthAppointment[]>([]);
  const [f, setF] = useState({ specialty: "", appt_date: "", appt_time: "", notes: "" });

  useEffect(() => {
    listAppointments().then(setItems).catch(() => {});
  }, []);

  async function add() {
    if (!f.specialty.trim()) return;
    const created = await createAppointment({
      specialty: f.specialty.trim(),
      appt_date: f.appt_date || null,
      appt_time: f.appt_time || null,
      notes: f.notes || null,
    });
    setItems((p) => [...p, created]);
    setF({ specialty: "", appt_date: "", appt_time: "", notes: "" });
  }
  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteAppointment(id).catch(() => {});
  }

  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <input className={inputCls} placeholder="Especialidade" value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })} />
        <input className={inputCls} type="date" value={f.appt_date} onChange={(e) => setF({ ...f, appt_date: e.target.value })} />
        <input className={inputCls} type="time" value={f.appt_time} onChange={(e) => setF({ ...f, appt_time: e.target.value })} />
        <button onClick={add} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">Adicionar</button>
      </div>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-stone-400">Nenhuma consulta.</li>}
        {items.map((a) => (
          <li key={a.id} className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-hand text-xl text-ink">{a.specialty}</p>
              <p className="text-sm text-ink-soft">
                {a.appt_date ?? "sem data"}{a.appt_time ? ` · ${a.appt_time.slice(0, 5)}` : ""}
              </p>
            </div>
            <button onClick={() => remove(a.id)} className="text-stone-400 transition hover:text-red-500">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MedicacoesTab() {
  const [items, setItems] = useState<HealthMedication[]>([]);
  const [f, setF] = useState({ name: "", dosage: "", purpose: "", schedule: "", start_date: "", end_date: "" });

  useEffect(() => {
    listMedications().then(setItems).catch(() => {});
  }, []);

  async function add() {
    if (!f.name.trim()) return;
    const created = await createMedication({
      name: f.name.trim(),
      dosage: f.dosage || null,
      purpose: f.purpose || null,
      schedule: f.schedule || null,
      start_date: f.start_date || null,
      end_date: f.end_date || null,
    });
    setItems((p) => [...p, created]);
    setF({ name: "", dosage: "", purpose: "", schedule: "", start_date: "", end_date: "" });
  }
  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteMedication(id).catch(() => {});
  }

  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <input className={inputCls} placeholder="Medicamento" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={inputCls} placeholder="Dosagem" value={f.dosage} onChange={(e) => setF({ ...f, dosage: e.target.value })} />
        <input className={inputCls} placeholder="Função" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} />
        <input className={inputCls} placeholder="Horário" value={f.schedule} onChange={(e) => setF({ ...f, schedule: e.target.value })} />
        <label className="text-xs text-ink-soft">Início<input className={`${inputCls} mt-1 w-full`} type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></label>
        <label className="text-xs text-ink-soft">Fim<input className={`${inputCls} mt-1 w-full`} type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} /></label>
      </div>
      <button onClick={add} className="mb-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">Adicionar medicação</button>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-stone-400">Nenhuma medicação.</li>}
        {items.map((m) => (
          <li key={m.id} className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-hand text-xl text-ink">{m.name} {m.dosage && <span className="text-base text-ink-soft">· {m.dosage}</span>}</p>
              <p className="text-sm text-ink-soft">{[m.purpose, m.schedule].filter(Boolean).join(" · ") || "—"}</p>
            </div>
            <button onClick={() => remove(m.id)} className="text-stone-400 transition hover:text-red-500">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenstrualTab() {
  const [items, setItems] = useState<MenstrualCycle[]>([]);
  const [f, setF] = useState<{ start_date: string; end_date: string; flow: MenstrualFlow | ""; notes: string }>({ start_date: "", end_date: "", flow: "", notes: "" });

  useEffect(() => {
    listCycles().then(setItems).catch(() => {});
  }, []);

  async function add() {
    if (!f.start_date) return;
    const created = await createCycle({
      start_date: f.start_date,
      end_date: f.end_date || null,
      flow: f.flow || null,
      notes: f.notes || null,
    });
    setItems((p) => [created, ...p]);
    setF({ start_date: "", end_date: "", flow: "", notes: "" });
  }
  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteCycle(id).catch(() => {});
  }

  return (
    <div>
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="text-xs text-ink-soft">Início<input className={`${inputCls} mt-1 w-full`} type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} /></label>
        <label className="text-xs text-ink-soft">Fim<input className={`${inputCls} mt-1 w-full`} type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} /></label>
        <label className="text-xs text-ink-soft">Fluxo
          <select className={`${inputCls} mt-1 w-full`} value={f.flow} onChange={(e) => setF({ ...f, flow: e.target.value as MenstrualFlow | "" })}>
            <option value="">—</option>
            <option value="leve">Leve</option>
            <option value="medio">Médio</option>
            <option value="intenso">Intenso</option>
          </select>
        </label>
        <button onClick={add} className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">Registrar</button>
      </div>
      <ul className="space-y-2">
        {items.length === 0 && <li className="text-sm text-stone-400">Nenhum ciclo registrado.</li>}
        {items.map((c) => (
          <li key={c.id} className="group flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-hand text-xl text-ink">{c.start_date}{c.end_date ? ` → ${c.end_date}` : ""}</p>
              {c.flow && <p className="text-sm capitalize text-ink-soft">fluxo {c.flow}</p>}
            </div>
            <button onClick={() => remove(c.id)} className="text-stone-400 transition hover:text-red-500">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
