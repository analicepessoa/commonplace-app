"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

async function resizeImage(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível abrir a foto."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Formato de imagem inválido."));
    element.src = source;
  });
  const scale = Math.min(1, 900 / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.76);
}

export default function FoodAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function analyze(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const image = await resizeImage(file);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Faça login novamente para usar a análise.");
      const response = await fetch("/api/nutrition/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image, mimeType: "image/jpeg" }),
      });
      const payload = (await response.json()) as { result?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Não foi possível analisar a foto.");
      setResult(payload.result || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível analisar a foto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#7396a4]/45 bg-[#e8f0ed]/65 p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="text-2xl" aria-hidden>⌁</span>
        <div>
          <h3 className="font-semibold text-ink">Scanner nutricional</h3>
          <p className="text-xs leading-relaxed text-ink-soft">Fotografe o prato para receber uma estimativa de calorias e macronutrientes.</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={analyze} className="hidden" />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full rounded-lg bg-[#496d72] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Analisando a foto…" : "Fotografar e analisar prato"}
      </button>
      {error && <p className="mt-3 rounded-lg border border-accent/30 bg-paper/70 p-3 text-sm text-accent">{error}</p>}
      {result && (
        <div className="mt-3 rounded-lg border-l-4 border-[#496d72] bg-paper/80 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#496d72]">Estimativa da IA</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{result}</p>
        </div>
      )}
    </div>
  );
}
