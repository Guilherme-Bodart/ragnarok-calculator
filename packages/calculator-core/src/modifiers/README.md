# Nightmare Modifier System

This module converts source-specific item scripts into source-independent
modifiers for the calculator engine.

## Contract

- Calculation uses internal IDs, never translated text.
- rAthena codes are parser input only. Keep them in `source.args` for audit.
- The damage engine should consume normalized modifiers, not raw scripts.
- Parsers should be incremental. Unsupported statements must stay visible.
- Resolver logic evaluates context such as refine, grade, enchant, server, or
  episode later. Parser logic should not decide damage formulas.

## Normalized Modifier

```ts
{
  stat:
    | "atk"
    | "matk"
    | "str"
    | "agi"
    | "vit"
    | "int"
    | "dex"
    | "luk"
    | "allStats"
    | "pAtk"
    | "smatk"
    | "atkRate"
    | "matkRate"
    | "baseAtk"
    | "raceDamageRate"
    | "elementDamageRate"
    | "sizeDamageRate"
    | "magicRaceDamageRate"
    | "magicElementDamageRate"
    | "magicSizeDamageRate"
    | "magicElementAttackRate",
  operator: "addFlat" | "addPercent",
  value: number,
  target:
    | { type: "self" }
    | { type: "race"; raceId: "demihuman" }
    | { type: "element"; elementId: "fire" }
    | { type: "size"; sizeId: "large" },
  conditions: [{ type: "refine", operator: ">=", value: 7 }],
  source: {
    format: "rathena",
    command: "bonus" | "bonus2",
    raw: "bonus2 bAddRace,RC_DemiHuman,15;",
    args: ["bAddRace", "RC_DemiHuman", "15"]
  }
}
```

## Supported Initial Input

```txt
bonus bAtk,25;
bonus bMatk,30;
bonus bAllStats,10;
bonus bStr,5;
bonus bInt,6;
bonus bDex,7;
bonus bPAtk,4;
bonus bSMatk,5;
bonus bAtkRate,5;
bonus bMatkRate,10;
bonus bBaseAtk,100;
bonus2 bAddRace,RC_DemiHuman,15;
bonus2 bAddEle,Ele_Fire,7;
bonus2 bAddSize,Size_Large,5;
bonus2 bMagicAddRace,RC_DemiHuman,9;
bonus2 bMagicAddEle,Ele_Ghost,11;
bonus2 bMagicAddSize,Size_All,12;
bonus2 bMagicAtkEle,Ele_Wind,13;
if (getrefine() >= 7) bonus bAtkRate,5;
```

## Pipeline

```txt
rawScript
-> ModifierNormalizer
-> NormalizedModifier[]
-> ModifierResolver + context
-> applicable modifiers
-> ModifierAggregator
-> aggregated buckets
-> future damage engine
```

`ItemModifierPipeline` wraps this flow for item-like objects. If both
`modifiers` and `rawScript` are present, pre-normalized `modifiers` are used as
the source of truth and `rawScript` is not parsed again.

## Aggregation

Resolved modifiers are grouped by:

```txt
stat + operator + target
```

Example:

```txt
bonus bAtkRate,5;
bonus bAtkRate,3;
```

becomes:

```ts
{
  stat: "atkRate",
  operator: "addPercent",
  target: { type: "self" },
  value: 8,
  breakdown: [/* original normalized modifiers */]
}
```

The `breakdown` array is intentionally preserved so future calculator results
can explain where each number came from.

## Current Calculator Integration

The prototype damage service consumes aggregated modifier buckets through a
small adapter. It currently applies:

- `baseAtk` and `atk` as physical flat attack.
- `matk` as magical flat attack.
- `allStats`, `str`, `int`, and `dex` before base power calculation.
- `pAtk` as final physical percent attack.
- `smatk` as final magical percent attack.
- `atkRate` as physical percent attack.
- `matkRate` as magical percent attack.
- `raceDamageRate`, `elementDamageRate`, and `sizeDamageRate` to physical
  damage when the target matches.
- `magicRaceDamageRate` and `magicElementDamageRate` to magical damage when
  the target matches.
- `magicSizeDamageRate` to magical damage when the target size matches.
- `magicElementAttackRate` to magical damage when the skill element matches.

Legacy `bonuses` still work and are intentionally kept for compatibility while
the modifier system grows.

Item refine context can be passed to `POST /calculator/damage` with:

```ts
{
  itemContexts: [{ itemId: 1234, refine: 7 }]
}
```

Skill-level conditions from scripts such as
`if (getskilllv("SM_BASH") >= 10) { ... }` are resolved only when the request
provides learned skill levels:

```ts
{
  learnedSkills: {
    SM_BASH: 10
  }
}
```

Class/job conditions from scripts such as `if (BaseJob == Job_Knight) { ... }`
are resolved only when the request provides a class id:

```ts
{
  character: {
    classId: "Job_Knight"
  }
}
```

This currently uses rAthena job codes as an interim internal id until a full
class table is introduced.

Class/job stat bonuses from `job_stats.yml` are applied before damage
calculation when `character.classId` and `character.jobLevel` are provided.
The current seed is intentionally small and will be replaced by a full sync
from `external/rathena/db/re/job_stats.yml`.

Fourth job traits currently contribute:

- `POW`: `StatusAtk +5` per point and `P.Atk +1` per 3 points.
- `SPL`: `StatusMatk +5` per point and `S.Matk +1` per 3 points.
- `CON`: `P.Atk +1` and `S.Matk +1` per 5 points.
- `STA`, `WIS`, and `CRT` are derived for future defensive/healing/critical
  engines, but do not affect the current outgoing damage prototype yet.

Ruleset context is also accepted by the calculator request. LATAM Renewal is
the default when omitted:

```ts
{
  ruleset: {
    server: "latam",
    mechanics: "renewal",
    episode: "optional-episode-code"
  }
}
```

The parser does not branch by server. Server and episode differences should be
handled later by resolver/engine rules.

## Internal Race IDs

| rAthena code | Internal ID |
| --- | --- |
| `RC_Formless` | `formless` |
| `RC_Undead` | `undead` |
| `RC_Brute`, `RC_Animal` | `brute` |
| `RC_Plant` | `plant` |
| `RC_Insect` | `insect` |
| `RC_Fish` | `fish` |
| `RC_Demon` | `demon` |
| `RC_DemiHuman`, `RC_Player_Human` | `demihuman` |
| `RC_Angel` | `angel` |
| `RC_Dragon` | `dragon` |

## Server Scope

The first supported target can be LATAM while preserving this contract. Server
differences should enter through a future ruleset/resolution context, not
through translated names or parser-specific damage behavior.
