import { GoogleGenAI, Type } from "@google/genai";

export interface AITriageResult {
  category:
    | "FLOODING"
    | "TREE_FALL"
    | "INFRASTRUCTURE_HOLE"
    | "GARBAGE_ACCUMULATION"
    | "LIGHTING_DEFECT"
    | "HEALTH_RISK"
    | "OTHER";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgencyScore: number;
  responsibleOrgan: string;
  summaryReason: string;
}

/**
 * Fallback heurístico para classificação offline ou sem chave GEMINI_API_KEY.
 * Garante resiliência e continuidade operacional em demonstrações e contingências.
 */
function heuristicTriage(title: string, description: string): AITriageResult {
  const text = `${title} ${description}`.toLowerCase();

  let category: AITriageResult["category"] = "OTHER";
  let responsibleOrgan = "Subprefeitura / Zeladoria Urbana";

  if (
    text.includes("alag") ||
    text.includes("enxurr") ||
    text.includes("enchente") ||
    text.includes("drenagem") ||
    text.includes("bueiro") ||
    text.includes("inund")
  ) {
    category = "FLOODING";
    responsibleOrgan = "Defesa Civil e Secretaria de Infraestrutura";
  } else if (
    text.includes("árvore") ||
    text.includes("arvore") ||
    text.includes("galho") ||
    text.includes("fiação") ||
    text.includes("fiacao") ||
    text.includes("cabo elétr") ||
    text.includes("poste caído")
  ) {
    category = "TREE_FALL";
    responsibleOrgan = "Defesa Civil e Concessionária de Energia";
  } else if (
    text.includes("buraco") ||
    text.includes("cratera") ||
    text.includes("asfalto") ||
    text.includes("calçada") ||
    text.includes("calcada") ||
    text.includes("pista")
  ) {
    category = "INFRASTRUCTURE_HOLE";
    responsibleOrgan = "Secretaria Municipal de Obras e Vias Públicas";
  } else if (
    text.includes("lixo") ||
    text.includes("entulho") ||
    text.includes("descarte") ||
    text.includes("caçamba") ||
    text.includes("sujeira")
  ) {
    category = "GARBAGE_ACCUMULATION";
    responsibleOrgan = "Autoridade Municipal de Limpeza Urbana";
  } else if (
    text.includes("ilumin") ||
    text.includes("luz apagada") ||
    text.includes("poste apagado") ||
    text.includes("escuridão") ||
    text.includes("escuridao") ||
    text.includes("lâmpada")
  ) {
    category = "LIGHTING_DEFECT";
    responsibleOrgan = "Departamento de Iluminação Pública";
  } else if (
    text.includes("dengue") ||
    text.includes("vetor") ||
    text.includes("água parada") ||
    text.includes("rato") ||
    text.includes("escorpi") ||
    text.includes("sanitár")
  ) {
    category = "HEALTH_RISK";
    responsibleOrgan = "Vigilância Sanitária e Secretaria de Saúde";
  }

  // Avaliação de Severidade
  let severity: AITriageResult["severity"] = "LOW";
  let urgencyScore = 2;
  let summaryReason =
    "Ocorrência padrão triada para atendimento preventivo regular.";

  const isCritical =
    text.includes("faísca") ||
    text.includes("faisca") ||
    text.includes("choque") ||
    text.includes("soterra") ||
    text.includes("risco de vida") ||
    text.includes("perigo iminente") ||
    text.includes("interdita") ||
    text.includes("bloqueada") ||
    text.includes("grave") ||
    (category === "TREE_FALL" && text.includes("fiação")) ||
    (category === "FLOODING" &&
      (text.includes("carro") || text.includes("casa")));

  const isHigh =
    text.includes("urgente") ||
    text.includes("cratera") ||
    text.includes("avenida") ||
    text.includes("paralisa") ||
    category === "FLOODING" ||
    category === "HEALTH_RISK";

  if (isCritical) {
    severity = "CRITICAL";
    urgencyScore = 5;
    summaryReason =
      "Classificado como Crítico devido a risco imediato de acidentes ou interrupção de vias vitais.";
  } else if (isHigh) {
    severity = "HIGH";
    urgencyScore = 4;
    summaryReason =
      "Prioridade Alta por impacto direto na circulação coletiva ou saúde pública local.";
  } else if (
    category === "INFRASTRUCTURE_HOLE" ||
    category === "LIGHTING_DEFECT"
  ) {
    severity = "MEDIUM";
    urgencyScore = 3;
    summaryReason =
      "Gravidade Média com necessidade de cronograma de reparo em curto/médio prazo.";
  }

  return {
    category,
    severity,
    urgencyScore,
    responsibleOrgan,
    summaryReason,
  };
}

export async function triageCitizenReport(
  description: string,
  title: string,
): Promise<AITriageResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Se não houver chave real ou configurada, ativa o fallback com heurística
  if (!apiKey || apiKey.startsWith("AIzaSy_FAKE") || apiKey.length < 15) {
    console.info(
      "[aiTriage] Usando fallback heurístico (GEMINI_API_KEY ausente ou simulada).",
    );
    return heuristicTriage(title, description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Você é um auditor sênior de triagem da central de zeladoria e defesa civil urbana.
Analise com precisão técnica o relato enviado pelo cidadão e classifique-o:
Título: "${title}"
Descrição: "${description}"

Diretrizes de Classificação:
1. Se envolver risco imediato à vida, choque elétrico, soterramento, queda sobre rede elétrica energizada ou alagamento crítico de vias arteriais com pessoas ilhadas, classifique como CRITICAL (urgencyScore: 5).
2. Se causar grande transtorno à coletividade, risco de saúde transmissível ou bloqueio de fluxo expressivo, classifique como HIGH (urgencyScore: 4).
3. Se for problema de médio prazo (buraco em via local, iluminação apagada, lixo acumulado em calçada), classifique como MEDIUM (urgencyScore: 3) ou LOW (urgencyScore: 1 ou 2).
4. Indique o órgão público municipal ou concessionária competente no Brasil (ex: Defesa Civil, Concessionária de Energia Elétrica, Secretaria Municipal de Obras, Subprefeitura / Limpeza Urbana, Vigilância Sanitária).
5. Forneça uma justificativa objetiva em até 20 palavras no campo summaryReason.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: [
                "FLOODING",
                "TREE_FALL",
                "INFRASTRUCTURE_HOLE",
                "GARBAGE_ACCUMULATION",
                "LIGHTING_DEFECT",
                "HEALTH_RISK",
                "OTHER",
              ],
            },
            severity: {
              type: Type.STRING,
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            },
            urgencyScore: {
              type: Type.INTEGER,
              description: "Pontuação de urgência de 1 a 5",
            },
            responsibleOrgan: {
              type: Type.STRING,
              description: "Nome do órgão responsável pelo atendimento",
            },
            summaryReason: {
              type: Type.STRING,
              description:
                "Justificativa curta da classificação em até 20 palavras",
            },
          },
          required: [
            "category",
            "severity",
            "urgencyScore",
            "responsibleOrgan",
            "summaryReason",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("Resposta da IA vazia.");
    }

    const parsed = JSON.parse(response.text) as AITriageResult;
    return parsed;
  } catch (error) {
    console.error(
      "[aiTriage] Falha ao consultar Gemini API, acionando fallback heurístico:",
      error,
    );
    return heuristicTriage(title, description);
  }
}
