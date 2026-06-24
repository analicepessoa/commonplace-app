/**
 * Doodle — pequenas ilustrações de papelaria em traço (livros, caneta,
 * tinteiro, caneca…) para decorar as páginas com ar de caderno, em sépia
 * discreto. Puramente decorativo (não interativo).
 */

import type { ReactNode } from "react";

type DoodleName =
  | "books"
  | "openBook"
  | "pencil"
  | "pen"
  | "ink"
  | "mug"
  | "leaf";

const PATHS: Record<DoodleName, ReactNode> = {
  books: (
    <>
      <rect x="10" y="40" width="44" height="10" rx="2" />
      <rect x="13" y="30" width="38" height="10" rx="2" />
      <rect x="9" y="20" width="46" height="10" rx="2" />
      <line x1="44" y1="20" x2="44" y2="30" />
    </>
  ),
  openBook: (
    <>
      <path d="M32 19 C 25 15, 14 15, 8 19 L 8 45 C 14 41, 25 41, 32 45 C 39 41, 50 41, 56 45 L 56 19 C 50 15, 39 15, 32 19 Z" />
      <line x1="32" y1="19" x2="32" y2="45" />
      <path d="M13 25 H 26 M13 31 H 26 M38 25 H 51 M38 31 H 51" />
    </>
  ),
  pencil: (
    <>
      <path d="M20 46 L 42 24 L 48 30 L 26 52 Z" />
      <path d="M20 46 L 15 55 L 26 52" />
      <line x1="42" y1="24" x2="48" y2="30" />
    </>
  ),
  pen: (
    <>
      <path d="M14 52 C 32 46, 46 28, 52 12 C 38 18, 24 30, 16 46 Z" />
      <line x1="16" y1="46" x2="24" y2="40" />
    </>
  ),
  ink: (
    <>
      <rect x="19" y="30" width="26" height="22" rx="3" />
      <rect x="26" y="21" width="12" height="9" />
      <line x1="23" y1="21" x2="41" y2="21" />
      <line x1="32" y1="36" x2="32" y2="46" />
      <line x1="27" y1="41" x2="37" y2="41" />
    </>
  ),
  mug: (
    <>
      <path d="M16 26 H 44 V 46 C 44 50, 40 52, 36 52 H 24 C 20 52, 16 50, 16 46 Z" />
      <path d="M44 30 C 54 30, 54 44, 44 44" />
      <path d="M24 14 C 24 18, 28 18, 28 14 M32 14 C 32 18, 36 18, 36 14" />
    </>
  ),
  leaf: (
    <>
      <path d="M14 50 C 20 22, 44 16, 52 14 C 50 36, 36 50, 14 50 Z" />
      <path d="M14 50 C 26 40, 38 30, 50 18" />
    </>
  ),
};

export default function Doodle({
  name,
  size = 56,
  className = "",
  style,
}: {
  name: DoodleName;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
