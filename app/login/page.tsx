import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Guild Login | Nightmare",
  description: "Login para o workspace modular de guildas do Nightmare.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPanel />
    </Suspense>
  );
}
