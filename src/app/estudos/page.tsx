"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StudyAreas, { type StudyAreaFormValues } from "@/components/estudos/StudyAreas";
import StudyTaskForm, { type StudyTaskFormValues } from "@/components/estudos/StudyTaskForm";
import StudyWeek from "@/components/estudos/StudyWeek";
import type {
  StudyArea,
  StudyContent,
  StudyTask,
  StudyTaskStatus,
} from "@/lib/database.types";
import {
  addDays,
  getMonday,
  toLocalISODate,
} from "@/lib/studies";
import {
  createStudyArea,
  createStudyContent,
  createStudyTask,
  deleteStudyArea,
  deleteStudyContent,
  deleteStudyTask,
  findOrCreateStudyContent,
  listStudyAreas,
  listStudyContents,
  listStudyTasks,
  seedDefaultStudyAreas,
  updateStudyArea,
  updateStudyTask,
} from "@/lib/api";

type ActiveTab = "week" | "areas";

export default function StudiesPage() {
  const [tab, setTab] = useState<ActiveTab>("week");
  const [areas, setAreas] = useState<StudyArea[]>([]);
  const [contents, setContents] = useState<StudyContent[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [weekLoading, setWeekLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [formAreaId, setFormAreaId] = useState<string | undefined>();
  const [formDate, setFormDate] = useState<string | undefined>();

  const firstDate = useMemo(() => toLocalISODate(weekStart), [weekStart]);
  const lastDate = useMemo(() => toLocalISODate(addDays(weekStart, 6)), [weekStart]);

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setError("");
    try {
      let nextAreas = await listStudyAreas();
      if (nextAreas.length === 0) {
        await seedDefaultStudyAreas();
        nextAreas = await listStudyAreas();
      }
      const nextContents = await listStudyContents();
      setAreas(nextAreas);
      setContents(nextContents);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível abrir a Central de Estudos.";
      setError(message);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const loadWeek = useCallback(async () => {
    setWeekLoading(true);
    try {
      setTasks(await listStudyTasks(firstDate, lastDate));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Não foi possível carregar a semana.";
      setError(message);
    } finally {
      setWeekLoading(false);
    }
  }, [firstDate, lastDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCatalog(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadWeek(), 0);
    return () => window.clearTimeout(timer);
  }, [loadWeek]);

  function openNewStudy(date?: string, areaId?: string) {
    setEditingTask(null);
    setFormDate(date);
    setFormAreaId(areaId);
    setFormOpen(true);
  }

  function openEditStudy(task: StudyTask) {
    setEditingTask(task);
    setFormAreaId(undefined);
    setFormDate(undefined);
    setFormOpen(true);
  }

  async function saveTask(values: StudyTaskFormValues, keepOpen: boolean) {
    const content = await findOrCreateStudyContent(values.area_id, values.contentTitle);
    const payload = {
      area_id: values.area_id,
      content_id: content?.id ?? null,
      title: values.title.trim(),
      description: values.description.trim() || null,
      scheduled_date: values.scheduled_date,
      estimated_minutes: values.estimated_minutes,
      priority: values.priority,
      material_url: values.material_url.trim() || null,
      recurrence: values.recurrence,
    };

    if (editingTask) {
      await updateStudyTask(editingTask.id, payload);
    } else {
      await createStudyTask(payload);
    }
    await Promise.all([loadCatalog(), loadWeek()]);
    if (!keepOpen) {
      setFormOpen(false);
      setEditingTask(null);
    }
  }

  async function changeStatus(task: StudyTask, status: StudyTaskStatus) {
    await updateStudyTask(task.id, {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    });
    await loadWeek();
  }

  async function moveTask(task: StudyTask, date: string) {
    await updateStudyTask(task.id, { scheduled_date: date, status: "postponed" });
    await loadWeek();
  }

  async function removeTask(task: StudyTask) {
    if (!window.confirm(`Excluir o estudo “${task.title}”?`)) return;
    await deleteStudyTask(task.id);
    await loadWeek();
  }

  async function saveArea(values: StudyAreaFormValues, area?: StudyArea) {
    const payload = {
      name: values.name.trim(),
      icon: values.icon.trim() || "📚",
      category: values.category.trim() || null,
      objective: values.objective.trim() || null,
      priority: values.priority,
      active: values.active,
    };
    if (area) await updateStudyArea(area.id, payload);
    else await createStudyArea(payload);
    await loadCatalog();
  }

  async function toggleArea(area: StudyArea) {
    await updateStudyArea(area.id, { active: !area.active });
    await loadCatalog();
  }

  async function removeArea(area: StudyArea) {
    await deleteStudyArea(area.id);
    await Promise.all([loadCatalog(), loadWeek()]);
  }

  async function addContent(areaId: string, title: string) {
    await createStudyContent({ area_id: areaId, title });
    await loadCatalog();
  }

  async function removeContent(content: StudyContent) {
    await deleteStudyContent(content.id);
    await Promise.all([loadCatalog(), loadWeek()]);
  }

  const migrationMissing = /study_areas|schema cache|relation/i.test(error);

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">
            ← Minha Rotina
          </Link>
          <h1 className="mt-1 font-hand text-5xl font-bold text-ink sm:text-6xl">Central de Estudos</h1>
          <p className="max-w-2xl font-sans text-sm text-ink-soft">
            Planeje a semana, organize cada área e mantenha os conteúdos no lugar certo.
          </p>
        </div>
        <div className="hidden items-center gap-3 rounded-xl border border-[var(--rule-line)]/40 bg-paper/50 px-4 py-3 sm:flex">
          <span className="text-3xl">📖</span>
          <div>
            <p className="font-hand text-xl font-bold text-ink">Um estudo de cada vez</p>
            <p className="font-sans text-[9px] font-bold uppercase tracking-wide text-ink-soft">constância antes de perfeição</p>
          </div>
        </div>
      </header>

      <nav className="mb-7 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--rule-line)]/45 py-3">
        <div className="grimoire-tabbar">
          <button
            type="button"
            onClick={() => setTab("week")}
            className={`rounded-full px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wide transition ${tab === "week" ? "bg-accent text-white" : "text-ink hover:bg-accent/10"}`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setTab("areas")}
            className={`rounded-full px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-wide transition ${tab === "areas" ? "bg-accent text-white" : "text-ink hover:bg-accent/10"}`}
          >
            Áreas
          </button>
        </div>
        <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-ink-soft">
          Próximas etapas: Hoje · Foco · Progresso · Caixa de entrada
        </p>
      </nav>

      {error && (
        <div className="mb-6 rounded-xl border border-accent/50 bg-[#f8f0de] p-4">
          <p className="font-sans text-sm font-bold text-accent">
            {migrationMissing
              ? "A estrutura da Central de Estudos ainda precisa ser adicionada ao Supabase."
              : "A Central de Estudos encontrou um problema ao carregar."}
          </p>
          <p className="mt-1 font-sans text-xs text-ink-soft">
            {migrationMissing
              ? "Execute o arquivo 20260915_studies.sql no editor SQL do seu projeto e atualize esta página."
              : error}
          </p>
          <button type="button" onClick={() => { loadCatalog(); loadWeek(); }} className="mt-3 border-b border-accent font-sans text-[10px] font-bold uppercase text-accent">
            Tentar novamente
          </button>
        </div>
      )}

      {tab === "week" ? (
        <StudyWeek
          areas={areas}
          contents={contents}
          tasks={tasks}
          weekStart={weekStart}
          loading={weekLoading}
          onPreviousWeek={() => setWeekStart((date) => addDays(date, -7))}
          onNextWeek={() => setWeekStart((date) => addDays(date, 7))}
          onCurrentWeek={() => setWeekStart(getMonday(new Date()))}
          onNew={(date) => openNewStudy(date)}
          onEdit={openEditStudy}
          onStatus={changeStatus}
          onMove={moveTask}
          onDelete={removeTask}
        />
      ) : (
        <StudyAreas
          areas={areas}
          contents={contents}
          tasks={tasks}
          loading={catalogLoading}
          onSaveArea={saveArea}
          onToggleArea={toggleArea}
          onDeleteArea={removeArea}
          onAddContent={addContent}
          onDeleteContent={removeContent}
          onNewStudy={(areaId) => openNewStudy(undefined, areaId)}
        />
      )}

      <button
        type="button"
        onClick={() => openNewStudy()}
        className="fixed bottom-6 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#f8f0de] bg-accent text-3xl text-white shadow-xl transition hover:scale-105 hover:brightness-90 sm:bottom-8 sm:right-8"
        aria-label="Adicionar novo estudo"
        title="Novo estudo"
      >
        +
      </button>

      {formOpen && (
        <StudyTaskForm
          areas={areas}
          contents={contents}
          task={editingTask}
          initialAreaId={formAreaId}
          initialDate={formDate}
          onSave={saveTask}
          onClose={() => {
            setFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </main>
  );
}
