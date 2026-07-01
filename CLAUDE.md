@AGENTS.md

# Commonplace & Rotinas

App pessoal **single-user** (caderno digital/commonplace + rotinas/hábitos + diário + saúde + pets + finanças com OCR). Estética de caderno/grimoire. **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase.**

> 📍 **Para continuar de onde paramos, leia primeiro `ESTADO_ATUAL.md`** (na raiz). Ele tem o status detalhado de cada fase e o que falta. Não precisa reler o código todo.

## ⚠️ Importantíssimo
- Este é o projeto **Commonplace**, em `C:\Users\anali\Downloads\commonplace-app`. NÃO confundir com o `portal do aluno` (projeto estático separado, em HTML puro).
- É **Next.js 16** (não a versão do seu treino) — veja `node_modules/next/dist/docs/` antes de escrever código novo (regra do AGENTS.md acima).

## Stack e setup
- Next.js 16 + Turbopack, React 19, TypeScript, Tailwind v4, App Router, `src/`, alias `@/*`.
- Supabase via `@supabase/supabase-js`. Credenciais em `.env.local` (já preenchido).
- Libs: `framer-motion` (drag no canvas), `tesseract.js` (OCR de comprovantes), `pdfjs-dist`.
- **Node.js**: instalado via winget (v20+). Em sessões PowerShell, carregar o PATH com:
  `[System.Environment]::GetEnvironmentVariable("Path","Machine")` antes de rodar `npm`.

## Como rodar
- Dev: `npm run dev` (porta 3000). O **Preview MCP não funciona** aqui — rodar o dev server manualmente em background no PowerShell (com PATH injetado).
- Teste de conexão Supabase: `node scripts/test-connection.mjs`.

## Supabase (pontos críticos)
- Projeto ref `fmfudnkkvwurcfdwbvkg` (URL https://fmfudnkkvwurcfdwbvkg.supabase.co).
- **Esse projeto NÃO é acessível pela integração MCP do Claude** (o MCP só enxerga outra org). Logo, **migrations são rodadas manualmente pela usuária no SQL Editor** do Supabase.
- Migrations ficam em `supabase/migrations/`. Padrão de policy: `anon_full_access`, mas após o login passou a exigir `authenticated` (ver `20260622_require_auth.sql`).
- ⚠️ Ao checar se uma tabela existe, use `.select('id').limit(1)` e olhe o `.error` — `select(count, head:true)` retorna OK (count=null) mesmo se a tabela não existir.

## Deploy
- **No ar**: https://commonplace-grimoire.netlify.app (Netlify). Build **na nuvem via GitHub** (build local no Windows falha no plugin do Next).
- **Deploy automático**: `git push origin main` → Netlify rebuilda.
- GitHub: https://github.com/analicepessoa/commonplace-app (origin/main).
- Vercel foi **abandonada** (não usar).
- Auth obrigatória: `AuthGate` (login Supabase e-mail/senha) em `src/components/auth/AuthGate.tsx`. Sem signup público — usuária gerencia usuários pelo painel Supabase.

## Estrutura (resumo)
- `src/app/` — rotas: `/` (home "resumo do dia"), `/commonplace`, `/diario`, `/saude`, `/pets`, `/financas`, `/agenda`, `/grimoire` (mockup).
- `src/lib/api/` — acesso a dados por domínio (`habits.ts`, `tracker.ts`, `routines.ts`, `diary.ts`, `health.ts`, `pets.ts`, `finance.ts`, `events.ts`, `attachments.ts`, `indexData.ts`...).
- `src/components/` — UI por domínio (`rotina/`, `diario/`, `ui/`, `auth/`).
- `supabase/migrations/` — SQL (rodadas manualmente no painel).

## Convenções
- Tudo em **português do Brasil**.
- App single-user; quando houver multiusuário, trocar policies por `auth.uid()`.
- Ao terminar uma sessão de trabalho, **atualizar `ESTADO_ATUAL.md`** para a próxima sessão começar barata.
