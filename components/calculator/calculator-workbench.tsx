"use client";

import {
  Boxes,
  Calculator,
  FlaskConical,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  calculateDamageFromDataset,
  type EquipmentSlot,
  type RoItem,
} from "@/packages/calculator-core/src";
import {
  getCalculatorManualBuffSkills,
  getActiveCalculatorBuffItemIds,
} from "./calculator-buff-data";
import { CalculatorBuffsPanel } from "./calculator-buffs-panel";
import { CalculatorCharacterPanel } from "./calculator-character-panel";
import {
  calculatorDemoDataset,
  calculatorDemoInput,
} from "./calculator-demo-data";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import { findCalculatorItem } from "./calculator-item-data";
import {
  getCalculatorClassBuffSkills,
  getCalculatorClassSkills,
  mergeCalculatorSkills,
} from "./calculator-skill-classification";
import {
  calculatorSkillTreeCatalog,
  calculatorSkillTreeClassOptions,
  isFourthJobClassId,
} from "./calculator-skill-tree-data";
import { CalculatorSkillTreePanel } from "./calculator-skill-tree-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";

const calculatorBuildStorageKey = "nightmare-calculator-build";

type CalculatorSavedBuild = {
  activeBuffs?: Record<string, number>;
  baseLevel?: number;
  jobLevel?: number;
  learnedSkills?: Record<string, number>;
  selectedBuffId?: string;
  selectedClassId?: string;
  selectedMonsterId?: number;
  selectedSkillId?: string;
  skillLevel?: number;
  stats?: typeof calculatorDemoInput.character.stats;
  itemContexts?: Record<number, { refine?: number }>;
  selectedCardsBySlot?: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemsBySlot?: Partial<Record<EquipmentSlot, number>>;
};

export function CalculatorWorkbench() {
  const { dictionary } = useNightmareLocale();
  const copy = dictionary.calculator;
  const savedBuild = readSavedCalculatorBuild();
  const [selectedClassId, setSelectedClassId] = useState(
    savedBuild?.selectedClassId ??
      calculatorDemoInput.character.classId ??
      "Dragon_Knight",
  );
  const [learnedSkills, setLearnedSkills] = useState<Record<string, number>>(
    savedBuild?.learnedSkills ?? {},
  );
  const [baseLevel, setBaseLevel] = useState(
    savedBuild?.baseLevel ?? calculatorDemoInput.character.baseLevel,
  );
  const [jobLevel, setJobLevel] = useState(
    savedBuild?.jobLevel ?? calculatorDemoInput.character.jobLevel,
  );
  const [stats, setStats] = useState(
    savedBuild?.stats ?? calculatorDemoInput.character.stats,
  );
  const [selectedSkillId, setSelectedSkillId] = useState(
    savedBuild?.selectedSkillId ?? calculatorDemoInput.skillId,
  );
  const [skillLevel, setSkillLevel] = useState(
    savedBuild?.skillLevel ?? calculatorDemoInput.skillLevel,
  );
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    savedBuild?.selectedMonsterId ?? calculatorDemoInput.monsterId,
  );
  const [activeBuffs, setActiveBuffs] = useState<Record<string, number>>(
    savedBuild?.activeBuffs ?? {},
  );
  const [selectedBuffId, setSelectedBuffId] = useState(
    savedBuild?.selectedBuffId ?? "",
  );
  const [selectedItemsBySlot, setSelectedItemsBySlot] = useState<
    Partial<Record<EquipmentSlot, number>>
  >(savedBuild?.selectedItemsBySlot ?? {});
  const [selectedCardsBySlot, setSelectedCardsBySlot] = useState<
    Partial<Record<EquipmentSlot, number[]>>
  >(savedBuild?.selectedCardsBySlot ?? {});
  const [itemContexts, setItemContexts] = useState<
    Record<number, { refine?: number }>
  >(savedBuild?.itemContexts ?? {});
  const selectedClassSkills = useMemo(
    () => getCalculatorClassSkills(calculatorSkillTreeCatalog, selectedClassId),
    [selectedClassId],
  );
  const classBuffSkills = useMemo(
    () =>
      getCalculatorClassBuffSkills(calculatorSkillTreeCatalog, selectedClassId),
    [selectedClassId],
  );
  const manualBuffSkills = useMemo(
    () => getCalculatorManualBuffSkills(copy.buffs),
    [copy.buffs],
  );
  const buffSkills = useMemo(
    () => [...manualBuffSkills, ...classBuffSkills],
    [classBuffSkills, manualBuffSkills],
  );
  const equipmentItemIds = useMemo(
    () => Object.values(selectedItemsBySlot).filter(isNumber),
    [selectedItemsBySlot],
  );
  const cardItemIds = useMemo(
    () => Object.values(selectedCardsBySlot).flat().filter(isNumber),
    [selectedCardsBySlot],
  );
  const selectedCalculatorItems = useMemo(
    () =>
      [...equipmentItemIds, ...cardItemIds]
        .map((itemId) => findCalculatorItem(itemId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [cardItemIds, equipmentItemIds],
  );
  const calculatorDataset = useMemo(
    () => ({
      ...calculatorDemoDataset,
      items: mergeCalculatorItems(
        calculatorDemoDataset.items,
        selectedCalculatorItems,
      ),
      skills: mergeCalculatorSkills(
        calculatorDemoDataset.skills,
        selectedClassSkills,
      ),
    }),
    [selectedCalculatorItems, selectedClassSkills],
  );
  const selectedSkill =
    calculatorDataset.skills.find((skill) => skill.id === selectedSkillId) ??
    selectedClassSkills[0] ??
    calculatorDataset.skills[0];
  const selectedClassName =
    calculatorSkillTreeClassOptions.find((job) => job.id === selectedClassId)
      ?.name ?? selectedClassId.replace(/_/g, " ");
  const effectiveLearnedSkills = useMemo(
    () => ({ ...learnedSkills, ...activeBuffs }),
    [activeBuffs, learnedSkills],
  );
  const activeBuffItemIds = useMemo(
    () => getActiveCalculatorBuffItemIds(activeBuffs),
    [activeBuffs],
  );
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
          learnedSkills: effectiveLearnedSkills,
          equipmentItemIds,
          cardItemIds,
          buffItemIds: [...calculatorDemoInput.buffItemIds, ...activeBuffItemIds],
          itemContexts: Object.entries(itemContexts).map(([itemId, context]) => ({
            itemId: Number(itemId),
            refine: context.refine,
          })),
          monsterId: selectedMonsterId,
          skillId: selectedSkill.id,
          skillLevel,
        },
        calculatorDataset,
      ),
    [
      baseLevel,
      calculatorDataset,
      cardItemIds,
      equipmentItemIds,
      jobLevel,
      effectiveLearnedSkills,
      activeBuffItemIds,
      itemContexts,
      selectedClassId,
      selectedMonsterId,
      selectedSkill.id,
      skillLevel,
      stats,
    ],
  );

  useEffect(() => {
    const build: CalculatorSavedBuild = {
      activeBuffs,
      baseLevel,
      jobLevel,
      learnedSkills,
      selectedBuffId,
      selectedClassId,
      selectedMonsterId,
      selectedSkillId,
      skillLevel,
      stats,
      itemContexts,
      selectedCardsBySlot,
      selectedItemsBySlot,
    };

    window.localStorage.setItem(calculatorBuildStorageKey, JSON.stringify(build));
  }, [
    activeBuffs,
    baseLevel,
    jobLevel,
    itemContexts,
    learnedSkills,
    selectedCardsBySlot,
    selectedBuffId,
    selectedClassId,
    selectedItemsBySlot,
    selectedMonsterId,
    selectedSkillId,
    skillLevel,
    stats,
  ]);

  function handleClassChange(classId: string) {
    const isFourthJob = isFourthJobClassId(classId);

    setSelectedClassId(classId);
    setLearnedSkills({});
    setActiveBuffs({});
    setJobLevel((currentJobLevel) =>
      Math.min(currentJobLevel, isFourthJob ? 70 : 60),
    );
    const nextSkills = getCalculatorClassSkills(calculatorSkillTreeCatalog, classId);
    const nextSkill = nextSkills[0];

    if (nextSkill) {
      setSelectedSkillId(nextSkill.id);
      setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
    }

    setSelectedBuffId(manualBuffSkills[0]?.id ?? "");

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

  function resetBuild() {
    const defaultClassId =
      calculatorDemoInput.character.classId ?? "Dragon_Knight";
    const nextSkills = getCalculatorClassSkills(
      calculatorSkillTreeCatalog,
      defaultClassId,
    );

    window.localStorage.removeItem(calculatorBuildStorageKey);
    setSelectedClassId(defaultClassId);
    setLearnedSkills({});
    setBaseLevel(calculatorDemoInput.character.baseLevel);
    setJobLevel(calculatorDemoInput.character.jobLevel);
    setStats(getDefaultCalculatorStats());
    setSelectedSkillId(nextSkills[0]?.id ?? calculatorDemoInput.skillId);
    setSkillLevel(calculatorDemoInput.skillLevel);
    setSelectedMonsterId(calculatorDemoInput.monsterId);
    setActiveBuffs({});
    setSelectedBuffId("");
    setSelectedItemsBySlot({});
    setSelectedCardsBySlot({});
    setItemContexts({});
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
          <Button
            icon={<RotateCcw size={16} />}
            type="button"
            variant="ghost"
            onClick={resetBuild}
          >
            {copy.resetAction}
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
        <div className="calculator-character-column">
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
          <CalculatorBuffsPanel
            activeBuffs={activeBuffs}
            buffSkills={buffSkills}
            copy={copy}
            selectedBuffId={selectedBuffId}
            onActiveBuffsChange={setActiveBuffs}
            onSelectedBuffChange={setSelectedBuffId}
          />
        </div>
        <CalculatorEquipmentPanel
          copy={copy}
          itemContexts={itemContexts}
          selectedCardsBySlot={selectedCardsBySlot}
          selectedItemsBySlot={selectedItemsBySlot}
          onItemContextsChange={setItemContexts}
          onSelectedCardsBySlotChange={setSelectedCardsBySlot}
          onSelectedItemsBySlotChange={setSelectedItemsBySlot}
        />
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

function getDefaultCalculatorStats() {
  return { ...calculatorDemoInput.character.stats };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function mergeCalculatorItems(baseItems: RoItem[], selectedItems: RoItem[]) {
  const itemById = new Map(baseItems.map((item) => [item.id, item]));

  for (const item of selectedItems) {
    itemById.set(item.id, item);
  }

  return Array.from(itemById.values());
}

function readSavedCalculatorBuild(): CalculatorSavedBuild | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawBuild = window.localStorage.getItem(calculatorBuildStorageKey);

  if (!rawBuild) {
    return null;
  }

  try {
    return JSON.parse(rawBuild) as CalculatorSavedBuild;
  } catch {
    return null;
  }
}
