import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonte serifada clássica para títulos (Grimoire)
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fonte manuscrita para anotações e corpo
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Grimoire Commonplace",
  description: "Caderno digital mágico e rotinas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="paper-bg min-h-full flex flex-col relative">
        {/* Decorações Globais Dark Academia (z-index negativo para ficar sempre no fundo) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden mix-blend-multiply opacity-80 -z-50">
           <img src="/grimoire/academia_top.png" className="absolute top-0 right-0 w-[400px] max-w-[50vw] object-contain object-top opacity-90" alt="Top Decoration" />
           <img src="/grimoire/academia_bottom.png" className="absolute bottom-0 right-0 w-[500px] max-w-[60vw] object-contain object-bottom opacity-90" alt="Bottom Decoration" />
           
           <div className="absolute top-10 left-10 opacity-70">
              <span className="font-sans border-b border-ink border-t border-ink py-1 px-4 text-ink-soft tracking-widest text-sm uppercase font-bold">Date Due</span>
           </div>
        </div>

        {/* Wrapper principal do conteúdo */}
        <div className="flex-1 w-full relative z-0 pb-32">
          {children}
        </div>
      </body>
    </html>
  );
}
