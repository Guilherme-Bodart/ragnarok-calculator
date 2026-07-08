import { GenericSkillFormula } from "./generic-skill";
// Auto-generated imports
import { WarlockSkillFormula } from "./classes/warlock";
import { SorcererSkillFormula } from "./classes/sorcerer";
import { WizardHighWizardSkillFormula } from "./classes/wizard-high-wizard";
import { MageSkillFormula } from "./classes/mage";
import { RuneKnightSkillFormula } from "./classes/rune-knight";
import { RoyalGuardSkillFormula } from "./classes/royal-guard";
import { LordKnightPaladinSkillFormula } from "./classes/lord-knight-paladin";
import { KnightCrusaderSkillFormula } from "./classes/knight-crusader";
import { SuraSkillFormula } from "./classes/sura";
import { ArchbishopSkillFormula } from "./classes/archbishop";
import { ChampionMonkSkillFormula } from "./classes/champion-monk";
import { HighPriestPriestSkillFormula } from "./classes/high-priest-priest";
import { AcolyteSkillFormula } from "./classes/acolyte";
import { ShadowCrossSkillFormula } from "./classes/shadow-cross";
import { AbyssChaserSkillFormula } from "./classes/abyss-chaser";
import { GuillotineCrossSkillFormula } from "./classes/guillotine-cross";
import { ShadowChaserSkillFormula } from "./classes/shadow-chaser";
import { AssassinCrossStalkerSkillFormula } from "./classes/assassin-cross-stalker";
import { AssassinRogueSkillFormula } from "./classes/assassin-rogue";
import { ThiefSkillFormula } from "./classes/thief";
import { WindhawkSkillFormula } from "./classes/windhawk";
import { TroubadourTrouvereSkillFormula } from "./classes/troubadour-trouvere";
import { RangerSkillFormula } from "./classes/ranger";
import { MinstrelWandererSkillFormula } from "./classes/minstrel-wanderer";
import { SniperClownGypsySkillFormula } from "./classes/sniper-clown-gypsy";
import { HunterBardDancerSkillFormula } from "./classes/hunter-bard-dancer";
import { ArcherSkillFormula } from "./classes/archer";
import { GeneticSkillFormula } from "./classes/genetic";
import { MechanicSkillFormula } from "./classes/mechanic";
import { CreatorBiochemistSkillFormula } from "./classes/creator-biochemist";
import { MastersmithWhitesmithSkillFormula } from "./classes/mastersmith-whitesmith";
import { AlchemistSkillFormula } from "./classes/alchemist";
import { MerchantSkillFormula } from "./classes/merchant";
import { SwordmanSkillFormula } from "./classes/swordman";
import { ArchMageSkillFormula } from "./classes/arch-mage";
import { ElementalMasterSkillFormula } from "./classes/elemental-master";
import { DragonKnightSkillFormula } from "./classes/dragon-knight";
import { ImperialGuardSkillFormula } from "./classes/imperial-guard";
import { CardinalSkillFormula } from "./classes/cardinal";
import { MeisterSkillFormula } from "./classes/meister";
import { BioloSkillFormula } from "./classes/biolo";
import { InquisitorSkillFormula } from "./classes/inquisitor";
import { RebellionSkillFormula } from "./classes/rebellion";
import { GunslingerSkillFormula } from "./classes/gunslinger";
import { KagerouOboroSkillFormula } from "./classes/kagerou-oboro";
import { NinjaSkillFormula } from "./classes/ninja";
import { SoulReaperSkillFormula } from "./classes/soul-reaper";
import { StarEmperorSkillFormula } from "./classes/star-emperor";
import { SoulLinkerSkillFormula } from "./classes/soul-linker";
import { TaekwonKidSkillFormula } from "./classes/taekwon-kid";
import { SummonerSkillFormula } from "./classes/summoner";

import type {
  SkillFormulaAdapter,
  SkillFormulaInput,
  SkillFormulaResult,
} from "./skill-formula.types";

export class SkillFormulaRegistry {
  constructor(
    private readonly adapters: SkillFormulaAdapter[] = [
      new WarlockSkillFormula(),
      new SorcererSkillFormula(),
      new WizardHighWizardSkillFormula(),
      new MageSkillFormula(),
      new RuneKnightSkillFormula(),
      new RoyalGuardSkillFormula(),
      new LordKnightPaladinSkillFormula(),
      new KnightCrusaderSkillFormula(),
      new SuraSkillFormula(),
      new ArchbishopSkillFormula(),
      new ChampionMonkSkillFormula(),
      new HighPriestPriestSkillFormula(),
      new AcolyteSkillFormula(),
      new ShadowCrossSkillFormula(),
      new AbyssChaserSkillFormula(),
      new GuillotineCrossSkillFormula(),
      new ShadowChaserSkillFormula(),
      new AssassinCrossStalkerSkillFormula(),
      new AssassinRogueSkillFormula(),
      new ThiefSkillFormula(),
      new WindhawkSkillFormula(),
      new TroubadourTrouvereSkillFormula(),
      new RangerSkillFormula(),
      new MinstrelWandererSkillFormula(),
      new SniperClownGypsySkillFormula(),
      new HunterBardDancerSkillFormula(),
      new ArcherSkillFormula(),
      new GeneticSkillFormula(),
      new MechanicSkillFormula(),
      new CreatorBiochemistSkillFormula(),
      new MastersmithWhitesmithSkillFormula(),
      new AlchemistSkillFormula(),
      new MerchantSkillFormula(),
      new SwordmanSkillFormula(),
      new ArchMageSkillFormula(),
      new ElementalMasterSkillFormula(),
      new DragonKnightSkillFormula(),
      new ImperialGuardSkillFormula(),
      new CardinalSkillFormula(),
      new MeisterSkillFormula(),
      new BioloSkillFormula(),
      new InquisitorSkillFormula(),
      new RebellionSkillFormula(),
      new GunslingerSkillFormula(),
      new KagerouOboroSkillFormula(),
      new NinjaSkillFormula(),
      new SoulReaperSkillFormula(),
      new StarEmperorSkillFormula(),
      new SoulLinkerSkillFormula(),
      new TaekwonKidSkillFormula(),
      new SummonerSkillFormula(),
      new GenericSkillFormula(),
    ],
  ) {}

  calculate(input: SkillFormulaInput): SkillFormulaResult {
    const adapter = this.adapters.find((candidate) =>
      candidate.supports(input.skill),
    );

    return (adapter ?? new GenericSkillFormula()).calculate(input);
  }
}
