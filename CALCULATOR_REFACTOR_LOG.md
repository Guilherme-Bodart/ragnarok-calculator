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

### 2026-06-24 - Bonus ofensivo por classe no pipeline

- `classDamageRate` e `magicClassDamageRate` agora entram no final rate fisico/magico do `DamageFormulaPipeline`.
- `Class_All` aplica mesmo sem `monster.classType`; `Class_Normal` e `Class_Boss` aplicam quando o alvo traz essa classificacao.
- Teste cobre dano fisico por `Class_All` e dano magico por `Class_Boss`.

Motivo: o parser ja capturava `bAddClass`/`bMagicAddClass`, mas o pipeline principal ainda nao consumia esses mapas.

### 2026-06-24 - Formulas bRO de ASPD e conjuracao

- `CastTimingEngine` passou a aplicar a reducao natural de conjuracao variavel por `DEX * 2 + INT`.
- Conjuracao fixa agora aplica reducao flat primeiro e usa a maior reducao percentual fixa, em vez de somar percentuais.
- `AspdEngine` passou a usar a formula de ASPD por classe/arma + bonus AGI/DEX + percentual de equipamentos + ponto fixo.
- Cap de ASPD agora e 190 ate base 99 e 193 a partir do base 100.

Motivo: alinhar o core com a referencia do bRO/Browiki, deixando cast e ASPD bem mais proximos do comportamento real antes de evoluir buffs e consumiveis.

### 2026-06-24 - Expressoes matematicas rAthena

- Avaliador de expressoes passou a aceitar `min`, `max`, `pow`, `getrefine()` e `getenchantgrade()`.
- Isso libera comandos que ja tinham mapper, mas falhavam quando o valor era uma expressao como `pow(min(14,.@r)-3,2)` ou `getrefine()*14`.
- Auditoria do parser subiu de 6.734 para 7.149 scripts totalmente suportados e reduziu unsupported statements para 21.709.

Motivo: aumentar cobertura sem criar regras novas de jogo; apenas avaliamos expressoes deterministicas que usam contexto ja conhecido do item/refino/grade.

### 2026-06-24 - Ordem final de elemento e resistencia elemental

- `DamageFormulaPipeline` passou a aplicar elemento depois da mitigacao de DEF/MDEF.
- O breakdown agora separa `preDefenseDamage`, `postDefenseDamage`, `elementMultiplier` e `elementResistanceRate`.
- `RoMonster` ganhou `elementResistanceRates` opcional para resistencias do alvo por elemento.
- Exemplo esperado: dano que virou 200 por vantagem elemental e encontra 30% de resistencia a fogo termina em 140.

Motivo: fica mais facil auditar o resultado como "dano apos defesa" multiplicado por vantagem/desvantagem elemental e depois reduzido por resistencia elemental especifica do alvo.

### 2026-06-24 - Elemento de arma via bAtkEle

- Parser rAthena passou a reconhecer `bonus bAtkEle,Ele_*`.
- O efeito final guarda `weaponElement` sem aceitar `Ele_All` como elemento real de arma.
- `DamageFormulaPipeline` usa `weaponElement` como fallback elemental para skills fisicas sem elemento fixo.
- Auditoria do parser subiu de 6.621 para 6.734 scripts totalmente suportados e reduziu unsupported statements para 22.335.
- `bonus bAtkEle` saiu do top unsupported.

Motivo: varias builds fisicas dependem do elemento da arma/endow. Sem esse fallback, skills fisicas sem elemento proprio sempre batiam como neutro.

### 2026-06-24 - DEF e MDEF de itens no status

- Parser rAthena passou a reconhecer `bonus bDef` e `bonus bMdef`.
- `CalculatorModifierEffectsFactory` agrega `flatDefense` e `flatMagicDefense`.
- `CharacterStatusEngine` expoe `defense` e `magicDefense`, somando DEF de equipamento com DEF/MDEF vindos de script.
- Auditoria do parser subiu de 5.852 para 6.621 scripts totalmente suportados e reduziu unsupported statements para 22.595.
- `bonus bDef` saiu do top unsupported.

Motivo: defesa de equipamento e MDEF aparecem muito em scripts reais; mesmo sem fechar o calculo defensivo completo, o status do personagem precisa carregar esses valores para buffs, preview e futuras formulas.

### 2026-06-24 - Modificadores por classe de monstro

- Parser rAthena passou a reconhecer `bonus2 bAddClass`, `bonus2 bMagicAddClass` e `bonus2 bSubClass`.
- Os alvos `Class_All`, `Class_Normal` e `Class_Boss` viram ids internos `all`, `normal` e `boss`.
- Efeitos ofensivos entram em `classDamageRate` e `magicClassDamageRate`; reducoes defensivas entram em `incomingClassDamageReductionRate`.
- `RoMonster` ganhou `classType` opcional para diferenciar normal/boss quando o dataset tiver esse dado.
- Auditoria do parser subiu de 5.698 para 5.852 scripts totalmente suportados e reduziu unsupported statements para 24.465.
- `bonus2 bAddClass` e `bonus2 bMagicAddClass` sairam do top unsupported.

Motivo: dano contra todos/boss/normal aparece em muitos equipamentos modernos. Capturar isso melhora o calculo ofensivo sem depender de hacks no componente React.

### 2026-06-24 - Reducoes defensivas por raca e elemento

- Parser rAthena passou a reconhecer `bonus2 bSubRace` e `bonus2 bSubEle`.
- Efeitos sao agregados em campos defensivos separados de dano causado: `incomingRaceDamageReductionRate` e `incomingElementDamageReductionRate`.
- Auditoria do parser subiu de 5.349 para 5.698 scripts totalmente suportados e reduziu unsupported statements para 25.103.
- `bSubRace` caiu de 1.577 para 385 entradas restantes; `bSubEle` saiu do top unsupported.

Motivo: reducoes defensivas aparecem muito nos itens, mas precisam ficar separadas do calculo ofensivo para nao contaminar o dano causado.

### 2026-06-24 - Cast e cooldown base das skills rAthena

- Adapter `rathena-normalized` mapeia `CastTime`, `FixedCastTime`, `AfterCastActDelay` e `Cooldown` para os campos opcionais de `RoSkill`.
- Valores fixos sao expandidos para todos os niveis; arrays `{ Level, Time }` viram mapa por nivel.
- Testes cobrem a conversao e preservam compatibilidade com skills sem dados de tempo.

Motivo: o engine de cast/DPS criado antes precisava de dados reais de skill para deixar de ser apenas estrutural.

### 2026-06-24 - Engine inicial de cast e DPS

- Criado `CastTimingEngine` no core.
- `RoSkill` ganhou campos opcionais por nivel para cast variavel, cast fixo, pos-conjuracao e cooldown.
- `DamageFormulaPipeline` calcula tempo de ciclo e DPS estimado quando a skill possui dados de tempo.
- Breakdown passou a expor cast/delay/cooldown/cycle/DPS.
- `test:calculator` inclui o spec de cast timing.

Motivo: transformar os modificadores de cast/delay capturados no bloco anterior em dados consumiveis pelo resultado, preparando DPS real sem custo alto no frontend.

### 2026-06-24 - Critico e cura de itens no modifier core

- Parser rAthena passou a reconhecer `bCritAtkRate` e `bHealPower`.
- `CalculatorModifierEffectsFactory` agrega `criticalDamageRate` e `healPower` para uso futuro por dano critico e formulas de cura.
- Auditoria do parser subiu de 5.056 para 5.349 scripts totalmente suportados e reduziu unsupported statements para 27.133.
- Testes focados cobrem normalizacao e agregacao.

Motivo: equipamentos de dano critico e cura eram comuns no top unsupported; capturar esses efeitos melhora a rastreabilidade do resultado e prepara engines especificos.

### 2026-06-24 - Cast e delay de itens no modifier core

- Parser rAthena passou a reconhecer `bVariableCastrate`, `bFixedCastrate`, `bFixedCast` e `bDelayrate`.
- Parser tambem reconhece variantes por skill via `bonus2 bVariableCastrate`, `bonus2 bFixedCastrate` e `bonus2 bSkillFixedCast`.
- `CalculatorModifierEffectsFactory` agrega efeitos globais e por skill em campos dedicados para futuro engine de cast/DPS.
- Auditoria do parser subiu de 4.250 para 5.056 scripts totalmente suportados e reduziu unsupported statements para 28.010.
- Testes focados cobrem normalizacao e agregacao.

Motivo: muitos itens modernos reduzem conjuracao e pos-conjuracao; capturar esses efeitos no core prepara DPS real sem precisar reprocessar scripts no frontend.

### 2026-06-24 - Trait stats de itens no core

- Parser rAthena passou a reconhecer `bPow`, `bSta`, `bWis`, `bSpl`, `bCon` e `bCrt`.
- Efeitos de item agora agregam os 12 stats do personagem, mantendo `bAllStats` restrito aos seis atributos classicos.
- `CharacterStatusEngine` aplica traits vindos de item antes de calcular status ATK/MATK/HIT/FLEE.
- Auditoria do parser subiu de 4.108 para 4.250 scripts totalmente suportados e reduziu unsupported statements para 30.862.
- Testes focados cobrem parser, agregador, status engine e pipeline de dano.

Motivo: itens de 4a classe e equipamentos modernos usam traits diretamente; ignorar esses comandos derrubava a precisao do dano mesmo quando a formula da skill estava correta.

### 2026-06-04 - Busca sob demanda de equipamentos e cartas

- Selects de item/carta agora so disparam busca depois de 3 caracteres.
- Busca remota de equipamento/carta usa debounce de 500ms no modal.
- A rota `GET /api/calculator/items` retorna lista vazia para query curta, evitando varrer indices grandes ao abrir o select.
- `RichSelect` ganhou texto vazio configuravel pelo design system.
- O indice de itens passa a usar `items.br.json` como camada de nome/search quando o ID existe, mantendo o nome rAthena em `sourceName`.
- Detalhe de item tambem exibe nome localizado quando disponivel, sem trocar a fonte mecanica do calculo.
- `npm run test:calculator`: passou, 60 testes.
- `npm run typecheck`: passou.
- `npm run typecheck:test`: passou.
- `npm run lint`: passou.

Motivo: deixar a escolha de equipamentos/cartas escalavel para catalogos grandes e permitir busca por nomes em portugues.

### 2026-06-04 - Build sem inferencia estrutural dos datasets grandes

- O `tsconfig.json` do frontend passou a cobrir apenas codigo da aplicacao; testes usam o novo `tsconfig.test.json` e scripts ficam fora do build.
- Imports dos JSONs grandes de skills agora usam contratos TypeScript explicitos, evitando inferir toda a estrutura dos datasets.
- Endpoints locais de itens e monstros passaram a ler os datasets completos apenas no servidor.
- Typecheck diagnostico caiu de 204s/2 GB/1.019.708 linhas JSON para 5,8s/344 MB/1.230 linhas JSON.
- Build completo caiu de 252,8s para 16,5s; etapa TypeScript caiu de cerca de 240s para 6,5s.
- `npm run test:calculator`: passou, 58 testes.
- `npm run typecheck`: passou.
- `npm run typecheck:test`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.
- Calculadora e endpoints locais de itens/monstros responderam HTTP 200 apos o build.

Motivo: impedir que o TypeScript transforme e infira datasets enormes em todo build sem perder os contratos usados pela aplicacao.

### 2026-06-03 - Multiplicadores vindos dos tooltips

- Criado parser leve para linhas de tooltip com `[Lv X]`, `ATK/MATK n%` e `X ntimes`.
- O mapeamento de skills da calculadora agora prefere multiplicadores/hits extraidos de `skill-tooltips.en.json`.
- Fallback generico continua `prototype`, mas usa dados por nivel melhores quando disponiveis.
- Testes cobrem parser puro e integracao com skills da arvore.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: usar dados reais por level dos tooltips sem inventar uma formula final individual para cada skill.

### 2026-06-03 - Builds com duplicar

- Modal de builds ganhou acao explicita para duplicar uma build salva da conta.
- Duplicar usa o payload salvo daquela linha, cria nova build via `POST /calculator/builds` e nao altera a build atual aberta.
- Textos adicionados em PT/EN/ES.
- Lista de builds agora comporta acoes de duplicar e remover por linha.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: fechar o fluxo de saves por conta com carregar, salvar como, atualizar, duplicar e excluir.

### 2026-06-03 - ScrollArea padronizado

- A arvore de skills passou a usar o componente `ScrollArea` do design system.
- `Tabs` em modo barra passa a receber `ui-scrollarea`.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: reduzir scroll nativo seco e centralizar o comportamento visual em componentes/classes `ui-*`.

### 2026-06-03 - Formulas estaticas Swordman/Knight

- `StaticSkillFormula` passou a cobrir `SM_MAGNUM` e `KN_BOWLINGBASH`.
- `SM_MAGNUM` usa ATK 120%-300% conforme tooltip.
- `KN_BOWLINGBASH` usa ATK 140%-500% com 2 hits no caso padrao.
- Testes cobrem multiplicador e hit count dessas formulas.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: aumentar cobertura validada de Swordman/Knight usando dados confirmados do tooltip local, sem modelar excecoes de multi-alvo ainda.

### 2026-06-03 - Labels de ataque/resultado no i18n

- Card de ataque deixou de usar labels hardcoded.
- Painel de alvo/resultado deixou de usar labels hardcoded para busca, precisao, formula, elemento, tamanho, mods e buffs.
- Textos adicionados em PT/EN/ES.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: manter a calculadora pronta para troca de idioma e evitar refactor de UX em textos espalhados.

### 2026-06-03 - Buff catalog e select em portal

- Criado catalogo versionado inicial de buffs com grupos manual/consumivel.
- Buffs manuais continuam usando `BUFF_900001+`, mas agora possuem preview pelo parser/modifier core.
- Resultado da calculadora adiciona `activeBuffItems` no breakdown.
- `RichSelect` renderiza o menu em portal/fixed para nao criar scroll interno no modal.
- `Modal` usa `ScrollArea` do design system para scroll proprio quando o conteudo realmente excede a tela.
- Removido o meta visual do modal de equipamento para nao parecer texto grudado no botao de fechar.
- Testes cobrem catalogo de buffs, preview e contagem de buffs no resultado.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: deixar buffs mais rastreaveis no payload/resultado e corrigir dropdowns cortados por overflow de modal sem espalhar CSS local.

### 2026-06-03 - Equipamentos com cartas validas

- Troca de item agora preserva apenas cartas que cabem no novo numero de slots.
- Ao remover/trocar item, contexto de refino antigo e limpo quando nao deve mais ser usado.
- Paperdoll mostra nome curto do item equipado e quantidade de cartas.
- Preview do item ficou mais compacto para reduzir espaco gasto com slots/ATK/MATK/DEF/refino.
- Testes cobrem limite de cartas por slot e nome curto no paperdoll.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: fechar comportamento funcional de equipamentos/cartas/refino antes de investir em imagens/UX mais rica.

### 2026-06-03 - Formulas estaticas de bolts

- `StaticSkillFormula` passou a cobrir `MG_FIREBOLT` e `MG_LIGHTNINGBOLT`, alem de `MG_COLDBOLT`.
- Bolts usam multiplicador 1 por hit e hit count igual ao nivel da skill no pipeline atual.
- `test:calculator` passou a incluir `skill-formula-registry.spec.ts`.
- Testes cobrem formulas estaticas dos tres bolts e preservam fallback generico.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: aumentar cobertura validada de formulas sem marcar como precisa uma skill complexa que ainda nao foi conferida.

### 2026-06-03 - Monstros reais por API local

- Criado `scripts/generate-calculator-monster-index.mjs`.
- Gerado `nightmare-data/generated/calculator/monsters-index.json` com indice leve de monstros.
- Criados endpoints:
  - `GET /api/calculator/monsters?q=poring`
  - `GET /api/calculator/monsters/:monsterId`
- Criado `components/calculator/calculator-monster-data.ts`.
- O painel de alvo usa busca real via `RichSelect` e carrega detalhe do monstro selecionado.
- O dataset da calculadora passa a receber o monstro selecionado sem importar o catalogo completo no client.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.

Motivo: remover a dependencia do alvo em `calculatorDemoDataset.monsters` e preparar a V1 para monstros reais sem jogar dados grandes no bundle client.

### 2026-06-03 - Card de ataque separado

- Criado `components/calculator/calculator-attack-panel.tsx`.
- O personagem fica focado em classe, base/job e status; skill/nivel foram para o card de ataque.
- O card lista as skills de dano/cura da classe selecionada usando o filtro atual.
- O card mostra icone, tipo, elemento, hits, multiplicador e aviso de precisao.
- O workbench sincroniza skill/nivel para nao calcular acima do maximo permitido pela skill.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.

Motivo: separar responsabilidades do fluxo da calculadora e preparar o proximo passo de warnings/formulaId no resultado.

### 2026-06-03 - Resultado com precisao e formulaId

- `CalculationMeta` agora inclui `formulaId`.
- O core marca formulas especificas como `validated` e fallback generico como `prototype`.
- O painel de alvo mostra precisao, formula, elemento, tamanho e contagem de modificadores nao suportados.
- O script `test:calculator` passou a incluir `calculate-damage-from-dataset.spec.ts`.
- Ajustados testes do core para validar `static:SM_BASH` e fallback `generic`.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: deixar transparente quando a calculadora esta usando formula validada ou prototipo, sem esconder statements ainda nao suportados.

### 2026-06-03 - Payload V2 em secoes

- `CalculatorBuildPayload` evoluiu para `version: 2`.
- Payload agora separa `character`, `attack`, `tree`, `equipment`, `buffs` e `target`.
- `migrateCalculatorBuildPayload` converte builds V1 flat para V2.
- LocalStorage e API de builds carregam payload antigo via migracao.
- API de builds salva `classId` a partir de `payload.character.selectedClassId`.
- Testes cobrem payload V2 valido, dados malformados e migracao V1.
- `npm run test:calculator`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: preparar multiplos personagens/builds por conta e facilitar evolucao do payload sem quebrar saves antigos.

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

### 2026-05-30 - Modal promovido ao design system

- Criado `components/ui/modal.tsx`.
- Modais de builds e escolha de item passaram a usar o componente compartilhado.
- CSS base de modal saiu de `calculator.css` e foi para `ui.css`.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: evitar repetir estrutura/estilo de modal por dominio e facilitar alteracoes globais de design depois.

### 2026-05-30 - Preview do item no picker

- Modal de equipamento ganhou preview do item selecionado.
- Preview mostra id, nome, refino, tipo, slots, ATK, MATK, DEF e cartas equipadas.
- Textos adicionados ao i18n `pt/en/es`.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: deixar o select focado em escolher e mover detalhes do item para uma area de confirmacao mais legivel.

### 2026-05-30 - Item picker dividido

- `calculator-item-picker-modal.tsx` caiu para 177 linhas.
- Criados componentes para preview, campos de item e grade de cartas.
- Helpers de opcoes selecionadas/modificadores foram movidos para `calculator-item-picker-utils`.
- `npm run lint`: passou.

Motivo: manter o modal como orquestrador de estado e deixar selecao/preview/cartas em unidades menores.

### 2026-05-30 - Personagem dividido em controles e regras

- `calculator-character-panel.tsx` caiu para 132 linhas.
- Controles de classe/base/job/skill foram extraidos para `calculator-character-controls`.
- Grade de status foi extraida para `calculator-character-stats`.
- Presets e validacao de status foram movidos para `calculator-character-utils`.
- `npm run lint`: passou.

Motivo: separar regra de status/preset do painel visual e reduzir risco ao ajustar calculo de personagem.

### 2026-05-30 - Preview de cartas imediato

- Preview de item agora usa tambem o indice de cartas carregado no modal.
- Nomes das cartas selecionadas aparecem sem esperar o detalhe completo do item.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: evitar estado visual incompleto ao selecionar carta nova no picker.

### 2026-05-30 - Testes e validacao do payload

- Adicionado Vitest na raiz com scripts `test`, `test:calculator` e `test:all`.
- `test:calculator` cobre os utilitarios da calculadora, parser rAthena e um fluxo de equipamento+carta+refino no core.
- `isCalculatorBuildPayload` agora valida a estrutura real do payload em vez de aceitar apenas a versao.
- Corrigido `selectedItemHasModifiers` para reconhecer scripts em detalhes carregados mesmo quando o indice marcava `hasModifiers` como falso.
- `npm run test:calculator`: passou, 30 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: criar uma rede de seguranca para regras puras e evitar builds quebradas vindo do localStorage/conta.

### 2026-06-01 - Pontos de status trans-equivalentes

- Criado `calculator-class-rules` para concentrar regras de classe 4th e trans-equivalente.
- Classes regulares 3rd/4th deduplicadas no select agora contam como trans-equivalentes no painel e no calculo.
- Adicionados testes para `Base 200 = 4151` quando a classe e trans-equivalente e `Base 250 = 197` trait em 4th job.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: depois de remover as variantes `T/T2` do select, a calculadora nao podia mais depender de `classId.includes("_T")` para liberar os 52 pontos de transclasse.

### 2026-06-01 - Dicionario de tooltips de skill

- Criado `scripts/generate-skill-tooltips.ts`.
- O script cruza `nightmare-data/raw/iRo/skill_tree.json` com nossa skill tree usando `skill_code` do iRO como equivalente ao `id` da nossa arvore.
- Gerado `skill-tooltips.en.json` com `bySkillCode`, mantendo a skill tree atual como fonte de classe/requisitos/layout.
- Gerado relatorio com cobertura: 1111/1142 skills unicas da arvore possuem tooltip; 31 ficaram sem match no iRO.
- `npm run data:skill-tooltips`: passou.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.

Motivo: enriquecer tooltips sem inflar `skill-tree.json` com descricoes repetidas por classe e sem depender do iRO Wiki em runtime.

### 2026-06-01 - Personagem no topo e hidratacao estavel

- O painel de personagem saiu da coluna inferior e passou para a faixa superior no lugar do hero grande.
- Removido o bloco visual "Simulador de Combate Nightmare" para reduzir espaco vazio antes dos cards operacionais.
- O build salvo no localStorage agora e carregado apos a hidratacao; o primeiro render usa o mesmo build padrao no server e no client.
- O salvamento local fica bloqueado ate o save real ser lido, evitando sobrescrever o build salvo com o default.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: evitar mismatch de hidratacao quando o localStorage tinha uma classe diferente do HTML gerado no server e deixar a tela inicial mais focada na configuracao do personagem.

### 2026-06-01 - Separacao de personagem e arvore

- A selecao de classe foi movida para o card de personagem usando o `RichSelect` do design system.
- A arvore de skills agora abre sempre na classe selecionada no personagem e nao permite trocar classe dentro do modal.
- Removidos habilidade, nivel da habilidade e presets do card de personagem para separar configuracao de personagem de configuracao de ataque.
- Status passou para grade de 3 colunas e o resumo Status/Trait virou duas colunas compactas com valores maiores.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: deixar classe/base/job/status como responsabilidade do personagem e preparar um card separado para ataque/habilidade depois.

### 2026-06-01 - Tooltip de skill na arvore

- Criados `calculator-skill-tooltip` e `calculator-skill-tooltip-data`.
- A celula da arvore agora mostra informacoes do dicionario `skill-tooltips.en.json` ao passar mouse ou focar controles da skill.
- O tooltip usa `skill.id` da nossa arvore como chave para `bySkillCode`, incluindo linhas como `Skill Requirement : Finish Quest`.
- Skills sem entrada no dicionario mostram fallback simples com nome e max level.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: enriquecer a leitura da arvore sem misturar dados de descricao dentro do layout da celula.

### 2026-06-02 - Acabamento de tooltip e scroll da arvore

- Tooltip de skill passou a abrir apenas ao passar mouse sobre o icone da skill.
- Popover do tooltip agora renderiza em portal no `body`, acima da modal, para nao ser cortado pelo scroll da arvore.
- Removido scroll interno do tooltip; a descricao ocupa o tamanho necessario.
- Criado `ui-scrollarea` no design system para scrollbars compartilhadas com visual Nightmare.
- A lista da arvore usa `ui-scrollarea` e a linha curta extra do header da modal foi removida nesse contexto.
- `npm run test:calculator`: passou, 32 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: evitar corte/transparencia por z-index/overflow e substituir scroll nativo seco por um padrao visual reutilizavel.

### 2026-06-04 - Filtro do RichSelect sem loop de renderizacao

- O posicionamento do menu do `RichSelect` deixou de depender das opcoes filtradas, que recebiam uma nova referencia a cada render.
- Atualizacoes de posicao identicas agora preservam o estado atual em vez de iniciar outro render.
- A abertura de outro select deixou de disparar eventos dentro do setter de estado.
- `npm run test:calculator`: passou, 58 testes.
- `npm run lint`: passou.
- `npm run build`: passou.

Motivo: corrigir o React error #185 ao digitar no filtro de selects com busca local ou remota.

### 2026-06-25 - RES/MRES de itens no status

- Parser rAthena reconhece `bonus bRes` e `bonus bMres`.
- `CalculatorModifierEffectsFactory` agrega esses valores em `flatRes` e `flatMres`.
- `CharacterStatusEngine` expoe `res` e `mres` somando trait base e bonus de itens.
- Esses valores ainda nao entram no dano causado; sao status defensivos para calculos de dano recebido/futuros painels.
- `npm run calculator:audit:parser`: scripts totalmente suportados subiram para 7177 e unsupported statements cairam para 21533.

Motivo: itens de 4th job usam RES/MRES com frequencia, e o status do personagem precisa refletir esses bonus antes de qualquer engine defensiva mais completa.

### 2026-06-25 - Taxa de custo de SP de itens

- Parser rAthena reconhece `bonus bUseSPrate`.
- `CalculatorModifierEffectsFactory` agrega o valor em `spCostRate`.
- Adicionado alias `bonus bMRes` para cobrir a grafia real dos itens do dataset.
- `npm run calculator:audit:parser`: scripts totalmente suportados subiram para 7375 e unsupported statements cairam para 21195.

Motivo: custo de SP nao muda dano direto, mas e parte do ciclo real de uso das skills e deve estar capturado para o card de ataque/recursos.

### 2026-06-25 - Acerto perfeito de itens

- Parser rAthena reconhece `bonus bPerfectHitAddRate`.
- `CalculatorModifierEffectsFactory` agrega o valor em `perfectHitRate`.
- `CharacterStatusEngine` expoe `perfectHitRate` junto com `hit`.
- `npm run calculator:audit:parser`: scripts totalmente suportados subiram para 7446 e unsupported statements cairam para 21030.

Motivo: acerto perfeito nao aumenta dano bruto, mas e parte importante da precisao real contra alvos com esquiva alta.

### 2026-06-25 - Alvo de raca Player Doram

- Parser rAthena mapeia `RC_Player_Doram` para o alvo interno `playerDoram`.
- `playerDoram` fica em `ModifierRaceId`, separado de `MonsterRace`, para nao aplicar bonus PvP em monstros comuns.
- Documentacao dos modificadores atualizada com o novo alvo de raca.
- `npm run calculator:audit:parser`: scripts totalmente suportados subiram para 7736 e unsupported statements cairam para 20182.

Motivo: grande parte dos `bAddRace`/`bSubRace` restantes eram efeitos PvP contra Doram; capturar sem aplicar indevidamente melhora cobertura e preserva seguranca matematica.

### 2026-06-25 - Expressoes de dano por skill com getskilllv

- `evaluateRathenaExpression` agora entende strings em chamadas de funcao e `getskilllv("SKILL_ID")`.
- `RathenaScriptParser` passa `learnedSkills` para o avaliador de expressoes.
- `bonus2 bSkillAtk` com valor dependente de skill aprendida passa a ser normalizado quando o contexto contem `learnedSkills`.
- `npm run calculator:audit:parser`: scripts totalmente suportados subiram para 7960 e unsupported statements cairam para 19180.

Motivo: muitos equipamentos escalam dano de skill com base no nivel aprendido de outra skill; isso afeta diretamente o dano final.
