# Onde paramos — Commonplace & Rotinas

> Handoff entre sessões. Leia isto + o `CLAUDE.md` para continuar sem reler o código todo.
> Atualize ao fim de cada sessão. Última atualização: **2026-06-30**.

## 🟢 Status geral
App **publicado e funcionando** em https://commonplace-grimoire.netlify.app, com login obrigatório (AuthGate + RLS authenticated). Todas as grandes fases foram construídas. Faltam principalmente **rodar migrations pendentes** e **aplicar a estética grimoire nas telas reais**.

## ✅ Pronto (construído e em geral verificado)
- **Base**: Commonplace (índice por categoria, busca, canvas com post-it/stickers/notas arrastáveis via framer-motion, templates book/movie/recipe).
- **Rotina/Home** (`/`): dashboard controlado por DATA (MiniCalendar), hábitos com streak, água, refeições, rotinas com horário de saída, "resumo do dia" (mood, afirmação, lista de compras, mini-stats).
- **Diário** (`/diario`): visões Mensal/Semanal/Diário; notas e tarefas por data.
- **Saúde** (`/saude`): Consultas, Medicações, Calendário Menstrual.
- **Pets** (`/pets`): cadastro + logs (remédio/vacina/banho/peso) + fotos.
- **Finanças** (`/financas`): Controle Mensal, Metas (com foto+progresso), Gastos Futuros, Orçamentos, **OCR de comprovantes** (Tesseract.js).
- **Agenda** (`/agenda`): compromissos com data/hora, agrupados por mês.
- **Mídia**: bucket `media` + tabela `attachments` polimórfica + `MediaPanel`, plugado em várias abas.
- **Auth**: AuthGate (login e-mail/senha Supabase), RLS exigindo usuário autenticado.

## ❌ PENDÊNCIAS CONCRETAS (próximos passos)
1. **Rodar migrations que faltam no Supabase (SQL Editor, manual):**
   - `supabase/migrations/20260617_entry_templates.sql`
   - `supabase/migrations/20260617_financial_goals.sql`
   - `supabase/migrations/20260617_budgets.sql` (sem ela, os Orçamentos não funcionam)
   - `supabase/migrations/20260624_events.sql` (sem ela, a Agenda não funciona)
   - *(media, diary, health, pets, require_auth já foram rodadas)*
   - ⚠️ Confirmar quais já rodaram de fato antes de assumir — testar cada feature no ar.

2. ✅ **Estética Grimoire aplicada em todo o sistema** (sessão 2026-06-30). Vocabulário no `globals.css`:
   - `.grimoire-card` — caixinha de seção (pergaminho creme ~96% opaco, borda terracotta 1.5px, cantos arredondados, sombra). **É o look aprovado pela usuária.**
   - `.grimoire-header` — cabeçalho de seção (Cinzel, caixa-alta, ícone de tinta accent, filete terracotta).
   - `.grimoire-input` / `.grimoire-row` / `.grimoire-tabbar` — input, item de lista e barra de abas no tema pergaminho.
   - `.vintage-box`/`.vintage-header` **redefinidos** para o mesmo look limpo (antes era papel "rasgado") → atualizou Hábitos/Água/Calendário/Rotina/TodaySummary de uma vez (Home + Diário).
   - **Telas migradas**: Diário (Diário/Mensal/Semanal), Home (`/`), Saúde, Pets, Finanças, Agenda. Trocados `border-stone`/`bg-white`/`bg-emerald` estruturais por sépia/terracota; cores **financeiras** (verde=entrada, vermelho=saída, azul=guardar) mantidas por serem funcionais.
   - `tsc --noEmit` limpo; todas as rotas compilam 200.
   - **Commonplace** (índice, sub, nota/[id], TemplateForm), **Canvas** (barra/prancha/notas — post-it amarelo e nota branca mantidos de propósito) e **login (AuthGate)** também migrados. `ReceiptUploader` mantém o "comprovante" branco de papel de propósito (skeuomorfismo).

3. ✅ **Mídia com zoom + Pets com crachá** (sessão 2026-06-30):
   - **Lightbox** (`src/components/ui/Lightbox.tsx`): clicar em qualquer foto/vídeo do `MediaPanel` abre em tela cheia (object-contain, vê inteira), clique alterna zoom 1x→1.75x→2.5x, fecha no ×/Esc/fundo. Botão "+ Foto" do MediaPanel trocado de azul→accent.
   - **Pets**: os pets agora são **crachás com foto**. Clicar seleciona e rola até o detalhe (`detailRef`).
   - **Escolher a foto do crachá** (sem migration): a foto escolhida é marcada em `attachments.caption = "__cover__"` (constante `COVER_CAPTION` em `attachments.ts`; `setCoverAttachment()` garante capa única). O `MediaPanel` ganhou `coverMode` + `onCoverChange` → mostra ★/☆ em cada imagem; o crachá usa a marcada (cai na 1ª foto se nenhuma). A sentinela é filtrada na exibição (alt/lightbox) via `display()`. Sem foto marcada nem nenhuma imagem = 🐾.

## 💡 Ideias futuras (não pedidas explicitamente ainda)
- Diário separado reaproveitando os meses JAN–DEZ que saíram do Commonplace.
- Controle anticoncepcional (grade de pílulas) no Calendário Menstrual.
- Auto-cálculo de gasto por orçamento a partir de transações categorizadas (hoje `spent` é manual).
- MediaPanel embutido no Diário diário.

## 🎨 Estética atual decidida
Commonplace antigo / "diário de explorador": `--paper #ebe1c8` (pergaminho), `--ink #3b2f23` (sépia), `--accent #8f3a2e` (vinho/terracota). Manuscrito = Caveat. Menos rosa, mais sério/antigo. Botões primários `bg-accent`.

## 🆕 Compras, calculadoras, caderno e Finanças legível (2026-06-30)
- **Finanças mais legível**: linhas com barra colorida à esquerda por tipo (verde/vermelho/azul), título manuscrito grande, pílula de tipo + "pendente", valor em destaque (`tabular-nums`). Cards de resumo (`Stat`) maiores com barra colorida.
- **Página Compras** (`/compras`, link na Home): lista do mês + lista da semana (reusa `TaskChecklist`), notas/ideias (reusa `NoteField`), posts/fotos (`MediaPanel`) e calculadoras flutuantes.
  - **Persistência sem migration**: reaproveita `diary_tasks`/`diary_notes` com `period_key` namespeado `shop:YYYY-MM` (e `shop:YYYY-MM:semana`). `scope` continua `'monthly'` (respeita o CHECK). Fotos usam UUID determinístico por mês `monthMediaId()` (owner_id é UUID).
- **Calculadoras flutuantes** (`src/components/ui/CalculatorLayer.tsx`): botão flutuante abre N calculadoras arrastáveis e independentes (drag manual por pointer events). Colocadas em `/compras` e `/financas`.
- **Caderno no Commonplace** (`src/components/commonplace/Notebook.tsx`): folha pautada escrevível (classe `.grimoire-lines`, line-height 32px) salvando em `commonplace_entries.body_content` (onBlur). Fica na página da nota (`[id]`), acima do canvas de post-its/notas. *Obs.:* o canvas ainda mostra o `body_content` como marca-d'água ao fundo — só atualiza no reload.

## 🗑️ Excluir notas do Commonplace (2026-06-30)
- As notas ("posts") não tinham como ser apagadas. Adicionado **excluir** em dois lugares, usando o `deleteEntry` já existente:
  - Lista da subcategoria (`sub/[id]`): botão × em cada nota (com confirm + remoção otimista).
  - Página da nota (`[id]`): botão "Excluir nota" no topo → redireciona pra subcategoria (ou índice).

## 🗒️ Histórico de sessões
- 2026-06-30: **restyle grimoire em todo o sistema** — criadas as classes `.grimoire-card/-header/-input/-row/-tabbar` e redefinidos `.vintage-box/-header` (look limpo aprovado). Migradas Home, Diário (3 visões), Saúde, Pets, Finanças e Agenda. Pendências: rodar migrations + opcional aplicar no Commonplace/Canvas e no login. Ainda **não commitado** (working tree).
- 2026-06-30: restyle grimoire do Diário diário (`DailyView`, `TaskChecklist`) + classes `.page-title`/`.grimoire-header`.
- 2026-06-30: criados `CLAUDE.md` e `ESTADO_ATUAL.md` aqui na pasta do projeto, para o handoff carregar automático ao abrir a sessão NESTA pasta (antes a memória do Commonplace estava arquivada sob o projeto "portal do aluno" e não carregava aqui).
