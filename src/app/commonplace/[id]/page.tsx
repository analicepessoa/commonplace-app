"use client";

/**
 * Canvas da página específica do Commonplace (Prompt 3).
 * Carrega a nota e monta o CanvasBoard com os elementos flutuantes.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEntry } from "@/lib/api";
import type { CommonplaceEntry } from "@/lib/database.types";
import CanvasBoard from "@/components/commonplace/CanvasBoard";
import MediaPanel from "@/components/ui/MediaPanel";

export default function EntryCanvasPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<CommonplaceEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    getEntry(params.id)
      .then(setEntry)
      .catch((e) => setError(e.message ?? String(e)));
  }, [params.id]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/commonplace"
        className="text-sm text-stone-500 hover:text-stone-700"
      >
        ← Voltar ao índice
      </Link>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}

      {!entry && !error && (
        <p className="mt-6 text-stone-500">Carregando nota…</p>
      )}

      {entry && (
        <div className="mt-4">
          <CanvasBoard entry={entry} />
          <div className="mt-6 rounded-2xl border border-stone-200 bg-paper p-5 shadow-sm">
            <MediaPanel ownerType="entry" ownerId={entry.id} />
          </div>
        </div>
      )}
    </main>
  );
}
