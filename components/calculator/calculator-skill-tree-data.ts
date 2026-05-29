import rawSkillTree from "@/nightmare-data/normalized/skills/skill-tree.json";
import rawSkills from "@/nightmare-data/normalized/skills/skills.en.json";
import {
  createSkillTreeCatalog,
  type SkillTreeRawDataset,
  type SkillTreeRawSkillInfo,
} from "@/packages/calculator-core/src";

export const calculatorSkillTreeCatalog = createSkillTreeCatalog(
  rawSkillTree as SkillTreeRawDataset,
  rawSkills as SkillTreeRawSkillInfo[],
);

export const calculatorSkillTreeClassOptions =
  calculatorSkillTreeCatalog.jobOptions;

const classGroupOrder = [
  {
    label: "Novice",
    ids: [
      "Novice",
      "Novice_High",
      "Baby",
      "Supernovice",
      "Super_Novice_E",
      "Super_Baby",
      "Super_Baby_E",
      "Hyper_Novice",
    ],
  },
  {
    label: "Swordman",
    ids: [
      "Swordman",
      "Swordman_High",
      "Baby_Swordman",
      "Knight",
      "Knight2",
      "Lord_Knight",
      "Lord_Knight2",
      "Baby_Knight",
      "Baby_Knight2",
      "Rune_Knight",
      "Rune_Knight2",
      "Rune_Knight_T",
      "Rune_Knight_T2",
      "Baby_Rune_Knight",
      "Baby_Rune_Knight2",
      "Dragon_Knight",
      "Dragon_Knight2",
      "Crusader",
      "Crusader2",
      "Paladin",
      "Paladin2",
      "Baby_Crusader",
      "Baby_Crusader2",
      "Royal_Guard",
      "Royal_Guard2",
      "Royal_Guard_T",
      "Royal_Guard_T2",
      "Baby_Royal_Guard",
      "Baby_Royal_Guard2",
      "Imperial_Guard",
      "Imperial_Guard2",
    ],
  },
  {
    label: "Mage",
    ids: [
      "Mage",
      "Mage_High",
      "Baby_Mage",
      "Wizard",
      "High_Wizard",
      "Baby_Wizard",
      "Warlock",
      "Warlock_T",
      "Baby_Warlock",
      "Arch_Mage",
      "Sage",
      "Professor",
      "Baby_Sage",
      "Sorcerer",
      "Sorcerer_T",
      "Baby_Sorcerer",
      "Elemental_Master",
    ],
  },
  {
    label: "Archer",
    ids: [
      "Archer",
      "Archer_High",
      "Baby_Archer",
      "Hunter",
      "Sniper",
      "Baby_Hunter",
      "Ranger",
      "Ranger2",
      "Ranger_T",
      "Ranger_T2",
      "Baby_Ranger",
      "Baby_Ranger2",
      "Windhawk",
      "Windhawk2",
      "Bard",
      "Clown",
      "Baby_Bard",
      "Minstrel",
      "Minstrel_T",
      "Baby_Minstrel",
      "Troubadour",
      "Dancer",
      "Gypsy",
      "Baby_Dancer",
      "Wanderer",
      "Wanderer_T",
      "Baby_Wanderer",
      "Trouvere",
    ],
  },
  {
    label: "Acolyte",
    ids: [
      "Acolyte",
      "Acolyte_High",
      "Baby_Acolyte",
      "Priest",
      "High_Priest",
      "Baby_Priest",
      "Arch_Bishop",
      "Arch_Bishop_T",
      "Baby_Arch_Bishop",
      "Cardinal",
      "Monk",
      "Champion",
      "Baby_Monk",
      "Sura",
      "Sura_T",
      "Baby_Sura",
      "Inquisitor",
    ],
  },
  {
    label: "Merchant",
    ids: [
      "Merchant",
      "Merchant_High",
      "Baby_Merchant",
      "Blacksmith",
      "Whitesmith",
      "Baby_Blacksmith",
      "Mechanic",
      "Mechanic2",
      "Mechanic_T",
      "Mechanic_T2",
      "Baby_Mechanic",
      "Baby_Mechanic2",
      "Meister",
      "Meister2",
      "Alchemist",
      "Creator",
      "Baby_Alchemist",
      "Genetic",
      "Genetic_T",
      "Baby_Genetic",
      "Biolo",
    ],
  },
  {
    label: "Thief",
    ids: [
      "Thief",
      "Thief_High",
      "Baby_Thief",
      "Assassin",
      "Assassin_Cross",
      "Baby_Assassin",
      "Guillotine_Cross",
      "Guillotine_Cross_T",
      "Baby_Guillotine_Cross",
      "Shadow_Cross",
      "Rogue",
      "Stalker",
      "Baby_Rogue",
      "Shadow_Chaser",
      "Shadow_Chaser_T",
      "Baby_Shadow_Chaser",
      "Abyss_Chaser",
    ],
  },
  {
    label: "Taekwon / Soul",
    ids: [
      "Taekwon",
      "Baby_Taekwon",
      "Star_Gladiator",
      "Star_Gladiator2",
      "Baby_Star_Gladiator",
      "Baby_Star_Gladiator2",
      "Star_Emperor",
      "Star_Emperor2",
      "Baby_Star_Emperor",
      "Baby_Star_Emperor2",
      "Sky_Emperor",
      "Sky_Emperor2",
      "Soul_Linker",
      "Baby_Soul_Linker",
      "Soul_Reaper",
      "Baby_Soul_Reaper",
      "Soul_Ascetic",
    ],
  },
  {
    label: "Expanded",
    ids: [
      "Gunslinger",
      "Baby_Gunslinger",
      "Rebellion",
      "Baby_Rebellion",
      "Night_Watch",
      "Ninja",
      "Baby_Ninja",
      "Kagerou",
      "Baby_Kagerou",
      "Oboro",
      "Baby_Oboro",
      "Shinkiro",
      "Shiranui",
      "Summoner",
      "Baby_Summoner",
      "Spirit_Handler",
      "Gangsi",
      "Death_Knight",
      "Dark_Collector",
    ],
  },
];

const selectableThirdAndFourthClassIds = new Set([
  "Hyper_Novice",

  "Rune_Knight",
  "Rune_Knight2",
  "Rune_Knight_T",
  "Rune_Knight_T2",
  "Dragon_Knight",
  "Dragon_Knight2",
  "Royal_Guard",
  "Royal_Guard2",
  "Royal_Guard_T",
  "Royal_Guard_T2",
  "Imperial_Guard",
  "Imperial_Guard2",

  "Warlock",
  "Warlock_T",
  "Arch_Mage",
  "Sorcerer",
  "Sorcerer_T",
  "Elemental_Master",

  "Ranger",
  "Ranger2",
  "Ranger_T",
  "Ranger_T2",
  "Windhawk",
  "Windhawk2",
  "Minstrel",
  "Minstrel_T",
  "Troubadour",
  "Wanderer",
  "Wanderer_T",
  "Trouvere",

  "Arch_Bishop",
  "Arch_Bishop_T",
  "Cardinal",
  "Sura",
  "Sura_T",
  "Inquisitor",

  "Mechanic",
  "Mechanic2",
  "Mechanic_T",
  "Mechanic_T2",
  "Meister",
  "Meister2",
  "Genetic",
  "Genetic_T",
  "Biolo",

  "Guillotine_Cross",
  "Guillotine_Cross_T",
  "Shadow_Cross",
  "Shadow_Chaser",
  "Shadow_Chaser_T",
  "Abyss_Chaser",

  "Star_Emperor",
  "Star_Emperor2",
  "Sky_Emperor",
  "Sky_Emperor2",
  "Soul_Reaper",
  "Soul_Ascetic",

  "Rebellion",
  "Night_Watch",
  "Kagerou",
  "Oboro",
  "Shinkiro",
  "Shiranui",
  "Spirit_Handler",
  "Death_Knight",
  "Dark_Collector",
]);

export const calculatorSkillTreeClassGroups = createClassGroups();

const fourthJobClassIds = new Set([
  "Hyper_Novice",
  "Dragon_Knight",
  "Dragon_Knight2",
  "Imperial_Guard",
  "Imperial_Guard2",
  "Arch_Mage",
  "Elemental_Master",
  "Windhawk",
  "Windhawk2",
  "Troubadour",
  "Trouvere",
  "Cardinal",
  "Inquisitor",
  "Meister",
  "Meister2",
  "Biolo",
  "Shadow_Cross",
  "Abyss_Chaser",
  "Sky_Emperor",
  "Sky_Emperor2",
  "Soul_Ascetic",
  "Night_Watch",
  "Shinkiro",
  "Shiranui",
  "Spirit_Handler",
]);

export function isFourthJobClassId(classId: string) {
  return fourthJobClassIds.has(classId);
}

const mergedDisplayJobIds: Record<string, string> = {
  Novice_High: "Novice",
  Baby: "Novice",

  Swordman_High: "Swordman",
  Baby_Swordman: "Swordman",
  Lord_Knight: "Knight",
  Lord_Knight2: "Knight",
  Baby_Knight: "Knight",
  Baby_Knight2: "Knight",
  Paladin: "Crusader",
  Paladin2: "Crusader",
  Baby_Crusader: "Crusader",
  Baby_Crusader2: "Crusader",

  Mage_High: "Mage",
  Baby_Mage: "Mage",
  High_Wizard: "Wizard",
  Baby_Wizard: "Wizard",
  Professor: "Sage",
  Baby_Sage: "Sage",

  Archer_High: "Archer",
  Baby_Archer: "Archer",
  Sniper: "Hunter",
  Baby_Hunter: "Hunter",
  Clown: "Bard",
  Baby_Bard: "Bard",
  Gypsy: "Dancer",
  Baby_Dancer: "Dancer",

  Acolyte_High: "Acolyte",
  Baby_Acolyte: "Acolyte",
  High_Priest: "Priest",
  Baby_Priest: "Priest",
  Champion: "Monk",
  Baby_Monk: "Monk",

  Merchant_High: "Merchant",
  Baby_Merchant: "Merchant",
  Whitesmith: "Blacksmith",
  Baby_Blacksmith: "Blacksmith",
  Creator: "Alchemist",
  Baby_Alchemist: "Alchemist",

  Thief_High: "Thief",
  Baby_Thief: "Thief",
  Assassin_Cross: "Assassin",
  Baby_Assassin: "Assassin",
  Stalker: "Rogue",
  Baby_Rogue: "Rogue",
};

export function getCalculatorSkillTreeDisplayJobId(
  jobId: string,
  availableJobIds: Set<string>,
) {
  const withoutMountSuffix = jobId.endsWith("2") ? jobId.slice(0, -1) : jobId;

  if (withoutMountSuffix !== jobId && availableJobIds.has(withoutMountSuffix)) {
    return withoutMountSuffix;
  }

  const withoutTranscendentSuffix = jobId.endsWith("_T")
    ? jobId.slice(0, -2)
    : jobId;

  if (
    withoutTranscendentSuffix !== jobId &&
    availableJobIds.has(withoutTranscendentSuffix)
  ) {
    return withoutTranscendentSuffix;
  }

  return mergedDisplayJobIds[jobId] ?? jobId;
}

export function shouldMergeNoviceIntoNextJob(jobId: string) {
  return jobId === "Novice" || jobId === "Novice_High" || jobId === "Baby";
}

function createClassGroups() {
  const optionByCanonicalId = new Map<string, (typeof calculatorSkillTreeClassOptions)[number]>();

  for (const option of calculatorSkillTreeClassOptions) {
    if (!selectableThirdAndFourthClassIds.has(option.id)) {
      continue;
    }

    const canonicalId = getSelectableCanonicalJobId(option.id);

    if (!optionByCanonicalId.has(canonicalId) || option.id === canonicalId) {
      optionByCanonicalId.set(canonicalId, option);
    }
  }

  const usedCanonicalIds = new Set<string>();
  const groups = classGroupOrder
    .map((group) => ({
      label: group.label,
      options: group.ids.flatMap((id) => {
        const canonicalId = getSelectableCanonicalJobId(id);
        const option = optionByCanonicalId.get(canonicalId);

        if (!option || usedCanonicalIds.has(canonicalId)) {
          return [];
        }

        usedCanonicalIds.add(canonicalId);
        return [option];
      }),
    }))
    .filter((group) => group.options.length > 0);
  const remainingOptions = calculatorSkillTreeClassOptions.filter(
    (option) =>
      selectableThirdAndFourthClassIds.has(option.id) &&
      !usedCanonicalIds.has(getSelectableCanonicalJobId(option.id)),
  );

  if (remainingOptions.length > 0) {
    groups.push({ label: "Other", options: remainingOptions });
  }

  return groups;
}

function getSelectableCanonicalJobId(jobId: string) {
  return jobId.replace(/_T2$/, "").replace(/_T$/, "").replace(/2$/, "");
}
