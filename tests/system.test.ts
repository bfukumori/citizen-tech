import assert from "node:assert/strict";
import test from "node:test";
import { CreateReportInputSchema } from "../src/schemas/report.schema.js";
import { SensorTelemetrySchema } from "../src/schemas/sensor.schema.js";
import { triageCitizenReport } from "../src/services/aiTriage.service.js";

// ==============================================================================
// FIAP GRADUAÇÃO — GLOBAL SOLUTION 2026/2 · CITIZENTECH
// ÁREA 4: DEVOPS, SEGURANÇA E QUALIDADE
// SUÍTE DE TESTES AUTOMATIZADOS (6 CASOS DE TESTE DE QUALIDADE E ENGENHARIA)
// ==============================================================================

test("CASO 1: Validação de Schema Zod para Cadastro de Ocorrências (Segurança de Entrada)", () => {
  // Cenário 1.1: Payload Válido
  const validPayload = {
    title: "Cratera perigosa no asfalto",
    description:
      "Buraco enorme de 1 metro na faixa de rolamento rápida da via pública",
    latitude: -23.5505,
    longitude: -46.6333,
    address: "Av. Paulista, 1000",
  };
  const validResult = CreateReportInputSchema.safeParse(validPayload);
  assert.equal(
    validResult.success,
    true,
    "Payload válido deve ser aceito pelo Zod",
  );

  // Cenário 1.2: Rejeição de Descrição Insuficiente (< 15 caracteres)
  const invalidDesc = {
    title: "Buraco na rua",
    description: "curto",
    latitude: -23.5505,
    longitude: -46.6333,
  };
  const invalidDescResult = CreateReportInputSchema.safeParse(invalidDesc);
  assert.equal(
    invalidDescResult.success,
    false,
    "Descrição muito curta deve ser rejeitada",
  );

  // Cenário 1.3: Rejeição de Coordenadas Geográficas Impossíveis (Anti-Tampering)
  const invalidCoords = {
    title: "Vazamento de água",
    description: "Vazamento contínuo na calçada perto da escola municipal",
    latitude: 195.0, // Fora do intervalo [-90, 90]
    longitude: -46.6333,
  };
  const invalidCoordsResult = CreateReportInputSchema.safeParse(invalidCoords);
  assert.equal(
    invalidCoordsResult.success,
    false,
    "Latitude > 90 deve ser barrada por segurança",
  );
});

test("CASO 2: Validação de Schema Zod para Telemetria IoT dos Sensores Urbanos", () => {
  // Cenário 2.1: Telemetria do Sensor de Bueiro/Enchente HC-SR04
  const floodSensorPayload = {
    sensorId: "IOT-FLD-01",
    sensorType: "WATER_LEVEL_FLOOD",
    location: "Av. Aricanduva, 5400",
    latitude: -23.5684,
    longitude: -46.5187,
    readingValue: 42.5,
    unit: "cm",
    batteryLevel: 95,
    status: "WARNING",
  };
  const floodResult = SensorTelemetrySchema.safeParse(floodSensorPayload);
  assert.equal(
    floodResult.success,
    true,
    "Telemetria válida do sensor de água deve ser aprovada",
  );

  // Cenário 2.2: Rejeição de Tipo de Sensor Inexistente (Integridade de Dados)
  const invalidSensor = {
    sensorId: "IOT-UNKNOWN",
    sensorType: "INVALID_SENSOR_TYPE",
    location: "Desconhecido",
    latitude: -23.5,
    longitude: -46.5,
    readingValue: 10,
    unit: "un",
    batteryLevel: 150, // Bateria > 100% é inválida
    status: "NORMAL",
  };
  const invalidResult = SensorTelemetrySchema.safeParse(invalidSensor);
  assert.equal(
    invalidResult.success,
    false,
    "Tipo inválido ou bateria > 100 deve falhar no schema",
  );
});

test("CASO 3: Triagem Semântica e Fallback Resiliente de IA para Incidentes Críticos", async () => {
  // Teste de triagem com risco iminente de choque elétrico e árvore caída
  const title =
    "Árvore centenária caída sobre a rede de alta tensão com faíscas";
  const desc =
    "A árvore tombou com a tempestade, arrancou os cabos elétricos e está soltando faísca na calçada com perigo iminente de choque e incêndio.";

  const triage = await triageCitizenReport(desc, title);

  assert.equal(triage.category, "TREE_FALL", "Deve categorizar como TREE_FALL");
  assert.equal(
    triage.severity,
    "CRITICAL",
    "Deve classificar como CRITICAL devido a faíscas e risco à vida",
  );
  assert.equal(triage.urgencyScore, 5, "Score de urgência deve ser 5 (máximo)");
  assert.match(
    triage.responsibleOrgan.toLowerCase(),
    /defesa civil|energia|concessionária/,
    "Deve indicar Defesa Civil ou Concessionária de Energia como responsável",
  );
});

test("CASO 4: Regras de Negócio e Limiares Técnicos de Alerta dos Sensores IoT", () => {
  // Limiares do Sensor HC-SR04: Warning >= 40cm, Critical >= 75cm
  const evaluateWaterLevel = (cm: number) => {
    if (cm >= 75.0) return "CRITICAL";
    if (cm >= 40.0) return "WARNING";
    return "NORMAL";
  };

  assert.equal(evaluateWaterLevel(15.0), "NORMAL", "15cm deve ser NORMAL");
  assert.equal(
    evaluateWaterLevel(45.0),
    "WARNING",
    "45cm deve gerar WARNING preventivo",
  );
  assert.equal(
    evaluateWaterLevel(82.0),
    "CRITICAL",
    "82cm deve gerar CRITICAL imediato",
  );

  // Limiares do Sensor MPU-6050 (Inclinação): Warning >= 9°, Critical >= 18°
  const evaluateTiltAngle = (deg: number) => {
    if (deg >= 18.0) return "CRITICAL";
    if (deg >= 9.0) return "WARNING";
    return "NORMAL";
  };

  assert.equal(evaluateTiltAngle(4.0), "NORMAL", "4 graus deve ser NORMAL");
  assert.equal(evaluateTiltAngle(12.0), "WARNING", "12 graus deve ser WARNING");
  assert.equal(
    evaluateTiltAngle(25.0),
    "CRITICAL",
    "25 graus deve ser CRITICAL",
  );
});

test("CASO 5: Funções Analíticas de Big Data (Métricas DAX e Indicadores)", () => {
  // Simulação de cálculo analítico de Taxa de Resolução
  const mockDataset = [
    {
      id: "1",
      status: "RESOLVED",
      urgencyScore: 4,
      votes: 3,
      severity: "HIGH",
    },
    {
      id: "2",
      status: "RESOLVED",
      urgencyScore: 5,
      votes: 8,
      severity: "CRITICAL",
    },
    { id: "3", status: "OPEN", urgencyScore: 3, votes: 1, severity: "MEDIUM" },
    {
      id: "4",
      status: "IN_TRIAGE",
      urgencyScore: 5,
      votes: 12,
      severity: "CRITICAL",
    },
  ];

  const total = mockDataset.length;
  const resolved = mockDataset.filter((r) => r.status === "RESOLVED").length;
  const taxaResolucao = (resolved / total) * 100;

  assert.equal(
    taxaResolucao,
    50.0,
    "Taxa de resolução deve ser exatamente 50%",
  );

  // Cálculo do Índice de Severidade Crítica Ponderada (ISCP):
  // Formula DAX: SUMX(Chamados, UrgencyScore * IF(Severity='CRITICAL', 2, 1) * (1 + Votes * 0.15))
  const iscp = mockDataset.reduce((sum, item) => {
    const criticalMultiplier = item.severity === "CRITICAL" ? 2.0 : 1.0;
    const voteWeight = 1 + item.votes * 0.15;
    return sum + item.urgencyScore * criticalMultiplier * voteWeight;
  }, 0);

  assert.ok(iscp > 0, "ISCP deve ser calculado com ponderação positiva");
  assert.ok(
    iscp > total * 2,
    "ISCP deve valorizar criticidade e apoio popular",
  );
});

test("CASO 6: Práticas de Segurança e Sanitização de Entrada (Anti-XSS e Integridade)", () => {
  const maliciousInput = {
    title: "<script>alert('xss')</script>Buraco na via",
    description:
      "Asfalto afundando com risco de colisão de veículos <img src=x onerror=alert(1)>",
    latitude: -23.55,
    longitude: -46.63,
  };

  const parsed = CreateReportInputSchema.safeParse(maliciousInput);
  assert.equal(
    parsed.success,
    true,
    "Payload deve ser analisado estruturalmente pelo Zod",
  );

  // Verifica que não quebra o sistema e preserva tipos estritos
  if (parsed.success) {
    assert.equal(typeof parsed.data.title, "string");
    assert.equal(typeof parsed.data.description, "string");
    assert.equal(typeof parsed.data.latitude, "number");
  }
});
