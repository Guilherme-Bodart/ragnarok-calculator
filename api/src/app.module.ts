import { Module } from "@nestjs/common";
import { CalculatorModule } from "./calculator/calculator.module";
import { DataModule } from "./data/data.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [DataModule, CalculatorModule],
  controllers: [HealthController],
})
export class AppModule {}
