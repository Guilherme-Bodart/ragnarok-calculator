import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "./auth.constants";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  registerSchema,
  type LoginRequest,
  type RegisterRequest,
} from "./auth.schemas";
import { ZodValidationPipe } from "../common/zod-validation.pipe";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registerSchema)) payload: RegisterRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.register(payload);
    setSessionCookie(response, session.token, session.expiresAt);

    return { user };
  }

  @Post("login")
  async login(
    @Body(new ZodValidationPipe(loginSchema)) payload: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, session } = await this.authService.login(payload);
    setSessionCookie(response, session.token, session.expiresAt);

    return { user };
  }

  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(getSessionToken(request));
    clearSessionCookie(response);

    return { ok: true };
  }

  @Get("me")
  async me(@Req() request: Request) {
    const user = await this.authService.getCurrentUser(getSessionToken(request));

    return { user };
  }
}

function getSessionToken(request: Request) {
  return request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
}

function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  response.cookie(SESSION_COOKIE_NAME, token, {
    expires: expiresAt,
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
