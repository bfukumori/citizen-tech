"use client";

import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Cpu,
  Droplets,
  ExternalLink,
  Flame,
  Gauge,
  Layers,
  MapPin,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TreePine,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SensorNode } from "@/services/sensor.service";

export default function SensoresPage() {
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatingSensorId, setSimulatingSensorId] = useState<string | null>(
    null,
  );
  const [lastDispatchedReport, setLastDispatchedReport] = useState<{
    id: string;
    title: string;
    severity: string;
    responsibleOrgan: string;
    summaryReason: string;
  } | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sensors");
      const data = await res.json();
      if (data.success) {
        setSensors(data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar telemetria de sensores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 15000); // Polling suave a cada 15s
    return () => clearInterval(interval);
  }, [fetchSensors]);

  // Simular evento crítico ou normal
  const handleTriggerEmergency = async (
    sensorId: string,
    customValue: number,
  ) => {
    try {
      setSimulatingSensorId(sensorId);
      const res = await fetch("/api/sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRIGGER_EMERGENCY",
          sensorId,
          customValue,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLastDispatchedReport({
          id: data.data.createdReport.id,
          title: data.data.createdReport.title,
          severity: data.data.createdReport.severity,
          responsibleOrgan: data.data.createdReport.responsibleOrgan,
          summaryReason: data.data.aiTriage.summaryReason,
        });
        await fetchSensors();
      }
    } catch (err) {
      console.error("Falha ao disparar simulação de emergência:", err);
    } finally {
      setSimulatingSensorId(null);
    }
  };

  const handleResetSensor = async (sensorId: string) => {
    try {
      setSimulatingSensorId(sensorId);
      const res = await fetch("/api/sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET",
          sensorId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSensors();
      }
    } catch (err) {
      console.error("Falha ao resetar sensor:", err);
    } finally {
      setSimulatingSensorId(null);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
                Área 3: IoT e Dispositivos Inteligentes
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Áreas Integradas: IoT + IA + Big Data
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Monitoramento Urbano Preventivo IoT
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">
              Estações de sensoriamento contínuo instaladas em áreas de risco de
              São Paulo. Quando a telemetria detecta anomalias críticas, a
              Inteligência Artificial é acionada instantaneamente para triar o
              risco e notificar a Defesa Civil.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSensors}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar Telemetria
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Ver no Mapa Cívico
            </Link>
          </div>
        </div>

        {/* Notificação de Emergência Gerada via IoT + IA */}
        {lastDispatchedReport && (
          <div className="p-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl shadow-sm space-y-3 transition-all animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200">
                      Ocorrência de Emergência Gerada por IA
                    </span>
                    <span className="text-xs text-red-700 dark:text-red-300 font-mono">
                      Protocolo: #{lastDispatchedReport.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-red-900 dark:text-red-100 mt-0.5">
                    {lastDispatchedReport.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastDispatchedReport(null)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Dispensar aviso
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-red-100 dark:border-red-900/60">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Órgão Despachado:
                </span>{" "}
                <span className="text-slate-900 dark:text-white font-medium">
                  {lastDispatchedReport.responsibleOrgan}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Justificativa da IA:
                </span>{" "}
                <span className="text-slate-900 dark:text-white font-medium">
                  {lastDispatchedReport.summaryReason}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-red-700 dark:text-red-300 font-medium">
                ⚡ Incidente gravado na tabela de ocorrências e visível no Mapa
                e no Painel de Indicadores.
              </span>
              <Link
                href="/"
                className="inline-flex items-center gap-1 font-bold text-red-700 dark:text-red-300 hover:underline"
              >
                Ver no Mapa Cívico <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Grid de Sensores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sensors.map((sensor) => {
            const isFlood = sensor.sensorType === "WATER_LEVEL_FLOOD";
            const isCritical = sensor.status === "CRITICAL";
            const isWarning = sensor.status === "WARNING";
            const isSimulating = simulatingSensorId === sensor.id;

            return (
              <div
                key={sensor.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-6 shadow-xs flex flex-col justify-between ${
                  isCritical
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : isWarning
                      ? "border-amber-500"
                      : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${
                          isFlood
                            ? "bg-linear-to-br from-blue-500 to-cyan-600"
                            : "bg-linear-to-br from-emerald-600 to-teal-700"
                        }`}
                      >
                        {isFlood ? (
                          <Droplets className="w-6 h-6" />
                        ) : (
                          <TreePine className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {sensor.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                              isCritical
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                : isWarning
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCritical
                                  ? "bg-red-600 animate-ping"
                                  : isWarning
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />
                            {sensor.status === "CRITICAL"
                              ? "Crítico / Emergência"
                              : sensor.status === "WARNING"
                                ? "Atenção"
                                : "Operação Normal"}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {sensor.name}
                        </h2>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <BatteryCharging className="w-4 h-4 text-emerald-500" />
                        <span>{sensor.batteryLevel}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Wifi className="w-3.5 h-3.5 text-blue-500" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Localização */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-medium">{sensor.location}</span>
                  </div>

                  {/* Display da Leitura Atual */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {isFlood
                          ? "Lâmina d'Água Medida (HC-SR04)"
                          : "Ângulo de Inclinação (MPU-6050)"}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Limiar Crítico: {sensor.thresholds.critical}{" "}
                        {sensor.unit}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-4xl font-extrabold tracking-tight ${
                          isCritical
                            ? "text-red-600 dark:text-red-400"
                            : isWarning
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {sensor.currentReading.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {sensor.unit}
                      </span>
                    </div>

                    {/* Barra de Progresso com Limiares */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-3 relative">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCritical
                            ? "bg-red-600"
                            : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (sensor.currentReading /
                              (sensor.thresholds.critical * 1.2)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>0 {sensor.unit} (Normal)</span>
                      <span>
                        Atenção: {sensor.thresholds.warning} {sensor.unit}
                      </span>
                      <span>
                        Crítico: {sensor.thresholds.critical} {sensor.unit}
                      </span>
                    </div>
                  </div>

                  {/* Histórico Recente de Leituras */}
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                      Histórico Recente de Amostragem (Últimos ciclos):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {sensor.telemetryHistory.map((item, idx) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: simple telemetry items
                          key={idx}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-center shrink-0 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="text-[10px] text-slate-400">
                            {item.timestamp}
                          </div>
                          <div
                            className={`font-bold ${
                              item.status === "CRITICAL"
                                ? "text-red-600"
                                : item.status === "WARNING"
                                  ? "text-amber-600"
                                  : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.value.toFixed(1)} {sensor.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Painel Interativo de Simulação para Avaliadores */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Simulação Interativa de Telemetria (Avaliador / Banca):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() =>
                        handleTriggerEmergency(sensor.id, isFlood ? 85.0 : 23.5)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      {isFlood
                        ? "Simular Alagamento Crítico (85cm)"
                        : "Simular Risco Queda de Árvore (23.5°)"}
                    </button>

                    <button
                      type="button"
                      disabled={isSimulating}
                      onClick={() => handleResetSensor(sensor.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Restaurar Parâmetros Normais
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção Técnica: Detalhes do Hardware e Código Arduino */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Especificações Técnicas de Engenharia IoT (Arduino & TinkerCad)
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Arquivos no projeto:{" "}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                iot/arduino/
              </code>{" "}
              e{" "}
              <code className="text-indigo-600 dark:text-indigo-400 font-mono">
                iot/tinkercad/
              </code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-500" />
                Sensor 1: Bueiro Inteligente (HC-SR04)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mede a distância acústica até o espelho d'água dentro da
                tubulação de drenagem. A partir de 40cm entra em alerta; acima
                de 75cm aciona alarme sonoro e dispara o chamado de emergência.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <TreePine className="w-4 h-4 text-emerald-500" />
                Sensor 2: Inclinação Arbórea (MPU-6050)
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Acelerômetro e giroscópio triaxial afixado ao tronco de espécies
                centenárias. Detecta inclinações dinâmicas provocadas por
                vendavais e descalçamento radicular.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                Diferencial: Áreas Integradas
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                A telemetria alimenta o pipeline de Big Data em streaming. Em
                caso de anomalia, a IA Gemini elabora a triagem de despacho
                imediato e atualiza o mapa em tempo real sem intervenção humana
                lenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
