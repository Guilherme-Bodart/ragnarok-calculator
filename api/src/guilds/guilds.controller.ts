import { Body, Controller, Get, Param, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { SESSION_COOKIE_NAME } from "../auth/auth.constants";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  createGuildSchema,
  createMvpKillSchema,
  type CreateGuildRequest,
  type CreateMvpKillRequest,
} from "./guilds.schemas";
import { GuildsService } from "./guilds.service";

@Controller("guilds")
export class GuildsController {
  constructor(
    private readonly guildsService: GuildsService,
    private readonly authService: AuthService,
  ) {}

  @Get("me")
  async getCurrentContext(@Req() request: Request) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.getCurrentContext(user);
  }

  @Post()
  async createGuild(
    @Req() request: Request,
    @Body(new ZodValidationPipe(createGuildSchema)) payload: CreateGuildRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.createGuild(user, payload);
  }

  @Get(":slug/dashboard")
  async getDashboard(@Req() request: Request, @Param("slug") slug: string) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.getDashboard(user, slug);
  }

  @Get(":slug/mvp-kills")
  async getMvpEntries(@Req() request: Request, @Param("slug") slug: string) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.getMvpEntries(user, slug);
  }

  @Post(":slug/mvp-kills")
  async createMvpKill(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(createMvpKillSchema))
    payload: CreateMvpKillRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.createMvpKill(user, slug, payload);
  }

  private async getCurrentUser(request: Request) {
    const user = await this.authService.getCurrentUser(
      request.cookies?.[SESSION_COOKIE_NAME] as string | undefined,
    );

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    return user;
  }
}
