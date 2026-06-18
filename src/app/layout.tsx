import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuraProvider } from "@/context/AuraContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura Barber - Gestão Premium",
  description: "Sistema de gestão completo para barbearias de alto padrão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuraProvider>{children}</AuraProvider>
      </body>
    </html>
  );
}
