import { Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CalculatorService } from "./calculator.service";
import {
  calculateDamageSchema,
  type CalculateDamageRequest,
} from "./calculator.schemas";

@Controller("calculator")
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post("damage")
  calculateDamage(
    @Body(new ZodValidationPipe(calculateDamageSchema))
    payload: CalculateDamageRequest,
  ) {
    return this.calculatorService.calculateDamage(payload);
  }
}
