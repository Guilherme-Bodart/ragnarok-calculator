import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { GuildsController } from "./guilds.controller";
import { GuildsService } from "./guilds.service";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GuildsController],
  providers: [GuildsService],
})
export class GuildsModule {}
