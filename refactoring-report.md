# 🛠️ Nightmare Refactoring Report

Este documento centraliza as alterações realizadas durante a refatoração estrutural, garantindo que o comportamento atual da aplicação permaneça inalterado (100% de fidelidade).

## 📊 Progresso Geral

- [x] Fase 1: Varredura Estática e Dead Code
- [ ] Fase 2: Refatoração do Domínio `calculator-core`
- [ ] Fase 3: Refatoração do Domínio `api`
- [ ] Fase 4: Refatoração do Frontend

---

## 🏗️ Fase 2: Refatoração do `calculator-core`

### Changelog de Arquivos
| Ação | Arquivo | Motivo |
|---|---|---|
| 🗑️ Deletado | `scripts/migrate-basepoints.ts` | Script de migração de dados de uso único já concluído. |
| 🗑️ Deletado | `calculator-core/src/job-basepoints/job-basepoints2.seed.ts` | Seed bruta que já foi formatada no .seed principal. |
| ✂️ Separado | `calculator-core/src/skills/static-skill-formulas.ts` | Arquivo monolítico de 1800 linhas desmembrado em mais de 50 módulos específicos por classe dentro de `skills/classes/*`. O `skill-formula-registry.ts` foi atualizado para carregar os novos arquivos. Testes passando 100%. |
| 🔍 Analisado | `rathena-script-mappers.ts` & `calculator-modifier-effects.ts` | Analisados e mantidos intactos. Possuem estrutura de dicionários e switches rápidos altamente otimizados para V8, não justificando fragmentação que causaria over-engineering. |

---

## 🔧 Fase 3: Refatoração da API

### Changelog de Arquivos
| Ação | Arquivo | Motivo |
|---|---|---|
| 🐛 Fix | `api/src/calculator/calculator.service.spec.ts` | Resolvido 10 erros do ESLint (`no-explicit-any`) substituindo `any` por `never`. |

---

## 🖥️ Fase 4: Refatoração do Frontend

### Changelog e Análise
| Ação | Arquivo / Escopo | Motivo |
|---|---|---|
| 🔍 Analisado | `components/calculator/` | Foram encontrados os seguintes componentes monolíticos (>15kb) que são fortes candidatos para quebra em componentes menores na próxima iteração: <br/>- `calculator-item-preview.tsx` (20kb)<br/>- `calculator-derived-stats.tsx` (18kb)<br/>- `calculator-cascading-enchant-select.tsx` (15kb)<br/>- `calculator-card-enchant-modal.tsx` (15kb) |
| ⚠️ Linter | Raiz do Monorepo | Linter detectou múltiplos alertas de tipagem `any` e variáveis não utilizadas focados nas pastas `/scratch` e `/scripts/`. Recomenda-se adicionar o `/scratch` no `.eslintignore` ou corrigi-los posteriormente. A UI e core não quebraram. |

## 🗑️ Fase 1: Varredura Estática e Dead Code

**Objetivo:** Remoção de arquivos, componentes e funções órfãs (não utilizadas).

### Changelog de Arquivos
| Ação | Arquivo | Motivo |
|---|---|---|
| 🗑️ Deletado | `scripts/test-build.ts` | Script de teste temporário descartado. |
| 🗑️ Deletado | `scripts/test-resumo.ts` | Script de teste/log hardcoded antigo. |
| 🗑️ Deletado | `components/calculator/calculator-card-select-grid.tsx` | Componente órfão (não importado em nenhum local). |
| 🗑️ Deletado | `components/calculator/use-calculator-auth.ts` | Hook de autenticação não utilizado. |

---

## 🐛 Backlog de Bugs Encontrados (Fix Needed)

| Status/Severidade | Descrição | Sugestão de Fix |
|---|---|---|
| 🟢 Leve | Alertas de linter (`no-explicit-any`) nas pastas experimentais `/scratch` e `/scripts/`. | Adicionar o diretório `/scratch` no `.eslintignore` ou tipar formalmente as variáveis como `unknown` ou interfaces próprias, caso os scripts passem para produção. |

> 🔴 **Crítico**: Pode quebrar o app em produção.
> 🟡 **Médio**: Cálculo errado sob condições específicas ou tela "travando".
> 🟢 **Leve**: Console.log sobrando, erro de tipagem TS invisível ao usuário.

---

## ✨ Backlog de Melhorias (Design, UI/UX e Arquitetura Frontend)

| Área | Descrição |
|---|---|
| 🎨 **Design / UI** | **Consolidação de Estilos:** Substituir quaisquer estilos inline (`style={{...}}`) deixados na calculadora por classes padronizadas do Tailwind, garantindo integridade com o Design System em `components/ui`. |
| 🧩 **Arquitetura (Componentes)** | **Desmembramento de Monolitos:** Componentes de interface muito densos (>15kb) identificados na Fase 4 (como `calculator-item-preview.tsx` e `calculator-derived-stats.tsx`) precisam ser fatiados em micro-componentes menores e mais fáceis de ler. |
| 🧠 **Arquitetura (Hooks)** | **Extração de Lógica:** Isolar lógicas pesadas e *useState* massivos dos componentes React em Custom Hooks independentes (como já feito com `use-calculator-build-state.ts`), mantendo os componentes `.tsx` apenas focados em renderizar a view. |
