Etapa 1: Consolidar O Contrato Do Modifier System
Objetivo: deixar claro o “idioma interno” dos modifiers antes de plugar em qualquer cálculo.

Fazer:

revisar nomes de stat, operator, target, conditions;
definir se códigos como RC_DemiHuman ficam crus ou se já mapeamos para IDs internos tipo demihuman;
criar um pequeno documento/arquivo de referência com exemplos;
garantir que o schema aguente expansão para server, episode, grade, enchant, skill, class.
Resultado esperado:

Modifier format estável o suficiente para sync, parser e engine falarem a mesma língua.
Etapa 2: Criar O Aggregator De Modifiers
Objetivo: transformar uma lista de modifiers aplicáveis em um resumo útil para cálculo.

Exemplo:

[
  { stat: "atkRate", value: 5 },
  { stat: "atkRate", value: 3 },
  { stat: "baseAtk", value: 100 }
]
vira:

{
  atkRate: 8,
  baseAtk: 100
}
Fazer:

criar ModifierAggregator;
somar modifiers por stat + target;
preservar breakdown para debug futuro;
testes básicos.
Resultado esperado:

modifiers aplicáveis -> efeitos agregados prontos para a damage engine.
Etapa 3: Adaptar RoItem Para Aceitar Modifiers Normalizados
Objetivo: preparar os dados locais para carregar rawScript e/ou modifiers.

Fazer:

adicionar campos opcionais no tipo RoItem:
rawScript?: string
modifiers?: NormalizedModifier[]
não remover bonuses ainda;
manter compatibilidade com seeds atuais;
talvez criar um helper que pega item.modifiers ou parseia item.rawScript.
Resultado esperado:

Item pode carregar modifier moderno sem quebrar cálculo atual.
Etapa 4: Criar Uma Pipeline De Item Effects
Objetivo: juntar parser + resolver + aggregator em uma API interna simples.

Exemplo:

itemEffectService.getEffects(item, { refine: 7 })
retorna:

{
  modifiers: [...],
  totals: {...},
  unsupportedStatements: [...]
}
Fazer:

criar uma função/classe pura, talvez ItemModifierPipeline;
aceitar contexto por item: refine, grade futuramente;
não depender de Nest inicialmente;
testes com item fake.
Resultado esperado:

A engine de dano não precisa saber parsear rAthena.
Etapa 5: Integrar Parcialmente Na Damage Engine
Objetivo: começar a substituir bonuses manuais por modifiers, sem quebrar o endpoint atual.

Fazer:

manter suporte a bonuses;
se item tiver modifiers ou rawScript, usar a pipeline;
aplicar só:
baseAtk
atkRate
matkRate
raceDamageRate
adicionar testes de cálculo simples.
Resultado esperado:

POST /calculator/damage começa a consumir o Modifier System.
Etapa 6: Melhorar Parser Com Mais Bonus Codes
Objetivo: expandir cobertura aos poucos, guiado pelos dados reais.

Adicionar gradualmente:

bMatk
bAtk
bShortAtkRate
bLongAtkRate
bAddSize
bAddEle
bMagicAddRace
bMagicAddEle
bVariableCastrate, etc., só quando for útil.
Resultado esperado:

Parser cresce por casos reais, com teste para cada novo comando.
Etapa 7: Separar Server/Episode Rules
Objetivo: preparar iRO/LATAM/bRO/kRO sem inventar complexidade cedo demais.

Fazer:

criar RulesetContext;
começar simples:
{
  server: "iro",
  mechanics: "renewal",
  episode?: string
}
usar isso primeiro apenas no resolver ou engine, não no parser.
Resultado esperado:

Mesmo modifier pode ser interpretado diferente por ruleset no futuro.
Minha sugestão de execução imediata:

Agora fazer Etapa 1, pequena e limpa: estabilizar contrato e IDs.
Depois Etapa 2, aggregator.
Só então tocar nos tipos de item e integração.