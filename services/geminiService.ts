
import { GoogleGenAI } from "@google/genai";
import { BatterySpecs, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askRegulatoryAdvisor = async (
  question: string,
  context: { specs: BatterySpecs; result: CalculationResult | null }
): Promise<string> => {
  // Fail fast if no context is available to ensure precision
  if (!context.result) {
    return "Por favor, preencha primeiro os dados da bateria (Voltagem, Capacidade, Tipo) no formulário. Preciso desses números para realizar uma análise regulatória precisa.";
  }

  const airlineName = context.specs.airline === 'L7' ? 'LATAM Cargo' : context.specs.airline;
  const isLatam = context.specs.airline === 'L7';

  // Robust System Instruction defining Persona, Knowledge Base, and Strict Rules
  const systemInstruction = `
    Você é o **AeroVolt AI**, Auditor Sênior de Artigos Perigosos (DGR) da **${airlineName}**.
    
    **DIRETRIZ SUPREMA: POLÍTICA INTERNA > IATA**
    Você deve validar o embarque seguindo RIGOROSAMENTE as Variações do Operador (L7). Se a IATA diz "Permitido" (ex: Seção II sem UN38.3), mas a LATAM exige mais rigor, **A REGRA LATAM VENCE**.

    **REGRAS CRÍTICAS LATAM (L7 VARIATIONS):**
    1.  **L7-01 (Proibição PAX):** UN 3480 e UN 3090 são **PROIBIDAS EM PAX** (Passageiros). Sempre CAO (Cargueiro). Não importa se a bateria é pequena.
    2.  **L7-04 (UN 38.3):** O Resumo de Teste UN 38.3 é **OBRIGATÓRIO** para 100% das baterias de lítio. Se o usuário perguntar "Preciso anexar?", a resposta é SIM para LATAM.
    3.  **L7-03 (DGD):** Apenas Inglês, Português ou Espanhol.

    **REGRAS DE CÁLCULO:**
    *   **Energia Calculada:** ${context.result.energy.toFixed(2)} ${context.result.unit}.
    *   **Regra SoC 2026:** UN 3480 exige 30% SoC. UN 3481 (Packed With) > 2.7Wh exige 30% SoC.

    **ESTILO DE RESPOSTA:**
    *   Se o usuário questionar uma restrição (ex: "Por que é proibido se é pequeno?"), explique citando a **Variação L7-01**.
    *   Seja direto e autoritário sobre segurança.
    *   Use Markdown para formatar.
  `;

  // Detailed Context Injection
  const promptContext = `
    --- DADOS DO EMBARQUE (FATO) ---
    *   **Cia Aérea:** ${context.specs.airline} ${isLatam ? '(APLICAR VARIAÇÕES L7)' : ''}
    *   **UN Number:** ${context.result.unNumber}
    *   **Status:** ${context.result.status}
    *   **Energia:** ${context.result.energy.toFixed(2)} ${context.result.unit}
    *   **Justificativa do Sistema:** "${context.result.reasoning}"
    *   **Documentos Exigidos:** ${context.result.documents.join('; ')}

    --- PERGUNTA DO USUÁRIO ---
    "${question}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: promptContext }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Factual precision
        topK: 32,
        topP: 0.90,
      }
    });

    return response.text || "O consultor não retornou uma resposta válida. Verifique os dados.";
  } catch (error) {
    console.error("Regulatory Advisor Error:", error);
    return "Erro de conexão com a IA Regulatória. Verifique sua chave de API.";
  }
};
