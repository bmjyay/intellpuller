import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import AssistantWidget from "@/components/AssistantWidget";

export const metadata: Metadata = {
  title: "Intelpreter",
  description: "Internal feed of exceptional AI research and insight.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg font-serif text-brand-ink antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <AssistantWidget />
      </body>
    </html>
  );
}
