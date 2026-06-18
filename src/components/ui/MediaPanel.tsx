"use client";

/**
 * MediaPanel — painel reutilizável de mídia para qualquer entidade.
 *
 *   <MediaPanel ownerType="entry" ownerId={entry.id} />
 *
 * Faz upload de foto/áudio/vídeo pro Storage, lista os anexos numa galeria e
 * permite remover. Usado em todas as abas (commonplace, diário, finanças,
 * saúde, pets).
 */

import { useEffect, useRef, useState } from "react";
import {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
} from "@/lib/api";
import type { Attachment } from "@/lib/database.types";

interface MediaPanelProps {
  ownerType: string;
  ownerId: string;
  /** Título exibido acima da galeria. */
  label?: string;
  className?: string;
}

export default function MediaPanel({
  ownerType,
  ownerId,
  label = "Mídia",
  className = "",
}: MediaPanelProps) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ownerId) return;
    listAttachments(ownerType, ownerId)
      .then(setItems)
      .catch((e) => setError(e.message ?? String(e)));
  }, [ownerType, ownerId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const created = await uploadAttachment(ownerType, ownerId, file);
        setItems((prev) => [...prev, created]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(att: Attachment) {
    if (!confirm("Remover esta mídia?")) return;
    setItems((prev) => prev.filter((a) => a.id !== att.id));
    try {
      await deleteAttachment(att);
    } catch (e) {
      console.error("deleteAttachment falhou:", e);
    }
  }

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-hand text-2xl text-ink">{label}</h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg bg-sky-200 px-3 py-1.5 text-sm font-medium text-sky-900 transition hover:bg-sky-300 disabled:opacity-50"
        >
          {busy ? "Enviando…" : "+ Foto / Áudio / Vídeo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-stone-400">Nenhuma mídia ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((att) => (
            <div
              key={att.id}
              className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <button
                onClick={() => handleDelete(att)}
                className="absolute right-1 top-1 z-10 rounded-full bg-black/40 px-2 text-white transition hover:bg-black/70"
                title="Remover"
              >
                ×
              </button>
              {att.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={att.url}
                  alt={att.caption ?? ""}
                  className="h-32 w-full object-cover"
                />
              ) : att.kind === "video" ? (
                <video src={att.url} controls className="h-32 w-full bg-black" />
              ) : (
                <div className="flex h-32 w-full flex-col items-center justify-center gap-2 p-2">
                  <span className="text-3xl">🎵</span>
                  <audio src={att.url} controls className="w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
