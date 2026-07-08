"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const dictionary = dictionaries[locale];
  const t = dictionary.auth;
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const visibleMessage =
    message || (searchParams.get("authError") === "google" ? t.googleError : "");

  const { data: user, isLoading: isCheckingSession } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        credentials: "include",
      });
      if (!response.ok) return null;
      const payload = await response.json() as { user: AuthUser | null };
      return payload.user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (user) {
      setMessage(t.sessionActive);
      const timer = window.setTimeout(() => {
        router.replace(nextPath);
      }, 420);
      return () => window.clearTimeout(timer);
    }
  }, [user, nextPath, router, t.sessionActive]);

  const authMutation = useMutation({
    mutationFn: async () => {
      const payload =
        mode === "register" ? { email, name, password } : { email, password };
        
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
        throw new Error(getAuthErrorMessage(data.message, t.authFailed));
      }

      return data.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["session"], data);
      setPassword("");
      setMessage(mode === "register" ? t.registered : t.loggedIn);
      router.replace(nextPath);
    },
    onError: (error: Error) => {
      setMessage(error.message || t.apiUnavailable);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["session"], null);
      setMessage(t.loggedOut);
    },
    onError: () => {
      setMessage(t.apiUnavailable);
    },
  });

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
    document.documentElement.lang = nextLocale === "pt" ? "pt-BR" : nextLocale;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    authMutation.mutate();
  }

  function handleGoogleSignIn() {
    const params = new URLSearchParams({ next: nextPath });
    window.location.assign(`${apiBaseUrl}/auth/google?${params.toString()}`);
  }

  const isLoading = authMutation.isPending || logoutMutation.isPending;

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
                onClick={() => logoutMutation.mutate()}
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
