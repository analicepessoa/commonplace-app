"use client";

import React from "react";
import Link from "next/link";

// Componentes SVG Inline para ícones mágicos
const MoonStarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" fillOpacity="0.8"/>
    <path d="M19 3v4" />
    <path d="M21 5h-4" />
  </svg>
);

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FeatherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

const CoffeeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

export default function GrimoirePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 lg:py-12 min-h-screen">
      
      {/* Botão de voltar para não prender o usuário */}
      <Link href="/" className="inline-flex items-center gap-2 mb-8 text-ink-soft hover:text-ink transition-colors font-hand text-xl">
        <span>← Voltar para Rotina atual</span>
      </Link>

      <div className="relative p-6 lg:p-12 min-h-[800px] flex flex-col justify-center">
        
        {/* Decorações Dark Academia nos cantos absolutos (atrás do texto) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden mix-blend-multiply opacity-90 -z-10">
           <img src="/grimoire/academia_top.png" className="absolute top-0 right-0 w-[400px] max-w-[50vw] object-contain object-top opacity-90" alt="Top Decoration" />
           <img src="/grimoire/academia_bottom.png" className="absolute bottom-0 right-0 w-[500px] max-w-[60vw] object-contain object-bottom opacity-90" alt="Bottom Decoration" />
           
           {/* Adicionando alguns enfeites manuais na esquerda para equilibrar baseado na imagem */}
           <div className="absolute top-10 left-10 opacity-70">
              <span className="font-sans border-b border-ink border-t border-ink py-1 px-4 text-ink-soft tracking-widest text-sm uppercase">Date Due</span>
           </div>
        </div>

        {/* Header da Página */}
        <header className="flex flex-col items-center mb-16 text-center relative z-10 pt-10">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="flex items-end gap-2 px-2 pb-1">
              <span className="font-sans text-xl tracking-wider text-ink font-bold uppercase text-sm border-b border-ink/40">Date:</span>
              <span className="font-hand text-3xl text-ink font-bold">22 Juin 2026</span>
            </div>
            
            <div className="flex gap-2">
            </div>
          </div>

          <div className="flex items-center gap-4 text-ink my-4">
            <h1 className="font-hand text-4xl lg:text-5xl tracking-wide text-ink font-bold italic">"I have lived a thousand lives."</h1>
          </div>
        </header>

        {/* Layout Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Coluna Esquerda */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
            
            {/* Priorités du jour */}
            <section>
              <h2 className="grimoire-header text-xl mb-4">
                <MoonStarIcon /> Priorités du jour
              </h2>
              <ul className="space-y-4 font-hand text-2xl text-ink pl-2">
                <li className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <span>1.</span>
                  <span className="flex-1">Meditar por 20 minutos</span>
                </li>
                <li className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <span>2.</span>
                  <span className="flex-1">Terminar o design do app</span>
                </li>
                <li className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <span>3.</span>
                  <span className="flex-1">Caminhada na natureza</span>
                </li>
              </ul>
            </section>

            {/* Tâches */}
            <section>
              <h2 className="grimoire-header text-xl mb-4">
                <StarIcon /> Tâches
              </h2>
              <ul className="space-y-3 font-hand text-2xl text-ink pl-2">
                <li className="flex items-center gap-3 border-b border-ink/20 pb-1">
                  <input type="checkbox" className="grimoire-checkbox" defaultChecked />
                  <span className="flex-1">Comprar grãos de café</span>
                </li>
                <li className="flex items-center gap-3 border-b border-ink/20 pb-1">
                  <input type="checkbox" className="grimoire-checkbox" />
                  <span className="flex-1">Responder emails do projeto</span>
                </li>
                <li className="flex items-center gap-3 border-b border-ink/20 pb-1">
                  <input type="checkbox" className="grimoire-checkbox" />
                  <span className="flex-1">Ler 1 capítulo do livro</span>
                </li>
              </ul>
            </section>

            {/* Rituels & Corps */}
            <section>
              <h2 className="grimoire-header text-xl mb-4">
                <CoffeeIcon /> Rituels & Corps
              </h2>
              <div className="space-y-2 font-hand text-2xl text-ink pl-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="grimoire-checkbox" defaultChecked />
                  <span>Mouvement</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="grimoire-checkbox" defaultChecked />
                  <span>Eau / Thé</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="grimoire-checkbox" />
                  <span>Soin personnel</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="grimoire-checkbox" defaultChecked />
                  <span>Respiration</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="grimoire-checkbox" />
                  <span>Maison</span>
                </label>
              </div>
            </section>

            {/* Énergie du jour */}
            <section className="border-t-2 border-ink/20 pt-6 mt-4">
              <h2 className="grimoire-header text-xl mb-4">
                <span className="w-5 h-5 rounded-full bg-ink inline-block shadow-inner mr-1"></span> Énergie du jour
              </h2>
              <div className="space-y-3 font-hand text-2xl text-ink pl-2">
                <div className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <input type="checkbox" className="grimoire-checkbox mb-1" />
                  <span>Humeur:</span>
                  <span className="flex-1 text-ink-soft">Serena</span>
                </div>
                <div className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <input type="checkbox" className="grimoire-checkbox mb-1" />
                  <span>Énergie:</span>
                  <span className="flex-1 text-ink-soft">Alta</span>
                </div>
                <div className="flex items-end gap-2 border-b border-ink/30 pb-1">
                  <input type="checkbox" className="grimoire-checkbox mb-1" />
                  <span>Mot-clé:</span>
                  <span className="flex-1 text-ink-soft">Foco</span>
                </div>
              </div>
            </section>

          </div>

          {/* Coluna Direita */}
          <div className="col-span-1 lg:col-span-7 flex flex-col gap-8">
            
            {/* Pensées / Notes */}
            <section className="flex-1 min-h-[400px]">
              <div className="h-full flex flex-col p-2">
                <h2 className="font-sans font-bold text-xl flex items-center gap-2 mb-4 text-ink">
                  <FeatherIcon /> Pensées / Notes
                </h2>
                <div className="flex-1 p-2">
                  <p className="font-hand text-2xl text-ink font-bold leading-[34px] pt-[2px] mr-10 lg:mr-32">
                    A nova estética "Dark Academia" transformou este espaço em um verdadeiro diário de couro com folhas de pauta avermelhada.<br />
                    Toda a página agora tem linhas de pauta de ponta a ponta. Os elementos gráficos foram movidos para os cantos e não possuem bordas escuras delimitando as seções.
                  </p>
                </div>
              </div>
            </section>

            {/* Fermeture */}
            <section className="mt-4 mr-10 lg:mr-32">
              <h2 className="grimoire-header text-xl mb-4 font-bold text-ink">
                <MoonStarIcon /> Fermeture
              </h2>
              <div className="space-y-4 font-hand text-2xl text-ink pl-2 font-bold">
                <div className="flex items-end gap-2 border-b border-ink/40 pb-1">
                  <span>Gratitude:</span>
                  <span className="flex-1 text-ink">Pelo dia produtivo e calmo.</span>
                </div>
                <div className="flex items-end gap-2 border-b border-ink/40 pb-1">
                  <span>Fierté:</span>
                  <span className="flex-1 text-ink">Consegui terminar o planejamento.</span>
                </div>
                <div className="flex items-end gap-2 border-b border-ink/40 pb-1">
                  <span>À déposer:</span>
                  <span className="flex-1 text-ink">A ansiedade sobre amanhã.</span>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
