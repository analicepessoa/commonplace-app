import type { MetadataRoute } from "next";

/** Manifest PWA — permite instalar o app com ícone e cores próprias. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Commonplace & Rotinas",
    short_name: "Commonplace",
    description:
      "Caderno digital, rotinas, diário, saúde, pets, compras e finanças.",
    start_url: "/",
    display: "standalone",
    background_color: "#eeddbf",
    theme_color: "#8f3a2e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
