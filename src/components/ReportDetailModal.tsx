"use client";

import {
  AlertTriangle,
  Building2,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants";
import type { ReportItem } from "./Map/CitizenMap";

interface ReportDetailModalProps {
  report: ReportItem | null;
  onClose: () => void;
  onVoteChange?: (reportId: string, newVotesCount: number) => void;
}

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

export function ReportDetailModal({
  report,
  onClose,
  onVoteChange,
}: ReportDetailModalProps) {
  const [votesCount, setVotesCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    if (report) {
      setVotesCount(report._count?.votes ?? 0);
      const stored = getStoredVotes();
      setHasVoted(stored.has(report.id));
    }
  }, [report]);

  // Fecha o modal ao pressionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!report) return null;

  const sevConfig = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
  const catLabel = CATEGORY_LABELS[report.category] || report.category;
  const catColor = CATEGORY_COLORS[report.category] || CATEGORY_COLORS.OTHER;
  const statusInfo = STATUS_CONFIG[report.status] || {
    label: report.status,
    badgeClass: "bg-slate-100 text-slate-700",
  };

  const formattedDate = new Date(report.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleVote = async () => {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-report-title"
      aria-describedby="modal-report-desc"
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      {/* Container do Modal */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${statusInfo.badgeClass}`}
              >
                {statusInfo.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                #{report.id.substring(0, 8)}
              </span>
            </div>
            <h2
              id="modal-report-title"
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug"
            >
              {report.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes da ocorrência"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Avaliação e Triagem por IA */}
        <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50/60 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            Classificação Inteligente (Google Gemini)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Categoria:</span>
              <span
                className={`inline-block font-semibold px-2.5 py-1 rounded-md border ${catColor.bg} ${catColor.text} ${catColor.border}`}
              >
                {catLabel}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-0.5">
                Severidade & Urgência:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold border ${sevConfig.badgeClass}`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {sevConfig.label} ({report.urgencyScore}/5)
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 block mb-0.5">
                Órgão Público Competente:
              </span>
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{report.responsibleOrgan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição Completa */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Relato do Munícipe
          </h3>
          <p
            id="modal-report-desc"
            className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
          >
            {report.description}
          </p>
        </div>

        {/* Imagem da Ocorrência (se houver) */}
        {report.imageUrl && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Registro Fotográfico
            </h3>
            <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <Image
                src={report.imageUrl}
                alt={`Fotografia da ocorrência: ${report.title}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Geolocalização e Endereço */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Localização Georreferenciada
          </h3>

          {report.address && (
            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <MapPin
                className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{report.address}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-500 font-mono">
            <Compass
              className="w-4 h-4 text-slate-400 shrink-0"
              aria-hidden="true"
            />
            <span>
              Lat: {report.latitude.toFixed(6)}, Lng:{" "}
              {report.longitude.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 pt-1">
            <Calendar
              className="w-4 h-4 text-slate-400 shrink-0"
              aria-hidden="true"
            />
            <span>Registrado em: {formattedDate}</span>
          </div>
        </div>

        {/* Rodapé com Botão de Apoio */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleVote}
            disabled={isVoting}
            aria-pressed={hasVoted}
            aria-label={
              hasVoted
                ? `Você apoiou este chamado. Total de ${votesCount} apoios.`
                : `Apoiar este chamado. Total de ${votesCount} apoios.`
            }
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              hasVoted
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
                : "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <ThumbsUp
              aria-hidden="true"
              className={`w-4 h-4 ${hasVoted ? "fill-white" : ""}`}
            />
            <span>
              {hasVoted ? "Você apoiou" : "Apoiar este chamado"} ({votesCount})
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
