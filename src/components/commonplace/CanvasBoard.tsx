"use client";

/**
 * CanvasBoard — área de trabalho absoluta de uma página do Commonplace.
 *
 * Elementos flutuantes (todos arrastáveis):
 *  - sticker : emoji decorativo
 *  - image   : foto solta (redimensionável, sem corte, com zoom)
 *  - post-it : recado curto, editável e estilizável (cor/tamanho/fonte)
 *  - note    : bloco de texto grande, editável e estilizável
 *
 * Tudo salva sozinho (posição, tamanho, texto, estilo).
 */

import { useEffect, useRef, useState } from "react";
import {
  listFloatingElements,
  createFloatingElement,
  updatePosition,
  bringToFront,
  updateFloatingElement,
  deleteFloatingElement,
  uploadToMedia,
} from "@/lib/api";
import type { CommonplaceEntry, FloatingElement } from "@/lib/database.types";
import DraggableItem from "./DraggableItem";

const STICKERS = [
  "⭐", "🌟", "❤️", "💛", "💚", "💙", "💜", "🧡", "📌", "📍", "🌸", "🌼",
  "🌻", "🌷", "🌈", "✨", "🔥", "💡", "☕", "🍃", "🦋", "🐱", "🐶", "✅",
  "❌", "❓", "❗", "💭", "🎀", "🎵", "📷", "🍰",
];

const COLORS = ["#3a3530", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#ffffff"];

const FONTS: Record<string, string> = {
  hand: "var(--font-hand), cursive",
  sans: "var(--font-geist-sans), sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "var(--font-geist-mono), monospace",
};
const FONT_LABEL: Record<string, string> = {
  hand: "Manuscrita",
  sans: "Sem serifa",
  serif: "Serifada",
  mono: "Mono",
};

export default function CanvasBoard({ entry }: { entry: CommonplaceEntry }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    listFloatingElements(entry.id)
      .then(setElements)
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [entry.id]);

  function maxZ() {
    return elements.reduce((m, el) => Math.max(m, el.z_index), 0);
  }

  async function create(
    partial: Partial<FloatingElement> & { type: FloatingElement["type"] },
  ): Promise<FloatingElement | null> {
    try {
      const created = await createFloatingElement({
        entry_id: entry.id,
        pos_x: 40 + Math.random() * 90,
        pos_y: 40 + Math.random() * 90,
        z_index: maxZ() + 1,
        ...partial,
      });
      setElements((prev) => [...prev, created]);
      return created;
    } catch (e) {
      alert("Erro ao criar elemento: " + (e as Error).message);
      return null;
    }
  }

  async function addNote() {
    const created = await create({
      type: "note", content_data: "", width: 340, height: 240,
      font_size: 18, font_family: "hand", color: "#3b2f23",
    });
    if (created) setEditingId(created.id);
  }
  async function addPostIt() {
    const created = await create({
      type: "post-it", content_data: "", width: 200, height: 150,
      font_size: 18, font_family: "hand", color: "#3b2f23",
    });
    if (created) setEditingId(created.id);
  }
  async function addSticker(emoji: string) {
    setStickerOpen(false);
    await create({ type: "sticker", content_data: emoji });
  }
  async function handleImageFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadToMedia(`entry/${entry.id}`, file);
      await create({ type: "image", content_data: url, width: 300, height: 220 });
    } catch (e) {
      alert("Erro ao enviar imagem: " + (e as Error).message);
    } finally {
      setUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  async function handleDragEnd(el: FloatingElement, pos: { pos_x: number; pos_y: number }) {
    setElements((prev) => prev.map((e) => (e.id === el.id ? { ...e, ...pos } : e)));
    updatePosition(el.id, pos).catch((e) => console.error("pos:", e));
  }
  async function handleResize(el: FloatingElement, size: { width: number; height: number }) {
    setElements((prev) => prev.map((e) => (e.id === el.id ? { ...e, ...size } : e)));
    updateFloatingElement(el.id, size).catch((e) => console.error("size:", e));
  }
  async function handleFocus(el: FloatingElement) {
    if (el.z_index === maxZ()) return;
    const newZ = maxZ() + 1;
    setElements((prev) => prev.map((e) => (e.id === el.id ? { ...e, z_index: newZ } : e)));
    bringToFront(el.id, entry.id).catch((e) => console.error("z:", e));
  }
  function patchLocal(id: string, patch: Partial<FloatingElement>) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  async function saveText(el: FloatingElement, text: string) {
    patchLocal(el.id, { content_data: text });
    updateFloatingElement(el.id, { content_data: text }).catch((e) => console.error("text:", e));
  }
  async function saveStyle(el: FloatingElement, patch: Partial<FloatingElement>) {
    patchLocal(el.id, patch);
    updateFloatingElement(el.id, patch).catch((e) => console.error("style:", e));
  }
  async function handleDelete(el: FloatingElement) {
    if (!confirm("Remover este elemento?")) return;
    setElements((prev) => prev.filter((e) => e.id !== el.id));
    deleteFloatingElement(el.id).catch((e) => console.error("del:", e));
  }

  return (
    <div>
      {/* Barra de ferramentas */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={addNote} className="rounded-lg bg-sky-200 px-3 py-1.5 text-sm font-medium text-sky-900 transition hover:bg-sky-300">+ Nota</button>
        <button onClick={addPostIt} className="rounded-lg bg-amber-200 px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-300">+ Post-it</button>
        <button onClick={() => imgInputRef.current?.click()} disabled={uploading} className="rounded-lg bg-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-300 disabled:opacity-50">
          {uploading ? "Enviando…" : "+ Imagem"}
        </button>
        <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)} />
        <div className="relative">
          <button onClick={() => setStickerOpen((v) => !v)} className="rounded-lg bg-stone-200 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-stone-300">+ Sticker</button>
          {stickerOpen && (
            <div className="absolute z-30 mt-1 grid w-64 grid-cols-8 gap-1 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
              {STICKERS.map((s) => (
                <button key={s} onClick={() => addSticker(s)} className="rounded p-1 text-xl transition hover:bg-stone-100">{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onClick={(e) => { if (e.target === canvasRef.current) setEditingId(null); }}
        className="paper-lined relative h-[85vh] w-full overflow-hidden rounded-2xl border border-stone-200 shadow-[inset_0_2px_12px_rgba(0,0,0,0.06)]"
      >
        <div className="pointer-events-none absolute inset-0 p-6 pl-16">
          <h2 className="font-hand text-4xl font-bold text-ink">{entry.title}</h2>
          {entry.body_content && (
            <p className="mt-2 max-w-prose whitespace-pre-wrap text-lg leading-8 text-ink-soft">{entry.body_content}</p>
          )}
        </div>

        {loading && <p className="absolute bottom-3 right-4 text-xs text-stone-400">carregando…</p>}
        {error && <p className="absolute bottom-3 right-4 text-xs text-red-500">{error}</p>}

        {elements.map((el) => {
          const isText = el.type === "note" || el.type === "post-it";
          const resizable = isText || el.type === "image";
          return (
            <DraggableItem
              key={el.id}
              initialX={el.pos_x}
              initialY={el.pos_y}
              scale={el.scale}
              rotation={el.rotation}
              zIndex={el.z_index}
              constraintsRef={canvasRef}
              onFocus={() => handleFocus(el)}
              onDragEnd={(pos) => handleDragEnd(el, pos)}
              disableDrag={isText && editingId === el.id}
              width={resizable ? (el.width ?? (el.type === "image" ? 300 : el.type === "note" ? 340 : 200)) : undefined}
              height={resizable ? (el.height ?? (el.type === "image" ? 220 : el.type === "note" ? 240 : 150)) : undefined}
              onResizeEnd={resizable ? (size) => handleResize(el, size) : undefined}
            >
              {el.type === "sticker" ? (
                <div onDoubleClick={() => handleDelete(el)} className="select-none text-4xl drop-shadow" title="Arraste · duplo-clique remove">{el.content_data}</div>
              ) : el.type === "image" ? (
                <ImageElement el={el} onDelete={() => handleDelete(el)} />
              ) : (
                <TextElement
                  el={el}
                  editing={editingId === el.id}
                  onStartEdit={() => setEditingId(el.id)}
                  onSaveText={(t) => saveText(el, t)}
                  onStyle={(p) => saveStyle(el, p)}
                  onDelete={() => handleDelete(el)}
                />
              )}
            </DraggableItem>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Arraste qualquer item. Notas/post-its: duplo-clique para escrever e usar a barra de estilo (cor, tamanho, fonte). Imagens: arraste o canto para ampliar.
      </p>
    </div>
  );
}

function ImageElement({ el, onDelete }: { el: FloatingElement; onDelete: () => void }) {
  return (
    <div className="group relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={el.content_data ?? ""} alt="" className="h-full w-full rounded-lg object-contain shadow-md" draggable={false} />
      <div className="absolute right-1 top-1 flex gap-1 transition">
        <a href={el.content_data ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="rounded bg-black/50 px-1.5 text-xs text-white" title="Abrir/zoom">⛶</a>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="rounded bg-black/50 px-1.5 text-xs text-white" title="Remover">×</button>
      </div>
    </div>
  );
}

function TextElement({
  el, editing, onStartEdit, onSaveText, onStyle, onDelete,
}: {
  el: FloatingElement;
  editing: boolean;
  onStartEdit: () => void;
  onSaveText: (t: string) => void;
  onStyle: (p: Partial<FloatingElement>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(el.content_data ?? "");
  const fontFamily = FONTS[el.font_family ?? "hand"] ?? FONTS.hand;
  const fontSize = el.font_size ?? 18;
  const color = el.color ?? "#3a3530";
  const isPostit = el.type === "post-it";

  const textStyle = { fontFamily, fontSize, color, lineHeight: 1.3 } as const;

  return (
    <div
      className={`relative flex h-full w-full flex-col rounded-lg p-3 shadow-md ${isPostit ? "bg-amber-200" : "border border-stone-200 bg-white/95"}`}
      style={isPostit ? { boxShadow: "2px 4px 8px rgba(0,0,0,0.15)" } : undefined}
    >
      {/* Barra de estilo (em edição) */}
      {editing && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-11 left-0 z-20 flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2 py-1 shadow-lg"
        >
          <div className="flex gap-0.5">
            {COLORS.map((c) => (
              <button key={c} onClick={() => onStyle({ color: c })} className="h-4 w-4 rounded-full border border-stone-300" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <button onClick={() => onStyle({ font_size: Math.max(12, fontSize - 2) })} className="px-1 text-sm text-ink-soft hover:text-ink" title="Menor">A−</button>
          <button onClick={() => onStyle({ font_size: Math.min(48, fontSize + 2) })} className="px-1 text-base font-semibold text-ink-soft hover:text-ink" title="Maior">A+</button>
          <select value={el.font_family ?? "hand"} onChange={(e) => onStyle({ font_family: e.target.value })} className="rounded border border-stone-200 px-1 text-xs outline-none">
            {Object.keys(FONTS).map((k) => <option key={k} value={k}>{FONT_LABEL[k]}</option>)}
          </select>
          <button onClick={() => onSaveText(draft)} className="ml-1 rounded bg-ink px-2 text-xs text-paper" title="Pronto">✓</button>
        </div>
      )}

      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute right-1 top-1 z-10 text-stone-400 transition hover:text-red-500" title="Remover">×</button>

      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onSaveText(draft)}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Escreva…"
          className="h-full w-full resize-none bg-transparent outline-none"
          style={textStyle}
        />
      ) : (
        <div onDoubleClick={onStartEdit} className="h-full w-full overflow-auto whitespace-pre-wrap break-words" style={textStyle} title="Duplo-clique para editar">
          {el.content_data || <span className="text-stone-400">duplo-clique para escrever…</span>}
        </div>
      )}
    </div>
  );
}
