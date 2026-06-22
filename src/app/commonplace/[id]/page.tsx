"use client";

/**
 * Página da nota do Commonplace.
 * Template estruturado (conforme a subcategoria) + canvas livre (post-its,
 * stickers, notas) + mídia.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getEntry, getSubcategory } from "@/lib/api";
import type { CommonplaceEntry, Subcategory } from "@/lib/database.types";
import { getTemplate, type TemplateDef } from "@/lib/templates";
import CanvasBoard from "@/components/commonplace/CanvasBoard";
import TemplateForm from "@/components/commonplace/TemplateForm";
import MediaPanel from "@/components/ui/MediaPanel";

export default function EntryCanvasPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<CommonplaceEntry | null>(null);
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <div className="mt-4 space-y-6">
          <h1 className="font-hand text-4xl font-bold text-ink">
            {entry.title}
          </h1>

          {/* Template estruturado da subcategoria */}
          {template && (
            <section className="rounded-2xl border border-stone-200 bg-card p-5 shadow-sm">
              <h2 className="mb-4 font-hand text-2xl text-ink">
                {template.label}
              </h2>
              <TemplateForm entryId={entry.id} template={template} />
              <div className="mt-5 border-t border-stone-200 pt-4">
                <MediaPanel
                  ownerType="entry"
                  ownerId={entry.id}
                  label="Capa & fotos"
                />
              </div>
            </section>
          )}

          {/* Canvas livre: post-its, stickers, notas */}
          <CanvasBoard entry={entry} />

          {/* Se não há template, a mídia aparece aqui embaixo */}
          {!template && (
            <div className="rounded-2xl border border-stone-200 bg-card p-5 shadow-sm">
              <MediaPanel ownerType="entry" ownerId={entry.id} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
