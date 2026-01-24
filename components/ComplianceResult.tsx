import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Plane, 
  Info, 
  ArrowRight, 
  PackageCheck, 
  ZapOff, 
  Copy, 
  Check, 
  Globe, 
  AlertCircle,
  ClipboardList,
  Shield, 
  X, 
  FileText, 
  Scale, 
  Languages, 
  Ban, 
  Tag, 
  Ruler, 
  HelpCircle, 
  Bot, 
  Package 
} from 'lucide-react';
import { CalculationResult, ComplianceStatus, BatterySpecs, Configuration, BatteryType } from '../types';
import { SPECIAL_PROVISIONS_DATA } from './SpecialProvisionsDictionary';

interface Props {
  result: CalculationResult;
  specs: BatterySpecs;
  onOpenDictionary?: (term?: string) => void;
}

const ComplianceResult: React.FC<Props> = ({ result, specs, onOpenDictionary }) => {
  const isForbidden = result.status === ComplianceStatus.FORBIDDEN_PAX || result.status === ComplianceStatus.FORBIDDEN_ALL;
  const isLatam = specs.airline === 'L7'; 
  const [copied, setCopied] = useState(false);
  
  const colors = {
    red: { 
      border: 'border-red-200', 
      bg: 'bg-red-600', 
      text: 'text-white', 
      accent: 'bg-white/20', 
      muted: 'text-red-100', 
      bodyBg: 'bg-red-50',
      reasoning: 'bg-red-50 border-red-100 text-red-900',
      reasoningIcon: 'bg-red-500'
    },
    yellow: { 
      border: 'border-amber-200', 
      bg: 'bg-amber-50', 
      text: 'text-amber-900', 
      accent: 'bg-amber-500', 
      muted: 'text-amber-700', 
      bodyBg: 'bg-amber-50/50',
      reasoning: 'bg-amber-50 border-amber-100 text-amber-900',
      reasoningIcon: 'bg-amber-500'
    },
    green: { 
      border: 'border-green-200', 
      bg: 'bg-green-50', 
      text: 'text-green-800', 
      accent: 'bg-green-600', 
      muted: 'text-green-600', 
      bodyBg: 'bg-green-50/50',
      reasoning: 'bg-green-50 border-green-100 text-green-900',
      reasoningIcon: 'bg-green-600'
    }
  };

  const theme = colors[result.alertColor] || colors.green;

  const handleCopy = () => {
    if (result.awbStatement) {
      navigator.clipboard.writeText(result.awbStatement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parseDocString = (docStr: string) => {
    if (!docStr) return { title: '', description: '' };
    const parts = docStr.split('|');
    return { title: parts[0].trim(), description: parts[1] ? parts[1].trim() : '' };
  };

  const specialProvisions = result.specialProvisions || [];
  const documents = result.documents || [];
  const rawLabels = result.labels || [];
  const packagingSpecs = result.packagingSpecs || [];

  const visibleLabels = rawLabels.filter(label => {
    const text = label.toLowerCase();
    if (text.includes('overpack') || text.includes('sobreembalagem')) {
      return specs.isConsolidated && specs.innerPackageHasLabel;
    }
    return true;
  });

  const isPaxForbidden = result.unNumber === 'UN 3480' || result.unNumber === 'UN 3090' || isForbidden;
  const socRequired = result.socRuleApply;

  const getSPDetails = (code: string) => {
    const cleanCode = code.split(' ')[0].replace(/[^A-Z0-9]/g, '');
    const entry = SPECIAL_PROVISIONS_DATA.find(sp => sp.code === cleanCode);
    return entry ? { desc: entry.desc, reference: entry.reference } : { 
      desc: 'Consulte o Manual IATA DGR (Seção 4.4) para detalhes completos sobre esta disposição.',
      reference: 'DGR 4.4' 
    };
  };

  const HeaderIcon = () => {
    if (result.status === ComplianceStatus.FORBIDDEN_ALL) {
       return (
         <div className="relative w-10 h-10 flex items-center justify-center">
            <Plane size={32} className="text-white opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
               <Ban size={40} className="text-white opacity-90" strokeWidth={1.5} />
            </div>
         </div>
       );
    }
    if (isPaxForbidden) {
       return (
         <div className="relative w-10 h-10 flex items-center justify-center">
            <Plane size={32} className="text-white" />
            <div className="absolute -bottom-1 -right-1 bg-white text-orange-500 rounded-full p-1 border-2 border-orange-500 shadow-md">
               <AlertTriangle size={14} strokeWidth={3} fill="currentColor" className="text-white" />
            </div>
         </div>
       );
    }
    return (
       <div className="relative w-10 h-10 flex items-center justify-center">
          <Plane size={32} className="text-white" />
          <div className="absolute -bottom-1 -right-1 bg-white text-green-600 rounded-full p-1 border-2 border-green-600 shadow-md">
             <Check size={14} strokeWidth={4} />
          </div>
       </div>
    );
  };

  const getLabelDetails = (labelRaw: string) => {
    const text = labelRaw.toLowerCase();

    if (text.includes('overpack') || text.includes('sobreembalagem')) {
      return {
        title: 'Marcação Overpack',
        desc: 'Obrigatório: Carga consolidada com etiquetas internas ocultas.',
        dims: 'Min. 12mm alt.',
        tooltip: 'MANDATÓRIO: Exigido quando volumes com etiquetas de perigo são consolidados e as etiquetas internas ficam ocultas.',
        style: 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold',
        icon: (
           <div className="h-12 w-16 bg-white border-2 border-indigo-900 flex items-center justify-center shrink-0 shadow-sm">
             <span className="font-black text-[9px] text-indigo-900 uppercase tracking-widest">OVERPACK</span>
           </div>
        )
      };
    }
    
    if (text.includes('cao') || text.includes('cargueiro')) {
      return {
        title: 'Cargo Aircraft Only (CAO)',
        desc: 'Obrigatório para itens proibidos em aeronaves de passageiros.',
        dims: '120 × 110 mm',
        tooltip: 'Cor: Laranja com símbolos pretos. Requisito IATA 7.2.4.2.',
        style: 'bg-orange-50 border-orange-200 text-orange-900',
        icon: (
          <div className="h-10 w-10 bg-orange-500 flex flex-col items-center justify-center border-2 border-orange-600 shadow-sm shrink-0">
             <span className="text-[6px] font-black text-white uppercase tracking-tighter mb-0.5">Cargo Only</span>
             <Plane className="text-white rotate-[-15deg]" size={20} fill="currentColor" />
          </div>
        )
      };
    }
    
    if (text.includes('9a') || text.includes('classe 9')) {
      return {
        title: 'Classe 9A (Risco)',
        desc: 'Risco específico para Baterias de Lítio (Seção I).',
        dims: 'Min. 100 × 100 mm',
        tooltip: '7 faixas verticais superiores. Símbolo de bateria inferior. IATA 7.2.2.3.1.',
        style: 'bg-slate-50 border-slate-300 text-slate-900',
        icon: (
           <div className="h-12 w-12 bg-white border-2 border-black flex items-center justify-center rotate-45 shadow-sm transform scale-90 relative overflow-hidden shrink-0">
             <div className="-rotate-45 flex flex-col items-center justify-center w-full h-full relative">
                <div className="absolute top-1 w-full h-1/2 flex justify-center gap-[2px]">
                   {[...Array(7)].map((_, i) => <div key={i} className="w-[1.5px] h-full bg-black"></div>)}
                </div>
                <span className="mt-4 font-black text-base leading-none">9</span>
             </div>
           </div>
        )
      };
    }

    if (text.includes('marca') || text.includes('mark')) {
      return {
        title: 'Marca de Lítio',
        desc: 'Obrigatório para Seção II e IB. UN correto exigido.',
        dims: 'Min. 100 × 100 mm',
        tooltip: 'Borda vermelha hachurada. Cor: Fundo branco, borda vermelha. IATA 7.1.5.5.',
        style: 'bg-white border-slate-300 text-slate-800',
        icon: (
           <div className="h-12 w-12 bg-white border-2 border-slate-800 flex flex-col items-center justify-center relative shadow-sm shrink-0">
             <div className="absolute inset-0 opacity-10" style={{background: 'repeating-linear-gradient(45deg, #000, #000 1px, #fff 1px, #fff 4px)'}}></div>
             <span className="font-black text-lg text-slate-900">UN</span>
           </div>
        )
      };
    }
    
    return {
      title: labelRaw,
      desc: 'Etiqueta regulatória obrigatória.',
      dims: 'Consultar DGR',
      tooltip: 'Consultar Seção 7 do IATA DGR.',
      style: 'bg-slate-50 border-slate-200 text-slate-700',
      icon: <Tag className="text-slate-400" size={24} />
    };
  };

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 ${theme.border} transition-all duration-500 animate-in fade-in slide-in-from-right-4 print:border-slate-800 print:shadow-none`}>
      
      <div className={`${theme.bg} px-6 py-5 md:px-8 md:py-6 border-b-2 ${theme.border} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${theme.accent} text-white shadow-md print:hidden`}>
            <HeaderIcon />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
               <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.muted}`}>{result.unNumber}</span>
               <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${theme.muted}`}>• {result.packingInstruction}</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-black ${theme.text} tracking-tight uppercase italic leading-none`}>{result.status}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-white/20 backdrop-blur-sm shadow-inner ${result.alertColor === 'red' ? 'bg-black/20 text-white' : 'bg-white/60 text-slate-800'}`}>
            <span>{isForbidden ? 'CAO ONLY' : 'PAX & CAO'}</span>
          </div>
        </div>
      </div>

      <div className={`p-6 md:p-8 lg:p-10 ${theme.bodyBg} print:bg-white`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] relative group/energy">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Energia Nominal</span>
                  <HelpCircle size={10} className="text-slate-300 cursor-help" />
                  
                  <div className="absolute bottom-full left-6 mb-3 w-64 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover/energy:opacity-100 transition-all pointer-events-none z-50 shadow-2xl leading-relaxed">
                    <span className="block font-black uppercase tracking-widest mb-1 text-coral-400 border-b border-white/10 pb-1">Metodologia de Cálculo</span>
                    {specs.type === BatteryType.LI_METAL 
                      ? "Baterias Metal Lítio: Capacidade (Ah) × 0.3 ≈ Teor de Lítio equivalente em gramas (g)."
                      : "Baterias Íon-Lítio / Ni-MH: Tensão (V) × Capacidade (Ah) = Energia em Watts-hora (Wh)."}
                    <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                   <div className="text-4xl font-black text-slate-800 tracking-tighter">
                    {result.energy.toFixed(2)}
                   </div>
                   <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-400 uppercase">{result.unit}</span>
                      {specs.type === BatteryType.LI_METAL && (
                        <span className="text-[10px] font-black text-coral-500 uppercase">
                          ({(result.energy / 1000).toFixed(2)} kg)
                        </span>
                      )}
                   </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-transform hover:scale-[1.01]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Limite IATA / Volume</span>
                <div className={`font-black text-slate-800 uppercase tracking-tight leading-tight pt-1 ${
                  (result.limitPerPackage?.length || 0) > 20 ? 'text-sm' : 'text-xl'
                }`}>
                  {result.limitPerPackage || 'Consultar DGR'}
                </div>
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 w-fit">
                   <PackageCheck size={12} className="text-slate-400" />
                   <span className="text-[9px] font-black text-slate-500 uppercase">{result.dgrSection || 'Regulado'}</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-[2rem] border-2 text-sm font-bold leading-relaxed shadow-sm ${theme.reasoning}`}>
              <div className="flex gap-4 items-start">
                <div className={`p-2 rounded-xl text-white mt-1 shadow-md print:hidden shrink-0 ${theme.reasoningIcon}`}>
                  <Bot size={16} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2">Parecer Técnico Regulatória</span>
                   <p className="text-base tracking-tight leading-relaxed">{result.reasoning}</p>
                </div>
              </div>
            </div>

            {isLatam && (
              <div className="bg-indigo-50/50 rounded-[2.5rem] p-6 md:p-8 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-100">
                   <Shield size={20} className="text-indigo-700" />
                   <h3 className="text-base font-black text-indigo-950 uppercase italic tracking-tight">Regras de Operador LATAM Cargo (L7)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                   <div className="p-4 rounded-2xl bg-white shadow-sm border border-indigo-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${isPaxForbidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {isPaxForbidden ? <X size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-900">L7-01: Proibição PAX</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {isPaxForbidden ? 'UN3480/3090 proibidas em PAX. Transporte exclusivo via Cargueiro (CAO).' : 'Permitido em aeronaves de passageiros conforme limites IATA.'}
                      </p>
                   </div>
                   <div className="p-4 rounded-2xl bg-white shadow-sm border border-indigo-50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 rounded bg-indigo-100 text-indigo-600">
                          <FileText size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-900">L7-04: Teste UN 38.3</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Mandatório apresentar o documento físico/digital no aceite. Declaração verbal não é aceita.</p>
                   </div>
                </div>
                {socRequired && (
                   <div className="mt-4 p-5 rounded-2xl bg-coral-50 border border-coral-200 shadow-sm flex items-start gap-4 relative z-10">
                      <ZapOff size={20} className="text-coral-600 mt-1 shrink-0" />
                      <div>
                         <span className="block text-[10px] font-black uppercase text-coral-700 mb-1">SoC ≤ 30% Mandatório</span>
                         <p className="text-[11px] text-slate-700 font-bold leading-relaxed">Obrigatório por segurança operacional. Deve constar declaração explícita no AWB.</p>
                      </div>
                   </div>
                )}
              </div>
            )}

            {specialProvisions.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-3">
                <div className="flex items-center gap-2 mb-6">
                  <Scale size={18} className="text-slate-500" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Disposições Especiais IATA</h3>
                </div>
                <div className="grid gap-4">
                  {specialProvisions.map((sp, idx) => {
                    const details = getSPDetails(sp);
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                         <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 font-black text-[10px] text-slate-700 uppercase shadow-sm h-fit">
                           {sp.split(' ')[0].replace(/[^A-Z0-9]/g, '')}
                         </div>
                         <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-1">
                             <span 
                               className="block text-sm font-black text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
                               onClick={() => onOpenDictionary && onOpenDictionary(sp.split(' ')[0])}
                               title="Clique para ver detalhes no dicionário"
                             >
                               {sp}
                             </span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">• Ref: {details.reference}</span>
                           </div>
                           <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{details.desc}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-8">Marcação e Rotulagem Exigida</h3>
               {visibleLabels.length > 0 ? (
                 <div className="space-y-4">
                    {visibleLabels.map((label, idx) => {
                      const details = getLabelDetails(label);
                      return (
                        <div key={idx} className={`p-5 rounded-3xl border-2 flex items-start gap-4 ${details.style} transition-all hover:scale-[1.01]`}>
                           <div className="shrink-0 mt-1">{details.icon}</div>
                           <div className="flex flex-col">
                              <span className="block text-base font-black uppercase tracking-tight leading-tight mb-2">
                                 {details.title}
                              </span>
                              <p className="text-[11px] font-bold opacity-90 leading-relaxed mb-3">
                                 {details.desc}
                              </p>
                              <div className="relative group/tooltip inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/60 border border-slate-100 cursor-help transition-colors hover:bg-white">
                                <Ruler size={12} className="text-slate-400" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{details.dims}</span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 shadow-2xl">
                                  {details.tooltip}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               ) : (
                 <div className="text-center py-8 px-4 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                    <CheckCircle size={32} className="text-green-500 mx-auto mb-3 opacity-50" />
                    <p className="text-xs font-bold text-slate-500">Nenhuma etiqueta de perigo visual ou marcação externa exigida para esta configuração.</p>
                 </div>
               )}
            </div>

            {packagingSpecs.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Package size={16} className="text-indigo-500" />
                  Requisitos de Embalagem
                </h3>
                <div className="space-y-3">
                  {packagingSpecs.map((spec, i) => (
                    <div key={i} className="flex gap-3 items-start">
                       <div className={`mt-1.5 min-w-[4px] h-[4px] rounded-full shrink-0 ${spec.includes('ISENÇÃO') ? 'bg-green-500' : 'bg-indigo-400'}`} />
                       <p className={`text-[11px] font-medium leading-relaxed ${spec.includes('ISENÇÃO') ? 'text-green-700 font-bold' : 'text-slate-600'}`}>{spec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-500" />
                Documentação do Embarque
              </h3>
              <div className="space-y-3">
                {documents.map((doc, i) => {
                  const { title, description } = parseDocString(doc);
                  const isDGD = title.includes('DGD') || title.includes('Declaração do Expedidor');
                  const isLoC = title.includes('Carta de Conformidade') || title.includes('LoC');
                  
                  return (
                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:border-indigo-100 group relative">
                      <span className="block text-[10px] font-black text-slate-900 uppercase mb-1 group-hover:text-indigo-700 transition-colors flex items-center justify-between">
                        {title}
                        {(isDGD || isLoC) && <Info size={12} className="text-indigo-400 opacity-50 group-hover:opacity-100" />}
                      </span>
                      <p className="text-[9px] font-medium text-slate-500 leading-tight">{description}</p>
                      
                      {isDGD && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl leading-relaxed">
                          <span className="block font-black text-coral-400 mb-1 uppercase tracking-wider">Requisito IATA 8.1</span>
                          Declaração primária de risco. Deve ser preenchida em triplicata (3 vias) com as margens laterais hachuradas em vermelho (padrão DGD).
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}

                      {isLoC && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl leading-relaxed">
                          <span className="block font-black text-coral-400 mb-1 uppercase tracking-wider">Recomendação Operacional</span>
                          Embora a Seção II dispense a DGD, companhias aéreas podem solicitar este documento para confirmar rapidamente que a carga respeita os limites.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {result.awbStatement && (
              <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AWB Nature & Quantity Statement</span>
                  <div className="relative group cursor-help">
                      <HelpCircle size={12} className="text-slate-300" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl leading-relaxed">
                          <span className="block font-black text-coral-400 mb-1 uppercase tracking-wider">Segurança Operacional</span>
                          Esta declaração alerta a tripulação sobre a presença de baterias e orienta os procedimentos de emergência.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl font-mono text-[10px] text-slate-600 border border-slate-100 select-all mb-4 leading-relaxed break-words">
                    {result.awbStatement}
                </div>
                <button 
                  onClick={handleCopy} 
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 shadow-sm'}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Texto Copiado!' : 'Copiar Texto para o AWB'}
                </button>
              </div>
            )}
            
            <div className="bg-indigo-900 rounded-[2rem] p-6 text-white text-[10px] font-black leading-relaxed shadow-lg print:hidden">
               <div className="flex items-center gap-2 mb-3">
                  <Globe size={16} className="text-coral-400" />
                  <span className="uppercase tracking-[0.2em] font-black">Observação Operacional (L7)</span>
               </div>
               <p className="opacity-80 italic leading-relaxed">Embalagem deve suportar queda de 1.2m (exceto Sec IA/IB: UN Spec). Marcas devem ser legíveis em PT/EN/ES. Apresentação física do UN38.3 é obrigatória no aceite.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-12 print:hidden"></div>
    </div>
  );
};

export default ComplianceResult;