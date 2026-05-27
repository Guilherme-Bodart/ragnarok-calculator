import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { SESSION_COOKIE_NAME } from "../auth/auth.constants";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import {
  createGuildSchema,
  createGuildRoleSchema,
  createMvpKillSchema,
  transferGuildLeadershipSchema,
  updateGuildMemberRoleSchema,
  updateGuildRoleSchema,
  updateGuildToolAccessSchema,
  type CreateGuildRequest,
  type CreateGuildRoleRequest,
  type CreateMvpKillRequest,
  type TransferGuildLeadershipRequest,
  type UpdateGuildMemberRoleRequest,
  type UpdateGuildRoleRequest,
  type UpdateGuildToolAccessRequest,
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

  @Delete(":slug")
  async deleteGuild(@Req() request: Request, @Param("slug") slug: string) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.deleteGuild(user, slug);
  }

  @Post(":slug/roles")
  async createRole(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(createGuildRoleSchema))
    payload: CreateGuildRoleRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.createRole(user, slug, payload);
  }

  @Patch(":slug/roles/:roleId")
  async updateRole(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Param("roleId") roleId: string,
    @Body(new ZodValidationPipe(updateGuildRoleSchema))
    payload: UpdateGuildRoleRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.updateRole(user, slug, roleId, payload);
  }

  @Patch(":slug/members/:memberId/role")
  async updateMemberRole(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Param("memberId") memberId: string,
    @Body(new ZodValidationPipe(updateGuildMemberRoleSchema))
    payload: UpdateGuildMemberRoleRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.updateMemberRole(user, slug, memberId, payload);
  }

  @Patch(":slug/tools/:toolId/access")
  async updateToolAccess(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Param("toolId") toolId: string,
    @Body(new ZodValidationPipe(updateGuildToolAccessSchema))
    payload: UpdateGuildToolAccessRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.updateToolAccess(user, slug, toolId, payload);
  }

  @Post(":slug/transfer-leadership")
  async transferLeadership(
    @Req() request: Request,
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(transferGuildLeadershipSchema))
    payload: TransferGuildLeadershipRequest,
  ) {
    const user = await this.getCurrentUser(request);

    return this.guildsService.transferLeadership(user, slug, payload);
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
