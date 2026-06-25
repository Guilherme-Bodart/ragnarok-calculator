# Nightmare Project Brief

Ultima atualizacao: 2026-06-04

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
- `npm run test:calculator`: testes focados da calculadora, incluindo core de dano e payload salvo.
- `npm run typecheck`: checa os tipos do frontend usado pelo build.
- `npm run typecheck:test`: checa separadamente os tipos dos testes.
- `npm run lint`: ESLint.
- `npm run build`: build Next.
- `npm run data:skill-tooltips`: gera tooltips de skills a partir do raw iRO local.

O `tsconfig.json` do frontend cobre apenas codigo da aplicacao. Testes usam
`tsconfig.test.json`; scripts ficam fora do typecheck do build. JSONs
grandes da calculadora usam contratos TypeScript explicitos para evitar inferencia
estrutural de mais de um milhao de linhas durante cada build.

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
- `GET /api/calculator/monsters?q=&limit=`
  - Busca indice leve de monstros.
- `GET /api/calculator/monsters/:monsterId`
  - Retorna detalhe completo de monstro normalizado para a calculadora.

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
- `items/items.br.json`: nomes/descricoes LATAM usados como camada localizada quando houver o mesmo `itemId`.
- `monsters/monsters.en.json`: monstros completos.
- `skills/skills.en.json`: skills rAthena normalizadas.
- `skills/skill-tree.json`: arvore de skill ajustada para a calculadora.
- `skills/skill-tooltips.en.json`: dicionario por `bySkillCode` com descricoes do iRO.
- `skills/skill-tooltips.en.report.json`: relatorio de cobertura dos tooltips.

Dados gerados leves ficam em `nightmare-data/generated/calculator`:

- `items-by-slot/*.json`
- `cards-index.json`
- `monsters-index.json`.

Os endpoints Next leem os datasets completos de itens/monstros apenas no servidor.
Os JSONs grandes de skills continuam empacotados para a calculadora, mas nao entram
na inferencia estrutural do TypeScript.
Busca de equipamentos/cartas exige pelo menos 3 caracteres e usa debounce de 500ms
no modal para evitar carregar catalogos grandes ao abrir o select.

Raw local ignorado pelo git:

- `nightmare-data/raw/iRo/skill_tree.json` usado pelo script de tooltips.

## Estado Atual Da Calculadora

Funcionando:

- Card de personagem com classe, base/job, status regular e trait.
- Arvore de skill por classe, com layout compacto, pontos por classe e tooltip de skill.
- Tooltip de skill usa portal para nao ser cortado pelo scroll.
- Skills da calculadora aproveitam multiplicador/hits por nivel extraidos dos tooltips quando o formato e reconhecido.
- Card de ataque separado escolhe skill/nivel e mostra tipo, elemento, hits, multiplicador e aviso de precisao.
- Select de classe usa `RichSelect` do design system.
- Itens/cartas carregam por API local leve.
- Modal de item tem preview e suporte a refino/cartas.
- Troca de item preserva apenas cartas validas para o novo numero de slots.
- Paperdoll mostra nome curto do item equipado e quantidade de cartas.
- Monstros carregam por API local leve e o alvo injeta o detalhe escolhido no dataset de calculo.
- Resultado mostra `precision`, `formulaId`, warnings, multiplicadores principais e mods nao suportados.
- Buffs usam catalogo versionado inicial, com grupos manual/consumivel e preview de efeitos reconhecidos.
- Saves locais via localStorage.
- Saves por conta via API NestJS `calculator/builds`.
- Modal de builds carrega, salva como nova, atualiza, duplica e exclui builds da conta.
- Payload salvo esta na versao 2 com secoes `character`, `attack`, `tree`, `equipment`, `buffs` e `target`.
- Payload v1 flat e migrado automaticamente ao carregar.
- Testes focados da calculadora existem em `npm run test:calculator`.
- Core reconhece traits vindos de scripts de item (`bPow`, `bSta`, `bWis`, `bSpl`, `bCon`, `bCrt`) e aplica esses bonus nos status derivados.
- Core reconhece dano por classe de monstro (`bAddClass`, `bMagicAddClass`) e reducao defensiva por classe (`bSubClass`), com `Class_All` sempre aplicavel e `Class_Normal`/`Class_Boss` dependentes de `monster.classType`.
- Pipeline aplica dano fisico/magico por classe de monstro no final rate quando o alvo tem `classType`.
- Core reconhece `bDef`/`bMdef` em scripts de item e expoe `defense`/`magicDefense` no status calculado do personagem.
- Core reconhece `bRes`/`bMres` em scripts de item e expoe `res`/`mres` no status calculado do personagem.
- Core reconhece `bAtkEle` e usa o elemento da arma como fallback para skills fisicas sem elemento fixo.
- Pipeline aplica elemento no fim do calculo ofensivo e suporta resistencia elemental opcional no alvo via `monster.elementResistanceRates`.
- Core calcula cast/cooldown/DPS quando a skill possui tempos por nivel; cast variavel usa `DEX * 2 + INT`, cast fixo usa reducao flat + maior reducao percentual.
- Core calcula ASPD com formula bRO/Sigma aproximada: base classe/arma, bonus AGI/DEX, percentual de equipamentos, ponto fixo e cap 190/193 por base level.
- Core reconhece modificadores de cast/delay vindos de itens, incluindo variantes por skill, mas o calculo final de cast/DPS ainda e proximo passo.
- Core reconhece `bUseSPrate` e agrega `spCostRate` para futuro painel de custo/recursos da skill.
- Core reconhece `bPerfectHitAddRate` e expoe `perfectHitRate` no status calculado.
- Core reconhece modificadores de dano critico e poder de cura vindos de itens, mas engines finais de critico/cura ainda sao proximos passos.
- Core possui engine inicial de cast/DPS; quando `RoSkill` traz cast/cooldown por level, o resultado expoe ciclo e DPS no breakdown.
- Adapter rAthena ja popula cast variavel, cast fixo, pos-conjuracao e cooldown por level quando esses campos existem em `skills.en.json`.
- Core captura reducoes defensivas por raca/elemento (`bSubRace`, `bSubEle`) separadas dos modificadores ofensivos.

Ainda incompleto para V1:

- Core marca formulas especificas como `validated` e fallback generico como `prototype`.
- Formulas especificas iniciais incluem `SM_BASH`, `SM_MAGNUM`, `KN_BOWLINGBASH`, `MG_COLDBOLT`, `MG_FIREBOLT` e `MG_LIGHTNINGBOLT`; fallback generico cobre o resto.
- Buffs de skill da classe ainda precisam virar catalogo mais completo.
- UX visual do modal de item ainda pode ganhar imagens dos equipamentos no futuro.

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
- Parser leve de tooltip para preencher multiplicadores/hits por nivel antes do fallback generico.

Estado de precisao:

- `calculateDamageFromDataset` retorna `meta.precision: "prototype"`.
- `StaticSkillFormula` tem formulas especificas iniciais como `SM_BASH`, `SM_MAGNUM`, `KN_BOWLINGBASH` e bolts de mago.
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

`RichSelect` renderiza menu em portal para nao ser cortado por modal/painel com overflow.

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
