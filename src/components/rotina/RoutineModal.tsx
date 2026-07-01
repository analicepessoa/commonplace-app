"use client";

/**
 * RoutineModal — painel de rotinas fixas (ex.: Trabalho) + modal de criação.
 *
 * Ao informar horário de início e minutos de deslocamento, calcula
 * automaticamente o horário de saída (início − deslocamento).
 */

import { useEffect, useState } from "react";
import {
  listRoutines,
  createRoutine,
  deleteRoutine,
  computeLeaveTime,
  isScheduledOn,
} from "@/lib/api";
import type { Routine } from "@/lib/database.types";
import CustomButton from "@/components/ui/CustomButton";

const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function RoutineModal({ date }: { date: string }) {
  const selected = new Date(date + "T00:00:00");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [travel, setTravel] = useState(30);
  const [days, setDays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listRoutines()
      .then(setRoutines)
      .catch((e) => setError(e.message ?? String(e)));
  }, []);

  const todaysRoutines = routines.filter((r) =>
    isScheduledOn(r.days_of_week, selected),
  );

  const previewLeave = computeLeaveTime(startTime, travel);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const created = await createRoutine({
        title: title.trim(),
        location: location.trim() || null,
        start_time: startTime,
        travel_minutes: travel,
        days_of_week: days.length > 0 ? days : null,
      });
      setRoutines((prev) =>
        [...prev, created].sort((a, b) =>
          a.start_time.localeCompare(b.start_time),
        ),
      );
      setTitle("");
      setLocation("");
      setStartTime("09:00");
      setTravel(30);
      setDays([]);
      setOpen(false);
    } catch (e) {
      alert("Erro ao salvar rotina: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(r: Routine) {
    if (!confirm(`Remover a rotina "${r.title}"?`)) return;
    setRoutines((prev) => prev.filter((x) => x.id !== r.id));
    try {
      await deleteRoutine(r.id);
    } catch (e) {
      console.error("deleteRoutine falhou:", e);
    }
  }

  return (
    <section className="vintage-box">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="vintage-header">Rotinas fixas</h2>
        <button className="text-ink text-sm font-bold border-b border-ink/30 hover:border-ink transition font-sans" onClick={() => setOpen(true)}>
          + Nova
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {todaysRoutines.length === 0 && !error && (
        <p className="text-ink-soft">
          Sem rotinas para este dia. Crie uma (ex.: Trabalho) e veja o horário
          de saída.
        </p>
      )}

      <ul className="space-y-2">
        {todaysRoutines.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between border-b border-ink/20 py-2 group"
          >
            <div>
              <p className="font-hand text-2xl font-bold text-ink">{r.title}</p>
              {r.location && (
                <p className="text-sm text-ink-soft">{r.location}</p>
              )}
            </div>
            <div className="text-right text-sm font-bold font-sans">
              <p className="text-ink">
                Início <strong className="text-lg">{r.start_time.slice(0, 5)}</strong>
              </p>
              {r.travel_minutes > 0 && (
                <p className="text-ink/80 text-xs uppercase tracking-wider">
                  Sair <strong className="text-accent">{computeLeaveTime(r.start_time, r.travel_minutes)}</strong> ({r.travel_minutes} min)
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(r)}
              className="ml-3 text-ink/40 font-bold hover:text-accent transition"
              title="Remover"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="vintage-box w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="vintage-header">Nova rotina</h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink">Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Trabalho"
                  className="mt-1 w-full bg-transparent border-b-2 border-ink/30 px-2 py-1 outline-none focus:border-ink font-hand text-2xl font-bold text-ink placeholder:text-ink/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink">Local (opcional)</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex.: Centro"
                  className="mt-1 w-full bg-transparent border-b-2 border-ink/30 px-2 py-1 outline-none focus:border-ink font-hand text-2xl font-bold text-ink placeholder:text-ink/40"
                />
              </label>
              <div className="flex gap-3">
                <label className="flex-1">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink">Início</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full bg-transparent border-b-2 border-ink/30 px-2 py-1 outline-none focus:border-ink font-sans font-bold text-lg text-ink"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-ink">Deslocamento</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={travel}
                      onChange={(e) => setTravel(Number(e.target.value))}
                      className="w-full bg-transparent border-b-2 border-ink/30 px-2 py-1 outline-none focus:border-ink font-sans font-bold text-lg text-ink text-right"
                    />
                    <span className="text-sm text-ink font-bold">min</span>
                  </div>
                </label>
              </div>

              <div>
                <span className="text-sm text-ink-soft">
                  Repete em (vazio = todo dia):
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {WEEK.map((label, idx) => {
                    const on = days.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setDays((prev) =>
                            on ? prev.filter((d) => d !== idx) : [...prev, idx],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-sm transition ${
                          on
                            ? "bg-ink text-paper"
                            : "border border-[var(--rule-line)] text-ink-soft hover:bg-paper-shade/40"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border border-ink/20 bg-ink/5 p-3 text-center rounded-sm">
                <span className="text-sm text-ink font-bold font-sans">
                  Você deve sair às{" "}
                  <strong className="text-accent text-lg">{previewLeave}</strong> para chegar às {startTime}.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setOpen(false)}
                className="text-ink/60 font-bold font-sans uppercase text-sm border-b-2 border-transparent hover:border-ink/60 transition"
              >
                Cancelar
              </button>
              <button className="text-ink font-bold font-sans uppercase text-sm border-b-2 border-ink hover:text-accent transition" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
