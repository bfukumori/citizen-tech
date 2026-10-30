"use client";

import { Filter, Flame, PlusCircle, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CitizenMap } from "@/components/Map";
import type { ReportItem } from "@/components/Map/CitizenMap";
import { ReportCard } from "@/components/ReportCard";
import { ReportDetailModal } from "@/components/ReportDetailModal";
import { CATEGORY_LABELS } from "@/lib/constants";

export default function HomePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [detailReport, setDetailReport] = useState<ReportItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL")
        params.append("category", selectedCategory);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (submittedSearch.trim())
        params.append("search", submittedSearch.trim());

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Falha ao buscar chamados:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, submittedSearch]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm);
  };

  const handleVoteChange = (reportId: string, newVotesCount: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, _count: { votes: newVotesCount } } : r,
      ),
    );
    setDetailReport((prev) =>
      prev && prev.id === reportId
        ? { ...prev, _count: { votes: newVotesCount } }
        : prev,
    );
  };

  const handleOpenDetails = (report: ReportItem) => {
    setDetailReport(report);
    setSelectedReportId(report.id);
    const cardEl = document.getElementById(`report-card-${report.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Contadores rápidos para o header
  const criticalCount = useMemo(
    () =>
      reports.filter(
        (r) => r.severity === "CRITICAL" && r.status !== "RESOLVED",
      ).length,
    [reports],
  );
  const activeCount = useMemo(
    () => reports.filter((r) => r.status !== "RESOLVED").length,
    [reports],
  );

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
      {/* Banner / Header Cívico */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              Zeladoria Urbana Colaborativa & Gestão de Risco
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Monitoramento Georreferenciado em Tempo Real
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              Ocorrências reportadas pela comunidade e triadas automaticamente
              pela <strong>Google Gemini API</strong> com cálculo de severidade
              e encaminhamento ao órgão competente.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-25">
              <div className="text-2xl font-black text-white">
                {activeCount}
              </div>
              <div className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">
                Ativos
              </div>
            </div>
            <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-3 border border-red-400/30 text-center min-w-25">
              <div className="text-2xl font-black text-red-200">
                {criticalCount}
              </div>
              <div className="text-[11px] font-medium text-red-200 uppercase tracking-wider">
                Críticos
              </div>
            </div>
            <Link
              href="/novo-chamado"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Novo Chamado
            </Link>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <search
        aria-label="Filtros e busca de ocorrências"
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4"
      >
        {/* Busca textual */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <label htmlFor="search-input" className="sr-only">
            Buscar ocorrências por local ou problema
          </label>
          <input
            id="search-input"
            type="search"
            placeholder="Buscar por local ou problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
            aria-hidden="true"
          />
        </form>

        {/* Seletores de Filtro */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-1"
            aria-hidden="true"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          <label htmlFor="filter-category" className="sr-only">
            Filtrar por categoria
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todas as Categorias</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <label htmlFor="filter-status" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="OPEN">Abertos</option>
            <option value="IN_TRIAGE">Em Triagem</option>
            <option value="FORWARDED_TO_AUTHORITY">Encaminhados</option>
            <option value="RESOLVED">Resolvidos</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
              setSearchTerm("");
              setSubmittedSearch("");
            }}
            aria-label="Limpar todos os filtros e recarregar ocorrências"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </search>

      {/* Região ao vivo para leitores de tela sobre contagem de resultados */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading
          ? "Atualizando lista de ocorrências..."
          : `${reports.length} ocorrências encontradas.`}
      </div>

      {/* Grid Principal: Mapa e Lista de Ocorrências */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel do Mapa Interativo */}
        <section
          aria-label="Visualização em mapa georreferenciado"
          className="lg:col-span-7 xl:col-span-8 h-137.5 lg:h-162.5 sticky top-20"
        >
          <CitizenMap
            reports={reports}
            selectedReportId={selectedReportId}
            onSelectReport={(rep) => setSelectedReportId(rep.id)}
            onOpenDetails={handleOpenDetails}
          />
        </section>

        {/* Lista de Chamados da Comunidade */}
        <section
          aria-label="Lista de chamados da vizinhança"
          className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>Chamados da Vizinhança</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {reports.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500">
              Ordenado por Urgência IA
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center text-slate-500">
              <p className="text-sm font-medium mb-3">
                Nenhuma ocorrência encontrada com estes filtros.
              </p>
              <Link
                href="/novo-chamado"
                className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline"
              >
                <PlusCircle className="w-4 h-4" />
                Registrar primeira ocorrência
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-150 overflow-y-auto pr-1">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isSelected={selectedReportId === report.id}
                  onSelect={() => setSelectedReportId(report.id)}
                  onOpenDetails={handleOpenDetails}
                  onVoteChange={handleVoteChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      <ReportDetailModal
        report={detailReport}
        onClose={() => setDetailReport(null)}
        onVoteChange={handleVoteChange}
      />
    </div>
  );
}
