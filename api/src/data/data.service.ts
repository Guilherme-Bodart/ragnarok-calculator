import { Injectable, NotFoundException } from "@nestjs/common";
import { itemsSeed } from "./seed/items.seed";
import { monstersSeed } from "./seed/monsters.seed";
import { skillsSeed } from "./seed/skills.seed";

@Injectable()
export class DataService {
  getItems() {
    return itemsSeed;
  }

  getMonsters() {
    return monstersSeed;
  }

  getSkills() {
    return skillsSeed;
  }

  getItemById(id: number) {
    const item = itemsSeed.find((candidate) => candidate.id === id);
    if (!item) {
      throw new NotFoundException(`Item ${id} was not found.`);
    }

    return item;
  }

  getMonsterById(id: number) {
    const monster = monstersSeed.find((candidate) => candidate.id === id);
    if (!monster) {
      throw new NotFoundException(`Monster ${id} was not found.`);
    }

    return monster;
  }

  getSkillById(id: string) {
    const skill = skillsSeed.find((candidate) => candidate.id === id);
    if (!skill) {
      throw new NotFoundException(`Skill ${id} was not found.`);
    }

    return skill;
  }
}
