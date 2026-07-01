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
      {label && (
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {label}
        </h3>
      )}
      {error && (
        <p className="mb-2 rounded bg-red-50 px-2 py-1 text-sm text-red-700">
          {error}
        </p>
      )}
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 border-b border-[var(--rule-line)]/40 px-1 py-1.5"
          >
            <button
              onClick={() => handleToggle(task)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border-2 border-ink text-xs transition ${
                task.done ? "bg-ink text-paper" : "bg-transparent text-transparent"
              }`}
              title={task.done ? "Concluída" : "Marcar como feita"}
            >
              ✓
            </button>
            <span
              className={`flex-1 font-hand text-xl ${
                task.done ? "text-ink-soft line-through" : "text-ink"
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => handleEdit(task)}
              className="text-ink-soft/40 transition hover:text-ink-soft"
              title="Editar"
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(task)}
              className="text-ink-soft/40 transition hover:text-accent"
              title="Remover"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder="Adicionar tarefa…"
          className="flex-1 border-b border-[var(--rule-line)] bg-transparent px-1 py-1.5 font-hand text-xl text-ink outline-none placeholder:text-ink-soft/40 focus:border-accent"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg border border-ink-soft/50 px-3 py-1 font-hand text-xl text-ink-soft transition hover:bg-paper-shade/40 hover:text-ink"
        >
          +
        </button>
      </div>
    </div>
  );
}
