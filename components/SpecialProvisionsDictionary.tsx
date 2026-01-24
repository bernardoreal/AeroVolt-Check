import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { 
  Book, BookOpen, Search, X, ChevronRight, Scale, GraduationCap, Box, Tag, 
  CheckSquare, List, FolderOpen, Folder, ArrowLeft, Lightbulb,
  Split, Info, FileText, ShieldCheck, AlertCircle, HardHat, ShieldAlert,
  Thermometer, Zap, ClipboardList, LifeBuoy, Shield, Ban, Hand, Warehouse,
  Anchor, Truck, AlertTriangle, Droplets, BatteryCharging, Factory, Recycle,
  Gavel, FileWarning, HelpCircle,
  // Fix: Added missing icon imports used in the component
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { Language } from '../types';

// --- DATASETS (LOCALIZED & EXHAUSTIVE - IATA DGR 67th EDITION FORMAL STANDARDS) ---

const getGlossary = (lang: Language) => {
  const data = {
    pt: [
      { term: 'Ampère-hora (Ah)', def: 'Unidade de medida de carga elétrica que representa a transferência de um Ampère por uma hora. No DGR, é a base para o cálculo de Watts-hora (Wh) e Teor de Lítio.', context: 'Fórmula DGR: Ah = mAh / 1000. Essencial para classificar a energia nominal de células e baterias.' },
      { term: 'Bateria (Battery)', def: 'Duas ou mais células conectadas eletricamente entre si e equipadas com dispositivos necessários para uso (ex: terminais, carcaça e marcações). Para fins de DGR, "bateria" inclui conjuntos montados.', context: 'Nota de Auditoria: Power Banks são legalmente definidos como baterias soltas (UN 3480) sob a PI 965.' },
      { term: 'Célula (Cell)', def: 'Unidade eletroquímica única e encapsulada (um eletrodo positivo e um negativo) que exibe uma voltagem diferencial entre seus dois terminais.', context: 'Diferenciação Crítica: O DGR estabelece limites de energia inferiores para células (20Wh) em comparação com baterias (100Wh) na Seção II.' },
      { term: 'Curto-Circuito', def: 'Conexão acidental de baixa resistência entre os terminais positivo e negativo de uma bateria, resultando em fluxo excessivo de corrente e evolução perigosa de calor.', context: 'IATA 5.0.2.4: A prevenção de curto-circuitos através de isolamento físico (capas, fita ou embalagem individual) é mandatória.' },
      { term: 'DGD (Shippers Decl.)', def: 'Dangerous Goods Declaration. Documento legal e oficial onde o expedidor declara que a carga cumpre todas as disposições do IATA DGR.', context: 'DGR 8.1: Obrigatória para Seção IA e IB. Deve possuir bordas vermelhas hachuradas e ser assinada por pessoal certificado.' },
      { term: 'Estado de Carga (SoC)', def: 'State of Charge. A porcentagem de energia disponível em uma bateria em relação à sua capacidade nominal total.', context: 'SP A331: Baterias UN 3480 soltas não podem exceder 30% de SoC no momento do embarque aéreo.' },
      { term: 'Fuga Térmica', def: 'Thermal Runaway. Reação química exotérmica em cadeia onde o calor gerado internamente acelera a reação, resultando em fogo violento e emissão de gases tóxicos.', context: 'Risco Sistêmico: É o principal perigo que justifica a proibição de baterias danificadas (A154) e as restrições de embalagem UN Spec.' },
      { term: 'Manual de Testes (ONU)', def: 'Manual de Testes e Critérios da ONU, Parte III, Subseção 38.3. Define o protocolo global de certificação de segurança para baterias de lítio.', context: 'Certificação UN 38.3: Inclui testes de altitude, térmicos, vibração, choque, curto-externo, impacto, sobrecarga e descarga forçada.' },
      { term: 'Watt-hora (Wh)', def: 'Unidade de energia nominal. IATA DGR 3.9.2.6 define Wh como a medida primária para classificar o risco de baterias de íon-lítio.', context: 'Cálculo Oficial: Watts-hora (Wh) = Tensão Nominal (V) × Capacidade Nominal (Ah).' },
      { term: 'Sobreembalagem (Overpack)', def: 'Invólucro usado por um único expedidor para conter um ou mais volumes e formar uma unidade de manuseio consolidada para fins de conveniência.', context: 'Marcação DGR 5.0.1.5: Se as marcas internas não forem visíveis, deve-se aplicar a marca "OVERPACK" (min 12mm) e reproduzir as etiquetas.' },
    ],
    en: [
      { term: 'Ampere-hour (Ah)', def: 'Unit of electric charge. Base for calculating Watt-hours (Wh) and Lithium Content per DGR 3.9.2.6.', context: 'DGR Formula: Ah = mAh / 1000.' },
      { term: 'Battery', def: 'Two or more cells electrically connected and fitted with devices necessary for use. Includes battery packs.', context: 'Audit Note: Power Banks are legally batteries (UN 3480).' },
      { term: 'Cell', def: 'A single encased electrochemical unit with one positive and one negative electrode.', context: 'Critical Note: Cells have lower energy limits (20Wh) than batteries (100Wh) in Section II.' },
      { term: 'State of Charge (SoC)', def: 'The available capacity in a battery expressed as a percentage of its rated capacity.', context: 'SP A331: UN 3480 batteries must not exceed 30% SoC for air transport.' },
    ],
    es: [
      { term: 'Vatios-hora (Wh)', def: 'Unidad de energía nominal. Criterio primario para clasificar baterías de ion-litio.', context: 'Cálculo: Wh = Voltios (V) x Amperios-hora (Ah).' },
      { term: 'Batería', def: 'Dos o más celdas conectadas eléctricamente y equipadas con los dispositivos necesarios para su uso.', context: 'Nota: Los Power Banks se clasifican como UN 3480.' },
    ]
  };
  return data[lang];
};

const getPackaging = (lang: Language) => {
  const data = {
    pt: [
      { code: 'UN 4G/Y', type: 'Caixa de Fibra Homologada', desc: 'Embalagem de especificação UN testada para desempenho do Grupo de Embalagem II (Médio Risco).', suitability: 'Mandatório para Seções IA e IB. Requer marcação permanente do fabricante.' },
      { code: 'Strong Rigid', type: 'Embalagem Rígida e Forte', desc: 'Embalagem comercial de alta qualidade capaz de resistir a vibrações e ao drop test de 1,2m sem falha.', suitability: 'Permitido apenas para Seção II. Não pode ser envelope ou saco plástico.' },
      { code: 'Inner Pkg', type: 'Embalagem Interna Primária', desc: 'Sacos plásticos, blisters ou divisórias que isolam fisicamente cada bateria/célula.', suitability: 'MANDATÓRIO em todos os envios para prevenir curto-circuito e movimento interno.' },
      { code: '95 kPa', type: 'Diferencial de Pressão', desc: 'Capacidade estrutural da embalagem de conter vazamentos sob variação de pressão atmosférica em altitude.', suitability: 'Mandatório para artigos contendo eletrólito líquido (Baterias Úmidas).' },
      { code: 'Absorvente', type: 'Material de Amortecimento', desc: 'Material inerte não condutor que preenche espaços vazios e protege contra impactos mecânicos.', suitability: 'Requisito para evitar quebra de terminais ou carcaça durante turbulência.' },
    ],
    en: [
      { code: 'UN 4G/Y', type: 'UN Specification Fibreboard Box', desc: 'Lab-tested packaging for Packing Group II performance standards.', suitability: 'Mandatory for Sections IA and IB. Requires visible UN mark.' },
      { code: 'Strong Rigid', type: 'Strong Rigid Outer Packaging', desc: 'Commercial packaging capable of withstanding 1.2m drop test.', suitability: 'Allowed only for Section II. Must be rigid (no envelopes).' },
    ],
    es: [
      { code: 'UN 4G/Y', type: 'Caja de Fibra Homologada UN', desc: 'Embalaje probado para nivel de riesgo Grupo de Embalaje II.', suitability: 'Obligatorio para Secciones IA y IB.' },
    ]
  };
  return data[lang];
};

const getChecklist = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Verificação DGD (8.1)', desc: 'Documento em 3 vias, inglês/português, sem rasuras, assinado e com telefone 24h.', mandated: true },
      { title: 'Resumo de Teste (UN 38.3)', desc: 'Confirmação de que o modelo de bateria passou nos 8 testes de segurança (L7-04 exige físico).', mandated: true },
      { title: 'Marca de Bateria de Lítio', desc: 'Borda hachurada vermelha (100x100mm) com UN Number e telefone de contato.', mandated: true },
      { title: 'Etiqueta Classe 9A (Risco)', desc: 'Símbolo de perigo específico para baterias de lítio na metade inferior da etiqueta.', mandated: true },
      { title: 'Etiqueta CAO (120x110mm)', desc: 'Obrigatória para UN 3480 e UN 3090. Laranja vibrante com aeronave e texto Cargo Only.', mandated: true },
      { title: 'Proteção de Terminais', desc: 'Inspeção física: baterias não podem estar soltas; terminais devem estar tapados/isolados.', mandated: true },
      { title: 'Estado de Carga (AWB)', desc: 'Verificar menção "SoC not exceeding 30%" no conhecimento aéreo para UN 3480.', mandated: true },
    ],
    en: [
      { title: 'DGD Audit (8.1)', desc: '3 copies, English, no erasures, signed, 24h emergency phone included.', mandated: true },
      { title: 'Lithium Battery Mark', desc: 'Red hatched border (100x100mm) with correct UN Number and phone.', mandated: true },
    ],
    es: [
      { title: 'Auditoría DGD (8.1)', desc: '3 copias, inglés, sin tachaduras, firmado, teléfono 24h incluido.', mandated: true },
    ]
  };
  return data[lang];
};

const getSegregation = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Explosivos (Classe 1)', rule: 'Tabela 9.3.A', desc: 'SEGREGAR MANDATORIAMENTE de todas as divisões (exceto 1.4S).', details: 'Baterias de lítio não podem ser estivadas adjacentes a explosivos devido ao risco de ignição por calor.' },
      { title: 'AVI (Animais Vivos)', rule: 'DGR 9.3.2', desc: 'PROIBIDO carregar no mesmo compartimento se houver risco de fumaça tóxica.', details: 'Gases gerados em fogo de lítio (Fluoreto de Hidrogênio) causam morte asfíxica imediata em animais.' },
      { title: 'Líquidos Inflamáveis (Cl 3)', rule: 'Recomendação', desc: 'SEGREGAR para reduzir a severidade em caso de fuga térmica.', details: 'O contato entre baterias em combustão e líquidos inflamáveis torna o fogo incontrolável pelos sistemas da aeronave.' },
      { title: 'Cargas Inertes', rule: 'Prática de Segurança', desc: 'Separar baterias por pelo menos 1 metro de outras cargas inflamáveis.', details: 'O isolamento térmico por distância evita a propagação de calor entre pallets.' },
    ],
    en: [
      { title: 'Class 1 (Explosives)', rule: 'Table 9.3.A', desc: 'MANDATORY SEGREGATION from all divisions (except 1.4S).', details: 'Lithium batteries must not be stowed adjacent to explosives.' },
    ],
    es: [
      { title: 'Explosivos (Clase 1)', rule: 'Tabla 9.3.A', desc: 'SEGREGAR de todas las divisiones (excepto 1.4S).', details: 'Baterías de litio no pueden estar junto a explosivos.' },
    ]
  };
  return data[lang];
};

const getDGRData = (lang: Language) => {
  const common = {
    pt: [
      { section: '1.2.7', topic: 'Responsabilidades', title: 'Responsabilidades do Expedidor', desc: 'Obrigação legal primária do Shipper.', details: 'O expedidor deve garantir que os artigos não são proibidos e que estão devidamente classificados, embalados, marcados, etiquetados e documentados conforme o DGR.' },
      { section: '1.3', topic: 'Treinamento', title: 'Treinamento CBTA', desc: 'Capacitação baseada em competências.', details: 'Todo pessoal que oferece baterias de lítio deve possuir treinamento verificado a cada 24 meses seguindo o modelo Competency-Based Training and Assessment (CBTA).' },
      { section: '1.6.1', topic: 'Treinamento', title: 'Instrução Adequada (Seção II)', desc: 'Requisito simplificado para pequenas remessas.', details: 'Expedidores de Seção II devem receber instrução sobre os riscos das baterias e os requisitos de proteção contra curtos e ativação.' },
      { section: '2.3', topic: 'Limitações', title: 'Provisões para Passageiros', desc: 'Regras para PED e baterias sobressalentes.', details: 'Power Banks são PROIBIDOS na mala despachada. Devem ser levados na bagagem de mão. Limite de 100Wh (sem limite de qtde) ou 160Wh (max 2 com aprovação).' },
      { section: '2.4', topic: 'Limitações', title: 'Correio Aéreo (UPU)', desc: 'Restrição em malas postais internacionais.', details: 'É proibido enviar baterias soltas por correio internacional. Baterias contidas em equipamentos (Seção II) podem ser aceitas com limites e aprovação postal.' },
      { section: '2.8', topic: 'Limitações', title: 'Variações de Estado e Operador', desc: 'Regras específicas de países e cias aéreas.', details: 'Sempre prevalece a regra mais restritiva. Ex: L7-01 da LATAM proíbe UN 3480 em aeronaves de passageiros.' },
      { section: '3.9.2.6', topic: 'Classificação', title: 'Critérios de Lítio (UN 38.3)', desc: 'Testes mandatórios de design.', details: 'Toda célula ou bateria deve ser submetida aos testes T1 (Altitude) a T8 (Descarga Forçada). Deve operar sob um sistema de gestão de qualidade certificado.' },
      { section: '4.2', topic: 'Identificação', title: 'Lista de Artigos Perigosos', desc: 'Tabela oficial (Páginas Azuis).', details: 'Define o Nome Correto (PSN), UN Number, Classe 9 e Instruções de Embalagem (PI) para aeronaves PAX e CAO.' },
      { section: '4.4', topic: 'Identificação', title: 'Disposições Especiais (SPs)', desc: 'Série A de regras específicas.', details: 'A coluna M das páginas azuis remete à Seção 4.4, detalhando exceções ou exigências extras para cada UN.' },
      { section: '5.0.2', topic: 'Embalagem', title: 'Requisitos Gerais de Embalagem', desc: 'Padrões de construção e segurança.', details: 'Embalagens devem resistir a vibrações e variações térmicas (-40°C a +55°C) e de pressão (95 kPa).' },
      { section: '5.0.2.4', topic: 'Embalagem', title: 'Prevenção de Curto-Circuito', desc: 'Regra física mandatória.', details: 'Terminais devem estar isolados ou protegidos de modo que o contato com materiais condutores seja fisicamente impossível.' },
      { section: '5.0.3', topic: 'Embalagem', title: 'Sobreembalagem (Overpack)', desc: 'Consolidação de volumes unitários.', details: 'Volumes internos devem ser homologados. A sobreembalagem deve portar a marca "OVERPACK" e reproduzir todas as etiquetas de perigo visivelmente.' },
      { section: '7.1.5.5', topic: 'Marcação', title: 'Marca de Bateria de Lítio', desc: 'Especificações gráficas do símbolo.', details: 'Retângulo com bordas hachuradas vermelhas. Deve conter o UN Number e telefone. Tamanho mínimo: 100x100mm (ou 100x70mm se volume pequeno).' },
      { section: '7.2.2.3', topic: 'Etiquetagem', title: 'Etiqueta Classe 9A', desc: 'Risco específico para baterias.', details: 'Etiqueta de risco específica para Baterias de Lítio (Seção IA/IB). Metade superior com faixas verticais e metade inferior com símbolo de baterias.' },
      { section: '8.1.6', topic: 'Documentação', title: 'Preenchimento da DGD', desc: 'Padrões da declaração legal.', details: 'Campos obrigatórios: Nome do Expedidor, Destinatário, UN Number, PSN, Classe 9, Quantidade Líquida e PI aplicada.' },
      { section: '9.3', topic: 'Manuseio', title: 'Segregação na Estiva', desc: 'Incompatibilidades químicas.', details: 'Baterias reguladas não podem ser carregadas junto com explosivos ou substâncias que emitam calor extremo.' },
      { section: 'App F', topic: 'Emergência', title: 'Resposta a Incêndios', desc: 'Protocolo de combate ao fogo de lítio.', details: 'Uso de água em abundância para resfriar as baterias vizinhas e interromper a fuga térmica (extintores de pó ou CO2 são ineficazes no químico).' },
    ],
    en: [
      { section: '1.2.7', topic: 'Rules', title: 'Shipper Responsibilities', desc: 'Legal primary obligation.', details: 'Shipper must ensure articles are not forbidden and are properly classified, packed, marked, labeled, and documented.' },
    ],
    es: [
      { section: '1.2.7', topic: 'Reglas', title: 'Responsabilidades del Expedidor', desc: 'Obligación legal primaria.', details: 'El expedidor debe garantizar que los artículos no están prohibidos y cumplen con el DGR.' },
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
      { code: 'A1', title: 'A1: Massa Líquida em PAX', desc: 'Restrições para aeronaves de passageiros.', details: 'Artigos proibidos em PAX (como UN 3480/3090) podem ser aceitos sob aprovação dos Estados de Origem e Operador. Requer anotação "A1" na DGD.', reference: 'IATA DGR 4.4' },
      { code: 'A2', title: 'A2: Variância em Massa (>limite)', desc: 'Aprovações para exceder limites de tabela.', details: 'Requer aprovação escrita da autoridade competente do Estado de Origem, Operador e Estados de sobrevoo.', reference: 'IATA DGR 4.4' },
      { code: 'A21', title: 'A21: Baterias Úmidas em Cadeiras', desc: 'Instalação em auxílios de mobilidade.', details: 'Baterias devem estar fixadas verticalmente e protegidas contra danos e vazamentos de eletrólito.', reference: 'IATA DGR 4.4' },
      { code: 'A45', title: 'A45: Baterias Alcalinas/NiCd', desc: 'Isenção para tecnologias de bateria seca.', details: 'Baterias não mencionadas explicitamente na Tabela 4.2 (alcalinas, NiCd, NiMH) não são restritas se protegidas contra curto-circuito.', reference: 'IATA DGR 4.4' },
      { code: 'A48', title: 'A48: Isenção de Teste de Embalagem', desc: 'Para baterias instaladas (Seção II).', details: 'Volumes da Seção II contendo baterias instaladas em equipamentos não precisam de embalagem de especificação UN se protegidos adequadamente.', reference: 'IATA DGR 4.4' },
      { code: 'A51', title: 'A51: Massa Unitária > 35kg (CAO)', desc: 'Baterias grandes em aeronaves de carga.', details: 'Baterias individuais com massa líquida acima de 35 kg podem ser transportadas em CAO com aprovação governamental específica.', reference: 'IATA DGR 4.4' },
      { code: 'A67', title: 'A67: Baterias Não-Derramáveis', desc: 'Isenção para baterias úmidas seladas (VRLA).', details: 'Baterias que passam nos testes de vibração e diferenciais de pressão (95 kPa) sem vazamento não são restritas.', reference: 'IATA DGR 4.4', risk: 'low' },
      { code: 'A87', title: 'A87: Artigos com Bateria Úmida', desc: 'Proteção e orientação vertical mandatória.', details: 'O equipamento deve estar imobilizado e a embalagem marcada com setas de orientação "This Way Up".', reference: 'IATA DGR 4.4' },
      { code: 'A88', title: 'A88: Protótipos/Pré-produção', desc: 'Transporte sem testes UN 38.3 completos.', details: 'Exige aprovação estatal e transporte exclusivo em Aeronaves de Carga (CAO). Requer embalagem de alta performance (PG I/X).', reference: 'IATA PI 910', risk: 'high' },
      { code: 'A94', title: 'A94: Pilhas a Combustível (Fuel Cells)', desc: 'Regras para eletrólitos em sistemas elétricos.', details: 'Equipamentos contendo pilhas a combustível devem cumprir requisitos específicos de estanqueidade e proteção física.', reference: 'IATA DGR 4.4' },
      { code: 'A99', title: 'A99: Massa Líquida Unitária > 35kg', desc: 'Baterias soltas gigantes (UN 3480/3090).', details: 'Requer aprovação governamental do Estado de Origem. Aplica-se ao transporte de baterias industriais unitárias de grande porte.', reference: 'IATA PI 974', risk: 'high' },
      { code: 'A123', title: 'A123: Baterias Elétricas Gerais', desc: 'Isolamento mandatório de terminais.', details: 'Baterias não reguladas (Ex: Alcalinas) são isentas de marcação DESDE QUE os terminais estejam tapados para evitar calor perigoso.', reference: 'IATA DGR 4.4', risk: 'low' },
      { code: 'A154', title: 'A154: Defeituosas ou Danificadas', desc: 'PROIBIÇÃO TOTAL POR RISCO DE EXPLOSÃO.', details: 'Células ou baterias identificadas pelo fabricante como inseguras ou danificadas fisicamente são proibidas no transporte aéreo.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A164', title: 'A164: Ativação Inadvertida', desc: 'Proteção contra funcionamento acidental.', details: 'Equipamentos devem ter interruptores protegidos ou baterias desconectadas para evitar geração de calor durante o voo.', reference: 'IATA DGR 4.4' },
      { code: 'A176', title: 'A176: Embalagens Ventiladas', desc: 'Para baterias que podem emitir gases.', details: 'Embalagens para baterias que ventilam em condições normais devem permitir a saída controlada de gases sem comprometer o volume.', reference: 'IATA DGR 4.4' },
      { code: 'A181', title: 'A181: Embalagem Mista (Ion + Metal)', desc: 'Íon e Metal no mesmo volume externo.', details: 'Permite combinar baterias de íon e metal (UN 3481/3091) na mesma embalagem externa. Aplica-se a regra mais restritiva.', reference: 'IATA DGR 4.4' },
      { code: 'A183', title: 'A183: Resíduos e Reciclagem', desc: 'Baterias destinadas ao descarte final.', details: 'PROIBIDO no transporte aéreo, exceto com aprovação especial. Destinadas geralmente ao modal marítimo por segurança.', reference: 'IATA DGR 4.4', risk: 'forbidden' },
      { code: 'A185', title: 'A185: Baterias de Reserva Integradas', desc: 'Proteção para fontes de backup em PED.', details: 'Dispositivos com baterias de reserva devem ser protegidos contra ativação e curtos. Aplicável a memórias CMOS e backups.', reference: 'IATA DGR 4.4' },
      { code: 'A190', title: 'A190: Baterias em Bagagem', desc: 'Limites para passageiros portando PEDs.', details: 'Aplica-se ao transporte de dispositivos eletrônicos contendo baterias de lítio por passageiros ou tripulantes.', reference: 'IATA DGR 2.3' },
      { code: 'A191', title: 'A191: Marcação e Etiquetagem', desc: 'Padrões de aplicação visual.', details: 'Detalha a forma correta de aplicar as etiquetas de perigo e marcas nos volumes para evitar ambiguidade.', reference: 'IATA DGR 7.1' },
      { code: 'A199', title: 'A199: Baterias Ni-MH', desc: 'Não restrito para IATA (Modal Aéreo).', details: 'Apenas os terminais devem estar protegidos. Não se aplicam marcas de lítio ou etiquetas da Classe 9. (UN 3496 é apenas marítimo).', reference: 'IATA DGR 4.4', risk: 'low' },
      { code: 'A201', title: 'A201: Emergência Médica e Humanitária', desc: 'Exceção para UN 3480/3090 em PAX.', details: 'Permite transporte em aeronave de passageiros sob aprovação exclusiva para fins médicos ou de socorro urgentes.', reference: 'IATA DGR 4.4' },
      { code: 'A206', title: 'A206: Marca de Bateria de Lítio (Design)', desc: 'Especificação técnica da marca vermelha.', details: 'A nova marca deve seguir as proporções exatas e UN Number legível. Substitui todas as marcas antigas.', reference: 'IATA DGR 7.2.2' },
      { code: 'A213', title: 'A213: Baterias de Sódio-Íon (UN 3551)', desc: 'Regras para tecnologia Sódio-Íon.', details: 'Devem cumprir requisitos similares ao lítio (UN 38.3) e limites de SoC (30% para soltas). Classificação UN 3551 ou UN 3552.', reference: 'IATA DGR 4.4' },
      { code: 'A331', title: 'A331: Estado de Carga (SoC ≤ 30%)', desc: 'Limite crítico para segurança de UN 3480.', details: 'Baterias soltas devem ser embarcadas com SoC ≤ 30% da capacidade nominal. Acima disso, exige aprovação estatal.', reference: 'IATA PI 965', risk: 'high' },
      { code: 'A334', title: 'A334: Baterias no Correio Internacional', desc: 'Restrição em malas postais da UPU.', details: 'Apenas baterias instaladas em equipamentos (Seção II) podem ser enviadas por correio aéreo internacional com aprovação.', reference: 'IATA DGR 2.4', risk: 'forbidden' },
      { code: 'A802', title: 'A802: Embalagem Externa Rígida', desc: 'Construção mandatória da embalagem.', details: 'Volumes da Seção II devem ser rígidos e fortes. O uso de envelopes (Padded bags) ou sacos plásticos é terminantemente proibido.', reference: 'IATA DGR 5.0.2' }
    ],
    en: [
      { code: 'A154', title: 'A154: Damaged / Defective', desc: 'STRICT PROHIBITION DUE TO FIRE RISK.', details: 'Batteries identified by the manufacturer as unsafe or damaged are forbidden in air transport.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A331', title: 'A331: SoC Limit (30%)', desc: 'Mandatory safety limit for UN 3480.', details: 'Loose lithium ion batteries must be shipped at 30% SoC or less.', reference: 'IATA PI 965', risk: 'high' },
    ],
    es: [
      { code: 'A154', title: 'A154: Dañadas / Defectuosas', desc: 'PROHIBICIÓN TOTAL DE TRANSPORTE.', details: 'Baterías identificadas como inseguras o dañadas están prohibidas en el aire.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
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
  '9': { title: 'Seção 9 - Manuseio & NOTOC', icon: HardHat },
  'PI': { title: 'Instruções de Embalagem', icon: ClipboardList },
  'App': { title: 'Glossário & Emergência', icon: LifeBuoy },
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
    { code: 'A1', desc: 'Permite transporte em PAX sob aprovação estatal.', reference: 'IATA DGR 4.4' },
    { code: 'A2', desc: 'Aprovações estatais para variância de quantidade/embalagem.', reference: 'IATA DGR 4.4' },
    { code: 'A21', desc: 'Baterias úmidas em cadeiras de rodas (proteção mandatória).', reference: 'IATA DGR 4.4' },
    { code: 'A45', desc: 'Isenção para alcalinas/NiCd se protegidas contra curtos.', reference: 'IATA DGR 4.4' },
    { code: 'A48', desc: 'Isenção de teste UN para baterias instaladas (Seção II).', reference: 'IATA DGR 4.4' },
    { code: 'A51', desc: 'Baterias >35kg em CAO com aprovação específica.', reference: 'IATA DGR 4.4' },
    { code: 'A67', desc: 'Isenção para baterias úmidas seladas (Não-Derramáveis).', reference: 'IATA DGR 4.4' },
    { code: 'A87', desc: 'Artigos com bateria úmida: fixação vertical e marcação mandatórias.', reference: 'IATA DGR 4.4' },
    { code: 'A88', desc: 'Protótipos (sem UN38.3). Exige Aprovação Governamental e CAO.', reference: 'IATA PI 910' },
    { code: 'A94', desc: 'Regras para Pilhas a Combustível (Fuel Cells).', reference: 'IATA DGR 4.4' },
    { code: 'A99', desc: 'Exige Aprovação para exceder limite unitário de 35kg líquidos.', reference: 'IATA PI 974' },
    { code: 'A123', desc: 'Baterias elétricas gerais não reguladas se protegidas contra curtos.', reference: 'IATA DGR 4.4' },
    { code: 'A154', desc: 'PROIBIÇÃO TOTAL: Baterias defeituosas ou danificadas.', reference: 'IATA DGR 3.9.2.6' },
    { code: 'A164', desc: 'Prevenção mandatória de ativação acidental do equipamento.', reference: 'IATA DGR 4.4' },
    { code: 'A176', desc: 'Embalagens ventiladas para baterias que emitem gases.', reference: 'IATA DGR 4.4' },
    { code: 'A181', desc: 'Permite misturar Íon e Metal no mesmo volume externo.', reference: 'IATA DGR 4.4' },
    { code: 'A182', desc: 'Equipamentos com baterias de diferentes químicas.', reference: 'IATA DGR 4.4' },
    { code: 'A183', desc: 'PROIBIDO: Baterias para lixo/descarte no ar.', reference: 'IATA DGR 4.4' },
    { code: 'A185', desc: 'Equipamentos com baterias de reserva (proteção contra curtos).', reference: 'IATA DGR 4.4' },
    { code: 'A190', desc: 'Baterias de lítio em dispositivos portáteis em bagagem.', reference: 'IATA DGR 2.3' },
    { code: 'A191', desc: 'Padrões de marcação e etiquetagem externa.', reference: 'IATA DGR 7.1' },
    { code: 'A199', desc: 'Ni-MH: Não restrito no aéreo se os terminais estiverem protegidos.', reference: 'IATA DGR 4.4' },
    { code: 'A201', desc: 'Exceção para UN 3480 em PAX para urgência médica aprovada.', reference: 'IATA DGR 4.4' },
    { code: 'A206', risk: 'medium', desc: 'Uso obrigatório do design padronizado para a marca de lítio.', reference: 'IATA DGR 7.2.2' },
    { code: 'A213', desc: 'Baterias de Sódio-Íon (UN 3551/3552) - Lógica similar ao Lítio.', reference: 'IATA DGR 4.4' },
    { code: 'A331', desc: 'Limite mandatório de 30% SoC para UN 3480.', reference: 'IATA PI 965' },
    { code: 'A334', desc: 'Proibição de baterias soltas no correio aéreo internacional.', reference: 'IATA DGR 2.4' },
    { code: 'A802', desc: 'Embalagens externas rígidas e fortes mandatórias (Seção II).', reference: 'IATA DGR 5.0.2' }
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
