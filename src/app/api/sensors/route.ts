import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SensorTelemetrySchema } from "@/schemas/sensor.schema";
import {
  getAllSensors,
  processTelemetry,
  resetSensorToNormal,
  triggerEmergencyFromSensor,
} from "@/services/sensor.service";

export async function GET() {
  try {
    const sensors = getAllSensors();
    return NextResponse.json({
      success: true,
      count: sensors.length,
      data: sensors,
    });
  } catch (error) {
    console.error("Erro ao listar sensores:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao obter telemetria dos sensores." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificação de ação especial: simular alerta de emergência ou reset
    if (body.action === "TRIGGER_EMERGENCY") {
      const { sensorId, customValue } = body;
      const result = await triggerEmergencyFromSensor(sensorId, customValue);
      return NextResponse.json({
        success: true,
        message: "Alerta emergencial disparado via sensor e triado pela IA!",
        data: result,
      });
    }

    if (body.action === "RESET") {
      const { sensorId } = body;
      const sensor = resetSensorToNormal(sensorId);
      return NextResponse.json({
        success: true,
        message: "Sensor redefinido para parâmetros normais.",
        data: sensor,
      });
    }

    // Ingestão padrão de telemetria IoT (compatível com ESP32 / Arduino / MQTT Gateway)
    const parseResult = SensorTelemetrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload de telemetria inválido.",
          details: z.treeifyError(parseResult.error),
        },
        { status: 400 },
      );
    }

    const updatedSensor = await processTelemetry(parseResult.data);
    return NextResponse.json({
      success: true,
      message: "Telemetria recebida e processada com sucesso.",
      data: updatedSensor,
    });
  } catch (error) {
    console.error("Erro no processamento do sensor:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar operação do sensor IoT." },
      { status: 500 },
    );
  }
}
