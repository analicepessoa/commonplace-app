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
  setCoverAttachment,
  COVER_CAPTION,
} from "@/lib/api";
import type { Attachment } from "@/lib/database.types";
import Lightbox from "./Lightbox";

interface MediaPanelProps {
  ownerType: string;
  ownerId: string;
  /** Título exibido acima da galeria. */
  label?: string;
  className?: string;
  /** Quando true, cada imagem ganha uma estrela para escolher a foto de capa. */
  coverMode?: boolean;
  /** Chamado ao trocar a capa, com o anexo que deve virar avatar (ou null). */
  onCoverChange?: (att: Attachment | null) => void;
}

export default function MediaPanel({
  ownerType,
  ownerId,
  label = "Mídia",
  className = "",
  coverMode = false,
  onCoverChange,
}: MediaPanelProps) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Attachment | null>(null);
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

  const coverId = items.find((a) => a.caption === COVER_CAPTION)?.id ?? null;

  async function handleSetCover(att: Attachment) {
    const turningOff = att.id === coverId;
    const nextId = turningOff ? null : att.id;
    // otimista: marca só a escolhida (ou nenhuma)
    setItems((prev) =>
      prev.map((a) => ({
        ...a,
        caption: a.id === nextId ? COVER_CAPTION : a.caption === COVER_CAPTION ? null : a.caption,
      })),
    );
    const avatar = turningOff
      ? items.find((a) => a.kind === "image") ?? null
      : att;
    onCoverChange?.(avatar);
    try {
      await setCoverAttachment(ownerType, ownerId, nextId);
    } catch (e) {
      console.error("setCoverAttachment falhou:", e);
    }
  }

  const display = (c: string | null) => (c === COVER_CAPTION ? null : c);

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-hand text-2xl text-ink">{label}</h3>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50"
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
        <p className="text-sm text-ink-soft/60">Nenhuma mídia ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((att) => (
            <div
              key={att.id}
              className="group relative overflow-hidden rounded-xl border border-[var(--rule-line)]/40 bg-paper/40"
            >
              <button
                onClick={() => handleDelete(att)}
                className="absolute right-1 top-1 z-10 rounded-full bg-black/40 px-2 text-white transition hover:bg-black/70"
                title="Remover"
              >
                ×
              </button>
              {coverMode && att.kind === "image" && (
                <button
                  onClick={() => handleSetCover(att)}
                  className={`absolute left-1 top-1 z-10 rounded-full px-1.5 text-sm leading-6 transition ${
                    att.id === coverId
                      ? "bg-accent text-paper"
                      : "bg-black/40 text-white hover:bg-black/70"
                  }`}
                  title={att.id === coverId ? "Foto do crachá (clique p/ tirar)" : "Usar no crachá"}
                >
                  {att.id === coverId ? "★" : "☆"}
                </button>
              )}
              {att.kind === "image" ? (
                <button
                  type="button"
                  onClick={() => setZoom(att)}
                  className="block h-32 w-full cursor-zoom-in"
                  title="Ampliar"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={display(att.caption) ?? ""}
                    className="h-32 w-full object-cover transition group-hover:opacity-90"
                  />
                </button>
              ) : att.kind === "video" ? (
                <button
                  type="button"
                  onClick={() => setZoom(att)}
                  className="block h-32 w-full cursor-zoom-in bg-black"
                  title="Ampliar"
                >
                  <video src={att.url} className="h-32 w-full object-cover" />
                </button>
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

      {zoom && (
        <Lightbox
          url={zoom.url}
          kind={zoom.kind}
          caption={display(zoom.caption)}
          onClose={() => setZoom(null)}
        />
      )}
    </div>
  );
}
