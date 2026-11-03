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
    @Query("origin") originParam: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const apiPublicOrigin = resolveApiPublicOrigin(request);
    const clientWebOrigin = resolveClientWebOrigin(request, originParam);
    const authorization = this.authService.createGoogleAuthorization(nextPath, {
      apiPublicOrigin,
      webOrigin: clientWebOrigin,
    });

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
    const apiPublicOrigin = resolveApiPublicOrigin(request);

    try {
      const { nextPath, session, webOrigin } =
        await this.authService.signInWithGoogle({
          code,
          state,
          stateNonce: getOAuthStateNonce(request),
          apiPublicOrigin,
        });

      setSessionCookie(response, session.token, session.expiresAt);
      clearOAuthStateCookie(response);
      response.redirect(createWebRedirectUrl(nextPath, webOrigin));
    } catch {
      clearOAuthStateCookie(response);
      const fallbackWebOrigin = this.authService.extractWebOriginFromState(state);
      response.redirect(
        createWebRedirectUrl("/login?authError=google", fallbackWebOrigin),
      );
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

function isProductionEnv() {
  return (
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL)
  );
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
    secure: isProductionEnv(),
  });
}

function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    path: "/",
    sameSite: getCookieSameSite(),
    secure: isProductionEnv(),
  });
}

function setOAuthStateCookie(response: Response, nonce: string) {
  response.cookie(OAUTH_STATE_COOKIE_NAME, nonce, {
    httpOnly: true,
    maxAge: OAUTH_STATE_TTL_MS,
    path: "/api/auth/google/callback",
    sameSite: "lax",
    secure: isProductionEnv(),
  });
}

function clearOAuthStateCookie(response: Response) {
  response.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    path: "/api/auth/google/callback",
    sameSite: "lax",
    secure: isProductionEnv(),
  });
}

function getCookieSameSite() {
  return isProductionEnv() ? "none" : "lax";
}

function resolveApiPublicOrigin(request: Request): string | undefined {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.trim().replace(/\/+$/, "");
  }

  const host = (
    request.get("x-forwarded-host") ||
    request.get("host") ||
    ""
  )
    .split(",")[0]
    .trim();

  if (!host) {
    return undefined;
  }

  const forwardedProto = (request.get("x-forwarded-proto") || "")
    .split(",")[0]
    .trim();
  const proto =
    forwardedProto ||
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}

function resolveClientWebOrigin(
  request: Request,
  originParam?: string,
): string | undefined {
  const candidates = [
    originParam,
    request.get("origin"),
    extractOriginFromUrl(request.get("referer")),
    process.env.WEB_ORIGIN,
    process.env.FRONTEND_URL,
  ];

  for (const candidate of candidates) {
    const valid = sanitizeWebOrigin(candidate);
    if (valid && !isLocalhostOrigin(valid)) {
      return valid;
    }
  }

  for (const candidate of candidates) {
    const valid = sanitizeWebOrigin(candidate);
    if (valid) {
      return valid;
    }
  }

  return undefined;
}

function extractOriginFromUrl(urlStr?: string): string | undefined {
  if (!urlStr) return undefined;
  try {
    return new URL(urlStr).origin;
  } catch {
    return undefined;
  }
}

function sanitizeWebOrigin(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.origin;
  } catch {
    return undefined;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  return origin.includes("localhost") || origin.includes("127.0.0.1");
}

function createWebRedirectUrl(path: string, preferredOrigin?: string) {
  const configuredOrigin = sanitizeWebOrigin(
    process.env.WEB_ORIGIN || process.env.FRONTEND_URL,
  );
  const candidateOrigin = sanitizeWebOrigin(preferredOrigin);

  const webOrigin =
    (configuredOrigin && !isLocalhostOrigin(configuredOrigin)
      ? configuredOrigin
      : candidateOrigin) ||
    configuredOrigin ||
    "http://localhost:3000";

  return new URL(path, webOrigin).toString();
}
