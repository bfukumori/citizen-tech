# Zeladoria Aberta — Roadmap de Evolução e Próximos Passos

> **Projeto:** Global Solution FIAP — Citizen Tech  
> **Tema:** Gestão Urbana Inteligente, Prevenção de Desastres e Engajamento Comunitário com IA

---

## 1. Visão Geral da Solução Atual (MVP Entregue)

A versão inicial funcional do **Zeladoria Aberta** entrega o núcleo de valor do conceito de _Citizen Tech_:

- **Ingestão Simples e Direta**: Interface web responsiva para munícipes relatarem ocorrências urbanas sem barreiras de usabilidade.
- **Triagem Automatizada por IA**: Integração com a **Google Gemini API** (via `@google/genai`), convertendo relatos leigos e textuais em dados técnicos estruturados:
  - Categoria da Ocorrência (`FLOODING`, `TREE_FALL`, `INFRASTRUCTURE_HOLE`, etc.);
  - Nível de Gravidade (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`);
  - Score de Urgência de 1 a 5;
  - Despacho sugerido ao órgão público ou concessionária responsável;
  - Justificativa técnica sintetizada.
- **Georreferenciamento e Mapa Cívico**: Visualização no Leaflet com marcadores codificados por cores de severidade.
- **Apoio Comunitário (_Endorsements_)**: Mecanismo de voto "Também fui afetado", aumentando a relevância coletiva do problema.
- **Painel de Indicadores & Governança Cívica**: Visão consolidada de métricas, gráficos e controle operacional de status de chamados.
- **Resiliência e Fallback**: Mecanismo heurístico de contingência integrado, garantindo operação contínua mesmo sem chave de API ativa ou em caso de perda temporária de conectividade.

---

## 2. Roadmap de Evolução em 4 Fases

```
   Fase 1 (Curto Prazo)            Fase 2 (Médio Prazo)             Fase 3 (Expansão)               Fase 4 (Futuro)
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│ Multimodalidade com   │  ──►  │ Integração Oficial e  │  ──►  │ Gamificação Cívica e  │  ──►  │ Modelos Preditivos de │
│ Gemini Vision (Fotos) │       │ Ouvidorias (156 / API)│       │ Comunidade Guardiã    │  ──►  │ Risco Climático Urbano│
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

---

### Fase 1: Inteligência Multimodal e Auditoria Visual (Curto Prazo — 1 a 2 meses)

1. **Análise Multimodal de Imagens (Gemini 3.5 Flash Lite Multimodal)**:
   - Permitir que o cidadão envie apenas a foto do local danificado.
   - O Gemini analisará a imagem para:
     - Identificar automaticamente cabos caídos, nível de água, rachaduras de asfalto ou lixo acumulado;
     - Cruzar o texto do munícipe com o conteúdo da imagem para evitar fraudes ou trotes (_hallucination & fraud prevention_);
     - Estimar a dimensão métrica aproximada (ex: "buraco de ~1m na pista rápida").
2. **Anonimização Automática e Conformidade com a LGPD**:
   - Pipeline de processamento que detecta e aplica _blur_ (desfoque) automático em rostos de transeuntes e placas de veículos antes de armazenar publicamente as fotos.

---

### Fase 2: Integração com Ouvidorias Municipais e Concessionárias (Médio Prazo — 3 a 4 meses)

1. **Conectores com Sistemas Legados de Zeladoria**:
   - Integração bidirecional com os sistemas de atendimento oficiais das capitais (ex: Sistema 156 da Prefeitura de SP, Defesa Civil Estadual e concessionárias como Enel e Sabesp).
   - Geração automática de número de protocolo municipal oficial e espelhamento das respostas dos agentes de campo para o cidadão.
2. **Autenticação Cívica via Gov.br**:
   - Integração com o login único do Governo Federal (`Gov.br`) para validação de identidade e acesso aos níveis Prata/Ouro de cidadania digital, mantendo a opção de reporte anônimo quando necessário.
3. **Webhooks de Notificação em Tempo Real**:
   - Envio de alertas instantâneos via WhatsApp/SMS ou Web Push Notifications para moradores de um raio de 500 metros sobre incidentes de risco crítico (ex: "Fiação caída com faíscas na sua rua — Defesa Civil acionada").

---

### Fase 3: Comunidade Guardiã e Gamificação Cívica (Expansão — 5 a 6 meses)

1. **Programa "Guardiões da Cidade"**:
   - Sistema de incentivo e pontuação cidadã: usuários que relatam problemas confirmados pela prefeitura e validam resoluções ganham insígnias cívicas (_badges_).
   - Possibilidade de parcerias com prefeituras para abatimentos simbólicos no IPTU ou benefícios em serviços públicos culturais (teatros, parques).
2. **Validação Colaborativa de Resoluções (_Crowd Verification_)**:
   - Quando o órgão público marcar a ocorrência como `RESOLVIDO`, moradores do raio de 200m recebem uma notificação para validar: "O buraco foi realmente tapado?".
   - Evita fechamento indevido de protocolos e eleva a transparência na prestação de contas.

---

### Fase 4: Inteligência Preditiva e Resiliência Climática (Futuro — 6 a 12 meses)

1. **Mapas de Calor e Prevenção de Desastres**:
   - Cruzamento dos dados históricos de alagamentos e quedas de árvores com a previsão meteorológica do CPTEC/INMET.
   - O sistema emitirá **alertas preventivos** para a Defesa Civil limpar bueiros específicos antes da chegada de frentes frias ou chuvas extremas.
2. **Painel de Inteligência para Gestores Públicos (Business Intelligence Cívico)**:
   - Dashboard analítico avançado com métricas de SLA (tempo médio de resposta por subprefeitura, custo estimado de reparo, e taxa de reincidência de problemas na mesma via).

---

## 3. Arquitetura Alvo para Produção em Grande Escala

| Componente           | Ambiente Atual (MVP / Sandbox)          | Ambiente Alvo de Produção                                                                              |
| :------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Banco de Dados**   | SQLite local (`dev.db` via Drizzle ORM) | **PostgreSQL com extensão PostGIS** (para consultas geoespaciais em alta performance com `ST_DWithin`) |
| **Storage de Mídia** | Base64 local simulado                   | **Cloudflare R2 / AWS S3** com CDN e otimização de imagens                                             |
| **Fila Assíncrona**  | Processamento inline                    | **BullMQ / Inngest / Redis** para desacoplar a chamada ao Gemini e notificações push                   |
| **Hospedagem**       | Node.js local / Vercel                  | **Vercel / AWS ECS** com alta disponibilidade e balanceamento de carga                                 |
| **Monitoramento**    | Logs de console                         | **OpenTelemetry, Sentry e Datadog**                                                                    |
