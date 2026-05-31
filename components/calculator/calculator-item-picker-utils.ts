import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";

export function ensureSelectedOption(
  options: CalculatorItemIndexOption[],
  selectedItem: CalculatorItemIndexOption | CalculatorItemDetail | undefined,
) {
  if (!selectedItem || options.some((option) => option.id === selectedItem.id)) {
    return options;
  }

  return [selectedItem, ...options];
}

export function ensureSelectedCardOptions(
  options: CalculatorItemIndexOption[],
  selectedCardIds: number[],
  selectedItemDetails: Record<number, CalculatorItemDetail>,
) {
  const missingCards = selectedCardIds
    .map((cardId) => selectedItemDetails[cardId])
    .filter(
      (card): card is CalculatorItemDetail =>
        Boolean(card) && !options.some((option) => option.id === card.id),
    );

  return [...missingCards, ...options];
}

export function selectedItemHasModifiers(
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined,
) {
  if (!item) {
    return false;
  }

  return (
    ("hasModifiers" in item && item.hasModifiers) ||
    ("rawScript" in item && Boolean(item.rawScript))
  );
}
