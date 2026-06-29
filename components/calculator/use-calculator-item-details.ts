"use client";

import { useEffect, useState } from "react";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import {
  getCalculatorItemDetail,
  type CalculatorItemDetail,
} from "./calculator-item-data";

export function useCalculatorItemDetails(
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>,
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>,
) {
  const [selectedItemDetails, setSelectedItemDetails] = useState<
    Record<number, CalculatorItemDetail>
  >({});

  useEffect(() => {
    const fetchRequests: { itemId: number; category: string }[] = [];

    for (const [slot, itemId] of Object.entries(selectedItemsBySlot)) {
      if (typeof itemId === "number" && !selectedItemDetails[itemId]) {
        fetchRequests.push({ itemId, category: slot });
      }
    }

    for (const cardArray of Object.values(selectedCardsBySlot)) {
      if (Array.isArray(cardArray)) {
        for (const itemId of cardArray) {
          if (typeof itemId === "number" && !selectedItemDetails[itemId]) {
            fetchRequests.push({ itemId, category: "card" });
          }
        }
      }
    }

    if (fetchRequests.length === 0) {
      return;
    }

    let isCurrent = true;

    Promise.all(
      fetchRequests.map((req) =>
        getCalculatorItemDetail(req.itemId, req.category).catch(() => null),
      ),
    )
      .then((items) => {
        if (!isCurrent) return;

        const validItems = items.filter(
          (item): item is CalculatorItemDetail => item !== null,
        );

        if (validItems.length === 0) {
          return;
        }

        setSelectedItemDetails((currentDetails) => {
          const nextDetails = { ...currentDetails };
          for (const item of validItems) {
            nextDetails[item.id] = item;
          }
          return nextDetails;
        });
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [selectedItemsBySlot, selectedCardsBySlot, selectedItemDetails]);

  return {
    selectedItemDetails,
    setSelectedItemDetails,
  };
}
