# Calculator Refactor Log

## Objetivo

Evoluir a calculadora sem espalhar regras em CSS/local state e sem carregar dados gigantes no client.

## Ordem Planejada

1. Tirar o catálogo completo de itens do bundle client.
2. Criar índices leves de itens por slot/card e endpoints locais de busca/detalhe.
3. Refatorar o modal de equipamento para buscar itens sob demanda.
4. Versionar o payload salvo da build para preparar saves por conta/personagem.
5. Quebrar arquivos grandes de UI e CSS por domínio.
6. Separar o parser rAthena em fases menores.

## Log

### 2026-05-29 - Check inicial

- `git status --short`: limpo.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: começar a sprint com uma base verificável antes de alterar dados, API e UI.

### 2026-05-29 - Índice leve de itens e API local

- Criado `scripts/generate-calculator-item-index.mjs`.
- Gerados índices em `nightmare-data/generated/calculator`.
- Criados endpoints:
  - `GET /api/calculator/items?slot=weapon`
  - `GET /api/calculator/items?kind=card`
  - `GET /api/calculator/items/:itemId`
- `components/calculator/calculator-item-data.ts` deixou de importar `items.en.json` no client.
- O modal de equipamento agora carrega opções por API e busca detalhes apenas dos itens/cartas selecionados.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: remover o JSON gigante de itens do bundle client e manter o modal funcional com dados sob demanda.

### 2026-05-29 - Payload versionado de build

- Criado `components/calculator/calculator-build-payload.ts`.
- O `localStorage` agora salva `CalculatorBuildPayload` com `version`, `name` e todos os campos de personagem/build.
- Builds antigas sem versão caem no payload padrão.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: preparar o formato que depois será salvo na conta do usuário como personagem/build, sem acoplar o frontend ao banco ainda.

### 2026-05-29 - Base de saves por conta

- Adicionado modelo Prisma `CalculatorCharacterBuild`.
- Criados endpoints autenticados no backend Nest:
  - `GET /calculator/builds`
  - `POST /calculator/builds`
  - `PUT /calculator/builds/:buildId`
  - `DELETE /calculator/builds/:buildId`
- Payload salvo no banco usa `payloadJson`, mantendo flexibilidade enquanto o formato da build estabiliza.
- `npm --prefix api run prisma:generate`: passou.
- `npm --prefix api run lint`: passou.
- `npm --prefix api run build`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: permitir que builds virem "personagens" da conta no próximo passo de UI, mantendo localStorage como fallback para usuário deslogado.

### 2026-05-29 - Storage local extraído

- Criado `components/calculator/calculator-build-storage.ts`.
- Leitura/default do payload saiu de `calculator-workbench.tsx`.
- `npm run lint`: passou.
- `npm --prefix api run lint`: passou.
- `npm run build`: passou.

Motivo: reduzir responsabilidade do workbench antes de quebrá-lo em hooks maiores.

### 2026-05-30 - Workbench dividido em hooks

- Criados `use-calculator-build-state`, `use-calculator-dataset` e `use-calculator-result`.
- `calculator-workbench.tsx` ficou como composicao dos paineis principais.
- O fluxo visual nao foi alterado.
- `npm run lint`: passou.

Motivo: reduzir o arquivo principal da calculadora e deixar estado, dataset e calculo em unidades testaveis/reutilizaveis.

### 2026-05-30 - Painel de equipamentos componentizado

- Criados `calculator-equipment-slots`, `calculator-equipment-paperdoll` e `calculator-item-picker-modal`.
- `calculator-equipment-panel.tsx` virou apenas o shell de tabs/estado do slot editado.
- As classes CSS existentes foram preservadas.
- `npm run lint`: passou.

Motivo: separar dados de slots, grade visual e modal de escolha para facilitar trocar layout/design sem reescrever regra de item.

### 2026-05-30 - Busca paginada de itens no select

- `GET /api/calculator/items` agora aceita `q` e `limit`.
- `RichSelect` ganhou busca controlada opcional, mantendo o comportamento local por padrao.
- O modal de item/cartas busca no servidor com debounce e limite de resultados.
- Itens/cartas ja selecionados continuam aparecendo mesmo quando a busca atual nao os retorna.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: reduzir listas grandes no client e preparar o picker para catalogos maiores sem fugir do design system.

### 2026-05-30 - UI inicial de builds da conta

- Criados `calculator-build-api` e `calculator-builds-modal`.
- O botao `Builds` abre modal com nome da build, salvar, carregar e remover.
- O hook `use-calculator-build-state` agora expoe payload atual e consegue carregar payload salvo.
- O save local continua automatico; conta usa `NEXT_PUBLIC_API_URL` como o resto do app.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: transformar o payload versionado em fluxo real de personagem/build sem acoplar o workbench aos detalhes da API.

### 2026-05-30 - CSS global dividido por dominio

- `app/globals.css` virou apenas a lista de imports globais.
- Criados `app/styles/base.css`, `ui.css`, `site.css`, `calculator.css`, `auth.css` e `guild.css`.
- Tokens e componentes UI ficaram separados dos dominios de produto.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: permitir alterar padroes visuais globais sem procurar regras em um arquivo unico gigante.

### 2026-05-30 - Parser rAthena separado por fases iniciais

- Criados `rathena-script-types`, `rathena-script-commands` e `rathena-script-conditions`.
- O parser principal deixou de concentrar tipos, parse de comando e parse de condicoes.
- `rathena-script-parser.ts` caiu para 629 linhas.
- `npm run lint`: passou.
- `npm run build`: passou.
- `npm test -- ...`: nao rodou porque a raiz nao possui script `test`.

Motivo: iniciar a separacao do parser por responsabilidade sem mexer nos mappers de bonus, que sao a parte mais sensivel da regra de dano.

### 2026-05-30 - Skill tree componentizada

- `calculator-skill-tree-panel.tsx` caiu para 187 linhas.
- Criados componentes para board, toolbar, path/header de grupo, icone de skill e retrato da classe.
- Criado `calculator-skill-tree-layout.ts` para regras puras de agrupamento/layout.
- Classes CSS e comportamento visual foram preservados.
- `npm run lint`: passou.

Motivo: deixar a arvore de skills facil de alterar sem misturar modal, toolbar, layout e celulas no mesmo arquivo.

### 2026-05-30 - Mappers rAthena extraidos

- Criados `rathena-script-mappers` e `rathena-script-converters`.
- `rathena-script-parser.ts` caiu para 283 linhas e ficou focado em extrair segmentos/fluxo de parse.
- Mapeamento de `bonus`/`bonus2` e conversao de race/element/size sairam do parser principal.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: deixar a regra de interpretacao rAthena mais modular para adicionar comandos sem crescer o parser central.

### 2026-05-30 - Builds com atualizar/salvar como

- Modal de builds passou a usar textos do i18n.
- Adicionadas acoes separadas para atualizar build selecionada e salvar como nova.
- Lista agora mantém build selecionada no modal e mostra data de atualização.
- `calculator-build-api` ganhou `PUT` para atualizar builds existentes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: completar o fluxo basico de saves por conta sem confundir sobrescrita com criacao de nova build.
