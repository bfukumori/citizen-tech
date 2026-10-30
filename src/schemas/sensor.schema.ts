import { z } from "zod";

export const SensorTelemetrySchema = z.object({
  sensorId: z.string().min(2, "ID do sensor é obrigatório"),
  sensorType: z.enum([
    "WATER_LEVEL_FLOOD", // Sensor Ultrassônico HC-SR04 de nível de bueiro/rio
    "TILT_VIBRATION_TREE", // Sensor Acelerômetro/Giroscópio MPU-6050 de árvores/encostas
  ]),
  location: z.string().min(3, "Localização é obrigatória"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  readingValue: z.number(), // cm d'água OU graus de inclinação
  unit: z.string(),
  batteryLevel: z.number().min(0).max(100).default(100),
  status: z.enum(["NORMAL", "WARNING", "CRITICAL"]),
  timestamp: z.string().optional(),
});

export type SensorTelemetry = z.infer<typeof SensorTelemetrySchema>;

export const TriggerSensorAlertSchema = z.object({
  sensorId: z.string(),
  forceCritical: z.boolean().default(false),
});

export type TriggerSensorAlertInput = z.infer<typeof TriggerSensorAlertSchema>;
