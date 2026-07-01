"use client";

/**
 * Notebook — folha de caderno pautada e escrevível para a nota do Commonplace.
 * Escreve no `body_content` da entry (salva ao sair do campo). As linhas vêm da
 * classe utilitária `.grimoire-lines`; o line-height casa com o espaçamento das
 * pautas para o texto cair em cima das linhas.
 */

import { useState } from "react";
import { updateEntry } from "@/lib/api";
import type { CommonplaceEntry } from "@/lib/database.types";

export default function Notebook({ entry }: { entry: CommonplaceEntry }) {
  const [value, setValue] = useState(entry.body_content ?? "");
  const [saved, setSaved] = useState(true);

  function save() {
    updateEntry(entry.id, { body_content: value })
      .then(() => setSaved(true))
      .catch((e) => console.error("notebook save falhou:", e));
  }

  return (
    <section className="grimoire-card">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="grimoire-header text-base">📓 Caderno</h2>
        <span className="text-xs text-ink-soft/60">{saved ? "salvo" : "editando…"}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        onBlur={save}
        placeholder="Escreva à vontade…"
        className="grimoire-lines w-full resize-none bg-transparent font-hand text-2xl text-ink outline-none placeholder:text-ink-soft/40"
        style={{ lineHeight: "32px", minHeight: "55vh", paddingTop: "3px" }}
      />
    </section>
  );
}
