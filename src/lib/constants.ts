export const CATEGORY_LABELS: Record<string, string> = {
  FLOODING: "Alagamento & Drenagem",
  TREE_FALL: "Queda de Árvore & Fiação",
  INFRASTRUCTURE_HOLE: "Buraco / Via Danificada",
  GARBAGE_ACCUMULATION: "Lixo & Entulho Irregular",
  LIGHTING_DEFECT: "Iluminação Pública Apagada",
  HEALTH_RISK: "Risco Sanitário & Dengue",
  OTHER: "Outros Problemas Urbanos",
};

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  FLOODING: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  TREE_FALL: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  INFRASTRUCTURE_HOLE: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  GARBAGE_ACCUMULATION: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
  },
  LIGHTING_DEFECT: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  HEALTH_RISK: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  OTHER: {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-800",
  },
};

export const SEVERITY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; hex: string; markerColor: string }
> = {
  CRITICAL: {
    label: "Crítico",
    badgeClass:
      "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
    hex: "#dc2626",
    markerColor: "#991b1b",
  },
  HIGH: {
    label: "Alto",
    badgeClass:
      "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    hex: "#ea580c",
    markerColor: "#c2410c",
  },
  MEDIUM: {
    label: "Médio",
    badgeClass:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    hex: "#d97706",
    markerColor: "#b45309",
  },
  LOW: {
    label: "Baixo",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    hex: "#10b981",
    markerColor: "#047857",
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  OPEN: {
    label: "Aberto",
    badgeClass:
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
  },
  IN_TRIAGE: {
    label: "Em Triagem",
    badgeClass:
      "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
  },
  FORWARDED_TO_AUTHORITY: {
    label: "Encaminhado ao Órgão",
    badgeClass:
      "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
  },
  RESOLVED: {
    label: "Resolvido",
    badgeClass:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
};
