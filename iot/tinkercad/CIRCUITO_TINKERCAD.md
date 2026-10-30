# 📡 Guia de Montagem e Simulação IoT no TinkerCad Circuits

> **FIAP — Global Solution 2026/2 · CitizenTech**  
> **Área 3: MVP, IoT e Experiência Digital**  
> **Tema:** Nó de Monitoramento Preventivo de Enchentes e Queda de Árvores

---

## 1. Visão Geral da Arquitetura IoT

O nó de sensoriamento da **Zeladoria Aberta** foi projetado para monitorar pontos críticos das cidades em tempo real, integrando telemetria de campo ao pipeline de dados (Big Data) e à triagem inteligente por Inteligência Artificial (Google Gemini).

```
   [Sensores de Campo]                [Microcontrolador]               [Nuvem / CitizenTech API]
 ┌──────────────────────┐           ┌───────────────────┐             ┌─────────────────────────┐
 │ HC-SR04 (Ultrassom)  │ ────────► │    Arduino Uno /  │ ──────────► │ POST /api/sensors       │
 │ Nível d'Água Bueiro  │           │    ESP32 DevKit   │  (JSON /    │ Triagem Automática IA   │
 ├──────────────────────┤           │                   │   Serial /  │ e Despacho Defesa Civil │
 │ MPU-6050 / Potenc.   │ ────────► │ Atuadores locais: │   Wi-Fi)    └─────────────────────────┘
 │ Inclinação Arbórea   │           │ LEDs + Buzzer     │                          │
 └──────────────────────┘           └───────────────────┘                          ▼
                                                                      ┌─────────────────────────┐
                                                                      │ Mapa Cívico & Dashboard │
                                                                      └─────────────────────────┘
```

---

## 2. Lista de Componentes do Circuito (BOM - Bill of Materials)

|  Item  | Componente                                    | Quantidade | Função no Projeto                                                         |
| :----: | :-------------------------------------------- | :--------: | :------------------------------------------------------------------------ |
| **1**  | **Arduino Uno R3 / ESP32**                    |   1 un.    | Unidade central de processamento e leitura dos sinais.                    |
| **2**  | **Sensor Ultrassônico HC-SR04**               |   1 un.    | Mede o nível da lâmina d'água no bueiro/córrego (prevenção de enchentes). |
| **3**  | **Sensor de Inclinação / Potenciômetro 10kΩ** |   1 un.    | Simula a angulação e estabilidade mecânica de árvores de grande porte.    |
| **4**  | **LED Verde (5mm)**                           |   1 un.    | Indicador visual de telemetria dentro dos parâmetros normais.             |
| **5**  | **LED Amarelo (5mm)**                         |   1 un.    | Indicador visual de estado de atenção (nível de alerta preventivo).       |
| **6**  | **LED Vermelho (5mm)**                        |   1 un.    | Indicador visual de emergência crítica (disparo de alarme).               |
| **7**  | **Buzzer Piezoelétrico**                      |   1 un.    | Alarme sonoro local para alertar munícipes nas proximidades do risco.     |
| **8**  | **Resistores 220Ω**                           |   3 un.    | Limitação de corrente para os LEDs de sinalização.                        |
| **9**  | **Protoboard (Breadboard)**                   |   1 un.    | Barramento de interconexão dos componentes sem solda.                     |
| **10** | **Cabos Jumper (Macho-Macho)**                |  ~15 un.   | Conexões de dados, 5V e GND.                                              |

---

## 3. Mapeamento de Pinos e Ligações (Pinout)

### A. Sensor Ultrassônico HC-SR04

- **VCC**: Conectado à linha de **5V** da protoboard.
- **GND**: Conectado ao **GND** da protoboard.
- **TRIG (Disparo)**: Conectado ao pino digital **D9** do Arduino.
- **ECHO (Eco)**: Conectado ao pino digital **D10** do Arduino.

### B. Sensor de Inclinação (Potenciômetro no TinkerCad)

- **Terminal 1**: Conectado ao **GND**.
- **Terminal 2 (Wiper/Sinal)**: Conectado ao pino analógico **A0** do Arduino.
- **Terminal 3**: Conectado ao **5V**.

### C. Atuadores e Sinalização

- **LED Verde**: Ânodo conectado ao pino **D11** através de resistor de 220Ω; Cátodo ao **GND**.
- **LED Amarelo**: Ânodo conectado ao pino **D12** através de resistor de 220Ω; Cátodo ao **GND**.
- **LED Vermelho**: Ânodo conectado ao pino **D13** através de resistor de 220Ω; Cátodo ao **GND**.
- **Buzzer**: Terminal positivo ao pino **D8**; Terminal negativo ao **GND**.

---

## 4. Passo a Passo para Montagem e Teste no TinkerCad

1. Acesse o **[Autodesk TinkerCad](https://www.tinkercad.com/)** e faça login na sua conta.
2. No menu lateral, clique em **Designs** > **Criar** > **Circuito**.
3. No painel de componentes à direita, arraste para a área de trabalho:
   - 1 placa **Arduino Uno R3**;
   - 1 **Protoboard Pequena**;
   - 1 **Sensor de Distância Ultrassônico HC-SR04 (4 pinos)**;
   - 1 **Potenciômetro** (simulando a inclinação do sensor MPU-6050);
   - 3 **LEDs** (Verde, Amarelo, Vermelho);
   - 3 **Resistores de 220Ω**;
   - 1 **Buzzer piezoelétrico**.
4. Realize a fiação conforme o mapeamento da **Seção 3**.
5. Clique no botão **Código** (Code), altere o modo de blocos para **Texto** (C++).
6. Copie todo o código contido no arquivo `iot/arduino/zeladoria_iot_sensores.ino` e cole no editor do TinkerCad.
7. Clique em **Iniciar Simulação** (Start Simulation).
8. Abra o **Monitor Serial** (Serial Monitor) na parte inferior do editor:
   - Ajuste o valor do potenciômetro para alterar o ângulo de inclinação;
   - Clique no sensor ultrassônico para arrastar o objeto e variar a distância;
   - Observe a saída serial transmitindo os payloads JSON formatados:

     ```json
     {"sensorId":"IOT-FLD-01","sensorType":"WATER_LEVEL_FLOOD","readingValue":14.5,"unit":"cm","status":"NORMAL","batteryLevel":95}
     {"sensorId":"IOT-TLT-02","sensorType":"TILT_VIBRATION_TREE","readingValue":3.2,"unit":"graus","status":"NORMAL","batteryLevel":88}
     ```
   - Ao ultrapassar os limiares críticos, observe o LED vermelho acender e o alarme do Buzzer soar!

---

## 5. Integração com a Plataforma Web

No aplicativo web da **Zeladoria Aberta**, os dados deste circuito são visualizados e simulados na tela `/sensores`, permitindo que avaliadores e gestores públicos testem o acionamento em tempo real sem a obrigatoriedade de ter o hardware físico conectado durante a avaliação da banca.
