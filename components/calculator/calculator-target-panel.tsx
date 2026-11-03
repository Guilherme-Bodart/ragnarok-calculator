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
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { NumberSelect } from "@/components/ui/number-select";
import { RichSelect } from "@/components/ui/rich-select";
import { animateTargetHit } from "@/components/ui/use-motion-effects";
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

const ELEMENT_AURA_STYLES: Record<string, string> = {
  fire: "from-rose-500/35 via-amber-500/15 to-transparent border-rose-500/30",
  water: "from-cyan-400/35 via-sky-500/15 to-transparent border-cyan-400/30",
  wind: "from-teal-400/35 via-emerald-500/15 to-transparent border-teal-400/30",
  earth: "from-amber-500/35 via-lime-500/15 to-transparent border-amber-500/30",
  poison: "from-emerald-500/35 via-teal-500/15 to-transparent border-emerald-500/30",
  holy: "from-yellow-300/35 via-amber-400/15 to-transparent border-yellow-300/35",
  dark: "from-purple-500/35 via-indigo-500/15 to-transparent border-purple-500/30",
  ghost: "from-violet-400/35 via-fuchsia-500/15 to-transparent border-violet-400/30",
  undead: "from-fuchsia-500/35 via-purple-600/15 to-transparent border-fuchsia-500/30",
  neutral: "from-sky-400/25 via-slate-500/10 to-transparent border-slate-700/80",
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

  const portraitContainerRef = useRef<HTMLDivElement | null>(null);
  const isFirstRenderRef = useRef(true);

  const activeSkill = selectedSkill ?? (result.skill as CalculatorAttackSkill);
  const effectiveSkillLevel = Math.min(skillLevel, activeSkill.maxLevel || 1);

  function handleQuickSkillChange(nextSkillId: string) {
    const nextSkill =
      availableSkills.find((skill) => skill.id === nextSkillId) ?? activeSkill;
    setSelectedSkillId(nextSkill.id);
    setSkillLevel(Math.min(skillLevel, nextSkill.maxLevel));
  }

  const totalDamageNumeric = result.damage.total;
  const averageDamage = result.damage.average.toLocaleString();
  const criticalDamage = result.damage.criticalDamage ?? 0;
  const criticalChance = result.damage.criticalChance ?? 0;
  const weightedAverage =
    result.damage.weightedAverage ?? result.damage.average;

  // Trigger subtle impact shake on the target portrait when damage or skill changes
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    animateTargetHit(portraitContainerRef.current);
  }, [totalDamageNumeric, selectedSkillId, selectedMonsterId]);

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
  const damagePerHitNumeric =
    hits > 1 ? Math.max(1, Math.floor(result.damage.total / hits)) : null;

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

  const monsterElementKey = selectedMonster?.element?.toLowerCase() ?? "neutral";
  const monsterAuraStyle =
    ELEMENT_AURA_STYLES[monsterElementKey] ?? ELEMENT_AURA_STYLES.neutral;

  return (
    <aside className="flex flex-col gap-0 p-0 rounded-xl border border-white/10 bg-[#0d1017]/95 shadow-xl backdrop-blur-xl flex-1 overflow-hidden relative min-h-0">
      {/* QUICK ACTIVE SKILL BAR (Always accessible from any tab) */}
      {availableSkills.length > 0 && (
        <div className="flex flex-col gap-3 p-4 border-b border-white/10 bg-[#121620]/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Crosshair size={15} className="text-sky-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-100">
                Habilidade Simulada
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono tabular-nums">
              <span className="px-2 py-0.5 rounded-md bg-[#090b10] border border-white/10 text-slate-300 flex items-center gap-1">
                {activeSkill.damageType === "magical" ? (
                  <Sparkles size={10} className="text-indigo-400" />
                ) : (
                  <Zap size={10} className="text-amber-400" />
                )}
                {activeSkill.damageType === "magical" ? "Mágico" : "Físico"} •{" "}
                {attackElementLabel}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold">
                <AnimatedNumber
                  value={Math.round(skillMultiplier * 100)}
                  suffix="%"
                  duration={220}
                />{" "}
                ({hits} {hits === 1 ? "hit" : "hits"})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_106px] gap-2">
            <RichSelect
              value={selectedSkillId}
              onChange={handleQuickSkillChange}
              searchPlaceholder={copy.attack.searchPlaceholder}
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
      <div className="flex flex-col p-4 border-b border-white/10 bg-[#090b10]/30 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Swords size={15} className="text-sky-400 shrink-0" />
            <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest">
              {copy.target.title}
            </h2>
          </div>

          <div className="flex-1 w-full sm:w-auto sm:min-w-[260px]">
            <RichSelect
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
                    const normalizedSize = monster.size?.toLowerCase() ?? "";
                    const sizeStr = sizeMap[normalizedSize] ?? "";
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
            {/* Left side: Elemental Pedestal + Monster Portrait with Idle Breathing & Click Hit */}
            <div
              ref={portraitContainerRef}
              onClick={() => animateTargetHit(portraitContainerRef.current)}
              title="Clique para testar impacto no alvo"
              className={`relative flex flex-col items-center gap-1.5 shrink-0 w-24 sm:w-28 p-2.5 rounded-xl bg-slate-950/85 border overflow-hidden cursor-pointer select-none ${monsterAuraStyle.split(" ").pop()}`}
            >
              {/* Ambient Elemental Radial Aura */}
              <div
                className={`pointer-events-none absolute inset-0 bg-radial ${monsterAuraStyle} calc-aura-breathe`}
              />

              <div className="relative z-10 calc-idle-float flex items-center justify-center w-full min-h-[76px]">
                <CalculatorMonsterIcon
                  monsterId={selectedMonster.id}
                  size={96}
                  className="w-full h-auto max-h-20 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.75)]"
                />
              </div>

              <span
                className={`relative z-10 text-[9px] font-black uppercase text-center tracking-widest rounded px-2 py-0.5 w-full border ${
                  selectedMonster.classType === "boss"
                    ? "text-rose-300 bg-rose-950/60 border-rose-500/40"
                    : "text-slate-300 bg-slate-900/90 border-slate-700/60"
                }`}
              >
                {selectedMonster.classType === "boss" ? "MVP / Boss" : "Normal"}
              </span>
            </div>

            {/* Right side: Structured Monster Badges & Unified Stats */}
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

              {/* Unified Defensive & HP Strip */}
              <div className="grid grid-cols-4 gap-px rounded-lg border border-slate-800/85 bg-slate-800/55 overflow-hidden text-[10.5px] font-mono tabular-nums">
                <div className="flex flex-col px-2.5 py-1 bg-slate-950/85">
                  <span className="text-[8.5px] text-slate-400 uppercase">
                    HP
                  </span>
                  <strong className="text-rose-400 truncate">
                    <AnimatedNumber value={selectedMonster.hp} duration={220} />
                  </strong>
                </div>
                <div className="flex flex-col px-2.5 py-1 bg-slate-950/85">
                  <span className="text-[8.5px] text-slate-400 uppercase">
                    DEF
                  </span>
                  <strong className="text-slate-100">
                    <AnimatedNumber
                      value={selectedMonster.defense}
                      duration={200}
                    />
                  </strong>
                </div>
                <div className="flex flex-col px-2.5 py-1 bg-slate-950/85">
                  <span className="text-[8.5px] text-slate-400 uppercase">
                    MDEF
                  </span>
                  <strong className="text-slate-100">
                    <AnimatedNumber
                      value={selectedMonster.magicDefense}
                      duration={200}
                    />
                  </strong>
                </div>
                <div className="flex flex-col px-2.5 py-1 bg-slate-950/85">
                  <span className="text-[8.5px] text-slate-400 uppercase">
                    100% Hit
                  </span>
                  <strong className="text-amber-200">
                    <AnimatedNumber value={reqHit} duration={200} />
                  </strong>
                </div>
              </div>

              {/* Unified Monster Base Stats Bar (STR – LUK) */}
              <div className="grid grid-cols-6 gap-px rounded-md border border-slate-800/70 bg-slate-800/45 overflow-hidden text-[9.5px] font-mono tabular-nums text-center">
                {(
                  [
                    ["STR", selectedMonster.str ?? 0],
                    ["AGI", selectedMonster.agi ?? 0],
                    ["VIT", selectedMonster.vit ?? 0],
                    ["INT", selectedMonster.int ?? 0],
                    ["DEX", selectedMonster.dex ?? 0],
                    ["LUK", selectedMonster.luk ?? 0],
                  ] as const
                ).map(([statLabel, statVal]) => (
                  <div
                    key={statLabel}
                    className="bg-slate-950/75 py-0.5 px-1 flex items-center justify-center gap-1"
                  >
                    <span className="text-slate-500">{statLabel}</span>
                    <span className="text-slate-200 font-bold">{statVal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
            Selecione um alvo para visualizar os atributos.
          </div>
        )}
      </div>

      {/* DAMAGE & SIMULATION SECTION */}
      <div className="flex flex-col p-4 bg-slate-900/25 relative gap-3.5">
        {/* Primary Damage Cards Grid (Normal vs Critical + DPS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Normal Damage Box */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br from-sky-950/45 via-slate-900/80 to-slate-950/90 border border-sky-500/30">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest">
                Dano Total da Skill
              </span>
              {hits > 1 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-200 border border-sky-400/25 tabular-nums">
                  {hits} hits
                </span>
              )}
            </div>

            <strong className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight leading-none my-2 drop-shadow-[0_2px_10px_rgba(56,189,248,0.22)]">
              <AnimatedNumber
                value={totalDamageNumeric}
                duration={560}
                flashOnChange
              />
            </strong>

            <div className="flex flex-col gap-0.5 text-[10.5px] font-mono text-slate-300 tabular-nums">
              <span>
                Faixa: {result.damage.minimum.toLocaleString()} ~{" "}
                {result.damage.maximum.toLocaleString()} (méd: {averageDamage})
              </span>
              {damagePerHitNumeric !== null && (
                <span className="text-sky-300 font-semibold">
                  Por Hit:{" "}
                  <AnimatedNumber value={damagePerHitNumeric} duration={500} />
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
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border tabular-nums ${
                  criticalChance > 0
                    ? "bg-rose-500/20 text-rose-200 border-rose-400/35 font-bold"
                    : "bg-slate-800/80 text-slate-400 border-slate-700"
                }`}
              >
                Chance: {criticalChance.toFixed(1)}%
              </span>
            </div>

            <strong
              className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight leading-none my-2 ${
                criticalChance > 0
                  ? "text-rose-200 drop-shadow-[0_2px_10px_rgba(244,63,94,0.22)]"
                  : "text-slate-400"
              }`}
            >
              {criticalDamage > 0 ? (
                <AnimatedNumber
                  value={criticalDamage}
                  duration={560}
                  flashOnChange
                />
              ) : (
                "—"
              )}
            </strong>

            <div className="flex items-center justify-between gap-2 text-[10.5px] font-mono tabular-nums pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-300">
                Méd. Pond:{" "}
                <strong className="text-amber-300">
                  <AnimatedNumber value={weightedAverage} duration={500} />
                </strong>
              </span>
              <span className="text-amber-400 font-bold">
                DPS: <AnimatedNumber value={dps} duration={500} />
                {selectedMonster && dps > 0
                  ? ` (${formatTime(selectedMonster.hp / dps)})`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Telemetry Strip */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 border-t border-sky-500/15 pt-3 text-[10.5px] font-mono tabular-nums">
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/65 hover:bg-slate-900/90 border border-slate-800/80 text-[11px] font-bold text-sky-200 transition-colors cursor-pointer"
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
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 text-[11px] font-mono tabular-nums">
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
                <span className="text-slate-400">
                  Mult. Categorias (Raça/Tam/Skill):
                </span>
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
          <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-[10.5px] text-amber-200/90 shrink-0">
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
