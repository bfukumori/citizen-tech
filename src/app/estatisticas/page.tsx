"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReportItem } from "@/components/Map/CitizenMap";
import {
  CATEGORY_LABELS,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from "@/lib/constants";

interface StatsData {
  metrics: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
    totalCommunityEndorsements: number;
    resolutionRate: number;
  };
  byCategory: { category: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
  topOrgans: { organ: string; count: number }[];
}

export default function EstatisticasPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentReports, setRecentReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resReports] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/reports"),
      ]);

      const dataStats = await resStats.json();
      const dataReports = await resReports.json();

      if (dataStats.success) {
        setStats(dataStats.data);
      }
      if (dataReports.success) {
        setRecentReports(dataReports.data);
      }
    } catch (error) {
      console.error("Erro ao carregar indicadores:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      setUpdatingId(reportId);
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Atualiza estado local
        setRecentReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: newStatus } : r,
          ),
        );
        loadData();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">
            Consolidando métricas de inteligência cívica...
          </p>
        </div>
      </div>
    );
  }

  const m = stats?.metrics;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Painel de Indicadores & Governança Cívica
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Métricas integradas de triagem automatizada, criticidade e tempo de
            resposta municipal.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          aria-label="Atualizar métricas e indicadores de dados"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Atualizar Dados
        </button>
      </div>

      {/* Grid de Cards de Métricas Principais */}
      {m && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Registrado
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {m.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Ocorrências auditadas
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Chamados Ativos
              </span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400">
              {m.open}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Em atendimento / triagem
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Risco Crítico
              </span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-black text-red-600 dark:text-red-400">
              {m.critical}
            </div>
            <div className="text-[11px] text-red-500/80 mt-1">
              Exigem ação imediata
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Apoio Popular
              </span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {m.totalCommunityEndorsements}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Votos de vizinhos afetados
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Taxa de Resolução
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {m.resolutionRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {m.resolved} concluídos
            </div>
          </div>
        </div>
      )}

      {/* Gráficos / Distribuições Cívicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Categoria */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Ocorrências por Categoria
          </h3>
          <div className="space-y-3">
            {stats?.byCategory.map((item) => {
              const label = CATEGORY_LABELS[item.category] || item.category;
              const total = m?.total || 1;
              const percentage = Math.round((item.count / total) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="truncate">{label}</span>
                    <span className="font-bold">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Categoria ${label}: ${percentage}%`}
                    className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                  >
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribuição por Severidade */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Gravidade Avaliada pelo Gemini
          </h3>
          <div className="space-y-3">
            {stats?.bySeverity.map((item) => {
              const config =
                SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.LOW;
              const total = m?.total || 1;
              const percentage = Math.round((item.count / total) * 100);
              return (
                <div key={item.severity} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span
                      className="font-bold"
                      style={{ color: config.markerColor }}
                    >
                      {config.label}
                    </span>
                    <span>
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Severidade ${config.label}: ${percentage}%`}
                    className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.markerColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Órgãos Públicos Mais Demandados */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Órgãos Mais Acionados
          </h3>
          <div className="space-y-3">
            {stats?.topOrgans.map((item) => (
              <div
                key={item.organ}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.organ}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {item.count} chamados
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela Operacional de Chamados & Despacho de Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Gestão de Fluxo Operacional das Ocorrências
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simule a evolução do protocolo da Defesa Civil / Subprefeitura
              alterando o status em tempo real.
            </p>
          </div>

          {/* Filtros para Apoio à Tomada de Decisão do Gestor */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">
                Gravidade:
              </span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">Todas as Gravidades</option>
                <option value="CRITICAL">Apenas Crítico</option>
                <option value="HIGH">Apenas Alto</option>
                <option value="MEDIUM">Apenas Médio</option>
                <option value="LOW">Apenas Baixo</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">
                Status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">Todos os Status</option>
                <option value="OPEN">Aberto</option>
                <option value="IN_TRIAGE">Em Triagem</option>
                <option value="FORWARDED_TO_AUTHORITY">Encaminhado</option>
                <option value="RESOLVED">Resolvido</option>
              </select>
            </div>

            <Link
              href="/"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 ml-2"
            >
              Mapa <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm"
            aria-label="Tabela de acompanhamento operacional e alteração de status de chamados"
          >
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-4">
                  Ocorrência
                </th>
                <th scope="col" className="py-3 px-4">
                  Severidade (IA)
                </th>
                <th scope="col" className="py-3 px-4">
                  Órgão Destino
                </th>
                <th scope="col" className="py-3 px-4">
                  Apoio Popular
                </th>
                <th scope="col" className="py-3 px-4">
                  Status Atual
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Ação Operacional
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentReports
                .filter(
                  (r) =>
                    (filterSeverity === "ALL" ||
                      r.severity === filterSeverity) &&
                    (filterStatus === "ALL" || r.status === filterStatus),
                )
                .map((report) => {
                  const sevConfig =
                    SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.LOW;
                  const statusInfo = STATUS_CONFIG[report.status] || {
                    label: report.status,
                  };

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {report.title}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {report.address ||
                            `${report.latitude}, ${report.longitude}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevConfig.badgeClass}`}
                        >
                          <AlertTriangle
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                          {sevConfig.label} ({report.urgencyScore}/5)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 max-w-45 truncate">
                        {report.responsibleOrgan}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                        👥 {report._count?.votes ?? 0} apoios
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <select
                          disabled={updatingId === report.id}
                          aria-label={`Alterar status da ocorrência ${report.title}`}
                          aria-busy={updatingId === report.id}
                          value={report.status}
                          onChange={(e) =>
                            handleUpdateStatus(report.id, e.target.value)
                          }
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-50 cursor-pointer"
                        >
                          <option value="OPEN">Aberto</option>
                          <option value="IN_TRIAGE">Em Triagem</option>
                          <option value="FORWARDED_TO_AUTHORITY">
                            Encaminhado
                          </option>
                          <option value="RESOLVED">Resolvido</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
