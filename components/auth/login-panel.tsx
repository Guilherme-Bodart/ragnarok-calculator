"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Crown,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const nextPath = getSafeNextPath(searchParams.get("next"));

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
            setMessage("Sessao ativa. Abrindo sua guilda...");
            window.setTimeout(() => {
              router.replace(nextPath);
            }, 420);
          }
        }
      } catch {
        if (isMounted) {
          setMessage("API indisponivel no momento.");
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
  }, [nextPath, router]);

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
        setMessage(getAuthErrorMessage(data.message));
        return;
      }

      setUser(data.user);
      setPassword("");
      setMessage(
        mode === "register"
          ? "Conta criada. Abrindo sua guilda..."
          : "Login efetuado. Abrindo sua guilda...",
      );
      router.replace(nextPath);
    } catch {
      setMessage("API indisponivel no momento.");
    } finally {
      setIsLoading(false);
    }
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
      setMessage("Sessao encerrada.");
    } catch {
      setMessage("API indisponivel no momento.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="guild-auth-page">
      <section className="guild-auth-shell">
        <div className="guild-auth-copy">
          <Link className="guild-auth-backlink" href="/">
            Nightmare
          </Link>
          <span className="guild-auth-kicker">
            <Crown size={15} />
            Guild Workspace
          </span>
          <h1>Entre no centro de comando da guilda.</h1>
          <p>
            Login separado da calculadora, preparado para ferramentas de MVP,
            agenda, membros, drops e operacao da guilda.
          </p>
          <div className="guild-auth-feature-grid" aria-label="Guild tools">
            <span>
              <ShieldCheck size={16} />
              Sessao segura
            </span>
            <span>
              <Sparkles size={16} />
              Tools modulares
            </span>
            <span>
              <LockKeyhole size={16} />
              Permissoes por cargo
            </span>
          </div>
        </div>

        <div className="guild-auth-card">
          <div className="guild-auth-card-header">
            <span>Nightmare SaaS</span>
            <strong>{mode === "register" ? "Criar acesso" : "Acessar workspace"}</strong>
          </div>

          <div className="guild-auth-tabs" role="tablist" aria-label="Auth mode">
            <button
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
              role="tab"
              type="button"
            >
              <LogIn size={16} />
              Entrar
            </button>
            <button
              aria-selected={mode === "register"}
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
              role="tab"
              type="button"
            >
              <UserPlus size={16} />
              Criar conta
            </button>
          </div>

          {isCheckingSession ? (
            <div className="guild-auth-session" aria-live="polite">
              <Loader2 className="spin" size={34} />
              <div>
                <strong>Verificando sessao</strong>
                <span>Conectando ao backend da guilda.</span>
              </div>
            </div>
          ) : user ? (
            <div className="guild-auth-session">
              <ShieldCheck size={38} />
              <div>
                <strong>{user.name ?? user.email}</strong>
                <span>{user.email}</span>
              </div>
              <Link className="guild-auth-continue" href={nextPath}>
                Abrir guilda
                <ArrowRight size={16} />
              </Link>
              <button onClick={handleLogout} type="button" disabled={isLoading}>
                {isLoading ? <Loader2 className="spin" size={16} /> : <LogIn size={16} />}
                Sair
              </button>
            </div>
          ) : (
            <form className="guild-auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Nome
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
                Email
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
                Senha
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
              <button className="guild-auth-submit" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="spin" size={17} />
                ) : mode === "register" ? (
                  <UserPlus size={17} />
                ) : (
                  <LogIn size={17} />
                )}
                {mode === "register" ? "Criar conta" : "Entrar"}
              </button>
            </form>
          )}

          {message && <p className="guild-auth-message" aria-live="polite">{message}</p>}
        </div>
      </section>
    </main>
  );
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getAuthErrorMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message[0] ?? "Nao foi possivel autenticar.";
  }

  return message ?? "Nao foi possivel autenticar.";
}

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/guilds";
  }

  return next;
}
