import type { Metadata } from "next";
import { Syne, Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-syne" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export const metadata: Metadata = {
  title: "Intepreter",
  description: "Internal feed of exceptional AI research and insight.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${archivo.variable}`}>
      <body className="min-h-screen bg-brand-bg font-sans text-brand-ink antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
