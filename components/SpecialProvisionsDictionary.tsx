import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { 
  Book, Search, X, ChevronRight, Scale, GraduationCap, Box, Tag, 
  CheckSquare, List, FolderOpen, Folder, ArrowLeft, Lightbulb,
  Split, Info, FileText, ShieldCheck, AlertCircle, HardHat, ShieldAlert,
  Thermometer, Zap, ClipboardList, LifeBuoy, Shield, Ban, Hand, Warehouse,
  Anchor, Truck, AlertTriangle, Code, FileSearch, ScrollText, Ruler, Beaker,
  History, UserCheck, Microscope
} from 'lucide-react';
import { Language } from '../types';

// --- DATASETS AUTORITATIVOS (ESPELHO INTEGRAL DO DGR) ---

export const SPECIAL_PROVISIONS_DATA = [
  { code: 'A48', desc: 'As embalagens para baterias de lítio preparadas de acordo com a Seção II das Instruções de Embalagem 966, 967, 969 ou 970 não precisam ser embalagens de especificação UN.', reference: 'IATA DGR 4.4' },
  { code: 'A88', desc: 'Células e baterias de lítio protótipo ou de pré-produção que não foram testadas podem ser transportadas em aeronaves de carga com aprovação prévia das autoridades competentes do Estado de origem e do Estado do operador.', reference: 'IATA DGR 4.4' },
  { code: 'A99', desc: 'Células ou baterias de lítio com peso líquido superior a 35 kg devem ser transportadas sob aprovação da autoridade competente do Estado de origem.', reference: 'IATA DGR 4.4' },
  { code: 'A154', desc: 'Baterias de lítio identificadas como defeituosas por razões de segurança ou que tenham sido danificadas são estritamente proibidas para transporte aéreo sob qualquer circunstância.', reference: 'IATA DGR 4.4' },
  { code: 'A155', desc: 'Baterias de lítio para veículos elétricos (EV) devem ser transportadas conforme disposições específicas de veículos (UN 3171).', reference: 'IATA DGR 4.4' },
  { code: 'A164', desc: 'Qualquer item alimentado por bateria deve ser protegido contra curto-circuito e contra ativação acidental do equipamento por meios eficazes (ex: travas físicas ou desconexão).', reference: 'IATA DGR 4.4' },
  { code: 'A183', desc: 'Baterias de lítio para descarte ou reciclagem são proibidas para transporte aéreo, a menos que aprovadas pela autoridade competente.', reference: 'IATA DGR 4.4' },
  { code: 'A199', desc: 'Baterias de níquel-hidreto metálico (Ni-MH) não são restritas no transporte aéreo, desde que protegidas contra curto-circuito e preparadas para evitar calor excessivo.', reference: 'IATA DGR 4.4' },
  { code: 'A201', desc: 'Disposição para transporte emergencial de baterias de lítio em aeronaves de passageiros em situações de assistência médica ou humanitária com aprovação estatal.', reference: 'IATA DGR 4.4' },
  { code: 'A206', desc: 'Baterias de lítio preparadas de acordo com a Seção II não devem ser colocadas na mesma embalagem externa com outros artigos perigosos, exceto em volumes mistos permitidos.', reference: 'IATA DGR 4.4' },
  { code: 'A213', desc: 'Baterias de lítio instaladas em equipamentos projetados para detectar localização em emergência.', reference: 'IATA DGR 4.4' },
  { code: 'A331', desc: 'Baterias de íon-lítio (UN 3480) devem ser oferecidas para transporte em um estado de carga (SoC) não superior a 30% de sua capacidade nominal.', reference: 'IATA DGR 4.4' },
  { code: 'A334', desc: 'Disposições relativas ao transporte de baterias de lítio em remessas de correio aéreo internacional de acordo com as regras da UPU.', reference: 'IATA DGR 4.4' }
];

const getIMPData = (lang: Language) => {
  const data = {
    pt: [
      { code: 'ELI', meaning: 'Lithium Ion Batteries (Excepted)', desc: 'Baterias de íon-lítio enviadas sob as disposições da Seção II das Instruções de Embalagem 966 e 967.', applicability: 'PI 966-II, PI 967-II' },
      { code: 'ELM', meaning: 'Lithium Metal Batteries (Excepted)', desc: 'Baterias de metal lítio enviadas sob as disposições da Seção II das Instruções de Embalagem 969 e 970.', applicability: 'PI 969-II, PI 970-II' },
      { code: 'RLI', meaning: 'Lithium Ion Batteries (Fully Regulated)', desc: 'Baterias de íon-lítio da Classe 9. Células > 20Wh ou Baterias > 100Wh, ou quantidades da Seção IB.', applicability: 'PI 965, PI 966-I, PI 967-I' },
      { code: 'RLM', meaning: 'Lithium Metal Batteries (Fully Regulated)', desc: 'Baterias de metal lítio da Classe 9. Células > 1g ou Baterias > 2g, ou quantidades da Seção IB.', applicability: 'PI 968, PI 969-I, PI 970-I' },
      { code: 'RBI', meaning: 'Lithium Ion Batteries (UN 3480)', desc: 'Código de Manuseio específico para Baterias de Íon-Lítio (Standalone). Restrito a Aeronave de Carga (CAO).', applicability: 'UN 3480' },
      { code: 'RBM', meaning: 'Lithium Metal Batteries (UN 3090)', desc: 'Código de Manuseio específico para Baterias de Metal Lítio (Standalone). Restrito a Aeronave de Carga (CAO).', applicability: 'UN 3090' },
      { code: 'CAO', meaning: 'Cargo Aircraft Only', desc: 'Carga proibida em aeronaves de passageiros. Etiqueta obrigatória conforme IATA DGR 7.2.4.2.', applicability: 'Obrigatório para UN 3480/3090' },
      { code: 'MAG', meaning: 'Magnetized Material', desc: 'Material magnetizado que pode afetar bússolas. Muitas vezes associado a equipamentos com baterias grandes.', applicability: 'Classe 9' }
    ],
    en: [
      { code: 'ELI', meaning: 'Lithium Ion Batteries (Excepted)', desc: 'Lithium ion batteries shipped under Section II of PI 966 and PI 967.', applicability: 'PI 966-II, PI 967-II' }
    ]
  };
  return data[lang] || data.pt;
};

const getGlossary = (lang: Language) => {
  const data = {
    pt: [
      { term: 'Battery (Bateria)', def: 'Duas ou mais células ou conjuntos de células que são eletricamente conectadas entre si e equipadas com dispositivos necessários para uso, por exemplo, invólucro, terminais, marcação e dispositivos de proteção.', context: 'IATA DGR 3.9.2. Unidades "Power Bank" são tratadas como baterias.' },
      { term: 'Cell (Célula)', def: 'Uma única unidade eletroquímica encapsulada (um eletrodo positivo e um negativo) que apresenta uma diferença de voltagem entre seus dois terminais.', context: 'IATA DGR 3.9.2.' },
      { term: 'Nominal Energy (Wh)', def: 'Energia nominal de uma célula ou bateria de íon-lítio, calculada multiplicando-se a voltagem nominal pela capacidade nominal expressa em Ampere-hora (Ah).', context: 'Critério de classificação de perigo.' },
      { term: 'State of Charge (SoC)', def: 'A capacidade restante em uma bateria de íon-lítio, expressa como uma porcentagem de sua capacidade nominal.', context: 'Limite de 30% para UN 3480.' },
      { term: 'Overpack (Sobreembalagem)', def: 'Um invólucro utilizado por um único expedidor para conter um ou mais volumes e formar uma unidade de manuseio para conveniência de estiva e transporte.', context: 'DGR 5.0.1.5' },
      { term: 'Dangerous Goods (Artigos Perigosos)', def: 'Artigos ou substâncias que são capazes de representar um risco à saúde, segurança, propriedade ou meio ambiente e que constam na Lista de Artigos Perigosos.', context: 'IATA DGR 1.0' },
      { term: 'Consignor (Expedidor)', def: 'A entidade legal que prepara e oferece os artigos perigosos para transporte.', context: 'IATA DGR 1.2.7' }
    ],
    en: [
      { term: 'Battery', def: 'Two or more cells which are electrically connected together and fitted with devices necessary for use.' }
    ]
  };
  return data[lang] || data.pt;
};

const getDGRData = (lang: Language) => {
  const common = {
    pt: [
      // SEÇÃO 1
      { section: '1.2.7', topic: 'Aplicabilidade', title: 'Responsabilidades do Expedidor', desc: 'Conformidade Mandatória', details: 'Um expedidor deve garantir que os artigos ou substâncias não são proibidos para transporte aéreo e que estão devidamente identificados, classificados, embalados, marcados, etiquetados e documentados de acordo com estas Regulamentações.' },
      { section: '1.3', topic: 'Treinamento', title: 'Treinamento Baseado em Competência', desc: 'Competência do Pessoal', details: 'Todo o pessoal que prepara remessas de baterias de lítio deve ser treinado e sua competência deve ser verificada de acordo com as funções que desempenha. Reciclagem a cada 24 meses.' },
      { section: '1.6.1', topic: 'Aplicabilidade', title: 'Instrução Adequada', desc: 'Requisito para Seção II', details: 'Qualquer pessoa preparando ou oferecendo células ou baterias de lítio para transporte sob a Seção II das Instruções de Embalagem 965 a 970 deve receber instrução adequada compatível com suas responsabilidades.' },

      // SEÇÃO 2
      { section: '2.2', topic: 'Limitações', title: 'Artigos Perigosos Ocultos', desc: 'Vigilância de Aceite', details: 'A equipe de aceitação deve estar alerta para itens declarados como "Equipamento Elétrico", "Peças Sobressalentes" ou "Suprimentos de Camping", pois podem conter baterias de lítio não declaradas.' },
      { section: '2.3.2.4', topic: 'Limitações', title: 'Bagagem de Passageiros e Tripulação', desc: 'Dispositivos Eletrônicos (PED)', details: 'Permitidos apenas com aprovação do operador para baterias entre 100Wh e 160Wh. Baterias sobressalentes devem estar na bagagem de mão.' },
      { section: '2.8', topic: 'Limitações', title: 'Variações de Estado e Operador', desc: 'Regras Adicionais', details: 'Estados e Operadores podem impor restrições mais rigorosas que o DGR (ex: Variação LATAM L7-01 proíbe UN 3480 em PAX).' },

      // SEÇÃO 3
      { section: '3.9.2.6', topic: 'Classificação', title: 'Critérios para Baterias de Lítio', desc: 'Regras de Design e Teste', details: 'Células e baterias contendo lítio devem atender aos requisitos de cada teste do Manual de Testes e Critérios da ONU, Parte III, subseção 38.3. Devem ser fabricadas sob um programa de gestão da qualidade.' },
      { section: '3.9.2.6.1', topic: 'Classificação', title: 'Resumo de Teste (Test Summary)', desc: 'Disponibilidade de Dados', details: 'Fabricantes e distribuidores devem disponibilizar o Resumo de Teste conforme especificado no Manual de Testes e Critérios da ONU. Deve estar disponível desde 1º de janeiro de 2020.' },

      // SEÇÃO 4
      { section: '4.2', topic: 'Identificação', title: 'Lista de Artigos Perigosos', desc: 'Tabela Azul', details: 'As entradas UN 3480, 3481, 3090 e 3091 devem ser utilizadas conforme a química e a configuração do embarque. Define o risco, as instruções de embalagem e os limites de peso por volume.' },
      { section: '4.4', topic: 'Identificação', title: 'Disposições Especiais (SP)', desc: 'Exceções e Adições', details: 'A coluna M da Tabela 4.2 referencia as disposições especiais (série A) que alteram ou esclarecem os requisitos de transporte.' },

      // SEÇÃO 5
      { section: '5.0.2.4', topic: 'Embalagem', title: 'Proteção contra Curto-Circuito', desc: 'Segurança Interna', details: 'As baterias devem ser protegidas de modo a evitar curtos-circuitos. Isso inclui proteção contra o contato com materiais condutores dentro da mesma embalagem.' },
      { section: '5.0.2.6', topic: 'Embalagem', title: 'Prevenção de Ativação Acidental', desc: 'Regras para Equipamentos', details: 'Os equipamentos devem ser providos de meios eficazes para prevenir a ativação acidental durante o transporte (ex: interruptores embutidos ou travas).' },

      // SEÇÃO 6
      { section: '6.0.3', topic: 'Embalagem', title: 'Marcação de Homologação UN', desc: 'Identificação da Embalagem', details: 'Ex: "UN 4G/Y10/S/..." indica caixa de papelão (4G), aprovada para Grupo de Embalagem II (Y), com peso bruto máximo de 10kg.' },
      { section: '6.3', topic: 'Embalagem', title: 'Testes de Desempenho', desc: 'Critérios de Homologação', details: 'Inclui o Teste de Queda de 1,2 metros, o Teste de Empilhamento por 24 horas e o teste de pressão diferencial de 95 kPa.' },

      // SEÇÃO 7
      { section: '7.1.5.5', topic: 'Marcação', title: 'Marca de Bateria de Lítio', desc: 'Especificações de Design', details: 'A marca deve ter a forma de um retângulo com bordas hachuradas. Dimensões mínimas de 100 mm x 100 mm. Deve conter o Número UN e um número de telefone.' },
      { section: '7.2.2.3.2', topic: 'Rotulagem', title: 'Etiqueta Classe 9A', desc: 'Risco de Lítio', details: 'A metade superior apresenta sete faixas verticais pretas. A metade inferior mostra um grupo de baterias e o número 9.' },

      // SEÇÃO 8
      { section: '8.1', topic: 'Documentação', title: 'Declaração do Expedidor (DGD)', desc: 'Regras de Preenchimento', details: 'A DGD deve ser preenchida em triplicata, em inglês e possuir as hachuras vermelhas mandatórias. A descrição deve incluir o nome técnico.' },
      { section: '8.2', topic: 'Documentação', title: 'AWB (Air Waybill)', desc: 'Natureza da Carga', details: 'Deve conter as frases obrigatórias de conformidade (ex: "Lithium ion batteries in compliance with Section II of PI 967").' },

      // SEÇÃO 9
      { section: '9.3', topic: 'Manuseio', title: 'Segregação de Carga', desc: 'Compatibilidade', details: 'Baterias de lítio devem ser segregadas de pacotes contendo explosivos (Classe 1), exceto Divisão 1.4S e de animais vivos.' },
      { section: '9.5.1', topic: 'Manuseio', title: 'NOTOC (Notification to Captain)', desc: 'Informação ao Comandante', details: 'O comandante deve ser informado sobre a localização e quantidade de baterias de lítio reguladas a bordo.' },

      // INSTRUÇÕES DE EMBALAGEM
      { section: 'PI 965-IA', topic: 'PI 965', title: 'UN 3480 - Seção IA', desc: 'Regulamentação Integral', details: 'Aplica-se a células > 20 Wh e baterias > 100 Wh. Requer embalagem UN PG II. Limite de 35 kg (CAO). Proibido em PAX.' },
      { section: 'PI 965-IB', topic: 'PI 965', title: 'UN 3480 - Seção IB', desc: 'Quantidade Reduzida', details: 'Aplica-se a células ≤ 20 Wh e baterias ≤ 100 Wh em excesso da Seção II. Requer embalagem UN e marcas reguladas.' }
    ],
    en: [
      { section: '1.2.7', topic: 'Applicability', title: 'Shipper\'s Responsibilities', desc: 'Verbatim text', details: 'A shipper must ensure that articles or substances are properly identified and documented.' }
    ]
  };
  return lang === 'pt' ? common.pt : common.en;
};

const getSPData = (lang: Language) => {
  const data = {
    pt: [
      { code: 'A88', title: 'A88: Protótipos e Pré-Produção', desc: 'Baterias sem teste UN 38.3', details: 'Podem ser transportadas apenas em aeronaves de carga se aprovadas pela autoridade do Estado de origem. Requer embalagem PG I.' },
      { code: 'A154', title: 'A154: Baterias Danificadas/Defeituosas', desc: 'PROIBIÇÃO ESTRITA', details: 'Células ou baterias de lítio identificadas pelo fabricante como defeituosas por razões de segurança são PROIBIDAS para transporte.' },
      { code: 'A331', title: 'A331: Estado de Carga (SoC)', desc: 'UN 3480', details: 'Baterias de íon-lítio (UN 3480) devem ser oferecidas com SoC não superior a 30% da sua capacidade nominal.' }
    ],
    en: [
      { code: 'A154', title: 'A154: Damaged or Defective', details: 'Forbidden for air transport.' }
    ]
  };
  return data[lang] || data.pt;
};

const getSegregation = (lang: Language) => {
  const data = {
    pt: [
      { title: 'Tabela 9.3.A: Segregação de Perigo', rule: 'DGR 9.3.2.1', desc: 'Regra Geral de Compatibilidade', details: 'Volumes contendo baterias de lítio reguladas (Seção IA/IB) não devem ser estivados próximos a volumes com etiquetas de Classe 1 (Explosivos), exceto 1.4S.' },
      { title: 'Explosivos (Classe 1)', rule: 'DGR 9.3.2.1.3', desc: 'Incompatibilidade Crítica', details: 'Segregação obrigatória. Não carregar no mesmo dispositivo de carga (ULD) com itens da Classe 1 (exceto 1.4S).' },
      { title: 'Radioativos (Classe 7)', rule: 'DGR 9.3.2.1.5', desc: 'Distância Mínima', details: 'Volumes de Classe 9 devem ser mantidos a uma distância segura de materiais radioativos para evitar interferência.' },
      { title: 'Animais Vivos (AVI)', rule: 'DGR 9.3.2.1.4', desc: 'Bem-estar Animal', details: 'Não carregar em proximidade direta devido ao potencial de emissão de calor. Mínimo 1 metro de distância recomendado.' },
      { title: 'Gelo Seco (UN 1845)', rule: 'DGR 9.3.2.1.2', desc: 'Controle de Emissão', details: 'Baterias de lítio podem ser enviadas com gelo seco se a embalagem permitir a liberação do gás CO2 e as baterias estiverem protegidas.' }
    ],
    en: [
      { title: 'Explosives (Class 1)', rule: 'DGR 9.3.2.1.3', desc: 'Must be segregated.' }
    ]
  };
  return data[lang] || data.pt;
};

const getPackaging = (lang: Language) => {
  const data = {
    pt: [
      { code: 'UN 4G', type: 'Caixa de Fibra (Fibreboard)', desc: 'Embalagem UN para PG II.', suitability: 'O mais comum para baterias de lítio.' },
      { code: 'UN 4H2', type: 'Caixa de Plástico Rígido', desc: 'Alta durabilidade.', suitability: 'Ideal para baterias grandes e pesadas.' },
      { code: 'UN 1A2', type: 'Tambor de Aço (Tampa Removível)', desc: 'Proteção metálica.', suitability: 'Uso industrial especializado.' },
      { code: 'PG II (Y)', type: 'Grupo de Embalagem II', desc: 'Risco Médio.', suitability: 'Exigência padrão para Lítio Seção IA/IB.' },
      { code: '95 kPa', type: 'Teste de Pressão', desc: 'Diferencial de Pressão.', suitability: 'Mandatório para embalagens que contenham líquidos ou baterias suscetíveis.' },
      { code: 'Drop Test 1.2m', type: 'Teste de Queda', desc: 'Resistência a Impacto.', suitability: 'Obrigatório para Seção II e embalagens reguladas.' }
    ],
    en: [
      { code: 'UN 4G', type: 'Fibreboard Box', desc: 'UN specification for PG II.' }
    ]
  };
  return data[lang] || data.pt;
};

const SECTION_METADATA: Record<string, { title: string, icon: any }> = {
  '1': { title: 'Seção 1 - Aplicabilidade', icon: Shield },
  '2': { title: 'Seção 2 - Limitações', icon: Ban },
  '3': { title: 'Seção 3 - Classificação', icon: Microscope },
  '4': { title: 'Seção 4 - Identificação', icon: Search },
  '5': { title: 'Seção 5 - Embalagem', icon: Box },
  '6': { title: 'Seção 6 - Especificações UN', icon: Beaker },
  '7': { title: 'Seção 7 - Marcação', icon: Tag },
  '8': { title: 'Seção 8 - Documentação', icon: FileText },
  '9': { title: 'Seção 9 - Manuseio', icon: HardHat },
  'PI': { title: 'Instruções de Embalagem', icon: ClipboardList },
};

const UI_TEXT = {
  pt: {
    title: 'Dicionário Técnico DGR',
    subtitle: 'Compêndio Integral IATA',
    search: 'Buscar Cláusula ou Código...',
    back: 'Índice de Seções',
    summary: 'Referência da Cláusula',
    details: 'Texto Integral do Regulamento',
    no_results: 'Cláusula não encontrada',
    tabs: { SP: 'Disposições (A)', DGR: 'Seções IATA', GLOSSARY: 'Terminologia', IMP: 'Códigos IMP', SEG: 'Segregação', PKG: 'Embalagem UN' }
  },
  en: {
    title: 'DGR Technical Dictionary',
    subtitle: 'Authorized Verbatim Mirror',
    search: 'Search Clause or Code...',
    back: 'Section Index',
    summary: 'Clause Reference',
    details: 'Full Regulatory Text',
    no_results: 'No clause found',
    tabs: { SP: 'Provisions (A)', DGR: 'IATA Sections', GLOSSARY: 'Terminology', IMP: 'IMP Codes', SEG: 'Segregation', PKG: 'UN Packaging' }
  }
};

type TabType = 'SP' | 'GLOSSARY' | 'PKG' | 'CHK' | 'DGR' | 'SEG' | 'IMP';

export function SpecialProvisionsDictionary({ language }: { language: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('SP');
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({'PI': true});

  const T = UI_TEXT[language === 'pt' ? 'pt' : 'en'];
  const SP_DATA = getSPData(language);
  const GLOSSARY_DATA = getGlossary(language);
  const PKG_DATA = getPackaging(language);
  const DGR_DATA = getDGRData(language);
  const SEG_DATA = getSegregation(language);
  const IMP_DATA = getIMPData(language);

  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab, isOpen]);

  const toggleFolder = (key: string) => setOpenFolders(prev => ({...prev, [key]: !prev[key]}));

  const renderDetailView = (item: any) => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
       <button onClick={() => setSelectedSection(null)} className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-6 w-fit group">
         <div className="p-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors"><ArrowLeft size={16} /></div>
         {T.back}
       </button>
       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex-1 flex flex-col">
          <div className="bg-indigo-950 p-8 text-white relative overflow-hidden shrink-0">
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-black tracking-widest">{item.section || item.code || item.rule}</span>
             </div>
             <h2 className="text-xl font-black leading-tight mb-2">{item.title || item.term || item.type}</h2>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
             <div className="prose prose-sm prose-slate max-w-none">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ScrollText size={12} /> {T.summary}</h3>
                <p className="text-sm font-medium text-slate-600 mb-8 p-5 bg-white rounded-2xl border border-slate-100 italic shadow-sm">"{item.desc || item.def || item.meaning}"</p>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileSearch size={12} /> {T.details}</h3>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-600">
                   {item.details || item.desc || item.def}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const getGroupKey = (section: string) => (section.startsWith('PI') ? 'PI' : section.charAt(0));

  const getData = () => {
    let data = [];
    switch(activeTab) {
      case 'SP': data = SP_DATA; break;
      case 'GLOSSARY': data = GLOSSARY_DATA; break;
      case 'PKG': data = PKG_DATA; break;
      case 'DGR': data = DGR_DATA; break;
      case 'SEG': data = SEG_DATA; break;
      case 'IMP': data = IMP_DATA; break;
    }
    if (!search.trim()) return data;
    const fuse = new Fuse(data, { keys: ['code', 'title', 'term', 'type', 'desc', 'details', 'def', 'section', 'rule'], threshold: 0.3 });
    return fuse.search(search).map(res => res.item);
  };

  const filteredItems = getData();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-coral-500 text-white rounded-full shadow-2xl border border-coral-400 flex items-center justify-center z-40 transition-all hover:scale-105 group print:hidden"
      >
        <Book size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start">
           <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
           <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-500">
              
              {selectedSection ? (
                 <div className="h-full p-6">{renderDetailView(selectedSection)}</div>
              ) : (
                <>
                  <div className="p-6 pb-2 shrink-0 bg-white">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-600 text-white rounded-xl"><Book size={20} /></div>
                          <div>
                             <h2 className="text-lg font-black text-indigo-950">{T.title}</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{T.subtitle}</p>
                          </div>
                       </div>
                       <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                    </div>

                    <div className="relative mb-6">
                       <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                         type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.search}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none shadow-inner"
                       />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                       {[
                         { id: 'SP', label: T.tabs.SP, icon: Scale },
                         { id: 'DGR', label: T.tabs.DGR, icon: FolderOpen },
                         { id: 'GLOSSARY', label: T.tabs.GLOSSARY, icon: GraduationCap },
                         { id: 'IMP', label: T.tabs.IMP, icon: Code },
                         { id: 'SEG', label: T.tabs.SEG, icon: Split },
                         { id: 'PKG', label: T.tabs.PKG, icon: Box },
                       ].map(tab => (
                         <button 
                           key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                           className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl text-[9px] font-black uppercase transition-all border text-center h-16 ${
                             activeTab === tab.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-indigo-50/30'
                           }`}
                         >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-6 bg-slate-50/50 custom-scrollbar">
                     {activeTab === 'DGR' && (
                        <div className="space-y-3">
                           {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'PI'].map(key => {
                              const meta = SECTION_METADATA[key] || { title: `Seção ${key}`, icon: Folder };
                              const items = DGR_DATA.filter(d => getGroupKey(d.section) === key);
                              const isOpen = openFolders[key];
                              if (items.length === 0) return null;
                              return (
                                <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                   <button onClick={() => toggleFolder(key)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
                                      <div className="flex items-center gap-3">
                                         <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><meta.icon size={16} /></div>
                                         <span className="font-black text-xs uppercase text-indigo-950">{meta.title}</span>
                                      </div>
                                      <ChevronRight size={18} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-90 text-indigo-600' : ''}`} />
                                   </button>
                                   {isOpen && (
                                      <div className="p-3 grid grid-cols-2 gap-2 border-t bg-slate-50/30">
                                         {items.map((item, idx) => (
                                            <button key={idx} onClick={() => setSelectedSection(item)} className="bg-white p-3 rounded-xl border border-slate-200 text-left hover:border-indigo-400 group">
                                               <span className="text-[9px] font-black text-indigo-600 mb-1 block group-hover:translate-x-1">{item.section}</span>
                                               <h4 className="font-bold text-[10px] text-slate-800 leading-tight">{item.title}</h4>
                                            </button>
                                         ))}
                                      </div>
                                   )}
                                </div>
                              )
                           })}
                        </div>
                     )}

                     {activeTab === 'SP' && (
                        <div className="space-y-3">
                           {filteredItems.map((sp: any) => (
                              <div key={sp.code} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-400 cursor-pointer" onClick={() => setSelectedSection(sp)}>
                                 <span className="px-3 py-1 bg-indigo-950 text-white rounded-lg font-black text-xs block w-fit mb-3">{sp.code}</span>
                                 <h3 className="font-black text-sm text-indigo-950 mb-2">{sp.title || sp.code}</h3>
                                 <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border-l-4 border-l-indigo-600 line-clamp-3">{sp.details || sp.desc}</p>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'GLOSSARY' && (
                        <div className="grid gap-3">
                           {filteredItems.map((item, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200">
                                 <h3 className="font-black text-indigo-950 mb-1">{item.term}</h3>
                                 <p className="text-xs text-slate-600 leading-relaxed">{item.def}</p>
                                 <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-lg"><Info size={12} /> {item.context}</div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'IMP' && (
                        <div className="grid gap-3">
                           {filteredItems.map((imp, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                                 <div className="bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0">{imp.code}</div>
                                 <div className="flex-1">
                                    <h4 className="font-black text-xs text-indigo-950 uppercase">{imp.meaning}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{imp.desc}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'SEG' && (
                        <div className="space-y-3">
                           {filteredItems.map((seg, idx) => (
                              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-coral-400 cursor-pointer" onClick={() => setSelectedSection(seg)}>
                                 <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 bg-coral-500 text-white rounded-lg font-black text-[10px] uppercase tracking-widest">{seg.rule}</span>
                                    <AlertTriangle size={16} className="text-coral-500" />
                                 </div>
                                 <h3 className="font-black text-sm text-indigo-950 mb-2">{seg.title}</h3>
                                 <p className="text-xs text-slate-600 leading-relaxed italic">{seg.desc}</p>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'PKG' && (
                        <div className="grid grid-cols-1 gap-3">
                           {filteredItems.map((pkg, idx) => (
                              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col hover:border-indigo-400 cursor-pointer" onClick={() => setSelectedSection(pkg)}>
                                 <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-indigo-950 text-white p-2 rounded-lg"><Box size={16} /></div>
                                    <span className="font-black text-sm text-indigo-950">{pkg.code}</span>
                                 </div>
                                 <h4 className="font-bold text-xs text-slate-800 mb-1">{pkg.type}</h4>
                                 <p className="text-[10px] text-slate-500 leading-relaxed mb-3">{pkg.desc}</p>
                                 <div className="bg-indigo-50 p-2 rounded-lg text-[9px] font-black text-indigo-700 uppercase tracking-widest text-center">
                                    {pkg.suitability}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                           <FileSearch size={48} className="mb-3 opacity-20" />
                           <p className="text-xs font-black uppercase tracking-widest">{T.no_results}</p>
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
