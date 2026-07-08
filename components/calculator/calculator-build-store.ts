import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { EquipmentSlot, CharacterStats } from "@/packages/calculator-core/src";
import {
  calculatorBuildPayloadVersion,
  migrateCalculatorBuildPayload,
  type CalculatorBuildPayload,
} from "./calculator-build-payload";
import { createDefaultCalculatorBuild, calculatorBuildStorageKey } from "./calculator-build-storage";
import { isFourthJobClassId, calculatorSkillTreeCatalog } from "./calculator-skill-tree-data";
import { getCalculatorClassSkills } from "./calculator-skill-classification";
import { defaultCalculatorInput } from "./calculator-base-data";

export type CalculatorBuildState = {
  buildName: string;
  lastSavedAt: number;
  lastModifiedAt: number;
  selectedClassId: string;
  learnedSkills: Record<string, number>;
  baseLevel: number;
  jobLevel: number;
  stats: CharacterStats;
  selectedSkillId: string;
  skillLevel: number;
  selectedMonsterId: number;
  activeBuffs: Record<string, number>;
  selectedBuffId: string;
  selectedItemsBySlot: Partial<Record<EquipmentSlot, number>>;
  selectedCardsBySlot: Partial<Record<EquipmentSlot, number[]>>;
  itemContexts: Record<number, { refine?: number; grade?: number }>;
};

export type CalculatorBuildActions = {
  setBuildName: (name: string) => void;
  setSelectedClassId: (classId: string) => void;
  setLearnedSkills: (skills: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  setBaseLevel: (level: number) => void;
  setJobLevel: (level: number | ((prev: number) => number)) => void;
  setStats: (stats: CharacterStats | ((prev: CharacterStats) => CharacterStats)) => void;
  setSelectedSkillId: (skillId: string) => void;
  setSkillLevel: (level: number) => void;
  setSelectedMonsterId: (monsterId: number) => void;
  setActiveBuffs: (buffs: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  setSelectedBuffId: (buffId: string) => void;
  setSelectedItemsBySlot: (items: Partial<Record<EquipmentSlot, number>> | ((prev: Partial<Record<EquipmentSlot, number>>) => Partial<Record<EquipmentSlot, number>>)) => void;
  setSelectedCardsBySlot: (cards: Partial<Record<EquipmentSlot, number[]>> | ((prev: Partial<Record<EquipmentSlot, number[]>>) => Partial<Record<EquipmentSlot, number[]>>)) => void;
  setItemContexts: (contexts: Record<number, { refine?: number; grade?: number }> | ((prev: Record<number, { refine?: number; grade?: number }>) => Record<number, { refine?: number; grade?: number }>)) => void;

  loadBuild: (build: CalculatorBuildPayload) => void;
  markAsSaved: () => void;
  markAsModified: () => void;
  renameBuild: (name: string) => void;
  handleClassChange: (classId: string, manualBuffSkills: { id: string }[]) => void;
  resetBuild: () => void;
};

export type CalculatorBuildStore = CalculatorBuildState & CalculatorBuildActions;

function extractStateFromPayload(payload: CalculatorBuildPayload): Omit<CalculatorBuildState, "lastSavedAt" | "lastModifiedAt"> {
  return {
    buildName: payload.name,
    selectedClassId: payload.character.selectedClassId,
    baseLevel: payload.character.baseLevel,
    jobLevel: payload.character.jobLevel,
    stats: payload.character.stats,
    selectedSkillId: payload.attack.selectedSkillId,
    skillLevel: payload.attack.skillLevel,
    learnedSkills: payload.tree.learnedSkills,
    itemContexts: payload.equipment.itemContexts,
    selectedCardsBySlot: payload.equipment.selectedCardsBySlot,
    selectedItemsBySlot: payload.equipment.selectedItemsBySlot,
    activeBuffs: payload.buffs.activeBuffs,
    selectedBuffId: payload.buffs.selectedBuffId,
    selectedMonsterId: payload.target.selectedMonsterId,
  };
}

const defaultBuildPayload = createDefaultCalculatorBuild();
const initialState: CalculatorBuildState = {
  ...extractStateFromPayload(defaultBuildPayload),
  lastSavedAt: Date.now(),
  lastModifiedAt: Date.now(),
};

export const useCalculatorBuildStore = create<CalculatorBuildStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBuildName: (buildName) => {
        set({ buildName });
        get().markAsModified();
      },
      setSelectedClassId: (selectedClassId) => {
        set({ selectedClassId });
        get().markAsModified();
      },
      setLearnedSkills: (skills) => {
        set((state) => ({ learnedSkills: typeof skills === "function" ? skills(state.learnedSkills) : skills }));
        get().markAsModified();
      },
      setBaseLevel: (baseLevel) => {
        set({ baseLevel });
        get().markAsModified();
      },
      setJobLevel: (level) => {
        set((state) => ({ jobLevel: typeof level === "function" ? level(state.jobLevel) : level }));
        get().markAsModified();
      },
      setStats: (stats) => {
        set((state) => ({ stats: typeof stats === "function" ? stats(state.stats) : stats }));
        get().markAsModified();
      },
      setSelectedSkillId: (selectedSkillId) => {
        set({ selectedSkillId });
        get().markAsModified();
      },
      setSkillLevel: (skillLevel) => {
        set({ skillLevel });
        get().markAsModified();
      },
      setSelectedMonsterId: (selectedMonsterId) => {
        set({ selectedMonsterId });
        get().markAsModified();
      },
      setActiveBuffs: (buffs) => {
        set((state) => ({ activeBuffs: typeof buffs === "function" ? buffs(state.activeBuffs) : buffs }));
        get().markAsModified();
      },
      setSelectedBuffId: (selectedBuffId) => {
        set({ selectedBuffId });
        get().markAsModified();
      },
      setSelectedItemsBySlot: (items) => {
        set((state) => ({ selectedItemsBySlot: typeof items === "function" ? items(state.selectedItemsBySlot) : items }));
        get().markAsModified();
      },
      setSelectedCardsBySlot: (cards) => {
        set((state) => ({ selectedCardsBySlot: typeof cards === "function" ? cards(state.selectedCardsBySlot) : cards }));
        get().markAsModified();
      },
      setItemContexts: (contexts) => {
        set((state) => ({ itemContexts: typeof contexts === "function" ? contexts(state.itemContexts) : contexts }));
        get().markAsModified();
      },

      loadBuild: (build) => {
        const now = Date.now();
        set({
          ...extractStateFromPayload(build),
          lastSavedAt: now,
          lastModifiedAt: now,
        });
      },
      markAsSaved: () => {
        const now = Date.now();
        set({ lastSavedAt: now, lastModifiedAt: now });
      },
      markAsModified: () => {
        set({ lastModifiedAt: Date.now() });
      },
      renameBuild: (name) => {
        set({ buildName: name });
        get().markAsModified();
      },
      handleClassChange: (classId, manualBuffSkills) => {
        const isFourthJob = isFourthJobClassId(classId);
        const nextSkills = getCalculatorClassSkills(calculatorSkillTreeCatalog, classId);
        const nextSkill = nextSkills[0];

        set((state) => {
          const nextJobLevel = Math.min(state.jobLevel, isFourthJob ? 70 : 60);
          const nextSkillId = nextSkill?.id ?? state.selectedSkillId;
          const nextSkillLevel = nextSkill ? Math.min(state.skillLevel, nextSkill.maxLevel) : state.skillLevel;
          const nextBuffId = manualBuffSkills[0]?.id ?? "";
          const nextStats = isFourthJob ? state.stats : {
            ...state.stats,
            pow: 0, sta: 0, wis: 0, spl: 0, con: 0, crt: 0
          };

          return {
            selectedClassId: classId,
            learnedSkills: {},
            activeBuffs: {},
            jobLevel: nextJobLevel,
            selectedSkillId: nextSkillId,
            skillLevel: nextSkillLevel,
            selectedBuffId: nextBuffId,
            stats: nextStats,
          };
        });
        get().markAsModified();
      },
      resetBuild: () => {
        const defaultClassId = defaultCalculatorInput.character.classId ?? "Dragon_Knight";
        const now = Date.now();
        
        set({
          buildName: createDefaultCalculatorBuild().name,
          selectedClassId: defaultClassId,
          stats: {
            str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1,
            pow: 0, sta: 0, wis: 0, spl: 0, con: 0, crt: 0,
          },
          baseLevel: defaultCalculatorInput.character.baseLevel,
          jobLevel: defaultCalculatorInput.character.jobLevel,
          learnedSkills: {},
          selectedSkillId: defaultCalculatorInput.skillId,
          skillLevel: defaultCalculatorInput.skillLevel,
          selectedMonsterId: defaultCalculatorInput.monsterId,
          activeBuffs: {},
          selectedBuffId: "",
          selectedItemsBySlot: {},
          selectedCardsBySlot: {},
          itemContexts: {},
          lastSavedAt: now,
          lastModifiedAt: now,
        });
        // Removendo manualmente a persistência antiga (se existir) na hora do reset
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(calculatorBuildStorageKey);
        }
      },
    }),
    {
      name: calculatorBuildStorageKey,
      version: calculatorBuildPayloadVersion,
      storage: createJSONStorage(() => window.localStorage),
      // O partialize converte do state interno (CalculatorBuildState) para o modelo que será persistido (CalculatorBuildPayload)
      partialize: (state): CalculatorBuildPayload => ({
        version: calculatorBuildPayloadVersion,
        name: state.buildName,
        character: {
          selectedClassId: state.selectedClassId,
          baseLevel: state.baseLevel,
          jobLevel: state.jobLevel,
          stats: state.stats,
        },
        attack: {
          selectedSkillId: state.selectedSkillId,
          skillLevel: state.skillLevel,
        },
        tree: {
          learnedSkills: state.learnedSkills,
        },
        equipment: {
          itemContexts: state.itemContexts,
          selectedCardsBySlot: state.selectedCardsBySlot,
          selectedItemsBySlot: state.selectedItemsBySlot,
        },
        buffs: {
          activeBuffs: state.activeBuffs,
          selectedBuffId: state.selectedBuffId,
        },
        target: {
          selectedMonsterId: state.selectedMonsterId,
        },
      }),
      // Rehydrate extrai os dados do formato CalculatorBuildPayload (do persist) ou JSON bruto
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persistedState: any, currentState) => {
        const migrated = migrateCalculatorBuildPayload(persistedState);
        
        if (migrated) {
          return {
            ...currentState,
            ...extractStateFromPayload(migrated)
          };
        }
        
        return currentState;
      },
    }
  )
);
