
import { GoogleGenAI, Type } from "@google/genai";
import { BatterySpecs, CalculationResult, BatteryType, Configuration } from "../types";

export const askRegulatoryAdvisor = async (
  question: string,
  context: { specs: BatterySpecs; result: CalculationResult | null }
): Promise<string> => {
  if (!context.result) {
    return "Por favor, preencha primeiro os dados da bateria (Voltagem, Capacidade, Tipo) no formulário. Preciso desses números para realizar uma análise regulatória precisa.";
  }

  const airlineName = context.specs.airline === 'L7' ? 'LATAM Cargo' : context.specs.airline;

  const systemInstruction = `
    Você é o **AeroVolt AI**, Auditor Sênior de Artigos Perigosos (DGR) da **${airlineName}**.
    
    **DIRETRIZ SUPREMA: POLÍTICA INTERNA > IATA**
    Você deve validar o embarque seguindo RIGOROSAMENTE as Variações do Operador (L7). Se a IATA diz "Permitido", mas a LATAM exige mais rigor, **A REGRA LATAM VENCE**.

    **REGRAS CRÍTICAS LATAM (L7 VARIATIONS):**
    1.  **L7-01 (Proibição PAX):** UN 3480 e UN 3090 são **PROIBIDAS EM PAX**. Sempre CAO.
    2.  **L7-04 (UN 38.3):** O Resumo de Teste UN 38.3 é **OBRIGATÓRIO** para 100% das baterias de lítio.
    3.  **L7-03 (DGD):** Apenas Inglês, Português ou Espanhol.

    **ESTILO DE RESPOSTA:**
    Seja direto e autoritário sobre segurança. Use Markdown.
  `;

  const promptContext = `
    --- DADOS DO EMBARQUE ---
    *   **UN Number:** ${context.result.unNumber}
    *   **Status:** ${context.result.status}
    *   **Energia:** ${context.result.energy.toFixed(2)} ${context.result.unit}
    *   **Consolidado (Overpack):** ${context.specs.isConsolidated ? 'SIM' : 'NÃO'}
    --- PERGUNTA DO USUÁRIO ---
    "${question}"
  `;

  try {
    // Initialize GoogleGenAI client with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptContext,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
      }
    });

    return response.text || "O consultor não retornou uma resposta válida.";
  } catch (error) {
    console.error("Regulatory Advisor Error:", error);
    return "Erro de conexão com a IA Regulatória.";
  }
};

/**
 * Resolve especificações técnicas de um dispositivo para preenchimento automático
 */
export const resolveDevicePreset = async (deviceName: string): Promise<any> => {
  try {
    // Initialize GoogleGenAI client with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Determine as especificações de bateria típicas para o dispositivo: "${deviceName}".`,
      config: {
        systemInstruction: `Você é um banco de dados técnico de baterias. 
        Para o dispositivo fornecido, determine os valores médios de mercado.
        
        REGRAS DE ESTRUTURA ('structure'):
        - Retorne 'cell' (Célula) OBRIGATORIAMENTE se o dispositivo for pequeno e usar pilhas unitárias ou células tipo moeda/botão. Exemplos: Relógios (Watches), Chaves de Carro (Keyfobs), AirTags, Calculadoras, Controles Remotos, Motherboards.
        - Retorne 'battery' (Bateria) OBRIGATORIAMENTE para dispositivos que usam packs compostos. Exemplos: Laptops, Smartphones, Drones, Ferramentas Elétricas, Power Banks, Bikes Elétricas.
        
        REGRAS DE TIPO:
        - Eletrônicos recarregáveis modernos = LI_ION.
        - Pilhas botão ou não-recarregáveis de alta duração = LI_METAL.
        - Brinquedos simples ou ferramentas antigas = NI_MH.
        
        REGRAS DE TIPO DE CONFIG:
        - Power Bank = STANDALONE.
        - Pilha avulsa = STANDALONE.
        - Eletrônico pronto = CONTAINED_IN.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            batteryType: { type: Type.STRING, enum: [BatteryType.LI_ION, BatteryType.LI_METAL, BatteryType.NI_MH] },
            config: { type: Type.STRING, enum: [Configuration.STANDALONE, Configuration.PACKED_WITH, Configuration.CONTAINED_IN] },
            voltage: { type: Type.NUMBER, description: "Voltagem nominal típica" },
            capacitymAh: { type: Type.NUMBER, description: "Capacidade em mAh típica" },
            structure: { type: Type.STRING, enum: ["cell", "battery"] }
          },
          required: ["batteryType", "config", "voltage", "capacitymAh", "structure"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Preset Resolver Error:", error);
    return null;
  }
};
