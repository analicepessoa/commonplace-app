"use client";

/**
 * ReceiptUploader — anexa o print de um Pix/boleto, roda OCR (Tesseract.js) no
 * client, extrai Valor/Vencimento/Favorecido e preenche o lançamento. Ao
 * salvar, cria a transação e anexa o comprovante (exibido como polaroid).
 */

import { useRef, useState } from "react";
import { runReceiptOcr } from "@/lib/ocrProcessor";
import { pdfFirstPageToImage, isPdf } from "@/lib/pdfToImage";
import { createTransaction, uploadAttachment } from "@/lib/api";
import type { TransactionType } from "@/lib/database.types";

const inputCls =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400";

export default function ReceiptUploader({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState<{
    title: string;
    amount: string;
    type: TransactionType;
    due_date: string;
  }>({ title: "", amount: "", type: "expense", due_date: "" });

  async function handleFile(picked: File | null) {
    if (!picked) return;
    setProgress(0);
    let ocrImage: Blob = picked;
    try {
      if (isPdf(picked)) {
        setStatus("Convertendo PDF…");
        const { blob, dataUrl } = await pdfFirstPageToImage(picked);
        ocrImage = blob;
        // anexa a imagem renderizada (exibível como polaroid)
        setFile(
          new File([blob], picked.name.replace(/\.pdf$/i, "") + ".png", {
            type: "image/png",
          }),
        );
        setPreview(dataUrl);
      } else {
        setFile(picked);
        setPreview(URL.createObjectURL(picked));
      }
    } catch (e) {
      setStatus("Erro ao ler o arquivo: " + (e as Error).message);
      setProgress(null);
      return;
    }
    setStatus("Lendo comprovante…");
    try {
      const r = await runReceiptOcr(ocrImage, setProgress);
      setF((prev) => ({
        ...prev,
        title: r.payee ?? prev.title,
        amount: r.amount != null ? String(r.amount) : prev.amount,
        due_date: r.dueDate ?? prev.due_date,
      }));
      setStatus(
        r.amount || r.payee || r.dueDate
          ? "Li o comprovante! Confira e ajuste se preciso."
          : "Não consegui ler bem — preencha manualmente.",
      );
    } catch (e) {
      setStatus("Erro no OCR: " + (e as Error).message);
    } finally {
      setProgress(null);
    }
  }

  async function handleSave() {
    if (!f.title.trim() || !f.amount) {
      setStatus("Preencha ao menos descrição e valor.");
      return;
    }
    setSaving(true);
    try {
      const tx = await createTransaction({
        title: f.title.trim(),
        amount: Number(f.amount),
        type: f.type,
        due_date: f.due_date || null,
      });
      if (file) {
        await uploadAttachment("transaction", tx.id, file).catch((e) =>
          console.error("anexar comprovante falhou:", e),
        );
      }
      // limpa
      setFile(null);
      setPreview(null);
      setF({ title: "", amount: "", type: "expense", due_date: "" });
      setStatus("Lançamento salvo com o comprovante anexado. ✅");
      if (inputRef.current) inputRef.current.value = "";
      onSaved?.();
    } catch (e) {
      setStatus("Erro ao salvar: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Upload + polaroid */}
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-sky-200 px-4 py-2 text-sm font-medium text-sky-900 transition hover:bg-sky-300"
        >
          Anexar Pix / boleto (imagem ou PDF)
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {preview && (
          <div className="mt-4 inline-block max-w-full rotate-[-2deg] rounded-sm bg-white p-3 pb-8 shadow-[3px_6px_16px_rgba(0,0,0,0.2)]">
            {/* fita adesiva */}
            <div className="mx-auto mb-2 h-4 w-20 -rotate-2 bg-amber-200/70" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="comprovante" className="max-h-72 w-auto" />
          </div>
        )}

        {progress !== null && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-ink-soft">Reconhecendo… {progress}%</p>
          </div>
        )}
      </div>

      {/* Formulário */}
      <div className="space-y-2">
        {status && <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-ink-soft">{status}</p>}
        <label className="block text-xs text-ink-soft">Favorecido / descrição
          <input className={`${inputCls} mt-1 w-full`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs text-ink-soft">Valor (R$)
            <input className={`${inputCls} mt-1 w-full`} type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          </label>
          <label className="block text-xs text-ink-soft">Vencimento
            <input className={`${inputCls} mt-1 w-full`} type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} />
          </label>
        </div>
        <label className="block text-xs text-ink-soft">Tipo
          <select className={`${inputCls} mt-1 w-full`} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as TransactionType })}>
            <option value="expense">Saída</option>
            <option value="income">Entrada</option>
            <option value="savings">Guardar</option>
          </select>
        </label>
        <button onClick={handleSave} disabled={saving}
          className="mt-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90 disabled:opacity-50">
          {saving ? "Salvando…" : "Salvar lançamento"}
        </button>
      </div>
    </div>
  );
}
