import { describe, expect, it } from "vitest";
import { CharacterStatusEngine } from "../character-status-engine";
import { SkillFormulaRegistry } from "./skill-formula-registry";
import type { SkillFormulaAdapter, SkillFormulaInput } from "./skill-formula.types";

const input: SkillFormulaInput = {
  character: new CharacterStatusEngine().calculate({
    character: {
      baseLevel: 100,
      jobLevel: 50,
      stats: {
        str: 1,
        agi: 1,
        vit: 1,
        int: 1,
        dex: 1,
        luk: 1,
        pow: 0,
        sta: 0,
        wis: 0,
        spl: 0,
        con: 0,
        crt: 0,
      },
    },
  }),
  monster: {
    id: 1001,
    name: "Training Target",
    level: 1,
    race: "demihuman",
    size: "medium",
    element: "neutral",
    elementLevel: 1,
    defense: 0,
    magicDefense: 0,
    hp: 1000,
    source: "manual",
  },
  skill: {
    id: "SM_BASH",
    name: "Bash",
    classTree: "swordman",
    damageType: "physical",
    maxLevel: 10,
    hitCount: 1,
    baseMultiplierByLevel: {
      "10": 400,
    },
    source: "manual",
  },
  skillLevel: 10,
};

describe("SkillFormulaRegistry", () => {
  it("uses generic skill data when no specific adapter is registered", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "GENERIC_TEST",
        },
      }),
    ).toEqual({
      formulaId: "generic",
      multiplier: 4,
      hitCount: 1,
      precision: "inferred",
    });
  });

  it("uses a static adapter for known starter skills", () => {
    expect(new SkillFormulaRegistry().calculate(input)).toEqual({
      formulaId: "static:SM_BASH",
      multiplier: 4,
      hitCount: 1,
      precision: "validated",
    });
  });

  it("uses static swordman and knight formulas validated from tooltip data", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "SM_MAGNUM",
        },
        skillLevel: 10,
      }),
    ).toEqual({
      formulaId: "static:SM_MAGNUM",
      multiplier: 3,
      hitCount: 1,
      precision: "validated",
    });

    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "KN_BOWLINGBASH",
        },
        skillLevel: 10,
      }),
    ).toEqual({
      formulaId: "static:KN_BOWLINGBASH",
      multiplier: 5,
      hitCount: 1,
      precision: "validated",
    });
  });

  it.each(["MG_COLDBOLT", "MG_FIREBOLT", "MG_LIGHTNINGBOLT"])(
    "uses static bolt formula for %s",
    (skillId) => {
      expect(
        new SkillFormulaRegistry().calculate({
          ...input,
          skill: {
            ...input.skill,
            id: skillId,
            damageType: "magical",
            maxLevel: 10,
          },
          skillLevel: 7,
        }),
      ).toEqual({
        formulaId: `static:${skillId}`,
        multiplier: 1,
        hitCount: 7,
        precision: "validated",
      });
    },
  );

  it("uses the LATAM Soul Vulcan Strike formula with base level and SPL scaling", () => {
    const character = new CharacterStatusEngine().calculate({
      character: {
        baseLevel: 229,
        jobLevel: 46,
        classId: "Arch_Mage",
        stats: {
          str: 20,
          agi: 103,
          vit: 100,
          int: 125,
          dex: 120,
          luk: 83,
          pow: 0,
          sta: 0,
          wis: 0,
          spl: 100,
          con: 14,
          crt: 0,
        },
      },
    });

    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        character,
        skill: {
          ...input.skill,
          id: "AG_SOUL_VC_STRIKE",
          damageType: "magical",
          maxLevel: 5,
          hitCount: 7,
          hitCountByLevel: {
            "1": 3,
            "2": 4,
            "3": 5,
            "4": 6,
            "5": 7,
          },
        },
        skillLevel: 5,
      }),
    ).toEqual({
      formulaId: "static:AG_SOUL_VC_STRIKE",
      // LATAM 180% por nível: (180*5 + spl:100 * 3 + jobBonusSpl) * baseLevel:229 / 100 * hitCount:7
      multiplier: 197.16899999999998,
      hitCount: 7,
      precision: "validated",
    });
  });

  it("uses per-level hit counts when skill data provides them", () => {
    expect(
      new SkillFormulaRegistry().calculate({
        ...input,
        skill: {
          ...input.skill,
          id: "GENERIC_TEST",
          hitCount: 10,
          hitCountByLevel: {
            "1": 1,
            "5": 5,
            "10": 10,
          },
        },
        skillLevel: 5,
      }),
    ).toEqual({
      formulaId: "generic",
      multiplier: 1,
      hitCount: 5,
      precision: "prototype",
    });
  });

  it("allows specific skill adapters to override generic behavior", () => {
    const adapter: SkillFormulaAdapter = {
      id: "test-specific",
      supports: (skill) => skill.id === "SM_BASH",
      calculate: () => ({
        formulaId: "test-specific",
        multiplier: 9,
        hitCount: 3,
        precision: "validated",
      }),
    };

    expect(new SkillFormulaRegistry([adapter]).calculate(input)).toEqual({
      formulaId: "test-specific",
      multiplier: 9,
      hitCount: 3,
      precision: "validated",
    });
  });

  it("supports complete Swordman lineage skills up to Dragon Knight and Imperial Guard", () => {
    const registry = new SkillFormulaRegistry();

    const spearStab = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "KN_SPEARSTAB" },
      skillLevel: 10,
    });
    expect(spearStab.formulaId).toBe("static:KN_SPEARSTAB");
    expect(spearStab.multiplier).toBe(3);

    const hackAndSlasher = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "DK_HACKANDSLASHER" },
      skillLevel: 10,
    });
    expect(hackAndSlasher.formulaId).toBe("static:DK_HACKANDSLASHER");
    expect(hackAndSlasher.precision).toBe("validated");

    const imperialCross = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "IG_IMPERIAL_CROSS" },
      skillLevel: 5,
    });
    expect(imperialCross.formulaId).toBe("static:IG_IMPERIAL_CROSS");
    expect(imperialCross.precision).toBe("validated");
  });

  it("supports complete Mage lineage skills up to Arch Mage and Elemental Master", () => {
    const registry = new SkillFormulaRegistry();

    const jupitel = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "WZ_JUPITEL", damageType: "magical" },
      skillLevel: 10,
    });
    expect(jupitel.formulaId).toBe("static:WZ_JUPITEL");
    expect(jupitel.hitCount).toBe(12);
    expect(jupitel.precision).toBe("validated");

    const deadlyProjection = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "AG_DEADLY_PROJECTION", damageType: "magical" },
      skillLevel: 5,
    });
    expect(deadlyProjection.formulaId).toBe("static:AG_DEADLY_PROJECTION");
    expect(deadlyProjection.precision).toBe("validated");

    const psychicStream = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "EM_PSYCHIC_STREAM", damageType: "magical" },
      skillLevel: 5,
    });
    expect(psychicStream.formulaId).toBe("static:EM_PSYCHIC_STREAM");
    expect(psychicStream.precision).toBe("validated");
  });

  it("supports complete Thief lineage skills up to Shadow Cross and Abyss Chaser", () => {
    const registry = new SkillFormulaRegistry();

    const envenom = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "TF_POISON" },
      skillLevel: 10,
    });
    expect(envenom.formulaId).toBe("static:TF_POISON");
    expect(envenom.bonusFlatDamage).toBe(150);

    const fatalShadowCrow = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "SHC_FATAL_SHADOW_CROW" },
      skillLevel: 5,
    });
    expect(fatalShadowCrow.formulaId).toBe("static:SHC_FATAL_SHADOW_CROW");
    expect(fatalShadowCrow.precision).toBe("validated");

    const deftStab = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "ABC_DEFT_STAB" },
      skillLevel: 10,
    });
    expect(deftStab.formulaId).toBe("static:ABC_DEFT_STAB");
    expect(deftStab.precision).toBe("validated");
  });

  it("supports complete Archer lineage skills up to Windhawk and Troubadour/Trouvere", () => {
    const registry = new SkillFormulaRegistry();

    const blitzBeat = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "HT_BLITZBEAT" },
      skillLevel: 5,
    });
    expect(blitzBeat.formulaId).toBe("static:HT_BLITZBEAT");
    expect(blitzBeat.hitCount).toBe(5);
    expect(blitzBeat.bonusFlatDamage).toBe(500);

    const hawkBoomerang = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "WH_HAWKBOOMERANG" },
      skillLevel: 5,
    });
    expect(hawkBoomerang.formulaId).toBe("static:WH_HAWKBOOMERANG");
    expect(hawkBoomerang.precision).toBe("validated");

    const metallicFury = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "TR_METALIC_FURY", damageType: "magical" },
      skillLevel: 5,
    });
    expect(metallicFury.formulaId).toBe("static:TR_METALIC_FURY");
    expect(metallicFury.precision).toBe("validated");
  });

  it("supports complete Merchant lineage skills up to Meister and Biolo", () => {
    const registry = new SkillFormulaRegistry();

    const boostKnuckle = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "NC_BOOSTKNUCKLE" },
      skillLevel: 5,
    });
    expect(boostKnuckle.formulaId).toBe("static:NC_BOOSTKNUCKLE");
    expect(boostKnuckle.precision).toBe("validated");

    const rushStrike = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "MT_RUSH_STRIKE" },
      skillLevel: 5,
    });
    expect(rushStrike.formulaId).toBe("static:MT_RUSH_STRIKE");
    expect(rushStrike.precision).toBe("validated");

    const dustExplosion = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "BO_DUST_EXPLOSION" },
      skillLevel: 5,
    });
    expect(dustExplosion.formulaId).toBe("static:BO_DUST_EXPLOSION");
    expect(dustExplosion.precision).toBe("validated");
  });

  it("supports complete Acolyte lineage skills up to Cardinal and Inquisitor", () => {
    const registry = new SkillFormulaRegistry();

    const asura = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "MO_EXTREMITYFIST" },
      skillLevel: 5,
    });
    expect(asura.formulaId).toBe("static:MO_EXTREMITYFIST");
    expect(asura.bonusFlatDamage).toBe(1000);

    const framen = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "CD_FRAMEN", damageType: "magical" },
      skillLevel: 5,
    });
    expect(framen.formulaId).toBe("static:CD_FRAMEN");
    expect(framen.precision).toBe("validated");

    const blazingFlameBlast = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "IQ_BLAZING_FLAME_BLAST" },
      skillLevel: 5,
    });
    expect(blazingFlameBlast.formulaId).toBe("static:IQ_BLAZING_FLAME_BLAST");
    expect(blazingFlameBlast.precision).toBe("validated");
  });

  it("supports complete Expanded lineage skills up to Night Watch, Shinkiro/Shiranui, Soul Ascetic, Sky Emperor, Spirit Handler and Hyper Novice", () => {
    const registry = new SkillFormulaRegistry();

    const midnightFallen = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "NW_MIDNIGHT_FALLEN" },
      skillLevel: 5,
    });
    expect(midnightFallen.formulaId).toBe("static:NW_MIDNIGHT_FALLEN");
    expect(midnightFallen.precision).toBe("validated");

    const kagegissen = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "SS_KAGEGISSEN" },
      skillLevel: 5,
    });
    expect(kagegissen.formulaId).toBe("static:SS_KAGEGISSEN");
    expect(kagegissen.precision).toBe("validated");

    const blueDragon = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "SOA_TALISMAN_OF_BLUE_DRAGON", damageType: "magical" },
      skillLevel: 5,
    });
    expect(blueDragon.formulaId).toBe("static:SOA_TALISMAN_OF_BLUE_DRAGON");
    expect(blueDragon.precision).toBe("validated");

    const noonBlast = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "SKE_NOON_BLAST" },
      skillLevel: 5,
    });
    expect(noonBlast.formulaId).toBe("static:SKE_NOON_BLAST");
    expect(noonBlast.precision).toBe("validated");

    const sonicClaw = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "SH_CHUL_HO_SONIC_CLAW" },
      skillLevel: 5,
    });
    expect(sonicClaw.formulaId).toBe("static:SH_CHUL_HO_SONIC_CLAW");
    expect(sonicClaw.precision).toBe("validated");

    const megaSonicBlow = registry.calculate({
      ...input,
      skill: { ...input.skill, id: "HN_MEGA_SONIC_BLOW" },
      skillLevel: 5,
    });
    expect(megaSonicBlow.formulaId).toBe("static:HN_MEGA_SONIC_BLOW");
    expect(megaSonicBlow.precision).toBe("validated");
  });
});
