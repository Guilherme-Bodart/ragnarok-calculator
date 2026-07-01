import { jobBasepointGroups } from "./job-basepoints.seed";
import type {
  JobBasepointTable,
  JobBasepoints,
  JobBasepointsGroup,
} from "./job-basepoints.types";

export const emptyJobBasepoints: JobBasepoints = {
  baseHp: 0,
  baseSp: 0,
  baseAp: 0,
};

export class JobBasepointsFactory {
  constructor(private readonly groups: JobBasepointsGroup[] = jobBasepointGroups) {}

  fromClassAndBaseLevel(
    classId: string | undefined,
    baseLevel: number,
  ): JobBasepoints {
    if (!classId) {
      return { ...emptyJobBasepoints };
    }

    const matchingGroups = this.groups.filter((candidate) =>
      candidate.classIds.includes(classId),
    );

    if (matchingGroups.length === 0) {
      return { ...emptyJobBasepoints };
    }

    return matchingGroups.reduce<JobBasepoints>(
      (total, group) => {
        const hp = total.baseHp || this.getClosestBasepoint(group.baseHp, baseLevel);
        const sp = total.baseSp || this.getClosestBasepoint(group.baseSp, baseLevel);
        const ap = total.baseAp || this.getClosestBasepoint(group.baseAp, baseLevel);
        
        return {
          baseHp: hp || Math.floor(baseLevel * 150), // Fallback temporário para classes sem DB
          baseSp: sp || Math.floor(baseLevel * 20),
          baseAp: ap || (baseLevel >= 200 ? 200 : 0),
        };
      },
      { ...emptyJobBasepoints },
    );
  }

  private getClosestBasepoint(
    table: JobBasepointTable | undefined,
    baseLevel: number,
  ) {
    if (!table) {
      return 0;
    }

    const exact = table[baseLevel];

    if (exact !== undefined) {
      return exact;
    }

    const nearestLowerLevel = Object.keys(table)
      .map(Number)
      .filter((level) => level <= baseLevel)
      .sort((left, right) => right - left)[0];

    return nearestLowerLevel ? table[nearestLowerLevel] ?? 0 : 0;
  }
}
