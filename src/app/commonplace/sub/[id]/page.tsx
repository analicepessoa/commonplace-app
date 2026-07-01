"use client";

/**
 * Página de uma subcategoria: lista as notas dela e permite criar uma nova,
 * abrindo o Canvas (Prompt 3). Resolve os links do índice.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getSubcategory,
  listEntriesBySubcategory,
  createEntry,
  deleteEntry,
  updateSubcategory,
} from "@/lib/api";
import type { CommonplaceEntry, Subcategory } from "@/lib/database.types";
import { TEMPLATE_OPTIONS } from "@/lib/templates";
import CustomButton from "@/components/ui/CustomButton";

export default function SubcategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sub, setSub] = useState<Subcategory | null>(null);
  const [entries, setEntries] = useState<CommonplaceEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      getSubcategory(params.id),
      listEntriesBySubcategory(params.id),
    ])
      .then(([s, e]) => {
        setSub(s);
        setEntries(e);
      })
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleTemplateChange(template: string) {
    if (!sub) return;
    setSub({ ...sub, template: template || null });
    try {
      await updateSubcategory(sub.id, { template: template || null });
    } catch (e) {
      console.error("updateSubcategory falhou:", e);
    }
  }

  async function handleDeleteEntry(entry: CommonplaceEntry) {
    if (!confirm(`Excluir a nota "${entry.title}"? Isso remove o texto e os elementos dela.`)) return;
    setEntries((prev) => prev.filter((x) => x.id !== entry.id));
    try {
      await deleteEntry(entry.id);
    } catch (err) {
      console.error("deleteEntry falhou:", err);
    }
  }

  async function handleNewEntry() {
    const title = window.prompt("Título da nova nota:", "");
    if (!title) return;
    try {
      const created = await createEntry({
        subcategory_id: params.id,
        title,
        body_content: "",
      });
      router.push(`/commonplace/${created.id}`);
    } catch (e) {
      alert("Erro ao criar nota: " + (e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/commonplace"
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Voltar ao índice
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-hand text-4xl font-bold text-ink">
          {sub?.name ?? "Subcategoria"}
        </h1>
        <CustomButton onClick={handleNewEntry} size="sm">
          + Nova nota
        </CustomButton>
      </div>

      {sub && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-ink-soft">Template das notas:</span>
          <select
            value={sub.template ?? ""}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="grimoire-input text-sm"
          >
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="mt-6 text-ink-soft">Carregando…</p>}

      {!loading && entries.length === 0 && !error && (
        <p className="mt-6 text-ink-soft/60">
          Nenhuma nota ainda. Crie a primeira em “+ Nova nota”.
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {entries.map((e) => (
          <li key={e.id} className="group relative">
            <Link
              href={`/commonplace/${e.id}`}
              className="block grimoire-row py-3 pl-4 pr-12 transition hover:border-accent/60 hover:shadow-sm"
            >
              <p className="font-medium text-ink">{e.title}</p>
              {e.body_content && (
                <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">
                  {e.body_content}
                </p>
              )}
            </Link>
            <button
              onClick={() => handleDeleteEntry(e)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-lg text-ink-soft/50 transition hover:bg-accent/10 hover:text-accent"
              title="Excluir nota"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
