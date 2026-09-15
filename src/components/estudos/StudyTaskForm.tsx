"use client";

import { useMemo, useState } from "react";
import type {
  StudyArea,
  StudyContent,
  StudyPriority,
  StudyRecurrence,
  StudyTask,
} from "@/lib/database.types";
import { isValidWebUrl, toLocalISODate } from "@/lib/studies";

export interface StudyTaskFormValues {
  area_id: string;
  contentTitle: string;
  title: string;
  description: string;
  scheduled_date: string;
  estimated_minutes: number;
  priority: StudyPriority;
  material_url: string;
  recurrence: StudyRecurrence;
}

interface Props {
  areas: StudyArea[];
  contents: StudyContent[];
  task?: StudyTask | null;
  initialAreaId?: string;
  initialDate?: string;
  onSave: (values: StudyTaskFormValues, keepOpen: boolean) => Promise<void>;
  onClose: () => void;
}

function buildInitial(
  areas: StudyArea[],
  contents: StudyContent[],
  task?: StudyTask | null,
  initialAreaId?: string,
  initialDate?: string,
): StudyTaskFormValues {
  const content = task?.content_id
    ? contents.find((item) => item.id === task.content_id)
    : null;
  return {
    area_id: task?.area_id ?? initialAreaId ?? areas.find((area) => area.active)?.id ?? "",
    contentTitle: content?.title ?? "",
    title: task?.title ?? "",
    description: task?.description ?? "",
    scheduled_date: task?.scheduled_date ?? initialDate ?? toLocalISODate(new Date()),
    estimated_minutes: task?.estimated_minutes ?? 30,
    priority: task?.priority ?? "important",
    material_url: task?.material_url ?? "",
    recurrence: task?.recurrence ?? "none",
  };
}

export default function StudyTaskForm({
  areas,
  contents,
  task,
  initialAreaId,
  initialDate,
  onSave,
  onClose,
}: Props) {
  const [values, setValues] = useState(() =>
    buildInitial(areas, contents, task, initialAreaId, initialDate),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const areaContents = useMemo(
    () => contents.filter((content) => content.area_id === values.area_id),
    [contents, values.area_id],
  );

  function change<K extends keyof StudyTaskFormValues>(
    key: K,
    value: StudyTaskFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(keepOpen: boolean) {
    setError("");
    if (!values.area_id || !values.title.trim() || !values.scheduled_date) {
      setError("Preencha a área, o título e a data do estudo.");
      return;
    }
    if (!isValidWebUrl(values.material_url)) {
      setError("O link do material precisa começar com http:// ou https://.");
      return;
    }
    setSaving(true);
    try {
      await onSave(values, keepOpen);
      if (keepOpen) {
        setValues((current) => ({
          ...current,
          contentTitle: "",
          title: "",
          description: "",
          material_url: "",
        }));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar o estudo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-5">
      <section
        className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--margin-line)]/50 bg-[#f8f0de] p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-form-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--rule-line)]/60 pb-3">
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
              Central de Estudos
            </p>
            <h2 id="study-form-title" className="font-hand text-4xl font-bold text-ink">
              {task ? "Editar estudo" : "Novo estudo"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/30 px-3 py-1 text-xl text-ink transition hover:border-accent hover:text-accent"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {areas.length === 0 ? (
          <p className="grimoire-row p-4 font-sans text-sm text-ink-soft">
            Crie uma área de estudo antes de cadastrar o primeiro estudo.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Área <span className="text-accent">*</span>
              <select
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.area_id}
                onChange={(event) => {
                  change("area_id", event.target.value);
                  change("contentTitle", "");
                }}
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.icon} {area.name}{area.active ? "" : " (inativa)"}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Conteúdo
              <input
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.contentTitle}
                onChange={(event) => change("contentTitle", event.target.value)}
                list="study-content-options"
                placeholder="Ex.: Direito Constitucional"
              />
              <datalist id="study-content-options">
                {areaContents.map((content) => (
                  <option key={content.id} value={content.title} />
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink sm:col-span-2">
              Título <span className="text-accent">*</span>
              <input
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.title}
                onChange={(event) => change("title", event.target.value)}
                placeholder="O que você vai estudar?"
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink sm:col-span-2">
              Descrição
              <textarea
                className="grimoire-input min-h-20 resize-y font-sans text-sm font-normal normal-case"
                value={values.description}
                onChange={(event) => change("description", event.target.value)}
                placeholder="Capítulos, exercícios ou observações..."
              />
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Data <span className="text-accent">*</span>
              <input
                type="date"
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.scheduled_date}
                onChange={(event) => change("scheduled_date", event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Tempo estimado
              <select
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.estimated_minutes}
                onChange={(event) => change("estimated_minutes", Number(event.target.value))}
              >
                {[15, 25, 30, 45, 60, 90, 120, 180, 240].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes < 60 ? `${minutes} minutos` : `${minutes / 60} hora${minutes > 60 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Prioridade
              <select
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.priority}
                onChange={(event) => change("priority", event.target.value as StudyPriority)}
              >
                <option value="essential">Essencial</option>
                <option value="important">Importante</option>
                <option value="optional">Opcional</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink">
              Repetição
              <select
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.recurrence}
                onChange={(event) => change("recurrence", event.target.value as StudyRecurrence)}
              >
                <option value="none">Não repetir</option>
                <option value="weekly">Toda semana</option>
                <option value="monthly">Todo mês</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 font-sans text-xs font-bold uppercase tracking-wide text-ink sm:col-span-2">
              Link do material
              <input
                type="url"
                className="grimoire-input font-sans text-sm font-normal normal-case"
                value={values.material_url}
                onChange={(event) => change("material_url", event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-sans text-sm text-accent">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink/30 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide text-ink hover:border-ink"
          >
            Cancelar
          </button>
          {!task && (
            <button
              type="button"
              disabled={saving || areas.length === 0}
              onClick={() => submit(true)}
              className="rounded-lg border border-accent px-4 py-2 font-sans text-xs font-bold uppercase tracking-wide text-accent transition hover:bg-accent/10 disabled:opacity-40"
            >
              Salvar e adicionar outro
            </button>
          )}
          <button
            type="button"
            disabled={saving || areas.length === 0}
            onClick={() => submit(false)}
            className="rounded-lg bg-accent px-5 py-2 font-sans text-xs font-bold uppercase tracking-wide text-[#fff9ee] shadow-sm transition hover:brightness-90 disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Salvar estudo"}
          </button>
        </div>
      </section>
    </div>
  );
}
