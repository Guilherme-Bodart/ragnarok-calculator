# Regras do Projeto Nightmare (Ragnarok Online)

## 1. Metodologia de Trabalho (Planner -> Coder -> Reviewer)
- **Planejamento (Planner)**: Para qualquer nova feature complexa ou refatoração profunda, **pare e crie um plano de implementação** (Implementation Plan) detalhando a arquitetura, pastas e fluxo de dados. Peça aprovação do usuário antes de codar.
- **Desenvolvimento (Coder)**: Escreva código modular e de responsabilidade única. Altere os arquivos passo a passo.
- **Revisão (Reviewer)**: Analise criticamente o código gerado em busca de re-renders desnecessários (performance), tipagem solta e fidelidade aos contratos da aplicação.

## 2. Separação Estrita de Domínios (Contexto Cirúrgico)
Mantenha a modularidade rigorosa baseada na arquitetura do projeto:
- **`packages/calculator-core`**: Núcleo isolado da calculadora. Funções puras em TypeScript, matemática pesada e types. **Zero** dependências de React, UI ou banco de dados do SaaS.
- **`components/calculator`**: Componentes visuais exclusivos da calculadora. Gerenciamento de estado local.
- **`app/`**: Next.js App Router. Lógica de roteamento e SSR.
- **`components/ui`**: Design system compartilhado. Apenas tokens de design e componentes puros (botões, modais). Sem regras de negócio.

## 3. Diretrizes de Código
- **TypeScript First**: Tipagem forte obrigatória. Proibido o uso de `any` a menos que estritamente necessário.
- **Código Limpo**: Funções pequenas e diretas.
- **Comentários**: Sem longas explicações no chat. Coloque explicações técnicas curtas e precisas diretamente nos comentários do código.
- **Design System**: Reutilize sempre os tokens e componentes da pasta `components/ui`. Não invente estilos inline soltos.

## 4. Escopo Anti-Bloat
- Nunca altere dezenas de arquivos de domínios diferentes (ex: SaaS + Calculadora) ao mesmo tempo.
- Se uma task exigir mexer em dois domínios complexos, divida em etapas menores e execute uma por vez.
