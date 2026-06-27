import type {
  ModifierClassId,
  ModifierElementId,
  ModifierRaceId,
  ModifierSizeId,
} from "./modifiers";
import type { CalculatorModifierEffects } from "./calculator-modifier-effects";
import type { ElementType } from "./ro-types";

type CharacterStat =
  | "str" | "agi" | "vit" | "int" | "dex" | "luk"
  | "pow" | "sta" | "wis" | "spl" | "con" | "crt";

/**
 * BuffEffect representa o impacto já resolvido de um buff no personagem.
 * O frontend monta essa estrutura por buff ativo e passa para o core via
 * `CalculateDamageInput.buffEffects`. O core apenas acumula os efeitos.
 *
 * Todos os campos são opcionais — preencher apenas o que o buff altera.
 *
 * Exemplos:
 *   - Blessing lv10: { statBonuses: { int: 10, dex: 10, str: 10 } }
 *   - Assumptio: { statBonuses: { vit: 30 } }
 *   - Enchant Poison: { weaponElement: "poison" }
 *   - Food INT: { statBonuses: { int: 10 } }
 *   - Haste: { aspd: 10 }
 *   - Conversor Fire: { weaponElement: "fire" }
 */
export type BuffEffect = {
  /** Bônus de stat base/trait aplicados pelo buff */
  statBonuses?: Partial<Record<CharacterStat, number>>;

  /** ATK flat adicional */
  flatAtk?: number;
  /** MATK flat adicional */
  flatMatk?: number;

  /** Bônus percentual de ATK (%) */
  atkRate?: number;
  /** Bônus percentual de MATK (%) */
  matkRate?: number;

  /** P.Atk (trait físico) */
  pAtk?: number;
  /** S.Matk (trait mágico) */
  smatk?: number;

  /** Bônus de ASPD flat */
  aspd?: number;
  /** Bônus de ASPD percentual (%) */
  aspdRate?: number;

  /** Redução percentual de cast variável (%) */
  variableCastRate?: number;
  /** Redução percentual de cast fixo (%) */
  fixedCastRate?: number;
  /** Redução flat de cast fixo (ms) */
  fixedCast?: number;
  /** Redução percentual de after-cast delay (%) */
  afterCastDelayRate?: number;

  /** HIT flat */
  hit?: number;
  /** FLEE flat */
  flee?: number;
  /** CRIT flat */
  crit?: number;

  /** Bônus percentual de dano crítico (%) */
  criticalDamageRate?: number;
  /** Bônus de poder de cura (%) */
  healPower?: number;

  /** Elemento de arma (endow/conversor) */
  weaponElement?: ElementType;

  /** Dano % por raça do alvo */
  raceDamageRate?: Partial<Record<ModifierRaceId, number>>;
  /** Dano % por elemento do alvo */
  elementDamageRate?: Partial<Record<ModifierElementId, number>>;
  /** Dano % por tamanho do alvo */
  sizeDamageRate?: Partial<Record<ModifierSizeId, number>>;
  /** Dano % por classe do alvo (boss/normal) */
  classDamageRate?: Partial<Record<ModifierClassId, number>>;

  /** Dano mágico % por raça do alvo */
  magicRaceDamageRate?: Partial<Record<ModifierRaceId, number>>;
  /** Dano mágico % por elemento do alvo */
  magicElementDamageRate?: Partial<Record<ModifierElementId, number>>;
  /** Dano mágico % por tamanho do alvo */
  magicSizeDamageRate?: Partial<Record<ModifierSizeId, number>>;
  /** Dano mágico % por classe do alvo */
  magicClassDamageRate?: Partial<Record<ModifierClassId, number>>;

  /** Dano % por skill específica */
  skillDamageRate?: Record<string, number>;

  /** Bônus % de dano em curta distância */
  shortAttackRate?: number;
  /** Bônus % de dano em longa distância */
  longAttackRate?: number;

  /** Ignore DEF por raça (%) */
  ignoreDefenseRate?: Partial<Record<ModifierRaceId, number>>;
  /** Ignore MDEF por raça (%) */
  ignoreMagicDefenseRate?: Partial<Record<ModifierRaceId, number>>;

  /** MaxHP flat */
  maxHp?: number;
  /** MaxHP % */
  maxHpRate?: number;
  /** MaxSP flat */
  maxSp?: number;
  /** MaxSP % */
  maxSpRate?: number;
};

/**
 * Mescla uma lista de BuffEffect em um CalculatorModifierEffects existente,
 * acumulando cada campo por soma. Records (raça, elemento, tamanho) são
 * mergeados com soma por chave.
 */
export function mergeBuffEffects(
  base: CalculatorModifierEffects,
  buffs: BuffEffect[],
): CalculatorModifierEffects {
  const result = { ...base };

  for (const buff of buffs) {
    if (buff.statBonuses) {
      result.statBonuses = { ...result.statBonuses };
      for (const [key, value] of Object.entries(buff.statBonuses)) {
        const stat = key as CharacterStat;
        result.statBonuses[stat] = (result.statBonuses[stat] ?? 0) + (value ?? 0);
      }
    }

    if (buff.flatAtk !== undefined) result.flatAtk += buff.flatAtk;
    if (buff.flatMatk !== undefined) result.flatMatk += buff.flatMatk;
    if (buff.atkRate !== undefined) result.atkRate += buff.atkRate;
    if (buff.matkRate !== undefined) result.matkRate += buff.matkRate;
    if (buff.pAtk !== undefined) result.pAtk += buff.pAtk;
    if (buff.smatk !== undefined) result.smatk += buff.smatk;
    if (buff.aspd !== undefined) result.aspd += buff.aspd;
    if (buff.aspdRate !== undefined) result.aspdRate += buff.aspdRate;
    if (buff.variableCastRate !== undefined) result.variableCastRate += buff.variableCastRate;
    if (buff.fixedCastRate !== undefined) result.fixedCastRate += buff.fixedCastRate;
    if (buff.fixedCast !== undefined) result.fixedCast += buff.fixedCast;
    if (buff.afterCastDelayRate !== undefined) result.afterCastDelayRate += buff.afterCastDelayRate;
    if (buff.hit !== undefined) result.hit += buff.hit;
    if (buff.flee !== undefined) result.flee += buff.flee;
    if (buff.crit !== undefined) result.crit += buff.crit;
    if (buff.criticalDamageRate !== undefined) result.criticalDamageRate += buff.criticalDamageRate;
    if (buff.healPower !== undefined) result.healPower += buff.healPower;
    if (buff.shortAttackRate !== undefined) result.shortAttackRate += buff.shortAttackRate;
    if (buff.longAttackRate !== undefined) result.longAttackRate += buff.longAttackRate;
    if (buff.maxHp !== undefined) result.maxHp += buff.maxHp;
    if (buff.maxHpRate !== undefined) result.maxHpRate += buff.maxHpRate;
    if (buff.maxSp !== undefined) result.maxSp += buff.maxSp;
    if (buff.maxSpRate !== undefined) result.maxSpRate += buff.maxSpRate;

    // weaponElement: último buff que definir um elemento vence (ex: endow > conversor)
    if (buff.weaponElement !== undefined) result.weaponElement = buff.weaponElement;

    result.raceDamageRate = mergeRecord(result.raceDamageRate, buff.raceDamageRate);
    result.elementDamageRate = mergeRecord(result.elementDamageRate, buff.elementDamageRate);
    result.sizeDamageRate = mergeRecord(result.sizeDamageRate, buff.sizeDamageRate);
    result.classDamageRate = mergeRecord(result.classDamageRate, buff.classDamageRate);
    result.magicRaceDamageRate = mergeRecord(result.magicRaceDamageRate, buff.magicRaceDamageRate);
    result.magicElementDamageRate = mergeRecord(result.magicElementDamageRate, buff.magicElementDamageRate);
    result.magicSizeDamageRate = mergeRecord(result.magicSizeDamageRate, buff.magicSizeDamageRate);
    result.magicClassDamageRate = mergeRecord(result.magicClassDamageRate, buff.magicClassDamageRate);
    result.skillDamageRate = mergeRecord(result.skillDamageRate, buff.skillDamageRate) as Record<string, number>;
    result.ignoreDefenseRate = mergeRecord(result.ignoreDefenseRate, buff.ignoreDefenseRate);
    result.ignoreMagicDefenseRate = mergeRecord(result.ignoreMagicDefenseRate, buff.ignoreMagicDefenseRate);
  }

  return result;
}

function mergeRecord<K extends string>(
  base: Partial<Record<K, number>> | Record<K, number>,
  addition: Partial<Record<K, number>> | Record<string, number> | undefined,
): Partial<Record<K, number>> {
  if (!addition) return base as Partial<Record<K, number>>;
  const result = { ...base } as Record<string, number>;
  for (const [key, value] of Object.entries(addition)) {
    result[key] = (result[key] ?? 0) + (value ?? 0);
  }
  return result as Partial<Record<K, number>>;
}
