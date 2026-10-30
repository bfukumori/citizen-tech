"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

export const CitizenMap = dynamic(() => import("./CitizenMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-105 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-sm font-medium">
        Carregando mapa georreferenciado...
      </span>
    </div>
  ),
});
