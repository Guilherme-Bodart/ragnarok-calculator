"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";

type AuthMode = "login" | "register";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function LoginPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        }
      } catch {
        if (isMounted) {
          setMessage("API indisponivel no momento.");
        }
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

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

      const data = (await response.json()) as {
        user?: AuthUser;
        message?: string;
      };

      if (!response.ok || !data.user) {
        setMessage(data.message ?? "Nao foi possivel autenticar.");
        return;
      }

      setUser(data.user);
      setPassword("");
      setMessage(mode === "register" ? "Conta criada." : "Login efetuado.");
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
          <span className="guild-auth-kicker">Nightmare Guild Tools</span>
          <h1>Login da guilda</h1>
          <p>
            A base da area SaaS: conta, sessao segura e um caminho separado da
            calculadora para as proximas ferramentas.
          </p>
        </div>

        <div className="guild-auth-card">
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

          {user ? (
            <div className="guild-auth-session">
              <ShieldCheck size={38} />
              <div>
                <strong>{user.name ?? user.email}</strong>
                <span>{user.email}</span>
              </div>
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

          {message && <p className="guild-auth-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}
