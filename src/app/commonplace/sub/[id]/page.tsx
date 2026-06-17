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
} from "@/lib/api";
import type { CommonplaceEntry, Subcategory } from "@/lib/database.types";
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
        className="text-sm text-stone-500 hover:text-stone-700"
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

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="mt-6 text-stone-500">Carregando…</p>}

      {!loading && entries.length === 0 && !error && (
        <p className="mt-6 text-stone-400">
          Nenhuma nota ainda. Crie a primeira em “+ Nova nota”.
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={`/commonplace/${e.id}`}
              className="block rounded-lg border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-300 hover:shadow-sm"
            >
              <p className="font-medium text-stone-800">{e.title}</p>
              {e.body_content && (
                <p className="mt-0.5 line-clamp-1 text-sm text-stone-500">
                  {e.body_content}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
