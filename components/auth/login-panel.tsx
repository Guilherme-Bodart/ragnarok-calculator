"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Crown,
  Globe,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  type Locale,
} from "@/content/i18n";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { FeaturePill } from "@/components/ui/feature-pill";
import { Panel } from "@/components/ui/panel";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const localeStorageKey = "nightmare-locale";

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const dictionary = dictionaries[locale];
  const t = dictionary.auth;
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const visibleMessage =
    message || (searchParams.get("authError") === "google" ? t.googleError : "");

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { user: AuthUser | null };

        if (isMounted) {
          setUser(payload.user);
          if (payload.user) {
            setMessage(t.sessionActive);
            window.setTimeout(() => {
              router.replace(nextPath);
            }, 420);
          }
        }
      } catch {
        if (isMounted) {
          setMessage(t.apiUnavailable);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [nextPath, router, t.apiUnavailable, t.sessionActive]);

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
    document.documentElement.lang = nextLocale === "pt" ? "pt-BR" : nextLocale;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const payload =
      mode === "register" ? { email, name, password } : { email, password };

    try {
      const response = await fetch(`${apiBaseUrl}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await readJson(response)) as {
        user?: AuthUser;
        message?: string | string[];
      };

      if (!response.ok || !data.user) {
        setMessage(getAuthErrorMessage(data.message, t.authFailed));
        return;
      }

      setUser(data.user);
      setPassword("");
      setMessage(mode === "register" ? t.registered : t.loggedIn);
      router.replace(nextPath);
    } catch {
      setMessage(t.apiUnavailable);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoogleSignIn() {
    const params = new URLSearchParams({ next: nextPath });
    window.location.assign(`${apiBaseUrl}/auth/google?${params.toString()}`);
  }

  async function handleLogout() {
    setIsLoading(true);
    setMessage("");

    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setMessage(t.loggedOut);
    } catch {
      setMessage(t.apiUnavailable);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="guild-auth-page">
      <LanguageSwitcher
        locale={locale}
        onLocaleChange={handleLocaleChange}
        t={dictionary.language}
      />
      <section className="guild-auth-shell">
        <div className="guild-auth-copy">
          <Link className="guild-auth-backlink" href="/">
            {t.back}
          </Link>
          <span className="guild-auth-kicker">
            <Crown size={15} />
            {t.kicker}
          </span>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
          <div className="ui-pill-row guild-auth-feature-grid" aria-label="Guild tools">
            <FeaturePill>
              <ShieldCheck aria-hidden size={16} />
              {t.features.session}
            </FeaturePill>
            <FeaturePill>
              <Sparkles aria-hidden size={16} />
              {t.features.tools}
            </FeaturePill>
            <FeaturePill>
              <LockKeyhole aria-hidden size={16} />
              {t.features.permissions}
            </FeaturePill>
          </div>
        </div>

        <Panel className="guild-auth-card">
          <div className="guild-auth-card-header">
            <span>{t.cardKicker}</span>
            <strong>{mode === "register" ? t.registerTitle : t.loginTitle}</strong>
          </div>

          <div className="guild-auth-tabs" role="tablist" aria-label="Auth mode">
            <Button
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              icon={<LogIn size={16} />}
              onClick={() => setMode("login")}
              role="tab"
              type="button"
              variant="ghost"
            >
              {t.loginTab}
            </Button>
            <Button
              aria-selected={mode === "register"}
              className={mode === "register" ? "active" : ""}
              icon={<UserPlus size={16} />}
              onClick={() => setMode("register")}
              role="tab"
              type="button"
              variant="ghost"
            >
              {t.registerTab}
            </Button>
          </div>

          {!user && !isCheckingSession && (
            <Button
              className="guild-auth-google"
              icon={<Globe size={17} />}
              onClick={handleGoogleSignIn}
              type="button"
              variant="secondary"
            >
              {t.googleAction}
            </Button>
          )}

          {isCheckingSession ? (
            <div className="guild-auth-session" aria-live="polite">
              <Loader2 className="spin" size={34} />
              <div>
                <strong>{t.checkingTitle}</strong>
                <span>{t.checkingDescription}</span>
              </div>
            </div>
          ) : user ? (
            <div className="guild-auth-session">
              <ShieldCheck size={38} />
              <div>
                <strong>{user.name ?? user.email}</strong>
                <span>{user.email}</span>
              </div>
              <Button
                className="guild-auth-continue"
                href={nextPath}
                icon={<ArrowRight size={16} />}
              >
                {t.continueAction}
              </Button>
              <Button
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <Loader2 className="spin" size={16} />
                  ) : (
                    <LogIn size={16} />
                  )
                }
                onClick={handleLogout}
                type="button"
                variant="ghost"
              >
                {t.logoutAction}
              </Button>
            </div>
          ) : (
            <form className="guild-auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  {t.nameLabel}
                  <input
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    value={name}
                  />
                </label>
              )}
              <label>
                {t.emailLabel}
                <input
                  autoComplete="email"
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label>
                {t.passwordLabel}
                <input
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  maxLength={128}
                  minLength={mode === "register" ? 8 : 1}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              <Button
                className="guild-auth-submit"
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <Loader2 className="spin" size={17} />
                  ) : mode === "register" ? (
                    <UserPlus size={17} />
                  ) : (
                    <LogIn size={17} />
                  )
                }
                type="submit"
              >
                {mode === "register" ? t.registerAction : t.loginAction}
              </Button>
            </form>
          )}

          {visibleMessage && (
            <p className="guild-auth-message" aria-live="polite">
              {visibleMessage}
            </p>
          )}
        </Panel>
      </section>
    </main>
  );
}

function getInitialLocale() {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const savedLocale = window.localStorage.getItem(localeStorageKey);
  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.slice(0, 2);
  return isLocale(browserLocale) ? browserLocale : defaultLocale;
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getAuthErrorMessage(
  message: string | string[] | undefined,
  fallback: string,
) {
  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  return message ?? fallback;
}

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/guilds";
  }

  return next;
}
