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
import { calculateDamageFromDataset } from "@/packages/calculator-core/src";
import { CalculatorCharacterPanel } from "./calculator-character-panel";
import {
  calculatorDemoDataset,
  calculatorDemoInput,
} from "./calculator-demo-data";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import { calculatorSkillTreeClassOptions } from "./calculator-skill-tree-data";
import { CalculatorSkillTreePanel } from "./calculator-skill-tree-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";

export function CalculatorWorkbench() {
  const { dictionary } = useNightmareLocale();
  const copy = dictionary.calculator;
  const [selectedClassId, setSelectedClassId] = useState(
    calculatorDemoInput.character.classId ?? "Dragon_Knight",
  );
  const [learnedSkills, setLearnedSkills] = useState<Record<string, number>>({});
  const [stats, setStats] = useState(calculatorDemoInput.character.stats);
  const [selectedSkillId, setSelectedSkillId] = useState(
    calculatorDemoInput.skillId,
  );
  const [skillLevel, setSkillLevel] = useState(calculatorDemoInput.skillLevel);
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    calculatorDemoInput.monsterId,
  );
  const selectedSkill =
    calculatorDemoDataset.skills.find((skill) => skill.id === selectedSkillId) ??
    calculatorDemoDataset.skills[0];
  const result = useMemo(
    () =>
      calculateDamageFromDataset(
        {
          ...calculatorDemoInput,
          character: {
            ...calculatorDemoInput.character,
            classId: selectedClassId,
            stats,
          },
          learnedSkills,
          monsterId: selectedMonsterId,
          skillId: selectedSkill.id,
          skillLevel,
        },
        calculatorDemoDataset,
      ),
    [learnedSkills, selectedClassId, selectedMonsterId, selectedSkill.id, skillLevel, stats],
  );

  function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setLearnedSkills({});
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
          <button type="button">
            <Boxes size={16} />
            {copy.buildsAction}
          </button>
          <button type="button">
            <FlaskConical size={16} />
            {copy.syncAction}
          </button>
        </nav>
      </header>

      <section className="calculator-hero-panel">
        <div>
          <span className="calculator-kicker">
            <Calculator size={16} />
            {copy.kicker}
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
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
          baseLevel={calculatorDemoInput.character.baseLevel}
          classOptions={calculatorSkillTreeClassOptions}
          copy={copy}
          isTranscendent={calculatorDemoInput.character.isTranscendent}
          selectedClassId={selectedClassId}
          skillLevel={skillLevel}
          selectedSkill={selectedSkill}
          onClassChange={handleClassChange}
          stats={stats}
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
