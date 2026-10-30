import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Zeladoria Aberta | Citizen Tech com IA Gemini",
  description:
    "Plataforma de crowdsourcing cívico e zeladoria urbana com categorização e severidade automatizadas via Google Gemini API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:font-semibold focus:shadow-lg focus:outline-hidden"
        >
          Pular para o conteúdo principal
        </a>
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 flex flex-col focus:outline-hidden"
        >
          {children}
        </main>
        <footer className="py-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Zeladoria Aberta — Global Solution FIAP (Citizen Tech)</span>
            <span>
              Inteligência Artificial por Google Gemini API • Drizzle & SQLite
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
