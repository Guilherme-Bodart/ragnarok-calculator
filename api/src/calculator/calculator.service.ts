import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataService } from "../data/data.service";
import { Prisma } from "../generated/prisma/client";
import type {
  CalculateDamageRequest,
  SaveCalculatorBuildRequest,
} from "./calculator.schemas";
import { PrismaService } from "../prisma/prisma.service";
import {
  CalculatorDataError,
  CalculatorInputError,
  calculateDamageFromDataset,
  defaultRulesetContext
} from "../../../packages/calculator-core/src";

@Injectable()
export class CalculatorService {
  constructor(
    private readonly dataService: DataService,
    private readonly prisma: PrismaService,
  ) { }

  calculateDamage(payload: CalculateDamageRequest) {
    try {
      return calculateDamageFromDataset(
        {
          ...payload,
          ruleset: payload.ruleset ?? defaultRulesetContext,
        },
        {
          items: this.dataService.getItems(),
          monsters: this.dataService.getMonsters(),
          skills: this.dataService.getSkills(),
        });
    } catch (error) {
      if (error instanceof CalculatorInputError) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof CalculatorDataError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  listBuilds(userId: string) {
    return this.prisma.calculatorCharacterBuild.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: calculatorBuildSelect,
    });
  }

  async createBuild(userId: string, payload: SaveCalculatorBuildRequest) {
    const buildCount = await this.prisma.calculatorCharacterBuild.count({
      where: { userId },
    });

    if (buildCount >= 3) {
      throw new BadRequestException("O limite de 3 builds por conta foi atingido.");
    }

    return this.prisma.calculatorCharacterBuild.create({
      data: {
        userId,
        name: payload.name,
        classId: payload.classId,
        payloadJson: toPrismaJson(payload.payload),
      },
      select: calculatorBuildSelect,
    });
  }

  async updateBuild(
    userId: string,
    buildId: string,
    payload: SaveCalculatorBuildRequest,
  ) {
    await this.assertBuildOwner(userId, buildId);

    return this.prisma.calculatorCharacterBuild.update({
      where: { id: buildId },
      data: {
        name: payload.name,
        classId: payload.classId,
        payloadJson: toPrismaJson(payload.payload),
      },
      select: calculatorBuildSelect,
    });
  }

  async deleteBuild(userId: string, buildId: string) {
    await this.assertBuildOwner(userId, buildId);
    await this.prisma.calculatorCharacterBuild.delete({ where: { id: buildId } });

    return { ok: true };
  }

  private async assertBuildOwner(userId: string, buildId: string) {
    const build = await this.prisma.calculatorCharacterBuild.findFirst({
      where: {
        id: buildId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!build) {
      throw new NotFoundException("Calculator build was not found.");
    }
  }
}

const calculatorBuildSelect = {
  id: true,
  name: true,
  classId: true,
  payloadJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
