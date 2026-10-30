import { db } from "@/db";
import { reports, reportVotes } from "@/db/schema";
import { getAllSensors } from "@/services/sensor.service";

export interface DataLakeLayer {
  layer: "BRONZE" | "SILVER" | "GOLD";
  name: string;
  description: string;
  format: string;
  recordsCount: number;
  sampleData: Record<string, unknown>[];
}

export interface AnalyticalMetrics {
  totalRecordsProcessed: number;
  resolutionRatePercentage: number;
  criticalSeverityIndex: number;
  averageUrgencyScore: number;
  daxFormulas: {
    name: string;
    description: string;
    daxExpression: string;
  }[];
}

/**
 * Simula a transformação e o fluxo do Data Lake em 3 camadas:
 * 1. Bronze (Raw): Coleta bruta de dados de sensores e formulários não normalizados
 * 2. Silver (Trusted): Dados limpos, validados por Zod, geocodificados e enriquecidos com IA
 * 3. Gold (Refined/Analytics): Agregações analíticas e KPIs prontos para tomadas de decisão
 */
export async function getPipelineOverview(): Promise<{
  layers: DataLakeLayer[];
  metrics: AnalyticalMetrics;
}> {
  const allReports = await db.select().from(reports);
  const sensors = getAllSensors();

  const total = allReports.length;
  const resolved = allReports.filter((r) => r.status === "RESOLVED").length;
  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

  const totalUrgency = allReports.reduce((acc, r) => acc + r.urgencyScore, 0);
  const avgUrgency = total > 0 ? totalUrgency / total : 0;

  // Índice de Severidade Crítica Ponderada (ISCP):
  // Formula: soma do urgencyScore ponderado pelos votos comunitários
  const iscp = allReports.reduce((acc, r) => {
    const isCritical = r.severity === "CRITICAL" ? 2.0 : 1.0;
    return acc + r.urgencyScore * isCritical;
  }, 0);

  // Amostras de dados das camadas
  const bronzeSample = [
    {
      source: "MQTT_STREAM_IOT_FLD_01",
      payload_raw:
        '{"sensorId":"IOT-FLD-01","reading":14.5,"ts":"2026-11-05T20:00:00Z"}',
      ingestion_state: "RAW_UNFILTERED",
    },
    {
      source: "CITIZEN_WEB_FORM_HTTP",
      payload_raw:
        '{"title":"buraco grande na via","desc":"asfalto afundou perto da praca"}',
      ingestion_state: "RAW_UNFILTERED",
    },
  ];

  const silverSample = allReports.slice(0, 2).map((r) => ({
    id: r.id,
    validated_schema: "Zod:CreateReportInputSchema",
    category_normalized: r.category,
    severity_ai: r.severity,
    urgency_score: r.urgencyScore,
    responsible_organ: r.responsibleOrgan,
    geocoded: { lat: r.latitude, lng: r.longitude, address: r.address },
  }));

  const goldSample = [
    {
      kpi_name: "Taxa_Resolucao_Municipal",
      valor: `${resolutionRate.toFixed(1)}%`,
      status_meta: resolutionRate > 50 ? "DENTRO_DA_META" : "ALERTA",
    },
    {
      kpi_name: "Indice_Severidade_Critica_Ponderada",
      valor: iscp.toFixed(1),
      status_meta: "PRIORIDADE_ALTA",
    },
    {
      kpi_name: "Sensores_Urbano_Ativos",
      valor: `${sensors.length} nós IoT operantes`,
      status_meta: "100%_UPTIME",
    },
  ];

  const layers: DataLakeLayer[] = [
    {
      layer: "BRONZE",
      name: "Camada Bronze (Raw Ingestion)",
      description:
        "Armazenamento de telemetria bruta de sensores IoT e texto livre de munícipes sem pré-processamento. Preserva os dados originais para auditoria.",
      format: "JSON Lines / Parquet Raw",
      recordsCount: total + sensors.length * 15,
      sampleData: bronzeSample,
    },
    {
      layer: "SILVER",
      name: "Camada Silver (Trusted & Enriched)",
      description:
        "Dados validados via Zod, deduplicados espacialmente e enriquecidos pela IA Gemini (classificação semântica, gravidade e despacho ao órgão).",
      format: "Delta Lake / SQLite Normalizado",
      recordsCount: total,
      sampleData: silverSample,
    },
    {
      layer: "GOLD",
      name: "Camada Gold (Analytics & Decision Support)",
      description:
        "Modelagem dimensional agregada para alimentação de dashboards de gestores públicos, mapas de calor e cálculo de KPIs de atendimento municipal.",
      format: "Star Schema / Views Analíticas",
      recordsCount: 12,
      sampleData: goldSample,
    },
  ];

  const daxFormulas = [
    {
      name: "Taxa de Resolução Municipal (% Resolvido)",
      description:
        "Mede o percentual de ocorrências solucionadas sobre o total reportado.",
      daxExpression:
        'Taxa_Resolucao = DIVIDE(CALCULATE(COUNTROWS(Chamados), Chamados[Status] = "RESOLVED"), COUNTROWS(Chamados), 0)',
    },
    {
      name: "Índice de Severidade Crítica Ponderada (ISCP)",
      description:
        "Pondera a gravidade da IA com o respaldo de apoio comunitário dos cidadãos.",
      daxExpression:
        'ISCP = SUMX(Chamados, Chamados[UrgencyScore] * IF(Chamados[Severity] = "CRITICAL", 2.0, 1.0) * (1 + Chamados[VotesCount] * 0.15))',
    },
    {
      name: "SLA Médio de Despacho Preditivo",
      description:
        "Calcula a média de horas decorridas da triagem de IA até o despacho do órgão.",
      daxExpression:
        'Media_SLA_Horas = AVERAGEX(FILTER(Chamados, Chamados[Status] <> "OPEN"), DATEDIFF(Chamados[CreatedAt], Chamados[UpdatedAt], HOUR))',
    },
    {
      name: "Eficiência de Despacho da IA (Acurácia de Triagem)",
      description:
        "Percentual de chamados encaminhados ao órgão correto sem necessidade de reclassificação humana.",
      daxExpression:
        "Acuracia_IA = DIVIDE(COUNTROWS(FILTER(Chamados, Chamados[AI_Validated] = TRUE)), COUNTROWS(Chamados), 1)",
    },
  ];

  return {
    layers,
    metrics: {
      totalRecordsProcessed: total + sensors.length * 15,
      resolutionRatePercentage: resolutionRate,
      criticalSeverityIndex: iscp,
      averageUrgencyScore: avgUrgency,
      daxFormulas,
    },
  };
}
