import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";

type CalculatorItemPreviewProps = {
  copy: CalculatorDictionary;
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  itemContexts: Record<number, { refine?: number }>;
  selectedCards: number[];
  selectedItemDetails: Record<number, CalculatorItemDetail>;
};

export function CalculatorItemPreview({
  copy,
  item,
  itemContexts,
  selectedCards,
  selectedItemDetails,
}: CalculatorItemPreviewProps) {
  const t = copy.equipment.preview;

  if (!item) {
    return (
      <div className="calc-item-preview">
        <strong>{t.emptyTitle}</strong>
        <p>{t.emptyDescription}</p>
      </div>
    );
  }

  const stats = [
    { label: t.kind, value: item.kind },
    { label: t.cardSlots, value: item.cardSlots ?? 0 },
    { label: t.attack, value: item.attack ?? 0 },
    { label: t.magicAttack, value: item.magicAttack ?? 0 },
    { label: t.defense, value: item.defense ?? 0 },
    { label: t.refine, value: item.refineable ? t.yes : t.no },
  ];
  const refine = itemContexts[item.id]?.refine ?? 0;
  const cardNames = selectedCards
    .map((cardId) => selectedItemDetails[cardId]?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="calc-item-preview">
      <div className="calc-item-preview-header">
        <span>{item.id}</span>
        <strong>{item.name}</strong>
        {item.refineable ? <em>+{refine}</em> : null}
      </div>

      <dl className="calc-item-stat-grid">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="calc-item-card-list">
        <strong>{t.cards}</strong>
        <span>{cardNames.length > 0 ? cardNames.join(" / ") : t.noCards}</span>
      </div>
    </div>
  );
}
