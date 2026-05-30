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
