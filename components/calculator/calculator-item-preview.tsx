import type { CalculatorDictionary } from "./calculator-i18n";
import type {
  CalculatorItemDetail,
  CalculatorItemIndexOption,
} from "./calculator-item-data";
import { CalculatorItemIcon } from "./calculator-item-icon";
import { useState } from "react";

type CalculatorItemPreviewProps = {
  cardOptions: CalculatorItemIndexOption[];
  copy: CalculatorDictionary;
  item: CalculatorItemIndexOption | CalculatorItemDetail | undefined;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
  selectedCards: number[];
  selectedItemDetails: Record<number, CalculatorItemDetail>;
};

export function CalculatorItemPreview({
  cardOptions,
  copy,
  item,
  itemContexts,
  selectedCards,
  selectedItemDetails,
}: CalculatorItemPreviewProps) {
  const [collectionImageError, setCollectionImageError] = useState(false);
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
    .map(
      (cardId) =>
        selectedItemDetails[cardId]?.name ??
        cardOptions.find((card) => card.id === cardId)?.name,
    )
    .filter((name): name is string => Boolean(name));

  return (
    <div className="calc-item-preview">
      <div className="calc-item-preview-header flex items-start gap-4">
        {!collectionImageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={`https://static.divine-pride.net/images/items/collection/${item.id}.png`}
            alt={item.name}
            className="w-16 h-20 object-contain shrink-0"
            onError={() => setCollectionImageError(true)}
          />
        ) : (
          <div className="w-16 h-20 shrink-0 flex items-center justify-center">
            <CalculatorItemIcon itemId={item.id} size={48} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">ID: {item.id}</span>
          <strong className="text-lg leading-tight">{item.name}</strong>
          {item.refineable && refine > 0 ? <em className="text-sky-400 font-bold not-italic">+{refine}</em> : null}
        </div>
      </div>

      <dl className="calc-item-stat-grid mt-4">
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
