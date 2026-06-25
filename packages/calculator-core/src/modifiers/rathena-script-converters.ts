import type {
  ModifierClassId,
  ModifierElementId,
  ModifierRaceId,
  ModifierSizeId,
} from "./modifier.types";

export function toInternalRaceId(
  rathenaRaceId: string | undefined,
): ModifierRaceId | null {
  if (!rathenaRaceId) {
    return null;
  }

  const raceIds: Record<string, ModifierRaceId> = {
    RC_All: "all",
    RC_Formless: "formless",
    RC_Undead: "undead",
    RC_Brute: "brute",
    RC_Animal: "brute",
    RC_Plant: "plant",
    RC_Insect: "insect",
    RC_Fish: "fish",
    RC_Demon: "demon",
    RC_DemiHuman: "demihuman",
    RC_Player_Human: "demihuman",
    RC_Player_Doram: "playerDoram",
    RC_Angel: "angel",
    RC_Dragon: "dragon",
  };

  return raceIds[rathenaRaceId] ?? null;
}

export function toInternalElementId(
  rathenaElementId: string | undefined,
): ModifierElementId | null {
  if (!rathenaElementId) {
    return null;
  }

  const elementIds: Record<string, ModifierElementId> = {
    Ele_All: "all",
    Ele_Neutral: "neutral",
    Ele_Water: "water",
    Ele_Earth: "earth",
    Ele_Fire: "fire",
    Ele_Wind: "wind",
    Ele_Poison: "poison",
    Ele_Holy: "holy",
    Ele_Dark: "dark",
    Ele_Ghost: "ghost",
    Ele_Undead: "undead",
  };

  return elementIds[rathenaElementId] ?? null;
}

export function toInternalSizeId(
  rathenaSizeId: string | undefined,
): ModifierSizeId | null {
  if (!rathenaSizeId) {
    return null;
  }

  const sizeIds: Record<string, ModifierSizeId> = {
    Size_All: "all",
    Size_Small: "small",
    Size_Medium: "medium",
    Size_Large: "large",
  };

  return sizeIds[rathenaSizeId] ?? null;
}

export function toInternalClassId(
  rathenaClassId: string | undefined,
): ModifierClassId | null {
  if (!rathenaClassId) {
    return null;
  }

  const classIds: Record<string, ModifierClassId> = {
    Class_All: "all",
    Class_Normal: "normal",
    Class_Boss: "boss",
  };

  return classIds[rathenaClassId] ?? null;
}
