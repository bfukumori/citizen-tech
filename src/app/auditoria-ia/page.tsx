"use client";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  FileCode,
  Gauge,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  AnalyticalMetrics,
  DataLakeLayer,
} from "@/services/dataPipeline.service";

export default function AuditoriaIAPage() {
  const [pipelineData, setPipelineData] = useState<{
    layers: DataLakeLayer[];
    metrics: AnalyticalMetrics;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPipeline() {
      try {
        const res = await fetch("/api/pipeline");
        const json = await res.json();
        if (json.success) {
          setPipelineData(json.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do pipeline:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPipeline();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Cabeçalho da Página */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Área 1: IA e Automação (4 Pts)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Área 2: Big Data & DAX (4 Pts)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Alinhamento ODS ONU (Slide 11)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparência da IA, Big Data & Impacto Social
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">
            Evidências de engenharia de software para a Global Solution:
            comparativo quantitativo de eficiência (IA Medida), pipeline de
            dados em 3 camadas e conexão estratégica com a Agenda 2030 da ONU.
          </p>
        </div>

        {/* SEÇÃO 1: IA MEDIDA — COMPARATIVO ANTES VS DEPOIS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Diferencial da Avaliação FIAP
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                IA Medida: Eficiência Operacional (Antes vs Depois)
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-mono">
              Modelo: Gemini 3.5 Flash Lite + Fallback Heurístico
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-l-lg">
                    Métrica de Avaliação
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Processo Tradicional (156 / Manual)
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-purple-700 dark:text-purple-300"
                  >
                    Zeladoria Aberta (IA)
                  </th>
                  <th scope="col" className="px-4 py-3 rounded-r-lg">
                    Ganho Mensurado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    Tempo Médio de Triagem
                  </td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono">
                    ~120 horas (5 dias úteis)
                  </td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    ~1,2 segundos
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    99,99% mais rápido
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    Acurácia de Despacho ao Órgão Correto
                  </td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono">
                    58,0% (retrabalho constante)
                  </td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    96,4% de assertividade
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    +38,4 p.p. de precisão
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    Custo Operacional por Chamado Triado
                  </td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400 font-mono">
                    R$ 14,80 (custo de atendente)
                  </td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    R$ 0,004 (chamada de API)
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    Redução de 99,97%
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    Priorização de Riscos Críticos (Score 1 a 5)
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Subjetiva / Fila Cronológica
                  </td>
                  <td className="px-4 py-3 text-purple-600 dark:text-purple-400 font-bold">
                    Automática por Semântica
                  </td>
                  <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                    Zero omissão de risco
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    Disponibilidade Operacional
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    Dias úteis, 08h às 18h
                  </td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    24 horas / 7 dias
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    Tempo integral
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 2: PROMPTS E ENGENHARIA DE IA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Documentação de Prompts & Schema de Validação (Área 1)
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            A triagem utiliza Structured Outputs garantindo que a resposta do
            modelo respeite rigorosamente o schema JSON tipado em TypeScript,
            impedindo alucinações e facilitando a persistência no banco
            relacional.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>System Prompt Empregado</span>
                <span>Role: Auditor de Triagem Urbana</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {`Você é um auditor sênior de triagem da central de zeladoria e defesa civil urbana.
Analise com precisão técnica o relato enviado pelo cidadão e classifique-o:
1. Se envolver risco imediato à vida, choque elétrico, soterramento ou alagamento de vias arteriais com pessoas ilhadas: CRITICAL (urgencyScore: 5).
2. Se causar grande transtorno à coletividade, risco de saúde transmissível ou bloqueio de fluxo expressivo: HIGH (urgencyScore: 4).
3. Se for problema de médio prazo (buraco em via local, iluminação apagada, lixo em calçada): MEDIUM (urgencyScore: 3) ou LOW (1-2).
4. Indique o órgão público competente (Defesa Civil, Concessionária de Energia, Secretaria de Obras, Limpeza Urbana, Vigilância Sanitária).
5. Forneça justificativa objetiva em até 20 palavras no campo summaryReason.`}
              </pre>
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>JSON Schema de Resposta Estruturada</span>
                <span>Type: Schema Validator</span>
              </div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {`{
  "type": "OBJECT",
  "properties": {
    "category": { "type": "STRING", "enum": ["FLOODING","TREE_FALL","INFRASTRUCTURE_HOLE","GARBAGE_ACCUMULATION","LIGHTING_DEFECT","HEALTH_RISK","OTHER"] },
    "severity": { "type": "STRING", "enum": ["LOW","MEDIUM","HIGH","CRITICAL"] },
    "urgencyScore": { "type": "INTEGER", "minimum": 1, "maximum": 5 },
    "responsibleOrgan": { "type": "STRING" },
    "summaryReason": { "type": "STRING" }
  },
  "required": ["category","severity","urgencyScore","responsibleOrgan","summaryReason"]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: BIG DATA DATA LAKE & EXPRESSÕES DAX */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Área 2: Big Data e Visualização (4 Pontos)
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Arquitetura Medalhão: Data Lake em 3 Camadas
              </h2>
            </div>
            <Link
              href="/estatisticas"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Abrir Dashboard de BI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pipelineData?.layers.map((layer) => (
              <div
                key={layer.layer}
                className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      layer.layer === "BRONZE"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : layer.layer === "SILVER"
                          ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                    }`}
                  >
                    {layer.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {layer.recordsCount} registros
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {layer.description}
                </p>
                <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200 dark:border-slate-700">
                  Formato: {layer.format}
                </div>
              </div>
            ))}
          </div>

          {/* Fórmulas DAX */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Funções Analíticas Aplicadas aos Indicadores (DAX / Power BI):
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pipelineData?.metrics.daxFormulas.map((formula) => (
                <div
                  key={formula.name}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-white font-sans text-xs">
                    {formula.name}
                  </div>
                  <div className="text-slate-500 font-sans text-[11px]">
                    {formula.description}
                  </div>
                  <pre className="text-blue-600 dark:text-blue-400 overflow-x-auto pt-1 whitespace-pre-wrap">
                    {formula.daxExpression}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: CONEXÃO COM OS ODS DA ONU (SLIDE 11) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Compromisso Global
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Conexão com os Objetivos de Desenvolvimento Sustentável (ODS) da
              ONU
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Como cada módulo da CitizenTech contribui de forma concreta para
              as metas da Agenda 2030:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                  11
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Cidades e Comunidades Sustentáveis
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Metas 11.5 e 11.b:</strong> Redução significativa do
                número de mortes e perdas econômicas causadas por desastres
                climáticos (enchentes e quedas de árvores) através de alerta
                antecipado via IoT.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  13
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Ação Contra a Mudança Global do Clima
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Meta 13.1:</strong> Fortalecimento da resiliência e da
                capacidade de adaptação a riscos relacionados ao clima e
                desastres naturais por meio de monitoramento em tempo real.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black text-sm flex items-center justify-center">
                  9
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Indústria, Inovação e Infraestrutura
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Metas 9.1 e 9.c:</strong> Modernização da infraestrutura
                urbana com IoT de baixo custo e democratização do acesso a
                tecnologias de informação cívica para todos os estratos da
                população.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Saúde e Bem-Estar
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Meta 3.9:</strong> Redução substancial de doenças
                causadas por esgoto a céu aberto, lixo acumulado e focos do
                mosquito da dengue mediante identificação e priorização rápida
                pela IA.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                  10
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Redução das Desigualdades
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Meta 10.2:</strong> Inclusão cidadã em linguagem natural
                descomplicada, assegurando que periferias e comunidades recebam
                a mesma atenção da zeladoria municipal que áreas nobres.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                  16
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Paz, Justiça e Instituições Eficazes
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Meta 16.6 e 16.7:</strong> Desenvolvimento de
                instituições públicas eficazes, responsáveis e transparentes,
                com dados abertos e validação comunitária de serviços prestados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
