import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nightmare Clan",
  description:
    "Site multilíngue do clã Nightmare, uma guilda sombria de Ragnarok com alma pixel art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
