"use client";

/**
 * Página da nota do Commonplace.
 * Template estruturado (conforme a subcategoria) + canvas livre (post-its,
 * stickers, notas) + mídia.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEntry, getSubcategory, deleteEntry } from "@/lib/api";
import type { CommonplaceEntry, Subcategory } from "@/lib/database.types";
import { getTemplate, type TemplateDef } from "@/lib/templates";
import CanvasBoard from "@/components/commonplace/CanvasBoard";
import TemplateForm from "@/components/commonplace/TemplateForm";
import Notebook from "@/components/commonplace/Notebook";
import MediaPanel from "@/components/ui/MediaPanel";

export default function EntryCanvasPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<CommonplaceEntry | null>(null);
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!entry) return;
    if (!confirm(`Excluir a nota "${entry.title}"? Isso remove o texto e os elementos dela.`)) return;
    try {
      await deleteEntry(entry.id);
      router.push(
        entry.subcategory_id
          ? `/commonplace/sub/${entry.subcategory_id}`
          : "/commonplace",
      );
    } catch (e) {
      alert("Erro ao excluir nota: " + (e as Error).message);
    }
  }

  useEffect(() => {
    if (!params.id) return;
    getEntry(params.id)
      .then(async (e) => {
        setEntry(e);
        if (e.subcategory_id) {
          try {
            const sub: Subcategory = await getSubcategory(e.subcategory_id);
            setTemplate(getTemplate(sub.template));
          } catch {
            /* sem template */
          }
        }
      })
      .catch((e) => setError(e.message ?? String(e)));
  }, [params.id]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Link
        href="/commonplace"
        className="text-sm text-ink-soft hover:text-ink"
      >
        ← Voltar ao índice
      </Link>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}

      {!entry && !error && (
        <p className="mt-6 text-ink-soft">Carregando nota…</p>
      )}

      {entry && (
        <div className="mt-4 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-hand text-4xl font-bold text-ink">
              {entry.title}
            </h1>
            <button
              onClick={handleDelete}
              className="shrink-0 rounded-lg border border-[var(--rule-line)] px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent"
              title="Excluir esta nota"
            >
              Excluir nota
            </button>
          </div>

          {/* Template estruturado da subcategoria */}
          {template && (
            <section className="grimoire-card">
              <h2 className="mb-4 font-hand text-2xl text-ink">
                {template.label}
              </h2>
              <TemplateForm entryId={entry.id} template={template} />
              <div className="mt-5 border-t border-[var(--rule-line)]/40 pt-4">
                <MediaPanel
                  ownerType="entry"
                  ownerId={entry.id}
                  label="Capa & fotos"
                />
              </div>
            </section>
          )}

          {/* Caderno pautado escrevível (body_content) */}
          <Notebook entry={entry} />

          {/* Canvas livre: post-its, stickers, notas */}
          <CanvasBoard entry={entry} />

          {/* Se não há template, a mídia aparece aqui embaixo */}
          {!template && (
            <div className="grimoire-card">
              <MediaPanel ownerType="entry" ownerId={entry.id} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
