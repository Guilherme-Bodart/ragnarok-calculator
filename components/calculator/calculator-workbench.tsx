"use client";

import {
  Activity,
  Boxes,
  Calculator,
  FlaskConical,
  Shield,
  Skull,
  Sparkles,
  Swords,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { calculatorDemoResult } from "./calculator-demo-data";

const equipmentSlots = [
  "Head Top",
  "Head Mid",
  "Head Low",
  "Armor",
  "Weapon",
  "Shield",
  "Garment",
  "Shoes",
  "Accessory 1",
  "Accessory 2",
  "Shadow Weapon",
  "Shadow Shield",
  "Shadow Armor",
  "Shadow Shoes",
  "Shadow Earring",
  "Shadow Pendant",
];

const statRows = [
  ["STR", 120],
  ["AGI", 90],
  ["VIT", 100],
  ["INT", 1],
  ["DEX", 100],
  ["LUK", 60],
  ["POW", 80],
  ["CON", 45],
];

const buffs = ["Blessing", "Increase AGI", "Endow", "Food +10", "Guild Aura", "Elemental Scroll"];

export function CalculatorWorkbench() {
  const averageDamage = calculatorDemoResult.damage.average.toLocaleString();
  const hitCount = getBreakdownValue("hits") || calculatorDemoResult.skill.hitCount;
  const basePower = getBreakdownValue("basePower");
  const skillMultiplier = getBreakdownValue("skillMultiplier");
  const defenseMultiplier = getBreakdownValue("defenseMultiplier");

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
        <aside className="calc-panel calc-character">
          <div className="calc-panel-header">
            <span>
              <Activity size={17} />
              Character
            </span>
            <small>Base 260 / Job 55</small>
          </div>

          <div className="calc-select-row">
            <label>
              Class
              <select defaultValue="dragon-knight">
                <option value="dragon-knight">Dragon Knight</option>
                <option value="arch-mage">Arch Mage</option>
                <option value="windhawk">Windhawk</option>
                <option value="cardinal">Cardinal</option>
              </select>
            </label>
            <label>
              Skill
              <select defaultValue="SM_BASH">
                <option value="SM_BASH">Bash Lv.10</option>
                <option value="MG_COLDBOLT">Cold Bolt Lv.10</option>
              </select>
            </label>
          </div>

          <div className="stat-grid">
            {statRows.map(([label, value]) => (
              <label key={label}>
                <span>{label}</span>
                <input type="number" defaultValue={value} />
              </label>
            ))}
          </div>

          <div className="buff-list">
            {buffs.map((buff) => (
              <button type="button" key={buff}>
                <Sparkles size={14} />
                {buff}
              </button>
            ))}
          </div>
        </aside>

        <section className="calc-panel calc-equipment">
          <div className="calc-panel-header">
            <span>
              <Shield size={17} />
              Equipment, Cards, Costume & Shadow
            </span>
            <small>All slots prepared</small>
          </div>

          <div className="equipment-grid">
            {equipmentSlots.map((slot) => (
              <button type="button" className="equipment-slot" key={slot}>
                <span>{slot}</span>
                <strong>Empty</strong>
              </button>
            ))}
          </div>
        </section>

        <aside className="calc-panel calc-target">
          <div className="calc-panel-header">
            <span>
              <Swords size={17} />
              Target & Output
            </span>
            <small>iRO profile</small>
          </div>

          <label className="monster-picker">
            Monster
            <select defaultValue="1002">
              <option value="1002">Poring</option>
              <option value="1031">Poporing</option>
            </select>
          </label>

          <div className="damage-card">
            <span>Average Damage</span>
            <strong>{averageDamage}</strong>
            <small>
              {hitCount} hit / {calculatorDemoResult.skill.damageType} /{" "}
              {calculatorDemoResult.meta.precision} formula
            </small>
          </div>

          <div className="breakdown-list">
            <div>
              <span>Base Power</span>
              <strong>{basePower}</strong>
            </div>
            <div>
              <span>Skill Multiplier</span>
              <strong>{skillMultiplier.toFixed(2)}x</strong>
            </div>
            <div>
              <span>Defense Mitigation</span>
              <strong>{defenseMultiplier.toFixed(3)}x</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>Local core</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function getBreakdownValue(key: string) {
  return (
    calculatorDemoResult.breakdown.find((line) => line.key === key)?.value ?? 0
  );
}
