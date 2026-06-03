# Plano Para Finalizar a Calculadora V1

## Resumo

Objetivo: chegar em uma V1 jogavel e funcional da calculadora, com fluxo completo de personagem, arvore, ataque, monstros, equipamentos, cartas, buffs e saves por conta. A precisao matematica fica transparente: a V1 deve mostrar avisos quando usar formula generica/prototipo, e as formulas validadas entram por prioridade.

## Etapas De Implementacao

### 1. Card De Ataque

- Criar um card separado para selecao de habilidade e nivel da habilidade.
- Personagem fica apenas com classe, base/job e status.
- O card deve listar apenas skills de dano/cura da classe selecionada.
- Mostrar icone, tipo de dano, elemento, hit count e aviso de precisao da formula.
- Quando trocar classe, escolher automaticamente a primeira skill valida da nova classe.

### 2. Monstros Reais

- Trocar o dataset demo de monstros por API local.
- Criar `GET /api/calculator/monsters?q=&limit=`.
- Criar `GET /api/calculator/monsters/:monsterId`.
- Gerar indice leve `nightmare-data/generated/calculator/monsters-index.json`.
- O select de monstros deve usar `RichSelect` com busca.
- Ao selecionar monstro, carregar detalhe completo e inserir no dataset do calculo.
- Exibir level, raca, tamanho, elemento, HP, DEF e MDEF.

### 3. Resultado E Warnings

- Mostrar `result.meta.precision`, warnings e `formulaId`.
- Avisar quando usar formula generica/prototipo.
- Avisar quando houver statements de item nao suportados.
- Melhorar breakdown com poder base, multiplicador, defesa, alvo e unsupported modifier count.

### 4. Formulas Prioritarias De Skill

- Manter formula generica como fallback.
- Criar formulas estaticas validadas por prioridade de classe.
- Cobrir primeiro Swordman/Knight/Rune Knight/Dragon Knight e Mage/Wizard/Warlock/Arch Mage.
- Cada formula nova deve ter teste de unidade.
- Marcar `validated` apenas quando a skill tiver formula especifica.

### 5. Buffs E Consumiveis

- Separar buffs manuais globais, buffs de skill da classe e consumiveis/comidas.
- Manter `BUFF_900001+` temporariamente em catalog versionado.
- Cada buff ativo deve aparecer no payload salvo e no resultado.
- Adicionar preview do efeito aplicado quando possivel.

### 6. Equipamentos, Cartas E Refino

- Completar modal por slot com busca, cartas, refino e preview.
- Garantir que troca de item limpa cartas invalidas se o novo item tiver menos slots.
- Mostrar no paperdoll nome curto do item e quantidade de cartas.

### 7. Saves E Payload

- Manter localStorage para usuario deslogado.
- Manter saves por conta via API existente.
- Evoluir payload para secoes nomeadas: personagem, ataque, arvore, equipamentos, buffs e alvo.
- Adicionar migracao local de payload v1.
- O modal de builds deve carregar, salvar como, atualizar, duplicar e excluir.

### 8. Qualidade Visual Final

- Usar componentes do design system para selects, botoes, modais, campos e scroll.
- Usar `ui-scrollarea` em scrolls internos grandes.
- Revisar responsivo dos cards principais.
- Garantir que tooltips nao cortem e nao tenham scroll interno.

## Testes E Aceitacao

- Rodar sempre `npm run test:calculator`, `npm run lint` e `npm run build`.
- Adicionar testes para monstros, troca de classe, migracao de payload, ataque, formulas e equipamentos.
- Aceitar a V1 quando o usuario conseguir escolher classe, niveis, status, arvore, ataque, monstro, itens, cartas, refino e buffs, recalcular dano sem erro e salvar local/conta.

## Assumptions

- Meta: V1 jogavel, nao precisao total de todas as skills neste ciclo.
- Formulas especificas entram por prioridade.
- O backend existente de builds por conta sera mantido e evoluido.
