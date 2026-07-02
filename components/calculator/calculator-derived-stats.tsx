"use client";

import type {
  CharacterStatus,
  CalculatorModifierEffects,
} from "@/packages/calculator-core/src";

type CalculatorDerivedStatsProps = {
  status: CharacterStatus;
  modifierEffects: CalculatorModifierEffects;
};

export function CalculatorDerivedStats({
  status,
  modifierEffects,
}: CalculatorDerivedStatsProps) {
  const hitsPerSecond = status.aspd >= 200 ? 50 : 50 / (200 - status.aspd);

  // Variaveis de cast
  const dex = status.effectiveStats.dex || 0;
  const int = status.effectiveStats.int || 0;
  const dex2int1 = dex * 2 + int;
  const vctFalta = Math.max(0, 530 - dex2int1);

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-[10.5px] leading-tight font-mono text-slate-300 flex-none shrink-0">
      {/* Alt+Q */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-1 px-1">
        <div className="flex gap-1.5">
          <span className="text-slate-400">Alt+Q Atk:</span>
          <strong className="text-amber-500">
            {status.statusAtk}{" "}
            <span className="text-amber-400">
              + {status.atk - status.statusAtk}
            </span>
          </strong>
        </div>
        <div className="flex gap-1.5">
          <span className="text-slate-400">Alt+Q Matk:</span>
          <strong className="text-sky-400">
            {status.statusMatk}{" "}
            <span className="text-sky-300">
              + {status.matk - status.statusMatk}
            </span>
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-2 gap-y-2 px-1 mt-0.5">
        {/* Row 1: Traits + Matk% */}
        <div className="flex gap-1">
          <span className="text-slate-400">P.Atk:</span>{" "}
          <strong className="text-slate-200">{status.traitEffects.pAtk}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">S.Matk:</span>{" "}
          <strong className="text-slate-200">
            {status.traitEffects.smatk}
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">C.Rate:</span>{" "}
          <strong className="text-slate-200">{modifierEffects.crit}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Matk%:</span>{" "}
          <strong className="text-sky-400">{modifierEffects.matkRate}%</strong>
        </div>

        {/* Row 2: ASPD + Combat */}
        <div className="flex gap-1">
          <span className="text-slate-400">ASPD:</span>{" "}
          <strong className="text-amber-500">{status.aspd}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Melee:</span>{" "}
          <strong className="text-slate-200">
            {modifierEffects.shortAttackRate}%
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Range:</span>{" "}
          <strong className="text-slate-200">
            {modifierEffects.longAttackRate}%
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">C.Dmg:</span>{" "}
          <strong className="text-slate-200">
            {modifierEffects.criticalDamageRate}%
          </strong>
        </div>

        {/* Row 3: Hit/Flee/Crit */}
        <div className="flex gap-1">
          <span className="text-slate-400">Hit:</span>{" "}
          <strong className="text-amber-500">{status.hit}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Perf:</span>{" "}
          <strong className="text-slate-200">
            {modifierEffects.perfectHitRate}%
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Flee:</span>{" "}
          <strong className="text-slate-200">{status.flee}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Crit:</span>{" "}
          <strong className="text-slate-200">{status.crit}</strong>
        </div>

        {/* Row 4: Defenses */}
        <div className="flex gap-1">
          <span className="text-slate-400">Def:</span>{" "}
          <strong className="text-slate-200">{status.defense}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Mdef:</span>{" "}
          <strong className="text-slate-200">{status.magicDefense}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Res:</span>{" "}
          <strong className="text-slate-200">{status.traitEffects.res}</strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">MRes:</span>{" "}
          <strong className="text-slate-200">{status.traitEffects.mres}</strong>
        </div>

        {/* Row 5: Cast */}
        <div className="flex gap-1">
          <span className="text-slate-400">Delay:</span>{" "}
          <strong className="text-sky-400">
            {modifierEffects.afterCastDelayRate}%
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">FCast:</span>{" "}
          <strong className="text-sky-400">
            {(modifierEffects.fixedCast / 1000).toFixed(1)}s
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">VCast:</span>{" "}
          <strong className="text-sky-400">
            {modifierEffects.variableCastRate}%
          </strong>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">D2I1:</span>{" "}
          <strong className="text-sky-400">{dex2int1}</strong>
        </div>
      </div>

      {/* HP / SP */}
      <div className="flex justify-between border-t border-slate-800 pt-1.5 mt-0.5 px-1">
        <div className="flex gap-1.5 items-center">
          <span className="text-slate-400">HP:</span>{" "}
          <strong className="text-rose-400 text-xs">
            {status.maxHp.toLocaleString()}
          </strong>
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="text-slate-400">SP:</span>{" "}
          <strong className="text-cyan-400 text-xs">
            {status.maxSp.toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
}
