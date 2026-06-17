"use client";

/**
 * DraggableItem — wrapper de arrastar para Post-its, Stickers e Notas.
 *
 * Posição mantida como transform (motion values). Opcionalmente redimensionável
 * (alça no canto inferior direito) e com arrasto desativável (durante edição de
 * texto).
 */

import { motion, useMotionValue } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

interface DraggableItemProps {
  initialX: number;
  initialY: number;
  scale?: number;
  rotation?: number;
  zIndex?: number;
  constraintsRef: React.RefObject<HTMLElement | null>;
  onDragEnd: (pos: { pos_x: number; pos_y: number }) => void;
  onFocus: () => void;
  /** Desliga o arrasto (ex.: enquanto edita o texto de uma nota). */
  disableDrag?: boolean;
  /** Se definido, o item fica redimensionável a partir deste tamanho. */
  width?: number;
  height?: number;
  onResizeEnd?: (size: { width: number; height: number }) => void;
  children: ReactNode;
}

export default function DraggableItem({
  initialX,
  initialY,
  scale = 1,
  rotation = 0,
  zIndex = 1,
  constraintsRef,
  onDragEnd,
  onFocus,
  disableDrag = false,
  width,
  height,
  onResizeEnd,
  children,
}: DraggableItemProps) {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  const resizable = width != null && height != null && onResizeEnd != null;
  const [size, setSize] = useState({ width: width ?? 0, height: height ?? 0 });
  const sizeRef = useRef(size);

  function startResize(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = sizeRef.current.width;
    const startH = sizeRef.current.height;

    function move(ev: PointerEvent) {
      const next = {
        width: Math.max(120, startW + (ev.clientX - startX)),
        height: Math.max(80, startH + (ev.clientY - startY)),
      };
      sizeRef.current = next;
      setSize(next);
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onResizeEnd?.(sizeRef.current);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <motion.div
      drag={!disableDrag}
      dragConstraints={constraintsRef}
      dragMomentum={false}
      dragElastic={0.05}
      onPointerDown={onFocus}
      onDragEnd={() => onDragEnd({ pos_x: x.get(), pos_y: y.get() })}
      whileDrag={{ cursor: "grabbing" }}
      style={{
        x,
        y,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex,
        rotate: rotation,
        scale,
        cursor: disableDrag ? "default" : "grab",
        touchAction: "none",
        ...(resizable
          ? { width: size.width, height: size.height }
          : {}),
      }}
    >
      <div style={resizable ? { width: "100%", height: "100%" } : undefined}>
        {children}
      </div>

      {resizable && (
        <div
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          title="Redimensionar"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.25) 50%)",
            borderBottomRightRadius: 4,
          }}
        />
      )}
    </motion.div>
  );
}
