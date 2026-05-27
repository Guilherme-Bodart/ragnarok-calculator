export type JobBasepointTable = Partial<Record<number, number>>;

export type JobBasepoints = {
  baseHp: number;
  baseSp: number;
  baseAp: number;
};

export type JobBasepointsGroup = {
  classIds: string[];
  baseHp?: JobBasepointTable;
  baseSp?: JobBasepointTable;
  baseAp?: JobBasepointTable;
};
