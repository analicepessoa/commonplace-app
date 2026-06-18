"use client";

/**
 * TaskChecklist — checklist autônoma para um escopo/período do diário
 * (ex.: tarefas do mês, da semana). Carrega, adiciona, marca, edita e remove.
 */

import { useEffect, useState } from "react";
import {
  listTasks,
  addTask,
  updateTask,
  deleteTask,
} from "@/lib/api";
import type { DiaryScope, DiaryTask } from "@/lib/database.types";

interface TaskChecklistProps {
  scope: DiaryScope;
  periodKey: string;
  label?: string;
}

export default function TaskChecklist({
  scope,
  periodKey,
  label = "Tarefas",
}: TaskChecklistProps) {
  const [tasks, setTasks] = useState<DiaryTask[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTasks(scope, periodKey)
      .then(setTasks)
      .catch((e) => setError(e.message ?? String(e)));
  }, [scope, periodKey]);

  async function handleAdd() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    try {
      const created = await addTask(scope, periodKey, content, tasks.length);
      setTasks((prev) => [...prev, created]);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(task: DiaryTask) {
    const done = !task.done;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done } : t)));
    try {
      await updateTask(task.id, { done });
    } catch (e) {
      console.error("toggle task falhou:", e);
    }
  }

  async function handleEdit(task: DiaryTask) {
    const content = window.prompt("Editar tarefa:", task.content);
    if (content === null) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, content: trimmed } : t)),
    );
    try {
      await updateTask(task.id, { content: trimmed });
    } catch (e) {
      console.error("edit task falhou:", e);
    }
  }

  async function handleDelete(task: DiaryTask) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await deleteTask(task.id);
    } catch (e) {
      console.error("delete task falhou:", e);
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </h3>
      {error && (
        <p className="mb-2 rounded bg-red-50 px-2 py-1 text-sm text-red-700">
          {error}
        </p>
      )}
      <ul className="space-y-1">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-black/5"
          >
            <button
              onClick={() => handleToggle(task)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                task.done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-stone-300 text-transparent"
              }`}
            >
              ✓
            </button>
            <span
              className={`flex-1 text-sm ${
                task.done ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => handleEdit(task)}
              className="text-stone-400 transition hover:text-ink-soft"
              title="Editar"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(task)}
              className="text-stone-400 transition hover:text-red-500"
              title="Remover"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Adicionar tarefa…"
          className="flex-1 rounded-lg border border-stone-200 bg-white/70 px-3 py-1.5 text-sm outline-none focus:border-stone-400"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-stone-300"
        >
          +
        </button>
      </div>
    </div>
  );
}
