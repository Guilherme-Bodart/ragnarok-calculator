"use client";

import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Flame,
  ShieldAlert,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NumberSelect } from "@/components/ui/number-select";
import { RichSelect } from "@/components/ui/rich-select";
import type { CalculateDamageResult } from "@/packages/calculator-core/src";
import type { CalculatorAttackSkill } from "./calculator-attack-panel";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  searchCalculatorMonsters,
  type CalculatorMonsterDetail,
  type CalculatorMonsterIndexOption,
} from "./calculator-monster-data";
import { getBreakdownValue } from "./calculator-utils";
import { CalculatorMonsterIcon } from "./calculator-monster-icon";
import { CalculatorSkillIcon } from "./calculator-skill-icon";
import { useCalculatorBuildStore } from "./calculator-build-store";

type CalculatorTargetPanelProps = {
  copy: CalculatorDictionary;
  result: CalculateDamageResult;
  selectedMonster: CalculatorMonsterDetail | null;
  availableSkills?: CalculatorAttackSkill[];
  selectedSkill?: CalculatorAttackSkill;
};

const ELEMENT_LABELS: Record<string, string> = {
  neutral: "Neutro",
  water: "Água",
  earth: "Terra",
  fire: "Fogo",
  wind: "Vento",
  poison: "Veneno",
  holy: "Sagrado",
  dark: "Sombrio",
  ghost: "Fantasma",
  undead: "Maldito",
  weapon: "Arma",
};

const SIZE_LABELS: Record<string, string> = {
  small: "Pequeno (S)",
  medium: "Médio (M)",
  large: "Grande (L)",
};

export function CalculatorTargetPanel({
  copy,
  result,
  selectedMonster,
  availableSkills = [],
  selectedSkill,
}: CalculatorTargetPanelProps) {
  const selectedMonsterId = useCalculatorBuildStore((s) => s.selectedMonsterId);
  const setSelectedMonsterId = useCalculatorBuildStore(
    (s) => s.setSelectedMonsterId,
  );
  const selectedSkillId = useCalculatorBuildStore((s) => s.selectedSkillId);
  const setSelectedSkillId = useCalculatorBuildStore(
    (s) => s.setSelectedSkillId,
  );
  const skillLevel = useCalculatorBuildStore((s) => s.skillLevel);
  const setSkillLevel = useCalculatorBuildStore((s) => s.setSkillLevel);

  const [monsterQuery, setMonsterQuery] = useState("");
  const [monsterOptions, setMonsterOptions] = useState<
    CalculatorMonsterIndexOption[]
  >([]);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const activeSkill = selectedSkill ?? (result.skill as CalculatorAttackSkill);
  const effectiveSkillLevel = Math.min(skillLevel, activeSkill.maxLevel || 1);

  function handleQuickSkillChange(nextSkillId: string) {
    const nextSkill =
      availableSkills.find((skill) => skill.id === nextSkillId) ?? activeSkill;
    setSelectedSkillId(nextSkill.id);
    setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
  }

  const totalDamage = result.damage.total.toLocaleString();
  const averageDamage = result.damage.average.toLocaleString();
  const criticalDamage = result.damage.criticalDamage ?? 0;
  const criticalChance = result.damage.criticalChance ?? 0;
  const weightedAverage =
    result.damage.weightedAverage ?? result.damage.average;

  const basePower = Number(getBreakdownValue(result.breakdown, "basePower")) || 0;
  const equipmentPower =
    Number(getBreakdownValue(result.breakdown, "equipmentPower")) || 0;
  const modifierFlatPower =
    Number(getBreakdownValue(result.breakdown, "modifierFlatPower")) || 0;
  const weaponRefinePower =
    Number(getBreakdownValue(result.breakdown, "weaponRefinePower")) || 0;
  const skillMultiplier =
    Number(getBreakdownValue(result.breakdown, "skillMultiplier")) || 1;
  const finalRateMultiplier =
    Number(getBreakdownValue(result.breakdown, "finalRateMultiplier")) || 1;
  const defenseMultiplier =
    Number(getBreakdownValue(result.breakdown, "defenseMultiplier")) || 1;
  const defenseIgnoreRate =
    Number(getBreakdownValue(result.breakdown, "defenseIgnoreRate")) || 0;
  const elementMultiplier =
    Number(getBreakdownValue(result.breakdown, "elementMultiplier")) || 1;
  const weaponSizeMultiplier =
    Number(getBreakdownValue(result.breakdown, "weaponSizeMultiplier")) || 1;
  const preDefenseDamage =
    Number(getBreakdownValue(result.breakdown, "preDefenseDamage")) || 0;
  const postDefenseDamage =
    Number(getBreakdownValue(result.breakdown, "postDefenseDamage")) || 0;
  const singleHitDamage =
    Number(getBreakdownValue(result.breakdown, "singleHitDamage")) || 0;

  const options = useMemo(() => {
    const optionById = new Map(
      monsterOptions.map((monster) => [monster.id, monster]),
    );

    if (selectedMonster && !optionById.has(selectedMonster.id)) {
      optionById.set(selectedMonster.id, {
        id: selectedMonster.id,
        name: selectedMonster.name,
        level: selectedMonster.level,
        race: selectedMonster.race,
        size: selectedMonster.size,
        element: selectedMonster.element,
        elementLevel: selectedMonster.elementLevel,
        hp: selectedMonster.hp,
        defense: selectedMonster.defense,
        magicDefense: selectedMonster.magicDefense,
      });
    }

    return Array.from(optionById.values());
  }, [monsterOptions, selectedMonster]);

  useEffect(() => {
    let isCurrent = true;

    searchCalculatorMonsters({ limit: 80, query: monsterQuery })
      .then((monsters) => {
        if (isCurrent) {
          setMonsterOptions(monsters);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [monsterQuery]);

  const cycleTimeMs =
    Number(getBreakdownValue(result.breakdown, "cycleTimeMs")) || 0;
  const dps = Number(getBreakdownValue(result.breakdown, "dps")) || 0;

  const vct =
    Number(getBreakdownValue(result.breakdown, "variableCastMs")) || 0;
  const fct = Number(getBreakdownValue(result.breakdown, "fixedCastMs")) || 0;
  const delay =
    Number(getBreakdownValue(result.breakdown, "afterCastDelayMs")) || 0;
  const cd = Number(getBreakdownValue(result.breakdown, "cooldownMs")) || 0;
  const hits = Number(getBreakdownValue(result.breakdown, "hits")) || 1;
  const damagePerHit =
    hits > 1
      ? Math.max(1, Math.floor(result.damage.total / hits)).toLocaleString()
      : null;

  const skillPerSec =
    cycleTimeMs > 0 ? (1000 / cycleTimeMs).toFixed(2) : "0.00";

  const reqHit = selectedMonster
    ? 200 + selectedMonster.level + (selectedMonster.agi ?? 0)
    : 0;

  const hitDiff = result.characterStatus.hit + 100 - reqHit;
  const accuracy = selectedMonster ? Math.max(5, Math.min(100, hitDiff)) : 100;

  const rawAttackElement = String(
    result.breakdown.find((b) => b.key === "attackElement")?.value ??
      activeSkill.element ??
      "weapon",
  ).toLowerCase();
  const attackElementLabel =
    ELEMENT_LABELS[rawAttackElement] ?? rawAttackElement;

  return (
    <aside className="flex flex-col gap-0 p-0 rounded-2xl border border-sky-500/20 bg-[#020612]/85 shadow-[0_12px_40px_rgb(0,0,0,0.6)] backdrop-blur-xl flex-1 overflow-hidden relative min-h-0">
      {/* QUICK ACTIVE SKILL BAR (Always accessible from any tab) */}
      {availableSkills.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 border-b border-sky-500/15 bg-gradient-to-r from-sky-950/35 via-slate-900/60 to-slate-950/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-sky-400" />
              <span className="text-[10.5px] font-black uppercase tracking-widest text-sky-200">
                Habilidade Simulada
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/70 text-slate-300 flex items-center gap-1">
                {activeSkill.damageType === "magical" ? (
                  <Sparkles size={10} className="text-indigo-400" />
                ) : (
                  <Zap size={10} className="text-amber-400" />
                )}
                {activeSkill.damageType === "magical" ? "Mágico" : "Físico"} •{" "}
                {attackElementLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold">
                {Math.round(skillMultiplier * 100).toLocaleString()}% ({hits}{" "}
                {hits === 1 ? "hit" : "hits"})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_106px] gap-2">
            <RichSelect
              value={selectedSkillId}
              onChange={handleQuickSkillChange}
              searchPlaceholder={copy.attack.searchPlaceholder}
              className="text-xs bg-slate-950/70 border-slate-700/60"
              fit="fill"
              groups={[
                {
                  label: copy.attack.skillGroup,
                  options: availableSkills.map((skill) => ({
                    id: skill.id,
                    label: skill.name,
                    icon: (
                      <CalculatorSkillIcon
                        name={skill.name}
                        numericId={skill.numericId}
                      />
                    ),
                  })),
                },
              ]}
            />
            <NumberSelect
              fit="fill"
              max={activeSkill.maxLevel}
              prefix="Lv."
              value={effectiveSkillLevel}
              onChange={setSkillLevel}
            />
          </div>
        </div>
      )}

      {/* MONSTER SECTION */}
      <div className="flex flex-col p-4 border-b border-sky-500/15 bg-slate-950/40 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Swords size={16} className="text-sky-400" />
            <h2 className="text-xs font-black text-sky-100 uppercase tracking-widest">
              {copy.target.title}
            </h2>
          </div>

          <div className="flex-1 w-full sm:w-auto sm:min-w-[260px]">
            <RichSelect
              className="text-xs bg-slate-900/70 border-slate-700/60"
              fit="fill"
              value={String(selectedMonsterId)}
              onChange={(monsterId) => setSelectedMonsterId(Number(monsterId))}
              searchValue={monsterQuery}
              onSearchChange={setMonsterQuery}
              searchPlaceholder={copy.target.searchPlaceholder}
              groups={[
                {
                  label: copy.target.monsterLabel,
                  options: options.map((monster) => {
                    const raceStr = monster.race
                      ? monster.race.charAt(0).toUpperCase() +
                        monster.race.slice(1)
                      : "";
                    const sizeMap: Record<string, string> = {
                      small: "S",
                      medium: "M",
                      large: "L",
                    };
                    const sizeStr =
                      monster.size && sizeMap[monster.size]
                        ? sizeMap[monster.size]
                        : "";
                    const extra = [raceStr, sizeStr].filter(Boolean).join(" ");

                    return {
                      id: String(monster.id),
                      label: `Lv.${monster.level || "?"} ${monster.name}${extra ? ` (${extra})` : ""}`,
                    };
                  }),
                },
              ]}
            />
          </div>
        </div>

        {selectedMonster ? (
          <div className="flex items-center gap-4 pt-1">
            {/* Left side: Monster Portrait */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-28 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <CalculatorMonsterIcon
                monsterId={selectedMonster.id}
                size={96}
                className="w-full h-auto max-h-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
              <span
                className={`text-[9.5px] font-black uppercase text-center tracking-widest rounded px-2 py-0.5 w-full border ${
                  selectedMonster.classType === "boss"
                    ? "text-rose-300 bg-rose-950/50 border-rose-500/35"
                    : "text-slate-300 bg-slate-900/80 border-slate-700/60"
                }`}
              >
                {selectedMonster.classType === "boss" ? "MVP / Boss" : "Normal"}
              </span>
            </div>

            {/* Right side: Structured Monster Badges & Stats */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
                <strong className="text-sm font-black text-sky-50 truncate">
                  Lv.{selectedMonster.level} {selectedMonster.name}
                </strong>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  ID #{selectedMonster.id}
                </span>
              </div>

              {/* Taxonomy Badges: Race / Size / Element */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-sky-950/50 border border-sky-500/25 text-sky-200 capitalize">
                  Raça: {selectedMonster.race}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950/50 border border-indigo-500/25 text-indigo-200">
                  {SIZE_LABELS[selectedMonster.size] ?? selectedMonster.size}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-500/30 text-amber-200 capitalize">
                  {ELEMENT_LABELS[selectedMonster.element?.toLowerCase()] ??
                    selectedMonster.element}{" "}
                  Nv.{selectedMonster.elementLevel}
                </span>
              </div>

              {/* Defensive & HP Row */}
              <div className="grid grid-cols-4 gap-1.5 text-[10.5px] font-mono">
                <div className="flex flex-col px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase">HP</span>
                  <strong className="text-rose-400 truncate">
                    {selectedMonster.hp.toLocaleString()}
                  </strong>
                </div>
                <div className="flex flex-col px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase">DEF</span>
                  <strong className="text-slate-100">
                    {selectedMonster.defense}
                  </strong>
                </div>
                <div className="flex flex-col px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase">MDEF</span>
                  <strong className="text-slate-100">
                    {selectedMonster.magicDefense}
                  </strong>
                </div>
                <div className="flex flex-col px-2 py-1 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase">
                    100% Hit
                  </span>
                  <strong className="text-amber-200">{reqHit}</strong>
                </div>
              </div>

              {/* Monster Base Stats */}
              <div className="grid grid-cols-6 gap-1 text-[9.5px] font-mono text-center pt-1 opacity-90">
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">STR</span>
                  <span className="text-slate-200">
                    {selectedMonster.str ?? 0}
                  </span>
                </div>
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">AGI</span>
                  <span className="text-slate-200">
                    {selectedMonster.agi ?? 0}
                  </span>
                </div>
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">VIT</span>
                  <span className="text-slate-200">
                    {selectedMonster.vit ?? 0}
                  </span>
                </div>
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">INT</span>
                  <span className="text-slate-200">
                    {selectedMonster.int ?? 0}
                  </span>
                </div>
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">DEX</span>
                  <span className="text-slate-200">
                    {selectedMonster.dex ?? 0}
                  </span>
                </div>
                <div className="rounded bg-slate-900/50 py-0.5 border border-slate-800/60">
                  <span className="text-slate-500 mr-1">LUK</span>
                  <span className="text-slate-200">
                    {selectedMonster.luk ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-xs text-slate-500 border border-dashed border-slate-700/50 rounded-xl">
            Selecione um alvo para visualizar os atributos.
          </div>
        )}
      </div>

      {/* DAMAGE & SIMULATION SECTION */}
      <div className="flex flex-col p-4 bg-slate-900/35 relative gap-3.5">
        {/* Primary Damage Cards Grid (Normal vs Critical + DPS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Normal Damage Box */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-sky-950/45 via-slate-900/80 to-slate-950/90 border border-sky-500/30 shadow-[inset_0_0_24px_rgba(56,189,248,0.08)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest">
                Dano Total da Skill
              </span>
              {hits > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-200 border border-sky-400/25">
                  {hits} hits
                </span>
              )}
            </div>

            <strong className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] tabular-nums tracking-tight leading-none my-1.5">
              {totalDamage}
            </strong>

            <div className="flex flex-col gap-0.5 text-[10.5px] font-mono text-slate-300">
              <span>
                Faixa: {result.damage.minimum.toLocaleString()} ~{" "}
                {result.damage.maximum.toLocaleString()} (méd: {averageDamage})
              </span>
              {damagePerHit && (
                <span className="text-sky-300 font-semibold">
                  Por Hit: {damagePerHit}
                </span>
              )}
            </div>
          </div>

          {/* Critical & Weighted Damage / DPS Box */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-rose-950/35 via-slate-900/80 to-slate-950/90 border border-rose-500/25">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-1">
                <Flame size={12} className="text-rose-400" />
                Dano Crítico
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  criticalChance > 0
                    ? "bg-rose-500/20 text-rose-200 border-rose-400/35 font-bold"
                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                }`}
              >
                Chance: {criticalChance.toFixed(1)}%
              </span>
            </div>

            <strong
              className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none my-1.5 ${
                criticalChance > 0
                  ? "text-rose-200 drop-shadow-[0_0_12px_rgba(244,63,94,0.45)]"
                  : "text-slate-400"
              }`}
            >
              {criticalDamage > 0 ? criticalDamage.toLocaleString() : "—"}
            </strong>

            <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono pt-1 border-t border-slate-800/80">
              <span className="text-slate-300">
                Méd. Pond:{" "}
                <strong className="text-amber-300">
                  {weightedAverage.toLocaleString()}
                </strong>
              </span>
              <span className="text-amber-400 font-bold">
                DPS: {dps.toLocaleString()}
                {selectedMonster && dps > 0
                  ? ` (${formatTime(selectedMonster.hp / dps)})`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Telemetry Strip */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 border-t border-sky-500/15 pt-3 text-[10.5px] font-mono">
          {/* Column 1: Core Combat Stats */}
          <div className="flex flex-col gap-1.5 border-r border-sky-500/10 pr-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Precisão</span>
              <strong
                className={
                  accuracy >= 100 ? "text-emerald-400" : "text-rose-400"
                }
              >
                {accuracy}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ignore DEF</span>
              <strong className="text-sky-300">
                {defenseIgnoreRate.toFixed(0)}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Crit Status</span>
              <strong className="text-rose-300">
                {result.characterStatus.crit}
              </strong>
            </div>
          </div>

          {/* Column 2: Cast & Delay */}
          <div className="flex flex-col gap-1.5 border-r border-sky-500/10 pr-3 pl-1">
            <div className="flex justify-between">
              <span className="text-slate-400">VCT</span>
              <strong className="text-slate-200">
                {(vct / 1000).toFixed(2)}s
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">FCT</span>
              <strong className="text-slate-200">
                {(fct / 1000).toFixed(2)}s
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Delay / CD</span>
              <strong className="text-slate-200">
                {(delay / 1000).toFixed(2)}s / {(cd / 1000).toFixed(2)}s
              </strong>
            </div>
          </div>

          {/* Column 3: Speed & Output */}
          <div className="flex flex-col gap-1.5 pl-1">
            <div className="flex justify-between">
              <span className="text-slate-400">ASPD</span>
              <strong className="text-slate-200">
                {result.characterStatus.aspd}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Skills/s</span>
              <strong className="text-amber-300">{skillPerSec}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Elem. Mult</span>
              <strong
                className={
                  elementMultiplier > 1
                    ? "text-emerald-400"
                    : elementMultiplier < 1
                      ? "text-rose-400"
                      : "text-slate-200"
                }
              >
                {Math.round(elementMultiplier * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Expandable Formula Breakdown Accordion */}
        <div className="border-t border-sky-500/15 pt-2.5">
          <button
            type="button"
            onClick={() => setIsBreakdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/65 hover:bg-slate-900/90 border border-slate-800/80 text-[11px] font-bold text-sky-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>Detalhamento da Fórmula (Breakdown)</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">
                [{result.meta.formulaId}]
              </span>
            </span>
            {isBreakdownOpen ? (
              <ChevronUp size={15} className="text-sky-400" />
            ) : (
              <ChevronDown size={15} className="text-sky-400" />
            )}
          </button>

          {isBreakdownOpen && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-[11px] font-mono animate-in fade-in duration-200">
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Poder Status Base:</span>
                <strong className="text-slate-100">{basePower}</strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Poder Equip + Refino:</span>
                <strong className="text-slate-100">
                  {equipmentPower} + {weaponRefinePower}
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Bônus Flat (Cartas/Buffs):</span>
                <strong className="text-slate-100">+{modifierFlatPower}</strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Multiplicador da Skill:</span>
                <strong className="text-sky-300">
                  {Math.round(skillMultiplier * 100).toLocaleString()}% (
                  {skillMultiplier.toFixed(2)}x)
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Mult. Categorias (Raça/Tam/Skill):</span>
                <strong className="text-emerald-300">
                  {finalRateMultiplier.toFixed(2)}x
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Penalidade Tam. Arma:</span>
                <strong className="text-slate-100">
                  {Math.round(weaponSizeMultiplier * 100)}%
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Tabela Elemental:</span>
                <strong className="text-amber-300">
                  {Math.round(elementMultiplier * 100)}%
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60">
                <span className="text-slate-400">Multiplicador DEF/MDEF:</span>
                <strong className="text-slate-100">
                  {(defenseMultiplier * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="flex justify-between px-2 py-1 rounded bg-slate-900/60 sm:col-span-2 border-t border-slate-800/80 pt-1.5">
                <span className="text-slate-400">
                  Pré-DEF → Pós-DEF → Hit Único:
                </span>
                <strong className="text-sky-200">
                  {preDefenseDamage.toLocaleString()} →{" "}
                  {postDefenseDamage.toLocaleString()} →{" "}
                  {singleHitDamage.toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>

        {result.meta.warnings.length > 0 ? (
          <div className="flex flex-col gap-1 p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-[10.5px] text-amber-200/90 shrink-0">
            {result.meta.warnings.map((warning) => (
              <span key={warning} className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-amber-400 shrink-0" />
                {warning}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function formatTime(seconds: number) {
  if (!isFinite(seconds)) return "∞";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  if (m < 60) return `${m}m ${s}s`;

  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}
