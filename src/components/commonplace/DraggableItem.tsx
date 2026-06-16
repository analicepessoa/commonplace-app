"use client";

/**
 * DraggableItem — wrapper de arrastar para Post-its e Stickers.
 *
 * A posição é mantida como transform (motion values x/y), então arrastar não
 * conflita com layout. Ao soltar (onDragEnd) reporta a posição final para
 * persistir em `floating_elements`. Ao tocar/clicar reporta foco para subir o
 * z-index.
 */

import { motion, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

interface DraggableItemProps {
  initialX: number;
  initialY: number;
  scale?: number;
  rotation?: number;
  zIndex?: number;
  /** Limites de arrasto (a área do canvas). */
  constraintsRef: React.RefObject<HTMLElement | null>;
  onDragEnd: (pos: { pos_x: number; pos_y: number }) => void;
  onFocus: () => void;
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
  children,
}: DraggableItemProps) {
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  return (
    <motion.div
      drag
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
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {children}
    </motion.div>
  );
}
