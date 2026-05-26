export type StatBonus = {
  str: number;
  agi: number;
  vit: number;
  int: number;
  dex: number;
  luk: number;
  pow: number;
  sta: number;
  wis: number;
  spl: number;
  con: number;
  crt: number;
};

export type JobStatBonusEntry = Partial<StatBonus> & {
  level: number;
};

export type JobStatBonusGroup = {
  classIds: string[];
  bonuses: JobStatBonusEntry[];
};
