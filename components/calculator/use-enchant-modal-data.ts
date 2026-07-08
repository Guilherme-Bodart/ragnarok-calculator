import { useState, useEffect } from "react";
import {
  searchCalculatorItems,
  fetchEnchantMapping,
  type CalculatorItemIndexOption,
} from "./calculator-item-data";

export function useEnchantModalData() {
  const [allCards, setAllCards] = useState<CalculatorItemIndexOption[]>([]);
  const [allEnchants, setAllEnchants] = useState<CalculatorItemIndexOption[]>([]);
  const [enchantMapping, setEnchantMapping] = useState<Record<string, (number[] | null)[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    Promise.all([
      searchCalculatorItems({ kind: "card", limit: 10000, query: "" }),
      fetchEnchantMapping(),
    ])
      .then(([items, mapping]) => {
        if (!mounted) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cardsOnly = items.filter((item) => (item as any).rawSubType !== "Enchant");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enchantsOnly = items.filter((item) => (item as any).rawSubType === "Enchant");
        
        setAllCards(cardsOnly);
        setAllEnchants(enchantsOnly);
        setEnchantMapping(mapping);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setAllCards([]);
        setAllEnchants([]);
        setEnchantMapping({});
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    allCards,
    allEnchants,
    enchantMapping,
    isLoading,
  };
}
