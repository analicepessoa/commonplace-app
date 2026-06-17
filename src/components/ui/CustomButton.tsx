/**
 * CustomButton — botão com visual de carimbo/desenho à mão (bordas tortas,
 * fonte manuscrita e sombra deslocada que afunda ao clicar).
 */

import type { ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Cor de acento (hex) aplicada à borda e ao texto. */
  accent?: string;
  size?: "sm" | "md";
}

export default function CustomButton({
  accent,
  size = "md",
  className = "",
  style,
  children,
  ...rest
}: CustomButtonProps) {
  const pad = size === "sm" ? "px-3 py-1 text-base" : "px-5 py-2 text-lg";
  return (
    <button
      className={`btn-stamp inline-flex items-center gap-2 ${pad} ${className}`}
      style={{
        ...(accent ? { borderColor: accent, color: accent } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
