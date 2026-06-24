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
        className="mt-1 w-full resize-none bg-transparent px-1 pt-1.5 font-hand text-2xl font-bold text-ink outline-none"
        style={{
          lineHeight: "34px",
          /* Retiramos as pautas locais para deixar as pautas do body aparecerem pelo fundo transparente */
        }}
      />
    </label>
  );
}
