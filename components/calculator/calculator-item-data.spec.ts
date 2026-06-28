import { describe, expect, it, vi, beforeEach } from "vitest";
import { searchCalculatorItems, getCalculatorItemDetail, clearCalculatorItemsCache } from "./calculator-item-data";

global.fetch = vi.fn();

describe("calculator-item-data E2E", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
    clearCalculatorItemsCache();
  });

  it("fetches static card index when searching for cards", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: "Poring Card" }],
    } as any);

    const result = await searchCalculatorItems({ kind: "card", limit: 10 });
    
    expect(global.fetch).toHaveBeenCalledWith("/data/calculator/items/card.json");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Poring Card");
  });

  it("fetches static slot index when searching for a specific slot", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 2, name: "Armor of Test" }],
    } as any);

    const result = await searchCalculatorItems({ slot: "armor", limit: 10 });
    
    expect(global.fetch).toHaveBeenCalledWith("/data/calculator/items/armor.json");
    expect(result).toHaveLength(1);
  });

  it("fetches individual item detail JSON by item ID and category", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 640012, name: "Celine Vestido" }],
    } as any);

    const result = await getCalculatorItemDetail(640012, "armor");
    
    expect(global.fetch).toHaveBeenCalledWith("/data/calculator/items/armor.json");
    expect(result.name).toBe("Celine Vestido");
  });
});
