/**
 * Highlighter — marca-texto dinâmico. Envolve um trecho e o pinta com a cor
 * desejada, com opacidade realista e preservação do efeito em múltiplas linhas.
 *
 *   <Highlighter color="#a855f7">trecho marcante</Highlighter>
 */

import type { CSSProperties, ReactNode } from "react";

interface HighlighterProps {
  /** Cor do marcador em hex (#rrggbb). Padrão: amarelo. */
  color?: string;
  className?: string;
  children: ReactNode;
}

function hexToRgb(hex: string): string {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export default function Highlighter({
  color = "#facc15",
  className = "",
  children,
}: HighlighterProps) {
  const style = { "--hl": hexToRgb(color) } as CSSProperties;
  return (
    <mark className={`highlighter bg-transparent ${className}`} style={style}>
      {children}
    </mark>
  );
}
