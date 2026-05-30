import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DataModule } from "../data/data.module";
import { CalculatorController } from "./calculator.controller";
import { CalculatorService } from "./calculator.service";

@Module({
  imports: [AuthModule, DataModule],
  controllers: [CalculatorController],
  providers: [CalculatorService],
})
export class CalculatorModule {}
