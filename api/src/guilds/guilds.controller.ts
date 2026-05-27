import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  createMvpKillSchema,
  type CreateMvpKillRequest,
} from "./guilds.schemas";
import { GuildsService } from "./guilds.service";

@Controller("guilds")
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Get(":slug/dashboard")
  getDashboard(@Param("slug") slug: string) {
    return this.guildsService.getDashboard(slug);
  }

  @Get(":slug/mvp-kills")
  getMvpEntries(@Param("slug") slug: string) {
    return this.guildsService.getMvpEntries(slug);
  }

  @Post(":slug/mvp-kills")
  createMvpKill(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(createMvpKillSchema))
    payload: CreateMvpKillRequest,
  ) {
    return this.guildsService.createMvpKill(slug, payload);
  }
}
