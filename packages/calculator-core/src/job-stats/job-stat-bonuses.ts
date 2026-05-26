import { jobStatBonusGroups } from "./job-stat-bonuses.seed";
import type { JobStatBonusGroup, StatBonus } from "./job-stat-bonuses.types";

export const emptyStatBonus: StatBonus = {
  str: 0,
  agi: 0,
  vit: 0,
  int: 0,
  dex: 0,
  luk: 0,
  pow: 0,
  sta: 0,
  wis: 0,
  spl: 0,
  con: 0,
  crt: 0,
};

export class JobStatBonusFactory {
  constructor(private readonly groups: JobStatBonusGroup[] = jobStatBonusGroups) {}

  fromClassAndJobLevel(classId: string | undefined, jobLevel: number): StatBonus {
    if (!classId) {
      return { ...emptyStatBonus };
    }

    const group = this.groups.find((candidate) =>
      candidate.classIds.includes(classId),
    );

    if (!group) {
      return { ...emptyStatBonus };
    }

    return group.bonuses
      .filter((bonus) => bonus.level <= jobLevel)
      .reduce(
        (total, bonus) => ({
          str: total.str + (bonus.str ?? 0),
          agi: total.agi + (bonus.agi ?? 0),
          vit: total.vit + (bonus.vit ?? 0),
          int: total.int + (bonus.int ?? 0),
          dex: total.dex + (bonus.dex ?? 0),
          luk: total.luk + (bonus.luk ?? 0),
          pow: total.pow + (bonus.pow ?? 0),
          sta: total.sta + (bonus.sta ?? 0),
          wis: total.wis + (bonus.wis ?? 0),
          spl: total.spl + (bonus.spl ?? 0),
          con: total.con + (bonus.con ?? 0),
          crt: total.crt + (bonus.crt ?? 0),
        }),
        { ...emptyStatBonus },
      );
  }
}
