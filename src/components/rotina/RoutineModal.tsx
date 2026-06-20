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
    <section className="relative rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
      <span className="pin absolute" style={{ top: -8, right: 18 }} aria-hidden />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-hand text-3xl text-ink">Rotinas fixas</h2>
        <CustomButton size="sm" onClick={() => setOpen(true)}>
          + Rotina
        </CustomButton>
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
            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-hand text-xl text-ink">{r.title}</p>
              {r.location && (
                <p className="text-sm text-ink-soft">{r.location}</p>
              )}
            </div>
            <div className="text-right text-sm">
              <p className="text-ink">
                Início <strong>{r.start_time.slice(0, 5)}</strong>
              </p>
              {r.travel_minutes > 0 && (
                <p className="text-ink-soft">
                  Sair{" "}
                  <strong className="text-amber-700">
                    {computeLeaveTime(r.start_time, r.travel_minutes)}
                  </strong>{" "}
                  ({r.travel_minutes} min)
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(r)}
              className="ml-3 text-stone-300 transition hover:text-red-500"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="paper-dotted w-full max-w-md rounded-2xl border border-stone-200 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 font-hand text-3xl text-ink">Nova rotina</h3>

            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-ink-soft">Título</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Trabalho"
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-ink-soft">Local (opcional)</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex.: Centro"
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-400"
                />
              </label>
              <div className="flex gap-3">
                <label className="flex-1">
                  <span className="text-sm text-ink-soft">Início</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-400"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-sm text-ink-soft">Deslocamento</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={travel}
                      onChange={(e) => setTravel(Number(e.target.value))}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-stone-400"
                    />
                    <span className="text-sm text-ink-soft">min</span>
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
                            : "border border-stone-300 text-ink-soft hover:bg-stone-100"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-amber-100 px-4 py-3 text-center">
                <span className="text-sm text-amber-900">
                  Você deve sair às{" "}
                  <strong className="text-lg">{previewLeave}</strong> para
                  chegar às {startTime}.
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-ink-soft transition hover:bg-stone-100"
              >
                Cancelar
              </button>
              <CustomButton size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
