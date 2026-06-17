"use client";

/**
 * CanvasBoard — área de trabalho absoluta (X, Y) de uma página do Commonplace.
 *
 * Renderiza o texto fixo da nota e, por cima, os elementos flutuantes
 * (post-its e stickers) arrastáveis. Cada movimento (onDragEnd) persiste
 * pos_x/pos_y em `floating_elements`; clicar num item o traz para o topo
 * (z-index recalculado).
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

  useEffect(() => {
    listFloatingElements(entry.id)
      .then(setElements)
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, [entry.id]);

  async function addPostIt() {
    const text = window.prompt("Texto do post-it:", "");
    if (text === null) return;
    try {
      const created = await createFloatingElement({
        entry_id: entry.id,
        type: "post-it",
        content_data: text,
        pos_x: 40 + Math.random() * 80,
        pos_y: 40 + Math.random() * 80,
        z_index: maxZ() + 1,
      });
      setElements((prev) => [...prev, created]);
    } catch (e) {
      alert("Erro ao criar post-it: " + (e as Error).message);
    }
  }

  async function addSticker(emoji: string) {
    try {
      const created = await createFloatingElement({
        entry_id: entry.id,
        type: "sticker",
        content_data: emoji,
        pos_x: 40 + Math.random() * 120,
        pos_y: 40 + Math.random() * 120,
        z_index: maxZ() + 1,
      });
      setElements((prev) => [...prev, created]);
    } catch (e) {
      alert("Erro ao criar sticker: " + (e as Error).message);
    }
  }

  function maxZ() {
    return elements.reduce((m, el) => Math.max(m, el.z_index), 0);
  }

  async function handleDragEnd(
    el: FloatingElement,
    pos: { pos_x: number; pos_y: number },
  ) {
    // Atualiza estado otimista e persiste.
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, ...pos } : e)),
    );
    try {
      await updatePosition(el.id, pos);
    } catch (e) {
      console.error("Falha ao salvar posição:", e);
    }
  }

  async function handleFocus(el: FloatingElement) {
    const newZ = maxZ() + 1;
    if (el.z_index === newZ - 1 && el.z_index === maxZ()) return; // já no topo
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, z_index: newZ } : e)),
    );
    try {
      await bringToFront(el.id, entry.id);
    } catch (e) {
      console.error("Falha ao subir z-index:", e);
    }
  }

  async function handleEditPostIt(el: FloatingElement) {
    const text = window.prompt("Editar post-it:", el.content_data ?? "");
    if (text === null) return;
    setElements((prev) =>
      prev.map((e) => (e.id === el.id ? { ...e, content_data: text } : e)),
    );
    try {
      await updateFloatingElement(el.id, { content_data: text });
    } catch (e) {
      console.error("Falha ao editar post-it:", e);
    }
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
          >
            {el.type === "sticker" ? (
              <div
                onDoubleClick={() => handleDelete(el)}
                className="select-none text-4xl drop-shadow"
                title="Arraste para mover · duplo-clique para remover"
              >
                {el.content_data}
              </div>
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
        Arraste post-its e stickers livremente. A posição é salva
        automaticamente; clicar traz o item para frente.
      </p>
    </div>
  );
}
