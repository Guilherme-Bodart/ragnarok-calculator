"use client";

import { useEffect, useState } from "react";
import {
  getCalculatorMonsterDetail,
  type CalculatorMonsterDetail,
} from "./calculator-monster-data";

export function useCalculatorMonsterDetail(selectedMonsterId: number) {
  const [selectedMonsterDetail, setSelectedMonsterDetail] =
    useState<CalculatorMonsterDetail | null>(null);

  useEffect(() => {
    let isCurrent = true;

    getCalculatorMonsterDetail(selectedMonsterId)
      .then((monster) => {
        if (isCurrent) {
          setSelectedMonsterDetail(monster);
        }
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [selectedMonsterId]);

  return {
    selectedMonsterDetail,
    setSelectedMonsterDetail,
  };
}
