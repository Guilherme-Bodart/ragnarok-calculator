import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataService } from "../data/data.service";
import type { CalculateDamageRequest } from "./calculator.schemas";
import {
  CalculatorDataError,
  CalculatorInputError,
  calculateDamageFromDataset,
  defaultRulesetContext
} from "../../../packages/calculator-core/src";

@Injectable()
export class CalculatorService {
  constructor(private readonly dataService: DataService) { }

  calculateDamage(payload: CalculateDamageRequest) {
    try {
      return calculateDamageFromDataset(
        {
          ...payload,
          ruleset: payload.ruleset ?? defaultRulesetContext,
        },
        {
          items: this.dataService.getItems(),
          monsters: this.dataService.getMonsters(),
          skills: this.dataService.getSkills(),
        });
    } catch (error) {
      if (error instanceof CalculatorInputError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof CalculatorDataError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
