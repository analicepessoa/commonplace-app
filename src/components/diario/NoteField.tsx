"use client";

/**
 * NoteField — bloco de texto rotulado (controlado pelo pai). Salva ao sair do
 * campo (onBlur). Usado nas seções do diário (Notas, Metas, Afirmação, etc.).
 */

interface NoteFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function NoteField({
  label,
  value,
  onChange,
  onSave,
  placeholder,
  rows = 4,
}: NoteFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full resize-none rounded-xl border border-[#d8c19a] bg-card px-3 pt-1.5 text-ink outline-none transition focus:border-[#b98f63]"
        style={{
          lineHeight: "28px",
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, #cdbb96 27px, #cdbb96 28px)",
          backgroundAttachment: "local",
        }}
      />
    </label>
  );
}
