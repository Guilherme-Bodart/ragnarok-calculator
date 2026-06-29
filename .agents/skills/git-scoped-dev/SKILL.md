---
name: git-scoped-dev
description: Protocolo rigoroso de escopo reduzido e Conventional Commits para evitar quebras silenciosas e manter o histórico limpo.
---

# Skill: Scoped Development and Conventional Commits

## Protocolo de Escopo (Anti-Bloat)
1. Antes de alterar qualquer linha de código, você DEVE analisar o escopo e se certificar de que não está vazando lógica entre domínios (ex: UI da guilda misturada com lógica de dano).
2. Não altere arquivos fora do escopo estrito da sua tarefa atual, a menos que seja para corrigir tipos estritamente necessários para o funcionamento.
3. Se a correção de um bug ou a criação de uma feature exigir mudanças massivas em módulos distintos, divida a tarefa em etapas (use o Implementation Plan e o Task Tracker do Antigravity).

## Protocolo de Commit
Após concluir e testar a alteração em uma tarefa/subtarefa, você deve realizar os commits usando os comandos git no terminal:
1. Revise as alterações feitas (`git diff` ou analisando os arquivos modificados).
2. Crie um ou mais commits usando o padrão Conventional Commits focado no domínio afetado.
   - Padrão: `<tipo>(<escopo>): <descrição breve no imperativo>`
   - Tipos: `feat` (nova feature), `fix` (correção), `refactor` (refatoração), `style` (formatação/UI), `docs` (documentação).
   - Escopos para o projeto:
     - `calc`: Lógica pura da calculadora matemática (`packages/calculator-core`).
     - `calc-ui`: Frontend da calculadora (`components/calculator`).
     - `saas`: Painel, guilda, contas, banco de dados.
     - `shared`: Componentes genéricos de UI (`components/ui`).
     - `data`: Scripts de normalização ou datasets gerados (`scripts`, `data`).
3. O commit deve conter **apenas as alterações daquela etapa específica**. Faça commits atômicos! Nunca agrupe alterações de refatoração do UI System com uma correção matemática da calculadora no mesmo commit.
4. Execute `git status`, `git add <arquivos específicos>` e `git commit -m "..."`.
