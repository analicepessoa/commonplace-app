"use client";

/**
 * Pets (Fase 4) — cadastro de pets + tracks (remédios, vacinas, banhos, peso)
 * e fotos/momentos via mídia.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listPets,
  createPet,
  deletePet,
  listPetLogs,
  createPetLog,
  deletePetLog,
  listAttachments,
  COVER_CAPTION,
  petAge,
} from "@/lib/api";
import type { Attachment, Pet, PetLog, PetLogKind } from "@/lib/database.types";
import MediaPanel from "@/components/ui/MediaPanel";

const KIND_LABEL: Record<PetLogKind, string> = {
  medicine: "Remédio",
  vaccine: "Vacina",
  bath: "Banho",
  weight: "Peso",
  note: "Nota",
};

const inputCls = "grimoire-input text-sm";

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", breed: "", birth_date: "" });
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listPets()
      .then(async (p) => {
        setPets(p);
        if (p.length > 0) setSelectedId((cur) => cur ?? p[0].id);
        // carrega a 1ª foto de cada pet pra usar como "foto do crachá"
        const entries = await Promise.all(
          p.map(async (pet) => {
            try {
              const atts = await listAttachments("pet", pet.id);
              const cover = atts.find(
                (a) => a.kind === "image" && a.caption === COVER_CAPTION,
              );
              const img = cover ?? atts.find((a) => a.kind === "image");
              return [pet.id, img?.url ?? ""] as const;
            } catch {
              return [pet.id, ""] as const;
            }
          }),
        );
        setAvatars(Object.fromEntries(entries.filter(([, url]) => url)));
      })
      .catch(() => {});
  }, []);

  function selectPet(id: string) {
    setSelectedId(id);
    requestAnimationFrame(() =>
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function handleCoverChange(petId: string, att: Attachment | null) {
    setAvatars((prev) => ({ ...prev, [petId]: att?.url ?? "" }));
  }

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
        <h1 className="page-title text-5xl font-bold">Pets</h1>
        <Link
          href="/"
          className="rounded-lg border border-[var(--rule-line)] px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-shade/40"
        >
          ← Minha Rotina
        </Link>
      </header>

      {/* Adicionar pet */}
      <div className="mb-5 grid gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
        <input className={inputCls} placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Raça" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        <input className={inputCls} type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
        <button onClick={addPet} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">+ Pet</button>
      </div>

      {/* Crachás de pets (foto + nome) — clique abre o detalhe */}
      <div className="mb-6 flex flex-wrap gap-3">
        {pets.length === 0 && <p className="text-sm text-ink-soft/60">Nenhum pet cadastrado.</p>}
        {pets.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPet(p.id)}
            title={`Abrir ${p.name}`}
            className={`w-36 overflow-hidden rounded-xl border bg-paper/40 text-left shadow-sm transition hover:-translate-y-0.5 ${
              selectedId === p.id
                ? "border-accent ring-1 ring-accent"
                : "border-[var(--rule-line)]/50 hover:border-accent/60"
            }`}
          >
            <div className="flex h-28 w-full items-center justify-center overflow-hidden bg-paper-shade/40">
              {avatars[p.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatars[p.id]} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl opacity-50">🐾</span>
              )}
            </div>
            <div className="px-2 py-1.5">
              <p className="font-hand text-xl leading-tight text-ink">{p.name}</p>
              <p className="text-xs text-ink-soft">
                {[p.breed, petAge(p.birth_date)].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div ref={detailRef}>
        {selected && (
          <PetDetail
            key={selected.id}
            pet={selected}
            onDelete={() => removePet(selected.id)}
            onCoverChange={(att) => handleCoverChange(selected.id, att)}
          />
        )}
      </div>
    </main>
  );
}

function PetDetail({
  pet,
  onDelete,
  onCoverChange,
}: {
  pet: Pet;
  onDelete: () => void;
  onCoverChange?: (att: Attachment | null) => void;
}) {
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
        <button onClick={onDelete} className="text-sm text-ink-soft/50 hover:text-accent">remover pet</button>
      </div>

      {/* Tracks */}
      <section className="grimoire-card relative">
        <span className="washi-tape" style={{ top: -10, left: 32 }} aria-hidden />
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
          <button onClick={addLog} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90">Adicionar</button>
        </div>
        <ul className="space-y-1.5">
          {logs.length === 0 && <li className="text-sm text-ink-soft/60">Nenhum registro.</li>}
          {logs.map((l) => (
            <li key={l.id} className="group flex items-center justify-between grimoire-row px-3 py-2">
              <span className="text-sm text-ink">
                <span className="mr-2 rounded-full bg-paper-shade/50 px-2 py-0.5 text-xs font-medium text-ink-soft">{KIND_LABEL[l.kind]}</span>
                {l.log_date}
                {l.kind === "weight" && l.value != null ? ` · ${l.value} kg` : l.detail ? ` · ${l.detail}` : ""}
              </span>
              <button onClick={() => removeLog(l.id)} className="text-ink-soft/50 transition hover:text-accent">×</button>
            </li>
          ))}
        </ul>
      </section>

      {/* Fotos e momentos */}
      <section className="grimoire-card">
        <MediaPanel
          ownerType="pet"
          ownerId={pet.id}
          label="Fotos & momentos"
          coverMode
          onCoverChange={onCoverChange}
        />
        <p className="mt-2 text-xs text-ink-soft/70">
          Clique na ★ de uma foto para usá-la no crachá do pet.
        </p>
      </section>
    </div>
  );
}
