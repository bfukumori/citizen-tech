"use client";

import { AlertTriangle, Building2, MapPin, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants";
import type { ReportItem } from "./Map/CitizenMap";

function getCitizenId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("citizen_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("citizen_voter_id", id);
  }
  return id;
}

function getStoredVotes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("citizen_voted_reports");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredVote(reportId: string, voted: boolean) {
  if (typeof window === "undefined") return;
  try {
    const set = getStoredVotes();
    if (voted) {
      set.add(reportId);
    } else {
      set.delete(reportId);
    }
    localStorage.setItem(
      "citizen_voted_reports",
      JSON.stringify(Array.from(set)),
    );
  } catch (err) {
    console.warn("Falha ao salvar voto no localStorage:", err);
  }
}

interface ReportCardProps {
  report: ReportItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpenDetails?: (report: ReportItem) => void;
  onVoteChange?: (reportId: string, newVotesCount: number) => void;
}

export function ReportCard({
  report,
  isSelected,
  onSelect,
  onOpenDetails,
  onVoteChange,
}: ReportCardProps) {
  const [votesCount, setVotesCount] = useState(report._count?.votes ?? 0);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setVotesCount(report._count?.votes ?? 0);
  }, [report._count?.votes]);

  useEffect(() => {
    const stored = getStoredVotes();
    setHasVoted(stored.has(report.id));
  }, [report.id]);

  const sevConfig = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
  const catLabel = CATEGORY_LABELS[report.category] || report.category;
  const catColor = CATEGORY_COLORS[report.category] || CATEGORY_COLORS.OTHER;
  const statusInfo = STATUS_CONFIG[report.status] || {
    label: report.status,
    badgeClass: "bg-slate-100 text-slate-700",
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVoting) return;

    try {
      setIsVoting(true);
      const voterId = getCitizenId();
      const res = await fetch(`/api/reports/${report.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: voterId }),
      });
      const data = await res.json();
      if (data.success) {
        setVotesCount(data.totalVotes);
        setHasVoted(data.voted);
        saveStoredVote(report.id, data.voted);
        if (onVoteChange) {
          onVoteChange(report.id, data.totalVotes);
        }
      }
    } catch (error) {
      console.error("Erro ao apoiar:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <article
      id={`report-card-${report.id}`}
      aria-labelledby={`card-title-${report.id}`}
      aria-current={isSelected ? "true" : undefined}
      className={`group relative p-4 rounded-xl border transition-all bg-white dark:bg-slate-900 ${
        isSelected
          ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
      }`}
    >
      {/* Topo: Categoria + Severidade */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${catColor.bg} ${catColor.text} ${catColor.border}`}
        >
          {catLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevConfig.badgeClass} flex items-center gap-1`}
          >
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            {sevConfig.label} ({report.urgencyScore}/5)
          </span>
        </div>
      </div>

      {/* Título e Descrição */}
      <h3 id={`card-title-${report.id}`} className="mb-1">
        <button
          type="button"
          onClick={onSelect}
          className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 w-full text-sm sm:text-base cursor-pointer focus:outline-hidden"
          aria-label={`Ocorrência: ${report.title}. Selecionar e visualizar no mapa.`}
        >
          {report.title}
        </button>
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
        {report.description}
      </p>

      {/* Metadados: Endereço & Órgão */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
        {report.address && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin
              className="w-3.5 h-3.5 text-slate-400 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{report.address}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 truncate">
          <Building2
            className="w-3.5 h-3.5 text-blue-500 shrink-0"
            aria-hidden="true"
          />
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {report.responsibleOrgan}
          </span>
        </div>
      </div>

      {/* Rodapé: Status + Detalhes + Votos da Comunidade */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium px-2 py-0.5 rounded-md border text-[11px] ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </span>
          {onOpenDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(report);
              }}
              aria-label={`Ver detalhes completos de: ${report.title}`}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Ver detalhes →
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleVote}
          disabled={isVoting}
          aria-pressed={hasVoted}
          aria-label={
            hasVoted
              ? `Você apoiou esta ocorrência. Total de ${votesCount} apoios.`
              : `Apoiar ocorrência "${report.title}". Total atual: ${votesCount} apoios.`
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
            hasVoted
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-700"
          }`}
          title="Apoie esta solicitação para aumentar a visibilidade cívica"
        >
          <ThumbsUp
            aria-hidden="true"
            className={`w-3.5 h-3.5 ${hasVoted ? "fill-blue-600 text-blue-600" : ""}`}
          />
          <span>{votesCount}</span>
          <span className="hidden sm:inline">
            apoio{votesCount !== 1 ? "s" : ""}
          </span>
        </button>
      </div>
    </article>
  );
}
