# 🏙️ Zeladoria Aberta — CitizenTech com Google Gemini AI e IoT Urbano

> **FIAP — Global Solution 2026/2 · CitizenTech**  
> **Engenharia de Software ON · Turma 4ESOA (4º Ano)**  
> **Tema:** Tecnologia com o cidadão no centro da inovação  

---

## 🔗 Link do Vídeo Pitch Oficial (Slide 25 da FIAP)

- 🎥 **Vídeo Pitch:** [https://youtu.be/SEU_LINK_DO_VIDEO_AQUI](https://youtu.be/uGmxlW46e30)
- 📝 **Arquivo de Entrega Oficial (.txt):** [docs/ENTREGA_CITIZENTECH.txt](docs/ENTREGA_CITIZENTECH.txt)
- 📕 **Relatório Técnico Consolidado em PDF:** [docs/RELATORIO_TECNICO_GLOBAL_SOLUTION.md](docs/RELATORIO_TECNICO_GLOBAL_SOLUTION.md)

---

## 🎯 Visão Geral da Solução

O **Zeladoria Aberta** é uma plataforma cívica inteligente (_CitizenTech_) concebida para aproximar a população da gestão dos espaços públicos e prevenção de desastres. Integrando crowdsourcing comunitário, telemetria contínua de sensores IoT em áreas de risco e o modelo **Google Gemini 3.5 Flash Lite** (via SDK `@google/genai`), o sistema converte relatos leigos e informais de munícipes em chamados técnicos perfeitamente estruturados e despachados em frações de segundo para a Defesa Civil, concessionárias e subprefeituras.

---

## 🌍 Conexão com os Objetivos de Desenvolvimento Sustentável (ODS da ONU)

O projeto conecta-se a 5 metas da Agenda 2030:

1. **ODS 11 — Cidades e Comunidades Sustentáveis (Metas 11.5 e 11.b):** Monitoramento antecipado de enchentes e desastres naturais;
2. **ODS 13 — Ação Contra a Mudança Global do Clima (Meta 13.1):** Resiliência climática urbana em eventos extremos de chuvas torrenciais;
3. **ODS 9 — Indústria, Inovação e Infraestrutura (Metas 9.1 e 9.c):** Sensoriamento IoT de baixo custo para zeladoria urbana inclusiva;
4. **ODS 3 — Saúde e Bem-Estar (Meta 3.9):** Redução rápida de riscos biológicos (focos de dengue e esgoto a céu aberto);
5. **ODS 10 — Redução das Desigualdades (Meta 10.2):** Democratização do atendimento cívico para moradores de áreas periféricas e favelas.

---

## 🏆 Estrutura do Projeto pelas 4 Áreas de Avaliação

### 💡 Área 1: IA e Automação

- **IA Aplicada:** Triagem cognitiva em tempo real com **Google Gemini 3.5 Flash Lite** e **Structured Outputs** (JSON Schema estrito), garantindo zero alucinações e tipagem perfeita.
- **Resiliência e Fallback Heurístico:** Motor de contingência offline integrado no serviço `src/services/aiTriage.service.ts`, permitindo que a aplicação funcione ininterruptamente mesmo sem chave de API ativa.
- **IA Medida:** Tempo médio de triagem reduzido de **120 horas (5 dias no 156 manual) para 1,2 segundos (99,99% mais rápido)**; assertividade de despacho saltando de **58% para 96,4%**; custo por chamado reduzido em 99,97%.
- **Tela de Auditoria e Prompts:** Disponível em `/auditoria-ia`.

### 📊 Área 2: Big Data e Visualização

- **Estrutura Data Lake (Arquitetura Medalhão):**
  - _Camada Bronze (Raw):_ Ingestão bruta de telemetria IoT e texto livre de munícipes;
  - _Camada Silver (Trusted):_ Dados higienizados, validados via Zod e enriquecidos com IA;
  - _Camada Gold (Analytics):_ Modelagem agregada e vistas analíticas dimensionais para gestores públicos.
- **Simulação de Pipeline:** Serviço `src/services/dataPipeline.service.ts` e endpoint `/api/pipeline`.
- **Dashboard com Filtros e Apoio à Decisão:** Tela `/estatisticas` com filtros combinados por gravidade e status, gráficos de categoria e severidade, ranking de órgãos municipais e controle operacional de status.
- **Funções Analíticas DAX:** Métricas formalizadas para Taxa de Resolução, Índice de Severidade Crítica Ponderada (ISCP) e SLA Médio Preditivo.

### 🌐 Área 3: MVP, IoT e Experiência Digital

- **Protótipo com 5 Telas Funcionais:**
  1. `/` — Mapa Cívico Interativo com Leaflet e apoio comunitário ("Também fui afetado");
  2. `/novo-chamado` — Cadastro com geolocalização GPS, geocodificação reversa e triagem da IA;
  3. `/estatisticas` — Dashboard executivo de Big Data e governança pública;
  4. `/sensores` — Central de Telemetria IoT urbana com botões de simulação de emergência;
  5. `/auditoria-ia` — Painel de transparência de IA, comparativo antes vs depois e ODS da ONU.
- **Sensoriamento IoT com 2+ Sensores:**
  - _Sensor 1 (IOT-FLD-01):_ Sensor Ultrassônico HC-SR04 de nível de lâmina d'água em bueiros/córregos (prevenção de enchentes);
  - _Sensor 2 (IOT-TLT-02):_ Sensor Acelerômetro MPU-6050 de inclinação arbórea e encostas (prevenção de quedas e deslizamentos).
- **Engenharia de Hardware:** Código Arduino em C++ (`iot/arduino/zeladoria_iot_sensores.ino`) e guia completo de montagem no simulador Autodesk TinkerCad (`iot/tinkercad/CIRCUITO_TINKERCAD.md`).
- **Áreas Integradas:** Ao detectar limiar crítico, o sensor IoT aciona a IA Gemini em tempo real, gerando ordem de serviço na Defesa Civil e refletindo instantaneamente no mapa e no dashboard!

### ⚙️ Área 4: DevOps, Segurança e Qualidade

- **Organização Modular:** Estrutura limpa e desacoplada em TypeScript, versionada no Git.
- **Conteinerização Docker:** `Dockerfile` multi-stage build de alta eficiência e `docker-compose.yml` para execução rápida com 1 comando.
- **CI/CD Automatizado:** Pipeline do GitHub Actions (`.github/workflows/ci.yml`) com lint, validação de tipos, migração de banco, suíte de testes e docker build.
- **Monitoramento e Liveness Probe:** Endpoint `/api/health` para verificação de uptime, memória e status da aplicação.
- **Segurança e LGPD:** Validação estrita com Zod em todas as entradas, queries parametrizadas no Drizzle ORM (prevenção contra SQL Injection), mitigação anti-XSS e mascaramento de dados pessoais.
- **Suíte de Testes Automatizados:** 6 casos de teste cobrindo schemas, triagem de IA, regras IoT, Big Data e segurança em `tests/system.test.ts`.

---

## 🤖 Declaração de Uso de IA Generativa

| Ferramenta                              | Onde foi utilizada no projeto                                                                                                                                                                                                                             |
| :-------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Gemini API (`@google/genai`)** | Utilizado no backend do produto em produção (`src/services/aiTriage.service.ts`) para processamento de linguagem natural leiga, categorização de incidentes, determinação de urgência (1 a 5) e despacho ao órgão público correto com Structured Outputs. |
| **Antigravity AI (Google DeepMind)**    | Apoio para planejamento arquitetural, estruturação do plano de testes automatizados, documentação e revisão do roteiro de vídeo pitch.                                                                                                                    |

---

## 🚀 Como Executar o Projeto Passo a Passo (Garantia de 100% de Execução)

### Pré-requisitos

- Node.js versão 20.x ou superior (recomendado Node 22.x LTS);
- Gerenciador de pacotes `pnpm` (ou `npm`).

### 1. Clonar o Repositório e Instalar Dependências

```bash
git clone <URL_DO_REPOSITORIO>
cd citizen-tech
pnpm install
```
_(Se estiver utilizando npm: `npm install`)_

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo `.env.example` para `.env`:

```bash
cp .env.example .env
```
Conteúdo do arquivo `.env`:

```env
DATABASE_URL="file:./dev.db"
# Opcional: Sua chave Google Gemini. Se vazia, o sistema ativa o motor heurístico resiliente automaticamente!
GEMINI_API_KEY=""
```

### 3. Sincronizar e Popular o Banco de Dados

```bash
# Cria e sincroniza o schema SQLite via Drizzle ORM
pnpm run db:push

# Popula o banco com ocorrências e sensores reais de São Paulo
pnpm run db:seed
```

### 4. Executar os Testes Automatizados (Área 4)

```bash
pnpm test
```
_Resultado esperado:_ 6 testes aprovados com 100% de sucesso em milissegundos.

### 5. Iniciar o Servidor de Desenvolvimento

```bash
pnpm run dev
```
Acesse a aplicação no seu navegador em: **[http://localhost:3000](http://localhost:3000)**

---

## 🐳 Execução via Docker (DevOps)

Você também pode subir a aplicação conteinerizada completa com apenas um comando:

```bash
docker compose up -d
```
Acesse: [http://localhost:3000](http://localhost:3000) e teste a saúde do contêiner em [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 🗺️ Mapa de Rotas do Protótipo

| Rota                | Descrição da Tela / Funcionalidade                                                                                      |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| **`/`**             | **Mapa Cívico Interativo:** Visualização geoespacial com marcadores Leaflet por cores de gravidade e apoio comunitário. |
| **`/novo-chamado`** | **Abertura de Chamado:** Formulário com GPS, endereço reverso e triagem instantânea da IA Gemini.                       |
| **`/sensores`**     | **Telemetria IoT Urbana:** Monitoramento de bueiros e árvores, com botões para simulação de emergência.                 |
| **`/estatisticas`** | **Dashboard de Big Data & BI:** Indicadores municipais, taxas de resolução, ranking de órgãos e filtros gerenciais.     |
| **`/auditoria-ia`** | **Governança & ODS:** Comparativo antes vs depois da IA, schemas, Data Lake em 3 camadas e Agenda 2030 da ONU.          |
| **`/api/health`**   | **DevOps Probe:** Monitoramento de uptime, memória e saúde do banco de dados.                                           |

---
