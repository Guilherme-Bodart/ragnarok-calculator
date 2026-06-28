import { describe, expect, it, vi, beforeEach } from "vitest";
import { searchCalculatorMonsters, getCalculatorMonsterDetail } from "./calculator-monster-data";

global.fetch = vi.fn();

describe("calculator-monster-data E2E", () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  it("fetches static monster index when searching", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1002, name: "Poring" }],
    } as any);

    const result = await searchCalculatorMonsters({ limit: 10 });
    
    expect(global.fetch).toHaveBeenCalledWith("/data/calculator/monsters-index.json");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Poring");
  });

  it("fetches individual monster detail JSON by monster ID", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1002, name: "Poring", hp: 50 }),
    } as any);

    const result = await getCalculatorMonsterDetail(1002);
    
    expect(global.fetch).toHaveBeenCalledWith("/data/calculator/monsters/1002.json");
    expect(result.name).toBe("Poring");
    expect(result.hp).toBe(50);
  });
});
