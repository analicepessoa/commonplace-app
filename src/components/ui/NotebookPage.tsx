/**
 * NotebookPage — wrapper que dá ao container a aparência de uma folha real
 * (pautada ou pontilhada), com sombra e cantos suaves.
 */

import type { ReactNode } from "react";

interface NotebookPageProps {
  variant?: "lined" | "dotted" | "plain";
  className?: string;
  children: ReactNode;
}

export default function NotebookPage({
  variant = "lined",
  className = "",
  children,
}: NotebookPageProps) {
  const texture =
    variant === "lined"
      ? "paper-lined"
      : variant === "dotted"
        ? "paper-dotted"
        : "";

  return (
    <div
      className={`relative rounded-2xl border border-stone-200/80 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] ${texture} ${className}`}
    >
      {/* leve realce no topo, como papel sob luz */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-6 rounded-t-2xl bg-gradient-to-b from-white/40 to-transparent" />
      {children}
    </div>
  );
}
