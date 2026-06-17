"use client";

/**
 * Índice do Commonplace — re-skin estilo planner digital (Prompt 2 + Fase C).
 *
 * Fichário com:
 *  - Abas pastel no topo = Categorias Master (cores).
 *  - Abas de mês na lateral (JAN…DEZ) = filtram as notas por mês de criação.
 *  - Página pastel com caixas arredondadas = subcategorias e suas notas.
 *  - Busca rápida cruzando categorias.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getCommonplaceIndex,
  listEntries,
  searchEntries,
  type CategoryWithSubcategories,
} from "@/lib/api";
import type { CommonplaceEntry } from "@/lib/database.types";

const MONTHS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

/** Mistura uma cor hex com branco para um tom pastel (amount 0..1). */
function pastel(hex: string, amount = 0.78): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function CommonplaceIndexPage() {
  const [index, setIndex] = useState<CategoryWithSubcategories[]>([]);
  const [entries, setEntries] = useState<CommonplaceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  const [query, setQuery] = useState("");
  const [noteResults, setNoteResults] = useState<CommonplaceEntry[]>([]);

  useEffect(() => {
    Promise.all([getCommonplaceIndex(), listEntries()])
      .then(([idx, ents]) => {
        setIndex(idx);
        setEntries(ents);
        if (idx.length > 0) setActiveCat(idx[0].id);
      })
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setNoteResults([]);
      return;
    }
    const id = setTimeout(() => {
      searchEntries(term)
        .then(setNoteResults)
        .catch(() => setNoteResults([]));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const category = useMemo(
    () => index.find((c) => c.id === activeCat) ?? null,
    [index, activeCat],
  );

  function entriesForSub(subId: string): CommonplaceEntry[] {
    return entries.filter(
      (e) =>
        e.subcategory_id === subId &&
        (activeMonth === null ||
          new Date(e.created_at).getMonth() === activeMonth),
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-hand text-5xl font-bold tracking-tight text-ink">
            Commonplace
          </h1>
          <p className="mt-1 text-ink-soft">Seu fichário de ideias.</p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-stone-300 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-stone-100"
        >
          ← Minha Rotina
        </Link>
      </header>

      <div className="mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar notas em todas as categorias…"
          className="w-full rounded-xl border border-stone-300 bg-white/70 px-4 py-3 text-ink shadow-sm outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {loading && <p className="text-ink-soft">Carregando fichário…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
      )}

      {/* Resultados de busca (cruza categorias) */}
      {query.trim().length >= 2 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-ink-soft">
            Notas encontradas ({noteResults.length})
          </h2>
          {noteResults.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma nota corresponde.</p>
          ) : (
            <ul className="space-y-2">
              {noteResults.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/commonplace/${n.id}`}
                    className="block rounded-lg border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300 hover:shadow-sm"
                  >
                    <p className="font-medium text-ink">{n.title}</p>
                    {n.body_content && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">
                        {n.body_content}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!loading && !error && index.length > 0 && (
        <div className="relative">
          {/* Abas de categoria (topo) */}
          <div className="flex flex-wrap gap-1.5 pl-2">
            {index.map((cat) => {
              const on = cat.id === activeCat;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className="rounded-t-2xl px-4 pb-2 pt-2.5 text-sm font-semibold uppercase tracking-wide transition"
                  style={{
                    backgroundColor: pastel(cat.color_hex, on ? 0.45 : 0.72),
                    color: on ? "#3a3530" : "#6b6258",
                    boxShadow: on ? "0 -2px 6px rgba(0,0,0,0.06)" : "none",
                    marginBottom: on ? -2 : 0,
                  }}
                >
                  {cat.name.replace(/\s*\(.*\)\s*$/, "")}
                </button>
              );
            })}
          </div>

          {/* Página + abas de mês na lateral */}
          <div className="flex">
            <div
              className="min-h-[60vh] flex-1 rounded-2xl rounded-tl-none border border-stone-200 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]"
              style={{
                backgroundColor: category
                  ? pastel(category.color_hex, 0.88)
                  : "var(--paper)",
              }}
            >
              {category && (
                <>
                  <h2 className="mb-1 font-hand text-4xl font-bold text-ink">
                    {category.name.replace(/\s*\(.*\)\s*$/, "")}
                  </h2>
                  <div
                    className="mb-5 h-1.5 w-28 rounded-full"
                    style={{ backgroundColor: category.color_hex }}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {category.subcategories.map((sub) => {
                      const subEntries = entriesForSub(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <Link
                              href={`/commonplace/sub/${sub.id}`}
                              className="font-hand text-2xl text-ink hover:underline"
                            >
                              {sub.name}
                            </Link>
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: pastel(category.color_hex, 0.6),
                                color: "#3a3530",
                              }}
                            >
                              {subEntries.length}
                            </span>
                          </div>
                          {subEntries.length === 0 ? (
                            <p className="text-sm text-stone-400">
                              {activeMonth === null
                                ? "Sem notas ainda."
                                : "Nada neste mês."}
                            </p>
                          ) : (
                            <ul className="space-y-1">
                              {subEntries.slice(0, 4).map((e) => (
                                <li key={e.id}>
                                  <Link
                                    href={`/commonplace/${e.id}`}
                                    className="block truncate rounded px-1 py-0.5 text-sm text-ink-soft transition hover:bg-black/5 hover:text-ink"
                                  >
                                    • {e.title}
                                  </Link>
                                </li>
                              ))}
                              {subEntries.length > 4 && (
                                <li>
                                  <Link
                                    href={`/commonplace/sub/${sub.id}`}
                                    className="text-xs text-ink-soft hover:underline"
                                  >
                                    +{subEntries.length - 4} mais…
                                  </Link>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Abas de mês (lateral direita) */}
            <div className="ml-1 flex flex-col gap-1 pt-2">
              {MONTHS.map((m, idx) => {
                const on = activeMonth === idx;
                return (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(on ? null : idx)}
                    className="rounded-r-xl py-2 pl-2 pr-3 text-xs font-bold tracking-wide transition"
                    style={{
                      backgroundColor: pastel(
                        ["#3b82f6", "#a855f7", "#22c55e", "#eab308", "#f97316", "#ec4899"][
                          idx % 6
                        ],
                        on ? 0.4 : 0.7,
                      ),
                      color: on ? "#3a3530" : "#6b6258",
                    }}
                    title={on ? "Mostrar todos os meses" : `Filtrar por ${m}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {activeMonth !== null && (
            <p className="mt-3 text-sm text-ink-soft">
              Filtrando notas de <strong>{MONTHS[activeMonth]}</strong> ·{" "}
              <button
                onClick={() => setActiveMonth(null)}
                className="underline hover:text-ink"
              >
                limpar filtro
              </button>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
