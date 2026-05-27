import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { SESSION_TTL_MS } from "./auth.constants";
import type { LoginRequest, RegisterRequest } from "./auth.schemas";
import { PrismaService } from "../prisma/prisma.service";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(payload: RegisterRequest) {
    const passwordHash = await bcrypt.hash(payload.password, 12);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          passwordHash,
        },
        select: publicUserSelect,
      });
      const session = await this.createSession(user.id);

      return { user, session };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException("Email already registered");
      }

      throw error;
    }
  }

  async login(payload: LoginRequest) {
    const account = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        ...publicUserSelect,
        passwordHash: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      account.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const user = {
      id: account.id,
      email: account.email,
      name: account.name,
      createdAt: account.createdAt,
    };
    const session = await this.createSession(user.id);

    return { user, session };
  }

  async getCurrentUser(token: string | undefined) {
    const session = await this.findValidSession(token);

    return session?.user ?? null;
  }

  async logout(token: string | undefined) {
    if (!token) {
      return;
    }

    await this.prisma.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  private async createSession(userId: string) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.prisma.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        userId,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  private async findValidSession(token: string | undefined) {
    if (!token) {
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return session;
  }
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
