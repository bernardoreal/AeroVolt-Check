
import { BatteryType, Configuration, ComplianceStatus, CalculationResult, BatterySpecs, AirlineCode } from '../types';

export const calculateCompliance = (specs: BatterySpecs): CalculationResult => {
  const { airline, type, config, structure, voltage, capacityAh, packageQuantity } = specs;
  
  // --- IDENTIFICAÇÃO DO OPERADOR ---
  const isLatam = airline === 'L7';
  const isFedEx = airline === 'FX';
  const isEmirates = airline === 'EK';

  // --- PREPARAÇÃO DO OBJETO DE RESULTADO ---
  let result: CalculationResult = {
    energy: 0,
    unit: '',
    status: ComplianceStatus.ALLOWED,
    labels: [],
    instructions: '',
    packingInstruction: '',
    socRuleApply: false,
    alertColor: 'green',
    unNumber: '',
    packagingSpecs: [
      'Embalagem externa forte e rígida necessária (Deve suportar teste de queda de 1,2m).',
      'Proteção contra curto-circuitos: Terminais isolados individualmente.',
      'Imobilização: Conteúdo fixado para evitar movimento interno.'
    ],
    awbStatement: '',
    documents: [],
    calcDetails: '',
    specialProvisions: ['A154'], // Initialize with A154 as it applies to all Lithium Batteries
    dgrSection: ''
  };

  // --- REGRAS E CONSTANTES DE TEXTO ---
  const DOCS = {
    DGD: 'Declaração do Expedidor (DGD) | Obrigatório (3 vias coloridas, colunas vermelhas).',
    MSDS: 'MSDS/FISPQ (Atualizada) | Obrigatório para análise de risco da companhia.',
    SOC: 'Declaração de SoC (≤ 30%) | Obrigatório no AWB (Nature and Quantity of Goods).',
    A99: 'Aprovação Especial A99 | Obrigatório (Carga > 35kg ou protótipo).',
    L7_UN383: 'Resumo de Teste UN 38.3 (L7-04) | OBRIGATÓRIO ANEXAR: Política LATAM exige documento físico, não apenas "disponível".',
    IATA_UN383: 'Resumo de Teste UN 38.3 | Deve estar disponível se solicitado.',
    OVERPACK: "SOBREEMBALAGEM (OVERPACK): Se consolidado e etiquetas não visíveis, marcar 'OVERPACK'.",
    L7_LANG: 'Nota L7-03: A DGD deve ser preenchida em Inglês, Português ou Espanhol.'
  };

  // --- INJEÇÃO DE DOCUMENTOS GERAIS ---
  // A LATAM (L7-04) exige o UN 38.3 físico para TODOS os embarques.
  if (isLatam) {
    result.documents.push(DOCS.L7_UN383, DOCS.MSDS);
  } else {
    result.documents.push(DOCS.IATA_UN383, DOCS.MSDS);
  }

  // Helper para gerar justificativas de proibição PAX (L7-01 vs IATA)
  const getPaxForbiddenReason = (un: string) => {
    if (isLatam) return `[VARIAÇÃO L7-01] A LATAM Cargo proíbe estritamente ${un} em aeronaves de passageiros (PAX), mesmo que a IATA permita exceções.`;
    return `${un} é restrito/proibido em aeronaves de passageiros pelo IATA DGR.`;
  };

  // Helper texto extra para aprovação interna LATAM em casos proibidos PAX
  const latamInternalApprovalText = isLatam ? " Requer procedimentos internos de aprovação LATAM Cargo além da etiqueta CAO." : "";

  // Helper para marcação da Seção II
  const getSectionIIMarkLabel = (qty: number, struct: 'cell' | 'battery') => {
    if (qty > 2) return 'Marca de Bateria de Lítio (Obrigatório: > 2 volumes)';
    const innerLimit = struct === 'cell' ? '4 células' : '2 baterias';
    return `Marca de Bateria de Lítio (Isento APENAS se ≤ ${innerLimit}. Caso contrário, Obrigatório.)`;
  };

  if (packageQuantity > 1) {
    result.packagingSpecs?.push(DOCS.OVERPACK);
  }

  // =========================================================================
  // LÓGICA 1: ÍON-LÍTIO (UN 3480 / 3481)
  // =========================================================================
  if (type === BatteryType.LI_ION) {
    // Cálculo de Energia Precisão
    const exactWh = voltage * capacityAh;
    // Arredondamento seguro para evitar flutuação de ponto flutuante em limites (ex: 100.000001)
    const wh = Math.round(exactWh * 100) / 100;
    
    result.energy = wh;
    result.unit = 'Wh';
    result.calcDetails = `${voltage}V × ${capacityAh}Ah = ${wh}Wh`;

    // Limites de Energia (IATA Standard)
    const limitWh = structure === 'cell' ? 20 : 100;
    const isSmall = wh <= limitWh;
    
    // Texto de Excesso
    const excessTxt = isSmall ? '' : ` (Excede limite de ${limitWh}Wh em ${(wh - limitWh).toFixed(1)}Wh)`;

    // --- CENÁRIO A: UN 3480 (SOLTAS/STANDALONE) ---
    if (config === Configuration.STANDALONE) {
      result.unNumber = 'UN 3480';
      result.socRuleApply = true; // UN 3480 sempre exige 30%
      result.documents.push(DOCS.SOC);

      // REGRA LATAM L7-01: SEMPRE CAO (Forbidden PAX)
      // Se for LATAM, o status é FORBIDDEN_PAX automaticamente.
      if (isLatam) {
         result.status = ComplianceStatus.FORBIDDEN_PAX;
      } else {
         // Se não for LATAM, segue a regra geral IATA (que também é restritiva, mas permite exceções raras de Estado)
         result.status = ComplianceStatus.FORBIDDEN_PAX; 
      }

      if (isSmall) {
        // --- SEÇÃO II / IB (Baterias Pequenas) ---
        if (isFedEx || isEmirates) {
           // FedEx/Emirates rejeitam Seção II
           result.packingInstruction = 'PI 965 - Seção IB';
           result.dgrSection = 'Seção IB';
           result.alertColor = 'yellow';
           result.reasoning = `VARIAÇÃO OPERADOR (${airline}): Seção II não aceita. Deve seguir Seção IB (Regulamentado).`;
           result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio'];
           result.awbStatement = 'Lithium Ion Batteries in compliance with Section IB of PI 965. CAO. SoC <= 30%';
           result.documents.push(DOCS.DGD);
        } else {
           // IATA Padrão / LATAM
           result.packingInstruction = 'PI 965 - Seção IB'; // LATAM prefere IB para controle
           result.dgrSection = 'Seção IB';
           result.alertColor = 'red'; // Red alerta para CAO Only
           
           result.reasoning = `UN 3480 Seção IB (≤ ${limitWh}Wh). ${getPaxForbiddenReason('UN 3480')}${latamInternalApprovalText}`;
           result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio'];
           result.limitPerPackage = 'PAX: PROIBIDO | CAO: 10 kg';
           result.awbStatement = 'Lithium Ion Batteries in compliance with Section IB of PI 965. CAO. SoC <= 30%';
           result.documents.push(DOCS.DGD);
           if (isLatam) result.documents.push(DOCS.L7_LANG);
        }
      } else {
        // --- SEÇÃO IA (Baterias Grandes > 100Wh) ---
        result.packingInstruction = 'PI 965 - Seção IA';
        result.dgrSection = 'Seção IA';
        result.status = ComplianceStatus.FORBIDDEN_PAX; // High Energy sempre CAO
        result.alertColor = 'red';
        
        result.reasoning = `UN 3480 Alta Energia (> ${limitWh}Wh)${excessTxt}. Classificado como Classe 9 Regulada. ${getPaxForbiddenReason('UN 3480')}${latamInternalApprovalText}`;
        result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)'];
        result.limitPerPackage = 'PAX: PROIBIDO | CAO: 35 kg';
        result.awbStatement = 'UN 3480, Lithium ion batteries, 9, PI 965-IA, CAO, SoC <= 30%';
        result.documents.push(DOCS.DGD);
        if (isLatam) result.documents.push(DOCS.L7_LANG);
        if (wh > 35000) {
            result.documents.push(DOCS.A99); // Exemplo hipotético de limite extremo
            result.specialProvisions.push('A99');
        }
      }

    } 
    // --- CENÁRIO B: UN 3481 (COM EQUIPAMENTO / NO EQUIPAMENTO) ---
    else {
      result.unNumber = 'UN 3481';
      const isPackedWith = config === Configuration.PACKED_WITH;
      const piNum = isPackedWith ? 'PI 966' : 'PI 967';
      result.packingInstruction = piNum;

      // REGRA SoC 2026: Packed With > 2.7Wh exige 30%
      if (isPackedWith && wh > 2.7) {
        result.socRuleApply = true;
        result.documents.push(DOCS.SOC);
      }

      if (isSmall) {
        // SEÇÃO II
        result.status = ComplianceStatus.ALLOWED;
        result.dgrSection = 'Seção II';
        result.alertColor = 'green';
        
        // Variação L7-04 Check
        const un383Warning = isLatam ? ' (L7-04: Obrigatório UN 38.3 Físico)' : '';
        
        result.reasoning = `UN 3481 Seção II (≤ ${limitWh}Wh). Aceito em PAX e CAO.${un383Warning}`;
        
        if (isPackedWith) {
             result.labels = ['Marca de Bateria de Lítio'];
             result.awbStatement = `Lithium ion batteries in compliance with Section II of PI 966${result.socRuleApply ? ', SoC <= 30%' : ''}`;
        } else {
             // PI 967 (Contained In) tem isenção de etiqueta se < 2 volumes e < limites internos
             result.labels = [getSectionIIMarkLabel(packageQuantity, structure)];
             result.awbStatement = 'Lithium ion batteries in compliance with Section II of PI 967';
        }
        result.limitPerPackage = 'PAX: 5 kg | CAO: 5 kg';
        result.documents.push('Carta de Conformidade (Recomendado)');
      } else {
        // SEÇÃO I
        result.status = ComplianceStatus.RESTRICTED; // Restricted = Aceito mas Regulamentado
        result.dgrSection = 'Seção I';
        result.alertColor = 'yellow';
        
        result.reasoning = `UN 3481 Seção I (> ${limitWh}Wh)${excessTxt}. Classe 9 Regulada. Permitido em PAX até 5kg.`;
        result.labels = ['Etiqueta Classe 9A'];
        result.limitPerPackage = 'PAX: 5 kg | CAO: 35 kg';
        result.awbStatement = `UN 3481, Lithium ion batteries ${isPackedWith ? 'packed with' : 'contained in'} equipment, 9, ${piNum}-I`;
        result.documents.push(DOCS.DGD);
        if (isLatam) result.documents.push(DOCS.L7_LANG);
      }
    }
  }
  // =========================================================================
  // LÓGICA 2: METAL LÍTIO (UN 3090 / 3091)
  // =========================================================================
  else {
    // Cálculo Gramas Lítio
    const exactGrams = capacityAh * 0.3; // Fórmula padrão aproximada
    const grams = Math.round(exactGrams * 100) / 100;

    result.energy = grams;
    result.unit = 'g (Lítio)';
    result.calcDetails = `${capacityAh}Ah × 0.3 ≈ ${grams}g`;

    // Limites (IATA Standard)
    const limitGrams = structure === 'cell' ? 1 : 2;
    const isSmall = grams <= limitGrams;
    const excessTxt = isSmall ? '' : ` (Excede limite de ${limitGrams}g em ${(grams - limitGrams).toFixed(2)}g)`;

    // --- CENÁRIO C: UN 3090 (SOLTAS/STANDALONE) ---
    if (config === Configuration.STANDALONE) {
      result.unNumber = 'UN 3090';
      result.packingInstruction = 'PI 968';
      
      // L7-01 FORCE
      result.status = ComplianceStatus.FORBIDDEN_PAX;
      result.alertColor = 'red';

      if (isSmall) {
         // SEÇÃO IB
         if (isFedEx) {
             result.dgrSection = 'Seção IB';
             result.reasoning = "VARIAÇÃO FX-05: Proibido na FedEx sem pré-aprovação contratual.";
             result.awbStatement = "REJEIÇÃO FX-05 SE NÃO APROVADO";
             result.labels.push("PROIBIDO FX");
         } else {
             result.dgrSection = 'Seção IB';
             result.reasoning = `UN 3090 Seção IB (≤ ${limitGrams}g). ${getPaxForbiddenReason('UN 3090')}${latamInternalApprovalText}`;
             result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio'];
             result.awbStatement = 'Lithium Metal Batteries in compliance with Section IB of PI 968. CAO';
         }
         result.limitPerPackage = 'PAX: PROIBIDO | CAO: 2.5 kg';
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
      } else {
         // SEÇÃO IA
         result.packingInstruction = 'PI 968 - Seção IA';
         result.dgrSection = 'Seção IA';
         result.reasoning = `UN 3090 Alta Energia (> ${limitGrams}g)${excessTxt}. ${getPaxForbiddenReason('UN 3090')}${latamInternalApprovalText}`;
         result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)'];
         result.limitPerPackage = 'PAX: PROIBIDO | CAO: 35 kg';
         result.awbStatement = 'UN 3090, Lithium metal batteries, 9, PI 968-IA, CAO';
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
         result.documents.push(DOCS.A99); // Geralmente metal lítio grande exige A99
         result.specialProvisions.push('A99');
      }
    } 
    // --- CENÁRIO D: UN 3091 (COM EQUIPAMENTO / NO EQUIPAMENTO) ---
    else {
      result.unNumber = 'UN 3091';
      const isPackedWith = config === Configuration.PACKED_WITH;
      const piNum = isPackedWith ? 'PI 969' : 'PI 970';
      result.packingInstruction = piNum;

      if (isSmall) {
         // SEÇÃO II
         result.status = ComplianceStatus.ALLOWED;
         result.dgrSection = 'Seção II';
         result.alertColor = 'green';
         
         const un383Warning = isLatam ? ' (L7-04: Obrigatório UN 38.3 Físico)' : '';
         result.reasoning = `UN 3091 Seção II (≤ ${limitGrams}g). Aceito em PAX e CAO.${un383Warning}`;

         if (isPackedWith) {
             result.labels = ['Marca de Bateria de Lítio'];
             result.awbStatement = 'Lithium metal batteries in compliance with Section II of PI 969';
         } else {
             result.labels = [getSectionIIMarkLabel(packageQuantity, structure)];
             result.awbStatement = 'Lithium metal batteries in compliance with Section II of PI 970';
         }
         result.limitPerPackage = 'PAX: 5 kg | CAO: 5 kg';
         result.documents.push('Carta de Conformidade');
      } else {
         // SEÇÃO I
         result.status = ComplianceStatus.RESTRICTED;
         result.dgrSection = 'Seção I';
         result.alertColor = 'yellow';
         
         result.reasoning = `UN 3091 Seção I (> ${limitGrams}g)${excessTxt}. Classe 9 Regulada. Permitido em PAX até 5kg.`;
         result.labels = ['Etiqueta Classe 9A'];
         result.limitPerPackage = 'PAX: 5 kg | CAO: 35 kg';
         result.awbStatement = `UN 3091, Lithium metal batteries ${isPackedWith ? 'packed with' : 'contained in'} equipment, 9, ${piNum}-I`;
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
      }
    }
  }

  return result;
};
