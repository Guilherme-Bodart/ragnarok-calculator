"use client";

import {
  Boxes,
  Calculator,
  FlaskConical,
  Skull,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateDamageFromDataset } from "@/packages/calculator-core/src";
import { CalculatorCharacterPanel } from "./calculator-character-panel";
import {
  calculatorDemoDataset,
  calculatorDemoInput,
} from "./calculator-demo-data";
import { CalculatorEquipmentPanel } from "./calculator-equipment-panel";
import { CalculatorTargetPanel } from "./calculator-target-panel";

export function CalculatorWorkbench() {
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
            stats,
          },
          monsterId: selectedMonsterId,
          skillId: selectedSkill.id,
          skillLevel,
        },
        calculatorDemoDataset,
      ),
    [selectedMonsterId, selectedSkill.id, skillLevel, stats],
  );

  return (
    <main className="calculator-page">
      <div className="calculator-grid-bg" />
      <header className="calculator-topbar">
        <Link href="/" className="calculator-brand" aria-label="Back to Nightmare home">
          <Image src="/nightmare-reaper.png" alt="" width={38} height={38} />
          <span>
            <strong>Nightmare</strong>
            <small>Damage Lab</small>
          </span>
        </Link>

        <nav className="calculator-actions" aria-label="Calculator actions">
          <button type="button">
            <Boxes size={16} />
            Builds
          </button>
          <button type="button">
            <FlaskConical size={16} />
            Sync Data
          </button>
        </nav>
      </header>

      <section className="calculator-hero-panel">
        <div>
          <span className="calculator-kicker">
            <Calculator size={16} />
            Ragnarok Online damage calculator
          </span>
          <h1>Nightmare Combat Simulator</h1>
          <p>
            Build your character, pick a monster, choose the skill and inspect every
            multiplier before the final hit lands.
          </p>
        </div>
        <div className="calculator-result-orb">
          <Skull size={28} />
          <strong>Prototype Engine</strong>
          <span>Backend ready for exact formulas, sync jobs and saved builds.</span>
        </div>
      </section>

      <section className="calculator-workspace" aria-label="Damage calculator workspace">
        <CalculatorCharacterPanel
          skillLevel={skillLevel}
          selectedSkill={selectedSkill}
          stats={stats}
          onSkillChange={(skill) => setSelectedSkillId(skill.id)}
          onSkillLevelChange={setSkillLevel}
          onStatsChange={setStats}
        />
        <CalculatorEquipmentPanel />
        <CalculatorTargetPanel
          result={result}
          selectedMonsterId={selectedMonsterId}
          onMonsterChange={setSelectedMonsterId}
        />
      </section>
    </main>
  );
}
