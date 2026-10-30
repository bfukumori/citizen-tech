"use client";

import {
  BarChart3,
  BrainCircuit,
  MapPin,
  PlusCircle,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Mapa Cívico", icon: MapPin },
    { href: "/estatisticas", label: "Indicadores Cívicos", icon: BarChart3 },
    { href: "/sensores", label: "Telemetria IoT", icon: Radio },
    { href: "/auditoria-ia", label: "Governança IA & ODS", icon: BrainCircuit },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Identidade */}
          <Link
            href="/"
            aria-label="Página inicial da plataforma Zeladoria Aberta"
            className="flex items-center gap-3 group"
          >
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform"
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Zeladoria Aberta
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles
                    className="w-3 h-3 text-blue-500"
                    aria-hidden="true"
                  />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Citizen Tech • Gestão Urbana Inteligente
              </p>
            </div>
          </Link>

          {/* Links de Navegação */}
          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-1 sm:gap-1.5 md:gap-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
                  />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}

            {/* Ação Principal: Novo Chamado */}
            <Link
              href="/novo-chamado"
              aria-current={pathname === "/novo-chamado" ? "page" : undefined}
              className={`ml-1 md:ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all shadow-sm ${
                pathname === "/novo-chamado"
                  ? "bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 shadow-blue-600/30"
                  : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-blue-600/30"
              }`}
            >
              <PlusCircle className="w-4 h-4" aria-hidden="true" />
              <span>Novo Chamado</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
