import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Login da Guilda | Nightmare",
  description: "Area de login para as ferramentas de guilda Nightmare.",
};

export default function LoginPage() {
  return <LoginPanel />;
}
