import { db } from "@/db";
import { reports } from "@/db/schema";
import type { SensorTelemetry } from "@/schemas/sensor.schema";
import { triageCitizenReport } from "@/services/aiTriage.service";

export interface SensorNode {
  id: string;
  name: string;
  sensorType: "WATER_LEVEL_FLOOD" | "TILT_VIBRATION_TREE";
  location: string;
  latitude: number;
  longitude: number;
  currentReading: number;
  unit: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  batteryLevel: number;
  status: "NORMAL" | "WARNING" | "CRITICAL";
  lastHeartbeat: string;
  telemetryHistory: {
    timestamp: string;
    value: number;
    status: "NORMAL" | "WARNING" | "CRITICAL";
  }[];
}

// Estado em memória das estações IoT conectadas
const sensorNodes: Record<string, SensorNode> = {
  "IOT-FLD-01": {
    id: "IOT-FLD-01",
    name: "Sensor de Lâmina d'Água e Bueiro Inteligente",
    sensorType: "WATER_LEVEL_FLOOD",
    location: "Av. Aricanduva, 5400 - Ponto Crítico de Drenagem",
    latitude: -23.5684,
    longitude: -46.5187,
    currentReading: 14.5,
    unit: "cm",
    thresholds: {
      warning: 40.0,
      critical: 75.0,
    },
    batteryLevel: 94,
    status: "NORMAL",
    lastHeartbeat: new Date().toISOString(),
    telemetryHistory: [
      { timestamp: "10 min atrás", value: 12.0, status: "NORMAL" },
      { timestamp: "5 min atrás", value: 13.2, status: "NORMAL" },
      { timestamp: "Agora", value: 14.5, status: "NORMAL" },
    ],
  },
  "IOT-TLT-02": {
    id: "IOT-TLT-02",
    name: "Sensor Acelerômetro de Inclinação Arbórea / Encosta",
    sensorType: "TILT_VIBRATION_TREE",
    location: "Parque Ibirapuera / Av. Pedro Álvares Cabral",
    latitude: -23.5874,
    longitude: -46.6576,
    currentReading: 3.2,
    unit: "graus (°)",
    thresholds: {
      warning: 9.0,
      critical: 18.0,
    },
    batteryLevel: 88,
    status: "NORMAL",
    lastHeartbeat: new Date().toISOString(),
    telemetryHistory: [
      { timestamp: "10 min atrás", value: 3.0, status: "NORMAL" },
      { timestamp: "5 min atrás", value: 3.1, status: "NORMAL" },
      { timestamp: "Agora", value: 3.2, status: "NORMAL" },
    ],
  },
};

export function getAllSensors(): SensorNode[] {
  return Object.values(sensorNodes);
}

export function getSensorById(id: string): SensorNode | undefined {
  return sensorNodes[id];
}

export async function processTelemetry(telemetry: SensorTelemetry) {
  const sensor = sensorNodes[telemetry.sensorId];
  if (!sensor) return null;

  sensor.currentReading = telemetry.readingValue;
  sensor.batteryLevel = telemetry.batteryLevel;
  sensor.lastHeartbeat = telemetry.timestamp || new Date().toISOString();

  // Avaliação do status conforme os limiares técnicos
  if (sensor.currentReading >= sensor.thresholds.critical) {
    sensor.status = "CRITICAL";
  } else if (sensor.currentReading >= sensor.thresholds.warning) {
    sensor.status = "WARNING";
  } else {
    sensor.status = "NORMAL";
  }

  // Registra no histórico do nó
  sensor.telemetryHistory.push({
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    value: sensor.currentReading,
    status: sensor.status,
  });

  if (sensor.telemetryHistory.length > 10) {
    sensor.telemetryHistory.shift();
  }

  return sensor;
}

/**
 * Diferencial de Áreas Integradas:
 * Dispara automaticamente a triagem de IA com base na telemetria IoT crítica,
 * cadastrando a ocorrência de emergência urbana no mapa e no banco de dados.
 */
export async function triggerEmergencyFromSensor(
  sensorId: string,
  customValue?: number,
) {
  const sensor = sensorNodes[sensorId];
  if (!sensor) throw new Error("Sensor não encontrado.");

  const reading =
    customValue !== undefined ? customValue : sensor.thresholds.critical + 5;
  sensor.currentReading = reading;
  sensor.status = "CRITICAL";
  sensor.lastHeartbeat = new Date().toISOString();

  sensor.telemetryHistory.push({
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    value: reading,
    status: "CRITICAL",
  });

  let title = "";
  let description = "";

  if (sensor.sensorType === "WATER_LEVEL_FLOOD") {
    title = `[ALERTA IOT DEFESA CIVIL] Transbordamento Iminente em ${sensor.location}`;
    description = `Telemetria do sensor IoT ${sensor.id} detectou lâmina d'água de ${reading} cm no bueiro/córrego, ultrapassando o limiar crítico de ${sensor.thresholds.critical} cm. Risco iminente de enxurrada e interdição de tráfego de veículos e pedestres na ${sensor.location}.`;
  } else {
    title = `[ALERTA IOT DEFESA CIVIL] Risco Iminente de Queda de Árvore em ${sensor.location}`;
    description = `Telemetria do sensor acelerômetro MPU-6050 ${sensor.id} registrou inclinação anômala de ${reading}° (limiar crítico: ${sensor.thresholds.critical}°). Risco imediato de tombamento sobre fiação elétrica e via pública na ${sensor.location}.`;
  }

  // Aciona a IA para triar a emergência disparada pelo sensor
  const aiTriage = await triageCitizenReport(description, title);

  // Insere a ocorrência diretamente na tabela de chamados (Áreas Integradas)
  const [createdReport] = await db
    .insert(reports)
    .values({
      title,
      description,
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      address: sensor.location,
      imageUrl: null,
      category: aiTriage.category,
      severity: "CRITICAL", // Forçado como crítico pela telemetria do sensor
      urgencyScore: 5,
      responsibleOrgan: aiTriage.responsibleOrgan,
      status: "OPEN",
    })
    .returning();

  return {
    sensor,
    createdReport,
    aiTriage,
  };
}

export function resetSensorToNormal(sensorId: string) {
  const sensor = sensorNodes[sensorId];
  if (!sensor) return null;

  if (sensor.sensorType === "WATER_LEVEL_FLOOD") {
    sensor.currentReading = 14.2;
  } else {
    sensor.currentReading = 3.5;
  }
  sensor.status = "NORMAL";
  sensor.lastHeartbeat = new Date().toISOString();
  sensor.telemetryHistory.push({
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    value: sensor.currentReading,
    status: "NORMAL",
  });
  return sensor;
}
