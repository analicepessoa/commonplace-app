"use client";

import { useMemo, useState } from "react";
import type {
  StudyArea,
  StudyContent,
  StudyTask,
  StudyTaskStatus,
} from "@/lib/database.types";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  addDays,
  formatMinutes,
  toLocalISODate,
} from "@/lib/studies";

const DAY_NAME = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const DAY_NUMBER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const WEEK_LABEL = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

interface Props {
  areas: StudyArea[];
  contents: StudyContent[];
  tasks: StudyTask[];
  weekStart: Date;
  loading: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onNew: (date?: string) => void;
  onEdit: (task: StudyTask) => void;
  onStatus: (task: StudyTask, status: StudyTaskStatus) => Promise<void>;
  onMove: (task: StudyTask, date: string) => Promise<void>;
  onDelete: (task: StudyTask) => Promise<void>;
}

function priorityClass(priority: StudyTask["priority"]) {
  if (priority === "essential") return "border-accent/50 bg-accent/10 text-accent";
  if (priority === "important") return "border-amber-800/30 bg-amber-100/50 text-amber-900";
  return "border-ink/20 bg-paper-shade/20 text-ink-soft";
}

function StudyCard({
  task,
  area,
  content,
  onEdit,
  onStatus,
  onMove,
  onDelete,
}: {
  task: StudyTask;
  area?: StudyArea;
  content?: StudyContent;
  onEdit: (task: StudyTask) => void;
  onStatus: (task: StudyTask, status: StudyTaskStatus) => Promise<void>;
  onMove: (task: StudyTask, date: string) => Promise<void>;
  onDelete: (task: StudyTask) => Promise<void>;
}) {
  const [moving, setMoving] = useState(false);
  const [moveDate, setMoveDate] = useState(task.scheduled_date);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  const muted = task.status === "cancelled";
  const completed = task.status === "completed";

  return (
    <article className={`grimoire-row p-3 shadow-sm ${muted ? "opacity-55" : ""}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
        <span className="font-sans text-[10px] font-bold uppercase tracking-wide text-ink-soft">
          {area?.icon ?? "📚"} {area?.name ?? "Área"}
        </span>
        <span className={`rounded-full border px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase ${priorityClass(task.priority)}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
      <h4 className={`font-hand text-xl font-bold leading-tight text-ink ${completed ? "line-through opacity-60" : ""}`}>
        {task.title}
      </h4>
      {content && (
        <p className="mt-1 font-sans text-[10px] font-bold uppercase tracking-wide text-accent">
          {content.title}
        </p>
      )}
      {task.description && (
        <p className="mt-1 line-clamp-3 font-sans text-xs leading-relaxed text-ink-soft">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 font-sans text-[9px] font-bold uppercase tracking-wide text-ink-soft">
        <span>◷ {formatMinutes(task.estimated_minutes)}</span>
        <span>•</span>
        <span>{STATUS_LABELS[task.status]}</span>
        {task.recurrence !== "none" && <span title="Estudo recorrente">↻</span>}
        {task.material_url && (
          <a
            href={task.material_url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-accent underline"
          >
            Material
          </a>
        )}
      </div>

      {moving && (
        <div className="mt-3 flex gap-1">
          <input
            type="date"
            value={moveDate}
            onChange={(event) => setMoveDate(event.target.value)}
            className="grimoire-input min-w-0 flex-1 px-2 py-1 font-sans text-[10px]"
          />
          <button
            type="button"
            disabled={!moveDate || busy}
            onClick={() => run(async () => {
              await onMove(task, moveDate);
              setMoving(false);
            })}
            className="rounded bg-accent px-2 font-sans text-[9px] font-bold uppercase text-white disabled:opacity-40"
          >
            Ok
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 border-t border-[var(--rule-line)]/35 pt-2">
        {!completed && !muted && task.status !== "in_progress" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(task, "in_progress"))}
            className="font-sans text-[9px] font-bold uppercase text-accent hover:underline disabled:opacity-40"
          >
            Iniciar
          </button>
        )}
        {!completed && !muted && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(task, "completed"))}
            className="font-sans text-[9px] font-bold uppercase text-ink hover:text-accent disabled:opacity-40"
          >
            Concluir
          </button>
        )}
        {(completed || muted) && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(task, "planned"))}
            className="font-sans text-[9px] font-bold uppercase text-ink hover:text-accent disabled:opacity-40"
          >
            Reabrir
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onEdit(task)}
          className="font-sans text-[9px] font-bold uppercase text-ink hover:text-accent disabled:opacity-40"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setMoving((value) => !value)}
          className="font-sans text-[9px] font-bold uppercase text-ink hover:text-accent disabled:opacity-40"
        >
          Mover
        </button>
        {!muted && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => onStatus(task, "cancelled"))}
            className="font-sans text-[9px] font-bold uppercase text-ink-soft hover:text-accent disabled:opacity-40"
          >
            Cancelar
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => onDelete(task))}
          className="font-sans text-[9px] font-bold uppercase text-accent hover:underline disabled:opacity-40"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

export default function StudyWeek({
  areas,
  contents,
  tasks,
  weekStart,
  loading,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onNew,
  onEdit,
  onStatus,
  onMove,
  onDelete,
}: Props) {
  const [areaFilter, setAreaFilter] = useState("all");
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );
  const visibleTasks = areaFilter === "all"
    ? tasks
    : tasks.filter((task) => task.area_id === areaFilter);
  const plannedMinutes = visibleTasks
    .filter((task) => task.status !== "cancelled")
    .reduce((sum, task) => sum + task.estimated_minutes, 0);
  const areaMap = new Map(areas.map((area) => [area.id, area]));
  const contentMap = new Map(contents.map((content) => [content.id, content]));

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onPreviousWeek} className="rounded-lg border border-ink/30 px-3 py-2 text-ink hover:border-accent hover:text-accent" aria-label="Semana anterior">
            ←
          </button>
          <div className="min-w-44 text-center">
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent">Semana</p>
            <p className="font-hand text-2xl font-bold text-ink">
              {WEEK_LABEL.format(days[0])} — {WEEK_LABEL.format(days[6])}
            </p>
          </div>
          <button type="button" onClick={onNextWeek} className="rounded-lg border border-ink/30 px-3 py-2 text-ink hover:border-accent hover:text-accent" aria-label="Próxima semana">
            →
          </button>
          <button type="button" onClick={onCurrentWeek} className="ml-1 border-b border-ink font-sans text-[10px] font-bold uppercase text-ink hover:text-accent">
            Esta semana
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="grimoire-input py-2 font-sans text-xs"
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
            aria-label="Filtrar por área"
          >
            <option value="all">Todas as áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>{area.icon} {area.name}</option>
            ))}
          </select>
          <div className="rounded-lg border border-[var(--rule-line)]/50 bg-paper/50 px-3 py-2 text-right">
            <p className="font-sans text-[9px] font-bold uppercase tracking-wide text-ink-soft">Tempo planejado</p>
            <p className="font-hand text-xl font-bold text-ink">{formatMinutes(plannedMinutes)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grimoire-card py-12 text-center font-hand text-2xl text-ink-soft">Abrindo a semana...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map((day) => {
            const isoDate = toLocalISODate(day);
            const dayTasks = visibleTasks.filter((task) => task.scheduled_date === isoDate);
            const dayMinutes = dayTasks
              .filter((task) => task.status !== "cancelled")
              .reduce((sum, task) => sum + task.estimated_minutes, 0);
            const overloaded = dayMinutes > 240;
            const today = isoDate === toLocalISODate(new Date());

            return (
              <div key={isoDate} className={`min-h-56 rounded-xl border p-2.5 ${today ? "border-accent bg-accent/5" : "border-[var(--rule-line)]/45 bg-paper/35"}`}>
                <div className="mb-3 flex items-center justify-between border-b border-[var(--rule-line)]/45 pb-2">
                  <div>
                    <h3 className="font-sans text-[10px] font-bold uppercase tracking-widest text-ink">
                      {DAY_NAME.format(day).replace(".", "")}
                    </h3>
                    <p className="font-hand text-xl font-bold text-ink">{DAY_NUMBER.format(day)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNew(isoDate)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-accent text-lg text-accent transition hover:bg-accent hover:text-white"
                    aria-label={`Adicionar estudo em ${DAY_NUMBER.format(day)}`}
                  >
                    +
                  </button>
                </div>
                <div className="mb-2 flex items-center justify-between font-sans text-[9px] font-bold uppercase tracking-wide">
                  <span className={overloaded ? "text-accent" : "text-ink-soft"}>
                    {formatMinutes(dayMinutes)}
                  </span>
                  {overloaded && <span className="text-accent" title="Mais de quatro horas planejadas">⚠ Sobrecarga</span>}
                </div>
                <div className="space-y-2">
                  {dayTasks.map((task) => (
                    <StudyCard
                      key={task.id}
                      task={task}
                      area={areaMap.get(task.area_id)}
                      content={task.content_id ? contentMap.get(task.content_id) : undefined}
                      onEdit={onEdit}
                      onStatus={onStatus}
                      onMove={onMove}
                      onDelete={onDelete}
                    />
                  ))}
                  {dayTasks.length === 0 && (
                    <button
                      type="button"
                      onClick={() => onNew(isoDate)}
                      className="w-full rounded-lg border border-dashed border-ink/20 px-2 py-5 font-hand text-lg text-ink-soft/70 hover:border-accent hover:text-accent"
                    >
                      planejar estudo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

