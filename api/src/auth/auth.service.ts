import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import bcrypt from "bcryptjs";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { OAUTH_STATE_TTL_MS, SESSION_TTL_MS } from "./auth.constants";
import type { LoginRequest, RegisterRequest } from "./auth.schemas";
import { PrismaService } from "../prisma/prisma.service";

const googleProvider = "google";
const googleAuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
const googleUserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  createGoogleAuthorization(nextPath: string | undefined) {
    const config = getGoogleConfig();
    const nonce = randomBytes(16).toString("base64url");
    const state = signOAuthState({
      issuedAt: Date.now(),
      nextPath: sanitizeNextPath(nextPath),
      nonce,
    });
    const authorizationUrl = new URL(googleAuthEndpoint);

    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("prompt", "select_account");
    authorizationUrl.searchParams.set("state", state);

    return {
      nonce,
      url: authorizationUrl.toString(),
    };
  }

  async signInWithGoogle(payload: {
    code: string | undefined;
    state: string | undefined;
    stateNonce: string | undefined;
  }) {
    if (!payload.code) {
      throw new UnauthorizedException("Missing Google authorization code");
    }

    const oauthState = verifyOAuthState(payload.state, payload.stateNonce);
    const tokens = await exchangeGoogleCode(payload.code);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (!profile.email_verified) {
      throw new UnauthorizedException("Google email is not verified");
    }

    const user = await this.findOrCreateGoogleUser(profile);
    const session = await this.createSession(user.id);

    return {
      nextPath: oauthState.nextPath,
      session,
      user,
    };
  }

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

    if (!account?.passwordHash) {
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

  private async findOrCreateGoogleUser(profile: GoogleProfile) {
    const linkedAccount = await this.prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: googleProvider,
          providerAccountId: profile.sub,
        },
      },
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    });

    if (linkedAccount) {
      if (profile.name && !linkedAccount.user.name) {
        return this.prisma.user.update({
          where: { id: linkedAccount.user.id },
          data: { name: profile.name },
          select: publicUserSelect,
        });
      }

      return linkedAccount.user;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
      select: publicUserSelect,
    });

    if (existingUser) {
      await this.prisma.authAccount.create({
        data: {
          provider: googleProvider,
          providerAccountId: profile.sub,
          userId: existingUser.id,
        },
      });

      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        email: profile.email.toLowerCase(),
        name: profile.name,
        accounts: {
          create: {
            provider: googleProvider,
            providerAccountId: profile.sub,
          },
        },
      },
      select: publicUserSelect,
    });
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

type OAuthStatePayload = {
  issuedAt: number;
  nextPath: string;
  nonce: string;
};

type GoogleTokenResponse = {
  access_token: string;
  token_type: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};

function getGoogleConfig() {
  return {
    clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
    clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: getRequiredEnv("GOOGLE_REDIRECT_URI"),
  };
}

function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required for Google authentication`);
  }

  return value;
}

function signOAuthState(payload: OAuthStatePayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createOAuthStateSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyOAuthState(
  state: string | undefined,
  expectedNonce: string | undefined,
): OAuthStatePayload {
  if (!state || !expectedNonce) {
    throw new UnauthorizedException("Invalid Google sign-in state");
  }

  const [encodedPayload, signature] = state.split(".");

  if (!encodedPayload || !signature) {
    throw new UnauthorizedException("Invalid Google sign-in state");
  }

  const expectedSignature = createOAuthStateSignature(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw new UnauthorizedException("Invalid Google sign-in state");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as OAuthStatePayload;

  if (
    payload.nonce !== expectedNonce ||
    Date.now() - payload.issuedAt > OAUTH_STATE_TTL_MS
  ) {
    throw new UnauthorizedException("Expired Google sign-in state");
  }

  return {
    issuedAt: payload.issuedAt,
    nextPath: sanitizeNextPath(payload.nextPath),
    nonce: payload.nonce,
  };
}

function createOAuthStateSignature(encodedPayload: string) {
  return createHmac("sha256", getRequiredEnv("GOOGLE_CLIENT_SECRET"))
    .update(encodedPayload)
    .digest("base64url");
}

async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const config = getGoogleConfig();
  const response = await fetch(googleTokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new UnauthorizedException("Google authorization failed");
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(googleUserInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new UnauthorizedException("Unable to load Google profile");
  }

  const profile = (await response.json()) as GoogleProfile;

  if (!profile.sub || !profile.email) {
    throw new UnauthorizedException("Google profile is missing required fields");
  }

  return profile;
}

function sanitizeNextPath(nextPath: string | undefined) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/guilds";
  }

  return nextPath;
}
