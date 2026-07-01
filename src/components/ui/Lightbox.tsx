"use client";

/**
 * Lightbox — overlay para ver uma mídia (foto/vídeo/áudio) por inteiro, sem
 * corte. A imagem entra em "ajuste à tela" (object-contain) e o clique alterna
 * níveis de zoom (1x → 1.75x → 2.5x → volta), permitindo arrastar/rolar para ver
 * detalhes. Fecha no ×, no Esc ou clicando no fundo.
 */

import { useEffect, useState } from "react";

const ZOOMS = [1, 1.75, 2.5];

interface LightboxProps {
  url: string;
  kind: "image" | "video" | "audio";
  caption?: string | null;
  onClose: () => void;
}

export default function Lightbox({ url, kind, caption, onClose }: LightboxProps) {
  const [zoomIdx, setZoomIdx] = useState(0);
  const zoom = ZOOMS[zoomIdx];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-2xl leading-none text-white transition hover:bg-black/80"
        title="Fechar (Esc)"
      >
        ×
      </button>

      {/* Área de visualização — para a imagem, rolável quando ampliada */}
      <div
        className="max-h-full max-w-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={caption ?? ""}
            onClick={() => setZoomIdx((i) => (i + 1) % ZOOMS.length)}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center top",
              cursor: zoomIdx === ZOOMS.length - 1 ? "zoom-out" : "zoom-in",
            }}
            className="max-h-[88vh] max-w-[92vw] object-contain transition-transform duration-200 select-none"
          />
        ) : kind === "video" ? (
          <video src={url} controls autoPlay className="max-h-[88vh] max-w-[92vw]" />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-paper p-8">
            <span className="text-5xl">🎵</span>
            <audio src={url} controls autoPlay />
          </div>
        )}
      </div>

      {kind === "image" && (
        <p className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-sm text-white/70">
          {caption ? `${caption} · ` : ""}clique na foto para {zoomIdx === ZOOMS.length - 1 ? "reduzir" : "ampliar"}
        </p>
      )}
    </div>
  );
}
