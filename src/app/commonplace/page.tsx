"use client";

/**
 * Índice do Commonplace Book (Prompt 2).
 *
 * - Cards de Categoria Master, coloridos pelo color_hex.
 * - Subcategorias agrupadas dentro de cada card, com contagem de notas.
 * - Filtro rápido: digita e filtra subcategorias por nome E busca notas
 *   (título/corpo) cruzando todas as categorias.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getCommonplaceIndex,
  searchEntries,
  type CategoryWithSubcategories,
} from "@/lib/api";
import type { CommonplaceEntry } from "@/lib/database.types";
import Highlighter from "@/components/ui/Highlighter";

export default function CommonplaceIndexPage() {
  const [index, setIndex] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [noteResults, setNoteResults] = useState<CommonplaceEntry[]>([]);

  useEffect(() => {
    getCommonplaceIndex()
      .then(setIndex)
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Busca de notas (debounce simples) quando há termo.
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

  // Filtra subcategorias por nome (cliente) quando há termo.
  const filteredIndex = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return index;
    return index
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            cat.name.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.subcategories.length > 0);
  }, [index, query]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-hand text-5xl font-bold tracking-tight text-ink">
          Commonplace
        </h1>
        <p className="mt-1 text-base text-ink-soft">
          Seu índice de ideias, organizado{" "}
          <Highlighter color="#facc15">por cor</Highlighter>.
        </p>
      </header>

      <div className="mb-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar subcategorias ou notas…"
          className="w-full rounded-xl border border-stone-300 bg-white/70 px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {loading && <p className="text-stone-500">Carregando índice…</p>}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">
          Erro ao carregar: {error}
        </p>
      )}

      {/* Resultados de busca de notas (cruza categorias) */}
      {query.trim().length >= 2 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-400">
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
                    <p className="font-medium text-stone-800">{n.title}</p>
                    {n.body_content && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">
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

      {/* Cards de categorias */}
      <div className="grid gap-5 sm:grid-cols-2">
        {filteredIndex.map((cat) => (
          <article
            key={cat.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            style={{ borderTopColor: cat.color_hex, borderTopWidth: 6 }}
          >
            <div className="flex items-center gap-3 px-5 pt-4">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: cat.color_hex }}
                aria-hidden
              />
              <h2 className="font-hand text-2xl font-bold text-ink">
                {cat.name}
              </h2>
            </div>
            <ul className="px-3 py-3">
              {cat.subcategories.length === 0 ? (
                <li className="px-2 py-2 text-sm text-stone-400">
                  Sem subcategorias.
                </li>
              ) : (
                cat.subcategories.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/commonplace/sub/${s.id}`}
                      className="flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-stone-50"
                    >
                      <span className="font-hand text-xl text-ink">
                        {s.name}
                      </span>
                      <span
                        className="ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${cat.color_hex}1a`,
                          color: cat.color_hex,
                        }}
                      >
                        {s.entryCount}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </article>
        ))}
      </div>

      {!loading && !error && filteredIndex.length === 0 && (
        <p className="text-stone-400">Nada encontrado para “{query}”.</p>
      )}
    </main>
  );
}
