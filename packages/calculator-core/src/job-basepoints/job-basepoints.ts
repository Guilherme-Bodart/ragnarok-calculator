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
      (total, group) => ({
        baseHp:
          total.baseHp ||
          this.getClosestBasepoint(group.baseHp, baseLevel) ||
          emptyJobBasepoints.baseHp,
        baseSp:
          total.baseSp ||
          this.getClosestBasepoint(group.baseSp, baseLevel) ||
          emptyJobBasepoints.baseSp,
        baseAp:
          total.baseAp ||
          this.getClosestBasepoint(group.baseAp, baseLevel) ||
          emptyJobBasepoints.baseAp,
      }),
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
