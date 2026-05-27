import { Body, Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_TTL_MS,
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

  @Get("google")
  google(
    @Query("next") nextPath: string | undefined,
    @Res() response: Response,
  ) {
    const authorization = this.authService.createGoogleAuthorization(nextPath);

    setOAuthStateCookie(response, authorization.nonce);
    response.redirect(authorization.url);
  }

  @Get("google/callback")
  async googleCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const { nextPath, session } = await this.authService.signInWithGoogle({
        code,
        state,
        stateNonce: getOAuthStateNonce(request),
      });

      setSessionCookie(response, session.token, session.expiresAt);
      clearOAuthStateCookie(response);
      response.redirect(createWebRedirectUrl(nextPath));
    } catch {
      clearOAuthStateCookie(response);
      response.redirect(createWebRedirectUrl("/login?authError=google"));
    }
  }

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

function getOAuthStateNonce(request: Request) {
  return request.cookies?.[OAUTH_STATE_COOKIE_NAME] as string | undefined;
}

function setSessionCookie(response: Response, token: string, expiresAt: Date) {
  response.cookie(SESSION_COOKIE_NAME, token, {
    expires: expiresAt,
    httpOnly: true,
    maxAge: SESSION_TTL_MS,
    path: "/",
    sameSite: getCookieSameSite(),
    secure: process.env.NODE_ENV === "production",
  });
}

function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: getCookieSameSite(),
    secure: process.env.NODE_ENV === "production",
  });
}

function setOAuthStateCookie(response: Response, nonce: string) {
  response.cookie(OAUTH_STATE_COOKIE_NAME, nonce, {
    httpOnly: true,
    maxAge: OAUTH_STATE_TTL_MS,
    path: "/api/auth/google/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearOAuthStateCookie(response: Response) {
  response.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    path: "/api/auth/google/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function getCookieSameSite() {
  return process.env.NODE_ENV === "production" ? "none" : "lax";
}

function createWebRedirectUrl(path: string) {
  const webOrigin = process.env.WEB_ORIGIN || "http://localhost:3000";

  return new URL(path, webOrigin).toString();
}
