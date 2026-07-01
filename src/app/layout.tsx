import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat, Cinzel } from "next/font/google";
import "./globals.css";
import AuthGate from "@/components/auth/AuthGate";

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
  title: "Commonplace & Rotinas",
  description: "Caderno digital, rotinas, diário, saúde, pets, compras e finanças.",
  applicationName: "Commonplace",
  appleWebApp: {
    capable: true,
    title: "Commonplace",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#8f3a2e",
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
        {/* Decorações Globais Dark Academia — discretas, só nos cantos, bem ao fundo */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden mix-blend-multiply opacity-[0.18] -z-50">
           <img src="/grimoire/academia_top.png" className="absolute top-0 right-0 w-[260px] max-w-[34vw] object-contain object-top" alt="" aria-hidden />
           <img src="/grimoire/academia_bottom.png" className="absolute bottom-0 right-0 w-[300px] max-w-[40vw] object-contain object-bottom" alt="" aria-hidden />
        </div>

        {/* Wrapper principal do conteúdo */}
        <div className="flex-1 w-full relative z-0 pb-32">
          <AuthGate>{children}</AuthGate>
        </div>
      </body>
    </html>
  );
}
