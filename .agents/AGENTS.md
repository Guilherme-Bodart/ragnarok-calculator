# Regras do Projeto Nightmare (Ragnarok Online)

## 1. Metodologia de Trabalho (Planner -> Coder -> Reviewer)
- **Planejamento (Planner)**: Para qualquer nova feature complexa ou refatoração profunda, **pare e crie um plano de implementação** (Implementation Plan) detalhando a arquitetura, pastas e fluxo de dados. Peça aprovação do usuário antes de codar.
- **Desenvolvimento (Coder)**: Escreva código modular e de responsabilidade única. Altere os arquivos passo a passo.
- **Revisão (Reviewer)**: Analise criticamente o código gerado em busca de re-renders desnecessários (performance), tipagem solta e fidelidade aos contratos da aplicação.

## 2. Separação Estrita de Domínios (Contexto Cirúrgico)
Mantenha a modularidade rigorosa baseada na arquitetura do projeto:
- **`packages/calculator-core`**: Núcleo isolado da calculadora. Funções puras em TypeScript, matemática pesada e types. **Atenção: Roda puramente no FRONT-END (browser) para garantir velocidade.** Não acesse banco de dados ou backend aqui.
- **`api/`**: Back-end em NestJS. Responsável por persistência, Autenticação e servir Seeds. Atualmente não fazemos cálculos de dano aqui por performance (é feito no front), mas a arquitetura *deve permitir* que o `calculator-core` seja usado no backend futuramente para otimizações complexas (ex: "descobrir a melhor build").
- **`components/calculator`**: Componentes visuais exclusivos da calculadora. Nenhuma fórmula de dano deve ser escrita aqui. Esta camada apenas lê do `calculator-core` e consome os hooks de estado local.
- **`app/`**: Next.js App Router. Lógica de roteamento e SSR.
- **`components/ui`**: Design system compartilhado. Apenas tokens de design e componentes puros (botões, modais). Sem regras de negócio.

## 3. Diretrizes de Código
- **TypeScript First**: Tipagem forte obrigatória. Proibido o uso de `any` a menos que estritamente necessário.
- **Código Limpo**: Funções pequenas e diretas.
- **Comentários**: Sem longas explicações no chat. Coloque explicações técnicas curtas e precisas diretamente nos comentários do código.
- **Design System**: Reutilize sempre os tokens e componentes da pasta `components/ui`. Não invente estilos inline soltos.

## 4. Gerenciamento de Estado (Fonte da Verdade)
- Todo o estado da calculadora vive no `use-calculator-build-state.ts` (ou stores atrelados a ele).
- A UI não tem inteligência de cálculo. Quando o usuário altera um equipamento, a UI atualiza o estado, e a aplicação repassa esse estado para a pipeline do `calculator-core` que devolve os `CharacterStats` e `DamageResults` completos para a tela.

## 5. Fórmulas e Mecânicas (Regra de Ouro)
- **NUNCA INVENTE FÓRMULAS.** O projeto é um simulador fidedigno do Ragnarok Online. Toda lógica de bônus, dano e status deve ser espelhada dos emuladores (como o **rAthena**).
- **Multiplicadores Dinâmicos**: A porcentagem de dano das habilidades (ex: 300% no Nv. 1) é extraída dos arquivos de dados (datasets/seeds). Jamais *hardcode* multiplicadores nos arquivos lógicos da engine, pois o jogo recebe patches e rebalanceamentos constantes.

## 6. Internacionalização e Vocabulário
- **Código Interno (Backend/Engine)**: Use **Sempre Inglês** para variáveis e banco de dados. Ex: `pow`, `spl`, `con`, `weaponAtk`, `flatAtk`.
- **Frontend (UI)**: O site possui suporte PT-BR e EN. Textos devem ser flexíveis (ex: usando sistema de tradução ou props). Status de 4ª classe são mapeados visualmente de POW -> POD, SPL -> FEI dependendo da região, mas o dado transitado é o inglês original.

## 7. Troubleshooting Next.js (Turbopack)
- Caso um arquivo de estilo (ex: Tailwind/CSS) sofra um erro de sintaxe (como uma chave `}` faltando), o Turbopack costuma "travar" o erro no cache (`.next/`). Se mesmo após corrigir o código a UI reportar o erro antigo no terminal, aconselhe o usuário a reiniciar o servidor de desenvolvimento.

## 8. Escopo Anti-Bloat
- Nunca altere dezenas de arquivos de domínios diferentes ao mesmo tempo. Divida tarefas complexas em etapas menores.

## 9. Transparência e Comunicação
- Sempre se comunique explicando passo a passo o que você está pensando, pesquisando e alterando. O usuário gosta de acompanhar a sua linha de raciocínio de forma transparente antes e durante os testes. Vá falando o que você está fazendo.
