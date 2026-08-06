"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FoodAnalyzer from "@/components/academia/FoodAnalyzer";
import FitnessCalendar from "@/components/academia/FitnessCalendar";
import RestTimer from "@/components/academia/RestTimer";
import {
  addFitnessAchievement,
  addFitnessRecipe,
  addFitnessWeightLog,
  deleteFitnessAchievement,
  deleteFitnessPreference,
  deleteFitnessRecipe,
  deleteFitnessSession,
  listFitnessAchievements,
  listFitnessPreferences,
  listFitnessRecipes,
  listFitnessSessions,
  listFitnessWeightLogs,
  saveFitnessPreference,
  saveFitnessSession,
  toISODate,
} from "@/lib/api";
import type {
  FitnessAchievement,
  FitnessExercisePreference,
  FitnessRecipe,
  FitnessWeightLog,
  FitnessWorkoutSession,
  Json,
} from "@/lib/database.types";
import {
  EXERCISE_LIBRARY,
  WORKOUTS,
  WORKOUT_BY_KEY,
  type FitnessExercise,
  type FitnessTab,
  type WorkoutKey,
} from "@/lib/fitness";

const inputClass = "grimoire-input w-full text-sm";

function defaultTab(): WorkoutKey {
  const day = new Date().getDay();
  if (day === 3) return "quarta";
  if (day === 4) return "quinta";
  if (day === 5) return "sexta";
  return "terca";
}

function fromPreference(preference: FitnessExercisePreference): FitnessExercise {
  return {
    slotKey: preference.slot_key,
    name: preference.name,
    sets: preference.sets,
    reps: preference.reps,
    videoQuery: preference.video_query || preference.name,
    category: preference.category,
    isCustom: preference.is_custom,
    sortOrder: preference.sort_order,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${date}T12:00:00`));
}

export default function AcademiaPage() {
  const [activeTab, setActiveTab] = useState<FitnessTab>(() => defaultTab());
  const [preferences, setPreferences] = useState<FitnessExercisePreference[]>([]);
  const [sessions, setSessions] = useState<FitnessWorkoutSession[]>([]);
  const [weightLogs, setWeightLogs] = useState<FitnessWeightLog[]>([]);
  const [recipes, setRecipes] = useState<FitnessRecipe[]>([]);
  const [achievements, setAchievements] = useState<FitnessAchievement[]>([]);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(true);
  const [notice, setNotice] = useState("");
  const [swapTarget, setSwapTarget] = useState<FitnessExercise | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", sets: "3", reps: "12 repetições" });
  const [recipeForm, setRecipeForm] = useState({ title: "", url: "", notes: "" });
  const [achievementText, setAchievementText] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([
        listFitnessPreferences(),
        listFitnessSessions(),
        listFitnessWeightLogs(),
        listFitnessRecipes(),
        listFitnessAchievements(),
      ])
      .then(([prefs, savedSessions, logs, savedRecipes, savedAchievements]) => {
      if (cancelled) return;
      setPreferences(prefs);
      setSessions(savedSessions);
      setWeightLogs(logs);
      setRecipes(savedRecipes);
      setAchievements(savedAchievements);
      const latestWeights: Record<string, string> = {};
      for (const log of logs) {
        if (!(log.exercise_key in latestWeights)) latestWeights[log.exercise_key] = String(log.weight);
      }
      setWeights(latestWeights);
      setDatabaseReady(true);
      })
      .catch(() => {
      if (cancelled) return;
      setDatabaseReady(false);
      })
      .finally(() => {
      if (cancelled) return;
      setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const workoutKey = activeTab === "terca" || activeTab === "quarta" || activeTab === "quinta" || activeTab === "sexta"
    ? activeTab
    : null;
  const workout = workoutKey ? WORKOUT_BY_KEY[workoutKey] : null;

  const exercises = useMemo(() => {
    if (!workout) return [];
    const preferenceBySlot = new Map(preferences.map((preference) => [preference.slot_key, preference]));
    const defaults = workout.exercises.map((item) => {
      const preference = preferenceBySlot.get(item.slotKey);
      return preference ? fromPreference(preference) : item;
    });
    const custom = preferences
      .filter((preference) => preference.workout_key === workout.key && preference.is_custom && !defaults.some((item) => item.slotKey === preference.slot_key))
      .map(fromPreference);
    return [...defaults, ...custom].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [preferences, workout]);

  const totalSets = exercises.reduce((sum, item) => sum + item.sets, 0);
  const doneSets = exercises.reduce((sum, item) => sum + Math.min(item.sets, completedSets[item.slotKey] || 0), 0);
  const progress = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const thisMonth = toISODate(new Date()).slice(0, 7);
  const monthCount = sessions.filter((session) => session.workout_date.startsWith(thisMonth)).length;
  const latestLogs = weightLogs.slice(0, 5);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  function setAll(exercise: FitnessExercise, checked: boolean) {
    setCompletedSets((current) => ({ ...current, [exercise.slotKey]: checked ? exercise.sets : 0 }));
  }

  function increment(exercise: FitnessExercise) {
    setCompletedSets((current) => ({
      ...current,
      [exercise.slotKey]: ((current[exercise.slotKey] || 0) + 1) % (exercise.sets + 1),
    }));
  }

  function selectTab(tab: FitnessTab) {
    setActiveTab(tab);
    setCompletedSets({});
  }

  async function saveWeight(exercise: FitnessExercise) {
    const value = Number(weights[exercise.slotKey]);
    if (!Number.isFinite(value) || value < 0) return flash("Digite uma carga válida.");
    try {
      const saved = await addFitnessWeightLog(exercise.slotKey, exercise.name, value);
      setWeightLogs((current) => [saved, ...current]);
      flash("Carga registrada no histórico.");
    } catch {
      setDatabaseReady(false);
      flash("A tabela da Academia ainda precisa ser criada no Supabase.");
    }
  }

  async function applySwap(choice: Omit<FitnessExercise, "slotKey" | "sortOrder">) {
    if (!swapTarget || !workoutKey) return;
    try {
      const saved = await saveFitnessPreference({
        slot_key: swapTarget.slotKey,
        workout_key: workoutKey,
        name: choice.name,
        sets: choice.sets,
        reps: choice.reps,
        video_query: choice.videoQuery,
        category: choice.category,
        is_custom: false,
        sort_order: swapTarget.sortOrder,
      });
      setPreferences((current) => [...current.filter((item) => item.slot_key !== saved.slot_key), saved]);
      setSwapTarget(null);
      flash("Exercício trocado.");
    } catch {
      setDatabaseReady(false);
      flash("Crie as tabelas da Academia no Supabase para salvar alterações.");
    }
  }

  async function addExercise() {
    if (!workoutKey || !newExercise.name.trim()) return;
    const sets = Number(newExercise.sets);
    if (!Number.isInteger(sets) || sets < 1 || sets > 20) return flash("Use de 1 a 20 séries.");
    try {
      const saved = await saveFitnessPreference({
        slot_key: `custom-${crypto.randomUUID()}`,
        workout_key: workoutKey,
        name: newExercise.name.trim(),
        sets,
        reps: newExercise.reps.trim() || "Livre",
        video_query: newExercise.name.trim(),
        category: "core_full",
        is_custom: true,
        sort_order: Math.max(0, ...exercises.map((item) => item.sortOrder)) + 1,
      });
      setPreferences((current) => [...current, saved]);
      setNewExercise({ name: "", sets: "3", reps: "12 repetições" });
      setShowAdd(false);
      flash("Exercício adicionado.");
    } catch {
      setDatabaseReady(false);
      flash("Crie as tabelas da Academia no Supabase para adicionar exercícios.");
    }
  }

  async function removeCustom(exercise: FitnessExercise) {
    if (!confirm(`Remover “${exercise.name}”?`)) return;
    try {
      await deleteFitnessPreference(exercise.slotKey);
      setPreferences((current) => current.filter((item) => item.slot_key !== exercise.slotKey));
    } catch {
      flash("Não foi possível remover o exercício.");
    }
  }

  async function saveTodayWorkout() {
    if (!workout) return;
    const completed = exercises.map((exercise) => ({
      exercise_key: exercise.slotKey,
      exercise_name: exercise.name,
      completed_sets: completedSets[exercise.slotKey] || 0,
      planned_sets: exercise.sets,
      weight: weights[exercise.slotKey] ? Number(weights[exercise.slotKey]) : null,
    })) as Json;
    try {
      const saved = await saveFitnessSession({
        workout_date: toISODate(new Date()),
        workout_key: workout.key,
        completed_exercises: completed,
        duration_seconds: 0,
      });
      setSessions((current) => [saved, ...current.filter((item) => item.workout_date !== saved.workout_date)]);
      flash("Treino de hoje salvo.");
    } catch {
      setDatabaseReady(false);
      flash("Crie as tabelas da Academia no Supabase antes de salvar o treino.");
    }
  }

  async function toggleCalendarDate(date: string, existing?: FitnessWorkoutSession) {
    try {
      if (existing) {
        if (!confirm(`Desmarcar o treino de ${formatDate(date)}?`)) return;
        await deleteFitnessSession(existing.id);
        setSessions((current) => current.filter((session) => session.id !== existing.id));
      } else {
        const saved = await saveFitnessSession({ workout_date: date, workout_key: "manual", completed_exercises: [] });
        setSessions((current) => [saved, ...current]);
      }
    } catch {
      setDatabaseReady(false);
      flash("Não foi possível atualizar o calendário.");
    }
  }

  async function addRecipe() {
    if (!recipeForm.title.trim()) return;
    try {
      const saved = await addFitnessRecipe({
        title: recipeForm.title.trim(),
        url: recipeForm.url.trim() || null,
        notes: recipeForm.notes.trim() || null,
      });
      setRecipes((current) => [saved, ...current]);
      setRecipeForm({ title: "", url: "", notes: "" });
    } catch {
      setDatabaseReady(false);
      flash("Não foi possível salvar a receita.");
    }
  }

  async function removeRecipe(id: string) {
    if (!confirm("Remover esta receita?")) return;
    await deleteFitnessRecipe(id).then(() => setRecipes((current) => current.filter((item) => item.id !== id))).catch(() => flash("Não foi possível remover."));
  }

  async function addAchievement() {
    if (!achievementText.trim()) return;
    try {
      const saved = await addFitnessAchievement({ content: achievementText.trim(), achieved_at: toISODate(new Date()) });
      setAchievements((current) => [saved, ...current]);
      setAchievementText("");
    } catch {
      setDatabaseReady(false);
      flash("Não foi possível salvar a conquista.");
    }
  }

  async function removeAchievement(id: string) {
    if (!confirm("Remover esta conquista?")) return;
    await deleteFitnessAchievement(id).then(() => setAchievements((current) => current.filter((item) => item.id !== id))).catch(() => flash("Não foi possível remover."));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-28">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.22em] text-accent">Movimento & evolução</p>
          <h1 className="page-title text-5xl font-bold sm:text-6xl">Academia</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">Seu treino em casa, agora integrado ao diário pessoal e salvo com segurança.</p>
        </div>
        <Link href="/" className="rounded-lg border border-[var(--rule-line)] px-4 py-2 text-sm font-medium text-ink transition hover:bg-paper-shade/40">← Minha Rotina</Link>
      </header>

      {!databaseReady && (
        <div className="mb-5 rounded-xl border border-accent/45 bg-[rgba(248,240,222,0.96)] p-4 text-sm text-ink shadow-sm">
          <strong className="text-accent">Falta ativar o banco da Academia.</strong>{" "}
          A tela já pode ser explorada, mas para salvar é preciso executar a migration <code className="font-mono text-xs">20260806_fitness.sql</code> no Supabase.
        </div>
      )}
      {notice && <div className="fixed right-4 top-4 z-50 rounded-xl bg-ink px-4 py-3 text-sm text-paper shadow-xl">{notice}</div>}

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="grimoire-card !p-4"><p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Treinos no mês</p><p className="mt-1 font-hand text-4xl text-accent">{loading ? "—" : monthCount}</p></div>
        <div className="grimoire-card !p-4"><p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Objetivo</p><p className="mt-2 font-hand text-2xl text-ink">Hipertrofia</p></div>
        <div className="grimoire-card !p-4"><p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Equipamentos</p><p className="mt-2 text-sm text-ink">Barra e halteres montáveis</p></div>
      </section>

      <nav className="grimoire-tabbar mb-6 w-full justify-start overflow-x-auto rounded-xl p-1.5">
        {WORKOUTS.map((item) => (
          <button key={item.key} onClick={() => selectTab(item.key)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${activeTab === item.key ? "bg-accent text-paper shadow-sm" : "text-ink hover:bg-paper-shade/35"}`}>
            {item.shortLabel}
          </button>
        ))}
        <button onClick={() => selectTab("nutricao")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${activeTab === "nutricao" ? "bg-accent text-paper shadow-sm" : "text-ink hover:bg-paper-shade/35"}`}>Nutrição</button>
        <button onClick={() => selectTab("conquistas")} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${activeTab === "conquistas" ? "bg-accent text-paper shadow-sm" : "text-ink hover:bg-paper-shade/35"}`}>Conquistas</button>
      </nav>

      {workout && (
        <>
          <section className="grimoire-card mb-6 overflow-hidden !p-0">
            <div className="border-b border-[var(--rule-line)]/45 bg-[rgba(216,194,157,0.22)] px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-widest text-accent">{workout.title}</p><h2 className="mt-1 font-hand text-3xl font-semibold text-ink sm:text-4xl">{workout.focus}</h2></div>
                <span className="rounded-full border border-accent/35 bg-paper/70 px-3 py-1 text-xs font-medium text-accent">≈ {workout.calories} kcal</span>
              </div>
              <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-shade/55"><div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} /></div><span className="min-w-10 text-right text-sm font-bold text-accent">{progress}%</span></div>
            </div>

            <ul className="divide-y divide-[var(--rule-line)]/30">
              {exercises.map((item) => {
                const current = completedSets[item.slotKey] || 0;
                const complete = current >= item.sets;
                return (
                  <li key={item.slotKey} className={`px-4 py-4 transition sm:px-6 ${complete ? "bg-[#dfe8d8]/55" : "bg-[rgba(248,240,222,0.72)]"}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => setAll(item, !complete)} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition ${complete ? "border-[#527052] bg-[#527052] text-white" : "border-ink/45 text-transparent hover:border-accent"}`} aria-label={complete ? "Desmarcar exercício" : "Concluir exercício"}>✓</button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div><h3 className={`font-semibold text-ink ${complete ? "line-through opacity-65" : ""}`}>{item.name}</h3><p className="mt-1 text-xs text-ink-soft">{item.reps}</p></div>
                          <div className="flex gap-1.5">
                            {item.isCustom ? <button onClick={() => removeCustom(item)} className="rounded-md border border-accent/35 px-2 py-1 text-xs text-accent hover:bg-accent/10">Remover</button> : <button onClick={() => setSwapTarget(item)} className="rounded-md border border-[var(--rule-line)]/55 px-2 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent">Trocar</button>}
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.videoQuery)}`} target="_blank" rel="noreferrer" className="rounded-md border border-[var(--rule-line)]/55 px-2 py-1 text-xs text-ink-soft hover:border-accent hover:text-accent">Vídeo ↗</a>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button onClick={() => increment(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${complete ? "bg-[#527052] text-white" : "border border-[var(--rule-line)]/55 bg-paper/70 text-ink hover:border-accent"}`}>{current} / {item.sets} séries</button>
                          <div className="flex items-center overflow-hidden rounded-lg border border-[var(--rule-line)]/45 bg-paper/65">
                            <input type="number" min="0" step="0.5" value={weights[item.slotKey] || ""} onChange={(event) => setWeights((value) => ({ ...value, [item.slotKey]: event.target.value }))} placeholder="Carga" className="w-20 bg-transparent px-2 py-1.5 text-sm text-ink outline-none" />
                            <span className="text-xs text-ink-soft">kg</span>
                            <button onClick={() => saveWeight(item)} className="ml-2 border-l border-[var(--rule-line)]/40 px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-paper-shade/30">Salvar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-[var(--rule-line)]/35 p-4 sm:p-5">
              {showAdd ? (
                <div className="grid gap-2 rounded-xl border border-dashed border-accent/45 bg-paper/55 p-3 sm:grid-cols-[2fr_90px_1.2fr_auto_auto]">
                  <input className={inputClass} placeholder="Nome do exercício" value={newExercise.name} onChange={(event) => setNewExercise({ ...newExercise, name: event.target.value })} />
                  <input className={inputClass} type="number" min="1" max="20" value={newExercise.sets} onChange={(event) => setNewExercise({ ...newExercise, sets: event.target.value })} aria-label="Séries" />
                  <input className={inputClass} placeholder="Repetições" value={newExercise.reps} onChange={(event) => setNewExercise({ ...newExercise, reps: event.target.value })} />
                  <button onClick={addExercise} className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-paper">Adicionar</button>
                  <button onClick={() => setShowAdd(false)} className="rounded-lg border border-[var(--rule-line)] px-3 py-2 text-sm text-ink">Cancelar</button>
                </div>
              ) : <button onClick={() => setShowAdd(true)} className="w-full rounded-xl border-2 border-dashed border-[var(--rule-line)]/55 py-2.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent">+ Adicionar exercício manual</button>}
              <button onClick={saveTodayWorkout} className="mt-3 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-paper shadow-sm transition hover:-translate-y-0.5 hover:opacity-95">Salvar treino de hoje</button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <FitnessCalendar sessions={sessions} onToggle={toggleCalendarDate} />
            <section className="grimoire-card">
              <h2 className="grimoire-header">Últimas cargas</h2>
              {latestLogs.length === 0 ? <p className="mt-4 text-sm text-ink-soft">Salve uma carga para começar seu histórico.</p> : (
                <ul className="mt-3 space-y-2">{latestLogs.map((log) => <li key={log.id} className="grimoire-row flex items-center justify-between gap-2 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{log.exercise_name}</p><p className="text-[11px] text-ink-soft">{new Date(log.created_at).toLocaleDateString("pt-BR")}</p></div><strong className="font-hand text-xl text-accent">{log.weight} kg</strong></li>)}</ul>
              )}
            </section>
          </div>
        </>
      )}

      {activeTab === "nutricao" && (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <FoodAnalyzer />
          <div className="grimoire-card">
            <h2 className="grimoire-header">Caderno de receitas</h2>
            <div className="mt-4 space-y-2">
              <input className={inputClass} placeholder="Nome da receita" value={recipeForm.title} onChange={(event) => setRecipeForm({ ...recipeForm, title: event.target.value })} />
              <input className={inputClass} type="url" placeholder="Link (opcional)" value={recipeForm.url} onChange={(event) => setRecipeForm({ ...recipeForm, url: event.target.value })} />
              <textarea className={inputClass} rows={3} placeholder="Anotações" value={recipeForm.notes} onChange={(event) => setRecipeForm({ ...recipeForm, notes: event.target.value })} />
              <button onClick={addRecipe} className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-paper">Salvar receita</button>
            </div>
            <div className="mt-5 space-y-3">{recipes.length === 0 ? <p className="text-sm text-ink-soft">Nenhuma receita salva ainda.</p> : recipes.map((recipe) => <article key={recipe.id} className="grimoire-row p-3"><div className="flex justify-between gap-3"><div><h3 className="font-semibold text-ink">{recipe.title}</h3>{recipe.url && <a href={recipe.url} target="_blank" rel="noreferrer" className="text-xs text-accent underline">Abrir receita ↗</a>}{recipe.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{recipe.notes}</p>}</div><button onClick={() => removeRecipe(recipe.id)} className="self-start text-lg text-ink-soft/50 hover:text-accent" aria-label="Remover receita">×</button></div></article>)}</div>
          </div>
        </section>
      )}

      {activeTab === "conquistas" && (
        <section className="mx-auto max-w-3xl">
          <div className="grimoire-card mb-5">
            <h2 className="grimoire-header">Diário de conquistas</h2>
            <p className="mt-3 text-sm text-ink-soft">Registre recordes, consistência e pequenas vitórias do caminho.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input className={inputClass} placeholder="Ex.: Aumentei 2 kg no agachamento" value={achievementText} onChange={(event) => setAchievementText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addAchievement(); }} /><button onClick={addAchievement} className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-paper">Registrar</button></div>
          </div>
          <div className="relative ml-3 border-l-2 border-accent/40 pl-7">{achievements.length === 0 ? <p className="text-sm text-ink-soft">Sua primeira conquista aparecerá aqui.</p> : achievements.map((item) => <article key={item.id} className="grimoire-card relative mb-4 !p-4"><span className="absolute -left-[2.45rem] top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-accent bg-paper text-[10px] text-accent">★</span><button onClick={() => removeAchievement(item.id)} className="absolute right-3 top-2 text-lg text-ink-soft/45 hover:text-accent" aria-label="Remover conquista">×</button><time className="text-[11px] font-bold uppercase tracking-wide text-accent">{formatDate(item.achieved_at)}</time><p className="mt-1 pr-5 font-hand text-2xl text-ink">{item.content}</p></article>)}</div>
        </section>
      )}

      {swapTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSwapTarget(null); }}>
          <div role="dialog" aria-modal="true" aria-label="Trocar exercício" className="grimoire-card max-h-[80vh] w-full max-w-lg overflow-y-auto !p-5">
            <div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-accent">Trocar exercício</p><h2 className="mt-1 font-hand text-2xl text-ink">{swapTarget.name}</h2></div><button onClick={() => setSwapTarget(null)} className="text-2xl text-ink-soft hover:text-accent" aria-label="Fechar">×</button></div>
            <div className="space-y-2">{(EXERCISE_LIBRARY[swapTarget.category] || EXERCISE_LIBRARY.core_full).map((choice) => <button key={`${choice.category}-${choice.name}`} onClick={() => applySwap(choice)} className="grimoire-row w-full p-3 text-left transition hover:border-accent"><strong className="block text-sm text-ink">{choice.name}</strong><span className="text-xs text-ink-soft">{choice.sets} séries • {choice.reps}</span></button>)}</div>
          </div>
        </div>
      )}

      <RestTimer />
    </main>
  );
}
