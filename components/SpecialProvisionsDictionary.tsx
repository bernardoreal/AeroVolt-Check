
import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { 
  Book, BookOpen, Search, X, ChevronRight, Scale, GraduationCap, Box, Tag, 
  CheckSquare, List, FolderOpen, Folder, ArrowLeft, Lightbulb,
  Split, Info, FileText, ShieldCheck, AlertCircle, HardHat, ShieldAlert,
  Thermometer, Zap, ClipboardList, LifeBuoy, Shield, Ban, Hand, Warehouse,
  Anchor, Truck, AlertTriangle, Droplets, BatteryCharging, Factory, Recycle,
  Gavel, FileWarning, HelpCircle,
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { Language } from '../types';

// --- DATASETS (LOCALIZED & EXHAUSTIVE - IATA DGR 67th EDITION FORMAL STANDARDS) ---

const getGlossary = (lang: Language) => {
  const data = {
    pt: [
      { term: 'Ampère-hora (Ah)', def: 'Unidade de medida de carga elétrica que representa a transferência de um Ampère por uma hora (3.600 Coulombs). No transporte de baterias, é o dado fundamental para converter a capacidade nominal para Watts-hora (Wh) ou calcular o Teor de Lítio em gramas.', context: 'DGR 3.9.2.6(a): A capacidade nominal em Ah multiplicada pela tensão nominal em Volts resulta na energia em Wh. Essencial para classificação nas Seções I, IA, IB ou II.' },
      { term: 'Bateria (Battery)', def: 'Duas ou mais células conectadas eletricamente entre si e equipadas com dispositivos necessários para uso (ex: terminais, carcaça e marcações). Nota: Baterias unitárias de célula única são legalmente tratadas como "células".', context: 'DGR Seção 3: Power Banks e dispositivos portáteis de recarga são classificados como baterias (UN 3480) sob a Instrução de Embalagem 965.' },
      { term: 'Célula (Cell)', def: 'Uma unidade eletroquímica única e encapsulada que possui um eletrodo positivo e um negativo e exibe uma diferença de potencial elétrico entre seus terminais.', context: 'IATA PI 965-970: Células possuem limites de energia menores (20 Wh para Íon-Lítio / 1g para Metal Lítio) para fins de isenção ou simplificação regulatória.' },
      { term: 'Curto-Circuito', def: 'Um caminho acidental de baixa resistência entre os terminais de uma bateria ou célula, resultando em fluxo excessivo de corrente, geração rápida de calor e potencial ignição.', context: 'IATA 5.0.2.4: A prevenção física contra curto-circuitos (isolamento de terminais com fita, capas plásticas ou blisters individuais) é requisito absoluto para aceitação.' },
      { term: 'DGD (Shippers Decl.)', def: 'Dangerous Goods Declaration. Documento legal assinado pelo expedidor atestando que a mercadoria está devidamente classificada, descrita, embalada, marcada e etiquetada.', context: 'DGR 8.1: Obrigatória para Seções IA e IB. Deve possuir as margens laterais hachuradas em vermelho e ser preenchida obrigatoriamente em inglês.' },
      { term: 'Estado de Carga (SoC)', def: 'State of Charge. A quantidade de energia elétrica disponível em uma bateria em relação à sua capacidade nominal máxima, expressa em percentagem.', context: 'SP A331: Baterias de íon-lítio (UN 3480) não podem exceder 30% de SoC no momento do embarque. Exceções requerem aprovação estatal do Estado de Origem.' },
      { term: 'Fuga Térmica', def: 'Thermal Runaway. Um fenômeno químico onde a temperatura interna de uma célula aumenta rapidamente a ponto de causar fogo, explosão e liberação de gases tóxicos inflamáveis.', context: 'DGR App F: O fogo de lítio é uma classe de incêndio complexa que requer resfriamento intenso. Extintores Halon ou CO2 podem apagar chamas superficiais, mas não interrompem a reação química interna.' },
      { term: 'Manual de Testes (ONU)', def: 'Manual de Testes e Critérios da ONU, Parte III, Subseção 38.3. Define o protocolo de segurança global para o design de baterias de lítio.', context: 'UN 38.3: Inclui testes de altitude (T1), térmico (T2), vibração (T3), choque (T4), curto-externo (T5), impacto/esmagamento (T6), sobrecarga (T7) e descarga forçada (T8).' },
      { term: 'Watt-hora (Wh)', def: 'Unidade de energia nominal. O IATA DGR utiliza Watts-hora como o critério primário para determinar o risco e a instrução de embalagem de baterias de íon-lítio.', context: 'DGR 3.9.2.6.1: Wh = Voltagem Nominal (V) × Capacidade Nominal (Ah).' },
      { term: 'Sobreembalagem (Overpack)', def: 'Um invólucro usado por um único expedidor para conter um ou mais volumes e formar uma unidade de manuseio consolidada.', context: 'DGR 5.0.1.5: Volumes regulados dentro de um overpack devem ter suas etiquetas e marcas reproduzidas externamente, além da marca "OVERPACK" em caracteres de no mínimo 12mm.' },
    ],
    en: [
      { term: 'Ampere-hour (Ah)', def: 'A unit of electric charge, equal to the charge transferred by a steady current of one ampere for one hour.', context: 'Used to calculate Watt-hours (Wh) for battery classification per DGR 3.9.2.6.' },
      { term: 'Thermal Runaway', def: 'A chain reaction in a battery where an increase in temperature causes a further increase in temperature, leading to fire or explosion.', context: 'The primary risk associated with Lithium battery transport.' }
    ],
    es: [
      { term: 'Vatios-hora (Wh)', def: 'Unidad de energía nominal. Criterio primario para clasificar baterías de ion-litio.', context: 'Wh = Voltios (V) x Amperios-hora (Ah).' }
    ]
  };
  return data[lang];
};

const getPackaging = (lang: Language) => {
  const data = {
    pt: [
      { code: 'UN 4G / PG II', type: 'Caixa de Fibra (Fibreboard Box)', desc: 'Embalagem de especificação UN testada para suportar riscos médios (Y). Deve possuir marcação permanente do fabricante.', suitability: 'Obrigatório para Seções IA e IB. Deve suportar quedas, pressão interna e empilhamento certificado.' },
      { code: 'Strong Rigid', type: 'Embalagem Rígida e Forte', desc: 'Embalagem externa comercial que, embora não homologada UN, possui integridade estrutural para proteger o conteúdo durante o manuseio normal.', suitability: 'Permitido apenas para Seção II. Não pode ser envelope, caixa de papel pardo fino ou sacos plásticos.' },
      { code: 'Inner Pkg', type: 'Embalagem Interna (Primária)', desc: 'Invólucros que circundam individualmente cada bateria ou célula para evitar contato físico entre elas.', suitability: 'MANDATÓRIO em todos os envios. Deve ser não condutor e capaz de conter vazamentos em pequena escala.' },
      { code: '95 kPa', type: 'Diferencial de Pressão', desc: 'Capacidade da embalagem ou receptáculo de resistir a uma queda de pressão atmosférica de 95 kPa sem vazamento de fluidos.', suitability: 'Requisito mandatório para baterias de eletrólito líquido (Baterias Úmidas) conforme DGR 5.0.2.9.' },
      { code: 'Dunnage', type: 'Material de Calço/Amortecimento', desc: 'Materiais inertes usados para preencher vazios, imobilizar a carga e absorver choques mecânicos.', suitability: 'Obrigatório para garantir que as baterias não se movam dentro do volume, prevenindo danos à carcaça e ativação de dispositivos.' },
    ],
    en: [
      { code: 'UN 4G', type: 'UN Spec Fibreboard Box', desc: 'Tested packaging compliant with Packing Group II standards.', suitability: 'Mandatory for Section IA and IB shipments.' }
    ],
    es: [
      { code: 'UN 4G', type: 'Caja de Fibra homologada', desc: 'Embalaje probado para nivel de riesgo medio.', suitability: 'Obligatorio para Secciones IA y IB.' }
    ]
  };
  return data[lang];
};

const getChecklist = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Auditoria de DGD (Seção 8.1)', desc: 'Verificar se o documento está em 3 vias, em inglês, sem rasuras, assinado por pessoal certificado e com telefone de emergência 24h.', mandated: true },
      { title: 'Test Summary (UN 38.3)', desc: 'Confirmar a existência do Resumo de Teste físico (ou digital validado). A LATAM exige apresentação no aceite conforme L7-04.', mandated: true },
      { title: 'Marca de Lítio (Desenho 7.1.5.5)', desc: 'Borda hachurada vermelha, dimensões min. 100x100mm, contendo o UN Number e telefone de contato.', mandated: true },
      { title: 'Etiqueta Classe 9A (Risco)', desc: 'Etiqueta de perigo específica para baterias de lítio com símbolo de baterias em chama na metade inferior.', mandated: true },
      { title: 'Etiqueta CAO (Cargo Aircraft Only)', desc: 'Obrigatória para UN 3480 e UN 3090. Dimensões 120x110mm, cor laranja com símbolo de aeronave.', mandated: true },
      { title: 'Declaração de SoC no AWB', desc: 'Para UN 3480, verificar a frase: "Lithium ion batteries in compliance with Section XX of PI 965. State of Charge not exceeding 30%".', mandated: true },
      { title: 'Integridade dos Volumes', desc: 'Inspeção física: volumes sem furos, sinais de esmagamento, manchas de umidade ou terminais expostos.', mandated: true },
    ],
    en: [
      { title: 'DGD Verification', desc: '3 copies, English, signed, emergency phone included.', mandated: true }
    ],
    es: [
      { title: 'Verificación de DGD', desc: '3 copias, inglés, firmado, teléfono de emergencia.', mandated: true }
    ]
  };
  return data[lang];
};

const getSegregation = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Explosivos (Classe 1)', rule: 'Tabela 9.3.A', desc: 'SEGREGAR MANDATORIAMENTE de todas as divisões (exceto 1.4S).', details: 'Baterias de lítio e explosivos são incompatíveis devido ao risco de ignição mútua e aceleração de detonação em caso de incêndio.' },
      { title: 'Animais Vivos (AVI)', rule: 'DGR 9.3.2.2', desc: 'PROIBIDO carregar no mesmo compartimento se houver risco de fumaça tóxica.', details: 'O fogo de baterias de lítio libera Fluoreto de Hidrogênio (HF), um gás altamente corrosivo e letal para animais em baixas concentrações.' },
      { title: 'Líquidos Inflamáveis (Classe 3)', rule: 'Recomendação de Estiva', desc: 'Segregar sempre que possível para reduzir a propagação térmica.', details: 'Embora a IATA não proíba estritamente (dependendo da Seção), o contato de baterias em fuga térmica com líquidos combustíveis cria um incêndio incontrolável.' },
      { title: 'Fontes de Calor', rule: 'DGR 9.3.6', desc: 'Manter afastado de superfícies quentes da aeronave ou aquecedores.', details: 'Temperaturas elevadas podem degradar o separador das células, levando à instabilidade térmica espontânea.' },
    ],
    en: [
      { title: 'Class 1 (Explosives)', rule: 'Table 9.3.A', desc: 'Mandatory segregation from all divisions except 1.4S.', details: 'High risk of sympathetic detonation if a battery fire occurs.' }
    ],
    es: [
      { title: 'Explosivos (Clase 1)', rule: 'Tabla 9.3.A', desc: 'Segregar obligatoriamente de todas las divisiones excepto 1.4S.', details: 'Incompatibilidad crítica de estiba.' }
    ]
  };
  return data[lang];
};

const getDGRData = (lang: Language) => {
  const common = {
    pt: [
      { section: '1.2.7', topic: 'Responsabilidades', title: 'Obrigações Legais do Expedidor', desc: 'Responsabilidade primária por toda a conformidade.', details: 'O expedidor é o responsável legal por garantir que os artigos perigosos não são proibidos e estão classificados, embalados, marcados, etiquetados e documentados de acordo com o DGR vigente.' },
      { section: '1.3', topic: 'Capacitação', title: 'Treinamento Baseado em Competência (CBTA)', desc: 'Qualificação mandatória de pessoal.', details: 'Todo pessoal envolvido na oferta de baterias de lítio para transporte aéreo deve possuir treinamento verificado a cada 24 meses, seguindo o modelo CBTA da IATA.' },
      { section: '1.6.1', topic: 'Capacitação', title: 'Instrução Adequada (Seção II)', desc: 'Exigência simplificada para expedidores casuais.', details: 'Expedidores de volumes da Seção II devem receber instrução sobre os riscos das baterias, métodos de proteção contra curtos e requisitos de documentação simplificada.' },
      { section: '2.3', topic: 'Limitações', title: 'Artigos Perigosos com Passageiros', desc: 'Regras para bagagem de mão e despachada.', details: 'Baterias sobressalentes e Power Banks são PROIBIDOS na bagagem despachada. Devem estar na bagagem de mão, com terminais isolados e limites de 100Wh (ou 160Wh com aprovação).' },
      { section: '2.4', topic: 'Limitações', title: 'Serviço de Correio Aéreo (UPU)', desc: 'Restrições para remessas postais internacionais.', details: 'Baterias de lítio soltas (UN 3480/3090) são estritamente proibidas em malas postais. Apenas baterias contidas em equipamentos (Seção II) podem ser aceitas com limites específicos.' },
      { section: '2.8', topic: 'Limitações', title: 'Variações de Estado e Operador', desc: 'Regras mais restritivas de países e companhias.', details: 'As variações prevalecem sobre a regra geral IATA. Ex: Variação L7-01 da LATAM proíbe UN 3480 e UN 3090 em aeronaves de passageiros.' },
      { section: '3.9.2.6', topic: 'Classificação', title: 'Critérios de Segurança (UN 38.3)', desc: 'Certificação de design obrigatória.', details: 'Toda célula ou bateria de lítio deve ter passado com sucesso nos testes do Manual ONU de Testes e Critérios, Parte III, subseção 38.3. Requer Test Summary (Resumo de Teste).' },
      { section: '4.2', topic: 'Identificação', title: 'Lista de Artigos Perigosos', desc: 'A "Tabela Azul" central do manual.', details: 'Contém os dados primários de transporte: UN Number, Proper Shipping Name (PSN), Classe ou Divisão de Risco e Instruções de Embalagem (PI).' },
      { section: '5.0.2', topic: 'Embalagem', title: 'Requisitos Gerais de Embalagem', desc: 'Padrões mínimos de construção.', details: 'As embalagens devem resistir a vibrações, variações de temperatura e diferenciais de pressão (95 kPa) comuns no modal aéreo.' },
      { section: '5.0.2.4', topic: 'Embalagem', title: 'Prevenção de Ativação e Curto', desc: 'Regra física de proteção interna.', details: 'As baterias devem ser protegidas individualmente para evitar contato com materiais condutores e fixadas para evitar movimento durante o voo.' },
      { section: '7.1.5.5', topic: 'Marcação', title: 'Marca de Bateria de Lítio (Desenho)', desc: 'Especificações gráficas mandatória.', details: 'Borda hachurada vermelha, retângulo min 100x100mm. Deve incluir o UN Number correto e um telefone para informações adicionais.' },
      { section: '7.2.2.3', topic: 'Etiquetagem', title: 'Etiqueta Classe 9A (Risco)', desc: 'Risco específico para remessas reguladas.', details: 'Etiqueta de risco específica para baterias de lítio (Seção I). Apresenta sete listras pretas verticais na parte superior e símbolo de bateria na inferior.' },
      { section: '8.1', topic: 'Documentação', title: 'Preenchimento da DGD', desc: 'Normas para a Declaração do Expedidor.', details: 'Exige preenchimento legível, uso de PSN oficial, UN Number, Classe 9, Peso Líquido ou Wh, e Instrução de Embalagem aplicada (ex: 965-IA).' },
      { section: '9.3', topic: 'Manuseio', title: 'Segregação na Estiva', desc: 'Incompatibilidades críticas de carregamento.', details: 'Baterias reguladas não podem ser estivadas adjacentes a explosivos ou materiais inflamáveis que exijam etiqueta de risco.' },
    ],
    en: [
      { section: '1.2.7', topic: 'Responsibilities', title: 'Shipper Responsibilities', desc: 'Ensuring non-forbidden and compliant cargo.', details: 'Shipper is responsible for classification, packing, marking, and documentation.' }
    ],
    es: [
      { section: '1.2.7', topic: 'Responsabilidades', title: 'Responsabilidades del Expedidor', desc: 'Garantizar el cumplimiento total del DGR.', details: 'El expedidor es el responsable legal de la carga.' }
    ]
  };
  
  const langData = (lang === 'pt' ? common.pt : (common[lang] || common.pt));
  return langData;
};

const getGroupKey = (section: string) => {
  if (section.startsWith('PI')) return 'PI';
  if (section.startsWith('App')) return 'App';
  if (section.startsWith('UN')) return '4'; 
  return section.charAt(0);
};

const getSPData = (lang: Language) => {
  const data = {
    pt: [
      { code: 'A1', title: 'A1: Massa Líquida em PAX', desc: 'Restrições para aeronaves de passageiros.', details: 'Artigos proibidos em PAX conforme Tabela 4.2 podem ser aceitos sob aprovação dos Estados de Origem e Operador. Requer anotação "A1" na DGD.', reference: 'DGR 4.4' },
      { code: 'A2', title: 'A2: Variância em Quantidade (>limite)', desc: 'Aprovações para exceder limites de tabela.', details: 'Requer aprovação escrita da autoridade competente do Estado de Origem, Operador e Estados de trânsito/sobrevoo.', reference: 'DGR 4.4' },
      { code: 'A21', title: 'A21: Baterias Úmidas em Cadeiras', desc: 'Instalação em auxílios de mobilidade.', details: 'Baterias devem estar fixadas verticalmente e protegidas contra danos físicos e vazamentos acidentais de eletrólito.', reference: 'DGR 4.4' },
      { code: 'A45', title: 'A45: Baterias Alcalinas/NiCd', desc: 'Isenção para tecnologias de bateria seca.', details: 'Baterias não mencionadas explicitamente na Tabela 4.2 (alcalinas, NiCd, NiMH) não são restritas se protegidas contra curto-circuito.', reference: 'DGR 4.4' },
      { code: 'A48', title: 'A48: Isenção de Teste de Embalagem', desc: 'Para baterias instaladas em equipamentos.', details: 'Volumes da Seção II contendo baterias instaladas em equipamentos não precisam de embalagem de especificação UN se protegidos adequadamente.', reference: 'DGR 4.4' },
      { code: 'A51', title: 'A51: Massa Unitária > 35kg (CAO)', desc: 'Baterias de grande porte em cargueiros.', details: 'Baterias individuais com massa líquida superior a 35 kg podem ser transportadas em Aeronaves de Carga (CAO) com aprovação estatal.', reference: 'DGR 4.4' },
      { code: 'A67', title: 'A67: Baterias Não-Derramáveis', desc: 'Isenção para baterias úmidas seladas (VRLA).', details: 'Baterias que passam nos testes de vibração e diferencial de pressão (95 kPa) sem vazamento não são restritas.', reference: 'DGR 4.4', risk: 'low' },
      { code: 'A87', title: 'A87: Artigos com Bateria Úmida', desc: 'Equipamento contendo bateria eletrolítica.', details: 'O equipamento deve estar imobilizado e a embalagem marcada com setas de orientação "This Way Up".', reference: 'DGR 4.4' },
      { code: 'A88', title: 'A88: Protótipos/Pré-produção', desc: 'Transporte de baterias sem certificação UN 38.3.', details: 'Exige aprovação estatal, transporte exclusivo em CAO e embalagem de alta performance (PG I/X).', reference: 'IATA PI 910', risk: 'high' },
      { code: 'A94', title: 'A94: Pilhas a Combustível (Fuel Cells)', desc: 'Regras para sistemas geradores elétricos.', details: 'Equipamentos contendo pilhas a combustível devem cumprir requisitos de estanqueidade e proteção estrutural.', reference: 'DGR 4.4' },
      { code: 'A99', title: 'A99: Massa Líquida Unitária > 35kg', desc: 'Aprovações para baterias soltas gigantes.', details: 'Requer aprovação governamental do Estado de Origem. Aplica-se ao transporte de baterias industriais unitárias de alta capacidade.', reference: 'IATA PI 974', risk: 'high' },
      { code: 'A123', title: 'A123: Baterias Elétricas Gerais', desc: 'Prevenção de curto-circuito em baterias comuns.', details: 'Baterias alcalinas, NiCd e secas não são reguladas desde que os terminais estejam tapados para evitar calor perigoso.', reference: 'DGR 4.4', risk: 'low' },
      { code: 'A154', title: 'A154: Defeituosas ou Danificadas', desc: 'PROIBIÇÃO TOTAL POR RISCO CRÍTICO.', details: 'Baterias identificadas pelo fabricante como inseguras ou danificadas fisicamente (inchadas, vazando, quebradas) são proibidas no transporte aéreo.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A164', title: 'A164: Ativação Inadvertida', desc: 'Proteção contra funcionamento em trânsito.', details: 'Equipamentos portáteis devem ter interruptores protegidos ou baterias desconectadas para evitar geração de calor durante o voo.', reference: 'IATA DGR 4.4' },
      { code: 'A176', title: 'A176: Embalagens Ventiladas', desc: 'Emissões gasosas controladas.', details: 'Embalagens para baterias que ventilam em condições normais devem possuir meios de descompressão sem comprometer a integridade do volume.', reference: 'IATA DGR 4.4' },
      { code: 'A181', title: 'A181: Embalagem Mista (Ion + Metal)', desc: 'Íon e Metal no mesmo volume externo.', details: 'Permite combinar baterias de íon e metal (UN 3481/3091) na mesma embalagem externa. Aplica-se a marca de lítio com ambos os UN Numbers.', reference: 'IATA DGR 4.4' },
      { code: 'A182', title: 'A182: Baterias de Diferentes Químicas', desc: 'Equipamentos com fontes de energia mistas.', details: 'Dispositivos contendo baterias de diferentes tecnologias devem ser protegidos conforme as regras de cada química.', reference: 'IATA DGR 4.4' },
      { code: 'A183', title: 'A183: Resíduos e Reciclagem', desc: 'Baterias para descarte final.', details: 'PROIBIDO no transporte aéreo, exceto sob aprovação estatal extraordinária. Destinadas ao modal marítimo ou terrestre.', reference: 'IATA DGR 4.4', risk: 'forbidden' },
      { code: 'A185', title: 'A185: Baterias de Reserva Integradas', desc: 'Instalação de backups em dispositivos.', details: 'Dispositivos portáteis com baterias de reserva devem ser protegidos contra ativação e curtos. Aplicável a baterias CMOS.', reference: 'IATA DGR 4.4' },
      { code: 'A190', title: 'A190: Baterias em Bagagem (PED)', desc: 'Limites de segurança para passageiros.', details: 'Regras para o transporte de dispositivos eletrônicos e baterias sobressalentes portadas por viajantes.', reference: 'IATA DGR 2.3' },
      { code: 'A191', title: 'A191: Marcação e Etiquetagem de Lítio', desc: 'Padrões para aplicação da marca hachurada.', details: 'Detalha a forma correta de aplicar a marca vermelha para garantir legibilidade e identificação rápida.', reference: 'IATA DGR 7.1' },
      { code: 'A199', title: 'A199: Baterias Ni-MH (Aéreo)', desc: 'Status de não restrito para o modal aéreo.', details: 'Baterias Ni-MH não são restritas no aéreo desde que protegidas contra curto-circuito. (UN 3496 aplica-se apenas ao marítimo).', reference: 'IATA DGR 4.4', risk: 'low' },
      { code: 'A201', title: 'A201: Emergência Médica e Humanitária', desc: 'Exceções para transporte de UN 3480 em PAX.', details: 'Permite o transporte em aeronave de passageiros apenas para fins de socorro urgentes sob aprovação estatal.', reference: 'IATA DGR 4.4' },
      { code: 'A206', title: 'A206: Marca de Bateria de Lítio (Novo Design)', desc: 'Especificação visual mandatória atualizada.', details: 'Substitui o design anterior da marca de lítio. O novo padrão deve ser usado exclusivamente para remessas da Seção II.', reference: 'IATA DGR 7.2.2' },
      { code: 'A213', title: 'A213: Baterias de Sódio-Íon (UN 3551)', desc: 'Regras para novas tecnologias de Sódio.', details: 'Devem cumprir requisitos similares às de lítio quanto ao UN 38.3 e limites de SoC.', reference: 'IATA DGR 4.4' },
      { code: 'A331', title: 'A331: Estado de Carga (SoC ≤ 30%)', desc: 'Limite de segurança crítico para UN 3480.', details: 'Baterias soltas de íon-lítio devem ser oferecidas para transporte com SoC máximo de 30%. Acima disso, requer aprovação governamental.', reference: 'IATA PI 965', risk: 'high' },
      { code: 'A334', title: 'A334: Baterias no Correio Aéreo Internacional', desc: 'Restrições para malas postais.', details: 'Proibição de baterias soltas no correio internacional. Apenas Seção II instalada em equipamentos pode ser aceita.', reference: 'IATA DGR 2.4', risk: 'forbidden' },
      { code: 'A802', title: 'A802: Rigidez da Embalagem Externa', desc: 'Construção mandatória para Seção II.', details: 'Volumes da Seção II devem possuir embalagem externa rígida e forte. Envelopes e sacos plásticos são estritamente proibidos.', reference: 'IATA DGR 5.0.2' }
    ],
    en: [
      { code: 'A154', title: 'A154: Damaged / Defective', desc: 'STRICT AIR TRANSPORT PROHIBITION.', details: 'Batteries identified by the manufacturer as unsafe or damaged are forbidden.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A331', title: 'A331: SoC Limit (30%)', desc: 'Mandatory limit for UN 3480 safety.', details: 'Loose lithium ion batteries must be shipped at 30% State of Charge or less.', reference: 'IATA PI 965', risk: 'high' }
    ],
    es: [
      { code: 'A154', title: 'A154: Dañadas / Defectuosas', desc: 'PROHIBICIÓN TOTAL DE TRANSPORTE.', details: 'Las baterías identificadas como inseguras o dañadas están prohibidas en el aire.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' }
    ]
  };
  return data[lang];
};

const SECTION_METADATA: Record<string, { title: string, icon: any }> = {
  '1': { title: 'Seção 1 - Aplicabilidade', icon: Shield },
  '2': { title: 'Seção 2 - Limitações', icon: Ban },
  '3': { title: 'Seção 3 - Classificação', icon: GraduationCap },
  '4': { title: 'Seção 4 - Identificação', icon: Search },
  '5': { title: 'Seção 5 - Embalagem', icon: Box },
  '6': { title: 'Seção 6 - Especificações UN', icon: ShieldCheck },
  '7': { title: 'Seção 7 - Etiquetagem', icon: Tag },
  '8': { title: 'Seção 8 - Documentação', icon: FileText },
  '9': { title: 'Seção 9 - Manuseio & Aceite', icon: HardHat },
  'PI': { title: 'Instruções de Embalagem (PI)', icon: ClipboardList },
  'App': { title: 'Glossário & Apêndices', icon: LifeBuoy },
};

const UI_TEXT = {
  pt: {
    title: 'Wiki IATA DGR',
    subtitle: 'Base Técnica Regulatória 2026',
    search: 'Buscar SP (ex: A154), Regra (ex: 30%) ou Termo...',
    back: 'Voltar para Lista',
    summary: 'Resumo Regulatório Oficial',
    details: 'Parecer Técnico Detalhado',
    no_results: 'Nenhum registro técnico encontrado',
    tabs: { SP: 'Provisões', GLOSSARY: 'Glossário', PKG: 'Embalagens', CHK: 'Checklist', DGR: 'Seções', SEG: 'Segregação' }
  },
  en: {
    title: 'IATA DGR Wiki',
    subtitle: 'Technical Regulatory Base 2026',
    search: 'Search SP (e.g. A154), Rule (e.g. 30%) or Term...',
    back: 'Back to List',
    summary: 'Official Regulatory Summary',
    details: 'Detailed Technical View',
    no_results: 'No technical records found',
    tabs: { SP: 'Provisions', GLOSSARY: 'Glossary', PKG: 'Packaging', CHK: 'Checklist', DGR: 'Sections', SEG: 'Segregation' }
  },
  es: {
    title: 'Wiki IATA DGR',
    subtitle: 'Base Técnica Regulatoria 2026',
    search: 'Buscar SP, Regla o Término...',
    back: 'Volver a la Lista',
    summary: 'Resumen Regulatorio',
    details: 'Vista Técnica Detallada',
    no_results: 'No se encontraron registros',
    tabs: { SP: 'Disposiciones', GLOSSARY: 'Glosario', PKG: 'Embalajes', CHK: 'Checklist', DGR: 'Secciones', SEG: 'Segregación' }
  }
};

type TabType = 'SP' | 'GLOSSARY' | 'PKG' | 'CHK' | 'DGR' | 'SEG';

// Consolidating all data into one searchable export for ComplianceResult tooltips and UI
export const SPECIAL_PROVISIONS_DATA = [
    { code: 'A1', desc: 'Permite transporte em PAX sob aprovação estatal dos Estados de Origem e Operador.', reference: 'IATA DGR 4.4' },
    { code: 'A2', desc: 'Aprovações estatais para variância de quantidade ou embalagem acima dos limites da Tabela 4.2.', reference: 'IATA DGR 4.4' },
    { code: 'A21', desc: 'Regras para baterias úmidas instaladas em cadeiras de rodas ou auxílios de mobilidade.', reference: 'IATA DGR 4.4' },
    { code: 'A45', desc: 'Isenção para baterias alcalinas, NiCd e de tecnologia seca se protegidas contra curtos.', reference: 'IATA DGR 4.4' },
    { code: 'A48', desc: 'Isenção de teste de embalagem UN para baterias instaladas (Seção II) se houver proteção adequada.', reference: 'IATA DGR 4.4' },
    { code: 'A51', desc: 'Baterias individuais acima de 35kg líquidos permitidas em CAO com aprovação governamental.', reference: 'IATA DGR 4.4' },
    { code: 'A67', desc: 'Isenção para baterias úmidas seladas (Não-Derramáveis) que passam nos testes de pressão 95kPa.', reference: 'IATA DGR 4.4' },
    { code: 'A87', desc: 'Artigos contendo bateria úmida: exigência de imobilização vertical e marcação de orientação.', reference: 'IATA DGR 4.4' },
    { code: 'A88', desc: 'Baterias protótipo sem certificação UN 38.3. Exige Aprovação Estatal e transporte via CAO.', reference: 'IATA PI 910' },
    { code: 'A94', desc: 'Requisitos específicos para dispositivos contendo Pilhas a Combustível (Fuel Cells).', reference: 'IATA DGR 4.4' },
    { code: 'A99', desc: 'Exige Aprovação para exceder o limite unitário de 35kg líquidos para baterias soltas (UN 3480/3090).', reference: 'IATA PI 974' },
    { code: 'A123', desc: 'Baterias elétricas de uso comum (Alcalinas, etc) não são reguladas se terminais estiverem protegidos.', reference: 'IATA DGR 4.4' },
    { code: 'A154', desc: 'PROIBIÇÃO ESTRITA: Células ou baterias identificadas como defeituosas ou danificadas fisicamente.', reference: 'IATA DGR 3.9.2.6' },
    { code: 'A164', desc: 'Prevenção mandatória de ativação inadvertida para baterias instaladas em equipamentos.', reference: 'IATA DGR 4.4' },
    { code: 'A176', desc: 'Permissão para uso de embalagens ventiladas para baterias que emitem gases em condições normais.', reference: 'IATA DGR 4.4' },
    { code: 'A181', desc: 'Permite combinar baterias de Íon e Metal Lítio na mesma embalagem externa em UN 3481/3091.', reference: 'IATA DGR 4.4' },
    { code: 'A182', desc: 'Equipamentos contendo baterias de diferentes tecnologias químicas em um mesmo volume.', reference: 'IATA DGR 4.4' },
    { code: 'A183', desc: 'PROIBIÇÃO TOTAL de baterias destinadas ao descarte final ou reciclagem no transporte aéreo.', reference: 'IATA DGR 4.4' },
    { code: 'A185', desc: 'Regras para equipamentos com baterias de reserva integradas (ex: memórias CMOS).', reference: 'IATA DGR 4.4' },
    { code: 'A190', desc: 'Limites de transporte para passageiros portando dispositivos eletrônicos (PED).', reference: 'IATA DGR 2.3' },
    { code: 'A191', desc: 'Padrões de aplicação e design para etiquetas e marcas externas em volumes de lítio.', reference: 'IATA DGR 7.1' },
    { code: 'A199', desc: 'Ni-MH: Classificada como não restrita para IATA desde que terminais estejam protegidos contra curto.', reference: 'IATA DGR 4.4' },
    { code: 'A201', desc: 'Exceção para UN 3480/3090 em PAX sob aprovação exclusiva para emergência médica urgentes.', reference: 'IATA DGR 4.4' },
    { code: 'A206', risk: 'medium', desc: 'Obrigatório uso do novo design padronizado para a marca retangular hachurada de lítio.', reference: 'IATA DGR 7.2.2' },
    { code: 'A213', desc: 'Baterias de Sódio-Íon (UN 3551/3552): regras de design, teste e SoC análogas às de lítio.', reference: 'IATA DGR 4.4' },
    { code: 'A331', desc: 'Limite mandatório de State of Charge (SoC) de no máximo 30% para embarque de UN 3480.', reference: 'IATA PI 965' },
    { code: 'A334', desc: 'Baterias soltas (UN 3480/3090) são proibidas no serviço de correio aéreo internacional UPU.', reference: 'IATA DGR 2.4' },
    { code: 'A802', desc: 'Exigência de construção rígida e forte para embalagens externas de Seção II (Sacos proibidos).', reference: 'IATA DGR 5.0.2' }
];

export function SpecialProvisionsDictionary({ language }: { language: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('SP');
  const [search, setSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({'PI': true});

  const T = UI_TEXT[language];
  const SP_DATA = getSPData(language);
  const GLOSSARY_DATA = getGlossary(language);
  const PKG_DATA = getPackaging(language);
  const CHK_DATA = getChecklist(language);
  const DGR_DATA = getDGRData(language);
  const SEG_DATA = getSegregation(language);

  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab, isOpen]);

  const toggleExpand = (code: string) => setExpandedItem(prev => prev === code ? null : code);
  
  const toggleFolder = (key: string) => {
    setOpenFolders(prev => ({...prev, [key]: !prev[key]}));
  };

  const getRiskColor = (risk?: string) => {
    switch(risk) {
      case 'forbidden': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const renderDetailView = (item: any) => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
       <button 
         onClick={() => setSelectedSection(null)}
         className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-6 hover:text-indigo-800 transition-colors w-fit group"
       >
         <div className="p-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
            <ArrowLeft size={16} />
         </div>
         {T.back}
       </button>
       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex-1 flex flex-col">
          <div className="bg-indigo-900 p-8 text-white relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-black tracking-widest backdrop-blur-sm">
                   {item.section || item.code}
                </span>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest border-l border-white/20 pl-3">
                   {item.topic || 'DGR Reference'}
                </span>
             </div>
             <h2 className="text-xl font-black tracking-tight leading-tight relative z-10 mb-2">
                {item.title}
             </h2>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar">
             <div className="prose prose-sm prose-slate max-w-none">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{T.summary}</h3>
                <p className="text-sm font-medium text-slate-600 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic leading-relaxed shadow-inner">
                   "{item.desc}"
                </p>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{T.details}</h3>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4 font-medium">
                   {item.details || item.desc}
                </div>
                {item.reference && (
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Referência Manual IATA</span>
                    <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase">{item.reference}</span>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  const renderSP = (items: any[]) => (
    <div className="space-y-3">
       {items.map((sp) => {
         const isExpanded = expandedItem === sp.code;
         return (
           <div key={sp.code} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
              <button className="w-full text-left p-4 flex items-start gap-4" onClick={() => toggleExpand(sp.code)}>
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border text-xs font-black ${getRiskColor(sp.risk)}`}>{sp.code}</div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 truncate uppercase tracking-tight">{sp.title}</h3>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{sp.desc}</p>
                </div>
                <ChevronRight size={18} className={`text-slate-300 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
              </button>
              {isExpanded && (
                 <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1">
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">{T.details}</span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">{sp.details}</p>
                       </div>
                       <div className="flex items-center gap-2 px-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Ref:</span>
                         <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{sp.reference}</span>
                       </div>
                    </div>
                 </div>
              )}
           </div>
         );
       })}
    </div>
  );

  const renderGlossary = (items: any[]) => (
    <div className="grid gap-3">
       {items.map((item, idx) => (
         <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:border-coral-200 transition-colors group">
            <h3 className="font-black text-indigo-900 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
              {item.term}
              <GraduationCap size={14} className="text-slate-300 group-hover:text-coral-400" />
            </h3>
            <p className="text-sm text-slate-700 font-bold leading-relaxed mb-3">{item.def}</p>
            <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex gap-3 items-start">
              <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 italic leading-relaxed font-medium">{item.context}</p>
            </div>
         </div>
       ))}
    </div>
  );

  const renderPackaging = (items: any[]) => (
     <div className="grid gap-3">
        {items.map((pkg, idx) => (
           <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 text-white px-3 py-2 rounded-xl font-mono font-black text-xs text-center min-w-[70px] shadow-lg">{pkg.code}</div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{pkg.type}</h4>
              </div>
              <div className="pl-1">
                 <p className="text-xs text-slate-600 font-medium leading-relaxed">{pkg.desc}</p>
                 <div className="mt-3 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{pkg.suitability}</span>
                 </div>
              </div>
           </div>
        ))}
     </div>
  );

  const renderChecklist = (items: any[]) => (
      <div className="space-y-3">
         {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
               <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.mandated ? 'bg-coral-50 text-coral-500 shadow-inner' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckSquare size={16} strokeWidth={2.5} />
               </div>
               <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{item.desc}</p>
               </div>
            </div>
         ))}
      </div>
  );

  const renderDGR = (items: any[]) => {
    const groups: Record<string, any[]> = {};
    items.forEach(item => {
      const key = getGroupKey(item.section);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
       const order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'PI', 'App'];
       return order.indexOf(a) - order.indexOf(b);
    });

    return (
       <div className="space-y-4">
          {sortedKeys.map(key => {
             const groupItems = groups[key];
             const isOpen = openFolders[key];
             const meta = SECTION_METADATA[key] || { title: `Seção ${key}`, icon: Folder };
             const Icon = meta.icon;

             return (
               <div key={key} className={`bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg border-indigo-200 ring-1 ring-indigo-50' : 'hover:border-indigo-200'}`}>
                  <button 
                    onClick={() => toggleFolder(key)}
                    className={`w-full flex items-center justify-between p-5 ${isOpen ? 'bg-indigo-50/20' : 'bg-white'}`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                           <Icon size={20} />
                        </div>
                        <span className={`font-black text-xs uppercase tracking-widest ${isOpen ? 'text-indigo-900' : 'text-slate-600'}`}>{meta.title}</span>
                     </div>
                     <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-indigo-500' : ''}`} />
                  </button>
                  
                  {isOpen && (
                     <div className="p-4 bg-slate-50/30 border-t border-indigo-100/50 animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-1 gap-3">
                           {groupItems.map((item, idx) => (
                              <button 
                                 key={idx} 
                                 onClick={() => setSelectedSection(item)}
                                 className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left group"
                              >
                                 <div className="flex items-center justify-between w-full mb-2">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{item.section}</span>
                                    <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                 </div>
                                 <h4 className="font-black text-slate-800 mb-1.5 text-xs leading-tight group-hover:text-indigo-900 uppercase italic tracking-tight">{item.title}</h4>
                                 <p className="text-[10px] text-slate-400 line-clamp-1 font-bold opacity-70 italic">{item.desc}</p>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
             )
          })}
       </div>
    );
  };

  const renderSegregation = (items: any[]) => (
    <div className="grid gap-4">
       {items.map((seg, idx) => (
         <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-indigo-400 transition-all">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><Split size={18} /></div>
                 <h4 className="font-black text-indigo-950 text-sm uppercase tracking-tight">{seg.title}</h4>
               </div>
               <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">{seg.rule}</span>
            </div>
            <p className="text-sm text-slate-800 font-black leading-relaxed italic">"{seg.desc}"</p>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-inner">
               <ShieldAlert size={16} className="text-indigo-400 mt-0.5 shrink-0" />
               <p className="text-xs text-slate-600 font-medium leading-relaxed">{seg.details}</p>
            </div>
         </div>
       ))}
    </div>
  );

  const getData = () => {
    let data = [];
    switch(activeTab) {
      case 'SP': data = SP_DATA; break;
      case 'GLOSSARY': data = GLOSSARY_DATA; break;
      case 'PKG': data = PKG_DATA; break;
      case 'CHK': data = CHK_DATA; break;
      case 'DGR': data = DGR_DATA; break;
      case 'SEG': data = SEG_DATA; break;
    }

    if (!search.trim()) return data;

    const fuse = new Fuse(data, {
      keys: ['code', 'title', 'term', 'type', 'desc', 'details', 'def', 'section', 'rule'],
      threshold: 0.35,
      distance: 100
    });
    return fuse.search(search).map(res => res.item);
  };

  const filteredItems = getData();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 w-14 h-14 bg-coral-500 text-white rounded-full shadow-[0_8px_30px_rgba(227,6,19,0.4)] border-2 border-white/20 flex items-center justify-center z-40 transition-all hover:scale-110 active:scale-95 group print:hidden`}
        title="DGR Wiki Dictionary"
      >
        <div className="relative">
           <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
           <div className="absolute -top-1 -right-1 bg-white text-coral-600 rounded-full p-1 shadow-md">
             <Search size={10} strokeWidth={4} />
           </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
           <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-400 ease-out">
              
              {selectedSection ? (
                 <div className="h-full p-6">
                    {renderDetailView(selectedSection)}
                 </div>
              ) : (
                <>
                  <div className="p-6 pb-2 shrink-0 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                             <BookOpen size={20} />
                          </div>
                          <div>
                             <h2 className="text-lg font-black text-indigo-950 tracking-tighter uppercase italic leading-none">{T.title}</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">{T.subtitle}</p>
                          </div>
                       </div>
                       <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                          <X size={24} strokeWidth={2} />
                       </button>
                    </div>

                    <div className="relative group mb-2">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                       <input 
                         type="text" 
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         placeholder={T.search}
                         className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-300"
                       />
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-4">
                       {[
                         { id: 'SP', label: T.tabs.SP, icon: Scale },
                         { id: 'GLOSSARY', label: T.tabs.GLOSSARY, icon: GraduationCap },
                         { id: 'SEG', label: T.tabs.SEG, icon: Split },
                         { id: 'PKG', label: T.tabs.PKG, icon: Box },
                         { id: 'CHK', label: T.tabs.CHK, icon: CheckSquare },
                         { id: 'DGR', label: T.tabs.DGR, icon: FolderOpen },
                       ].map(tab => {
                         const Icon = tab.icon;
                         const isActive = activeTab === tab.id;
                         return (
                           <button 
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id as TabType)}
                             className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 h-full ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-[1.03]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                           >
                              <Icon size={18} />
                              <span className="truncate w-full text-center leading-none">{tab.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-8 bg-white no-scrollbar">
                     <div className="pt-6">
                       {filteredItems.length > 0 ? (
                          <>
                             {activeTab === 'SP' && renderSP(filteredItems)}
                             {activeTab === 'GLOSSARY' && renderGlossary(filteredItems)}
                             {activeTab === 'PKG' && renderPackaging(filteredItems)}
                             {activeTab === 'CHK' && renderChecklist(filteredItems)}
                             {activeTab === 'DGR' && renderDGR(filteredItems)}
                             {activeTab === 'SEG' && renderSegregation(filteredItems)}
                          </>
                       ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                             <div className="p-8 bg-slate-50 rounded-[2.5rem] mb-6">
                                <HelpCircle size={48} strokeWidth={1.5} className="opacity-20" />
                             </div>
                             <p className="text-sm font-black uppercase tracking-widest text-slate-400">{T.no_results}</p>
                             <button onClick={() => setSearch('')} className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-700 underline underline-offset-4">Limpar Filtros</button>
                          </div>
                       )}
                     </div>
                  </div>

                  <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-slate-400 shrink-0">
                    <div className="flex items-center gap-2">
                       <Shield size={14} className="text-indigo-400" />
                       <p className="text-[9px] font-black uppercase tracking-[0.2em]">AeroVolt Audit Intelligence</p>
                    </div>
                    <span className="text-[9px] font-bold italic opacity-60">DGR 67th Ed (2026)</span>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </>
  );
}
