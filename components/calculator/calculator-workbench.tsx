"use client";

import {
  Boxes,
  Calculator,
  FlaskConical,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  calculateDamageFromDataset,
  resolveSkillTreeJob,
  type SkillTreeSkill,
  type RoSkill,
} from "@/packages/calculator-core/src";
import rawSkills from "@/nightmare-data/normalized/skills/skills.en.json";
import {
  CalculatorCharacterPanel,
  type CalculatorPanelSkill,
} from "./calculator-character-panel";
import {
  calculatorDemoDataset,
  calculatorDemoInput,
} from "./calculator-demo-data";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import {
  calculatorSkillTreeCatalog,
  calculatorSkillTreeClassOptions,
  isFourthJobClassId,
} from "./calculator-skill-tree-data";
import { CalculatorSkillTreePanel } from "./calculator-skill-tree-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";

export function CalculatorWorkbench() {
  const { dictionary } = useNightmareLocale();
  const copy = dictionary.calculator;
  const [selectedClassId, setSelectedClassId] = useState(
    calculatorDemoInput.character.classId ?? "Dragon_Knight",
  );
  const [learnedSkills, setLearnedSkills] = useState<Record<string, number>>({});
  const [baseLevel, setBaseLevel] = useState(
    calculatorDemoInput.character.baseLevel,
  );
  const [jobLevel, setJobLevel] = useState(
    calculatorDemoInput.character.jobLevel,
  );
  const [stats, setStats] = useState(calculatorDemoInput.character.stats);
  const [selectedSkillId, setSelectedSkillId] = useState(
    calculatorDemoInput.skillId,
  );
  const [skillLevel, setSkillLevel] = useState(calculatorDemoInput.skillLevel);
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    calculatorDemoInput.monsterId,
  );
  const selectedClassSkills = useMemo(
    () => getCalculatorClassSkills(selectedClassId),
    [selectedClassId],
  );
  const calculatorDataset = useMemo(
    () => ({
      ...calculatorDemoDataset,
      skills: mergeSkills(calculatorDemoDataset.skills, selectedClassSkills),
    }),
    [selectedClassSkills],
  );
  const selectedSkill =
    calculatorDataset.skills.find((skill) => skill.id === selectedSkillId) ??
    selectedClassSkills[0] ??
    calculatorDataset.skills[0];
  const selectedClassName =
    calculatorSkillTreeClassOptions.find((job) => job.id === selectedClassId)
      ?.name ?? selectedClassId.replace(/_/g, " ");
  const result = useMemo(
    () =>
      calculateDamageFromDataset(
        {
          ...calculatorDemoInput,
          character: {
            ...calculatorDemoInput.character,
            classId: selectedClassId,
            baseLevel,
            jobLevel,
            isTranscendent: selectedClassId.includes("_T"),
            stats,
          },
          learnedSkills,
          monsterId: selectedMonsterId,
          skillId: selectedSkill.id,
          skillLevel,
        },
        calculatorDataset,
      ),
    [
      baseLevel,
      calculatorDataset,
      jobLevel,
      learnedSkills,
      selectedClassId,
      selectedMonsterId,
      selectedSkill.id,
      skillLevel,
      stats,
    ],
  );

  function handleClassChange(classId: string) {
    const isFourthJob = isFourthJobClassId(classId);

    setSelectedClassId(classId);
    setLearnedSkills({});
    setJobLevel((currentJobLevel) =>
      Math.min(currentJobLevel, isFourthJob ? 70 : 60),
    );
    const nextSkills = getCalculatorClassSkills(classId);
    const nextSkill = nextSkills[0];

    if (nextSkill) {
      setSelectedSkillId(nextSkill.id);
      setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
    }

    if (!isFourthJob) {
      setStats((currentStats) => ({
        ...currentStats,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      }));
    }
  }

  return (
    <main className="calculator-page">
      <div className="calculator-grid-bg" />
      <header className="calculator-topbar">
        <Link href="/" className="calculator-brand" aria-label={copy.backHomeAria}>
          <Image src="/nightmare-reaper.png" alt="" width={38} height={38} />
          <span>
            <strong>Nightmare</strong>
            <small>{copy.brandSubtitle}</small>
          </span>
        </Link>

        <nav className="calculator-actions" aria-label={copy.actionsAria}>
          <Button icon={<Boxes size={16} />} type="button" variant="ghost">
            {copy.buildsAction}
          </Button>
          <Button icon={<FlaskConical size={16} />} type="button" variant="ghost">
            {copy.syncAction}
          </Button>
        </nav>
      </header>

      <section className="calculator-hero-panel">
        <Panel>
          <span className="calculator-kicker">
            <Calculator size={16} />
            {copy.kicker}
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </Panel>
        <CalculatorSkillTreePanel
          copy={copy}
          learnedSkills={learnedSkills}
          selectedClassId={selectedClassId}
          onClassChange={handleClassChange}
          onLearnedSkillsChange={setLearnedSkills}
        />
      </section>

      <section className="calculator-workspace" aria-label={copy.workspaceAria}>
        <CalculatorCharacterPanel
          availableSkills={selectedClassSkills}
          baseLevel={baseLevel}
          copy={copy}
          isFourthJob={isFourthJobClassId(selectedClassId)}
          isTranscendent={selectedClassId.includes("_T")}
          jobLevel={jobLevel}
          selectedClassId={selectedClassId}
          selectedClassName={selectedClassName}
          skillLevel={skillLevel}
          selectedSkill={selectedSkill}
          stats={stats}
          onBaseLevelChange={setBaseLevel}
          onJobLevelChange={setJobLevel}
          onSkillChange={(skill) => setSelectedSkillId(skill.id)}
          onSkillLevelChange={setSkillLevel}
          onStatsChange={setStats}
        />
        <CalculatorEquipmentPanel copy={copy} />
        <CalculatorTargetPanel
          copy={copy}
          result={result}
          selectedMonsterId={selectedMonsterId}
          onMonsterChange={setSelectedMonsterId}
        />
      </section>
    </main>
  );
}

type NormalizedSkillInfo = {
  name: string;
  description?: string;
  targetType?: string | null;
  rawDamageFlags?: Record<string, boolean> | null;
};

const rawSkillById = new Map(
  (rawSkills as NormalizedSkillInfo[]).map((skill) => [skill.name, skill]),
);

function getCalculatorClassSkills(classId: string): CalculatorPanelSkill[] {
  return resolveSkillTreeJob(calculatorSkillTreeCatalog, classId).skills
    .filter(isCalculatorActionSkill)
    .map(toGenericRoSkill);
}

function isCalculatorActionSkill(skill: SkillTreeSkill) {
  const skillInfo = rawSkillById.get(skill.id);

  if (!skillInfo) {
    return false;
  }

  const targetType = skillInfo.targetType ?? "";
  const noDamage = Boolean(skillInfo.rawDamageFlags?.NoDamage);
  const isDamageSkill =
    !noDamage && (targetType === "Attack" || targetType === "Ground");
  const isHealingSkill =
    targetType === "Support" &&
    /\bheal\b|\bcure\b|cura|curar/i.test(
      `${skill.id} ${skillInfo.description ?? ""}`,
    );

  return isDamageSkill || isHealingSkill;
}

function toGenericRoSkill(skill: SkillTreeSkill): CalculatorPanelSkill {
  return {
    id: skill.id,
    name: skill.name,
    numericId: skill.numericId,
    classTree: skill.sourceJobId,
    damageType: "physical",
    element: "neutral",
    maxLevel: skill.maxLevel,
    hitCount: 1,
    baseMultiplierByLevel: Object.fromEntries(
      Array.from({ length: skill.maxLevel }, (_, index) => {
        const level = index + 1;

        return [String(level), 100 + level * 10];
      }),
    ),
    source: "rathena",
  };
}

function mergeSkills(baseSkills: RoSkill[], classSkills: RoSkill[]) {
  const skillById = new Map(baseSkills.map((skill) => [skill.id, skill]));

  for (const skill of classSkills) {
    if (!skillById.has(skill.id)) {
      skillById.set(skill.id, skill);
    }
  }

  return Array.from(skillById.values());
}
