import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SESSION_COOKIE_NAME } from "../auth/auth.constants";
import { AuthService } from "../auth/auth.service";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CalculatorService } from "./calculator.service";
import {
  calculateDamageSchema,
  saveCalculatorBuildSchema,
  type CalculateDamageRequest,
  type SaveCalculatorBuildRequest,
} from "./calculator.schemas";

@Controller("calculator")
export class CalculatorController {
  constructor(
    private readonly authService: AuthService,
    private readonly calculatorService: CalculatorService,
  ) {}

  @Post("damage")
  calculateDamage(
    @Body(new ZodValidationPipe(calculateDamageSchema))
    payload: CalculateDamageRequest,
  ) {
    return this.calculatorService.calculateDamage(payload);
  }

  @Get("builds")
  async listBuilds(@Req() request: Request) {
    const userId = await this.getCurrentUserId(request);

    return {
      builds: await this.calculatorService.listBuilds(userId),
    };
  }

  @Post("builds")
  async createBuild(
    @Req() request: Request,
    @Body(new ZodValidationPipe(saveCalculatorBuildSchema))
    payload: SaveCalculatorBuildRequest,
  ) {
    const userId = await this.getCurrentUserId(request);

    return {
      build: await this.calculatorService.createBuild(userId, payload),
    };
  }

  @Put("builds/:buildId")
  async updateBuild(
    @Req() request: Request,
    @Param("buildId") buildId: string,
    @Body(new ZodValidationPipe(saveCalculatorBuildSchema))
    payload: SaveCalculatorBuildRequest,
  ) {
    const userId = await this.getCurrentUserId(request);

    return {
      build: await this.calculatorService.updateBuild(userId, buildId, payload),
    };
  }

  @Delete("builds/:buildId")
  async deleteBuild(
    @Req() request: Request,
    @Param("buildId") buildId: string,
  ) {
    const userId = await this.getCurrentUserId(request);

    return this.calculatorService.deleteBuild(userId, buildId);
  }

  private async getCurrentUserId(request: Request) {
    const user = await this.authService.getCurrentUser(
      request.cookies?.[SESSION_COOKIE_NAME] as string | undefined,
    );

    if (!user) {
      throw new UnauthorizedException("Login is required.");
    }

    return user.id;
  }
}
