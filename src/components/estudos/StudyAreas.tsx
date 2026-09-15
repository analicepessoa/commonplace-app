"use client";

import { useMemo, useState } from "react";
import type {
  StudyArea,
  StudyContent,
  StudyPriority,
  StudyTask,
} from "@/lib/database.types";
import { PRIORITY_LABELS, formatMinutes } from "@/lib/studies";

export interface StudyAreaFormValues {
  name: string;
  icon: string;
  category: string;
  objective: string;
  priority: StudyPriority;
  active: boolean;
}

interface Props {
  areas: StudyArea[];
  contents: StudyContent[];
  tasks: StudyTask[];
  loading: boolean;
  onSaveArea: (values: StudyAreaFormValues, area?: StudyArea) => Promise<void>;
  onToggleArea: (area: StudyArea) => Promise<void>;
  onDeleteArea: (area: StudyArea) => Promise<void>;
  onAddContent: (areaId: string, title: string) => Promise<void>;
  onDeleteContent: (content: StudyContent) => Promise<void>;
  onNewStudy: (areaId: string) => void;
}

function AreaForm({
  area,
  onSave,
  onClose,
}: {
  area?: StudyArea;
  onSave: (values: StudyAreaFormValues, area?: StudyArea) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<StudyAreaFormValues>({
    name: area?.name ?? "",
    icon: area?.icon ?? "📚",
    category: area?.category ?? "",
    objective: area?.objective ?? "",
    priority: area?.priority ?? "important",
    active: area?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!values.name.trim()) {
      setError("Dê um nome para a área de estudo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(values, area);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar a área.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-5">
      <section className="w-full rounded-t-2xl border border-[var(--margin-line)]/50 bg-[#f8f0de] p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-7" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between border-b border-[var(--rule-line)]/60 pb-3">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Organização</p>
            <h2 className="font-hand text-4xl font-bold text-ink">{area ? "Editar área" : "Nova área"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-ink/30 px-3 py-1 text-xl text-ink">×</button>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase text-ink">
            Emoji
            <input
              className="grimoire-input text-center text-2xl"
              value={values.icon}
              maxLength={8}
              onChange={(event) => setValues({ ...values, icon: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase text-ink">
            Nome <span className="text-accent">*</span>
            <input
              className="grimoire-input font-sans text-sm font-normal normal-case"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              autoFocus
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 font-sans text-xs font-bold uppercase text-ink">
            Categoria
            <input
              className="grimoire-input font-sans text-sm font-normal normal-case"
              value={values.category}
              onChange={(event) => setValues({ ...values, category: event.target.value })}
              placeholder="Ex.: Formação, carreira, idioma..."
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 font-sans text-xs font-bold uppercase text-ink">
            Objetivo
            <textarea
              className="grimoire-input min-h-20 resize-y font-sans text-sm font-normal normal-case"
              value={values.objective}
              onChange={(event) => setValues({ ...values, objective: event.target.value })}
              placeholder="O que você pretende alcançar nesta área?"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-1.5 font-sans text-xs font-bold uppercase text-ink">
            Prioridade
            <select
              className="grimoire-input font-sans text-sm font-normal normal-case"
              value={values.priority}
              onChange={(event) => setValues({ ...values, priority: event.target.value as StudyPriority })}
            >
              <option value="essential">Essencial</option>
              <option value="important">Importante</option>
              <option value="optional">Opcional</option>
            </select>
          </label>
          <label className="col-span-2 flex items-center gap-2 font-sans text-xs font-bold uppercase text-ink">
            <input
              type="checkbox"
              className="grimoire-checkbox"
              checked={values.active}
              onChange={(event) => setValues({ ...values, active: event.target.checked })}
            />
            Área ativa
          </label>
        </div>
        {error && <p className="mt-4 rounded-lg bg-accent/10 p-2 font-sans text-sm text-accent">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-ink/30 px-4 py-2 font-sans text-xs font-bold uppercase text-ink">Cancelar</button>
          <button type="button" disabled={saving} onClick={submit} className="rounded-lg bg-accent px-5 py-2 font-sans text-xs font-bold uppercase text-white disabled:opacity-40">
            {saving ? "Salvando..." : "Salvar área"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function StudyAreas({
  areas,
  contents,
  tasks,
  loading,
  onSaveArea,
  onToggleArea,
  onDeleteArea,
  onAddContent,
  onDeleteContent,
  onNewStudy,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [areaForm, setAreaForm] = useState<StudyArea | "new" | null>(null);
  const [contentTitle, setContentTitle] = useState("");
  const [contentBusy, setContentBusy] = useState(false);

  const effectiveSelectedId = selectedId && areas.some((area) => area.id === selectedId)
    ? selectedId
    : areas[0]?.id ?? null;
  const selectedArea = areas.find((area) => area.id === effectiveSelectedId);
  const selectedContents = contents.filter((content) => content.area_id === effectiveSelectedId);
  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.area_id === effectiveSelectedId && task.status !== "cancelled"),
    [effectiveSelectedId, tasks],
  );
  const nextTask = selectedTasks.find((task) => task.status !== "completed");
  const completedCount = selectedTasks.filter((task) => task.status === "completed").length;
  const progress = selectedTasks.length ? Math.round((completedCount / selectedTasks.length) * 100) : 0;
  const plannedMinutes = selectedTasks.reduce((sum, task) => sum + task.estimated_minutes, 0);

  async function addContent() {
    if (!effectiveSelectedId || !contentTitle.trim()) return;
    setContentBusy(true);
    try {
      await onAddContent(effectiveSelectedId, contentTitle.trim());
      setContentTitle("");
    } finally {
      setContentBusy(false);
    }
  }

  if (loading) {
    return <div className="grimoire-card py-12 text-center font-hand text-2xl text-ink-soft">Organizando as áreas...</div>;
  }

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-hand text-4xl font-bold text-ink">Áreas de estudo</h2>
          <p className="font-sans text-xs text-ink-soft">Separe seus objetivos sem misturar os estudos.</p>
        </div>
        <button type="button" onClick={() => setAreaForm("new")} className="rounded-lg bg-accent px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide text-white shadow-sm">
          + Nova área
        </button>
      </div>

      {areas.length === 0 ? (
        <button type="button" onClick={() => setAreaForm("new")} className="grimoire-card w-full py-12 text-center">
          <span className="block text-4xl">📚</span>
          <span className="mt-2 block font-hand text-3xl font-bold text-ink">Crie sua primeira área</span>
          <span className="font-sans text-xs text-ink-soft">Faculdade, concurso, idiomas ou qualquer outro objetivo.</span>
        </button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {areas.map((area) => {
            const areaTasks = tasks.filter((task) => task.area_id === area.id && task.status !== "cancelled");
            const done = areaTasks.filter((task) => task.status === "completed").length;
            const areaProgress = areaTasks.length ? Math.round((done / areaTasks.length) * 100) : 0;
            return (
              <button
                type="button"
                key={area.id}
                onClick={() => setSelectedId(area.id)}
                className={`grimoire-card text-left transition hover:-translate-y-0.5 hover:border-accent ${effectiveSelectedId === area.id ? "ring-2 ring-accent/50" : ""} ${area.active ? "" : "opacity-55"}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="text-3xl">{area.icon}</span>
                  <span className="rounded-full border border-ink/20 px-2 py-0.5 font-sans text-[8px] font-bold uppercase text-ink-soft">{PRIORITY_LABELS[area.priority]}</span>
                </div>
                <h3 className="font-hand text-2xl font-bold leading-tight text-ink">{area.name}</h3>
                <p className="mt-1 min-h-4 font-sans text-[10px] uppercase tracking-wide text-ink-soft">{area.category || "Sem categoria"}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-shade/50">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${areaProgress}%` }} />
                </div>
                <p className="mt-1 font-sans text-[9px] font-bold uppercase text-ink-soft">{areaProgress}% nesta semana</p>
              </button>
            );
          })}
        </div>
      )}

      {selectedArea && (
        <div className="grimoire-card mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--rule-line)]/50 pb-4">
            <div className="flex gap-3">
              <span className="text-4xl">{selectedArea.icon}</span>
              <div>
                <h3 className="font-hand text-4xl font-bold text-ink">{selectedArea.name}</h3>
                <p className="font-sans text-xs text-ink-soft">{selectedArea.objective || "Adicione um objetivo para esta área."}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onNewStudy(selectedArea.id)} className="rounded-lg bg-accent px-3 py-2 font-sans text-[10px] font-bold uppercase text-white">+ Novo estudo</button>
              <button type="button" onClick={() => setAreaForm(selectedArea)} className="rounded-lg border border-ink/30 px-3 py-2 font-sans text-[10px] font-bold uppercase text-ink">Editar</button>
              <button type="button" onClick={() => onToggleArea(selectedArea)} className="rounded-lg border border-ink/30 px-3 py-2 font-sans text-[10px] font-bold uppercase text-ink">
                {selectedArea.active ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Excluir a área “${selectedArea.name}” e todos os estudos dela?`)) onDeleteArea(selectedArea);
                }}
                className="rounded-lg border border-accent/40 px-3 py-2 font-sans text-[10px] font-bold uppercase text-accent"
              >
                Excluir
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h4 className="grimoire-header text-sm">Resumo da semana</h4>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="grimoire-row p-2"><strong className="block font-hand text-2xl text-ink">{selectedTasks.length}</strong><span className="font-sans text-[8px] font-bold uppercase text-ink-soft">Estudos</span></div>
                <div className="grimoire-row p-2"><strong className="block font-hand text-2xl text-ink">{progress}%</strong><span className="font-sans text-[8px] font-bold uppercase text-ink-soft">Concluído</span></div>
                <div className="grimoire-row p-2"><strong className="block font-hand text-2xl text-ink">{formatMinutes(plannedMinutes)}</strong><span className="font-sans text-[8px] font-bold uppercase text-ink-soft">Planejado</span></div>
              </div>
              <div className="grimoire-row mt-3 p-3">
                <p className="font-sans text-[9px] font-bold uppercase tracking-wide text-accent">Próxima ação</p>
                <p className="mt-1 font-hand text-xl font-bold text-ink">{nextTask?.title ?? "Nenhum estudo pendente nesta semana"}</p>
              </div>
            </div>

            <div>
              <h4 className="grimoire-header text-sm">Conteúdos</h4>
              <div className="mt-3 flex gap-2">
                <input
                  value={contentTitle}
                  onChange={(event) => setContentTitle(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") addContent(); }}
                  className="grimoire-input min-w-0 flex-1 font-sans text-sm"
                  placeholder="Adicionar conteúdo..."
                />
                <button type="button" disabled={!contentTitle.trim() || contentBusy} onClick={addContent} className="rounded-lg bg-ink px-3 py-2 font-sans text-[10px] font-bold uppercase text-paper disabled:opacity-40">Adicionar</button>
              </div>
              <div className="mt-3 space-y-2">
                {selectedContents.map((content) => (
                  <div key={content.id} className="grimoire-row flex items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <p className="font-hand text-xl font-bold text-ink">{content.title}</p>
                      <p className="font-sans text-[9px] font-bold uppercase text-ink-soft">{content.status === "mastered" ? "Dominado" : content.status === "archived" ? "Arquivado" : "Em estudo"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (window.confirm(`Excluir o conteúdo “${content.title}”?`)) onDeleteContent(content); }}
                      className="font-sans text-[9px] font-bold uppercase text-accent hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
                {selectedContents.length === 0 && <p className="rounded-lg border border-dashed border-ink/20 p-4 text-center font-hand text-xl text-ink-soft">Nenhum conteúdo cadastrado ainda.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {areaForm && (
        <AreaForm
          area={areaForm === "new" ? undefined : areaForm}
          onSave={onSaveArea}
          onClose={() => setAreaForm(null)}
        />
      )}
    </section>
  );
}
