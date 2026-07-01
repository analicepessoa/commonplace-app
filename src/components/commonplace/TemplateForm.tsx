"use client";

/**
 * TemplateForm — formulário estruturado de uma nota, conforme o template da
 * subcategoria (ex.: Leitura, Filme). Salva cada campo em entry_fields.
 * A capa/fotos ficam no MediaPanel; o canvas livre continua à parte.
 */

import { useEffect, useState } from "react";
import { listEntryFields, setEntryField } from "@/lib/api";
import type { TemplateDef } from "@/lib/templates";

export default function TemplateForm({
  entryId,
  template,
}: {
  entryId: string;
  template: TemplateDef;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    listEntryFields(entryId)
      .then((rows) => {
        const map: Record<string, string> = {};
        for (const r of rows) map[r.field] = r.value ?? "";
        setValues(map);
      })
      .catch(() => {});
  }, [entryId]);

  function set(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }
  function save(field: string, value: string) {
    setEntryField(entryId, field, value).catch((e) =>
      console.error("setEntryField falhou:", e),
    );
  }
  function setAndSave(field: string, value: string) {
    set(field, value);
    save(field, value);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {template.fields.map((f) => {
        const v = values[f.key] ?? "";
        const fullWidth = f.type === "textarea";
        return (
          <div key={f.key} className={fullWidth ? "sm:col-span-2" : ""}>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {f.label}
            </span>
            {f.type === "text" && (
              <input
                value={v}
                onChange={(e) => set(f.key, e.target.value)}
                onBlur={(e) => save(f.key, e.target.value)}
                className="grimoire-input mt-1 w-full text-sm"
              />
            )}
            {f.type === "date" && (
              <input
                type="date"
                value={v}
                onChange={(e) => setAndSave(f.key, e.target.value)}
                className="grimoire-input mt-1 w-full text-sm"
              />
            )}
            {f.type === "textarea" && (
              <textarea
                value={v}
                onChange={(e) => set(f.key, e.target.value)}
                onBlur={(e) => save(f.key, e.target.value)}
                rows={3}
                className="grimoire-input mt-1 w-full resize-none text-sm leading-6"
              />
            )}
            {f.type === "rating" && (
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAndSave(f.key, String(n))}
                    className="text-2xl leading-none transition"
                    style={{ color: Number(v) >= n ? "#f59e0b" : "#cbb894" }}
                    title={`${n} estrela${n > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
                {v && (
                  <button
                    onClick={() => setAndSave(f.key, "")}
                    className="ml-2 self-center text-xs text-ink-soft/50 hover:text-ink-soft"
                  >
                    limpar
                  </button>
                )}
              </div>
            )}
            {f.type === "boolean" && (
              <div className="mt-1 flex gap-2">
                {[
                  { val: "sim", label: "Sim" },
                  { val: "nao", label: "Não" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setAndSave(f.key, v === opt.val ? "" : opt.val)}
                    className={`rounded-full px-4 py-1 text-sm transition ${
                      v === opt.val
                        ? "bg-ink text-paper"
                        : "border border-[var(--rule-line)] text-ink-soft hover:bg-paper-shade/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
