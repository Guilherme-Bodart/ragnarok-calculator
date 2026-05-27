import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CalculatorModule } from "./calculator/calculator.module";
import { DataModule } from "./data/data.module";
import { GuildsModule } from "./guilds/guilds.module";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, AuthModule, GuildsModule, DataModule, CalculatorModule],
  controllers: [HealthController],
})
export class AppModule {}
