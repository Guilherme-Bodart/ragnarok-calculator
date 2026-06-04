export type CalculatorSkillTooltipFormulaData = {
  baseMultiplierByLevel: Record<string, number>;
  hitCountByLevel?: Record<string, number>;
  hitCount?: number;
};

export function getSkillTooltipFormulaData(
  descriptionLines: string[],
): CalculatorSkillTooltipFormulaData | null {
  const baseMultiplierByLevel: Record<string, number> = {};
  const hitCountByLevel: Record<string, number> = {};

  for (const line of descriptionLines) {
    const level = getTooltipLevel(line);

    if (!level) {
      continue;
    }

    const multiplier = getTooltipMultiplier(line);

    if (multiplier) {
      baseMultiplierByLevel[String(level)] = multiplier;
    }

    const hitCount = getTooltipHitCount(line);

    if (hitCount) {
      hitCountByLevel[String(level)] = hitCount;
    }
  }

  const hitCounts = Object.values(hitCountByLevel);

  if (Object.keys(baseMultiplierByLevel).length === 0 && hitCounts.length === 0) {
    return null;
  }

  return {
    baseMultiplierByLevel,
    hitCountByLevel: hitCounts.length > 0 ? hitCountByLevel : undefined,
    hitCount: hitCounts.length > 0 ? Math.max(...hitCounts) : undefined,
  };
}

function getTooltipLevel(line: string) {
  const match = line.match(/\[Lv\s*(\d+)\]/i);

  return match ? Number(match[1]) : null;
}

function getTooltipMultiplier(line: string) {
  const match = line.match(/\b(?:ATK|MATK)\s*(?:Per Hit\s*)?(\d+(?:\.\d+)?)%/i);

  return match ? Number(match[1]) : null;
}

function getTooltipHitCount(line: string) {
  const match = line.match(/\b(?:x\s*)?(\d+)\s*times\b/i);

  return match ? Number(match[1]) : null;
}
