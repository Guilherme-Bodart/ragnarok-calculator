# Calculator Core Complete

Ultima atualizacao: 2026-06-23

Este documento e o plano mestre para transformar a calculadora Nightmare em uma calculadora completa de Ragnarok Online, com foco primeiro no cerebro: dados, formulas, modificadores, buffs, cartas, enchants, monstros, equipamentos, refino, cast/ASPD/DPS e validacao. UI/UX fica subordinado ao core: controles bonitos so importam quando o resultado calculado e confiavel, auditavel e rastreavel.

## Objetivo Final

Chegar em uma calculadora funcionalmente comparavel a calculators como iRO Calc e Tong Calc, mas com uma UI melhor e arquitetura mais facil de manter.

No final, o usuario deve conseguir:

- Escolher classe, base/job level, status, trait status e skill tree.
- Escolher skill ofensiva/curativa, level da skill e opcoes especificas da skill.
- Selecionar alvo real ou alvo manual, com elemento, raca, tamanho, DEF/MDEF, RES/MRES, boss/normal e ajustes.
- Equipar itens reais por slot, cartas compativeis, refino, grade, enchants e modificadores especiais.
- Ativar buffs proprios da classe, buffs uteis de outras classes, consumiveis, comidas e buffs manuais.
- Ver dano minimo/medio/maximo/total, DPS, hits, ASPD, cast, cooldown, delay, tempo para matar e breakdown completo.
- Salvar/carregar builds localmente e por conta.
- Ver avisos claros quando algum item, buff, skill ou formula ainda nao esta validado.
- Comparar builds e exportar/importar payloads.

## Regra De Performance Do Front

A calculadora precisa responder imediatamente quando o usuario troca status, skill, item, carta, buff ou monstro. Por isso:

- O calculo interativo deve rodar no front usando `packages/calculator-core`, de forma pura e sincrona.
- O front nao deve importar datasets gigantes completos.
- Busca de item/monstro/carta deve usar indices leves ou API local.
- Ao selecionar uma opcao, o front deve manter em memoria apenas os detalhes necessarios para o build atual.
- Scripts pesados de normalizacao ficam em build/sync/auditoria, nunca no fluxo de clique do usuario.
- O core pode crescer em precisao, mas cada etapa deve preservar baixo custo por recalculo.

## Estado Atual Do Projeto

Arquivos relevantes:

- Frontend calculadora: `components/calculator`.
- Core: `packages/calculator-core/src`.
- Endpoints Next locais: `app/api/calculator`.
- Backend Nest: `api/src/calculator`.
- Dados normalizados: `nightmare-data/normalized`.
- Dados leves gerados: `nightmare-data/generated/calculator`.
- Roadmap antigo V1: `CALCULATOR_ROADMAP.md`.
- Briefing do projeto: `PROJECT_BRIEF.md`.

Funcionando hoje:

- Personagem com classe, base/job, status e trait.
- Arvore de skills por classe e tooltip de skill.
- Card de ataque separado.
- Monstros por API local leve.
- Itens/cartas por API local leve.
- Modal de item com refino/cartas e preview inicial.
- Paperdoll com nome curto e quantidade de cartas.
- Buff catalog inicial manual/consumivel.
- Saves local e por conta.
- Payload versionado V2.
- Parser rAthena incremental para subset de scripts.
- Pipeline de dano com breakdown.
- Algumas formulas estaticas: `SM_BASH`, `SM_MAGNUM`, `KN_BOWLINGBASH`, bolts basicos de mago.
- Fallback generico para skills.

Principais lacunas atuais:

- Parser rAthena cobre pouco: basicamente `bonus`/`bonus2` e poucas familias.
- Core ainda aplica formula de dano simplificada.
- Skill formula registry cobre poucas skills manualmente.
- Tooltips ajudam, mas nao substituem todas as formulas especiais.
- Enchants e combos ainda nao estao completos.
- Buffs de classe e de outras classes ainda nao tem catalogo completo/regras de disponibilidade.
- ASPD/cast/cooldown/DPS ainda nao estao no nivel de calculator completo.
- Dados LATAM/iRO/rAthena precisam de politica clara de prioridade e diferencas por servidor.
- Falta auditoria automatica de cobertura: itens parseados, scripts suportados, skills com formula, buffs catalogados, enchants mapeados.

## Principios De Arquitetura

1. **Dados primeiro, UI depois.**
   A UI deve consumir catalogos normalizados e resultado auditavel. Evitar regra de jogo hardcoded em componente React.

2. **Fonte rastreavel.**
   Todo item, skill, buff, enchant, carta e formula deve ter `source`, `sourceId`, `sourceFile`, `sourceLine` quando possivel.

3. **Parser incremental, nunca silencioso.**
   Qualquer script nao suportado deve virar `unsupportedStatement` com contexto. Nada pode sumir.

4. **Resolver separado do parser.**
   Parser entende sintaxe e comandos. Resolver decide se aplica por refino, classe, skill, arma, alvo, servidor, episodio, item combo etc.

5. **Formula validada tem evidencia.**
   `precision: validated` so quando houver teste e fonte. Caso contrario `prototype`, `inferred` ou `partial`.

6. **Dados grandes ficam fora do bundle client.**
   Browser recebe indices leves e detalhes sob demanda.

7. **Server/ruleset explicito.**
   LATAM, iRO, kRO/rAthena podem divergir. O payload deve carregar `ruleset`.

8. **Scripts para datasets grandes.**
   Nao ler arquivo gigante inteiro em chat. Ler 2-3 amostras, criar script local, gerar JSON/relatorio.

9. **Cobertura medida.**
   Toda fase deve produzir relatorios: quantos itens parseados, quantos modifiers suportados, quantas skills validadas, quantos buffs catalogados.

## Modelo De Precisao

Usar um enum comum no core e no frontend:

- `validated`: formula/dado coberto por fonte e teste.
- `inferred`: extraido automaticamente de tooltip/script com padrao confiavel, mas sem teste manual por skill/item.
- `partial`: parte da regra esta aplicada, parte ficou em warning.
- `prototype`: fallback generico ou regra aproximada.
- `unsupported`: item/skill/buff conhecido, mas ainda nao afeta calculo.

Cada resultado deve expor:

- `formulaId`
- `precision`
- `warnings`
- `unsupportedStatements`
- `appliedModifiers`
- `ignoredModifiers`
- `sourceRefs`

## Data Sources

### Fontes ja existentes no repo

- `nightmare-data/normalized/items/items.en.json`
- `nightmare-data/normalized/items/items.br.json`
- `nightmare-data/normalized/monsters/monsters.en.json`
- `nightmare-data/normalized/skills/skills.en.json`
- `nightmare-data/normalized/skills/skill-tree.json`
- `nightmare-data/normalized/skills/skill-tooltips.en.json`
- `nightmare-data/generated/calculator/cards-index.json`
- `nightmare-data/generated/calculator/items-by-slot/*.json`
- `nightmare-data/generated/calculator/monsters-index.json`

### Fontes recomendadas

- rAthena DB: itens, cartas, monstros, skills, job stats, basepoints, constants.
- iRO Wiki/DB: tooltips e metadados de skills.
- LATAM/Claudinhos: nomes/descricoes/scripts localizados quando existirem.
- Divine Pride: imagens e referencias visuais quando necessario.

### Possiveis arquivos que posso pedir ao usuario

Pedir somente se nao encontrarmos fonte confiavel no repo/rAthena ou se o servidor alvo for LATAM especificamente:

- JSON completo de cartas LATAM.
- JSON completo de enchants LATAM.
- JSON completo de costumes/shadow gear LATAM.
- Tabelas de buffs/consumiveis customizados de servidor.
- Export de item DB com scripts mais recentes.
- Regras de formula customizadas de servidor se LATAM divergir do rAthena/iRO.

## Artefatos Novos Recomendados

Criar ao longo das fases:

- `nightmare-data/generated/calculator/items-detail/{itemId}.json`
- `nightmare-data/generated/calculator/cards-detail/{itemId}.json`
- `nightmare-data/generated/calculator/enchants-index.json`
- `nightmare-data/generated/calculator/enchants-detail/{id}.json`
- `nightmare-data/generated/calculator/buffs-index.json`
- `nightmare-data/generated/calculator/skill-formula-index.json`
- `nightmare-data/generated/calculator/coverage/*.json`
- `packages/calculator-core/src/rulesets/latam-renewal.ts`
- `packages/calculator-core/src/rulesets/iro-renewal.ts`
- `packages/calculator-core/src/skill-formulas/generated`
- `packages/calculator-core/src/skill-formulas/manual`
- `packages/calculator-core/src/cast`
- `packages/calculator-core/src/dps`
- `packages/calculator-core/src/enchant`
- `packages/calculator-core/src/buffs`
- `packages/calculator-core/src/combo`

## Fase 0: Auditoria E Contratos

Objetivo: saber exatamente o que existe, o que falta e como medir progresso.

Tarefas:

- Definir contratos TypeScript para:
  - `CalculatorRuleset`
  - `CalculatorSourceRef`
  - `CalculatorPrecision`
  - `NormalizedModifier`
  - `ResolvedModifier`
  - `SkillFormulaDefinition`
  - `BuffDefinition`
  - `EnchantDefinition`
  - `CalculatorCoverageReport`
- Criar auditoria automatica:
  - total de itens;
  - total de cartas;
  - total de monstros;
  - total de skills;
  - scripts parseados sem unsupported;
  - scripts com unsupported;
  - comandos rAthena mais frequentes ainda nao suportados;
  - formulas de skill validadas/inferred/prototype;
  - buffs catalogados por classe;
  - enchants catalogados.
- Criar comandos:
  - `npm run calculator:audit`
  - `npm run calculator:coverage`
- Criar relatorios em `nightmare-data/generated/calculator/coverage`.

Entregaveis:

- Relatorio inicial de cobertura.
- Lista ordenada por impacto dos comandos rAthena faltantes.
- Lista ordenada por uso das skills sem formula.

Validacao:

- Testes unitarios para schemas/contratos.
- Snapshot pequeno dos relatorios.

## Fase 1: Modifier Engine Completo

Objetivo: fazer itens, cartas, refino, combos e scripts afetarem o calculo corretamente.

### 1.1 Parser rAthena

Expandir de `bonus`/`bonus2` basico para:

- `bonus`
- `bonus2`
- `bonus3`
- `bonus4`
- `bonus5` se aparecer em fonte.
- `autobonus`, `autobonus2`, `autobonus3` inicialmente como unsupported estruturado.
- `skill`, `getitem`, scripts nao-dano marcados como utility/ignored.
- `if`, `else`, blocos aninhados.
- Variaveis locais `. @r`, `. @g`, `getrefine()`, `getskilllv()`, `BaseJob`, `Class`, `readparam`, `getequiprefinerycnt`.
- Operadores: `>=`, `>`, `<=`, `<`, `==`, `!=`, `&&`, `||`, `!`.
- Expressoes aritmeticas: `+`, `-`, `*`, `/`, `%`, parenteses, floor implicito quando rAthena usa inteiro.
- Arrays e constants rAthena quando necessario.

### 1.2 Mapeamento de modifiers

Cobrir familias:

- Stats: STR/AGI/VIT/INT/DEX/LUK, all stats, traits.
- ATK/MATK flat e percent.
- Weapon ATK, equip ATK, status ATK quando distinguivel.
- P.Atk, S.Matk, POW/SPL/CON e outros traits.
- Dano por raca.
- Dano por elemento.
- Dano por tamanho.
- Dano por boss/normal.
- Dano melee/ranged.
- Dano critico.
- Dano de skill especifica.
- Dano fisico/magico contra target especifico.
- Ignore DEF/MDEF.
- DEF/MDEF/RES/MRES.
- HP/SP/AP.
- Cast variable/fixed.
- After-cast delay.
- Cooldown de skill.
- ASPD flat/rate.
- Elemento de ataque/arma.
- Leech HP/SP, regen, heal effectiveness como futuro.
- Reflect, autocast, chance-based como unsupported/conditional ate existir engine.

### 1.3 Resolver

Resolver condicoes por:

- Refino.
- Grade.
- Slot.
- Tipo de arma.
- Nivel da arma.
- Classe/job.
- Transcendent/third/fourth.
- Base/job level.
- Skill aprendida e nivel.
- Alvo: raca, tamanho, elemento, boss.
- Item equipado junto/combo.
- Servidor/ruleset/episodio.

### 1.4 Combos

Criar sistema de combo:

- Detectar scripts que dependem de item equipado.
- Normalizar combo como `ComboDefinition`.
- Aplicar somente quando todos os itens/cartas exigidos estiverem equipados.
- Registrar breakdown do combo.

### 1.5 Relatorios

Gerar:

- `modifier-command-frequency.json`
- `unsupported-statements-top.json`
- `items-fully-supported.json`
- `items-partially-supported.json`
- `cards-fully-supported.json`
- `cards-partially-supported.json`

Aceite:

- 95%+ dos scripts de cartas que afetam dano parseados.
- 90%+ dos scripts de equipamentos comuns que afetam dano parseados.
- 100% dos unsupported aparecem no resultado/auditoria.

## Fase 2: Dados Reais Por Dominio

Objetivo: normalizar todos os dados que o core precisa sem depender de JSON gigante no client.

### 2.1 Itens

- Separar detalhes por item.
- Normalizar nomes EN/BR com fallback.
- Normalizar slots, locations, refineable, weaponLevel, weaponType, equipLevel, usableClass.
- Criar `itemSearchIndex`.
- Criar `itemDetail`.
- Suportar imagens no futuro, mas sem bloquear core.

### 2.2 Cartas

- Gerar catalogo especifico de cartas:
  - slot compativel;
  - prefix/suffix se existir;
  - script normalizado;
  - restricoes;
  - source.
- Garantir busca por nome EN/BR.
- Garantir cards compativeis no modal.

### 2.3 Enchants

- Criar fonte de enchants.
- Se rAthena nao tiver tudo que LATAM usa, pedir arquivo ao usuario.
- Modelar:
  - enchant id;
  - nome;
  - slot/posição;
  - item types permitidos;
  - grupos/presets;
  - script/modifiers.
- Criar presets por equipamento quando houver.

### 2.4 Monstros

- Confirmar campos:
  - HP;
  - level;
  - race;
  - size;
  - element;
  - elementLevel;
  - DEF/MDEF;
  - RES/MRES se fonte tiver;
  - boss/normal;
  - map/spawn se util.
- Permitir alvo manual.
- Permitir override defensivo.

### 2.5 Skills

- Manter `skill-tree.json` como relacao classe/arvore.
- Usar `skills.en.json` e `skill-tooltips.en.json` para metadados.
- Gerar `skill-combat-index.json`:
  - id/code;
  - nome;
  - maxLevel;
  - classe;
  - damage/heal/buff/passive/utility;
  - damageType;
  - element;
  - range;
  - hits por level;
  - multiplier por level;
  - SP/AP;
  - cast/cooldown/delay se disponivel;
  - requisitos.

Aceite:

- Endpoints/loader nunca enviam dataset completo para o client.
- Catalogos possuem relatorio de cobertura e source refs.

## Fase 3: Formula Geral De Dano Renewal

Objetivo: substituir formula simplificada por pipeline mais fiel.

Separar pipeline em etapas:

1. Effective stats.
2. Status ATK/MATK.
3. Weapon/equipment ATK/MATK.
4. Mastery/additive flat bonuses.
5. Skill formula base.
6. Skill ratio por level.
7. Skill-specific modifiers.
8. Size/race/element/class/boss modifiers.
9. Critical modifiers quando aplicavel.
10. Ranged/melee/magic/physical modifiers.
11. Element table.
12. Defense/MDEF/RES/MRES.
13. Final modifiers.
14. Random variance quando aplicavel.
15. Hit count.
16. DPS/cast/cooldown/delay.

Submodulos:

- `physical-damage`
- `magical-damage`
- `critical-damage`
- `ranged-damage`
- `healing`
- `defense`
- `element`
- `variance`
- `dps`

Aceite:

- Breakdown mostra cada etapa.
- Pode comparar uma skill simples contra iRO/Tong Calc com diferenca aceitavel documentada.
- Regras antigas continuam cobertas por testes.

## Fase 4: Formulas De Skill

Objetivo: cobrir todas as skills ofensivas/curativas/buffs relevantes.

### 4.1 Extracao automatica dos tooltips

Criar script:

- Ler `skill-tooltips.en.json`.
- Identificar padroes:
  - `[Lv n] : Damage x%`
  - `ATK x%`
  - `MATK x%`
  - `n hits`
  - `Deals ...`
  - SP/AP por level.
- Gerar `skill-formulas.inferred.json`.
- Marcar `precision: inferred`.

### 4.2 Registry manual

Criar formulas manuais para skills com regras especiais:

- Dependem de arma.
- Dependem de estado/buff.
- Dependem de contador/mark.
- Dependem de HP/SP/AP.
- Dependem de numero de inimigos.
- Dependem de distancia.
- Dependem de propriedade do alvo.
- Tem dano dividido em partes.
- Tem comportamento critico ou especial.

### 4.3 Ordem de cobertura

1. Swordman/Knight/Lord Knight/Rune Knight/Dragon Knight.
2. Mage/Wizard/High Wizard/Warlock/Arch Mage.
3. Thief/Assassin/Assassin Cross/Guillotine Cross/Shadow Cross.
4. Archer/Hunter/Sniper/Ranger/Windhawk.
5. Merchant/Blacksmith/Whitesmith/Mechanic/Meister.
6. Acolyte/Priest/High Priest/Arch Bishop/Cardinal.
7. Crusader/Paladin/Royal Guard/Imperial Guard.
8. Sage/Professor/Sorcerer/Elemental Master.
9. Rogue/Stalker/Shadow Chaser/Abyss Chaser.
10. Alchemist/Creator/Genetic/Biolo.
11. Monk/Champion/Sura/Inquisitor.
12. Dancer/Bard/Clown/Gypsy/Minstrel/Wanderer/Troubadour/Trouvere.
13. Expanded jobs: Ninja/Kagerou/Oboro/Shinkiro/Shiranui, Gunslinger/Rebellion/Night Watch, Taekwon/Star Gladiator/Soul Linker/Soul Reaper/Sky Emperor/Soul Ascetic, Super Novice/Hyper Novice, Summoner/Spirit Handler.

### 4.4 Skill options

Algumas skills precisam de opcoes no card de ataque:

- Elemento selecionavel.
- Modo melee/ranged.
- Numero de hits/targets.
- Estado do alvo.
- Buff ativo necessario.
- Nivel de runa/esfera/moeda/summon.
- Overbrand/Dragonic Aura/etc. com modo especifico.

Aceite:

- Toda skill ofensiva/curativa aparece no catalogo com uma das precisoes.
- Skills passivas/utility nao aparecem no ataque, mas podem aparecer como buffs/passivas quando afetam dano.
- Coverage report por classe.

## Fase 5: Buffs Completo

Objetivo: catalogar buffs proprios, buffs de outras classes, consumiveis e comidas com regras de disponibilidade.

### Grupos

- `selfClass`: buffs naturais da classe escolhida.
- `partyClass`: buffs de outras classes que fazem sentido receber.
- `globalManual`: buffs manuais do ambiente.
- `consumable`: comida, pocao, pergaminho, conversor, item consumivel.
- `passiveToggle`: passivas opcionais/condicionais que afetam calculo.
- `debuffTarget`: debuffs no alvo.

### Regras

- Buff unico e identitario de uma classe nao deve aparecer como buff externo se nao for realisticamente compartilhavel.
- Buffs externos compartilhaveis devem aparecer para qualquer classe.
- Buffs com pre-requisito de skill devem checar skill tree quando for selfClass.
- Buffs conflitantes devem ter grupos de exclusividade.
- Buffs com level devem usar level maximo ou permitir ajuste.

### Dados por buff

- id estavel.
- nome EN/BR/ES futuro.
- source skill/item.
- grupo.
- classes que podem usar/prover.
- modifiers.
- duracao opcional.
- level range.
- regras de exclusividade.
- preview.

Aceite:

- Catalogo inicial completo para buffs que afetam dano/cast/ASPD.
- Buffs ativos entram no payload e no breakdown.
- Coverage report por classe e por grupo.

## Fase 6: ASPD, Cast, Delay, Cooldown E DPS

Objetivo: sair de dano por hit para desempenho real.

Implementar:

- ASPD base por classe/arma.
- Modificadores de ASPD flat/rate.
- Delay de ataque.
- Variable cast time.
- Fixed cast time.
- Reducoes de VCT/FCT.
- After-cast delay.
- Cooldown por skill.
- Global cooldown quando aplicavel.
- Anim delay se houver fonte/estimativa.
- Hits por cast.
- Casts por segundo.
- DPS medio.
- Tempo para matar.

Resultado deve mostrar:

- Dano por hit.
- Dano por uso.
- Usos por segundo.
- DPS.
- Limitador principal: ASPD, cast, ACD, cooldown ou anim delay.

Aceite:

- Skills instantaneas e skills com cast funcionam no mesmo modelo.
- Warnings quando delay/cooldown vier inferido ou ausente.

## Fase 7: Enchants, Grades, Shadow, Costumes

Objetivo: fechar equipamentos modernos.

Tarefas:

- Grade de equipamentos.
- Refino por slot.
- Enchants por slot.
- Shadow gear.
- Costume enchants quando afetam stats.
- Lapine/presets quando fonte existir.
- Resetar enchants invalidos ao trocar item.
- Combos item+card+enchant.

Aceite:

- Todo modificador de enchant usa mesmo modifier engine.
- Item detail mostra scripts reconhecidos e nao reconhecidos.
- Payload salva refino, grade, cartas e enchants.

## Fase 8: Rulesets E Divergencias De Servidor

Objetivo: evitar misturar LATAM/iRO/rAthena sem controle.

Criar:

- `ruleset.latam-renewal`
- `ruleset.iro-renewal`
- `ruleset.rathena-renewal`

Cada ruleset define:

- nivel maximo.
- trait points.
- formulas de status.
- formulas de DEF/MDEF.
- tabelas de elemento.
- disponibilidade de itens/skills.
- ajustes de formulas conhecidas.

Aceite:

- Payload sempre carrega ruleset.
- Resultado indica ruleset usado.
- Dados conflitantes preservam source.

## Fase 9: Validador Contra Referencias

Objetivo: provar que a calculadora esta ficando certa.

Criar cenarios:

- Personagem simples sem item.
- Skill fisica simples.
- Skill magica simples.
- Alvo com elemento favoravel/desfavoravel.
- Carta racial.
- Carta elemental.
- Refino de arma.
- Combo.
- Buff de classe.
- Consumivel.
- Enchant.

Para cada cenario:

- input payload.
- resultado esperado.
- fonte do esperado: calculadora externa, formula documentada, rAthena, print/manual.
- tolerancia.

Comandos:

- `npm run calculator:reference`
- `npm run calculator:reference:update` apenas manual.

Aceite:

- Testes de referencia passam.
- Divergencias conhecidas ficam documentadas.

## Fase 10: API E Performance

Objetivo: manter a calculadora rapida mesmo com dados completos.

Backend/Next:

- Endpoints leves para busca.
- Detail endpoints por item/card/enchant/monster/skill.
- Cache server side.
- Indices pregerados.
- Debounce no client.
- Opcional: worker para calculos pesados.

Core:

- Pure functions.
- Sem acesso a DOM.
- Sem fetch direto.
- Pode rodar client ou server.
- Cache de modifiers resolvidos por build hash.

Aceite:

- Modal de item nao carrega catalogo inteiro.
- Trocar item/skill/monstro recalcula sem travar.
- Build nao explode por inferencia TS em JSON gigante.

## Fase 11: Frontend Funcional

Objetivo: expor todo o core sem virar bagunca.

Cards finais:

- Personagem.
- Arvore.
- Ataque.
- Alvo.
- Equipamentos.
- Buffs.
- Consumiveis.
- Resultado.
- Breakdown/auditoria.
- Builds/comparacao.

Regras:

- Usar design system.
- Sem CSS local para controle reutilizavel.
- Scroll custom (`ui-scrollarea`) onde necessario.
- Selects grandes com busca.
- Warnings visiveis.
- Debug/audit mode opcional.

Aceite:

- Usuario consegue montar build completa sem abrir devtools.
- Toda informacao incompleta aparece como aviso, nao como silencio.

## Fase 12: VFinal

Objetivo: calculadora completa, auditada e extensivel.

Checklist final:

- 100% das skills ofensivas/curativas catalogadas.
- 100% dos buffs que afetam dano/cast/ASPD catalogados.
- 100% das cartas com scripts parseados ou unsupported explicito.
- 100% dos enchants disponiveis no servidor alvo catalogados.
- 95%+ dos equipamentos relevantes com scripts parseados.
- Todos os monstros reais pesquisaveis.
- Ruleset LATAM e iRO separados quando divergirem.
- Reference scenarios passando.
- Payload versionado e migravel.
- Saves por conta funcionando.
- Performance aceitavel.
- Sem dependencia de imagem externa critica para UX principal, quando possivel.

## Como Usar As Fases

As fases abaixo nao sao versoes fixas nem precisam virar exatamente V1/V2/V3/VFinal. Elas sao blocos de trabalho. Podemos juntar, dividir ou reordenar conforme os relatorios mostrarem o maior impacto.

Regra pratica:

- Se um bloco ja tem dados e testes suficientes, ele pode ser implementado direto.
- Se um bloco depende de fonte externa ou dataset grande, primeiro entra uma auditoria/script.
- Se um bloco fica grande demais para revisar bem, dividir por dominio: cartas, equipamentos, buffs, skills, enchants, monstros.
- Se um bloco e pequeno demais e nao entrega valor sozinho, juntar com o bloco vizinho.

## Politica De Commits

Commits devem ser especificos, mas nao microscopicos.

Bom tamanho de commit:

- Um script novo + relatorio gerado correspondente.
- Um grupo de modifiers rAthena + testes.
- Uma familia de formulas de skill + testes.
- Um catalogo de buffs por classe/grupo + testes.
- Uma mudanca de payload + migracao + testes.
- Uma integracao frontend pequena que consome um dado/core ja pronto.

Evitar:

- Commit gigante misturando parser, UI, dados, CSS e API.
- Commit minimo demais tipo "renomeia variavel" se isso nao fecha nada.
- Commit que altera dataset grande sem script/reprodutibilidade.
- Commit que muda calculo sem teste ou sem warning de precisao.

Formato sugerido:

- `calculator-core: audit modifier coverage`
- `calculator-core: support refine and skill conditions`
- `calculator-data: generate card catalog`
- `calculator-skills: infer tooltip formulas`
- `calculator-buffs: add class buff catalog`
- `calculator-ui: show formula precision warnings`

Antes de cada commit:

- `npm run test:calculator` quando mexer em core/calculadora.
- `npm run lint`.
- `npm run build` quando mexer em Next/app ou import/build behavior.

## Ordem Pratica Recomendada

Se um unico agente for trabalhar:

1. Fase 0: auditoria/cobertura.
2. Fase 1: modifier engine.
3. Fase 2: cards/enchants/dados.
4. Fase 4: formulas de skills por extracao + manual.
5. Fase 5: buffs.
6. Fase 3: formula geral refinada.
7. Fase 6: ASPD/cast/DPS.
8. Fase 9: referencias.
9. Fase 11: UI final.
10. Fase 12: hardening.

Se varios agentes forem trabalhar:

- Agente A: data sync/auditoria/coverage.
- Agente B: parser rAthena/modifier engine.
- Agente C: skill formulas/tooltips/registry.
- Agente D: buffs/consumiveis/enchants.
- Agente E: formula geral/dps/cast/aspd.
- Agente F: frontend/design system/integracao.
- Agente G: reference scenarios/testes.

## Perguntas Para O Usuario

Estas perguntas nao bloqueiam o inicio da Fase 0/1, mas vao decidir a precisao final:

1. O alvo principal e LATAM, iRO, rAthena puro ou multi-servidor?
2. Voce quer que a primeira ruleset validada seja LATAM Renewal?
3. Voce tem fonte completa de enchants LATAM?
4. Voce tem fonte completa de cartas/itens LATAM alem de `items.br.json`?
5. Consumiveis devem ser LATAM apenas ou iRO/rAthena tambem?
6. Quer incluir PvP/WoE/BG ou somente PvM primeiro?
7. Quer considerar buffs de party teoricamente disponiveis ou apenas buffs realistas para solo?
8. O objetivo de comparacao numerica deve ser qual calculadora primeiro: iRO Calc, Tong Calc ou uma fonte rAthena/manual?

## Politica Para Arquivos Grandes

Quando precisar de rAthena ou datasets grandes:

1. Ler no maximo 2-3 amostras.
2. Confirmar formato.
3. Criar script local para processar tudo.
4. Gerar JSON pequeno/relatorio.
5. Ler apenas o relatorio no chat.

Exemplos:

- Para cards: amostrar 2 cartas, criar `generate-card-catalog`.
- Para enchants: amostrar 2 enchants, criar `generate-enchant-catalog`.
- Para skills: amostrar 2 tooltips, criar `generate-skill-formula-index`.
- Para modifiers: amostrar top unsupported, criar mapper e testes.

## Definition Of Done Por Bloco

Cada bloco so fecha quando tiver:

- Codigo.
- Teste unitario ou reference scenario.
- Relatorio de cobertura quando envolver dados.
- Atualizacao deste documento ou log.
- `npm run test:calculator`.
- `npm run lint`.
- `npm run build` quando mexer em app/build.

## Proximo Passo Imediato

Fase 0 iniciada em 2026-06-23.

Implementado:

- Comando `npm run calculator:audit`.
- Script `scripts/audit-calculator-core.mjs`.
- Relatorio `nightmare-data/generated/calculator/coverage/calculator-core-coverage.json`.

Primeira auditoria:

- Itens normalizados: 29.356.
- Itens com `rawScript`: 20.037.
- Cartas detectadas: 5.633.
- Cartas com `rawScript`: 5.095.
- Monstros normalizados: 2.675.
- Skills de acao na arvore: 334.
- Formulas estaticas no registry: 6.
- Skills de acao cobertas por formula estatica: 5.
- Skills com formula inferivel por tooltip: 168 totais, 114 entre skills de acao.
- Skills de acao ainda provavelmente em fallback: 219.

Top prioridades detectadas:

- Parser precisa tratar melhor assignments como `.@r = getrefine();`.
- Parser/resolver precisa tratar `getenchantgrade()`.
- Proximos comandos relevantes: `bonus3`, `bonus4`, `bonus5`, `sc_start`, `skill`, `autobonus`.
- Separar catalogo de cartas detalhado e enchants continua prioridade.

Proximo bloco recomendado:

1. Melhorar auditoria para agrupar unsupported por impacto de dano, ignorando comandos puramente utilitarios.
2. Implementar `bonus3` para dano por skill/target quando aparecer nas amostras.
3. Criar testes de parser com 2-3 scripts reais extraidos dos top unsupported.
4. Conectar seletor de grade/enchant na UI quando entrar o card de enchants.

## Bloco Fechado: Parser De Grade

Data: 2026-06-23.

Implementado:

- `ModifierResolutionContext` agora aceita `grade`.
- Parser reconhece `. @g = getenchantgrade();`.
- Parser reconhece blocos simples e inline com `ENCHANTGRADE_D/C/B/A`.
- Resolver aplica modificadores condicionais por grade.
- Fluxo `calculateDamageFromDataset` aceita `grade` em `itemContexts`.
- Payload/frontend aceita `grade` no contexto de item, ainda sem UI dedicada.
- Auditoria deixou de contar `. @g = getenchantgrade();` como statement pendente.

Testes adicionados:

- Parser de grade com variavel `. @g`.
- Parser de grade inline com `getenchantgrade()`.
- Resolver filtrando/aplicando condicao de grade.
- Fluxo de calculo aplicando bonus condicionado por grade.

Observacao:

- O suporte atual cobre condicoes simples. Blocos aninhados refinados, combinando condicoes pai+filho, continuam como trabalho separado para nao misturar muitos riscos no mesmo commit.

## Bloco Fechado: Condicoes Aninhadas

Data: 2026-06-23.

Implementado:

- Parser agora preserva condicoes herdadas em blocos aninhados de refino e grade.
- Extratores de blocos so capturam blocos no nivel atual; blocos internos ficam para a recursao com contexto correto.
- Cenários cobertos:
  - `if refine { if grade { bonus } }`
  - `if grade { if refine { bonus } }`

Testes adicionados:

- Combina condicoes `refine + grade`.
- Combina condicoes `grade + refine`.

Observacao:

- A auditoria barata ainda usa split estatico e pode listar pedaços de blocos aninhados no topo de unsupported. Isso virou um bloco separado: fazer a auditoria opcionalmente usar o parser real em amostras/top scripts, sem carregar dados grandes no chat.

## Bloco Fechado: Ignore DEF/MDEF Por Raca

Data: 2026-06-23.

Implementado:

- Parser/mappers reconhecem:
  - `bonus2 bIgnoreDefRaceRate,...`
  - `bonus2 bIgnoreMdefRaceRate,...`
- Efeitos agregados agora carregam:
  - `ignoreDefenseRate`
  - `ignoreMagicDefenseRate`
- Formula final aplica ignore DEF/MDEF antes da mitigacao hard DEF/MDEF.
- Breakdown inclui `defenseIgnoreRate` para explicar o resultado.

Testes adicionados/ajustados:

- Parser normalizando ignore DEF/MDEF por raca.
- `CalculatorModifierEffectsFactory` agregando os novos efeitos.
- Formula de defesa aplicando ignore antes da reducao hard.
- Pipeline aplicando ignore DEF por raca e exibindo no breakdown.
- Specs antigos do pipeline foram atualizados para a formula validada atual de Bash.

## Bloco Fechado: Dano Fisico Curto/Longo Alcance

Data: 2026-06-23.

Implementado:

- `RoSkill` agora carrega `attackRange` vindo do rAthena normalizado.
- Parser/mappers reconhecem:
  - `bonus bShortAtkRate,...`
  - `bonus bLongAtkRate,...`
- Efeitos agregados agora carregam:
  - `shortAttackRate`
  - `longAttackRate`
- Formula fisica aplica short/long conforme `attackRange` da skill:
  - `abs(attackRange) > 3` => long range.
  - demais casos => short range.

Testes adicionados/ajustados:

- Dataset normalizado preservando `raw.Range`.
- Parser normalizando short/long attack rate.
- Efeitos agregando short/long.
- Pipeline aplicando short ou long conforme alcance da skill.

Observacao:

- `bCritAtkRate` ficou fora deste bloco de proposito. Ele precisa de modelagem de critico/DPS para nao virar um bonus enganoso.

## Bloco Fechado: Auditoria Real Do Parser

Data: 2026-06-24.

Implementado:

- Comando `npm run calculator:audit:parser`.
- Script `scripts/audit-calculator-parser-coverage.ts`.
- Relatorio `nightmare-data/generated/calculator/coverage/calculator-parser-coverage.json`.
- O relatorio usa o parser real do core, nao apenas split textual barato.
- Classificacao separa comandos ignoraveis de drop/caixa/consumivel dos comandos acionaveis para dano.

Resultado atual:

- Item scripts analisados: 20.037.
- Scripts totalmente suportados: 3.082.
- Scripts parcialmente suportados: 6.174.
- Statements unsupported: 39.633.
- Modifiers extraidos: 28.450.

Top acionavel atual:

1. `bonus2 bSkillAtk`: muitos casos falham por expressoes/variaveis como `.@val`.
2. `bonus2 bSubRace` e `bonus2 bSubEle`: reducao de dano recebido/defensiva, provavelmente outro modulo.
3. `bonus bBaseAtk`, `bonus bMatk`, `bonus bMaxHP`: muitos casos falham por expressoes com `BaseLevel` ou variaveis locais.
4. `bonus bVariableCastrate`, `sc_start`, `bonus bDef`: importantes para VFinal, mas nao bloqueiam dano medio imediato.
5. `bonus bCritAtkRate`: depende de modelagem de critico/DPS.

Proximo bloco recomendado:

- Melhorar evaluator de expressoes rAthena com variaveis comuns:
  - `BaseLevel`
  - aliases simples como `.@val = ...`
  - expressoes derivadas de `.@r` e `.@g`
- Objetivo: reduzir unsupported de `bSkillAtk`, `bBaseAtk`, `bMatk` e `bMaxHP` sem adicionar custo no front.

## Bloco Fechado: Expressoes Rathena Com Variaveis Locais

Data: 2026-06-24.

Implementado:

- Evaluator rAthena reconhece `BaseLevel`.
- Evaluator reconhece variaveis locais `. @nome`.
- Parser calcula assignments simples como:
  - `. @val = .@r * 5;`
  - `. @val = BaseLevel / 10;`
  - `. @g = getenchantgrade();`
  - `. @r = getrefine();`
- Contexto base do calculo passa `baseLevel` para o parser de item.
- Auditoria real do parser roda com contexto representativo:
  - `baseLevel: 260`
  - `refine: 12`
  - `grade: 4`

Impacto medido por `npm run calculator:audit:parser`:

- Scripts totalmente suportados: 3.082 -> 4.108.
- Scripts parcialmente suportados: 6.174 -> 6.413.
- Unsupported statements: 39.633 -> 31.765.
- Modifiers extraidos: 28.450 -> 35.936.
- `bonus2 bSkillAtk` saiu do topo acionavel, indicando melhora grande em expressoes/variaveis.

Proximo bloco recomendado:

- Escolher entre:
  - Mapper defensivo para `bonus2 bSubRace`/`bonus2 bSubEle` em um modulo separado de dano recebido.
  - Cast/delay inicial para `bVariableCastrate`, `bFixedCast`, `bDelayrate`.

## Bloco Fechado: Trait Stats Vindos De Itens

Data: 2026-06-24.

Implementado:

- Parser rAthena reconhece `bonus bPow`, `bSta`, `bWis`, `bSpl`, `bCon` e `bCrt`.
- `CalculatorModifierEffectsFactory` agrega esses comandos em `statBonuses`.
- `CharacterStatusEngine` aplica bonus de item aos 12 stats, nao apenas aos seis atributos classicos.
- POW/SPL/CON/CRT vindos de item agora afetam derivados como status ATK, status MATK, HIT e FLEE.
- `EffectiveCharacterBuilder` passou a aceitar bonus parciais de qualquer stat do personagem.
- Testes cobrem parser, agregacao e impacto nos status derivados.

Impacto medido por `npm run calculator:audit:parser`:

- Scripts totalmente suportados: 4.108 -> 4.250.
- Scripts parcialmente suportados: 6.413 -> 6.363.
- Unsupported statements: 31.765 -> 30.862.
- Modifiers extraidos: 35.936 -> 36.839.
- `bonus bPow` saiu do top unsupported; proximos comandos acionaveis incluem `bSubRace`, `bVariableCastrate`, `bSubEle`, `bCritAtkRate`, `bDef`, `bFixedCast` e `bHealPower`.

Proximo bloco recomendado:

- Escolher entre:
  - Mappers defensivos para `bonus2 bSubRace`/`bonus2 bSubEle`, provavelmente separados de dano causado.
  - Heal/crit inicial para `bHealPower` e `bCritAtkRate`.

## Bloco Fechado: Cast E Delay Vindos De Itens

Data: 2026-06-24.

Implementado:

- Parser rAthena reconhece efeitos globais:
  - `bonus bVariableCastrate`
  - `bonus bFixedCastrate`
  - `bonus bFixedCast`
  - `bonus bDelayrate`
- Parser rAthena reconhece efeitos por skill:
  - `bonus2 bVariableCastrate`
  - `bonus2 bFixedCastrate`
  - `bonus2 bSkillFixedCast`
- `CalculatorModifierEffectsFactory` agrega cast/delay global e por skill em campos dedicados.
- Testes cobrem parser e agregacao desses modificadores.

Observacao:

- Este bloco captura os efeitos no core, mas ainda nao calcula tempo de cast/DPS final. O proximo bloco de DPS deve consumir esses campos junto com dados base das skills.

Impacto medido por `npm run calculator:audit:parser`:

- Scripts totalmente suportados: 4.250 -> 5.056.
- Scripts parcialmente suportados: 6.363 -> 5.776.
- Unsupported statements: 30.862 -> 28.010.
- Modifiers extraidos: 36.839 -> 39.691.
- `bVariableCastrate`, `bFixedCast`, `bFixedCastrate` e `bDelayrate` sairam do top unsupported.

Proximo bloco recomendado:

- Escolher entre:
  - Mappers defensivos para `bonus2 bSubRace`/`bonus2 bSubEle`, separados de dano causado.
  - Engine inicial de cast/DPS consumindo os campos de cast/delay ja agregados.

## Bloco Fechado: Critico E Cura Vindos De Itens

Data: 2026-06-24.

Implementado:

- Parser rAthena reconhece:
  - `bonus bCritAtkRate`
  - `bonus bHealPower`
- `CalculatorModifierEffectsFactory` agrega:
  - `criticalDamageRate`
  - `healPower`
- Testes cobrem parser e agregacao desses modificadores.

Observacao:

- Este bloco captura os efeitos no core. Dano critico final e formulas de cura ainda precisam de engine propria para usar esses campos no resultado.

Impacto medido por `npm run calculator:audit:parser`:

- Scripts totalmente suportados: 5.056 -> 5.349.
- Scripts parcialmente suportados: 5.776 -> 5.599.
- Unsupported statements: 28.010 -> 27.133.
- Modifiers extraidos: 39.691 -> 40.568.
- `bCritAtkRate` e `bHealPower` sairam do top unsupported.

Proximo bloco recomendado:

- Escolher entre:
  - Mappers defensivos para `bonus2 bSubRace`/`bonus2 bSubEle`, separados de dano causado.
  - Engine inicial de cast/DPS consumindo os campos de cast/delay ja agregados.
  - Engine inicial de cura/critico consumindo `healPower` e `criticalDamageRate`.
