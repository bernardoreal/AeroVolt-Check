
import React, { useState, useEffect } from 'react';
import { Battery, Zap, Settings, Plane, LayoutGrid, LayoutList, Smartphone, Laptop, Disc, AlertCircle, Info, Layers, Package, Grid3X3, Box, Check, X, Watch, Key, HeartPulse, CreditCard, BatteryMedium, Plug, Radio, Search, Sparkles, Loader2, ShieldOff } from 'lucide-react';
import { BatteryType, Configuration, BatterySpecs, CalculationResult } from './types';
import { calculateCompliance } from './utils/iataCalculator';
import ComplianceResult from './components/ComplianceResult';
import RegulatoryAdvisor from './components/RegulatoryAdvisor';
import { SpecialProvisionsDictionary } from './components/SpecialProvisionsDictionary';
import { resolveDevicePreset } from './services/geminiService';

export function App() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Busca desabilitada temporariamente
  const isDeployActive = false;

  const [batteryType, setBatteryType] = useState<BatteryType>(BatteryType.LI_ION);
  const [config, setConfig] = useState<Configuration>(Configuration.PACKED_WITH);
  const [structure, setStructure] = useState<'cell' | 'battery'>('battery');
  const [voltage, setVoltage] = useState<string>('3.7');
  const [capacity, setCapacity] = useState<string>('2000');
  const [capacityUnit, setCapacityUnit] = useState<'mAh' | 'Ah'>('mAh');
  
  const [packageCount, setPackageCount] = useState<string>('1'); 
  const [unitsPerPackage, setUnitsPerPackage] = useState<string>('1'); 
  const [isConsolidated, setIsConsolidated] = useState<boolean>(false); 
  const [innerPackageHasLabel, setInnerPackageHasLabel] = useState<boolean>(true); 
  const [isDefective, setIsDefective] = useState<boolean>(false);

  const [isSingleColumn, setIsSingleColumn] = useState<boolean>(false);
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [voltageError, setVoltageError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [pkgCountError, setPkgCountError] = useState<string | null>(null);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  const getSpecs = (): BatterySpecs => {
    const v = parseFloat(voltage);
    const cap = parseFloat(capacity);
    const pCount = Math.max(1, parseInt(packageCount, 10) || 1);
    const uCount = Math.max(1, parseInt(unitsPerPackage, 10) || 1);
    const capacityAh = capacityUnit === 'mAh' ? cap / 1000 : cap;
    
    return {
      airline: 'L7',
      type: batteryType,
      config,
      structure,
      voltage: v,
      capacityAh,
      packageCount: pCount,
      unitsPerPackage: uCount,
      isConsolidated,
      innerPackageHasLabel,
      isDefective
    };
  };

  const handleAISearch = async () => {
    // Bloqueia execução se não houver deploy ou busca em andamento
    if (!isDeployActive || !searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    const resolved = await resolveDevicePreset(searchQuery);
    
    if (resolved) {
      setBatteryType(resolved.batteryType);
      setConfig(resolved.config);
      setStructure(resolved.structure);
      setVoltage(resolved.voltage.toString());
      setCapacity(resolved.capacitymAh.toString());
      setCapacityUnit('mAh');
      setIsDefective(false);
      setActivePreset(`ai-${searchQuery}`);
      setSearchQuery(''); 
    }
    setIsSearching(false);
  };

  const applyPreset = (name: string) => {
    setActivePreset(name);
    setIsDefective(false);
    
    if (name === 'smartphone') {
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('3.8');
        setCapacity('4000');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    } else if (name === 'laptop') {
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('11.4');
        setCapacity('8000');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    } else if (name === 'pos') {
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('7.4');
        setCapacity('2600');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    } else if (name === 'drone') {
        setBatteryType(BatteryType.LI_ION);
        setConfig(Configuration.PACKED_WITH);
        setStructure('battery');
        setVoltage('15.2');
        setCapacity('5000');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('2'); 
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    } 
    else if (name === 'watch') {
        setBatteryType(BatteryType.LI_METAL);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('cell');
        setVoltage('3.0');
        setCapacity('220');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    } else if (name === 'keyfob') {
        setBatteryType(BatteryType.LI_METAL);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('cell');
        setVoltage('3.0');
        setCapacity('200');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    } else if (name === 'aed') {
        setBatteryType(BatteryType.LI_METAL);
        setConfig(Configuration.PACKED_WITH);
        setStructure('battery');
        setVoltage('12.0');
        setCapacity('4200');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    } else if (name === 'cr123') {
        setBatteryType(BatteryType.LI_METAL);
        setConfig(Configuration.STANDALONE);
        setStructure('cell');
        setVoltage('3.0');
        setCapacity('1500');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('4');
        setIsConsolidated(false);
        setInnerPackageHasLabel(true);
    }
    else if (name === 'aa_nimh') {
        setBatteryType(BatteryType.NI_MH);
        setConfig(Configuration.STANDALONE);
        setStructure('cell');
        setVoltage('1.2');
        setCapacity('2500');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('10');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    } else if (name === 'drill_nimh') {
        setBatteryType(BatteryType.NI_MH);
        setConfig(Configuration.PACKED_WITH);
        setStructure('battery');
        setVoltage('18');
        setCapacity('3000');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    } else if (name === 'rc_nimh') {
        setBatteryType(BatteryType.NI_MH);
        setConfig(Configuration.STANDALONE);
        setStructure('battery');
        setVoltage('7.2');
        setCapacity('3000');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('2');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    } else if (name === 'radio_nimh') {
        setBatteryType(BatteryType.NI_MH);
        setConfig(Configuration.CONTAINED_IN);
        setStructure('battery');
        setVoltage('7.5');
        setCapacity('1800');
        setCapacityUnit('mAh');
        setPackageCount('1');
        setUnitsPerPackage('1');
        setIsConsolidated(false);
        setInnerPackageHasLabel(false);
    }
  };

  const handleManualChange = (setter: (val: any) => void, value: any) => {
    setter(value);
    setActivePreset(null);
  };

  useEffect(() => {
    setResult(null);
    setVoltageError(null);
    setCapacityError(null);
    setPkgCountError(null);
    setUnitsError(null);

    const vStr = voltage.trim();
    const cStr = capacity.trim();
    const pcStr = packageCount.trim();
    const upStr = unitsPerPackage.trim();

    if (vStr === '' || cStr === '' || pcStr === '' || upStr === '') return;

    const v = parseFloat(vStr);
    const c = parseFloat(cStr);
    const pc = parseFloat(pcStr);
    const up = parseFloat(upStr);

    let hasError = false;

    if (isNaN(v) || v <= 0) {
      setVoltageError("Voltage must be a positive number");
      hasError = true;
    }

    if (isNaN(c) || c <= 0) {
      setCapacityError("Capacity must be a positive number");
      hasError = true;
    }

    if (isNaN(pc) || !Number.isInteger(pc) || pc < 1) {
      setPkgCountError("Package quantity must be an integer greater than or equal to 1");
      hasError = true;
    }

    if (isNaN(up) || !Number.isInteger(up) || up < 1) {
      setUnitsError("Units per package must be an integer greater than or equal to 1");
      hasError = true;
    }

    if (!hasError) {
      setResult(calculateCompliance(getSpecs()));
    }
    
  }, [batteryType, config, structure, voltage, capacity, capacityUnit, packageCount, unitsPerPackage, isConsolidated, innerPackageHasLabel, isDefective]);

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
        return { text: "Soltas", desc: "Baterias isoladas. UN3480/3090/3496. L7-01: Proibido PAX (Lítio)." };
      case Configuration.PACKED_WITH: 
        return { text: "Com Eqpto", desc: "Baterias na mesma caixa que o equipamento. UN3481/3091." };
      case Configuration.CONTAINED_IN: 
        return { text: "No Eqpto", desc: "Instaladas no dispositivo. Isenção de marca se ≤ 2 volumes (Lítio)." };
    }
  };

  const getPresets = () => {
      switch(batteryType) {
          case BatteryType.LI_ION:
              return [
                { id: 'smartphone', icon: Smartphone, label: 'Smartphone' },
                { id: 'laptop', icon: Laptop, label: 'Laptop' },
                { id: 'pos', icon: CreditCard, label: 'Maquineta' },
                { id: 'drone', icon: Disc, label: 'Drone' }
              ];
          case BatteryType.LI_METAL:
              return [
                { id: 'watch', icon: Watch, label: 'Relógio' },
                { id: 'keyfob', icon: Key, label: 'Chave Carro' },
                { id: 'aed', icon: HeartPulse, label: 'DEA (Médico)' },
                { id: 'cr123', icon: Battery, label: 'Pilha CR123' }
              ];
          case BatteryType.NI_MH:
              return [
                  { id: 'aa_nimh', icon: BatteryMedium, label: 'Pilha AA/AAA' },
                  { id: 'drill_nimh', icon: Plug, label: 'Parafusadeira' },
                  { id: 'rc_nimh', icon: Zap, label: 'Pack RC Car' },
                  { id: 'radio_nimh', icon: Radio, label: 'Rádio Portátil' }
              ];
          default: 
              return [];
      }
  };

  const currentPresets = getPresets();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden print:bg-white print:p-0">
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-coral-400/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Header Updated with "Linda Gradient" between Indigo and Coral tones */}
      <header className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-coral-900 text-white pt-6 pb-20 px-4 md:px-8 border-b-4 border-coral-500 z-30 print:hidden shrink-0 overflow-hidden shadow-xl">
        
        {/* Decorative ambient glow inside header for the gradient effect */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none mix-blend-screen"></div>

        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
               <Plane size={24} className="text-coral-500" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none drop-shadow-sm">AeroVolt Check</h1>
              <p className="text-indigo-100 text-[9px] font-black tracking-[0.2em] uppercase opacity-80">IATA 2026 / LATAM VAR</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10 backdrop-blur-sm">
                <button 
                  onClick={() => setIsSingleColumn(false)}
                  className={`p-1.5 rounded-lg transition-all ${!isSingleColumn ? 'bg-coral-500 text-white shadow-lg' : 'text-indigo-100 hover:bg-white/10'}`}
                  title="Modo Grade"
                >
                  <LayoutGrid size={16} />
                </button>
                <button 
                  onClick={() => setIsSingleColumn(true)}
                  className={`p-1.5 rounded-lg transition-all ${isSingleColumn ? 'bg-coral-500 text-white shadow-lg' : 'text-indigo-100 hover:bg-white/10'}`}
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
          
          <div className="print:hidden h-fit">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-8 border-2 border-slate-100 flex flex-col gap-8 transition-all hover:shadow-indigo-500/10">
              
              <div className="shrink-0">
                 <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-coral-500 rounded-full"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acesso Rápido</p>
                    </div>
                 </div>

                 {/* Campo de Busca Inteligente com IA - REFORÇO NO BLOQUEIO */}
                 <div className="mb-6 relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${!isDeployActive ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-coral-500'}`}>
                      {isSearching ? <Loader2 size={18} className="animate-spin" /> : (!isDeployActive ? <ShieldOff size={18} /> : <Search size={18} />)}
                    </div>
                    <input 
                      type="text" 
                      placeholder={isDeployActive ? "Buscar dispositivo (ex: Ventilador Médico)..." : "Busca IA Desabilitada (Aguardando Deploy)"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isDeployActive) {
                          handleAISearch();
                        }
                      }}
                      disabled={!isDeployActive || isSearching}
                      className={`w-full border-2 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-bold focus:outline-none transition-all shadow-inner ${
                        isDeployActive 
                        ? 'bg-slate-50 border-slate-100 focus:bg-white focus:border-coral-500 placeholder:text-slate-400 cursor-text' 
                        : 'bg-slate-100 border-slate-200 text-slate-300 placeholder:text-slate-300 cursor-not-allowed select-none opacity-60'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <div className={`p-1.5 rounded-xl shadow-lg transition-colors ${isDeployActive ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-300 text-slate-400 shadow-none'}`}>
                          <Sparkles size={14} className={isSearching && isDeployActive ? 'animate-pulse' : ''} />
                       </div>
                    </div>
                 </div>

                 <div className={`grid gap-3 md:gap-4 ${isSingleColumn ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                    {currentPresets.map((preset) => {
                       const isActive = activePreset === preset.id;
                       const Icon = preset.icon;
                       return (
                         <button 
                           key={preset.id} 
                           onClick={() => applyPreset(preset.id)} 
                           className={`
                             relative group flex flex-col items-center justify-center gap-3 py-4 px-2 rounded-[1.75rem] border-2 transition-all duration-300 outline-none active:scale-95 min-h-[120px] w-full
                             ${isActive 
                               ? 'bg-indigo-600 border-indigo-600 shadow-[0_8px_25px_-6px_rgba(44,4,140,0.4)] z-10' 
                               : 'bg-white border-slate-100 hover:border-coral-400 hover:shadow-lg hover:shadow-coral-500/10'
                             }
                           `}
                         >
                           <div className={`
                             w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center
                             ${isActive 
                               ? 'bg-white text-indigo-700 shadow-inner' 
                               : 'bg-indigo-50 text-indigo-400 group-hover:bg-coral-50 group-hover:text-coral-600'
                             }
                           `}>
                              <Icon 
                                size={24} 
                                strokeWidth={2}
                                className="transition-transform duration-300 group-hover:scale-110" 
                              />
                           </div>
                           
                           <span className={`text-[10px] font-black uppercase tracking-widest leading-tight text-center block w-full px-1 truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-900'}`}>
                              {preset.label}
                           </span>

                           {isActive && (
                             <div className="absolute top-2 right-2 bg-coral-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-[2.5px] border-indigo-600 shadow-md animate-in zoom-in">
                                <Check size={10} strokeWidth={4} />
                             </div>
                           )}
                         </button>
                       )
                    })}
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Tipo de Bateria</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[BatteryType.LI_ION, BatteryType.LI_METAL, BatteryType.NI_MH].map(type => (
                      <button
                        key={type}
                        onClick={() => handleManualChange(setBatteryType, type)}
                        className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                          batteryType === type ? 'border-indigo-500 bg-indigo-50/40 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {type === BatteryType.LI_ION && <Battery size={18} className={batteryType === type ? 'text-indigo-500' : ''}/>}
                        {type === BatteryType.LI_METAL && <Zap size={18} className={batteryType === type ? 'text-indigo-500' : ''}/>}
                        {type === BatteryType.NI_MH && <BatteryMedium size={18} className={batteryType === type ? 'text-indigo-500' : ''}/>}
                        
                        <span className={`font-black text-[9px] uppercase tracking-tight leading-none text-center ${batteryType === type ? 'text-indigo-900' : ''}`}>
                            {type === BatteryType.NI_MH ? 'Ni-MH' : type.split(' (')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Configuração</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.values(Configuration).map((cfg) => (
                      <button
                        key={cfg}
                        onClick={() => handleManualChange(setConfig, cfg)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col group ${
                          config === cfg 
                            ? (cfg === Configuration.STANDALONE ? 'border-coral-500 bg-coral-50/20 shadow-sm' : 'border-indigo-500 bg-indigo-50/20 shadow-sm')
                            : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`font-black text-[10px] uppercase ${config === cfg ? 'text-indigo-900' : 'group-hover:text-slate-600'}`}>{cfg}</span>
                          {config === cfg && <span className={`text-[8px] font-bold uppercase ${cfg === Configuration.STANDALONE ? 'text-coral-600' : 'text-indigo-600'}`}>{configDetails(cfg).text}</span>}
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

                <div className="bg-slate-50/80 rounded-[2rem] p-6 border border-slate-100 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Tensão (V)</label>
                        <input
                          type="number"
                          value={voltage}
                          onChange={(e) => handleManualChange(setVoltage, e.target.value)}
                          className={`w-full border-2 rounded-xl px-3 py-2.5 font-black text-base outline-none transition-all ${getInputClass(!!voltageError)}`}
                        />
                        {voltageError && <span className="text-[9px] font-bold text-red-600 px-1">{voltageError}</span>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Capacidade</label>
                        <div className={`flex rounded-xl border-2 overflow-hidden bg-white shadow-sm ${capacityError ? 'border-red-400' : 'border-slate-100 focus-within:border-coral-500'}`}>
                          <input
                            type="number"
                            value={capacity}
                            onChange={(e) => handleManualChange(setCapacity, e.target.value)}
                            className={`flex-1 border-none px-3 py-2.5 font-black text-lg focus:ring-0 w-full ${getInputClass(!!capacityError).replace('border-2', 'border-0')}`}
                          />
                          <select
                            value={capacityUnit}
                            onChange={(e) => handleManualChange(setCapacityUnit, e.target.value as 'mAh' | 'Ah')}
                            className="bg-slate-50 border-l px-2 font-black text-[10px] uppercase outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <option value="mAh">mAh</option>
                            <option value="Ah">Ah</option>
                          </select>
                        </div>
                        {capacityError && <span className="text-[9px] font-bold text-red-600 px-1">{capacityError}</span>}
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Package size={12} className="text-slate-400"/>
                          <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Volumes</label>
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={packageCount}
                          onChange={(e) => handleManualChange(setPackageCount, e.target.value)}
                          className={`w-full border-2 rounded-xl px-3 py-2.5 font-black text-base outline-none transition-all ${getInputClass(!!pkgCountError)}`}
                        />
                        {pkgCountError && <span className="text-[9px] font-bold text-red-600 px-1">{pkgCountError}</span>}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Grid3X3 size={12} className="text-slate-400"/>
                          <label className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Und/Vol</label>
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={unitsPerPackage}
                          onChange={(e) => handleManualChange(setUnitsPerPackage, e.target.value)}
                          className={`w-full border-2 rounded-xl px-3 py-2.5 font-black text-base outline-none transition-all ${getInputClass(!!unitsError)}`}
                        />
                        {unitsError && <span className="text-[9px] font-bold text-red-600 px-1">{unitsError}</span>}
                      </div>
                   </div>

                   <div className="pt-2">
                      {/* SOBREEMBALAGEM CARD */}
                      <div className={`w-full rounded-2xl border-2 transition-all duration-300 flex flex-col group text-left relative overflow-hidden ${
                           isConsolidated 
                           ? 'border-indigo-600 bg-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50' 
                           : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:shadow-md'
                        }`}>
                        
                        {/* Decorative background for active state */}
                        {isConsolidated && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}

                        <button
                          onClick={() => handleManualChange(setIsConsolidated, !isConsolidated)}
                          className="w-full p-5 flex flex-col text-left focus:outline-none relative z-10"
                        >
                           <div className="flex items-center justify-between w-full">
                             <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                                   isConsolidated 
                                   ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                                   : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                }`}>
                                   <Layers size={20} />
                                </div>
                                <div>
                                    <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isConsolidated ? 'text-indigo-900' : 'text-slate-600'}`}>
                                      Sobreembalagem
                                    </span>
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Overpack</span>
                                </div>
                             </div>
                             
                             {/* Toggle Switch Visual */}
                             <div className={`w-11 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${isConsolidated ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isConsolidated ? 'translate-x-5' : 'translate-x-0'}`}></div>
                             </div>
                           </div>

                           {isConsolidated ? (
                             <div className="mt-4 pl-[52px] animate-in fade-in slide-in-from-top-1">
                                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                                     Utilizado para agrupar volumes. <span className="text-indigo-600 font-bold">Ex: Pallet, Caixa Master.</span>
                                  </p>
                             </div>
                           ) : (
                              <div className="mt-2 pl-[52px]">
                                  <p className="text-[10px] font-medium text-slate-400 leading-tight group-hover:text-slate-500 transition-colors">
                                    Marque se estiver consolidando volumes.
                                  </p>
                              </div>
                           )}
                        </button>

                        {/* Expanded Inner Checkbox */}
                        {isConsolidated && (
                           <div className="px-5 pb-5 pl-[72px] animate-in fade-in slide-in-from-top-2 relative z-10">
                                <div className="h-px w-full bg-slate-100 mb-4"></div>
                                <label className="flex items-start gap-3 cursor-pointer group/inner select-none">
                                    <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                                        innerPackageHasLabel 
                                        ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' 
                                        : 'bg-white border-slate-300 group-hover/inner:border-indigo-400'
                                    }`}>
                                        {innerPackageHasLabel && <Check size={12} className="text-white" strokeWidth={4} />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={innerPackageHasLabel} 
                                        onChange={() => handleManualChange(setInnerPackageHasLabel, !innerPackageHasLabel)} 
                                    />
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-bold uppercase transition-colors ${innerPackageHasLabel ? 'text-indigo-900' : 'text-slate-500'}`}>
                                          Etiquetas Visíveis?
                                        </span>
                                        <p className="text-[10px] text-slate-500 leading-snug mt-1">
                                          Volumes internos já possuem etiquetas de perigo coladas individualmente.
                                        </p>
                                    </div>
                                </label>
                           </div>
                        )}
                      </div>

                      {/* DANIFICADA CARD */}
                      <button
                        onClick={() => handleManualChange(setIsDefective, !isDefective)}
                        className={`w-full mt-4 p-5 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                          isDefective 
                          ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100 ring-4 ring-red-50' 
                          : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:shadow-md hover:bg-red-50/10'
                        }`}
                      >
                         {/* Decorative bg for defective */}
                         {isDefective && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>}

                        <div className="flex items-center gap-4 relative z-10">
                           <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                               isDefective 
                               ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110 animate-pulse' 
                               : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500'
                           }`}>
                              <AlertCircle size={20} />
                           </div>
                           <div className="flex flex-col text-left">
                              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDefective ? 'text-red-900' : 'text-slate-600'}`}>
                                Bateria Danificada
                              </span>
                              {isDefective ? (
                                  <span className="text-[9px] font-bold text-red-600 mt-0.5 animate-pulse bg-red-100 px-2 py-0.5 rounded-full w-fit">
                                    PROIBIDO EMBARQUE (SP A154)
                                  </span>
                              ) : (
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 group-hover:text-red-400 transition-colors">
                                    Damaged / Defective
                                  </span>
                              )}
                           </div>
                        </div>
                        
                        {/* Toggle */}
                        <div className={`w-11 h-6 rounded-full p-1 transition-all duration-300 flex items-center shrink-0 relative z-10 ${isDefective ? 'bg-red-500' : 'bg-slate-200'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isDefective ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </button>
                   </div>
                </div>

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

      {/* Updated Footer with Highlighting Color - Deep Indigo + Coral Border */}
      <footer className="mt-16 bg-gradient-to-br from-coral-900 via-indigo-800 to-indigo-900 text-indigo-200 py-12 px-6 print:hidden relative overflow-hidden shrink-0 border-t-[6px] border-coral-500 font-sans">
         {/* Decorative elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-coral-500/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
         
         <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="mb-6 flex justify-center">
               <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10 shadow-xl backdrop-blur-sm">
                 <ShieldOff size={32} className="text-coral-500" />
               </div>
            </div>
            <p className="text-xl font-black uppercase tracking-[0.2em] text-white mb-5 drop-shadow-md">
               Isenção de Responsabilidade
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-coral-500 to-transparent mx-auto mb-6 opacity-80"></div>
            <p className="text-base leading-relaxed font-bold text-indigo-200 max-w-3xl mx-auto">
               Este aplicativo é uma ferramenta de suporte e referência rápida. As informações aqui contidas <strong className="text-white decoration-coral-500 underline decoration-2 underline-offset-2">NÃO SUBSTITUEM</strong> o Regulamento de Artigos Perigosos da IATA (DGR) oficial vigente, nem as políticas internas e variações da LATAM Cargo. Em caso de discrepância ou dúvida, consulte sempre a documentação oficial ou um especialista DGR certificado. O uso desta ferramenta é de inteira responsabilidade do usuário.
            </p>
         </div>
      </footer>

      {result && <RegulatoryAdvisor specs={getSpecs()} result={result} />}
      <SpecialProvisionsDictionary />
      
      <style>{`
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
