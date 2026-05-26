import { Controller, Get } from "@nestjs/common";
import { DataService } from "./data.service";

@Controller("ro")
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get("items")
  getItems() {
    return this.dataService.getItems();
  }

  @Get("monsters")
  getMonsters() {
    return this.dataService.getMonsters();
  }

  @Get("skills")
  getSkills() {
    return this.dataService.getSkills();
  }
}
