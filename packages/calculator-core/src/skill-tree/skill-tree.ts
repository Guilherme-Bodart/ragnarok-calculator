export type SkillTreeRawRequirement = {
  id: string;
  level: number;
};

export type SkillTreeRawSkill = {
  id: string;
  maxLevel: number;
  baseLevel?: number;
  jobLevel?: number;
  exclude?: boolean;
  requires?: SkillTreeRawRequirement[];
  sourceJobId?: string;
  sourceJobName?: string;
  displaySourceJobId?: string;
};

export type SkillTreeRawJob = {
  inherit?: Record<string, boolean> | string[];
  skills?: Record<string, SkillTreeRawSkill>;
};

export type SkillTreeRawDataset = {
  jobs: Record<string, SkillTreeRawJob>;
  resolvedJobs?: Record<string, SkillTreeResolvedRawJob>;
};

export type SkillTreeRawSkillInfo = {
  skillId: number;
  name: string;
  description?: string | null;
  maxLevel?: number | null;
};

export type SkillTreeJobOption = {
  id: string;
  name: string;
  directSkillCount: number;
};

export type SkillTreeResolvedPathJob = {
  id: string;
  name?: string;
  directSkillCount?: number;
};

export type SkillTreeResolvedRawJob = {
  id: string;
  name?: string;
  jobPath: SkillTreeResolvedPathJob[];
  skillOrder?: string[];
  skills: Record<string, SkillTreeRawSkill>;
};

export type SkillTreeCatalog = {
  jobs: Record<string, SkillTreeRawJob>;
  resolvedJobs?: Record<string, SkillTreeResolvedRawJob>;
  jobOptions: SkillTreeJobOption[];
  skillInfoById: Record<string, SkillTreeRawSkillInfo>;
};

export type SkillTreeRequirement = {
  id: string;
  name: string;
  level: number;
};

export type SkillTreeSkill = {
  id: string;
  numericId?: number;
  name: string;
  maxLevel: number;
  baseLevel: number;
  jobLevel: number;
  sourceJobId: string;
  sourceJobName: string;
  displaySourceJobId?: string;
  requirements: SkillTreeRequirement[];
};

export type ResolvedSkillTreeJob = {
  id: string;
  name: string;
  inheritedJobIds: string[];
  jobPath: SkillTreeJobOption[];
  skills: SkillTreeSkill[];
};

export type LearnedSkillLevels = Record<string, number>;

export function createSkillTreeCatalog(
  rawTree: SkillTreeRawDataset,
  rawSkills: SkillTreeRawSkillInfo[],
): SkillTreeCatalog {
  const skillInfoById = Object.fromEntries(
    rawSkills.map((skill) => [skill.name, skill]),
  );
  const jobOptions = Object.entries(rawTree.jobs)
    .map(([id, job]) => ({
      id,
      name: formatSkillTreeJobName(id),
      directSkillCount: Object.values(job.skills ?? {}).filter(
        (skill) => skill.maxLevel > 0,
      ).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    jobs: rawTree.jobs,
    resolvedJobs: rawTree.resolvedJobs,
    jobOptions,
    skillInfoById,
  };
}

export function resolveSkillTreeJob(
  catalog: SkillTreeCatalog,
  jobId: string,
): ResolvedSkillTreeJob {
  const rawResolvedJob = catalog.resolvedJobs?.[jobId];

  if (rawResolvedJob) {
    const skillIds = rawResolvedJob.skillOrder ?? Object.keys(rawResolvedJob.skills);
    const skills = skillIds.flatMap((skillId) => {
      const rawSkill = rawResolvedJob.skills[skillId];

      if (!rawSkill || rawSkill.maxLevel <= 0) {
        return [];
      }

      return [
        toResolvedSkill(
          catalog,
          rawSkill,
          rawSkill.sourceJobId ?? rawSkill.displaySourceJobId ?? jobId,
        ),
      ];
    });

    return {
      id: rawResolvedJob.id,
      name: rawResolvedJob.name ?? formatSkillTreeJobName(rawResolvedJob.id),
      inheritedJobIds: rawResolvedJob.jobPath
        .map((pathJob) => pathJob.id)
        .filter((pathJobId) => pathJobId !== jobId),
      jobPath: rawResolvedJob.jobPath.map((pathJob) => ({
        id: pathJob.id,
        name: pathJob.name ?? formatSkillTreeJobName(pathJob.id),
        directSkillCount:
          pathJob.directSkillCount ??
          Object.values(catalog.jobs[pathJob.id]?.skills ?? {}).length,
      })),
      skills,
    };
  }

  const visited = new Set<string>();
  const path: string[] = [];
  const skills = new Map<string, SkillTreeSkill>();

  function visit(currentJobId: string, isInherited: boolean) {
    const job = catalog.jobs[currentJobId];

    if (!job || visited.has(currentJobId)) {
      return;
    }

    visited.add(currentJobId);

    for (const inheritedJobId of getInheritedJobIds(job.inherit)) {
      visit(inheritedJobId, true);
    }

    path.push(currentJobId);

    for (const rawSkill of Object.values(job.skills ?? {})) {
      if (rawSkill.maxLevel <= 0) {
        skills.delete(rawSkill.id);
        continue;
      }

      if (isInherited && rawSkill.exclude) {
        continue;
      }

      if (!skills.has(rawSkill.id)) {
        skills.set(rawSkill.id, toResolvedSkill(catalog, rawSkill, currentJobId));
      }
    }
  }

  visit(jobId, false);

  return {
    id: jobId,
    name: formatSkillTreeJobName(jobId),
    inheritedJobIds: path.filter((pathJobId) => pathJobId !== jobId),
    jobPath: path.map((pathJobId) => ({
      id: pathJobId,
      name: formatSkillTreeJobName(pathJobId),
      directSkillCount: Object.values(catalog.jobs[pathJobId]?.skills ?? {})
        .length,
    })),
    skills: Array.from(skills.values()),
  };
}

export function canIncreaseSkill(
  skill: SkillTreeSkill,
  learnedSkills: LearnedSkillLevels,
): boolean {
  return (
    (learnedSkills[skill.id] ?? 0) < skill.maxLevel &&
    getMissingRequirements(skill, learnedSkills).length === 0
  );
}

export function canDecreaseSkill(
  resolvedJob: ResolvedSkillTreeJob,
  skillId: string,
  learnedSkills: LearnedSkillLevels,
): boolean {
  const currentLevel = learnedSkills[skillId] ?? 0;

  if (currentLevel <= 0) {
    return false;
  }

  const nextLevel = currentLevel - 1;

  return !resolvedJob.skills.some((skill) => {
    if ((learnedSkills[skill.id] ?? 0) <= 0) {
      return false;
    }

    return skill.requirements.some(
      (requirement) =>
        requirement.id === skillId && requirement.level > nextLevel,
    );
  });
}

export function increaseSkillWithRequirements(
  resolvedJob: ResolvedSkillTreeJob,
  skillId: string,
  learnedSkills: LearnedSkillLevels,
): LearnedSkillLevels {
  const skillById = Object.fromEntries(
    resolvedJob.skills.map((skill) => [skill.id, skill]),
  );
  const targetSkill = skillById[skillId];

  if (!targetSkill) {
    return learnedSkills;
  }

  const currentLevel = learnedSkills[skillId] ?? 0;

  if (currentLevel >= targetSkill.maxLevel) {
    return learnedSkills;
  }

  const nextSkills = { ...learnedSkills };
  const visiting = new Set<string>();

  function learnRequiredSkill(requiredSkillId: string, requiredLevel: number) {
    const requiredSkill = skillById[requiredSkillId];

    if (!requiredSkill || visiting.has(requiredSkillId)) {
      return;
    }

    visiting.add(requiredSkillId);

    for (const requirement of requiredSkill.requirements) {
      learnRequiredSkill(requirement.id, requirement.level);
    }

    nextSkills[requiredSkillId] = Math.min(
      Math.max(nextSkills[requiredSkillId] ?? 0, requiredLevel),
      requiredSkill.maxLevel,
    );
    visiting.delete(requiredSkillId);
  }

  for (const requirement of targetSkill.requirements) {
    learnRequiredSkill(requirement.id, requirement.level);
  }

  nextSkills[skillId] = currentLevel + 1;

  return nextSkills;
}

export function getMissingRequirements(
  skill: SkillTreeSkill,
  learnedSkills: LearnedSkillLevels,
): SkillTreeRequirement[] {
  return skill.requirements.filter(
    (requirement) => (learnedSkills[requirement.id] ?? 0) < requirement.level,
  );
}

export function formatSkillTreeJobName(jobId: string): string {
  return jobId.replace(/_/g, " ");
}

function toResolvedSkill(
  catalog: SkillTreeCatalog,
  rawSkill: SkillTreeRawSkill,
  sourceJobId: string,
): SkillTreeSkill {
  const skillInfo = catalog.skillInfoById[rawSkill.id];

  return {
    id: rawSkill.id,
    numericId: skillInfo?.skillId,
    name: skillInfo?.description ?? rawSkill.id,
    maxLevel: rawSkill.maxLevel,
    baseLevel: rawSkill.baseLevel ?? 0,
    jobLevel: rawSkill.jobLevel ?? 0,
    sourceJobId,
    sourceJobName: rawSkill.sourceJobName ?? formatSkillTreeJobName(sourceJobId),
    displaySourceJobId: rawSkill.displaySourceJobId,
    requirements: (rawSkill.requires ?? []).map((requirement) => ({
      id: requirement.id,
      name: catalog.skillInfoById[requirement.id]?.description ?? requirement.id,
      level: requirement.level,
    })),
  };
}

function getInheritedJobIds(inherit: SkillTreeRawJob["inherit"]): string[] {
  if (Array.isArray(inherit)) {
    return inherit;
  }

  return Object.entries(inherit ?? {})
    .filter(([, isEnabled]) => isEnabled)
    .map(([jobId]) => jobId);
}
