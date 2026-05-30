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
