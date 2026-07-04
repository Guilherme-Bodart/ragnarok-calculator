"use client";

import { useEffect, useState, useMemo } from "react";
import { Gem, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RichSelect } from "@/components/ui/rich-select";
import { CalculatorItemIcon } from "./calculator-item-icon";
import {
  isCalculatorItemSearchReady,
  normalizeCalculatorItemSearchQuery,
} from "@/lib/calculator-item-search";
import type { EquipmentSlot } from "@/packages/calculator-core/src";
import type { CalculatorDictionary } from "./calculator-i18n";
import {
  getCardSlotCount,
} from "./calculator-item-picker-utils";
import {
  searchCalculatorItems,
  fetchEnchantMapping,
  type CalculatorItemDetail,
  type CalculatorItemIndexOption,
} from "./calculator-item-data";
import { useDebouncedValue } from "./use-debounced-value";

type CalculatorCardEnchantModalProps = {
  copy: CalculatorDictionary;
  editingSlot: EquipmentSlot;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  selectedItemDetails: Record<number, CalculatorItemDetail>;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  onClose: () => void;
  onSelectedCardsBySlotChange: (
    cardsBySlot: Partial<Record<EquipmentSlot, number[]>>,
  ) => void;
};

/**
 * Filtra cartas válidas para um equipamento específico.
 * Cartas no RO só podem ser equipadas em slots compatíveis.
 * Ex: Carta Hidra só pode ir em Arma (slots: ["weapon"])
 */
function filterCardsForSlot(
  cards: CalculatorItemIndexOption[],
  equipSlot: EquipmentSlot,
): CalculatorItemIndexOption[] {
  // Mapear slot de equipamento para o nome usado nas cartas
  const slotMapping: Partial<Record<EquipmentSlot, string[]>> = {
    weapon: ["weapon"],
    shield: ["shield"],
    armor: ["armor"],
    garment: ["garment"],
    shoes: ["shoes"],
    headTop: ["headTop", "headMid", "headLow"],
    headMid: ["headTop", "headMid", "headLow"],
    headLow: ["headTop", "headMid", "headLow"],
    accessoryLeft: ["accessoryLeft", "accessoryRight"],
    accessoryRight: ["accessoryLeft", "accessoryRight"],
  };

  const validSlots = slotMapping[equipSlot];
  if (!validSlots) return cards;

  return cards.filter((card) => {
    const cardSlots = (card as any).slots as string[] | undefined;
    // Se a carta não tem slot definido, pode ir em qualquer lugar
    if (!cardSlots || cardSlots.length === 0) return true;
    return cardSlots.some((s) => validSlots.includes(s));
  });
}

export function CalculatorCardEnchantModal({
  copy,
  editingSlot,
  selectedCardsBySlot,
  selectedItemDetails,
  selectedItemsBySlot,
  onClose,
  onSelectedCardsBySlotChange,
}: CalculatorCardEnchantModalProps) {
  const [allCards, setAllCards] = useState<CalculatorItemIndexOption[]>([]);
  const [allEnchants, setAllEnchants] = useState<CalculatorItemIndexOption[]>([]);

  // Uma query de busca por slot (card) e uma por slot (enchant)
  const [cardQueries, setCardQueries] = useState<Record<number, string>>({});
  const [enchantQueries, setEnchantQueries] = useState<Record<number, string>>({});
  const [enchantMapping, setEnchantMapping] = useState<Record<string, (number[] | null)[]>>({});

  const selectedItemId = selectedItemsBySlot[editingSlot];
  const selectedItem = selectedItemId ? selectedItemDetails[selectedItemId] : undefined;
  const selectedCards = selectedCardsBySlot[editingSlot] ?? [];
  const cardSlotCount = getCardSlotCount(selectedItem);

  // Carregar todas as cartas de uma vez
  useEffect(() => {
    searchCalculatorItems({ kind: "card", limit: 10000, query: "" })
      .then((items) => {
        const cardsOnly = items.filter((item) => (item as any).rawSubType !== "Enchant");
        const enchantsOnly = items.filter((item) => (item as any).rawSubType === "Enchant");
        setAllCards(cardsOnly);
        setAllEnchants(enchantsOnly);
      })
      .catch(() => {
        setAllCards([]);
        setAllEnchants([]);
      });

    fetchEnchantMapping()
      .then(setEnchantMapping)
      .catch(() => setEnchantMapping({}));
  }, []);

  // Cartas filtradas por slot de equipamento
  const filteredCards = useMemo(() => {
    return filterCardsForSlot(allCards, editingSlot);
  }, [allCards, editingSlot]);

  // Busca lista de encantamentos válidos para o equipamento selecionado
  const validEnchants = useMemo(() => {
    if (!selectedItem) return null;
    const aegisName = (selectedItem as any).sourceName || "";
    return enchantMapping[selectedItem.id] || enchantMapping[aegisName] || enchantMapping[selectedItem.name] || null;
  }, [selectedItem, enchantMapping]);

  function selectCard(index: number, itemId: string) {
    const cards = [...(selectedCardsBySlot[editingSlot] ?? [])];

    if (itemId === "empty") {
      cards[index] = 0;
    } else {
      cards[index] = Number(itemId);
    }

    onSelectedCardsBySlotChange({
      ...selectedCardsBySlot,
      [editingSlot]: cards,
    });
  }

  // Opções de carta filtradas por query local
  function getFilteredCardOptions(index: number) {
    const query = (cardQueries[index] ?? "").trim().toLowerCase();
    if (!query) return filteredCards;
    return filteredCards.filter((card) =>
      `${(card as any).searchText ?? ""} ${card.name} ${card.id}`
        .toLowerCase()
        .includes(query),
    );
  }

  function getFilteredEnchantOptions(index: number) {
    if (!validEnchants) return []; // Item não mapeado para encantos
    const slotEnchants = validEnchants[index + 1];
    if (!slotEnchants || slotEnchants.length === 0) return []; // Slot específico sem encantos

    const query = (enchantQueries[index] ?? "").trim().toLowerCase();
    const options = allEnchants.filter(enc => slotEnchants.includes(enc.id));

    if (!query) return options;
    return options.filter((enc) =>
      `${(enc as any).searchText ?? ""} ${enc.name} ${enc.id}`
        .toLowerCase()
        .includes(query),
    );
  }

  if (!selectedItem) {
    return (
      <Modal
        ariaLabel="Cartas e Encantamentos"
        closeLabel={copy.equipment.closeAction}
        icon={<Gem size={17} />}
        title="Cartas e Encantamentos"
        onClose={onClose}
      >
        <p className="text-slate-500 italic text-center py-6">Equipe um item primeiro.</p>
        <Button type="button" onClick={onClose} className="mt-4">
          Fechar
        </Button>
      </Modal>
    );
  }

  return (
    <Modal
      ariaLabel={`Cartas e Encantamentos — ${selectedItem.name}`}
      closeLabel={copy.equipment.closeAction}
      icon={<Gem size={17} />}
      title={`${selectedItem.name}`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        {/* Cartas */}
        {cardSlotCount > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider select-none flex items-center gap-1.5">
              <Gem size={11} />
              Cartas ({cardSlotCount})
            </span>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: cardSlotCount <= 2 ? '1fr '.repeat(cardSlotCount) : '1fr 1fr' }}>
              {Array.from({ length: cardSlotCount }, (_, index) => {
                const selectedCardId = selectedCards[index];
                const options = getFilteredCardOptions(index).slice(0, 100);

                // Garantir que o card atualmente selecionado esteja na lista
                const currentDetail = selectedItemDetails[selectedCardId];
                const ensuredOptions = [...options];
                if (selectedCardId && currentDetail && !ensuredOptions.some(o => o.id === selectedCardId)) {
                  ensuredOptions.unshift({ ...currentDetail, cardSlots: null, hasModifiers: true } as any);
                }

                return (
                  <div key={`card-${index}`} className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-medium pl-0.5">Carta {index + 1}</span>
                    <RichSelect
                      groups={[{
                        label: "Cartas",
                        options: [
                          { id: "empty", label: "Vazio" },
                          ...ensuredOptions.map((card) => ({
                            id: String(card.id),
                            label: card.name,
                            icon: <CalculatorItemIcon itemId={card.id} size={18} />,
                          })),
                        ],
                      }]}
                      searchable
                      searchValue={cardQueries[index] ?? ""}
                      searchPlaceholder="Buscar carta..."
                      emptyText="Nenhuma carta encontrada"
                      value={selectedCardId ? String(selectedCardId) : "empty"}
                      onChange={(itemId) => selectCard(index, itemId)}
                      onSearchChange={(q) => setCardQueries((prev) => ({ ...prev, [index]: q }))}
                      menuSize="compact"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Encantamentos */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider select-none flex items-center gap-1.5">
            <Sparkles size={11} />
            Encantamentos
          </span>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {Array.from({ length: 3 }, (_, index) => {
              const enchantIndex = cardSlotCount + index;
              const selectedEnchantId = selectedCards[enchantIndex];
              const options = getFilteredEnchantOptions(index).slice(0, 100);

              const currentDetail = selectedItemDetails[selectedEnchantId];
              const ensuredOptions = [...options];
              if (selectedEnchantId && currentDetail && !ensuredOptions.some(o => o.id === selectedEnchantId)) {
                ensuredOptions.unshift({ ...currentDetail, cardSlots: null, hasModifiers: true } as any);
              }

              const isSlotDisabled = !validEnchants || !validEnchants[index + 1];

              return (
                <div key={`enchant-${index}`} className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-500 font-medium pl-0.5">Encant. {index + 1}</span>
                  <RichSelect
                    disabled={isSlotDisabled}
                    groups={[{
                      label: "Encantamentos",
                      options: [
                        { id: "empty", label: "Vazio" },
                        ...ensuredOptions.map((enc) => ({
                          id: String(enc.id),
                          label: enc.name,
                          icon: <CalculatorItemIcon itemId={enc.id} size={18} />,
                        })),
                      ],
                    }]}
                    searchable
                    searchValue={enchantQueries[index] ?? ""}
                    searchPlaceholder="Buscar encantamento..."
                    emptyText={isSlotDisabled ? "Não encantável" : "Nenhum encantamento encontrado"}
                    value={selectedEnchantId ? String(selectedEnchantId) : "empty"}
                    onChange={(itemId) => selectCard(enchantIndex, itemId)}
                    onSearchChange={(q) => setEnchantQueries((prev) => ({ ...prev, [index]: q }))}
                    menuSize="compact"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Resumo dos efeitos selecionados */}
        {(selectedCards.some(Boolean)) && (
          <div className="border-t border-slate-800 pt-2 mt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
              Efeitos Ativos
            </span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedCards.map((cardId, i) => {
                if (!cardId) return null;
                const detail = selectedItemDetails[cardId];
                if (!detail) return null;
                const isEnchant = i >= cardSlotCount;
                return (
                  <span
                    key={`eff-${i}`}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${
                      isEnchant
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-sky-500/10 text-sky-300 border-sky-500/20"
                    }`}
                  >
                    <CalculatorItemIcon itemId={detail.id} size={14} />
                    {detail.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Button type="button" onClick={onClose} className="mt-4 w-full">
        Confirmar
      </Button>
    </Modal>
  );
}
