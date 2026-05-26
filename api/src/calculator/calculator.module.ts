import { Module } from "@nestjs/common";
import { DataModule } from "../data/data.module";
import { CalculatorController } from "./calculator.controller";
import { CalculatorService } from "./calculator.service";

@Module({
  imports: [DataModule],
  controllers: [CalculatorController],
  providers: [CalculatorService],
})
export class CalculatorModule {}
