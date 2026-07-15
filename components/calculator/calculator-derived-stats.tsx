"use client";

import { useState } from "react";
import type {
  CharacterStatus,
  CalculatorModifierEffects,
} from "@/packages/calculator-core/src";
import { useDerivedStatsBonuses } from "./use-derived-stats-bonuses";

type CalculatorDerivedStatsProps = {
  status: CharacterStatus;
  modifierEffects: CalculatorModifierEffects;
};



export function CalculatorDerivedStats({
  status,
  modifierEffects,
}: CalculatorDerivedStatsProps) {
  const [page, setPage] = useState(0);

  const dex = status.effectiveStats.dex || 0;
  const int = status.effectiveStats.int || 0;
  const dex2int1 = dex * 2 + int;

  // Compilar bônus de equipamentos para a página 2+
  const bonuses = useDerivedStatsBonuses(modifierEffects, status);

  const itemsPerPage = 40;
  const totalPages = 1 + Math.ceil(bonuses.length / itemsPerPage);
  const activePage = Math.min(page, totalPages - 1);

  const prevPage = () => setPage((p) => Math.max(0, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg border border-slate-700/50 bg-slate-900/60 text-[10.5px] leading-tight font-mono text-slate-300 flex-none shrink-0 w-full min-h-[200px]">
      {/* Carousel Controls Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 px-1 select-none">
        <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
          {activePage === 0 ? "Status Básicos" : `Bônus de Equips (${activePage})`}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-1.5 items-center">
            <button
              onClick={prevPage}
              disabled={activePage === 0}
              className="p-1 leading-none rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white disabled:opacity-20 transition-all"
            >
              ◀
            </button>
            <span className="text-slate-400 font-bold min-w-[28px] text-center">
              {activePage + 1}/{totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={activePage === totalPages - 1}
              className="p-1 leading-none rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white disabled:opacity-20 transition-all"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {activePage === 0 ? (
        <>
          {/* Alt+Q */}
          <div className="flex justify-between items-center border-b border-slate-850 pb-1 px-1">
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
          <div className="flex justify-between border-t border-slate-850 pt-1.5 mt-0.5 px-1">
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
        </>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 h-[135px] overflow-y-auto custom-scrollbar px-1">
          {bonuses.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((bonus, index) => {
            const spaceIndex = bonus.indexOf(" ");
            const value = spaceIndex !== -1 ? bonus.substring(0, spaceIndex) : "";
            const label = spaceIndex !== -1 ? bonus.substring(spaceIndex + 1) : bonus;
            const isNegative = value.startsWith("-");
            const isIgnore = label.includes("Ignora");
            
            return (
              <div
                key={index}
                className="flex justify-between items-center py-0.5 border-b border-slate-800/20 hover:bg-slate-800/10 px-1 rounded animate-fade-in text-[10px]"
              >
                <span className="text-slate-350 select-all truncate mr-1" title={label}>{label}</span>
                <span className={`font-bold select-all shrink-0 ${isNegative ? "text-rose-400" : isIgnore ? "text-amber-400" : "text-sky-400"}`}>
                  {value}
                </span>
              </div>
            );
          })}
          {bonuses.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-500 italic">
              Nenhum bônus de equipamento ativo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
