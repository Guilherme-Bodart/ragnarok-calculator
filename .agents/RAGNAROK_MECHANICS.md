# Mecânicas do Ragnarok Online Mechanics - Source of Truth
*Baseado puramente no emulador rAthena e comportamentos oficiais.*

## Arquivos Core (rAthena C++ Engine)
Para encontrar as fórmulas exatas de dano ao programar a calculadora, use os arquivos da engine C++ localizados em `external/rathena/src/map/`:
1. **`battle.cpp` e `battle.hpp`**: Core do cálculo. Funções como `battle_calc_damage`, `battle_calc_attack`, e `battle_calc_weapon_attack` cuidam da matemática de baseATK, modificadores raciais, elementais, de tamanho, DEF, Lex Aeterna, etc.
2. **`skill.cpp` e `skill.hpp`**: Lógica de "casting", tempo de cast, delay, validação de pré-requisitos, área de splash e mecânicas gerais da engine de habilidades.
3. **`skills/` (Pasta)**: Implementação *skill-by-skill*! Cada habilidade tem seu arquivo (ex: `skills/mage/crimsonrock.cpp`). Aqui estão os multiplicadores exatos e o número de hits da habilidade. Sempre verifique o método `modifyDamageData` ou `getSkillRatio` no arquivo CPP da classe específica.

---

## 1. Atributos (Stats) e Traits (4ª Classe)

### 1.1 Atributos Base (Nível 1 ao 200/250)
A matemática base de Ragnarok deriva desses status. (Todos somados com Equipamentos e Buffs na fórmula geral).
- **STR (Força)**: Aumenta Status ATK meele. Aumenta capacidade de carga.
- **AGI (Agilidade)**: Aumenta Esquiva (Flee) e Velocidade de Ataque (ASPD).
- **VIT (Vitalidade)**: Aumenta HP Máximo, Soft DEF, resistência a status negativos (Atordoamento, etc), e eficácia de cura recebida.
- **INT (Inteligência)**: Aumenta Status MATK, SP Máximo, Soft MDEF, tempo de conjuração variável (junto com DEX).
- **DEX (Destreza)**: Aumenta Precisão (Hit), Status ATK de armas de longa distância (Arcos, Armas de Fogo), e é o maior redutor do tempo de Conjuração Variável.
- **LUK (Sorte)**: Aumenta Taxa de Crítico (Crit), Precisão Perfeita (Perfect Hit), Ataque Físico e Mágico em menor escala, e Esquiva Perfeita.

### 1.2 Traits / Novos Atributos (Nível 200+)
A partir do nível 200, as 4ªs Classes introduzem os "Traits". Os nomes variam entre global (iRO) e Latam (bRO). **No nosso código (TypeScript, DB), usamos SEMPRE o nome Global (inglês).** Na interface, convertemos para PT-BR quando o idioma estiver selecionado.

| English Code (Global/iRO) | Sigla PT-BR (bRO) | O que aumenta (Fórmula base aproximada) |
| :--- | :--- | :--- |
| **POW** (Power) | **POD** (Poder) | **P.ATK** (+1 a cada 3 POW) e Status ATK (+5 por ponto). |
| **STA** (Stamina) | **STA** (Vigor) | **RES** (+1 a cada 3 STA) e +1 RES extra a cada 5 STA. Aumenta Soft DEF. |
| **WIS** (Wisdom) | **SAB** (Sabedoria) | **MRES** (+1 a cada 3 WIS) e +1 MRES extra a cada 5 WIS. Aumenta Soft MDEF. |
| **SPL** (Spell) | **FEI** (Feitiço) | **S.MATK** (+1 a cada 3 SPL) e Status MATK (+5 por ponto). |
| **CON** (Concentration)| **CON** (Concentração)| **P.ATK** e **S.MATK** (+1 a cada 5 CON). Hit (+2 por ponto), Flee (+2 por ponto). |
| **CRT** (Creative) | **CRV** (Criatividade) | **H.PLUS** (Heal Plus, +1 a cada 3 CRT) e **C.RATE** (Critical Rate, +1 a cada 3 CRT). |

---

## 2. Composição de Ataque (ATK e MATK)

O valor de ATK e MATK que o jogador vê na janela de status (ex: `500 + 300`) tem um significado estrito:
- A parte **Esquerda** (500) é o **Status ATK / Status MATK** (derivado primariamente de STR/DEX/LUK/POW ou INT/DEX/LUK/SPL, respectivamente).
- A parte **Direita** (300) é o **Weapon ATK + Equip ATK + Mastery ATK**.

### P.ATK e S.MATK (Percentual Final)
O **P.ATK** (Physical Attack) e **S.MATK** (Spell Magical Attack) são atributos percentuais *finais*. 
- `1 ponto de P.ATK` = **+1% de Dano Físico Final** (aplicado como multiplicador separado no final da equação de ATK de Equipamento e Arma).
- `1 ponto de S.MATK` = **+1% de Dano Mágico Final**.

### RES e MRES (Mitigação Fina)
Da mesma forma que monstros possuem Hard DEF e Soft DEF, monstros de alto nível de episódios novos possuem **RES** (Resistance) e **MRES** (Magic Resistance).
Eles mitigam o dano já calculado através da fórmula: 
- `Dano Final = Dano * [ 2000 / (2000 + RES) ]`
*Nota: Itens e cartas que dão "Ignorar RES" ou "Ignorar MRES" subtraem diretamente da base do monstro antes da divisão.*

---

## 3. Fórmulas de Habilidades (Skills)

### 3.1 Dano Dinâmico e Data-Driven
No Ragnarok, o dano base de uma habilidade varia por nível e sofre balanceamentos (patches).
- **Nunca fixe porcentagens** de nível (ex: `level * 300`) diretamente na lógica de uma classe TS como `generic-skill.ts`.
- Essas proporções de multiplicador base devem vir do **Dataset** (seeds de skills, e banco de dados). O motor da calculadora apenas aplica:
  `Base_Skill_Multipler = (Dataset_Multiplier + (Bonus_Equips_SkillDamage * 100)) * (BaseLevel / 100)` -> Exemplo comum.

### 3.2 Activity Points (AP)
Algumas habilidades de 4ª classe (ex: da Magus, Dragon Knight) geram ou consomem **AP** (Activity Points).
- **Para fins da Calculadora de Dano:** O custo de AP para conjurar **não importa para a fórmula matemática do dano em si**. Não adicione travas lógicas impedindo a conjuração na calculadora devido à falta de AP.
- **Buffs por AP**: Algumas habilidades ativadas por AP concedem buffs gigantescos a outras skills (ex: *Potencializar Magia* / *Climax*). Na calculadora, o agente deve se focar em garantir que o **Efeito de Buff** correspondente aplique os multiplicadores corretamente no alvo/jogador.

---

## 4. Pipeline de Multiplicadores (A Engine)

Tudo que dá bônus ao jogador no jogo real é convertido pela pipeline em `packages/calculator-core/src/modifiers`:
1. **Source / Parser**: Transforma scripts do emulador (`bonus2 bSkillAtk,"WL_TETRAVORTEX",10;`) em objetos TypeScript `NormalizedModifier`.
2. **Aggregator**: Agrupa modifiers idênticos (ex: Múltiplas cartas de +ATK% somam os valores num mesmo "bucket").
3. **Resolução**: Na hora do cálculo contra um monstro, filtros de `target` e `conditions` aplicam os buckets que importam (ex: Dano Racial só é ativado se a raça do `RoMonster` selecionado bater com o ID racial do `Modifier`).

**Ao implementar algo novo:** Modifique ou adicione suporte no **Parser** e no enum de Modifiers. Nunca faça lógicas isoladas ou condicionais hardcoded em componentes React da UI. A Engine faz tudo.

---

> Esse documento é a base viva das mecânicas matemáticas. Atualize-o ou adicione novas referências quando regras específicas do emulador rAthena ou bROWiki entrarem no escopo de simulação da calculadora.
