import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { 
  Book, Search, X, ChevronRight, Scale, GraduationCap, Box, Tag, 
  CheckSquare, List, FolderOpen, Folder, ArrowLeft, Lightbulb,
  Split, Info, FileText, ShieldCheck, AlertCircle, HardHat, ShieldAlert,
  Thermometer, Zap, ClipboardList, LifeBuoy, Shield, Ban, Hand, Warehouse,
  Anchor, Truck, AlertTriangle
} from 'lucide-react';
import { Language } from '../types';

// --- DATASETS (LOCALIZED & EXPANDED) ---

const getGlossary = (lang: Language) => {
  const data = {
    pt: [
      { term: 'Ampère-hora (Ah)', def: 'Unidade de medida de carga elétrica, fundamental para determinar a energia total da bateria.', context: 'Fórmula crítica: Ah = mAh / 1000. Multiplique por Volts para obter Watts-hora (Wh).' },
      { term: 'Bateria (Battery)', def: 'Unidade composta por duas ou mais células conectadas eletricamente. IMPORTANTE: Power Banks são classificados como Baterias para transporte.', context: 'Muitos expedidores confundem Power Banks com "equipamentos". Eles são UN 3480 (Baterias Soltas).' },
      { term: 'Célula (Cell)', def: 'Unidade eletroquímica única e encapsulada (ex: uma pilha AA ou uma célula 18650). Uma "Bateria" de laptop é feita de várias "Células".', context: 'Os limites de energia diferem para Células (20Wh) e Baterias (100Wh) na Seção II.' },
      { term: 'Curto-Circuito', def: 'Contato direto acidental entre os terminais positivo e negativo, gerando calor extremo instantâneo.', context: 'Causa #1 de incêndios. Prevenção mandatória: Proteger terminais com fita, capas ou embalagem individual.' },
      { term: 'DGD (Shippers Decl.)', def: 'Declaração do Expedidor de Artigos Perigosos. Documento legal que descreve a carga, riscos e conformidade.', context: 'Obrigatório para Seção I (IA/IB). Deve ser preenchido em Inglês, sem rasuras, assinado e com bordas hachuradas vermelhas.' },
      { term: 'Estado de Carga (SoC)', def: 'Porcentagem de energia armazenada na bateria em relação à sua capacidade total.', context: 'Para UN 3480 (Baterias Soltas), o limite MÁXIMO é 30% para reduzir a severidade em caso de fuga térmica.' },
      { term: 'Fuga Térmica', def: 'Reação química em cadeia, auto-sustentável, onde o calor gera mais calor, resultando em fogo violento e gases tóxicos.', context: 'Extremamente difícil de extinguir. É o principal motivo das restrições severas da IATA.' },
      { term: 'Watt-hora (Wh)', def: 'Unidade de energia que combina Tensão e Capacidade. Define a classificação regulatória da bateria.', context: 'Cálculo: Volts (V) x Ampère-hora (Ah). > 100Wh classifica a bateria como Artigo Perigoso Pleno (Classe 9, Seção IA).' },
      { term: 'Sobreembalagem (Overpack)', def: 'Embalagem utilizada para consolidar um ou mais volumes (caixas) para facilitar o manuseio.', context: 'Se as etiquetas de perigo internas não forem visíveis, o Overpack deve ser marcado com a palavra "OVERPACK" e reproduzir as etiquetas.' },
      { term: 'UN 38.3', def: 'Série de testes (T1 a T8) que as baterias devem passar para serem aceitas para transporte.', context: 'Inclui testes de altitude, térmico, vibração, choque, curto-circuito externo, impacto, sobrecarga e descarga forçada.' },
      { term: 'PSN (Proper Shipping Name)', def: 'O nome técnico atribuído pela ONU ao artigo perigoso.', context: 'Ex: "Lithium ion batteries" ou "Lithium metal batteries contained in equipment".' },
    ],
    en: [
      { term: 'Ampere-hour (Ah)', def: 'Unit of electric charge measure, fundamental for determining total battery energy.', context: 'Critical formula: Ah = mAh / 1000. Multiply by Volts to get Watt-hours (Wh).' },
      { term: 'Battery', def: 'Unit composed of two or more electrically connected cells. IMPORTANT: Power Banks are classified as Batteries for transport.', context: 'Many shippers confuse Power Banks with "equipment". They are UN 3480 (Standalone Batteries).' },
      { term: 'Cell', def: 'Single encased electrochemical unit (e.g., one AA battery or one 18650 cell). A laptop "Battery" is made of multiple "Cells".', context: 'Energy limits differ for Cells (20Wh) and Batteries (100Wh) in Section II.' },
      { term: 'Short Circuit', def: 'Accidental direct contact between positive and negative terminals, generating instant extreme heat.', context: '#1 Cause of fires. Mandatory prevention: Protect terminals with tape, caps, or individual packaging.' },
      { term: 'DGD (Shippers Decl.)', def: 'Shippers Declaration for Dangerous Goods. Legal document describing cargo, risks, and compliance.', context: 'Mandatory for Section I (IA/IB). Must be filled in English, no erasures, signed, and with red hatched borders.' },
      { term: 'State of Charge (SoC)', def: 'Percentage of stored energy in the battery relative to its total capacity.', context: 'For UN 3480 (Standalone Batteries), the MAXIMUM limit is 30% to reduce severity in case of thermal runaway.' },
      { term: 'Thermal Runaway', def: 'Self-sustaining chain chemical reaction where heat generates more heat, resulting in violent fire and toxic gases.', context: 'Extremely difficult to extinguish. It is the main reason for strict IATA restrictions.' },
      { term: 'Watt-hour (Wh)', def: 'Unit of energy combining Voltage and Capacity. Defines the battery\'s regulatory classification.', context: 'Calculation: Volts (V) x Ampere-hour (Ah). > 100Wh classifies the battery as Fully Regulated Dangerous Goods (Class 9, Section IA).' },
      { term: 'Overpack', def: 'Enclosure used to consolidate one or more packages to facilitate handling.', context: 'If internal hazard labels are not visible, the Overpack must be marked with the word "OVERPACK" and reproduce the labels.' },
      { term: 'UN 38.3', def: 'Series of tests (T1 to T8) that batteries must pass to be accepted for transport.', context: 'Includes altitude, thermal, vibration, shock, external short circuit, impact, overcharge, and forced discharge tests.' },
    ],
    es: [
      { term: 'Amperio-hora (Ah)', def: 'Unidad de medida de carga eléctrica, fundamental para determinar la energía total de la batería.', context: 'Fórmula crítica: Ah = mAh / 1000. Multiplique por Voltios para obtener Vatios-hora (Wh).' },
      { term: 'Batería (Battery)', def: 'Unidad compuesta por dos o más celdas conectadas eléctricamente. IMPORTANTE: Los Power Banks se clasifican como Baterías para el transporte.', context: 'Muchos expedidores confunden Power Banks con "equipos". Son UN 3480 (Baterías Sueltas).' },
      { term: 'Celda (Cell)', def: 'Unidad electroquímica única y encapsulada (ej: una pila AA o una celda 18650). Una "Batería" de laptop está hecha de varias "Celdas".', context: 'Los límites de energía difieren para Celdas (20Wh) y Baterías (100Wh) en la Sección II.' },
      { term: 'Cortocircuito', def: 'Contacto directo accidental entre terminales positivo y negativo, generando calor extremo instantáneo.', context: 'Causa #1 de incendios. Prevención obligatoria: Proteger terminales con cinta, tapas o embalaje individual.' },
      { term: 'DGD (Shippers Decl.)', def: 'Declaración del Expedidor de Mercancías Peligrosas. Documento legal que describe carga, riesgos y cumplimiento.', context: 'Obligatorio para Sección I (IA/IB). Debe llenarse en Inglés, sin tachaduras, firmado y con bordes rojos rayados.' },
      { term: 'Estado de Carga (SoC)', def: 'Porcentaje de energía almacenada en la batería en relación a su capacidad total.', context: 'Para UN 3480 (Baterías Sueltas), el límite MÁXIMO es 30% para reducir severidad en caso de fuga térmica.' },
      { term: 'Fuga Térmica', def: 'Reacción química en cadena, autosostenible, donde el calor genera más calor, resultando en fuego violento y gases tóxicos.', context: 'Extremadamente difícil de extinguir. Es la razón principal de las restricciones estrictas de IATA.' },
      { term: 'Vatio-hora (Wh)', def: 'Unidad de energía que combina Voltaje y Capacidad. Define la clasificación regulatoria de la batería.', context: 'Cálculo: Voltios (V) x Amperio-hora (Ah). > 100Wh clasifica la batería como Mercancía Peligrosa Plena (Clase 9, Sección IA).' },
      { term: 'Sobrembalaje (Overpack)', def: 'Embalaje utilizado para consolidar uno o más bultos para facilitar la manipulación.', context: 'Si las etiquetas de peligro internas no son visibles, el Sobrembalaje debe marcarse con la palabra "OVERPACK" y recibir las etiquetas.' },
    ]
  };
  return data[lang];
};

const getPackaging = (lang: Language) => {
  const data = {
    pt: [
      { code: '4G (Fiberboard Box)', type: 'Caixa de Papelão (Fibra)', desc: 'Embalagem mais comum. Deve ser de alta qualidade, resistente à água e a impactos. Para Seção I, deve ser homologada UN (ex: UN 4G/Y...).', suitability: 'Uso Universal (Seção IA, IB e II)' },
      { code: '4D (Plywood Box)', type: 'Caixa de Madeira Compensada', desc: 'Embalagem de alta resistência feita de folhas de madeira coladas. Utilizada para baterias pesadas ou conjuntos industriais.', suitability: 'Uso Industrial / Pesado' },
      { code: 'UN Specification', type: 'Embalagem Homologada UN', desc: 'Embalagem testada em laboratório (Queda, Empilhamento, Absorção de água). Obrigatória para envios da Seção IA e IB. Possui marcação codificada (ex: 4G/Y12/S...).', suitability: 'Mandatório para Seção I (IA/IB)' },
      { code: 'Strong Rigid Packaging', type: 'Embalagem Rígida e Forte', desc: 'Embalagem comercial de boa qualidade, capaz de suportar queda de 1.2m sem danos ao conteúdo. Não requer marcação UN.', suitability: 'Permitido APENAS para Seção II' },
      { code: 'Inner Packaging', type: 'Embalagem Interna', desc: 'Proteção individual para cada bateria/célula (blister, plástico bolha, caixa pequena) para evitar contato entre elas (curto-circuito).', suitability: 'Obrigatório em TODOS os casos' },
      { code: '1G (Fibre Drum)', type: 'Tambor de Fibra', desc: 'Utilizado para volumes cilíndricos ou grandes quantidades de células pequenas.', suitability: 'Específico (Seção IA/IB)' },
    ],
    en: [
      { code: '4G (Fiberboard Box)', type: 'Fiberboard Box', desc: 'Most common packaging. Must be high quality, water and impact resistant. For Section I, must be UN specification (e.g., UN 4G/Y...).', suitability: 'Universal Use (Section IA, IB and II)' },
      { code: '4D (Plywood Box)', type: 'Plywood Box', desc: 'High strength packaging made of glued wood sheets. Used for heavy batteries or industrial assemblies.', suitability: 'Industrial / Heavy Duty' },
      { code: 'UN Specification', type: 'UN Specification Packaging', desc: 'Lab tested packaging (Drop, Stack, Water Absorption). Mandatory for Section IA and IB shipments. Has coded marking (e.g., 4G/Y12/S...).', suitability: 'Mandatory for Section I (IA/IB)' },
      { code: 'Strong Rigid Packaging', type: 'Strong Rigid Packaging', desc: 'Good quality commercial packaging, capable of withstanding 1.2m drop without damage to contents. Does not require UN marking.', suitability: 'Allowed ONLY for Section II' },
      { code: 'Inner Packaging', type: 'Inner Packaging', desc: 'Individual protection for each battery/cell (blister, bubble wrap, small box) to prevent contact between them (short circuit).', suitability: 'Mandatory in ALL cases' },
    ],
    es: [
      { code: '4G (Fiberboard Box)', type: 'Caja de Cartón (Fibra)', desc: 'Embalaje más común. Debe ser de alta calidad, resistente al agua e impactos. Para Sección I, debe ser homologada UN (ej: UN 4G/Y...).', suitability: 'Uso Universal (Sección IA, IB y II)' },
      { code: '4D (Plywood Box)', type: 'Caja de Madera Contrachapada', desc: 'Embalaje de alta resistencia hecho de hojas de madera pegadas. Utilizada para baterías pesadas o conjuntos industriales.', suitability: 'Uso Industrial / Pesado' },
      { code: 'UN Specification', type: 'Embalaje Homologado UN', desc: 'Embalaje probado en laboratorio (Caída, Apilamiento, Absorción de agua). Obligatorio para envíos de Sección IA e IB. Tiene marcado codificado (ej: 4G/Y12/S...).', suitability: 'Mandatorio para Sección I (IA/IB)' },
      { code: 'Strong Rigid Packaging', type: 'Embalaje Rígido y Fuerte', desc: 'Embalaje comercial de buena calidad, capaz de soportar caída de 1.2m sin daños al contenido. No requiere marca UN.', suitability: 'Permitido SOLO para Sección II' },
      { code: 'Inner Packaging', type: 'Embalaje Interno', desc: 'Protección individual para cada batería/celda (blíster, plástico de burbujas, caixa pequeña) para evitar contacto entre ellas (cortocircuito).', suitability: 'Obligatorio en TODOS los casos' },
    ]
  };
  return data[lang];
};

const getChecklist = (lang: Language) => {
  const data = {
    pt: [
      { title: 'DGD (Shippers Declaration)', desc: 'Para Seção I: Deve estar em Inglês, sem rasuras, assinada, com telefone de emergência 24h válido. As colunas devem ter bordas hachuradas vermelhas.', mandated: true },
      { title: 'Teste UN 38.3 (Resumo)', desc: 'Documento crítico. A LATAM exige a apresentação do documento físico ou digital no momento da aceitação (Regra L7-04), não apenas a declaração de que "está disponível".', mandated: true },
      { title: 'Integridade da Embalagem', desc: 'A caixa externa não pode ter furos, rasgos, amassados severos ou sinais de umidade/vazamento. Deve ser rígida o suficiente para proteger o conteúdo.', mandated: true },
      { title: 'Etiqueta de Perigo (Classe 9A)', desc: 'Obrigatória para Seção I (IA/IB). Deve ser visível, não dobrada nas arestas, e ter tamanho mínimo de 100x100mm. O símbolo da bateria deve estar na metade inferior.', mandated: true },
      { title: 'Marca de Bateria de Lítio', desc: 'Obrigatória para Seção II e IB. Deve conter o Número UN correto e um número de telefone válido para informações adicionais. Tamanho min: 100x100mm.', mandated: true },
      { title: 'Etiqueta CAO (Cargueiro)', desc: 'Obrigatória para todas as baterias UN 3480 e UN 3090. Deve ser laranja, 120x110mm, e estar no mesmo lado da etiqueta de perigo.', mandated: true },
      { title: 'Declaração de SoC', desc: 'Para UN 3480: O AWB deve conter a declaração explícita de que as baterias estão com Estado de Carga (SoC) não superior a 30%.', mandated: true },
      { title: 'Proteção de Terminais', desc: 'Cada bateria deve estar isolada para evitar contato com metais ou outras baterias (fita nos terminais ou embalagem interna individual).', mandated: true },
    ],
    en: [
      { title: 'DGD (Shippers Declaration)', desc: 'For Section I: Must be in English, no erasures, signed, with valid 24h emergency phone. Columns must have red hatched borders.', mandated: true },
      { title: 'UN 38.3 Test (Summary)', desc: 'Critical document. LATAM requires physical or digital presentation at acceptance (Rule L7-04), not just a statement that it is "available".', mandated: true },
      { title: 'Packaging Integrity', desc: 'Outer box cannot have holes, tears, severe dents, or signs of moisture/leakage. Must be rigid enough to protect contents.', mandated: true },
      { title: 'Hazard Label (Class 9A)', desc: 'Mandatory for Section I (IA/IB). Must be visible, not folded over edges, minimum size 100x100mm. Battery symbol must be in bottom half.', mandated: true },
      { title: 'Lithium Battery Mark', desc: 'Mandatory for Section II and IB. Must contain correct UN Number and valid phone number for additional info. Min size: 100x100mm.', mandated: true },
      { title: 'CAO Label (Cargo Aircraft Only)', desc: 'Mandatory for all UN 3480 and UN 3090 batteries. Must be orange, 120x110mm, and on the same side as hazard label.', mandated: true },
      { title: 'SoC Declaration', desc: 'For UN 3480: The AWB must contain explicit statement that batteries are at State of Charge (SoC) not exceeding 30%.', mandated: true },
    ],
    es: [
      { title: 'DGD (Shippers Declaration)', desc: 'Para Sección I: Debe estar en Inglés, sin tachaduras, firmada, con teléfono de emergencia 24h válido. Las columnas deben tener bordes rojos rayados.', mandated: true },
      { title: 'Prueba UN 38.3 (Resumen)', desc: 'Documento crítico. LATAM exige presentación física o digital al momento de la aceptación (Regla L7-04), no solo declaración de que "está disponible".', mandated: true },
      { title: 'Integridad del Embalaje', desc: 'La caja exterior no puede tener agujeros, rasgaduras, abolladuras severas o signos de humedad/fugas. Debe lo suficientemente rígida para proteger el contenido.', mandated: true },
      { title: 'Etiqueta de Peligro (Clase 9A)', desc: 'Obligatoria para Sección I (IA/IB). Debe ser visible, no doblada en bordes, tamaño mínimo 100x100mm. El símbolo de batería debe estar en la mitad inferior.', mandated: true },
      { title: 'Marca de Batería de Lítio', desc: 'Obligatoria para Sección II e IB. Debe contener Número UN correcto y número de teléfono válido para información adicional. Tamaño mín: 100x100mm.', mandated: true },
      { title: 'Etiqueta CAO (Carguero)', desc: 'Obligatoria para todas las baterías UN 3480 y UN 3090. Debe ser naranja, 120x110mm, e estar en el mismo lado que la etiqueta de peligro.', mandated: true },
      { title: 'Declaración de SoC', desc: 'Para UN 3480: La AWB debe contener declaración explícita de que las baterías están con Estado de Carga (SoC) no superior al 30%.', mandated: true },
    ]
  };
  return data[lang];
};

const getSegregation = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Classe 1 (Explosivos)', rule: 'Tabela 9.3.A', desc: 'Segregação MANDATÓRIA. Baterias de Lítio (Classe 9) não podem ser carregadas próximas a Explosivos (exceto Divisão 1.4S).', details: 'Risco: Uma fuga térmica na bateria pode detonar explosivos próximos. Baterias de Lítio (Classe 9) devem ser segregadas de explosivos das divisões 1.1, 1.2, 1.3, 1.4 (exceto S), 1.5 e 1.6.' },
      { title: 'Animais Vivos (AVI)', rule: 'Segurança Orgânica', desc: 'Proibido carregar baterias de lítio (Reguladas ou Seção II) no mesmo compartimento que animais vivos (AVI) se houver risco de calor.', details: 'O fogo de lítio libera gases altamente tóxicos (Fluoreto de Hidrogênio) que são fatais para animais em minutos. Animais não devem ser carregados em proximidade direta com materiais perigosos (IATA 9.3.2).' },
      { title: 'Líquidos Inflamáveis (Classe 3)', rule: 'Recomendação', desc: 'Embora a IATA não proíba explicitamente na Tabela 9.3.A, recomenda-se segregar baterias de líquidos inflamáveis.', details: 'Se a bateria incendiar, o líquido inflamável agirá como combustível acelerador, tornando o fogo incontrolável pelos sistemas da aeronave.' },
      { title: 'Distância Mínima', rule: 'Proc. Operacional', desc: 'Manter distância de segurança entre baterias e outras cargas compatíveis.', details: 'Quando a segregação é exigida, manter uma distância de pelo menos 0.5 a 1 metro, ou separar por pallets de carga inerte para evitar propagação de calor.' },
      { title: 'Alimentos', rule: 'PERMITIDO', desc: 'Sem restrição de segregação técnica.', details: 'Classe 9 não requer segregação de alimentos, ao contrário de tóxicos (Classe 6.1) ou infecciosos (Classe 6.2).' },
      { title: 'Não-Reguladas (Ni-MH)', rule: 'SP A199', desc: 'Baterias Ni-MH não possuem restrições de segregação IATA.', details: 'Classificadas como "Not Restricted" no modal aéreo. A única exigência é a proteção física dos terminais contra curto-circuito.' },
      { title: 'Outras Classes', rule: 'PERMITIDO', desc: 'Geralmente compatível com a maioria das classes.', details: 'Classe 9 é compatível com a maioria das outras classes, desde que respeitadas as distâncias mínimas de segurança geral.' }
    ],
    en: [
      { title: 'Class 1 (Explosives)', rule: 'Table 9.3.A', desc: 'MANDATORY Segregation. Lithium Batteries (Class 9) cannot be loaded next to Explosives (except Division 1.4S).', details: 'Risk: Thermal runaway in battery could detonate nearby explosives. Lithium Batteries (Class 9) must be segregated from explosives of divisions 1.1, 1.2, 1.3, 1.4 (except S), 1.5, and 1.6.' },
      { title: 'Live Animals (AVI)', rule: 'Organic Safety', desc: 'Forbidden to load lithium batteries in the same compartment as live animals if there is heat risk.', details: 'Lithium fire releases highly toxic gases (HF) fatal to animals. Animals must not be loaded in direct proximity to dangerous goods (IATA 9.3.2).' },
      { title: 'Flammable Liquids (Class 3)', rule: 'Recommendation', desc: 'Segregating batteries from flammable liquids is highly recommended.', details: 'Flammable liquid acts as accelerant fuel in case of battery fire.' },
      { title: 'Minimum Distance', rule: 'Op. Procedure', desc: 'Maintain safety distance when segregation is required.', details: 'Maintain at least 0.5 to 1 meter distance, or separate by pallets of inert cargo to prevent heat propagation.' },
      { title: 'Foodstuffs', rule: 'ALLOWED', desc: 'No technical segregation restriction.', details: 'Class 9 does not require segregation from foodstuffs, unlike toxics or infectious substances.' },
      { title: 'Non-Regulated (Ni-MH)', rule: 'SP A199', desc: 'Ni-MH batteries have no IATA segregation restrictions.', details: 'Classified as "Not Restricted" in air transport. Terminal protection against short circuit is required.' },
      { title: 'Other Classes', rule: 'ALLOWED', desc: 'Generally compatible with most classes.', details: 'Class 9 is compatible with most other classes, provided general safety distances are respected.' }
    ],
    es: [
      { title: 'Clase 1 (Explosivos)', rule: 'SEGREGAR', desc: 'Mantener separado de explosivos (excepto 1.4S).', details: 'Las baterías de litio (Clase 9) deben segregarse de explosivos de las divisiones 1.1 a 1.6.' },
      { title: 'Animales Vivos (AVI)', rule: 'SEGREGAR', desc: 'No cargar cerca de animales vivos.', details: 'Los animales no deben cargarse en proximidad directa con mercancías peligrosas que puedan afectar su salud (IATA 9.3.2).' },
      { title: 'Líquidos Inflamables (Clase 3)', rule: 'Recomendación', desc: 'Se recomienda segregar baterías de líquidos inflamables.', details: 'El líquido inflamable actúa como combustible acelerador si la batería se incendia.' },
      { title: 'Distancia Mínima', rule: 'Proc. Operacional', desc: 'Mantener distancia de seguridad cuando se requiere segregación.', details: 'Mantener al menos 0.5 a 1 metro de distancia o separar por pallets de carga inerte para evitar propagación.' },
      { title: 'Alimentos', rule: 'PERMITIDO', desc: 'Sin restricción de segregación técnica.', details: 'La Clase 9 no requiere segregación de alimentos, a diferencia de los tóxicos (Clase 6.1) o infecciosos (Clase 6.2).' },
      { title: 'No Reguladas (Ni-MH)', rule: 'SP A199', desc: 'Las baterías de Ni-MH no tienen restricciones de segregación IATA.', details: 'Clasificadas como "Not Restricted" en aéreo. Se requiere protección física de terminales.' },
      { title: 'Otras Clases', rule: 'PERMITIDO', desc: 'Generalmente compatible con la mayoría de las clases.', details: 'La Clase 9 es compatible con la mayoría de las otras clases, respetando distancias mínimas de seguridad.' }
    ]
  };
  return data[lang];
};

const getDGRData = (lang: Language) => {
  const common = {
    pt: [
      // --- SEÇÃO 1: APLICABILIDADE ---
      { section: '1.2.7', topic: 'Responsabilidades', title: 'Papel do Expedidor', desc: 'Garantia de conformidade legal.', details: 'O expedidor é o responsável legal por garantir que a carga está corretamente classificada, embalada e documentada. Erros na declaração podem resultar em multas pesadas ou detenção da carga.\n\nExemplo: Um expedidor que envia Power Banks como "acessórios eletrônicos" viola a Seção 1.2.7.' },
      { section: '1.3', topic: 'Responsabilidades', title: 'Treinamento CBTA', desc: 'Obrigação de qualificação do pessoal.', details: 'Todo pessoal envolvido no preparo de baterias de lítio deve possuir treinamento baseado em competências (CBTA), renovado a cada 24 meses. A IATA exige que a eficácia do treinamento seja avaliada pelo empregador.' },
      { section: '1.5', topic: 'Segurança', title: 'Security (Segurança da Carga)', desc: 'Proteção contra atos de interferência ilícita.', details: 'Baterias de lítio em grandes quantidades (Seção IA) são consideradas bens sensíveis. Devem ser protegidas contra roubo ou sabotagem que possa comprometer a segurança do voo durante o armazenamento e transporte.' },
      { section: '1.6', topic: 'Responsabilidades', title: 'Instrução Adequada', desc: 'Requisito para Seção II.', details: 'Expedidores de baterias da Seção II (pequenas quantidades) não precisam de curso DGR completo, mas DEVEM receber "Instrução Adequada" para identificar riscos e cumprir as instruções de embalagem.' },

      // --- SEÇÃO 2: LIMITAÇÕES ---
      { section: '2.2', topic: 'Limitações', title: 'Perigo Oculto', desc: 'Cargas que parecem seguras, mas contêm baterias.', details: 'Itens como "Drones", "Cadeiras de Rodas", "Equipamento Médico" e até "Instrumentos Musicais" frequentemente escondem baterias de lítio não declaradas. Operadores devem questionar descrições vagas.' },
      { section: '2.3', topic: 'Limitações', title: 'Mala de Passageiros (Tabela 2.3.A)', desc: 'Regras para bagagem de mão e despachada.', details: 'Regra de Ouro: Power Banks e baterias sobressalentes são PROIBIDOS na mala despachada (porão). Devem ser levados exclusivamente na cabine (mão).\n\nLimite: Baterias até 100Wh sem limite de unidades. 100Wh-160Wh máximo 2 unidades com aprovação.' },
      { section: '2.3.2', topic: 'Limitações', title: 'Auxílios de Mobilidade', desc: 'Cadeiras de rodas motorizadas.', details: 'Baterias de lítio devem ser removidas (se projetadas para isso) e levadas na cabine. Os terminais devem ser protegidos contra curtos. Limite de 300Wh para uma única bateria ou 2x 160Wh.' },
      { section: '2.3.5.8', topic: 'Limitações', title: 'Dispositivos Eletrônicos (PED)', desc: 'Regras para passageiros portando eletrônicos.', details: 'Dispositivos devem ser protegidos contra ativação acidental. Limite de 15 dispositivos por passageiro.' },
      { section: '2.4', topic: 'Limitações', title: 'Correio Aéreo (UPU)', desc: 'Proibição no correio internacional.', details: 'É proibido enviar baterias soltas (UN 3480/3090) por correio internacional convencional (UPU). Apenas baterias instaladas em equipamentos (Seção II) podem ser aceitas em rotas específicas.' },
      { section: '2.6', topic: 'Limitações', title: 'Quantidades Excetuadas', desc: 'Regras para quantidades mínimas.', details: 'Baterias de lítio NÃO são permitidas sob as disposições de Quantidade Excetuada (Excepted Quantity), exceto em casos raros previstos em SPs específicas.' },
      { section: '2.8', topic: 'Limitações', title: 'Variações de Estado e Operador', desc: 'Regras mais rígidas que a IATA.', details: 'Sempre cheque as variações da Cia (Ex: L7-01 da LATAM ou FX da FedEx). Elas prevalecem sobre a IATA se forem mais restritivas.' },

      // --- SEÇÃO 3: CLASSIFICAÇÃO ---
      { section: '3.9.2.6', topic: 'Classificação', title: 'Critérios Classe 9', desc: 'Como uma bateria se torna Classe 9.', details: 'As baterias de lítio devem passar nos 8 testes do Manual de Testes e Critérios da ONU, Parte III, subseção 38.3 (T1 a T8).\n\nRequisito: A fábrica deve operar sob um sistema de gestão de qualidade certificado.' },
      { section: '3.9.2.6.1', topic: 'Classificação', title: 'Resumo UN 38.3', desc: 'O documento comprobatório.', details: 'L7 Variation: A LATAM exige que o resumo de teste seja apresentado fisicamente ou em PDF no momento do aceite da carga, não apenas estar "disponível".' },

      // --- SEÇÃO 4: IDENTIFICAÇÃO ---
      { section: '4.2', topic: 'Identificação', title: 'Páginas Azuis', desc: 'Lista oficial de Artigos Perigosos.', details: 'Define o UN Number, Nome Correto (PSN), Classe de Risco e Packing Instructions (PI) aplicáveis para PAX e CAO.' },
      { section: '4.4', topic: 'Identificação', title: 'Special Provisions (SPs)', desc: 'Isenções e regras especiais (Série A).', details: 'A coluna M das páginas azuis lista as SPs. Ex: A154 proíbe baterias danificadas. A331 limita o SoC a 30%.' },

      // --- SEÇÃO 5: EMBALAGEM (GENERAL) ---
      { section: '5.0.2', topic: 'Embalagem', title: 'Requisitos Gerais', desc: 'Qualidade e construção.', details: 'As embalagens devem suportar vibrações, variações de pressão (95 kPa) e temperaturas (-40°C a +55°C) comuns no transporte aéreo.' },
      { section: '5.0.3', topic: 'Embalagem', title: 'Sobreembalagem (Overpack)', desc: 'Consolidação de volumes.', details: 'Se os volumes internos não estiverem visíveis, o Overpack deve ser marcado com a palavra "OVERPACK" (min 12mm) e as etiquetas de risco devem ser reproduzidas do lado de fora.' },

      // --- PACKING INSTRUCTIONS (PASSO-A-PASSO) ---
      { section: 'PI 965-IA', topic: 'Íon-Lítio (Solta)', title: 'UN 3480 - Seção IA', desc: 'Alta Energia (>100Wh). Plenamente Regulado.', details: 'Exige embalagem UN Spec (PG II), etiqueta Classe 9A, etiqueta CAO e DGD. Proibido em aeronave de passageiros.' },
      { section: 'PI 965-IB', topic: 'Íon-Lítio (Solta)', title: 'UN 3480 - Seção IB', desc: 'Energia Média (≤100Wh). Regulado Flexível.', details: 'Exige embalagem UN Spec (PG II), Marca de Lítio, etiqueta Classe 9A, etiqueta CAO e DGD. Limite de 10kg por volume.' },
      { section: 'PI 965-II', topic: 'Íon-Lítio (Solta)', title: 'UN 3480 - Seção II', desc: 'Pequena Qtde. (Geralmente PROIBIDO).', details: 'Nota: A IATA deletou grande parte desta seção em 2022. Operadores como LATAM exigem upgrade para Seção IB para maior segurança.' },
      
      { section: 'PI 966-I', topic: 'Íon-Lítio (C/ Eqpto)', title: 'UN 3481 - Seção I', desc: 'Com Equipamento (>100Wh).', details: 'Bateria na mesma caixa que o dispositivo. Exige UN Spec e DGD. Limite PAX: 5kg. Limite CAO: 35kg.' },
      { section: 'PI 966-II', topic: 'Íon-Lítio (C/ Eqpto)', title: 'UN 3481 - Seção II', desc: 'Com Equipamento (≤100Wh).', details: 'Isento de UN Spec. Exige embalagem externa rígida e Marca de Lítio. Isento de DGD (LoC recomendado).' },

      { section: 'PI 967-I', topic: 'Íon-Lítio (No Eqpto)', title: 'UN 3481 - Seção I', desc: 'Instalada em Dispositivo (>100Wh).', details: 'Exige DGD e proteção contra ativação. Limite PAX: 5kg.' },
      { section: 'PI 967-II', topic: 'Íon-Lítio (No Eqpto)', title: 'UN 3481 - Seção II', desc: 'Instalada em Dispositivo (≤100Wh).', details: 'Isento de marca se ≤ 2 volumes na remessa e ≤ 4 células/2 baterias por volume.' },

      { section: 'PI 968-IA', topic: 'Metal Lítio (Solta)', title: 'UN 3090 - Seção IA', desc: 'Metal Lítio Solta (>2g). Plenamente Regulado.', details: 'PROIBIDO PAX. Exige embalagem UN Spec (PG II), DGD e etiqueta CAO.' },
      { section: 'PI 968-IB', topic: 'Metal Lítio (Solta)', title: 'UN 3090 - Seção IB', desc: 'Metal Lítio Solta (≤2g). Regulado Flexível.', details: 'PROIBIDO PAX. Exige embalagem UN Spec (PG II), Marca de Lítio, 9A, CAO e DGD.' },

      { section: 'PI 969/970', topic: 'Metal Lítio (Eqpto)', title: 'UN 3091 - Eqpto', desc: 'Regras para Metal Lítio com/em equipamentos.', details: 'Seguem a mesma lógica das PIs 966/967, mas baseadas em gramas de lítio (Limite 2g bateria / 1g célula).' },

      // --- SEÇÃO 7: MARCAÇÃO E ETIQUETAGEM ---
      { section: '7.1.5.5', topic: 'Etiquetagem', title: 'Marca de Bateria de Lítio', desc: 'A marca retangular vermelha.', details: 'Deve conter o UN Number correto. Tamanho mín: 100x100mm. Se o volume for pequeno, pode ser reduzida para 100x70mm.' },
      { section: '7.2.2.3.2', topic: 'Etiquetagem', title: 'Etiqueta Classe 9A', desc: 'O losango específico.', details: 'Diferente da Classe 9 comum, a 9A deve ser usada obrigatoriamente para remessas da Seção I (IA e IB).' },
      { section: '7.2.4.2', topic: 'Etiquetagem', title: 'Etiqueta CAO (Cargueiro)', desc: 'Laranja com símbolo preto.', details: 'Obrigatória para todos os embarques proibidos em PAX (UN 3480 e 3090) ou que excedam os limites PAX da Seção I.' },

      // --- SEÇÃO 8: DOCUMENTAÇÃO ---
      { section: '8.1.6.9', topic: 'Documentação', title: 'Preenchimento DGD', desc: 'Padrão da declaração.', details: 'Campos obrigatórios: UN Number, PSN, Classe 9, PI Number e quantidade líquida. Deve ser assinada e em triplicata.' },
      { section: '8.2.1', topic: 'Documentação', title: 'AWB (Conhecimento)', desc: 'Declarações no conhecimento aéreo.', details: 'Para Seção II: "Lithium ion batteries in compliance with Section II of PI ...".\nPara Seção I: "Dangerous Goods as per attached Shipper\'s Declaration".' },

      // --- SEÇÃO 9: MANUSEIO ---
      { section: '9.3.2', topic: 'Manuseio', title: 'Tabela de Segregação', desc: 'Incompatibilidade química.', details: 'Baterias de lítio não podem ser carregadas junto com explosivos (Exceto 1.4S) ou animais vivos (AVI) devido ao risco de fumaça tóxica.' },
      { section: '9.5.1', topic: 'Manuseio', title: 'Volumes Danificados', desc: 'Procedimento de rejeição.', details: 'Qualquer volume com sinal de impacto, furo ou umidade deve ser rejeitado. Se o dano ocorrer em solo, deve ser removido para área isolada e monitorado contra calor.' },
      { section: '9.6.1', topic: 'Aceitação', title: 'NOTOC (Piloto)', desc: 'Notificação ao Comandante.', details: 'O capitão deve saber a localização exata de remessas da Seção I no porão para ativar protocolos de combate a incêndio se necessário.' },

      // --- APÊNDICES ---
      { section: 'App A', topic: 'Apêndices', title: 'Glossário IATA', desc: 'Definições oficiais.', details: 'Diferença técnica entre Célula (Cell) e Bateria (Battery). Define que "Power Bank" é Bateria.' },
      { section: 'App F', topic: 'Emergência', title: 'Resposta a Fogo', desc: 'Protocolo de incêndio.', details: 'Em caso de fogo de íon-lítio: Usar água em abundância para resfriar as células vizinhas e interromper a fuga térmica. Extintores CO2 apenas abafam a chama, mas não resfriam o químico.' }
    ],
    en: [
      { section: '1.2.7', topic: 'Responsibilities', title: 'Shipper Role', desc: 'Legal compliance guarantee.', details: 'Shipper is legally responsible for identification, classification, packing, and documentation.' },
      { section: 'PI 965', topic: 'Packing', title: 'Standalone Ion', desc: 'UN 3480 regulations.', details: 'Strictly forbidden on PAX. IA/IB require UN Spec packaging and DGD.' },
      { section: '7.1.5.5', topic: 'Labeling', title: 'Lithium Battery Mark', desc: 'The red hatched mark.', details: 'Required for Section II and IB. Must show correct UN Number.' },
    ],
    es: [
      { section: '1.2.7', topic: 'Responsabilidades', title: 'Papel del Expedidor', desc: 'Garantía de cumplimiento legal.', details: 'El expedidor es el responsable legal de garantizar que la carga esté correctamente clasificada y preparada.' },
      { section: 'PI 965', topic: 'Embalaje', title: 'Ion Litio Suelto', desc: 'Reglas para UN 3480.', details: 'Prohibido en PAX. Las secciones IA e IB requieren embalaje UN Spec y DGD.' }
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
      { code: 'A45', title: 'Baterias Secas (Alcalinas)', desc: 'Isenção para baterias alcalinas/NiCd.', details: 'Não são restritas se protegidas contra curto-circuito.', reference: 'DGR 4.4' },
      { code: 'A48', title: 'Isenção de Teste de Embalagem', desc: 'Para equipamentos com baterias instaladas.', details: 'Volumes contendo baterias de lítio instaladas em equipamentos não requerem embalagem UN Spec se protegidos adequadamente.', reference: 'DGR 4.4' },
      { code: 'A88', title: 'Protótipos', desc: 'Baterias de pré-produção sem teste UN 38.3.', details: 'Exige aprovação das autoridades competentes.', reference: 'PI 910', risk: 'high' },
      { code: 'A99', title: 'Limite de Peso Excedido', desc: 'Embalagens que excedem 35kg Líquidos.', details: 'Requer aprovação do Estado de origem e do operador.', reference: 'PI 974', risk: 'high' },
      { code: 'A154', title: 'Danificadas / Defeituosas', desc: 'Baterias com risco de segurança.', details: 'Proibidas se identificadas como danificadas para segurança.', reference: 'DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A164', title: 'Ativação Acidental', desc: 'Prevenção de curto-circuito.', details: 'Equipamentos devem ter meios eficazes para evitar ativação.', reference: 'DGR 4.4' },
      { code: 'A181', title: 'Mix de Baterias', desc: 'Íon e Metal no mesmo volume.', details: 'Permite baterias de íon e metal no mesmo pacote.', reference: 'DGR 4.4' },
      { code: 'A199', title: 'Baterias Ni-MH', desc: 'Não restrito no aéreo.', details: 'Apenas os terminais devem estar protegidos contra curtos.', reference: 'DGR 4.4', risk: 'low' },
      { code: 'A206', title: 'Novas Marcas de Bateria', desc: 'Uso da marca de bateria de lítio.', details: 'Regulamenta o design e aplicação da marca vermelha.', reference: 'DGR 7.2.2' },
      { code: 'A331', title: 'SoC UN 3480', desc: 'Estado de carga máximo de 30%.', details: 'Limite mandatório para baterias de íon-lítio soltas.', reference: 'PI 965', risk: 'high' },
      { code: 'A334', title: 'Correio Aéreo', desc: 'Proibição de baterias de lítio no correio.', details: 'Exceto se contidas em equipamentos (com limites).', reference: 'DGR 2.4', risk: 'forbidden' }
    ],
    en: [
      { code: 'A45', title: 'Dry Batteries (Alkaline)', desc: 'Exemption for alkaline/NiCd batteries.', details: 'Not restricted if protected against short circuits.', reference: 'DGR 4.4' },
      { code: 'A88', title: 'Prototypes', desc: 'Pre-production batteries without UN 38.3 testing.', details: 'Requires approval from competent authorities.', reference: 'PI 910', risk: 'high' },
      { code: 'A99', title: 'Weight Limit Exceeded', desc: 'Packages exceeding 35kg net weight.', details: 'Requires approval from the State of origin and operator.', reference: 'PI 974', risk: 'high' },
      { code: 'A154', title: 'Damaged / Defective', desc: 'Batteries with safety risk.', details: 'Forbidden if identified as damaged for safety reasons.', reference: 'DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A164', title: 'Accidental Activation', desc: 'Prevention of short circuits.', details: 'Equipment must have effective means to prevent activation.', reference: 'DGR 4.4' },
      { code: 'A181', title: 'Battery Mix', desc: 'Ion and Metal in the same package.', details: 'Allows ion and metal batteries in the same outer package.', reference: 'DGR 4.4' },
      { code: 'A199', title: 'Ni-MH Batteries', desc: 'Not restricted in air transport.', details: 'Only terminals must be protected against short circuits.', reference: 'DGR 4.4', risk: 'low' },
      { code: 'A206', title: 'New Battery Marks', desc: 'Use of lithium battery mark.', details: 'Regulates design and application of the red mark.', reference: 'DGR 7.2.2' },
      { code: 'A331', title: 'SoC UN 3480', desc: 'Maximum state of charge 30%.', details: 'Mandatory limit for standalone lithium-ion batteries.', reference: 'PI 965', risk: 'high' },
      { code: 'A334', title: 'Air Mail', desc: 'Prohibition of lithium batteries in mail.', details: 'Except if contained in equipment (with limits).', reference: 'DGR 2.4', risk: 'forbidden' }
    ],
    es: [
      { code: 'A45', title: 'Baterías Secas (Alcalinas)', desc: 'Exención para baterías alcalinas/NiCd.', details: 'No están restringidas si están protegidas contra cortocircuitos.', reference: 'DGR 4.4' },
      { code: 'A88', title: 'Prototipos', desc: 'Baterías de preproducción sin prueba UN 38.3.', details: 'Requiere aprobación de las autoridades competentes.', reference: 'PI 910', risk: 'high' },
      { code: 'A99', title: 'Límite de Peso Excedido', desc: 'Embalajes que exceden los 35kg netos.', details: 'Requiere aprobación del Estado de origen y del operador.', reference: 'PI 974', risk: 'high' },
      { code: 'A154', title: 'Dañadas / Defectuosas', desc: 'Baterías con riesgo de seguridad.', details: 'Prohibidas si se identifican como dañadas por seguridad.', reference: 'DGR 3.9.2.6', risk: 'forbidden' },
      { code: 'A164', title: 'Activación Accidental', desc: 'Prevención de cortocircuitos.', details: 'Los equipos deben tener medios eficaces para evitar la activación.', reference: 'DGR 4.4' },
      { code: 'A181', title: 'Mezcla de Baterías', desc: 'Ion y Metal en el mismo bulto.', details: 'Permite baterías de ion y metal en el mismo paquete.', reference: 'DGR 4.4' },
      { code: 'A199', title: 'Baterías Ni-MH', desc: 'No restringido en el transporte aéreo.', details: 'Solo los terminales deben estar protegidos contra cortos.', reference: 'DGR 4.4', risk: 'low' },
      { code: 'A206', title: 'Nuevas Marcas de Batería', desc: 'Uso de la marca de batería de litio.', details: 'Regula o diseño e aplicación da marca vermelha.', reference: 'DGR 7.2.2' },
      { code: 'A331', title: 'SoC UN 3480', desc: 'Estado de carga máximo del 30%.', details: 'Límite obligatorio para baterías de ion-litio sueltas.', reference: 'PI 965', risk: 'high' },
      { code: 'A334', title: 'Correo Aéreo', desc: 'Prohibición de baterías de litio en el correo.', details: 'Excepto si están contenidas en equipos (con límites).', reference: 'DGR 2.4', risk: 'forbidden' }
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
    title: 'Wiki IATA',
    subtitle: 'Regras, Definições & Códigos',
    search: 'Buscar termo, código ou regra...',
    back: 'Voltar para Lista',
    summary: 'Resumo da Seção',
    details: 'Conteúdo Detalhado',
    no_results: 'Nenhum resultado encontrado',
    tabs: { SP: 'Disposições', GLOSSARY: 'Glossário', PKG: 'Embalagens', CHK: 'Checklist', DGR: 'Seções', SEG: 'Segregação' }
  },
  en: {
    title: 'IATA Wiki',
    subtitle: 'Rules, Definitions & Codes',
    search: 'Search term, code or rule...',
    back: 'Back to List',
    summary: 'Section Summary',
    details: 'Detailed Content',
    no_results: 'No results found',
    tabs: { SP: 'Provisions', GLOSSARY: 'Glossary', PKG: 'Packaging', CHK: 'Checklist', DGR: 'Sections', SEG: 'Segregation' }
  },
  es: {
    title: 'Wiki IATA',
    subtitle: 'Reglas, Definiciones y Códigos',
    search: 'Buscar término, código o regla...',
    back: 'Volver a la Lista',
    summary: 'Resumen',
    details: 'Contenido Detallado',
    no_results: 'No se encontraron resultados',
    tabs: { SP: 'Disposiciones', GLOSSARY: 'Glosario', PKG: 'Embalajes', CHK: 'Checklist', DGR: 'Secciones', SEG: 'Segregación' }
  }
};

type TabType = 'SP' | 'GLOSSARY' | 'PKG' | 'CHK' | 'DGR' | 'SEG';

// Fixed SPECIAL_PROVISIONS_DATA with essential properties for ComplianceResult tooltips
export const SPECIAL_PROVISIONS_DATA = [
    { code: 'A45', desc: 'Isenção para alcalinas/NiCd se protegidas.', reference: 'DGR 4.4' },
    { code: 'A48', desc: 'Isenção de testes de embalagem para equipamentos específicos.', reference: 'DGR 4.4' },
    { code: 'A88', desc: 'Protótipos/Pré-produção (sem UN38.3). Exige Aprovação Governamental.', reference: 'PI 910' },
    { code: 'A99', desc: 'Exige Aprovação para exceder limite de peso de 35kg.', reference: 'PI 974' },
    { code: 'A154', desc: 'PROIBIDAS. Baterias com defeito ou dano físico.', reference: 'DGR 3.9.2.6' },
    { code: 'A164', desc: 'Prevenção mandatória de ativação acidental.', reference: 'DGR 4.4' },
    { code: 'A181', desc: 'Permite misturar Íon e Metal no mesmo volume (com limites).', reference: 'DGR 4.4' },
    { code: 'A199', desc: 'Ni-MH: Não restrito no aéreo (exceto terminais).', reference: 'DGR 4.4' },
    { code: 'A206', risk: 'medium', desc: 'Uso obrigatório do padrão visual da marca.', reference: 'DGR 7.2.2' },
    { code: 'A331', desc: 'Limite de carga de 30% SoC para UN 3480.', reference: 'PI 965' },
    { code: 'A334', desc: 'Proibição total de baterias soltas no correio.', reference: 'DGR 2.4' }
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
                   {item.section}
                </span>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest border-l border-white/20 pl-3">
                   {item.topic}
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
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4">
                   {item.details || item.desc}
                </div>
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
                   <h3 className="font-bold text-slate-800 truncate">{sp.title}</h3>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sp.desc}</p>
                </div>
                <ChevronRight size={18} className={`text-slate-300 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
              </button>
              {isExpanded && (
                 <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1">
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{T.details}</span>
                          <p className="text-xs text-slate-700 leading-relaxed">{sp.details}</p>
                       </div>
                       <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Ref:</span><span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{sp.reference}</span></div>
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
         <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-coral-200 transition-colors group">
            <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">{item.term}<GraduationCap size={14} className="text-slate-300 group-hover:text-coral-400" /></h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-2">{item.def}</p>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex gap-2 items-start"><Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" /><p className="text-xs text-slate-500 italic">{item.context}</p></div>
         </div>
       ))}
    </div>
  );

  const renderPackaging = (items: any[]) => (
     <div className="grid gap-3">
        {items.map((pkg, idx) => (
           <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start">
              <div className="bg-slate-900 text-white px-3 py-2 rounded-lg font-mono font-bold text-sm text-center min-w-[60px]">{pkg.code}</div>
              <div className="flex-1">
                 <h4 className="font-bold text-slate-800">{pkg.type}</h4>
                 <p className="text-xs text-slate-500 mt-1 mb-2">{pkg.desc}</p>
                 <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-100">{pkg.suitability}</span>
              </div>
           </div>
        ))}
     </div>
  );

  const renderChecklist = (items: any[]) => (
      <div className="space-y-3">
         {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
               <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${item.mandated ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}><CheckSquare size={14} /></div>
               <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
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
       <div className="space-y-3">
          {sortedKeys.map(key => {
             const groupItems = groups[key];
             const isOpen = openFolders[key];
             const meta = SECTION_METADATA[key] || { title: `Seção ${key}`, icon: Folder };
             const Icon = meta.icon;

             return (
               <div key={key} className={`bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md border-indigo-200' : 'hover:border-indigo-200'}`}>
                  <button 
                    onClick={() => toggleFolder(key)}
                    className={`w-full flex items-center justify-between p-4 ${isOpen ? 'bg-indigo-50/30' : 'bg-white'}`}
                  >
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                           <Icon size={18} />
                        </div>
                        <span className={`font-black text-sm uppercase tracking-wide ${isOpen ? 'text-indigo-900' : 'text-slate-600'}`}>{meta.title}</span>
                     </div>
                     <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-indigo-500' : ''}`} />
                  </button>
                  
                  {isOpen && (
                     <div className="p-3 bg-slate-50/50 border-t border-indigo-100/50 animate-in fade-in slide-in-from-top-1">
                        <div className="grid grid-cols-2 gap-3">
                           {groupItems.map((item, idx) => (
                              <button 
                                 key={idx} 
                                 onClick={() => setSelectedSection(item)}
                                 className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left flex flex-col h-full group"
                              >
                                 <div className="flex items-center justify-between w-full mb-2">
                                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">{item.section}</span>
                                    <ShieldCheck size={12} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                 </div>
                                 <h4 className="font-bold text-slate-800 mb-1 text-[10px] leading-tight group-hover:text-indigo-900 line-clamp-2">{item.title}</h4>
                                 <p className="text-[9px] text-slate-400 line-clamp-1 opacity-70 italic">{item.desc}</p>
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
         <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 group hover:border-indigo-400 transition-all">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><Split size={16} /></div>
                 <h4 className="font-black text-indigo-900 text-sm">{seg.title}</h4>
               </div>
               <span className="text-[10px] font-black bg-indigo-900 text-white px-2 py-1 rounded-lg uppercase tracking-widest">{seg.rule}</span>
            </div>
            <p className="text-sm text-slate-700 font-bold leading-relaxed">{seg.desc}</p>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
               <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
               <p className="text-xs text-slate-500 italic leading-relaxed">{seg.details}</p>
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
      threshold: 0.3
    });
    return fuse.search(search).map(res => res.item);
  };

  const filteredItems = getData();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 w-14 h-14 bg-coral-500 text-white rounded-full shadow-[0_8px_30px_rgba(227,6,19,0.4)] border border-coral-400 flex items-center justify-center z-40 transition-all hover:scale-105 active:scale-95 group print:hidden`}
        title="IATA Dictionary"
      >
        <Book size={24} className="group-hover:text-white transition-colors" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
           <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
           <div className="relative w-full max-w-md h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              
              {selectedSection ? (
                 <div className="h-full p-6">
                    {renderDetailView(selectedSection)}
                 </div>
              ) : (
                <>
                  <div className="p-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                             <Book size={20} />
                          </div>
                          <div>
                             <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">{T.title}</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{T.subtitle}</p>
                          </div>
                       </div>
                       <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                          <X size={20} />
                       </button>
                    </div>

                    <div className="relative group">
                       <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                       <input 
                         type="text" 
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         placeholder={T.search}
                         className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:text-slate-400"
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
                             className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border h-full ${isActive ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                           >
                              <Icon size={16} />
                              <span className="truncate w-full text-center">{tab.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
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
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                           <Folder size={48} className="mb-3 opacity-20" />
                           <p className="text-sm font-bold">{T.no_results}</p>
                        </div>
                     )}
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </>
  );
}