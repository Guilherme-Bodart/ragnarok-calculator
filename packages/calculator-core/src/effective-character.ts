import {
  CharacterStatusEngine,
  type BaseStat,
  type CharacterStatus,
} from "./character-status-engine";
import type { CalculatorCharacter } from "./ro-types";

export type EffectiveCharacter = CharacterStatus;

export class EffectiveCharacterBuilder {
  constructor(private readonly statusEngine = new CharacterStatusEngine()) {}

  build(
    character: CalculatorCharacter,
    itemStatBonuses: Record<BaseStat, number>,
  ): EffectiveCharacter {
    return this.statusEngine.calculate({
      character,
      itemStatBonuses,
    });
  }
}
