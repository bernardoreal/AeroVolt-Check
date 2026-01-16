
import React, { useState, useEffect } from 'react';
import { Battery, Zap, Settings, Plane, LayoutGrid, LayoutList, Smartphone, Laptop, Disc, AlertCircle, Info } from 'lucide-react';
import { BatteryType, Configuration, BatterySpecs, CalculationResult } from './types';
import { calculateCompliance } from './utils/iataCalculator';
import ComplianceResult from './components/ComplianceResult';
import RegulatoryAdvisor from './components/RegulatoryAdvisor';

function App() {
  const [batteryType, setBatteryType] = useState<BatteryType>(BatteryType.LI_ION);
  const [config, setConfig] = useState<Configuration>(Configuration.PACKED_WITH);
  const [structure, setStructure] = useState<'cell' | 'battery'>('battery');
  const [voltage, setVoltage] = useState<string>('3.7');
  const [capacity, setCapacity] = useState<string>('2000');
  const [capacityUnit, setCapacityUnit] = useState<'mAh' | 'Ah'>('mAh');
  const [packageQuantity, setPackageQuantity] = useState<string>('1');
  const [isSingleColumn, setIsSingleColumn] = useState<boolean>(false);
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [voltageError, setVoltageError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [pkgQtyError, setPkgQtyError] = useState<string | null>(null);

  const getSpecs = (): BatterySpecs => {
    const v = parseFloat(voltage);
    const cap = parseFloat(capacity);
    const qty = Math.max(1, parseInt(packageQuantity, 10) || 1);
    const capacityAh = capacityUnit === 'mAh' ? cap / 1000 : cap;
    
    return {
      airline: 'L7',
      type: batteryType,
      config,
      structure,
      voltage: v,
      capacityAh,
      packageQuantity: qty
    };
  };

  const applyPreset = (name: string) => {
    switch (name) {
      case 'smartphone':
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('3.8');
        setCapacity('4000');
        setCapacityUnit('mAh');
        setPackageQuantity('1');
        break;
      case 'laptop':
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('11.4');
        setCapacity('8000');
        setCapacityUnit('mAh');
        setPackageQuantity('1');
        break;
      case 'powerbank':
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.STANDALONE);
        setStructure('battery');
        setVoltage('3.7');
        setCapacity('20000');
        setCapacityUnit('mAh');
        setPackageQuantity('1');
        break;
      case 'drone':
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.PACKED_WITH);
        setStructure('battery');
        setVoltage('15.2');
        setCapacity('5000');
        setCapacityUnit('mAh');
        setPackageQuantity('1');
        break;
    }
  };

  useEffect(() => {
    setResult(null);
    setVoltageError(null);
    setCapacityError(null);
    setPkgQtyError(null);

    const vStr = voltage.trim();
    const cStr = capacity.trim();
    const qStr = packageQuantity.trim();

    if (vStr === '' || cStr === '' || qStr === '') return;

    const v = parseFloat(vStr);
    const c = parseFloat(cStr);
    const q = parseFloat(qStr);

    let hasError = false;

    if (isNaN(v)) {
      setVoltageError("Inválido");
      hasError = true;
    } else if (v <= 0) {
      setVoltageError("> 0");
      hasError = true;
    }

    if (isNaN(c)) {
      setCapacityError("Inválido");
      hasError = true;
    } else if (c <= 0) {
      setCapacityError("> 0");
      hasError = true;
    }

    if (isNaN(q) || !Number.isInteger(q)) {
      setPkgQtyError("Inteiro");
      hasError = true;
    } else if (q < 1) {
      setPkgQtyError("Mínimo 1");
      hasError = true;
    }

    if (!hasError) {
      setResult(calculateCompliance(getSpecs()));
    }
    
  }, [batteryType, config, structure, voltage, capacity, capacityUnit, packageQuantity]);

  const getInputClass = (isError: boolean) => {
    if (isError) return 'bg-red-50 border-red-400 text-red-900 focus:ring-red-200 focus:border-red-500 shadow-sm';
    if (!result) return 'bg-white border-slate-200 focus:ring-coral-500 hover:border-coral-300 focus:border-coral-500';
    
    switch (result.alertColor) {
      case 'green': return 'bg-green-50/30 border-green-200 focus:ring-green-500 text-green-700 hover:border-green-300';
      case 'yellow': return 'bg-amber-50/30 border-amber-200 focus:ring-amber-500 text-amber-700 hover:border-amber-300';
      case 'red': return 'bg-red-50/30 border-red-200 focus:ring-red-500 text-red-700 hover:border-red-300';
      default: return 'bg-white border-slate-200 focus:ring-coral-500';
    }
  };

  const configDetails = (cfg: Configuration) => {
    switch (cfg) {
      case Configuration.STANDALONE: 
        return { text: "Soltas", desc: "Baterias isoladas. UN3480/3090. L7-01: Proibido PAX." };
      case Configuration.PACKED_WITH: 
        return { text: "Com Eqpto", desc: "Baterias na mesma caixa que o equipamento. UN3481/3091." };
      case Configuration.CONTAINED_IN: 
        return { text: "No Eqpto", desc: "Instaladas no dispositivo. Isenção de marca se ≤ 2 volumes." };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden print:bg-white print:p-0">
      
      {/* Decorative Brand Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <header className="relative bg-indigo-900 text-white pt-6 pb-20 px-4 md:px-8 border-b-4 border-coral-500 z-30 print:hidden shrink-0">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <Plane size={24} className="text-coral-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">AeroVolt Check</h1>
              <p className="text-indigo-200 text-[9px] font-black tracking-[0.2em] uppercase opacity-60">IATA 2026 / LATAM VAR</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-sm">
                <button 
                  onClick={() => setIsSingleColumn(false)}
                  className={`p-1.5 rounded-lg transition-all ${!isSingleColumn ? 'bg-coral-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
                  title="Modo Grade"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setIsSingleColumn(true)}
                  className={`p-1.5 rounded-lg transition-all ${isSingleColumn ? 'bg-coral-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}
                  title="Modo Foco"
                >
                  <LayoutList size={16} />
                </button>
             </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 relative transition-all duration-500 mx-auto w-full px-4 -mt-10 z-40 pb-32 print:m-0 print:p-0 ${isSingleColumn ? 'max-w-4xl' : 'max-w-[1440px]'}`}>
        
        <div className={`grid gap-8 transition-all duration-500 items-start ${isSingleColumn ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[minmax(350px,380px)_1fr]'}`}>
          
          {/* INPUT SECTION - Coluna da esquerda, flui com a página */}
          <div className="print:hidden h-fit">
            <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-slate-100 flex flex-col gap-8 transition-all hover:shadow-indigo-500/10">
              
              {/* Presets */}
              <div className="shrink-0">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acesso Rápido</p>
                 <div className="flex gap-2 flex-wrap">
                    {['smartphone', 'laptop', 'powerbank', 'drone'].map(preset => (
                       <button key={preset} onClick={() => applyPreset(preset)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 hover:border-coral-400 hover:bg-coral-50 transition-all uppercase active:scale-95 group">
                         <span className="group-hover:text-coral-500 transition-colors">
                          {preset === 'smartphone' ? <Smartphone size={12}/> : preset === 'laptop' ? <Laptop size={12}/> : preset === 'powerbank' ? <Zap size={12}/> : <Disc size={12}/>}
                         </span>
                         {preset}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6">
                {/* Chemistry */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Tipo de Bateria</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[BatteryType.LI_ION, BatteryType.LI_METAL].map(type => (
                      <button
                        key={type}
                        onClick={() => setBatteryType(type)}
                        className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                          batteryType === type ? 'border-coral-500 bg-coral-50/40 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {type === BatteryType.LI_ION ? <Battery size={18} className={batteryType === type ? 'text-coral-500' : ''}/> : <Zap size={18} className={batteryType === type ? 'text-coral-500' : ''}/>}
                        <span className={`font-black text-[9px] uppercase tracking-tight leading-none ${batteryType === type ? 'text-indigo-900' : ''}`}>{type.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Config */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Configuração</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.values(Configuration).map((cfg) => (
                      <button
                        key={cfg}
                        onClick={() => setConfig(cfg)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col group ${
                          config === cfg ? 'border-coral-500 bg-coral-50/20 shadow-sm' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-black text-[10px] uppercase ${config === cfg ? 'text-indigo-900' : 'group-hover:text-slate-600'}`}>{cfg}</span>
                          {config === cfg && <span className="text-[8px] font-bold text-coral-600 uppercase">{configDetails(cfg).text}</span>}
                        </div>
                        {config === cfg && (
                          <p className="text-[10px] font-medium text-slate-500 mt-2 text-left leading-relaxed animate-in fade-in slide-in-from-top-1">
                            {configDetails(cfg).desc}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-100 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Tensão (V)</label>
                        <input
                          type="number"
                          value={voltage}
                          onChange={(e) => setVoltage(e.target.value)}
                          className={`w-full border-2 rounded-xl px-3 py-2.5 font-black text-base outline-none transition-all ${getInputClass(!!voltageError)}`}
                        />
                        {voltageError && <span className="text-[9px] font-bold text-red-600 px-1">{voltageError}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Volumes</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={packageQuantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseInt(val);
                            // Se estiver vazio, NaN ou menor que 1, força para '1' (NÃO PERMITE VAZIO)
                            if (val === '' || isNaN(num) || num < 1) {
                              setPackageQuantity('1');
                            } else {
                              setPackageQuantity(num.toString());
                            }
                          }}
                          className={`w-full border-2 rounded-xl px-3 py-2.5 font-black text-base outline-none transition-all ${getInputClass(!!pkgQtyError)}`}
                        />
                        {pkgQtyError && <span className="text-[9px] font-bold text-red-600 px-1">{pkgQtyError}</span>}
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Capacidade</label>
                      <div className={`flex rounded-xl border-2 overflow-hidden bg-white shadow-sm ${capacityError ? 'border-red-400' : 'border-slate-100 focus-within:border-coral-500'}`}>
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          className={`flex-1 border-none px-4 py-2.5 font-black text-xl focus:ring-0 ${getInputClass(!!capacityError).replace('border-2', 'border-0')}`}
                        />
                        <select
                          value={capacityUnit}
                          onChange={(e) => setCapacityUnit(e.target.value as 'mAh' | 'Ah')}
                          className="bg-slate-50 border-l px-3 font-black text-[10px] uppercase outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <option value="mAh">mAh</option>
                          <option value="Ah">Ah</option>
                        </select>
                      </div>
                      {capacityError && <span className="text-[9px] font-bold text-red-600 px-1">{capacityError}</span>}
                   </div>
                </div>

                {/* Energy Indicator */}
                <div className="bg-indigo-900 rounded-[2rem] p-6 border-2 border-coral-500 shadow-xl relative overflow-hidden group shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-coral-500 opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className="text-[9px] font-black text-coral-300 uppercase tracking-widest">Energia Auditada</span>
                      <Zap size={16} className="text-coral-500 animate-pulse" />
                    </div>
                    
                    {result ? (
                      <div className="relative z-10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black tracking-tighter text-white">
                            {result.energy.toFixed(1)}
                          </span>
                          <span className="text-xs font-black text-indigo-300 uppercase">{result.unit}</span>
                        </div>
                        <div className={`mt-3 inline-block px-3 py-1 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg ${
                          result.alertColor === 'red' ? 'bg-red-600 text-white' : 'bg-coral-500 text-white'
                        }`}>
                          {result.status}
                        </div>
                      </div>
                    ) : (
                      <p className="text-indigo-300 font-black italic text-[10px] uppercase opacity-40">Insira os dados técnicos</p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS SECTION - Coluna da direita, configurada como STICKY para estar sempre visível */}
          <div className={`transition-all duration-500 w-full h-fit ${!isSingleColumn ? 'lg:sticky lg:top-4' : ''}`}>
            {result ? (
               <ComplianceResult result={result} specs={getSpecs()} />
            ) : (
              <div className="bg-white/40 border-4 border-dashed border-slate-200 rounded-[3rem] w-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 gap-6 transition-all hover:bg-white/60 print:hidden">
                 <div className="p-8 bg-slate-100 rounded-[2.5rem] animate-pulse">
                    <Settings size={64} className="text-slate-200" />
                 </div>
                 <div className="text-center px-6">
                    <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-400 mb-2">Dossiê de Conformidade</p>
                    <p className="text-[11px] font-bold text-slate-400/80 leading-relaxed max-w-xs mx-auto">Os resultados da auditoria aparecerão aqui em tempo real.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Regulatory Advisor */}
      {result && <RegulatoryAdvisor specs={getSpecs()} result={result} />}
      
      <style>{`
        /* Garantir que não haja barras de rolagem internas em nenhuma parte do layout */
        html, body {
          height: auto;
          overflow-y: auto;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  );
}

export default App;
