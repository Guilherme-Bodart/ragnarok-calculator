---
name: ui-component-generator
description: Regras para criação e uso de componentes de interface para garantir o reuso e a integridade do Design System.
---

# Skill: UI Component Generator

## Princípios de UI e Design System
Ao criar ou modificar elementos visuais na calculadora ou no SaaS da Nightmare, você deve obrigatoriamente seguir estas regras:

1. **Reaproveitamento de Componentes**: Nunca crie botões, inputs, modais ou tipografias isoladas dentro das páginas. Primeiro, procure se a versão base já existe na pasta compartilhada (ex: `components/ui`). Se existir, importe-a.
2. **Tokens Visuais Consistentes**: Todo novo componente criado para o design system (`components/ui`) DEVE utilizar as classes globais, variáveis CSS ou classes utilitárias já estabelecidas na aplicação. 
3. **Sem CSS "Sujo"**: Evite a todo custo a inserção de CSS inline ou tags `style` fixas (`style={{ color: "red" }}`).
4. **Planejamento Visual (Scaffolding)**:
   - Passo A: Verifique se o elemento genérico (ex: um select customizado) pertence ao `components/ui` ou se é específico do domínio (ex: um componente que lida apenas com propriedades de monstros vai para `components/calculator`).
   - Passo B: Se for criar um componente de UI, crie ele o mais genérico e flexível possível (usando `cva`, `cn`, ou as dependências de componentes já usadas pelo projeto, como shadcn/ui se aplicável).
   - Passo C: Implemente a lógica de uso no domínio onde ele será importado.
