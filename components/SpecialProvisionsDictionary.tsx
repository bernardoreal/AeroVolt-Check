
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

/**
 * DICIONÁRIO TÉCNICO REGULATÓRIO EXAUSTIVO - IATA DGR 67ª EDIÇÃO (2026)
 * Dataset completo para auditoria e consulta técnica.
 */

export const GLOSSARY_DATA = [
  { 
    term: 'Ampère-hora (Ah)', 
    def: 'Unidade de medida de carga elétrica que representa a transferência de um Ampère de corrente constante durante o período de uma hora.', 
    context: 'Referência DGR 3.9.2.6.1: Parâmetro fundamental para o cálculo de energia nominal. Ah = mAh / 1000. Essencial para o cálculo de Wh.' 
  },
  { 
    term: 'Bateria (Battery)', 
    def: 'Duas ou mais células ou baterias conectadas eletricamente entre si e equipadas com dispositivos necessários para uso final.', 
    context: 'Nota Regulatória: Baterias compostas por uma única célula são tratadas como "células" para fins de limites de energia nas PIs.' 
  },
  { 
    term: 'Bateria de Lítio (Equipamento)', 
    def: 'Consiste em células ou baterias instaladas em um dispositivo (Contained in) ou embaladas com ele (Packed with).', 
    context: 'Diferenciação Crítica: O DGR mantém distinções rígidas de massa e marcação entre estas configurações.' 
  },
  { 
    term: 'Célula de Lítio (Lithium Cell)', 
    def: 'Unidade eletroquímica encapsulada básica possuindo um eletrodo positivo e um negativo, exibindo diferença de potencial entre terminais.', 
    context: 'Critério Técnico: Limites de 20Wh (Íon) ou 1g (Metal) aplicam-se a células individuais.' 
  },
  { 
    term: 'Estado de Carga (SoC)', 
    def: 'State of Charge. Nível de energia residual em relação à capacidade nominal de design do fabricante.', 
    context: 'Mandato A331: Remessas UN 3480 e UN 3551 soltas devem ser oferecidas para transporte com SoC ≤ 30%.' 
  },
  { 
    term: 'Fuga Térmica (Thermal Runaway)', 
    def: 'Fenômeno onde o aumento de temperatura interna desencadeia reações químicas exotérmicas auto-sustentadas.', 
    context: 'Risco de Segurança: Pode resultar em fogo, emissão de gases tóxicos e estilhaços, justificando a proibição da SP A154.' 
  },
  { 
    term: 'Massa Líquida (Net Quantity)', 
    def: 'Massa dos artigos perigosos contidos em um volume, excluindo a massa da embalagem e itens não-perigosos.', 
    context: 'Limites IATA: Decisivo para classificar entre Seção IA, IB e II nas instruções de embalagem.' 
  },
  { 
    term: 'Resumo de Teste (UN 38.3)', 
    def: 'Documento mandatório atestando aprovação nos ensaios T.1 a T.8 previstos no Manual de Testes e Critérios da ONU.', 
    context: 'Variação L7-04: A LATAM exige a disponibilidade física ou digital verificável deste documento no ato do aceite.' 
  },
  { 
    term: 'Sobreembalagem (Overpack)', 
    def: 'Um invólucro usado por um único expedidor para conter um ou mais volumes e formar uma unidade de manuseio consolidada.', 
    context: 'Marcação 7.1.7: A marca "OVERPACK" é mandatória se as etiquetas internas não forem visíveis.' 
  },
  { 
    term: 'Watt-hora (Wh)', 
    def: 'Unidade de medida de energia nominal. Cálculo: Voltagem Nominal (V) × Capacidade Nominal (Ah).', 
    context: 'Critério de Seção: Determina se a bateria segue pela Seção I (>100Wh) ou Seção II (≤100Wh) das instruções.' 
  }
];

export const PACKAGING_DATA = [
  { 
    code: 'UN 4G/Y', 
    type: 'Caixa de Fibra Certificada', 
    desc: 'Embalagem de fibra de madeira submetida a ensaios de queda, empilhamento e pressão para o Grupo de Embalagem II.', 
    suitability: 'Obrigatório para Seções IA e IB. Deve portar a marca de especificação UN permanente.' 
  },
  { 
    code: 'Strong Rigid Outer', 
    type: 'Embalagem Rígida Forte', 
    desc: 'Construção robusta capaz de reter o conteúdo sob condições normais, incluindo vibrações e variações de temperatura.', 
    suitability: 'Permitido para Seção II. Deve ser capaz de suportar um drop test de 1,2 m sem danos às células.' 
  },
  { 
    code: '95 kPa', 
    type: 'Diferencial de Pressão', 
    desc: 'Capacidade estrutural de reter líquidos ou vapores sem vazamento sob diferencial de pressão de 95 kPa.', 
    suitability: 'Mandatório para baterias contendo eletrólitos líquidos que possam vazar sob descompressão em altitude.' 
  },
  { 
    code: 'Isolamento de Terminais', 
    type: 'Proteção Elétrica', 
    desc: 'Uso de materiais não condutores para prevenir o contato elétrico acidental entre terminais.', 
    suitability: 'Mandato universal IATA 5.0.2.4 para prevenir curto-circuitos e geração perigosa de calor.' 
  }
];

export const DGR_REGULATIONS_DATA = [
  { section: '1.2.7', topic: 'Shipper', title: 'Responsabilidades do Expedidor', desc: 'O expedidor assume a obrigação legal pela conformidade integral da remessa.', details: 'Garante classificação, embalagem, marcação, etiquetagem e documentação correta. Aplica-se a PAX e CAO.' },
  { section: '1.3', topic: 'Treinamento', title: 'Capacitação CBTA', desc: 'Treinamento obrigatório baseado em competências para funções específicas.', details: 'Verificação periódica a cada 24 meses é mandatória para manter a validade da função de expedidor.' },
  { section: '1.5', topic: 'Segurança', title: 'Security (Safe Transport)', desc: 'Disposições para prevenir o uso malicioso de artigos perigosos.', details: 'Inclui protocolos de acesso restrito e proteção da cadeia logística.' },
  { section: '2.3', topic: 'Consumer', title: 'Itens de Passageiros (2.3.A)', desc: 'Regras para dispositivos eletrônicos transportados por passageiros.', details: 'Baterias sobressalentes e Power Banks devem ser transportados exclusivamente na bagagem de mão.' },
  { section: '2.8', topic: 'Variações', title: 'Variações de Estado e Operador', desc: 'Regras mais restritivas impostas por países ou companhias aéreas.', details: 'Exemplos: L7-01 (Proibição PAX), L7-04 (UN 38.3 Mandatório). A regra mais rígida sempre prevalece.' },
  { section: '3.9.2.6', topic: 'Classificação', title: 'Baterias de Lítio (Critérios)', desc: 'Normas de design e certificação de segurança sob o Manual ONU.', details: 'Exige programa de gestão de qualidade e aprovação nos ensaios T.1 a T.8 para qualquer transporte.' },
  { section: '4.2', topic: 'Identificação', title: 'Lista de Artigos Perigosos', desc: 'Tabela central contendo UN Numbers e Nomes Apropriados de Embarque.', details: 'Define a classe de risco (Classe 9), instruções de embalagem e limites de massa permitidos.' },
  { section: '4.4', topic: 'SPs', title: 'Disposições Especiais (A-Series)', desc: 'Regras específicas que alteram ou complementam as instruções gerais.', details: 'Mapeia provisões críticas como A154 (Danificadas) e A331 (Limite de SoC).' },
  { section: '5.0.2', topic: 'Embalagem', title: 'Requisitos Gerais de Construção', desc: 'Padrões técnicos de proteção física e mecânica.', details: 'Volumes devem resistir a vibrações e variações de pressão (95 kPa).' },
  { section: '7.1', topic: 'Marcação', title: 'Marcação de Volumes', desc: 'Informações visuais obrigatórias na parte externa do volume.', details: 'Exige UN Number, Nome de Embarque, Nomes/Endereços de Expedidor e Destinatário.' },
  { section: '7.2', topic: 'Etiquetagem', title: 'Etiquetas de Risco e Manuseio', desc: 'Especificações gráficas de etiquetas de perigo.', details: 'Inclui Classe 9A (Baterias), CAO (Cargueiro) e Etiquetas de Direcionamento.' },
  { section: '8.1', topic: 'Documentação', title: 'Shipper\'s Declaration (DGD)', desc: 'Documento legal onde o expedidor declara o conteúdo perigoso.', details: 'Preenchimento técnico rigoroso em triplicata com margens vermelhas hachuradas obrigatórias.' },
  { section: '9.3', topic: 'Segregação', title: 'Incompatibilidade de Cargas', desc: 'Regras de separação física dentro da aeronave.', details: 'Baterias de lítio devem ser segregadas de explosivos (Cl 1) e animais vivos (AVI).' },
  { section: 'PI 965', topic: 'Instrução', title: 'Íon-Lítio Standalone (UN 3480)', desc: 'Baterias soltas sem equipamento acompanhando.', details: 'Proibido em PAX. SoC ≤ 30% mandatório. Seção IA/IB requer embalagem UN Spec.' },
  { section: 'PI 966', topic: 'Instrução', title: 'Íon-Lítio c/ Equipamento (UN 3481)', desc: 'Baterias embaladas no mesmo volume que o equipamento.', details: 'Permitido em PAX e CAO. Baterias devem estar em embalagens internas individuais.' },
  { section: 'PI 967', topic: 'Instrução', title: 'Íon-Lítio no Equipamento (UN 3481)', desc: 'Baterias instaladas no interior do dispositivo eletrônico.', details: 'Permitido em PAX e CAO. O equipamento deve ser protegido contra funcionamento inadvertido.' },
  { section: 'PI 968', topic: 'Instrução', title: 'Metal Lítio Standalone (UN 3090)', desc: 'Baterias não recarregáveis soltas.', details: 'Proibido em PAX. Alto risco de incêndio. Requer aprovação especial acima de 35kg.' },
  { section: 'PI 969', topic: 'Instrução', title: 'Metal Lítio c/ Equipamento (UN 3091)', desc: 'Baterias não recarregáveis soltas com equipamento.', details: 'Permitido em PAX e CAO. Sujeito a limites de massa de lítio metálico por volume.' },
  { section: 'PI 970', topic: 'Instrução', title: 'Metal Lítio no Equipamento (UN 3091)', desc: 'Baterias instaladas (ex: Baterias CMOS, Relógios).', details: 'Permitido em PAX e CAO. Isenção de marcação para remessas de até 2 volumes sob Seção II.' }
];

export const SPECIAL_PROVISIONS_DATA = [
  { code: 'A1', title: 'A1: Aprovação Exclusiva CAO', desc: 'Restringe o transporte a aeronaves cargueiras apenas.', details: 'Utilizado para itens de alto risco onde o transporte em aeronave de passageiros é proibido.', reference: 'DGR 4.4' },
  { code: 'A2', title: 'A2: Proibição Total (Aeronave)', desc: 'Artigos proibidos sob qualquer circunstância de voo.', details: 'Itens listados nesta provisão não podem ser transportados no modal aéreo.', reference: 'DGR 4.4' },
  { code: 'A51', title: 'A51: Equipamento de Salvamento', desc: 'Exceções para itens de resgate e emergência.', details: 'Regulamenta o transporte de baterias integradas em botes e coletes.', reference: 'DGR 4.4' },
  { code: 'A88', title: 'A88: Protótipos de Baterias', desc: 'Baterias que não foram submetidas ao teste UN 38.3.', details: 'Requer aprovação especial da autoridade competente e do operador (CAO).', reference: 'IATA DGR 4.4', risk: 'high' },
  { code: 'A99', title: 'A99: Massas Superiores a 35 kg', desc: 'Baterias de grande porte em embalagem única.', details: 'Requer aprovação prévia do estado de origem e do operador aéreo. Aplicável apenas em CAO.', reference: 'IATA DGR 4.4', risk: 'high' },
  { code: 'A154', title: 'A154: Danificadas ou Defeituosas', desc: 'PROIBIÇÃO ESTRITA DE TRANSPORTE AÉREO.', details: 'Baterias identificadas como defeituosas por segurança ou danificadas com potencial de fuga térmica são proibidas no ar.', reference: 'IATA DGR 3.9.2.6', risk: 'forbidden' },
  { code: 'A161', title: 'A161: Isenção de Teste de Embalagem', desc: 'Critérios de isenção para volumes específicos.', details: 'Aplica-se onde a embalagem externa é o próprio dispositivo.', reference: 'DGR 4.4' },
  { code: 'A164', title: 'A164: Prevenção de Ativação Inadvertida', desc: 'Proteção para baterias instaladas em equipamentos.', details: 'Equipamentos devem portar travas ou circuitos que impeçam o funcionamento acidental.', reference: 'IATA DGR 4.4' },
  { code: 'A183', title: 'A183: Baterias para Descarte/Reciclagem', desc: 'Remessas enviadas para eliminação final.', details: 'Transporte aéreo proibido a menos que haja aprovação especial.', reference: 'IATA DGR 4.4', risk: 'forbidden' },
  { code: 'A185', title: 'A185: Dispositivos de Dados (Trackers)', desc: 'Regulamenta rastreadores GPS e loggers em carga.', details: 'Define limites de energia para dispositivos que permanecem ligados.', reference: 'DGR 4.4' },
  { code: 'A199', title: 'A199: Baterias Ni-MH', desc: 'Baterias químicas não baseadas em lítio.', details: 'Classificadas como "Não Restritas" desde que protegidas contra curto-circuito.', reference: 'IATA DGR 4.4', risk: 'low' },
  { code: 'A201', title: 'A201: Transporte em Emergência', desc: 'Disposição para situações críticas de saúde/segurança.', details: 'Permite o transporte sob aprovação governamental estrita.', reference: 'IATA DGR 4.4', risk: 'high' },
  { code: 'A206', title: 'A206: Design da Marca de Bateria', desc: 'Especificações gráficas rígidas da marca hachurada.', details: 'A marca deve portar o UN Number e telefone. Uso do design antigo é proibido.', reference: 'IATA DGR 7.2.2' },
  { code: 'A213', title: 'A213: Baterias de Sódio-Íon (UN 3551)', desc: 'Novos requisitos para tecnologia Sodium-Ion.', details: 'Equivalência técnica às baterias de lítio (SoC 30%).', reference: 'IATA DGR 4.4', risk: 'medium' },
  { code: 'A331', title: 'A331: Estado de Carga (SoC Limit)', desc: 'Limite mandatório de 30% SoC para UN 3480 soltas.', details: 'Remessas de PI 965 devem portar SoC ≤ 30%. Aplicável em CAO.', reference: 'IATA PI 965', risk: 'high' }
];

const UI_TEXT_PT = {
  title: 'Wiki IATA DGR',
  subtitle: 'Base Técnica Regulatória 2026',
  search: 'Buscar SP (ex: A154), Seção (ex: 3.9) ou Termo...',
  back: 'Voltar para Lista',
  summary: 'Definição Regulatória Oficial',
  details: 'Critérios Técnicos Mandatórios',
  no_results: 'Nenhum registro técnico encontrado',
  tabs: { 
    SP: 'Provisões', 
    GLOSSARY: 'Glossário', 
    PKG: 'Embalagens', 
    CHK: 'Checklist', 
    DGR: 'Instruções', 
    SEG: 'Segregação' 
  }
};

type TabType = 'SP' | 'GLOSSARY' | 'PKG' | 'CHK' | 'DGR' | 'SEG';

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

const getGroupKey = (section: string) => {
  if (!section) return 'App';
  if (section.toUpperCase().startsWith('PI')) return 'PI';
  const firstPart = section.split('.')[0];
  if (SECTION_METADATA[firstPart]) return firstPart;
  return 'App';
};

export function SpecialProvisionsDictionary({ language }: { language: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('SP');
  const [search, setSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({'PI': true});

  const T = UI_TEXT_PT;

  const CHK_DATA = [
    { title: 'DGD (Seção 8)', desc: 'Declaração em triplicata com margens hachuradas em vermelho. Assinada por pessoal qualificado.', mandated: true },
    { title: 'Marca de Lítio (7.1.5.5)', desc: 'Sinalização com UN Number e telefone. Mínimo 100x100mm.', mandated: true },
    { title: 'Etiqueta Classe 9A', desc: 'Símbolo específico de baterias de lítio. Obrigatório para Seções IA/IB.', mandated: true },
    { title: 'Etiqueta CAO', desc: 'Cargo Aircraft Only. Obrigatória para UN 3480/3090.', mandated: true }
  ];

  const SEG_DATA = [
    { title: 'Classe 1 (Explosivos)', rule: 'DGR 9.3.A', desc: 'Segregação obrigatória de todas as divisões.', details: 'Proibida estivagem conjunta de baterias e explosivos.' },
    { title: 'AVI (Animais Vivos)', rule: 'DGR 9.3.2', desc: 'Restrição absoluta de carregamento compartilhado.', details: 'Risco de asfixia química por HF em caso de incêndio de baterias.' },
    { title: 'Líquidos Inflamáveis', rule: 'Tabela 9.3.A', desc: 'Segregação recomendada para reduzir carga térmica.', details: 'A interação entre eletrólitos e Cl 3 exacerba incêndios.' }
  ];

  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab, isOpen]);

  const toggleExpand = (code: string) => setExpandedItem(prev => prev === code ? null : code);
  const toggleFolder = (key: string) => setOpenFolders(prev => ({...prev, [key]: !prev[key]}));

  const getRiskColor = (risk?: string) => {
    switch(risk) {
      case 'forbidden': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getData = () => {
    let data = [];
    switch(activeTab) {
      case 'SP': data = SPECIAL_PROVISIONS_DATA; break;
      case 'GLOSSARY': data = GLOSSARY_DATA; break;
      case 'PKG': data = PACKAGING_DATA; break;
      case 'CHK': data = CHK_DATA; break;
      case 'DGR': data = DGR_REGULATIONS_DATA; break;
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
                   DGR REF
                </span>
             </div>
             <h2 className="text-xl font-black tracking-tight leading-tight relative z-10 mb-2 uppercase italic">
                {item.title || item.term || item.type}
             </h2>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar">
             <div className="prose prose-sm prose-slate max-w-none">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{T.summary}</h3>
                <p className="text-base font-bold text-slate-800 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic leading-relaxed shadow-inner">
                   "{item.desc || item.def}"
                </p>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{T.details}</h3>
                <div className="text-sm text-slate-700 leading-relaxed font-medium space-y-4">
                   {item.details || item.context || item.desc}
                </div>
                {item.reference && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manual IATA DGR</span>
                    <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase">{item.reference}</span>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );

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
                             {activeTab === 'SP' && (
                               <div className="space-y-3">
                                  {filteredItems.map((sp: any) => {
                                    const isExpanded = expandedItem === sp.code;
                                    return (
                                      <div key={sp.code} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-50' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
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
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Referência:</span>
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{sp.reference}</span>
                                                  </div>
                                               </div>
                                            </div>
                                         )}
                                      </div>
                                    );
                                  })}
                               </div>
                             )}
                             {activeTab === 'GLOSSARY' && (
                               <div className="grid gap-3">
                                  {filteredItems.map((item: any, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:border-coral-200 transition-colors group">
                                       <h3 className="font-black text-indigo-900 mb-2 flex items-center gap-2 uppercase tracking-tight text-sm">
                                         {item.term}
                                         <GraduationCap size={14} className="text-slate-300 group-hover:text-coral-400" />
                                       </h3>
                                       <p className="text-sm text-slate-800 font-black leading-relaxed mb-3">{item.def}</p>
                                       <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex gap-3 items-start">
                                         <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                         <p className="text-xs text-slate-500 italic leading-relaxed font-medium">{item.context}</p>
                                       </div>
                                    </div>
                                  ))}
                               </div>
                             )}
                             {activeTab === 'PKG' && (
                                <div className="grid gap-3">
                                   {filteredItems.map((pkg: any, idx) => (
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
                             )}
                             {activeTab === 'CHK' && (
                                 <div className="space-y-3">
                                    {filteredItems.map((item: any, idx) => (
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
                             )}
                             {activeTab === 'DGR' && (
                                <div className="space-y-4">
                                   {(() => {
                                     const groups: Record<string, any[]> = {};
                                     filteredItems.forEach((item: any) => {
                                       const key = getGroupKey(item.section);
                                       if (!groups[key]) groups[key] = [];
                                       groups[key].push(item);
                                     });

                                     const order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'PI', 'App'];
                                     const sortedKeys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));

                                     return sortedKeys.map(key => {
                                        const groupItems = groups[key];
                                        const isFolderOpen = openFolders[key];
                                        const meta = SECTION_METADATA[key] || { title: `Seção ${key}`, icon: Folder };
                                        const Icon = meta.icon;

                                        return (
                                          <div key={key} className={`bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-300 ${isFolderOpen ? 'shadow-lg border-indigo-200 ring-1 ring-indigo-50' : 'hover:border-indigo-200'}`}>
                                             <button 
                                               onClick={() => toggleFolder(key)}
                                               className={`w-full flex items-center justify-between p-5 ${isFolderOpen ? 'bg-indigo-50/20' : 'bg-white'}`}
                                             >
                                                <div className="flex items-center gap-4">
                                                   <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isFolderOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                                      <Icon size={20} />
                                                   </div>
                                                   <span className={`font-black text-xs uppercase tracking-widest ${isFolderOpen ? 'text-indigo-900' : 'text-slate-600'}`}>{meta.title}</span>
                                                </div>
                                                <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isFolderOpen ? 'rotate-90 text-indigo-500' : ''}`} />
                                             </button>
                                             
                                             {isFolderOpen && (
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
                                     });
                                   })()}
                                </div>
                             )}
                             {activeTab === 'SEG' && (
                               <div className="grid gap-4">
                                  {filteredItems.map((seg: any, idx) => (
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
                             )}
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
