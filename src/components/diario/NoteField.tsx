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
        className="mt-1 w-full resize-none rounded-xl border border-stone-200 bg-white/70 px-3 py-2 leading-7 text-ink outline-none transition focus:border-stone-400 focus:bg-white"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 27px, #ececec 27px, #ececec 28px)",
          backgroundAttachment: "local",
        }}
      />
    </label>
  );
}
