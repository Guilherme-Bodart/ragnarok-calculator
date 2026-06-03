# Nightmare Project Brief

Ultima atualizacao: 2026-06-03

Este arquivo e um resumo rapido para outro chat/agente entender o projeto sem precisar redescobrir tudo do zero. Atualize quando mudar arquitetura, endpoints, dados normalizados, fluxo principal ou status da calculadora.

## Visao Geral

Nightmare e uma aplicacao Next.js + API NestJS para ferramentas de Ragnarok Online. Hoje o produto tem:

- Landing/home em `/`.
- Calculadora de dano em `/calculator`.
- Area de guildas em `/guilds`.
- Login/autenticacao e saves por conta via API separada.

Frontend principal fica em `app/` e `components/`. O core da calculadora fica em `packages/calculator-core`. A API NestJS fica em `api/`.

## Stack E Comandos

- Frontend: Next.js 16, React 19, TypeScript.
- API: NestJS, Prisma, PostgreSQL.
- Testes: Vitest.
- Design system: `components/ui` + estilos em `app/styles/ui.css`.

Comandos principais:

- `npm run dev`: roda o frontend.
- `npm run dev:api`: roda a API.
- `npm run dev:all`: roda frontend e API.
- `npm run test:calculator`: testes focados da calculadora.
- `npm run lint`: ESLint.
- `npm run build`: build Next.
- `npm run data:skill-tooltips`: gera tooltips de skills a partir do raw iRO local.

## Rotas Frontend

- `/`: landing.
- `/calculator`: workbench da calculadora.
- `/guilds`: entrada/redirecionamento de guildas.
- `/guilds/[slug]`: pagina da guilda.
- `/login`: login.
- `/profile`: perfil.

## Endpoints Next Locais

Estes endpoints rodam no app Next e servem dados leves para o browser:

- `GET /api/calculator/items?slot=&kind=&q=&limit=`
  - Busca indice leve de itens por slot ou cartas.
- `GET /api/calculator/items/:itemId`
  - Retorna detalhe completo de item normalizado para a calculadora.

Pendente para V1:

- `GET /api/calculator/monsters?q=&limit=`
- `GET /api/calculator/monsters/:monsterId`

## Endpoints API NestJS

Base esperada no frontend: `NEXT_PUBLIC_API_URL` ou `http://localhost:4000/api`.

Auth:

- `GET /auth/google`
- `GET /auth/google/callback`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Dados:

- `GET /data/items`
- `GET /data/monsters`
- `GET /data/skills`

Calculadora:

- `POST /calculator/damage`
- `GET /calculator/builds`
- `POST /calculator/builds`
- `PUT /calculator/builds/:buildId`
- `DELETE /calculator/builds/:buildId`

Guildas:

- `GET /guilds/me`
- `POST /guilds`
- `GET /guilds/:slug/dashboard`
- `DELETE /guilds/:slug`
- `POST /guilds/:slug/roles`
- `PATCH /guilds/:slug/roles/:roleId`
- `PATCH /guilds/:slug/members/:memberId/role`
- `PATCH /guilds/:slug/tools/:toolId/access`
- `POST /guilds/:slug/transfer-leadership`
- `GET /guilds/:slug/mvp-kills`
- `POST /guilds/:slug/mvp-kills`

Health:

- `GET /health`

## Dados Do Jogo

Dados normalizados ficam em `nightmare-data/normalized`:

- `items/items.en.json`: itens completos, arquivo grande.
- `monsters/monsters.en.json`: monstros completos.
- `skills/skills.en.json`: skills rAthena normalizadas.
- `skills/skill-tree.json`: arvore de skill ajustada para a calculadora.
- `skills/skill-tooltips.en.json`: dicionario por `bySkillCode` com descricoes do iRO.
- `skills/skill-tooltips.en.report.json`: relatorio de cobertura dos tooltips.

Dados gerados leves ficam em `nightmare-data/generated/calculator`:

- `items-by-slot/*.json`
- `cards-index.json`

Pendente:

- `monsters-index.json`.

Raw local ignorado pelo git:

- `nightmare-data/raw/iRo/skill_tree.json` usado pelo script de tooltips.

## Estado Atual Da Calculadora

Funcionando:

- Card de personagem com classe, base/job, status regular e trait.
- Arvore de skill por classe, com layout compacto, pontos por classe e tooltip de skill.
- Tooltip de skill usa portal para nao ser cortado pelo scroll.
- Select de classe usa `RichSelect` do design system.
- Itens/cartas carregam por API local leve.
- Modal de item tem preview e suporte a refino/cartas.
- Buffs manuais e buffs de skill existem, ainda simples.
- Saves locais via localStorage.
- Saves por conta via API NestJS `calculator/builds`.
- Testes focados da calculadora existem em `npm run test:calculator`.

Ainda incompleto para V1:

- Card de ataque separado para skill/nivel.
- Monstros reais no frontend; alvo ainda depende de dataset demo.
- Resultado precisa mostrar `precision`, warnings e `formulaId`.
- Core ainda marca calculo como `prototype`.
- Poucas formulas especificas de skill estao validadas; fallback generico cobre o resto.
- Payload precisa evoluir para secoes nomeadas com migracao local.
- Buff catalog precisa ficar versionado e mais claro.
- Paperdoll precisa mostrar melhor nome curto/cartas equipadas.

## Core Da Calculadora

Pacote: `packages/calculator-core`.

Responsabilidades:

- Conversao de dados rAthena normalizados.
- Pontos de status.
- Job bonuses/basepoints.
- Parser de scripts rAthena para modificadores.
- Agregacao de modificadores.
- Damage engine e formula pipeline.
- Skill formula registry.

Estado de precisao:

- `calculateDamageFromDataset` retorna `meta.precision: "prototype"`.
- `StaticSkillFormula` tem formulas especificas iniciais como `SM_BASH` e `MG_COLDBOLT`.
- `GenericSkillFormula` e fallback.
- Unsupported item script statements sao preservados e devem ser exibidos ao usuario.

## Design System

Componentes compartilhados em `components/ui`:

- `Button`
- `IconButton`
- `Field` / `Input` / `FieldValue`
- `Select`
- `RichSelect`
- `NumberSelect`
- `Modal`
- `Panel`
- `PanelHeader`
- `Tabs`
- `FeaturePill`

Estilos compartilhados em `app/styles/ui.css`.

Regra importante: novos controles reutilizaveis devem ir para `components/ui` e usar classes `ui-*`. CSS local deve ficar para layout/composicao do dominio.

## Roadmap Atual

Roadmap detalhado da calculadora V1: `CALCULATOR_ROADMAP.md`.

Log historico de refactors/commits: `CALCULATOR_REFACTOR_LOG.md`.

## Como Atualizar Este Arquivo

Atualize este briefing quando:

- Criar/remover endpoint.
- Mudar formato de payload ou schema.
- Adicionar novo dado gerado/normalizado.
- Mudar status funcional da calculadora.
- Adicionar componente relevante ao design system.
- Fechar uma etapa importante do roadmap.
