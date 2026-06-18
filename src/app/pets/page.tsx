"use client";

/**
 * Pets (Fase 4) — cadastro de pets + tracks (remédios, vacinas, banhos, peso)
 * e fotos/momentos via mídia.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listPets,
  createPet,
  deletePet,
  listPetLogs,
  createPetLog,
  deletePetLog,
  petAge,
} from "@/lib/api";
import type { Pet, PetLog, PetLogKind } from "@/lib/database.types";
import MediaPanel from "@/components/ui/MediaPanel";

const KIND_LABEL: Record<PetLogKind, string> = {
  medicine: "Remédio",
  vaccine: "Vacina",
  bath: "Banho",
  weight: "Peso",
  note: "Nota",
};

const inputCls =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", breed: "", birth_date: "" });

  useEffect(() => {
    listPets()
      .then((p) => {
        setPets(p);
        if (p.length > 0) setSelectedId((cur) => cur ?? p[0].id);
      })
      .catch(() => {});
  }, []);

  async function addPet() {
    if (!form.name.trim()) return;
    const created = await createPet({
      name: form.name.trim(),
      breed: form.breed || null,
      birth_date: form.birth_date || null,
    });
    setPets((p) => [...p, created]);
    setSelectedId(created.id);
    setForm({ name: "", breed: "", birth_date: "" });
  }

  async function removePet(id: string) {
    if (!confirm("Remover este pet e todos os registros?")) return;
    setPets((p) => p.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
    await deletePet(id).catch(() => {});
  }

  const selected = pets.find((p) => p.id === selectedId) ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <h1 className="font-hand text-5xl font-bold text-ink">Pets</h1>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
        >
          ← Minha Rotina
        </Link>
      </header>

      {/* Adicionar pet */}
      <div className="mb-5 grid gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
        <input className={inputCls} placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Raça" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        <input className={inputCls} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
        <button onClick={addPet} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">+ Pet</button>
      </div>

      {/* Cards de pets */}
      <div className="mb-6 flex flex-wrap gap-2">
        {pets.length === 0 && <p className="text-sm text-stone-400">Nenhum pet cadastrado.</p>}
        {pets.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`rounded-2xl border px-4 py-2 text-left transition ${
              selectedId === p.id ? "border-ink bg-white shadow-sm" : "border-stone-200 bg-white/60 hover:bg-white"
            }`}
          >
            <p className="font-hand text-2xl text-ink">{p.name}</p>
            <p className="text-xs text-ink-soft">
              {[p.breed, petAge(p.birth_date)].filter(Boolean).join(" · ") || "—"}
            </p>
          </button>
        ))}
      </div>

      {selected && <PetDetail key={selected.id} pet={selected} onDelete={() => removePet(selected.id)} />}
    </main>
  );
}

function PetDetail({ pet, onDelete }: { pet: Pet; onDelete: () => void }) {
  const [logs, setLogs] = useState<PetLog[]>([]);
  const [f, setF] = useState<{ kind: PetLogKind; log_date: string; detail: string; value: string }>(
    { kind: "medicine", log_date: "", detail: "", value: "" },
  );

  useEffect(() => {
    listPetLogs(pet.id).then(setLogs).catch(() => {});
  }, [pet.id]);

  async function addLog() {
    const created = await createPetLog({
      pet_id: pet.id,
      kind: f.kind,
      log_date: f.log_date || undefined,
      detail: f.detail || null,
      value: f.kind === "weight" && f.value ? Number(f.value) : null,
    });
    setLogs((p) => [created, ...p]);
    setF({ kind: "medicine", log_date: "", detail: "", value: "" });
  }
  async function removeLog(id: string) {
    setLogs((p) => p.filter((x) => x.id !== id));
    await deletePetLog(id).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">
          {pet.name}{" "}
          <span className="text-lg text-ink-soft">
            {[pet.breed, petAge(pet.birth_date)].filter(Boolean).join(" · ")}
          </span>
        </h2>
        <button onClick={onDelete} className="text-sm text-stone-400 hover:text-red-500">remover pet</button>
      </div>

      {/* Tracks */}
      <section className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
        <h3 className="mb-3 font-hand text-2xl text-ink">Registros</h3>
        <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
          <select className={inputCls} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as PetLogKind })}>
            {(Object.keys(KIND_LABEL) as PetLogKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
          <input className={inputCls} type="date" value={f.log_date} onChange={(e) => setF({ ...f, log_date: e.target.value })} />
          {f.kind === "weight" ? (
            <input className={inputCls} type="number" step="0.1" placeholder="Peso (kg)" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          ) : (
            <input className={inputCls} placeholder="Detalhe (ex.: nome do remédio)" value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} />
          )}
          <button onClick={addLog} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">Adicionar</button>
        </div>
        <ul className="space-y-1.5">
          {logs.length === 0 && <li className="text-sm text-stone-400">Nenhum registro.</li>}
          {logs.map((l) => (
            <li key={l.id} className="group flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2">
              <span className="text-sm text-ink">
                <span className="mr-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-ink-soft">{KIND_LABEL[l.kind]}</span>
                {l.log_date}
                {l.kind === "weight" && l.value != null ? ` · ${l.value} kg` : l.detail ? ` · ${l.detail}` : ""}
              </span>
              <button onClick={() => removeLog(l.id)} className="text-stone-400 transition hover:text-red-500">×</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Fotos e momentos */}
      <section className="rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
        <MediaPanel ownerType="pet" ownerId={pet.id} label="Fotos & momentos" />
      </section>
    </div>
  );
}
