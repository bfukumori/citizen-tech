/*
  =============================================================================
  FIAP GRADUAÇÃO — GLOBAL SOLUTION 2026/2 · CITIZENTECH
  ÁREA 3: MVP, IOT E EXPERIÊNCIA DIGITAL
  PROJETO: ZELADORIA ABERTA — NÓ DE SENSORES URBANOS INTELIGENTES
  =============================================================================
  Hardware Suportado: ESP32 DevKit v1 / Arduino Uno + Módulo Ethernet/Wi-Fi
  Simulador Compatível: Autodesk TinkerCad Circuits / Wokwi Simulator

  Sensores Integrados:
    1. Sensor Ultrassônico (HC-SR04): Medição do nível de lâmina d'água em bueiros
       e calhas urbanas para prevenção antecipada de enchentes (ODS 11 e 13).
    2. Sensor Acelerômetro/Giroscópio (MPU-6050 ou Potenciômetro Analógico de Inclinação):
       Detecção de inclinação em maciços arbóreos e estabilidade de encostas (ODS 11 e 9).
    3. Atuadores de Sinalização:
       - LED Verde (Pin 11): Status Normal
       - LED Amarelo (Pin 12): Status de Atenção (Warning)
       - LED Vermelho (Pin 13) + Buzzer (Pin 8): Alerta Crítico Emergencial
  =============================================================================
*/

#include <Wire.h>

// Definição de Pinos - Sensor Ultrassônico HC-SR04
const int PIN_TRIG = 9;
const int PIN_ECHO = 10;

// Definição de Pinos - Sensor de Inclinação (TinkerCad: Potenciômetro A0 / MPU-6050)
const int PIN_TILT_ANALOG = A0;

// Pinos de Atuadores (LEDs e Alarme Sonoro)
const int PIN_LED_NORMAL = 11;
const int PIN_LED_WARNING = 12;
const int PIN_LED_CRITICAL = 13;
const int PIN_BUZZER = 8;

// Parâmetros e Limiares Técnicos de Alerta
const float WATER_LEVEL_WARNING_CM = 40.0;   // A partir de 40cm d'água -> Atenção
const float WATER_LEVEL_CRITICAL_CM = 75.0;  // Acima de 75cm d'água -> Crítico / Enchente
const float TILT_WARNING_DEG = 9.0;          // A partir de 9 graus de inclinação -> Atenção
const float TILT_CRITICAL_DEG = 18.0;        // Acima de 18 graus -> Risco de Queda Iminente

// Identificadores dos Nós IoT
const char* SENSOR_ID_FLOOD = "IOT-FLD-01";
const char* SENSOR_ID_TILT = "IOT-TLT-02";

void setup() {
  Serial.begin(9600);
  while (!Serial) { ; } // Aguarda inicialização da porta serial

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  pinMode(PIN_LED_NORMAL, OUTPUT);
  pinMode(PIN_LED_WARNING, OUTPUT);
  pinMode(PIN_LED_CRITICAL, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Teste inicial dos atuadores (Self-check de inicialização)
  digitalWrite(PIN_LED_NORMAL, HIGH);
  digitalWrite(PIN_LED_WARNING, HIGH);
  digitalWrite(PIN_LED_CRITICAL, HIGH);
  delay(500);
  digitalWrite(PIN_LED_NORMAL, LOW);
  digitalWrite(PIN_LED_WARNING, LOW);
  digitalWrite(PIN_LED_CRITICAL, LOW);

  Serial.println(F("{\"system\": \"Zeladoria Aberta IoT\", \"status\": \"INITIALIZED\", \"ready\": true}"));
}

// Função para medir distância via Sensor HC-SR04 e calcular nível de água
float readWaterLevelCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000); // Timeout 30ms (~5 metros)
  if (duration == 0) return 0.0;

  // Distância do sensor ao fundo/água em cm: velocidade do som = 0.0343 cm/us
  float distanceCm = (duration * 0.0343) / 2.0;

  // Altura total do canal/bueiro calibrada em 100cm
  // Lâmina d'água = Altura Total - Distância medida até o topo da água
  float waterLevel = 100.0 - distanceCm;
  if (waterLevel < 0.0) waterLevel = 0.0;
  return waterLevel;
}

// Função para ler inclinação (graus) via A0 ou módulo MPU-6050
float readTiltDegrees() {
  int sensorValue = analogRead(PIN_TILT_ANALOG);
  // Converte leitura ADC (0 - 1023) para ângulo de inclinação de 0° a 45°
  float tiltAngle = (sensorValue / 1023.0) * 45.0;
  return tiltAngle;
}

void loop() {
  float waterLevel = readWaterLevelCm();
  float tiltAngle = readTiltDegrees();

  String floodStatus = "NORMAL";
  String tiltStatus = "NORMAL";
  bool isCritical = false;
  bool isWarning = false;

  // Avaliação do Sensor de Bueiro / Enchente
  if (waterLevel >= WATER_LEVEL_CRITICAL_CM) {
    floodStatus = "CRITICAL";
    isCritical = true;
  } else if (waterLevel >= WATER_LEVEL_WARNING_CM) {
    floodStatus = "WARNING";
    isWarning = true;
  }

  // Avaliação do Sensor de Inclinação de Árvore
  if (tiltAngle >= TILT_CRITICAL_DEG) {
    tiltStatus = "CRITICAL";
    isCritical = true;
  } else if (tiltAngle >= TILT_WARNING_DEG) {
    tiltStatus = "WARNING";
    isWarning = true;
  }

  // Controle dos LEDs e Alarme
  if (isCritical) {
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_LED_WARNING, LOW);
    digitalWrite(PIN_LED_CRITICAL, HIGH);
    tone(PIN_BUZZER, 1000, 200); // Beep de alerta crítico
  } else if (isWarning) {
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_LED_WARNING, HIGH);
    digitalWrite(PIN_LED_CRITICAL, LOW);
    noTone(PIN_BUZZER);
  } else {
    digitalWrite(PIN_LED_NORMAL, HIGH);
    digitalWrite(PIN_LED_WARNING, LOW);
    digitalWrite(PIN_LED_CRITICAL, LOW);
    noTone(PIN_BUZZER);
  }

  // Transmissão da Telemetria no Formato JSON padrão compatível com a API da CitizenTech
  // Pacote Sensor 1 (Lâmina d'Água)
  Serial.print(F("{\"sensorId\":\""));
  Serial.print(SENSOR_ID_FLOOD);
  Serial.print(F("\",\"sensorType\":\"WATER_LEVEL_FLOOD\",\"readingValue\":"));
  Serial.print(waterLevel, 1);
  Serial.print(F(",\"unit\":\"cm\",\"status\":\""));
  Serial.print(floodStatus);
  Serial.print(F("\",\"batteryLevel\":95}\n"));

  delay(200);

  // Pacote Sensor 2 (Inclinação Arbórea)
  Serial.print(F("{\"sensorId\":\""));
  Serial.print(SENSOR_ID_TILT);
  Serial.print(F("\",\"sensorType\":\"TILT_VIBRATION_TREE\",\"readingValue\":"));
  Serial.print(tiltAngle, 1);
  Serial.print(F(",\"unit\":\"graus\",\"status\":\""));
  Serial.print(tiltStatus);
  Serial.print(F("\",\"batteryLevel\":88}\n"));

  // Aguarda 3 segundos para o próximo ciclo de amostragem
  delay(3000);
}
