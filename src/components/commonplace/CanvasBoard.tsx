"use client";

/**
 * CanvasBoard — área de trabalho absoluta (X, Y) de uma página do Commonplace.
 *
 * Renderiza o texto fixo da nota e, por cima, os elementos flutuantes:
 *  - sticker  : emoji decorativo
 *  - post-it  : recado curto (texto fixo, pequeno)
 *  - note     : bloco de nota grande, editável inline e redimensionável
 *
 * Movimento (onDragEnd) persiste pos_x/pos_y; clicar traz o item ao topo;
 * redimensionar a nota persiste width/height.
 */

import { useEffect, useRef, useState } from "react";
import {
  listFloatingElements,
  createFloatingElement,
  updatePosition,
  bringToFront,
  updateFloatingElement,
  deleteFloatingElement,
} from "@/lib/api";
import type { CommonplaceEntry, FloatingElement } from "@/lib/database.types";
import DraggableItem from "./DraggableItem";

const STICKERS = ["⭐", "❤️", "📌", "🌸", "✅", "🔥", "💡", "☕"];

export default function CanvasBoard({ entry }: { entry: CommonplaceEntry }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    listFloatingElements(entry.id)
      .then(setElements)
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [entry.id]);

  function maxZ() {
    return elements.reduce((m, el) => Math.max(m, el.z_index), 0);
  }

  async function addPostIt() {
    const text = window.prompt("Texto do post-it (curto):", "");
    if (text === null) return;
    await create({ type: "post-it", content_data: text });
  }

  async function addNote() {
    const created = await create({
      type: "note",
      content_data: "",
      width: 260,
      height: 180,
    });
    if (created) setEditingId(created.id);
  }

  async function addSticker(emoji: string) {
    await create({ type: "sticker", content_data: emoji });
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

  async function handleDragEnd(
    el: FloatingElement,
    pos: { pos_x: number; pos_y: number },
  ) {
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, ...pos } : e)),
    );
    try {
      await updatePosition(el.id, pos);
    } catch (e) {
      console.error("Falha ao salvar posição:", e);
    }
  }

  async function handleResize(
    el: FloatingElement,
    size: { width: number; height: number },
  ) {
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, ...size } : e)),
    );
    try {
      await updateFloatingElement(el.id, size);
    } catch (e) {
      console.error("Falha ao salvar tamanho:", e);
    }
  }

  async function handleFocus(el: FloatingElement) {
    if (el.z_index === maxZ()) return; // já no topo
    const newZ = maxZ() + 1;
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, z_index: newZ } : e)),
    );
    try {
      await bringToFront(el.id, entry.id);
    } catch (e) {
      console.error("Falha ao subir z-index:", e);
    }
  }

  async function saveContent(el: FloatingElement, text: string) {
    setEditingId(null);
    if (text === el.content_data) return;
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, content_data: text } : e)),
    );
    try {
      await updateFloatingElement(el.id, { content_data: text });
    } catch (e) {
      console.error("Falha ao salvar texto:", e);
    }
  }

  async function handleEditPostIt(el: FloatingElement) {
    const text = window.prompt("Editar post-it:", el.content_data ?? "");
    if (text === null) return;
    await saveContent(el, text);
  }

  async function handleDelete(el: FloatingElement) {
    if (!confirm("Remover este elemento?")) return;
    setElements((prev) => prev.filter((e) => e.id !== el.id));
    try {
      await deleteFloatingElement(el.id);
    } catch (e) {
      console.error("Falha ao remover:", e);
    }
  }

  return (
    <div>
      {/* Barra de ferramentas */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={addNote}
          className="rounded-lg bg-sky-200 px-3 py-1.5 text-sm font-medium text-sky-900 shadow-sm transition hover:bg-sky-300"
        >
          + Nota
        </button>
        <button
          onClick={addPostIt}
          className="rounded-lg bg-amber-200 px-3 py-1.5 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-300"
        >
          + Post-it
        </button>
        <span className="ml-1 text-sm text-stone-400">Stickers:</span>
        {STICKERS.map((s) => (
          <button
            key={s}
            onClick={() => addSticker(s)}
            className="rounded-lg px-2 py-1 text-lg transition hover:bg-stone-100"
            title="Adicionar sticker"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="paper-lined relative h-[70vh] w-full overflow-hidden rounded-2xl border border-stone-200 shadow-[inset_0_2px_12px_rgba(0,0,0,0.06)]"
      >
        {/* Texto fixo da nota */}
        <div className="pointer-events-none absolute inset-0 p-6 pl-16">
          <h2 className="font-hand text-4xl font-bold text-ink">
            {entry.title}
          </h2>
          {entry.body_content && (
            <p className="mt-2 max-w-prose whitespace-pre-wrap text-lg leading-8 text-ink-soft">
              {entry.body_content}
            </p>
          )}
        </div>

        {loading && (
          <p className="absolute bottom-3 right-4 text-xs text-stone-400">
            carregando elementos…
          </p>
        )}
        {error && (
          <p className="absolute bottom-3 right-4 text-xs text-red-500">
            {error}
          </p>
        )}

        {/* Elementos flutuantes */}
        {elements.map((el) => (
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
            disableDrag={el.type === "note" && editingId === el.id}
            width={el.type === "note" ? (el.width ?? 260) : undefined}
            height={el.type === "note" ? (el.height ?? 180) : undefined}
            onResizeEnd={
              el.type === "note" ? (size) => handleResize(el, size) : undefined
            }
          >
            {el.type === "sticker" ? (
              <div
                onDoubleClick={() => handleDelete(el)}
                className="select-none text-4xl drop-shadow"
                title="Arraste para mover · duplo-clique para remover"
              >
                {el.content_data}
              </div>
            ) : el.type === "note" ? (
              <NoteBlock
                el={el}
                editing={editingId === el.id}
                onStartEdit={() => setEditingId(el.id)}
                onSave={(text) => saveContent(el, text)}
                onDelete={() => handleDelete(el)}
              />
            ) : (
              <div
                onDoubleClick={() => handleEditPostIt(el)}
                className="font-hand w-40 select-none rounded-sm bg-amber-200 p-3 text-lg leading-tight text-amber-950 shadow-md"
                style={{ boxShadow: "2px 4px 8px rgba(0,0,0,0.15)" }}
                title="Arraste para mover · duplo-clique para editar"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="whitespace-pre-wrap break-words">
                    {el.content_data || "(vazio)"}
                  </span>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(el);
                    }}
                    className="-mr-1 -mt-1 text-amber-700 hover:text-red-600"
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </DraggableItem>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Notas: duplo-clique para escrever, arraste o canto para
        redimensionar. Post-its e stickers: arraste para mover. Tudo salva
        automaticamente.
      </p>
    </div>
  );
}

/** Bloco de nota grande: texto fixo até dar duplo-clique (textarea inline). */
function NoteBlock({
  el,
  editing,
  onStartEdit,
  onSave,
  onDelete,
}: {
  el: FloatingElement;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (text: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(el.content_data ?? "");

  return (
    <div className="relative flex h-full w-full flex-col rounded-lg border border-stone-200 bg-white/95 p-3 shadow-md">
      <button
        onClick={(ev) => {
          ev.stopPropagation();
          onDelete();
        }}
        className="absolute right-1 top-1 z-10 text-stone-300 transition hover:text-red-500"
        title="Remover nota"
      >
        ×
      </button>
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onSave(draft)}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Escreva livremente…"
          className="font-hand h-full w-full resize-none bg-transparent text-lg leading-snug text-ink outline-none"
        />
      ) : (
        <div
          onDoubleClick={onStartEdit}
          className="font-hand h-full w-full overflow-auto whitespace-pre-wrap text-lg leading-snug text-ink"
          title="Duplo-clique para editar"
        >
          {el.content_data || (
            <span className="text-stone-400">duplo-clique para escrever…</span>
          )}
        </div>
      )}
    </div>
  );
}
