
import { BatteryType, Configuration, ComplianceStatus, CalculationResult, BatterySpecs, AirlineCode } from '../types';

export const calculateCompliance = (specs: BatterySpecs): CalculationResult => {
  const { airline, type, config, structure, voltage, capacityAh, packageCount, unitsPerPackage, isConsolidated, innerPackageHasLabel, isDefective } = specs;
  
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
    packagingSpecs: [],
    awbStatement: '',
    documents: [],
    calcDetails: '',
    specialProvisions: ['A334'], // A334 (Correio Aéreo) é universal
    dgrSection: ''
  };

  // --- CRITICAL CHECK: SP A154 (DAMAGED/DEFECTIVE) ---
  if (isDefective) {
    result.status = ComplianceStatus.FORBIDDEN_ALL;
    result.alertColor = 'red';
    result.specialProvisions.push('A154');
    result.reasoning = "PROIBIÇÃO TOTAL (SP A154): Baterias identificadas como defeituosas por razões de segurança ou que tenham sido danificadas, com potencial de evolução perigosa de calor, fogo ou curto-circuito, são ESTRITAMENTE PROIBIDAS no transporte aéreo sob qualquer circunstância.";
    result.instructions = "NÃO EMBARCAR. Segregar imediatamente. Consultar transporte terrestre ou descarte apropriado.";
    result.awbStatement = "FORBIDDEN FOR AIR TRANSPORT PER SP A154";
    result.dgrSection = 'Proibido';
    // Se for proibido, retornamos imediatamente, mas calculamos energia para display
    if (type === BatteryType.LI_ION || type === BatteryType.NI_MH) {
        result.energy = Math.round((voltage * capacityAh) * 100) / 100;
        result.unit = 'Wh';
    } else {
        result.energy = Math.round((capacityAh * 0.3) * 100) / 100;
        result.unit = 'g (Lítio)';
    }
    return result;
  }

  // --- REGRAS E CONSTANTES DE TEXTO ---
  const DOCS = {
    DGD: 'Declaração do Expedidor (DGD) | Obrigatório (3 vias coloridas, colunas vermelhas).',
    MSDS: 'MSDS/FISPQ (Atualizada) | Material Safety Data Sheet. Deve ter data de emissão < 5 anos (Recomendação LATAM) e confirmar os dados técnicos (Wh/Lítio) e a conformidade UN 38.3 na Seção 14 (Transporte).',
    SOC: 'Declaração de SoC (≤ 30%) | Obrigatório no AWB (Nature and Quantity of Goods).',
    A99: 'Aprovação Especial A99 | Obrigatório (Carga > 35kg ou protótipo).',
    L7_UN383: 'Resumo de Teste UN 38.3 (L7-04) | OBRIGATÓRIO ANEXAR: Política LATAM exige documento físico, não apenas "disponível".',
    IATA_UN383: 'Resumo de Teste UN 38.3 | Deve estar disponível se solicitado.',
    OVERPACK: "SOBREEMBALAGEM (OVERPACK): Obrigatório uso da marca, pois a carga foi consolidada.",
    L7_LANG: 'Nota L7-03: A DGD deve ser preenchida em Inglês, Português ou Espanhol.',
    LOC: 'Carta de Conformidade (LoC) | Declaração do expedidor atestando cumprimento dos limites da Seção II (Isento de DGD).'
  };

  const PACKAGING = {
    UN_SPEC: 'Embalagem Homologada UN (PG II) Obrigatória (Ex: UN 4G/Y). Testada e certificada.',
    UN_TESTS: 'HOMOLOGAÇÃO UN (PG II): Deve suportar Queda de 1.2m (Drop Test), Empilhamento de 3m por 24h (Stacking Test) e Pressão de 95 kPa. Consulte padrões completos: IATA DGR Seção 6.0.',
    STRONG_RIGID: 'Embalagem externa forte e rígida (Strong Rigid Packaging). Capaz de suportar queda de 1.2m.',
    SHORT_CIRCUIT: 'Proteção contra curto-circuitos: Terminais isolados individualmente.',
    MOVEMENT: 'Imobilização: Conteúdo fixado para evitar movimento interno.'
  };

  const PI_SUMMARIES = {
    965: "PI 965 (Íon-Lítio Solta): Exige estrito controle de SoC (≤30%) e é proibido em PAX. Embalagem deve proteger contra danos.",
    966: "PI 966 (Íon-Lítio Com Eqpto): A bateria é embalada junto com o equipamento, mas em caixa separada dentro do volume.",
    967: "PI 967 (Íon-Lítio No Eqpto): A bateria já está instalada. Foco total em evitar ativação acidental e superaquecimento.",
    968: "PI 968 (Metal Lítio Solta): Alto risco de incêndio. Proibido em PAX. Exige embalagem robusta e limites rígidos de lítio.",
    969: "PI 969 (Metal Lítio Com Eqpto): Similar à PI 966. Bateria separada do equipamento na mesma embalagem externa.",
    970: "PI 970 (Metal Lítio No Eqpto): Similar à PI 967. Equipamento deve estar desligado e travado."
  };

  // --- INJEÇÃO DE DOCUMENTOS GERAIS ---
  if (isLatam) {
    if (type !== BatteryType.NI_MH) {
       result.documents.push(DOCS.L7_UN383);
    }
    result.documents.push(DOCS.MSDS);
  } else {
    if (type !== BatteryType.NI_MH) {
      result.documents.push(DOCS.IATA_UN383);
    }
    result.documents.push(DOCS.MSDS);
  }

  // Helper para gerar justificativas de proibição PAX
  const getPaxForbiddenReason = (un: string) => {
    if (isLatam) return `[VARIAÇÃO L7-01] A LATAM Cargo proíbe estritamente ${un} em aeronaves de passageiros (PAX), mesmo que a IATA permita exceções.`;
    return `${un} é restrito/proibido em aeronaves de passageiros pelo IATA DGR.`;
  };

  const latamInternalApprovalText = isLatam ? " Requer procedimentos internos de aprovação LATAM Cargo além da etiqueta CAO." : "";

  // Helper para marcação da Seção II (Contained In)
  // Regra IATA PI 967/970: Isenção de marca se <= 2 volumes na remessa E <= limite por volume
  const checkSectionIIMarkingExemption = (pkgCount: number, units: number, struct: 'cell' | 'battery') => {
    const innerLimit = struct === 'cell' ? 4 : 2;
    // Se a remessa tem 2 volumes ou menos, E cada volume respeita o limite interno
    if (pkgCount <= 2 && units <= innerLimit) {
        return { required: false, label: '' };
    }
    return { required: true, label: 'Marca de Bateria de Lítio' };
  };

  // Lógica de Overpack
  if (isConsolidated && innerPackageHasLabel) {
    result.packagingSpecs?.push(DOCS.OVERPACK);
    result.labels.push('Marcação de Sobreembalagem (Overpack)');
  }

  // --- LOGICA DE DISPOSIÇÕES ESPECIAIS (Baseadas em Configuração) ---
  if (config === Configuration.PACKED_WITH || config === Configuration.CONTAINED_IN) {
    result.specialProvisions.push('A164'); // Proteção contra ativação acidental
    if (type !== BatteryType.NI_MH) {
       result.specialProvisions.push('A48');  // Isenção de teste de embalagem (UN3481/3091)
    }
  }

  // =========================================================================
  // LÓGICA 1: ÍON-LÍTIO (UN 3480 / 3481)
  // =========================================================================
  if (type === BatteryType.LI_ION) {
    const exactWh = voltage * capacityAh;
    const wh = Math.round(exactWh * 100) / 100;
    
    result.energy = wh;
    result.unit = 'Wh';
    result.calcDetails = `${voltage}V × ${capacityAh}Ah = ${wh}Wh`;

    const limitWh = structure === 'cell' ? 20 : 100;
    const isSmall = wh <= limitWh;
    const excessTxt = isSmall ? '' : ` (Excede limite de ${limitWh}Wh em ${(wh - limitWh).toFixed(1)}Wh)`;

    // --- CENÁRIO A: UN 3480 (SOLTAS/STANDALONE) ---
    if (config === Configuration.STANDALONE) {
      result.unNumber = 'UN 3480';
      result.socRuleApply = true;
      result.documents.push(DOCS.SOC);
      result.specialProvisions.push('A331'); 
      result.status = ComplianceStatus.FORBIDDEN_PAX;
      
      result.packagingSpecs?.push(PI_SUMMARIES[965]);

      // UN 3480 SEMPRE exige UN Spec Packaging (Seção IA ou IB)
      result.packagingSpecs?.push(PACKAGING.UN_SPEC, PACKAGING.UN_TESTS, PACKAGING.SHORT_CIRCUIT);

      if (isSmall) {
        // SEÇÃO IB
        if (isFedEx || isEmirates) {
           result.packingInstruction = 'PI 965 - Seção IB';
           result.dgrSection = 'Seção IB';
           result.alertColor = 'yellow';
           result.reasoning = `VARIAÇÃO OPERADOR (${airline}): Seção II não aceita. Deve seguir Seção IB.`;
           result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio', ...result.labels];
           result.awbStatement = 'Lithium Ion Batteries in compliance with Section IB of PI 965. CAO. SoC <= 30%';
           result.documents.push(DOCS.DGD);
        } else {
           result.packingInstruction = 'PI 965 - Seção IB';
           result.dgrSection = 'Seção IB';
           result.alertColor = 'red';
           result.reasoning = `UN 3480 Seção IB (≤ ${limitWh}Wh). ${getPaxForbiddenReason('UN 3480')}${latamInternalApprovalText}`;
           result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio', ...result.labels];
           result.limitPerPackage = 'PAX: PROIBIDO | CAO: 10 kg';
           result.awbStatement = 'Lithium Ion Batteries in compliance with Section IB of PI 965. CAO. SoC <= 30%';
           result.documents.push(DOCS.DGD);
           if (isLatam) result.documents.push(DOCS.L7_LANG);
        }
      } else {
        // SEÇÃO IA
        result.packingInstruction = 'PI 965 - Seção IA';
        result.dgrSection = 'Seção IA';
        result.status = ComplianceStatus.FORBIDDEN_PAX;
        result.alertColor = 'red';
        
        result.reasoning = `UN 3480 Alta Energia (> ${limitWh}Wh)${excessTxt}. Classificado como Classe 9 Regulada. ${getPaxForbiddenReason('UN 3480')}`;
        result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', ...result.labels];
        result.limitPerPackage = 'PAX: PROIBIDO | CAO: 35 kg';
        result.awbStatement = 'UN 3480, Lithium ion batteries, 9, PI 965-IA, CAO, SoC <= 30%';
        result.documents.push(DOCS.DGD);
        if (isLatam) result.documents.push(DOCS.L7_LANG);
        
        if (wh > 35000) {
            result.documents.push(DOCS.A99);
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

      if (isPackedWith) {
        result.packagingSpecs?.push(PI_SUMMARIES[966]);
      } else {
        result.packagingSpecs?.push(PI_SUMMARIES[967]);
      }

      if (isPackedWith && wh > 2.7) {
        result.socRuleApply = true;
        result.documents.push(DOCS.SOC);
      }

      if (isSmall) {
        // SEÇÃO II
        result.status = ComplianceStatus.ALLOWED;
        result.dgrSection = 'Seção II';
        result.alertColor = 'green';
        // Seção II permite Strong Rigid Packaging
        result.packagingSpecs?.push(PACKAGING.STRONG_RIGID, PACKAGING.SHORT_CIRCUIT, PACKAGING.MOVEMENT);

        const un383Warning = isLatam ? ' (L7-04: Obrigatório UN 38.3 Físico)' : '';
        result.reasoning = `UN 3481 Seção II (≤ ${limitWh}Wh). Aceito em PAX e CAO.${un383Warning}`;
        
        if (isPackedWith) {
             result.labels = ['Marca de Bateria de Lítio', ...result.labels];
             result.awbStatement = `Lithium ion batteries in compliance with Section II of PI 966${result.socRuleApply ? ', SoC <= 30%' : ''}`;
        } else {
             // Lógica de Isenção PI 967 Section II
             const markingCheck = checkSectionIIMarkingExemption(packageCount, unitsPerPackage, structure);
             if (markingCheck.required) {
               result.labels = [markingCheck.label, ...result.labels];
             } else {
               result.packagingSpecs?.push('ISENÇÃO DE ETIQUETA: Marcação dispensada (PI 967 Sec II - Baixa Qtde).');
             }
             result.awbStatement = 'Lithium ion batteries in compliance with Section II of PI 967';
        }
        result.limitPerPackage = 'PAX: 5 kg | CAO: 5 kg';
        result.documents.push(DOCS.LOC);
      } else {
        // SEÇÃO I
        result.status = ComplianceStatus.RESTRICTED;
        result.dgrSection = 'Seção I';
        result.alertColor = 'yellow';
        // Seção I exige UN Spec
        result.packagingSpecs?.push(PACKAGING.UN_SPEC, PACKAGING.UN_TESTS, PACKAGING.SHORT_CIRCUIT);
        
        result.reasoning = `UN 3481 Seção I (> ${limitWh}Wh)${excessTxt}. Classe 9 Regulada. Permitido em PAX até 5kg.`;
        result.labels = ['Etiqueta Classe 9A', ...result.labels];
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
  else if (type === BatteryType.LI_METAL) {
    const exactGrams = capacityAh * 0.3;
    const grams = Math.round(exactGrams * 100) / 100;

    result.energy = grams;
    result.unit = 'g (Lítio)';
    result.calcDetails = `${capacityAh}Ah × 0.3 ≈ ${grams}g`;

    const limitGrams = structure === 'cell' ? 1 : 2;
    const isSmall = grams <= limitGrams;
    const excessTxt = isSmall ? '' : ` (Excede limite de ${limitGrams}g em ${(grams - limitGrams).toFixed(2)}g)`;

    // --- CENÁRIO C: UN 3090 (SOLTAS/STANDALONE) ---
    if (config === Configuration.STANDALONE) {
      result.unNumber = 'UN 3090';
      result.packingInstruction = 'PI 968';
      result.status = ComplianceStatus.FORBIDDEN_PAX;
      result.alertColor = 'red';
      
      result.packagingSpecs?.push(PI_SUMMARIES[968]);

      // Seção IA/IB exige UN Spec
      result.packagingSpecs?.push(PACKAGING.UN_SPEC, PACKAGING.UN_TESTS, PACKAGING.SHORT_CIRCUIT);

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
             result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', 'Marca de Bateria de Lítio', ...result.labels];
             result.awbStatement = 'Lithium Metal Batteries in compliance with Section IB of PI 968. CAO';
         }
         result.limitPerPackage = 'PAX: PROIBIDO | CAO: 2.5 kg';
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
      } else {
         // SEÇÃO IA
         result.packingInstruction = 'PI 968 - Seção IA';
         result.dgrSection = 'Seção IA';
         result.reasoning = `UN 3090 Alta Energia (> ${limitGrams}g)${excessTxt}. ${getPaxForbiddenReason('UN 3090')}`;
         result.labels = ['Etiqueta Classe 9A', 'CAO (Cargueiro)', ...result.labels];
         result.limitPerPackage = 'PAX: PROIBIDO | CAO: 35 kg';
         result.awbStatement = 'UN 3090, Lithium metal batteries, 9, PI 968-IA, CAO';
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
         
         if (grams > 200) { 
            result.documents.push(DOCS.A99);
            result.specialProvisions.push('A99');
         }
      }
    } 
    // --- CENÁRIO D: UN 3091 (COM EQUIPAMENTO / NO EQUIPAMENTO) ---
    else {
      result.unNumber = 'UN 3091';
      const isPackedWith = config === Configuration.PACKED_WITH;
      const piNum = isPackedWith ? 'PI 969' : 'PI 970';
      result.packingInstruction = piNum;

      if (isPackedWith) {
        result.packagingSpecs?.push(PI_SUMMARIES[969]);
      } else {
        result.packagingSpecs?.push(PI_SUMMARIES[970]);
      }

      if (isSmall) {
         // SEÇÃO II
         result.status = ComplianceStatus.ALLOWED;
         result.dgrSection = 'Seção II';
         result.alertColor = 'green';
         // Seção II permite Strong Rigid
         result.packagingSpecs?.push(PACKAGING.STRONG_RIGID, PACKAGING.SHORT_CIRCUIT, PACKAGING.MOVEMENT);

         const un383Warning = isLatam ? ' (L7-04: Obrigatório UN 38.3 Físico)' : '';
         result.reasoning = `UN 3091 Seção II (≤ ${limitGrams}g). Aceito em PAX e CAO.${un383Warning}`;

         if (isPackedWith) {
             result.labels = ['Marca de Bateria de Lítio', ...result.labels];
             result.awbStatement = 'Lithium metal batteries in compliance with Section II of PI 969';
         } else {
             // Lógica de Isenção PI 970 Section II
             const markingCheck = checkSectionIIMarkingExemption(packageCount, unitsPerPackage, structure);
             if (markingCheck.required) {
                result.labels = [markingCheck.label, ...result.labels];
             } else {
                result.packagingSpecs?.push('ISENÇÃO DE ETIQUETA: Marcação dispensada (PI 970 Sec II - Baixa Qtde).');
             }
             result.awbStatement = 'Lithium metal batteries in compliance with Section II of PI 970';
         }
         result.limitPerPackage = 'PAX: 5 kg | CAO: 5 kg';
         result.documents.push(DOCS.LOC);
      } else {
         // SEÇÃO I
         result.status = ComplianceStatus.RESTRICTED;
         result.dgrSection = 'Seção I';
         result.alertColor = 'yellow';
         // Seção I exige UN Spec
         result.packagingSpecs?.push(PACKAGING.UN_SPEC, PACKAGING.UN_TESTS, PACKAGING.SHORT_CIRCUIT);
         
         result.reasoning = `UN 3091 Seção I (> ${limitGrams}g)${excessTxt}. Classe 9 Regulada. Permitido em PAX até 5kg.`;
         result.labels = ['Etiqueta Classe 9A', ...result.labels];
         result.limitPerPackage = 'PAX: 5 kg | CAO: 35 kg';
         result.awbStatement = `UN 3091, Lithium metal batteries ${isPackedWith ? 'packed with' : 'contained in'} equipment, 9, ${piNum}-I`;
         result.documents.push(DOCS.DGD);
         if (isLatam) result.documents.push(DOCS.L7_LANG);
      }
    }
  }
  // =========================================================================
  // LÓGICA 3: NI-MH (NÍQUEL-HIDRETO METÁLICO)
  // =========================================================================
  else if (type === BatteryType.NI_MH) {
    const exactWh = voltage * capacityAh;
    const wh = Math.round(exactWh * 100) / 100;
    
    result.energy = wh;
    result.unit = 'Wh';
    result.calcDetails = `${voltage}V × ${capacityAh}Ah = ${wh}Wh`;
    
    // Regra SP A199: Ni-MH é "Not Restricted" no transporte aéreo (IATA)
    // Desde que os terminais estejam protegidos.
    // UN 3496 é utilizado apenas para Marítimo (IMDG), mas referenciamos para clareza.
    
    result.status = ComplianceStatus.ALLOWED;
    result.unNumber = 'UN 3496 (A199)';
    result.dgrSection = 'Não Restrito';
    result.alertColor = 'green';
    result.packingInstruction = 'N/A (SP A199)';

    // Instruções específicas
    result.reasoning = 'REGULAMENTAÇÃO DIFERENCIADA: Para transporte AÉREO (IATA), baterias Ni-MH são classificadas como "Não Restritas" sob a Disposição Especial A199, desde que protegidas contra curto-circuito. A classificação UN 3496 (Classe 9) aplica-se apenas ao modal MARÍTIMO. A proteção dos terminais é o fator crítico de aceitação.';
    
    result.awbStatement = 'Not Restricted as per Special Provision A199';
    result.specialProvisions.push('A199');
    
    // Embalagem
    result.packagingSpecs.push(PACKAGING.SHORT_CIRCUIT);
    if (config === Configuration.PACKED_WITH || config === Configuration.CONTAINED_IN) {
        result.packagingSpecs.push('Proteção contra ativação acidental do equipamento.');
    }
    result.packagingSpecs.push('Embalagem externa forte capaz de proteger o conteúdo.');

    // LATAM geralmente segue a IATA para Ni-MH, mas a MSDS ainda é boa prática
    result.limitPerPackage = 'Sem Limite de Peso (Recomendado < 35kg para manuseio)';
    
    // Remover etiquetas de Lítio se foram adicionadas por engano
    result.labels = []; 
  }

  // --- LÓGICA DINÂMICA FINAL DE SPs ---
  const requiresVisualMarking = result.labels.some(l => 
    l.toLowerCase().includes('classe 9') || 
    l.toLowerCase().includes('marca') || 
    l.toLowerCase().includes('9a')
  );

  if (requiresVisualMarking) {
    result.specialProvisions.push('A206');
  }

  result.specialProvisions = [...new Set(result.specialProvisions)].sort();

  return result;
};
